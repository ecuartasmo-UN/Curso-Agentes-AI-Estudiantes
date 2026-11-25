# Programas de la sesión 3

Los programas son componentes de React que animan los dos bloques de la sesión. Siguen la forma de construir de la sesión 2: JSX compilado con esbuild a un solo archivo, sin módulos ES y sin internet.

## Qué hay en esta carpeta

| Archivo | Qué contiene |
|---|---|
| `src/principal.jsx` | Monta cada programa en su diapositiva y conecta sus pasos con reveal.js. |
| `src/comun.jsx` | Piezas comunes de la sesión 2: colores, medición de texto, partículas y la marca «Ilustrativo». |
| `src/datos.jsx` | Lee los JSON de `ejemplos/datos/`: tokens, mensajes de Pydantic y prompts de sistema. |
| `src/mapa.jsx` | El mapa de la sesión, del caso a la prueba, y su versión pequeña. |
| `src/prompt.jsx` | Lo que agrega la app, el orden del trabajo, armar un prompt (y el taller) y la demostración en vivo. |
| `src/json.jsx` | Del texto al registro, solo tokens válidos y el validador. |
| `src/api.jsx` | La conversación que se reenvía, el tablero de una llamada, la cuadrícula de variantes y la cuenta antes de correr. |
| `src/codigo.jsx` | Leer un programa corto y las pruebas de la capa 2. |
| `taller.html`, `validador.html`, `conversacion.html`, `leer-programa.html` y `tablero.html` | Cinco programas en su propia página, para explorar en casa. |
| `compilar.sh` | El comando que compila todo. |

## Cómo se compila

Necesitas Node.js 18 o posterior. Desde la carpeta de la sesión:

```sh
sh programas/compilar.sh
```

- `npx` descarga esbuild 0.28.2 (licencia MIT) a su caché, fuera del repositorio.
- El resultado es un solo archivo IIFE, sin módulos ES: `assets/js/programas.js`. Chrome bloquea los módulos al abrir archivos locales.
- Los programas usan React 18.3.1 como variable global. Sus builds UMD están en `assets/vendor/react-18.3.1/`.
- Los datos reales entran al archivo compilado desde `ejemplos/datos/*.json`.
- La demostración en vivo y el taller usan gpt-tokenizer 4.1.2, ya compilado en la sesión 2, en `assets/vendor/gpt-tokenizer-4.1.2/`.

## Cómo funcionan en las diapositivas

- Cada programa se monta en un `<div data-programa="nombre">`.
- `principal.jsx` agrega a la diapositiva un fragmento invisible por cada paso. El docente solo presiona la flecha; al retroceder, el paso se deshace.
- Los botones del validador sueltan el foco después de un clic, para que las flechas sigan avanzando las diapositivas.
- El cuadro de texto de la demostración en vivo detiene las teclas: mientras escribes, reveal.js no avanza.
- Los colores son variables del tema. El programa cambia con el botón de tema.
- Con movimiento reducido, sin 3D (`?sin3d=1`) o al imprimir, el programa muestra su estado final completo y no agrega pasos.
- `programas.js` debe cargarse antes de `deck.js`, que inicia reveal.js.

## Cómo se prueban

Abre cada presentación en Chrome y recorre cada paso. Prueba también `?tema=claro` y `?sin3d=1&movimiento=reducido`, y cada página de esta carpeta.

La consola no debe mostrar errores. Los programas no piden ningún archivo de internet.
