# Ejemplos: de dónde salen los datos reales de la sesión 3

Cinco scripts de Python producen o comprueban los datos reales de las diapositivas. Los tres primeros escriben un JSON en `datos/`, y los programas leen esos JSON al compilarse.

| Script | Qué hace | Archivo |
|---|---|---|
| `tokens_s3.py` | Cuenta los tokens de los textos del ejemplo: las piezas del prompt, la conversación y las cuatro variantes | `datos/tokens_s3.json` |
| `prompt_sistema.py` | Cuenta los tokens de los prompts de sistema que Anthropic publica para sus apps de Claude. Solo guarda los conteos, no el texto | `datos/prompt_sistema.json` |
| `validar_ticket.py` | Valida registros buenos y rotos con Pydantic y guarda los mensajes de error reales | `datos/validacion.json` |
| `programa_corto.py` | El programa de 12 líneas que se lee en el bloque 3.2 | No escribe archivos |
| `probar_programa.py` | Prueba ese programa sin clave: usa la clase real de LangChain para Claude y simula solo la llamada | No escribe archivos |

Los textos son del ejemplo de la sesión: tickets de soporte e issues de FotoNube, una app de fotos ficticia. No traen datos personales.

## Cómo correrlos

Usa Python 3.11 o posterior, en un entorno virtual:

```sh
pip install tiktoken==0.14.0 pydantic==2.14.4 langchain==1.5.0 langchain-anthropic==1.7.10
python tokens_s3.py
python prompt_sistema.py      # necesita internet
python validar_ticket.py
python probar_programa.py
```

- `programa_corto.py` llama al modelo de verdad: necesita la clave del curso en un archivo `.env`. Los demás no usan ninguna clave.
- Después de correrlos, vuelve a compilar los programas: `sh programas/compilar.sh`.

## Qué números salieron (24 de noviembre de 2026)

- **El tokenizer:** o200k_base, con tiktoken 0.14.0. Cada API cuenta con su propio tokenizer: los conteos sirven para comparar, no para facturar.
- **Armar un prompt:** el prompt del ticket tiene 55 tokens con la instrucción vaga. Con las piezas sube a 74, 121, 177 y 209.
- **El mensaje de la app:** «¿Por qué se cierra la app al subir una foto?» tiene 12 tokens.
- **Los prompts de sistema de la app de Claude**, en su entrada más reciente:
  - Claude Haiku 3, del 12 de julio de 2024: 117 palabras y 155 tokens;
  - Claude Haiku 3.5, del 22 de octubre de 2024: 3 400 palabras y 4 166 tokens;
  - Claude Haiku 4.5, entrada del 9 de noviembre de 2026: 4 168 palabras y 5 318 tokens;
  - Claude Haiku 5.5, del 9 de noviembre de 2026: 4 785 palabras y 6 046 tokens.
- **La conversación de cuatro turnos:** las llamadas envían 39, 81, 125 y 155 tokens de entrada. Solo cuenta el texto de los mensajes; cada API agrega unos pocos tokens por mensaje.
- **Mil conversaciones de cuatro turnos** con Claude Haiku 5.5 cuestan USD 0.0935, con los precios del Anexo G.1.
- **Las cuatro variantes del 3B:** 46 tokens sin ejemplos, 94 con tres ejemplos, 61 con formato explícito y 69 con cadena de pensamiento.
- **Pydantic 2.14.4** da estos mensajes reales:
  - un campo que falta: `Field required`;
  - «urgente» en la prioridad: `Input should be 'alta', 'media' or 'baja'`;
  - un número en la versión: `Input should be a valid string`;
  - un JSON cortado: `Invalid JSON: EOF while parsing a string`.
- **El programa corto** corre completo con langchain 1.5.0 y langchain-anthropic 1.7.10. Con `method="json_schema"`, la clase de Claude envía el esquema en `output_config`.

## Qué no es real

- **Las respuestas de los modelos.** La clave de Anthropic del curso devolvió el error 401 al construir la sesión, y no había clave de Google. Por eso todas las respuestas que muestran las diapositivas son ilustrativas, y llevan esa marca.
- **Las probabilidades** de «Solo tokens válidos».
- **Los aciertos, las latencias y los tokens de salida** de las variantes, y los tokens de salida de «La cuenta antes de correr».
- **La proporción del razonamiento** en «El tablero de una llamada» y los resultados de la cuadrícula de pruebas de la capa 2.

Cada diapositiva marca lo que es ilustrativo.
