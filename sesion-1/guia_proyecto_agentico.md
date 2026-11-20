# Guía para plantear un proyecto agéntico

**Agentes de IA (aplicado) · Sesión 1**

Esta guía resume la charla 2. Úsala en el trabajo en grupos para llenar la [ficha inicial](ficha_inicial.docx). Tiene cinco pasos: idear, revisar, decidir, redactar y elegir la pila.

## Paso 1. Idear

Empieza por una tarea real de un usuario concreto, no por la tecnología.

- **Así no:** «Queremos un agente con IA.»
- **Así sí:** «Quien atiende el soporte de una aplicación clasifica a mano cada reporte de error que llega.»

Las buenas candidatas tienen tres rasgos:
1. **Se repiten.** Ocurren muchas veces a la semana.
2. **Exigen decisiones.** No basta seguir una lista fija.
3. **Usan información no estructurada.** Textos, correos, documentos o conversaciones.

Preguntas guía:
- ¿Quién hace hoy la tarea?
- ¿Cada cuánto la hace?
- ¿Cuánto tiempo le toma?
- ¿Qué errores aparecen?
- ¿Qué datos usa?

Un caso probado: el agente AutoCover de Uber genera cerca del 11 % de las pruebas nuevas de código. Son pruebas que se revisan y se agregan al código de la empresa ([Rastenis et al., 2026](https://homes.cs.washington.edu/~rjust/publ/auto_cover_icse_2026.pdf)).

**En tu grupo:** listen tres tareas candidatas y elijan una.

## Paso 2. Qué tener en cuenta

Muchos proyectos fallan. Gartner predice que más del 40 % de los proyectos de IA agéntica se cancelará antes de que termine 2027. Las razones: costos crecientes, valor de negocio poco claro o controles de riesgo insuficientes. Es una predicción de analistas, no una medición.

Cuatro casos del mundo tech que salieron mal:
- **Cursor (abril de 2025).** Su bot de soporte inventó que una suscripción sirve en un solo dispositivo. El cofundador se disculpó, y ahora marcan las respuestas hechas con IA ([Hacker News](https://news.ycombinator.com/item?id=43700931)).
- **Klarna (mayo de 2025).** Su CEO admitió que el costo pesó demasiado y bajó la calidad de la atención.
- **Project Vend (junio de 2025).** Un agente que manejaba una tienda perdió dinero y regaló descuentos ([Anthropic](https://www.anthropic.com/research/project-vend-1)).
- **Replit (julio de 2025).** Un agente borró una base de datos en producción. Replit separó después las bases de desarrollo y de producción ([Replit](https://replit.com/blog/introducing-a-safer-way-to-vibe-code-with-replit-databases)).

### La lista de revisión antes de empezar
- [ ] Hay datos sin información personal, o puedes crear datos sintéticos.
- [ ] El éxito se comprueba con casos concretos.
- [ ] Las acciones irreversibles pasan por una persona.
- [ ] El costo por tarea y el tiempo de respuesta son aceptables.
- [ ] Cumple la Ley 1581 de 2012 de protección de datos personales.
- [ ] Cabe en seis capas, una por sesión del curso.

## Paso 3. ¿Hace falta un agente?

Empieza por la solución más simple que resuelva la tarea. Un agente usa cerca de 4 veces más tokens que un chat. Un sistema de varios agentes usa cerca de 15 veces más ([Anthropic, 2025](https://www.anthropic.com/engineering/multi-agent-research-system)). Además, sus errores se acumulan.

Conviene un agente si la tarea cumple al menos uno de estos criterios ([OpenAI, 2025](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)):
1. **Decisiones complejas:** juicio, excepciones y contexto.
2. **Reglas difíciles de mantener:** tantas reglas que cambiarlas cuesta.
3. **Mucha información no estructurada:** lenguaje natural, documentos o conversaciones.

Si no se cumple ninguno, basta una solución determinista.

### El árbol de decisión

1. ¿Una sola llamada al modelo resuelve la tarea?
   - **Sí:** usa un **LLM directo**.
   - **No:** sigue a la pregunta 2.
2. ¿Los pasos son siempre los mismos?
   - **Sí:** usa un **flujo**.
   - **No:** sigue a la pregunta 3.
3. ¿El camino depende de lo que encuentra en cada paso?
   - **Sí:** usa un **agente**.
4. ¿Hay subtareas de lectura que se pueden repartir?
   - **Sí:** podrían servir **varios agentes**, con cautela.

**En tu grupo:** ubiquen su idea en el árbol. La sesión 4 retoma este criterio con laboratorios.

## Paso 4. Redactar los requerimientos iniciales

Los requerimientos iniciales son la ficha inicial, que tiene nueve campos. Los cinco primeros: problema y usuario, tarea central, entradas y salidas, acciones y criterio de éxito. Los otros cuatro: cinco casos, datos, riesgos y la hipótesis de flujo o agente.

### Ejemplos mal escritos y bien escritos

| Campo | Mal escrito | Bien escrito |
|---|---|---|
| Tarea central | «El agente ayuda con los reportes de errores.» | «El agente clasifica cada reporte de error en una de cinco categorías y lo asigna al equipo responsable.» |
| Criterio de éxito | «Que funcione bien.» | «Acierta la categoría en al menos 9 de cada 10 casos de prueba.» |

### Seis reglas de un buen requerimiento
1. Una sola tarea central, en una o dos frases.
2. Un criterio de éxito que se comprueba con casos.
3. Cinco casos, cada uno con su entrada y su resultado esperado.
4. Lo que el agente nunca debe hacer, escrito.
5. Los puntos en que decide una persona.
6. Un costo máximo por tarea y un tiempo de respuesta aceptable.

El criterio de éxito y los cinco casos son las primeras pruebas de tu agente.

## Paso 5. Elegir la pila según la complejidad

Todos los proyectos del curso usan LangGraph y LangChain. Lo que cambia con la complejidad son las piezas que usa cada grupo.

| Nivel | Cuándo usarlo | Piezas del stack | Sesión |
|---|---|---|---|
| 1. LLM directo | Una sola llamada resuelve la tarea | Un modelo de chat de LangChain con salida estructurada | 2 y 3 |
| 2. Flujo | Los pasos son siempre los mismos | Un grafo de LangGraph con nodos y aristas condicionales | 4 |
| 3. Agente con herramientas | El camino depende de lo que encuentra | `create_agent`, herramientas con `@tool` y MCP si conecta otros sistemas | 4 y 5 |
| 4. Agente con conocimiento y memoria | Necesita documentos propios o recordar entre conversaciones | Búsqueda sobre un índice, checkpointer y store | 6 |
| 5. Orquestación | Hay subtareas separables o acciones de riesgo | Supervisor y subagentes, guardrails y aprobación humana | 7 |

Piezas comunes a todos los niveles:
- el modelo por API: Claude Haiku 5.5 o Gemini;
- las pruebas de cada etapa del agente;
- las trazas locales;
- un frontend en React, solo si el proyecto lo necesita.

**La regla:** elige el nivel más bajo que resuelva la tarea. Sube de nivel solo cuando las pruebas muestren que hace falta.

Fuera del curso, una automatización simple podría resolverse con una plataforma low-code, como n8n, Make o Zapier.

## Fuentes
- Anthropic (2024, 19 de diciembre). *Building effective agents*. https://www.anthropic.com/engineering/building-effective-agents
- Anthropic (2025, 13 de junio). *How we built our multi-agent research system*. https://www.anthropic.com/engineering/multi-agent-research-system
- OpenAI (2025). *A practical guide to building agents*. https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
- Gartner (2025, 25 de junio). *Gartner Predicts Over 40% of Agentic AI Projects Will Be Canceled by End of 2027*. Texto leído en la reproducción de CXOtoday: https://cxotoday.com/media-coverage/gartner-predicts-over-40-of-agentic-ai-projects-will-be-canceled-by-end-of-2027/
- Rastenis, Chou, Roy Choudhary, Just (2026). *Automated Software Test Generation at Industry Scale Using a Multi-Agent Architecture and Workflow Integration*. ICSE-SEIP '26. https://homes.cs.washington.edu/~rjust/publ/auto_cover_icse_2026.pdf
