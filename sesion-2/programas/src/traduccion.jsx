/* Programa 5 de «El transformer por dentro»: encoder y decoder juntos, como en Vaswani et al. (2017).
   Los tokens son reales (o200k_base). Los pesos de la cross-attention son ilustrativos.
   La figura 1 del artículo se reproduce con el permiso de Google para obras académicas (arXiv v7). */
import { ancho, color, suave, useFuentes, useIdSvg, FiltroBrillo, Pie, Ilustrativo, partirEspacio, MarcaEspacio, anchoFicha } from './comun.jsx';

const { useState, useEffect } = React;

const ES = [' El', ' agente', ' clas', 'ifica', ' el', ' reporte', '.'].map((t, i) => (i === 0 ? t.trim() : t));
const EN = ['The', ' agent', ' class', 'ifies', ' the', ' report', '.'];
/* Cross-attention ilustrativa: para cada token en inglés, a qué tokens en español mira. */
const CRUZADA = [
  [0.8, 0.1, 0, 0, 0.1, 0, 0],
  [0.1, 0.8, 0.05, 0, 0, 0.05, 0],
  [0, 0.15, 0.55, 0.3, 0, 0, 0],
  [0, 0.05, 0.3, 0.6, 0, 0.05, 0],
  [0.1, 0, 0, 0, 0.8, 0.1, 0],
  [0, 0.05, 0, 0, 0.1, 0.85, 0],
  [0, 0, 0, 0.1, 0, 0.1, 0.8],
];

/* Piezas de la figura 1, en píxeles de la imagen recortada (935 × 1362). */
const FIG_W = 935;
const FIG_H = 1362;
const PIEZAS = [
  { nombre: 'Entrada del encoder', rects: [[0, 988, 445, 1362]] },
  { nombre: 'Encoder', rects: [[0, 505, 452, 988]] },
  { nombre: 'Entrada del decoder', rects: [[478, 988, 935, 1362]] },
  { nombre: 'Decoder y cross-attention', rects: [[452, 283, 935, 988], [288, 470, 480, 700]] },
  { nombre: 'Salida', rects: [[488, 0, 800, 283]] },
];

const PIE = [
  'El transformer original (Vaswani et al., 2017) se creó para traducir. Usa encoder y decoder.',
  'Paso 1. El encoder lee toda la frase en español a la vez.',
  'Paso 2. El decoder escribe la traducción al inglés, un token a la vez.',
  'Paso 3. En cada paso, el decoder mira la salida del encoder: es la cross-attention.',
  'Paso 4. La figura 1 del artículo, pieza por pieza: entradas, encoder, decoder y salida.',
  'Paso 5. Tres familias de transformers, según las piezas que usan.',
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
  return (
    <g className={`ficha ${onClick ? 'tocable' : ''}`} style={{ transform: `translate(${x}px, ${y}px)`, opacity: opacidad }} onClick={onClick} role={onClick ? 'button' : undefined} aria-label={onClick ? `Ver a qué mira ${cuerpo}` : undefined}>
      {activa ? <rect x={-6} y={-6} width={w + 12} height={alto + 12} rx={15} fill="none" stroke={c} strokeWidth={3} className="ficha-brillo" /> : null}
      <rect width={w} height={alto} rx={11} fill={suave(c, activa ? 34 : 18)} stroke={c} strokeWidth={2} />
      {espacio ? <MarcaEspacio x={x0} y={alto / 2 + 8} px={px} /> : null}
      <text x={x0 + (espacio ? 16 : 0)} y={alto / 2} dominantBaseline="central" fontSize={px} fontWeight={600}>
        {cuerpo}
      </text>
    </g>
  );
}

export function Traduccion({ paso = 0, final, quieto, base = 'assets/' }) {
  useFuentes();
  const idB = useIdSvg('brillo-tr');
  const idC = useIdSvg('recorte-fig');
  const p = final ? 5 : paso;
  const px = 22;
  const alto = 46;
  const posES = filaFichas(ES, px, 10, 20, 700);
  const posEN = filaFichas(EN, px, 10, 20, 700);
  const yES = 52;
  const yEN = 214;

  // Paso 3: el token que mira cambia solo; el docente puede tocar uno para fijarlo.
  const [fijo, setFijo] = useState(null);
  const [ciclo, setCiclo] = useState(0);
  useEffect(() => {
    if (p < 3 || fijo !== null || quieto || final) return undefined;
    const reloj = setInterval(() => setCiclo((k) => (k + 1) % EN.length), 1400);
    return () => clearInterval(reloj);
  }, [p, fijo, quieto, final]);
  const actual = fijo !== null ? fijo : ciclo;

  // Paso 4: la figura se arma pieza por pieza.
  const [piezas, setPiezas] = useState(p >= 4 ? PIEZAS.length : 0);
  useEffect(() => {
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

  // Figura: 330 px de ancho, a la derecha.
  const escala = 476 / FIG_H;
  const fx = 830;
  const fy = 18;
  const imagen = `${base}img/vaswani_figura1.png`;

  return (
    <div className="programa-cuerpo">
      <svg className="diagrama prog-svg" viewBox="0 0 1200 500" role="img" aria-label="Encoder y decoder juntos: traducción del español al inglés y la figura 1 del transformer original">
        <defs>
          <FiltroBrillo id={idB} fuerza={4} />
          {PIEZAS.map((pz, k) => (
            <clipPath key={k} id={`${idC}-${k}`}>
              {pz.rects.map(([x1, y1, x2, y2], j) => (
                <rect key={j} x={x1} y={y1} width={x2 - x1} height={y2 - y1} />
              ))}
            </clipPath>
          ))}
        </defs>

        {/* Encoder */}
        <rect x={6} y={10} width={728} height={104} rx={18} className={`caja-bloque ${p >= 1 ? 'activa' : ''}`} />
        <text x={24} y={30} dominantBaseline="central" fontSize={16} fontWeight={700} className="t-acento">
          Encoder: lee el español
        </text>
        {ES.map((t, i) => (
          <FichaTexto key={i} t={t} x={posES[i].x} y={yES} w={posES[i].w} alto={alto} px={px} c={color(i)} opacidad={p >= 1 ? 1 : 0.35} activa={p >= 3 && CRUZADA[actual][i] >= 0.3} />
        ))}

        {/* Decoder */}
        <rect x={6} y={172} width={728} height={104} rx={18} className={`caja-bloque decoder ${p >= 2 ? 'activa' : ''}`} />
        <text x={24} y={192} dominantBaseline="central" fontSize={16} fontWeight={700} className="t-acento-2">
          Decoder: escribe en inglés
        </text>
        {EN.map((t, i) => (
          <g key={i} className={`ficha-token ${p >= 2 ? 'visto' : ''}`} style={{ transitionDelay: p === 2 && !final ? `${i * 0.45}s` : '0s' }}>
            <FichaTexto
              t={t}
              x={posEN[i].x}
              y={yEN}
              w={posEN[i].w}
              alto={alto}
              px={px}
              c={color(i)}
              activa={p >= 3 && i === actual}
              onClick={(e) => {
                setFijo((f) => (f === i ? null : i));
                if (e.currentTarget && e.currentTarget.blur) e.currentTarget.blur();
              }}
            />
          </g>
        ))}

        {/* Paso 3: cross-attention, del token en inglés a los tokens en español */}
        {p >= 3
          ? CRUZADA[actual].map((v, j) =>
              v >= 0.05 ? (
                <path
                  key={`${actual}-${j}`}
                  d={`M${posEN[actual].cx} ${yEN - 4} C ${posEN[actual].cx} ${yEN - 50}, ${posES[j].cx} ${yES + alto + 40}, ${posES[j].cx} ${yES + alto + 4}`}
                  fill="none"
                  stroke="var(--t3)"
                  strokeWidth={1.5 + v * 9}
                  strokeLinecap="round"
                  filter={`url(#${idB})`}
                  className="arco-cruzado"
                />
              ) : null
            )
          : null}
        <text x={370} y={143} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} className={`aparece-p ${p >= 3 ? 'visto' : ''}`} style={{ fill: 'var(--t3)' }}>
          cross-attention: el decoder mira lo que leyó el encoder
        </text>

        {/* Paso 5: las tres familias */}
        <g className={`aparece-p ${p >= 5 ? 'visto' : ''}`}>
          {[
            ['Familia', 'Para qué sirve', 'Ejemplo clásico'],
            ['Solo encoder', 'Entender, clasificar y buscar', 'BERT (Devlin et al., 2019)'],
            ['Solo decoder', 'Generar texto, como los LLMs de chat', 'GPT (Radford et al., 2018)'],
            ['Encoder y decoder', 'Transformar una secuencia en otra', 'Vaswani et al. (2017)', 'y T5 (Raffel et al., 2020)'],
          ].map((fila, r) => {
            const y = 296 + r * 48;
            const alto = r === 3 ? 52 : 44;
            return (
              <g key={r}>
                <rect x={6} y={y} width={728} height={alto} rx={10} className={r === 0 ? 'tabla-cabecera' : 'tabla-fila'} />
                <text x={20} y={y + alto / 2} dominantBaseline="central" fontSize={r === 0 ? 15 : 16} fontWeight={700} className={r === 0 ? 't-acento' : ''}>
                  {fila[0]}
                </text>
                <text x={196} y={y + alto / 2} dominantBaseline="central" fontSize={15} fontWeight={r === 0 ? 700 : 400} className={r === 0 ? 't-acento' : ''}>
                  {fila[1]}
                </text>
                <text x={498} y={y + (fila[3] ? 16 : 22)} dominantBaseline="central" fontSize={15} fontWeight={r === 0 ? 700 : 400} className={r === 0 ? 't-acento' : 't-suave'}>
                  {fila[2]}
                </text>
                {fila[3] ? (
                  <text x={498} y={y + 36} dominantBaseline="central" fontSize={15} className="t-suave">
                    {fila[3]}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>

        {/* Paso 4: la figura 1, pieza por pieza */}
        <g className={`aparece-p ${p >= 4 ? 'visto' : ''}`}>
          <rect x={fx - 10} y={fy - 8} width={FIG_W * escala + 20} height={FIG_H * escala + 16} rx={14} fill="#ffffff" stroke="var(--borde)" />
          <g transform={`translate(${fx} ${fy}) scale(${escala})`}>
            {PIEZAS.map((pz, k) => (
              <image key={k} href={imagen} x={0} y={0} width={FIG_W} height={FIG_H} clipPath={`url(#${idC}-${k})`} className={`pieza-figura ${k < piezas ? 'visto' : ''}`} />
            ))}
            {/* Contornos con los colores de la escena: encoder (cian), decoder (violeta) y cross-attention (rosa) */}
            <rect x={108} y={504} width={338} height={485} rx={30} fill="none" stroke="var(--t1)" strokeWidth={9} className={`aparece-p ${piezas >= 2 ? 'visto' : ''}`} />
            <rect x={491} y={286} width={328} height={703} rx={30} fill="none" stroke="var(--t2)" strokeWidth={9} className={`aparece-p ${piezas >= 4 ? 'visto' : ''}`} />
            <rect x={512} y={548} width={236} height={102} rx={16} fill="none" stroke="var(--t3)" strokeWidth={10} filter={`url(#${idB})`} className={`aparece-p ${piezas >= 4 ? 'visto' : ''}`} />
          </g>
        </g>
      </svg>
      <div className="fila-marcas">
        <Pie textos={PIE} paso={p} />
        {p >= 3 ? <Ilustrativo texto="Pesos de la cross-attention ilustrativos" /> : null}
      </div>
    </div>
  );
}
