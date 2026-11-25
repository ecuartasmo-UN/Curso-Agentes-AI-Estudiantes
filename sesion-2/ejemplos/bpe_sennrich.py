"""El ejemplo clásico de BPE (byte-pair encoding) de Sennrich, Haddow y Birch (2016).

Uso: python bpe_sennrich.py
Escribe datos/bpe.json con cada paso del algoritmo: los pares de símbolos vecinos con su
frecuencia, el par que se une y el vocabulario que queda.

El código sigue el Algoritmo 1 del artículo («Neural Machine Translation of Rare Words with
Subword Units», ACL 2016, https://aclanthology.org/P16-1162/), con su diccionario de ejemplo.
`</w>` marca el final de una palabra. Solo usa la biblioteca estándar de Python.
"""
import collections
import json
import re
from pathlib import Path

SALIDA = Path(__file__).parent / "datos" / "bpe.json"
VOCABULARIO = {"l o w </w>": 5, "l o w e r </w>": 2, "n e w e s t </w>": 6, "w i d e s t </w>": 3}
UNIONES = 10


def contar_pares(vocab):
    pares = collections.defaultdict(int)
    for palabra, frecuencia in vocab.items():
        simbolos = palabra.split()
        for i in range(len(simbolos) - 1):
            pares[simbolos[i], simbolos[i + 1]] += frecuencia
    return pares


def unir(par, vocab):
    patron = re.compile(r"(?<!\S)" + re.escape(" ".join(par)) + r"(?!\S)")
    return {patron.sub("".join(par), palabra): frecuencia for palabra, frecuencia in vocab.items()}


def main():
    vocab = dict(VOCABULARIO)
    pasos = []
    for numero in range(1, UNIONES + 1):
        pares = contar_pares(vocab)
        mejor = max(pares, key=pares.get)
        ordenados = sorted(pares.items(), key=lambda x: -x[1])
        pasos.append({
            "paso": numero,
            "pares": [{"par": list(p), "frecuencia": f} for p, f in ordenados],
            "union": list(mejor),
            "frecuencia": pares[mejor],
        })
        vocab = unir(mejor, vocab)
        pasos[-1]["vocabulario_despues"] = [{"palabra": w, "frecuencia": f} for w, f in vocab.items()]

    datos = {
        "fuente": "Sennrich, Haddow y Birch (2016), ACL, Algoritmo 1",
        "vocabulario_inicial": [{"palabra": w, "frecuencia": f} for w, f in VOCABULARIO.items()],
        "pasos": pasos,
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    print("Escrito", SALIDA)
    for p in pasos:
        print(p["paso"], p["union"], p["frecuencia"], "→", [v["palabra"] for v in p["vocabulario_despues"]])


if __name__ == "__main__":
    main()
