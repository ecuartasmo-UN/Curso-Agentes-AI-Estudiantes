"""Prueba sin clave el programa corto del bloque 3.2.

Usa la clase real de LangChain para Claude (ChatAnthropic) y simula solo la llamada a la API:
el método _generate devuelve textos JSON escritos a mano. Así se comprueba que las 12 líneas
corren con las versiones del curso, sin gastar crédito. Las respuestas no son de un modelo real.

Uso: python probar_programa.py
"""
import json
import runpy
from pathlib import Path
from unittest import mock

import langchain
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import AIMessage
from langchain_core.outputs import ChatGeneration, ChatResult

PROGRAMA = Path(__file__).parent / "programa_corto.py"

RESPUESTAS = iter([
    {"categoria": "fallo de la app", "prioridad": "alta", "plataforma": "Android", "version_app": None,
     "resumen": "La app se cierra al subir una foto"},
    {"categoria": "solicitud de función", "prioridad": "baja", "plataforma": "Android", "version_app": None,
     "resumen": "Ordenar los álbumes por fecha"},
])
LLAMADAS = []


def generar_simulado(self, messages, stop=None, run_manager=None, **kwargs):
    """Reemplaza la llamada HTTP: guarda lo que recibió y devuelve un JSON escrito a mano."""
    LLAMADAS.append({"mensajes": [type(m).__name__ for m in messages], "argumentos": sorted(kwargs)})
    texto = json.dumps(next(RESPUESTAS), ensure_ascii=False)
    return ChatResult(generations=[ChatGeneration(message=AIMessage(content=texto))])


def main() -> None:
    with mock.patch.object(ChatAnthropic, "_generate", generar_simulado):
        espacio = runpy.run_path(str(PROGRAMA))
    modelo, resultados = espacio["modelo"], espacio["resultados"]
    print(f"langchain {langchain.__version__} · {type(modelo).__name__} · {modelo.model}")
    for i, llamada in enumerate(LLAMADAS, 1):
        print(f"  llamada {i}: mensajes {llamada['mensajes']}, argumentos {llamada['argumentos']}")
    for clave, registro in resultados.items():
        print(f"  {clave}: {type(registro).__name__} · {registro.categoria} · {registro.prioridad} · versión {registro.version_app}")
    assert all(type(r).__name__ == "Ticket" for r in resultados.values()), "El programa no devolvió registros Ticket"
    print("El programa corrió completo y devolvió registros que cumplen el esquema.")


if __name__ == "__main__":
    main()
