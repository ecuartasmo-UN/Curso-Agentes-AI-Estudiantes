/* Programa 1 de «El transformer por dentro»: la atención (query, key y value).
   La frase es la de Lee y Trott (2023), en su traducción autorizada al español.
   Los porcentajes son ilustrativos: no salen de un modelo real. */
import { ancho, color, suave, useFuentes, useIdSvg, FiltroBrillo, Particulas, Pie, Ilustrativo, arco, cimaArco } from './comun.jsx';

const { useState } = React;

export const FRASE = ['John', 'busca', 'en', 'su', 'banco', 'cambio', 'de', 'un'];
const ETIQUETAS = ['una persona', 'una acción', 'un lugar', 'de alguien', 'un banco', 'dinero', 'un enlace', 'viene algo'];
/* Por palabra: su pregunta (query), cuánto mira a cada palabra anterior y a sí misma, y lo que queda. */
const FOCOS = [
  { pregunta: '¿Quién soy?', pesos: [100], resultado: 'persona' },
  { pregunta: '¿Quién busca?', pesos: [60, 40], resultado: 'verbo' },
  { pregunta: '¿En dónde?', pesos: [10, 55, 35], resultado: 'lugar' },
  { pregunta: '¿De quién soy?', pesos: [65, 10, 5, 20], resultado: 'de John' },
  { pregunta: '¿Qué tipo de banco soy?', pesos: [10, 25, 5, 45, 15], resultado: 'institución financiera' },
  { pregunta: '¿Cambio de qué?', pesos: [5, 15, 5, 10, 50, 15], resultado: 'moneda fraccionada' },
  { pregunta: '¿De qué?', pesos: [3, 5, 2, 3, 15, 52, 20], resultado: 'une «cambio» con lo que sigue' },
  { pregunta: '¿Un qué?', pesos: [2, 6, 2, 3, 15, 40, 22, 10], resultado: 'pide un sustantivo' },
];

const PIE = [
  'La frase de Lee y Trott (2023). En o200k_base, cada palabra de esta frase es un token.',
  'Paso 1. «banco» puede ser una institución financiera o el banco de un río.',
  'Paso 2. «banco» lanza su pregunta, el query: ¿qué palabra me dice qué tipo de banco soy?',
  'Paso 3. Cada palabra anterior muestra su etiqueta, el key: lo que puede ofrecer.',
  'Paso 4. El parecido entre la pregunta y cada etiqueta da un porcentaje. Todos suman 100 %.',
  'Paso 5. Cada palabra envía su contenido, el value, en proporción a su porcentaje.',
  'Paso 6. El vector de «banco» se mezcla y ahora dice «institución financiera». Pasa en cada capa.',
];

/* Posiciones de las fichas de la frase, centradas en el ancho dado. */
export function posicionesFrase(palabras, px, gap, anchoTotal, x0 = 0) {
  const anchos = palabras.map((w) => ancho(w, px, 600) + px * 1.05);
  const total = anchos.reduce((s, w) => s + w, 0) + gap * (palabras.length - 1);
  let x = x0 + (anchoTotal - total) / 2;
  return anchos.map((w) => {
    const r = { x, w, cx: x + w / 2 };
    x += w + gap;
    return r;
  });
}

export function Atencion({ paso = 0, final, quieto }) {
  useFuentes();
  const idB = useIdSvg('brillo-at');
  const [foco, setFoco] = useState(4);
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

  // Mezcla del vector: 20 celdas repartidas según los porcentajes.
  const celdas = [];
  f.pesos.forEach((pct, j) => {
    const n = Math.round(pct / 5);
    for (let k = 0; k < n; k++) celdas.push(j);
  });

  const anchoPregunta = Math.max(260, ancho(f.pregunta, 22, 600) + 48);
  const anchoResultado = Math.max(260, ancho(`${FRASE[foco]} (${f.resultado})`, 22, 700) + 48);
  const xBurbuja = Math.min(1200 - anchoPregunta - 4, Math.max(4, cxF - anchoPregunta / 2));
  const xResultado = Math.min(1200 - anchoResultado - 4, Math.max(4, cxF - anchoResultado / 2));

  return (
    <div className="programa-cuerpo">
      <svg className="diagrama prog-svg" viewBox="0 0 1200 500" role="img" aria-label="La atención: la palabra banco pregunta, las palabras anteriores responden con su etiqueta y le envían su contenido">
        <defs>
          <FiltroBrillo id={idB} fuerza={5} />
        </defs>

        {/* Paso 4 y siguientes: arcos con su porcentaje; paso 5: partículas (value) que fluyen */}
        {arcos.map((a) => (
          <g key={a.j} className={`aparece-p ${p >= 4 ? 'visto' : ''}`}>
            <path d={a.d} fill="none" stroke={color(a.j)} strokeWidth={2 + a.pct / 7} strokeLinecap="round" opacity={0.85} filter={`url(#${idB})`} />
            {p >= 5 ? <Particulas d={a.d} n={Math.max(1, Math.round(a.pct / 12))} c={color(a.j)} dur={1.7} r={4 + a.pct / 20} quieto={quieto} invertir /> : null}
          </g>
        ))}
        {arcos.map((a) => (
          <g key={`p${a.j}`} className={`aparece-p ${p >= 4 ? 'visto' : ''}`}>
            <rect x={a.cimaX - 31} y={a.cimaY - 16} width={62} height={30} rx={15} className="pastilla" />
            <text x={a.cimaX} y={a.cimaY - 1} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} style={{ fill: color(a.j) }}>
              {a.pct} %
            </text>
          </g>
        ))}

        {/* Paso 2: la pregunta (query). Paso 6: el resultado. */}
        <g className={`aparece-p ${p >= 2 && p < 6 ? 'visto' : ''}`}>
          <rect x={xBurbuja} y={18} width={anchoPregunta} height={64} rx={18} fill={suave('var(--t1)', 22)} stroke="var(--t1)" strokeWidth={2.5} />
          <text x={xBurbuja + anchoPregunta / 2} y={38} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} className="t-acento">
            query: la pregunta
          </text>
          <text x={xBurbuja + anchoPregunta / 2} y={62} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={600}>
            {f.pregunta}
          </text>
          <path d={`M${cxF} 84 V${yF - 118}`} className="arista acento punteada" />
        </g>
        <g className={`aparece-p ${p >= 6 ? 'visto' : ''}`}>
          <rect x={xResultado} y={18} width={anchoResultado} height={64} rx={18} fill={suave('var(--t5)', 22)} stroke="var(--t5)" strokeWidth={2.5} filter={`url(#${idB})`} />
          <text x={xResultado + anchoResultado / 2} y={38} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} style={{ fill: 'var(--t5)' }}>
            el vector ya mezclado dice
          </text>
          <text x={xResultado + anchoResultado / 2} y={62} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={700}>
            {FRASE[foco]} ({f.resultado})
          </text>
          {/* El vector mezclado: celdas con el color de cada palabra, según su porcentaje */}
          {celdas.map((j, k) => (
            <rect key={k} x={cxF - celdas.length * 6 + k * 12} y={92} width={11} height={22} rx={3} fill={color(j)} />
          ))}
        </g>

        {/* La frase */}
        {FRASE.map((w, i) => {
          const esFoco = i === foco && p >= 1;
          const c = color(i);
          return (
            <g
              key={i}
              className={`ficha tocable ${esFoco ? 'foco' : ''}`}
              style={{ transform: `translate(${pos[i].x}px, ${yF}px)`, opacity: p >= 3 && i > foco ? 0.28 : 1 }}
              onClick={tocar(i)}
              role="button"
              aria-label={`Ver las conexiones de ${w}`}
            >
              {esFoco ? <rect x={-7} y={-7} width={pos[i].w + 14} height={altoF + 14} rx={18} fill="none" stroke="var(--t1)" strokeWidth={3} filter={`url(#${idB})`} className="ficha-brillo" /> : null}
              <rect width={pos[i].w} height={altoF} rx={14} fill={suave(c, esFoco ? 34 : 18)} stroke={c} strokeWidth={2.5} />
              <text x={pos[i].w / 2} y={altoF / 2} textAnchor="middle" dominantBaseline="central" fontSize={px} fontWeight={600}>
                {w}
              </text>
            </g>
          );
        })}
        <text x={pos[7].x + pos[7].w + 12} y={yF + altoF / 2} dominantBaseline="central" fontSize={28} className="t-tenue">
          …
        </text>

        {/* Paso 3: la etiqueta (key) de cada palabra anterior y de la misma palabra */}
        {FRASE.map((w, i) => {
          if (i > foco) return null;
          const t = ETIQUETAS[i];
          const wT = ancho(t, 16, 600) + 22;
          return (
            <g key={`k${i}`} className={`aparece-p ${p >= 3 ? 'visto' : ''}`} style={{ transitionDelay: p >= 3 && !final ? `${i * 0.08}s` : '0s' }}>
              <rect x={pos[i].cx - wT / 2} y={yF + altoF + 12 + (i % 2) * 36} width={wT} height={30} rx={9} fill={suave('var(--t2)', 18)} stroke="var(--t2)" strokeWidth={1.5} />
              <text x={pos[i].cx} y={yF + altoF + 27 + (i % 2) * 36} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={600}>
                {t}
              </text>
            </g>
          );
        })}
        <text x={8} y={yF + altoF + 29} dominantBaseline="central" fontSize={15} fontWeight={700} className={`t-acento-2 aparece-p ${p >= 3 ? 'visto' : ''}`}>
          key: la etiqueta
        </text>

        {/* Paso 4: los porcentajes suman 100 % */}
        <g className={`aparece-p ${p >= 4 ? 'visto' : ''}`}>
          {(() => {
            let x = 300;
            return f.pesos.map((pct, j) => {
              const w = (pct / 100) * 600;
              const r = <rect key={j} x={x} y={448} width={Math.max(1, w - 2)} height={20} rx={5} fill={color(j)} opacity={0.85} />;
              x += w;
              return r;
            });
          })()}
          <text x={288} y={458} textAnchor="end" dominantBaseline="central" fontSize={16} fontWeight={700}>
            100 %
          </text>
          <text x={912} y={458} dominantBaseline="central" fontSize={15} className="t-suave">
            {f.pesos.length} palabras reparten la atención
          </text>
        </g>
        <text x={1192} y={494} textAnchor="end" fontSize={14} className={`t-tenue aparece-p ${p >= 4 ? 'visto' : ''}`}>
          Toca una palabra para ver sus conexiones
        </text>

        {/* Paso 6: se repite en cada capa, como en la figura en español de Lee y Trott */}
        <g className={`aparece-p ${p >= 6 && foco === 4 ? 'visto' : ''}`}>
          <rect x={836} y={122} width={356} height={148} rx={14} className="panel-fondo" />
          <text x={1014} y={142} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} className="t-suave">
            Capa por capa, según Lee y Trott (2023)
          </text>
          <text x={852} y={176} dominantBaseline="central" fontSize={15} fontWeight={700} className="t-acento-2">
            Capa 2
          </text>
          <text x={922} y={176} dominantBaseline="central" fontSize={15}>
            su (de John)
          </text>
          <text x={922} y={198} dominantBaseline="central" fontSize={15}>
            banco (institución financiera)
          </text>
          <text x={852} y={232} dominantBaseline="central" fontSize={15} fontWeight={700} className="t-acento">
            Capa 1
          </text>
          <text x={922} y={232} dominantBaseline="central" fontSize={15}>
            busca (verbo)
          </text>
          <text x={922} y={254} dominantBaseline="central" fontSize={15}>
            cambio (moneda fraccionada)
          </text>
        </g>
      </svg>
      <div className="fila-marcas">
        <Pie textos={PIE} paso={p} />
        {p >= 4 ? <Ilustrativo texto="Porcentajes ilustrativos" /> : null}
      </div>
    </div>
  );
}
