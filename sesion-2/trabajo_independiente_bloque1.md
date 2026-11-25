# Trabajo independiente del bloque 2.1

**Agentes de IA (aplicado) · Sesión 2 · Bloque 1**

Después del bloque 2.1 tienes tres trabajos: el Laboratorio 2A, los casos de la capa 1 y la lectura del bloque 2.2. Suman unas 6.5 horas.

## Trabajo 1. Terminar el Laboratorio 2A (unas 1.5 horas, individual o en pareja, según defina el docente)

**Enunciado.** Termina en casa el Laboratorio 2A, que empezaste en clase.
- Agrega cinco preguntas de un dominio que conozcas.
- Cada pregunta lleva su respuesta esperada y su tipo: hecho verificable, premisa falsa, fuera de alcance o posterior a la fecha de corte.
- Sin clave de API, eliges entre preguntas grabadas de reserva. Con la clave del curso, las corres en vivo.

**Entregable.** El notebook del laboratorio, con tus cinco preguntas y su tabla de resultados.

**Cuándo.** En la fecha que fije el docente. Los laboratorios de cada semana se entregan al inicio de la semana siguiente.

**Cómo se califica.** Cada laboratorio vale el 2.5 % de la calificación del curso. Se revisa con estos criterios:
- funciona según su criterio de éxito (40 %);
- las pruebas de funcionamiento y de robustez están completas y corridas (40 %);
- el análisis del laboratorio está al día (20 %).

## Trabajo 2. La capa 1, parte 1: los casos (en grupo, unas 4 horas)

**Enunciado.** Escriban los casos con los que van a probar el modelo de su proyecto.
- Diez casos de la tarea central, a partir de los cinco de su ficha inicial.
- Mezclen casos fáciles, difíciles y de borde. Cada uno lleva un resultado esperado que se pueda comprobar.
- Tres casos de robustez: una entrada ambigua, una premisa falsa y una pregunta fuera de alcance.
- Usen datos sintéticos o anonimizados. Nunca datos personales reales.

Un caso bien escrito trae una entrada concreta y un resultado que se compara campo por campo. Por ejemplo:
- **Mal escrito.** Entrada: un reporte de error. Resultado esperado: que lo clasifique bien.
- **Bien escrito.** Entrada: «La app se cierra al subir una foto en Android 15». Resultado esperado: categoría «fallo de la app» y prioridad alta.

**Entregable.** La sección 1 de la ficha del agente, con la tabla de los diez casos y los tres de robustez. Usen el formato de Word ([ficha_del_agente.docx](ficha_del_agente.docx)) o el de Markdown ([ficha_del_agente.md](ficha_del_agente.md)). La tabla de resultados queda vacía por ahora.

**Cuándo.** Llévenlos al bloque 2.2: allí aprenden a correrlos en dos modelos. La capa 1 completa se entrega al inicio del bloque 3.1.

**Cómo se califica.** Los casos no se califican por separado. Son parte de la capa 1, que vale el 5 % de la calificación del curso.

## Trabajo 3. La lectura del bloque 2.2 (individual, unas 1 hora)

**Lectura.** OpenAI (2025, 5 de septiembre). *Why language models hallucinate*.
- Versión en español, publicada por OpenAI: [Por qué los modelos de lenguaje alucinan](https://openai.com/es-419/index/why-language-models-hallucinate/).
- Versión original en inglés: https://openai.com/index/why-language-models-hallucinate/
- Complemento opcional: el artículo de investigación de Kalai, Nachum, Vempala y Zhang (2025), [Why Language Models Hallucinate](https://arxiv.org/abs/2509.04664), en inglés.

El texto tiene unas 1 500 palabras y se lee en unos 15 minutos. Usa el resto del tiempo para pensar las preguntas guía.

**Preguntas guía para el club de lectura:**
1. **¿Cuándo debe tu agente decir «no lo sé»?** El artículo propone calificar distinto: castigar más un error seguro que una abstención. Piensa en la tarea de tu proyecto. ¿Qué error sería peor que no responder? ¿Cómo lo reflejarías en tus diez casos? Apóyate en la sección «Una mejor manera de calificar las evaluaciones».
2. **¿Qué datos de tu proyecto son difíciles de predecir?** Según los autores, la ortografía sigue patrones, pero un dato como el cumpleaños de una mascota no. ¿Qué datos de tu tarea se parecen a ese cumpleaños? ¿Dónde los buscaría tu agente en lugar de adivinarlos? Apóyate en la sección sobre la predicción de la siguiente palabra.

**Entregable.** Lleva tus respuestas a la discusión del club de lectura del bloque 2.2. Pueden ser notas breves, de media página.

**Cómo se califica.** El club de lectura se califica por tu participación en la discusión. Las preguntas guía la preparan; no son un examen y no se entregan.

## Para profundizar (opcional)

- **Los programas de «El transformer por dentro».** Ábrelos desde el [índice de la sesión](index.html) y avanza paso a paso. En «La atención» puedes tocar cada palabra.
- **3Blue1Brown, de Grant Sanderson.** Videos con audio en español en YouTube:
  - [Large Language Models explained briefly](https://www.3blue1brown.com/lessons/mini-llm), 8 minutos;
  - [Transformers, the tech behind LLMs](https://www.3blue1brown.com/lessons/gpt), 27 minutos;
  - [Attention in transformers, step-by-step](https://www.3blue1brown.com/lessons/attention), 26 minutos.
- **Un explorador visual.** [Transformer Explainer](https://poloclub.github.io/transformer-explainer/) corre GPT-2 pequeño en tu navegador. Escribe una frase, mira la atención y cambia la temperatura.
