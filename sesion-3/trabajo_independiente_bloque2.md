# Trabajo independiente del bloque 3.2

**Agentes de IA (aplicado) · Sesión 3 · Bloque 2**

Después del bloque 3.2 tienes tres trabajos: el Laboratorio 3B, la capa 2 completa y la lectura del bloque 4.1. Suman unas 6.5 horas.

## Trabajo 1. Terminar el Laboratorio 3B (unas 1.5 horas, individual o en pareja, según defina el docente)

**Enunciado.** Termina en casa el Laboratorio 3B, que empezaste en clase. Después diseña una variante propia del prompt.
- Cambia una sola pieza respecto de las cuatro variantes del laboratorio, y explica por qué esperas que ayude.
- Con la clave del curso, pruébala en vivo. Sin clave, elige la combinación grabada más cercana.
- Compárala con las otras cuatro con las mismas medidas: aciertos, tokens, costo por acierto y latencia.

**Entregable.** El notebook del laboratorio, con tu variante y su comparación dentro. Guárdalo con sus salidas: el docente lo califica sin volver a ejecutarlo.

**Cuándo.** En la fecha que fije el docente. Los laboratorios de cada semana se entregan al inicio de la semana siguiente.

**Cómo se califica.** Cada laboratorio vale el 2.5 % de la calificación del curso. Se revisa con estos criterios:
- funciona según su criterio de éxito (40 %);
- las pruebas de funcionamiento y de robustez están completas y corridas (40 %);
- el análisis del laboratorio está al día (20 %).

## Trabajo 2. La capa 2, parte 2: conectar, probar y entregar (en grupo, unas 4 horas)

**Enunciado.** Conecten su agente por API y prueben las instrucciones que escribieron después del bloque 3.1.
- Conecten por API el modelo que eligieron en la capa 1, con la clave del curso y con su esquema.
- Validen el esquema en los diez casos: ¿cada respuesta cumple el esquema?
- Comparen los campos de cada caso con su registro esperado.
- Corran los tres casos de robustez. Para la respuesta mal formada, sirve un máximo de tokens de salida muy bajo.
- Registren cada prueba en la tabla de resultados de la sección 2, con sus tokens, su costo y su latencia.

**Cómo trabajar.**
- La clave del curso vive en un archivo `.env`. Nunca va en el código, ni en el chat de un asistente, ni se publica.
- Mientras desarrollan, graben las respuestas y trabajen con ellas, para no gastar crédito.
- Usen datos sintéticos o anonimizados. Revisen los que genere un LLM antes de usarlos.
- Escriban el código con apoyo de un asistente de código, siempre con sus pruebas. Pueden partir del código de los laboratorios 3A y 3B.
- Verifiquen que existe cada paquete que les recomiende un asistente antes de instalarlo.

**Entregable.** Un solo envío por grupo, con dos partes:
- la sección 2 de la ficha del agente, completa: el prompt de sistema, el esquema, los registros esperados, los casos de robustez y la tabla de resultados;
- el código de la capa, con sus resultados.

Usen la [ficha en Word](ficha_del_agente.docx) o la [ficha en Markdown](ficha_del_agente.md).

**Cuándo.** Al inicio del bloque 4.1, por el medio que indique el docente.

**Cómo se califica.** La capa 2 vale el 5 % de la calificación del curso. Se revisa con estos criterios:
- funciona según su criterio de éxito (40 %);
- las pruebas de funcionamiento y de robustez están completas y corridas (40 %);
- la ficha está al día (20 %).

## Trabajo 3. La lectura del bloque 4.1 (individual, unas 1 hora)

**Lectura.** Anthropic (Erik S. y Barry Zhang) (2024, 19 de diciembre). *Building effective agents*.
- Página: https://www.anthropic.com/engineering/building-effective-agents

Solo está en inglés. Tiene unas 2 650 palabras, con dos apéndices. Anthropic la actualizó después de publicarla: la lista de frameworks y algunos modelos de los ejemplos cambiaron.

**Preguntas guía para el club de lectura:**
1. **¿Flujo o agente?** Relee la sección «When (and when not) to use agents». ¿Qué paso de tu proyecto no puedes fijar de antemano en código? Si no hay ninguno, ¿por qué no te basta un flujo?
2. **¿Qué patrón y a qué precio?** Elige el patrón de la sección «Building blocks, workflows, and agents» que mejor describe tu proyecto. ¿Qué ganarías y qué pagarías en latencia y costo frente a una sola llamada?

**Entregable.** Lleva tus respuestas a la discusión del club de lectura del bloque 4.1. Pueden ser notas breves, de media página.

**Cómo se califica.** El club de lectura se califica por tu participación en la discusión. Las preguntas guía la preparan; no son un examen y no se entregan.

## Para profundizar (opcional)

- El [tutorial oficial de Python, en español](https://docs.python.org/es/3/tutorial/index.html). Para leer el código de los laboratorios bastan cuatro secciones: [listas](https://docs.python.org/es/3/tutorial/introduction.html#lists), [diccionarios](https://docs.python.org/es/3/tutorial/datastructures.html#dictionaries), [el ciclo for](https://docs.python.org/es/3/tutorial/controlflow.html#for-statements) y [funciones](https://docs.python.org/es/3/tutorial/controlflow.html#defining-functions).
- La documentación de Anthropic sobre el [esfuerzo de razonamiento](https://platform.claude.com/docs/en/build-with-claude/effort) y la de Google sobre el [razonamiento en Gemini](https://aistudio.google.com/docs/thinking?generate-content=true).
- Meincke et al. (2025), el [informe completo en arXiv](https://arxiv.org/abs/2506.07142), con sus tablas por modelo.
- Los programas de la sesión, para explorar en casa: [la conversación](programas/conversacion.html), [el tablero de una llamada](programas/tablero.html) y [leer un programa corto](programas/leer-programa.html). Ábrelos desde el índice de la sesión.
