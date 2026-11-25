(() => {
  // src/comun.jsx
  var { useState, useEffect } = React;
  function miles(n) {
    const [entero, dec] = String(n).split(".");
    const conEspacios = entero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return dec ? `${conEspacios}.${dec}` : conEspacios;
  }
  var contexto = null;
  var medidas = /* @__PURE__ */ new Map();
  function ancho(texto, px, peso = 600, familia = "Inter") {
    const clave = `${texto}|${px}|${peso}|${familia}`;
    if (medidas.has(clave)) return medidas.get(clave);
    if (!contexto) contexto = document.createElement("canvas").getContext("2d");
    contexto.font = `${peso} ${px}px "${familia}", system-ui, sans-serif`;
    const w = contexto.measureText(texto).width;
    medidas.set(clave, w);
    return w;
  }
  var versionFuentes = 0;
  var oyentes = /* @__PURE__ */ new Set();
  function cargarFuentes() {
    if (!document.fonts || !document.fonts.load) return;
    const pedidos = ['400 20px "Inter"', '600 20px "Inter"', '700 20px "Inter"', '500 20px "Space Grotesk"', '700 20px "Space Grotesk"'];
    Promise.all(pedidos.map((f) => document.fonts.load(f))).then(() => {
      medidas.clear();
      versionFuentes += 1;
      oyentes.forEach((f) => f(versionFuentes));
    }).catch(() => {
    });
  }
  function useFuentes() {
    const [, poner] = useState(versionFuentes);
    useEffect(() => {
      oyentes.add(poner);
      return () => oyentes.delete(poner);
    }, []);
  }
  var contadorIds = 0;
  function useIdSvg(prefijo) {
    const [id] = useState(() => {
      contadorIds += 1;
      return `${prefijo}-${contadorIds}`;
    });
    return id;
  }
  function Ilustrativo({ texto = "Ilustrativo", estilo }) {
    return /* @__PURE__ */ React.createElement("span", { className: "marca-ilustrativo", style: estilo }, texto);
  }
  function Pie({ textos, paso }) {
    const t = textos[Math.min(paso, textos.length - 1)];
    return /* @__PURE__ */ React.createElement("p", { className: "pie-programa", "aria-live": "polite" }, t);
  }
  function Particulas({ d, n = 3, c = "var(--t1)", dur = 1.8, r = 5, quieto, invertir = false }) {
    if (quieto || n <= 0) return null;
    const items = [];
    for (let k = 0; k < n; k++) {
      items.push(
        /* @__PURE__ */ React.createElement("circle", { key: k, r, fill: c, className: "particula" }, /* @__PURE__ */ React.createElement("animateMotion", { dur: `${dur}s`, repeatCount: "indefinite", begin: `${k * dur / n}s`, path: d, keyPoints: invertir ? "1;0" : "0;1", keyTimes: "0;1", calcMode: "linear" }))
      );
    }
    return /* @__PURE__ */ React.createElement("g", null, items);
  }
  var ver = (si, extra = "") => `aparece-p ${si ? "visto" : ""} ${extra}`;

  // src/mapa.jsx
  var NODOS = [
    { id: "caso", titulo: ["Caso"], corto: "Caso", sub: "un ticket de soporte" },
    { id: "prompt", titulo: ["Prompt"], corto: "Prompt", sub: "instrucciones, contexto, ejemplos y formato" },
    { id: "api", titulo: ["Llamada", "por API"], corto: "API", sub: "mensajes y parámetros" },
    { id: "modelo", titulo: ["Modelo"], corto: "Modelo", sub: "Claude o Gemini" },
    { id: "cruda", titulo: ["Respuesta", "cruda"], corto: "Cruda", sub: "el texto que devuelve" },
    { id: "validacion", titulo: ["Validación"], corto: "Validación", sub: "¿cumple el esquema?" },
    { id: "registro", titulo: ["Registro"], corto: "Registro", sub: "los campos listos" },
    { id: "prueba", titulo: ["Prueba"], corto: "Prueba", sub: "«pasa» o «falla»" }
  ];
  var BLOQUE = {
    31: { ids: ["prompt", "validacion"], rotulo: "Bloque 3.1" },
    32: { ids: ["api", "prueba"], rotulo: "Bloque 3.2" },
    sintesis: { ids: NODOS.map((n) => n.id), rotulo: "Sesión 3" }
  };
  function partirLineas(texto, px, anchoMax, peso = 500) {
    const palabras = texto.split(" ");
    const lineas = [];
    let actual = "";
    palabras.forEach((p) => {
      const prueba = actual ? `${actual} ${p}` : p;
      if (actual && ancho(prueba, px, peso) > anchoMax) {
        lineas.push(actual);
        actual = p;
      } else actual = prueba;
    });
    if (actual) lineas.push(actual);
    return lineas;
  }
  var PIE_MAPA = {
    31: [
      "El camino de un caso dentro de un programa: del ticket a la prueba que da «pasa» o «falla».",
      "Este bloque trata dos piezas: cómo escribir el prompt y cómo validar la respuesta con un esquema."
    ],
    32: [
      "El mismo camino del bloque 3.1. Ahora miramos la llamada por API y cómo se prueba.",
      "Este bloque trata la llamada: mensajes, parámetros y razonamiento. Y cómo comparar variantes con pruebas."
    ],
    sintesis: ["El camino completo de la sesión 3."]
  };
  function MapaSesion({ paso = 0, final, quieto, modo = "31" }) {
    useFuentes();
    const idP = useIdSvg("punta-mapa");
    const p = final ? 1 : paso;
    const activos = p >= 1 || modo === "sintesis" ? BLOQUE[modo].ids : [];
    const w = 122;
    const gap = 20;
    const x0 = (1160 - (NODOS.length * w + (NODOS.length - 1) * gap)) / 2;
    const y0 = 58;
    const h = 100;
    const centroY = y0 + h / 2;
    const camino = `M${x0 + w / 2} ${centroY} H${x0 + 7 * (w + gap) + w / 2}`;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama mapa-sesion", viewBox: "0 0 1160 280", role: "img", "aria-label": "El camino de un caso dentro de un programa" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("marker", { id: idP, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto" }, /* @__PURE__ */ React.createElement("path", { d: "M0 0 10 5 0 10z", className: "relleno-tenue" }))), NODOS.slice(0, -1).map((n, i) => {
      const xa = x0 + i * (w + gap) + w;
      return /* @__PURE__ */ React.createElement("path", { key: n.id, className: "arista", d: `M${xa + 2} ${centroY} H${xa + gap - 3}`, markerEnd: `url(#${idP})` });
    }), /* @__PURE__ */ React.createElement(Particulas, { d: camino, n: 2, c: "var(--acento)", dur: 6, r: 6, quieto }), NODOS.map((n, i) => {
      const x = x0 + i * (w + gap);
      const on = activos.includes(n.id);
      const apagado = activos.length > 0 && !on;
      const lineas = partirLineas(n.sub, 15, w + 8);
      return /* @__PURE__ */ React.createElement("g", { key: n.id, className: apagado ? "nodo-apagado" : "" }, /* @__PURE__ */ React.createElement("g", { className: `nodo ${on ? "acento nodo-encendido" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x, y: y0, width: w, height: h, rx: 16 }), n.titulo.map((t, k) => /* @__PURE__ */ React.createElement("text", { key: t, x: x + w / 2, y: centroY + (k - (n.titulo.length - 1) / 2) * 24, textAnchor: "middle", dominantBaseline: "central", fontSize: 20, className: "t-titulo" }, t))), lineas.map((l, k) => /* @__PURE__ */ React.createElement("text", { key: l, x: x + w / 2, y: y0 + h + 24 + k * 19, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, className: "t-suave" }, l)), on && modo !== "sintesis" ? /* @__PURE__ */ React.createElement("g", { className: "chip-bloque" }, /* @__PURE__ */ React.createElement("rect", { x: x + 6, y: y0 - 42, width: w - 12, height: 28, rx: 14 }), /* @__PURE__ */ React.createElement("text", { x: x + w / 2, y: y0 - 28, textAnchor: "middle", dominantBaseline: "central", fontSize: 14, fontWeight: 700 }, BLOQUE[modo].rotulo)) : null);
    })), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_MAPA[modo], paso: modo === "sintesis" ? 0 : p }));
  }
  function Minimapa({ resaltar: resaltar2 = "" }) {
    useFuentes();
    const idM = useIdSvg("punta-mini");
    const activos = resaltar2.split(",").map((s) => s.trim()).filter(Boolean);
    const gap = 16;
    const w = (1200 - gap * (NODOS.length - 1)) / NODOS.length;
    const y0 = 10;
    const h = 56;
    return /* @__PURE__ */ React.createElement("svg", { className: "diagrama minimapa", viewBox: "0 0 1200 76", role: "img", "aria-label": `Mapa de la sesión. Esta parte: ${activos.join(", ")}` }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("marker", { id: idM, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto" }, /* @__PURE__ */ React.createElement("path", { d: "M0 0 10 5 0 10z", className: "relleno-tenue" }))), NODOS.slice(0, -1).map((n, i) => {
      const xa = i * (w + gap) + w;
      return /* @__PURE__ */ React.createElement("path", { key: n.id, className: "arista", d: `M${xa + 1} ${y0 + h / 2} H${xa + gap - 2}`, markerEnd: `url(#${idM})` });
    }), NODOS.map((n, i) => {
      const on = activos.includes(n.id);
      const px = Math.min(26, 26 * (w - 18) / Math.max(1, ancho(n.corto, 26, 700, "Space Grotesk")));
      return /* @__PURE__ */ React.createElement("g", { key: n.id, className: `nodo ${on ? "acento mini-activo" : "mini-apagado"}` }, /* @__PURE__ */ React.createElement("rect", { x: i * (w + gap), y: y0, width: w, height: h, rx: 14 }), /* @__PURE__ */ React.createElement("text", { x: i * (w + gap) + w / 2, y: y0 + h / 2, textAnchor: "middle", dominantBaseline: "central", fontSize: px, className: "t-titulo" }, n.corto));
    }));
  }

  // ../ejemplos/datos/tokens_s3.json
  var tokens_s3_default = {
    tokenizer: "o200k_base",
    biblioteca: "tiktoken 0.14.0",
    nota: "Conteos reales con o200k_base. Cada API cuenta con su propio tokenizer.",
    precios_usd_millon: {
      "claude-haiku-5-5": {
        entrada: 0.1,
        salida: 0.5
      },
      "gemini-2.5-flash-lite": {
        entrada: 0.1,
        salida: 0.4
      },
      "gemini-3.5-flash-lite": {
        entrada: 0.3,
        salida: 2.5
      }
    },
    mensaje_app: {
      texto: "¿Por qué se cierra la app al subir una foto?",
      tokens: 12
    },
    ticket: {
      texto: "Desde ayer la app se cierra cada vez que subo una foto desde la galería. Uso un Pixel 8 con Android 15 y la versión 4.2.1. Con fotos pequeñas no pasa.",
      tokens: 44
    },
    registro: {
      campos: {
        categoria: "fallo de la app",
        prioridad: "alta",
        plataforma: "Android",
        version_app: "4.2.1",
        resumen: "La app se cierra al subir fotos grandes desde la galería"
      },
      tokens: 55
    },
    armar_prompt: [
      {
        id: "vaga",
        nombre: "Instrucción vaga",
        texto: "Clasifica este ticket.",
        tokens_pieza: 5,
        tokens_prompt: 55
      },
      {
        id: "clara",
        nombre: "Instrucción clara",
        texto: "Lee el ticket de soporte de FotoNube, una app de fotos. Asígnale una categoría y una prioridad.",
        tokens_pieza: 24,
        tokens_prompt: 74
      },
      {
        id: "contexto",
        nombre: "Contexto",
        texto: "El equipo de soporte atiende primero la prioridad alta. Un fallo que impide usar una función principal es de prioridad alta. Las categorías son: fallo de la app, rendimiento, interfaz, cuenta y acceso, y solicitud de función.",
        tokens_pieza: 47,
        tokens_prompt: 121
      },
      {
        id: "ejemplos",
        nombre: "Tres ejemplos",
        texto: "<ejemplos>\nNo puedo iniciar sesión desde el lunes. → cuenta y acceso, alta\nSería útil ordenar los álbumes por fecha. → solicitud de función, baja\nLa galería tarda diez segundos en abrir. → rendimiento, media\n</ejemplos>",
        tokens_pieza: 56,
        tokens_prompt: 177
      },
      {
        id: "formato",
        nombre: "Formato de salida",
        texto: "Responde solo con un JSON con los campos categoria, prioridad, plataforma, version_app y resumen. Si un dato no está en el ticket, escribe null.",
        tokens_pieza: 32,
        tokens_prompt: 209
      }
    ],
    conversacion: {
      sistema: {
        texto: "Eres el asistente del equipo de soporte de FotoNube. Respondes en español, en dos frases como máximo.",
        tokens: 26
      },
      turnos: [
        {
          rol: "user",
          texto: "¿Qué hago si la app se cierra al subir una foto?",
          tokens: 13
        },
        {
          rol: "assistant",
          texto: "Pide la versión de la app y el modelo del teléfono. Con esos datos, busca si el fallo ya está reportado.",
          tokens: 26
        },
        {
          rol: "user",
          texto: "El usuario tiene la versión 4.2.1 en Android 15.",
          tokens: 16
        },
        {
          rol: "assistant",
          texto: "Ese fallo ya está reportado para la versión 4.2.1. Pídele que actualice a la 4.2.2, que lo corrige.",
          tokens: 36
        },
        {
          rol: "user",
          texto: "¿Y si no puede actualizar todavía?",
          tokens: 8
        },
        {
          rol: "assistant",
          texto: "Sugiérele subir fotos más pequeñas mientras tanto. Registra el caso para avisarle cuando pueda actualizar.",
          tokens: 22
        },
        {
          rol: "user",
          texto: "Gracias. ¿Cómo registro el caso?",
          tokens: 8
        },
        {
          rol: "assistant",
          texto: "Crea un ticket con la categoría fallo de la app y prioridad alta. Agrega la versión y el teléfono.",
          tokens: 23
        }
      ],
      llamadas: [
        {
          turno: 1,
          mensajes: 2,
          tokens_entrada: 39,
          tokens_salida: 26,
          costo_por_mil_llamadas_haiku: 0.0169
        },
        {
          turno: 2,
          mensajes: 4,
          tokens_entrada: 81,
          tokens_salida: 36,
          costo_por_mil_llamadas_haiku: 0.0261
        },
        {
          turno: 3,
          mensajes: 6,
          tokens_entrada: 125,
          tokens_salida: 22,
          costo_por_mil_llamadas_haiku: 0.0235
        },
        {
          turno: 4,
          mensajes: 8,
          tokens_entrada: 155,
          tokens_salida: 23,
          costo_por_mil_llamadas_haiku: 0.027
        }
      ]
    },
    variantes: {
      issue: "Al girar el teléfono, el botón de subir fotos queda fuera de la pantalla.",
      lista: [
        {
          id: "sin_ejemplos",
          nombre: "Sin ejemplos",
          texto: "Etiqueta el issue del repositorio de FotoNube con una sola etiqueta: error, mejora, documentación o pregunta.\n\n<issue>\nAl girar el teléfono, el botón de subir fotos queda fuera de la pantalla.\n</issue>",
          tokens_entrada: 46
        },
        {
          id: "tres_ejemplos",
          nombre: "Con tres ejemplos",
          texto: "Etiqueta el issue del repositorio de FotoNube con una sola etiqueta: error, mejora, documentación o pregunta.\n\n<ejemplos>\nLa app se cierra al abrir un álbum vacío. → error\nAgregar un modo oscuro a la galería. → mejora\nEl README no explica cómo correr las pruebas. → documentación\n</ejemplos>\n\n<issue>\nAl girar el teléfono, el botón de subir fotos queda fuera de la pantalla.\n</issue>",
          tokens_entrada: 94
        },
        {
          id: "formato",
          nombre: "Con formato explícito",
          texto: "Etiqueta el issue del repositorio de FotoNube con una sola etiqueta: error, mejora, documentación o pregunta.\n\nResponde solo con la etiqueta, en minúsculas y sin explicación.\n\n<issue>\nAl girar el teléfono, el botón de subir fotos queda fuera de la pantalla.\n</issue>",
          tokens_entrada: 61
        },
        {
          id: "cadena",
          nombre: "Con cadena de pensamiento",
          texto: "Etiqueta el issue del repositorio de FotoNube con una sola etiqueta: error, mejora, documentación o pregunta.\n\nAntes de responder, razona paso a paso. Al final escribe: Etiqueta: <etiqueta>.\n\n<issue>\nAl girar el teléfono, el botón de subir fotos queda fuera de la pantalla.\n</issue>",
          tokens_entrada: 69
        }
      ]
    }
  };

  // ../ejemplos/datos/validacion.json
  var validacion_default = {
    pydantic: "2.14.4",
    esquema: {
      properties: {
        categoria: {
          enum: [
            "fallo de la app",
            "rendimiento",
            "interfaz",
            "cuenta y acceso",
            "solicitud de función"
          ],
          title: "Categoria",
          type: "string"
        },
        prioridad: {
          enum: [
            "alta",
            "media",
            "baja"
          ],
          title: "Prioridad",
          type: "string"
        },
        plataforma: {
          enum: [
            "Android",
            "iOS",
            "web"
          ],
          title: "Plataforma",
          type: "string"
        },
        version_app: {
          anyOf: [
            {
              type: "string"
            },
            {
              type: "null"
            }
          ],
          default: null,
          title: "Version App"
        },
        resumen: {
          title: "Resumen",
          type: "string"
        }
      },
      required: [
        "categoria",
        "prioridad",
        "plataforma",
        "resumen"
      ],
      title: "Ticket",
      type: "object"
    },
    casos: [
      {
        id: "bueno",
        nombre: "El registro esperado",
        json: '{"categoria": "fallo de la app", "prioridad": "alta", "plataforma": "Android", "version_app": "4.2.1", "resumen": "La app se cierra al subir fotos grandes desde la galería"}',
        valido: true,
        registro: {
          categoria: "fallo de la app",
          prioridad: "alta",
          plataforma: "Android",
          version_app: "4.2.1",
          resumen: "La app se cierra al subir fotos grandes desde la galería"
        },
        errores: []
      },
      {
        id: "sin_prioridad",
        nombre: "Falta un campo obligatorio",
        json: '{"categoria": "fallo de la app", "plataforma": "Android", "version_app": "4.2.1", "resumen": "La app se cierra al subir fotos grandes desde la galería"}',
        valido: false,
        errores: [
          {
            campo: "prioridad",
            tipo: "missing",
            mensaje: "Field required"
          }
        ],
        texto_error: "1 validation error for Ticket\nprioridad\n  Field required [type=missing, input_value={'categoria': 'fallo de l...ndes desde la galería'}, input_type=dict]\n    For further information visit https://errors.pydantic.dev/2.14/v/missing"
      },
      {
        id: "valor_no_permitido",
        nombre: "Un valor que no está permitido",
        json: '{"categoria": "fallo de la app", "prioridad": "urgente", "plataforma": "Android", "version_app": "4.2.1", "resumen": "La app se cierra al subir fotos grandes desde la galería"}',
        valido: false,
        errores: [
          {
            campo: "prioridad",
            tipo: "literal_error",
            mensaje: "Input should be 'alta', 'media' or 'baja'"
          }
        ],
        texto_error: "1 validation error for Ticket\nprioridad\n  Input should be 'alta', 'media' or 'baja' [type=literal_error, input_value='urgente', input_type=str]\n    For further information visit https://errors.pydantic.dev/2.14/v/literal_error"
      },
      {
        id: "tipo_equivocado",
        nombre: "Un tipo que no coincide",
        json: '{"categoria": "fallo de la app", "prioridad": "alta", "plataforma": "Android", "version_app": 4.21, "resumen": "La app se cierra al subir fotos grandes desde la galería"}',
        valido: false,
        errores: [
          {
            campo: "version_app",
            tipo: "string_type",
            mensaje: "Input should be a valid string"
          }
        ],
        texto_error: "1 validation error for Ticket\nversion_app\n  Input should be a valid string [type=string_type, input_value=4.21, input_type=float]\n    For further information visit https://errors.pydantic.dev/2.14/v/string_type"
      },
      {
        id: "sin_version",
        nombre: "Un dato que el ticket no trae",
        json: '{"categoria": "fallo de la app", "prioridad": "alta", "plataforma": "Android", "version_app": null, "resumen": "La app se cierra al subir fotos grandes desde la galería"}',
        valido: true,
        registro: {
          categoria: "fallo de la app",
          prioridad: "alta",
          plataforma: "Android",
          version_app: null,
          resumen: "La app se cierra al subir fotos grandes desde la galería"
        },
        errores: []
      },
      {
        id: "cortado",
        nombre: "Una respuesta cortada por el máximo de tokens",
        json: '{"categoria": "fallo de la app", "prioridad": "alta", "plataforma": "Android", "version_app": "4.2.1", "resumen": "La app se cierra al subir fotos gr',
        valido: false,
        errores: [
          {
            campo: "(todo el JSON)",
            tipo: "json_invalid",
            mensaje: "Invalid JSON: EOF while parsing a string at line 1 column 149"
          }
        ],
        texto_error: `1 validation error for Ticket
  Invalid JSON: EOF while parsing a string at line 1 column 149 [type=json_invalid, input_value='{"categoria": "fallo de ...ierra al subir fotos gr', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/json_invalid`
      }
    ]
  };

  // ../ejemplos/datos/prompt_sistema.json
  var prompt_sistema_default = {
    consulta: "2026-11-24",
    tokenizer: "o200k_base",
    biblioteca: "tiktoken 0.14.0",
    nota: "Entrada más reciente de cada página. Solo se guardan los conteos.",
    modelos: [
      {
        modelo: "claude-haiku-3",
        fecha: "July 12, 2024",
        url: "https://platform.claude.com/docs/en/release-notes/system-prompts/claude-haiku-3",
        palabras: 117,
        tokens_o200k: 155
      },
      {
        modelo: "claude-haiku-3-5",
        fecha: "October 22, 2024",
        url: "https://platform.claude.com/docs/en/release-notes/system-prompts/claude-haiku-3-5",
        palabras: 3400,
        tokens_o200k: 4166
      },
      {
        modelo: "claude-haiku-4-5",
        fecha: "November 9, 2026",
        url: "https://platform.claude.com/docs/en/release-notes/system-prompts/claude-haiku-4-5",
        palabras: 4168,
        tokens_o200k: 5318
      },
      {
        modelo: "claude-haiku-5-5",
        fecha: "November 9, 2026",
        url: "https://platform.claude.com/docs/en/release-notes/system-prompts/claude-haiku-5-5",
        palabras: 4785,
        tokens_o200k: 6046
      }
    ]
  };

  // src/datos.jsx
  var SISTEMA_APP = prompt_sistema_default.modelos.find((m) => m.modelo === "claude-haiku-5-5");
  var PRECIOS = tokens_s3_default.precios_usd_millon;
  var HAIKU = PRECIOS["claude-haiku-5-5"];
  function usd(n, dec = 4) {
    return `USD ${Number(n).toFixed(dec)}`;
  }
  var costo = (entrada, salida, precio = HAIKU) => (entrada * precio.entrada + salida * precio.salida) / 1e6;
  var TICKET = tokens_s3_default.ticket.texto;
  var REGISTRO = tokens_s3_default.registro.campos;
  var CAMPOS = ["categoria", "prioridad", "plataforma", "version_app", "resumen"];
  var ESQUEMA = [
    { campo: "categoria", tipo: "texto", obligatorio: true, valores: ["fallo de la app", "rendimiento", "interfaz", "cuenta y acceso", "solicitud de función"] },
    { campo: "prioridad", tipo: "texto", obligatorio: true, valores: ["alta", "media", "baja"] },
    { campo: "plataforma", tipo: "texto", obligatorio: true, valores: ["Android", "iOS", "web"] },
    { campo: "version_app", tipo: "texto o vacío", obligatorio: false, valores: null },
    { campo: "resumen", tipo: "texto", obligatorio: true, valores: null }
  ];
  var ERRORES = Object.fromEntries(validacion_default.casos.map((c) => [c.id, c]));
  var COLOR_PIEZA = {
    vaga: "var(--texto-tenue)",
    clara: "var(--t1)",
    contexto: "var(--t2)",
    ejemplos: "var(--t5)",
    formato: "var(--t4)",
    ticket: "var(--t3)"
  };
  var PASOS_PROMPT = tokens_s3_default.armar_prompt;
  var RESPUESTAS_PROMPT = [
    "Parece un problema técnico: la app falla al subir fotos. Conviene revisarlo pronto.",
    "Categoría: fallo de la app. Prioridad: no la puedo saber sin más información.",
    "Categoría: fallo de la app. Prioridad: alta, porque impide subir fotos.",
    "fallo de la app, alta",
    null
    // el registro JSON
  ];
  var CONVERSACION = tokens_s3_default.conversacion;
  var VARIANTES = tokens_s3_default.variantes;

  // src/prompt.jsx
  var { useState: useState2, useMemo } = React;
  var PIE_APP = [
    "En una app de chat escribes un mensaje. Parece que solo eso llega al modelo.",
    "Paso 1. La app agrega piezas que no ves: sus instrucciones, la conversación anterior y sus herramientas.",
    "Paso 2. Por API llega solo lo que tu programa envía. Las piezas de la app desaparecen.",
    "Paso 3. Quedan dos huecos que escribes tú: la instrucción y el formato de la salida."
  ];
  function AppApi({ paso = 0, final, quieto, tokensSistema }) {
    useFuentes();
    const idP = useIdSvg("punta-app");
    const p = final ? 3 : paso;
    const api = p >= 2;
    const piezas = [
      { id: "sistema", y: 92, h: 78, c: "var(--t6)", titulo: "Prompt de sistema del proveedor", sub: tokensSistema ? `${miles(tokensSistema)} tokens de instrucciones que no ves` : "Miles de tokens de instrucciones que no ves" },
      { id: "historia", y: 184, h: 62, c: "var(--t2)", titulo: "La conversación anterior", sub: "Los mensajes de antes, que la app guarda" },
      { id: "herramientas", y: 260, h: 62, c: "var(--t4)", titulo: "Herramientas", sub: "Por ejemplo, la búsqueda web" }
    ];
    const huecos = [
      { y: 92, h: 78, titulo: "Tu instrucción", sub: "Parte 3: la anatomía de un prompt" },
      { y: 260, h: 62, titulo: "El formato de la salida", sub: "Parte 4: de texto libre a JSON" }
    ];
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama app-api", viewBox: "0 0 1160 440", role: "img", "aria-label": "Lo que agrega una app de chat frente a lo que envía tu programa por API" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("marker", { id: idP, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "8", markerHeight: "8", orient: "auto" }, /* @__PURE__ */ React.createElement("path", { d: "M0 0 10 5 0 10z", className: "relleno-acento" }))), /* @__PURE__ */ React.createElement("rect", { x: 24, y: 22, width: 740, height: 400, rx: 26, className: `marco-app ${api ? "es-api" : ""}` }), /* @__PURE__ */ React.createElement("text", { x: 56, y: 58, dominantBaseline: "central", fontSize: 24, className: "t-titulo t-acento" }, api ? "Tu programa, por API" : "App de chat"), piezas.map((k) => /* @__PURE__ */ React.createElement("g", { key: k.id, className: `pieza-app ${p >= 1 ? "visto" : ""} ${api ? "fantasma" : ""} ${p >= 3 && k.id !== "historia" ? "reemplazada" : ""}`, style: { "--c": k.c } }, /* @__PURE__ */ React.createElement("rect", { x: 56, y: k.y, width: 676, height: k.h, rx: 16 }), /* @__PURE__ */ React.createElement("text", { x: 80, y: k.y + k.h / 2 - 12, dominantBaseline: "central", fontSize: 21, fontWeight: 700 }, k.titulo), /* @__PURE__ */ React.createElement("text", { x: 80, y: k.y + k.h / 2 + 14, dominantBaseline: "central", fontSize: 17, className: "t-suave" }, k.sub), !api ? /* @__PURE__ */ React.createElement("text", { x: 712, y: k.y + 22, textAnchor: "end", dominantBaseline: "central", fontSize: 14, fontWeight: 700, className: "t-tenue" }, "LA AGREGA LA APP") : null)), huecos.map((k) => /* @__PURE__ */ React.createElement("g", { key: k.titulo, className: `hueco-api ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 56, y: k.y, width: 676, height: k.h, rx: 16 }), /* @__PURE__ */ React.createElement("text", { x: 80, y: k.y + k.h / 2 - 12, dominantBaseline: "central", fontSize: 21, fontWeight: 700, className: "t-acento" }, k.titulo), /* @__PURE__ */ React.createElement("text", { x: 80, y: k.y + k.h / 2 + 14, dominantBaseline: "central", fontSize: 17, className: "t-suave" }, k.sub))), /* @__PURE__ */ React.createElement("g", { className: "pieza-app visto mensaje-usuario", style: { "--c": "var(--t3)" } }, /* @__PURE__ */ React.createElement("rect", { x: 56, y: 336, width: 676, height: 70, rx: 16 }), /* @__PURE__ */ React.createElement("text", { x: 80, y: 358, dominantBaseline: "central", fontSize: 16, fontWeight: 700, className: "t-tenue" }, "TU MENSAJE"), /* @__PURE__ */ React.createElement("text", { x: 80, y: 384, dominantBaseline: "central", fontSize: 20 }, "¿Por qué se cierra la app al subir una foto?")), /* @__PURE__ */ React.createElement("path", { className: "arista acento", d: "M766 222 H 872", markerEnd: `url(#${idP})` }), /* @__PURE__ */ React.createElement(Particulas, { d: "M766 222 H 872", n: 2, c: "var(--acento)", dur: 1.6, r: 5, quieto }), /* @__PURE__ */ React.createElement("g", { className: "nodo acento" }, /* @__PURE__ */ React.createElement("rect", { x: 876, y: 164, width: 250, height: 116, rx: 22 }), /* @__PURE__ */ React.createElement("text", { x: 1001, y: 207, textAnchor: "middle", dominantBaseline: "central", fontSize: 26, className: "t-titulo" }, "Modelo"), /* @__PURE__ */ React.createElement("text", { x: 1001, y: 242, textAnchor: "middle", dominantBaseline: "central", fontSize: 17, className: "t-suave" }, "Solo ve lo que le llega"))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_APP, paso: p }));
  }
  var PIE_CICLO = [
    "Antes de escribir el prompt, hay un orden de trabajo.",
    "Paso 1. Primero los casos y el criterio de éxito: qué entra y qué debe salir.",
    "Paso 2. Después, la primera versión del prompt.",
    "Paso 3. Corres los casos con ese prompt.",
    "Paso 4. Mides cuántos pasan el criterio.",
    "Paso 5. Ajustas el prompt y vuelves a correr. El prompt cambia en cada vuelta; los casos no."
  ];
  var NODOS_CICLO = [
    { id: "casos", x: 70, y: 176, w: 240, h: 84, titulo: "Casos y criterio", sub: "Fijos: no cambian", clase: "exito" },
    { id: "prompt", x: 380, y: 40, w: 220, h: 84, titulo: "Prompt", sub: "v1, v2, v3…", clase: "acento" },
    { id: "correr", x: 690, y: 40, w: 200, h: 84, titulo: "Correr", sub: "Los mismos casos", clase: "acento-2" },
    { id: "medir", x: 880, y: 196, w: 200, h: 84, titulo: "Medir", sub: "¿Cuántos pasan?", clase: "acento-2" },
    { id: "ajustar", x: 470, y: 330, w: 260, h: 84, titulo: "Ajustar el prompt", sub: "Un cambio a la vez", clase: "acento" }
  ];
  function CicloTrabajo({ paso = 0, final, quieto }) {
    useFuentes();
    const idP = useIdSvg("punta-ciclo");
    const p = final ? 5 : paso;
    const n = Object.fromEntries(NODOS_CICLO.map((k) => [k.id, k]));
    const flechas = [
      { id: "a1", paso: 2, d: `M${n.casos.x + n.casos.w} ${n.casos.y + 30} C ${n.casos.x + n.casos.w + 40} ${n.casos.y + 30}, ${n.prompt.x - 40} ${n.prompt.y + 42}, ${n.prompt.x - 2} ${n.prompt.y + 42}` },
      { id: "a2", paso: 3, d: `M${n.prompt.x + n.prompt.w} ${n.prompt.y + 42} H ${n.correr.x - 4}` },
      { id: "a3", paso: 4, d: `M${n.correr.x + n.correr.w} ${n.correr.y + 42} C ${n.correr.x + n.correr.w + 60} ${n.correr.y + 42}, ${n.medir.x + 100} ${n.medir.y - 60}, ${n.medir.x + 100} ${n.medir.y - 4}` },
      { id: "a4", paso: 5, d: `M${n.medir.x + 100} ${n.medir.y + n.medir.h} C ${n.medir.x + 100} ${n.medir.y + n.medir.h + 70}, ${n.ajustar.x + n.ajustar.w + 80} ${n.ajustar.y + 42}, ${n.ajustar.x + n.ajustar.w + 4} ${n.ajustar.y + 42}` },
      { id: "a5", paso: 5, d: `M${n.ajustar.x} ${n.ajustar.y + 42} C ${n.ajustar.x - 70} ${n.ajustar.y + 42}, ${n.prompt.x + 110} ${n.prompt.y + n.prompt.h + 90}, ${n.prompt.x + 110} ${n.prompt.y + n.prompt.h + 4}` }
    ];
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama ciclo-trabajo", viewBox: "0 0 1160 440", role: "img", "aria-label": "El orden del trabajo: casos y criterio, prompt, correr, medir y ajustar" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("marker", { id: idP, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "8", markerHeight: "8", orient: "auto" }, /* @__PURE__ */ React.createElement("path", { d: "M0 0 10 5 0 10z", className: "relleno-tenue" }))), flechas.map((f) => /* @__PURE__ */ React.createElement("g", { key: f.id, className: ver(p >= f.paso) }, /* @__PURE__ */ React.createElement("path", { className: "arista", d: f.d, markerEnd: `url(#${idP})` }), p >= 5 && f.paso === 5 ? /* @__PURE__ */ React.createElement(Particulas, { d: f.d, n: 1, c: "var(--acento)", dur: 2.2, r: 5, quieto }) : null)), NODOS_CICLO.map((k, i) => /* @__PURE__ */ React.createElement("g", { key: k.id, className: `nodo ${k.clase} ${ver(p >= i + 1)}` }, /* @__PURE__ */ React.createElement("rect", { x: k.x, y: k.y, width: k.w, height: k.h, rx: 18 }), /* @__PURE__ */ React.createElement("text", { x: k.x + k.w / 2, y: k.y + 32, textAnchor: "middle", dominantBaseline: "central", fontSize: 23, className: "t-titulo" }, k.id === "prompt" && p >= 5 ? "Prompt v2" : k.titulo), /* @__PURE__ */ React.createElement("text", { x: k.x + k.w / 2, y: k.y + 60, textAnchor: "middle", dominantBaseline: "central", fontSize: 16, className: "t-suave" }, k.sub))), /* @__PURE__ */ React.createElement("g", { className: ver(p >= 5) }, /* @__PURE__ */ React.createElement("rect", { x: 64, y: 300, width: 300, height: 44, rx: 22, className: "pastilla" }), /* @__PURE__ */ React.createElement("text", { x: 214, y: 322, textAnchor: "middle", dominantBaseline: "central", fontSize: 17, fontWeight: 700, className: "t-acento" }, "Los casos son la prueba"))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_CICLO, paso: p }));
  }
  var PIE_ARMAR = [
    "Una instrucción vaga da una respuesta vaga. El contador muestra los tokens del prompt.",
    "Paso 1. La instrucción clara dice qué hacer. La respuesta ya trae una categoría.",
    "Paso 2. El contexto dice para qué sirve y qué es prioridad alta. Ahora trae la prioridad.",
    "Paso 3. Tres ejemplos muestran la forma. El modelo los imita.",
    "Paso 4. El formato de salida pide un JSON. Ya se parece al registro esperado.",
    "Paso 5. El prompt completo, con cada pieza de su color. Cada pieza se paga en todas las llamadas."
  ];
  var NOMBRE_PIEZA = { vaga: "Instrucción vaga", clara: "Instrucción clara", contexto: "Contexto", ejemplos: "Tres ejemplos", formato: "Formato de salida" };
  function piezasDelPaso(p) {
    if (p === 0) return ["vaga"];
    return ["clara", "contexto", "ejemplos", "formato"].slice(0, Math.min(p, 4));
  }
  function textoPieza(id) {
    return PASOS_PROMPT.find((k) => k.id === id).texto;
  }
  function contarEnVivo(texto) {
    const g = window.GPTTokenizer_o200k_base;
    return g && g.encode ? g.encode(texto).length : null;
  }
  function RegistroJson({ registro, claseFila }) {
    return /* @__PURE__ */ React.createElement("pre", { className: "json-registro" }, "{\n", CAMPOS.map((c, i) => /* @__PURE__ */ React.createElement("span", { key: c, className: claseFila ? claseFila(c) : "" }, "  ", /* @__PURE__ */ React.createElement("span", { className: "j-clave" }, '"', c, '"'), ": ", registro[c] === null ? /* @__PURE__ */ React.createElement("span", { className: "j-nulo" }, "null") : /* @__PURE__ */ React.createElement("span", { className: "j-texto" }, '"', registro[c], '"'), i < CAMPOS.length - 1 ? "," : "", "\n")), "}");
  }
  function respuestaDe(ids) {
    if (ids.includes("formato")) return { json: true };
    if (ids.includes("ejemplos")) return { texto: RESPUESTAS_PROMPT[3] };
    if (ids.includes("contexto")) return { texto: RESPUESTAS_PROMPT[2] };
    if (ids.includes("clara")) return { texto: RESPUESTAS_PROMPT[1] };
    return { texto: RESPUESTAS_PROMPT[0] };
  }
  function ArmarPrompt({ paso = 0, final, interactivo }) {
    useFuentes();
    const [elegidas, setElegidas] = useState2({ clara: true, contexto: true, ejemplos: false, formato: false });
    const p = final ? 5 : paso;
    let ids;
    if (interactivo) {
      ids = ["clara", "contexto", "ejemplos", "formato"].filter((k) => elegidas[k]);
      if (!ids.includes("clara")) ids = ["vaga", ...ids];
    } else ids = piezasDelPaso(p);
    const prompt = [...ids.map(textoPieza), `<ticket>
${TICKET}
</ticket>`].join("\n\n");
    const vivo = interactivo ? contarEnVivo(prompt) : null;
    const precalculado = interactivo ? null : PASOS_PROMPT[Math.min(p, 4)].tokens_prompt;
    const tokens = vivo != null ? vivo : precalculado;
    const resp = respuestaDe(ids);
    const completo = !interactivo && p >= 5;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, interactivo ? /* @__PURE__ */ React.createElement("div", { className: "taller-controles", role: "group", "aria-label": "Piezas del prompt" }, ["clara", "contexto", "ejemplos", "formato"].map((k) => /* @__PURE__ */ React.createElement("label", { key: k, className: "interruptor", style: { "--c": COLOR_PIEZA[k] } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!elegidas[k], onChange: (e) => setElegidas((s) => ({ ...s, [k]: e.target.checked })) }), /* @__PURE__ */ React.createElement("span", null, NOMBRE_PIEZA[k])))) : null, /* @__PURE__ */ React.createElement("div", { className: `armar-prompt ${completo ? "completo" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "ap-prompt" }, /* @__PURE__ */ React.createElement("div", { className: "ap-cabecera" }, "El prompt"), ids.map((id) => /* @__PURE__ */ React.createElement("div", { key: id, className: "ap-pieza", style: { "--c": COLOR_PIEZA[id] } }, /* @__PURE__ */ React.createElement("span", { className: "ap-rotulo" }, NOMBRE_PIEZA[id]), /* @__PURE__ */ React.createElement("p", null, textoPieza(id)))), /* @__PURE__ */ React.createElement("div", { className: "ap-pieza ap-ticket", style: { "--c": COLOR_PIEZA.ticket } }, /* @__PURE__ */ React.createElement("span", { className: "ap-rotulo" }, "El ticket"), /* @__PURE__ */ React.createElement("p", { className: "ap-una-linea" }, `<ticket> ${TICKET.split(". ")[0]}… </ticket>`))), /* @__PURE__ */ React.createElement("div", { className: "ap-lado" }, /* @__PURE__ */ React.createElement("div", { className: "ap-contador" }, /* @__PURE__ */ React.createElement("b", null, tokens != null ? miles(tokens) : "…"), /* @__PURE__ */ React.createElement("span", null, "tokens de entrada"), /* @__PURE__ */ React.createElement("small", null, vivo != null ? "Contados en vivo con o200k_base" : `Contados con o200k_base (${tokens_s3_default.biblioteca})`)), /* @__PURE__ */ React.createElement("div", { className: `ap-respuesta ${resp.json ? "es-json" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "ap-resp-cabecera" }, /* @__PURE__ */ React.createElement("span", { className: "ap-rotulo" }, "La respuesta"), /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Respuesta ilustrativa" })), resp.json ? /* @__PURE__ */ React.createElement(RegistroJson, { registro: REGISTRO }) : /* @__PURE__ */ React.createElement("p", null, resp.texto), completo ? /* @__PURE__ */ React.createElement("div", { className: "ap-sello" }, "≈ el registro esperado ✓") : null))), interactivo ? /* @__PURE__ */ React.createElement("p", { className: "pie-programa" }, "Prende y apaga las piezas. Los tokens se cuentan en vivo; las respuestas son ilustrativas.") : /* @__PURE__ */ React.createElement(Pie, { textos: PIE_ARMAR, paso: p }));
  }
  var PROMPT_DEMO = `${textoPieza("clara")}

${textoPieza("contexto")}

<ticket>
${TICKET}
</ticket>`;
  function DemoTokens() {
    const [texto, setTexto] = useState2(PROMPT_DEMO);
    const hay = !!(window.GPTTokenizer_o200k_base && window.GPTTokenizer_o200k_base.encode);
    const n = useMemo(() => hay ? window.GPTTokenizer_o200k_base.encode(texto).length : 0, [texto, hay]);
    const mil = 1e3 * n * HAIKU.entrada / 1e6;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo demo-tokens" }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: texto,
        onChange: (e) => setTexto(e.target.value),
        onKeyDown: (e) => e.stopPropagation(),
        spellCheck: false,
        "aria-label": "Escribe o pega un prompt"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "demo-cifras" }, /* @__PURE__ */ React.createElement("div", { className: "tarjeta acento" }, /* @__PURE__ */ React.createElement("b", null, hay ? miles(n) : "—"), /* @__PURE__ */ React.createElement("span", null, "tokens de entrada, con o200k_base")), /* @__PURE__ */ React.createElement("div", { className: "tarjeta acento-2" }, /* @__PURE__ */ React.createElement("b", null, hay ? usd(mil, 4) : "—"), /* @__PURE__ */ React.createElement("span", null, "por mil llamadas con este prompt, solo la entrada de Claude Haiku 5.5")), /* @__PURE__ */ React.createElement("p", { className: "chico texto-suave" }, "Claude cuenta con su propio tokenizer: la cifra real puede ser distinta.")));
  }

  // src/json.jsx
  var { useState: useState3 } = React;
  var PIE_REGISTRO = [
    "Un ticket de soporte, escrito por una persona. El programa necesita sus datos en campos.",
    "Paso 1. El esquema viaja con la petición: los campos, sus tipos y sus valores permitidos.",
    "Paso 2. El modelo devuelve un JSON con los cinco campos.",
    "Paso 3. La validación revisa cada campo contra el esquema. Todos cumplen.",
    "Paso 4. Otra respuesta trae un valor no permitido. La validación la detecta y el programa reintenta.",
    "Paso 5. Si un dato no está en el ticket, el campo queda vacío. No se inventa."
  ];
  var PISTAS = [
    { texto: "la app se cierra", campo: "categoria" },
    { texto: "Android 15", campo: "plataforma" },
    { texto: "versión 4.2.1", campo: "version_app" }
  ];
  function TicketResaltado({ activo }) {
    let partes = [TICKET];
    PISTAS.forEach((k) => {
      partes = partes.flatMap((t) => {
        if (typeof t !== "string" || !t.includes(k.texto)) return [t];
        const [a, b] = t.split(k.texto);
        return [a, { ...k }, b];
      });
    });
    return /* @__PURE__ */ React.createElement("p", { className: "tr-texto" }, partes.map((t, i) => typeof t === "string" ? /* @__PURE__ */ React.createElement("span", { key: i }, t) : /* @__PURE__ */ React.createElement("mark", { key: i, className: activo ? "pista visto" : "pista" }, t.texto)));
  }
  function TextoRegistro({ paso = 0, final }) {
    useFuentes();
    const p = final ? 5 : paso;
    const malo = p === 4;
    const error = ERRORES.valor_no_permitido.errores[0].mensaje;
    const valor = (c) => malo && c === "prioridad" ? "urgente" : REGISTRO[c];
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "texto-registro" }, /* @__PURE__ */ React.createElement("div", { className: "tr-ticket tarjeta" }, /* @__PURE__ */ React.createElement("span", { className: "tr-rotulo" }, "Ticket de soporte · FotoNube (app ficticia)"), /* @__PURE__ */ React.createElement(TicketResaltado, { activo: p >= 2 })), /* @__PURE__ */ React.createElement("div", { className: "tr-medio" }, /* @__PURE__ */ React.createElement("div", { className: `tr-esquema ${ver(p >= 1)} ${p >= 1 ? "viaja" : ""}` }, /* @__PURE__ */ React.createElement("b", null, "Esquema"), ESQUEMA.map((e) => /* @__PURE__ */ React.createElement("span", { key: e.campo }, e.campo, e.obligatorio ? "" : " (opcional)"))), /* @__PURE__ */ React.createElement("div", { className: "tr-modelo" }, "Modelo"), /* @__PURE__ */ React.createElement("div", { className: `tr-flecha ${p >= 2 ? "activa" : ""}`, "aria-hidden": "true" })), /* @__PURE__ */ React.createElement("div", { className: `tr-registro tarjeta ${ver(p >= 2)} ${malo ? "con-error" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "tr-cabecera" }, /* @__PURE__ */ React.createElement("span", { className: "tr-rotulo" }, malo ? "Otra respuesta: con un error" : "La respuesta: un registro JSON"), p >= 2 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Respuesta ilustrativa" }) : null), CAMPOS.map((c, i) => {
      const mal = malo && c === "prioridad";
      const estado = p >= 3 ? mal ? "mal" : "bien" : "";
      return /* @__PURE__ */ React.createElement("div", { key: c, className: `tr-fila ${estado}`, style: { transitionDelay: p === 3 ? `${i * 0.18}s` : "0s" } }, /* @__PURE__ */ React.createElement("code", { className: "j-clave" }, c), /* @__PURE__ */ React.createElement("code", { className: mal ? "j-error" : "j-texto" }, '"', valor(c), '"'), /* @__PURE__ */ React.createElement("span", { className: "tr-marca", "aria-label": estado === "mal" ? "No cumple" : estado === "bien" ? "Cumple" : "" }, estado === "mal" ? "✗" : estado === "bien" ? "✓" : ""));
    }), /* @__PURE__ */ React.createElement("div", { className: `tr-error ${ver(malo)}` }, /* @__PURE__ */ React.createElement("b", null, "Mensaje real de Pydantic:"), " ", /* @__PURE__ */ React.createElement("code", null, error), /* @__PURE__ */ React.createElement("span", { className: "tr-reintento" }, "↻ El programa reintenta")))), /* @__PURE__ */ React.createElement("div", { className: `tr-vacio tarjeta ${ver(p >= 5)}` }, /* @__PURE__ */ React.createElement("span", null, "Otro ticket: «La galería tarda en abrir en el iPhone.»"), /* @__PURE__ */ React.createElement("code", null, /* @__PURE__ */ React.createElement("span", { className: "j-clave" }, "version_app"), ": ", /* @__PURE__ */ React.createElement("span", { className: "j-nulo" }, "null")), /* @__PURE__ */ React.createElement("b", { className: "texto-exito" }, "✓ vacío, no inventado")), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_REGISTRO, paso: p }));
  }
  var PIE_VALIDOS = [
    "El modelo va escribiendo el JSON. El siguiente token es el valor de «prioridad».",
    "Paso 1. El esquema dice qué valores puede tener: alta, media o baja.",
    "Paso 2. Con decodificación restringida, los tokens que rompen el esquema se apagan. Los demás se reparten la probabilidad.",
    "Paso 3. El modelo elige entre los permitidos. El JSON sigue cumpliendo el esquema."
  ];
  var CANDIDATOS = [
    { t: "alta", p: 41, valido: true },
    { t: "urgente", p: 24, valido: false },
    { t: "media", p: 13, valido: true },
    { t: "crítica", p: 11, valido: false },
    { t: "Alta", p: 6, valido: false },
    { t: "baja", p: 5, valido: true }
  ];
  function TokensValidos({ paso = 0, final }) {
    useFuentes();
    const p = final ? 3 : paso;
    const sumaValidos = CANDIDATOS.filter((c) => c.valido).reduce((s, c) => s + c.p, 0);
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "tokens-validos" }, /* @__PURE__ */ React.createElement("pre", { className: "tv-json" }, /* @__PURE__ */ React.createElement("span", { className: "j-clave" }, '{"categoria"'), ": ", /* @__PURE__ */ React.createElement("span", { className: "j-texto" }, '"fallo de la app"'), ", ", /* @__PURE__ */ React.createElement("span", { className: "j-clave" }, '"prioridad"'), ': "', /* @__PURE__ */ React.createElement("span", { className: `tv-elegido ${p >= 3 ? "visto" : ""}` }, 'alta"'), /* @__PURE__ */ React.createElement("span", { className: `tv-cursor ${p >= 3 ? "oculto" : ""}` }, "▌")), /* @__PURE__ */ React.createElement("div", { className: `tv-esquema ${ver(p >= 1)}` }, /* @__PURE__ */ React.createElement("span", null, "Esquema:"), " ", /* @__PURE__ */ React.createElement("code", null, "prioridad"), " es ", /* @__PURE__ */ React.createElement("b", null, "alta"), ", ", /* @__PURE__ */ React.createElement("b", null, "media"), " o ", /* @__PURE__ */ React.createElement("b", null, "baja")), /* @__PURE__ */ React.createElement("div", { className: "tv-barras" }, CANDIDATOS.map((c) => {
      const apagado = p >= 2 && !c.valido;
      const pct = p >= 2 ? c.valido ? Math.round(100 * c.p / sumaValidos) : 0 : c.p;
      return /* @__PURE__ */ React.createElement("div", { key: c.t, className: `tv-fila ${apagado ? "apagado" : ""} ${p >= 3 && c.t === "alta" ? "ganador" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "tv-token" }, "«", c.t, "»"), /* @__PURE__ */ React.createElement("div", { className: "tv-pista" }, /* @__PURE__ */ React.createElement("div", { className: "tv-barra", style: { width: `${pct * 1.6}%` } })), /* @__PURE__ */ React.createElement("span", { className: "tv-pct" }, apagado ? "fuera del esquema" : `${pct} %`));
    }))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_VALIDOS, paso: p }), /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Probabilidades ilustrativas" })));
  }
  var VALORES_MALOS = { categoria: "error grave", prioridad: "urgente", plataforma: "Windows", version_app: 4.21, resumen: 42 };
  function validar(registro) {
    const errores = [];
    ESQUEMA.forEach((e) => {
      const v = registro[e.campo];
      if (v === void 0) {
        if (e.obligatorio) errores.push({ campo: e.campo, es: "Falta un campo obligatorio.", en: "Field required" });
        return;
      }
      if (v === null) {
        if (e.obligatorio) errores.push({ campo: e.campo, es: "El campo no puede quedar vacío.", en: "Input should be a valid string" });
        return;
      }
      if (e.valores) {
        if (!e.valores.includes(v)) {
          const lista = e.valores.map((x) => `'${x}'`);
          const en = `Input should be ${lista.slice(0, -1).join(", ")} or ${lista[lista.length - 1]}`;
          errores.push({ campo: e.campo, es: "Ese valor no está permitido.", en });
        }
        return;
      }
      if (typeof v !== "string") errores.push({ campo: e.campo, es: "El tipo no coincide: debe ser texto.", en: "Input should be a valid string" });
    });
    return errores;
  }
  function Validador() {
    useFuentes();
    const [registro, setRegistro] = useState3({ ...REGISTRO });
    const poner = (campo, valor) => setRegistro((r) => {
      const n = { ...r };
      if (valor === void 0) delete n[campo];
      else n[campo] = valor;
      return n;
    });
    const soltar = (e) => e.currentTarget.blur();
    const errores = validar(registro);
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo validador" }, /* @__PURE__ */ React.createElement("div", { className: "val-registro tarjeta" }, CAMPOS.map((c) => {
      const e = ESQUEMA.find((x) => x.campo === c);
      const v = registro[c];
      const malo = errores.some((x) => x.campo === c);
      return /* @__PURE__ */ React.createElement("div", { key: c, className: `val-fila ${malo ? "mal" : "bien"}` }, /* @__PURE__ */ React.createElement("code", { className: "j-clave" }, c), /* @__PURE__ */ React.createElement("code", { className: malo ? "j-error" : v === null ? "j-nulo" : "j-texto" }, v === void 0 ? "(falta)" : v === null ? "null" : typeof v === "string" ? `"${v}"` : String(v)), /* @__PURE__ */ React.createElement("div", { className: "val-botones" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: (ev) => {
        poner(c, void 0);
        soltar(ev);
      } }, "Quitar"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: (ev) => {
        poner(c, VALORES_MALOS[c]);
        soltar(ev);
      } }, e.valores ? "Valor no permitido" : "Otro tipo"), !e.obligatorio ? /* @__PURE__ */ React.createElement("button", { type: "button", onClick: (ev) => {
        poner(c, null);
        soltar(ev);
      } }, "Vacío") : null, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: (ev) => {
        poner(c, REGISTRO[c]);
        soltar(ev);
      } }, "Restaurar")));
    })), /* @__PURE__ */ React.createElement("div", { className: `val-resultado tarjeta ${errores.length ? "alerta" : "exito"}`, "aria-live": "polite" }, errores.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "mediano" }, /* @__PURE__ */ React.createElement("b", { className: "texto-exito" }, "✓ El registro cumple el esquema.")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "mediano" }, /* @__PURE__ */ React.createElement("b", { className: "texto-alerta" }, "✗ ", errores.length, " ", errores.length === 1 ? "error" : "errores")), errores.map((x) => /* @__PURE__ */ React.createElement("p", { key: x.campo, className: "chico" }, /* @__PURE__ */ React.createElement("code", null, x.campo), ": ", x.es, " ", /* @__PURE__ */ React.createElement("span", { className: "texto-suave" }, "Pydantic dice: «", x.en, "»."))))));
  }

  // src/api.jsx
  var PIE_CONV = [
    "Turno 1: el programa envía el prompt de sistema y la primera pregunta. El modelo responde.",
    "Turno 2: la API no recuerda. El programa reenvía todo lo anterior y agrega la pregunta nueva.",
    "Turno 3: la pila crece. Cada llamada lleva la conversación completa.",
    "Cada llamada paga otra vez toda la historia. La llamada 4 envía casi cuatro veces los tokens de la 1."
  ];
  var NOMBRE_ROL = { system: "Sistema", user: "Usuario", assistant: "Asistente" };
  function Conversacion({ paso = 0, final }) {
    useFuentes();
    const p = final ? 3 : paso;
    const llamadas = CONVERSACION.llamadas;
    const llamada = Math.min(p, 2) + 1;
    const turnos = CONVERSACION.turnos.slice(0, 2 * llamada - 1);
    const respuesta = CONVERSACION.turnos[2 * llamada - 1];
    const maximo = Math.max(...llamadas.map((l) => l.tokens_entrada));
    const visibles = p >= 3 ? llamadas.length : llamada;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "conversacion" }, /* @__PURE__ */ React.createElement("div", { className: "cv-pila" }, /* @__PURE__ */ React.createElement("div", { className: "cv-cabecera" }, "Llamada ", llamada, ": lo que envía el programa"), /* @__PURE__ */ React.createElement("div", { className: `cv-mensaje rol-system ${llamada > 1 ? "reenviado" : "nuevo"}` }, /* @__PURE__ */ React.createElement("span", { className: "cv-rol" }, "Sistema", /* @__PURE__ */ React.createElement("em", null, llamada > 1 ? " · se reenvía" : " · nuevo")), /* @__PURE__ */ React.createElement("p", null, CONVERSACION.sistema.texto)), turnos.map((t, i) => {
      const nuevo = i === turnos.length - 1;
      return /* @__PURE__ */ React.createElement("div", { key: i, className: `cv-mensaje rol-${t.rol} ${nuevo ? "nuevo" : "reenviado"}` }, /* @__PURE__ */ React.createElement("span", { className: "cv-rol" }, NOMBRE_ROL[t.rol], !nuevo ? /* @__PURE__ */ React.createElement("em", null, " · se reenvía") : /* @__PURE__ */ React.createElement("em", null, " · nuevo")), /* @__PURE__ */ React.createElement("p", null, t.texto));
    }), respuesta ? /* @__PURE__ */ React.createElement("div", { className: "cv-respuesta" }, /* @__PURE__ */ React.createElement("span", { className: "cv-rol" }, "Respuesta del modelo ", /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Ilustrativa" })), /* @__PURE__ */ React.createElement("p", null, respuesta.texto)) : null), /* @__PURE__ */ React.createElement("div", { className: "cv-grafico" }, /* @__PURE__ */ React.createElement("div", { className: "cv-cabecera" }, "Tokens de entrada de cada llamada"), llamadas.map((l, i) => /* @__PURE__ */ React.createElement("div", { key: l.turno, className: `cv-barra-fila ${ver(i < visibles)}` }, /* @__PURE__ */ React.createElement("span", null, "Llamada ", l.turno), /* @__PURE__ */ React.createElement("div", { className: "cv-pista" }, /* @__PURE__ */ React.createElement("div", { className: "cv-barra", style: { width: `${100 * l.tokens_entrada / maximo}%` } })), /* @__PURE__ */ React.createElement("b", null, miles(l.tokens_entrada)))), /* @__PURE__ */ React.createElement("div", { className: `cv-nota ${ver(p >= 3)}` }, /* @__PURE__ */ React.createElement("p", null, "Mil conversaciones de cuatro turnos con Claude Haiku 5.5: ", /* @__PURE__ */ React.createElement("b", null, usd(llamadas.reduce((s, l) => s + l.costo_por_mil_llamadas_haiku, 0), 4)), "."), /* @__PURE__ */ React.createElement("small", null, "Tokens reales del texto de los mensajes, con o200k_base. Cada API agrega unos pocos tokens por mensaje. Precios del Anexo G.1.")))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_CONV, paso: p }));
  }
  var PIE_TABLERO = [
    "Una llamada tiene controles además de los mensajes. Estos cinco son los que más importan.",
    "Control 1. El máximo de tokens de salida. Si el modelo lo alcanza, la respuesta se corta.",
    "Control 2. Las secuencias de parada: un texto que termina la respuesta.",
    "Control 3. La temperatura. Con los modelos del curso, ese control queda apagado.",
    "Control 4. El esfuerzo de razonamiento: cuánto piensa el modelo antes de responder. Esos tokens se cobran.",
    "Control 5. El tiempo de espera y los reintentos: una llamada puede fallar o tardar."
  ];
  var CONTROLES = [
    { id: "max", nombre: "Máximo de tokens de salida", claude: "max_tokens", gemini: "max_tokens" },
    { id: "stop", nombre: "Secuencias de parada", claude: "stop", gemini: "stop" },
    { id: "temp", nombre: "Temperatura", claude: "temperature", gemini: "temperature", apagado: true },
    { id: "razon", nombre: "Esfuerzo de razonamiento", claude: "effort", gemini: "thinking_level" },
    { id: "tiempo", nombre: "Tiempo de espera y reintentos", claude: "timeout · max_retries", gemini: "timeout · max_retries" }
  ];
  function Efecto({ id }) {
    if (id === "max")
      return /* @__PURE__ */ React.createElement("div", { className: "tb-efecto" }, /* @__PURE__ */ React.createElement("pre", { className: "json-registro corto" }, '{"categoria": "fallo de la app",\n "prioridad": "alta",\n "resumen": "La app se cierra al su', /* @__PURE__ */ React.createElement("span", { className: "tb-tijera" }, "✂")), /* @__PURE__ */ React.createElement("p", null, "La respuesta se corta y el JSON queda incompleto: ", /* @__PURE__ */ React.createElement("b", null, "no valida"), "."), /* @__PURE__ */ React.createElement("p", { className: "chico" }, "Claude lo informa con ", /* @__PURE__ */ React.createElement("code", null, 'stop_reason: "max_tokens"'), ". Gemini, con ", /* @__PURE__ */ React.createElement("code", null, 'finish_reason: "MAX_TOKENS"'), "."), /* @__PURE__ */ React.createElement("p", { className: "chico" }, "En los dos, el razonamiento cuenta dentro de ese máximo."));
    if (id === "stop")
      return /* @__PURE__ */ React.createElement("div", { className: "tb-efecto" }, /* @__PURE__ */ React.createElement("pre", { className: "json-registro corto" }, "Categoría: fallo de la app\nPrioridad: alta", /* @__PURE__ */ React.createElement("span", { className: "tb-parada" }, " ⏹")), /* @__PURE__ */ React.createElement("p", null, "Con la secuencia ", /* @__PURE__ */ React.createElement("code", null, "###"), ", la respuesta termina al llegar a ella. Sirve para cortar a tiempo una respuesta de texto."), /* @__PURE__ */ React.createElement("p", { className: "chico" }, "Gemini no incluye la secuencia en el texto. Claude informa cuál fue, en ", /* @__PURE__ */ React.createElement("code", null, "stop_sequence"), "."));
    if (id === "temp")
      return /* @__PURE__ */ React.createElement("div", { className: "tb-efecto" }, /* @__PURE__ */ React.createElement("p", { className: "tb-candado" }, "🔒 Control apagado"), /* @__PURE__ */ React.createElement("p", null, "Claude Haiku 5.5 rechaza ", /* @__PURE__ */ React.createElement("code", null, "temperature"), ", ", /* @__PURE__ */ React.createElement("code", null, "top_p"), " y ", /* @__PURE__ */ React.createElement("code", null, "top_k"), "."), /* @__PURE__ */ React.createElement("p", null, "En Gemini 3.5 Flash-Lite son obsoletos: la API los ignora."), /* @__PURE__ */ React.createElement("p", { className: "chico" }, "LangChain no envía la temperatura a Gemini 3 si no la fijas. A Gemini 2.5 le envía 0.7."));
    if (id === "razon")
      return /* @__PURE__ */ React.createElement("div", { className: "tb-efecto" }, /* @__PURE__ */ React.createElement("div", { className: "tb-barras-razon" }, /* @__PURE__ */ React.createElement("div", { className: "tb-br razon", style: { width: "62%" } }, "Tokens de razonamiento"), /* @__PURE__ */ React.createElement("div", { className: "tb-br respuesta", style: { width: "22%" } }, "Respuesta")), /* @__PURE__ */ React.createElement("p", null, "Los dos se cobran como salida."), /* @__PURE__ */ React.createElement("p", { className: "chico" }, "Claude Haiku 5.5: ", /* @__PURE__ */ React.createElement("code", null, "effort"), ", de low a max; por defecto, medium. Gemini 3.5 Flash-Lite: ", /* @__PURE__ */ React.createElement("code", null, "thinking_level"), "; por defecto, minimal. Gemini 2.5 Flash-Lite: ", /* @__PURE__ */ React.createElement("code", null, "thinking_budget"), "; por defecto no razona."), /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Proporción ilustrativa" }));
    return /* @__PURE__ */ React.createElement("div", { className: "tb-efecto" }, /* @__PURE__ */ React.createElement("p", { className: "tb-reloj" }, "⏱ La llamada tarda demasiado…"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("code", null, "timeout"), " fija cuántos segundos esperar. ", /* @__PURE__ */ React.createElement("code", null, "max_retries"), ", cuántas veces reintentar."), /* @__PURE__ */ React.createElement("p", { className: "chico" }, "Por defecto, LangChain reintenta 2 veces con Claude y 6 con Gemini."));
  }
  function Tablero({ paso = 0, final }) {
    useFuentes();
    const p = final ? 5 : paso;
    const actual = p >= 1 ? CONTROLES[Math.min(p, 5) - 1] : null;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "tablero" }, /* @__PURE__ */ React.createElement("div", { className: "tb-controles" }, /* @__PURE__ */ React.createElement("div", { className: "tb-cabecera" }, /* @__PURE__ */ React.createElement("span", null, "Control"), /* @__PURE__ */ React.createElement("span", null, "En LangChain, con Claude"), /* @__PURE__ */ React.createElement("span", null, "Con Gemini")), CONTROLES.map((c, i) => {
      const on = final ? true : p === i + 1;
      const visto = final || p >= i + 1;
      return /* @__PURE__ */ React.createElement("div", { key: c.id, className: `tb-control ${on ? "encendido" : ""} ${visto ? "visto" : ""} ${c.apagado ? "bloqueado" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "tb-perilla", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("b", null, c.nombre), /* @__PURE__ */ React.createElement("code", null, c.claude), /* @__PURE__ */ React.createElement("code", null, c.gemini));
    })), /* @__PURE__ */ React.createElement("div", { className: "tb-panel tarjeta" }, actual && !final ? /* @__PURE__ */ React.createElement(Efecto, { id: actual.id }) : final ? /* @__PURE__ */ React.createElement(Efecto, { id: "max" }) : /* @__PURE__ */ React.createElement("p", { className: "texto-suave" }, "Cada clic enciende un control y muestra su efecto."))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_TABLERO, paso: p }));
  }
  var PIE_VARIANTES = [
    "Cuatro variantes del mismo prompt, sobre los mismos casos. Cada clic llena una columna.",
    "Columna 1. Los tokens de entrada de cada prompt. Son reales: los ejemplos son los que más agregan.",
    "Columna 2. Los aciertos en 30 intentos: diez casos, tres veces cada uno. Son ilustrativos.",
    "Columna 3. El costo por mil aciertos. La cadena de pensamiento escribe mucho más, y eso se paga.",
    "Columna 4. La latencia: razonar en voz alta también tarda más. Tu laboratorio da tus propias cifras."
  ];
  var ILUSTRATIVO_VARIANTES = {
    sin_ejemplos: { salida: 6, aciertos: 21, latencia: 0.8 },
    tres_ejemplos: { salida: 3, aciertos: 26, latencia: 0.9 },
    formato: { salida: 2, aciertos: 24, latencia: 0.7 },
    cadena: { salida: 110, aciertos: 26, latencia: 2.6 }
  };
  var INTENTOS = 30;
  function Variantes({ paso = 0, final }) {
    useFuentes();
    const p = final ? 4 : paso;
    const filas = VARIANTES.lista.map((v) => {
      const il = ILUSTRATIVO_VARIANTES[v.id];
      const total = INTENTOS * costo(v.tokens_entrada, il.salida);
      return { ...v, ...il, porMilAciertos: 1e3 * total / il.aciertos };
    });
    const columnas = [
      { titulo: "Tokens de entrada", real: true, valor: (f) => miles(f.tokens_entrada) },
      { titulo: "Aciertos", valor: (f) => `${f.aciertos} de ${INTENTOS}` },
      { titulo: "Costo por mil aciertos", valor: (f) => usd(f.porMilAciertos, 3) },
      { titulo: "Latencia media", valor: (f) => `${f.latencia.toFixed(1)} s` }
    ];
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("table", { className: "tabla-variantes" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Variante"), columnas.map((c, i) => /* @__PURE__ */ React.createElement("th", { key: c.titulo, className: ver(p >= i + 1) }, c.titulo, /* @__PURE__ */ React.createElement("small", null, c.real ? "real, con o200k_base" : "ilustrativo"))))), /* @__PURE__ */ React.createElement("tbody", null, filas.map((f) => /* @__PURE__ */ React.createElement("tr", { key: f.id, className: f.id === "cadena" ? "fila-cadena" : "" }, /* @__PURE__ */ React.createElement("th", null, f.nombre), columnas.map((c, i) => /* @__PURE__ */ React.createElement("td", { key: c.titulo, className: ver(p >= i + 1) }, c.valor(f))))))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_VARIANTES, paso: p }), /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Aciertos y latencias ilustrativos" })));
  }
  var PIE_CUENTA = [
    "Antes de correr un experimento, haz la cuenta. Tres números bastan.",
    "Paso 1. Los tokens de cada llamada: lo que entra y lo que sale.",
    "Paso 2. Cuántas llamadas: casos × variantes × intentos.",
    "Paso 3. El costo total, con los precios del Anexo G.1. La cadena de pensamiento multiplica la salida."
  ];
  function CuentaPrevia({ paso = 0, final }) {
    useFuentes();
    const p = final ? 3 : paso;
    const conEjemplos = VARIANTES.lista.find((v) => v.id === "tres_ejemplos");
    const conCadena = VARIANTES.lista.find((v) => v.id === "cadena");
    const llamadas = 10 * 4 * 3;
    const escenarios = [
      { nombre: "Con tres ejemplos", entrada: conEjemplos.tokens_entrada, salida: ILUSTRATIVO_VARIANTES.tres_ejemplos.salida },
      { nombre: "Con cadena de pensamiento", entrada: conCadena.tokens_entrada, salida: ILUSTRATIVO_VARIANTES.cadena.salida }
    ];
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "cuenta-previa" }, escenarios.map((e) => {
      const porLlamada = costo(e.entrada, e.salida);
      return /* @__PURE__ */ React.createElement("div", { key: e.nombre, className: "cp-escenario tarjeta" }, /* @__PURE__ */ React.createElement("h3", null, e.nombre), /* @__PURE__ */ React.createElement("div", { className: `cp-fila ${ver(p >= 1)}` }, /* @__PURE__ */ React.createElement("span", null, "Tokens por llamada"), /* @__PURE__ */ React.createElement("b", null, miles(e.entrada), " de entrada + ", miles(e.salida), " de salida")), /* @__PURE__ */ React.createElement("div", { className: `cp-fila ${ver(p >= 2)}` }, /* @__PURE__ */ React.createElement("span", null, "Llamadas"), /* @__PURE__ */ React.createElement("b", null, "10 casos × 4 variantes × 3 intentos = ", llamadas)), /* @__PURE__ */ React.createElement("div", { className: `cp-fila total ${ver(p >= 3)}` }, /* @__PURE__ */ React.createElement("span", null, "Costo con Claude Haiku 5.5"), /* @__PURE__ */ React.createElement("b", null, usd(llamadas * porLlamada, 4))));
    })), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_CUENTA, paso: p }), /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Tokens de salida ilustrativos" })), /* @__PURE__ */ React.createElement("p", { className: "chico texto-suave cp-nota" }, "Tokens de entrada reales, con o200k_base. Precio: USD ", HAIKU.entrada.toFixed(2), " por millón de tokens de entrada y ", HAIKU.salida.toFixed(2), " de salida."));
  }

  // src/codigo.jsx
  var LINEAS_PROGRAMA = [
    'modelo = init_chat_model("anthropic:claude-haiku-5-5")',
    'lector = modelo.with_structured_output(Ticket, method="json_schema", include_raw=True)',
    "casos = [",
    '    {"id": "T-01", "texto": "La app se cierra al subir una foto."},',
    '    {"id": "T-02", "texto": "Quiero ordenar los álbumes por fecha."},',
    "]",
    "def clasificar(texto):",
    '    return lector.invoke([("system", INSTRUCCION), ("user", texto)])',
    "resultados = {}",
    "for caso in casos:",
    '    respuesta = clasificar(caso["texto"])',
    '    resultados[caso["id"]] = respuesta["parsed"]'
  ];
  var PASOS_LECTURA = [
    { lineas: [], concepto: "", texto: "Un programa de 12 líneas. Lo leemos línea por línea, sin escribir código." },
    { lineas: [1, 2], concepto: "Variable", texto: "Dos variables. «modelo» guarda el modelo. «lector» guarda el modelo que responde con el esquema Ticket." },
    { lineas: [3, 4, 5, 6], concepto: "Lista y diccionario", texto: "Una lista con dos casos. Cada caso es un diccionario: claves y valores, como un JSON." },
    { lineas: [7, 8], concepto: "Función", texto: "Una función. Recibe un texto, arma los mensajes de sistema y de usuario, y llama al modelo." },
    { lineas: [9], concepto: "Diccionario vacío", texto: "Un diccionario vacío. Ahí se van a guardar los resultados." },
    { lineas: [10], concepto: "Ciclo", texto: "Un ciclo. Repite las dos líneas de abajo para cada caso de la lista." },
    { lineas: [11], concepto: "Llamar a la función", texto: "Llama a la función con el texto del caso. La respuesta trae raw, parsed y parsing_error." },
    { lineas: [12], concepto: "Guardar en el diccionario", texto: "Guarda el registro validado, «parsed», con la clave del caso. Por ejemplo, T-01." }
  ];
  var PALABRAS = /* @__PURE__ */ new Set(["def", "for", "in", "return", "True", "False", "None"]);
  function resaltar(linea) {
    const partes = [];
    const re = /("[^"]*")|(\b[A-Za-z_][A-Za-z_0-9]*\b)(?=\()|(\b[A-Za-z_][A-Za-z_0-9]*\b)|([^"A-Za-z_]+)/g;
    let m;
    let i = 0;
    while (m = re.exec(linea)) {
      if (m[1]) partes.push(/* @__PURE__ */ React.createElement("span", { key: i++, className: "c-texto" }, m[1]));
      else if (m[2]) partes.push(/* @__PURE__ */ React.createElement("span", { key: i++, className: "c-funcion" }, m[2]));
      else if (m[3]) partes.push(/* @__PURE__ */ React.createElement("span", { key: i++, className: PALABRAS.has(m[3]) ? "c-clave" : "" }, m[3]));
      else partes.push(/* @__PURE__ */ React.createElement("span", { key: i++ }, m[4]));
    }
    return partes;
  }
  var CONCEPTO_DE_LINEA = {};
  PASOS_LECTURA.forEach((k) => {
    if (k.lineas.length) CONCEPTO_DE_LINEA[k.lineas[0]] = k.concepto;
  });
  function LeerPrograma({ paso = 0, final }) {
    useFuentes();
    const p = final ? 0 : paso;
    const actual = PASOS_LECTURA[Math.min(p, PASOS_LECTURA.length - 1)];
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: `leer-programa ${p >= 1 ? "leyendo" : ""} ${final ? "final" : ""}` }, /* @__PURE__ */ React.createElement("pre", { className: "lp-codigo", "aria-label": "Programa de 12 líneas en Python" }, LINEAS_PROGRAMA.map((l, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `lp-linea ${actual.lineas.includes(i + 1) ? "activa" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "lp-numero" }, i + 1), /* @__PURE__ */ React.createElement("span", { className: "lp-texto" }, resaltar(l)), final && CONCEPTO_DE_LINEA[i + 1] ? /* @__PURE__ */ React.createElement("span", { className: "lp-concepto-linea" }, CONCEPTO_DE_LINEA[i + 1]) : null))), !final ? /* @__PURE__ */ React.createElement("div", { className: "lp-explicacion tarjeta acento", "aria-live": "polite" }, actual.concepto ? /* @__PURE__ */ React.createElement("span", { className: "lp-concepto" }, actual.concepto) : null, /* @__PURE__ */ React.createElement("p", null, actual.texto)) : null), /* @__PURE__ */ React.createElement("p", { className: "chico texto-suave lp-nota" }, "Arriba del programa van los import, la instrucción y el esquema Ticket del bloque 3.1."));
  }
  var PIE_PRUEBAS2 = [
    "Las pruebas de la capa 2 se arman como una cuadrícula. Cada clic agrega una fila.",
    "Fila 1. Conectar por API el modelo que eligieron en la capa 1, con la clave del curso.",
    "Fila 2. Validar el esquema en los diez casos: ¿cada respuesta cumple el esquema?",
    "Fila 3. Comparar los campos de cada caso con su registro esperado.",
    "Fila 4. Los tres casos de robustez: entrada incompleta, respuesta mal formada y fuera de alcance.",
    "Fila 5. Cada prueba queda en la tabla de resultados, con las columnas del Anexo J.7."
  ];
  var PATRON_ESQUEMA = [true, true, true, true, true, true, false, true, true, true];
  var PATRON_CAMPOS = [true, true, true, false, true, true, false, true, true, true];
  var ROBUSTEZ = [
    { rotulo: "Entrada incompleta", pasa: true },
    { rotulo: "Respuesta mal formada", pasa: true },
    { rotulo: "Fuera de alcance", pasa: false }
  ];
  var COLUMNAS_J7 = ["caso_id", "etapa", "tipo_prueba", "esperado", "obtenido", "resultado", "razon_fallo", "modelo", "tokens_entrada", "tokens_salida", "costo_usd", "latencia_s"];
  function Celdas({ patron, encendidas, rotulos }) {
    return /* @__PURE__ */ React.createElement("div", { className: "celdas2" }, patron.map((ok, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: `celda2 ${encendidas ? ok ? "pasa" : "falla" : ""}`, style: { transitionDelay: `${i * 0.06}s` } }, /* @__PURE__ */ React.createElement("small", null, rotulos ? rotulos[i] : `C${String(i + 1).padStart(2, "0")}`), /* @__PURE__ */ React.createElement("b", null, encendidas ? ok ? "✓" : "✗" : ""))));
  }
  function PruebasCapa2({ paso = 0, final }) {
    useFuentes();
    const p = final ? 5 : paso;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "pruebas-capa2" }, /* @__PURE__ */ React.createElement("div", { className: `fila-prueba2 ${p >= 1 ? "activa" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rotulo-prueba2" }, /* @__PURE__ */ React.createElement("b", null, "Conectar por API"), /* @__PURE__ */ React.createElement("small", null, "el modelo de la capa 1")), /* @__PURE__ */ React.createElement(Celdas, { patron: [true], encendidas: p >= 1, rotulos: ["Llamada"] })), /* @__PURE__ */ React.createElement("div", { className: `fila-prueba2 ${p >= 2 ? "activa" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rotulo-prueba2" }, /* @__PURE__ */ React.createElement("b", null, "Validar el esquema"), /* @__PURE__ */ React.createElement("small", null, "los diez casos")), /* @__PURE__ */ React.createElement(Celdas, { patron: PATRON_ESQUEMA, encendidas: p >= 2 })), /* @__PURE__ */ React.createElement("div", { className: `fila-prueba2 ${p >= 3 ? "activa" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rotulo-prueba2" }, /* @__PURE__ */ React.createElement("b", null, "Campos correctos"), /* @__PURE__ */ React.createElement("small", null, "contra el registro esperado")), /* @__PURE__ */ React.createElement(Celdas, { patron: PATRON_CAMPOS, encendidas: p >= 3 })), /* @__PURE__ */ React.createElement("div", { className: `fila-prueba2 ${p >= 4 ? "activa" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rotulo-prueba2" }, /* @__PURE__ */ React.createElement("b", null, "Robustez"), /* @__PURE__ */ React.createElement("small", null, "tres casos")), /* @__PURE__ */ React.createElement(Celdas, { patron: ROBUSTEZ.map((r) => r.pasa), encendidas: p >= 4, rotulos: ROBUSTEZ.map((r) => r.rotulo) })), /* @__PURE__ */ React.createElement("div", { className: `fila-j7 ${ver(p >= 5)}` }, /* @__PURE__ */ React.createElement("b", null, "Tabla de resultados"), /* @__PURE__ */ React.createElement("div", null, COLUMNAS_J7.map((c) => /* @__PURE__ */ React.createElement("span", { key: c }, c))))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_PRUEBAS2, paso: p }), /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Resultados ilustrativos" })));
  }

  // src/principal.jsx
  var { useState: useState4, useEffect: useEffect2 } = React;
  var REGISTRO2 = {
    "mapa-31": { componente: MapaSesion, pasos: 1, titulo: "El mapa de la sesión", props: { modo: "31" } },
    "mapa-32": { componente: MapaSesion, pasos: 1, titulo: "El mapa de la sesión", props: { modo: "32" } },
    "mapa-sintesis": { componente: MapaSesion, pasos: 0, titulo: "Síntesis", props: { modo: "sintesis" } },
    minimapa: { componente: Minimapa, pasos: 0 },
    // Bloque 3.1
    "app-api": { componente: AppApi, pasos: 3, titulo: "Lo que agrega la app", props: { tokensSistema: SISTEMA_APP ? SISTEMA_APP.tokens_o200k : null } },
    "ciclo-trabajo": { componente: CicloTrabajo, pasos: 5, titulo: "El orden del trabajo" },
    "armar-prompt": { componente: ArmarPrompt, pasos: 5, titulo: "Armar un prompt" },
    "taller-prompt": { componente: ArmarPrompt, pasos: 0, titulo: "El taller del prompt", props: { interactivo: true } },
    "demo-tokens": { componente: DemoTokens, pasos: 0, titulo: "Demostración en vivo" },
    "texto-registro": { componente: TextoRegistro, pasos: 5, titulo: "Del texto al registro" },
    "tokens-validos": { componente: TokensValidos, pasos: 3, titulo: "Solo tokens válidos" },
    validador: { componente: Validador, pasos: 0, titulo: "El validador" },
    // Bloque 3.2
    conversacion: { componente: Conversacion, pasos: 3, titulo: "La conversación se reenvía" },
    tablero: { componente: Tablero, pasos: 5, titulo: "El tablero de una llamada" },
    variantes: { componente: Variantes, pasos: 4, titulo: "La cuadrícula de variantes" },
    "cuenta-previa": { componente: CuentaPrevia, pasos: 3, titulo: "La cuenta antes de correr" },
    "leer-programa": { componente: LeerPrograma, pasos: 7, titulo: "Leer un programa corto" },
    "pruebas-capa2": { componente: PruebasCapa2, pasos: 5, titulo: "Las pruebas de la capa 2" }
  };
  var clases = () => document.documentElement.classList;
  var imprimiendo = () => clases().contains("print-pdf") || /print-pdf/.test(window.location.search);
  var modoFinal = () => clases().contains("movimiento-reducido") || clases().contains("sin-3d") || imprimiendo();
  var modoQuieto = () => clases().contains("movimiento-reducido") || imprimiendo();
  var montajes = [];
  function dibujar(m) {
    const C = m.def.componente;
    m.raiz.render(/* @__PURE__ */ React.createElement(C, { paso: m.paso, final: m.final, quieto: m.quieto, base: m.base, ...m.def.props || {}, ...m.extra }));
  }
  function Solo({ def, base, extra, final, quieto }) {
    const [paso, setPaso] = useState4(final ? def.pasos : 0);
    useEffect2(() => {
      const tecla = (e) => {
        const tag = e.target && e.target.tagName || "";
        if (/input|textarea|select|button/i.test(tag)) return;
        if (e.key === "ArrowRight" || e.key === "PageDown") setPaso((k) => Math.min(def.pasos, k + 1));
        if (e.key === "ArrowLeft" || e.key === "PageUp") setPaso((k) => Math.max(0, k - 1));
      };
      window.addEventListener("keydown", tecla);
      return () => window.removeEventListener("keydown", tecla);
    }, [def.pasos]);
    const C = def.componente;
    return /* @__PURE__ */ React.createElement("div", { className: "solo-programa" }, def.pasos > 0 ? /* @__PURE__ */ React.createElement("div", { className: "solo-controles" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setPaso((k) => Math.max(0, k - 1)), disabled: paso === 0 }, "← Anterior"), /* @__PURE__ */ React.createElement("span", null, "Paso ", /* @__PURE__ */ React.createElement("b", null, paso), " de ", def.pasos), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setPaso((k) => Math.min(def.pasos, k + 1)), disabled: paso === def.pasos }, "Siguiente →")) : null, /* @__PURE__ */ React.createElement(C, { paso, final, quieto, base, ...def.props || {}, ...extra }));
  }
  function actualizar() {
    montajes.forEach((m) => {
      if (m.final || !m.seccion) return;
      const n = m.seccion.querySelectorAll(`.fragment.visible[data-paso="${m.nombre}"]`).length;
      if (n !== m.paso) {
        m.paso = n;
        dibujar(m);
      }
    });
  }
  function montar() {
    if (!window.React || !window.ReactDOM) {
      console.error("Falta React: revisa assets/vendor/react-18.3.1.");
      return;
    }
    cargarFuentes();
    const revealEl = document.querySelector(".reveal");
    const conReveal = !!(window.Reveal && revealEl);
    const final = modoFinal();
    const quieto = modoQuieto();
    document.querySelectorAll("[data-programa]").forEach((el) => {
      const nombre = el.getAttribute("data-programa");
      const def = REGISTRO2[nombre];
      if (!def) {
        console.error(`Programa desconocido: ${nombre}`);
        return;
      }
      const extra = {};
      if (el.dataset.resaltar) extra.resaltar = el.dataset.resaltar;
      const base = el.dataset.base || "assets/";
      const raiz = ReactDOM.createRoot(el);
      el.classList.add("programa-montado");
      if (!conReveal) {
        raiz.render(/* @__PURE__ */ React.createElement(Solo, { def, base, extra, final, quieto }));
        return;
      }
      const seccion = el.closest("section");
      if (seccion && !final && def.pasos > 0) {
        for (let k = 0; k < def.pasos; k++) {
          const s = document.createElement("span");
          s.className = "fragment paso-programa";
          s.setAttribute("data-paso", nombre);
          s.setAttribute("aria-hidden", "true");
          seccion.appendChild(s);
        }
      }
      const m = { el, nombre, seccion, def, raiz, paso: final ? def.pasos : 0, final, quieto, base, extra };
      montajes.push(m);
      dibujar(m);
    });
    if (conReveal) {
      ["ready", "slidechanged", "fragmentshown", "fragmenthidden", "overviewhidden"].forEach((ev) => revealEl.addEventListener(ev, actualizar));
    }
  }
  window.ProgramasS3 = { REGISTRO: REGISTRO2, actualizar };
  montar();
})();
