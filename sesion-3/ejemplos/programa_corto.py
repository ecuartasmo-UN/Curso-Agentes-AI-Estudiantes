"""El programa de la diapositiva «Leer un programa corto» (bloque 3.2).

Arriba van las piezas que la diapositiva no muestra: los import, la instrucción y el esquema del bloque 3.1.
Abajo van las 12 líneas que la diapositiva lee una por una.
Para correrlo en vivo necesitas la clave del curso en un archivo .env. Sin clave, usa probar_programa.py.
"""
from typing import Literal

from langchain.chat_models import init_chat_model
from pydantic import BaseModel

INSTRUCCION = (
    "Lee el ticket de soporte de FotoNube, una app de fotos. Asígnale una categoría y una prioridad. "
    "Responde con los campos del esquema. Si un dato no está en el ticket, déjalo vacío."
)


class Ticket(BaseModel):
    categoria: Literal["fallo de la app", "rendimiento", "interfaz", "cuenta y acceso", "solicitud de función"]
    prioridad: Literal["alta", "media", "baja"]
    plataforma: Literal["Android", "iOS", "web"]
    version_app: str | None = None
    resumen: str


# ---------- Las 12 líneas de la diapositiva ----------
modelo = init_chat_model("anthropic:claude-haiku-5-5")
lector = modelo.with_structured_output(Ticket, method="json_schema", include_raw=True)
casos = [
    {"id": "T-01", "texto": "La app se cierra al subir una foto."},
    {"id": "T-02", "texto": "Quiero ordenar los álbumes por fecha."},
]
def clasificar(texto):
    return lector.invoke([("system", INSTRUCCION), ("user", texto)])
resultados = {}
for caso in casos:
    respuesta = clasificar(caso["texto"])
    resultados[caso["id"]] = respuesta["parsed"]
