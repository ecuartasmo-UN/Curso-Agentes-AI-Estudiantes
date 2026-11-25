/* Programa 2 de «El transformer por dentro»: muchas cabezas (multi-head attention).
   Cada cabeza tiene su color y su patrón. Los patrones son ilustrativos.
   La escala real sale de Brown et al. (2020), tabla 2.1, y del config.json de GPT-2. */
import { color, suave, useFuentes, arco, Pie, Ilustrativo, useIdSvg, FiltroBrillo, miles } from './comun.jsx';
import { FRASE, posicionesFrase } from './atencion.jsx';

const { useState, useEffect } = React;

/* Arcos de cada cabeza: [desde, hacia, fuerza]. «desde» mira a «hacia», que va antes en la frase. */
const CABEZAS = [
  { pregunta: '¿De quién es?', ejemplo: 'su → John', arcos: [[3, 0, 70], [7, 0, 12]] },
  { pregunta: '¿Qué tipo de banco?', ejemplo: 'cambio → banco', arcos: [[5, 4, 65], [4, 1, 22]] },
  { pregunta: '¿Qué va justo antes?', ejemplo: 'cada palabra → la anterior', arcos: [[1, 0, 40], [2, 1, 40], [3, 2, 40], [4, 3, 40], [5, 4, 40], [6, 5, 40], [7, 6, 40]] },
  { pregunta: '¿Quién hace la acción?', ejemplo: 'busca → John', arcos: [[1, 0, 75], [6, 1, 18]] },
];

const PIE = [
  'La misma frase. Una cabeza de atención es una manera de mirar las otras palabras.',
  'Paso 1. Una sola cabeza: «su» mira a «John» para saber de quién es.',
  'Paso 2. Varias cabezas trabajan en paralelo. Cada una busca algo distinto.',
  'Paso 3. Cada cabeza es un plano. Al separarlos, se ve el patrón de cada una.',
  'Paso 4. Lo que encontró cada cabeza se junta en un solo vector por palabra.',
  'Paso 5. La escala real: GPT-3 tiene 96 cabezas en cada una de sus 96 capas.',
];

const ANCHO_PLANO = 760;
const ALTO_PLANO = 230;

function Plano({ k, conFichas, conArcos, conFondo, idB }) {
  const pos = posicionesFrase(FRASE, 22, 12, ANCHO_PLANO - 40, 20);
  const yF = 160;
  const c = color(k);
  return (
    <svg className="plano-svg" viewBox={`0 0 ${ANCHO_PLANO} ${ALTO_PLANO}`} aria-hidden="true">
      {conFondo ? <rect x={1} y={1} width={ANCHO_PLANO - 2} height={ALTO_PLANO - 2} rx={18} fill={suave(c, 10)} stroke={c} strokeWidth={2} /> : null}
      {conFondo ? (
        <text x={22} y={30} dominantBaseline="central" fontSize={18} fontWeight={700} style={{ fill: c }}>
          Cabeza {k + 1}
        </text>
      ) : null}
      {conArcos
        ? CABEZAS[k].arcos.map(([a, b, fuerza], j) => {
            const dist = a - b;
            const h = 34 + dist * 17;
            return <path key={j} d={arco(pos[a].cx, pos[b].cx, yF, h)} fill="none" stroke={c} strokeWidth={1.5 + fuerza / 14} strokeLinecap="round" filter={`url(#${idB})`} opacity={0.9} />;
          })
        : null}
      {conFichas
        ? FRASE.map((w, i) => (
            <g key={i}>
              <rect x={pos[i].x} y={yF} width={pos[i].w} height={46} rx={11} fill={suave('var(--texto-tenue)', 14)} stroke="var(--borde)" strokeWidth={1.5} />
              <text x={pos[i].cx} y={yF + 23} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={600}>
                {w}
              </text>
            </g>
          ))
        : null}
    </svg>
  );
}

export function Cabezas({ paso = 0, final }) {
  useFuentes();
  const idB = useIdSvg('brillo-cab');
  const p = final ? 5 : paso;
  const [sola, setSola] = useState(null);
  const [juntas, setJuntas] = useState(p >= 4);
  useEffect(() => {
    if (p < 4) return setJuntas(false);
    if (final || p > 4) return setJuntas(true);
    setJuntas(false);
    const t = setTimeout(() => setJuntas(true), 700);
    return () => clearTimeout(t);
  }, [p, final]);

  const en3d = p === 3 && !document.documentElement.classList.contains('sin-3d');
  const visible = (k) => {
    if (p === 0) return false;
    if (p === 1) return k === 0;
    if (sola !== null) return k === sola;
    return true;
  };
  const elegir = (k) => (e) => {
    setSola((s) => (s === k ? null : k));
    e.currentTarget.blur();
  };

  return (
    <div className="programa-cuerpo">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <FiltroBrillo id={idB} fuerza={3} />
        </defs>
      </svg>
      <div className="cabezas-rejilla">
        <div className={`cabezas-escena ${en3d ? 'en-3d' : ''}`}>
          <div className="cabezas-pila">
            {CABEZAS.map((cab, k) => (
              <div
                key={k}
                className={`plano ${visible(k) ? 'visto' : ''}`}
                style={{ transform: en3d ? `translateZ(${(k - 1.5) * 105}px)` : 'translateZ(0px)', zIndex: k }}
              >
                <Plano k={k} idB={idB} conArcos={p >= 1} conFichas={k === 0 || en3d} conFondo={en3d} />
              </div>
            ))}
            {/* La frase sin cabezas, en el estado inicial */}
            <div className={`plano ${p === 0 ? 'visto' : ''}`}>
              <Plano k={0} idB={idB} conArcos={false} conFichas conFondo={false} />
            </div>
          </div>
        </div>

        <div className="cabezas-lado">
          <div className={`cabezas-leyenda aparece-p ${p >= 1 ? 'visto' : ''}`}>
            {CABEZAS.map((cab, k) => (
              <button
                key={k}
                type="button"
                className={`boton-cabeza ${sola === k ? 'activa' : ''} ${p === 1 && k > 0 ? 'apagada' : ''}`}
                style={{ '--c': color(k) }}
                onClick={elegir(k)}
                disabled={p < 2}
                aria-pressed={sola === k}
              >
                <i />
                <span>
                  <b>Cabeza {k + 1}:</b> {cab.pregunta}
                  <small>{cab.ejemplo}</small>
                </span>
              </button>
            ))}
          </div>

          <div className={`cabezas-union aparece-p ${p >= 4 ? 'visto' : ''}`}>
            <span className="rotulo-union">Un solo vector por palabra</span>
            <div className={`tiras ${juntas ? 'juntas' : ''}`}>
              {CABEZAS.map((cab, k) => (
                <span key={k} className="tira" style={{ '--c': color(k), '--k': k }}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <i key={j} />
                  ))}
                </span>
              ))}
            </div>
          </div>

          <div className={`cabezas-escala aparece-p ${p >= 5 ? 'visto' : ''}`}>
            <div className="cuadro-escala" aria-hidden="true" />
            <div>
              <b className="cifra-escala">{miles(96 * 96)}</b>
              <span>cabezas en GPT-3</span>
              <small>96 capas × 96 cabezas (Brown et al., 2020)</small>
              <small>GPT-2 pequeño: 12 × 12 = 144</small>
            </div>
          </div>
        </div>
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE} paso={p} />
        {p >= 1 ? <Ilustrativo texto="Patrones ilustrativos" /> : null}
      </div>
    </div>
  );
}
