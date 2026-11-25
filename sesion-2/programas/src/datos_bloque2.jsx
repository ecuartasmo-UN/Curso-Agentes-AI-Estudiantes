/* Cifras del bloque 2.2 con su fuente. Se completan con la investigación del 23 de noviembre de 2026.
   Cada valor lleva su fuente en el comentario o en el campo «fuente». */
export const DATOS = {
  /* El caso huggingface-cli: Lanyado (2024, 28 de marzo), Lasso Security, y el commit del 29 de marzo de 2024
     en alibaba/GraphTranslator. Cifras: Spracklen et al. (2025), USENIX Security. Las probabilidades son ilustrativas. */
  plausible: {
    pregunta: '¿Cómo instalo la herramienta de línea de comandos de Hugging Face?',
    candidatos: [
      { texto: 'pip install huggingface-cli', prob: 46 },
      { texto: 'pip install -U "huggingface_hub[cli]"', prob: 31, real: true },
      { texto: 'pip install huggingface_hub', prob: 14, real: true },
    ],
    escala: [
      { valor: '5.2 %', rotulo: 'de los paquetes que sugirieron los modelos GPT no existían' },
      { valor: '21.7 %', rotulo: 'en los modelos de código abierto probados' },
      { valor: '205 474', rotulo: 'nombres de paquetes inventados, todos distintos' },
    ],
    fuenteEscala: 'Spracklen et al. (2025), USENIX Security: 576 000 programas de 16 modelos, en Python y JavaScript.',
    riesgoTitulo: 'Alguien registra el nombre inventado',
    riesgoTexto: 'Un investigador subió un paquete vacío llamado huggingface-cli. En tres meses tuvo más de 30 000 descargas reales. Un proyecto de Alibaba lo instalaba en su README.',
    fuenteRiesgo: 'Lanyado (2024), Lasso Security. Commit del 29 de marzo de 2024 en alibaba/GraphTranslator.',
  },
  /* METR (2026, 20 de noviembre), «Q4 2026 capability update», figura 10: horizonte de tiempo del 50 %
     con las suites TH1.1 y TH2. Datos de https://metr.org/assets/images/q4-2026-capability-update/cad6b5d98261f80c.json
     Licencia de las figuras: CC BY. Minutos de un experto humano; intervalos de confianza del 95 %. */
  horizonte: {
    modelos: [
      { modelo: "GPT-4o", fecha: '2024-05-13', min: 7.1, bajo: 3.8, alto: 13.5, frontera: true },
      { modelo: "o1", fecha: '2024-12-05', min: 35.3, bajo: 15.7, alto: 66.1, frontera: true },
      { modelo: "GPT-5", fecha: '2025-08-07', min: 180.6, bajo: 97.9, alto: 334.5, frontera: true },
      { modelo: "Claude Opus 4.5", fecha: '2025-11-24', min: 275.4, bajo: 144.7, alto: 511.0, frontera: true },
      { modelo: "Claude Opus 4.6", fecha: '2026-02-05', min: 384.0, bajo: 193.4, alto: 729.6, frontera: true },
      { modelo: "GPT-5.4", fecha: '2026-03-05', min: 356.7, bajo: 199.5, alto: 592.0, frontera: false },
      { modelo: "Claude Opus 4.7", fecha: '2026-04-16', min: 503.0, bajo: 257.9, alto: 937.6, frontera: true },
      { modelo: "GPT-5.5", fecha: '2026-04-23', min: 664.3, bajo: 365.9, alto: 1116.4, frontera: true },
      { modelo: "Claude Opus 4.8", fecha: '2026-05-28', min: 710.6, bajo: 366.9, alto: 1268.1, frontera: true },
      { modelo: "Claude Fable 5", fecha: '2026-06-09', min: 934.7, bajo: 534.8, alto: 1939.3, frontera: true },
      { modelo: "GPT-5.6 Sol", fecha: '2026-07-09', min: 716.6, bajo: 393.4, alto: 1239.2, frontera: false },
      { modelo: "Claude Opus 5", fecha: '2026-07-24', min: 1194.8, bajo: 566.8, alto: 5174.8, frontera: true },
      { modelo: "Claude Fable 5.1", fecha: '2026-09-01', min: 1812.9, bajo: 718.7, alto: 18464.1, frontera: true },
      { modelo: "GPT-6 Astra", fecha: '2026-09-03', min: 2416.3, bajo: 791.5, alto: 158701.0, frontera: true },
      { modelo: "Claude Opus 5.5", fecha: '2026-09-22', min: 2337.4, bajo: 714.9, alto: 75176.6, frontera: false },
    ],
    tendencia: { desde: '2024-05-13', hasta: '2026-09-03', minDesde: 8.09, minHasta: 1643.2, duplicacion: 3.61, bajo: 2.08, alto: 4.94 },
  },
  /* Claude Haiku 5.5: «Training data cutoff | Jun 2026» y «Released October 7, 2026»
     (platform.claude.com/docs/en/models/haiku-5-5/overview). langchain 1.5.0: PyPI, 11 de noviembre de 2026. */
  corte: {
    inicio: '2026-05-01',
    fin: '2026-12-10',
    hitos: [
      { rotulo: 'Corte de los datos', texto: 'junio de 2026', fecha: '2026-06-15', clase: 'corte' },
      { rotulo: 'Lanzamiento', texto: '7 de octubre de 2026', fecha: '2026-10-07', clase: 'lanzamiento' },
      { rotulo: 'langchain 1.5.0', texto: '11 de noviembre de 2026', fecha: '2026-11-11', clase: 'version' },
      { rotulo: 'Hoy', texto: '23 de noviembre de 2026', fecha: '2026-11-23', clase: 'hoy' },
    ],
  },
  /* USD por millón de tokens, consultado el 23 de noviembre de 2026.
     Anthropic: platform.claude.com/docs/en/about-claude/pricing (Haiku 5.5 con prompts de hasta 100 000 tokens).
     Google: aistudio.google.com/docs/pricing (plan pagado; entrada de texto, imagen y video). */
  precios: {
    modelos: [
      { nombre: 'Claude Haiku 5.5', proveedor: 'Anthropic', entrada: 0.1, salida: 0.5 },
      { nombre: 'Gemini 2.5 Flash-Lite', proveedor: 'Google', entrada: 0.1, salida: 0.4 },
      { nombre: 'Gemini 3.5 Flash-Lite', proveedor: 'Google', entrada: 0.3, salida: 2.5 },
      { nombre: 'Claude Opus 5.5', proveedor: 'Anthropic · modelo grande', entrada: 4, salida: 20, contraste: true },
    ],
  },
};
