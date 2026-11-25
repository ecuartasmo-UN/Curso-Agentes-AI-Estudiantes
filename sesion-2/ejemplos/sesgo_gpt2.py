"""El sesgo en los embeddings de GPT-2 pequeño, para el bloque 2.2 (límites).

Uso: python sesgo_gpt2.py RUTA/model.safetensors
Escribe datos/sesgo.json con la posición de unas profesiones sobre la dirección «she − he».

Método, inspirado en Bolukbasi et al. (2016):
- a cada vector se le resta el promedio de toda la tabla de embeddings (centrado);
- la dirección es el promedio de siete diferencias normalizadas: she − he, her − his, woman − man,
  girl − boy, mother − father, daughter − son y female − male;
- el puntaje de cada palabra es el coseno entre su vector y esa dirección;
- positivo: más cerca de «she»; negativo: más cerca de «he».
Bolukbasi et al. usaron word2vec de Google News y un análisis de componentes principales.
Aquí se usan los embeddings de entrada de GPT-2 pequeño. Requisitos: numpy, safetensors y tiktoken.
"""
import json
import sys
from pathlib import Path

import numpy as np
import tiktoken
from safetensors.numpy import load_file

SALIDA = Path(__file__).parent / "datos" / "sesgo.json"
PARES = [(" she", " he"), (" her", " his"), (" woman", " man"), (" girl", " boy"),
         (" mother", " father"), (" daughter", " son"), (" female", " male")]
PROFESIONES = {
    " nurse": "enfermería", " secretary": "secretaría", " dancer": "danza", " teacher": "docencia",
    " assistant": "asistencia", " designer": "diseño", " doctor": "medicina", " lawyer": "abogacía",
    " scientist": "ciencia", " manager": "gerencia", " developer": "desarrollo", " programmer": "programación",
    " engineer": "ingeniería", " architect": "arquitectura", " pilot": "piloto", " mechanic": "mecánica",
    " soldier": "ejército", " captain": "capitán",
}


def main(ruta):
    wte = load_file(ruta)["wte.weight"]
    enc = tiktoken.get_encoding("gpt2")
    media = wte.mean(axis=0)

    def vector(palabra):
        ids = enc.encode(palabra)
        assert len(ids) == 1, f"{palabra!r} no es un solo token de GPT-2"
        return wte[ids[0]] - media

    def unit(v):
        return v / np.linalg.norm(v)

    direccion = unit(np.mean([unit(vector(a) - vector(b)) for a, b in PARES], axis=0))
    filas = []
    for palabra, es in PROFESIONES.items():
        filas.append({"palabra": palabra.strip(), "es": es, "puntaje": round(float(unit(vector(palabra)) @ direccion), 3)})
    filas.sort(key=lambda f: f["puntaje"], reverse=True)

    # Referencias para el eje: dónde quedan «she» y «he».
    referencias = {p.strip(): round(float(unit(vector(p)) @ direccion), 3) for p in (" she", " he")}

    datos = {
        "fuente": "GPT-2 pequeño (openai-community/gpt2), embeddings de entrada (wte)",
        "metodo": "vectores centrados; coseno con el promedio normalizado de 7 diferencias: " + ", ".join(f"{x.strip()} − {y.strip()}" for x, y in PARES),
        "referencias": referencias,
        "profesiones": filas,
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    print("Escrito", SALIDA)
    for f in filas:
        print(f"{f['puntaje']:+.3f}  {f['palabra']}")
    print("referencias:", referencias)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Uso: python sesgo_gpt2.py RUTA/model.safetensors")
    main(sys.argv[1])
