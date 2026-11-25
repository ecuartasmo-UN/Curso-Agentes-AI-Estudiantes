"""Laboratorio 2B: clasificar reportes de errores con varios modelos y elegir uno.

Reutiliza la capa de evaluación del curso (Anexo J): criterios deterministas, la tabla de resultados de J.7 y pass^k.
Agrega lo propio de comparar modelos:
- el formato de respuesta «Categoría: … | Prioridad: …» y su lectura;
- el criterio de éxito, que se fija antes de probar;
- el costo por caso, el costo por acierto y la tabla de la decisión.
"""
import hashlib
import html
import json
import re
from datetime import date
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from IPython.display import HTML, display

from .configuracion import PARAMETROS
from .entrega import mostrar_comprobacion
from .llamadas import preguntar
from .modelo_grabado import ModeloGrabado, SinGrabacion, modelo_grabado
from .pruebas import COLUMNAS_J7, _vacio, normalizar, normalizar_id, pass_k, plural

CATEGORIAS = ["fallo de la app", "rendimiento", "interfaz", "cuenta y acceso", "solicitud de función"]
PRIORIDADES = ["alta", "media", "baja"]
CRITERIOS = {
    "categoria": "la categoría",
    "categoria_y_prioridad": "la categoría y la prioridad",
}
INSTRUCCIONES = {"basica": "básica", "con_reglas": "con reglas de prioridad"}
TIPO_PRUEBA_DE = {"normal": "funcionamiento", "borde": "robustez", "ambigua": "robustez", "mal escrita": "robustez",
                  "propio": "funcionamiento"}
COLUMNAS_2B = COLUMNAS_J7 + ["tipo_caso", "categoria_obtenida", "prioridad_obtenida"]
COLORES = ["#0ea5e9", "#f59e0b", "#8b5cf6", "#10b981"]
VERDE = "rgba(16, 185, 129, 0.22)"
ROJO = "rgba(244, 63, 94, 0.22)"
_CATEGORIA_NORMALIZADA = {normalizar(c): c for c in CATEGORIAS}


# ---------------------------------------------------------------- datos
def cargar_reportes(carpeta=None) -> dict:
    """Lee los reportes del laboratorio: las categorías, las dos instrucciones, la lista base y el banco."""
    carpeta = Path(carpeta) if carpeta else Path.cwd()
    return json.loads((carpeta / "datos" / "reportes_2B.json").read_text(encoding="utf-8"))


def huella(*partes: str) -> str:
    """Una huella corta de un valor: permite dar una pista sin mostrar la respuesta."""
    return hashlib.sha256(":".join(partes).encode("utf-8")).hexdigest()[:12]


# ---------------------------------------------------------------- el formato y el criterio
def leer_clasificacion(texto: str) -> tuple[str | None, str | None]:
    """Lee la categoría y la prioridad de una respuesta con el formato «Categoría: … | Prioridad: …».

    Devuelve (None, None) si la respuesta no trae las dos etiquetas, en ese orden.
    """
    t = normalizar(texto)
    m = re.search(r"categoria\s*:\s*(?P<cat>[^|]*?)\s*[|;,.]?\s*prioridad\s*:\s*(?P<prio>[a-z]+)", t)
    if not m:
        return None, None
    categoria = m.group("cat").strip(" .,;-")
    return _CATEGORIA_NORMALIZADA.get(categoria, categoria), m.group("prio")


def criterio_clasificacion(texto: str, categoria: str, prioridad: str, criterio: str) -> tuple[bool, str, str, str]:
    """Aplica el criterio de éxito. Devuelve (pasa, razón del fallo, categoría obtenida, prioridad obtenida)."""
    if not texto or not texto.strip():
        return False, "la respuesta llegó vacía", "", ""
    cat, prio = leer_clasificacion(texto)
    if cat is None:
        return False, "no cumple el formato «Categoría: … | Prioridad: …»", "", ""
    if cat not in CATEGORIAS:
        return False, f"la categoría «{cat}» no es una de las cinco", cat, prio
    if prio not in PRIORIDADES:
        return False, f"la prioridad «{prio}» no es alta, media ni baja", cat, prio
    if cat != categoria:
        return False, f"categoría «{cat}» en lugar de «{categoria}»", cat, prio
    if criterio == "categoria_y_prioridad" and prio != prioridad:
        return False, f"prioridad «{prio}» en lugar de «{prioridad}»", cat, prio
    return True, "", cat, prio


def opcion(valor, opciones: dict):
    """Lee una opción aunque traiga tildes, mayúsculas o espacios.

    Devuelve la opción válida, o None si la celda está vacía. Si el texto no es una opción, devuelve "".
    """
    if _vacio(valor):
        return None
    texto = normalizar(str(valor)).replace(" ", "_").replace("-", "_")
    return texto if texto in opciones else ""


def revisar_instruccion(instruccion) -> str:
    """Comprueba la instrucción del Ejercicio 2. Si falta o no es válida, usa la básica y dice por qué."""
    valor = opcion(instruccion, INSTRUCCIONES)
    if valor:
        print(f"Instrucción: {INSTRUCCIONES[valor]}.")
        return valor
    if valor == "":
        print(f"«{instruccion}» no es una de las instrucciones. Escribe «basica» o «con_reglas».")
    else:
        print("Todavía no elegiste la instrucción. Escríbela en el Ejercicio 2.")
    print("Por ahora uso la básica.")
    return "basica"


def revisar_criterio(criterio) -> str:
    """Comprueba el criterio de éxito del Ejercicio 1. Si falta o no es válido, usa «categoria» y dice por qué."""
    valor = opcion(criterio, CRITERIOS)
    if valor:
        print(f"Criterio de éxito: coinciden {CRITERIOS[valor]}.")
        return valor
    if valor == "":
        print(f"«{criterio}» no es un criterio. Escribe «categoria» o «categoria_y_prioridad».")
    else:
        print("Todavía no elegiste el criterio de éxito. Escríbelo en el Ejercicio 1.")
    print("Por ahora uso «categoria».")
    return "categoria"


# ---------------------------------------------------------------- los casos (J.9)
def _texto(valor) -> str:
    return "" if _vacio(valor) else str(valor).strip()


def armar_casos_2B(datos: dict, mis_reportes=None, modo: str = "grabado") -> list[dict]:
    """Une los doce reportes base con los tuyos. Revisa cada fila y da pistas si algo no coincide con las reglas."""
    banco = {p["caso_id"]: p for p in datos["banco"]}
    casos = [dict(p, etapa="contenido", origen="base", pendientes=[]) for p in datos["base"]]
    ya = {c["caso_id"] for c in casos}
    avisos, notas, pistas = [], [], []
    for i, p in enumerate(mis_reportes or [], start=1):
        if not isinstance(p, dict):
            avisos.append(f"Fila {i}: debe ser un diccionario entre llaves, como en el ejemplo.")
            continue
        caso_id = normalizar_id(p.get("caso_id"))
        if not caso_id:
            avisos.append(f"Fila {i}: falta el caso_id. Copia uno del banco, por ejemplo «B-01».")
            continue
        referencia = banco.get(caso_id, {})
        entrada = _texto(p.get("entrada")) or referencia.get("entrada", "")
        categoria = _CATEGORIA_NORMALIZADA.get(normalizar(_texto(p.get("categoria"))), _texto(p.get("categoria")))
        prioridad = normalizar(_texto(p.get("prioridad")))
        problemas = []
        if caso_id in ya:
            problemas.append(f"el caso {caso_id} ya está en la lista")
        if categoria not in CATEGORIAS:
            problemas.append("la categoría debe ser una de: " + ", ".join(CATEGORIAS))
        if prioridad not in PRIORIDADES:
            problemas.append("la prioridad debe ser alta, media o baja")
        if modo == "grabado" and caso_id not in banco:
            problemas.append(f"el caso {caso_id} no está en el banco. En modo grabado, usa un código de "
                             f"{min(banco)} a {max(banco)}")
        elif not entrada:
            problemas.append("falta el reporte («entrada»)")
        if problemas:
            avisos.append(f"Fila {i} ({caso_id}): " + "; ".join(problemas) + ".")
            continue
        tipo_caso = referencia.get("tipo_caso") or _texto(p.get("tipo_caso")).lower() or "propio"
        tipo_prueba = TIPO_PRUEBA_DE.get(tipo_caso, "robustez")
        escrito = _texto(p.get("tipo_prueba")).lower()
        if not escrito:
            notas.append(f"{caso_id}: faltaba el tipo de prueba. Lo completé con «{tipo_prueba}»: piensa por qué.")
        elif escrito != tipo_prueba:
            notas.append(f"{caso_id}: un caso «{tipo_caso}» es una prueba de {tipo_prueba}. Lo corregí.")
        pendientes = []
        # Con el banco, el notebook compara tu respuesta esperada con la de referencia y da una pista si no coincide.
        if "huella_categoria" in referencia or "categoria" in referencia:
            if "categoria" in referencia:
                cat_ok, prio_ok = referencia["categoria"] == categoria, referencia["prioridad"] == prioridad
            else:
                cat_ok = referencia["huella_categoria"] == huella(caso_id, categoria)
                prio_ok = referencia["huella_prioridad"] == huella(caso_id, "prioridad", prioridad)
            if not cat_ok:
                pistas.append(f"{caso_id}: revisa la categoría. Pista: {referencia.get('pista', 'relee las definiciones.')}")
                pendientes.append("la categoría no coincide con las reglas")
            if not prio_ok:
                pistas.append(f"{caso_id}: revisa la prioridad con la tabla de reglas de la sección 2.1.")
                pendientes.append("la prioridad no coincide con las reglas")
        casos.append({
            "caso_id": caso_id, "etapa": "contenido", "tipo_caso": tipo_caso, "tipo_prueba": tipo_prueba,
            "entrada": entrada, "categoria": categoria, "prioridad": prioridad, "por_que": "",
            "origen": "tuya", "pendientes": pendientes,
        })
        ya.add(caso_id)
    for titulo, lista in [("Revisa estas filas. No se agregaron a la lista:", avisos),
                          ("Notas sobre tus filas:", notas),
                          ("Pistas para revisar (la fila se agregó tal como la escribiste):", pistas)]:
        if lista:
            print(titulo)
            for linea in lista:
                print("  •", linea)
    tuyas = [c for c in casos if c["origen"] == "tuya"]
    por_resolver = sum(len(c["pendientes"]) for c in tuyas)
    if por_resolver:
        print(f"⚠️ {plural(por_resolver, 'pista', 'pistas')} por resolver: corrige tus filas y vuelve a ejecutar.")
    print(f"Lista armada: {plural(len(casos), 'reporte', 'reportes')}, {plural(len(tuyas), 'tuyo', 'tuyos')}.")
    return casos


# ---------------------------------------------------------------- los modelos
def revisar_modelos(modelos) -> list[str]:
    """Comprueba la lista del Ejercicio 2: dos modelos obligatorios y uno opcional."""
    elegidos = [m for m in (modelos or []) if not _vacio(m)]
    validos = [m for m in elegidos if m in PARAMETROS]
    for m in elegidos:
        if m not in PARAMETROS:
            print(f"«{m}» no es un modelo del curso. Usa uno de: " + ", ".join(PARAMETROS) + ".")
    if "anthropic:claude-haiku-5-5" not in validos:
        print("Falta Claude Haiku 5.5: es uno de los dos modelos obligatorios. Lo agrego.")
        validos.insert(0, "anthropic:claude-haiku-5-5")
    if not any(m.startswith("google_genai:") for m in validos):
        print("Falta un modelo Gemini: es el segundo modelo obligatorio. Agrego Gemini 3.5 Flash-Lite.")
        validos.insert(1, "google_genai:gemini-3.5-flash-lite")
    validos = list(dict.fromkeys(validos))
    print("Modelos que comparas:", ", ".join(m.split(":", 1)[-1] for m in validos))
    return validos


def modelo_grabado_si_hay(config, modelo: str):
    """El modelo grabado, o None si ese modelo no tiene grabaciones. Lo avisa y el notebook sigue."""
    try:
        return modelo_grabado(config, modelo)
    except SinGrabacion:
        print(f"{modelo.split(':', 1)[-1]}: no tiene grabaciones en esta carpeta. Lo dejo fuera de la comparación.")
        return None


# ---------------------------------------------------------------- las pruebas
def _resumir(texto: str, largo: int = 160) -> str:
    t = re.sub(r"\s+", " ", str(texto or "")).strip()
    return t if len(t) <= largo else t[: largo - 1] + "…"


def _fila(r, caso: dict, etapa: str, esperado: str, pasa: bool, razon: str, variante: str,
          cat: str = "", prio: str = "") -> dict:
    return {
        "sesion": 2, "laboratorio": "2B", "variante": variante, "forma": "llm_directo",
        "caso_id": caso["caso_id"], "etapa": etapa, "tipo_prueba": caso.get("tipo_prueba", "robustez"),
        "esperado": esperado, "obtenido": _resumir(r.texto) if r.texto else _resumir(r.error or ""),
        "resultado": "pasa" if pasa else "falla", "razon_fallo": "" if pasa else razon,
        "intento": r.intento, "modo": r.modo, "modelo": r.modelo,
        "tokens_entrada": r.tokens_entrada, "tokens_salida": r.tokens_salida,
        "costo_usd": round(r.costo_usd, 7), "latencia_s": r.latencia_s,
        "pasos": 1 if (r.texto or r.tokens_entrada) else 0, "llamadas_herramientas": 0, "intervenciones_humanas": 0,
        "fecha": date.today().isoformat(), "tipo_caso": caso.get("tipo_caso", ""),
        "categoria_obtenida": cat, "prioridad_obtenida": prio,
    }


def correr_comparacion(modelos: dict, config, casos: list[dict], sistema: str, criterio: str,
                       k: int = 3, variante: str = "") -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Envía cada reporte k veces a cada modelo, con el mismo mensaje de sistema, y aplica el criterio de éxito.

    Devuelve tres tablas con las columnas de J.7:
    - la etapa de la llamada: una fila por modelo, con la misma entrada y los metadatos;
    - el contenido: el primer intento de cada caso;
    - la consistencia: los intentos 2 a k, para calcular pass^k con el primero.
    """
    llamada, contenido, consistencia = [], [], []
    huellas_por_modelo = {}
    for nombre, modelo in modelos.items():
        if hasattr(modelo, "reiniciar"):
            modelo.reiniciar()
        con_metadatos, total, huellas, marcas = 0, 0, [], []
        for caso in casos:
            huellas.append(huella(sistema, caso["entrada"]))
            esperado = f"{caso['categoria']} | {caso['prioridad']}"
            marca = ""
            for intento in range(1, k + 1):
                r = preguntar(modelo, sistema, caso["entrada"], config, caso_id=caso["caso_id"], intento=intento,
                              nombre_modelo=nombre)
                total += 1
                con_metadatos += int(bool(r.texto) and r.tokens_entrada > 0)
                if r.error:
                    pasa, razon, cat, prio = False, r.error, "", ""
                else:
                    pasa, razon, cat, prio = criterio_clasificacion(r.texto, caso["categoria"], caso["prioridad"], criterio)
                fila = _fila(r, caso, "contenido" if intento == 1 else "consistencia", esperado, pasa, razon,
                             variante, cat, prio)
                (contenido if intento == 1 else consistencia).append(fila)
                marca += "✓" if pasa else "✗"
            marcas.append(marca)
        huellas_por_modelo[nombre] = huellas
        aciertos = sum(m[0] == "✓" for m in marcas)
        print(f"  {nombre.split(':', 1)[-1]:24s} {aciertos} de {len(casos)} aciertos en el primer intento · "
              f"{con_metadatos} de {total} llamadas con texto y tokens")
        llamada.append((nombre, con_metadatos, total))
    # La prueba de funcionamiento de la llamada: la misma entrada llega a todos los modelos.
    referencia = next(iter(huellas_por_modelo.values()), [])
    filas_llamada = []
    for nombre, con_metadatos, total in llamada:
        misma = huellas_por_modelo[nombre] == referencia
        r = _RespuestaResumen(nombre, modelos[nombre])
        pasa = misma and con_metadatos == total and total > 0
        razon = "" if pasa else ("la entrada no fue la misma" if not misma else f"{total - con_metadatos} llamadas sin texto o sin tokens")
        fila = _fila(r, {"caso_id": "todas", "tipo_prueba": "funcionamiento"}, "llamada",
                     "la misma entrada llega y vuelve con texto y tokens", pasa, razon, variante)
        fila["obtenido"] = (f"{len(referencia)} reportes con la misma entrada que los otros modelos: "
                            f"{'sí' if misma else 'no'}; {con_metadatos} de {total} llamadas con texto y tokens")
        filas_llamada.append(fila)
    return (pd.DataFrame(filas_llamada, columns=COLUMNAS_2B), pd.DataFrame(contenido, columns=COLUMNAS_2B),
            pd.DataFrame(consistencia, columns=COLUMNAS_2B))


class _RespuestaResumen:
    """Una respuesta sin consumo, para las filas de resumen."""

    def __init__(self, nombre: str, modelo):
        self.texto, self.error, self.intento = "", "", 1
        self.modo = "grabado" if isinstance(modelo, ModeloGrabado) else "en_vivo"
        self.modelo = nombre.split(":", 1)[-1]
        self.tokens_entrada = self.tokens_salida = 0
        self.costo_usd = self.latencia_s = 0.0


def prueba_tiempo_agotado(modelos: dict, config, sistema: str, caso: dict, limite_s: float = 0.05,
                          variante: str = "") -> pd.DataFrame:
    """La prueba de robustez de la llamada: el mismo reporte, con un tiempo de espera muy corto.

    En vivo, crea cada modelo con init_chat_model y un tiempo de espera de limite_s segundos, sin reintentos.
    En grabado, usa la grabación real de un tiempo agotado. La prueba pasa si el fallo queda registrado.
    """
    from langchain.chat_models import init_chat_model

    filas = []
    for nombre, modelo in modelos.items():
        if isinstance(modelo, ModeloGrabado):
            try:
                corto = modelo_grabado(config, nombre, escenario="tiempo_agotado")
            except SinGrabacion:
                corto = None
        else:
            parametros = {**PARAMETROS.get(nombre, {}), "timeout": limite_s, "max_retries": 0}
            corto = init_chat_model(nombre, **parametros)
        if corto is None:
            continue
        r = preguntar(corto, sistema, caso["entrada"], config, caso_id="R-TIEMPO", nombre_modelo=nombre)
        if r.error:
            error = r.error.replace(" Vuelve a ejecutar la celda.", "")
            obtenido = f"tiempo agotado y registrado (límite {limite_s} s): {error}"
        elif r.texto:
            obtenido = f"respondió antes del límite: {r.texto}"
        else:
            obtenido = "no hubo respuesta ni error"
        pasa = bool(r.error) or (bool(r.texto) and r.tokens_entrada > 0)
        fila = _fila(r, {"caso_id": "R-TIEMPO", "tipo_prueba": "robustez", "tipo_caso": "tiempo agotado"}, "llamada",
                     f"responde con metadatos, o el fallo queda registrado (límite {limite_s} s)", pasa,
                     "el fallo no quedó registrado", variante)
        fila["obtenido"] = _resumir(obtenido)
        filas.append(fila)
        print(f"  {nombre.split(':', 1)[-1]:24s} {'pasa ' if pasa else 'falla'}  {_resumir(obtenido, 90)}")
    return pd.DataFrame(filas, columns=COLUMNAS_2B)


def recalificar(tabla: pd.DataFrame, criterio: str) -> pd.DataFrame:
    """Vuelve a aplicar otro criterio de éxito a las mismas respuestas, sin llamar a los modelos."""
    t = tabla.copy()
    for i, f in t.iterrows():
        if not f["categoria_obtenida"]:
            continue  # sin formato o con error: falla con cualquier criterio
        categoria, prioridad = [s.strip() for s in str(f["esperado"]).split("|")]
        pasa, razon, _, _ = criterio_clasificacion(
            f"Categoría: {f['categoria_obtenida']} | Prioridad: {f['prioridad_obtenida']}", categoria, prioridad, criterio)
        t.at[i, "resultado"] = "pasa" if pasa else "falla"
        t.at[i, "razon_fallo"] = "" if pasa else razon
    return t


# ---------------------------------------------------------------- las medidas
def resumen_por_modelo(contenido: pd.DataFrame, consistencia: pd.DataFrame) -> pd.DataFrame:
    """Las medidas de cada modelo: tasa de éxito, pass^k, tokens, costo por caso, costo por acierto y latencia."""
    filas = []
    for nombre in dict.fromkeys(contenido["modelo"]):
        c1 = contenido[contenido["modelo"] == nombre]
        todos = pd.concat([c1, consistencia[consistencia["modelo"] == nombre]], ignore_index=True)
        n, aciertos = len(c1), int((c1["resultado"] == "pasa").sum())
        costo = float(c1["costo_usd"].sum())
        p = pass_k(todos)
        filas.append({
            "modelo": nombre, "modo": c1["modo"].iloc[0] if n else "",
            "casos": n, "aciertos": aciertos, "tasa de éxito (%)": round(100 * aciertos / n) if n else 0,
            f"pass^{p['k']}": round(p["pass^k"], 2),
            "tokens": int(c1["tokens_entrada"].sum() + c1["tokens_salida"].sum()),
            "costo total (USD)": round(costo, 6),
            "costo por caso (USD)": round(costo / n, 7) if n else float("nan"),
            "costo por acierto (USD)": round(costo / aciertos, 7) if aciertos else float("nan"),
            "latencia media (s)": round(float(c1["latencia_s"].mean()), 2) if n else float("nan"),
        })
    return pd.DataFrame(filas)


def _columna_pass(resumen: pd.DataFrame) -> str:
    return next(c for c in resumen.columns if c.startswith("pass^"))


def grafico_comparacion(resumen: pd.DataFrame, titulo: str = "Comparación de modelos") -> None:
    """Cuatro gráficos de barras: aciertos, costo por acierto, latencia y pass^k de cada modelo."""
    if resumen is None or resumen.empty:
        print("Todavía no hay resultados para comparar.")
        return
    medidas = [("tasa de éxito (%)", "Tasa de éxito (%)", "{:.0f} %"), ("costo por acierto (USD)", "Costo por acierto (USD)", "{:.6f}"),
               ("latencia media (s)", "Latencia media (s)", "{:.2f} s"), (_columna_pass(resumen), _columna_pass(resumen), "{:.2f}")]
    fig, ejes = plt.subplots(1, 4, figsize=(13, 3.4))
    nombres = list(resumen["modelo"])
    colores = COLORES[: len(nombres)]
    for eje, (columna, etiqueta, formato) in zip(ejes, medidas):
        valores = resumen[columna].fillna(0).tolist()
        barras = eje.bar(range(len(nombres)), valores, color=colores)
        for b, v, original in zip(barras, valores, resumen[columna].tolist()):
            texto = "sin aciertos" if pd.isna(original) else formato.format(v)
            eje.text(b.get_x() + b.get_width() / 2, b.get_height(), texto, ha="center", va="bottom", fontsize=8)
        eje.set_title(etiqueta, fontsize=10)
        eje.set_xticks(range(len(nombres)))
        eje.set_xticklabels([n.replace("claude-", "").replace("gemini-", "gemini\n") for n in nombres], fontsize=8)
        eje.spines[["top", "right"]].set_visible(False)
        eje.margins(y=0.2)
    fig.suptitle(titulo)
    plt.tight_layout()
    plt.show()


# ---------------------------------------------------------------- la presentación
def _estilo_resultado(valor):
    if valor == "pasa":
        return f"background-color:{VERDE}"
    if valor == "falla":
        return f"background-color:{ROJO}"
    return ""


def mostrar_reportes(casos: list[dict], con_esperado: bool = True) -> None:
    """Muestra los reportes como tabla, con su tipo de caso y su respuesta esperada."""
    if not casos:
        print("Todavía no hay reportes en esta lista.")
        return
    columnas = ["caso_id", "tipo_caso", "entrada"] + (["categoria", "prioridad", "por_que"] if con_esperado else [])
    df = pd.DataFrame(casos)
    df = df[[c for c in columnas if c in df.columns and df[c].astype(str).str.strip().ne("").any()]].rename(columns={
        "tipo_caso": "tipo de caso", "entrada": "reporte", "categoria": "categoría esperada",
        "prioridad": "prioridad esperada", "por_que": "por qué"})
    display(df.style.hide(axis="index").set_properties(**{"text-align": "left", "white-space": "pre-wrap"}))


def mostrar_banco_2B(datos: dict) -> None:
    """Muestra el banco de reserva sin la respuesta esperada: esa la decides tú con las reglas."""
    mostrar_reportes(datos["banco"], con_esperado=False)


def mostrar_resultados_2B(tabla: pd.DataFrame, plegada: bool = False) -> None:
    """La tabla de resultados. Plegada, trae todas las columnas de J.7 dentro de un desplegable."""
    if tabla is None or tabla.empty:
        print("Todavía no hay resultados. Ejecuta primero las celdas de las pruebas.")
        return
    columnas = list(tabla.columns) if plegada else [
        "modelo", "caso_id", "tipo_prueba", "esperado", "obtenido", "resultado", "razon_fallo", "modo"]
    estilo = tabla[columnas].style.hide(axis="index").map(_estilo_resultado, subset=["resultado"]).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}).format({"costo_usd": "{:.6f}", "latencia_s": "{:.2f}"})
    if not plegada:
        display(estilo)
        return
    display(HTML(
        f"<details><summary><b>La tabla de resultados completa, con las columnas del curso</b> "
        f"(una fila por reporte y por modelo; clic para abrir)</summary>{estilo.to_html()}</details>"
    ))


def mostrar_por_caso(contenido: pd.DataFrame, casos: list[dict]) -> None:
    """Una fila por reporte y una columna por modelo, con lo que respondió cada modelo en el primer intento."""
    if contenido is None or contenido.empty:
        print("Todavía no hay resultados de contenido.")
        return
    info = {c["caso_id"]: c for c in casos or []}
    filas = {}
    for _, f in contenido.iterrows():
        if f["categoria_obtenida"]:
            respuesta = f"{f['categoria_obtenida']} | {f['prioridad_obtenida']}"
        else:
            respuesta = "sin formato" if "formato" in str(f["razon_fallo"]) else "error o sin respuesta"
        marca = "✓" if f["resultado"] == "pasa" else "✗"
        fila = filas.setdefault(f["caso_id"], {
            "caso_id": f["caso_id"], "tipo de caso": info.get(f["caso_id"], {}).get("tipo_caso", f["tipo_caso"]),
            "esperado": f["esperado"]})
        fila[f["modelo"]] = f"{marca} {respuesta}"
    df = pd.DataFrame(list(filas.values()))
    modelos = list(dict.fromkeys(contenido["modelo"]))

    def color(v):
        if isinstance(v, str) and v.startswith("✓"):
            return f"background-color:{VERDE}"
        if isinstance(v, str) and v.startswith("✗"):
            return f"background-color:{ROJO}"
        return ""

    display(df.style.hide(axis="index").map(color, subset=modelos).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}))


def mostrar_consistencia_modelos(contenido: pd.DataFrame, consistencia: pd.DataFrame) -> None:
    """Una fila por reporte y una columna por modelo, con ✓ o ✗ en cada intento."""
    todos = pd.concat([contenido, consistencia], ignore_index=True).sort_values(["modelo", "caso_id", "intento"])
    if todos.empty:
        print("Todavía no hay intentos para mostrar.")
        return
    marcas = todos.groupby(["caso_id", "modelo"])["resultado"].apply(lambda s: "".join("✓" if v == "pasa" else "✗" for v in s))
    tabla = marcas.unstack("modelo")
    tabla = tabla.reindex(list(dict.fromkeys(contenido["caso_id"])))[list(dict.fromkeys(contenido["modelo"]))]
    display(tabla.style.map(lambda v: f"background-color:{VERDE}" if isinstance(v, str) and set(v) == {"✓"} else
                            (f"background-color:{ROJO}" if isinstance(v, str) and "✓" not in v else "")))


def mostrar_resumen_modelos(resumen: pd.DataFrame) -> None:
    """Las medidas de cada modelo, en una tabla."""
    if resumen is None or resumen.empty:
        print("Todavía no hay resultados para resumir.")
        return
    formatos = {"costo total (USD)": "{:.6f}", "costo por caso (USD)": "{:.7f}", "costo por acierto (USD)": "{:.7f}",
                "latencia media (s)": "{:.2f}", _columna_pass(resumen): "{:.2f}"}
    display(resumen.style.hide(axis="index").format(formatos, na_rep="sin aciertos").set_properties(
        subset=["modelo"], **{"text-align": "left"}))


def comparar_variantes(resumenes: dict) -> pd.DataFrame:
    """Compara las medidas de cada modelo con distintas instrucciones o criterios de éxito."""
    filas = []
    for etiqueta, r in resumenes.items():
        if r is None or r.empty:
            continue
        col = _columna_pass(r)
        for _, f in r.iterrows():
            filas.append({"variante": etiqueta, "modelo": f["modelo"], "tasa de éxito (%)": f["tasa de éxito (%)"],
                          col: f[col], "costo por acierto (USD)": f["costo por acierto (USD)"]})
    df = pd.DataFrame(filas)
    if df.empty:
        print("Todavía no hay variantes para comparar.")
        return df
    display(df.style.hide(axis="index").format({"costo por acierto (USD)": "{:.7f}", col: "{:.2f}"},
                                               na_rep="sin aciertos").set_properties(**{"text-align": "left"}))
    return df


def tabla_decision(resumen: pd.DataFrame, datos_por_modelo=None) -> pd.DataFrame:
    """La tabla de la decisión: los cuatro criterios del bloque 2.2 para cada modelo.

    Las filas de calidad, costo y latencia se llenan con tus resultados. La de los datos la escribes tú.
    """
    if resumen is None or resumen.empty:
        print("Todavía no hay resultados. Ejecuta primero las pruebas.")
        return pd.DataFrame()
    col = _columna_pass(resumen)
    datos_por_modelo = datos_por_modelo or {}
    tabla = {}
    for _, f in resumen.iterrows():
        nombre = f["modelo"]
        escrito = next((v for k, v in datos_por_modelo.items() if str(k).split(":", 1)[-1] == nombre), None)
        tabla[nombre] = {
            "Calidad en tus casos": f"tasa de éxito {f['tasa de éxito (%)']:.0f} % · {col} = {f[col]:.2f}",
            "Costo por acierto": "sin aciertos" if pd.isna(f["costo por acierto (USD)"]) else f"USD {f['costo por acierto (USD)']:.7f}",
            "Latencia": f"{f['latencia media (s)']:.2f} s por respuesta",
            "Tratamiento de los datos": "✏️ escríbelo en la celda del Ejercicio 4" if _vacio(escrito) else str(escrito),
        }
    df = pd.DataFrame(tabla)
    display(df.style.set_properties(**{"text-align": "left", "white-space": "pre-wrap"}))
    return df


# ---------------------------------------------------------------- la comprobación de la entrega
def comprobar_entrega_2B(datos_entrega=None, config=None, criterio=None, instruccion=None, modelos=None, casos=None,
                         llamada=None, tiempo=None, contenido=None, consistencia=None, datos_por_modelo=None,
                         contenido_otra=None, declaracion_ia=None) -> bool:
    """Revisa que la entrega del Laboratorio 2B esté completa. Orienta: no califica."""
    partes = []
    nombres = datos_entrega.get("nombres") if isinstance(datos_entrega, dict) else None
    partes.append(("listo" if not _vacio(nombres) else "falta", "tu nombre en «Datos de la entrega»"))
    valor = opcion(criterio, CRITERIOS)
    if valor:
        partes.append(("listo", "ejercicio 1: el criterio de éxito, fijado antes de probar"))
    elif valor == "":
        partes.append(("falta", f"ejercicio 1: «{criterio}» no es un criterio; escribe «categoria» o «categoria_y_prioridad»"))
    else:
        partes.append(("falta", "ejercicio 1: el criterio de éxito, fijado antes de probar"))
    modelos = list(modelos or [])
    dos = "anthropic:claude-haiku-5-5" in modelos and any(m.startswith("google_genai:") for m in modelos)
    valor = opcion(instruccion, INSTRUCCIONES)
    if valor and dos:
        partes.append(("listo", "ejercicio 2: la instrucción y los modelos, con Claude Haiku 5.5 y un Gemini"))
    elif valor == "":
        partes.append(("falta", f"ejercicio 2: «{instruccion}» no es una instrucción; escribe «basica» o «con_reglas»"))
    else:
        partes.append(("falta", "ejercicio 2: la instrucción y los modelos, con Claude Haiku 5.5 y un Gemini"))
    tuyos = [c for c in (casos or []) if isinstance(c, dict) and c.get("origen") == "tuya"]
    tipos = {c.get("tipo_caso") for c in tuyos}
    completos = len(tuyos) >= 2 and "borde" in tipos and tipos & {"ambigua", "mal escrita"}
    if not completos:
        partes.append(("falta", "ejercicio 3: dos reportes tuyos, uno de borde y uno ambiguo o mal escrito"))
    elif any(c.get("pendientes") for c in tuyos):
        pend = ", ".join(c["caso_id"] for c in tuyos if c.get("pendientes"))
        partes.append(("revisa", f"ejercicio 3: quedan pistas sin resolver en {pend}. Míralas en la sección 4.1"))
    else:
        partes.append(("listo", "ejercicio 3: dos reportes tuyos, uno de borde y uno ambiguo o mal escrito"))
    n_modelos = 0 if contenido is None or contenido.empty else contenido["modelo"].nunique()
    con_tiempo = 0 if tiempo is None or tiempo.empty else tiempo["modelo"].nunique()
    con_llamada = 0 if llamada is None or llamada.empty else llamada["modelo"].nunique()
    partes.append(("listo" if n_modelos >= 2 and con_tiempo == n_modelos and con_llamada == n_modelos else "falta",
                   "las pruebas de la llamada: la misma entrada y el tiempo agotado, en cada modelo"))
    n_casos = len(casos or [])
    completo = contenido is not None and not contenido.empty and all(
        (contenido["modelo"] == m).sum() == n_casos for m in contenido["modelo"].unique())
    partes.append(("listo" if completo and n_modelos >= 2 else "falta",
                   "la prueba de contenido: todos los reportes en cada modelo"))
    partes.append(("listo" if consistencia is not None and not consistencia.empty and consistencia["intento"].max() >= 3 else "falta",
                   "la consistencia: cada reporte tres veces por modelo, con su pass^3"))
    escritos = {str(k).split(":", 1)[-1]: v for k, v in (datos_por_modelo or {}).items() if not _vacio(v)}
    nombres_modelos = [] if contenido is None or contenido.empty else list(dict.fromkeys(contenido["modelo"]))
    partes.append(("listo" if nombres_modelos and all(n in escritos for n in nombres_modelos) else "falta",
                   "ejercicio 4: el tratamiento de los datos de cada modelo, en la tabla de la decisión"))
    otra = contenido_otra is not None and not contenido_otra.empty and \
        set(contenido_otra["variante"]) != set(contenido["variante"] if contenido is not None and not contenido.empty else [])
    partes.append(("listo" if otra else "falta", "para casa: las pruebas con la otra instrucción"))
    usaste = declaracion_ia.get("usaste_asistentes") if isinstance(declaracion_ia, dict) else None
    if not isinstance(usaste, bool):
        partes.append(("falta", "la declaración de uso de IA: en «usaste_asistentes» escribe True o False, sin comillas"))
    elif usaste and _vacio(declaracion_ia.get("cuales_y_para_que")):
        partes.append(("falta", "la declaración de uso de IA: escribe cuáles asistentes usaste y para qué"))
    else:
        partes.append(("listo", "la declaración de uso de asistentes de IA"))
    etiqueta = "modelos " + ", ".join(nombres_modelos) if nombres_modelos else "modelos sin correr"
    return mostrar_comprobacion(partes, config, modelo=etiqueta,
                                celdas_texto="el porqué del criterio, tus análisis, tu decisión, tu recomendación y la sección «Tu proyecto»")
