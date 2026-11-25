"""Valida registros de tickets con Pydantic y guarda los mensajes de error reales.

No llama a ningún modelo: los registros están escritos a mano para la demostración.
El esquema es el del ejemplo de la sesión 3: tickets de soporte de FotoNube, una app de fotos ficticia.

Uso: python validar_ticket.py   (escribe datos/validacion.json)
"""
import json
from pathlib import Path
from typing import Literal

import pydantic
from pydantic import BaseModel, ValidationError

SALIDA = Path(__file__).parent / "datos" / "validacion.json"


class Ticket(BaseModel):
    categoria: Literal["fallo de la app", "rendimiento", "interfaz", "cuenta y acceso", "solicitud de función"]
    prioridad: Literal["alta", "media", "baja"]
    plataforma: Literal["Android", "iOS", "web"]
    version_app: str | None = None
    resumen: str


BUENO = {
    "categoria": "fallo de la app",
    "prioridad": "alta",
    "plataforma": "Android",
    "version_app": "4.2.1",
    "resumen": "La app se cierra al subir fotos grandes desde la galería",
}

CASOS = [
    ("bueno", "El registro esperado", json.dumps(BUENO, ensure_ascii=False)),
    ("sin_prioridad", "Falta un campo obligatorio", json.dumps({k: v for k, v in BUENO.items() if k != "prioridad"}, ensure_ascii=False)),
    ("valor_no_permitido", "Un valor que no está permitido", json.dumps({**BUENO, "prioridad": "urgente"}, ensure_ascii=False)),
    ("tipo_equivocado", "Un tipo que no coincide", json.dumps({**BUENO, "version_app": 4.21}, ensure_ascii=False)),
    ("sin_version", "Un dato que el ticket no trae", json.dumps({**BUENO, "version_app": None}, ensure_ascii=False)),
    ("cortado", "Una respuesta cortada por el máximo de tokens", json.dumps(BUENO, ensure_ascii=False)[:-24]),
]


def main() -> None:
    resultados = []
    for clave, nombre, texto in CASOS:
        try:
            registro = Ticket.model_validate_json(texto)
            resultados.append({"id": clave, "nombre": nombre, "json": texto, "valido": True, "registro": registro.model_dump(), "errores": []})
        except ValidationError as e:
            errores = [{"campo": ".".join(str(x) for x in err["loc"]) or "(todo el JSON)", "tipo": err["type"], "mensaje": err["msg"]} for err in e.errors()]
            resultados.append({"id": clave, "nombre": nombre, "json": texto, "valido": False, "errores": errores, "texto_error": str(e)})
    datos = {"pydantic": pydantic.VERSION, "esquema": Ticket.model_json_schema(), "casos": resultados}
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Pydantic {pydantic.VERSION}. Escribí {SALIDA}")
    for r in resultados:
        print(f"- {r['nombre']}: {'válido' if r['valido'] else 'inválido'}")
        for err in r["errores"]:
            print(f"    {err['campo']}: {err['mensaje']} ({err['tipo']})")


if __name__ == "__main__":
    main()
