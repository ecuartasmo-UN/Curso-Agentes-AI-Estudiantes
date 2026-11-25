# Laboratorio 2B: elegir el modelo

*Agentes de IA (aplicado) · Sesión 2 · Bloque 2.2*

En este laboratorio comparas varios modelos en la misma tarea: clasificar los reportes de errores de FotoNube, una app de fotos ficticia. Mides la calidad, el costo por acierto y la latencia, y eliges un modelo. Todo pasa dentro del notebook: la teoría, el código, los ejercicios y tus análisis.

## Qué hay en esta carpeta

| Archivo o carpeta | Qué es |
|---|---|
| `lab_2B_elegir_modelo.ipynb` | El notebook del laboratorio. Es lo único que entregas |
| `curso_agentes/` | El módulo del curso: el modo grabado, las pruebas y las tablas |
| `datos/` | Los reportes de FotoNube y las dos instrucciones de la tarea |
| `grabaciones/` | Respuestas reales de cada modelo, para trabajar sin clave |
| `requirements.txt` | Las versiones exactas de los paquetes del curso |

## Cómo empezar en VS Code

1. Instala VS Code, Python 3.13 y las extensiones de Python y Jupyter. Si ya tienes el entorno del curso, salta al paso 4.
2. Abre una terminal en esta carpeta y crea el entorno virtual:
   - macOS y Linux: `python3 -m venv .venv` y luego `source .venv/bin/activate`
   - Windows: `py -m venv .venv` y luego `.venv\Scripts\activate`
3. Instala los paquetes: `pip install -r requirements.txt`
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

  Un modelo sin su clave va en modo grabado, y el notebook lo avisa. Claude Opus 5.5 va siempre en modo grabado. El notebook nunca imprime las claves. No las escribas en el notebook, y no compartas el archivo `.env`.

## Si no puedes instalar nada: Google Colab

Colab sirve solo en modo grabado.
1. Entra a https://colab.research.google.com y abre el notebook con «Archivo > Subir notebook».
2. En el panel «Archivos», a la izquierda, sube el archivo `lab_2B_elegir_modelo.zip`: el mismo .zip del laboratorio que descargaste.
3. Ejecuta la celda de la sección 1. Descomprime el archivo y entra a su carpeta.
4. Al final, descarga el notebook con «Archivo > Descargar > Descargar .ipynb».

## Qué entregas

El notebook, ejecutado de principio a fin y guardado con sus salidas. Tu recomendación de modelo va en la sección 8. La sección 9 del notebook explica cómo guardarlo y cómo se califica.
