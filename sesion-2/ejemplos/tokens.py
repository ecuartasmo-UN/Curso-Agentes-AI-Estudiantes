"""Datos reales de tokens para el bloque 2.1 (diapositivas de tokens y tokenizer).

Uso: python tokens.py
Escribe datos/tokens.json con:
- el tamaño del vocabulario de tres tokenizers abiertos (o200k_base, cl100k_base y el de GPT-2):
  n_vocab (el número más alto más uno) y los tokens definidos, con los especiales;
- unas frases cortadas en tokens para la demostración en vivo, por si el navegador no carga el tokenizer;
- la frase de ejemplo cortada en tokens, con sus números (o200k_base y GPT-2);
- el conteo de tokens del mismo texto en español y en inglés: la frase de ejemplo y el artículo
  completo de Lee y Trott (2023), en su original y en su traducción autorizada.

Requisitos: tiktoken (licencia MIT). Los artículos se descargan al correr el script;
solo se guardan los conteos, no el texto.
"""
import datetime
import html
import json
import re
import urllib.request
from pathlib import Path

import tiktoken

SALIDA = Path(__file__).parent / "datos" / "tokens.json"
FRASE_ES = "Los desarrolladores documentaron la tokenización del modelo."
FRASE_EN = "The developers documented the model's tokenization."
# Frases de respaldo para la demostración en vivo, por si el tokenizer del navegador no carga.
DEMO = [
    "Los desarrolladores documentaron la tokenización del modelo.",
    "The developers documented the model's tokenization.",
    "¿Qué cambió en LangChain 1.5.0?",
    "La app se cierra al subir una foto en Android 15.",
    "def suma(a, b): return a + b",
    "El agente clasifica el reporte.",
]
ARTICULOS = {
    "es": "https://www.understandingai.org/p/grandes-modelos-de-lenguaje-llm-una",
    "en": "https://www.understandingai.org/p/large-language-models-explained-with",
}


def cortar(enc, texto):
    ids = enc.encode(texto)
    return [{"texto": enc.decode([i]), "id": i} for i in ids]


def cuerpo_articulo(url):
    """Devuelve los párrafos del cuerpo del artículo (div.available-content), sin el aviso inicial."""
    pedido = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (material educativo)"})
    fuente = urllib.request.urlopen(pedido, timeout=60).read().decode("utf-8")
    inicio = fuente.find('class="available-content"')
    if inicio < 0:
        raise RuntimeError(f"No encontré el cuerpo del artículo en {url}")
    fuente = fuente[inicio:]
    fin = fuente.find('class="post-footer')
    if fin > 0:
        fuente = fuente[:fin]
    parrafos = []
    for p in re.findall(r"<p[^>]*>(.*?)</p>", fuente, flags=re.S):
        texto = html.unescape(re.sub(r"<[^>]+>", "", p)).strip()
        if texto:
            parrafos.append(texto)
    return parrafos


def main():
    o200k = tiktoken.get_encoding("o200k_base")
    cl100k = tiktoken.get_encoding("cl100k_base")
    gpt2 = tiktoken.get_encoding("gpt2")

    datos = {
        "fecha": datetime.date.today().isoformat(),
        "fuente": "tiktoken " + tiktoken.__version__ + " (OpenAI, licencia MIT)",
        "vocabulario": {"o200k_base": o200k.n_vocab, "cl100k_base": cl100k.n_vocab, "gpt2": gpt2.n_vocab},
        "frase": {
            "es": FRASE_ES,
            "en": FRASE_EN,
            "palabras_es": len(FRASE_ES.split()),
            "palabras_en": len(FRASE_EN.split()),
            "o200k_base_es": cortar(o200k, FRASE_ES),
            "o200k_base_en": cortar(o200k, FRASE_EN),
            "gpt2_es": cortar(gpt2, FRASE_ES),
            "gpt2_en": cortar(gpt2, FRASE_EN),
        },
        "articulo": {},
        "demo": [{"texto": t, "tokens": cortar(o200k, t)} for t in DEMO],
        "tokens_definidos": {
            "o200k_base": len(o200k._mergeable_ranks) + len(o200k._special_tokens),
            "cl100k_base": len(cl100k._mergeable_ranks) + len(cl100k._special_tokens),
            "gpt2": len(gpt2._mergeable_ranks) + len(gpt2._special_tokens),
        },
    }

    for idioma, url in ARTICULOS.items():
        parrafos = cuerpo_articulo(url)
        # Las dos versiones abren con avisos distintos: el del autor en inglés y el de los traductores
        # en español. Se cuenta desde el primer párrafo del artículo, que es el mismo en las dos.
        inicio = "Cuando ChatGPT" if idioma == "es" else "When ChatGPT"
        parrafos = parrafos[next(i for i, p in enumerate(parrafos) if p.startswith(inicio)):]
        texto = "\n".join(parrafos)
        datos["articulo"][idioma] = {
            "url": url,
            "parrafos": len(parrafos),
            "palabras": len(texto.split()),
            "tokens_o200k_base": len(o200k.encode(texto)),
            "tokens_gpt2": len(gpt2.encode(texto)),
        }

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    print("Escrito", SALIDA)
    for idioma, a in datos["articulo"].items():
        print(idioma, a)


if __name__ == "__main__":
    main()
