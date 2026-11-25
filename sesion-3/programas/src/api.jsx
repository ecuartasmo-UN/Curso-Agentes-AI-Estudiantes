/* Programas del bloque 3.2 sobre la API:
   - Conversacion: la API no recuerda; cada llamada reenvía toda la conversación. Tokens reales.
   - Tablero: cinco controles de una llamada y su efecto.
   - Variantes: la cuadrícula de las cuatro variantes del Laboratorio 3B.
   - CuentaPrevia: la cuenta antes de correr: tokens por llamada × llamadas × precio. */
import { useFuentes, Pie, Ilustrativo, ver, miles } from './comun.jsx';
import { CONVERSACION, VARIANTES, HAIKU, costo, usd } from './datos.jsx';

/* ---------------------------------------------------------------- La conversación se reenvía */
const PIE_CONV = [
  'Turno 1: el programa envía el prompt de sistema y la primera pregunta. El modelo responde.',
  'Turno 2: la API no recuerda. El programa reenvía todo lo anterior y agrega la pregunta nueva.',
  'Turno 3: la pila crece. Cada llamada lleva la conversación completa.',
  'Cada llamada paga otra vez toda la historia. La llamada 4 envía casi cuatro veces los tokens de la 1.',
];

const NOMBRE_ROL = { system: 'Sistema', user: 'Usuario', assistant: 'Asistente' };

export function Conversacion({ paso = 0, final }) {
  useFuentes();
  const p = final ? 3 : paso;
  const llamadas = CONVERSACION.llamadas;
  const llamada = Math.min(p, 2) + 1; // turnos 1 a 3 en la pila
  // Mensajes enviados en esta llamada: sistema + turnos hasta el usuario de esta llamada.
  const turnos = CONVERSACION.turnos.slice(0, 2 * llamada - 1);
  const respuesta = CONVERSACION.turnos[2 * llamada - 1];
  const maximo = Math.max(...llamadas.map((l) => l.tokens_entrada));
  const visibles = p >= 3 ? llamadas.length : llamada;
  return (
    <div className="programa-cuerpo">
      <div className="conversacion">
        <div className="cv-pila">
          <div className="cv-cabecera">Llamada {llamada}: lo que envía el programa</div>
          <div className={`cv-mensaje rol-system ${llamada > 1 ? 'reenviado' : 'nuevo'}`}>
            <span className="cv-rol">
              Sistema<em>{llamada > 1 ? ' · se reenvía' : ' · nuevo'}</em>
            </span>
            <p>{CONVERSACION.sistema.texto}</p>
          </div>
          {turnos.map((t, i) => {
            const nuevo = i === turnos.length - 1;
            return (
              <div key={i} className={`cv-mensaje rol-${t.rol} ${nuevo ? 'nuevo' : 'reenviado'}`}>
                <span className="cv-rol">
                  {NOMBRE_ROL[t.rol]}
                  {!nuevo ? <em> · se reenvía</em> : <em> · nuevo</em>}
                </span>
                <p>{t.texto}</p>
              </div>
            );
          })}
          {respuesta ? (
            <div className="cv-respuesta">
              <span className="cv-rol">
                Respuesta del modelo <Ilustrativo texto="Ilustrativa" />
              </span>
              <p>{respuesta.texto}</p>
            </div>
          ) : null}
        </div>
        <div className="cv-grafico">
          <div className="cv-cabecera">Tokens de entrada de cada llamada</div>
          {llamadas.map((l, i) => (
            <div key={l.turno} className={`cv-barra-fila ${ver(i < visibles)}`}>
              <span>Llamada {l.turno}</span>
              <div className="cv-pista">
                <div className="cv-barra" style={{ width: `${(100 * l.tokens_entrada) / maximo}%` }} />
              </div>
              <b>{miles(l.tokens_entrada)}</b>
            </div>
          ))}
          <div className={`cv-nota ${ver(p >= 3)}`}>
            <p>
              Mil conversaciones de cuatro turnos con Claude Haiku 5.5: <b>{usd(llamadas.reduce((s, l) => s + l.costo_por_mil_llamadas_haiku, 0), 4)}</b>.
            </p>
            <small>Tokens reales del texto de los mensajes, con o200k_base. Cada API agrega unos pocos tokens por mensaje. Precios del Anexo G.1.</small>
          </div>
        </div>
      </div>
      <Pie textos={PIE_CONV} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- El tablero de una llamada */
const PIE_TABLERO = [
  'Una llamada tiene controles además de los mensajes. Estos cinco son los que más importan.',
  'Control 1. El máximo de tokens de salida. Si el modelo lo alcanza, la respuesta se corta.',
  'Control 2. Las secuencias de parada: un texto que termina la respuesta.',
  'Control 3. La temperatura. Con los modelos del curso, ese control queda apagado.',
  'Control 4. El esfuerzo de razonamiento: cuánto piensa el modelo antes de responder. Esos tokens se cobran.',
  'Control 5. El tiempo de espera y los reintentos: una llamada puede fallar o tardar.',
];

const CONTROLES = [
  { id: 'max', nombre: 'Máximo de tokens de salida', claude: 'max_tokens', gemini: 'max_tokens' },
  { id: 'stop', nombre: 'Secuencias de parada', claude: 'stop', gemini: 'stop' },
  { id: 'temp', nombre: 'Temperatura', claude: 'temperature', gemini: 'temperature', apagado: true },
  { id: 'razon', nombre: 'Esfuerzo de razonamiento', claude: 'effort', gemini: 'thinking_level' },
  { id: 'tiempo', nombre: 'Tiempo de espera y reintentos', claude: 'timeout · max_retries', gemini: 'timeout · max_retries' },
];

function Efecto({ id }) {
  if (id === 'max')
    return (
      <div className="tb-efecto">
        <pre className="json-registro corto">
          {'{"categoria": "fallo de la app",\n "prioridad": "alta",\n "resumen": "La app se cierra al su'}
          <span className="tb-tijera">✂</span>
        </pre>
        <p>
          La respuesta se corta y el JSON queda incompleto: <b>no valida</b>.
        </p>
        <p className="chico">
          Claude lo informa con <code>stop_reason: "max_tokens"</code>. Gemini, con <code>finish_reason: "MAX_TOKENS"</code>.
        </p>
        <p className="chico">En los dos, el razonamiento cuenta dentro de ese máximo.</p>
      </div>
    );
  if (id === 'stop')
    return (
      <div className="tb-efecto">
        <pre className="json-registro corto">{'Categoría: fallo de la app\nPrioridad: alta'}<span className="tb-parada"> ⏹</span></pre>
        <p>
          Con la secuencia <code>###</code>, la respuesta termina al llegar a ella. Sirve para cortar a tiempo una respuesta de texto.
        </p>
        <p className="chico">Gemini no incluye la secuencia en el texto. Claude informa cuál fue, en <code>stop_sequence</code>.</p>
      </div>
    );
  if (id === 'temp')
    return (
      <div className="tb-efecto">
        <p className="tb-candado">🔒 Control apagado</p>
        <p>Claude Haiku 5.5 rechaza <code>temperature</code>, <code>top_p</code> y <code>top_k</code>.</p>
        <p>En Gemini 3.5 Flash-Lite son obsoletos: la API los ignora.</p>
        <p className="chico">LangChain no envía la temperatura a Gemini 3 si no la fijas. A Gemini 2.5 le envía 0.7.</p>
      </div>
    );
  if (id === 'razon')
    return (
      <div className="tb-efecto">
        <div className="tb-barras-razon">
          <div className="tb-br razon" style={{ width: '62%' }}>
            Tokens de razonamiento
          </div>
          <div className="tb-br respuesta" style={{ width: '22%' }}>
            Respuesta
          </div>
        </div>
        <p>Los dos se cobran como salida.</p>
        <p className="chico">
          Claude Haiku 5.5: <code>effort</code>, de low a max; por defecto, medium. Gemini 3.5 Flash-Lite: <code>thinking_level</code>; por defecto, minimal. Gemini 2.5 Flash-Lite: <code>thinking_budget</code>; por defecto no razona.
        </p>
        <Ilustrativo texto="Proporción ilustrativa" />
      </div>
    );
  return (
    <div className="tb-efecto">
      <p className="tb-reloj">⏱ La llamada tarda demasiado…</p>
      <p>
        <code>timeout</code> fija cuántos segundos esperar. <code>max_retries</code>, cuántas veces reintentar.
      </p>
      <p className="chico">Por defecto, LangChain reintenta 2 veces con Claude y 6 con Gemini.</p>
    </div>
  );
}

export function Tablero({ paso = 0, final }) {
  useFuentes();
  const p = final ? 5 : paso;
  const actual = p >= 1 ? CONTROLES[Math.min(p, 5) - 1] : null;
  return (
    <div className="programa-cuerpo">
      <div className="tablero">
        <div className="tb-controles">
          <div className="tb-cabecera">
            <span>Control</span>
            <span>En LangChain, con Claude</span>
            <span>Con Gemini</span>
          </div>
          {CONTROLES.map((c, i) => {
            const on = final ? true : p === i + 1;
            const visto = final || p >= i + 1;
            return (
              <div key={c.id} className={`tb-control ${on ? 'encendido' : ''} ${visto ? 'visto' : ''} ${c.apagado ? 'bloqueado' : ''}`}>
                <span className="tb-perilla" aria-hidden="true" />
                <b>{c.nombre}</b>
                <code>{c.claude}</code>
                <code>{c.gemini}</code>
              </div>
            );
          })}
        </div>
        <div className="tb-panel tarjeta">{actual && !final ? <Efecto id={actual.id} /> : final ? <Efecto id="max" /> : <p className="texto-suave">Cada clic enciende un control y muestra su efecto.</p>}</div>
      </div>
      <Pie textos={PIE_TABLERO} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- La cuadrícula de variantes */
const PIE_VARIANTES = [
  'Cuatro variantes del mismo prompt, sobre los mismos casos. Cada clic llena una columna.',
  'Columna 1. Los tokens de entrada de cada prompt. Son reales: los ejemplos son los que más agregan.',
  'Columna 2. Los aciertos en 30 intentos: diez casos, tres veces cada uno. Son ilustrativos.',
  'Columna 3. El costo por mil aciertos. La cadena de pensamiento escribe mucho más, y eso se paga.',
  'Columna 4. La latencia: razonar en voz alta también tarda más. Tu laboratorio da tus propias cifras.',
];

/* Salidas, aciertos y latencias ilustrativas de cada variante. */
const ILUSTRATIVO_VARIANTES = {
  sin_ejemplos: { salida: 6, aciertos: 21, latencia: 0.8 },
  tres_ejemplos: { salida: 3, aciertos: 26, latencia: 0.9 },
  formato: { salida: 2, aciertos: 24, latencia: 0.7 },
  cadena: { salida: 110, aciertos: 26, latencia: 2.6 },
};
const INTENTOS = 30;

export function Variantes({ paso = 0, final }) {
  useFuentes();
  const p = final ? 4 : paso;
  const filas = VARIANTES.lista.map((v) => {
    const il = ILUSTRATIVO_VARIANTES[v.id];
    const total = INTENTOS * costo(v.tokens_entrada, il.salida);
    return { ...v, ...il, porMilAciertos: (1000 * total) / il.aciertos };
  });
  const columnas = [
    { titulo: 'Tokens de entrada', real: true, valor: (f) => miles(f.tokens_entrada) },
    { titulo: 'Aciertos', valor: (f) => `${f.aciertos} de ${INTENTOS}` },
    { titulo: 'Costo por mil aciertos', valor: (f) => usd(f.porMilAciertos, 3) },
    { titulo: 'Latencia media', valor: (f) => `${f.latencia.toFixed(1)} s` },
  ];
  return (
    <div className="programa-cuerpo">
      <table className="tabla-variantes">
        <thead>
          <tr>
            <th>Variante</th>
            {columnas.map((c, i) => (
              <th key={c.titulo} className={ver(p >= i + 1)}>
                {c.titulo}
                <small>{c.real ? 'real, con o200k_base' : 'ilustrativo'}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id} className={f.id === 'cadena' ? 'fila-cadena' : ''}>
              <th>{f.nombre}</th>
              {columnas.map((c, i) => (
                <td key={c.titulo} className={ver(p >= i + 1)}>
                  {c.valor(f)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="fila-marcas">
        <Pie textos={PIE_VARIANTES} paso={p} />
        <Ilustrativo texto="Aciertos y latencias ilustrativos" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- La cuenta antes de correr */
const PIE_CUENTA = [
  'Antes de correr un experimento, haz la cuenta. Tres números bastan.',
  'Paso 1. Los tokens de cada llamada: lo que entra y lo que sale.',
  'Paso 2. Cuántas llamadas: casos × variantes × intentos.',
  'Paso 3. El costo total, con los precios del Anexo G.1. La cadena de pensamiento multiplica la salida.',
];

export function CuentaPrevia({ paso = 0, final }) {
  useFuentes();
  const p = final ? 3 : paso;
  const conEjemplos = VARIANTES.lista.find((v) => v.id === 'tres_ejemplos');
  const conCadena = VARIANTES.lista.find((v) => v.id === 'cadena');
  const llamadas = 10 * 4 * 3;
  const escenarios = [
    { nombre: 'Con tres ejemplos', entrada: conEjemplos.tokens_entrada, salida: ILUSTRATIVO_VARIANTES.tres_ejemplos.salida },
    { nombre: 'Con cadena de pensamiento', entrada: conCadena.tokens_entrada, salida: ILUSTRATIVO_VARIANTES.cadena.salida },
  ];
  return (
    <div className="programa-cuerpo">
      <div className="cuenta-previa">
        {escenarios.map((e) => {
          const porLlamada = costo(e.entrada, e.salida);
          return (
            <div key={e.nombre} className="cp-escenario tarjeta">
              <h3>{e.nombre}</h3>
              <div className={`cp-fila ${ver(p >= 1)}`}>
                <span>Tokens por llamada</span>
                <b>
                  {miles(e.entrada)} de entrada + {miles(e.salida)} de salida
                </b>
              </div>
              <div className={`cp-fila ${ver(p >= 2)}`}>
                <span>Llamadas</span>
                <b>10 casos × 4 variantes × 3 intentos = {llamadas}</b>
              </div>
              <div className={`cp-fila total ${ver(p >= 3)}`}>
                <span>Costo con Claude Haiku 5.5</span>
                <b>{usd(llamadas * porLlamada, 4)}</b>
              </div>
            </div>
          );
        })}
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE_CUENTA} paso={p} />
        <Ilustrativo texto="Tokens de salida ilustrativos" />
      </div>
      <p className="chico texto-suave cp-nota">
        Tokens de entrada reales, con o200k_base. Precio: USD {HAIKU.entrada.toFixed(2)} por millón de tokens de entrada y {HAIKU.salida.toFixed(2)} de salida.
      </p>
    </div>
  );
}
