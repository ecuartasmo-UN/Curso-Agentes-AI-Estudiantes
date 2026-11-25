"""Laboratorio 3B: configurar un prompt y comparar sus variantes sobre los mismos casos.

Reutiliza la capa de evaluación del curso (Anexo J): criterios deterministas, la tabla de resultados de J.7,
pass^k y las pistas con huellas. Agrega lo propio de comparar prompts:
- la plantilla de mensajes de cada variante, con ChatPromptTemplate;
- la prueba de la construcción del prompt, sin llamar al modelo;
- la lectura de la etiqueta de cada respuesta, también con cadena de pensamiento;
- las medidas de cada variante: aciertos, tokens, costo por mil aciertos, latencia y pass^3.
"""
import hashlib
import html
import json
import re
import time
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from IPython.display import HTML, display
from langchain_core.prompts import ChatPromptTemplate

from .entrega import mostrar_comprobacion
from .llamadas import _explicar, texto_de
from .modelo_grabado import ErrorGrabado, SinGrabacion
from .precios import costo_usd
from .pruebas import COLUMNAS_J7, _vacio, normalizar, normalizar_id, pass_k, plural

ETIQUETAS = ["error", "mejora", "documentación", "pregunta"]
_ETIQUETA_NORMALIZADA = {normalizar(e): e for e in ETIQUETAS}
VARIANTES_CLASE = ["sin_ejemplos", "tres_ejemplos", "formato", "cadena"]
DESEMPATES = {"costo_por_mil_aciertos": "el costo por mil aciertos", "latencia": "la latencia media", "pass^3": "pass^3"}
COLUMNAS_3B = COLUMNAS_J7 + ["tipo_caso", "etiqueta_obtenida", "stop_reason", "respuesta"]
# Las razones de parada de un rechazo: la de Claude y las de un bloqueo de Gemini
RAZONES_DE_RECHAZO = {"refusal", "safety", "prohibited_content", "blocklist"}
VERDE = "rgba(16, 185, 129, 0.22)"
ROJO = "rgba(244, 63, 94, 0.22)"
BORDE = "rgba(128, 128, 128, 0.45)"
# Cada variante conserva su color en todos los gráficos. Tu variante del Ejercicio 4 va siempre en verde
_VERDE_TUYA = "#16a34a"
COLOR_DE = {
    "sin_ejemplos": "#0ea5e9", "tres_ejemplos": "#8b5cf6", "formato": "#f59e0b", "cadena": "#ef4444",
    "razonamiento_medio": "#64748b", "razonamiento_alto": "#334155",
    **{c: _VERDE_TUYA for c in ("ejemplos_formato", "ejemplos_cadena", "cuatro_ejemplos", "definiciones",
                                "ejemplos_turnos", "explicacion_corta", "propia")},
}


# ---------------------------------------------------------------- datos
def cargar_issues(carpeta=None) -> dict:
    """Lee los issues del laboratorio: las etiquetas, las piezas de cada variante, la lista base y el banco."""
    carpeta = Path(carpeta) if carpeta else Path.cwd()
    return json.loads((carpeta / "datos" / "issues_3B.json").read_text(encoding="utf-8"))


def huella(*partes: str) -> str:
    """Una huella corta de un valor: permite dar una pista sin mostrar la respuesta."""
    return hashlib.sha256(":".join(partes).encode("utf-8")).hexdigest()[:12]


def nombre_de(datos: dict, codigo: str) -> str:
    """El nombre legible de una variante o de una corrida."""
    if codigo in datos["variantes"]:
        return datos["variantes"][codigo]["nombre"]
    nombres = {"razonamiento_medio": "Razonamiento interno, esfuerzo medio",
               "razonamiento_alto": "Razonamiento interno, esfuerzo alto", "propia": "Tu variante"}
    return nombres.get(codigo, codigo)


def _seguro(df: pd.DataFrame) -> pd.DataFrame:
    """Una copia para mostrar, con el texto escapado: así «<issue>» o «<etiqueta>» se ven tal cual en la tabla."""
    return df.map(lambda v: html.escape(v, quote=False) if isinstance(v, str) else v)


# ---------------------------------------------------------------- las plantillas
def _escapar(texto: str) -> str:
    """ChatPromptTemplate lee las llaves como huecos: en un texto fijo se duplican."""
    return str(texto).replace("{", "{{").replace("}", "}}")


def texto_sistema(datos: dict, codigo: str) -> str:
    """El mensaje de sistema de una variante: sus piezas, separadas por una línea en blanco."""
    return "\n\n".join(datos["piezas"][p] for p in datos["variantes"][codigo]["piezas"])


def armar_plantilla(datos: dict, codigo: str | None = None, sistema: str | None = None) -> ChatPromptTemplate:
    """La plantilla de una variante: el mensaje de sistema, los ejemplos como turnos si la variante los usa,
    y el issue al final, como último turno del usuario.

    Con `sistema`, arma una plantilla con ese mensaje de sistema: sirve para una variante propia, en vivo.
    """
    sistema = sistema if sistema is not None else texto_sistema(datos, codigo)
    mensajes = [("system", _escapar(sistema))]
    if codigo and datos["variantes"].get(codigo, {}).get("turnos"):
        for e in datos["ejemplos_turnos"]:
            mensajes.append(("user", _escapar(datos["plantilla_usuario"].replace("{issue}", e["texto"]))))
            mensajes.append(("assistant", _escapar(e["etiqueta"])))
    mensajes.append(("user", datos["plantilla_usuario"]))
    return ChatPromptTemplate.from_messages(mensajes)


def armar_plantillas(datos: dict, codigos) -> dict:
    """Una plantilla por variante, con el código de la variante como llave."""
    return {c: armar_plantilla(datos, c) for c in codigos}


def mensajes_de(plantilla: ChatPromptTemplate, texto: str) -> list:
    """Los mensajes que arma la plantilla para un issue."""
    return plantilla.invoke({"issue": texto}).to_messages()


def _turnos_variante(datos: dict, codigo: str) -> str:
    """Los turnos de ejemplo que una variante pone antes del issue, si los usa."""
    if not datos["variantes"][codigo].get("turnos"):
        return ""
    return "Antes del issue, tres turnos de ejemplo:\n" + "\n".join(
        f"Usuario: {e['texto']} · Asistente: {e['etiqueta']}" for e in datos["ejemplos_turnos"])


def mostrar_variantes(datos: dict, codigos) -> None:
    """Cada variante con lo que agrega y su mensaje de sistema completo."""
    filas = []
    for c in codigos:
        v = datos["variantes"][c]
        fila = {"variante": v["nombre"], "código": c}
        if v.get("parte_de"):
            fila["parte de"] = datos["variantes"][v["parte_de"]]["nombre"]
        fila["qué agrega" if v.get("de_clase") else "qué cambia"] = v.get("agrega") or v.get("cambio", "")
        fila["mensaje de sistema"] = texto_sistema(datos, c)
        if any(datos["variantes"][x].get("turnos") for x in codigos):
            fila["turnos de ejemplo"] = _turnos_variante(datos, c) or "—"
        filas.append(fila)
    display(_seguro(pd.DataFrame(filas)).style.hide(axis="index").set_properties(
        **{"text-align": "left", "white-space": "pre-wrap", "vertical-align": "top"}))


def mostrar_mensajes(mensajes: list, titulo: str = "Los mensajes que arma la plantilla") -> None:
    """Los mensajes de una llamada, uno por recuadro: quién habla y qué dice."""
    roles = {"system": "Sistema", "human": "Usuario", "ai": "Asistente, escrito por ti"}
    partes = []
    for m in mensajes:
        partes.append(f"<div style='margin:4px 0'><b>{roles.get(m.type, m.type)}</b>"
                      f"<pre style='white-space:pre-wrap;margin:2px 0 0;font-size:0.88em'>{html.escape(str(m.content))}</pre></div>")
    display(HTML(f'<div style="border:1px solid {BORDE};border-radius:8px;padding:8px 14px;margin:6px 0;color:inherit">'
                 f"<b>{html.escape(titulo)}</b>{''.join(partes)}</div>"))


# ---------------------------------------------------------------- la construcción del prompt
def revisar_ejemplos(ejemplos) -> tuple[list[dict], list[str]]:
    """Revisa una lista de ejemplos antes de usarla: cada uno necesita su texto y una de las cuatro etiquetas."""
    validos, avisos = [], []
    for i, e in enumerate(ejemplos or [], start=1):
        if not isinstance(e, dict):
            avisos.append(f"el ejemplo {i} debe ser un diccionario con «texto» y «etiqueta»")
            continue
        faltan = [c for c in ("texto", "etiqueta") if _vacio(e.get(c))]
        if faltan:
            avisos.append(f"el ejemplo {i} no tiene " + " ni ".join(f"«{c}»" for c in faltan))
            continue
        etiqueta = _ETIQUETA_NORMALIZADA.get(normalizar(str(e["etiqueta"])))
        if etiqueta is None:
            avisos.append(f"el ejemplo {i} tiene la etiqueta «{e['etiqueta']}», que no es una de las cuatro")
            continue
        validos.append({"texto": str(e["texto"]).strip(), "etiqueta": etiqueta})
    return validos, avisos


def _fila(caso_id: str, etapa: str, tipo_prueba: str, esperado: str, obtenido: str, pasa: bool, razon: str,
          variante: str, r=None, tipo_caso: str = "", etiqueta: str = "", config=None) -> dict:
    modo = r.modo if r is not None else (getattr(config, "modo", "") if config is not None else "")
    modelo = r.modelo if r is not None else (getattr(config, "nombre_modelo", "") if config is not None else "")
    return {
        "sesion": 3, "laboratorio": "3B", "variante": variante, "forma": "llm_directo",
        "caso_id": caso_id, "etapa": etapa, "tipo_prueba": tipo_prueba, "esperado": esperado,
        "obtenido": _corto(obtenido, 300), "resultado": "pasa" if pasa else "falla", "razon_fallo": "" if pasa else razon,
        "intento": r.intento if r is not None else 1, "modo": modo, "modelo": modelo,
        "tokens_entrada": r.tokens_entrada if r is not None else 0, "tokens_salida": r.tokens_salida if r is not None else 0,
        "costo_usd": round(r.costo_usd, 7) if r is not None else 0.0, "latencia_s": r.latencia_s if r is not None else 0.0,
        "pasos": 1 if (r is not None and (r.texto or r.tokens_entrada)) else 0, "llamadas_herramientas": 0,
        "intervenciones_humanas": 0, "fecha": date.today().isoformat(), "tipo_caso": tipo_caso,
        "etiqueta_obtenida": etiqueta, "stop_reason": (r.stop_reason or "") if r is not None else "",
        "respuesta": r.texto if r is not None else "",
    }


def probar_construccion(datos: dict, plantillas: dict, guia: dict, ejemplos_rotos, config=None) -> pd.DataFrame:
    """La etapa de la construcción del prompt, sin llamar al modelo.

    Funcionamiento: cada plantilla arma los mensajes con la instrucción, las piezas de su variante y el issue al final.
    Robustez: una lista de ejemplos con un campo faltante se detecta antes de llamar al modelo.
    """
    filas = []
    for codigo, plantilla in plantillas.items():
        mensajes = mensajes_de(plantilla, guia["entrada"])
        sistema = str(mensajes[0].content)
        piezas = datos["variantes"].get(codigo, {}).get("piezas", [])
        faltan = [p for p in piezas if datos["piezas"][p] not in sistema]
        problemas = []
        if faltan:
            problemas.append("al mensaje de sistema le faltan las piezas " + ", ".join(faltan))
        if mensajes[-1].type != "human" or guia["entrada"] not in str(mensajes[-1].content):
            problemas.append("el issue no va en el último turno del usuario")
        if datos["variantes"].get(codigo, {}).get("turnos") and len(mensajes) != 2 + 2 * len(datos["ejemplos_turnos"]):
            problemas.append("faltan turnos de ejemplo")
        obtenido = f"{len(mensajes)} mensajes; " + ("trae la instrucción, sus piezas y el issue al final" if not problemas
                                                    else "; ".join(problemas))
        filas.append(_fila(guia["caso_id"], "construccion", "funcionamiento", "la instrucción, las piezas de la variante y el issue al final",
                           obtenido, not problemas, "; ".join(problemas), codigo, config=config))
    validos, avisos = revisar_ejemplos(ejemplos_rotos)
    obtenido = ("se detectó antes de llamar al modelo: " + "; ".join(avisos)) if avisos else "no se detectó ningún problema"
    filas.append(_fila("R-EJEMPLO", "construccion", "robustez", "el ejemplo incompleto se detecta antes de llamar al modelo",
                       obtenido, bool(avisos), "el ejemplo incompleto no se detectó", "ejemplos", config=config))
    print("Funcionamiento: cada plantilla con el issue guía.")
    for f in filas[:-1]:
        print(f"  {f['variante']:15s} {f['caso_id']:6s} {f['resultado']:5s}  {_corto(f['obtenido'], 90)}")
    r = filas[-1]
    print("Robustez, la fila R-EJEMPLO: una lista con un ejemplo incompleto. «pasa» quiere decir que se detectó.")
    print(f"  {'ejemplos':15s} {r['caso_id']:6s} {r['resultado']:5s}  {_corto(r['obtenido'], 110)}")
    return pd.DataFrame(filas, columns=COLUMNAS_3B)


# ---------------------------------------------------------------- la etiqueta de cada respuesta
def es_rechazo(stop_reason) -> bool:
    """Dice si la razón de parada es un rechazo: «refusal» en Claude, o un bloqueo en Gemini."""
    return str(stop_reason or "").lower() in RAZONES_DE_RECHAZO


def leer_etiqueta(texto: str, stop_reason=None, stop_details=None) -> tuple[str | None, str]:
    """Lee la etiqueta de una respuesta. Devuelve (etiqueta, razón); la etiqueta es None si no trae una sola válida.

    Con cadena de pensamiento, toma la última línea «Etiqueta: …». Si no, acepta la respuesta que es solo
    la etiqueta, o un texto que nombra una sola de las cuatro.
    """
    if es_rechazo(stop_reason):
        categoria = stop_details.get("category") if isinstance(stop_details, dict) else None
        if categoria is None and str(stop_reason).lower() != "refusal":
            categoria = str(stop_reason)  # Gemini no trae categoría: su razón de parada ya la dice, como SAFETY
        return None, f"el modelo se negó a responder ({categoria})" if categoria else "el modelo se negó a responder"
    t = str(texto or "")
    if not t.strip():
        return None, "la respuesta llegó vacía"
    marcas = re.findall(r"etiqueta\s*[:=]\s*[*_«\"']*\s*([a-záéíóúñ]+)", t, flags=re.IGNORECASE)
    if marcas:
        valor = _ETIQUETA_NORMALIZADA.get(normalizar(marcas[-1]))
        return (valor, "") if valor else (None, f"«{marcas[-1]}» no es una de las cuatro etiquetas")
    limpio = normalizar(re.sub(r"[→\-]", " ", t))
    if limpio in _ETIQUETA_NORMALIZADA:
        return _ETIQUETA_NORMALIZADA[limpio], ""
    texto_normal = normalizar(t)
    encontradas = sorted({e for n, e in _ETIQUETA_NORMALIZADA.items()
                          if re.search(rf"(?<![a-z]){re.escape(n)}(?![a-z])", texto_normal)})
    if len(encontradas) == 1:
        return encontradas[0], ""
    if encontradas:
        return None, "nombra varias etiquetas (" + ", ".join(encontradas) + ") y no dice cuál elige"
    return None, "no trae ninguna de las cuatro etiquetas"


# ---------------------------------------------------------------- las llamadas
@dataclass
class Respuesta3B:
    """Lo que devuelve una llamada del 3B, lista para la tabla de resultados."""

    caso_id: str
    variante: str
    intento: int
    texto: str = ""
    tokens_entrada: int = 0
    tokens_salida: int = 0
    tokens_razonamiento: int = 0
    costo_usd: float = 0.0
    latencia_s: float = 0.0
    modelo: str = ""
    modo: str = ""
    stop_reason: str | None = None
    stop_details: dict | None = field(default=None)
    error: str | None = None


def _corto(texto, largo: int = 160) -> str:
    t = re.sub(r"\s+", " ", str(texto or "")).strip()
    return t if len(t) <= largo else t[: largo - 1] + "…"


def llamar(modelo, mensajes: list, config, caso_id: str = "", intento: int = 1, variante: str = "") -> Respuesta3B:
    """Envía los mensajes y mide la respuesta. No falla en silencio: si algo sale mal, trae el error explicado."""
    modo = "en_vivo" if config.modo == "en_vivo" else "grabado"
    r = Respuesta3B(caso_id=caso_id, variante=variante, intento=intento, modelo=config.nombre_modelo, modo=modo)
    if modo == "en_vivo":
        if config.llamadas >= config.max_llamadas:
            r.error = f"Llegaste al límite de {config.max_llamadas} llamadas. Súbelo en la celda de configuración."
            return r
        if config.tokens >= config.max_tokens:
            r.error = f"Llegaste al límite de {config.max_tokens} tokens. Súbelo en la celda de configuración."
            return r
        config.llamadas += 1
    inicio = time.perf_counter()
    try:
        salida = modelo.invoke(mensajes)
    except SinGrabacion as e:
        r.error = str(e)
        return r
    except ErrorGrabado as e:
        r.error = f"{e.tipo} (grabado): {e.mensaje}"
        return r
    except Exception as e:  # errores del proveedor: clave, red, tiempo de espera o límites
        r.error = _explicar(e)
        return r
    medida = time.perf_counter() - inicio
    uso = salida.usage_metadata or {}
    meta = salida.response_metadata or {}
    r.texto = texto_de(salida)
    r.tokens_entrada, r.tokens_salida = int(uso.get("input_tokens", 0)), int(uso.get("output_tokens", 0))
    r.tokens_razonamiento = int((uso.get("output_token_details") or {}).get("reasoning", 0) or 0)
    if modo == "en_vivo":
        config.tokens += r.tokens_entrada + r.tokens_salida
    r.costo_usd = costo_usd(config.nombre_modelo, r.tokens_entrada, r.tokens_salida)
    r.latencia_s = round(float((meta.get("latencia_s") if meta.get("grabado") else medida) or 0.0), 3)
    stop = meta.get("stop_reason") or meta.get("finish_reason")
    r.stop_reason = str(stop) if stop else None
    r.stop_details = meta.get("stop_details") if isinstance(meta.get("stop_details"), dict) else None
    return r


def parametros_razonamiento(modelo_id: str, esfuerzo: str, max_tokens: int = 2048) -> dict:
    """Los parámetros de un modelo con el razonamiento interno activado, para comparar con la cadena de pensamiento.

    Claude Haiku 5.5 razona por defecto: se quita el razonamiento desactivado del curso y se fija el esfuerzo.
    Gemini 3.5 Flash-Lite razona en el nivel mínimo: se sube con el mismo parámetro de LangChain.
    El máximo de tokens sube, porque el razonamiento cuenta dentro de la salida.
    """
    from .configuracion import PARAMETROS

    base = {k: v for k, v in PARAMETROS.get(modelo_id, {}).items() if k != "thinking"}
    return {**base, "reasoning_effort": esfuerzo, "max_tokens": max_tokens}


# ---------------------------------------------------------------- la cuenta antes de correr
def cuenta_previa(datos: dict, plantillas: dict, casos: list[dict], k: int, config) -> pd.DataFrame:
    """Estima las llamadas, los tokens y el costo de un experimento antes de correrlo, como en el bloque 3.2.

    Los tokens de entrada se estiman con unos 3 caracteres por token. La salida es la de las diapositivas:
    unas pocas palabras sin cadena de pensamiento, y unas 110 con ella.
    """
    filas = []
    for codigo, plantilla in plantillas.items():
        entrada = sum(len("".join(str(m.content) for m in mensajes_de(plantilla, c["entrada"]))) // 3 + 10 for c in casos)
        salida = datos.get("salida_supuesta", {}).get(codigo, 6)
        llamadas = len(casos) * k
        costo = k * sum(costo_usd(config.nombre_modelo, len("".join(str(m.content) for m in mensajes_de(plantilla, c["entrada"]))) // 3 + 10, salida)
                        for c in casos)
        filas.append({"variante": nombre_de(datos, codigo), "llamadas": llamadas,
                      "tokens de entrada por llamada": round(entrada / len(casos)) if casos else 0,
                      "tokens de salida por llamada": salida, "costo estimado (USD)": costo})
    df = pd.DataFrame(filas)
    total_llamadas, total_costo = int(df["llamadas"].sum()), float(df["costo estimado (USD)"].sum())
    display(_seguro(df).style.hide(axis="index").format({"costo estimado (USD)": "{:.5f}"}).set_properties(
        subset=["variante"], **{"text-align": "left"}))
    print(f"Total: {len(casos)} casos × {len(plantillas)} variantes × {k} intentos = {total_llamadas} llamadas, "
          f"unos USD {total_costo:.4f} con {config.nombre_modelo}.")
    return df


# ---------------------------------------------------------------- las corridas
def correr_variantes(modelo, config, plantillas: dict, casos: list[dict], k: int = 3, modelos: dict | None = None,
                     datos: dict | None = None) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Envía cada caso k veces con cada variante y aplica el criterio de éxito: la etiqueta coincide con la esperada.

    Devuelve dos tablas con las columnas de J.7: el primer intento (la respuesta por variante) y los intentos
    2 a k (la consistencia). Con `modelos`, una variante puede usar otro modelo, como uno que razona.
    """
    contenido, consistencia = [], []
    for codigo, plantilla in plantillas.items():
        llamador = (modelos or {}).get(codigo, modelo)
        if hasattr(llamador, "reiniciar"):
            llamador.reiniciar()
        aciertos, sin_etiqueta, rechazos, primer_error = 0, 0, 0, None
        for caso in casos:
            mensajes = mensajes_de(plantilla, caso["entrada"])
            for intento in range(1, k + 1):
                r = llamar(llamador, mensajes, config, caso_id=caso["caso_id"], intento=intento, variante=codigo)
                esperado = caso.get("etiqueta")
                if r.error:
                    etiqueta, pasa, razon = "", False, r.error
                    primer_error = primer_error or r.error
                else:
                    etiqueta, razon = leer_etiqueta(r.texto, r.stop_reason, r.stop_details)
                    if etiqueta is None:
                        pasa = False
                        if es_rechazo(r.stop_reason):
                            rechazos += 1
                        elif intento == 1:
                            sin_etiqueta += 1
                    elif esperado is None:
                        pasa, razon = False, "sin etiqueta esperada: escríbela en el Ejercicio 2"
                    else:
                        pasa = etiqueta == esperado
                        razon = "" if pasa else f"«{etiqueta}» en lugar de «{esperado}»"
                tipo_prueba = "funcionamiento" if caso.get("tipo_caso") == "normal" else "robustez"
                fila = _fila(caso["caso_id"], "respuesta" if intento == 1 else "consistencia", tipo_prueba,
                             esperado or "", r.texto or r.error or "", pasa, razon, codigo, r, caso.get("tipo_caso", ""),
                             etiqueta or "")
                (contenido if intento == 1 else consistencia).append(fila)
                aciertos += int(pasa and intento == 1)
        nombre = nombre_de(datos, codigo) if datos else codigo
        print(f"  {nombre:38s} {aciertos} de {len(casos)} aciertos en el primer intento"
              + (f" · {sin_etiqueta} sin etiqueta" if sin_etiqueta else "")
              + (f" · se negó {plural(rechazos, 'vez', 'veces')} en los {len(casos) * k} intentos" if rechazos else ""))
        if primer_error:
            print(f"    El primer error, completo: {primer_error}")
    return pd.DataFrame(contenido, columns=COLUMNAS_3B), pd.DataFrame(consistencia, columns=COLUMNAS_3B)


# ---------------------------------------------------------------- las medidas
def resumen_variantes(contenido: pd.DataFrame, consistencia: pd.DataFrame, datos: dict | None = None) -> pd.DataFrame:
    """Las medidas de cada variante, sobre todos sus intentos, como la cuadrícula del bloque 3.2."""
    filas = []
    if contenido is None or contenido.empty:
        return pd.DataFrame()
    for codigo in dict.fromkeys(contenido["variante"]):
        partes = [contenido[contenido["variante"] == codigo]]
        if consistencia is not None and not consistencia.empty:
            partes.append(consistencia[consistencia["variante"] == codigo])
        todos = pd.concat(partes, ignore_index=True)
        negadas = todos["stop_reason"].map(es_rechazo)
        intentos = len(todos)
        aciertos = int((todos["resultado"] == "pasa").sum())
        con_llamada = todos[todos["tokens_entrada"] > 0]
        costo = float(todos["costo_usd"].sum())
        filas.append({
            "variante": nombre_de(datos, codigo) if datos else codigo, "código": codigo,
            "aciertos": f"{aciertos} de {intentos}", "% de aciertos": round(100 * aciertos / intentos) if intentos else 0,
            "tokens de entrada por llamada": round(con_llamada["tokens_entrada"].mean()) if len(con_llamada) else 0,
            "tokens de salida por llamada": round(con_llamada["tokens_salida"].mean()) if len(con_llamada) else 0,
            "costo total (USD)": costo,
            "costo por mil aciertos (USD)": 1000 * costo / aciertos if aciertos else float("nan"),
            "latencia media (s)": float(con_llamada["latencia_s"].mean()) if len(con_llamada) else float("nan"),
            "pass^3": pass_k(todos)["pass^k"],
            "sin etiqueta": int(((todos["etiqueta_obtenida"] == "") & ~negadas).sum()),
            "se negó": int(negadas.sum()),
        })
    return pd.DataFrame(filas)


def mostrar_resumen_variantes(resumen: pd.DataFrame) -> None:
    """La cuadrícula de variantes: una fila por variante y una columna por medida."""
    if resumen is None or resumen.empty:
        print("Todavía no hay resultados para resumir.")
        return
    formatos = {"costo total (USD)": "{:.6f}", "costo por mil aciertos (USD)": "{:.4f}", "latencia media (s)": "{:.2f}",
                "pass^3": "{:.2f}", "% de aciertos": "{:.0f} %"}
    display(_seguro(resumen).style.hide(axis="index").format(formatos, na_rep="sin aciertos").set_properties(
        subset=["variante"], **{"text-align": "left"}))


def _corto_nombre(nombre: str) -> str:
    """El nombre de una variante para el eje del gráfico: sin «Con» y con mayúscula inicial."""
    n = str(nombre).replace("Con ", "", 1).replace("Razonamiento interno, ", "Razona, ")
    return n[:1].upper() + n[1:]


def grafico_variantes(resumen: pd.DataFrame, titulo: str = "La cuadrícula de variantes, con tus cifras",
                      minimo: float | None = None) -> None:
    """Cuatro gráficos de barras: el porcentaje de aciertos, el costo por mil aciertos, la latencia y pass^3.

    Con `minimo`, el primer gráfico marca el porcentaje mínimo de tu criterio.
    """
    if resumen is None or resumen.empty:
        print("Todavía no hay resultados para graficar.")
        return
    medidas = [("% de aciertos", "% de aciertos", "{:.0f} %"), ("costo por mil aciertos (USD)", "Costo por mil aciertos (USD)", "{:.4f}"),
               ("latencia media (s)", "Latencia media (s)", "{:.2f} s"), ("pass^3", "pass^3", "{:.2f}")]
    nombres = list(resumen["variante"])
    fig, ejes = plt.subplots(1, 4, figsize=(14, 3.6))
    colores = [COLOR_DE.get(c, "#94a3b8") for c in resumen["código"]]
    for eje, (columna, etiqueta, formato) in zip(ejes, medidas):
        valores = resumen[columna].fillna(0).tolist()
        barras = eje.bar(range(len(nombres)), valores, color=colores)
        for b, v, original in zip(barras, valores, resumen[columna].tolist()):
            texto = "sin aciertos" if pd.isna(original) else formato.format(v)
            eje.text(b.get_x() + b.get_width() / 2, b.get_height(), texto, ha="center", va="bottom", fontsize=7.5)
        eje.set_title(etiqueta, fontsize=10)
        if columna == "% de aciertos" and minimo is not None:
            eje.axhline(minimo, color="#475569", linestyle="--", linewidth=1)
            eje.set_title(f"% de aciertos · la línea es tu mínimo, {minimo:.0f} %", fontsize=9)
        eje.set_xticks(range(len(nombres)))
        eje.set_xticklabels([_corto_nombre(n) for n in nombres], fontsize=7.5, rotation=30, ha="right")
        eje.spines[["top", "right"]].set_visible(False)
        eje.margins(y=0.2)
    fig.suptitle(titulo)
    plt.tight_layout()
    plt.show()


def _color(v):
    if isinstance(v, str) and v.startswith("✓"):
        return f"background-color:{VERDE}"
    if isinstance(v, str) and v.startswith("✗"):
        return f"background-color:{ROJO}"
    return ""


def mostrar_por_issue(contenido: pd.DataFrame, casos: list[dict], datos: dict | None = None) -> None:
    """Una fila por issue y una columna por variante, con la etiqueta del primer intento: ✓ si acertó y ✗ si no."""
    if contenido is None or contenido.empty:
        print("Todavía no hay respuestas para mostrar.")
        return
    info = {c["caso_id"]: c for c in casos or []}
    filas = {}
    for _, f in contenido.iterrows():
        fila = filas.setdefault(f["caso_id"], {"caso_id": f["caso_id"],
                                               "tipo de caso": info.get(f["caso_id"], {}).get("tipo_caso", f["tipo_caso"]),
                                               "esperada": f["esperado"] or "(sin esperada)"})
        etiqueta = f["etiqueta_obtenida"] or ("se negó" if "negó" in str(f["razon_fallo"]) else "sin etiqueta")
        fila[nombre_de(datos, f["variante"]) if datos else f["variante"]] = f"{'✓' if f['resultado'] == 'pasa' else '✗'} {etiqueta}"
    df = pd.DataFrame(list(filas.values()))
    columnas = [c for c in df.columns if c not in ("caso_id", "tipo de caso", "esperada")]
    display(_seguro(df).style.hide(axis="index").map(_color, subset=columnas).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}))


def mostrar_consistencia_variantes(contenido: pd.DataFrame, consistencia: pd.DataFrame, datos: dict | None = None) -> None:
    """Una fila por issue y una columna por variante, con ✓ o ✗ en cada intento."""
    todos = pd.concat([contenido, consistencia], ignore_index=True).sort_values(["variante", "caso_id", "intento"])
    if todos.empty:
        print("Todavía no hay intentos para mostrar.")
        return
    todos["marca"] = ["✓" if r == "pasa" else ("⊘" if es_rechazo(s) else "✗")
                      for r, s in zip(todos["resultado"], todos["stop_reason"])]
    tabla = todos.groupby(["caso_id", "variante"])["marca"].apply("".join).unstack("variante")
    orden = list(dict.fromkeys(contenido["variante"]))
    tabla = tabla.reindex(list(dict.fromkeys(contenido["caso_id"])))[orden]
    if datos:
        tabla.columns = [nombre_de(datos, c) for c in tabla.columns]
    columnas = list(tabla.columns)
    tabla = tabla.reset_index().rename(columns={"caso_id": "issue"})
    tabla.columns.name = None
    print("✓ acertó · ✗ falló · ⊘ el modelo se negó a responder. Un intento por marca, en orden.")
    display(tabla.style.hide(axis="index").map(
        lambda v: f"background-color:{VERDE}" if isinstance(v, str) and set(v) == {"✓"} else
        (f"background-color:{ROJO}" if isinstance(v, str) and "✓" not in v else ""), subset=columnas))


def mostrar_respuesta_completa(tabla: pd.DataFrame, caso_id: str, variante: str = "cadena", datos: dict | None = None) -> None:
    """La respuesta completa de una variante a un issue, en su primer intento, y la etiqueta que se leyó."""
    f = tabla[(tabla["caso_id"] == caso_id) & (tabla["variante"] == variante) & (tabla["intento"] == 1)]
    if f.empty:
        print(f"No hay una respuesta de «{variante}» para {caso_id}.")
        return
    f = f.iloc[0]
    leida = f["etiqueta_obtenida"] or "ninguna"
    cuerpo = (f"<pre style='white-space:pre-wrap;margin:0 0 6px;font-size:0.9em'>{html.escape(f['respuesta'] or f['obtenido'] or '(vacía)')}</pre>"
              f"<div>Etiqueta leída: <b>{html.escape(leida)}</b> · esperada: <b>{html.escape(f['esperado'] or '(sin esperada)')}</b> · "
              f"{f['tokens_entrada']} tokens de entrada y {f['tokens_salida']} de salida · stop_reason: {html.escape(str(f['stop_reason'] or '—'))}"
              + (f"<br>Razón del fallo: {html.escape(f['razon_fallo'])}" if f["razon_fallo"] else "") + "</div>")
    titulo = f"{nombre_de(datos, variante) if datos else variante} · {caso_id}"
    display(HTML(f'<div style="border:1px solid {BORDE};border-left:5px solid rgba(139,92,246,0.8);border-radius:8px;'
                 f'padding:10px 14px;margin:6px 0;color:inherit"><b>{html.escape(titulo)}</b>{cuerpo}</div>'))


def mostrar_resultados_3B(tabla: pd.DataFrame, plegada: bool = True) -> None:
    """La tabla de resultados completa, con las columnas de J.7. Plegada, va dentro de un desplegable."""
    if tabla is None or tabla.empty:
        print("Todavía no hay resultados.")
        return
    columnas = [c for c in tabla.columns if c != "respuesta"]
    estilo = _seguro(tabla[columnas]).style.hide(axis="index").map(
        lambda v: f"background-color:{VERDE}" if v == "pasa" else (f"background-color:{ROJO}" if v == "falla" else ""),
        subset=["resultado"]).set_properties(**{"text-align": "left", "white-space": "pre-wrap"}).format(
        {"costo_usd": "{:.6f}", "latencia_s": "{:.2f}"})
    if not plegada:
        display(estilo)
        return
    nota = ("<p>Las columnas son las mismas en todo el curso. Aquí, <code>llamadas_herramientas</code> e "
            "<code>intervenciones_humanas</code> valen 0, y la forma es siempre <code>llm_directo</code>. "
            "Cambian desde la sesión 4, con los agentes.</p>")
    display(HTML(f"<details><summary><b>La tabla de resultados completa, con las columnas del curso</b> "
                 f"({len(tabla)} filas; clic para abrir)</summary>{nota}{estilo.to_html()}</details>"))


# ---------------------------------------------------------------- el criterio de éxito (ejercicio 1)
_ALIAS_DESEMPATE = {"costo": "costo_por_mil_aciertos", "costo_por_acierto": "costo_por_mil_aciertos",
                    "costo_por_mil": "costo_por_mil_aciertos", "pass^k": "pass^3", "pass_3": "pass^3",
                    "latencia_media": "latencia"}


def _desempate_de(valor) -> str | None:
    """El desempate en su forma estándar, o None si no es uno de los tres."""
    d = normalizar(str(valor or "")).replace(" ", "_").replace("pass3", "pass^3")
    d = _ALIAS_DESEMPATE.get(d, d)
    return d if d in DESEMPATES else None


def _pct_valido(valor) -> bool:
    return isinstance(valor, (int, float)) and not isinstance(valor, bool) and 0 <= valor <= 100


def revisar_criterio_3B(criterio) -> dict:
    """Comprueba el criterio del Ejercicio 1. Si algo falta o no es válido, usa un valor por defecto y lo dice."""
    salida = {"aciertos_minimos_pct": 80, "desempate": "costo_por_mil_aciertos", "valido": True}
    criterio = criterio if isinstance(criterio, dict) else {}
    pct = criterio.get("aciertos_minimos_pct")
    if _pct_valido(pct):
        salida["aciertos_minimos_pct"] = pct
    else:
        salida["valido"] = False
        print("«aciertos_minimos_pct» debe ser un número de 0 a 100, sin comillas. Por ahora uso 80.")
    desempate = _desempate_de(criterio.get("desempate"))
    if desempate:
        salida["desempate"] = desempate
    else:
        salida["valido"] = False
        print("«desempate» debe ser «costo_por_mil_aciertos», «latencia» o «pass^3». Por ahora uso el costo.")
    print(f"Tu criterio: una variante sirve si acierta al menos el {salida['aciertos_minimos_pct']:.0f} % de los intentos. "
          f"Entre las que sirven, desempata {DESEMPATES[salida['desempate']]}.")
    if not salida["valido"]:
        print("⚠️ Tu criterio todavía no está fijado. Complétalo antes de ver los resultados de la sección 4.")
    return salida


def recomendar(resumen: pd.DataFrame, criterio: dict) -> str | None:
    """Aplica tu criterio a las medidas: qué variantes sirven y cuál gana el desempate."""
    if resumen is None or resumen.empty:
        print("Todavía no hay medidas para aplicar tu criterio.")
        return None
    sirven = resumen[resumen["% de aciertos"] >= criterio["aciertos_minimos_pct"]]
    if sirven.empty:
        mejor = resumen.sort_values("% de aciertos", ascending=False).iloc[0]
        print(f"Ninguna variante llega al {criterio['aciertos_minimos_pct']:.0f} % de aciertos. "
              f"La más cercana es «{mejor['variante']}», con {mejor['% de aciertos']:.0f} %.")
        return None
    columna = {"costo_por_mil_aciertos": "costo por mil aciertos (USD)", "latencia": "latencia media (s)", "pass^3": "pass^3"}[criterio["desempate"]]
    orden = sirven.sort_values(columna, ascending=criterio["desempate"] != "pass^3")
    ganadora = orden.iloc[0]
    print("Sirven con tu criterio: " + ", ".join(f"«{v}»" for v in orden["variante"]) + ".")
    print(f"Con tu desempate ({DESEMPATES[criterio['desempate']]}), tu criterio recomienda «{ganadora['variante']}», "
          f"con el código \"{ganadora['código']}\".")
    return ganadora["código"]


def revisar_eleccion(eleccion, recomendada: str | None, resumen: pd.DataFrame) -> str | None:
    """Comprueba la variante que elegiste en el Ejercicio 3 y la compara con la que recomienda tu criterio."""
    codigos = list(resumen["código"]) if resumen is not None and not resumen.empty else []
    por_nombre = ({normalizar(str(n)).replace(" ", "_"): c for n, c in zip(resumen["variante"], resumen["código"])}
                  if codigos else {})
    valor = normalizar(str(eleccion or "")).replace(" ", "_") if not _vacio(eleccion) else ""
    if not valor:
        print("Todavía no elegiste tu variante. Escríbela en el Ejercicio 3.")
        return None
    valor = por_nombre.get(valor, valor)   # también sirve el nombre, como «Con formato explícito»
    if valor not in codigos:
        print(f"«{eleccion}» no es el código ni el nombre de una variante de la cuadrícula. "
              "Usa uno de estos códigos: " + ", ".join(codigos) + ".")
        return None
    if recomendada and valor != recomendada:
        print("Elegiste una variante distinta de la que recomienda tu criterio. Explica por qué en tu análisis.")
    else:
        print("Tu elección coincide con tu criterio.")
    return valor


# ---------------------------------------------------------------- los casos (ejercicio 2)
def armar_casos_3B(datos: dict, mis_etiquetas=None, modo: str = "grabado") -> list[dict]:
    """Une los doce issues con las etiquetas esperadas del Ejercicio 2. Da una pista si una no sigue las definiciones."""
    escritas = {normalizar_id(k): v for k, v in (mis_etiquetas or {}).items()} if isinstance(mis_etiquetas, dict) else {}
    casos, avisos, pistas, notas = [], [], [], []
    for c in datos["base"]:
        caso = dict(c, tipo_prueba="funcionamiento" if c["tipo_caso"] == "normal" else "robustez", origen="base", pendientes=[])
        if c["caso_id"] in datos.get("ejercicio_2", []):
            caso["origen"] = "tuya"
            valor = escritas.get(c["caso_id"])
            if _vacio(valor):
                caso["etiqueta"] = None
                notas.append(f"{c['caso_id']}: todavía no tiene etiqueta esperada. Escríbela en el Ejercicio 2.")
            else:
                etiqueta = _ETIQUETA_NORMALIZADA.get(normalizar(str(valor)))
                if etiqueta is None:
                    caso["etiqueta"] = None
                    avisos.append(f"{c['caso_id']}: «{valor}» no es una etiqueta. Usa error, mejora, documentación o pregunta.")
                else:
                    caso["etiqueta"] = etiqueta
                    if "huella_etiqueta" in c and huella(c["caso_id"], "etiqueta", normalizar(etiqueta)) != c["huella_etiqueta"]:
                        pistas.append(f"{c['caso_id']}: revisa la etiqueta. Pista: {c.get('pista', 'relee las definiciones.')}")
                        caso["pendientes"].append("la etiqueta no coincide con las definiciones")
        casos.append(caso)
    for titulo, lista in [("Revisa estas filas:", avisos), ("Notas:", notas),
                          ("Pistas para revisar (la etiqueta se usó tal como la escribiste):", pistas)]:
        if lista:
            print(titulo)
            for linea in lista:
                print("  •", linea)
    tuyos = [c for c in casos if c["origen"] == "tuya"]
    por_resolver = sum(len(c["pendientes"]) for c in tuyos)
    if por_resolver:
        print(f"⚠️ {plural(por_resolver, 'pista', 'pistas')} por resolver: corrige tus etiquetas y vuelve a ejecutar.")
    completos = sum(1 for c in tuyos if c.get("etiqueta"))
    con_pista = sum(1 for c in tuyos if c["pendientes"])
    print(f"Lista armada: {plural(len(casos), 'issue', 'issues')}; {completos} de {len(tuyos)} etiquetas del Ejercicio 2"
          + (f", {con_pista} con pista por revisar." if con_pista else "."))
    return casos


def mostrar_issues(casos: list[dict], con_esperada: bool = True) -> None:
    """Los issues como tabla, con su tipo de caso y su etiqueta esperada."""
    filas = []
    for c in casos:
        fila = {"caso_id": c["caso_id"], "tipo de caso": c.get("tipo_caso", ""), "issue": c["entrada"]}
        if con_esperada:
            fila["etiqueta esperada"] = c.get("etiqueta") or "✏️ la escribes tú"
        filas.append(fila)
    display(_seguro(pd.DataFrame(filas)).style.hide(axis="index").set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}))


# ---------------------------------------------------------------- para casa: tu variante (ejercicio 4)
def mostrar_banco_variantes(datos: dict) -> None:
    """Las variantes del banco grabado: de cuál parte cada una, qué pieza cambia y su mensaje de sistema completo."""
    mostrar_variantes(datos, [c for c, v in datos["variantes"].items() if not v.get("de_clase")])


def revisar_mi_variante(datos: dict, mi_variante, mi_texto, config, por_que=None) -> tuple[str | None, ChatPromptTemplate | None]:
    """Comprueba tu variante del Ejercicio 4. Sin clave, sale del banco. En vivo, también puede ser un texto propio."""
    banco = {c: v for c, v in datos["variantes"].items() if not v.get("de_clase")}
    if _vacio(por_que):
        print("Falta tu porqué: escribe en POR_QUE qué pieza cambiaste, respecto de cuál variante, y por qué esperas que ayude.")
    if config.modo == "en_vivo" and not _vacio(mi_texto):
        print("Tu variante: un mensaje de sistema propio, en vivo.")
        return "propia", armar_plantilla(datos, sistema=str(mi_texto).strip())
    if not _vacio(mi_texto):
        print("En modo grabado, un texto propio no tiene grabaciones. Elige un código del banco.")
    codigo = normalizar(str(mi_variante or "")).replace(" ", "_") if not _vacio(mi_variante) else ""
    if not codigo:
        print("Todavía no elegiste tu variante. Escribe un código del banco en el Ejercicio 4.")
        return None, None
    por_nombre = {normalizar(v["nombre"]).replace(" ", "_"): c for c, v in banco.items()}
    codigo = por_nombre.get(codigo, codigo)   # también sirve el nombre, como «Ejemplos como turnos»
    if codigo not in banco:
        print(f"«{mi_variante}» no es el código ni el nombre de una variante del banco. "
              "Usa uno de estos códigos: " + ", ".join(banco) + ".")
        return None, None
    v = banco[codigo]
    print(f"Tu variante: «{v['nombre']}». Parte de «{datos['variantes'][v['parte_de']]['nombre']}» y {v['cambio']}.")
    return codigo, armar_plantilla(datos, codigo)


def juzgar_mi_variante(resumen: pd.DataFrame, criterio: dict, codigo: str | None) -> None:
    """Aplica tu criterio del Ejercicio 1 a tu variante, junto a las cuatro de clase."""
    fila = resumen[resumen["código"] == codigo] if resumen is not None and not resumen.empty else pd.DataFrame()
    if fila.empty:
        print("Todavía no hay medidas de tu variante.")
        return
    f = fila.iloc[0]
    sirve = f["% de aciertos"] >= criterio["aciertos_minimos_pct"]
    print(f"Tu variante acierta el {f['% de aciertos']:.0f} % de los intentos. Con tu mínimo del "
          f"{criterio['aciertos_minimos_pct']:.0f} %, {'sirve' if sirve else 'no sirve'}.")
    recomendar(resumen, criterio)


# ---------------------------------------------------------------- la comprobación de la entrega
def comprobar_entrega_3B(datos_entrega=None, config=None, criterio=None, casos=None, construccion=None, contenido=None,
                         consistencia=None, eleccion=None, contenido_razonamiento=None, contenido_mia=None,
                         por_que=None, declaracion_ia=None, variante_elegida=None) -> bool:
    """Revisa que la entrega del Laboratorio 3B esté completa. Orienta: no califica."""
    partes = []
    nombres = datos_entrega.get("nombres") if isinstance(datos_entrega, dict) else None
    partes.append(("listo" if not _vacio(nombres) else "falta", "tu nombre en «Datos de la entrega»"))
    crit = criterio if isinstance(criterio, dict) else {}
    pct, desempate = crit.get("aciertos_minimos_pct"), crit.get("desempate")
    if _pct_valido(pct) and _desempate_de(desempate):
        partes.append(("listo", "ejercicio 1: tu criterio de éxito, fijado antes de probar"))
    elif _vacio(pct) and _vacio(desempate):
        partes.append(("falta", "ejercicio 1: tu criterio de éxito, fijado antes de probar"))
    else:
        malos = ([] if _pct_valido(pct) else ["«aciertos_minimos_pct» debe ser un número de 0 a 100, sin comillas"]) + \
                ([] if _desempate_de(desempate) else ["«desempate» debe ser «costo_por_mil_aciertos», «latencia» o «pass^3»"])
        partes.append(("revisa", "ejercicio 1: " + "; ".join(malos)))
    tuyos = [c for c in (casos or []) if isinstance(c, dict) and c.get("origen") == "tuya"]
    if tuyos and all(c.get("etiqueta") for c in tuyos):
        pend = [c["caso_id"] for c in tuyos if c.get("pendientes")]
        partes.append(("revisa", "ejercicio 2: quedan pistas sin resolver en " + ", ".join(pend) + ". Míralas en la sección 2.3")
                      if pend else ("listo", "ejercicio 2: las etiquetas esperadas de I-11 e I-12"))
    else:
        partes.append(("falta", "ejercicio 2: las etiquetas esperadas de I-11 e I-12"))
    ok = construccion is not None and not construccion.empty and "R-EJEMPLO" in set(construccion["caso_id"])
    partes.append(("listo" if ok else "falta", "la etapa de la construcción del prompt, con el ejemplo incompleto"))
    n = len(casos or [])
    variantes = set(contenido["variante"]) if contenido is not None and not contenido.empty else set()
    ok = set(VARIANTES_CLASE) <= variantes and all((contenido["variante"] == v).sum() == n for v in VARIANTES_CLASE)
    partes.append(("listo" if ok else "falta", "la respuesta de las cuatro variantes, en todos los issues"))
    ok = consistencia is not None and not consistencia.empty and consistencia["intento"].max() >= 3
    partes.append(("listo" if ok else "falta", "la consistencia: cada issue tres veces por variante, con su pass^3"))
    if not _vacio(eleccion) and str(eleccion) in variantes:
        partes.append(("listo", "ejercicio 3: la variante que eliges, de las que corriste"))
    elif not _vacio(variante_elegida):
        partes.append(("revisa", f"ejercicio 3: «{variante_elegida}» no es una variante de la cuadrícula. "
                                 "Escribe su código, como \"formato\""))
    else:
        partes.append(("falta", "ejercicio 3: la variante que eliges, de las que corriste"))
    ok = contenido_razonamiento is not None and not contenido_razonamiento.empty
    partes.append(("listo" if ok else "falta", "para casa: el razonamiento interno, comparado con la cadena de pensamiento"))
    corrida = contenido_mia is not None and not contenido_mia.empty
    if corrida and not _vacio(por_que):
        partes.append(("listo", "ejercicio 4: tu variante, corrida y comparada, con su porqué"))
    elif corrida:
        partes.append(("revisa", "ejercicio 4: tu variante corrió, pero falta tu porqué en POR_QUE"))
    else:
        partes.append(("falta", "ejercicio 4: tu variante, corrida y comparada, con su porqué"))
    usaste = declaracion_ia.get("usaste_asistentes") if isinstance(declaracion_ia, dict) else None
    if not isinstance(usaste, bool):
        partes.append(("falta" if _vacio(usaste) else "revisa",
                       "la declaración de uso de IA: en «usaste_asistentes» escribe True o False, sin comillas"))
    elif usaste and _vacio(declaracion_ia.get("cuales_y_para_que")):
        partes.append(("falta", "la declaración de uso de IA: escribe cuáles asistentes usaste y para qué"))
    else:
        partes.append(("listo", "la declaración de uso de asistentes de IA"))
    return mostrar_comprobacion(partes, config, celdas_texto="el porqué de tu criterio, tus análisis y la sección 10, "
                                                            "«Tu proyecto», que viene después de esta celda")
