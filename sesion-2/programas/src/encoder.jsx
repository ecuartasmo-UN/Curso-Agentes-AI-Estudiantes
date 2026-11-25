/* Animación 3 de «El transformer por dentro»: el encoder.
   Cada token mira a todos los demás, antes y después: la matriz de atención es un cuadrado.
   Las intensidades de la matriz son ilustrativas. BERT: Devlin et al. (2019). */
import { ancho, color, suave, useFuentes, useIdSvg, FiltroBrillo, arco, Pie, Ilustrativo } from './comun.jsx';
import { FRASE, posicionesFrase } from './atencion.jsx';

/* Atención ilustrativa: cada palabra mira sobre todo a sí misma y a sus pares de sentido. */
const PARES = [
  [3, 0],
  [4, 5],
  [1, 0],
  [5, 7],
  [4, 1],
  [6, 5],
];
export function atencionIlustrativa(i, j, causal) {
  if (causal && j > i) return 0;
  let v = 0.12 + ((i * 7 + j * 3) % 5) * 0.035;
  if (i === j) v += 0.35;
  PARES.forEach(([a, b]) => {
    if ((i === a && j === b) || (i === b && j === a)) v += 0.5;
  });
  return v;
}
function filaNormalizada(i, causal) {
  const fila = FRASE.map((_, j) => atencionIlustrativa(i, j, causal));
  const s = fila.reduce((a, b) => a + b, 0);
  return fila.map((v) => v / s);
}

/* Matriz de atención: filas = la palabra que mira; columnas = la palabra mirada. */
export function Matriz({ x, y, celda = 36, causal = false, visible = true, mascara = null, mostrarCeros = false, final }) {
  const n = FRASE.length;
  const etiquetaW = 74;
  return (
    <g className={`aparece-p ${visible ? 'visto' : ''}`}>
      {FRASE.map((w, j) => (
        <text key={`c${j}`} x={x + etiquetaW + j * celda + celda / 2} y={y - 10} textAnchor="start" dominantBaseline="central" fontSize={13} className="t-suave" transform={`rotate(-50 ${x + etiquetaW + j * celda + celda / 2} ${y - 10})`}>
          {w}
        </text>
      ))}
      {FRASE.map((w, i) => (
        <text key={`f${i}`} x={x + etiquetaW - 8} y={y + i * celda + celda / 2} textAnchor="end" dominantBaseline="central" fontSize={14} className="t-suave">
          {w}
        </text>
      ))}
      {FRASE.map((_, i) => {
        const fila = filaNormalizada(i, false);
        return FRASE.map((__, j) => {
          const oculta = causal && j > i;
          const v = fila[j];
          const pct = Math.round(15 + Math.min(1, v * 2.2) * 75);
          return (
            <g key={`${i}-${j}`}>
              <rect
                x={x + etiquetaW + j * celda + 1.5}
                y={y + i * celda + 1.5}
                width={celda - 3}
                height={celda - 3}
                rx={5}
                className={`celda-matriz ${visible ? 'llena' : ''} ${oculta ? 'tapada' : ''}`}
                style={{ fill: `color-mix(in srgb, var(--t1) ${pct}%, transparent)`, transitionDelay: visible && !final ? `${(i * n + j) * 0.018}s` : '0s' }}
              />
              {mascara ? (
                <text x={x + etiquetaW + j * celda + celda / 2} y={y + i * celda + celda / 2} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} className={mascara[i][j] ? 'digito-mascara' : 'digito-mascara cero'}>
                  {mascara[i][j]}
                </text>
              ) : null}
            </g>
          );
        });
      })}
    </g>
  );
}

const PIE = [
  'El encoder es la primera mitad del transformer original. Su trabajo es entender la frase.',
  'Paso 1. El encoder lee toda la frase a la vez.',
  'Paso 2. Cada token mira a todos los demás, antes y después. La matriz se llena completa.',
  'Paso 3. Sale un vector por token. Cada uno lleva el contexto de la frase entera.',
  'Paso 4. Sirve para entender, clasificar y buscar por significado.',
  'Paso 5. El ejemplo clásico es BERT: solo encoder (Devlin et al., 2019).',
];

const USOS = [
  { titulo: 'Entender', texto: '¿De qué trata este reporte?' },
  { titulo: 'Clasificar', texto: '¿Es un fallo o una consulta?' },
  { titulo: 'Buscar', texto: 'Documentos con el mismo sentido' },
];

export function Encoder({ paso = 0, final, quieto }) {
  useFuentes();
  const idB = useIdSvg('brillo-enc');
  const p = final ? 5 : paso;
  const px = 24;
  const pos = posicionesFrase(FRASE, px, 14, 740, 0);
  const yF = 300;
  const altoF = 52;
  const foco = 4;
  return (
    <div className="programa-cuerpo">
      <svg className="diagrama prog-svg" viewBox="0 0 1200 500" role="img" aria-label="El encoder: cada token mira a todos los demás y sale un vector por token">
        <defs>
          <FiltroBrillo id={idB} fuerza={4} />
        </defs>
        {/* La caja del encoder */}
        <rect x={0} y={176} width={740} height={262} rx={22} className={`caja-bloque ${p >= 1 ? 'activa' : ''}`} />
        <text x={20} y={202} dominantBaseline="central" fontSize={19} fontWeight={700} className="t-acento">
          Encoder
        </text>

        {/* Paso 2: «banco» mira a todas las palabras, antes y después */}
        {FRASE.map((w, j) => {
          if (j === foco) return null;
          const h = 30 + Math.abs(j - foco) * 15;
          const v = filaNormalizada(foco, false)[j];
          return (
            <path
              key={j}
              d={arco(pos[foco].cx, pos[j].cx, yF, h)}
              fill="none"
              stroke="var(--t1)"
              strokeWidth={1.5 + v * 16}
              strokeLinecap="round"
              filter={`url(#${idB})`}
              className={`aparece-p ${p >= 2 ? 'visto' : ''}`}
            />
          );
        })}

        {/* La frase entra completa */}
        {FRASE.map((w, i) => (
          <g key={i} className={`ficha-token ${p >= 1 ? 'visto' : ''}`} style={{ transform: `translate(${pos[i].x}px, ${yF}px)`, transitionDelay: '0s' }}>
            <rect width={pos[i].w} height={altoF} rx={12} fill={suave(color(i), i === foco && p >= 2 ? 34 : 18)} stroke={color(i)} strokeWidth={2} />
            <text x={pos[i].w / 2} y={altoF / 2} textAnchor="middle" dominantBaseline="central" fontSize={px} fontWeight={600}>
              {w}
            </text>
          </g>
        ))}
        {p >= 1 && !final && !quieto ? <rect className="pulso-lectura" x={pos[0].x - 6} y={yF - 6} width={pos[7].x + pos[7].w - pos[0].x + 12} height={altoF + 12} rx={16} /> : null}

        {/* Paso 3: un vector por token */}
        {FRASE.map((w, i) => (
          <g key={`v${i}`} className={`aparece-p ${p >= 3 ? 'visto' : ''}`} style={{ transitionDelay: p >= 3 && !final ? `${i * 0.06}s` : '0s' }}>
            {[0, 1, 2, 3, 4].map((k) => (
              <rect key={k} x={pos[i].cx - 30 + k * 12} y={yF + altoF + 18} width={11} height={22} rx={3} fill={color((i + k * 3) % 8)} opacity={0.85} />
            ))}
          </g>
        ))}
        <text x={370} y={yF + altoF + 64} textAnchor="middle" dominantBaseline="central" fontSize={16} className={`t-suave aparece-p ${p >= 3 ? 'visto' : ''}`}>
          un vector por token, con el contexto de toda la frase
        </text>

        {/* Paso 4: para qué sirve */}
        {USOS.map((u, k) => (
          <g key={k} className={`aparece-p ${p >= 4 ? 'visto' : ''}`} style={{ transitionDelay: p >= 4 && !final ? `${k * 0.15}s` : '0s' }}>
            <rect x={k * 250} y={14} width={236} height={104} rx={16} className="panel-fondo" />
            <text x={k * 250 + 118} y={48} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={700} className="t-acento t-titulo">
              {u.titulo}
            </text>
            <text x={k * 250 + 118} y={86} textAnchor="middle" dominantBaseline="central" fontSize={15} className="t-suave">
              {u.texto}
            </text>
          </g>
        ))}
        <text x={370} y={146} textAnchor="middle" dominantBaseline="central" fontSize={15} className={`t-suave aparece-p ${p >= 4 ? 'visto' : ''}`}>
          Muchos modelos de embeddings para buscar documentos usan un encoder. Volvemos a esto en la sesión 6.
        </text>

        {/* La matriz completa: un cuadrado */}
        <text x={980} y={18} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} className={`aparece-p ${p >= 2 ? 'visto' : ''}`}>
          Quién mira a quién
        </text>
        <Matriz x={800} y={86} celda={36} visible={p >= 2} final={final} />
        <text x={1014} y={384} textAnchor="middle" dominantBaseline="central" fontSize={15} className={`t-suave aparece-p ${p >= 2 ? 'visto' : ''}`}>
          Todas las celdas llenas: un cuadrado
        </text>

        {/* Paso 5: BERT */}
        <g className={`aparece-p ${p >= 5 ? 'visto' : ''}`}>
          <rect x={770} y={404} width={426} height={88} rx={16} fill={suave('var(--t1)', 14)} stroke="var(--t1)" strokeWidth={2} />
          <text x={790} y={430} dominantBaseline="central" fontSize={19} fontWeight={700}>
            BERT (Devlin et al., 2019): solo encoder
          </text>
          <text x={790} y={462} dominantBaseline="central" fontSize={15} className="t-suave">
            BERT-base: 12 capas, 12 cabezas, vectores de 768
          </text>
          <text x={790} y={482} dominantBaseline="central" fontSize={15} className="t-suave">
            y 110 millones de parámetros
          </text>
        </g>
      </svg>
      <div className="fila-marcas">
        <Pie textos={PIE} paso={p} />
        {p >= 2 ? <Ilustrativo texto="Intensidades ilustrativas" /> : null}
      </div>
    </div>
  );
}
