"""La comprobación de la entrega y el costo de la corrida."""
import html
from datetime import date

import pandas as pd
from IPython.display import HTML, display

from .formato import miles
from .pruebas import _vacio, normalizar_id

# Supuesto del Anexo G.1: 50 llamadas de 2 000 tokens de entrada y 500 de salida con Claude Haiku 5.5.
COSTO_ESTIMADO_G1 = 0.0225
ESTILO_CAJA = "border:1px solid rgba(128,128,128,0.45);border-radius:8px;padding:10px 14px;margin:6px 0;color:inherit"


def costo_de_la_corrida(*tablas: pd.DataFrame) -> dict:
    """Suma las llamadas, los tokens y el costo de todas las tablas de resultados de la corrida."""
    validas = [t for t in tablas if t is not None and not t.empty]
    if not validas:
        print("Todavía no hay llamadas registradas.")
        return {}
    df = pd.concat(validas, ignore_index=True)
    llamadas = df[df["tokens_entrada"] > 0]
    total = {
        "llamadas": int(len(llamadas)),
        "tokens_entrada": int(llamadas["tokens_entrada"].sum()),
        "tokens_salida": int(llamadas["tokens_salida"].sum()),
        "costo_usd": float(llamadas["costo_usd"].sum()),
        "latencia_media_s": float(llamadas["latencia_s"].mean()) if len(llamadas) else 0.0,
    }
    proporcion = 100 * total["costo_usd"] / COSTO_ESTIMADO_G1
    display(HTML(
        f'<div style="{ESTILO_CAJA}"><b>Tu corrida</b>: {total["llamadas"]} llamadas, '
        f'{miles(total["tokens_entrada"])} tokens de entrada y {miles(total["tokens_salida"])} de salida.<br>'
        f'Costo: <b>USD {total["costo_usd"]:.4f}</b>, el {proporcion:.0f} % del estimado del curso '
        f'por laboratorio (USD {COSTO_ESTIMADO_G1}).<br>'
        f'Latencia media: {total["latencia_media_s"]:.2f} s por llamada.</div>'
    ))
    return total


MARCAS = {"listo": "✅ listo", "revisa": "⚠️ revisa", "falta": "❌ falta"}


def _linea(estado: str, texto: str) -> str:
    return f"<li>{MARCAS[estado]}: {html.escape(texto)}</li>"


def _tuyas(casos) -> list[dict]:
    return [c for c in (casos or []) if isinstance(c, dict) and c.get("origen") == "tuya"]


def _filas(df, etapa=None, ids=None) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame()
    if etapa:
        df = df[df["etapa"] == etapa]
    if ids is not None:
        df = df[df["caso_id"].isin(list(ids))]
    return df


def _pendientes(casos) -> list[str]:
    """Los casos con una pista sin resolver: un tipo distinto del de referencia o un esperado dudoso."""
    return [c["caso_id"] for c in _tuyas(casos) if c.get("pendientes")]


def comprobar_entrega(datos_entrega=None, config=None, casos_clase=None, resultados_llamada=None, resultados=None,
                      preguntas_consistencia=None, consistencia=None, revision=None, casos_casa=None,
                      resultados_casa=None, declaracion_ia=None) -> bool:
    """Revisa que la entrega esté completa. Orienta: no califica.

    Cada parte queda «listo», «revisa» (está, pero tiene algo por revisar) o «falta».
    """
    estados, textos = [], []

    def revisar(estado: str, texto: str):
        estados.append(estado)
        textos.append(texto)

    nombres = datos_entrega.get("nombres") if isinstance(datos_entrega, dict) else None
    revisar("listo" if not _vacio(nombres) else "falta", "tu nombre en «Datos de la entrega»")

    tuyas = _tuyas(casos_clase)
    if len(tuyas) >= 4 and len({c["tipo"] for c in tuyas}) == 4:
        pend = _pendientes(casos_clase)
        if pend:
            revisar("revisa", "ejercicio 1: quedan pistas sin resolver en " + ", ".join(pend) + ". Míralas en la sección 5.1")
        else:
            revisar("listo", "ejercicio 1: cuatro preguntas tuyas, una de cada tipo")
    else:
        revisar("falta", "ejercicio 1: cuatro preguntas tuyas, una de cada tipo")

    llamada = _filas(resultados_llamada, ids=["R-VACIA", "R-VACIA-API", "R-LARGA"])
    revisar("listo" if len(llamada) == 3 else "falta",
            "las pruebas de robustez de la llamada: la pregunta vacía y la muy larga")

    ids_clase = [c["caso_id"] for c in (casos_clase or []) if isinstance(c, dict)]
    contenido = _filas(resultados, etapa="contenido", ids=ids_clase)
    revisar("listo" if len(ids_clase) >= 16 and len(contenido) == len(ids_clase) else "falta",
            "la prueba de contenido, con las doce preguntas base y las tuyas")

    elegidas = [normalizar_id(p) for p in (preguntas_consistencia or []) if not _vacio(p)]
    corridas = _filas(consistencia, ids=elegidas)
    n_corridas = 0 if corridas.empty else corridas["caso_id"].nunique()
    tipo_de = {c["caso_id"]: c.get("tipo") for c in (casos_clase or []) if isinstance(c, dict)}
    if len(set(elegidas)) != 3 or n_corridas != 3:
        revisar("falta", "ejercicio 2: tres preguntas de tu lista, repetidas cinco veces, con su pass^k")
    elif len({tipo_de.get(e) for e in elegidas}) < 3:
        revisar("revisa", "ejercicio 2: las tres preguntas deben ser de tipos distintos")
    else:
        revisar("listo", "ejercicio 2: tres preguntas de tipos distintos, con su pass^k")

    revisadas = [r for r in (revision or []) if isinstance(r, dict) and isinstance(r.get("de_acuerdo"), bool)
                 and not _vacio(r.get("motivo"))]
    revisar("listo" if len(revisadas) >= 3 else "falta",
            "ejercicio 3: tres resultados revisados, cada uno con True o False y su motivo")

    casa = _tuyas(casos_casa)
    ids_casa = [c["caso_id"] for c in casa]
    if len(casa) >= 5 and len(_filas(resultados_casa, etapa="contenido", ids=ids_casa)) >= 5:
        pend = _pendientes(casos_casa)
        if len({c["tipo"] for c in casa}) < 3:
            revisar("revisa", "ejercicio 4: tus cinco preguntas deben usar al menos tres tipos")
        elif pend:
            revisar("revisa", "ejercicio 4: quedan pistas sin resolver en " + ", ".join(pend) + ". Míralas en la sección 8.1")
        else:
            revisar("listo", "ejercicio 4: tus cinco preguntas, con al menos tres tipos y su tabla de resultados")
    else:
        revisar("falta", "ejercicio 4: tus cinco preguntas para casa, con su tabla de resultados")

    usaste = declaracion_ia.get("usaste_asistentes") if isinstance(declaracion_ia, dict) else None
    if not isinstance(usaste, bool):
        revisar("falta", "la declaración de uso de IA: en «usaste_asistentes» escribe True o False, sin comillas")
    elif usaste and _vacio(declaracion_ia.get("cuales_y_para_que")):
        revisar("falta", "la declaración de uso de IA: escribe cuáles asistentes usaste y para qué")
    else:
        revisar("listo", "la declaración de uso de asistentes de IA")

    return mostrar_comprobacion(list(zip(estados, textos)), config)


def mostrar_comprobacion(partes: list[tuple[str, str]], config, modelo: str | None = None,
                         celdas_texto: str = "cada «Tu análisis» y la sección «Tu proyecto»") -> bool:
    """Muestra la lista de la comprobación: cada parte con «listo», «revisa» o «falta»."""
    estados = [e for e, _ in partes]
    modo = getattr(config, "modo", "(sin configurar)")
    modelo = modelo or f"modelo {getattr(config, 'nombre_modelo', '(sin configurar)')}"
    if "falta" in estados:
        pie = "Completa lo que falta y vuelve a ejecutar esta celda."
    elif "revisa" in estados:
        pie = "Está completo, pero hay partes por revisar. Revísalas, vuelve a ejecutar y luego entrega."
    else:
        pie = "Todo listo. Revisa tus análisis, guarda el notebook con sus salidas y entrégalo."
    display(HTML(
        f'<div style="{ESTILO_CAJA}"><b>Comprobación de la entrega</b> · modo {html.escape(str(modo))} · '
        f'{html.escape(str(modelo))} · {date.today().isoformat()}'
        f"<ul style='margin:6px 0'>{''.join(_linea(e, t) for e, t in partes)}</ul>"
        f"<div>Esta celda no puede leer las celdas de texto. Revisa tú que escribiste {html.escape(celdas_texto)}.</div>"
        f"<div style='margin-top:6px'><b>{html.escape(pie)}</b></div></div>"
    ))
    return all(e == "listo" for e in estados)
