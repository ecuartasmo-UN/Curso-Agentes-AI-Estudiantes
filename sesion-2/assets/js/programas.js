(() => {
  // src/comun.jsx
  var { useState, useEffect } = React;
  var COLORES = ["var(--t1)", "var(--t2)", "var(--t3)", "var(--t4)", "var(--t5)", "var(--t6)"];
  var color = (i) => COLORES[(i % COLORES.length + COLORES.length) % COLORES.length];
  var suave = (c, pct = 18) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
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
  function partirEspacio(texto) {
    return texto.startsWith(" ") ? { espacio: true, cuerpo: texto.slice(1) } : { espacio: false, cuerpo: texto };
  }
  var ANCHO_MARCA = 16;
  function anchoFicha(texto, px = 26, extra = "") {
    const { espacio, cuerpo } = partirEspacio(texto);
    const base = ancho(cuerpo, px, 600) + (espacio ? ANCHO_MARCA : 0);
    const otro = extra ? ancho(extra, Math.round(px * 0.72), 600) : 0;
    return Math.max(base, otro) + px * 0.95;
  }
  function MarcaEspacio({ x, y, px }) {
    const w = px * 0.42;
    const h = px * 0.22;
    return /* @__PURE__ */ React.createElement(
      "path",
      {
        d: `M${x} ${y - h} V${y} H${x + w} V${y - h}`,
        fill: "none",
        stroke: "var(--texto-tenue)",
        strokeWidth: 2,
        strokeLinecap: "round"
      }
    );
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
  function FiltroBrillo({ id, fuerza = 5 }) {
    return /* @__PURE__ */ React.createElement("filter", { id, x: "-40%", y: "-40%", width: "180%", height: "180%" }, /* @__PURE__ */ React.createElement("feGaussianBlur", { stdDeviation: fuerza, result: "difuso" }), /* @__PURE__ */ React.createElement("feMerge", null, /* @__PURE__ */ React.createElement("feMergeNode", { in: "difuso" }), /* @__PURE__ */ React.createElement("feMergeNode", { in: "SourceGraphic" })));
  }
  function arco(x1, x2, y, alto, arriba = true) {
    const medio = (x1 + x2) / 2;
    const yc = arriba ? y - alto : y + alto;
    return `M${x1} ${y} Q${medio} ${yc} ${x2} ${y}`;
  }
  var cimaArco = (y, alto, arriba = true) => arriba ? y - alto / 2 : y + alto / 2;
  function colorPeso(v, max = 0.25) {
    const a = Math.min(1, Math.abs(v) / max);
    const pct = Math.round(18 + a * 70);
    return v >= 0 ? `color-mix(in srgb, var(--t1) ${pct}%, transparent)` : `color-mix(in srgb, var(--t3) ${pct}%, transparent)`;
  }

  // ../ejemplos/datos/gpt2.json
  var gpt2_default = {
    fuente: "GPT-2 pequeño (openai-community/gpt2 en Hugging Face), archivo model.safetensors",
    archivo_bytes: 548105171,
    tipo: "float32",
    bytes_por_peso: 4,
    parametros_total: 124439808,
    parametros_por_pieza: {
      embeddings: 39383808,
      atencion: 28348416,
      feed_forward: 56669184,
      normalizacion: 38400
    },
    capas: 12,
    tabla_embeddings: {
      filas: 50257,
      columnas: 768
    },
    fila: {
      token: " token",
      id: 11241,
      primeros_valores: [
        0.131,
        3e-3,
        0.057,
        -0.208,
        -0.097,
        0.221,
        -0.323,
        -0.035,
        -0.014,
        -0.196,
        -0.162,
        0.016,
        0.033,
        0.111,
        -0.163,
        -0.116,
        -0.161,
        -0,
        -0.074,
        0.203,
        -0.071,
        0.017,
        -8e-3,
        -0.172,
        0.1,
        0.072,
        0.131,
        0.074,
        -0.049,
        0.042,
        0.039,
        -0.206
      ],
      minimo: -0.453,
      maximo: 0.33
    },
    espacio_3d: {
      metodo: "PCA de los vectores de embedding (tabla wte) de las palabras de GRUPOS, normalizado a [-1, 1]",
      varianza_explicada_3d: 0.386,
      coseno_medio_dentro_de_grupo: 0.555,
      coseno_medio_entre_grupos: 0.237,
      puntos: [
        {
          palabra: "Python",
          es: "Python",
          grupo: "lenguajes",
          id: 11361,
          x: -0.297,
          y: 0.762,
          z: 0.381
        },
        {
          palabra: "Java",
          es: "Java",
          grupo: "lenguajes",
          id: 7349,
          x: -0.437,
          y: 0.572,
          z: 0.364
        },
        {
          palabra: "Ruby",
          es: "Ruby",
          grupo: "lenguajes",
          id: 10888,
          x: -0.244,
          y: 0.692,
          z: 0.386
        },
        {
          palabra: "Perl",
          es: "Perl",
          grupo: "lenguajes",
          id: 24316,
          x: -0.432,
          y: 1,
          z: 0.319
        },
        {
          palabra: "PHP",
          es: "PHP",
          grupo: "lenguajes",
          id: 19599,
          x: -0.449,
          y: 0.794,
          z: 0.302
        },
        {
          palabra: "France",
          es: "Francia",
          grupo: "países",
          id: 4881,
          x: -0.699,
          y: -0.741,
          z: -9e-3
        },
        {
          palabra: "Spain",
          es: "España",
          grupo: "países",
          id: 8602,
          x: -0.788,
          y: -0.654,
          z: 0.056
        },
        {
          palabra: "Italy",
          es: "Italia",
          grupo: "países",
          id: 8031,
          x: -0.823,
          y: -0.618,
          z: 0.127
        },
        {
          palabra: "Germany",
          es: "Alemania",
          grupo: "países",
          id: 4486,
          x: -0.711,
          y: -0.652,
          z: 0.146
        },
        {
          palabra: "Japan",
          es: "Japón",
          grupo: "países",
          id: 2869,
          x: -0.605,
          y: -0.537,
          z: 0.179
        },
        {
          palabra: "one",
          es: "uno",
          grupo: "números",
          id: 530,
          x: 0.605,
          y: -0.245,
          z: 0.355
        },
        {
          palabra: "two",
          es: "dos",
          grupo: "números",
          id: 734,
          x: 0.793,
          y: -0.244,
          z: 0.54
        },
        {
          palabra: "three",
          es: "tres",
          grupo: "números",
          id: 1115,
          x: 0.768,
          y: -0.222,
          z: 0.573
        },
        {
          palabra: "four",
          es: "cuatro",
          grupo: "números",
          id: 1440,
          x: 0.736,
          y: -0.218,
          z: 0.528
        },
        {
          palabra: "five",
          es: "cinco",
          grupo: "números",
          id: 1936,
          x: 0.673,
          y: -0.187,
          z: 0.501
        },
        {
          palabra: "bread",
          es: "pan",
          grupo: "comida",
          id: 8509,
          x: 0.187,
          y: 0.233,
          z: -0.729
        },
        {
          palabra: "cheese",
          es: "queso",
          grupo: "comida",
          id: 9891,
          x: 0.062,
          y: 0.013,
          z: -0.676
        },
        {
          palabra: "rice",
          es: "arroz",
          grupo: "comida",
          id: 11464,
          x: 0.01,
          y: 0.177,
          z: -0.568
        },
        {
          palabra: "soup",
          es: "sopa",
          grupo: "comida",
          id: 17141,
          x: 0.04,
          y: 0.408,
          z: -0.625
        },
        {
          palabra: "meat",
          es: "carne",
          grupo: "comida",
          id: 6174,
          x: 0.22,
          y: 0.232,
          z: -0.539
        },
        {
          palabra: "king",
          es: "rey",
          grupo: "personas",
          id: 5822,
          x: 0.287,
          y: -0.131,
          z: -0.561
        },
        {
          palabra: "queen",
          es: "reina",
          grupo: "personas",
          id: 16599,
          x: 0.254,
          y: -0.078,
          z: -0.671
        },
        {
          palabra: "man",
          es: "hombre",
          grupo: "personas",
          id: 582,
          x: 0.472,
          y: -0.21,
          z: -0.129
        },
        {
          palabra: "woman",
          es: "mujer",
          grupo: "personas",
          id: 2415,
          x: 0.376,
          y: -0.146,
          z: -0.25
        }
      ]
    },
    analogia: {
      pregunta: "king - man + woman",
      mas_cercanas: [
        "queen",
        "princess",
        "Queen",
        "kings"
      ],
      coseno_flechas_3d: 0.938,
      coseno_flechas_768d: 0.417
    },
    cuadricula_atencion_capa1: {
      tensor: "h.0.attn.c_attn.weight[:12, :24]",
      valores: [
        [
          -0.474,
          -0.261,
          -0.098,
          -0.35,
          0.224,
          -0.043,
          0.419,
          0.174,
          -0.188,
          0.184,
          -0.581,
          -0.023,
          -0.229,
          -0.126,
          0.456,
          -0.019,
          -0.181,
          -0.689,
          -0.574,
          0.338,
          -0.263,
          -0.475,
          0.231,
          -0.046
        ],
        [
          0.087,
          0.147,
          0.239,
          0.288,
          0.649,
          0.17,
          -0.063,
          0.407,
          -0.031,
          0.411,
          0.079,
          0.168,
          0.039,
          0.08,
          0.266,
          0.175,
          -0.064,
          0.229,
          -0.087,
          -0.181,
          -0.157,
          0.288,
          0.35,
          0.194
        ],
        [
          4e-3,
          0.069,
          0.367,
          -0.073,
          -0.15,
          0.021,
          -0.094,
          -0.134,
          0.061,
          0.221,
          -0.035,
          -0.184,
          -0.1,
          -0.27,
          0.213,
          0.291,
          -7e-3,
          1e-3,
          0.136,
          0.181,
          0.12,
          0.048,
          -0.023,
          -0.141
        ],
        [
          0.221,
          -0.188,
          -0.014,
          0.425,
          0.25,
          -0.314,
          0.14,
          0.285,
          0.097,
          0.099,
          -0.012,
          0.258,
          0.058,
          0.07,
          0.065,
          -0.164,
          -0.429,
          -0.063,
          -0.153,
          0.799,
          -0.015,
          0.145,
          -0.091,
          0.127
        ],
        [
          -0.095,
          0.168,
          -0.014,
          0.563,
          0.251,
          -0.07,
          -0.09,
          0.059,
          -0.229,
          -0.106,
          0.17,
          0.26,
          -0.193,
          0.011,
          -0.24,
          0.325,
          -0.01,
          -0.303,
          -0.393,
          -0.138,
          -0.011,
          -0.038,
          -0.043,
          -0.113
        ],
        [
          0.033,
          -0.027,
          -0.027,
          0.606,
          0.466,
          -0.355,
          -0.199,
          0.386,
          0.208,
          -0.244,
          0.599,
          -0.412,
          0.287,
          -0.512,
          -0.051,
          0.022,
          -0.185,
          -0.526,
          0.025,
          -0.337,
          -0.103,
          0.19,
          -0.085,
          0.132
        ],
        [
          -0.03,
          -0.036,
          0.17,
          0.017,
          -0.126,
          0.051,
          -0.075,
          -0.157,
          -0.024,
          0.188,
          -0.036,
          -0.028,
          0.077,
          -0.054,
          -0.069,
          0.269,
          0.061,
          -0.183,
          0.169,
          0.198,
          0.037,
          -6e-3,
          -0.032,
          0.146
        ],
        [
          0.118,
          0.233,
          -0.038,
          -0.245,
          -0.247,
          0.242,
          -0.087,
          0.204,
          -0.413,
          -0.431,
          0.101,
          0.09,
          0.229,
          0.268,
          0.12,
          -0.03,
          -0.175,
          0.191,
          -0.226,
          0.122,
          -0.157,
          -0.04,
          -0.034,
          0.221
        ],
        [
          0.09,
          0.074,
          -0.224,
          0.221,
          0.283,
          0.368,
          0.478,
          -0.147,
          0.043,
          -0.165,
          0.127,
          0.263,
          0.222,
          -0.044,
          -0.269,
          0.227,
          0.023,
          -0.327,
          0.051,
          0.119,
          8e-3,
          0.264,
          -0.368,
          0.182
        ],
        [
          0.124,
          0.216,
          -0.024,
          0.16,
          -0.059,
          -0.254,
          -0.108,
          -0.07,
          0.398,
          -0.131,
          0.099,
          -0.208,
          -0.087,
          0.606,
          -0.082,
          0.184,
          0.313,
          0.048,
          -0.074,
          0.272,
          -0.255,
          -0.125,
          -0.129,
          -0.125
        ],
        [
          -0.14,
          0.126,
          -0.113,
          0.221,
          -0.313,
          -0.228,
          0.139,
          0.219,
          0.308,
          0.152,
          0.02,
          -0.206,
          -0.03,
          -0.126,
          0.013,
          -0.298,
          -0.236,
          -0.131,
          0.315,
          -0.103,
          0.152,
          0.029,
          8e-3,
          0.243
        ],
        [
          -0.564,
          0.525,
          -0.455,
          -0.61,
          -0.224,
          -2e-3,
          -0.244,
          -0.169,
          0.28,
          0.025,
          0.014,
          0.183,
          -0.455,
          -0.248,
          0.188,
          0.054,
          0.086,
          0.383,
          -0.263,
          0.242,
          -0.171,
          -0.086,
          0.04,
          0.325
        ]
      ]
    },
    mascara_causal: {
      tensor: "h.0.attn.bias (1 024 × 1 024 en el archivo); esquina de 8 × 8",
      esquina: [
        [
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          1,
          1,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          1,
          1,
          1,
          0,
          0,
          0,
          0,
          0
        ],
        [
          1,
          1,
          1,
          1,
          0,
          0,
          0,
          0
        ],
        [
          1,
          1,
          1,
          1,
          1,
          0,
          0,
          0
        ],
        [
          1,
          1,
          1,
          1,
          1,
          1,
          0,
          0
        ],
        [
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          0
        ],
        [
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1
        ]
      ]
    }
  };

  // src/mapa.jsx
  var NODOS = [
    { id: "texto", titulo: "Texto", sub: "lo que escribes", corto: "Texto", ejemplo: "John busca en su…" },
    { id: "tokenizer", titulo: "Tokenizer", sub: "corta y numera", corto: "Tokenizer", ejemplo: "o200k_base" },
    { id: "tokens", titulo: "Tokens", sub: "números", corto: "Tokens", ejemplo: "21020 · 28609 …" },
    { id: "embeddings", titulo: "Embeddings", sub: "vectores", corto: "Embeddings", ejemplo: "listas de números" },
    { id: "transformer", titulo: "Transformer", sub: "× N capas", corto: "Transformer", ejemplo: "mezcla el contexto" },
    { id: "probabilidades", titulo: "Probabilidades", sub: "una por token", corto: "Probabilidades", ejemplo: "billete, dólar…" },
    { id: "siguiente", titulo: "Siguiente token", sub: "se elige uno", corto: "Siguiente", ejemplo: "billete" }
  ];
  function medirNodos(chico) {
    const pxT = chico ? 27 : 19;
    return NODOS.map((n) => {
      const t = ancho(chico ? n.corto : n.titulo, pxT, 700, "Space Grotesk");
      const s = chico ? 0 : ancho(n.sub, 14, 400);
      let w = Math.max(t, s) + 26;
      if (!chico && n.id === "transformer") w = Math.max(w, ancho("Atención", 14, 600) + ancho("Feed-forward", 14, 600) + 70);
      return { ...n, w };
    });
  }
  function ubicar(nodos, total) {
    const minimo = 22 * (nodos.length - 1);
    let suma = nodos.reduce((s, n) => s + n.w, 0);
    if (suma + minimo > total) {
      const f = (total - minimo) / suma;
      nodos = nodos.map((n) => ({ ...n, w: n.w * f }));
      suma = total - minimo;
    }
    const gap = (total - suma) / (nodos.length - 1);
    let x = 0;
    return nodos.map((n) => {
      const r = { ...n, x, cx: x + n.w / 2 };
      x += n.w + gap;
      return r;
    });
  }
  var PESOS_POR_NODO = gpt2_default.parametros_por_pieza;
  var VALORES = gpt2_default.cuadricula_atencion_capa1.valores.flat().slice(0, 60).concat(gpt2_default.fila.primeros_valores);
  function Mapa({ paso = 0, final, quieto, modo = "apertura" }) {
    useFuentes();
    const idB = useIdSvg("brillo-mapa");
    const idM = useIdSvg("punta-mapa");
    const nodos = ubicar(medirNodos(false), 1200);
    const y0 = 64;
    const h = 124;
    const cy = y0 + h / 2;
    const n = (id) => nodos.find((k) => k.id === id);
    const verBucle = modo === "sintesis" || modo === "apertura" && (paso >= 1 || final);
    const yBucle = y0 + h + (modo === "apertura" ? 96 : 66);
    const caminoPunto = `M${n("texto").cx} ${cy} H${n("siguiente").cx} V${yBucle} H${n("tokens").cx} V${y0 + h}`;
    const p = final ? 99 : paso;
    const enPesos = modo === "pesos";
    const lleno = (id) => {
      if (!enPesos) return false;
      if (id === "embeddings") return p >= 1;
      if (id === "atencion") return p >= 2;
      if (id === "ff") return p >= 3;
      if (id === "probabilidades") return p >= 4;
      return false;
    };
    const nt = n("transformer");
    const sobra = nt.w - 36 - ancho("Atención", 14, 600) - ancho("Feed-forward", 14, 600);
    const chipA = ancho("Atención", 14, 600) + sobra / 2;
    const chipF = ancho("Feed-forward", 14, 600) + sobra / 2;
    const rotulosPesos = [
      { id: "embeddings", x: n("embeddings").cx, texto: miles(PESOS_POR_NODO.embeddings), sub: "tabla de tokens y de posiciones", si: lleno("embeddings") },
      { id: "atencion", x: nt.x + 12 + chipA / 2, texto: miles(PESOS_POR_NODO.atencion), sub: "atención", si: lleno("atencion") },
      { id: "ff", x: nt.x + 24 + chipA + chipF / 2, texto: miles(PESOS_POR_NODO.feed_forward), sub: "feed-forward", si: lleno("ff"), abajo: 58 },
      { id: "probabilidades", x: n("probabilidades").cx, texto: "la misma tabla", sub: "de los embeddings", si: lleno("probabilidades") }
    ];
    return /* @__PURE__ */ React.createElement("svg", { className: "diagrama mapa-llm", viewBox: "0 0 1200 400", role: "img", "aria-label": "Mapa del camino del texto a la respuesta" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement(FiltroBrillo, { id: idB, fuerza: 6 }), /* @__PURE__ */ React.createElement("marker", { id: idM, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, /* @__PURE__ */ React.createElement("path", { d: "M0 0 10 5 0 10z", className: "relleno-acento" }))), nodos.slice(0, -1).map((a, i) => {
      const b = nodos[i + 1];
      return /* @__PURE__ */ React.createElement("path", { key: a.id, className: "arista acento", d: `M${a.x + a.w + 2} ${cy} H${b.x - 3}`, markerEnd: `url(#${idM})` });
    }), nodos.map((k) => {
      const conPesos = enPesos && (k.id === "embeddings" && lleno("embeddings") || k.id === "probabilidades" && lleno("probabilidades"));
      const clase = k.id === "transformer" ? "nodo acento-2" : k.id === "tokenizer" ? "nodo aviso" : "nodo acento";
      return /* @__PURE__ */ React.createElement("g", { key: k.id, className: `${clase} ${conPesos ? "con-pesos" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: k.x, y: y0, width: k.w, height: h, rx: 18 }), /* @__PURE__ */ React.createElement("text", { x: k.cx, y: k.id === "transformer" ? y0 + 26 : y0 + 48, textAnchor: "middle", dominantBaseline: "central", fontSize: 19, className: "t-titulo" }, k.titulo), /* @__PURE__ */ React.createElement("text", { x: k.cx, y: k.id === "transformer" ? y0 + h - 20 : y0 + 84, textAnchor: "middle", dominantBaseline: "central", fontSize: 14, className: "t-suave" }, k.sub));
    }), modo === "apertura" ? nodos.map((k) => /* @__PURE__ */ React.createElement("text", { key: `e${k.id}`, x: k.cx, y: y0 + h + 30, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, fontWeight: 600, className: "t-acento" }, k.ejemplo)) : null, [
      { id: "atencion", texto: "Atención", x: nt.x + 12, w: chipA },
      { id: "ff", texto: "Feed-forward", x: nt.x + 24 + chipA, w: chipF }
    ].map((c) => /* @__PURE__ */ React.createElement("g", { key: c.id, className: `nodo ${lleno(c.id) ? "acento con-pesos" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: c.x, y: y0 + 46, width: c.w, height: 36, rx: 10 }), /* @__PURE__ */ React.createElement("text", { x: c.x + c.w / 2, y: y0 + 64, textAnchor: "middle", dominantBaseline: "central", fontSize: 14, fontWeight: 600 }, c.texto))), enPesos ? ["embeddings", "atencion", "ff", "probabilidades"].map((id, j) => {
      const objetivo = id === "atencion" || id === "ff" ? rotulosPesos.find((r) => r.id === id).x : n(id).cx;
      const si = lleno(id);
      return /* @__PURE__ */ React.createElement("g", { key: id, className: `lluvia ${si ? "visto" : ""}`, "aria-hidden": "true" }, VALORES.slice(j * 6, j * 6 + 6).map((v, k) => /* @__PURE__ */ React.createElement(
        "text",
        {
          key: k,
          x: objetivo + (k % 2 - 0.5) * 50,
          y: y0 - 14 - Math.floor(k / 2) * 17,
          textAnchor: "middle",
          fontSize: 13,
          className: "t-tenue numero-peso",
          style: { transitionDelay: si ? `${k * 0.05}s` : "0s" }
        },
        v.toFixed(3)
      )));
    }) : null, enPesos ? rotulosPesos.map((r) => /* @__PURE__ */ React.createElement("g", { key: r.id, className: `aparece-p ${r.si ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("text", { x: r.x, y: y0 + h + 30 + (r.abajo || 0), textAnchor: "middle", dominantBaseline: "central", fontSize: r.id === "probabilidades" ? 17 : 21, fontWeight: 700, className: "t-acento" }, r.texto), /* @__PURE__ */ React.createElement("text", { x: r.x, y: y0 + h + 54 + (r.abajo || 0), textAnchor: "middle", dominantBaseline: "central", fontSize: 14, className: "t-suave" }, r.sub))) : null, enPesos ? /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 5 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("text", { x: 600, y: y0 + h + 138, textAnchor: "middle", dominantBaseline: "central", fontSize: 26, fontWeight: 700, className: "t-titulo" }, "GPT-2 pequeño: ", miles(gpt2_default.parametros_total), " pesos (parámetros)"), /* @__PURE__ */ React.createElement("text", { x: 600, y: y0 + h + 172, textAnchor: "middle", dominantBaseline: "central", fontSize: 16, className: "t-suave" }, "Más ", miles(PESOS_POR_NODO.normalizacion), " de normalización ya incluidos. El tokenizer no tiene pesos: es una lista fija.")) : null, modo !== "pesos" ? /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${verBucle ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("path", { className: "arista acento-2 punteada", d: `M${n("siguiente").cx} ${y0 + h + 2} V${yBucle} H${n("tokens").cx} V${y0 + h + 4}`, markerEnd: `url(#${idM})` }), /* @__PURE__ */ React.createElement("text", { x: (n("siguiente").cx + n("tokens").cx) / 2, y: yBucle + 22, textAnchor: "middle", dominantBaseline: "central", fontSize: 18, className: "t-acento-2", fontWeight: 600 }, "el token elegido vuelve a entrar, y se repite")) : null, modo === "sintesis" ? /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("path", { className: "arista", d: `M${n("embeddings").x} ${y0 - 18} V${y0 - 28} H${n("probabilidades").x + n("probabilidades").w} V${y0 - 18}` }), /* @__PURE__ */ React.createElement("text", { x: (n("embeddings").x + n("probabilidades").x + n("probabilidades").w) / 2, y: y0 - 44, textAnchor: "middle", dominantBaseline: "central", fontSize: 18, fontWeight: 700, className: "t-acento" }, "Los pesos: números aprendidos y congelados"), /* @__PURE__ */ React.createElement("text", { x: n("tokenizer").cx, y: y0 - 30, textAnchor: "middle", dominantBaseline: "central", fontSize: 16, fontWeight: 600, className: "t-suave" }, "una lista fija")) : null, !quieto && modo !== "pesos" ? /* @__PURE__ */ React.createElement("circle", { r: 8, className: "relleno-acento", filter: `url(#${idB})` }, /* @__PURE__ */ React.createElement("animateMotion", { dur: "7s", repeatCount: "indefinite", path: verBucle ? caminoPunto : `M${n("texto").cx} ${cy} H${n("siguiente").cx}` })) : null);
  }
  function Minimapa({ resaltar = "" }) {
    useFuentes();
    const idM = useIdSvg("punta-mini");
    const activos = resaltar.split(",").map((s) => s.trim()).filter(Boolean);
    const nodos = ubicar(medirNodos(true), 1200);
    const y0 = 10;
    const h = 56;
    return /* @__PURE__ */ React.createElement("svg", { className: "diagrama minimapa", viewBox: "0 0 1200 76", role: "img", "aria-label": `Mapa del LLM. Esta parte: ${activos.join(", ")}` }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("marker", { id: idM, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto" }, /* @__PURE__ */ React.createElement("path", { d: "M0 0 10 5 0 10z", className: "relleno-tenue" }))), nodos.slice(0, -1).map((a, i) => /* @__PURE__ */ React.createElement("path", { key: a.id, className: "arista", d: `M${a.x + a.w + 2} ${y0 + h / 2} H${nodos[i + 1].x - 3}`, markerEnd: `url(#${idM})` })), nodos.map((k) => {
      const on = activos.includes(k.id);
      return /* @__PURE__ */ React.createElement("g", { key: k.id, className: `nodo ${on ? "acento mini-activo" : "mini-apagado"}` }, /* @__PURE__ */ React.createElement("rect", { x: k.x, y: y0, width: k.w, height: h, rx: 14 }), /* @__PURE__ */ React.createElement("text", { x: k.cx, y: y0 + h / 2, textAnchor: "middle", dominantBaseline: "central", fontSize: 27, className: "t-titulo" }, k.corto));
    }));
  }

  // ../ejemplos/datos/tokens.json
  var tokens_default = {
    fecha: "2026-11-23",
    fuente: "tiktoken 0.14.0 (OpenAI, licencia MIT)",
    vocabulario: {
      o200k_base: 200019,
      cl100k_base: 100277,
      gpt2: 50257
    },
    frase: {
      es: "Los desarrolladores documentaron la tokenización del modelo.",
      en: "The developers documented the model's tokenization.",
      palabras_es: 7,
      palabras_en: 6,
      o200k_base_es: [
        {
          texto: "Los",
          id: 16593
        },
        {
          texto: " desarroll",
          id: 16802
        },
        {
          texto: "adores",
          id: 7151
        },
        {
          texto: " document",
          id: 3213
        },
        {
          texto: "aron",
          id: 9102
        },
        {
          texto: " la",
          id: 557
        },
        {
          texto: " token",
          id: 6602
        },
        {
          texto: "ización",
          id: 18856
        },
        {
          texto: " del",
          id: 1083
        },
        {
          texto: " modelo",
          id: 23255
        },
        {
          texto: ".",
          id: 13
        }
      ],
      o200k_base_en: [
        {
          texto: "The",
          id: 976
        },
        {
          texto: " developers",
          id: 22958
        },
        {
          texto: " documented",
          id: 51643
        },
        {
          texto: " the",
          id: 290
        },
        {
          texto: " model",
          id: 2359
        },
        {
          texto: "'s",
          id: 885
        },
        {
          texto: " token",
          id: 6602
        },
        {
          texto: "ization",
          id: 2860
        },
        {
          texto: ".",
          id: 13
        }
      ],
      gpt2_es: [
        {
          texto: "Los",
          id: 28903
        },
        {
          texto: " des",
          id: 748
        },
        {
          texto: "ar",
          id: 283
        },
        {
          texto: "roll",
          id: 2487
        },
        {
          texto: "ad",
          id: 324
        },
        {
          texto: "ores",
          id: 2850
        },
        {
          texto: " document",
          id: 3188
        },
        {
          texto: "aron",
          id: 8045
        },
        {
          texto: " la",
          id: 8591
        },
        {
          texto: " token",
          id: 11241
        },
        {
          texto: "iz",
          id: 528
        },
        {
          texto: "aci",
          id: 32009
        },
        {
          texto: "ón",
          id: 18840
        },
        {
          texto: " del",
          id: 1619
        },
        {
          texto: " model",
          id: 2746
        },
        {
          texto: "o",
          id: 78
        },
        {
          texto: ".",
          id: 13
        }
      ],
      gpt2_en: [
        {
          texto: "The",
          id: 464
        },
        {
          texto: " developers",
          id: 6505
        },
        {
          texto: " documented",
          id: 12395
        },
        {
          texto: " the",
          id: 262
        },
        {
          texto: " model",
          id: 2746
        },
        {
          texto: "'s",
          id: 338
        },
        {
          texto: " token",
          id: 11241
        },
        {
          texto: "ization",
          id: 1634
        },
        {
          texto: ".",
          id: 13
        }
      ]
    },
    articulo: {
      es: {
        url: "https://www.understandingai.org/p/grandes-modelos-de-lenguaje-llm-una",
        parrafos: 150,
        palabras: 7514,
        tokens_o200k_base: 10199,
        tokens_gpt2: 16194
      },
      en: {
        url: "https://www.understandingai.org/p/large-language-models-explained-with",
        parrafos: 146,
        palabras: 6244,
        tokens_o200k_base: 7858,
        tokens_gpt2: 8421
      }
    },
    demo: [
      {
        texto: "Los desarrolladores documentaron la tokenización del modelo.",
        tokens: [
          {
            texto: "Los",
            id: 16593
          },
          {
            texto: " desarroll",
            id: 16802
          },
          {
            texto: "adores",
            id: 7151
          },
          {
            texto: " document",
            id: 3213
          },
          {
            texto: "aron",
            id: 9102
          },
          {
            texto: " la",
            id: 557
          },
          {
            texto: " token",
            id: 6602
          },
          {
            texto: "ización",
            id: 18856
          },
          {
            texto: " del",
            id: 1083
          },
          {
            texto: " modelo",
            id: 23255
          },
          {
            texto: ".",
            id: 13
          }
        ]
      },
      {
        texto: "The developers documented the model's tokenization.",
        tokens: [
          {
            texto: "The",
            id: 976
          },
          {
            texto: " developers",
            id: 22958
          },
          {
            texto: " documented",
            id: 51643
          },
          {
            texto: " the",
            id: 290
          },
          {
            texto: " model",
            id: 2359
          },
          {
            texto: "'s",
            id: 885
          },
          {
            texto: " token",
            id: 6602
          },
          {
            texto: "ization",
            id: 2860
          },
          {
            texto: ".",
            id: 13
          }
        ]
      },
      {
        texto: "¿Qué cambió en LangChain 1.5.0?",
        tokens: [
          {
            texto: "¿Qué",
            id: 68156
          },
          {
            texto: " camb",
            id: 13013
          },
          {
            texto: "ió",
            id: 1153
          },
          {
            texto: " en",
            id: 469
          },
          {
            texto: " Lang",
            id: 27830
          },
          {
            texto: "Chain",
            id: 20848
          },
          {
            texto: " ",
            id: 220
          },
          {
            texto: "1",
            id: 16
          },
          {
            texto: ".",
            id: 13
          },
          {
            texto: "5",
            id: 20
          },
          {
            texto: ".",
            id: 13
          },
          {
            texto: "0",
            id: 15
          },
          {
            texto: "?",
            id: 30
          }
        ]
      },
      {
        texto: "La app se cierra al subir una foto en Android 15.",
        tokens: [
          {
            texto: "La",
            id: 4579
          },
          {
            texto: " app",
            id: 1053
          },
          {
            texto: " se",
            id: 458
          },
          {
            texto: " c",
            id: 274
          },
          {
            texto: "ierra",
            id: 23181
          },
          {
            texto: " al",
            id: 434
          },
          {
            texto: " subir",
            id: 65389
          },
          {
            texto: " una",
            id: 1969
          },
          {
            texto: " foto",
            id: 14864
          },
          {
            texto: " en",
            id: 469
          },
          {
            texto: " Android",
            id: 9438
          },
          {
            texto: " ",
            id: 220
          },
          {
            texto: "15",
            id: 1055
          },
          {
            texto: ".",
            id: 13
          }
        ]
      },
      {
        texto: "def suma(a, b): return a + b",
        tokens: [
          {
            texto: "def",
            id: 1314
          },
          {
            texto: " suma",
            id: 47854
          },
          {
            texto: "(a",
            id: 6271
          },
          {
            texto: ",",
            id: 11
          },
          {
            texto: " b",
            id: 287
          },
          {
            texto: "):",
            id: 3127
          },
          {
            texto: " return",
            id: 622
          },
          {
            texto: " a",
            id: 261
          },
          {
            texto: " +",
            id: 659
          },
          {
            texto: " b",
            id: 287
          }
        ]
      },
      {
        texto: "El agente clasifica el reporte.",
        tokens: [
          {
            texto: "El",
            id: 4422
          },
          {
            texto: " agente",
            id: 80166
          },
          {
            texto: " clas",
            id: 48680
          },
          {
            texto: "ifica",
            id: 28448
          },
          {
            texto: " el",
            id: 650
          },
          {
            texto: " reporte",
            id: 149202
          },
          {
            texto: ".",
            id: 13
          }
        ]
      }
    ],
    tokens_definidos: {
      o200k_base: 2e5,
      cl100k_base: 100261,
      gpt2: 50257
    }
  };

  // ../ejemplos/datos/bpe.json
  var bpe_default = {
    fuente: "Sennrich, Haddow y Birch (2016), ACL, Algoritmo 1",
    vocabulario_inicial: [
      {
        palabra: "l o w </w>",
        frecuencia: 5
      },
      {
        palabra: "l o w e r </w>",
        frecuencia: 2
      },
      {
        palabra: "n e w e s t </w>",
        frecuencia: 6
      },
      {
        palabra: "w i d e s t </w>",
        frecuencia: 3
      }
    ],
    pasos: [
      {
        paso: 1,
        pares: [
          {
            par: [
              "e",
              "s"
            ],
            frecuencia: 9
          },
          {
            par: [
              "s",
              "t"
            ],
            frecuencia: 9
          },
          {
            par: [
              "t",
              "</w>"
            ],
            frecuencia: 9
          },
          {
            par: [
              "w",
              "e"
            ],
            frecuencia: 8
          },
          {
            par: [
              "l",
              "o"
            ],
            frecuencia: 7
          },
          {
            par: [
              "o",
              "w"
            ],
            frecuencia: 7
          },
          {
            par: [
              "n",
              "e"
            ],
            frecuencia: 6
          },
          {
            par: [
              "e",
              "w"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "</w>"
            ],
            frecuencia: 5
          },
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "e"
            ],
            frecuencia: 3
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "e",
          "s"
        ],
        frecuencia: 9,
        vocabulario_despues: [
          {
            palabra: "l o w </w>",
            frecuencia: 5
          },
          {
            palabra: "l o w e r </w>",
            frecuencia: 2
          },
          {
            palabra: "n e w es t </w>",
            frecuencia: 6
          },
          {
            palabra: "w i d es t </w>",
            frecuencia: 3
          }
        ]
      },
      {
        paso: 2,
        pares: [
          {
            par: [
              "es",
              "t"
            ],
            frecuencia: 9
          },
          {
            par: [
              "t",
              "</w>"
            ],
            frecuencia: 9
          },
          {
            par: [
              "l",
              "o"
            ],
            frecuencia: 7
          },
          {
            par: [
              "o",
              "w"
            ],
            frecuencia: 7
          },
          {
            par: [
              "n",
              "e"
            ],
            frecuencia: 6
          },
          {
            par: [
              "e",
              "w"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "es"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "</w>"
            ],
            frecuencia: 5
          },
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "es"
            ],
            frecuencia: 3
          },
          {
            par: [
              "w",
              "e"
            ],
            frecuencia: 2
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "es",
          "t"
        ],
        frecuencia: 9,
        vocabulario_despues: [
          {
            palabra: "l o w </w>",
            frecuencia: 5
          },
          {
            palabra: "l o w e r </w>",
            frecuencia: 2
          },
          {
            palabra: "n e w est </w>",
            frecuencia: 6
          },
          {
            palabra: "w i d est </w>",
            frecuencia: 3
          }
        ]
      },
      {
        paso: 3,
        pares: [
          {
            par: [
              "est",
              "</w>"
            ],
            frecuencia: 9
          },
          {
            par: [
              "l",
              "o"
            ],
            frecuencia: 7
          },
          {
            par: [
              "o",
              "w"
            ],
            frecuencia: 7
          },
          {
            par: [
              "n",
              "e"
            ],
            frecuencia: 6
          },
          {
            par: [
              "e",
              "w"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "est"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "</w>"
            ],
            frecuencia: 5
          },
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "est"
            ],
            frecuencia: 3
          },
          {
            par: [
              "w",
              "e"
            ],
            frecuencia: 2
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "est",
          "</w>"
        ],
        frecuencia: 9,
        vocabulario_despues: [
          {
            palabra: "l o w </w>",
            frecuencia: 5
          },
          {
            palabra: "l o w e r </w>",
            frecuencia: 2
          },
          {
            palabra: "n e w est</w>",
            frecuencia: 6
          },
          {
            palabra: "w i d est</w>",
            frecuencia: 3
          }
        ]
      },
      {
        paso: 4,
        pares: [
          {
            par: [
              "l",
              "o"
            ],
            frecuencia: 7
          },
          {
            par: [
              "o",
              "w"
            ],
            frecuencia: 7
          },
          {
            par: [
              "n",
              "e"
            ],
            frecuencia: 6
          },
          {
            par: [
              "e",
              "w"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "est</w>"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "</w>"
            ],
            frecuencia: 5
          },
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "est</w>"
            ],
            frecuencia: 3
          },
          {
            par: [
              "w",
              "e"
            ],
            frecuencia: 2
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "l",
          "o"
        ],
        frecuencia: 7,
        vocabulario_despues: [
          {
            palabra: "lo w </w>",
            frecuencia: 5
          },
          {
            palabra: "lo w e r </w>",
            frecuencia: 2
          },
          {
            palabra: "n e w est</w>",
            frecuencia: 6
          },
          {
            palabra: "w i d est</w>",
            frecuencia: 3
          }
        ]
      },
      {
        paso: 5,
        pares: [
          {
            par: [
              "lo",
              "w"
            ],
            frecuencia: 7
          },
          {
            par: [
              "n",
              "e"
            ],
            frecuencia: 6
          },
          {
            par: [
              "e",
              "w"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "est</w>"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "</w>"
            ],
            frecuencia: 5
          },
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "est</w>"
            ],
            frecuencia: 3
          },
          {
            par: [
              "w",
              "e"
            ],
            frecuencia: 2
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "lo",
          "w"
        ],
        frecuencia: 7,
        vocabulario_despues: [
          {
            palabra: "low </w>",
            frecuencia: 5
          },
          {
            palabra: "low e r </w>",
            frecuencia: 2
          },
          {
            palabra: "n e w est</w>",
            frecuencia: 6
          },
          {
            palabra: "w i d est</w>",
            frecuencia: 3
          }
        ]
      },
      {
        paso: 6,
        pares: [
          {
            par: [
              "n",
              "e"
            ],
            frecuencia: 6
          },
          {
            par: [
              "e",
              "w"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "est</w>"
            ],
            frecuencia: 6
          },
          {
            par: [
              "low",
              "</w>"
            ],
            frecuencia: 5
          },
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "est</w>"
            ],
            frecuencia: 3
          },
          {
            par: [
              "low",
              "e"
            ],
            frecuencia: 2
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "n",
          "e"
        ],
        frecuencia: 6,
        vocabulario_despues: [
          {
            palabra: "low </w>",
            frecuencia: 5
          },
          {
            palabra: "low e r </w>",
            frecuencia: 2
          },
          {
            palabra: "ne w est</w>",
            frecuencia: 6
          },
          {
            palabra: "w i d est</w>",
            frecuencia: 3
          }
        ]
      },
      {
        paso: 7,
        pares: [
          {
            par: [
              "ne",
              "w"
            ],
            frecuencia: 6
          },
          {
            par: [
              "w",
              "est</w>"
            ],
            frecuencia: 6
          },
          {
            par: [
              "low",
              "</w>"
            ],
            frecuencia: 5
          },
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "est</w>"
            ],
            frecuencia: 3
          },
          {
            par: [
              "low",
              "e"
            ],
            frecuencia: 2
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "ne",
          "w"
        ],
        frecuencia: 6,
        vocabulario_despues: [
          {
            palabra: "low </w>",
            frecuencia: 5
          },
          {
            palabra: "low e r </w>",
            frecuencia: 2
          },
          {
            palabra: "new est</w>",
            frecuencia: 6
          },
          {
            palabra: "w i d est</w>",
            frecuencia: 3
          }
        ]
      },
      {
        paso: 8,
        pares: [
          {
            par: [
              "new",
              "est</w>"
            ],
            frecuencia: 6
          },
          {
            par: [
              "low",
              "</w>"
            ],
            frecuencia: 5
          },
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "est</w>"
            ],
            frecuencia: 3
          },
          {
            par: [
              "low",
              "e"
            ],
            frecuencia: 2
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "new",
          "est</w>"
        ],
        frecuencia: 6,
        vocabulario_despues: [
          {
            palabra: "low </w>",
            frecuencia: 5
          },
          {
            palabra: "low e r </w>",
            frecuencia: 2
          },
          {
            palabra: "newest</w>",
            frecuencia: 6
          },
          {
            palabra: "w i d est</w>",
            frecuencia: 3
          }
        ]
      },
      {
        paso: 9,
        pares: [
          {
            par: [
              "low",
              "</w>"
            ],
            frecuencia: 5
          },
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "est</w>"
            ],
            frecuencia: 3
          },
          {
            par: [
              "low",
              "e"
            ],
            frecuencia: 2
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "low",
          "</w>"
        ],
        frecuencia: 5,
        vocabulario_despues: [
          {
            palabra: "low</w>",
            frecuencia: 5
          },
          {
            palabra: "low e r </w>",
            frecuencia: 2
          },
          {
            palabra: "newest</w>",
            frecuencia: 6
          },
          {
            palabra: "w i d est</w>",
            frecuencia: 3
          }
        ]
      },
      {
        paso: 10,
        pares: [
          {
            par: [
              "w",
              "i"
            ],
            frecuencia: 3
          },
          {
            par: [
              "i",
              "d"
            ],
            frecuencia: 3
          },
          {
            par: [
              "d",
              "est</w>"
            ],
            frecuencia: 3
          },
          {
            par: [
              "low",
              "e"
            ],
            frecuencia: 2
          },
          {
            par: [
              "e",
              "r"
            ],
            frecuencia: 2
          },
          {
            par: [
              "r",
              "</w>"
            ],
            frecuencia: 2
          }
        ],
        union: [
          "w",
          "i"
        ],
        frecuencia: 3,
        vocabulario_despues: [
          {
            palabra: "low</w>",
            frecuencia: 5
          },
          {
            palabra: "low e r </w>",
            frecuencia: 2
          },
          {
            palabra: "newest</w>",
            frecuencia: 6
          },
          {
            palabra: "wi d est</w>",
            frecuencia: 3
          }
        ]
      }
    ]
  };

  // src/tokens.jsx
  var { useState: useState2, useEffect: useEffect2, useMemo, useRef } = React;
  var PIE_CORTAR = [
    "El tokenizer de GPT-4o y GPT-5 se llama o200k_base. Lo vamos a ver trabajar.",
    "Paso 1. Entra la frase, tal como la escribes.",
    "Paso 2. El tokenizer la corta en tokens. Algunas palabras se parten en trozos.",
    "Paso 3. Cada token se cambia por su número en el vocabulario.",
    "Paso 4. El vocabulario es una lista fija: cada número es siempre el mismo token.",
    "Paso 5. Siete palabras se volvieron once tokens. El modelo solo ve los números."
  ];
  function CortarNumerar({ paso = 0, final }) {
    useFuentes();
    const p = final ? 5 : paso;
    const tokens = tokens_default.frase.o200k_base_es;
    const px = 30;
    const alto = 84;
    const anchoMax = 760;
    const filas = useMemo(() => {
      const anchos = tokens.map((t) => Math.max(anchoFicha(t.texto, px), ancho(String(t.id), 22, 600) + 26));
      const res = [];
      let fila = [];
      let usado = 0;
      anchos.forEach((w, i) => {
        if (fila.length && usado + 14 + w > anchoMax) {
          res.push(fila);
          fila = [];
          usado = 0;
        }
        usado += (fila.length ? 14 : 0) + w;
        fila.push({ i, w });
      });
      res.push(fila);
      return res.map((f) => {
        const total = f.reduce((s, k) => s + k.w, 0) + 14 * (f.length - 1);
        let x = (anchoMax - total) / 2;
        return f.map((k) => {
          const r = { ...k, x };
          x += k.w + 14;
          return r;
        });
      });
    }, [tokens, ancho("Mm", px)]);
    const posiciones = [];
    filas.forEach((f, nf) => f.forEach((k) => posiciones[k.i] = { x: k.x, y: 128 + nf * (alto + 24), w: k.w }));
    const ordenados = [...tokens.map((t, i) => ({ ...t, i }))].sort((a, b) => a.id - b.id);
    const palabras = tokens_default.frase.palabras_es;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama prog-svg", viewBox: "0 0 1200 470", role: "img", "aria-label": "La frase de ejemplo cortada en once tokens, cada uno con su número" }, /* @__PURE__ */ React.createElement("text", { x: 600, y: 60, textAnchor: "middle", dominantBaseline: "central", fontSize: 30, fontWeight: 600, className: `aparece-p ${p >= 1 && p < 4 ? "visto" : ""} ${p >= 2 ? "frase-cortada" : ""}` }, tokens_default.frase.es), p === 2 && !final ? /* @__PURE__ */ React.createElement("rect", { className: "cuchilla", x: 0, y: 110, width: 6, height: 210, rx: 3 }) : null, tokens.map((t, i) => {
      const pos = posiciones[i];
      const c = color(i);
      const { espacio, cuerpo } = partirEspacio(t.texto);
      const wCuerpo = ancho(cuerpo, px, 600) + (espacio ? 16 : 0);
      const x0 = pos.w / 2 - wCuerpo / 2;
      return /* @__PURE__ */ React.createElement("g", { key: i, className: `ficha-token ${p >= 2 ? "visto" : ""}`, style: { transform: `translate(${pos.x}px, ${pos.y}px)`, transitionDelay: p >= 2 && !final ? `${0.12 * i}s` : "0s" } }, /* @__PURE__ */ React.createElement("rect", { width: pos.w, height: alto, rx: 14, fill: suave(c, 20), stroke: c, strokeWidth: 2.5 }), espacio ? /* @__PURE__ */ React.createElement(MarcaEspacio, { x: x0, y: alto * 0.36 + 10, px }) : null, /* @__PURE__ */ React.createElement("text", { x: x0 + (espacio ? 16 : 0), y: alto * 0.36, dominantBaseline: "central", fontSize: px, fontWeight: 600 }, cuerpo), /* @__PURE__ */ React.createElement("text", { x: pos.w / 2, y: alto * 0.77, textAnchor: "middle", dominantBaseline: "central", fontSize: 22, fontWeight: 700, className: `numero-token ${p >= 3 ? "visto" : ""}`, style: { fill: c, transitionDelay: p >= 3 && !final ? `${0.08 * i}s` : "0s" } }, t.id));
    }), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement(MarcaEspacio, { x: 12, y: 360, px: 26 }), /* @__PURE__ */ React.createElement("text", { x: 34, y: 354, dominantBaseline: "central", fontSize: 17, className: "t-suave" }, "marca el espacio: viaja pegado al token que sigue")), /* @__PURE__ */ React.createElement("g", { className: `aparece-p desliza-izq ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 800, y: 10, width: 392, height: 452, rx: 18, className: "panel-fondo" }), /* @__PURE__ */ React.createElement("text", { x: 996, y: 40, textAnchor: "middle", dominantBaseline: "central", fontSize: 19, fontWeight: 700, className: "t-titulo" }, "Vocabulario de o200k_base"), ordenados.map((t, k) => {
      const y = 76 + k * 32;
      const c = color(t.i);
      const { espacio, cuerpo } = partirEspacio(t.texto);
      return /* @__PURE__ */ React.createElement("g", { key: t.id }, /* @__PURE__ */ React.createElement("rect", { x: 816, y: y - 13, width: 360, height: 28, rx: 8, fill: suave(c, 16) }), /* @__PURE__ */ React.createElement("text", { x: 916, y: y + 1, textAnchor: "end", dominantBaseline: "central", fontSize: 18, fontWeight: 700, style: { fill: c } }, t.id), espacio ? /* @__PURE__ */ React.createElement(MarcaEspacio, { x: 938, y: y + 8, px: 20 }) : null, /* @__PURE__ */ React.createElement("text", { x: espacio ? 952 : 938, y: y + 1, dominantBaseline: "central", fontSize: 18, fontWeight: 600 }, cuerpo));
    }), /* @__PURE__ */ React.createElement("text", { x: 996, y: 440, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, className: "t-suave" }, "… y así hasta ", miles(tokens_default.tokens_definidos.o200k_base), " tokens")), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 5 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("text", { x: 150, y: 396, textAnchor: "middle", dominantBaseline: "central", fontSize: 46, fontWeight: 700, className: "t-titulo" }, palabras), /* @__PURE__ */ React.createElement("text", { x: 150, y: 430, textAnchor: "middle", dominantBaseline: "central", fontSize: 17, className: "t-suave" }, "palabras"), /* @__PURE__ */ React.createElement("path", { d: "M240 396 H500", className: "arista acento", strokeWidth: 3 }), /* @__PURE__ */ React.createElement("path", { d: "M500 396 l-14 -9 v18z", className: "relleno-acento" }), /* @__PURE__ */ React.createElement("text", { x: 600, y: 396, textAnchor: "middle", dominantBaseline: "central", fontSize: 46, fontWeight: 700, className: "t-acento t-titulo" }, tokens.length), /* @__PURE__ */ React.createElement("text", { x: 600, y: 430, textAnchor: "middle", dominantBaseline: "central", fontSize: 17, className: "t-suave" }, "tokens"))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_CORTAR, paso: p }));
  }
  var PIE_BPE = [
    "El ejemplo de Sennrich et al. (2016): cuatro palabras, con cuántas veces aparece cada una.",
    "Paso 1. Al comienzo, cada palabra es una fila de letras sueltas. «·» marca el final de la palabra.",
    "Paso 2. Se cuentan los pares de símbolos vecinos, según cuántas veces aparece cada palabra.",
    "Paso 3. El par más frecuente, e + s, se une en un símbolo nuevo: «es».",
    "Paso 4. Se repite: cada unión agrega un símbolo al vocabulario. Aquí, diez uniones."
  ];
  function segmentos(k) {
    const lista = k === 0 ? bpe_default.vocabulario_inicial : bpe_default.pasos[k - 1].vocabulario_despues;
    return lista.map((v) => ({ simbolos: v.palabra.split(" ").map((s) => s.replace("</w>", "·")), frecuencia: v.frecuencia }));
  }
  var sym = (s) => s.replace("</w>", "·");
  function Bpe({ paso = 0, final, quieto }) {
    useFuentes();
    const p = final ? 4 : paso;
    const [uniones, setUniones] = useState2(p >= 4 ? 10 : p >= 3 ? 1 : 0);
    useEffect2(() => {
      if (p < 3) return setUniones(0);
      if (p === 3) return setUniones(1);
      if (final || quieto) return setUniones(10);
      setUniones(1);
      let k = 1;
      const reloj = setInterval(() => {
        k += 1;
        setUniones(k);
        if (k >= 10) clearInterval(reloj);
      }, 650);
      return () => clearInterval(reloj);
    }, [p, final, quieto]);
    const filas = segmentos(uniones);
    const px = 30;
    const altoT = 54;
    const paresPaso1 = bpe_default.pasos[0].pares.slice(0, 6);
    const maxPar = paresPaso1[0].frecuencia;
    const nuevos = bpe_default.pasos.slice(0, uniones);
    const ultimo = uniones > 0 ? sym(bpe_default.pasos[uniones - 1].union.join("")) : null;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama prog-svg", viewBox: "0 0 1200 470", role: "img", "aria-label": "El algoritmo BPE une los pares de símbolos más frecuentes" }, /* @__PURE__ */ React.createElement("text", { x: 0, y: 22, dominantBaseline: "central", fontSize: 18, fontWeight: 700, className: "t-suave" }, "Corpus"), filas.map((f, r) => {
      let x = 0;
      const y = 50 + r * 92;
      return /* @__PURE__ */ React.createElement("g", { key: r, className: `aparece-p ${p >= 1 ? "visto" : ""}` }, f.simbolos.map((s, k) => {
        const w = Math.max(44, ancho(s, px, 600) + 26);
        const esNuevo = ultimo && s === ultimo;
        const resaltarPar = p === 2 && (s === "e" && f.simbolos[k + 1] === "s" || s === "s" && f.simbolos[k - 1] === "e");
        const g = /* @__PURE__ */ React.createElement("g", { key: k, className: `baldosa ${esNuevo ? "nueva" : ""}`, style: { transform: `translate(${x}px, ${y}px)` } }, /* @__PURE__ */ React.createElement("rect", { width: w, height: altoT, rx: 10, className: `baldosa-fondo ${resaltarPar ? "par-elegido" : ""} ${s.length > 1 ? "unida" : ""}` }), /* @__PURE__ */ React.createElement("text", { x: w / 2, y: altoT / 2, textAnchor: "middle", dominantBaseline: "central", fontSize: px, fontWeight: 600 }, s));
        x += w + 8;
        return g;
      }), /* @__PURE__ */ React.createElement("text", { x: x + 14, y: y + altoT / 2, dominantBaseline: "central", fontSize: 24, fontWeight: 700, className: "t-acento-2" }, "× ", f.frecuencia));
    }), /* @__PURE__ */ React.createElement("g", { className: `aparece-p desliza-izq ${p === 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 760, y: 10, width: 432, height: 400, rx: 18, className: "panel-fondo" }), /* @__PURE__ */ React.createElement("text", { x: 976, y: 42, textAnchor: "middle", dominantBaseline: "central", fontSize: 19, fontWeight: 700, className: "t-titulo" }, "Pares vecinos más frecuentes"), paresPaso1.map((par, k) => {
      const y = 86 + k * 52;
      const w = par.frecuencia / maxPar * 220;
      return /* @__PURE__ */ React.createElement("g", { key: k }, /* @__PURE__ */ React.createElement("text", { x: 850, y, textAnchor: "end", dominantBaseline: "central", fontSize: 22, fontWeight: 700 }, sym(par.par[0]), " + ", sym(par.par[1])), /* @__PURE__ */ React.createElement("rect", { x: 866, y: y - 14, width: w, height: 28, rx: 8, className: k === 0 ? "barra-par elegida" : "barra-par" }), /* @__PURE__ */ React.createElement("text", { x: 874 + w, y, dominantBaseline: "central", fontSize: 20, fontWeight: 700, className: k === 0 ? "t-acento" : "t-suave" }, par.frecuencia));
    }), /* @__PURE__ */ React.createElement("text", { x: 976, y: 392, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, className: "t-suave" }, "Empatan tres pares con 9: el código toma el primero.")), /* @__PURE__ */ React.createElement("g", { className: `aparece-p desliza-izq ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 760, y: 10, width: 432, height: 452, rx: 18, className: "panel-fondo" }), /* @__PURE__ */ React.createElement("text", { x: 976, y: 42, textAnchor: "middle", dominantBaseline: "central", fontSize: 19, fontWeight: 700, className: "t-titulo" }, "Símbolos nuevos del vocabulario"), nuevos.map((u, k) => {
      const col = k < 5 ? 0 : 1;
      const fila = k % 5;
      const x = 790 + col * 206;
      const y = 92 + fila * 70;
      return /* @__PURE__ */ React.createElement("g", { key: k, className: "union-nueva" }, /* @__PURE__ */ React.createElement("text", { x, y, dominantBaseline: "central", fontSize: 16, className: "t-suave" }, sym(u.union[0]), " + ", sym(u.union[1])), /* @__PURE__ */ React.createElement("text", { x, y: y + 26, dominantBaseline: "central", fontSize: 24, fontWeight: 700, className: k === uniones - 1 ? "t-acento" : "" }, sym(u.union.join(""))), /* @__PURE__ */ React.createElement("text", { x: x + 176, y: y + 26, textAnchor: "end", dominantBaseline: "central", fontSize: 15, className: "t-tenue" }, u.frecuencia));
    }))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_BPE, paso: p }));
  }
  function Idiomas({ paso = 0, final }) {
    const p = final ? 2 : paso;
    const f = tokens_default.frase;
    const a = tokens_default.articulo;
    const pct = (es, en) => Math.round((es / en - 1) * 100);
    const grupos = [
      {
        titulo: "La frase del ejemplo, con o200k_base",
        filas: [
          { rotulo: "Español", valor: f.o200k_base_es.length, detalle: `${f.palabras_es} palabras` },
          { rotulo: "Inglés", valor: f.o200k_base_en.length, detalle: `${f.palabras_en} palabras` }
        ],
        max: 12,
        dif: pct(f.o200k_base_es.length, f.o200k_base_en.length),
        paso: 0
      },
      {
        titulo: "El artículo de Lee y Trott (2023), con o200k_base",
        filas: [
          { rotulo: "Español", valor: a.es.tokens_o200k_base, detalle: `${miles(a.es.palabras)} palabras` },
          { rotulo: "Inglés", valor: a.en.tokens_o200k_base, detalle: `${miles(a.en.palabras)} palabras` }
        ],
        max: 17e3,
        dif: pct(a.es.tokens_o200k_base, a.en.tokens_o200k_base),
        paso: 1
      },
      {
        titulo: "El mismo artículo, con el tokenizer de GPT-2 (2019)",
        filas: [
          { rotulo: "Español", valor: a.es.tokens_gpt2 },
          { rotulo: "Inglés", valor: a.en.tokens_gpt2 }
        ],
        max: 17e3,
        dif: pct(a.es.tokens_gpt2, a.en.tokens_gpt2),
        paso: 2
      }
    ];
    return /* @__PURE__ */ React.createElement("div", { className: "grafico-idiomas" }, grupos.map((g) => /* @__PURE__ */ React.createElement("div", { key: g.titulo, className: `grupo-barras aparece-p ${p >= g.paso ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "grupo-titulo" }, g.titulo, /* @__PURE__ */ React.createElement("span", { className: "dif" }, "+", g.dif, " % en español")), g.filas.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.rotulo, className: "fila-barra" }, /* @__PURE__ */ React.createElement("span", { className: "rotulo" }, r.rotulo), /* @__PURE__ */ React.createElement("span", { className: "pista" }, /* @__PURE__ */ React.createElement("span", { className: `valor ${r.rotulo === "Español" ? "es" : "en"}`, style: { width: `${Math.max(2, r.valor / g.max * 100)}%` } })), /* @__PURE__ */ React.createElement("span", { className: "num" }, /* @__PURE__ */ React.createElement("b", null, miles(r.valor)), " tokens", r.detalle ? /* @__PURE__ */ React.createElement("small", null, " · ", r.detalle) : null))))));
  }
  function Demo() {
    useFuentes();
    const tok = window.GPTTokenizer_o200k_base;
    const enVivo = !!(tok && tok.encode && tok.decode);
    const [texto, setTexto] = useState2(tokens_default.demo[0].texto);
    const [elegida, setElegida] = useState2(0);
    const area = useRef(null);
    const tokens = useMemo(() => {
      if (enVivo) {
        try {
          return tok.encode(texto).map((id) => ({ id, texto: tok.decode([id]) }));
        } catch (e) {
          return [];
        }
      }
      return tokens_default.demo[elegida].tokens;
    }, [texto, elegida, enVivo]);
    const palabras = (enVivo ? texto : tokens_default.demo[elegida].texto).trim().split(/\s+/).filter(Boolean).length;
    const caracteres = [...enVivo ? texto : tokens_default.demo[elegida].texto].length;
    return /* @__PURE__ */ React.createElement("div", { className: "demo-tokens" }, enVivo ? /* @__PURE__ */ React.createElement(
      "textarea",
      {
        ref: area,
        className: "demo-entrada",
        value: texto,
        spellCheck: false,
        "aria-label": "Escribe un texto para ver sus tokens",
        onChange: (e) => setTexto(e.target.value),
        onKeyDown: (e) => e.stopPropagation()
      }
    ) : /* @__PURE__ */ React.createElement("div", { className: "demo-respaldo" }, /* @__PURE__ */ React.createElement("p", null, "Sin el tokenizer del navegador. Elige una frase ya cortada:"), /* @__PURE__ */ React.createElement("div", { className: "demo-opciones" }, tokens_default.demo.map((d, i) => /* @__PURE__ */ React.createElement("button", { key: i, type: "button", className: i === elegida ? "activa" : "", onClick: (e) => {
      setElegida(i);
      e.currentTarget.blur();
    } }, d.texto)))), /* @__PURE__ */ React.createElement("div", { className: "demo-fichas", "aria-live": "polite" }, tokens.map((t, i) => {
      const { espacio, cuerpo } = partirEspacio(t.texto);
      return /* @__PURE__ */ React.createElement("span", { key: i, className: "demo-ficha", style: { "--c": color(i) } }, /* @__PURE__ */ React.createElement("span", { className: "txt" }, espacio ? /* @__PURE__ */ React.createElement("i", { className: "esp", "aria-label": "espacio" }) : null, cuerpo === "" ? " " : cuerpo.replace(/\n/g, "↵")), /* @__PURE__ */ React.createElement("span", { className: "id" }, t.id));
    })), /* @__PURE__ */ React.createElement("div", { className: "demo-cuenta" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, caracteres), " caracteres"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, palabras), " palabras"), /* @__PURE__ */ React.createElement("span", { className: "tokens" }, /* @__PURE__ */ React.createElement("b", null, tokens.length), " tokens"), /* @__PURE__ */ React.createElement("span", { className: "fuente" }, enVivo ? "o200k_base en tu navegador, sin internet (gpt-tokenizer 4.1.2)" : "o200k_base, calculado antes con tiktoken")));
  }

  // src/vectores.jsx
  var { useMemo: useMemo2, useRef: useRef2, useEffect: useEffect3 } = React;
  var PIE_FILA = [
    "El token «·token» de GPT-2 pequeño. Su número en el vocabulario es el 11241.",
    "Paso 1. El tokenizer ya hizo su trabajo: el modelo recibe el número 11241.",
    "Paso 2. Ese número elige una fila de la tabla de embeddings: la fila 11241.",
    "Paso 3. La fila sale como una lista de 768 números: el vector del token.",
    "Paso 4. La tabla entera es parte de los pesos. Otra tabla aporta la posición."
  ];
  function BuscarFila({ paso = 0, final }) {
    useFuentes();
    const idB = useIdSvg("brillo-fila");
    const p = final ? 4 : paso;
    const fila = gpt2_default.fila;
    const tabla = gpt2_default.tabla_embeddings;
    const filasVisibles = 21;
    const yTabla = 34;
    const altoFila = 17;
    const objetivo = 10;
    const valores = fila.primeros_valores;
    const max = Math.max(Math.abs(fila.minimo), Math.abs(fila.maximo));
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama prog-svg", viewBox: "0 0 1200 470", role: "img", "aria-label": "El número del token elige una fila de la tabla de embeddings de GPT-2" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement(FiltroBrillo, { id: idB, fuerza: 6 })), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 10, y: 168, width: 200, height: 96, rx: 16, fill: suave("var(--t1)", 20), stroke: "var(--t1)", strokeWidth: 2.5 }), /* @__PURE__ */ React.createElement(MarcaEspacio, { x: 46, y: 210, px: 30 }), /* @__PURE__ */ React.createElement("text", { x: 64, y: 200, dominantBaseline: "central", fontSize: 30, fontWeight: 600 }, "token"), /* @__PURE__ */ React.createElement("text", { x: 110, y: 240, textAnchor: "middle", dominantBaseline: "central", fontSize: 24, fontWeight: 700, className: "t-acento" }, fila.id), /* @__PURE__ */ React.createElement("path", { d: "M214 216 H292", className: `arista acento ${p >= 2 ? "" : "oculto"}`, strokeWidth: 3 }), /* @__PURE__ */ React.createElement("path", { d: "M296 216 l-14 -9 v18z", className: `relleno-acento ${p >= 2 ? "" : "oculto"}` })), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("text", { x: 520, y: 14, textAnchor: "middle", dominantBaseline: "central", fontSize: 17, fontWeight: 700, className: "t-suave" }, "Tabla de embeddings · ", miles(tabla.filas), " filas × ", tabla.columnas, " columnas"), Array.from({ length: filasVisibles }).map((_, k) => {
      const n = fila.id - objetivo + k;
      const y = yTabla + 6 + k * altoFila;
      const esta = k === objetivo;
      return /* @__PURE__ */ React.createElement("g", { key: k }, /* @__PURE__ */ React.createElement("text", { x: 372, y: y + altoFila / 2, textAnchor: "end", dominantBaseline: "central", fontSize: 12, className: esta ? "t-acento" : "t-tenue", fontWeight: esta ? 700 : 400 }, n), /* @__PURE__ */ React.createElement("rect", { x: 382, y: y + 1, width: 300, height: altoFila - 3, rx: 3, className: esta && p >= 2 ? "fila-tabla elegida" : "fila-tabla", filter: esta && p >= 2 ? `url(#${idB})` : void 0 }));
    }), /* @__PURE__ */ React.createElement("text", { x: 532, y: yTabla + 6 + filasVisibles * altoFila + 18, textAnchor: "middle", dominantBaseline: "central", fontSize: 14, className: "t-tenue" }, "… filas de la 0 a la ", miles(tabla.filas - 1)), !final && p === 2 ? /* @__PURE__ */ React.createElement("rect", { className: "barrido-fila", x: 382, y: yTabla + 6, width: 300, height: altoFila - 3, rx: 3 }) : null), /* @__PURE__ */ React.createElement("g", { className: `aparece-p desliza-der ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("text", { x: 950, y: 150, textAnchor: "middle", dominantBaseline: "central", fontSize: 18, fontWeight: 700 }, "El vector de «token»"), valores.map((v, k) => {
      const col = k % 16;
      const fil = Math.floor(k / 16);
      return /* @__PURE__ */ React.createElement("rect", { key: k, x: 732 + col * 27, y: 176 + fil * 34, width: 24, height: 30, rx: 5, fill: colorPeso(v, max), stroke: "var(--borde)", strokeWidth: 1 });
    }), valores.slice(0, 6).map((v, k) => /* @__PURE__ */ React.createElement("text", { key: k, x: 745 + k * 27, y: 262, textAnchor: "end", dominantBaseline: "central", fontSize: 12, className: "t-suave", transform: `rotate(-50 ${745 + k * 27} 262)` }, v.toFixed(3))), /* @__PURE__ */ React.createElement("text", { x: 950, y: 310, textAnchor: "middle", dominantBaseline: "central", fontSize: 16, className: "t-suave" }, "Se ven 32 de sus 768 números. Cian: positivo · rosa: negativo."), /* @__PURE__ */ React.createElement("path", { d: "M690 216 C 710 216, 712 200, 728 196", className: "arista acento" })), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 706, y: 348, width: 492, height: 114, rx: 16, className: "panel-fondo" }), /* @__PURE__ */ React.createElement("text", { x: 952, y: 378, textAnchor: "middle", dominantBaseline: "central", fontSize: 19, fontWeight: 700, className: "t-acento" }, miles(tabla.filas), " × ", tabla.columnas, " = ", miles(tabla.filas * tabla.columnas), " pesos"), /* @__PURE__ */ React.createElement("text", { x: 952, y: 408, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, className: "t-suave" }, "La tabla se aprende en el entrenamiento: es parte de los pesos."), /* @__PURE__ */ React.createElement("text", { x: 952, y: 436, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, className: "t-suave" }, "Otra tabla, de ", miles(1024), " filas, le dice al modelo el orden de los tokens."))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_FILA, paso: p }));
  }
  var GRUPOS = {
    lenguajes: { nombre: "Lenguajes de programación", c: "var(--t1)" },
    "países": { nombre: "Países", c: "var(--t2)" },
    "números": { nombre: "Números", c: "var(--t4)" },
    comida: { nombre: "Comida", c: "var(--t5)" },
    personas: { nombre: "Personas", c: "var(--t3)" }
  };
  var R = 230;
  var ESTIRAR = 1.35;
  function Segmento({ a, b, c }) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    const largo = Math.hypot(dx, dy, dz);
    const phi = Math.asin(dy / largo);
    const theta = Math.atan2(-dz, dx);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "segmento3d",
        style: {
          width: `${largo}px`,
          "--c": c,
          transform: `translate3d(${a[0]}px, ${a[1]}px, ${a[2]}px) rotateY(${theta}rad) rotateZ(${phi}rad)`
        }
      },
      /* @__PURE__ */ React.createElement("span", { className: "punta" })
    );
  }
  var PIE_NUBE = [
    "Cada punto es el vector de una palabra en GPT-2, reducido a 3 dimensiones. Las parecidas quedan juntas.",
    "La flecha de «man» a «woman» es casi paralela a la de «king» a «queen»: una analogía."
  ];
  var ANGULO_ANALOGIA = 60;
  var VUELTA_SEGUNDOS = 46;
  function Nube3D({ paso = 0, final, quieto }) {
    const p = final ? 1 : paso;
    const puntos = gpt2_default.espacio_3d.puntos;
    const pos = (pal) => {
      const q = puntos.find((k) => k.palabra === pal);
      return [q.x * R * ESTIRAR, -q.y * R, q.z * R * ESTIRAR];
    };
    const plano = document.documentElement.classList.contains("sin-3d");
    const analogia = gpt2_default.analogia;
    const giro = useRef2(null);
    const angulo = useRef2(-24);
    const pasoRef = useRef2(p);
    pasoRef.current = p;
    useEffect3(() => {
      const el = giro.current;
      if (!el) return void 0;
      const poner = () => el.style.setProperty("--ang", `${angulo.current}deg`);
      if (quieto) {
        angulo.current = ANGULO_ANALOGIA;
        poner();
        return void 0;
      }
      let anterior = performance.now();
      let id = 0;
      const cuadro = (ahora) => {
        const dt = Math.min(0.05, (ahora - anterior) / 1e3);
        anterior = ahora;
        if (pasoRef.current >= 1) {
          let d = ((ANGULO_ANALOGIA - angulo.current) % 360 + 540) % 360 - 180;
          angulo.current += d * Math.min(1, dt * 2.2);
        } else {
          angulo.current = (angulo.current + 360 / VUELTA_SEGUNDOS * dt) % 360;
        }
        poner();
        id = requestAnimationFrame(cuadro);
      };
      id = requestAnimationFrame(cuadro);
      return () => cancelAnimationFrame(id);
    }, [quieto, plano]);
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "nube-envoltura" }, plano ? /* @__PURE__ */ React.createElement(NubePlana, { puntos, conFlechas: p >= 1 }) : /* @__PURE__ */ React.createElement("div", { className: `nube3d ${p >= 1 ? "con-analogia" : ""}`, "aria-label": "Nube de palabras en tres dimensiones" }, /* @__PURE__ */ React.createElement("div", { className: "nube3d-giro", ref: giro }, puntos.map((q) => /* @__PURE__ */ React.createElement("div", { key: q.palabra, className: `punto3d ${q.grupo === "personas" ? "persona" : ""}`, style: { transform: `translate3d(${q.x * R * ESTIRAR}px, ${-q.y * R}px, ${q.z * R * ESTIRAR}px)`, "--c": GRUPOS[q.grupo].c } }, /* @__PURE__ */ React.createElement("div", { className: "punto3d-cara" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("b", null, q.palabra), q.grupo === "personas" ? /* @__PURE__ */ React.createElement("small", null, q.es) : null))), p >= 1 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Segmento, { a: pos("man"), b: pos("woman"), c: "var(--t3)" }), /* @__PURE__ */ React.createElement(Segmento, { a: pos("king"), b: pos("queen"), c: "var(--t3)" })) : null)), /* @__PURE__ */ React.createElement("div", { className: "nube-leyenda" }, Object.entries(GRUPOS).map(([k, g]) => /* @__PURE__ */ React.createElement("span", { key: k, style: { "--c": g.c } }, /* @__PURE__ */ React.createElement("i", null), g.nombre)), /* @__PURE__ */ React.createElement("div", { className: `nube-analogia aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("b", null, "king − man + woman"), /* @__PURE__ */ React.createElement("span", null, "La palabra más cercana al resultado es ", /* @__PURE__ */ React.createElement("b", { className: "texto-acento" }, analogia.mas_cercanas[0]), "."), /* @__PURE__ */ React.createElement("small", null, "Cálculo con los 768 números de cada vector, sin contar las tres palabras de la pregunta.")))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_NUBE, paso: p }));
  }
  function NubePlana({ puntos, conFlechas }) {
    useFuentes();
    const idM = useIdSvg("punta-nube");
    const a = ANGULO_ANALOGIA * Math.PI / 180;
    const proy = puntos.map((q) => ({ ...q, px: 300 + (q.x * Math.cos(a) + q.z * Math.sin(a)) * 330 * ESTIRAR * 0.8, py: 240 - q.y * 215 }));
    const puestos = [];
    [...proy].sort((m, n) => m.py - n.py).forEach((q) => {
      const w = ancho(q.palabra, 15, 600) + 6;
      let ty = q.py;
      let intentos = 0;
      while (intentos < 12 && puestos.some((r) => Math.abs(r.ty - ty) < 17 && q.px + 11 < r.x + r.w && r.x < q.px + 11 + w)) {
        ty += 17;
        intentos += 1;
      }
      puestos.push({ x: q.px + 11, ty, w, palabra: q.palabra });
      q.ty = ty;
    });
    const buscar = (pal) => proy.find((k) => k.palabra === pal);
    const flecha = (m, n) => {
      const p = buscar(m);
      const q = buscar(n);
      return /* @__PURE__ */ React.createElement("path", { d: `M${p.px} ${p.py} L${q.px} ${q.py}`, className: "arista", style: { stroke: "var(--t3)", strokeWidth: 4 }, markerEnd: `url(#${idM})` });
    };
    return /* @__PURE__ */ React.createElement("svg", { className: "diagrama nube-plana", viewBox: "0 0 660 500", role: "img", "aria-label": "Nube de palabras vista desde un ángulo fijo" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("marker", { id: idM, viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "5", markerHeight: "5", orient: "auto" }, /* @__PURE__ */ React.createElement("path", { d: "M0 0 10 5 0 10z", style: { fill: "var(--t3)" } }))), proy.map((q) => /* @__PURE__ */ React.createElement("g", { key: q.palabra, opacity: conFlechas && q.grupo !== "personas" ? 0.45 : 1 }, /* @__PURE__ */ React.createElement("circle", { cx: q.px, cy: q.py, r: 6, style: { fill: GRUPOS[q.grupo].c } }), /* @__PURE__ */ React.createElement("text", { x: q.px + 11, y: q.ty, dominantBaseline: "central", fontSize: 15, fontWeight: 600 }, q.palabra))), conFlechas ? /* @__PURE__ */ React.createElement(React.Fragment, null, flecha("man", "woman"), flecha("king", "queen")) : null);
  }

  // src/atencion.jsx
  var { useState: useState3 } = React;
  var FRASE = ["John", "busca", "en", "su", "banco", "cambio", "de", "un"];
  var ETIQUETAS = ["una persona", "una acción", "un lugar", "de alguien", "un banco", "dinero", "un enlace", "viene algo"];
  var FOCOS = [
    { pregunta: "¿Quién soy?", pesos: [100], resultado: "persona" },
    { pregunta: "¿Quién busca?", pesos: [60, 40], resultado: "verbo" },
    { pregunta: "¿En dónde?", pesos: [10, 55, 35], resultado: "lugar" },
    { pregunta: "¿De quién soy?", pesos: [65, 10, 5, 20], resultado: "de John" },
    { pregunta: "¿Qué tipo de banco soy?", pesos: [10, 25, 5, 45, 15], resultado: "institución financiera" },
    { pregunta: "¿Cambio de qué?", pesos: [5, 15, 5, 10, 50, 15], resultado: "moneda fraccionada" },
    { pregunta: "¿De qué?", pesos: [3, 5, 2, 3, 15, 52, 20], resultado: "une «cambio» con lo que sigue" },
    { pregunta: "¿Un qué?", pesos: [2, 6, 2, 3, 15, 40, 22, 10], resultado: "pide un sustantivo" }
  ];
  var PIE = [
    "La frase de Lee y Trott (2023). En o200k_base, cada palabra de esta frase es un token.",
    "Paso 1. «banco» puede ser una institución financiera o el banco de un río.",
    "Paso 2. «banco» lanza su pregunta, el query: ¿qué palabra me dice qué tipo de banco soy?",
    "Paso 3. Cada palabra anterior muestra su etiqueta, el key: lo que puede ofrecer.",
    "Paso 4. El parecido entre la pregunta y cada etiqueta da un porcentaje. Todos suman 100 %.",
    "Paso 5. Cada palabra envía su contenido, el value, en proporción a su porcentaje.",
    "Paso 6. El vector de «banco» se mezcla y ahora dice «institución financiera». Pasa en cada capa."
  ];
  function posicionesFrase(palabras, px, gap, anchoTotal, x0 = 0) {
    const anchos = palabras.map((w) => ancho(w, px, 600) + px * 1.05);
    const total = anchos.reduce((s, w) => s + w, 0) + gap * (palabras.length - 1);
    let x = x0 + (anchoTotal - total) / 2;
    return anchos.map((w) => {
      const r = { x, w, cx: x + w / 2 };
      x += w + gap;
      return r;
    });
  }
  function Atencion({ paso = 0, final, quieto }) {
    useFuentes();
    const idB = useIdSvg("brillo-at");
    const [foco, setFoco] = useState3(4);
    const p = final ? 6 : paso;
    const px = 28;
    const yF = 292;
    const altoF = 58;
    const pos = posicionesFrase(FRASE, px, 20, 1200);
    const f = FOCOS[foco];
    const cxF = pos[foco].cx;
    const arcos = f.pesos.map((pct, j) => {
      const distancia = foco - j;
      if (distancia === 0) {
        const d = `M${cxF - 16} ${yF} C ${cxF - 54} ${yF - 104}, ${cxF + 54} ${yF - 104}, ${cxF + 16} ${yF}`;
        return { j, pct, d, cimaX: cxF, cimaY: yF - 96 };
      }
      const h = 70 + 40 * distancia;
      return { j, pct, d: arco(cxF, pos[j].cx, yF, h), cimaX: (cxF + pos[j].cx) / 2, cimaY: cimaArco(yF, h) };
    });
    const tocar = (i) => (e) => {
      setFoco(i);
      if (e && e.currentTarget && e.currentTarget.blur) e.currentTarget.blur();
    };
    const celdas = [];
    f.pesos.forEach((pct, j) => {
      const n = Math.round(pct / 5);
      for (let k = 0; k < n; k++) celdas.push(j);
    });
    const anchoPregunta = Math.max(260, ancho(f.pregunta, 22, 600) + 48);
    const anchoResultado = Math.max(260, ancho(`${FRASE[foco]} (${f.resultado})`, 22, 700) + 48);
    const xBurbuja = Math.min(1200 - anchoPregunta - 4, Math.max(4, cxF - anchoPregunta / 2));
    const xResultado = Math.min(1200 - anchoResultado - 4, Math.max(4, cxF - anchoResultado / 2));
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama prog-svg", viewBox: "0 0 1200 500", role: "img", "aria-label": "La atención: la palabra banco pregunta, las palabras anteriores responden con su etiqueta y le envían su contenido" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement(FiltroBrillo, { id: idB, fuerza: 5 })), arcos.map((a) => /* @__PURE__ */ React.createElement("g", { key: a.j, className: `aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("path", { d: a.d, fill: "none", stroke: color(a.j), strokeWidth: 2 + a.pct / 7, strokeLinecap: "round", opacity: 0.85, filter: `url(#${idB})` }), p >= 5 ? /* @__PURE__ */ React.createElement(Particulas, { d: a.d, n: Math.max(1, Math.round(a.pct / 12)), c: color(a.j), dur: 1.7, r: 4 + a.pct / 20, quieto, invertir: true }) : null)), arcos.map((a) => /* @__PURE__ */ React.createElement("g", { key: `p${a.j}`, className: `aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: a.cimaX - 31, y: a.cimaY - 16, width: 62, height: 30, rx: 15, className: "pastilla" }), /* @__PURE__ */ React.createElement("text", { x: a.cimaX, y: a.cimaY - 1, textAnchor: "middle", dominantBaseline: "central", fontSize: 18, fontWeight: 700, style: { fill: color(a.j) } }, a.pct, " %"))), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 2 && p < 6 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: xBurbuja, y: 18, width: anchoPregunta, height: 64, rx: 18, fill: suave("var(--t1)", 22), stroke: "var(--t1)", strokeWidth: 2.5 }), /* @__PURE__ */ React.createElement("text", { x: xBurbuja + anchoPregunta / 2, y: 38, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, fontWeight: 700, className: "t-acento" }, "query: la pregunta"), /* @__PURE__ */ React.createElement("text", { x: xBurbuja + anchoPregunta / 2, y: 62, textAnchor: "middle", dominantBaseline: "central", fontSize: 22, fontWeight: 600 }, f.pregunta), /* @__PURE__ */ React.createElement("path", { d: `M${cxF} 84 V${yF - 118}`, className: "arista acento punteada" })), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 6 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: xResultado, y: 18, width: anchoResultado, height: 64, rx: 18, fill: suave("var(--t5)", 22), stroke: "var(--t5)", strokeWidth: 2.5, filter: `url(#${idB})` }), /* @__PURE__ */ React.createElement("text", { x: xResultado + anchoResultado / 2, y: 38, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, fontWeight: 700, style: { fill: "var(--t5)" } }, "el vector ya mezclado dice"), /* @__PURE__ */ React.createElement("text", { x: xResultado + anchoResultado / 2, y: 62, textAnchor: "middle", dominantBaseline: "central", fontSize: 22, fontWeight: 700 }, FRASE[foco], " (", f.resultado, ")"), celdas.map((j, k) => /* @__PURE__ */ React.createElement("rect", { key: k, x: cxF - celdas.length * 6 + k * 12, y: 92, width: 11, height: 22, rx: 3, fill: color(j) }))), FRASE.map((w, i) => {
      const esFoco = i === foco && p >= 1;
      const c = color(i);
      return /* @__PURE__ */ React.createElement(
        "g",
        {
          key: i,
          className: `ficha tocable ${esFoco ? "foco" : ""}`,
          style: { transform: `translate(${pos[i].x}px, ${yF}px)`, opacity: p >= 3 && i > foco ? 0.28 : 1 },
          onClick: tocar(i),
          role: "button",
          "aria-label": `Ver las conexiones de ${w}`
        },
        esFoco ? /* @__PURE__ */ React.createElement("rect", { x: -7, y: -7, width: pos[i].w + 14, height: altoF + 14, rx: 18, fill: "none", stroke: "var(--t1)", strokeWidth: 3, filter: `url(#${idB})`, className: "ficha-brillo" }) : null,
        /* @__PURE__ */ React.createElement("rect", { width: pos[i].w, height: altoF, rx: 14, fill: suave(c, esFoco ? 34 : 18), stroke: c, strokeWidth: 2.5 }),
        /* @__PURE__ */ React.createElement("text", { x: pos[i].w / 2, y: altoF / 2, textAnchor: "middle", dominantBaseline: "central", fontSize: px, fontWeight: 600 }, w)
      );
    }), /* @__PURE__ */ React.createElement("text", { x: pos[7].x + pos[7].w + 12, y: yF + altoF / 2, dominantBaseline: "central", fontSize: 28, className: "t-tenue" }, "…"), FRASE.map((w, i) => {
      if (i > foco) return null;
      const t = ETIQUETAS[i];
      const wT = ancho(t, 16, 600) + 22;
      return /* @__PURE__ */ React.createElement("g", { key: `k${i}`, className: `aparece-p ${p >= 3 ? "visto" : ""}`, style: { transitionDelay: p >= 3 && !final ? `${i * 0.08}s` : "0s" } }, /* @__PURE__ */ React.createElement("rect", { x: pos[i].cx - wT / 2, y: yF + altoF + 12 + i % 2 * 36, width: wT, height: 30, rx: 9, fill: suave("var(--t2)", 18), stroke: "var(--t2)", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("text", { x: pos[i].cx, y: yF + altoF + 27 + i % 2 * 36, textAnchor: "middle", dominantBaseline: "central", fontSize: 16, fontWeight: 600 }, t));
    }), /* @__PURE__ */ React.createElement("text", { x: 8, y: yF + altoF + 29, dominantBaseline: "central", fontSize: 15, fontWeight: 700, className: `t-acento-2 aparece-p ${p >= 3 ? "visto" : ""}` }, "key: la etiqueta"), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 4 ? "visto" : ""}` }, (() => {
      let x = 300;
      return f.pesos.map((pct, j) => {
        const w = pct / 100 * 600;
        const r = /* @__PURE__ */ React.createElement("rect", { key: j, x, y: 448, width: Math.max(1, w - 2), height: 20, rx: 5, fill: color(j), opacity: 0.85 });
        x += w;
        return r;
      });
    })(), /* @__PURE__ */ React.createElement("text", { x: 288, y: 458, textAnchor: "end", dominantBaseline: "central", fontSize: 16, fontWeight: 700 }, "100 %"), /* @__PURE__ */ React.createElement("text", { x: 912, y: 458, dominantBaseline: "central", fontSize: 15, className: "t-suave" }, f.pesos.length, " palabras reparten la atención")), /* @__PURE__ */ React.createElement("text", { x: 1192, y: 494, textAnchor: "end", fontSize: 14, className: `t-tenue aparece-p ${p >= 4 ? "visto" : ""}` }, "Toca una palabra para ver sus conexiones"), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 6 && foco === 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 836, y: 122, width: 356, height: 148, rx: 14, className: "panel-fondo" }), /* @__PURE__ */ React.createElement("text", { x: 1014, y: 142, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, fontWeight: 700, className: "t-suave" }, "Capa por capa, según Lee y Trott (2023)"), /* @__PURE__ */ React.createElement("text", { x: 852, y: 176, dominantBaseline: "central", fontSize: 15, fontWeight: 700, className: "t-acento-2" }, "Capa 2"), /* @__PURE__ */ React.createElement("text", { x: 922, y: 176, dominantBaseline: "central", fontSize: 15 }, "su (de John)"), /* @__PURE__ */ React.createElement("text", { x: 922, y: 198, dominantBaseline: "central", fontSize: 15 }, "banco (institución financiera)"), /* @__PURE__ */ React.createElement("text", { x: 852, y: 232, dominantBaseline: "central", fontSize: 15, fontWeight: 700, className: "t-acento" }, "Capa 1"), /* @__PURE__ */ React.createElement("text", { x: 922, y: 232, dominantBaseline: "central", fontSize: 15 }, "busca (verbo)"), /* @__PURE__ */ React.createElement("text", { x: 922, y: 254, dominantBaseline: "central", fontSize: 15 }, "cambio (moneda fraccionada)"))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE, paso: p }), p >= 4 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Porcentajes ilustrativos" }) : null));
  }

  // src/cabezas.jsx
  var { useState: useState4, useEffect: useEffect4 } = React;
  var CABEZAS = [
    { pregunta: "¿De quién es?", ejemplo: "su → John", arcos: [[3, 0, 70], [7, 0, 12]] },
    { pregunta: "¿Qué tipo de banco?", ejemplo: "cambio → banco", arcos: [[5, 4, 65], [4, 1, 22]] },
    { pregunta: "¿Qué va justo antes?", ejemplo: "cada palabra → la anterior", arcos: [[1, 0, 40], [2, 1, 40], [3, 2, 40], [4, 3, 40], [5, 4, 40], [6, 5, 40], [7, 6, 40]] },
    { pregunta: "¿Quién hace la acción?", ejemplo: "busca → John", arcos: [[1, 0, 75], [6, 1, 18]] }
  ];
  var PIE2 = [
    "La misma frase. Una cabeza de atención es una manera de mirar las otras palabras.",
    "Paso 1. Una sola cabeza: «su» mira a «John» para saber de quién es.",
    "Paso 2. Varias cabezas trabajan en paralelo. Cada una busca algo distinto.",
    "Paso 3. Cada cabeza es un plano. Al separarlos, se ve el patrón de cada una.",
    "Paso 4. Lo que encontró cada cabeza se junta en un solo vector por palabra.",
    "Paso 5. La escala real: GPT-3 tiene 96 cabezas en cada una de sus 96 capas."
  ];
  var ANCHO_PLANO = 760;
  var ALTO_PLANO = 230;
  function Plano({ k, conFichas, conArcos, conFondo, idB }) {
    const pos = posicionesFrase(FRASE, 22, 12, ANCHO_PLANO - 40, 20);
    const yF = 160;
    const c = color(k);
    return /* @__PURE__ */ React.createElement("svg", { className: "plano-svg", viewBox: `0 0 ${ANCHO_PLANO} ${ALTO_PLANO}`, "aria-hidden": "true" }, conFondo ? /* @__PURE__ */ React.createElement("rect", { x: 1, y: 1, width: ANCHO_PLANO - 2, height: ALTO_PLANO - 2, rx: 18, fill: suave(c, 10), stroke: c, strokeWidth: 2 }) : null, conFondo ? /* @__PURE__ */ React.createElement("text", { x: 22, y: 30, dominantBaseline: "central", fontSize: 18, fontWeight: 700, style: { fill: c } }, "Cabeza ", k + 1) : null, conArcos ? CABEZAS[k].arcos.map(([a, b, fuerza], j) => {
      const dist = a - b;
      const h = 34 + dist * 17;
      return /* @__PURE__ */ React.createElement("path", { key: j, d: arco(pos[a].cx, pos[b].cx, yF, h), fill: "none", stroke: c, strokeWidth: 1.5 + fuerza / 14, strokeLinecap: "round", filter: `url(#${idB})`, opacity: 0.9 });
    }) : null, conFichas ? FRASE.map((w, i) => /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement("rect", { x: pos[i].x, y: yF, width: pos[i].w, height: 46, rx: 11, fill: suave("var(--texto-tenue)", 14), stroke: "var(--borde)", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("text", { x: pos[i].cx, y: yF + 23, textAnchor: "middle", dominantBaseline: "central", fontSize: 22, fontWeight: 600 }, w))) : null);
  }
  function Cabezas({ paso = 0, final }) {
    useFuentes();
    const idB = useIdSvg("brillo-cab");
    const p = final ? 5 : paso;
    const [sola, setSola] = useState4(null);
    const [juntas, setJuntas] = useState4(p >= 4);
    useEffect4(() => {
      if (p < 4) return setJuntas(false);
      if (final || p > 4) return setJuntas(true);
      setJuntas(false);
      const t = setTimeout(() => setJuntas(true), 700);
      return () => clearTimeout(t);
    }, [p, final]);
    const en3d = p === 3 && !document.documentElement.classList.contains("sin-3d");
    const visible = (k) => {
      if (p === 0) return false;
      if (p === 1) return k === 0;
      if (sola !== null) return k === sola;
      return true;
    };
    const elegir = (k) => (e) => {
      setSola((s) => s === k ? null : k);
      e.currentTarget.blur();
    };
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { width: "0", height: "0", style: { position: "absolute" }, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement(FiltroBrillo, { id: idB, fuerza: 3 }))), /* @__PURE__ */ React.createElement("div", { className: "cabezas-rejilla" }, /* @__PURE__ */ React.createElement("div", { className: `cabezas-escena ${en3d ? "en-3d" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "cabezas-pila" }, CABEZAS.map((cab, k) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: k,
        className: `plano ${visible(k) ? "visto" : ""}`,
        style: { transform: en3d ? `translateZ(${(k - 1.5) * 105}px)` : "translateZ(0px)", zIndex: k }
      },
      /* @__PURE__ */ React.createElement(Plano, { k, idB, conArcos: p >= 1, conFichas: k === 0 || en3d, conFondo: en3d })
    )), /* @__PURE__ */ React.createElement("div", { className: `plano ${p === 0 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement(Plano, { k: 0, idB, conArcos: false, conFichas: true, conFondo: false })))), /* @__PURE__ */ React.createElement("div", { className: "cabezas-lado" }, /* @__PURE__ */ React.createElement("div", { className: `cabezas-leyenda aparece-p ${p >= 1 ? "visto" : ""}` }, CABEZAS.map((cab, k) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: k,
        type: "button",
        className: `boton-cabeza ${sola === k ? "activa" : ""} ${p === 1 && k > 0 ? "apagada" : ""}`,
        style: { "--c": color(k) },
        onClick: elegir(k),
        disabled: p < 2,
        "aria-pressed": sola === k
      },
      /* @__PURE__ */ React.createElement("i", null),
      /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "Cabeza ", k + 1, ":"), " ", cab.pregunta, /* @__PURE__ */ React.createElement("small", null, cab.ejemplo))
    ))), /* @__PURE__ */ React.createElement("div", { className: `cabezas-union aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rotulo-union" }, "Un solo vector por palabra"), /* @__PURE__ */ React.createElement("div", { className: `tiras ${juntas ? "juntas" : ""}` }, CABEZAS.map((cab, k) => /* @__PURE__ */ React.createElement("span", { key: k, className: "tira", style: { "--c": color(k), "--k": k } }, Array.from({ length: 6 }).map((_, j) => /* @__PURE__ */ React.createElement("i", { key: j })))))), /* @__PURE__ */ React.createElement("div", { className: `cabezas-escala aparece-p ${p >= 5 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "cuadro-escala", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", { className: "cifra-escala" }, miles(96 * 96)), /* @__PURE__ */ React.createElement("span", null, "cabezas en GPT-3"), /* @__PURE__ */ React.createElement("small", null, "96 capas × 96 cabezas (Brown et al., 2020)"), /* @__PURE__ */ React.createElement("small", null, "GPT-2 pequeño: 12 × 12 = 144"))))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE2, paso: p }), p >= 1 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Patrones ilustrativos" }) : null));
  }

  // src/encoder.jsx
  var PARES = [
    [3, 0],
    [4, 5],
    [1, 0],
    [5, 7],
    [4, 1],
    [6, 5]
  ];
  function atencionIlustrativa(i, j, causal) {
    if (causal && j > i) return 0;
    let v = 0.12 + (i * 7 + j * 3) % 5 * 0.035;
    if (i === j) v += 0.35;
    PARES.forEach(([a, b]) => {
      if (i === a && j === b || i === b && j === a) v += 0.5;
    });
    return v;
  }
  function filaNormalizada(i, causal) {
    const fila = FRASE.map((_, j) => atencionIlustrativa(i, j, causal));
    const s = fila.reduce((a, b) => a + b, 0);
    return fila.map((v) => v / s);
  }
  function Matriz({ x, y, celda = 36, causal = false, visible = true, mascara = null, mostrarCeros = false, final }) {
    const n = FRASE.length;
    const etiquetaW = 74;
    return /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${visible ? "visto" : ""}` }, FRASE.map((w, j) => /* @__PURE__ */ React.createElement("text", { key: `c${j}`, x: x + etiquetaW + j * celda + celda / 2, y: y - 10, textAnchor: "start", dominantBaseline: "central", fontSize: 13, className: "t-suave", transform: `rotate(-50 ${x + etiquetaW + j * celda + celda / 2} ${y - 10})` }, w)), FRASE.map((w, i) => /* @__PURE__ */ React.createElement("text", { key: `f${i}`, x: x + etiquetaW - 8, y: y + i * celda + celda / 2, textAnchor: "end", dominantBaseline: "central", fontSize: 14, className: "t-suave" }, w)), FRASE.map((_, i) => {
      const fila = filaNormalizada(i, false);
      return FRASE.map((__, j) => {
        const oculta = causal && j > i;
        const v = fila[j];
        const pct = Math.round(15 + Math.min(1, v * 2.2) * 75);
        return /* @__PURE__ */ React.createElement("g", { key: `${i}-${j}` }, /* @__PURE__ */ React.createElement(
          "rect",
          {
            x: x + etiquetaW + j * celda + 1.5,
            y: y + i * celda + 1.5,
            width: celda - 3,
            height: celda - 3,
            rx: 5,
            className: `celda-matriz ${visible ? "llena" : ""} ${oculta ? "tapada" : ""}`,
            style: { fill: `color-mix(in srgb, var(--t1) ${pct}%, transparent)`, transitionDelay: visible && !final ? `${(i * n + j) * 0.018}s` : "0s" }
          }
        ), mascara ? /* @__PURE__ */ React.createElement("text", { x: x + etiquetaW + j * celda + celda / 2, y: y + i * celda + celda / 2, textAnchor: "middle", dominantBaseline: "central", fontSize: 14, fontWeight: 700, className: mascara[i][j] ? "digito-mascara" : "digito-mascara cero" }, mascara[i][j]) : null);
      });
    }));
  }
  var PIE3 = [
    "El encoder es la primera mitad del transformer original. Su trabajo es entender la frase.",
    "Paso 1. El encoder lee toda la frase a la vez.",
    "Paso 2. Cada token mira a todos los demás, antes y después. La matriz se llena completa.",
    "Paso 3. Sale un vector por token. Cada uno lleva el contexto de la frase entera.",
    "Paso 4. Sirve para entender, clasificar y buscar por significado.",
    "Paso 5. El ejemplo clásico es BERT: solo encoder (Devlin et al., 2019)."
  ];
  var USOS = [
    { titulo: "Entender", texto: "¿De qué trata este reporte?" },
    { titulo: "Clasificar", texto: "¿Es un fallo o una consulta?" },
    { titulo: "Buscar", texto: "Documentos con el mismo sentido" }
  ];
  function Encoder({ paso = 0, final, quieto }) {
    useFuentes();
    const idB = useIdSvg("brillo-enc");
    const p = final ? 5 : paso;
    const px = 24;
    const pos = posicionesFrase(FRASE, px, 14, 740, 0);
    const yF = 300;
    const altoF = 52;
    const foco = 4;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama prog-svg", viewBox: "0 0 1200 500", role: "img", "aria-label": "El encoder: cada token mira a todos los demás y sale un vector por token" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement(FiltroBrillo, { id: idB, fuerza: 4 })), /* @__PURE__ */ React.createElement("rect", { x: 0, y: 176, width: 740, height: 262, rx: 22, className: `caja-bloque ${p >= 1 ? "activa" : ""}` }), /* @__PURE__ */ React.createElement("text", { x: 20, y: 202, dominantBaseline: "central", fontSize: 19, fontWeight: 700, className: "t-acento" }, "Encoder"), FRASE.map((w, j) => {
      if (j === foco) return null;
      const h = 30 + Math.abs(j - foco) * 15;
      const v = filaNormalizada(foco, false)[j];
      return /* @__PURE__ */ React.createElement(
        "path",
        {
          key: j,
          d: arco(pos[foco].cx, pos[j].cx, yF, h),
          fill: "none",
          stroke: "var(--t1)",
          strokeWidth: 1.5 + v * 16,
          strokeLinecap: "round",
          filter: `url(#${idB})`,
          className: `aparece-p ${p >= 2 ? "visto" : ""}`
        }
      );
    }), FRASE.map((w, i) => /* @__PURE__ */ React.createElement("g", { key: i, className: `ficha-token ${p >= 1 ? "visto" : ""}`, style: { transform: `translate(${pos[i].x}px, ${yF}px)`, transitionDelay: "0s" } }, /* @__PURE__ */ React.createElement("rect", { width: pos[i].w, height: altoF, rx: 12, fill: suave(color(i), i === foco && p >= 2 ? 34 : 18), stroke: color(i), strokeWidth: 2 }), /* @__PURE__ */ React.createElement("text", { x: pos[i].w / 2, y: altoF / 2, textAnchor: "middle", dominantBaseline: "central", fontSize: px, fontWeight: 600 }, w))), p >= 1 && !final && !quieto ? /* @__PURE__ */ React.createElement("rect", { className: "pulso-lectura", x: pos[0].x - 6, y: yF - 6, width: pos[7].x + pos[7].w - pos[0].x + 12, height: altoF + 12, rx: 16 }) : null, FRASE.map((w, i) => /* @__PURE__ */ React.createElement("g", { key: `v${i}`, className: `aparece-p ${p >= 3 ? "visto" : ""}`, style: { transitionDelay: p >= 3 && !final ? `${i * 0.06}s` : "0s" } }, [0, 1, 2, 3, 4].map((k) => /* @__PURE__ */ React.createElement("rect", { key: k, x: pos[i].cx - 30 + k * 12, y: yF + altoF + 18, width: 11, height: 22, rx: 3, fill: color((i + k * 3) % 8), opacity: 0.85 })))), /* @__PURE__ */ React.createElement("text", { x: 370, y: yF + altoF + 64, textAnchor: "middle", dominantBaseline: "central", fontSize: 16, className: `t-suave aparece-p ${p >= 3 ? "visto" : ""}` }, "un vector por token, con el contexto de toda la frase"), USOS.map((u, k) => /* @__PURE__ */ React.createElement("g", { key: k, className: `aparece-p ${p >= 4 ? "visto" : ""}`, style: { transitionDelay: p >= 4 && !final ? `${k * 0.15}s` : "0s" } }, /* @__PURE__ */ React.createElement("rect", { x: k * 250, y: 14, width: 236, height: 104, rx: 16, className: "panel-fondo" }), /* @__PURE__ */ React.createElement("text", { x: k * 250 + 118, y: 48, textAnchor: "middle", dominantBaseline: "central", fontSize: 22, fontWeight: 700, className: "t-acento t-titulo" }, u.titulo), /* @__PURE__ */ React.createElement("text", { x: k * 250 + 118, y: 86, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, className: "t-suave" }, u.texto))), /* @__PURE__ */ React.createElement("text", { x: 370, y: 146, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, className: `t-suave aparece-p ${p >= 4 ? "visto" : ""}` }, "Muchos modelos de embeddings para buscar documentos usan un encoder. Volvemos a esto en la sesión 6."), /* @__PURE__ */ React.createElement("text", { x: 980, y: 18, textAnchor: "middle", dominantBaseline: "central", fontSize: 17, fontWeight: 700, className: `aparece-p ${p >= 2 ? "visto" : ""}` }, "Quién mira a quién"), /* @__PURE__ */ React.createElement(Matriz, { x: 800, y: 86, celda: 36, visible: p >= 2, final }), /* @__PURE__ */ React.createElement("text", { x: 1014, y: 384, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, className: `t-suave aparece-p ${p >= 2 ? "visto" : ""}` }, "Todas las celdas llenas: un cuadrado"), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 5 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 770, y: 404, width: 426, height: 88, rx: 16, fill: suave("var(--t1)", 14), stroke: "var(--t1)", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("text", { x: 790, y: 430, dominantBaseline: "central", fontSize: 19, fontWeight: 700 }, "BERT (Devlin et al., 2019): solo encoder"), /* @__PURE__ */ React.createElement("text", { x: 790, y: 462, dominantBaseline: "central", fontSize: 15, className: "t-suave" }, "BERT-base: 12 capas, 12 cabezas, vectores de 768"), /* @__PURE__ */ React.createElement("text", { x: 790, y: 482, dominantBaseline: "central", fontSize: 15, className: "t-suave" }, "y 110 millones de parámetros"))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE3, paso: p }), p >= 2 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Intensidades ilustrativas" }) : null));
  }

  // src/decoder.jsx
  var CANDIDATOS = [
    { t: "billete", logit: 3 },
    { t: "dólar", logit: 2.2 },
    { t: "cheque", logit: 1.8 },
    { t: "euro", logit: 1.3 },
    { t: "peso", logit: 0.9 }
  ];
  function probabilidades(temperatura) {
    const e = CANDIDATOS.map((c) => Math.exp(c.logit / temperatura));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  }
  var BAJA = probabilidades(0.5);
  var ALTA = probabilidades(1.5);
  var PIE4 = [
    "El decoder es la mitad que escribe. Los LLMs de chat solo usan esta mitad.",
    "Paso 1. El decoder genera un token a la vez, siempre al final de lo que ya hay.",
    "Paso 2. Cada token solo mira hacia atrás: el cuadrado del encoder se vuelve un triángulo.",
    "Paso 3. Después de la atención, cada vector pasa por su capa feed-forward.",
    "Paso 4. El bloque de atención y feed-forward se repite: 12 veces en GPT-2 pequeño.",
    "Paso 5. El último vector da una probabilidad para cada token. Se elige uno y vuelve a entrar.",
    "Paso 6. Para qué sirve: generar texto. GPT es decoder-only, como los LLMs de chat."
  ];
  function Decoder({ paso = 0, final, quieto }) {
    useFuentes();
    const idB = useIdSvg("brillo-dec");
    const p = final ? 6 : paso;
    const pxF = 22;
    const conElegido = [...FRASE, "billete"];
    const pos = posicionesFrase(conElegido, pxF, 10, 860, 340);
    const yF = 452;
    const altoF = 46;
    const mascara = gpt2_default.mascara_causal.esquina;
    const bloques = [0, 1, 2];
    const yBloque = (k) => 352 - k * 92;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama prog-svg", viewBox: "0 0 1200 510", role: "img", "aria-label": "El decoder: genera un token a la vez, mira solo hacia atrás y repite sus bloques" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement(FiltroBrillo, { id: idB, fuerza: 5 })), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 6 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 340, y: 2, width: 856, height: 66, rx: 16, fill: suave("var(--t5)", 16), stroke: "var(--t5)", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("text", { x: 768, y: 24, textAnchor: "middle", dominantBaseline: "central", fontSize: 19, fontWeight: 700 }, "Sirve para generar texto. GPT es decoder-only (Radford et al., 2018)."), /* @__PURE__ */ React.createElement("text", { x: 768, y: 50, textAnchor: "middle", dominantBaseline: "central", fontSize: 14, className: "t-suave" }, "Gemini: «Transformer decoders» (Google, 2023). Claude: Anthropic no publica su arquitectura actual.")), /* @__PURE__ */ React.createElement("text", { x: 160, y: 84, textAnchor: "middle", dominantBaseline: "central", fontSize: 17, fontWeight: 700, className: `aparece-p ${p >= 2 ? "visto" : ""}` }, "Solo mira hacia atrás"), /* @__PURE__ */ React.createElement(Matriz, { x: 4, y: 150, celda: 30, causal: true, visible: p >= 2, mascara, final }), /* @__PURE__ */ React.createElement("text", { x: 160, y: 410, textAnchor: "middle", dominantBaseline: "central", fontSize: 13, className: `t-suave aparece-p ${p >= 2 ? "visto" : ""}` }, "1 = puede mirar · 0 = no. Así lo guarda"), /* @__PURE__ */ React.createElement("text", { x: 160, y: 428, textAnchor: "middle", dominantBaseline: "central", fontSize: 13, className: `t-suave aparece-p ${p >= 2 ? "visto" : ""}` }, "el archivo de GPT-2 (dato real)"), bloques.map((k) => {
      const y = yBloque(k);
      const activo = p >= 4 || k === 0 && p >= 3;
      return /* @__PURE__ */ React.createElement("g", { key: k, className: `aparece-p ${p >= 3 && (k === 0 || p >= 4) ? "visto" : ""}`, style: { transitionDelay: p >= 4 && !final ? `${k * 0.2}s` : "0s" } }, /* @__PURE__ */ React.createElement("path", { d: `M440 ${y} l26 -18 h300 l-26 18 z`, className: "cara-bloque arriba" }), /* @__PURE__ */ React.createElement("path", { d: `M740 ${y} l26 -18 v60 l-26 18 z`, className: "cara-bloque lado" }), /* @__PURE__ */ React.createElement("rect", { x: 440, y, width: 300, height: 60, className: "cara-bloque frente" }), /* @__PURE__ */ React.createElement("rect", { x: 452, y: y + 12, width: 128, height: 36, rx: 9, fill: suave("var(--t1)", 22), stroke: "var(--t1)", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("text", { x: 516, y: y + 30, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, fontWeight: 600 }, "Atención"), /* @__PURE__ */ React.createElement("rect", { x: 592, y: y + 12, width: 136, height: 36, rx: 9, fill: suave("var(--t4)", activo ? 30 : 16), stroke: "var(--t4)", strokeWidth: k === 0 && p === 3 ? 3 : 1.5, filter: k === 0 && p === 3 ? `url(#${idB})` : void 0 }), /* @__PURE__ */ React.createElement("text", { x: 660, y: y + 30, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, fontWeight: 600 }, "Feed-forward"));
    }), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("text", { x: 782, y: 196, dominantBaseline: "central", fontSize: 30, fontWeight: 700, className: "t-acento-2 t-titulo" }, "× 12"), /* @__PURE__ */ React.createElement("text", { x: 782, y: 226, dominantBaseline: "central", fontSize: 14, className: "t-suave" }, "GPT-2 pequeño"), /* @__PURE__ */ React.createElement("text", { x: 782, y: 244, dominantBaseline: "central", fontSize: 14, className: "t-suave" }, "vectores de ", gpt2_default.tabla_embeddings.columnas), /* @__PURE__ */ React.createElement("text", { x: 782, y: 274, dominantBaseline: "central", fontSize: 14, className: "t-suave" }, "GPT-3: × 96"), /* @__PURE__ */ React.createElement("text", { x: 782, y: 292, dominantBaseline: "central", fontSize: 14, className: "t-suave" }, "vectores de ", miles(12288)), !quieto ? /* @__PURE__ */ React.createElement("rect", { className: "vector-sube", x: 576, y: 400, width: 28, height: 12, rx: 3, filter: `url(#${idB})` }) : null), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: 924, y: 84, width: 272, height: 124, rx: 16, className: "panel-fondo" }), /* @__PURE__ */ React.createElement("text", { x: 940, y: 108, dominantBaseline: "central", fontSize: 16, fontWeight: 700, style: { fill: "var(--t4)" } }, "Feed-forward"), /* @__PURE__ */ React.createElement("text", { x: 940, y: 134, dominantBaseline: "central", fontSize: 14 }, "Agrega información guardada en"), /* @__PURE__ */ React.createElement("text", { x: 940, y: 152, dominantBaseline: "central", fontSize: 14 }, "los pesos. En GPT-2, ayuda a"), /* @__PURE__ */ React.createElement("text", { x: 940, y: 170, dominantBaseline: "central", fontSize: 14 }, "completar que Varsovia es la"), /* @__PURE__ */ React.createElement("text", { x: 940, y: 188, dominantBaseline: "central", fontSize: 14 }, "capital de Polonia (Lee y Trott).")), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 5 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("text", { x: 924, y: 232, dominantBaseline: "central", fontSize: 16, fontWeight: 700 }, "Siguiente token después de «un»"), /* @__PURE__ */ React.createElement("rect", { x: 924, y: 248, width: 12, height: 12, rx: 3, style: { fill: "var(--t1)" } }), /* @__PURE__ */ React.createElement("text", { x: 942, y: 254, dominantBaseline: "central", fontSize: 13, className: "t-suave" }, "temperatura baja"), /* @__PURE__ */ React.createElement("rect", { x: 1060, y: 248, width: 12, height: 12, rx: 3, style: { fill: "var(--t2)" } }), /* @__PURE__ */ React.createElement("text", { x: 1078, y: 254, dominantBaseline: "central", fontSize: 13, className: "t-suave" }, "alta"), CANDIDATOS.map((c, k) => {
      const y = 278 + k * 30;
      return /* @__PURE__ */ React.createElement("g", { key: c.t }, /* @__PURE__ */ React.createElement("text", { x: 990, y: y + 9, textAnchor: "end", dominantBaseline: "central", fontSize: 15, fontWeight: k === 0 ? 700 : 500 }, c.t), /* @__PURE__ */ React.createElement("rect", { x: 998, y, width: Math.max(2, BAJA[k] * 190), height: 9, rx: 3, style: { fill: "var(--t1)" } }), /* @__PURE__ */ React.createElement("rect", { x: 998, y: y + 11, width: Math.max(2, ALTA[k] * 190), height: 9, rx: 3, style: { fill: "var(--t2)" } }), /* @__PURE__ */ React.createElement("text", { x: 1004 + Math.max(BAJA[k], ALTA[k]) * 190, y: y + 9, dominantBaseline: "central", fontSize: 12, className: "t-suave" }, Math.round(BAJA[k] * 100), " · ", Math.round(ALTA[k] * 100), " %"));
    }), /* @__PURE__ */ React.createElement("path", { d: `M1192 290 C 1204 360, 1200 432, ${pos[8].x + pos[8].w - 8} ${yF - 3}`, className: "arista acento-2 punteada" })), conElegido.map((w, i) => {
      const elegido = i === 8;
      const visible = elegido ? p >= 5 : p >= 1 || i === 0;
      return /* @__PURE__ */ React.createElement("g", { key: i, className: `ficha-token ${visible ? "visto" : ""}`, style: { transform: `translate(${pos[i].x}px, ${yF}px)`, transitionDelay: visible && p === 1 && !final ? `${i * 0.35}s` : "0s" } }, /* @__PURE__ */ React.createElement("rect", { width: pos[i].w, height: altoF, rx: 11, fill: suave(elegido ? "var(--t5)" : color(i), elegido ? 30 : 18), stroke: elegido ? "var(--t5)" : color(i), strokeWidth: elegido ? 3 : 2 }), /* @__PURE__ */ React.createElement("text", { x: pos[i].w / 2, y: altoF / 2, textAnchor: "middle", dominantBaseline: "central", fontSize: pxF, fontWeight: 600 }, w));
    })), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE4, paso: p }), p >= 5 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Probabilidades ilustrativas" }) : null));
  }

  // src/traduccion.jsx
  var { useState: useState5, useEffect: useEffect5 } = React;
  var ES = [" El", " agente", " clas", "ifica", " el", " reporte", "."].map((t, i) => i === 0 ? t.trim() : t);
  var EN = ["The", " agent", " class", "ifies", " the", " report", "."];
  var CRUZADA = [
    [0.8, 0.1, 0, 0, 0.1, 0, 0],
    [0.1, 0.8, 0.05, 0, 0, 0.05, 0],
    [0, 0.15, 0.55, 0.3, 0, 0, 0],
    [0, 0.05, 0.3, 0.6, 0, 0.05, 0],
    [0.1, 0, 0, 0, 0.8, 0.1, 0],
    [0, 0.05, 0, 0, 0.1, 0.85, 0],
    [0, 0, 0, 0.1, 0, 0.1, 0.8]
  ];
  var FIG_W = 935;
  var FIG_H = 1362;
  var PIEZAS = [
    { nombre: "Entrada del encoder", rects: [[0, 988, 445, 1362]] },
    { nombre: "Encoder", rects: [[0, 505, 452, 988]] },
    { nombre: "Entrada del decoder", rects: [[478, 988, 935, 1362]] },
    { nombre: "Decoder y cross-attention", rects: [[452, 283, 935, 988], [288, 470, 480, 700]] },
    { nombre: "Salida", rects: [[488, 0, 800, 283]] }
  ];
  var PIE5 = [
    "El transformer original (Vaswani et al., 2017) se creó para traducir. Usa encoder y decoder.",
    "Paso 1. El encoder lee toda la frase en español a la vez.",
    "Paso 2. El decoder escribe la traducción al inglés, un token a la vez.",
    "Paso 3. En cada paso, el decoder mira la salida del encoder: es la cross-attention.",
    "Paso 4. La figura 1 del artículo, pieza por pieza: entradas, encoder, decoder y salida.",
    "Paso 5. Tres familias de transformers, según las piezas que usan."
  ];
  function filaFichas(tokens, px, gap, x0, anchoTotal) {
    const anchos = tokens.map((t) => anchoFicha(t, px));
    const total = anchos.reduce((s, w) => s + w, 0) + gap * (tokens.length - 1);
    let x = x0 + (anchoTotal - total) / 2;
    return anchos.map((w) => {
      const r = { x, w, cx: x + w / 2 };
      x += w + gap;
      return r;
    });
  }
  function FichaTexto({ t, x, y, w, alto, px, c, opacidad = 1, onClick, activa }) {
    const { espacio, cuerpo } = partirEspacio(t);
    const wc = ancho(cuerpo, px, 600) + (espacio ? 16 : 0);
    const x0 = w / 2 - wc / 2;
    return /* @__PURE__ */ React.createElement("g", { className: `ficha ${onClick ? "tocable" : ""}`, style: { transform: `translate(${x}px, ${y}px)`, opacity: opacidad }, onClick, role: onClick ? "button" : void 0, "aria-label": onClick ? `Ver a qué mira ${cuerpo}` : void 0 }, activa ? /* @__PURE__ */ React.createElement("rect", { x: -6, y: -6, width: w + 12, height: alto + 12, rx: 15, fill: "none", stroke: c, strokeWidth: 3, className: "ficha-brillo" }) : null, /* @__PURE__ */ React.createElement("rect", { width: w, height: alto, rx: 11, fill: suave(c, activa ? 34 : 18), stroke: c, strokeWidth: 2 }), espacio ? /* @__PURE__ */ React.createElement(MarcaEspacio, { x: x0, y: alto / 2 + 8, px }) : null, /* @__PURE__ */ React.createElement("text", { x: x0 + (espacio ? 16 : 0), y: alto / 2, dominantBaseline: "central", fontSize: px, fontWeight: 600 }, cuerpo));
  }
  function Traduccion({ paso = 0, final, quieto, base = "assets/" }) {
    useFuentes();
    const idB = useIdSvg("brillo-tr");
    const idC = useIdSvg("recorte-fig");
    const p = final ? 5 : paso;
    const px = 22;
    const alto = 46;
    const posES = filaFichas(ES, px, 10, 20, 700);
    const posEN = filaFichas(EN, px, 10, 20, 700);
    const yES = 52;
    const yEN = 214;
    const [fijo, setFijo] = useState5(null);
    const [ciclo, setCiclo] = useState5(0);
    useEffect5(() => {
      if (p < 3 || fijo !== null || quieto || final) return void 0;
      const reloj = setInterval(() => setCiclo((k) => (k + 1) % EN.length), 1400);
      return () => clearInterval(reloj);
    }, [p, fijo, quieto, final]);
    const actual = fijo !== null ? fijo : ciclo;
    const [piezas, setPiezas] = useState5(p >= 4 ? PIEZAS.length : 0);
    useEffect5(() => {
      if (p < 4) return setPiezas(0);
      if (final || quieto || p > 4) return setPiezas(PIEZAS.length);
      setPiezas(0);
      let k = 0;
      const reloj = setInterval(() => {
        k += 1;
        setPiezas(k);
        if (k >= PIEZAS.length) clearInterval(reloj);
      }, 600);
      return () => clearInterval(reloj);
    }, [p, final, quieto]);
    const escala = 476 / FIG_H;
    const fx = 830;
    const fy = 18;
    const imagen = `${base}img/vaswani_figura1.png`;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama prog-svg", viewBox: "0 0 1200 500", role: "img", "aria-label": "Encoder y decoder juntos: traducción del español al inglés y la figura 1 del transformer original" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement(FiltroBrillo, { id: idB, fuerza: 4 }), PIEZAS.map((pz, k) => /* @__PURE__ */ React.createElement("clipPath", { key: k, id: `${idC}-${k}` }, pz.rects.map(([x1, y1, x2, y2], j) => /* @__PURE__ */ React.createElement("rect", { key: j, x: x1, y: y1, width: x2 - x1, height: y2 - y1 }))))), /* @__PURE__ */ React.createElement("rect", { x: 6, y: 10, width: 728, height: 104, rx: 18, className: `caja-bloque ${p >= 1 ? "activa" : ""}` }), /* @__PURE__ */ React.createElement("text", { x: 24, y: 30, dominantBaseline: "central", fontSize: 16, fontWeight: 700, className: "t-acento" }, "Encoder: lee el español"), ES.map((t, i) => /* @__PURE__ */ React.createElement(FichaTexto, { key: i, t, x: posES[i].x, y: yES, w: posES[i].w, alto, px, c: color(i), opacidad: p >= 1 ? 1 : 0.35, activa: p >= 3 && CRUZADA[actual][i] >= 0.3 })), /* @__PURE__ */ React.createElement("rect", { x: 6, y: 172, width: 728, height: 104, rx: 18, className: `caja-bloque decoder ${p >= 2 ? "activa" : ""}` }), /* @__PURE__ */ React.createElement("text", { x: 24, y: 192, dominantBaseline: "central", fontSize: 16, fontWeight: 700, className: "t-acento-2" }, "Decoder: escribe en inglés"), EN.map((t, i) => /* @__PURE__ */ React.createElement("g", { key: i, className: `ficha-token ${p >= 2 ? "visto" : ""}`, style: { transitionDelay: p === 2 && !final ? `${i * 0.45}s` : "0s" } }, /* @__PURE__ */ React.createElement(
      FichaTexto,
      {
        t,
        x: posEN[i].x,
        y: yEN,
        w: posEN[i].w,
        alto,
        px,
        c: color(i),
        activa: p >= 3 && i === actual,
        onClick: (e) => {
          setFijo((f) => f === i ? null : i);
          if (e.currentTarget && e.currentTarget.blur) e.currentTarget.blur();
        }
      }
    ))), p >= 3 ? CRUZADA[actual].map(
      (v, j) => v >= 0.05 ? /* @__PURE__ */ React.createElement(
        "path",
        {
          key: `${actual}-${j}`,
          d: `M${posEN[actual].cx} ${yEN - 4} C ${posEN[actual].cx} ${yEN - 50}, ${posES[j].cx} ${yES + alto + 40}, ${posES[j].cx} ${yES + alto + 4}`,
          fill: "none",
          stroke: "var(--t3)",
          strokeWidth: 1.5 + v * 9,
          strokeLinecap: "round",
          filter: `url(#${idB})`,
          className: "arco-cruzado"
        }
      ) : null
    ) : null, /* @__PURE__ */ React.createElement("text", { x: 370, y: 143, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, fontWeight: 700, className: `aparece-p ${p >= 3 ? "visto" : ""}`, style: { fill: "var(--t3)" } }, "cross-attention: el decoder mira lo que leyó el encoder"), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 5 ? "visto" : ""}` }, [
      ["Familia", "Para qué sirve", "Ejemplo clásico"],
      ["Solo encoder", "Entender, clasificar y buscar", "BERT (Devlin et al., 2019)"],
      ["Solo decoder", "Generar texto, como los LLMs de chat", "GPT (Radford et al., 2018)"],
      ["Encoder y decoder", "Transformar una secuencia en otra", "Vaswani et al. (2017)", "y T5 (Raffel et al., 2020)"]
    ].map((fila, r) => {
      const y = 296 + r * 48;
      const alto2 = r === 3 ? 52 : 44;
      return /* @__PURE__ */ React.createElement("g", { key: r }, /* @__PURE__ */ React.createElement("rect", { x: 6, y, width: 728, height: alto2, rx: 10, className: r === 0 ? "tabla-cabecera" : "tabla-fila" }), /* @__PURE__ */ React.createElement("text", { x: 20, y: y + alto2 / 2, dominantBaseline: "central", fontSize: r === 0 ? 15 : 16, fontWeight: 700, className: r === 0 ? "t-acento" : "" }, fila[0]), /* @__PURE__ */ React.createElement("text", { x: 196, y: y + alto2 / 2, dominantBaseline: "central", fontSize: 15, fontWeight: r === 0 ? 700 : 400, className: r === 0 ? "t-acento" : "" }, fila[1]), /* @__PURE__ */ React.createElement("text", { x: 498, y: y + (fila[3] ? 16 : 22), dominantBaseline: "central", fontSize: 15, fontWeight: r === 0 ? 700 : 400, className: r === 0 ? "t-acento" : "t-suave" }, fila[2]), fila[3] ? /* @__PURE__ */ React.createElement("text", { x: 498, y: y + 36, dominantBaseline: "central", fontSize: 15, className: "t-suave" }, fila[3]) : null);
    })), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("rect", { x: fx - 10, y: fy - 8, width: FIG_W * escala + 20, height: FIG_H * escala + 16, rx: 14, fill: "#ffffff", stroke: "var(--borde)" }), /* @__PURE__ */ React.createElement("g", { transform: `translate(${fx} ${fy}) scale(${escala})` }, PIEZAS.map((pz, k) => /* @__PURE__ */ React.createElement("image", { key: k, href: imagen, x: 0, y: 0, width: FIG_W, height: FIG_H, clipPath: `url(#${idC}-${k})`, className: `pieza-figura ${k < piezas ? "visto" : ""}` })), /* @__PURE__ */ React.createElement("rect", { x: 108, y: 504, width: 338, height: 485, rx: 30, fill: "none", stroke: "var(--t1)", strokeWidth: 9, className: `aparece-p ${piezas >= 2 ? "visto" : ""}` }), /* @__PURE__ */ React.createElement("rect", { x: 491, y: 286, width: 328, height: 703, rx: 30, fill: "none", stroke: "var(--t2)", strokeWidth: 9, className: `aparece-p ${piezas >= 4 ? "visto" : ""}` }), /* @__PURE__ */ React.createElement("rect", { x: 512, y: 548, width: 236, height: 102, rx: 16, fill: "none", stroke: "var(--t3)", strokeWidth: 10, filter: `url(#${idB})`, className: `aparece-p ${piezas >= 4 ? "visto" : ""}` })))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE5, paso: p }), p >= 3 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Pesos de la cross-attention ilustrativos" }) : null));
  }

  // src/pesos.jsx
  var { useMemo: useMemo3 } = React;
  var MODELOS = {
    gpt2: { nombre: "GPT-2 pequeño", anio: 2019, parametros: gpt2_default.parametros_total, fuente: "conteo propio del archivo de pesos" },
    olmo: { nombre: "Olmo 3 7B", anio: 2025, parametros: 7298011136, fuente: "Ai2, ficha y archivos en Hugging Face" },
    gpt3: { nombre: "GPT-3", anio: 2020, parametros: 175e9, fuente: "Brown et al. (2020), tabla 2.1" }
  };
  var OLMO_BYTES_ARCHIVOS = [4969984976, 4981161496, 4644917240];
  function cifraCorta(n) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1).replace(".0", "")} billones`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e11 ? 0 : 1).replace(".0", "")} mil millones`;
    if (n >= 1e6) return `${Math.round(n / 1e6)} millones`;
    return miles(n);
  }
  function Parametros({ paso = 0, final }) {
    const p = final ? 3 : paso;
    const min = 7;
    const max = 12;
    const pct = (v) => (Math.log10(v) - min) / (max - min) * 100;
    const filas = [MODELOS.gpt2, MODELOS.olmo, MODELOS.gpt3];
    const marcas = [
      [1e7, "10 millones"],
      [1e8, "100 millones"],
      [1e9, "mil millones"],
      [1e10, "10 mil millones"],
      [1e11, "100 mil millones"],
      [1e12, "1 billón"]
    ];
    const veces = Math.round(MODELOS.gpt3.parametros / MODELOS.gpt2.parametros);
    return /* @__PURE__ */ React.createElement("div", { className: "grafico-parametros" }, /* @__PURE__ */ React.createElement("div", { className: "eje-log" }, marcas.map(([v, t]) => /* @__PURE__ */ React.createElement("span", { key: v, style: { left: `${pct(v)}%` } }, t))), filas.map((m, k) => /* @__PURE__ */ React.createElement("div", { key: m.nombre, className: `fila-param aparece-p ${p >= k + 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "rotulo" }, /* @__PURE__ */ React.createElement("b", null, m.nombre), /* @__PURE__ */ React.createElement("small", null, m.anio)), /* @__PURE__ */ React.createElement("div", { className: "pista" }, marcas.map(([v]) => /* @__PURE__ */ React.createElement("i", { key: v, style: { left: `${pct(v)}%` } })), /* @__PURE__ */ React.createElement("span", { className: "valor", style: { width: `${pct(m.parametros)}%` } }), /* @__PURE__ */ React.createElement("span", { className: "num", style: { left: `calc(${pct(m.parametros)}% + 10px)` } }, cifraCorta(m.parametros))))), /* @__PURE__ */ React.createElement("p", { className: `nota-veces aparece-p ${p >= 3 ? "visto" : ""}` }, "GPT-3 tiene unas ", /* @__PURE__ */ React.createElement("b", null, miles(veces), " veces"), " los parámetros de GPT-2 pequeño."));
  }
  function Calculadora({ paso = 0, final }) {
    const p = final ? 3 : paso;
    const n = MODELOS.olmo.parametros;
    const bytes16 = n * 2;
    const bytes4 = n * 0.5;
    const real = OLMO_BYTES_ARCHIVOS.reduce((a, b) => a + b, 0);
    const gb = (b) => (b / 1e9).toFixed(1);
    return /* @__PURE__ */ React.createElement("div", { className: "calculadora" }, /* @__PURE__ */ React.createElement("div", { className: "formula" }, /* @__PURE__ */ React.createElement("span", null, "parámetros"), /* @__PURE__ */ React.createElement("i", null, "×"), /* @__PURE__ */ React.createElement("span", null, "bytes por peso"), /* @__PURE__ */ React.createElement("i", null, "="), /* @__PURE__ */ React.createElement("span", { className: "resultado" }, "tamaño del archivo")), /* @__PURE__ */ React.createElement("div", { className: `calc-fila aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "calc-texto" }, /* @__PURE__ */ React.createElement("b", null, "Olmo 3 7B, con pesos de 16 bits"), /* @__PURE__ */ React.createElement("span", null, miles(n), " × 2 bytes = ", /* @__PURE__ */ React.createElement("b", { className: "texto-acento" }, gb(bytes16), " GB"))), /* @__PURE__ */ React.createElement("div", { className: "bloque-archivo", style: { "--w": "100%" } }, "16 bits")), /* @__PURE__ */ React.createElement("div", { className: `calc-fila aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "calc-texto" }, /* @__PURE__ */ React.createElement("b", null, "Sus archivos reales en Hugging Face"), /* @__PURE__ */ React.createElement("span", null, "3 archivos: ", OLMO_BYTES_ARCHIVOS.map((b) => (b / 1e9).toFixed(2)).join(" + "), " = ", /* @__PURE__ */ React.createElement("b", { className: "texto-acento" }, gb(real), " GB"))), /* @__PURE__ */ React.createElement("div", { className: "bloque-archivo real", style: { "--w": "100%" } }, OLMO_BYTES_ARCHIVOS.map((b, k) => /* @__PURE__ */ React.createElement("span", { key: k, style: { flex: b } })))), /* @__PURE__ */ React.createElement("div", { className: `calc-fila aparece-p ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "calc-texto" }, /* @__PURE__ */ React.createElement("b", null, "Con quantization a 4 bits"), /* @__PURE__ */ React.createElement("span", null, miles(n), " × 0.5 bytes = ", /* @__PURE__ */ React.createElement("b", { className: "texto-exito" }, gb(bytes4), " GB"), ", cerca de la cuarta parte")), /* @__PURE__ */ React.createElement("div", { className: "bloque-archivo cuarto", style: { "--w": "25%" } }, "4 bits")));
  }
  function cambio(i, j, semilla) {
    const x = Math.sin((i + 1) * 12.9898 + (j + 1) * 78.233 + semilla * 37.719) * 43758.5453;
    return (x - Math.floor(x) - 0.5) * 0.09;
  }
  function Cuadricula({ ajustes = 0, congelada = false, ancho: ancho2 = 520, filas = 12, cols = 24 }) {
    const base = gpt2_default.cuadricula_atencion_capa1.valores;
    const celda = ancho2 / cols;
    const valores = useMemo3(() => {
      const out = [];
      for (let i = 0; i < filas; i++) {
        for (let j = 0; j < cols; j++) {
          let v = base[i][j];
          for (let s = 1; s <= ajustes; s++) v += cambio(i, j, s);
          out.push({ i, j, v });
        }
      }
      return out;
    }, [ajustes, filas, cols]);
    return /* @__PURE__ */ React.createElement("svg", { className: `diagrama cuadricula-pesos ${congelada ? "congelada" : ""}`, viewBox: `0 0 ${ancho2} ${celda * filas}`, role: "img", "aria-label": "Cuadrícula de pesos" }, valores.map(({ i, j, v }) => /* @__PURE__ */ React.createElement("rect", { key: `${i}-${j}`, x: j * celda + 1, y: i * celda + 1, width: celda - 2, height: celda - 2, rx: 3, style: { fill: colorPeso(v, 0.3) }, className: "celda-peso" })));
  }
  var PIE_APRENDER = [
    "El pretraining es un ciclo que se repite. Ejemplo de Lee y Trott (2023).",
    "Paso 1. El modelo lee un texto y predice el siguiente token.",
    "Paso 2. Compara su predicción con el token real del texto.",
    "Paso 3. Ajusta un poco los pesos para acercarse al token real.",
    "Paso 4. Repite con billones de tokens. Así se fijan los pesos."
  ];
  function Aprendizaje({ paso = 0, final, quieto }) {
    const idB = useIdSvg("brillo-apr");
    const p = final ? 4 : paso;
    const estaciones = [
      { t: "Leer y predecir", x: 250, y: 60 },
      { t: "Comparar", x: 440, y: 250 },
      { t: "Ajustar los pesos", x: 250, y: 440 },
      { t: "Repetir", x: 60, y: 250 }
    ];
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "aprender-rejilla" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama ciclo-svg", viewBox: "-40 -40 580 580", role: "img", "aria-label": "Ciclo del pretraining: leer y predecir, comparar, ajustar y repetir" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement(FiltroBrillo, { id: idB, fuerza: 6 })), /* @__PURE__ */ React.createElement("circle", { cx: 250, cy: 250, r: 190, className: "anillo-ciclo" }), !quieto ? /* @__PURE__ */ React.createElement("circle", { r: 10, className: "relleno-acento", filter: `url(#${idB})` }, /* @__PURE__ */ React.createElement("animateMotion", { dur: "6s", repeatCount: "indefinite", path: "M250 60 A190 190 0 1 1 249.9 60" })) : null, estaciones.map((e, k) => /* @__PURE__ */ React.createElement("g", { key: k, className: `estacion-ciclo ${p >= k + 1 ? "activa" : ""}` }, /* @__PURE__ */ React.createElement("circle", { cx: e.x, cy: e.y, r: 46 }), /* @__PURE__ */ React.createElement("text", { x: e.x, y: e.y, textAnchor: "middle", dominantBaseline: "central", fontSize: 30, fontWeight: 700, className: "t-titulo" }, k + 1), /* @__PURE__ */ React.createElement("text", { x: e.x, y: e.y + (k === 0 ? -64 : 66), textAnchor: "middle", dominantBaseline: "central", fontSize: 20, fontWeight: 700 }, e.t)))), /* @__PURE__ */ React.createElement("div", { className: "aprender-lado" }, /* @__PURE__ */ React.createElement("div", { className: `ejemplo-prediccion aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "texto" }, "Me gusta el café con crema y"), /* @__PURE__ */ React.createElement("span", { className: `prediccion ${p >= 2 ? "mala" : ""}` }, "leche"), /* @__PURE__ */ React.createElement("span", { className: `real aparece-p ${p >= 2 ? "visto" : ""}` }, "real: ", /* @__PURE__ */ React.createElement("b", null, "azúcar"))), /* @__PURE__ */ React.createElement("div", { className: `aparece-p ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement(Cuadricula, { ajustes: p >= 3 ? 1 : 0, ancho: 400 }), /* @__PURE__ */ React.createElement("p", { className: "nota-cuadricula" }, "Pesos reales de GPT-2. El cambio es ilustrativo.")), /* @__PURE__ */ React.createElement("div", { className: `cifras-tokens aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "300 mil millones"), " de tokens: GPT-3 (Brown et al., 2020)"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "5.93 billones"), " de tokens: el pretraining de Olmo 3 7B (Ai2, 2025)")))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_APRENDER, paso: p }), p >= 1 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Predicción ilustrativa" }) : null));
  }
  function Congelados({ paso = 0, final }) {
    const p = final ? 2 : paso;
    return /* @__PURE__ */ React.createElement("div", { className: "congelados" }, /* @__PURE__ */ React.createElement("div", { className: "congelados-cuadricula" }, /* @__PURE__ */ React.createElement(Cuadricula, { ajustes: 0, congelada: p >= 1, ancho: 460 }), /* @__PURE__ */ React.createElement("span", { className: `sello-congelado aparece-p ${p >= 1 ? "visto" : ""}` }, "congelados")), /* @__PURE__ */ React.createElement("div", { className: `congelados-lado aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "rebote" }, /* @__PURE__ */ React.createElement("span", { className: "globo" }, "tu conversación"), /* @__PURE__ */ React.createElement("span", { className: "flecha-rebote", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("small", null, "no cambia los pesos")), /* @__PURE__ */ React.createElement("div", { className: "mini-linea" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", null), "datos de entrenamiento"), /* @__PURE__ */ React.createElement("span", { className: "corte" }, /* @__PURE__ */ React.createElement("i", null), "fecha de corte"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", null), "lanzamiento"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", null), "hoy"))));
  }
  var PIE_BASE = [
    "Los mismos pesos del pretraining: un modelo base que completa texto.",
    "Paso 1. Fine-tuning con instrucciones: ejemplos de pedidos y buenas respuestas.",
    "Paso 2. RLHF: personas ordenan respuestas y el modelo se ajusta a sus preferencias.",
    "Paso 3. Cambios pequeños en los mismos pesos: el modelo pasa de completar a responder."
  ];
  function BaseAsistente({ paso = 0, final }) {
    const p = final ? 3 : paso;
    const fase = p >= 2 ? "RLHF" : p >= 1 ? "fine-tuning" : "pretraining";
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "base-asistente" }, /* @__PURE__ */ React.createElement("div", { className: "fases" }, ["Modelo base", "Fine-tuning con instrucciones", "RLHF"].map((t, k) => /* @__PURE__ */ React.createElement("span", { key: t, className: `fase ${p >= k ? "activa" : ""}` }, t))), /* @__PURE__ */ React.createElement("div", { className: "base-cuerpo" }, /* @__PURE__ */ React.createElement(Cuadricula, { ajustes: 1 + Math.min(p, 2), ancho: 460 }), /* @__PURE__ */ React.createElement("div", { className: "salida-modelo" }, /* @__PURE__ */ React.createElement("span", { className: "rotulo-salida" }, "Qué hace con un pedido"), /* @__PURE__ */ React.createElement("span", { className: `burbuja ${p >= 3 ? "responde" : ""}` }, p >= 3 ? "responde el pedido" : "continúa el texto"), /* @__PURE__ */ React.createElement("small", null, "Fase actual: ", fase)))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_BASE, paso: p }), /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Cambios ilustrativos" })));
  }

  // src/llamada.jsx
  var PIE6 = [
    "Una llamada por API: tu programa envía mensajes al modelo y recibe su respuesta.",
    "Paso 1. Los mensajes de sistema y de usuario pasan por el tokenizer y entran como tokens.",
    "Paso 2. El modelo genera los tokens de salida, uno a la vez.",
    "Paso 3. La respuesta vuelve con su conteo: tokens de entrada y de salida. Con eso se cobra."
  ];
  var ENTRADA = ["Res", "pon", "des", " preguntas", " sobre", " Python", " en", " una", " frase", ".", "¿Qué", " versión", " de", " Python", " exige", " lang", "chain", " ", "1", ".", "5", ".", "0", "?"];
  var SALIDA = ["lang", "chain", " ", "1", ".", "5", ".", "0", " exige", " Python", " ", "3", ".", "11", " o", " posterior", "."];
  function Fichita({ t, c, retraso, salida }) {
    const espacio = t.startsWith(" ");
    const cuerpo = espacio ? t.slice(1) : t;
    return /* @__PURE__ */ React.createElement("span", { className: `fichita ${salida ? "salida" : ""}`, style: { "--c": c, animationDelay: `${retraso}s` } }, espacio ? /* @__PURE__ */ React.createElement("i", { className: "esp-mini", "aria-label": "espacio" }) : null, cuerpo === "" ? " " : cuerpo);
  }
  function Llamada({ paso = 0, final }) {
    const p = final ? 3 : paso;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "llamada" }, /* @__PURE__ */ React.createElement("div", { className: "mensajes" }, /* @__PURE__ */ React.createElement("div", { className: "mensaje sistema" }, /* @__PURE__ */ React.createElement("span", { className: "rol" }, "sistema"), "Respondes preguntas sobre Python en una frase."), /* @__PURE__ */ React.createElement("div", { className: "mensaje usuario" }, /* @__PURE__ */ React.createElement("span", { className: "rol" }, "usuario"), "¿Qué versión de Python exige langchain 1.5.0?")), /* @__PURE__ */ React.createElement("div", { className: `flujo-entrada aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "etapa" }, "tokenizer"), /* @__PURE__ */ React.createElement("div", { className: "fichitas" }, ENTRADA.map((t, i) => /* @__PURE__ */ React.createElement(Fichita, { key: i, t, c: color(i), retraso: i * 0.06 })))), /* @__PURE__ */ React.createElement("div", { className: `caja-modelo ${p >= 1 ? "activa" : ""} ${p === 2 ? "trabajando" : ""}` }, /* @__PURE__ */ React.createElement("b", null, "Modelo"), /* @__PURE__ */ React.createElement("small", null, "por API")), /* @__PURE__ */ React.createElement("div", { className: `flujo-salida aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "fichitas" }, SALIDA.map((t, i) => /* @__PURE__ */ React.createElement(Fichita, { key: i, t, c: "var(--t5)", retraso: 0.3 + i * 0.22, salida: true })))), /* @__PURE__ */ React.createElement("div", { className: `respuesta aparece-p ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rol" }, "respuesta"), /* @__PURE__ */ React.createElement("p", null, "langchain 1.5.0 exige Python 3.11 o posterior."), /* @__PURE__ */ React.createElement("div", { className: "conteo" }, /* @__PURE__ */ React.createElement("span", null, "tokens de entrada: ", /* @__PURE__ */ React.createElement("b", null, ENTRADA.length)), /* @__PURE__ */ React.createElement("span", null, "tokens de salida: ", /* @__PURE__ */ React.createElement("b", null, SALIDA.length))))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE6, paso: p }), p >= 1 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Tokens de o200k_base: cada API cuenta distinto" }) : null));
  }

  // ../ejemplos/datos/sesgo.json
  var sesgo_default = {
    fuente: "GPT-2 pequeño (openai-community/gpt2), embeddings de entrada (wte)",
    metodo: "vectores centrados; coseno con el promedio normalizado de 7 diferencias: she − he, her − his, woman − man, girl − boy, mother − father, daughter − son, female − male",
    referencias: {
      she: 0.36,
      he: -0.31
    },
    profesiones: [
      {
        palabra: "nurse",
        es: "enfermería",
        puntaje: 0.213
      },
      {
        palabra: "dancer",
        es: "danza",
        puntaje: 0.176
      },
      {
        palabra: "secretary",
        es: "secretaría",
        puntaje: 0.095
      },
      {
        palabra: "teacher",
        es: "docencia",
        puntaje: 0.04
      },
      {
        palabra: "assistant",
        es: "asistencia",
        puntaje: 0.028
      },
      {
        palabra: "programmer",
        es: "programación",
        puntaje: 0.026
      },
      {
        palabra: "designer",
        es: "diseño",
        puntaje: 0.015
      },
      {
        palabra: "scientist",
        es: "ciencia",
        puntaje: 8e-3
      },
      {
        palabra: "lawyer",
        es: "abogacía",
        puntaje: 5e-3
      },
      {
        palabra: "doctor",
        es: "medicina",
        puntaje: -0.01
      },
      {
        palabra: "pilot",
        es: "piloto",
        puntaje: -0.013
      },
      {
        palabra: "mechanic",
        es: "mecánica",
        puntaje: -0.021
      },
      {
        palabra: "developer",
        es: "desarrollo",
        puntaje: -0.028
      },
      {
        palabra: "soldier",
        es: "ejército",
        puntaje: -0.032
      },
      {
        palabra: "manager",
        es: "gerencia",
        puntaje: -0.037
      },
      {
        palabra: "engineer",
        es: "ingeniería",
        puntaje: -0.05
      },
      {
        palabra: "captain",
        es: "capitán",
        puntaje: -0.076
      },
      {
        palabra: "architect",
        es: "arquitectura",
        puntaje: -0.078
      }
    ]
  };

  // src/bloque2.jsx
  var { useState: useState6, useEffect: useEffect6 } = React;
  var usd = (v, dec = 4) => `USD ${v.toFixed(dec)}`;
  var PIE_RAZONAR = [
    "Un modelo que razona escribe primero sus pasos y después la respuesta.",
    "Paso 1. Primero genera tokens de razonamiento: hace la cuenta paso a paso.",
    "Paso 2. Después escribe la respuesta, que es lo único que ves en el chat.",
    "Paso 3. Los tokens de razonamiento se cobran como salida, igual que la respuesta."
  ];
  var PASOS_RAZONAMIENTO = [
    "50 llamadas × 2 000 tokens = 100 000 tokens de entrada",
    "100 000 × USD 0.10 por millón = USD 0.01",
    "50 llamadas × 500 tokens = 25 000 tokens de salida",
    "25 000 × USD 0.50 por millón = USD 0.0125",
    "Total: 0.01 + 0.0125 = USD 0.0225"
  ];
  function Razonamiento({ paso = 0, final }) {
    const p = final ? 3 : paso;
    const razonamiento = 140;
    const respuesta = 14;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "razonar" }, /* @__PURE__ */ React.createElement("div", { className: "razonar-pregunta" }, /* @__PURE__ */ React.createElement("span", { className: "rol" }, "usuario"), "¿Cuánto cuesta un laboratorio con Claude Haiku 5.5? Usa 50 llamadas de 2 000 tokens de entrada y 500 de salida."), /* @__PURE__ */ React.createElement("div", { className: `razonar-pensamiento aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rol" }, "razonamiento"), PASOS_RAZONAMIENTO.map((t, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "linea-pensada", style: { animationDelay: p === 1 && !final ? `${i * 0.35}s` : "0s" } }, t))), /* @__PURE__ */ React.createElement("div", { className: `razonar-respuesta aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rol" }, "respuesta"), "Cuesta USD 0.0225 por estudiante."), /* @__PURE__ */ React.createElement("div", { className: `razonar-cuenta aparece-p ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rotulo" }, "Tokens de salida que se cobran"), /* @__PURE__ */ React.createElement("div", { className: "barra-salida" }, /* @__PURE__ */ React.createElement("span", { className: "tramo-pensado", style: { flex: razonamiento } }, "razonamiento · ", razonamiento), /* @__PURE__ */ React.createElement("span", { className: "tramo-respuesta", style: { flex: respuesta * 3 } }, "respuesta · ", respuesta)), /* @__PURE__ */ React.createElement("small", null, "Precios del Anexo G.1. Con el razonamiento activo, el costo real puede ser mayor."))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_RAZONAR, paso: p }), p >= 3 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Conteos ilustrativos" }) : null));
  }
  var PIE_ADIVINAR = [
    "La lectura del bloque explica por qué los modelos adivinan. Lo seguimos paso a paso.",
    "Paso 1. En una prueba de opciones múltiples, adivinar puede sumar. Dejarla en blanco da cero.",
    "Paso 2. El cumpleaños: adivinar da 1 opción entre 365. «No lo sé» da cero puntos seguros.",
    "Paso 3. Con la calificación de siempre, el modelo que adivina más parece mejor.",
    "Paso 4. La propuesta: castigar más el error seguro que la duda. Así, «no lo sé» vale más que fallar."
  ];
  var SIMPLEQA = [
    { modelo: "gpt-5-thinking-mini", acierto: 22, error: 26, abstencion: 52 },
    { modelo: "OpenAI o4-mini", acierto: 24, error: 75, abstencion: 1 }
  ];
  function Adivinar({ paso = 0, final }) {
    const p = final ? 4 : paso;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "adivinar" }, /* @__PURE__ */ React.createElement("div", { className: `tarjeta-prueba aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("b", null, "Prueba de opciones múltiples"), /* @__PURE__ */ React.createElement("div", { className: "opciones" }, ["A", "B", "C", "D"].map((o) => /* @__PURE__ */ React.createElement("span", { key: o, className: `opcion ${o === "C" ? "marcada" : ""}` }, o))), /* @__PURE__ */ React.createElement("div", { className: "dos-columnas" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "ok" }), "Adivinar: a veces acierta"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "cero" }), "En blanco: cero seguro"))), /* @__PURE__ */ React.createElement("div", { className: `tarjeta-prueba aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("b", null, "¿Cuándo es el cumpleaños de esta persona?"), /* @__PURE__ */ React.createElement("div", { className: "calendario", "aria-hidden": "true" }, Array.from({ length: 73 }).map((_, i) => /* @__PURE__ */ React.createElement("i", { key: i, className: i === 50 ? "dia-elegido" : "" }))), /* @__PURE__ */ React.createElement("div", { className: "dos-columnas" }, /* @__PURE__ */ React.createElement("span", null, "«10 de septiembre»: ", /* @__PURE__ */ React.createElement("b", null, "1 en 365")), /* @__PURE__ */ React.createElement("span", null, "«No lo sé»: ", /* @__PURE__ */ React.createElement("b", null, "0 puntos")))), /* @__PURE__ */ React.createElement("div", { className: `tabla-simpleqa aparece-p ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("b", null, "SimpleQA, según OpenAI (2025)"), SIMPLEQA.map((m) => /* @__PURE__ */ React.createElement("div", { key: m.modelo, className: "fila-sqa" }, /* @__PURE__ */ React.createElement("span", { className: "nombre" }, m.modelo), /* @__PURE__ */ React.createElement("span", { className: "pila-sqa" }, /* @__PURE__ */ React.createElement("span", { className: "acierto", style: { flex: m.acierto } }, m.acierto, " %"), /* @__PURE__ */ React.createElement("span", { className: "error", style: { flex: m.error } }, m.error, " %"), /* @__PURE__ */ React.createElement("span", { className: "abstencion", style: { flex: Math.max(m.abstencion, 6) } }, m.abstencion, " %")))), /* @__PURE__ */ React.createElement("div", { className: "leyenda-sqa" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "acierto" }), "aciertos"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "error" }), "errores"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "abstencion" }), "abstenciones"))), /* @__PURE__ */ React.createElement("div", { className: `propuesta aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rotulo-propuesta" }, "Responde solo si tienes más de 50 % de confianza"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", { className: "texto-exito" }, "+1"), " acierto"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", { className: "texto-alerta" }, "−1"), " error"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "0"), " «no lo sé»"), /* @__PURE__ */ React.createElement("small", null, "Un ejemplo de Kalai et al. (2025), el artículo de investigación de la lectura."))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_ADIVINAR, paso: p }));
  }
  var PIE_SESGO = [
    "En el bloque 2.1, rey − hombre + mujer dio reina. La misma cuenta revela sesgos.",
    "Paso 1. La dirección «she − he», con los pesos reales de GPT-2. «she» y «he» marcan los extremos.",
    "Paso 2. Cada profesión cae en algún punto de esa dirección. Nadie lo programó: sale del texto.",
    "Paso 3. Los extremos repiten estereotipos del texto de entrenamiento."
  ];
  function Sesgo({ paso = 0, final }) {
    const p = final ? 3 : paso;
    const max = 0.4;
    const pos = (v) => 50 + v / max * 50;
    const filas = sesgo_default.profesiones;
    const extremos = new Set([...filas.slice(0, 3), ...filas.slice(-3)].map((f) => f.palabra));
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "sesgo" }, /* @__PURE__ */ React.createElement("div", { className: `eje-sesgo aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "marca-eje he", style: { left: `${pos(sesgo_default.referencias.he)}%` } }, "he"), /* @__PURE__ */ React.createElement("span", { className: "marca-eje cero", style: { left: "50%" } }, "0"), /* @__PURE__ */ React.createElement("span", { className: "marca-eje she", style: { left: `${pos(sesgo_default.referencias.she)}%` } }, "she")), /* @__PURE__ */ React.createElement("div", { className: "filas-sesgo" }, filas.map((f, i) => {
      const v = f.puntaje;
      const izq = v < 0;
      return /* @__PURE__ */ React.createElement("div", { key: f.palabra, className: `fila-sesgo aparece-p ${p >= 2 ? "visto" : ""} ${p >= 3 && !extremos.has(f.palabra) ? "atenuada" : ""}`, style: { transitionDelay: p === 2 && !final ? `${i * 0.05}s` : "0s" } }, /* @__PURE__ */ React.createElement("span", { className: "nombre", style: { textAlign: "right" } }, f.palabra, " ", /* @__PURE__ */ React.createElement("small", null, f.es)), /* @__PURE__ */ React.createElement("span", { className: "pista-sesgo" }, /* @__PURE__ */ React.createElement("span", { className: "linea-cero" }), /* @__PURE__ */ React.createElement("span", { className: `barra-sesgo ${izq ? "he" : "she"}`, style: izq ? { right: "50%", width: `${Math.abs(v) / max * 50}%` } : { left: "50%", width: `${v / max * 50}%` } })), /* @__PURE__ */ React.createElement("span", { className: "valor" }, v > 0 ? "+" : "", v.toFixed(2)));
    }))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_SESGO, paso: p }));
  }
  var PIE_CUENTA = [
    "El costo se cuenta en tokens. Usamos los precios de Claude Haiku 5.5 del Anexo G.1.",
    "Paso 1. Los tokens de entrada se cobran a su precio: 2 000 × USD 0.10 por millón.",
    "Paso 2. Los de salida, al suyo: 500 × USD 0.50 por millón. La suma es el costo por caso.",
    "Paso 3. Un laboratorio de 50 llamadas cuesta cerca de 2 centavos de dólar por estudiante.",
    "Paso 4. El tokenizer decide cuántos tokens pagas. El mismo texto cambia de precio según el modelo."
  ];
  function Cuenta({ paso = 0, final }) {
    const p = final ? 4 : paso;
    const entrada = 2e3 * 0.1 / 1e6;
    const salida = 500 * 0.5 / 1e6;
    const caso = entrada + salida;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "cuenta" }, /* @__PURE__ */ React.createElement("div", { className: `renglon aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "ficha-cuenta entrada" }, "2 000 tokens de entrada"), /* @__PURE__ */ React.createElement("i", null, "×"), /* @__PURE__ */ React.createElement("span", { className: "ficha-cuenta" }, "USD 0.10 por millón"), /* @__PURE__ */ React.createElement("i", null, "="), /* @__PURE__ */ React.createElement("b", null, usd(entrada))), /* @__PURE__ */ React.createElement("div", { className: `renglon aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "ficha-cuenta salida" }, "500 tokens de salida"), /* @__PURE__ */ React.createElement("i", null, "×"), /* @__PURE__ */ React.createElement("span", { className: "ficha-cuenta" }, "USD 0.50 por millón"), /* @__PURE__ */ React.createElement("i", null, "="), /* @__PURE__ */ React.createElement("b", null, usd(salida, 5))), /* @__PURE__ */ React.createElement("div", { className: `renglon total aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", null, "Costo por caso"), /* @__PURE__ */ React.createElement("b", { className: "texto-acento" }, usd(caso, 5))), /* @__PURE__ */ React.createElement("div", { className: `renglon total grande aparece-p ${p >= 3 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", null, "50 llamadas por estudiante y laboratorio"), /* @__PURE__ */ React.createElement("b", { className: "texto-exito" }, usd(caso * 50))), /* @__PURE__ */ React.createElement("div", { className: `nota-tokenizer aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", null, "Bloque 2.1: el mismo texto gasta 30 % más tokens en español (o200k_base)."), /* @__PURE__ */ React.createElement("span", null, "El tokenizer de Haiku 5.5 produce cerca de 30 % más tokens que el de Haiku 4.5."))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_CUENTA, paso: p }));
  }
  var PIE_ACIERTO = [
    "Dos modelos resuelven los mismos 10 casos. El más barato por caso no siempre gana.",
    "Paso 1. El costo de los 10 casos: el modelo A cuesta menos por caso.",
    "Paso 2. Los aciertos: el modelo A resuelve 4 casos; el B, 9.",
    "Paso 3. Costo por acierto: el costo total entre los casos bien resueltos.",
    "Paso 4. El modelo barato que falla cuesta más por acierto. Lo mides en el Laboratorio 2B."
  ];
  var MODELOS_ACIERTO = [
    { nombre: "Modelo A", caso: 4e-4, aciertos: 4, c: "var(--t4)" },
    { nombre: "Modelo B", caso: 6e-4, aciertos: 9, c: "var(--t1)" }
  ];
  function CostoAcierto({ paso = 0, final }) {
    const p = final ? 4 : paso;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "costo-acierto" }, MODELOS_ACIERTO.map((m) => {
      const total = m.caso * 10;
      const porAcierto = total / m.aciertos;
      return /* @__PURE__ */ React.createElement("div", { key: m.nombre, className: "col-modelo", style: { "--c": m.c } }, /* @__PURE__ */ React.createElement("b", { className: "nombre-modelo" }, m.nombre), /* @__PURE__ */ React.createElement("div", { className: `aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "dato" }, usd(m.caso), " por caso"), /* @__PURE__ */ React.createElement("span", { className: "dato tenue" }, "10 casos: ", usd(total, 3))), /* @__PURE__ */ React.createElement("div", { className: `casos-ok aparece-p ${p >= 2 ? "visto" : ""}` }, Array.from({ length: 10 }).map((_, i) => /* @__PURE__ */ React.createElement("i", { key: i, className: i < m.aciertos ? "ok" : "falla" }, i < m.aciertos ? "✓" : "✗"))), /* @__PURE__ */ React.createElement("div", { className: `por-acierto aparece-p ${p >= 3 ? "visto" : ""} ${p >= 4 && m.nombre === "Modelo A" ? "peor" : ""} ${p >= 4 && m.nombre === "Modelo B" ? "mejor" : ""}` }, /* @__PURE__ */ React.createElement("span", null, usd(total, 3), " ÷ ", m.aciertos, " aciertos"), /* @__PURE__ */ React.createElement("b", null, usd(porAcierto, 5), " por acierto")));
    })), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_ACIERTO, paso: p }), /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Precios y aciertos ilustrativos" })));
  }
  var PIE_PRUEBAS = [
    "La capa 1 se prueba con los casos que escribieron después del bloque 2.1.",
    "Paso 1. Los diez casos, en dos modelos, con la clave del curso.",
    "Paso 2. Los tres casos de robustez, en los mismos dos modelos.",
    "Paso 3. La consistencia: tres casos, tres veces cada uno, en cada modelo.",
    "Paso 4. Cada prueba deja una fila en la tabla de la ficha: tokens, costo y latencia."
  ];
  function Celdas({ n, encendidas, clase, retraso = 0 }) {
    return /* @__PURE__ */ React.createElement("span", { className: "celdas" }, Array.from({ length: n }).map((_, i) => /* @__PURE__ */ React.createElement("i", { key: i, className: `${clase} ${encendidas ? "corrida" : ""}`, style: { transitionDelay: encendidas ? `${retraso + i * 0.03}s` : "0s" } })));
  }
  function PruebasCapa({ paso = 0, final }) {
    const p = final ? 4 : paso;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "pruebas-capa" }, /* @__PURE__ */ React.createElement("div", { className: "cabecera-pruebas" }, /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("b", null, "Modelo 1"), /* @__PURE__ */ React.createElement("b", null, "Modelo 2")), [
      { rotulo: "Diez casos", sub: "C01 a C10", n: 10, clase: "funcionamiento", paso: 1 },
      { rotulo: "Tres de robustez", sub: "ambigua, premisa falsa, fuera de alcance", n: 3, clase: "robustez", paso: 2 },
      { rotulo: "Consistencia", sub: "tres casos × tres intentos", n: 9, clase: "consistencia", paso: 3 }
    ].map((g) => /* @__PURE__ */ React.createElement("div", { key: g.rotulo, className: `fila-pruebas ${p >= g.paso ? "activa" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rotulo-pruebas" }, /* @__PURE__ */ React.createElement("b", null, g.rotulo), /* @__PURE__ */ React.createElement("small", null, g.sub)), /* @__PURE__ */ React.createElement(Celdas, { n: g.n, encendidas: p >= g.paso, clase: g.clase }), /* @__PURE__ */ React.createElement(Celdas, { n: g.n, encendidas: p >= g.paso, clase: g.clase, retraso: 0.15 }))), /* @__PURE__ */ React.createElement("div", { className: `total-pruebas aparece-p ${p >= 4 ? "visto" : ""}` }, "(10 + 3 + 9) pruebas × 2 modelos = ", /* @__PURE__ */ React.createElement("b", null, totalPruebas(), " filas"), " en la tabla de resultados"), /* @__PURE__ */ React.createElement("div", { className: `fila-tabla-resultados aparece-p ${p >= 4 ? "visto" : ""}` }, ["caso_id", "modelo", "intento", "resultado", "tokens_entrada", "tokens_salida", "costo_usd", "latencia_s"].map((c) => /* @__PURE__ */ React.createElement("span", { key: c }, c)))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_PRUEBAS, paso: p }));
  }
  function totalPruebas() {
    return (10 + 3 + 9) * 2;
  }
  var PIE_DONDE = [
    "Los pesos de un modelo viven en algún computador. ¿En el tuyo o en el del proveedor?",
    "Paso 1. Detrás de una API: tu texto viaja por internet hasta los pesos del proveedor.",
    "Paso 2. En tu computador: descargas los pesos y el texto no sale de tu máquina.",
    "Paso 3. Con una API, tus datos salen de tu computador. La parte 5 muestra qué hace cada proveedor."
  ];
  var IconoComputador = () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 48 40", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("rect", { x: "5", y: "4", width: "38", height: "24", rx: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M2 34h44" }), /* @__PURE__ */ React.createElement("path", { d: "M18 34l2-6h8l2 6" }));
  var IconoNube = () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 48 40", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M14 32h22a9 9 0 0 0 0-18 12 12 0 0 0-23-2A9 9 0 0 0 14 32z" }));
  var IconoArchivo = () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 40 48", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M8 4h16l10 10v30H8z" }), /* @__PURE__ */ React.createElement("path", { d: "M24 4v10h10" }), /* @__PURE__ */ React.createElement("path", { d: "M14 26h14M14 32h14M14 38h9" }));
  function DondePesos({ paso = 0, final, quieto }) {
    const p = final ? 3 : paso;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "donde-pesos" }, /* @__PURE__ */ React.createElement("div", { className: `escenario api aparece-p ${p >= 1 ? "visto" : ""} ${p >= 3 ? "resaltado" : ""}` }, /* @__PURE__ */ React.createElement("b", { className: "titulo-escenario" }, "Detrás de una API"), /* @__PURE__ */ React.createElement("div", { className: "camino-escenario" }, /* @__PURE__ */ React.createElement("span", { className: "caja-escenario" }, /* @__PURE__ */ React.createElement(IconoComputador, null), /* @__PURE__ */ React.createElement("small", null, "tu programa")), /* @__PURE__ */ React.createElement("span", { className: `flecha-datos ${p >= 3 ? "alerta" : ""} ${quieto ? "quieta" : ""}` }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("em", null, "tu texto viaja")), /* @__PURE__ */ React.createElement("span", { className: "caja-escenario nube" }, /* @__PURE__ */ React.createElement(IconoNube, null), /* @__PURE__ */ React.createElement("small", null, "pesos del proveedor"))), /* @__PURE__ */ React.createElement("span", { className: "ejemplos-escenario" }, "Claude, Gemini y los modelos de OpenAI por API")), /* @__PURE__ */ React.createElement("div", { className: `escenario local aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("b", { className: "titulo-escenario" }, "En tu computador"), /* @__PURE__ */ React.createElement("div", { className: "camino-escenario" }, /* @__PURE__ */ React.createElement("span", { className: "caja-escenario" }, /* @__PURE__ */ React.createElement(IconoComputador, null), /* @__PURE__ */ React.createElement("small", null, "tu programa")), /* @__PURE__ */ React.createElement("span", { className: "flecha-local" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("em", null, "sin internet")), /* @__PURE__ */ React.createElement("span", { className: "caja-escenario archivo" }, /* @__PURE__ */ React.createElement(IconoArchivo, null), /* @__PURE__ */ React.createElement("small", null, "pesos descargados"))), /* @__PURE__ */ React.createElement("span", { className: "ejemplos-escenario" }, "Olmo 3 7B: 14.6 GB en 16 bits, cerca de 3.6 GB en 4 bits"))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_DONDE, paso: p }));
  }

  // src/datos_bloque2.jsx
  var DATOS = {
    /* El caso huggingface-cli: Lanyado (2024, 28 de marzo), Lasso Security, y el commit del 29 de marzo de 2024
       en alibaba/GraphTranslator. Cifras: Spracklen et al. (2025), USENIX Security. Las probabilidades son ilustrativas. */
    plausible: {
      pregunta: "¿Cómo instalo la herramienta de línea de comandos de Hugging Face?",
      candidatos: [
        { texto: "pip install huggingface-cli", prob: 46 },
        { texto: 'pip install -U "huggingface_hub[cli]"', prob: 31, real: true },
        { texto: "pip install huggingface_hub", prob: 14, real: true }
      ],
      escala: [
        { valor: "5.2 %", rotulo: "de los paquetes que sugirieron los modelos GPT no existían" },
        { valor: "21.7 %", rotulo: "en los modelos de código abierto probados" },
        { valor: "205 474", rotulo: "nombres de paquetes inventados, todos distintos" }
      ],
      fuenteEscala: "Spracklen et al. (2025), USENIX Security: 576 000 programas de 16 modelos, en Python y JavaScript.",
      riesgoTitulo: "Alguien registra el nombre inventado",
      riesgoTexto: "Un investigador subió un paquete vacío llamado huggingface-cli. En tres meses tuvo más de 30 000 descargas reales. Un proyecto de Alibaba lo instalaba en su README.",
      fuenteRiesgo: "Lanyado (2024), Lasso Security. Commit del 29 de marzo de 2024 en alibaba/GraphTranslator."
    },
    /* METR (2026, 20 de noviembre), «Q4 2026 capability update», figura 10: horizonte de tiempo del 50 %
       con las suites TH1.1 y TH2. Datos de https://metr.org/assets/images/q4-2026-capability-update/cad6b5d98261f80c.json
       Licencia de las figuras: CC BY. Minutos de un experto humano; intervalos de confianza del 95 %. */
    horizonte: {
      modelos: [
        { modelo: "GPT-4o", fecha: "2024-05-13", min: 7.1, bajo: 3.8, alto: 13.5, frontera: true },
        { modelo: "o1", fecha: "2024-12-05", min: 35.3, bajo: 15.7, alto: 66.1, frontera: true },
        { modelo: "GPT-5", fecha: "2025-08-07", min: 180.6, bajo: 97.9, alto: 334.5, frontera: true },
        { modelo: "Claude Opus 4.5", fecha: "2025-11-24", min: 275.4, bajo: 144.7, alto: 511, frontera: true },
        { modelo: "Claude Opus 4.6", fecha: "2026-02-05", min: 384, bajo: 193.4, alto: 729.6, frontera: true },
        { modelo: "GPT-5.4", fecha: "2026-03-05", min: 356.7, bajo: 199.5, alto: 592, frontera: false },
        { modelo: "Claude Opus 4.7", fecha: "2026-04-16", min: 503, bajo: 257.9, alto: 937.6, frontera: true },
        { modelo: "GPT-5.5", fecha: "2026-04-23", min: 664.3, bajo: 365.9, alto: 1116.4, frontera: true },
        { modelo: "Claude Opus 4.8", fecha: "2026-05-28", min: 710.6, bajo: 366.9, alto: 1268.1, frontera: true },
        { modelo: "Claude Fable 5", fecha: "2026-06-09", min: 934.7, bajo: 534.8, alto: 1939.3, frontera: true },
        { modelo: "GPT-5.6 Sol", fecha: "2026-07-09", min: 716.6, bajo: 393.4, alto: 1239.2, frontera: false },
        { modelo: "Claude Opus 5", fecha: "2026-07-24", min: 1194.8, bajo: 566.8, alto: 5174.8, frontera: true },
        { modelo: "Claude Fable 5.1", fecha: "2026-09-01", min: 1812.9, bajo: 718.7, alto: 18464.1, frontera: true },
        { modelo: "GPT-6 Astra", fecha: "2026-09-03", min: 2416.3, bajo: 791.5, alto: 158701, frontera: true },
        { modelo: "Claude Opus 5.5", fecha: "2026-09-22", min: 2337.4, bajo: 714.9, alto: 75176.6, frontera: false }
      ],
      tendencia: { desde: "2024-05-13", hasta: "2026-09-03", minDesde: 8.09, minHasta: 1643.2, duplicacion: 3.61, bajo: 2.08, alto: 4.94 }
    },
    /* Claude Haiku 5.5: «Training data cutoff | Jun 2026» y «Released October 7, 2026»
       (platform.claude.com/docs/en/models/haiku-5-5/overview). langchain 1.5.0: PyPI, 11 de noviembre de 2026. */
    corte: {
      inicio: "2026-05-01",
      fin: "2026-12-10",
      hitos: [
        { rotulo: "Corte de los datos", texto: "junio de 2026", fecha: "2026-06-15", clase: "corte" },
        { rotulo: "Lanzamiento", texto: "7 de octubre de 2026", fecha: "2026-10-07", clase: "lanzamiento" },
        { rotulo: "langchain 1.5.0", texto: "11 de noviembre de 2026", fecha: "2026-11-11", clase: "version" },
        { rotulo: "Hoy", texto: "23 de noviembre de 2026", fecha: "2026-11-23", clase: "hoy" }
      ]
    },
    /* USD por millón de tokens, consultado el 23 de noviembre de 2026.
       Anthropic: platform.claude.com/docs/en/about-claude/pricing (Haiku 5.5 con prompts de hasta 100 000 tokens).
       Google: aistudio.google.com/docs/pricing (plan pagado; entrada de texto, imagen y video). */
    precios: {
      modelos: [
        { nombre: "Claude Haiku 5.5", proveedor: "Anthropic", entrada: 0.1, salida: 0.5 },
        { nombre: "Gemini 2.5 Flash-Lite", proveedor: "Google", entrada: 0.1, salida: 0.4 },
        { nombre: "Gemini 3.5 Flash-Lite", proveedor: "Google", entrada: 0.3, salida: 2.5 },
        { nombre: "Claude Opus 5.5", proveedor: "Anthropic · modelo grande", entrada: 4, salida: 20, contraste: true }
      ]
    }
  };

  // src/bloque2b.jsx
  var PIE_PLAUSIBLE = [
    "Pregunta de un desarrollador. El modelo elige cada token por probabilidad, sin consultar una fuente.",
    "Paso 1. Los candidatos: todos se ven razonables para el modelo.",
    "Paso 2. El elegido suena correcto, pero ese paquete no existía.",
    "Paso 3. No es un caso aislado: pasa a gran escala en los modelos que generan código.",
    "Paso 4. El riesgo: alguien registra ese nombre y quien copia el comando instala su paquete."
  ];
  function PlausibleFalso({ paso = 0, final }) {
    const p = final ? 4 : paso;
    const d = DATOS.plausible;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "plausible" }, /* @__PURE__ */ React.createElement("div", { className: "plausible-pregunta" }, /* @__PURE__ */ React.createElement("span", { className: "rol" }, "usuario"), d.pregunta), /* @__PURE__ */ React.createElement("div", { className: `plausible-candidatos aparece-p ${p >= 1 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rotulo" }, "Comandos candidatos"), d.candidatos.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: c.texto, className: `candidato ${p >= 2 && i === 0 ? "elegido" : ""} ${p >= 2 && c.real ? "real" : ""}` }, /* @__PURE__ */ React.createElement("code", null, c.texto), /* @__PURE__ */ React.createElement("span", { className: "barra-candidato" }, /* @__PURE__ */ React.createElement("i", { style: { width: `${c.prob}%` } })), /* @__PURE__ */ React.createElement("span", { className: "prob" }, c.prob, " %"), p >= 2 && i === 0 ? /* @__PURE__ */ React.createElement("span", { className: "sello no-existe" }, "no existía") : null, p >= 2 && c.real ? /* @__PURE__ */ React.createElement("span", { className: "sello existe" }, "sí existe") : null))), /* @__PURE__ */ React.createElement("div", { className: `plausible-escala aparece-p ${p >= 3 ? "visto" : ""}` }, d.escala.map((e) => /* @__PURE__ */ React.createElement("div", { key: e.rotulo, className: "cifra-escala-b" }, /* @__PURE__ */ React.createElement("b", null, e.valor), /* @__PURE__ */ React.createElement("span", null, e.rotulo))), /* @__PURE__ */ React.createElement("small", null, d.fuenteEscala)), /* @__PURE__ */ React.createElement("div", { className: `plausible-riesgo aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("b", null, d.riesgoTitulo), /* @__PURE__ */ React.createElement("span", null, d.riesgoTexto), /* @__PURE__ */ React.createElement("small", null, d.fuenteRiesgo))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_PLAUSIBLE, paso: p }), p >= 1 ? /* @__PURE__ */ React.createElement(Ilustrativo, { texto: "Probabilidades ilustrativas" }) : null));
  }
  var PIE_CORTE = [
    "Los pesos se congelan al final del entrenamiento. Lo que pasó después no está en ellos.",
    "Paso 1. La fecha de corte: el final de los datos de entrenamiento.",
    "Paso 2. El lanzamiento llega meses después del corte.",
    "Paso 3. El mundo sigue: una nueva versión de LangChain sale después del corte.",
    "Paso 4. Si preguntas por ella, el modelo no la conoce. Puede inventar una respuesta plausible."
  ];
  function FechaCorte({ paso = 0, final }) {
    const p = final ? 4 : paso;
    const t = DATOS.corte;
    const inicio = t.inicio;
    const fin = t.fin;
    const pos = (fecha) => (new Date(fecha) - new Date(inicio)) / (new Date(fin) - new Date(inicio)) * 100;
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "linea-corte" }, /* @__PURE__ */ React.createElement("div", { className: "riel-corte" }, /* @__PURE__ */ React.createElement("span", { className: "tramo-datos", style: { width: `${pos(t.hitos[0].fecha)}%` } }, "datos de entrenamiento"), /* @__PURE__ */ React.createElement("span", { className: `tramo-despues aparece-p ${p >= 1 ? "visto" : ""}`, style: { left: `${pos(t.hitos[0].fecha)}%` } }, "los pesos no saben esto")), t.hitos.map((h, i) => /* @__PURE__ */ React.createElement("div", { key: h.rotulo, className: `hito-corte ${h.clase} aparece-p ${p >= i + 1 || i === 3 && p >= 3 ? "visto" : ""}`, style: { left: `${pos(h.fecha)}%` } }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("b", null, h.rotulo), /* @__PURE__ */ React.createElement("small", null, h.texto))), /* @__PURE__ */ React.createElement("div", { className: `pregunta-corte aparece-p ${p >= 4 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "rol" }, "usuario"), "«¿Qué cambió en LangChain 1.5.0?»", /* @__PURE__ */ React.createElement("span", { className: "respuesta-corte" }, "El modelo no la conoce: puede inventar. La solución es darle la información, con herramientas y contexto (sesiones 5 y 6)."))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_CORTE, paso: p }));
  }
  var PIE_PRECIOS = [
    "Precios por millón de tokens, en dólares. La salida cuesta más que la entrada.",
    "Paso 1. El costo de un laboratorio por estudiante: 50 llamadas de 2 000 tokens de entrada y 500 de salida.",
    "Paso 2. Un modelo grande cuesta decenas de veces más. Para la mayoría de las tareas del curso no hace falta."
  ];
  function Precios({ paso = 0, final }) {
    const p = final ? 2 : paso;
    const modelos = DATOS.precios.modelos;
    const max = Math.max(...modelos.map((m) => m.salida));
    const lmin = Math.log10(0.05);
    const lmax = Math.log10(max * 1.4);
    const ancho2 = (v) => (Math.log10(v) - lmin) / (lmax - lmin) * 100;
    const marcas = [0.1, 1, 10].filter((v) => v < max * 1.4);
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("div", { className: "precios" }, /* @__PURE__ */ React.createElement("div", { className: "eje-precios" }, marcas.map((v) => /* @__PURE__ */ React.createElement("span", { key: v, style: { left: `${ancho2(v)}%` } }, "USD ", v))), modelos.map((m) => {
      const lab = 50 * (2e3 * m.entrada / 1e6 + 500 * m.salida / 1e6);
      return /* @__PURE__ */ React.createElement("div", { key: m.nombre, className: `fila-precio ${m.contraste ? "contraste" : ""} ${p >= 2 && m.contraste ? "resaltada" : ""}` }, /* @__PURE__ */ React.createElement("span", { className: "nombre" }, /* @__PURE__ */ React.createElement("b", null, m.nombre), /* @__PURE__ */ React.createElement("small", null, m.proveedor)), /* @__PURE__ */ React.createElement("span", { className: "pistas-precio" }, /* @__PURE__ */ React.createElement("span", { className: "pista-p" }, marcas.map((v) => /* @__PURE__ */ React.createElement("i", { key: v, style: { left: `${ancho2(v)}%` } })), /* @__PURE__ */ React.createElement("span", { className: "valor-p entrada", style: { width: `${ancho2(m.entrada)}%` } }), /* @__PURE__ */ React.createElement("em", { style: { left: `calc(${ancho2(m.entrada)}% + 8px)` } }, m.entrada.toFixed(2))), /* @__PURE__ */ React.createElement("span", { className: "pista-p" }, marcas.map((v) => /* @__PURE__ */ React.createElement("i", { key: v, style: { left: `${ancho2(v)}%` } })), /* @__PURE__ */ React.createElement("span", { className: "valor-p salida", style: { width: `${ancho2(m.salida)}%` } }), /* @__PURE__ */ React.createElement("em", { style: { left: `calc(${ancho2(m.salida)}% + 8px)` } }, m.salida.toFixed(2)))), /* @__PURE__ */ React.createElement("span", { className: `costo-lab aparece-p ${p >= 1 ? "visto" : ""}` }, "USD ", lab < 0.1 ? lab.toFixed(4) : lab.toFixed(2), /* @__PURE__ */ React.createElement("small", null, "por laboratorio")));
    }), /* @__PURE__ */ React.createElement("div", { className: "leyenda-precios" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "entrada" }), "entrada"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "salida" }), "salida"), /* @__PURE__ */ React.createElement("span", null, "USD por millón de tokens, en escala logarítmica"))), /* @__PURE__ */ React.createElement(Pie, { textos: PIE_PRECIOS, paso: p }));
  }
  var PIE_HORIZONTE = [
    "METR mide qué tan largas son las tareas de software que completa un agente con 50 % de éxito.",
    "Paso 1. Cada punto es un modelo, en su fecha de lanzamiento. El eje usa escala logarítmica.",
    "Paso 2. La tendencia: la duración de esas tareas se duplica cada 3.6 meses.",
    "Paso 3. Las líneas son la incertidumbre. En los modelos más nuevos es enorme."
  ];
  var ETIQUETAS_H = ["GPT-4o", "o1", "GPT-5", "Claude Opus 4.6", "GPT-6 Astra"];
  function duracion(min) {
    if (min < 60) return `${Math.round(min)} min`;
    const h = min / 60;
    return `${h < 10 ? h.toFixed(1) : Math.round(h)} h`;
  }
  function Horizonte({ paso = 0, final }) {
    const p = final ? 3 : paso;
    const { modelos, tendencia } = DATOS.horizonte;
    const x0 = 110;
    const x1 = 1150;
    const yA = 30;
    const yB = 380;
    const t0 = (/* @__PURE__ */ new Date("2024-03-01")).getTime();
    const t1 = (/* @__PURE__ */ new Date("2026-11-01")).getTime();
    const lmin = 0;
    const lmax = Math.log10(12e3);
    const X = (fecha) => x0 + (new Date(fecha).getTime() - t0) / (t1 - t0) * (x1 - x0);
    const Y = (min) => yB - (Math.log10(Math.max(min, 1)) - lmin) / (lmax - lmin) * (yB - yA);
    const marcasY = [
      [1, "1 min"],
      [10, "10 min"],
      [60, "1 h"],
      [600, "10 h"],
      [6e3, "100 h"]
    ];
    const marcasX = ["2024-07-01", "2025-01-01", "2025-07-01", "2026-01-01", "2026-07-01"];
    const etiquetaX = (f) => {
      const [a, m] = f.split("-");
      return `${m === "01" ? "ene" : "jul"} ${a}`;
    };
    const recorte = (min) => Math.min(min, 11500);
    return /* @__PURE__ */ React.createElement("div", { className: "programa-cuerpo" }, /* @__PURE__ */ React.createElement("svg", { className: "diagrama prog-svg", viewBox: "0 0 1200 430", role: "img", "aria-label": "Horizonte de tiempo de las tareas que completan los agentes, por fecha de lanzamiento del modelo" }, marcasY.map(([v, t]) => /* @__PURE__ */ React.createElement("g", { key: v }, /* @__PURE__ */ React.createElement("path", { d: `M${x0} ${Y(v)} H${x1}`, className: "linea-guia" }), /* @__PURE__ */ React.createElement("text", { x: x0 - 12, y: Y(v), textAnchor: "end", dominantBaseline: "central", fontSize: 15, className: "t-suave" }, t))), marcasX.map((f) => /* @__PURE__ */ React.createElement("text", { key: f, x: X(f), y: yB + 24, textAnchor: "middle", dominantBaseline: "central", fontSize: 15, className: "t-suave" }, etiquetaX(f))), /* @__PURE__ */ React.createElement("text", { x: x0, y: yB + 46, dominantBaseline: "central", fontSize: 14, className: "t-tenue" }, "Fecha de lanzamiento del modelo"), /* @__PURE__ */ React.createElement("text", { x: 14, y: yA - 12, dominantBaseline: "central", fontSize: 14, className: "t-tenue" }, "Duración de la tarea para un experto humano"), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 3 ? "visto" : ""}` }, modelos.map((m) => /* @__PURE__ */ React.createElement("g", { key: `ic${m.modelo}` }, /* @__PURE__ */ React.createElement("path", { d: `M${X(m.fecha)} ${Y(m.bajo)} V${Y(recorte(m.alto))}`, className: "intervalo" }), m.alto > 11500 ? /* @__PURE__ */ React.createElement("path", { d: `M${X(m.fecha) - 6} ${Y(11500) + 9} L${X(m.fecha)} ${Y(11500)} L${X(m.fecha) + 6} ${Y(11500) + 9}`, className: "intervalo" }) : null))), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 2 ? "visto" : ""}` }, /* @__PURE__ */ React.createElement("path", { d: `M${X(tendencia.desde)} ${Y(tendencia.minDesde)} L${X(tendencia.hasta)} ${Y(tendencia.minHasta)}`, className: "tendencia" }), /* @__PURE__ */ React.createElement("rect", { x: 150, y: 60, width: 420, height: 62, rx: 14, className: "panel-fondo" }), /* @__PURE__ */ React.createElement("text", { x: 170, y: 82, dominantBaseline: "central", fontSize: 20, fontWeight: 700, className: "t-acento" }, "Se duplica cada ", tendencia.duplicacion.toFixed(1), " meses"), /* @__PURE__ */ React.createElement("text", { x: 170, y: 106, dominantBaseline: "central", fontSize: 14, className: "t-suave" }, "Intervalo del 95 %: de ", tendencia.bajo.toFixed(1), " a ", tendencia.alto.toFixed(1), " meses")), /* @__PURE__ */ React.createElement("g", { className: `aparece-p ${p >= 1 ? "visto" : ""}` }, modelos.map((m) => /* @__PURE__ */ React.createElement("circle", { key: m.modelo, cx: X(m.fecha), cy: Y(m.min), r: m.frontera ? 8 : 6, className: m.frontera ? "punto-h frontera" : "punto-h" })), modelos.filter((m) => ETIQUETAS_H.includes(m.modelo)).map((m) => {
      const derecha = m.modelo !== "GPT-6 Astra";
      return /* @__PURE__ */ React.createElement("text", { key: `e${m.modelo}`, x: X(m.fecha) + (derecha ? 14 : -14), y: Y(m.min) + (m.modelo === "GPT-6 Astra" ? -16 : 14), textAnchor: derecha ? "start" : "end", dominantBaseline: "central", fontSize: 15, fontWeight: 600 }, m.modelo, " · ", duracion(m.min));
    }))), /* @__PURE__ */ React.createElement("div", { className: "fila-marcas" }, /* @__PURE__ */ React.createElement(Pie, { textos: PIE_HORIZONTE, paso: p })));
  }

  // src/principal.jsx
  var { useState: useState7, useEffect: useEffect7 } = React;
  var REGISTRO = {
    mapa: { componente: Mapa, pasos: 1, titulo: "El mapa de un LLM", props: { modo: "apertura" } },
    "mapa-pesos": { componente: Mapa, pasos: 5, titulo: "¿Dónde están los pesos?", props: { modo: "pesos" } },
    "mapa-sintesis": { componente: Mapa, pasos: 0, titulo: "Síntesis", props: { modo: "sintesis" } },
    minimapa: { componente: Minimapa, pasos: 0 },
    cortar: { componente: CortarNumerar, pasos: 5, titulo: "Cortar y numerar" },
    bpe: { componente: Bpe, pasos: 4, titulo: "Cómo se arma el vocabulario" },
    idiomas: { componente: Idiomas, pasos: 2 },
    demo: { componente: Demo, pasos: 0, titulo: "Demostración en vivo" },
    fila: { componente: BuscarFila, pasos: 4, titulo: "Buscar la fila" },
    nube: { componente: Nube3D, pasos: 1, titulo: "El espacio de los significados" },
    atencion: { componente: Atencion, pasos: 6, titulo: "La atención" },
    cabezas: { componente: Cabezas, pasos: 5, titulo: "Muchas cabezas" },
    encoder: { componente: Encoder, pasos: 5, titulo: "El encoder" },
    decoder: { componente: Decoder, pasos: 6, titulo: "El decoder" },
    traduccion: { componente: Traduccion, pasos: 5, titulo: "Encoder y decoder juntos" },
    parametros: { componente: Parametros, pasos: 3 },
    calculadora: { componente: Calculadora, pasos: 3 },
    aprendizaje: { componente: Aprendizaje, pasos: 4, titulo: "Cómo se aprenden" },
    congelados: { componente: Congelados, pasos: 2 },
    "base-asistente": { componente: BaseAsistente, pasos: 3 },
    llamada: { componente: Llamada, pasos: 3, titulo: "Una llamada" },
    // Bloque 2.2
    razonamiento: { componente: Razonamiento, pasos: 3, titulo: "Razonar antes de responder" },
    horizonte: { componente: Horizonte, pasos: 3, titulo: "Tareas cada vez más largas" },
    plausible: { componente: PlausibleFalso, pasos: 4, titulo: "Plausible, pero falso" },
    adivinar: { componente: Adivinar, pasos: 4, titulo: "Adivinar o decir no sé" },
    sesgo: { componente: Sesgo, pasos: 3, titulo: "Sesgos en los embeddings" },
    "fecha-corte": { componente: FechaCorte, pasos: 4, titulo: "La fecha de corte" },
    "donde-pesos": { componente: DondePesos, pasos: 3, titulo: "Dónde están los pesos" },
    cuenta: { componente: Cuenta, pasos: 4, titulo: "La cuenta" },
    "costo-acierto": { componente: CostoAcierto, pasos: 4, titulo: "Costo por acierto" },
    precios: { componente: Precios, pasos: 2, titulo: "Los precios" },
    "pruebas-capa": { componente: PruebasCapa, pasos: 4, titulo: "Las pruebas de la capa 1" }
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
    const [paso, setPaso] = useState7(final ? def.pasos : 0);
    useEffect7(() => {
      const tecla = (e) => {
        const tag = e.target && e.target.tagName || "";
        if (/input|textarea|select/i.test(tag)) return;
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
      const def = REGISTRO[nombre];
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
  window.ProgramasS2 = { REGISTRO, actualizar };
  montar();
})();
