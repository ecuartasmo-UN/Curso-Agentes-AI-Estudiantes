# Laboratorio 3B: configurar un prompt

*Agentes de IA (aplicado) · Sesión 3 · Bloque 3.2*

En este laboratorio comparas cuatro variantes de un prompt sobre los mismos casos. Etiquetas los issues del repositorio de FotoNube, una app de fotos ficticia. Mides los aciertos, los tokens, el costo por mil aciertos, la latencia y la consistencia de cada variante. Todo pasa dentro del notebook: la teoría, el código, los ejercicios y tus análisis.

## Qué hay en esta carpeta

| Archivo o carpeta | Qué es |
|---|---|
| `lab_3B_configurar_un_prompt.ipynb` | El notebook del laboratorio. Es lo único que entregas |
| `curso_agentes/` | El módulo del curso: el modo grabado, las plantillas, las pruebas y las tablas |
| `datos/` | Los issues de FotoNube, las piezas de cada variante y el banco para casa |
| `grabaciones/` | Respuestas reales de cada modelo, para trabajar sin clave |
| `requirements.txt` | Las versiones exactas de los paquetes del curso |

## Cómo empezar en VS Code

1. Instala VS Code, Python 3.13 y las extensiones de Python y Jupyter. Si ya tienes el entorno del curso, salta al paso 4.
2. Abre una terminal en esta carpeta y crea el entorno virtual:
   - macOS y Linux: `python3 -m venv .venv` y luego `source .venv/bin/activate`
   - Windows: `py -m venv .venv` y luego `.venv\Scripts\activate`
3. Instala los paquetes: `pip install -r requirements.txt`. Son los mismos del Laboratorio 3A.
4. En VS Code, abre esta carpeta con «File > Open Folder».
5. Abre el notebook y elige el kernel del entorno en «Select Kernel», arriba a la derecha.
6. Ejecuta las celdas en orden, con Shift+Enter.

## Con clave o sin clave

- **Sin clave**, el notebook usa el modo grabado: respuestas reales guardadas, sin costo.
- **Con la clave del curso**, crea un archivo llamado `.env` en esta carpeta. Escribe una línea por cada clave que tengas:

  ```
  ANTHROPIC_API_KEY=tu-clave-de-anthropic
  GOOGLE_API_KEY=tu-clave-de-google
  ```

  El modelo por defecto es Claude Haiku 5.5. Si tu grupo eligió Gemini en la capa 1, cambia el modelo en la sección 1. En vivo, la clase completa son unas 150 llamadas, y la parte de casa, unas 110. El notebook nunca imprime las claves. No las escribas en el notebook, y no compartas el archivo `.env`.

## Si no puedes instalar nada: Google Colab

Colab sirve solo en modo grabado.
1. Entra a https://colab.research.google.com y abre el notebook con «Archivo > Subir notebook».
2. En el panel «Archivos», a la izquierda, sube el archivo `lab_3B_configurar_un_prompt.zip`: el mismo .zip del laboratorio que descargaste.
3. Ejecuta la celda de la sección 1. Descomprime el archivo y entra a su carpeta.
4. Al final, descarga el notebook con «Archivo > Descargar > Descargar .ipynb».

## Qué entregas

El notebook, ejecutado de principio a fin y guardado con sus salidas. Tu variante propia va en la sección 7. La sección 8 del notebook explica cómo guardarlo y cómo se califica.
