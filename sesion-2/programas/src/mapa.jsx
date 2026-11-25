/* El mapa del camino del texto a la respuesta.
   - Mapa: la versión grande de la apertura, del cierre y de «¿Dónde están los pesos?».
   - Minimapa: la versión pequeña que abre cada parte, con la pieza de esa parte iluminada. */
import { ancho, useFuentes, useIdSvg, FiltroBrillo, miles } from './comun.jsx';
import gpt2 from '../../ejemplos/datos/gpt2.json';

const NODOS = [
  { id: 'texto', titulo: 'Texto', sub: 'lo que escribes', corto: 'Texto', ejemplo: 'John busca en su…' },
  { id: 'tokenizer', titulo: 'Tokenizer', sub: 'corta y numera', corto: 'Tokenizer', ejemplo: 'o200k_base' },
  { id: 'tokens', titulo: 'Tokens', sub: 'números', corto: 'Tokens', ejemplo: '21020 · 28609 …' },
  { id: 'embeddings', titulo: 'Embeddings', sub: 'vectores', corto: 'Embeddings', ejemplo: 'listas de números' },
  { id: 'transformer', titulo: 'Transformer', sub: '× N capas', corto: 'Transformer', ejemplo: 'mezcla el contexto' },
  { id: 'probabilidades', titulo: 'Probabilidades', sub: 'una por token', corto: 'Probabilidades', ejemplo: 'billete, dólar…' },
  { id: 'siguiente', titulo: 'Siguiente token', sub: 'se elige uno', corto: 'Siguiente', ejemplo: 'billete' },
];

/* Ancho de cada nodo según su texto, para que nada se desborde. */
function medirNodos(chico) {
  const pxT = chico ? 27 : 19;
  return NODOS.map((n) => {
    const t = ancho(chico ? n.corto : n.titulo, pxT, 700, 'Space Grotesk');
    const s = chico ? 0 : ancho(n.sub, 14, 400);
    let w = Math.max(t, s) + 26;
    if (!chico && n.id === 'transformer') w = Math.max(w, ancho('Atención', 14, 600) + ancho('Feed-forward', 14, 600) + 70);
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

const PESOS_POR_NODO = gpt2.parametros_por_pieza;
/* Valores reales de pesos de GPT-2, para la lluvia de números. */
const VALORES = gpt2.cuadricula_atencion_capa1.valores.flat().slice(0, 60).concat(gpt2.fila.primeros_valores);

export function Mapa({ paso = 0, final, quieto, modo = 'apertura' }) {
  useFuentes();
  const idB = useIdSvg('brillo-mapa');
  const idM = useIdSvg('punta-mapa');
  const nodos = ubicar(medirNodos(false), 1200);
  const y0 = 64;
  const h = 124;
  const cy = y0 + h / 2;
  const n = (id) => nodos.find((k) => k.id === id);
  const verBucle = modo === 'sintesis' || (modo === 'apertura' && (paso >= 1 || final));
  const yBucle = y0 + h + (modo === 'apertura' ? 96 : 66);
  const caminoPunto = `M${n('texto').cx} ${cy} H${n('siguiente').cx} V${yBucle} H${n('tokens').cx} V${y0 + h}`;

  // Pasos del modo «pesos»: 1 embeddings, 2 atención, 3 feed-forward, 4 salida, 5 total.
  const p = final ? 99 : paso;
  const enPesos = modo === 'pesos';
  const lleno = (id) => {
    if (!enPesos) return false;
    if (id === 'embeddings') return p >= 1;
    if (id === 'atencion') return p >= 2;
    if (id === 'ff') return p >= 3;
    if (id === 'probabilidades') return p >= 4;
    return false;
  };
  const nt = n('transformer');
  // Cada pieza del transformer con el ancho de su texto y el sobrante repartido por igual.
  const sobra = nt.w - 36 - ancho('Atención', 14, 600) - ancho('Feed-forward', 14, 600);
  const chipA = ancho('Atención', 14, 600) + sobra / 2;
  const chipF = ancho('Feed-forward', 14, 600) + sobra / 2;

  const rotulosPesos = [
    { id: 'embeddings', x: n('embeddings').cx, texto: miles(PESOS_POR_NODO.embeddings), sub: 'tabla de tokens y de posiciones', si: lleno('embeddings') },
    { id: 'atencion', x: nt.x + 12 + chipA / 2, texto: miles(PESOS_POR_NODO.atencion), sub: 'atención', si: lleno('atencion') },
    { id: 'ff', x: nt.x + 24 + chipA + chipF / 2, texto: miles(PESOS_POR_NODO.feed_forward), sub: 'feed-forward', si: lleno('ff'), abajo: 58 },
    { id: 'probabilidades', x: n('probabilidades').cx, texto: 'la misma tabla', sub: 'de los embeddings', si: lleno('probabilidades') },
  ];

  return (
    <svg className="diagrama mapa-llm" viewBox="0 0 1200 400" role="img" aria-label="Mapa del camino del texto a la respuesta">
      <defs>
        <FiltroBrillo id={idB} fuerza={6} />
        <marker id={idM} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" className="relleno-acento" />
        </marker>
      </defs>
      {nodos.slice(0, -1).map((a, i) => {
        const b = nodos[i + 1];
        return <path key={a.id} className="arista acento" d={`M${a.x + a.w + 2} ${cy} H${b.x - 3}`} markerEnd={`url(#${idM})`} />;
      })}
      {nodos.map((k) => {
        const conPesos = enPesos && ((k.id === 'embeddings' && lleno('embeddings')) || (k.id === 'probabilidades' && lleno('probabilidades')));
        const clase = k.id === 'transformer' ? 'nodo acento-2' : k.id === 'tokenizer' ? 'nodo aviso' : 'nodo acento';
        return (
          <g key={k.id} className={`${clase} ${conPesos ? 'con-pesos' : ''}`}>
            <rect x={k.x} y={y0} width={k.w} height={h} rx={18} />
            <text x={k.cx} y={k.id === 'transformer' ? y0 + 26 : y0 + 48} textAnchor="middle" dominantBaseline="central" fontSize={19} className="t-titulo">
              {k.titulo}
            </text>
            <text x={k.cx} y={k.id === 'transformer' ? y0 + h - 20 : y0 + 84} textAnchor="middle" dominantBaseline="central" fontSize={14} className="t-suave">
              {k.sub}
            </text>
          </g>
        );
      })}
      {/* Ejemplo concreto bajo cada pieza, con la frase de Lee y Trott */}
      {modo === 'apertura'
        ? nodos.map((k) => (
            <text key={`e${k.id}`} x={k.cx} y={y0 + h + 30} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={600} className="t-acento">
              {k.ejemplo}
            </text>
          ))
        : null}
      {/* Las dos piezas de cada capa del transformer */}
      {[
        { id: 'atencion', texto: 'Atención', x: nt.x + 12, w: chipA },
        { id: 'ff', texto: 'Feed-forward', x: nt.x + 24 + chipA, w: chipF },
      ].map((c) => (
        <g key={c.id} className={`nodo ${lleno(c.id) ? 'acento con-pesos' : ''}`}>
          <rect x={c.x} y={y0 + 46} width={c.w} height={36} rx={10} />
          <text x={c.x + c.w / 2} y={y0 + 64} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={600}>
            {c.texto}
          </text>
        </g>
      ))}

      {/* Lluvia de números: pesos reales de GPT-2 que entran a cada pieza */}
      {enPesos
        ? ['embeddings', 'atencion', 'ff', 'probabilidades'].map((id, j) => {
            const objetivo = id === 'atencion' || id === 'ff' ? rotulosPesos.find((r) => r.id === id).x : n(id).cx;
            const si = lleno(id);
            return (
              <g key={id} className={`lluvia ${si ? 'visto' : ''}`} aria-hidden="true">
                {VALORES.slice(j * 6, j * 6 + 6).map((v, k) => (
                  <text
                    key={k}
                    x={objetivo + ((k % 2) - 0.5) * 50}
                    y={y0 - 14 - Math.floor(k / 2) * 17}
                    textAnchor="middle"
                    fontSize={13}
                    className="t-tenue numero-peso"
                    style={{ transitionDelay: si ? `${k * 0.05}s` : '0s' }}
                  >
                    {v.toFixed(3)}
                  </text>
                ))}
              </g>
            );
          })
        : null}

      {enPesos
        ? rotulosPesos.map((r) => (
            <g key={r.id} className={`aparece-p ${r.si ? 'visto' : ''}`}>
              <text x={r.x} y={y0 + h + 30 + (r.abajo || 0)} textAnchor="middle" dominantBaseline="central" fontSize={r.id === 'probabilidades' ? 17 : 21} fontWeight={700} className="t-acento">
                {r.texto}
              </text>
              <text x={r.x} y={y0 + h + 54 + (r.abajo || 0)} textAnchor="middle" dominantBaseline="central" fontSize={14} className="t-suave">
                {r.sub}
              </text>
            </g>
          ))
        : null}
      {enPesos ? (
        <g className={`aparece-p ${p >= 5 ? 'visto' : ''}`}>
          <text x={600} y={y0 + h + 138} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={700} className="t-titulo">
            GPT-2 pequeño: {miles(gpt2.parametros_total)} pesos (parámetros)
          </text>
          <text x={600} y={y0 + h + 172} textAnchor="middle" dominantBaseline="central" fontSize={16} className="t-suave">
            Más {miles(PESOS_POR_NODO.normalizacion)} de normalización ya incluidos. El tokenizer no tiene pesos: es una lista fija.
          </text>
        </g>
      ) : null}

      {/* El bucle: el token elegido vuelve a entrar */}
      {modo !== 'pesos' ? (
        <g className={`aparece-p ${verBucle ? 'visto' : ''}`}>
          <path className="arista acento-2 punteada" d={`M${n('siguiente').cx} ${y0 + h + 2} V${yBucle} H${n('tokens').cx} V${y0 + h + 4}`} markerEnd={`url(#${idM})`} />
          <text x={(n('siguiente').cx + n('tokens').cx) / 2} y={yBucle + 22} textAnchor="middle" dominantBaseline="central" fontSize={18} className="t-acento-2" fontWeight={600}>
            el token elegido vuelve a entrar, y se repite
          </text>
        </g>
      ) : null}
      {modo === 'sintesis' ? (
        <g>
          <path className="arista" d={`M${n('embeddings').x} ${y0 - 18} V${y0 - 28} H${n('probabilidades').x + n('probabilidades').w} V${y0 - 18}`} />
          <text x={(n('embeddings').x + n('probabilidades').x + n('probabilidades').w) / 2} y={y0 - 44} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} className="t-acento">
            Los pesos: números aprendidos y congelados
          </text>
          <text x={n('tokenizer').cx} y={y0 - 30} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={600} className="t-suave">
            una lista fija
          </text>
        </g>
      ) : null}

      {/* Un token que recorre el ciclo: solo acompaña */}
      {!quieto && modo !== 'pesos' ? (
        <circle r={8} className="relleno-acento" filter={`url(#${idB})`}>
          <animateMotion dur="7s" repeatCount="indefinite" path={verBucle ? caminoPunto : `M${n('texto').cx} ${cy} H${n('siguiente').cx}`} />
        </circle>
      ) : null}
    </svg>
  );
}

/* Versión pequeña: abre cada parte con su pieza iluminada. resaltar: lista de ids separada por comas. */
export function Minimapa({ resaltar = '' }) {
  useFuentes();
  const idM = useIdSvg('punta-mini');
  const activos = resaltar.split(',').map((s) => s.trim()).filter(Boolean);
  const nodos = ubicar(medirNodos(true), 1200);
  const y0 = 10;
  const h = 56;
  return (
    <svg className="diagrama minimapa" viewBox="0 0 1200 76" role="img" aria-label={`Mapa del LLM. Esta parte: ${activos.join(', ')}`}>
      <defs>
        <marker id={idM} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 10 5 0 10z" className="relleno-tenue" />
        </marker>
      </defs>
      {nodos.slice(0, -1).map((a, i) => (
        <path key={a.id} className="arista" d={`M${a.x + a.w + 2} ${y0 + h / 2} H${nodos[i + 1].x - 3}`} markerEnd={`url(#${idM})`} />
      ))}
      {nodos.map((k) => {
        const on = activos.includes(k.id);
        return (
          <g key={k.id} className={`nodo ${on ? 'acento mini-activo' : 'mini-apagado'}`}>
            <rect x={k.x} y={y0} width={k.w} height={h} rx={14} />
            <text x={k.cx} y={y0 + h / 2} textAnchor="middle" dominantBaseline="central" fontSize={27} className="t-titulo">
              {k.corto}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
