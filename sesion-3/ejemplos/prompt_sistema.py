"""Cuenta los tokens de los prompts de sistema que Anthropic publica para sus apps de Claude.

Anthropic publica el prompt de sistema de claude.ai y de sus apps en sus notas de versión:
https://platform.claude.com/docs/en/release-notes/system-prompts
Publica una de las versiones en uso, la de los chats sin búsqueda web. Esas instrucciones no se aplican a la API.

El script descarga la página de cada modelo en Markdown, toma la entrada más reciente y cuenta sus palabras
y sus tokens con tiktoken y o200k_base. Solo guarda los conteos, no el texto.
Claude cuenta con su propio tokenizer: los conteos sirven para comparar tamaños, no para facturar.

Uso: python prompt_sistema.py   (escribe datos/prompt_sistema.json; necesita internet)
"""
import json
import re
import urllib.request
from datetime import date
from pathlib import Path

import tiktoken

ENC = tiktoken.get_encoding("o200k_base")
BASE = "https://platform.claude.com/docs/en/release-notes/system-prompts/{}.md"
MODELOS = ["claude-haiku-3", "claude-haiku-3-5", "claude-haiku-4-5", "claude-haiku-5-5"]
SALIDA = Path(__file__).parent / "datos" / "prompt_sistema.json"


def entrada_reciente(md: str) -> tuple[str, str]:
    """Devuelve la fecha y el texto de la primera entrada con fecha («## Month D, YYYY»)."""
    partes = re.split(r"^## ([A-Z][a-z]+ \d{1,2}, \d{4})\s*$", md, flags=re.M)
    if len(partes) < 3:
        raise ValueError("No encontré entradas con fecha")
    return partes[1], partes[2]


def main() -> None:
    resultados = []
    for modelo in MODELOS:
        url = BASE.format(modelo)
        pedido = urllib.request.Request(url, headers={"User-Agent": "curso-agentes-ejemplos/1.0"})
        md = urllib.request.urlopen(pedido, timeout=60).read().decode("utf-8")
        fecha, texto = entrada_reciente(md)
        resultados.append({"modelo": modelo, "fecha": fecha, "url": url.removesuffix(".md"),
                           "palabras": len(texto.split()), "tokens_o200k": len(ENC.encode(texto))})
        print(f"{modelo} ({fecha}): {resultados[-1]['palabras']} palabras, {resultados[-1]['tokens_o200k']} tokens")
    datos = {"consulta": date.today().isoformat(), "tokenizer": "o200k_base", "biblioteca": f"tiktoken {tiktoken.__version__}",
             "nota": "Entrada más reciente de cada página. Solo se guardan los conteos.", "modelos": resultados}
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Escribí {SALIDA}")


if __name__ == "__main__":
    main()
