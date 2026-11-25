/* Programas del bloque 3.1 sobre el prompt:
   - AppApi: lo que agrega una app de chat y lo que escribes tú por API.
   - CicloTrabajo: el orden del trabajo, con los casos fijos.
   - ArmarPrompt: el prompt que se arma pieza por pieza, con sus tokens reales. Con interactivo, es «El taller del prompt».
   - DemoTokens: la demostración en vivo de los tokens y el costo de un prompt. */
import { useFuentes, useIdSvg, Particulas, Pie, Ilustrativo, ver, miles } from './comun.jsx';
import { PASOS_PROMPT, RESPUESTAS_PROMPT, COLOR_PIEZA, TICKET, REGISTRO, CAMPOS, HAIKU, TOK, usd } from './datos.jsx';

const { useState, useMemo } = React;

/* ---------------------------------------------------------------- Lo que agrega la app */
const PIE_APP = [
  'En una app de chat escribes un mensaje. Parece que solo eso llega al modelo.',
  'Paso 1. La app agrega piezas que no ves: sus instrucciones, la conversación anterior y sus herramientas.',
  'Paso 2. Por API llega solo lo que tu programa envía. Las piezas de la app desaparecen.',
  'Paso 3. Quedan dos huecos que escribes tú: la instrucción y el formato de la salida.',
];

export function AppApi({ paso = 0, final, quieto, tokensSistema }) {
  useFuentes();
  const idP = useIdSvg('punta-app');
  const p = final ? 3 : paso;
  const api = p >= 2;
  const piezas = [
    { id: 'sistema', y: 92, h: 78, c: 'var(--t6)', titulo: 'Prompt de sistema del proveedor', sub: tokensSistema ? `${miles(tokensSistema)} tokens de instrucciones que no ves` : 'Miles de tokens de instrucciones que no ves' },
    { id: 'historia', y: 184, h: 62, c: 'var(--t2)', titulo: 'La conversación anterior', sub: 'Los mensajes de antes, que la app guarda' },
    { id: 'herramientas', y: 260, h: 62, c: 'var(--t4)', titulo: 'Herramientas', sub: 'Por ejemplo, la búsqueda web' },
  ];
  const huecos = [
    { y: 92, h: 78, titulo: 'Tu instrucción', sub: 'Parte 3: la anatomía de un prompt' },
    { y: 260, h: 62, titulo: 'El formato de la salida', sub: 'Parte 4: de texto libre a JSON' },
  ];
  return (
    <div className="programa-cuerpo">
      <svg className="diagrama app-api" viewBox="0 0 1160 440" role="img" aria-label="Lo que agrega una app de chat frente a lo que envía tu programa por API">
        <defs>
          <marker id={idP} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 10 5 0 10z" className="relleno-acento" />
          </marker>
        </defs>
        <rect x={24} y={22} width={740} height={400} rx={26} className={`marco-app ${api ? 'es-api' : ''}`} />
        <text x={56} y={58} dominantBaseline="central" fontSize={24} className="t-titulo t-acento">
          {api ? 'Tu programa, por API' : 'App de chat'}
        </text>
        {piezas.map((k) => (
          <g key={k.id} className={`pieza-app ${p >= 1 ? 'visto' : ''} ${api ? 'fantasma' : ''} ${p >= 3 && k.id !== 'historia' ? 'reemplazada' : ''}`} style={{ '--c': k.c }}>
            <rect x={56} y={k.y} width={676} height={k.h} rx={16} />
            <text x={80} y={k.y + k.h / 2 - 12} dominantBaseline="central" fontSize={21} fontWeight={700}>
              {k.titulo}
            </text>
            <text x={80} y={k.y + k.h / 2 + 14} dominantBaseline="central" fontSize={17} className="t-suave">
              {k.sub}
            </text>
            {!api ? (
              <text x={712} y={k.y + 22} textAnchor="end" dominantBaseline="central" fontSize={14} fontWeight={700} className="t-tenue">
                LA AGREGA LA APP
              </text>
            ) : null}
          </g>
        ))}
        {huecos.map((k) => (
          <g key={k.titulo} className={`hueco-api ${p >= 3 ? 'visto' : ''}`}>
            <rect x={56} y={k.y} width={676} height={k.h} rx={16} />
            <text x={80} y={k.y + k.h / 2 - 12} dominantBaseline="central" fontSize={21} fontWeight={700} className="t-acento">
              {k.titulo}
            </text>
            <text x={80} y={k.y + k.h / 2 + 14} dominantBaseline="central" fontSize={17} className="t-suave">
              {k.sub}
            </text>
          </g>
        ))}
        <g className="pieza-app visto mensaje-usuario" style={{ '--c': 'var(--t3)' }}>
          <rect x={56} y={336} width={676} height={70} rx={16} />
          <text x={80} y={358} dominantBaseline="central" fontSize={16} fontWeight={700} className="t-tenue">
            TU MENSAJE
          </text>
          <text x={80} y={384} dominantBaseline="central" fontSize={20}>
            ¿Por qué se cierra la app al subir una foto?
          </text>
        </g>
        <path className="arista acento" d="M766 222 H 872" markerEnd={`url(#${idP})`} />
        <Particulas d="M766 222 H 872" n={2} c="var(--acento)" dur={1.6} r={5} quieto={quieto} />
        <g className="nodo acento">
          <rect x={876} y={164} width={250} height={116} rx={22} />
          <text x={1001} y={207} textAnchor="middle" dominantBaseline="central" fontSize={26} className="t-titulo">
            Modelo
          </text>
          <text x={1001} y={242} textAnchor="middle" dominantBaseline="central" fontSize={17} className="t-suave">
            Solo ve lo que le llega
          </text>
        </g>
      </svg>
      <Pie textos={PIE_APP} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- El orden del trabajo */
const PIE_CICLO = [
  'Antes de escribir el prompt, hay un orden de trabajo.',
  'Paso 1. Primero los casos y el criterio de éxito: qué entra y qué debe salir.',
  'Paso 2. Después, la primera versión del prompt.',
  'Paso 3. Corres los casos con ese prompt.',
  'Paso 4. Mides cuántos pasan el criterio.',
  'Paso 5. Ajustas el prompt y vuelves a correr. El prompt cambia en cada vuelta; los casos no.',
];

const NODOS_CICLO = [
  { id: 'casos', x: 70, y: 176, w: 240, h: 84, titulo: 'Casos y criterio', sub: 'Fijos: no cambian', clase: 'exito' },
  { id: 'prompt', x: 380, y: 40, w: 220, h: 84, titulo: 'Prompt', sub: 'v1, v2, v3…', clase: 'acento' },
  { id: 'correr', x: 690, y: 40, w: 200, h: 84, titulo: 'Correr', sub: 'Los mismos casos', clase: 'acento-2' },
  { id: 'medir', x: 880, y: 196, w: 200, h: 84, titulo: 'Medir', sub: '¿Cuántos pasan?', clase: 'acento-2' },
  { id: 'ajustar', x: 470, y: 330, w: 260, h: 84, titulo: 'Ajustar el prompt', sub: 'Un cambio a la vez', clase: 'acento' },
];

export function CicloTrabajo({ paso = 0, final, quieto }) {
  useFuentes();
  const idP = useIdSvg('punta-ciclo');
  const p = final ? 5 : paso;
  const n = Object.fromEntries(NODOS_CICLO.map((k) => [k.id, k]));
  const flechas = [
    { id: 'a1', paso: 2, d: `M${n.casos.x + n.casos.w} ${n.casos.y + 30} C ${n.casos.x + n.casos.w + 40} ${n.casos.y + 30}, ${n.prompt.x - 40} ${n.prompt.y + 42}, ${n.prompt.x - 2} ${n.prompt.y + 42}` },
    { id: 'a2', paso: 3, d: `M${n.prompt.x + n.prompt.w} ${n.prompt.y + 42} H ${n.correr.x - 4}` },
    { id: 'a3', paso: 4, d: `M${n.correr.x + n.correr.w} ${n.correr.y + 42} C ${n.correr.x + n.correr.w + 60} ${n.correr.y + 42}, ${n.medir.x + 100} ${n.medir.y - 60}, ${n.medir.x + 100} ${n.medir.y - 4}` },
    { id: 'a4', paso: 5, d: `M${n.medir.x + 100} ${n.medir.y + n.medir.h} C ${n.medir.x + 100} ${n.medir.y + n.medir.h + 70}, ${n.ajustar.x + n.ajustar.w + 80} ${n.ajustar.y + 42}, ${n.ajustar.x + n.ajustar.w + 4} ${n.ajustar.y + 42}` },
    { id: 'a5', paso: 5, d: `M${n.ajustar.x} ${n.ajustar.y + 42} C ${n.ajustar.x - 70} ${n.ajustar.y + 42}, ${n.prompt.x + 110} ${n.prompt.y + n.prompt.h + 90}, ${n.prompt.x + 110} ${n.prompt.y + n.prompt.h + 4}` },
  ];
  return (
    <div className="programa-cuerpo">
      <svg className="diagrama ciclo-trabajo" viewBox="0 0 1160 440" role="img" aria-label="El orden del trabajo: casos y criterio, prompt, correr, medir y ajustar">
        <defs>
          <marker id={idP} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 10 5 0 10z" className="relleno-tenue" />
          </marker>
        </defs>
        {flechas.map((f) => (
          <g key={f.id} className={ver(p >= f.paso)}>
            <path className="arista" d={f.d} markerEnd={`url(#${idP})`} />
            {p >= 5 && f.paso === 5 ? <Particulas d={f.d} n={1} c="var(--acento)" dur={2.2} r={5} quieto={quieto} /> : null}
          </g>
        ))}
        {NODOS_CICLO.map((k, i) => (
          <g key={k.id} className={`nodo ${k.clase} ${ver(p >= i + 1)}`}>
            <rect x={k.x} y={k.y} width={k.w} height={k.h} rx={18} />
            <text x={k.x + k.w / 2} y={k.y + 32} textAnchor="middle" dominantBaseline="central" fontSize={23} className="t-titulo">
              {k.id === 'prompt' && p >= 5 ? 'Prompt v2' : k.titulo}
            </text>
            <text x={k.x + k.w / 2} y={k.y + 60} textAnchor="middle" dominantBaseline="central" fontSize={16} className="t-suave">
              {k.sub}
            </text>
          </g>
        ))}
        <g className={ver(p >= 5)}>
          <rect x={64} y={300} width={300} height={44} rx={22} className="pastilla" />
          <text x={214} y={322} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} className="t-acento">
            Los casos son la prueba
          </text>
        </g>
      </svg>
      <Pie textos={PIE_CICLO} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- Armar un prompt */
const PIE_ARMAR = [
  'Una instrucción vaga da una respuesta vaga. El contador muestra los tokens del prompt.',
  'Paso 1. La instrucción clara dice qué hacer. La respuesta ya trae una categoría.',
  'Paso 2. El contexto dice para qué sirve y qué es prioridad alta. Ahora trae la prioridad.',
  'Paso 3. Tres ejemplos muestran la forma. El modelo los imita.',
  'Paso 4. El formato de salida pide un JSON. Ya se parece al registro esperado.',
  'Paso 5. El prompt completo, con cada pieza de su color. Cada pieza se paga en todas las llamadas.',
];

const NOMBRE_PIEZA = { vaga: 'Instrucción vaga', clara: 'Instrucción clara', contexto: 'Contexto', ejemplos: 'Tres ejemplos', formato: 'Formato de salida' };

function piezasDelPaso(p) {
  if (p === 0) return ['vaga'];
  return ['clara', 'contexto', 'ejemplos', 'formato'].slice(0, Math.min(p, 4));
}

function textoPieza(id) {
  return PASOS_PROMPT.find((k) => k.id === id).texto;
}

/* Cuenta tokens en vivo con gpt-tokenizer si está cargado (página sola); si no, null. */
function contarEnVivo(texto) {
  const g = window.GPTTokenizer_o200k_base;
  return g && g.encode ? g.encode(texto).length : null;
}

function RegistroJson({ registro, claseFila }) {
  return (
    <pre className="json-registro">
      {'{\n'}
      {CAMPOS.map((c, i) => (
        <span key={c} className={claseFila ? claseFila(c) : ''}>
          {'  '}
          <span className="j-clave">"{c}"</span>: {registro[c] === null ? <span className="j-nulo">null</span> : <span className="j-texto">"{registro[c]}"</span>}
          {i < CAMPOS.length - 1 ? ',' : ''}
          {'\n'}
        </span>
      ))}
      {'}'}
    </pre>
  );
}

function respuestaDe(ids) {
  if (ids.includes('formato')) return { json: true };
  if (ids.includes('ejemplos')) return { texto: RESPUESTAS_PROMPT[3] };
  if (ids.includes('contexto')) return { texto: RESPUESTAS_PROMPT[2] };
  if (ids.includes('clara')) return { texto: RESPUESTAS_PROMPT[1] };
  return { texto: RESPUESTAS_PROMPT[0] };
}

export function ArmarPrompt({ paso = 0, final, interactivo }) {
  useFuentes();
  const [elegidas, setElegidas] = useState({ clara: true, contexto: true, ejemplos: false, formato: false });
  const p = final ? 5 : paso;
  let ids;
  if (interactivo) {
    ids = ['clara', 'contexto', 'ejemplos', 'formato'].filter((k) => elegidas[k]);
    if (!ids.includes('clara')) ids = ['vaga', ...ids];
  } else ids = piezasDelPaso(p);
  const prompt = [...ids.map(textoPieza), `<ticket>\n${TICKET}\n</ticket>`].join('\n\n');
  const vivo = interactivo ? contarEnVivo(prompt) : null;
  const precalculado = interactivo ? null : PASOS_PROMPT[Math.min(p, 4)].tokens_prompt;
  const tokens = vivo != null ? vivo : precalculado;
  const resp = respuestaDe(ids);
  const completo = !interactivo && p >= 5;
  return (
    <div className="programa-cuerpo">
      {interactivo ? (
        <div className="taller-controles" role="group" aria-label="Piezas del prompt">
          {['clara', 'contexto', 'ejemplos', 'formato'].map((k) => (
            <label key={k} className="interruptor" style={{ '--c': COLOR_PIEZA[k] }}>
              <input type="checkbox" checked={!!elegidas[k]} onChange={(e) => setElegidas((s) => ({ ...s, [k]: e.target.checked }))} />
              <span>{NOMBRE_PIEZA[k]}</span>
            </label>
          ))}
        </div>
      ) : null}
      <div className={`armar-prompt ${completo ? 'completo' : ''}`}>
        <div className="ap-prompt">
          <div className="ap-cabecera">El prompt</div>
          {ids.map((id) => (
            <div key={id} className="ap-pieza" style={{ '--c': COLOR_PIEZA[id] }}>
              <span className="ap-rotulo">{NOMBRE_PIEZA[id]}</span>
              <p>{textoPieza(id)}</p>
            </div>
          ))}
          <div className="ap-pieza ap-ticket" style={{ '--c': COLOR_PIEZA.ticket }}>
            <span className="ap-rotulo">El ticket</span>
            <p className="ap-una-linea">{`<ticket> ${TICKET.split('. ')[0]}… </ticket>`}</p>
          </div>
        </div>
        <div className="ap-lado">
          <div className="ap-contador">
            <b>{tokens != null ? miles(tokens) : '…'}</b>
            <span>tokens de entrada</span>
            <small>{vivo != null ? 'Contados en vivo con o200k_base' : `Contados con o200k_base (${TOK.biblioteca})`}</small>
          </div>
          <div className={`ap-respuesta ${resp.json ? 'es-json' : ''}`}>
            <div className="ap-resp-cabecera">
              <span className="ap-rotulo">La respuesta</span>
              <Ilustrativo texto="Respuesta ilustrativa" />
            </div>
            {resp.json ? <RegistroJson registro={REGISTRO} /> : <p>{resp.texto}</p>}
            {completo ? <div className="ap-sello">≈ el registro esperado ✓</div> : null}
          </div>
        </div>
      </div>
      {interactivo ? (
        <p className="pie-programa">Prende y apaga las piezas. Los tokens se cuentan en vivo; las respuestas son ilustrativas.</p>
      ) : (
        <Pie textos={PIE_ARMAR} paso={p} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Demostración en vivo: tokens y costo de un prompt */
const PROMPT_DEMO = `${textoPieza('clara')}\n\n${textoPieza('contexto')}\n\n<ticket>\n${TICKET}\n</ticket>`;

export function DemoTokens() {
  const [texto, setTexto] = useState(PROMPT_DEMO);
  const hay = !!(window.GPTTokenizer_o200k_base && window.GPTTokenizer_o200k_base.encode);
  const n = useMemo(() => (hay ? window.GPTTokenizer_o200k_base.encode(texto).length : 0), [texto, hay]);
  const mil = (1000 * n * HAIKU.entrada) / 1e6;
  return (
    <div className="programa-cuerpo demo-tokens">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        spellCheck={false}
        aria-label="Escribe o pega un prompt"
      />
      <div className="demo-cifras">
        <div className="tarjeta acento">
          <b>{hay ? miles(n) : '—'}</b>
          <span>tokens de entrada, con o200k_base</span>
        </div>
        <div className="tarjeta acento-2">
          <b>{hay ? usd(mil, 4) : '—'}</b>
          <span>por mil llamadas con este prompt, solo la entrada de Claude Haiku 5.5</span>
        </div>
        <p className="chico texto-suave">Claude cuenta con su propio tokenizer: la cifra real puede ser distinta.</p>
      </div>
    </div>
  );
}
