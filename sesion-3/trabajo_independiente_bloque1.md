# Trabajo independiente del bloque 3.1

**Agentes de IA (aplicado) · Sesión 3 · Bloque 1**

Después del bloque 3.1 tienes tres trabajos: el Laboratorio 3A, la capa 2 parte 1 y la lectura del bloque 3.2. Suman unas 6.5 horas.

## Trabajo 1. Terminar el Laboratorio 3A (unas 1.5 horas, individual o en pareja, según defina el docente)

**Enunciado.** Termina en casa el Laboratorio 3A, que empezaste en clase. Después amplía el esquema del laboratorio.
- Agrega dos campos al esquema. Para cada uno, define su nombre, su tipo y si es obligatorio.
- Escribe dos casos límite: textos que queden en el borde de una regla del esquema. Por ejemplo, un ticket que no dice la plataforma.
- Corre las pruebas otra vez y revisa qué cambió en las salidas válidas y en los campos correctos.

**Entregable.** El notebook del laboratorio, con los dos campos y los dos casos límite dentro. Guárdalo con sus salidas: el docente lo califica sin volver a ejecutarlo.

**Cuándo.** En la fecha que fije el docente. Los laboratorios de cada semana se entregan al inicio de la semana siguiente.

**Cómo se califica.** Cada laboratorio vale el 2.5 % de la calificación del curso. Se revisa con estos criterios:
- funciona según su criterio de éxito (40 %);
- las pruebas de funcionamiento y de robustez están completas y corridas (40 %);
- el análisis del laboratorio está al día (20 %).

## Trabajo 2. La capa 2, parte 1: las instrucciones y el esquema (en grupo, unas 4 horas)

**Enunciado.** Escriban las instrucciones de su agente y el formato de su salida. Todavía no se corre nada: eso es la parte 2.
- **El prompt de sistema**, con las piezas del bloque 3.1: instrucción clara, contexto, ejemplos y formato de salida.
- **El esquema de la salida:** cada campo con su nombre, su tipo, si es obligatorio y sus valores permitidos.
- **El registro esperado** de cada uno de los diez casos de la capa 1, campo por campo.
- **Tres casos de robustez**, cada uno con su resultado esperado:
  - una entrada incompleta, a la que le falta un dato clave;
  - una respuesta mal formada, como un JSON cortado o con un valor no permitido;
  - una entrada fuera de alcance, que su agente no debe atender.

**Cómo trabajar.**
- Apliquen la prueba clave de la guía de Anthropic: ¿entendería el prompt un colega que no conoce la tarea?
- El esquema no pide datos personales: ni nombres, ni correos, ni teléfonos.
- Prevean una salida para las entradas que no aplican, por ejemplo una categoría «fuera de alcance».
- Un dato que no está en la entrada queda vacío (null). El agente no lo inventa.

**Entregable.** La sección 2 de la ficha del agente, en borrador. Usen la [ficha en Word](ficha_del_agente.docx) o la [ficha en Markdown](ficha_del_agente.md): esta versión trae la guía de la sección 2. Si ya tienen su ficha con las secciones 0 y 1, copien en ella la sección 2.

**Cuándo.** Llévenla al bloque 3.2. No se califica por separado: la capa 2 completa se entrega al inicio del bloque 4.1.

## Trabajo 3. La lectura del bloque 3.2 (individual, unas 1 hora)

**Lectura.** OpenAI (2024, 6 de agosto). *Introducing Structured Outputs in the API*.
- [Versión en español](https://openai.com/es-ES/index/introducing-structured-outputs-in-the-api/), de la página de OpenAI para España.
- [Original en inglés](https://openai.com/index/introducing-structured-outputs-in-the-api/).

Tiene unas 1 800 palabras, sin contar el código. Usa la versión de España o el original: la versión latinoamericana tiene errores de traducción que cambian el sentido.

**Complemento opcional.** Tam et al. (2024), [Let Me Speak Freely?](https://aclanthology.org/2024.emnlp-industry.91/), de EMNLP 2024. Encuentra que obligar un formato puede bajar el rendimiento en tareas de razonamiento. La empresa .txt publicó una [respuesta crítica](https://blog.dottxt.ai/say-what-you-mean.html). Si lees los dos, compara sus argumentos.

**Preguntas guía para el club de lectura:**
1. **¿Un campo para razonar?** La sección «Separar una respuesta final del razonamiento de respaldo o comentario adicional» propone un campo aparte para razonar. ¿Lo incluirías en el esquema de tu agente, antes o después de la respuesta? ¿Por qué?
2. **¿Qué campo puede salir válido pero equivocado?** La sección «Limitaciones y restricciones» admite que un JSON válido puede traer valores equivocados. ¿Qué campo de tu esquema corre más ese riesgo? ¿Cómo lo revisaría tu agente antes de usarlo?

**Entregable.** Lleva tus respuestas a la discusión del club de lectura del bloque 3.2. Pueden ser notas breves, de media página.

**Cómo se califica.** El club de lectura se califica por tu participación en la discusión. Las preguntas guía la preparan; no son un examen y no se entregan.

## Para profundizar (opcional)

- La guía de ingeniería de prompts de Anthropic, en español: la [descripción general](https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/overview) y las [mejores prácticas de prompting](https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/claude-prompting-best-practices).
- El curso gratuito [Quickstart: LangChain Essentials - Python](https://academy.langchain.com/courses/langchain-essentials-python), de LangChain Academy. Dura una hora; la lección 7 trata las salidas estructuradas.
- Schulhoff et al. (2024), [The Prompt Report](https://arxiv.org/abs/2406.06608): un catálogo de 58 técnicas de prompting de texto.
- Los programas de la sesión, para explorar en casa: [el taller del prompt](programas/taller.html) y [el validador](programas/validador.html). Ábrelos desde el índice de la sesión.
