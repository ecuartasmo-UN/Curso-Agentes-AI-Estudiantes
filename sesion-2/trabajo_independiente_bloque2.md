# Trabajo independiente del bloque 2.2

**Agentes de IA (aplicado) · Sesión 2 · Bloque 2**

Después del bloque 2.2 tienes tres trabajos: el Laboratorio 2B, la capa 1 completa y la lectura del bloque 3.1. Suman unas 6.5 horas.

## Trabajo 1. Terminar el Laboratorio 2B (unas 1.5 horas, individual o en pareja, según defina el docente)

**Enunciado.** Termina en casa el Laboratorio 2B, que empezaste en clase. Después escribe una recomendación de modelo para un caso de uso.
- Elige un caso de uso del mundo tech. Por ejemplo, clasificar los reportes de errores de una app.
- Recomienda un modelo y explica tu razón con tres criterios: calidad, costo y tratamiento de los datos.
- Usa las cifras que mediste en el laboratorio: tasa de éxito, costo por acierto y latencia.

**Entregable.** El notebook del laboratorio, con tu recomendación en la sección 8, «Para casa: tu recomendación». La recomendación ocupa media página como máximo.

**Cuándo.** En la fecha que fije el docente. Los laboratorios de cada semana se entregan al inicio de la semana siguiente.

**Cómo se califica.** Cada laboratorio vale el 2.5 % de la calificación del curso. Se revisa con estos criterios:
- funciona según su criterio de éxito (40 %);
- las pruebas de funcionamiento y de robustez están completas y corridas (40 %);
- el análisis del laboratorio está al día (20 %).

## Trabajo 2. La capa 1, parte 2: correr, medir y elegir (en grupo, unas 4 horas)

**Enunciado.** Prueben el modelo de su proyecto con los casos que escribieron después del bloque 2.1.
- Corran los diez casos en dos modelos, con la clave del curso.
- Corran los tres casos de robustez en los mismos dos modelos.
- Repitan tres casos tres veces cada uno, para medir la consistencia (pass^k).
- Registren cada prueba en la tabla de resultados: tokens, costo y latencia.
- Elijan el modelo del proyecto con cuatro criterios: la calidad en los diez casos, el costo por acierto, la latencia y el tratamiento de los datos.

**Cómo trabajar.**
- La clave del curso vive en un archivo `.env`. Nunca va en el código ni se publica.
- Mientras desarrollan, graben las respuestas y trabajen con ellas, para no gastar crédito.
- Usen datos sintéticos o anonimizados. Revisen los que genere un LLM antes de usarlos.

**Entregable.** La sección 1 de la ficha del agente, completa. Usen el formato de Word ([ficha_del_agente.docx](ficha_del_agente.docx)) o el de Markdown ([ficha_del_agente.md](ficha_del_agente.md)). Debe traer:
- el modelo elegido, su razón y los modelos comparados;
- los diez casos y los tres de robustez;
- la tabla de resultados, con la consistencia y el costo por caso.

**Cuándo.** Al inicio del bloque 3.1, por el medio que indique el docente. Un solo archivo por grupo.

**Cómo se califica.** La capa 1 vale el 5 % de la calificación del curso. Se revisa con estos criterios:
- funciona según su criterio de éxito (40 %);
- las pruebas de funcionamiento y de robustez están completas y corridas (40 %);
- la ficha está al día (20 %).

## Trabajo 3. La lectura del bloque 3.1 (individual, unas 1 hora)

**Lectura.** Meincke, L., Mollick, E., Mollick, L. y Shapiro, D. (2025, 8 de junio). *Prompting Science Report 2: The Decreasing Value of Chain of Thought in Prompting*. Wharton Generative AI Labs.
- Página del informe: https://gail.wharton.upenn.edu/research-and-insights/tech-report-chain-of-thought/
- El mismo informe en arXiv: https://arxiv.org/abs/2506.07142

Solo está en inglés. Tiene 19 páginas, pero el cuerpo ocupa unas 8. El resto son referencias y material suplementario.

**Preguntas guía para el club de lectura:**
1. **¿Cómo sabes si un prompt funciona?** El informe mide el éxito de varias maneras: acertar 25 de 25 veces, 23 de 25 o la mayoría. ¿Por qué no basta con el promedio de aciertos? ¿Qué medida usarías para decidir si tu agente está listo? Apóyate en la sección «How we Benchmark the AI».
2. **¿Pensar paso a paso vale lo que cuesta?** Los autores pidieron a varios modelos razonar paso a paso antes de responder. Compararon los aciertos, el tiempo y los tokens. ¿Qué medirías en tus propios casos antes de pedirle a tu agente que razone? Apóyate en la discusión y en las limitaciones que reconocen los autores.

**Entregable.** Lleva tus respuestas a la discusión del club de lectura del bloque 3.1. Pueden ser notas breves, de media página.

**Cómo se califica.** El club de lectura se califica por tu participación en la discusión. Las preguntas guía la preparan; no son un examen y no se entregan.
