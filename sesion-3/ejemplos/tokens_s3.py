"""Cuenta los tokens de los textos de ejemplo de la sesión 3 con tiktoken y o200k_base.

Los textos son los del ejemplo de la sesión: tickets de soporte y issues de FotoNube, una app de fotos ficticia.
Cada API cuenta con su propio tokenizer. Estos conteos sirven para comparar piezas y variantes, no para facturar.

Uso: python tokens_s3.py   (escribe datos/tokens_s3.json)
"""
import json
from pathlib import Path

import tiktoken

ENC = tiktoken.get_encoding("o200k_base")
SALIDA = Path(__file__).parent / "datos" / "tokens_s3.json"

# Precios del Anexo G.1, en USD por millón de tokens (verificados el 24 de noviembre de 2026).
PRECIOS = {
    "claude-haiku-5-5": {"entrada": 0.10, "salida": 0.50},
    "gemini-2.5-flash-lite": {"entrada": 0.10, "salida": 0.40},
    "gemini-3.5-flash-lite": {"entrada": 0.30, "salida": 2.50},
}


def contar(texto: str) -> int:
    return len(ENC.encode(texto))


# ---------- Bloque 3.1: el mensaje de la app, el ticket, el registro y el prompt pieza por pieza ----------
MENSAJE_APP = "¿Por qué se cierra la app al subir una foto?"

TICKET = (
    "Desde ayer la app se cierra cada vez que subo una foto desde la galería. "
    "Uso un Pixel 8 con Android 15 y la versión 4.2.1. Con fotos pequeñas no pasa."
)

REGISTRO = {
    "categoria": "fallo de la app",
    "prioridad": "alta",
    "plataforma": "Android",
    "version_app": "4.2.1",
    "resumen": "La app se cierra al subir fotos grandes desde la galería",
}

PIEZAS = [
    {
        "id": "vaga",
        "nombre": "Instrucción vaga",
        "texto": "Clasifica este ticket.",
    },
    {
        "id": "clara",
        "nombre": "Instrucción clara",
        "texto": "Lee el ticket de soporte de FotoNube, una app de fotos. Asígnale una categoría y una prioridad.",
    },
    {
        "id": "contexto",
        "nombre": "Contexto",
        "texto": (
            "El equipo de soporte atiende primero la prioridad alta. "
            "Un fallo que impide usar una función principal es de prioridad alta. "
            "Las categorías son: fallo de la app, rendimiento, interfaz, cuenta y acceso, y solicitud de función."
        ),
    },
    {
        "id": "ejemplos",
        "nombre": "Tres ejemplos",
        "texto": (
            "<ejemplos>\n"
            "No puedo iniciar sesión desde el lunes. → cuenta y acceso, alta\n"
            "Sería útil ordenar los álbumes por fecha. → solicitud de función, baja\n"
            "La galería tarda diez segundos en abrir. → rendimiento, media\n"
            "</ejemplos>"
        ),
    },
    {
        "id": "formato",
        "nombre": "Formato de salida",
        "texto": (
            "Responde solo con un JSON con los campos categoria, prioridad, plataforma, version_app y resumen. "
            "Si un dato no está en el ticket, escribe null."
        ),
    },
]

# ---------- Bloque 3.2: la conversación que se reenvía ----------
SISTEMA_CHAT = "Eres el asistente del equipo de soporte de FotoNube. Respondes en español, en dos frases como máximo."
TURNOS = [
    ("user", "¿Qué hago si la app se cierra al subir una foto?"),
    ("assistant", "Pide la versión de la app y el modelo del teléfono. Con esos datos, busca si el fallo ya está reportado."),
    ("user", "El usuario tiene la versión 4.2.1 en Android 15."),
    ("assistant", "Ese fallo ya está reportado para la versión 4.2.1. Pídele que actualice a la 4.2.2, que lo corrige."),
    ("user", "¿Y si no puede actualizar todavía?"),
    ("assistant", "Sugiérele subir fotos más pequeñas mientras tanto. Registra el caso para avisarle cuando pueda actualizar."),
    ("user", "Gracias. ¿Cómo registro el caso?"),
    ("assistant", "Crea un ticket con la categoría fallo de la app y prioridad alta. Agrega la versión y el teléfono."),
]

# ---------- Bloque 3.2: las cuatro variantes del Laboratorio 3B (etiquetar issues del repositorio) ----------
ISSUE = "Al girar el teléfono, el botón de subir fotos queda fuera de la pantalla."
BASE_3B = "Etiqueta el issue del repositorio de FotoNube con una sola etiqueta: error, mejora, documentación o pregunta."
EJEMPLOS_3B = (
    "<ejemplos>\n"
    "La app se cierra al abrir un álbum vacío. → error\n"
    "Agregar un modo oscuro a la galería. → mejora\n"
    "El README no explica cómo correr las pruebas. → documentación\n"
    "</ejemplos>"
)
FORMATO_3B = "Responde solo con la etiqueta, en minúsculas y sin explicación."
COT_3B = "Antes de responder, razona paso a paso. Al final escribe: Etiqueta: <etiqueta>."

VARIANTES = [
    {"id": "sin_ejemplos", "nombre": "Sin ejemplos", "partes": [BASE_3B]},
    {"id": "tres_ejemplos", "nombre": "Con tres ejemplos", "partes": [BASE_3B, EJEMPLOS_3B]},
    {"id": "formato", "nombre": "Con formato explícito", "partes": [BASE_3B, FORMATO_3B]},
    {"id": "cadena", "nombre": "Con cadena de pensamiento", "partes": [BASE_3B, COT_3B]},
]


def main() -> None:
    datos = {
        "tokenizer": "o200k_base",
        "biblioteca": f"tiktoken {tiktoken.__version__}",
        "nota": "Conteos reales con o200k_base. Cada API cuenta con su propio tokenizer.",
        "precios_usd_millon": PRECIOS,
    }

    # El mensaje del usuario en la app de chat
    datos["mensaje_app"] = {"texto": MENSAJE_APP, "tokens": contar(MENSAJE_APP)}

    # Ticket y registro
    datos["ticket"] = {"texto": TICKET, "tokens": contar(TICKET)}
    registro_json = json.dumps(REGISTRO, ensure_ascii=False)
    datos["registro"] = {"campos": REGISTRO, "tokens": contar(registro_json)}

    # Armar un prompt: tokens de cada pieza y del prompt acumulado, con el ticket al final.
    acumulado = []
    pasos = []
    for i, pieza in enumerate(PIEZAS):
        partes = [pieza["texto"]] if i == 0 else [p["texto"] for p in PIEZAS[1 : i + 1]]
        prompt = "\n\n".join(partes + [f"<ticket>\n{TICKET}\n</ticket>"])
        acumulado.append(pieza["texto"])
        pasos.append({**pieza, "tokens_pieza": contar(pieza["texto"]), "tokens_prompt": contar(prompt)})
    datos["armar_prompt"] = pasos

    # Conversación: tokens de entrada de cada llamada (sistema más toda la historia hasta el turno).
    llamadas = []
    historia = []
    for i, (rol, texto) in enumerate(TURNOS):
        historia.append((rol, texto))
        if rol != "user":
            continue
        entrada = contar(SISTEMA_CHAT) + sum(contar(t) for _, t in historia)
        respuesta = TURNOS[i + 1][1] if i + 1 < len(TURNOS) else ""
        llamadas.append(
            {
                "turno": len(llamadas) + 1,
                "mensajes": len(historia) + 1,
                "tokens_entrada": entrada,
                "tokens_salida": contar(respuesta),
                "costo_por_mil_llamadas_haiku": round(
                    1000 * (entrada * PRECIOS["claude-haiku-5-5"]["entrada"] + contar(respuesta) * PRECIOS["claude-haiku-5-5"]["salida"]) / 1e6, 6
                ),
            }
        )
    datos["conversacion"] = {
        "sistema": {"texto": SISTEMA_CHAT, "tokens": contar(SISTEMA_CHAT)},
        "turnos": [{"rol": r, "texto": t, "tokens": contar(t)} for r, t in TURNOS],
        "llamadas": llamadas,
    }

    # Variantes del 3B: tokens del prompt de cada variante, con el issue incluido.
    variantes = []
    for v in VARIANTES:
        prompt = "\n\n".join(v["partes"] + [f"<issue>\n{ISSUE}\n</issue>"])
        variantes.append({"id": v["id"], "nombre": v["nombre"], "texto": prompt, "tokens_entrada": contar(prompt)})
    datos["variantes"] = {"issue": ISSUE, "lista": variantes}

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Escribí {SALIDA}")
    for p in pasos:
        print(f"  armar_prompt · {p['nombre']}: pieza {p['tokens_pieza']}, prompt {p['tokens_prompt']}")
    for ll in llamadas:
        print(f"  conversación · llamada {ll['turno']}: entrada {ll['tokens_entrada']}, salida {ll['tokens_salida']}")
    for v in variantes:
        print(f"  variante · {v['nombre']}: {v['tokens_entrada']} tokens de entrada")


if __name__ == "__main__":
    main()
