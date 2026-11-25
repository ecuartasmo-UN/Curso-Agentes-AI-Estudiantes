"""Datos reales de los pesos de GPT-2 pequeño para el bloque 2.1 (embeddings y pesos).

Uso: python gpt2_pesos.py RUTA/model.safetensors
El archivo de pesos (548 MB) se descarga aparte y queda fuera del repositorio:
  curl -L -o model.safetensors https://huggingface.co/openai-community/gpt2/resolve/main/model.safetensors

Escribe datos/gpt2.json con:
- el conteo de parámetros por pieza: embeddings, atención, feed-forward y normalización;
- la fila de la tabla de embeddings de un token, con sus primeros valores;
- las posiciones 3D de un grupo de palabras, con PCA sobre sus vectores de embedding;
- la analogía rey − hombre + mujer: las palabras más cercanas al resultado;
- un trozo de una matriz de pesos de atención, para pintarlo como cuadrícula;
- una esquina de la máscara causal que el archivo guarda en cada capa.

Requisitos: numpy, safetensors y tiktoken (para los números de token de GPT-2).
"""
import json
import sys
from pathlib import Path

import numpy as np
import tiktoken
from safetensors.numpy import load_file

SALIDA = Path(__file__).parent / "datos" / "gpt2.json"
TOKEN_FILA = " token"
# Palabras en inglés, porque el vocabulario de GPT-2 es casi todo inglés.
# Cada una es un solo token de GPT-2 (con el espacio inicial).
GRUPOS = {
    "lenguajes": [" Python", " Java", " Ruby", " Perl", " PHP"],
    "países": [" France", " Spain", " Italy", " Germany", " Japan"],
    "números": [" one", " two", " three", " four", " five"],
    "comida": [" bread", " cheese", " rice", " soup", " meat"],
    "personas": [" king", " queen", " man", " woman"],
}
# Traducción de cada palabra, solo para el rótulo de la diapositiva.
ESPANOL = {
    "France": "Francia", "Spain": "España", "Italy": "Italia", "Germany": "Alemania", "Japan": "Japón",
    "one": "uno", "two": "dos", "three": "tres", "four": "cuatro", "five": "cinco",
    "bread": "pan", "cheese": "queso", "rice": "arroz", "soup": "sopa", "meat": "carne",
    "king": "rey", "queen": "reina", "man": "hombre", "woman": "mujer",
}
# La analogía clásica de los vectores de palabras: rey − hombre + mujer.
ANALOGIA = (" king", " man", " woman")


def indice_id(enc, palabra):
    ids = enc.encode(palabra)
    assert len(ids) == 1, f"{palabra!r} no es un solo token de GPT-2"
    return ids[0]


def main(ruta):
    pesos = load_file(ruta)
    enc = tiktoken.get_encoding("gpt2")

    # Parámetros por pieza. Las máscaras causales (attn.bias de 4 dimensiones) no son parámetros.
    piezas = {"embeddings": 0, "atencion": 0, "feed_forward": 0, "normalizacion": 0}
    mascara = None
    for nombre, tensor in pesos.items():
        if nombre.endswith("attn.bias") and tensor.ndim == 4:
            if mascara is None:
                mascara = tensor[0, 0]
            continue
        if nombre.startswith(("wte", "wpe")):
            piezas["embeddings"] += tensor.size
        elif ".attn." in nombre:
            piezas["atencion"] += tensor.size
        elif ".mlp." in nombre:
            piezas["feed_forward"] += tensor.size
        else:
            piezas["normalizacion"] += tensor.size

    wte = pesos["wte.weight"]
    id_fila = enc.encode(TOKEN_FILA)
    assert len(id_fila) == 1, "El token de la fila debe ser uno solo"
    fila = wte[id_fila[0]]

    # PCA a 3 dimensiones sobre los vectores de las palabras de los grupos.
    palabras = []
    for grupo, lista in GRUPOS.items():
        for palabra in lista:
            ids = enc.encode(palabra)
            assert len(ids) == 1, f"{palabra!r} no es un solo token de GPT-2"
            palabras.append((palabra.strip(), grupo, ids[0]))
    matriz = np.stack([wte[i] for _, _, i in palabras])
    centrada = matriz - matriz.mean(axis=0)
    _, valores, componentes = np.linalg.svd(centrada, full_matrices=False)
    coords = centrada @ componentes[:3].T
    coords = coords / np.abs(coords).max()
    varianza = (valores ** 2) / (valores ** 2).sum()

    # Similitud media dentro de cada grupo y entre grupos (coseno), para saber si la nube separa bien.
    normal = matriz / np.linalg.norm(matriz, axis=1, keepdims=True)
    cos = normal @ normal.T
    grupos = [g for _, g, _ in palabras]
    dentro = np.mean([cos[i, j] for i in range(len(grupos)) for j in range(len(grupos)) if i != j and grupos[i] == grupos[j]])
    fuera = np.mean([cos[i, j] for i in range(len(grupos)) for j in range(len(grupos)) if grupos[i] != grupos[j]])

    # La analogía en las 768 dimensiones: la palabra más cercana, sin contar las tres de la pregunta.
    a, b, c = (enc.encode(t)[0] for t in ANALOGIA)
    consulta = wte[a] - wte[b] + wte[c]
    unitaria = wte / np.linalg.norm(wte, axis=1, keepdims=True)
    parecido = unitaria @ (consulta / np.linalg.norm(consulta))
    cercanas = [int(t) for t in np.argsort(-parecido)[:10] if int(t) not in (a, b, c)][:4]
    indice = {p: k for k, (p, _, _) in enumerate(palabras)}
    flecha_3d = coords[indice["queen"]] - coords[indice["king"]]
    flecha_3d_b = coords[indice["woman"]] - coords[indice["man"]]
    paralelas_3d = float(flecha_3d @ flecha_3d_b / np.linalg.norm(flecha_3d) / np.linalg.norm(flecha_3d_b))
    flecha = wte[indice_id(enc, " queen")] - wte[a]
    flecha_b = wte[c] - wte[b]
    paralelas_768 = float(flecha @ flecha_b / np.linalg.norm(flecha) / np.linalg.norm(flecha_b))

    atencion = pesos["h.0.attn.c_attn.weight"][:12, :24]

    datos = {
        "fuente": "GPT-2 pequeño (openai-community/gpt2 en Hugging Face), archivo model.safetensors",
        "archivo_bytes": Path(ruta).stat().st_size,
        "tipo": str(wte.dtype),
        "bytes_por_peso": int(wte.dtype.itemsize),
        "parametros_total": int(sum(piezas.values())),
        "parametros_por_pieza": {k: int(v) for k, v in piezas.items()},
        "capas": sum(1 for n in pesos if n.endswith(".ln_1.weight")),
        "tabla_embeddings": {"filas": int(wte.shape[0]), "columnas": int(wte.shape[1])},
        "fila": {
            "token": TOKEN_FILA,
            "id": int(id_fila[0]),
            "primeros_valores": [round(float(x), 3) for x in fila[:32]],
            "minimo": round(float(fila.min()), 3),
            "maximo": round(float(fila.max()), 3),
        },
        "espacio_3d": {
            "metodo": "PCA de los vectores de embedding (tabla wte) de las palabras de GRUPOS, normalizado a [-1, 1]",
            "varianza_explicada_3d": round(float(varianza[:3].sum()), 3),
            "coseno_medio_dentro_de_grupo": round(float(dentro), 3),
            "coseno_medio_entre_grupos": round(float(fuera), 3),
            "puntos": [
                {"palabra": p, "es": ESPANOL.get(p, p), "grupo": g, "id": int(i),
                 "x": round(float(q[0]), 3), "y": round(float(q[1]), 3), "z": round(float(q[2]), 3)}
                for (p, g, i), q in zip(palabras, coords)
            ],
        },
        "analogia": {
            "pregunta": "king - man + woman",
            "mas_cercanas": [enc.decode([t]).strip() for t in cercanas],
            "coseno_flechas_3d": round(paralelas_3d, 3),
            "coseno_flechas_768d": round(paralelas_768, 3),
        },
        "cuadricula_atencion_capa1": {
            "tensor": "h.0.attn.c_attn.weight[:12, :24]",
            "valores": [[round(float(x), 3) for x in fila_a] for fila_a in atencion],
        },
        "mascara_causal": {
            "tensor": "h.0.attn.bias (1 024 × 1 024 en el archivo); esquina de 8 × 8",
            "esquina": [[int(x) for x in f] for f in mascara[:8, :8]],
        },
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    print("Escrito", SALIDA)
    print("parámetros:", datos["parametros_total"], datos["parametros_por_pieza"])
    print("fila de", TOKEN_FILA, "id", id_fila[0], datos["fila"]["primeros_valores"][:6])
    print("analogía:", datos["analogia"])
    print("3D: varianza", datos["espacio_3d"]["varianza_explicada_3d"], "coseno dentro", datos["espacio_3d"]["coseno_medio_dentro_de_grupo"], "entre", datos["espacio_3d"]["coseno_medio_entre_grupos"])


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Uso: python gpt2_pesos.py RUTA/model.safetensors")
    main(sys.argv[1])
