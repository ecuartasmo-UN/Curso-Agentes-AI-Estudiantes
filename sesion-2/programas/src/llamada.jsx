/* Parte 5 del bloque 2.1: una llamada por API.
   Los mensajes entran como tokens y la respuesta vuelve con su conteo de tokens.
   Los conteos son ilustrativos: dependen del tokenizer de cada modelo. */
import { color, Pie, Ilustrativo } from './comun.jsx';

const PIE = [
  'Una llamada por API: tu programa envía mensajes al modelo y recibe su respuesta.',
  'Paso 1. Los mensajes de sistema y de usuario pasan por el tokenizer y entran como tokens.',
  'Paso 2. El modelo genera los tokens de salida, uno a la vez.',
  'Paso 3. La respuesta vuelve con su conteo: tokens de entrada y de salida. Con eso se cobra.',
];

/* Tokens reales de o200k_base (tiktoken 0.14.0). Cada API cuenta con su propio tokenizer y suma el formato de los mensajes. */
const ENTRADA = ['Res', 'pon', 'des', ' preguntas', ' sobre', ' Python', ' en', ' una', ' frase', '.', '¿Qué', ' versión', ' de', ' Python', ' exige', ' lang', 'chain', ' ', '1', '.', '5', '.', '0', '?'];
const SALIDA = ['lang', 'chain', ' ', '1', '.', '5', '.', '0', ' exige', ' Python', ' ', '3', '.', '11', ' o', ' posterior', '.'];

function Fichita({ t, c, retraso, salida }) {
  const espacio = t.startsWith(' ');
  const cuerpo = espacio ? t.slice(1) : t;
  return (
    <span className={`fichita ${salida ? 'salida' : ''}`} style={{ '--c': c, animationDelay: `${retraso}s` }}>
      {espacio ? <i className="esp-mini" aria-label="espacio" /> : null}
      {cuerpo === '' ? '\u00a0' : cuerpo}
    </span>
  );
}

export function Llamada({ paso = 0, final }) {
  const p = final ? 3 : paso;
  return (
    <div className="programa-cuerpo">
      <div className="llamada">
        <div className="mensajes">
          <div className="mensaje sistema">
            <span className="rol">sistema</span>
            Respondes preguntas sobre Python en una frase.
          </div>
          <div className="mensaje usuario">
            <span className="rol">usuario</span>
            ¿Qué versión de Python exige langchain 1.5.0?
          </div>
        </div>
        <div className={`flujo-entrada aparece-p ${p >= 1 ? 'visto' : ''}`}>
          <span className="etapa">tokenizer</span>
          <div className="fichitas">
            {ENTRADA.map((t, i) => (
              <Fichita key={i} t={t} c={color(i)} retraso={i * 0.06} />
            ))}
          </div>
        </div>
        <div className={`caja-modelo ${p >= 1 ? 'activa' : ''} ${p === 2 ? 'trabajando' : ''}`}>
          <b>Modelo</b>
          <small>por API</small>
        </div>
        <div className={`flujo-salida aparece-p ${p >= 2 ? 'visto' : ''}`}>
          <div className="fichitas">
            {SALIDA.map((t, i) => (
              <Fichita key={i} t={t} c="var(--t5)" retraso={0.3 + i * 0.22} salida />
            ))}
          </div>
        </div>
        <div className={`respuesta aparece-p ${p >= 3 ? 'visto' : ''}`}>
          <span className="rol">respuesta</span>
          <p>langchain 1.5.0 exige Python 3.11 o posterior.</p>
          <div className="conteo">
            <span>
              tokens de entrada: <b>{ENTRADA.length}</b>
            </span>
            <span>
              tokens de salida: <b>{SALIDA.length}</b>
            </span>
          </div>
        </div>
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE} paso={p} />
        {p >= 1 ? <Ilustrativo texto="Tokens de o200k_base: cada API cuenta distinto" /> : null}
      </div>
    </div>
  );
}
