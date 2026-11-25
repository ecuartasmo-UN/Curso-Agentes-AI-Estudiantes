"""La capa de evaluación del curso (Anexo J): casos, criterios, tabla de resultados y pass^k."""
import json
import re
import unicodedata
from datetime import date
from pathlib import Path

import pandas as pd

from .formato import miles
from .llamadas import preguntar

# Los cuatro tipos de pregunta del laboratorio 2A.
TIPOS = {
    "hecho_verificable": {"nombre": "Hecho verificable", "tipo_prueba": "funcionamiento", "esperado": None},
    "premisa_falsa": {"nombre": "Premisa falsa", "tipo_prueba": "robustez", "esperado": "Corrección:"},
    "fuera_de_alcance": {"nombre": "Fuera de alcance", "tipo_prueba": "robustez", "esperado": "No lo sé"},
    "posterior_al_corte": {"nombre": "Posterior a la fecha de corte", "tipo_prueba": "robustez", "esperado": "No lo sé"},
}

# Columnas de la tabla de resultados del curso (Anexo J.7). Todos los laboratorios las usan.
COLUMNAS_J7 = [
    "sesion", "laboratorio", "variante", "forma", "caso_id", "etapa", "tipo_prueba",
    "esperado", "obtenido", "resultado", "razon_fallo", "intento", "modo", "modelo",
    "tokens_entrada", "tokens_salida", "costo_usd", "latencia_s",
    "pasos", "llamadas_herramientas", "intervenciones_humanas", "fecha",
]
# El laboratorio 2A agrega una columna propia: el tipo de pregunta.
COLUMNAS_RESULTADOS = COLUMNAS_J7 + ["tipo_pregunta"]


def cargar_preguntas(carpeta=None) -> dict:
    """Lee las preguntas del laboratorio: el mensaje de sistema, la lista base y el banco de reserva."""
    carpeta = Path(carpeta) if carpeta else Path.cwd()
    datos = json.loads((carpeta / "datos" / "preguntas_2A.json").read_text(encoding="utf-8"))
    larga = datos.get("larga")
    if larga and larga.get("archivo"):
        texto = (carpeta / "datos" / larga["archivo"]).read_text(encoding="utf-8")
        larga["entrada"] = texto + "\n\n" + larga["pregunta"]
    return datos


# ---------------------------------------------------------------- criterios de aceptación (J.3)
def normalizar(texto: str) -> str:
    """Minúsculas, sin tildes, sin símbolos de formato y con espacios simples."""
    t = unicodedata.normalize("NFKD", str(texto or "")).encode("ascii", "ignore").decode("ascii").lower()
    t = re.sub(r"[*_`#>«»\"“”'¿¡]", " ", t)
    return re.sub(r"\s+", " ", t).strip(" .,:;-")


def _patron(alternativa: str) -> re.Pattern:
    """Busca el dato completo: «3.1» no cuenta dentro de «3.11», pero «1.24» sí cuenta dentro de «1.24.0»."""
    a = normalizar(alternativa)
    antes = r"(?<![0-9.])" if a[:1].isdigit() else r"(?<![a-z0-9])"
    despues = r"(?![0-9])" if a[-1:].isdigit() else r"(?![a-z0-9])"
    return re.compile(antes + re.escape(a) + despues)


def contiene_dato(texto: str, esperado: str) -> bool:
    """¿La respuesta contiene el dato esperado? Acepta alternativas separadas por «|»."""
    t = normalizar(texto)
    return any(_patron(alt).search(t) for alt in str(esperado).split("|") if alt.strip())


def dice_no_se(texto: str) -> bool:
    """¿La respuesta empieza con «No lo sé» o con «No sé»?"""
    return re.match(r"no (lo )?se\b", normalizar(texto)) is not None


def corrige(texto: str) -> bool:
    return normalizar(texto).startswith("correccion")


def criterio(tipo: str, texto: str, esperado: str) -> tuple[bool, str]:
    """Devuelve (pasa, razón del fallo). Son comprobaciones deterministas: siempre dan lo mismo."""
    if not texto or not texto.strip():
        return False, "la respuesta llegó vacía"
    if tipo == "hecho_verificable":
        if dice_no_se(texto):
            return False, "dijo «No lo sé» ante un hecho verificable"
        if contiene_dato(texto, esperado):
            return True, ""
        return False, f"no contiene el dato esperado «{esperado}»"
    if tipo == "premisa_falsa":
        return (True, "") if corrige(texto) else (False, "no empieza con «Corrección:»")
    if tipo in ("fuera_de_alcance", "posterior_al_corte"):
        return (True, "") if dice_no_se(texto) else (False, "no empieza con «No lo sé»")
    return False, f"tipo de pregunta desconocido: «{tipo}»"


# ---------------------------------------------------------------- casos (J.9)
def _vacio(valor) -> bool:
    return valor is None or valor is Ellipsis or (isinstance(valor, str) and valor.strip() in ("", "..."))


def normalizar_id(valor) -> str:
    """Escribe un código de caso en su forma estándar: «b3», «B03» y «B 03» quedan como «B-03»."""
    t = "" if _vacio(valor) else str(valor).strip().upper().replace(" ", "")
    m = re.fullmatch(r"([A-Z]+)-?(\d+)", t)
    return f"{m.group(1)}-{int(m.group(2)):02d}" if m else t


def plural(n: int, singular: str, plural_: str) -> str:
    """El número con su palabra en singular o en plural: «1 pista», «2 pistas»."""
    return f"{n} {singular if n == 1 else plural_}"


def huella_tipo(caso_id: str, tipo: str) -> str:
    """Una huella del tipo correcto de una pregunta del banco. Permite dar una pista sin mostrar la respuesta."""
    import hashlib

    return hashlib.sha256(f"{caso_id}:{tipo}".encode("utf-8")).hexdigest()[:12]


def _tipo_coincide(referencia: dict, caso_id: str, tipo: str):
    """True si el tipo elegido es el de referencia, False si no, y None si la pregunta no es del banco."""
    if "tipo" in referencia:
        return referencia["tipo"] == tipo
    if "tipo_huella" in referencia:
        return referencia["tipo_huella"] == huella_tipo(caso_id, tipo)
    return None


def _texto_limpio(valor) -> str:
    return "" if _vacio(valor) else str(valor).strip()


def armar_casos(datos: dict, mis_preguntas=None, incluir_base: bool = True, modo: str = "grabado",
                excluir=(), min_tipos: int = 0) -> list[dict]:
    """Une la lista base con tus preguntas. Revisa cada fila y explica lo que falta.

    Cada fila trae las columnas de J.9 (caso_id, etapa, entrada, esperado, tipo_prueba) y el tipo de pregunta.
    Las filas con algo por revisar quedan marcadas en «pendientes», y la comprobación de la entrega lo muestra.
    """
    banco = {p["caso_id"]: p for p in datos["banco"]}
    casos = [dict(p, origen="base") for p in datos["base"]] if incluir_base else []
    ya = {c["caso_id"] for c in casos} | {str(e).upper() for e in excluir}
    avisos, notas, pistas = [], [], []
    for i, p in enumerate(mis_preguntas or [], start=1):
        if not isinstance(p, dict):
            avisos.append(f"Fila {i}: debe ser un diccionario entre llaves, como en el ejemplo.")
            continue
        caso_id = normalizar_id(p.get("caso_id"))
        tipo = _texto_limpio(p.get("tipo")).lower().replace(" ", "_")
        esperado, entrada = p.get("esperado"), p.get("entrada")
        if not caso_id:
            avisos.append(f"Fila {i}: falta el caso_id. Copia uno del banco, por ejemplo «B-01».")
            continue
        if _vacio(entrada) and caso_id in banco:
            entrada = banco[caso_id]["entrada"]
        problemas = []
        if caso_id in ya:
            problemas.append(f"el caso {caso_id} ya está en la lista o en otro ejercicio")
        if tipo not in TIPOS:
            problemas.append("el tipo debe ser uno de: " + ", ".join(TIPOS))
        elif tipo == "hecho_verificable" and _vacio(esperado):
            problemas.append("un hecho verificable necesita su respuesta esperada, por ejemplo «2008»")
        if _vacio(entrada):
            if caso_id not in banco and modo == "grabado":
                problemas.append(f"el caso {caso_id} no está en el banco. En modo grabado, usa un código del banco, de "
                                 f"{min(banco)} a {max(banco)}")
            else:
                problemas.append("falta la pregunta («entrada»)")
        elif modo == "grabado" and caso_id not in banco:
            problemas.append(f"el caso {caso_id} no está en el banco, así que no tiene respuesta grabada. Usa un código de "
                             f"{min(banco)} a {max(banco)}")
        if problemas:
            avisos.append(f"Fila {i} ({caso_id}): " + "; ".join(problemas) + ".")
            continue
        pendientes = []
        # La etapa y el tipo de prueba se deducen del tipo de pregunta. Si no coinciden, se corrigen y se avisa.
        tipo_prueba = TIPOS[tipo]["tipo_prueba"]
        escrito = _texto_limpio(p.get("tipo_prueba")).lower()
        if not escrito:
            notas.append(f"{caso_id}: faltaba el tipo de prueba. Lo completé con «{tipo_prueba}»: piensa por qué.")
        elif escrito != tipo_prueba:
            notas.append(f"{caso_id}: una pregunta de tipo «{tipo}» es una prueba de {tipo_prueba}. Lo corregí.")
        if _texto_limpio(p.get("etapa")).lower() not in ("", "contenido"):
            notas.append(f"{caso_id}: en este laboratorio, tus preguntas prueban la etapa «contenido». Lo corregí.")
        referencia = banco.get(caso_id, {})
        if tipo == "hecho_verificable":
            esperado = _texto_limpio(esperado)
            # El dato esperado debe ser corto: la respuesta tiene que contenerlo completo.
            if any(len(alt.split()) > 3 for alt in esperado.split("|")):
                notas.append(f"{caso_id}: el esperado «{esperado}» es una frase. Escribe solo el dato, como un año o un número.")
                pendientes.append("el esperado es una frase")
            # En las preguntas del banco, el dato esperado debe aparecer en el dato real.
            if referencia.get("dato_real") and not contiene_dato(referencia["dato_real"], esperado):
                pistas.append(f"{caso_id}: tu esperado «{esperado}» no aparece en el dato real. Revísalo en la fuente.")
                pendientes.append("el esperado no coincide con la fuente")
        else:
            if not _vacio(esperado) and str(esperado).strip() != TIPOS[tipo]["esperado"]:
                notas.append(f"{caso_id}: para el tipo «{tipo}», lo esperado es que empiece con «{TIPOS[tipo]['esperado']}». Lo corregí.")
            esperado = TIPOS[tipo]["esperado"]
        # Si la pregunta es del banco y el tipo no coincide con el de referencia, el notebook da una pista.
        if _tipo_coincide(referencia, caso_id, tipo) is False:
            pistas.append(f"{caso_id}: revisa el tipo que elegiste. Pista: {referencia.get('pista', 'vuelve a la guía de la sección 5.1.')}")
            pendientes.append("el tipo no coincide con el de referencia")
        casos.append({
            "caso_id": caso_id,
            "etapa": "contenido",
            "tipo": tipo,
            "tipo_prueba": tipo_prueba,
            "entrada": str(entrada).strip(),
            "esperado": esperado,
            "dato_real": referencia.get("dato_real", _texto_limpio(p.get("dato_real"))),
            "fuente": referencia.get("fuente", _texto_limpio(p.get("fuente"))),
            "origen": "tuya",
            "pendientes": pendientes,
        })
        ya.add(caso_id)
    if avisos:
        print("Revisa estas filas. No se agregaron a la lista:")
        for a in avisos:
            print("  •", a)
    if notas:
        print("Notas sobre tus filas:")
        for n in notas:
            print("  •", n)
    if pistas:
        print("Pistas para revisar (la fila se agregó tal como la escribiste):")
        for n in pistas:
            print("  •", n)
    tuyas = [c for c in casos if c["origen"] == "tuya"]
    tipos_tuyos = {c["tipo"] for c in tuyas}
    if tuyas and len(tipos_tuyos) < min_tipos:
        print(f"Tus preguntas usan {len(tipos_tuyos)} tipos. El ejercicio pide al menos {min_tipos}.")
    por_resolver = sum(len(c["pendientes"]) for c in tuyas)
    if por_resolver:
        print(f"⚠️ {plural(por_resolver, 'pista', 'pistas')} por resolver: corrige tus filas y vuelve a ejecutar.")
    print(f"Lista armada: {plural(len(casos), 'pregunta', 'preguntas')}, {plural(len(tuyas), 'tuya', 'tuyas')}.")
    return casos


# ---------------------------------------------------------------- filas de la tabla de resultados (J.7)
def _resumir(texto: str, largo: int = 300) -> str:
    t = re.sub(r"\s+", " ", str(texto or "")).strip()
    return t if len(t) <= largo else t[: largo - 1] + "…"


def _fila(r, caso_id, etapa, tipo_prueba, esperado, pasa, razon, laboratorio, variante, tipo_pregunta="") -> dict:
    return {
        "sesion": 2, "laboratorio": laboratorio, "variante": variante, "forma": "llm_directo",
        "caso_id": caso_id, "etapa": etapa, "tipo_prueba": tipo_prueba,
        "esperado": esperado, "obtenido": _resumir(r.texto) if r.texto else _resumir(r.error or ""),
        "resultado": "pasa" if pasa else "falla", "razon_fallo": "" if pasa else razon,
        "intento": r.intento, "modo": r.modo, "modelo": r.modelo,
        "tokens_entrada": r.tokens_entrada, "tokens_salida": r.tokens_salida,
        "costo_usd": round(r.costo_usd, 7), "latencia_s": r.latencia_s,
        "pasos": 1 if (r.texto or r.tokens_entrada) else 0, "llamadas_herramientas": 0, "intervenciones_humanas": 0,
        "fecha": date.today().isoformat(), "tipo_pregunta": tipo_pregunta,
    }


def correr_contenido(modelo, config, casos: list[dict], sistema: str, laboratorio: str = "2A", variante: str = "base") -> pd.DataFrame:
    """Envía cada pregunta una vez y aplica su criterio de aceptación."""
    if not casos:
        print("No hay preguntas para correr. Revisa la celda del ejercicio.")
        return pd.DataFrame(columns=COLUMNAS_RESULTADOS)
    if hasattr(modelo, "reiniciar"):
        modelo.reiniciar()
    filas, con_texto = [], 0
    for c in casos:
        r = preguntar(modelo, sistema, c["entrada"], config, caso_id=c["caso_id"])
        if r.error:
            pasa, razon = False, r.error
        else:
            pasa, razon = criterio(c["tipo"], r.texto, c["esperado"])
        if r.texto and r.tokens_entrada > 0:
            con_texto += 1
        filas.append(_fila(r, c["caso_id"], "contenido", TIPOS[c["tipo"]]["tipo_prueba"], c["esperado"], pasa, razon, laboratorio, variante, c["tipo"]))
        print(f"  {c['caso_id']:6s} {'pasa ' if pasa else 'falla'}  {_resumir(r.texto or r.error, 70)}")
    # La etapa de la llamada, en una fila: ¿cada pregunta recibió texto y tokens?
    total = len(casos)
    resumen = {
        **_fila(_RespuestaVacia(config), "todas", "llamada", "funcionamiento", "cada pregunta recibe texto y tokens",
                con_texto == total, f"{total - con_texto} preguntas sin texto o sin tokens", laboratorio, variante),
        "obtenido": f"{con_texto} de {total} preguntas con texto y tokens",
    }
    return pd.DataFrame([resumen] + filas, columns=COLUMNAS_RESULTADOS)


class _RespuestaVacia:
    """Una respuesta sin consumo, para las filas de resumen."""

    def __init__(self, config):
        self.texto, self.error, self.intento = "", "", 1
        self.modo, self.modelo = config.modo, config.nombre_modelo
        self.tokens_entrada = self.tokens_salida = 0
        self.costo_usd = self.latencia_s = 0.0


def prueba_llamada(modelo, config, datos: dict, sistema: str, laboratorio: str = "2A") -> pd.DataFrame:
    """Las pruebas de robustez de la llamada: una pregunta vacía y una muy larga (J.5)."""
    if hasattr(modelo, "reiniciar"):
        modelo.reiniciar()
    filas = []
    # 1. Pregunta vacía: el notebook no la envía y lo informa.
    r = preguntar(modelo, sistema, "", config, caso_id="R-VACIA")
    pasa = bool(r.error and "vacía" in r.error)
    filas.append(_fila(r, "R-VACIA", "llamada", "robustez", "el notebook avisa y no la envía", pasa,
                       "la pregunta vacía no se detectó", laboratorio, "base"))
    # 2. La misma pregunta vacía, enviada de todos modos: ¿qué hace el proveedor?
    r = preguntar(modelo, sistema, "", config, caso_id="R-VACIA-API", validar=False)
    pasa = bool(r.error) or bool(r.texto)
    obtenido = f"el proveedor respondió con un error: {r.error}" if r.error else f"el proveedor respondió: {r.texto}"
    fila = _fila(r, "R-VACIA-API", "llamada", "robustez", "el error o la respuesta queda registrado", pasa,
                 "el proveedor no devolvió ni texto ni error", laboratorio, "base")
    fila["obtenido"] = _resumir(obtenido)
    filas.append(fila)
    # 3. Pregunta muy larga: un registro de cambios ficticio con miles de palabras.
    larga = datos["larga"]
    r = preguntar(modelo, sistema, larga["entrada"], config, caso_id="R-LARGA")
    pasa = bool(r.texto) and r.tokens_entrada > 0
    razon = r.error or "la respuesta llegó sin texto o sin tokens"
    filas.append(_fila(r, "R-LARGA", "llamada", "robustez", "hay texto y conteo de tokens", pasa, razon, laboratorio, "base"))
    for f in filas:
        print(f"  {f['caso_id']:11s} {f['resultado']:5s}  {f['obtenido'][:90]}")
    if r.texto:
        encontro = contiene_dato(r.texto, larga["esperado"])
        print(f"\n  La respuesta larga {'sí' if encontro else 'no'} contiene el dato buscado ({larga['esperado']}). "
              f"Tokens de entrada: {miles(r.tokens_entrada)}.")
    return pd.DataFrame(filas, columns=COLUMNAS_RESULTADOS)


def correr_consistencia(modelo, config, casos: list[dict], sistema: str, k: int = 5, laboratorio: str = "2A") -> pd.DataFrame:
    """Repite cada pregunta k veces y aplica el mismo criterio en cada intento (J.6)."""
    if hasattr(modelo, "reiniciar"):
        modelo.reiniciar()
    filas = []
    for c in casos:
        marcas = ""
        for intento in range(1, k + 1):
            r = preguntar(modelo, sistema, c["entrada"], config, caso_id=c["caso_id"], intento=intento)
            pasa, razon = (False, r.error) if r.error else criterio(c["tipo"], r.texto, c["esperado"])
            filas.append(_fila(r, c["caso_id"], "consistencia", "funcionamiento", c["esperado"], pasa, razon, laboratorio, f"k={k}", c["tipo"]))
            marcas += "✓" if pasa else "✗"
        print(f"  {c['caso_id']:6s} {marcas}")
    return pd.DataFrame(filas, columns=COLUMNAS_RESULTADOS)


TEMA_BASE = "tecnología de software"


def sistema_para(datos: dict, tema: str, config) -> str:
    """El mensaje de sistema de las pruebas, con el tema de tu dominio en lugar de la tecnología de software.

    En modo grabado, el tema no cambia: las grabaciones se hicieron con el mensaje original.
    """
    if _vacio(tema) or str(tema).strip() == TEMA_BASE:
        return datos["sistema"]
    if config.modo != "en_vivo":
        print(f"En modo grabado, el tema sigue siendo «{TEMA_BASE}»: las grabaciones se hicieron con ese mensaje.")
        return datos["sistema"]
    sistema = datos["sistema"].replace(TEMA_BASE, str(tema).strip())
    print("Mensaje de sistema para tu dominio:\n" + sistema)
    return sistema


def casos_para_consistencia(elegidas, casos: list[dict], sugeridas=()) -> list[dict]:
    """Toma las tres preguntas que elegiste para repetir. Si la lista está vacía, usa las sugeridas y lo avisa."""
    por_id = {c["caso_id"]: c for c in casos}
    elegidas = [normalizar_id(e) for e in (elegidas or []) if not _vacio(e)]
    if not elegidas:
        print("Todavía no elegiste tus tres preguntas. Por ahora corro las sugeridas: " + ", ".join(sugeridas) + ".")
        print("Escribe las tuyas en la celda del Ejercicio 2 y vuelve a ejecutar.")
        elegidas = list(sugeridas)
    faltan = [e for e in elegidas if e not in por_id]
    if faltan:
        print("Estas preguntas no están en tu lista de casos: " + ", ".join(map(str, faltan)) + ". Las omito.")
    elegidas = list(dict.fromkeys(e for e in elegidas if e in por_id))
    if len(elegidas) != 3:
        print(f"Elegiste {len(elegidas)} preguntas válidas. El ejercicio pide tres.")
    tipos = [por_id[e]["tipo"] for e in elegidas]
    if len(set(tipos)) < len(tipos):
        print("Hay preguntas del mismo tipo. El ejercicio pide tres tipos distintos: cambia una y vuelve a ejecutar.")
    return [por_id[e] for e in elegidas]


def pass_k(consistencia: pd.DataFrame) -> dict:
    """pass^k: proporción de preguntas que aciertan en todos los intentos. pass@k: en al menos uno."""
    if consistencia is None or consistencia.empty:
        return {"preguntas": 0, "k": 0, "pass^k": float("nan"), "pass@k": float("nan")}
    por_pregunta = consistencia.groupby("caso_id")["resultado"].apply(lambda s: list(s == "pasa"))
    k = int(consistencia.groupby("caso_id").size().max())
    todas = [all(v) for v in por_pregunta]
    alguna = [any(v) for v in por_pregunta]
    return {"preguntas": len(todas), "k": k, "pass^k": sum(todas) / len(todas), "pass@k": sum(alguna) / len(alguna)}


def resumen_por_tipo(resultados: pd.DataFrame) -> pd.DataFrame:
    """Aciertos, tokens y costo por tipo de pregunta, solo con las filas de contenido."""
    df = resultados[resultados["etapa"] == "contenido"].copy()
    if df.empty:
        return pd.DataFrame(columns=["tipo de pregunta", "preguntas", "aciertos", "% de aciertos", "tokens", "costo (USD)"])
    df["acierto"] = df["resultado"] == "pasa"
    g = df.groupby("tipo_pregunta").agg(
        preguntas=("caso_id", "count"), aciertos=("acierto", "sum"),
        tokens_entrada=("tokens_entrada", "sum"), tokens_salida=("tokens_salida", "sum"), costo=("costo_usd", "sum"),
    )
    orden = [t for t in TIPOS if t in g.index]
    g = g.loc[orden]
    salida = pd.DataFrame({
        "tipo de pregunta": [TIPOS[t]["nombre"] for t in g.index],
        "preguntas": g["preguntas"].values,
        "aciertos": g["aciertos"].astype(int).values,
        "% de aciertos": (100 * g["aciertos"] / g["preguntas"]).round(0).astype(int).values,
        "tokens": (g["tokens_entrada"] + g["tokens_salida"]).astype(int).values,
        "costo (USD)": g["costo"].round(6).values,
    })
    return salida
