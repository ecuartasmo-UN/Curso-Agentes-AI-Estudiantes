"""Laboratorio 3A: del texto libre a un registro que cumple un esquema.

Reutiliza la capa de evaluación del curso (Anexo J): criterios deterministas, la tabla de resultados de J.7
y las pistas con huellas. Agrega lo propio de las salidas estructuradas:
- el esquema Ticket como clase de Pydantic, con campos obligatorios o que pueden quedar vacíos;
- la lectura con with_structured_output: la respuesta cruda, el registro y el error;
- la validación local, con los errores de Pydantic explicados en español;
- la comparación de cada campo con el registro esperado;
- el porcentaje de salidas válidas y el de campos correctos.
"""
import hashlib
import html
import json
import re
import time
import types
import typing
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Literal

import matplotlib.pyplot as plt
import pandas as pd
from IPython.display import HTML, display
from pydantic import BaseModel, Field, ValidationError, create_model

from .entrega import mostrar_comprobacion
from .llamadas import _explicar, texto_de
from .modelo_grabado import ErrorGrabado, ModeloGrabado, SinGrabacion
from .precios import costo_usd
from .pruebas import COLUMNAS_J7, _vacio, normalizar, normalizar_id, plural

CATEGORIAS = ["fallo de la app", "rendimiento", "interfaz", "cuenta y acceso", "solicitud de función"]
PRIORIDADES = ["alta", "media", "baja"]
PLATAFORMAS = ["Android", "iOS", "web"]
CAMPOS_BASE = ["categoria", "prioridad", "plataforma", "version_app", "resumen"]
CAMPOS_CON_PISTA = ["categoria", "prioridad", "plataforma", "version_app"]
INSTRUCCIONES_3A = {"basica": "básica", "con_reglas": "con reglas"}
TIPOS_CAMPO = {"texto": str, "numero": float, "verdadero o falso": bool}
TIPO_PRUEBA_DE = {"normal": "funcionamiento"}  # los demás tipos de caso son pruebas de robustez
LIMITE_RESUMEN = 20  # palabras
# La pista de cada campo base, si el ticket no trae una propia.
PISTAS_CAMPO = {
    "categoria": "relee las cinco categorías de la sección 3.1. Si el ticket trae varios problemas, clasifica el más grave.",
    "prioridad": "mira la tabla de prioridades de la sección 3.1.",
    "plataforma": "Android para equipos Android, iOS para iPhone y iPad, y web para el navegador. Si el ticket no la dice, escribe None.",
    "version_app": "escribe solo el número que trae el ticket, entre comillas. Si no trae ninguno, escribe None.",
}
COLUMNAS_3A = COLUMNAS_J7 + ["tipo_caso", "campos_correctos"]
VERDE = "rgba(16, 185, 129, 0.22)"
ROJO = "rgba(244, 63, 94, 0.22)"
BORDE = "rgba(128, 128, 128, 0.45)"
# Textos que ocupan el lugar de un dato sin serlo: no son un valor vacío (null).
RELLENOS = {"", "null", "none", "n/a", "na", "-", "no especificada", "no especificado", "desconocida", "desconocido",
            "sin dato", "sin datos", "no indica", "no aplica", "no disponible", "unknown", "ninguna", "ninguno",
            "no mencionada", "no mencionado", "no se menciona", "no se indica", "no informada", "no informado"}


# ---------------------------------------------------------------- datos
def cargar_tickets(carpeta=None) -> dict:
    """Lee los tickets del laboratorio: las instrucciones, la lista base, el banco de campos y el de casos límite."""
    carpeta = Path(carpeta) if carpeta else Path.cwd()
    return json.loads((carpeta / "datos" / "tickets_3A.json").read_text(encoding="utf-8"))


def huella(*partes: str) -> str:
    """Una huella corta de un valor: permite dar una pista sin mostrar la respuesta."""
    return hashlib.sha256(":".join(partes).encode("utf-8")).hexdigest()[:12]


def version_de(texto) -> str | None:
    """El número de versión que trae un texto: «v4.3 beta» da «4.3» y «versión 4.2.1» da «4.2.1»."""
    m = re.search(r"\d+(?:\.\d+)+|\d+", str(texto or ""))
    return m.group(0) if m else None


def forma_canonica(campo: str, valor, comparacion: str) -> str:
    """El valor escrito siempre igual, para compararlo con su huella."""
    if valor is None:
        return "vacio"
    if comparacion == "booleano":
        return "true" if valor is True else ("false" if valor is False else normalizar(str(valor)))
    if comparacion == "version":
        return version_de(valor) or normalizar(str(valor))
    return normalizar(str(valor))


# ---------------------------------------------------------------- el esquema
def _anotacion(tipo):
    """El tipo de Python de un campo: una lista de valores permitidos, «texto», «numero» o «verdadero o falso»."""
    if isinstance(tipo, (list, tuple)):
        return Literal[tuple(tipo)]
    clave = normalizar(str(tipo))
    if clave not in TIPOS_CAMPO:
        raise ValueError(f"«{tipo}» no es un tipo del curso. Usa «texto», «numero», «verdadero o falso» "
                         "o una lista de valores permitidos.")
    return TIPOS_CAMPO[clave]


def armar_ticket(plataforma_obligatoria: bool = True, version_obligatoria: bool = False, campos_nuevos=None):
    """Arma la clase Ticket de Pydantic.

    Un campo obligatorio siempre trae un valor. Un campo que no es obligatorio puede quedar vacío (None).
    Sin argumentos, es el esquema de las diapositivas: plataforma obligatoria y versión que puede quedar vacía.
    """
    def definir(anotacion, obligatorio: bool, descripcion: str | None = None):
        if obligatorio:
            return (anotacion, Field(description=descripcion) if descripcion else ...)
        return (anotacion | None, Field(None, description=descripcion) if descripcion else None)

    campos = {
        "categoria": definir(Literal[tuple(CATEGORIAS)], True),
        "prioridad": definir(Literal[tuple(PRIORIDADES)], True),
        "plataforma": definir(Literal[tuple(PLATAFORMAS)], bool(plataforma_obligatoria)),
        "version_app": definir(str, bool(version_obligatoria)),
        "resumen": definir(str, True),
    }
    for c in campos_nuevos or []:
        campos[c["nombre"]] = definir(_anotacion(c["tipo"]), bool(c["obligatorio"]), c.get("descripcion"))
    return create_model("Ticket", **campos)


def puede_quedar_vacio(esquema, campo: str) -> bool:
    """¿El esquema deja este campo en None? Un campo obligatorio no puede quedar vacío."""
    info = esquema.model_fields.get(campo)
    return info is not None and type(None) in typing.get_args(info.annotation)


def _sin_none(anotacion):
    argumentos = [a for a in typing.get_args(anotacion) if a is not type(None)]
    origen = typing.get_origin(anotacion)
    if origen in (typing.Union, types.UnionType) and len(argumentos) == 1:
        return argumentos[0]
    return anotacion


def _texto_tipo(anotacion) -> str:
    base = _sin_none(anotacion)
    if typing.get_origin(base) is Literal:
        return "Literal[" + ", ".join(f'"{v}"' for v in typing.get_args(base)) + "]"
    return {str: "str", bool: "bool", float: "float", int: "int"}.get(base, getattr(base, "__name__", str(base)))


def comparacion_de(campo: str, esquema) -> str:
    """Cómo se compara un campo con su valor esperado, según su nombre y su tipo."""
    if campo == "version_app":
        return "version"
    if campo == "resumen":
        return "resumen"
    base = _sin_none(esquema.model_fields[campo].annotation)
    if typing.get_origin(base) is Literal:
        return "exacta"
    if base is bool:
        return "booleano"
    if base in (int, float):
        return "numero"
    return "contiene"


def codigo_del_esquema(esquema) -> str:
    """La clase de Pydantic escrita como en las diapositivas, para leerla."""
    lineas = [f"class {esquema.__name__}(BaseModel):"]
    for nombre, info in esquema.model_fields.items():
        tipo = _texto_tipo(info.annotation)
        vacio = puede_quedar_vacio(esquema, nombre)
        if info.description:
            valor = f' = Field(None, description="{info.description}")' if vacio else f' = Field(description="{info.description}")'
            lineas.append(f"    {nombre}: {tipo}{' | None' if vacio else ''}{valor}")
        else:
            lineas.append(f"    {nombre}: {tipo}{' | None = None' if vacio else ''}")
    return "\n".join(lineas)


def tabla_del_esquema(esquema) -> pd.DataFrame:
    """La tabla del esquema, como en la diapositiva: campo, tipo, si es obligatorio y valores permitidos."""
    filas = []
    for nombre, info in esquema.model_fields.items():
        base = _sin_none(info.annotation)
        vacio = puede_quedar_vacio(esquema, nombre)
        if typing.get_origin(base) is Literal:
            tipo, permitidos = "texto", ", ".join(typing.get_args(base))
        else:
            tipo = {str: "texto", bool: "verdadero o falso", float: "número", int: "número"}.get(base, str(base))
            permitidos = {"resumen": "una frase"}.get(nombre, "cualquier valor de su tipo")
        if vacio:
            tipo += " o vacío"
            permitidos += "; null si el ticket no lo dice"
        filas.append({"campo": nombre, "tipo": tipo, "¿obligatorio?": "no" if vacio else "sí",
                      "valores permitidos": permitidos})
    return pd.DataFrame(filas)


def mostrar_esquema(esquema, titulo: str = "El esquema que recibe el modelo") -> None:
    """Muestra la clase de Pydantic y su tabla."""
    codigo = html.escape(codigo_del_esquema(esquema))
    tabla = tabla_del_esquema(esquema).style.hide(axis="index").set_properties(**{"text-align": "left"}).to_html()
    display(HTML(
        f'<div style="border:1px solid {BORDE};border-radius:8px;padding:10px 14px;margin:6px 0;color:inherit">'
        f'<b>{html.escape(titulo)}</b><pre style="font-size:0.85em;white-space:pre-wrap;margin:8px 0">{codigo}</pre>'
        f"{tabla}</div>"
    ))


# ---------------------------------------------------------------- la lectura de un ticket
@dataclass
class Lectura:
    """Lo que devuelve una lectura con with_structured_output, lista para las pruebas."""

    caso_id: str
    entrada: str
    texto: str
    registro: dict | None
    valida: bool
    errores: list = field(default_factory=list)
    error_original: str = ""
    error: str | None = None
    stop_reason: str | None = None
    tokens_entrada: int = 0
    tokens_salida: int = 0
    tokens_razonamiento: int = 0
    costo_usd: float = 0.0
    latencia_s: float = 0.0
    modelo: str = ""
    modo: str = ""
    intento: int = 1
    variante: str = ""


def _corto(texto, largo: int = 220) -> str:
    t = re.sub(r"\s+", " ", str(texto or "")).strip()
    return t if len(t) <= largo else t[: largo - 1] + "…"


def traducir_error(err: dict) -> str:
    """Un error de validación de Pydantic, explicado en español."""
    campo = ".".join(str(x) for x in err.get("loc", ())) or "(todo el JSON)"
    tipo = err.get("type", "")
    entrada = err.get("input")
    if tipo == "json_invalid":
        detalle = (err.get("ctx") or {}).get("error", "")
        return "el JSON está incompleto o mal formado" + (f" ({detalle})" if detalle else "")
    if tipo == "missing":
        return f"falta el campo obligatorio «{campo}»"
    if tipo == "literal_error":
        permitidos = str((err.get("ctx") or {}).get("expected", "")).replace("' or '", "' o '")
        return f"«{entrada}» no es un valor permitido de «{campo}». Los permitidos son {permitidos}"
    if tipo == "string_type":
        return f"«{campo}» debe ser texto, y llegó {json.dumps(entrada, ensure_ascii=False)}"
    if tipo.startswith("bool"):
        return f"«{campo}» debe ser true o false, y llegó {json.dumps(entrada, ensure_ascii=False)}"
    if tipo.startswith(("int", "float")):
        return f"«{campo}» debe ser un número, y llegó {json.dumps(entrada, ensure_ascii=False)}"
    if tipo in ("model_type", "dict_type", "model_attributes_type"):
        return "la respuesta no es un objeto JSON con campos"
    if tipo == "extra_forbidden":
        return f"«{campo}» no está en el esquema"
    return f"«{campo}»: {err.get('msg', tipo)}"


def explicar_errores(texto: str, esquema, error=None, stop_reason=None) -> tuple[list[str], str]:
    """Vuelve a validar la respuesta cruda con Pydantic y explica cada error. Devuelve (errores, mensaje original)."""
    cortada = str(stop_reason or "").lower() in ("max_tokens", "length")
    aviso = "la respuesta se cortó: llegó al máximo de tokens de salida"
    if not str(texto or "").strip():
        if str(stop_reason or "").lower() == "refusal":
            return ["el modelo se negó a responder (refusal)"], str(error or "")
        return ([aviso + ", antes de escribir el JSON"] if cortada else ["la respuesta llegó vacía"]), str(error or "")
    try:
        esquema.model_validate_json(texto)
    except ValidationError as e:
        errores = [traducir_error(err) for err in e.errors()]
        return ([aviso] if cortada else []) + errores, str(e)
    # Pydantic la acepta, pero LangChain no pudo leerla: por ejemplo, un rechazo o un texto alrededor del JSON.
    return [f"LangChain no pudo leer la respuesta: {_corto(error, 160)}"], str(error or "")


def leer_ticket(lector, sistema: str, texto: str, config, esquema, caso_id: str = "", intento: int = 1,
                validar: bool = True, variante: str = "") -> Lectura:
    """Envía el ticket con el lector estructurado y mide la respuesta.

    No falla en silencio: si la llamada o la lectura salen mal, la lectura trae el error explicado.
    Con validar=False, envía el texto aunque esté vacío, para ver qué hace el proveedor.
    """
    modo = "en_vivo" if config.modo == "en_vivo" else "grabado"
    base = dict(caso_id=caso_id, entrada=texto or "", modelo=config.nombre_modelo, modo=modo, intento=intento,
                variante=variante)
    if validar and (texto is None or not str(texto).strip()):
        return Lectura(**base, texto="", registro=None, valida=False, error="El texto está vacío: no se envió al modelo.")
    if modo == "en_vivo":
        if config.llamadas >= config.max_llamadas:
            return Lectura(**base, texto="", registro=None, valida=False,
                           error=f"Llegaste al límite de {config.max_llamadas} llamadas. Súbelo en la celda de configuración.")
        if config.tokens >= config.max_tokens:
            return Lectura(**base, texto="", registro=None, valida=False,
                           error=f"Llegaste al límite de {config.max_tokens} tokens. Súbelo en la celda de configuración.")
        config.llamadas += 1
    inicio = time.perf_counter()
    try:
        salida = lector.invoke([("system", sistema), ("user", texto or "")])
    except SinGrabacion as e:
        return Lectura(**base, texto="", registro=None, valida=False, error=str(e))
    except ErrorGrabado as e:
        return Lectura(**base, texto="", registro=None, valida=False, error=f"{e.tipo} (grabado): {e.mensaje}")
    except Exception as e:  # errores del proveedor: clave, red, tiempo de espera o límites
        return Lectura(**base, texto="", registro=None, valida=False, error=_explicar(e))
    medida = time.perf_counter() - inicio
    raw, parsed, error_lectura = salida["raw"], salida.get("parsed"), salida.get("parsing_error")
    uso = raw.usage_metadata or {}
    entrada, salida_tokens = int(uso.get("input_tokens", 0)), int(uso.get("output_tokens", 0))
    if modo == "en_vivo":
        config.tokens += entrada + salida_tokens
    metadatos = raw.response_metadata or {}
    latencia = metadatos.get("latencia_s") if metadatos.get("grabado") else medida
    stop_reason = metadatos.get("stop_reason") or metadatos.get("finish_reason")
    crudo = texto_de(raw)
    if parsed is not None:
        registro, errores, original = parsed.model_dump(), [], ""
    else:
        registro = None
        errores, original = explicar_errores(crudo, esquema, error_lectura, stop_reason)
    return Lectura(
        **base, texto=crudo, registro=registro, valida=parsed is not None, errores=errores, error_original=original,
        stop_reason=str(stop_reason) if stop_reason else None, tokens_entrada=entrada, tokens_salida=salida_tokens,
        tokens_razonamiento=int((uso.get("output_token_details") or {}).get("reasoning", 0) or 0),
        costo_usd=costo_usd(config.nombre_modelo, entrada, salida_tokens), latencia_s=round(float(latencia or 0.0), 3),
    )


def _estado_de_campos(texto: str, esquema) -> list[tuple[str, str, bool, str]]:
    """Cada campo del esquema con su valor y su estado: (campo, valor, cumple, mensaje)."""
    try:
        datos = json.loads(texto)
    except (json.JSONDecodeError, TypeError):
        return []
    errores = {}
    try:
        esquema.model_validate(datos)
    except ValidationError as e:
        for err in e.errors():
            campo = str(err.get("loc", ("",))[0]) if err.get("loc") else ""
            errores.setdefault(campo, traducir_error(err))
    filas = []
    for nombre in esquema.model_fields:
        if isinstance(datos, dict) and nombre in datos:
            valor = json.dumps(datos[nombre], ensure_ascii=False)
        else:
            valor = "(no vino)"
        filas.append((nombre, valor, nombre not in errores, errores.get(nombre, "")))
    return filas


def mostrar_lectura(respuesta, config, latencia_s: float | None = None, esquema=None, titulo: str | None = None) -> None:
    """Muestra la respuesta cruda y el registro, lado a lado, con sus tokens, su costo y su latencia.

    Recibe el diccionario de lector.invoke (con raw, parsed y parsing_error) o una Lectura del módulo.
    """
    if isinstance(respuesta, Lectura):
        l = respuesta
        if l.error:
            display(HTML(_caja("La llamada no trajo respuesta", html.escape(l.error), "rgba(244,63,94,0.8)")))
            return
        crudo, registro, errores = l.texto, l.registro, l.errores
        entrada, salida, costo, latencia, modo = l.tokens_entrada, l.tokens_salida, l.costo_usd, l.latencia_s, l.modo
    else:
        raw = respuesta["raw"]
        crudo = texto_de(raw)
        parsed = respuesta.get("parsed")
        registro = parsed.model_dump() if parsed is not None else None
        errores = []
        if parsed is None and esquema is not None:
            meta = raw.response_metadata or {}
            errores, _ = explicar_errores(crudo, esquema, respuesta.get("parsing_error"),
                                          meta.get("stop_reason") or meta.get("finish_reason"))
        elif parsed is None:
            errores = [_corto(respuesta.get("parsing_error"), 300)]
        uso = raw.usage_metadata or {}
        entrada, salida = int(uso.get("input_tokens", 0)), int(uso.get("output_tokens", 0))
        costo = costo_usd(config.nombre_modelo, entrada, salida)
        meta = raw.response_metadata or {}
        latencia = meta.get("latencia_s") if meta.get("grabado") else (latencia_s or 0.0)
        modo = "grabado" if meta.get("grabado") else "en_vivo"
    bloque_crudo = ('<pre style="white-space:pre-wrap;margin:0;font-size:0.9em">'
                    + html.escape(crudo or "(vacía)") + "</pre>")
    caja_cruda = _caja('La respuesta cruda: respuesta["raw"]', bloque_crudo, "rgba(14,165,233,0.8)")
    izquierda = '<div style="flex:1;min-width:260px">' + caja_cruda + "</div>"
    if registro is not None:
        lineas = "".join(f"<div>· <b>{html.escape(k)}</b>: {html.escape(json.dumps(v, ensure_ascii=False))}</div>"
                         for k, v in registro.items())
        derecha_cuerpo = lineas + ("<div style='margin-top:6px;opacity:.85'>Cumple el esquema: los tipos y los valores son "
                                   "válidos. Si son los correctos, lo dice la prueba de los campos (4.4). "
                                   "«parsing_error» es None.</div>")
        color = "rgba(16,185,129,0.85)"
    else:
        lineas = ""
        if esquema is not None:
            for campo, valor, cumple, mensaje in _estado_de_campos(crudo, esquema):
                marca = "·" if cumple else "✗"
                lineas += f"<div>{marca} <b>{html.escape(campo)}</b>: {html.escape(valor)}" + \
                          (f" <i>({html.escape(mensaje)})</i>" if mensaje else "") + "</div>"
        errores_html = "".join(f"<li>{html.escape(e)}</li>" for e in errores)
        derecha_cuerpo = lineas + f"<div style='margin-top:6px'>«parsed» es None. Lo que encontró la validación:</div><ul style='margin:4px 0'>{errores_html}</ul>"
        color = "rgba(244,63,94,0.85)"
    caja_registro = _caja('El registro: respuesta["parsed"]', derecha_cuerpo, color)
    derecha = '<div style="flex:1;min-width:260px">' + caja_registro + "</div>"
    datos = (f"<b>{entrada}</b> tokens de entrada · <b>{salida}</b> tokens de salida · costo <b>USD {costo:.6f}</b> · "
             f"latencia <b>{float(latencia or 0):.2f} s</b> · modo {modo}")
    encabezado = f"<div style='font-weight:700;margin:4px 0'>{html.escape(titulo)}</div>" if titulo else ""
    display(HTML(f'{encabezado}<div style="display:flex;gap:10px;flex-wrap:wrap">{izquierda}{derecha}</div>'
                 f'<div style="opacity:.85;margin:2px 0 8px 2px">{datos}</div>'))


def _caja(titulo: str, cuerpo: str, color: str = BORDE) -> str:
    return (f'<div style="border:1px solid {color};border-left:5px solid {color};border-radius:8px;padding:10px 14px;'
            f'margin:6px 0;color:inherit;font-family:system-ui,sans-serif"><div style="font-weight:700;margin-bottom:6px">'
            f"{html.escape(titulo)}</div>{cuerpo}</div>")


# ---------------------------------------------------------------- ejercicio 1: la configuración
def _opcion(valor, opciones: dict):
    if _vacio(valor):
        return None
    texto = normalizar(str(valor)).replace(" ", "_").replace("-", "_")
    return texto if texto in opciones else ""


def revisar_configuracion(instruccion, plataforma_obligatoria, version_obligatoria) -> tuple[str, bool, bool]:
    """Comprueba el Ejercicio 1. Si algo falta o no es válido, usa el valor de las diapositivas y dice por qué."""
    valor = _opcion(instruccion, INSTRUCCIONES_3A)
    if valor:
        print(f"Instrucción: {INSTRUCCIONES_3A[valor]}.")
    else:
        if valor == "":
            print(f"«{instruccion}» no es una de las instrucciones. Escribe «basica» o «con_reglas».")
        else:
            print("Todavía no elegiste la instrucción. Escríbela en el Ejercicio 1.")
        print("Por ahora uso la básica.")
        valor = "basica"
    elegidos = []
    for nombre, dato, por_defecto in [("plataforma", plataforma_obligatoria, True), ("version_app", version_obligatoria, False)]:
        if isinstance(dato, bool):
            elegidos.append(dato)
            print(f"{nombre}: {'obligatorio, siempre trae un valor' if dato else 'puede quedar vacío (None)'}.")
        else:
            print(f"{nombre}: escribe True o False, sin comillas. Por ahora uso {por_defecto}, como en las diapositivas.")
            elegidos.append(por_defecto)
    return valor, elegidos[0], elegidos[1]


def variante_de(instruccion: str, esquema) -> str:
    """El nombre corto de la configuración, para la columna «variante» de la tabla de resultados."""
    partes = [instruccion]
    for campo in esquema.model_fields:
        if campo in ("plataforma", "version_app") or campo not in CAMPOS_BASE:
            partes.append(f"{campo}: {'vacío permitido' if puede_quedar_vacio(esquema, campo) else 'obligatorio'}")
    return " · ".join(partes)


# ---------------------------------------------------------------- los casos (J.9)
def _valor(texto):
    """El valor que escribió el estudiante: None, True y False se respetan; ... o un texto vacío quedan sin llenar."""
    if texto is None or isinstance(texto, bool):
        return texto
    if texto is Ellipsis or (isinstance(texto, str) and texto.strip() in ("", "...")):
        return Ellipsis
    t = str(texto).strip()
    return None if normalizar(t) in ("none", "null", "vacio") else t


def _revisar_registro(caso_id: str, registro, referencia: dict, campos: list[str], comparaciones: dict,
                      pistas: list, pendientes: list, avisos: list, permitidos: dict) -> dict | None:
    """Revisa un registro esperado escrito por el estudiante, campo por campo."""
    if not isinstance(registro, dict):
        avisos.append(f"{caso_id}: el registro esperado debe ser un diccionario entre llaves, como en el ejemplo.")
        return None
    limpio, faltan, mis_pistas, mis_pendientes = {}, [], [], []
    for campo in campos:
        valor = _valor(registro.get(campo, Ellipsis))
        if valor is Ellipsis:
            faltan.append(campo)
            continue
        if campo in permitidos and valor is not None:
            mapa = {normalizar(p): p for p in permitidos[campo]}
            if normalizar(str(valor)) not in mapa:
                avisos.append(f"{caso_id}: «{valor}» no es un valor permitido de «{campo}». Usa uno de: "
                              + ", ".join(permitidos[campo]) + ", o None si el ticket no lo dice.")
                return None
            valor = mapa[normalizar(str(valor))]
        if comparaciones.get(campo) == "booleano" and valor is not None and not isinstance(valor, bool):
            avisos.append(f"{caso_id}: «{campo}» va con True, False o None, sin comillas.")
            return None
        limpio[campo] = valor
        huellas = referencia.get("huellas", {})
        if campo in huellas and huella(caso_id, campo, forma_canonica(campo, valor, comparaciones.get(campo, "exacta"))) != huellas[campo]:
            if campo in CAMPOS_BASE:
                pista = (referencia.get("pistas") or {}).get(campo) or PISTAS_CAMPO.get(campo, "relee las reglas de la sección 3.1.")
            else:
                pista = f"relee la descripción de «{campo}» en el banco de campos, y luego el ticket."
            mis_pistas.append(f"{caso_id}: revisa «{campo}». Pista: {pista}")
            mis_pendientes.append(f"«{campo}» no coincide con las reglas")
    if faltan:
        avisos.append(f"{caso_id}: faltan los campos " + ", ".join(f"«{f}»" for f in faltan) + ". Escribe None si el ticket no los dice.")
        return None
    pistas.extend(mis_pistas)
    pendientes.extend(mis_pendientes)
    limpio.setdefault("resumen", registro.get("resumen") if not _vacio(registro.get("resumen")) else "")
    return limpio


def _imprimir_revision(avisos, notas, pistas):
    for titulo, lista in [("Revisa estas filas. No se agregaron:", avisos), ("Notas:", notas),
                          ("Pistas para revisar (la fila se agregó tal como la escribiste):", pistas)]:
        if lista:
            print(titulo)
            for linea in lista:
                print("  •", linea)


def _permitidos_base() -> dict:
    return {"categoria": CATEGORIAS, "prioridad": PRIORIDADES, "plataforma": PLATAFORMAS}


def armar_casos_3A(datos: dict, mis_registros=None, modo: str = "grabado") -> list[dict]:
    """Une los doce tickets con los registros esperados del Ejercicio 2. Da pistas si algo no sigue las reglas."""
    por_id = {normalizar_id((r or {}).get("caso_id")): r for r in (mis_registros or []) if isinstance(r, dict)}
    comparaciones = {"version_app": "version"}
    avisos, notas, pistas, casos = [], [], [], []
    for c in datos["base"]:
        caso = dict(c, tipo_prueba=TIPO_PRUEBA_DE.get(c["tipo_caso"], "robustez"), origen="base", pendientes=[])
        if c["caso_id"] in datos.get("ejercicio_2", []):
            caso["origen"] = "tuya"
            escrito = por_id.get(c["caso_id"])
            registro = escrito.get("esperado", escrito) if isinstance(escrito, dict) else None
            if not isinstance(registro, dict) or all(_valor(registro.get(k, Ellipsis)) is Ellipsis for k in CAMPOS_CON_PISTA):
                caso["esperado"] = None
                notas.append(f"{c['caso_id']}: todavía no tiene registro esperado. Escríbelo en el Ejercicio 2.")
            else:
                caso["esperado"] = _revisar_registro(c["caso_id"], registro, c, CAMPOS_CON_PISTA, comparaciones,
                                                     pistas, caso["pendientes"], avisos, _permitidos_base())
        casos.append(caso)
    _imprimir_revision(avisos, notas, pistas)
    tuyos = [c for c in casos if c["origen"] == "tuya"]
    por_resolver = sum(len(c["pendientes"]) for c in tuyos)
    if por_resolver:
        print(f"⚠️ {plural(por_resolver, 'pista', 'pistas')} por resolver: corrige tus registros y vuelve a ejecutar.")
    completos = sum(1 for c in tuyos if c.get("esperado"))
    print(f"Lista armada: {plural(len(casos), 'ticket', 'tickets')}; "
          f"{completos} de {len(tuyos)} registros esperados del Ejercicio 2.")
    return casos


def mostrar_tickets(casos: list[dict], con_esperado: bool = True, campos=None) -> None:
    """Muestra los tickets como tabla, con su tipo de caso y su registro esperado."""
    if not casos:
        print("Todavía no hay tickets en esta lista.")
        return
    campos = campos or [c for c in CAMPOS_BASE if c != "resumen"]
    filas = []
    for c in casos:
        fila = {"caso_id": c["caso_id"], "tipo de caso": c.get("tipo_caso", ""), "ticket": c["entrada"]}
        if con_esperado:
            esperado = c.get("esperado")
            for campo in campos:
                if esperado is None:
                    fila[campo] = "✏️ lo escribes tú"
                else:
                    v = esperado.get(campo)
                    fila[campo] = "(vacío)" if v is None else (json.dumps(v) if isinstance(v, bool) else str(v))
        filas.append(fila)
    display(pd.DataFrame(filas).style.hide(axis="index").set_properties(**{"text-align": "left", "white-space": "pre-wrap"}))


# ---------------------------------------------------------------- las corridas
def _reiniciar(*modelos) -> None:
    for m in modelos:
        if hasattr(m, "reiniciar"):
            m.reiniciar()


def correr_tickets(lector, config, casos: list[dict], sistema: str, esquema, variante: str = "", modelo=None) -> list[Lectura]:
    """Envía cada ticket una vez con el lector estructurado. Imprime una línea por ticket."""
    if not casos:
        print("No hay tickets para correr. Revisa la celda de los casos.")
        return []
    _reiniciar(modelo)
    lecturas, primer_error = [], None
    for c in casos:
        l = leer_ticket(lector, sistema, c["entrada"], config, esquema, caso_id=c["caso_id"], variante=variante)
        lecturas.append(l)
        estado = "error   " if l.error else ("válida  " if l.valida else "inválida")
        if l.error:
            muestra = l.error
        elif l.valida:  # los campos del registro, sin el resumen, para leerlos de un vistazo
            muestra = " | ".join("vacío" if v is None else str(v) for k, v in l.registro.items() if k != "resumen")
        else:
            muestra = l.texto
        print(f"  {c['caso_id']:6s} {estado} {_corto(muestra, 90)}")
        primer_error = primer_error or l.error
    validas = sum(l.valida for l in lecturas)
    print(f"Salidas válidas: {validas} de {len(lecturas)}.")
    if primer_error:
        print(f"El primer error, completo: {primer_error}")
    return lecturas


def prueba_texto_vacio(lector, config, sistema: str, esquema, variante: str = "") -> list[Lectura]:
    """Las dos pruebas del texto vacío. La primera no lo envía; la segunda lo envía para ver qué hace el proveedor."""
    no_enviado = leer_ticket(lector, sistema, "", config, esquema, caso_id="R-VACIO", variante=variante)
    enviado = leer_ticket(lector, sistema, "", config, esquema, caso_id="R-VACIO-API", validar=False, variante=variante)
    print(f"  R-VACIO      {'pasa ' if no_enviado.error and 'vacío' in no_enviado.error else 'falla'}  {no_enviado.error}")
    obtenido = enviado.error or enviado.texto or "(sin texto ni error)"
    print(f"  R-VACIO-API  {'pasa ' if (enviado.error or enviado.texto) else 'falla'}  {_corto(obtenido, 100)}")
    return [no_enviado, enviado]


def leer_con_reintento(primero, reintento, sistema: str, texto: str, config, esquema, caso_id: str,
                       variante: str = "") -> list[Lectura]:
    """Lee una vez. Si la salida no cumple el esquema, reintenta una vez con el otro lector. Devuelve los intentos."""
    l1 = leer_ticket(primero, sistema, texto, config, esquema, caso_id=caso_id, intento=1, variante=variante)
    intentos = [l1]
    if not l1.valida and not (l1.error and "vacío" in l1.error):
        intentos.append(leer_ticket(reintento, sistema, texto, config, esquema, caso_id=caso_id, intento=2, variante=variante))
    return intentos


def prueba_respuesta_cortada(lector_corto, lector, config, sistema: str, esquema, guia: dict, variante: str = "") -> list[Lectura]:
    """La respuesta mal formada: el ticket guía con un máximo de tokens muy bajo, y su reintento."""
    intentos = leer_con_reintento(lector_corto, lector, sistema, guia["entrada"], config, esquema, "R-CORTADA", variante)
    for l in intentos:
        estado = "error" if l.error else ("válida" if l.valida else "inválida")
        detalle = l.error or ("; ".join(l.errores) if l.errores else "cumple el esquema")
        print(f"  R-CORTADA intento {l.intento}: {estado} · stop_reason={l.stop_reason} · {_corto(detalle, 110)}")
    return intentos


# ---------------------------------------------------------------- el contenido de los campos
def comparar_campo(campo: str, esperado, obtenido, comparacion: str, admite_vacio: bool) -> tuple[bool, str]:
    """Compara un campo con su valor esperado. Devuelve (pasa, razón del fallo). Siempre da lo mismo."""
    if comparacion == "resumen":
        palabras = len(str(obtenido or "").split())
        if palabras == 0:
            return False, "el resumen llegó vacío"
        if palabras > LIMITE_RESUMEN:
            return False, f"el resumen tiene {palabras} palabras; el límite es {LIMITE_RESUMEN}"
        return True, ""
    if esperado is None:
        if obtenido is None:
            return True, ""
        if isinstance(obtenido, str) and normalizar(obtenido) in RELLENOS:
            return False, f"el ticket no trae «{campo}», y el modelo escribió «{obtenido}» en lugar de dejarlo vacío"
        extra = "" if admite_vacio else " El esquema no lo deja vacío: obliga a poner un valor"
        return False, f"el ticket no trae «{campo}», y el modelo inventó «{obtenido}».{extra}"
    if obtenido is None or (isinstance(obtenido, str) and normalizar(obtenido) in RELLENOS):
        return False, f"dejó vacío «{campo}», que el ticket sí trae («{esperado}»)"
    if comparacion == "version":
        ok = version_de(obtenido) == version_de(esperado)
    elif comparacion == "contiene":
        a, b = normalizar(str(esperado)), normalizar(str(obtenido))
        ok = bool(a) and bool(b) and (a in b or b in a)
    elif comparacion == "booleano":
        ok = isinstance(obtenido, bool) and obtenido == esperado
    elif comparacion == "numero":
        try:
            ok = abs(float(obtenido) - float(esperado)) < 1e-9
        except (TypeError, ValueError):
            ok = False
    else:
        ok = normalizar(str(obtenido)) == normalizar(str(esperado))
    texto_obtenido = json.dumps(obtenido, ensure_ascii=False) if isinstance(obtenido, bool) else obtenido
    texto_esperado = json.dumps(esperado, ensure_ascii=False) if isinstance(esperado, bool) else esperado
    return (True, "") if ok else (False, f"«{campo}»: «{texto_obtenido}» en lugar de «{texto_esperado}»")


def _a_texto(valor) -> str:
    if valor is None:
        return "(vacío)"
    if isinstance(valor, bool):
        return json.dumps(valor)
    return str(valor)


def comparar_campos(lecturas: list[Lectura], casos: list[dict], esquema, etiqueta: str = "") -> pd.DataFrame:
    """Compara cada campo de cada registro válido con su registro esperado. Una fila por ticket y por campo.

    La etiqueta nombra la corrida en los avisos, cuando se comparan varias.
    """
    por_id = {c["caso_id"]: c for c in casos}
    filas = []
    for l in lecturas:
        caso = por_id.get(l.caso_id, {})
        esperado = caso.get("esperado")
        if not l.valida or esperado is None:
            continue
        for campo in esquema.model_fields:
            if campo not in esperado and campo != "resumen":
                continue  # un campo propio sin valor esperado en este ticket: no se compara
            comparacion = comparacion_de(campo, esquema)
            valor_esperado = esperado.get(campo)
            pasa, razon = comparar_campo(campo, valor_esperado, l.registro.get(campo), comparacion,
                                         puede_quedar_vacio(esquema, campo))
            filas.append({
                "caso_id": l.caso_id, "tipo_caso": caso.get("tipo_caso", ""), "campo": campo,
                "esperado": "(una frase)" if comparacion == "resumen" else _a_texto(valor_esperado),
                "obtenido": _a_texto(l.registro.get(campo)), "resultado": "pasa" if pasa else "falla",
                "razon_fallo": razon, "ausente": valor_esperado is None and comparacion != "resumen",
                "variante": l.variante, "modelo": l.modelo, "modo": l.modo,
            })
    sin_esperado = [l.caso_id for l in lecturas if l.valida and por_id.get(l.caso_id, {}).get("esperado") is None]
    inicio = f"[{etiqueta}] " if etiqueta else ""
    if sin_esperado:
        print(inicio + "Sin registro esperado, no se comparan: " + ", ".join(sin_esperado) + ".")
    invalidas = [l.caso_id for l in lecturas if not l.valida]
    if invalidas:
        print(inicio + "Sin registro válido, no se comparan: " + ", ".join(invalidas) + ". Falló la etapa del esquema.")
    return pd.DataFrame(filas, columns=["caso_id", "tipo_caso", "campo", "esperado", "obtenido", "resultado",
                                        "razon_fallo", "ausente", "variante", "modelo", "modo"])


# ---------------------------------------------------------------- la tabla de resultados (J.7)
def _fila(l: Lectura, caso: dict, etapa: str, tipo_prueba: str, esperado: str, pasa: bool, razon: str,
          obtenido: str, con_consumo: bool, campos_correctos: str = "") -> dict:
    return {
        "sesion": 3, "laboratorio": "3A", "variante": l.variante, "forma": "llm_directo",
        "caso_id": l.caso_id, "etapa": etapa, "tipo_prueba": tipo_prueba, "esperado": esperado,
        "obtenido": _corto(obtenido, 300), "resultado": "pasa" if pasa else "falla", "razon_fallo": "" if pasa else razon,
        "intento": l.intento, "modo": l.modo, "modelo": l.modelo,
        "tokens_entrada": l.tokens_entrada if con_consumo else 0, "tokens_salida": l.tokens_salida if con_consumo else 0,
        "costo_usd": round(l.costo_usd, 7) if con_consumo else 0.0, "latencia_s": l.latencia_s if con_consumo else 0.0,
        "pasos": 1 if (l.texto or l.tokens_entrada) else 0, "llamadas_herramientas": 0, "intervenciones_humanas": 0,
        "fecha": date.today().isoformat(), "tipo_caso": caso.get("tipo_caso", ""), "campos_correctos": campos_correctos,
    }


def _compacto(registro: dict | None) -> str:
    if not registro:
        return ""
    return " | ".join(f"{k}={_a_texto(v)}" for k, v in registro.items())


def tabla_resultados_3A(lecturas: list[Lectura], casos: list[dict], detalle: pd.DataFrame, vacio=None, cortada=None) -> pd.DataFrame:
    """Arma la tabla de resultados de J.7: una fila por ticket y por etapa, más las de robustez.

    Las etapas del esquema y de los campos revisan la misma llamada que la respuesta cruda.
    Por eso sus tokens y su costo van solo en la fila de la respuesta cruda.
    """
    por_id = {c["caso_id"]: c for c in casos}
    filas = []
    for l in lecturas:
        caso = por_id.get(l.caso_id, {})
        robustez = caso.get("tipo_prueba") == "robustez"
        tipo_cruda = "robustez" if caso.get("tipo_caso") == "otro idioma" else "funcionamiento"
        hay_salida = bool(l.texto.strip())
        pasa = hay_salida or (tipo_cruda == "robustez" and bool(l.error))
        filas.append(_fila(l, caso, "respuesta_cruda", tipo_cruda,
                           "una salida, o un error registrado" if tipo_cruda == "robustez" else "una salida",
                           pasa, l.error or "la respuesta llegó vacía", l.texto or l.error or "", True))
        filas.append(_fila(l, caso, "esquema", "funcionamiento", "cumple el esquema", l.valida,
                           l.error or "; ".join(l.errores), "válida" if l.valida else ("; ".join(l.errores) or l.error or ""), False))
        if detalle is None:  # todavía no se compararon los campos: la tabla trae solo las dos primeras etapas
            continue
        if not l.valida:
            filas.append(_fila(l, caso, "campos", "robustez" if robustez else "funcionamiento",
                               _compacto(caso.get("esperado")), False, "sin registro válido: falló la etapa del esquema",
                               "", False, "0 de 0"))
            continue
        if caso.get("esperado") is None:
            continue
        d = detalle[detalle["caso_id"] == l.caso_id]
        bien, total = int((d["resultado"] == "pasa").sum()), len(d)
        razon = "; ".join(d.loc[d["resultado"] == "falla", "razon_fallo"])
        filas.append(_fila(l, caso, "campos", "robustez" if robustez else "funcionamiento", _compacto(caso.get("esperado")),
                           bien == total and total > 0, razon, _compacto(l.registro), False, f"{bien} de {total}"))
    vacio = vacio or []
    for l in vacio:
        if l.caso_id == "R-VACIO":
            pasa = bool(l.error and "vacío" in l.error)
            filas.append(_fila(l, {"tipo_caso": "texto vacío"}, "respuesta_cruda", "robustez",
                               "el notebook avisa y no lo envía", pasa, "el texto vacío no se detectó", l.error or "", True))
        else:
            pasa = bool(l.error) or bool(l.texto)
            obtenido = f"el proveedor respondió con un error: {l.error}" if l.error else f"el proveedor respondió: {l.texto}"
            filas.append(_fila(l, {"tipo_caso": "texto vacío"}, "respuesta_cruda", "robustez",
                               "el error o la respuesta queda registrado", pasa, "no hubo ni texto ni error", obtenido, True))
    for l in cortada or []:
        if l.intento == 1:
            pasa = not l.valida and not l.error
            obtenido = "inválida: " + "; ".join(l.errores) if not l.valida else "válida: el máximo no cortó el JSON"
            filas.append(_fila(l, {"tipo_caso": "respuesta cortada"}, "esquema", "robustez",
                               "la validación detecta la respuesta cortada", pasa,
                               l.error or "la respuesta no se cortó: baja más el máximo de tokens", obtenido, True))
        else:
            filas.append(_fila(l, {"tipo_caso": "respuesta cortada"}, "esquema", "robustez",
                               "el reintento trae un registro válido", l.valida, l.error or "; ".join(l.errores),
                               "válida" if l.valida else "; ".join(l.errores), True))
    return pd.DataFrame(filas, columns=COLUMNAS_3A)


def _estilo_resultado(valor):
    if valor == "pasa":
        return f"background-color:{VERDE}"
    if valor == "falla":
        return f"background-color:{ROJO}"
    return ""


def mostrar_etapa(tabla: pd.DataFrame, etapa: str, completa: bool = False, nota: str | None = None) -> None:
    """Una etapa de la tabla de resultados: cuántas pruebas pasan, y las de robustez y las que fallan.

    Con completa=True muestra todas las filas de la etapa.
    """
    if tabla is None or tabla.empty:
        print("Todavía no hay resultados. Ejecuta primero las celdas de las pruebas.")
        return
    df = tabla[tabla["etapa"] == etapa]
    nombre = {"respuesta_cruda": "de la respuesta cruda", "esquema": "del esquema", "campos": "de los campos"}.get(etapa, etapa)
    print(f"Etapa {nombre}: pasan {int((df['resultado'] == 'pasa').sum())} de {len(df)} pruebas.")
    if not completa:
        df = df[(df["resultado"] == "falla") | (df["tipo_prueba"] == "robustez")]
        if df.empty:
            print("Todas pasan." + (f" {nota}" if nota else " La tabla completa está en la sección 5."))
            return
        print("Abajo van las pruebas de robustez y las que fallan. La tabla completa está en la sección 5.")
    columnas = ["caso_id", "tipo_caso", "tipo_prueba", "esperado", "obtenido", "resultado", "razon_fallo"]
    if etapa == "respuesta_cruda":
        columnas += ["tokens_entrada", "tokens_salida", "costo_usd", "latencia_s"]
    if etapa == "campos":
        columnas.insert(5, "campos_correctos")
    display(df[columnas].style.hide(axis="index").map(_estilo_resultado, subset=["resultado"]).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}).format({"costo_usd": "{:.6f}", "latencia_s": "{:.2f}"}))


def mostrar_resultados_3A(tabla: pd.DataFrame, plegada: bool = False) -> None:
    """La tabla de resultados completa. Plegada, va dentro de un desplegable."""
    if tabla is None or tabla.empty:
        print("Todavía no hay resultados. Ejecuta primero las celdas de las pruebas.")
        return
    estilo = tabla.style.hide(axis="index").map(_estilo_resultado, subset=["resultado"]).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}).format({"costo_usd": "{:.6f}", "latencia_s": "{:.2f}"})
    if not plegada:
        display(estilo)
        return
    display(HTML(f"<details><summary><b>La tabla de resultados completa, con las columnas del curso</b> "
                 f"({len(tabla)} filas; clic para abrir)</summary>{estilo.to_html()}</details>"))


def mostrar_campos(detalle: pd.DataFrame, titulo: str | None = None, plegada: bool = False) -> None:
    """Una fila por ticket y una columna por campo, con ✓ o ✗ y el valor que puso el modelo.

    En cada ✗ también va el valor esperado, para leer el fallo sin buscar en otra tabla.
    """
    if detalle is None or detalle.empty:
        print("No hay campos comparados: ninguna lectura trajo un registro válido con su registro esperado. "
              "Revisa las celdas anteriores.")
        return

    def marca(f):
        if f["resultado"] == "pasa":
            return f"✓ {f['obtenido']}"
        if f["campo"] == "resumen":
            return f"✗ {f['obtenido']} ({f['razon_fallo']})"
        return f"✗ {f['obtenido']} (esperado: {f['esperado']})"

    marcas = detalle.assign(marca=lambda d: d.apply(marca, axis=1))
    tabla = marcas.pivot_table(index="caso_id", columns="campo", values="marca", aggfunc="first")
    orden_campos = list(dict.fromkeys(detalle["campo"]))
    tabla = tabla.reindex(list(dict.fromkeys(detalle["caso_id"])))[orden_campos].fillna("")

    def color(v):
        if isinstance(v, str) and v.startswith("✓"):
            return f"background-color:{VERDE}"
        if isinstance(v, str) and v.startswith("✗"):
            return f"background-color:{ROJO}"
        return ""

    estilo = tabla.style.map(color).set_properties(**{"text-align": "left", "white-space": "pre-wrap"})
    if plegada:
        display(HTML(f"<details><summary><b>{html.escape(titulo or 'Los campos')}</b> (clic para abrir)</summary>"
                     f"{estilo.to_html()}</details>"))
        return
    if titulo:
        display(HTML(f"<div style='font-weight:700;margin:8px 0 4px'>{html.escape(titulo)}</div>"))
    display(estilo)


def mostrar_ausentes(detalle: pd.DataFrame) -> None:
    """Los campos que el ticket no trae: ¿quedaron vacíos, o el modelo los inventó?"""
    if detalle is None or detalle.empty:
        print("Todavía no hay campos comparados.")
        return
    df = detalle[detalle["ausente"]][["caso_id", "tipo_caso", "campo", "obtenido", "resultado", "razon_fallo"]]
    if df.empty:
        print("Ningún ticket de la lista deja un campo sin dato.")
        return
    vacios = int((df["resultado"] == "pasa").sum())
    display(df.style.hide(axis="index").map(_estilo_resultado, subset=["resultado"]).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}))
    print(f"Campos sin dato en el ticket: {len(df)}. Quedaron vacíos: {vacios}. Con un valor que el ticket no trae: {len(df) - vacios}.")


def resumen_3A(lecturas: list[Lectura], detalle: pd.DataFrame) -> pd.DataFrame:
    """Las medidas del laboratorio: salidas válidas, campos correctos por campo y en total, tokens, costo y latencia."""
    n = len(lecturas)
    validas = sum(l.valida for l in lecturas)
    filas = [{"medida": "salidas válidas", "valor": f"{validas} de {n}", "%": round(100 * validas / n) if n else 0}]
    if detalle is not None and not detalle.empty:
        for campo in dict.fromkeys(detalle["campo"]):
            d = detalle[detalle["campo"] == campo]
            bien = int((d["resultado"] == "pasa").sum())
            filas.append({"medida": f"campo «{campo}» correcto", "valor": f"{bien} de {len(d)}", "%": round(100 * bien / len(d))})
        bien = int((detalle["resultado"] == "pasa").sum())
        filas.append({"medida": "campos correctos, en total", "valor": f"{bien} de {len(detalle)}",
                      "%": round(100 * bien / len(detalle))})
    entrada = sum(l.tokens_entrada for l in lecturas)
    salida = sum(l.tokens_salida for l in lecturas)
    costo = sum(l.costo_usd for l in lecturas)
    con_llamada = [l for l in lecturas if l.tokens_entrada > 0]
    latencia = sum(l.latencia_s for l in con_llamada) / len(con_llamada) if con_llamada else 0.0
    filas += [
        {"medida": "tokens de entrada", "valor": f"{entrada}", "%": None},
        {"medida": "tokens de salida", "valor": f"{salida}", "%": None},
        {"medida": "costo total (USD)", "valor": f"{costo:.6f}", "%": None},
        {"medida": "costo por ticket (USD)", "valor": f"{costo / n:.7f}" if n else "", "%": None},
        {"medida": "latencia media (s)", "valor": f"{latencia:.2f}", "%": None},
    ]
    return pd.DataFrame(filas)


def mostrar_resumen_3A(resumen: pd.DataFrame) -> None:
    """Las medidas del laboratorio, en una tabla."""
    if resumen is None or resumen.empty:
        print("Todavía no hay resultados para resumir.")
        return
    display(resumen.style.hide(axis="index").format({"%": lambda v: "" if pd.isna(v) else f"{v:.0f} %"}).set_properties(
        subset=["medida", "valor"], **{"text-align": "left"}))


def grafico_campos(lecturas: list[Lectura], detalle: pd.DataFrame, titulo: str = "Salidas válidas y campos correctos") -> None:
    """Barras con el porcentaje de salidas válidas y el de campos correctos de cada campo."""
    if not lecturas:
        print("No hay resultados para graficar.")
        return
    etiquetas = ["salidas válidas"]
    valores = [100 * sum(l.valida for l in lecturas) / len(lecturas)]
    textos = [f"{sum(l.valida for l in lecturas)} de {len(lecturas)}"]
    if detalle is not None and not detalle.empty:
        for campo in dict.fromkeys(detalle["campo"]):
            d = detalle[detalle["campo"] == campo]
            bien = int((d["resultado"] == "pasa").sum())
            etiquetas.append(campo)
            valores.append(100 * bien / len(d))
            textos.append(f"{bien} de {len(d)}")
    fig, ax = plt.subplots(figsize=(8, 0.45 * len(etiquetas) + 1.2))
    colores = ["#8b5cf6"] + ["#0ea5e9"] * (len(etiquetas) - 1)
    barras = ax.barh(etiquetas, valores, color=colores)
    for barra, texto in zip(barras, textos):
        ax.text(barra.get_width() + 1.5, barra.get_y() + barra.get_height() / 2, texto, va="center")
    ax.set_xlim(0, 118)
    ax.set_xlabel("%")
    ax.set_title(titulo)
    ax.invert_yaxis()
    ax.spines[["top", "right"]].set_visible(False)
    plt.tight_layout()
    plt.show()


# ---------------------------------------------------------------- ejercicio 3: revisar al revisor
def tabla_para_revisar_3A(lecturas: list[Lectura], detalle: pd.DataFrame, casos: list[dict]) -> None:
    """Cada ticket junto al resumen del modelo y al resultado automático de ese resumen."""
    por_id = {c["caso_id"]: c for c in casos}
    filas = []
    for l in lecturas:
        if not l.valida:
            continue
        d = detalle[(detalle["caso_id"] == l.caso_id) & (detalle["campo"] == "resumen")]
        filas.append({"caso_id": l.caso_id, "ticket": por_id.get(l.caso_id, {}).get("entrada", ""),
                      "resumen del modelo": l.registro.get("resumen", ""),
                      "criterio automático": d["resultado"].iloc[0] if not d.empty else "sin comparar"})
    if not filas:
        print("Todavía no hay registros válidos para revisar.")
        return
    display(pd.DataFrame(filas).style.hide(axis="index").map(_estilo_resultado, subset=["criterio automático"])
            .set_properties(**{"text-align": "left", "white-space": "pre-wrap"}))


def mostrar_revision_3A(revision, detalle: pd.DataFrame) -> pd.DataFrame:
    """Compara tu revisión con el criterio automático (Ejercicio 3)."""
    filas, avisos = [], []
    for i, r in enumerate(revision or [], start=1):
        caso_id = normalizar_id(r.get("caso_id")) if isinstance(r, dict) else ""
        campo = str(r.get("campo") or "resumen").strip() if isinstance(r, dict) else "resumen"
        if not caso_id:
            avisos.append(f"Revisión {i}: falta el caso_id.")
            continue
        d = detalle[(detalle["caso_id"] == caso_id) & (detalle["campo"] == campo)] if detalle is not None else pd.DataFrame()
        if d.empty:
            avisos.append(f"Revisión {i}: {caso_id} no tiene el campo «{campo}» comparado. Elige un ticket con registro válido.")
            continue
        de_acuerdo = r.get("de_acuerdo")
        if not isinstance(de_acuerdo, bool):
            avisos.append(f"Revisión {i} ({caso_id}): escribe True si estás de acuerdo con el criterio, o False si no.")
            continue
        if _vacio(r.get("motivo")):
            avisos.append(f"Revisión {i} ({caso_id}): explica tu motivo en una frase.")
            continue
        f = d.iloc[0]
        filas.append({"caso_id": caso_id, "campo": campo, "obtenido": f["obtenido"], "criterio automático": f["resultado"],
                      "tu revisión": "de acuerdo" if de_acuerdo else "en desacuerdo", "motivo": r["motivo"]})
    for a in avisos:
        print("  •", a)
    df = pd.DataFrame(filas)
    if df.empty:
        print("Todavía no hay revisiones completas. Llena la celda del Ejercicio 3 y vuelve a ejecutar.")
        return df
    display(df.style.hide(axis="index").map(_estilo_resultado, subset=["criterio automático"]).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}))
    desacuerdos = int((df["tu revisión"] == "en desacuerdo").sum())
    print(f"Revisaste {plural(len(df), 'resultado', 'resultados')}. Estás en desacuerdo con el criterio en {desacuerdos}.")
    return df


# ---------------------------------------------------------------- para casa: dos campos y dos casos límite
def mostrar_banco_campos(datos: dict) -> None:
    """Los campos del banco grabado, con su tipo y su descripción."""
    filas = []
    for c in datos["campos_banco"]:
        tipo = "uno de: " + ", ".join(c["tipo"]) if isinstance(c["tipo"], list) else c["tipo"]
        filas.append({"nombre": c["nombre"], "tipo": tipo, "qué contiene": c["descripcion"]})
    display(pd.DataFrame(filas).style.hide(axis="index").set_properties(**{"text-align": "left", "white-space": "pre-wrap"}))


def mostrar_banco_limites(datos: dict) -> None:
    """Los casos límite del banco grabado, sin su registro esperado: ese lo escribes tú."""
    mostrar_tickets(datos["limites"], con_esperado=False)


def armar_campos_nuevos(campos_elegidos, datos: dict, modo: str = "grabado") -> list[dict]:
    """Revisa los dos campos nuevos del Ejercicio 4 y devuelve su definición completa, en el orden del banco.

    En modo grabado, los campos salen del banco. En vivo también puedes definir un campo propio,
    con «nombre», «tipo», «obligatorio» y «descripcion».
    """
    banco = {c["nombre"]: c for c in datos["campos_banco"]}
    elegidos, avisos = [], []
    for i, c in enumerate(campos_elegidos or [], start=1):
        if not isinstance(c, dict) or _vacio(c.get("nombre")):
            avisos.append(f"Campo {i}: escribe su «nombre», copiado de la tabla del banco; por ejemplo, «idioma».")
            continue
        nombre = normalizar(str(c["nombre"])).replace(" ", "_")
        obligatorio = c.get("obligatorio")
        if not isinstance(obligatorio, bool):
            avisos.append(f"Campo {i} ({nombre}): en «obligatorio» escribe True o False, sin comillas.")
            continue
        if nombre in CAMPOS_BASE:
            avisos.append(f"Campo {i}: «{nombre}» ya está en el esquema. Elige un campo nuevo.")
            continue
        if nombre in banco:
            elegidos.append({**banco[nombre], "obligatorio": obligatorio, "propio": False})
        elif modo == "grabado":
            avisos.append(f"Campo {i}: «{nombre}» no está en el banco, así que no tiene grabaciones. Usa uno de: "
                          + ", ".join(banco) + ".")
        else:
            try:
                _anotacion(c.get("tipo"))
            except ValueError as e:
                avisos.append(f"Campo {i} ({nombre}): {e}")
                continue
            elegidos.append({"nombre": nombre, "tipo": c.get("tipo"), "obligatorio": obligatorio, "propio": True,
                             "descripcion": c.get("descripcion") or None, "esperado": {}})
    nombres = [c["nombre"] for c in elegidos]
    if len(set(nombres)) < len(nombres):
        avisos.append("Elegiste el mismo campo dos veces. Elige dos campos distintos.")
        elegidos = list({c["nombre"]: c for c in elegidos}.values())
    for a in avisos:
        print("  •", a)
    orden = list(banco)
    elegidos.sort(key=lambda c: orden.index(c["nombre"]) if c["nombre"] in orden else len(orden))
    if len(elegidos) != 2:
        print(f"Tienes {plural(len(elegidos), 'campo válido', 'campos válidos')}. El ejercicio pide dos.")
    for c in elegidos:
        print(f"Campo nuevo: {c['nombre']} · {'obligatorio' if c['obligatorio'] else 'puede quedar vacío'}"
              + (" · campo propio" if c.get("propio") else ""))
    return elegidos


def plantilla_limites(campos_nuevos: list[dict]) -> None:
    """Imprime la celda del Ejercicio 4 lista para copiar, con tus dos campos nuevos."""
    extras = "".join(f', "{c["nombre"]}": ...' for c in campos_nuevos)
    fila = ('    {"caso_id": ..., "entrada": None, "esperado": {"categoria": ..., "prioridad": ..., "plataforma": ..., '
            '"version_app": ...' + extras + '}},')
    print("Plantilla para la celda siguiente: cópiala en lugar de la lista que trae, y completa cada ...")
    print("mis_limites = [\n    # verdadero o falso: True o False, sin comillas. Si el ticket no trae el dato: None\n"
          + fila + "\n" + fila + "\n]")


def listo_para_casa(campos_nuevos, limites) -> bool:
    """¿Están los dos campos nuevos y los dos casos límite? Si no, dice qué falta y no corre las pruebas de casa."""
    faltan = []
    if len(campos_nuevos or []) != 2:
        faltan.append(f"dos campos nuevos válidos (tienes {len(campos_nuevos or [])})")
    if len(limites or []) != 2:
        faltan.append(f"dos casos límite válidos (tienes {len(limites or [])})")
    if faltan:
        print("Todavía no corro las pruebas de casa. Falta: " + "; ".join(faltan) + ".")
        print("Revisa los avisos de las secciones 7.1 y 7.2, corrige y vuelve a ejecutar.")
        return False
    return True


def armar_limites(datos: dict, mis_limites, campos_nuevos: list[dict], modo: str = "grabado") -> list[dict]:
    """Revisa los dos casos límite del Ejercicio 4, con su registro esperado. Da pistas si algo no sigue las reglas."""
    banco = {c["caso_id"]: c for c in datos["limites"]}
    campos_banco = {c["nombre"]: c for c in datos["campos_banco"]}
    nombres = [c["nombre"] for c in campos_nuevos]
    comparaciones = {"version_app": "version"}
    permitidos = _permitidos_base()
    for c in campos_nuevos:
        if isinstance(c["tipo"], list):
            permitidos[c["nombre"]] = c["tipo"]
            comparaciones[c["nombre"]] = "exacta"
        elif normalizar(str(c["tipo"])) == "verdadero o falso":
            comparaciones[c["nombre"]] = "booleano"
        else:
            comparaciones[c["nombre"]] = "contiene"
    avisos, notas, pistas, casos, ya = [], [], [], [], set()
    for i, p in enumerate(mis_limites or [], start=1):
        if not isinstance(p, dict):
            avisos.append(f"Caso {i}: debe ser un diccionario entre llaves, como en el ejemplo.")
            continue
        caso_id = normalizar_id(p.get("caso_id"))
        if not caso_id:
            avisos.append(f"Caso {i}: falta el caso_id. Copia uno del banco, por ejemplo «L-01».")
            continue
        if caso_id in ya:
            avisos.append(f"Caso {i}: {caso_id} ya está en la lista.")
            continue
        referencia = dict(banco.get(caso_id, {}))
        entrada = "" if _vacio(p.get("entrada")) else str(p["entrada"]).strip()
        entrada = entrada or referencia.get("entrada", "")
        if modo == "grabado" and caso_id not in banco:
            avisos.append(f"Caso {i}: {caso_id} no está en el banco. En modo grabado, usa un código de "
                          f"{min(banco)} a {max(banco)}.")
            continue
        if not entrada:
            avisos.append(f"Caso {i} ({caso_id}): falta el texto del ticket («entrada»).")
            continue
        # Las huellas de los campos nuevos del banco se suman a las de los campos base.
        huellas = dict(referencia.get("huellas", {}))
        for nombre in nombres:
            fuente = campos_banco.get(nombre, {})
            if caso_id in fuente.get("huellas", {}):
                huellas[nombre] = fuente["huellas"][caso_id]
            elif caso_id in fuente.get("esperado", {}) and fuente.get("comparacion") != "contiene":
                huellas[nombre] = huella(caso_id, nombre, forma_canonica(nombre, fuente["esperado"][caso_id],
                                                                         fuente.get("comparacion", "exacta")))
        referencia["huellas"] = huellas
        pendientes = []
        registro = _revisar_registro(caso_id, p.get("esperado"), referencia, CAMPOS_CON_PISTA + nombres, comparaciones,
                                     pistas, pendientes, avisos, permitidos)
        if registro is None:
            continue
        casos.append({"caso_id": caso_id, "tipo_caso": referencia.get("tipo_caso", "borde"), "tipo_prueba": "robustez",
                      "entrada": entrada, "esperado": registro, "origen": "tuya", "pendientes": pendientes})
        ya.add(caso_id)
    _imprimir_revision(avisos, notas, pistas)
    por_resolver = sum(len(c["pendientes"]) for c in casos)
    if por_resolver:
        print(f"⚠️ {plural(por_resolver, 'pista', 'pistas')} por resolver: corrige tus registros y vuelve a ejecutar.")
    print(f"Casos límite listos: {len(casos)} de 2.")
    return casos


def casos_para_casa(casos: list[dict], limites: list[dict], campos_nuevos: list[dict], datos: dict) -> list[dict]:
    """La lista de casa: los doce tickets, con el valor esperado de tus campos nuevos, y tus dos casos límite."""
    banco = {c["nombre"]: c for c in datos["campos_banco"]}
    salida = []
    for c in casos:
        esperado = c.get("esperado")
        if esperado is not None:
            esperado = dict(esperado)
            for campo in campos_nuevos:
                valores = banco.get(campo["nombre"], {}).get("esperado", {})
                if c["caso_id"] in valores:
                    esperado[campo["nombre"]] = valores[c["caso_id"]]
        salida.append({**c, "esperado": esperado})
    return salida + [dict(l) for l in limites]


def comparar_corridas(corridas: dict) -> pd.DataFrame:
    """Compara varias corridas: salidas válidas, campos correctos (base y nuevos), tokens y costo."""
    filas = []
    for etiqueta, (lecturas, detalle) in corridas.items():
        n = len(lecturas)
        validas = sum(l.valida for l in lecturas)
        base = detalle[detalle["campo"].isin(CAMPOS_BASE)] if detalle is not None and not detalle.empty else pd.DataFrame()
        nuevos = detalle[~detalle["campo"].isin(CAMPOS_BASE)] if detalle is not None and not detalle.empty else pd.DataFrame()

        def porcentaje(d):
            return f"{int((d['resultado'] == 'pasa').sum())} de {len(d)} ({round(100 * (d['resultado'] == 'pasa').mean())} %)" if len(d) else "—"

        filas.append({
            "corrida": etiqueta, "tickets": n, "salidas válidas": f"{validas} de {n} ({round(100 * validas / n) if n else 0} %)",
            "campos base correctos": porcentaje(base), "campos nuevos correctos": porcentaje(nuevos),
            "tokens de entrada": sum(l.tokens_entrada for l in lecturas),
            "tokens de salida": sum(l.tokens_salida for l in lecturas),
            "costo total (USD)": round(sum(l.costo_usd for l in lecturas), 6),
        })
    df = pd.DataFrame(filas)
    display(df.style.hide(axis="index").format({"costo total (USD)": "{:.6f}"}).set_properties(**{"text-align": "left"}))
    return df


# ---------------------------------------------------------------- la comprobación de la entrega
def comprobar_entrega_3A(datos_entrega=None, config=None, instruccion=None, plataforma_obligatoria=None,
                         version_obligatoria=None, casos=None, lecturas=None, vacio=None, cortada=None, detalle=None,
                         revision=None, campos_nuevos=None, limites=None, lecturas_casa=None, declaracion_ia=None) -> bool:
    """Revisa que la entrega del Laboratorio 3A esté completa. Orienta: no califica."""
    partes = []
    nombres = datos_entrega.get("nombres") if isinstance(datos_entrega, dict) else None
    partes.append(("listo" if not _vacio(nombres) else "falta", "tu nombre en «Datos de la entrega»"))
    valida = _opcion(instruccion, INSTRUCCIONES_3A)
    flags = isinstance(plataforma_obligatoria, bool) and isinstance(version_obligatoria, bool)
    partes.append(("listo" if valida and flags else "falta",
                   "ejercicio 1: la instrucción y si plataforma y version_app son obligatorios"))
    tuyos = [c for c in (casos or []) if isinstance(c, dict) and c.get("origen") == "tuya"]
    if tuyos and all(c.get("esperado") for c in tuyos):
        pend = [c["caso_id"] for c in tuyos if c.get("pendientes")]
        partes.append(("revisa", "ejercicio 2: quedan pistas sin resolver en " + ", ".join(pend) + ". Míralas en la sección 4.1")
                      if pend else ("listo", "ejercicio 2: los registros esperados de T-11 y T-12"))
    else:
        partes.append(("falta", "ejercicio 2: los registros esperados de T-11 y T-12"))
    n_casos = len(casos or [])
    partes.append(("listo" if lecturas and len(lecturas) == n_casos and n_casos >= 12 else "falta",
                   "las pruebas de la respuesta cruda y del esquema, con los doce tickets"))
    ids_vacio = {l.caso_id for l in (vacio or [])}
    partes.append(("listo" if {"R-VACIO", "R-VACIO-API"} <= ids_vacio else "falta",
                   "la prueba de robustez del texto vacío"))
    partes.append(("listo" if cortada and len(cortada) >= 1 else "falta",
                   "la prueba de robustez de la respuesta cortada, con su reintento"))
    partes.append(("listo" if detalle is not None and not detalle.empty else "falta",
                   "la prueba del contenido de los campos"))
    revisadas = [r for r in (revision or []) if isinstance(r, dict) and isinstance(r.get("de_acuerdo"), bool)
                 and not _vacio(r.get("motivo"))]
    partes.append(("listo" if len(revisadas) >= 3 else "falta",
                   "ejercicio 3: tres resultados revisados, cada uno con True o False y su motivo"))
    dos_campos = campos_nuevos is not None and len(campos_nuevos) == 2
    dos_limites = limites is not None and len(limites) == 2
    if dos_campos and dos_limites and lecturas_casa:
        pend = [c["caso_id"] for c in limites if c.get("pendientes")]
        partes.append(("revisa", "ejercicio 4: quedan pistas sin resolver en " + ", ".join(pend) + ". Míralas en la sección 7.2")
                      if pend else ("listo", "ejercicio 4: dos campos nuevos, dos casos límite y su corrida"))
    else:
        partes.append(("falta", "ejercicio 4: dos campos nuevos, dos casos límite y su corrida"))
    usaste = declaracion_ia.get("usaste_asistentes") if isinstance(declaracion_ia, dict) else None
    if not isinstance(usaste, bool):
        partes.append(("falta", "la declaración de uso de IA: en «usaste_asistentes» escribe True o False, sin comillas"))
    elif usaste and _vacio(declaracion_ia.get("cuales_y_para_que")):
        partes.append(("falta", "la declaración de uso de IA: escribe cuáles asistentes usaste y para qué"))
    else:
        partes.append(("listo", "la declaración de uso de asistentes de IA"))
    return mostrar_comprobacion(partes, config, celdas_texto="tu predicción, tus análisis y la sección «Tu proyecto»")
