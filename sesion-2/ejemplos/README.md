# Ejemplos: de dónde salen los datos reales del bloque 2.1

Cuatro scripts de Python producen los datos reales de las diapositivas. Cada uno escribe un JSON en `datos/`, y los programas leen esos JSON al compilarse.

| Script | Qué calcula | Archivo |
|---|---|---|
| `tokens.py` | Vocabularios, la frase en tokens, el conteo del artículo de Lee y Trott y las frases de la demostración | `datos/tokens.json` |
| `bpe_sennrich.py` | Las diez uniones del Algoritmo 1 de Sennrich et al. (2016), paso por paso | `datos/bpe.json` |
| `gpt2_pesos.py` | De GPT-2 pequeño: parámetros por pieza, una fila de embeddings, la nube 3D, la analogía, pesos y la máscara | `datos/gpt2.json` |
| `sesgo_gpt2.py` | Bloque 2.2: dónde caen 18 profesiones sobre la dirección she − he de GPT-2 | `datos/sesgo.json` |

## Cómo correrlos

Usa Python 3.11 o posterior, en un entorno virtual:

```sh
pip install tiktoken==0.14.0 numpy safetensors
python tokens.py
python bpe_sennrich.py
curl -L -o model.safetensors https://huggingface.co/openai-community/gpt2/resolve/main/model.safetensors
python gpt2_pesos.py model.safetensors
python sesgo_gpt2.py model.safetensors
```

- `tokens.py` descarga las dos versiones del artículo de Lee y Trott. Solo guarda los conteos, no el texto.
- El archivo de pesos de GPT-2 pesa 548 MB. Descárgalo fuera del repositorio y no lo subas.
- Después de correrlos, vuelve a compilar los programas: `sh programas/compilar.sh`.

## Qué números salieron (23 de noviembre de 2026)

- **o200k_base** (tokenizer de GPT-4o y GPT-5): 200 000 tokens definidos. Su número más alto es el 200 018.
- **cl100k_base**: 100 261 tokens definidos. **GPT-2**: 50 257.
- **La frase** «Los desarrolladores documentaron la tokenización del modelo.»: 7 palabras y 11 tokens con o200k_base. En inglés, 9 tokens.
- **El artículo de Lee y Trott**, desde su primer párrafo: 10 199 tokens en español y 7 858 en inglés con o200k_base (30 % más). Con GPT-2: 16 194 y 8 421 (92 % más).
- **GPT-2 pequeño**: 124 439 808 parámetros. Embeddings: 39 383 808. Atención: 28 348 416. Feed-forward: 56 669 184. Normalización: 38 400.
- **El archivo de GPT-2** también guarda 12 máscaras causales de 1 024 × 1 024. No son parámetros: por eso el contador de Hugging Face muestra 137 022 720.
- **La salida de GPT-2** reutiliza la tabla de embeddings: el archivo no trae otra tabla para la salida.
- **La nube 3D**: PCA de 24 palabras en cinco grupos. Conserva el 39 % de la variación.
- **La analogía** king − man + woman: la palabra más cercana es queen, sin contar las tres de la pregunta.
- **Las flechas de la analogía** son casi paralelas en la vista 3D (coseno 0.94). En las 768 dimensiones, su coseno es 0.42.

- **El sesgo en GPT-2**: con los vectores centrados, nurse (+0.21), dancer (+0.18) y secretary (+0.10) quedan del lado de she. Architect (−0.08), captain (−0.08) y engineer (−0.05), del lado de he. Como referencia, she da +0.36 y he da −0.31.

## Qué no es real

Son ilustrativos los porcentajes de atención, los patrones de las cabezas y las probabilidades de los candidatos. También los cambios de la cuadrícula de pesos. Cada diapositiva lo marca.
