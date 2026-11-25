"""Presentación de respuestas, tablas y gráficos. Todo es estático, para que quede guardado en el notebook."""
import html

import matplotlib.pyplot as plt
import pandas as pd
from IPython.display import HTML, display

from .pruebas import TIPOS, pass_k

VERDE = "rgba(16, 185, 129, 0.22)"
ROJO = "rgba(244, 63, 94, 0.22)"
BORDE = "rgba(128, 128, 128, 0.45)"


def _caja(titulo: str, cuerpo: str, color: str = BORDE) -> str:
    return (
        f'<div style="border:1px solid {color};border-left:5px solid {color};border-radius:8px;'
        f'padding:10px 14px;margin:6px 0;color:inherit;font-family:system-ui,sans-serif">'
        f'<div style="font-weight:700;margin-bottom:6px">{titulo}</div>{cuerpo}</div>'
    )


def mostrar_respuesta(r) -> None:
    """Muestra la respuesta del modelo con sus tokens, su costo y su latencia."""
    if r.error:
        display(HTML(_caja("La llamada no trajo respuesta", f"<div>{html.escape(r.error)}</div>", "rgba(244,63,94,0.8)")))
        return
    razonamiento = f" (de ellos, <b>{r.tokens_razonamiento}</b> de razonamiento)" if r.tokens_razonamiento else ""
    datos = (
        f"<b>{r.tokens_entrada}</b> tokens de entrada · <b>{r.tokens_salida}</b> tokens de salida{razonamiento} · "
        f"costo <b>USD {r.costo_usd:.6f}</b> · latencia <b>{r.latencia_s:.2f} s</b> · modo {r.modo}"
    )
    cuerpo = f'<div style="font-size:1.05em;margin-bottom:8px">{html.escape(r.texto)}</div><div style="opacity:.8">{datos}</div>'
    display(HTML(_caja(f"Respuesta de {html.escape(r.modelo)}", cuerpo, "rgba(14,165,233,0.8)")))


def mostrar_casos(casos: list[dict], columnas=("caso_id", "tipo", "entrada", "esperado", "dato_real", "fuente")) -> None:
    """Muestra una lista de preguntas como tabla, con el dato real y su fuente."""
    if not casos:
        print("Todavía no hay preguntas en esta lista.")
        return
    df = pd.DataFrame(casos)
    df = df[[c for c in columnas if c in df.columns]].copy()
    if "tipo" in df.columns:
        df["tipo"] = df["tipo"].map(lambda t: TIPOS.get(t, {}).get("nombre", t))
    if "entrada" in df.columns:
        df["entrada"] = df["entrada"].map(lambda t: t if len(str(t)) <= 120 else str(t)[:117] + "…")
    if "fuente" in df.columns:
        df["fuente"] = df["fuente"].map(lambda f: f if f else "(no aplica)")
    estilo = df.style.hide(axis="index").set_properties(**{"text-align": "left", "white-space": "pre-wrap"})
    if "fuente" in df.columns:
        estilo = estilo.set_properties(subset=["fuente"], **{"word-break": "break-all", "font-size": "0.85em"})
    display(estilo)


def mostrar_banco(datos: dict, excluir=()) -> None:
    """Muestra el banco de reserva sin su tipo ni su respuesta esperada: esos datos los escribes tú."""
    filas = [{"caso_id": p["caso_id"], "pregunta": p["entrada"], "fuente": p.get("fuente") or "(no aplica)"}
             for p in datos["banco"] if p["caso_id"] not in set(excluir)]
    display(pd.DataFrame(filas).style.hide(axis="index").set_properties(**{"text-align": "left"}).set_properties(
        subset=["fuente"], **{"word-break": "break-all", "font-size": "0.85em"}))


def _color_resultado(valor):
    if valor == "pasa":
        return f"background-color:{VERDE}"
    if valor == "falla":
        return f"background-color:{ROJO}"
    return ""


def mostrar_resultados(resultados: pd.DataFrame, completa: bool = False) -> None:
    """Muestra la tabla de resultados. Por defecto, solo las columnas más útiles para leerla."""
    if resultados is None or resultados.empty:
        print("Todavía no hay resultados. Ejecuta primero las celdas de las pruebas.")
        return
    columnas = list(resultados.columns) if completa else [
        "caso_id", "etapa", "tipo_prueba", "esperado", "obtenido", "resultado", "razon_fallo",
        "intento", "tokens_entrada", "tokens_salida", "costo_usd", "latencia_s",
    ]
    df = resultados[columnas]
    estilo = df.style.hide(axis="index").map(_color_resultado, subset=["resultado"]).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}
    ).format({"costo_usd": "{:.6f}", "latencia_s": "{:.2f}"})
    display(estilo)


def mostrar_resumen(resumen: pd.DataFrame) -> None:
    """Muestra el resumen por tipo de pregunta."""
    if resumen is None or resumen.empty:
        print("Todavía no hay resultados de contenido para resumir.")
        return
    display(resumen.style.hide(axis="index").format({"costo (USD)": "{:.6f}"}).set_properties(
        subset=["tipo de pregunta"], **{"text-align": "left"}))


def grafico_por_tipo(resumen: pd.DataFrame, titulo: str = "Aciertos por tipo de pregunta") -> None:
    """Gráfico de barras con el porcentaje de aciertos de cada tipo."""
    if resumen.empty:
        print("No hay resultados de contenido para graficar.")
        return
    fig, ax = plt.subplots(figsize=(8, 3.6))
    colores = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444"]
    barras = ax.barh(resumen["tipo de pregunta"], resumen["% de aciertos"], color=colores[: len(resumen)])
    for barra, aciertos, total in zip(barras, resumen["aciertos"], resumen["preguntas"]):
        ax.text(barra.get_width() + 1.5, barra.get_y() + barra.get_height() / 2, f"{aciertos} de {total}", va="center")
    ax.set_xlim(0, 115)
    ax.set_xlabel("% de aciertos")
    ax.set_title(titulo)
    ax.invert_yaxis()
    ax.spines[["top", "right"]].set_visible(False)
    plt.tight_layout()
    plt.show()


def ver_codigo(funcion) -> None:
    """Muestra el código de una función del módulo en un desplegable, para quien quiera profundizar."""
    import inspect

    codigo = html.escape(inspect.getsource(funcion))
    display(HTML(
        f"<details><summary><b>Para profundizar: el código de <code>{funcion.__name__}</code></b> "
        f"(clic para abrir)</summary><pre style='font-size:0.85em;white-space:pre-wrap'>{codigo}</pre></details>"
    ))


def mostrar_ficha_entrega(datos_entrega: dict, config, modelos: str | None = None) -> None:
    """Muestra los datos de la entrega con el modo, el modelo y la fecha de esta corrida."""
    from datetime import date

    nombres = (datos_entrega or {}).get("nombres")
    nombres = "(escribe tu nombre en «Datos de la entrega»)" if nombres in (None, ..., "", "...") else nombres
    cuerpo = (
        f"<b>Nombres:</b> {html.escape(str(nombres))}<br>"
        f"<b>Modalidad:</b> {html.escape(str((datos_entrega or {}).get('modalidad') or '(sin definir)'))}<br>"
        f"<b>Modo:</b> {config.modo} · <b>{'Modelos' if modelos else 'Modelo'}:</b> {html.escape(modelos or config.nombre_modelo)} · "
        f"<b>Fecha:</b> {date.today().isoformat()}"
    )
    display(HTML(_caja("Datos de la entrega", cuerpo)))


def tabla_para_revisar(resultados: pd.DataFrame, casos: list[dict]) -> None:
    """Muestra cada respuesta de contenido junto a su dato real, para el Ejercicio 3."""
    if resultados is None or resultados.empty:
        print("Todavía no hay resultados de contenido. Ejecuta primero la sección 5.3.")
        return
    datos_reales = {c["caso_id"]: c.get("dato_real", "") for c in casos or []}
    df = resultados[resultados["etapa"] == "contenido"][["caso_id", "tipo_pregunta", "obtenido", "resultado", "razon_fallo"]].copy()
    df.insert(3, "dato_real", df["caso_id"].map(datos_reales).fillna(""))
    df["tipo_pregunta"] = df["tipo_pregunta"].map(lambda t: TIPOS.get(t, {}).get("nombre", t))
    display(df.style.hide(axis="index").map(_color_resultado, subset=["resultado"]).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}))


def mostrar_revision(revision, resultados: pd.DataFrame, casos: list[dict] | None = None) -> pd.DataFrame:
    """Compara tu revisión con el resultado del criterio automático (Ejercicio 3)."""
    filas, avisos = [], []
    resultados = resultados if resultados is not None else pd.DataFrame()
    datos_reales = {c["caso_id"]: c.get("dato_real", "") for c in casos or []}
    for i, r in enumerate(revision or [], start=1):
        caso_id = r.get("caso_id") if isinstance(r, dict) else None
        if caso_id in (None, ..., "", "..."):
            avisos.append(f"Revisión {i}: falta el caso_id.")
            continue
        from .pruebas import normalizar_id
        caso_id = normalizar_id(caso_id)
        fila = resultados[(resultados["caso_id"] == caso_id) & (resultados["etapa"] == "contenido")] if not resultados.empty else resultados
        if fila.empty:
            avisos.append(f"Revisión {i}: el caso {caso_id} no está en la tabla de resultados de contenido.")
            continue
        de_acuerdo = r.get("de_acuerdo")
        if not isinstance(de_acuerdo, bool):
            avisos.append(f"Revisión {i} ({caso_id}): escribe True si estás de acuerdo con el criterio, o False si no.")
            continue
        motivo = r.get("motivo")
        if motivo in (None, ..., "", "..."):
            avisos.append(f"Revisión {i} ({caso_id}): explica tu motivo en una frase.")
            continue
        f = fila.iloc[0]
        filas.append({
            "caso_id": caso_id, "obtenido": f["obtenido"], "dato real": datos_reales.get(caso_id, ""),
            "criterio automático": f["resultado"],
            "tu revisión": "de acuerdo" if de_acuerdo else "en desacuerdo", "motivo": motivo,
        })
    for a in avisos:
        print("  •", a)
    df = pd.DataFrame(filas)
    if df.empty:
        print("Todavía no hay revisiones completas. Llena la celda del Ejercicio 3 y vuelve a ejecutar.")
        return df
    display(df.style.hide(axis="index").map(_color_resultado, subset=["criterio automático"]).set_properties(
        **{"text-align": "left", "white-space": "pre-wrap"}))
    desacuerdos = int((df["tu revisión"] == "en desacuerdo").sum())
    print(f"Revisaste {len(df)} resultados. Estás en desacuerdo con el criterio en {desacuerdos}.")
    return df


def mostrar_consistencia(consistencia: pd.DataFrame) -> None:
    """Una fila por pregunta y una columna por intento, con ✓ o ✗, y los valores de pass^k y pass@k."""
    if consistencia is None or consistencia.empty:
        print("Todavía no hay repeticiones. Ejecuta primero la celda de la consistencia.")
        return
    tabla = consistencia.pivot_table(index="caso_id", columns="intento", values="resultado", aggfunc="first")
    tabla = tabla.reindex(list(dict.fromkeys(consistencia["caso_id"])))  # el orden en que elegiste las preguntas
    tabla = tabla.map(lambda v: "✓" if v == "pasa" else "✗")
    tabla.columns = [f"intento {c}" for c in tabla.columns]
    tabla["acierta siempre"] = tabla.apply(lambda f: "sí" if all(v == "✓" for v in f) else "no", axis=1)
    display(tabla.style.map(lambda v: f"background-color:{VERDE}" if v == "✓" else (f"background-color:{ROJO}" if v == "✗" else "")))
    m = pass_k(consistencia)
    display(HTML(_caja(
        "Consistencia",
        f"pass^{m['k']} = <b>{m['pass^k']:.2f}</b>: la proporción de preguntas que aciertan en los {m['k']} intentos.<br>"
        f"pass@{m['k']} = <b>{m['pass@k']:.2f}</b>: la proporción de preguntas que aciertan al menos una vez.",
    )))
