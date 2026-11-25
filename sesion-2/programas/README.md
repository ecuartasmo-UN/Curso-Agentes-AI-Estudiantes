# Programas de la sesión 2

Los programas son componentes de React que animan los dos bloques de la sesión. En el bloque 2.1, cinco forman «El transformer por dentro». Los demás animan los tokens, los vectores, los pesos y la llamada por API. En el bloque 2.2 animan las capacidades, los límites, el costo y las pruebas de la capa 1.

## Qué hay en esta carpeta

| Archivo | Qué contiene |
|---|---|
| `src/principal.jsx` | Monta cada programa en su diapositiva y conecta sus pasos con reveal.js. |
| `src/comun.jsx` | Piezas comunes: colores, medición de texto, fichas de token y partículas. |
| `src/mapa.jsx` | El mapa del camino del texto a la respuesta y su versión pequeña. |
| `src/tokens.jsx` | Cortar y numerar, el BPE, español e inglés, y la demostración en vivo. |
| `src/vectores.jsx` | Buscar la fila y la nube 3D de palabras. |
| `src/atencion.jsx` | Programa 1: la atención. |
| `src/cabezas.jsx` | Programa 2: muchas cabezas. |
| `src/encoder.jsx` | Programa 3: el encoder. |
| `src/decoder.jsx` | Programa 4: el decoder. |
| `src/traduccion.jsx` | Programa 5: encoder y decoder juntos. |
| `src/pesos.jsx` | Los pesos: cuántos son, cuánto pesan, cómo se aprenden y del modelo base al asistente. |
| `src/llamada.jsx` | Una llamada por API. |
| `src/bloque2.jsx` | Bloque 2.2: razonar, adivinar, sesgos, la cuenta y el costo por acierto. También las pruebas de la capa y dónde están los pesos. |
| `src/bloque2b.jsx` | Bloque 2.2: plausible pero falso, la fecha de corte y los precios. |
| `src/datos_bloque2.jsx` | Las cifras del bloque 2.2, cada una con su fuente. |
| `atencion.html` y los otros cuatro | Los cinco programas del transformer, cada uno en su propia página. |
| `compilar.sh` | El comando que compila todo. |

## Cómo se compila

Necesitas Node.js 18 o posterior. Desde la carpeta de la sesión:

```sh
sh programas/compilar.sh            # los programas
sh programas/compilar.sh tokenizer  # también el tokenizer de la demostración en vivo
```

- `npx` descarga esbuild 0.28.2 (licencia MIT) a su caché, fuera del repositorio.
- El resultado es un solo archivo IIFE, sin módulos ES: `assets/js/programas.js`. Chrome bloquea los módulos al abrir archivos locales.
- Los programas usan React 18.3.1 como variable global. Sus builds UMD están en `assets/vendor/react-18.3.1/`. React 19 ya no publica builds UMD.
- Los datos reales entran al archivo compilado desde `ejemplos/datos/*.json`.
- La opción `tokenizer` empaqueta gpt-tokenizer 4.1.2 (licencia MIT) con la global `GPTTokenizer_o200k_base`. La versión 4 ya no publica builds UMD.

## Cómo funcionan en las diapositivas

- Cada programa se monta en un `<div data-programa="nombre">`.
- `principal.jsx` agrega a la diapositiva un fragmento invisible por cada paso. El docente solo presiona la flecha; al retroceder, el paso se deshace.
- Los controles propios no capturan las teclas de reveal. Después de un clic, el botón suelta el foco.
- Los colores son variables del tema. El programa cambia con el botón de tema.
- Con movimiento reducido, sin 3D (`?sin3d=1`) o al imprimir, el programa muestra su estado final completo y no agrega pasos.
- `programas.js` debe cargarse antes de `deck.js`, que inicia reveal.js.

## Cómo se prueban

Abre `bloque1_como_funciona_un_llm.html` en Chrome y recorre cada paso. Prueba también:
- `?tema=claro`;
- `?sin3d=1&movimiento=reducido`;
- cada página de `programas/`, con sus botones y con las flechas del teclado.

La consola no debe mostrar errores. Los programas no piden ningún archivo de internet.

## Dos detalles técnicos

- **El segmento 3D de la analogía.** Es un `div` que parte de un punto y se gira hacia el otro. Con `rotateY(θ)` y luego `rotateZ(φ)`, el ángulo θ es `atan2(−dz, dx)` y φ es `asin(dy / largo)`.
- **La nube 3D gira con JavaScript.** En el paso de la analogía, frena suave a 60°. En ese ángulo, las dos flechas se ven completas.
