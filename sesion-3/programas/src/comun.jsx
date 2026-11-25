/* Piezas comunes de los programas de la sesión 3 (vienen de la sesión 2).
   Cada programa recibe estas propiedades:
   - paso: cuántos pasos se ven (0 es el estado inicial);
   - final: true si debe mostrar su estado final completo (movimiento reducido, sin 3D o impresión);
   - quieto: true si no debe tener animaciones continuas (movimiento reducido o impresión).
   React llega como variable global (build UMD 18.3.1), igual que ReactDOM. */
const { useState, useEffect } = React;

/* Colores de los tokens y de las cabezas: variables del tema, que cambian con el botón. */
export const COLORES = ['var(--t1)', 'var(--t2)', 'var(--t3)', 'var(--t4)', 'var(--t5)', 'var(--t6)'];
export const color = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const suave = (c, pct = 18) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

/* Formato de números: espacio fino como separador de miles y punto decimal (normas del curso). */
export function miles(n) {
  const [entero, dec] = String(n).split('.');
  const conEspacios = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return dec ? `${conEspacios}.${dec}` : conEspacios;
}

/* ---------- Medición de texto ----------
   El SVG no ajusta el ancho de un recuadro a su texto. Medimos con un canvas y la misma fuente,
   y volvemos a medir cuando cargan las fuentes locales. */
let contexto = null;
const medidas = new Map();
export function ancho(texto, px, peso = 600, familia = 'Inter') {
  const clave = `${texto}|${px}|${peso}|${familia}`;
  if (medidas.has(clave)) return medidas.get(clave);
  if (!contexto) contexto = document.createElement('canvas').getContext('2d');
  contexto.font = `${peso} ${px}px "${familia}", system-ui, sans-serif`;
  const w = contexto.measureText(texto).width;
  medidas.set(clave, w);
  return w;
}

let versionFuentes = 0;
const oyentes = new Set();
export function cargarFuentes() {
  if (!document.fonts || !document.fonts.load) return;
  const pedidos = ['400 20px "Inter"', '600 20px "Inter"', '700 20px "Inter"', '500 20px "Space Grotesk"', '700 20px "Space Grotesk"'];
  Promise.all(pedidos.map((f) => document.fonts.load(f)))
    .then(() => {
      medidas.clear();
      versionFuentes += 1;
      oyentes.forEach((f) => f(versionFuentes));
    })
    .catch(() => {});
}
export function useFuentes() {
  const [, poner] = useState(versionFuentes);
  useEffect(() => {
    oyentes.add(poner);
    return () => oyentes.delete(poner);
  }, []);
}

/* Identificador único para filtros y marcadores de cada SVG.
   Cada programa es una raíz de React distinta, y useId repite valores entre raíces.
   Por eso se usa un contador propio, que no se repite en toda la página. */
let contadorIds = 0;
export function useIdSvg(prefijo) {
  const [id] = useState(() => {
    contadorIds += 1;
    return `${prefijo}-${contadorIds}`;
  });
  return id;
}

/* ---------- Fichas de token en SVG ---------- */
export const ALTO_FICHA = 52;

/* El espacio al inicio de un token se dibuja como una marca pequeña, sin depender de la fuente. */
export function partirEspacio(texto) {
  return texto.startsWith(' ') ? { espacio: true, cuerpo: texto.slice(1) } : { espacio: false, cuerpo: texto };
}
const ANCHO_MARCA = 16;

export function anchoFicha(texto, px = 26, extra = '') {
  const { espacio, cuerpo } = partirEspacio(texto);
  const base = ancho(cuerpo, px, 600) + (espacio ? ANCHO_MARCA : 0);
  const otro = extra ? ancho(extra, Math.round(px * 0.72), 600) : 0;
  return Math.max(base, otro) + px * 0.95;
}

export function MarcaEspacio({ x, y, px }) {
  const w = px * 0.42;
  const h = px * 0.22;
  return (
    <path
      d={`M${x} ${y - h} V${y} H${x + w} V${y - h}`}
      fill="none"
      stroke="var(--texto-tenue)"
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}

/* Una ficha: recuadro de color con su texto centrado. (x, y) es la esquina superior izquierda. */
export function Ficha({ x, y, texto, c = 'var(--t1)', px = 26, alto = ALTO_FICHA, w, numero, brillo, opacidad = 1, estilo, clase = '', onClick, titulo }) {
  const ancho0 = w || anchoFicha(texto, px, numero);
  const { espacio, cuerpo } = partirEspacio(texto);
  const anchoCuerpo = ancho(cuerpo, px, 600) + (espacio ? ANCHO_MARCA : 0);
  const x0 = ancho0 / 2 - anchoCuerpo / 2;
  const centroY = numero ? alto * 0.36 : alto / 2;
  return (
    <g
      className={`ficha ${clase} ${onClick ? 'tocable' : ''}`}
      style={{ transform: `translate(${x}px, ${y}px)`, opacity: opacidad, ...estilo }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? titulo || cuerpo : undefined}
    >
      {brillo ? <rect x={-6} y={-6} width={ancho0 + 12} height={alto + 12} rx={16} fill="none" stroke={c} strokeWidth={3} className="ficha-brillo" /> : null}
      <rect width={ancho0} height={alto} rx={12} fill={suave(c, 20)} stroke={c} strokeWidth={2} />
      {espacio ? <MarcaEspacio x={x0} y={centroY + px * 0.32} px={px} /> : null}
      <text x={x0 + (espacio ? ANCHO_MARCA : 0)} y={centroY} dominantBaseline="central" fontSize={px} fontWeight={600} className="t-ficha">
        {cuerpo}
      </text>
      {numero ? (
        <text x={ancho0 / 2} y={alto * 0.76} textAnchor="middle" dominantBaseline="central" fontSize={Math.round(px * 0.72)} fontWeight={600} className="t-numero">
          {numero}
        </text>
      ) : null}
    </g>
  );
}

/* Distribuye fichas en filas que no pasen de anchoMax. Devuelve [{x, y, w, fila}]. */
export function distribuir(textos, { px = 26, gap = 12, anchoMax = 1100, alto = ALTO_FICHA, gapFila = 22, numeros = [], centrar = true, x0 = 0 } = {}) {
  const anchos = textos.map((t, i) => anchoFicha(t, px, numeros[i]));
  const filas = [[]];
  let usado = 0;
  anchos.forEach((w, i) => {
    const fila = filas[filas.length - 1];
    const necesario = fila.length ? usado + gap + w : w;
    if (fila.length && necesario > anchoMax) {
      filas.push([i]);
      usado = w;
    } else {
      fila.push(i);
      usado = necesario;
    }
  });
  const pos = [];
  filas.forEach((fila, f) => {
    const total = fila.reduce((s, i) => s + anchos[i], 0) + gap * (fila.length - 1);
    let x = x0 + (centrar ? (anchoMax - total) / 2 : 0);
    fila.forEach((i) => {
      pos[i] = { x, y: f * (alto + gapFila), w: anchos[i], fila: f };
      x += anchos[i] + gap;
    });
  });
  return pos;
}

/* Marca «Ilustrativo»: va en la diapositiva, no solo en las notas. */
export function Ilustrativo({ texto = 'Ilustrativo', estilo }) {
  return (
    <span className="marca-ilustrativo" style={estilo}>
      {texto}
    </span>
  );
}

/* Rótulo de pie del programa: explica el paso que se ve. */
export function Pie({ textos, paso }) {
  const t = textos[Math.min(paso, textos.length - 1)];
  return (
    <p className="pie-programa" aria-live="polite">
      {t}
    </p>
  );
}

/* Partículas que viajan por un camino SVG: el contenido (value) que fluye por un arco. */
export function Particulas({ d, n = 3, c = 'var(--t1)', dur = 1.8, r = 5, quieto, invertir = false }) {
  if (quieto || n <= 0) return null;
  const items = [];
  for (let k = 0; k < n; k++) {
    items.push(
      <circle key={k} r={r} fill={c} className="particula">
        <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${(k * dur) / n}s`} path={d} keyPoints={invertir ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear" />
      </circle>
    );
  }
  return <g>{items}</g>;
}

/* Filtro de brillo suave para arcos y fichas. */
export function FiltroBrillo({ id, fuerza = 5 }) {
  return (
    <filter id={id} x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation={fuerza} result="difuso" />
      <feMerge>
        <feMergeNode in="difuso" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

/* Arco entre dos puntos de una fila, por encima (arriba = true) o por debajo. */
export function arco(x1, x2, y, alto, arriba = true) {
  const medio = (x1 + x2) / 2;
  const yc = arriba ? y - alto : y + alto;
  return `M${x1} ${y} Q${medio} ${yc} ${x2} ${y}`;
}
/* Punto más alto de un arco cuadrático: la mitad de la altura de control. */
export const cimaArco = (y, alto, arriba = true) => (arriba ? y - alto / 2 : y + alto / 2);

/* Color de un peso: cian si es positivo y rosa si es negativo; la intensidad crece con el valor. */
export function colorPeso(v, max = 0.25) {
  const a = Math.min(1, Math.abs(v) / max);
  const pct = Math.round(18 + a * 70);
  return v >= 0 ? `color-mix(in srgb, var(--t1) ${pct}%, transparent)` : `color-mix(in srgb, var(--t3) ${pct}%, transparent)`;
}

/* Clases de visibilidad con transición: aparece cuando la condición es verdadera. */
export const ver = (si, extra = '') => `aparece-p ${si ? 'visto' : ''} ${extra}`;
