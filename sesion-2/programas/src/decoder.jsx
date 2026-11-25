/* Animación 4 de «El transformer por dentro»: el decoder.
   - La máscara triangular es real: la esquina de 8 × 8 que guarda el archivo de GPT-2 (h.0.attn.bias).
   - Capas y tamaño de los vectores: config.json de GPT-2 y Brown et al. (2020), tabla 2.1.
   - Las probabilidades de los candidatos son ilustrativas; la temperatura se aplica con la fórmula usual. */
import { color, suave, useFuentes, useIdSvg, FiltroBrillo, Pie, Ilustrativo, miles } from './comun.jsx';
import { FRASE, posicionesFrase } from './atencion.jsx';
import { Matriz } from './encoder.jsx';
import gpt2 from '../../ejemplos/datos/gpt2.json';

/* Candidatos para el siguiente token y su puntaje (logit) ilustrativo. */
const CANDIDATOS = [
  { t: 'billete', logit: 3.0 },
  { t: 'dólar', logit: 2.2 },
  { t: 'cheque', logit: 1.8 },
  { t: 'euro', logit: 1.3 },
  { t: 'peso', logit: 0.9 },
];
function probabilidades(temperatura) {
  const e = CANDIDATOS.map((c) => Math.exp(c.logit / temperatura));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}
const BAJA = probabilidades(0.5);
const ALTA = probabilidades(1.5);

const PIE = [
  'El decoder es la mitad que escribe. Los LLMs de chat solo usan esta mitad.',
  'Paso 1. El decoder genera un token a la vez, siempre al final de lo que ya hay.',
  'Paso 2. Cada token solo mira hacia atrás: el cuadrado del encoder se vuelve un triángulo.',
  'Paso 3. Después de la atención, cada vector pasa por su capa feed-forward.',
  'Paso 4. El bloque de atención y feed-forward se repite: 12 veces en GPT-2 pequeño.',
  'Paso 5. El último vector da una probabilidad para cada token. Se elige uno y vuelve a entrar.',
  'Paso 6. Para qué sirve: generar texto. GPT es decoder-only, como los LLMs de chat.',
];

export function Decoder({ paso = 0, final, quieto }) {
  useFuentes();
  const idB = useIdSvg('brillo-dec');
  const p = final ? 6 : paso;
  const pxF = 22;
  const conElegido = [...FRASE, 'billete'];
  const pos = posicionesFrase(conElegido, pxF, 10, 860, 340);
  const yF = 452;
  const altoF = 46;
  const mascara = gpt2.mascara_causal.esquina;
  const bloques = [0, 1, 2];
  const yBloque = (k) => 352 - k * 92;

  return (
    <div className="programa-cuerpo">
      <svg className="diagrama prog-svg" viewBox="0 0 1200 510" role="img" aria-label="El decoder: genera un token a la vez, mira solo hacia atrás y repite sus bloques">
        <defs>
          <FiltroBrillo id={idB} fuerza={5} />
        </defs>

        {/* Paso 6: para qué sirve */}
        <g className={`aparece-p ${p >= 6 ? 'visto' : ''}`}>
          <rect x={340} y={2} width={856} height={66} rx={16} fill={suave('var(--t5)', 16)} stroke="var(--t5)" strokeWidth={2} />
          <text x={768} y={24} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={700}>
            Sirve para generar texto. GPT es decoder-only (Radford et al., 2018).
          </text>
          <text x={768} y={50} textAnchor="middle" dominantBaseline="central" fontSize={14} className="t-suave">
            Gemini: «Transformer decoders» (Google, 2023). Claude: Anthropic no publica su arquitectura actual.
          </text>
        </g>

        {/* Paso 2: la matriz triangular, con la máscara real de GPT-2 */}
        <text x={160} y={84} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} className={`aparece-p ${p >= 2 ? 'visto' : ''}`}>
          Solo mira hacia atrás
        </text>
        <Matriz x={4} y={150} celda={30} causal visible={p >= 2} mascara={mascara} final={final} />
        <text x={160} y={410} textAnchor="middle" dominantBaseline="central" fontSize={13} className={`t-suave aparece-p ${p >= 2 ? 'visto' : ''}`}>
          1 = puede mirar · 0 = no. Así lo guarda
        </text>
        <text x={160} y={428} textAnchor="middle" dominantBaseline="central" fontSize={13} className={`t-suave aparece-p ${p >= 2 ? 'visto' : ''}`}>
          el archivo de GPT-2 (dato real)
        </text>

        {/* La pila de bloques: atención y feed-forward, repetidos */}
        {bloques.map((k) => {
          const y = yBloque(k);
          const activo = p >= 4 || (k === 0 && p >= 3);
          return (
            <g key={k} className={`aparece-p ${p >= 3 && (k === 0 || p >= 4) ? 'visto' : ''}`} style={{ transitionDelay: p >= 4 && !final ? `${k * 0.2}s` : '0s' }}>
              <path d={`M440 ${y} l26 -18 h300 l-26 18 z`} className="cara-bloque arriba" />
              <path d={`M740 ${y} l26 -18 v60 l-26 18 z`} className="cara-bloque lado" />
              <rect x={440} y={y} width={300} height={60} className="cara-bloque frente" />
              <rect x={452} y={y + 12} width={128} height={36} rx={9} fill={suave('var(--t1)', 22)} stroke="var(--t1)" strokeWidth={1.5} />
              <text x={516} y={y + 30} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={600}>
                Atención
              </text>
              <rect x={592} y={y + 12} width={136} height={36} rx={9} fill={suave('var(--t4)', activo ? 30 : 16)} stroke="var(--t4)" strokeWidth={k === 0 && p === 3 ? 3 : 1.5} filter={k === 0 && p === 3 ? `url(#${idB})` : undefined} />
              <text x={660} y={y + 30} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={600}>
                Feed-forward
              </text>
            </g>
          );
        })}
        <g className={`aparece-p ${p >= 4 ? 'visto' : ''}`}>
          <text x={782} y={196} dominantBaseline="central" fontSize={30} fontWeight={700} className="t-acento-2 t-titulo">
            × 12
          </text>
          <text x={782} y={226} dominantBaseline="central" fontSize={14} className="t-suave">
            GPT-2 pequeño
          </text>
          <text x={782} y={244} dominantBaseline="central" fontSize={14} className="t-suave">
            vectores de {gpt2.tabla_embeddings.columnas}
          </text>
          <text x={782} y={274} dominantBaseline="central" fontSize={14} className="t-suave">
            GPT-3: × 96
          </text>
          <text x={782} y={292} dominantBaseline="central" fontSize={14} className="t-suave">
            vectores de {miles(12288)}
          </text>
          {!quieto ? <rect className="vector-sube" x={576} y={400} width={28} height={12} rx={3} filter={`url(#${idB})`} /> : null}
        </g>

        {/* Paso 3: el feed-forward agrega información guardada en los pesos */}
        <g className={`aparece-p ${p >= 3 ? 'visto' : ''}`}>
          <rect x={924} y={84} width={272} height={124} rx={16} className="panel-fondo" />
          <text x={940} y={108} dominantBaseline="central" fontSize={16} fontWeight={700} style={{ fill: 'var(--t4)' }}>
            Feed-forward
          </text>
          <text x={940} y={134} dominantBaseline="central" fontSize={14}>
            Agrega información guardada en
          </text>
          <text x={940} y={152} dominantBaseline="central" fontSize={14}>
            los pesos. En GPT-2, ayuda a
          </text>
          <text x={940} y={170} dominantBaseline="central" fontSize={14}>
            completar que Varsovia es la
          </text>
          <text x={940} y={188} dominantBaseline="central" fontSize={14}>
            capital de Polonia (Lee y Trott).
          </text>
        </g>

        {/* Paso 5: probabilidades y temperatura */}
        <g className={`aparece-p ${p >= 5 ? 'visto' : ''}`}>
          <text x={924} y={232} dominantBaseline="central" fontSize={16} fontWeight={700}>
            Siguiente token después de «un»
          </text>
          <rect x={924} y={248} width={12} height={12} rx={3} style={{ fill: 'var(--t1)' }} />
          <text x={942} y={254} dominantBaseline="central" fontSize={13} className="t-suave">
            temperatura baja
          </text>
          <rect x={1060} y={248} width={12} height={12} rx={3} style={{ fill: 'var(--t2)' }} />
          <text x={1078} y={254} dominantBaseline="central" fontSize={13} className="t-suave">
            alta
          </text>
          {CANDIDATOS.map((c, k) => {
            const y = 278 + k * 30;
            return (
              <g key={c.t}>
                <text x={990} y={y + 9} textAnchor="end" dominantBaseline="central" fontSize={15} fontWeight={k === 0 ? 700 : 500}>
                  {c.t}
                </text>
                <rect x={998} y={y} width={Math.max(2, BAJA[k] * 190)} height={9} rx={3} style={{ fill: 'var(--t1)' }} />
                <rect x={998} y={y + 11} width={Math.max(2, ALTA[k] * 190)} height={9} rx={3} style={{ fill: 'var(--t2)' }} />
                <text x={1004 + Math.max(BAJA[k], ALTA[k]) * 190} y={y + 9} dominantBaseline="central" fontSize={12} className="t-suave">
                  {Math.round(BAJA[k] * 100)} · {Math.round(ALTA[k] * 100)} %
                </text>
              </g>
            );
          })}
          <path d={`M1192 290 C 1204 360, 1200 432, ${pos[8].x + pos[8].w - 8} ${yF - 3}`} className="arista acento-2 punteada" />
        </g>

        {/* La frase: un token a la vez; en el paso 5 entra el elegido */}
        {conElegido.map((w, i) => {
          const elegido = i === 8;
          const visible = elegido ? p >= 5 : p >= 1 || i === 0;
          return (
            <g key={i} className={`ficha-token ${visible ? 'visto' : ''}`} style={{ transform: `translate(${pos[i].x}px, ${yF}px)`, transitionDelay: visible && p === 1 && !final ? `${i * 0.35}s` : '0s' }}>
              <rect width={pos[i].w} height={altoF} rx={11} fill={suave(elegido ? 'var(--t5)' : color(i), elegido ? 30 : 18)} stroke={elegido ? 'var(--t5)' : color(i)} strokeWidth={elegido ? 3 : 2} />
              <text x={pos[i].w / 2} y={altoF / 2} textAnchor="middle" dominantBaseline="central" fontSize={pxF} fontWeight={600}>
                {w}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="fila-marcas">
        <Pie textos={PIE} paso={p} />
        {p >= 5 ? <Ilustrativo texto="Probabilidades ilustrativas" /> : null}
      </div>
    </div>
  );
}
