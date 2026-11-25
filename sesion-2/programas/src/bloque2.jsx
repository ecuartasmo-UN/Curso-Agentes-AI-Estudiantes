/* Programas del bloque 2.2: capacidades, límites y cómo elegir el modelo.
   Cada componente recibe paso, final y quieto, como los del bloque 2.1.
   Las cifras que no son reales llevan su marca «ilustrativo» en la diapositiva. */
import { color, suave, miles, Pie, Ilustrativo } from './comun.jsx';
import sesgo from '../../ejemplos/datos/sesgo.json';

const { useState, useEffect } = React;

/* Formato de dinero: punto decimal y los decimales que pide cada cifra. */
const usd = (v, dec = 4) => `USD ${v.toFixed(dec)}`;

/* ---------------------------------------------------------------- Razonar antes de responder */
const PIE_RAZONAR = [
  'Un modelo que razona escribe primero sus pasos y después la respuesta.',
  'Paso 1. Primero genera tokens de razonamiento: hace la cuenta paso a paso.',
  'Paso 2. Después escribe la respuesta, que es lo único que ves en el chat.',
  'Paso 3. Los tokens de razonamiento se cobran como salida, igual que la respuesta.',
];
const PASOS_RAZONAMIENTO = [
  '50 llamadas × 2 000 tokens = 100 000 tokens de entrada',
  '100 000 × USD 0.10 por millón = USD 0.01',
  '50 llamadas × 500 tokens = 25 000 tokens de salida',
  '25 000 × USD 0.50 por millón = USD 0.0125',
  'Total: 0.01 + 0.0125 = USD 0.0225',
];

export function Razonamiento({ paso = 0, final }) {
  const p = final ? 3 : paso;
  const razonamiento = 140;
  const respuesta = 14;
  return (
    <div className="programa-cuerpo">
      <div className="razonar">
        <div className="razonar-pregunta">
          <span className="rol">usuario</span>
          ¿Cuánto cuesta un laboratorio con Claude Haiku 5.5? Usa 50 llamadas de 2 000 tokens de entrada y 500 de salida.
        </div>
        <div className={`razonar-pensamiento aparece-p ${p >= 1 ? 'visto' : ''}`}>
          <span className="rol">razonamiento</span>
          {PASOS_RAZONAMIENTO.map((t, i) => (
            <span key={i} className="linea-pensada" style={{ animationDelay: p === 1 && !final ? `${i * 0.35}s` : '0s' }}>
              {t}
            </span>
          ))}
        </div>
        <div className={`razonar-respuesta aparece-p ${p >= 2 ? 'visto' : ''}`}>
          <span className="rol">respuesta</span>
          Cuesta USD 0.0225 por estudiante.
        </div>
        <div className={`razonar-cuenta aparece-p ${p >= 3 ? 'visto' : ''}`}>
          <span className="rotulo">Tokens de salida que se cobran</span>
          <div className="barra-salida">
            <span className="tramo-pensado" style={{ flex: razonamiento }}>razonamiento · {razonamiento}</span>
            <span className="tramo-respuesta" style={{ flex: respuesta * 3 }}>respuesta · {respuesta}</span>
          </div>
          <small>Precios del Anexo G.1. Con el razonamiento activo, el costo real puede ser mayor.</small>
        </div>
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE_RAZONAR} paso={p} />
        {p >= 3 ? <Ilustrativo texto="Conteos ilustrativos" /> : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Adivinar o decir no sé */
const PIE_ADIVINAR = [
  'La lectura del bloque explica por qué los modelos adivinan. Lo seguimos paso a paso.',
  'Paso 1. En una prueba de opciones múltiples, adivinar puede sumar. Dejarla en blanco da cero.',
  'Paso 2. El cumpleaños: adivinar da 1 opción entre 365. «No lo sé» da cero puntos seguros.',
  'Paso 3. Con la calificación de siempre, el modelo que adivina más parece mejor.',
  'Paso 4. La propuesta: castigar más el error seguro que la duda. Así, «no lo sé» vale más que fallar.',
];
/* Tabla de SimpleQA citada por OpenAI (2025), tomada de la ficha del sistema de GPT-5. Datos reales. */
const SIMPLEQA = [
  { modelo: 'gpt-5-thinking-mini', acierto: 22, error: 26, abstencion: 52 },
  { modelo: 'OpenAI o4-mini', acierto: 24, error: 75, abstencion: 1 },
];

export function Adivinar({ paso = 0, final }) {
  const p = final ? 4 : paso;
  return (
    <div className="programa-cuerpo">
      <div className="adivinar">
        <div className={`tarjeta-prueba aparece-p ${p >= 1 ? 'visto' : ''}`}>
          <b>Prueba de opciones múltiples</b>
          <div className="opciones">
            {['A', 'B', 'C', 'D'].map((o) => (
              <span key={o} className={`opcion ${o === 'C' ? 'marcada' : ''}`}>{o}</span>
            ))}
          </div>
          <div className="dos-columnas">
            <span><i className="ok" />Adivinar: a veces acierta</span>
            <span><i className="cero" />En blanco: cero seguro</span>
          </div>
        </div>
        <div className={`tarjeta-prueba aparece-p ${p >= 2 ? 'visto' : ''}`}>
          <b>¿Cuándo es el cumpleaños de esta persona?</b>
          <div className="calendario" aria-hidden="true">
            {Array.from({ length: 73 }).map((_, i) => (
              <i key={i} className={i === 50 ? 'dia-elegido' : ''} />
            ))}
          </div>
          <div className="dos-columnas">
            <span>«10 de septiembre»: <b>1 en 365</b></span>
            <span>«No lo sé»: <b>0 puntos</b></span>
          </div>
        </div>
        <div className={`tabla-simpleqa aparece-p ${p >= 3 ? 'visto' : ''}`}>
          <b>SimpleQA, según OpenAI (2025)</b>
          {SIMPLEQA.map((m) => (
            <div key={m.modelo} className="fila-sqa">
              <span className="nombre">{m.modelo}</span>
              <span className="pila-sqa">
                <span className="acierto" style={{ flex: m.acierto }}>{m.acierto} %</span>
                <span className="error" style={{ flex: m.error }}>{m.error} %</span>
                <span className="abstencion" style={{ flex: Math.max(m.abstencion, 6) }}>{m.abstencion} %</span>
              </span>
            </div>
          ))}
          <div className="leyenda-sqa">
            <span><i className="acierto" />aciertos</span>
            <span><i className="error" />errores</span>
            <span><i className="abstencion" />abstenciones</span>
          </div>
        </div>
        <div className={`propuesta aparece-p ${p >= 4 ? 'visto' : ''}`}>
          <span className="rotulo-propuesta">Responde solo si tienes más de 50 % de confianza</span>
          <span><b className="texto-exito">+1</b> acierto</span>
          <span><b className="texto-alerta">−1</b> error</span>
          <span><b>0</b> «no lo sé»</span>
          <small>Un ejemplo de Kalai et al. (2025), el artículo de investigación de la lectura.</small>
        </div>
      </div>
      <Pie textos={PIE_ADIVINAR} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- Sesgos en los embeddings */
const PIE_SESGO = [
  'En el bloque 2.1, rey − hombre + mujer dio reina. La misma cuenta revela sesgos.',
  'Paso 1. La dirección «she − he», con los pesos reales de GPT-2. «she» y «he» marcan los extremos.',
  'Paso 2. Cada profesión cae en algún punto de esa dirección. Nadie lo programó: sale del texto.',
  'Paso 3. Los extremos repiten estereotipos del texto de entrenamiento.',
];

export function Sesgo({ paso = 0, final }) {
  const p = final ? 3 : paso;
  const max = 0.4;
  const pos = (v) => 50 + (v / max) * 50;
  const filas = sesgo.profesiones;
  const extremos = new Set([...filas.slice(0, 3), ...filas.slice(-3)].map((f) => f.palabra));
  return (
    <div className="programa-cuerpo">
      <div className="sesgo">
        <div className={`eje-sesgo aparece-p ${p >= 1 ? 'visto' : ''}`}>
          <span className="marca-eje he" style={{ left: `${pos(sesgo.referencias.he)}%` }}>he</span>
          <span className="marca-eje cero" style={{ left: '50%' }}>0</span>
          <span className="marca-eje she" style={{ left: `${pos(sesgo.referencias.she)}%` }}>she</span>
        </div>
        <div className="filas-sesgo">
          {filas.map((f, i) => {
            const v = f.puntaje;
            const izq = v < 0;
            return (
              <div key={f.palabra} className={`fila-sesgo aparece-p ${p >= 2 ? 'visto' : ''} ${p >= 3 && !extremos.has(f.palabra) ? 'atenuada' : ''}`} style={{ transitionDelay: p === 2 && !final ? `${i * 0.05}s` : '0s' }}>
                <span className="nombre" style={{ textAlign: 'right' }}>
                  {f.palabra} <small>{f.es}</small>
                </span>
                <span className="pista-sesgo">
                  <span className="linea-cero" />
                  <span className={`barra-sesgo ${izq ? 'he' : 'she'}`} style={izq ? { right: '50%', width: `${(Math.abs(v) / max) * 50}%` } : { left: '50%', width: `${(v / max) * 50}%` }} />
                </span>
                <span className="valor">{v > 0 ? '+' : ''}{v.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Pie textos={PIE_SESGO} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- La cuenta: costo por caso y por laboratorio */
const PIE_CUENTA = [
  'El costo se cuenta en tokens. Usamos los precios de Claude Haiku 5.5 del Anexo G.1.',
  'Paso 1. Los tokens de entrada se cobran a su precio: 2 000 × USD 0.10 por millón.',
  'Paso 2. Los de salida, al suyo: 500 × USD 0.50 por millón. La suma es el costo por caso.',
  'Paso 3. Un laboratorio de 50 llamadas cuesta cerca de 2 centavos de dólar por estudiante.',
  'Paso 4. El tokenizer decide cuántos tokens pagas. El mismo texto cambia de precio según el modelo.',
];

export function Cuenta({ paso = 0, final }) {
  const p = final ? 4 : paso;
  const entrada = (2000 * 0.1) / 1e6;
  const salida = (500 * 0.5) / 1e6;
  const caso = entrada + salida;
  return (
    <div className="programa-cuerpo">
      <div className="cuenta">
        <div className={`renglon aparece-p ${p >= 1 ? 'visto' : ''}`}>
          <span className="ficha-cuenta entrada">2 000 tokens de entrada</span>
          <i>×</i>
          <span className="ficha-cuenta">USD 0.10 por millón</span>
          <i>=</i>
          <b>{usd(entrada)}</b>
        </div>
        <div className={`renglon aparece-p ${p >= 2 ? 'visto' : ''}`}>
          <span className="ficha-cuenta salida">500 tokens de salida</span>
          <i>×</i>
          <span className="ficha-cuenta">USD 0.50 por millón</span>
          <i>=</i>
          <b>{usd(salida, 5)}</b>
        </div>
        <div className={`renglon total aparece-p ${p >= 2 ? 'visto' : ''}`}>
          <span>Costo por caso</span>
          <b className="texto-acento">{usd(caso, 5)}</b>
        </div>
        <div className={`renglon total grande aparece-p ${p >= 3 ? 'visto' : ''}`}>
          <span>50 llamadas por estudiante y laboratorio</span>
          <b className="texto-exito">{usd(caso * 50)}</b>
        </div>
        <div className={`nota-tokenizer aparece-p ${p >= 4 ? 'visto' : ''}`}>
          <span>Bloque 2.1: el mismo texto gasta 30 % más tokens en español (o200k_base).</span>
          <span>El tokenizer de Haiku 5.5 produce cerca de 30 % más tokens que el de Haiku 4.5.</span>
        </div>
      </div>
      <Pie textos={PIE_CUENTA} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- Costo por acierto */
const PIE_ACIERTO = [
  'Dos modelos resuelven los mismos 10 casos. El más barato por caso no siempre gana.',
  'Paso 1. El costo de los 10 casos: el modelo A cuesta menos por caso.',
  'Paso 2. Los aciertos: el modelo A resuelve 4 casos; el B, 9.',
  'Paso 3. Costo por acierto: el costo total entre los casos bien resueltos.',
  'Paso 4. El modelo barato que falla cuesta más por acierto. Lo mides en el Laboratorio 2B.',
];
const MODELOS_ACIERTO = [
  { nombre: 'Modelo A', caso: 0.0004, aciertos: 4, c: 'var(--t4)' },
  { nombre: 'Modelo B', caso: 0.0006, aciertos: 9, c: 'var(--t1)' },
];

export function CostoAcierto({ paso = 0, final }) {
  const p = final ? 4 : paso;
  return (
    <div className="programa-cuerpo">
      <div className="costo-acierto">
        {MODELOS_ACIERTO.map((m) => {
          const total = m.caso * 10;
          const porAcierto = total / m.aciertos;
          return (
            <div key={m.nombre} className="col-modelo" style={{ '--c': m.c }}>
              <b className="nombre-modelo">{m.nombre}</b>
              <div className={`aparece-p ${p >= 1 ? 'visto' : ''}`}>
                <span className="dato">{usd(m.caso)} por caso</span>
                <span className="dato tenue">10 casos: {usd(total, 3)}</span>
              </div>
              <div className={`casos-ok aparece-p ${p >= 2 ? 'visto' : ''}`}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <i key={i} className={i < m.aciertos ? 'ok' : 'falla'}>{i < m.aciertos ? '✓' : '✗'}</i>
                ))}
              </div>
              <div className={`por-acierto aparece-p ${p >= 3 ? 'visto' : ''} ${p >= 4 && m.nombre === 'Modelo A' ? 'peor' : ''} ${p >= 4 && m.nombre === 'Modelo B' ? 'mejor' : ''}`}>
                <span>{usd(total, 3)} ÷ {m.aciertos} aciertos</span>
                <b>{usd(porAcierto, 5)} por acierto</b>
              </div>
            </div>
          );
        })}
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE_ACIERTO} paso={p} />
        <Ilustrativo texto="Precios y aciertos ilustrativos" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Las pruebas de la capa 1 */
const PIE_PRUEBAS = [
  'La capa 1 se prueba con los casos que escribieron después del bloque 2.1.',
  'Paso 1. Los diez casos, en dos modelos, con la clave del curso.',
  'Paso 2. Los tres casos de robustez, en los mismos dos modelos.',
  'Paso 3. La consistencia: tres casos, tres veces cada uno, en cada modelo.',
  'Paso 4. Cada prueba deja una fila en la tabla de la ficha: tokens, costo y latencia.',
];

function Celdas({ n, encendidas, clase, retraso = 0 }) {
  return (
    <span className="celdas">
      {Array.from({ length: n }).map((_, i) => (
        <i key={i} className={`${clase} ${encendidas ? 'corrida' : ''}`} style={{ transitionDelay: encendidas ? `${retraso + i * 0.03}s` : '0s' }} />
      ))}
    </span>
  );
}

export function PruebasCapa({ paso = 0, final }) {
  const p = final ? 4 : paso;
  return (
    <div className="programa-cuerpo">
      <div className="pruebas-capa">
        <div className="cabecera-pruebas">
          <span />
          <b>Modelo 1</b>
          <b>Modelo 2</b>
        </div>
        {[
          { rotulo: 'Diez casos', sub: 'C01 a C10', n: 10, clase: 'funcionamiento', paso: 1 },
          { rotulo: 'Tres de robustez', sub: 'ambigua, premisa falsa, fuera de alcance', n: 3, clase: 'robustez', paso: 2 },
          { rotulo: 'Consistencia', sub: 'tres casos × tres intentos', n: 9, clase: 'consistencia', paso: 3 },
        ].map((g) => (
          <div key={g.rotulo} className={`fila-pruebas ${p >= g.paso ? 'activa' : ''}`}>
            <span className="rotulo-pruebas">
              <b>{g.rotulo}</b>
              <small>{g.sub}</small>
            </span>
            <Celdas n={g.n} encendidas={p >= g.paso} clase={g.clase} />
            <Celdas n={g.n} encendidas={p >= g.paso} clase={g.clase} retraso={0.15} />
          </div>
        ))}
        <div className={`total-pruebas aparece-p ${p >= 4 ? 'visto' : ''}`}>
          (10 + 3 + 9) pruebas × 2 modelos = <b>{totalPruebas()} filas</b> en la tabla de resultados
        </div>
        <div className={`fila-tabla-resultados aparece-p ${p >= 4 ? 'visto' : ''}`}>
          {['caso_id', 'modelo', 'intento', 'resultado', 'tokens_entrada', 'tokens_salida', 'costo_usd', 'latencia_s'].map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>
      <Pie textos={PIE_PRUEBAS} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- Cuántas pruebas: el total */
export function totalPruebas() {
  return (10 + 3 + 9) * 2;
}

export { usd, miles, color, suave };

/* ---------------------------------------------------------------- Dónde están los pesos */
const PIE_DONDE = [
  'Los pesos de un modelo viven en algún computador. ¿En el tuyo o en el del proveedor?',
  'Paso 1. Detrás de una API: tu texto viaja por internet hasta los pesos del proveedor.',
  'Paso 2. En tu computador: descargas los pesos y el texto no sale de tu máquina.',
  'Paso 3. Con una API, tus datos salen de tu computador. La parte 5 muestra qué hace cada proveedor.',
];

const IconoComputador = () => (
  <svg viewBox="0 0 48 40" aria-hidden="true"><rect x="5" y="4" width="38" height="24" rx="3" /><path d="M2 34h44" /><path d="M18 34l2-6h8l2 6" /></svg>
);
const IconoNube = () => (
  <svg viewBox="0 0 48 40" aria-hidden="true"><path d="M14 32h22a9 9 0 0 0 0-18 12 12 0 0 0-23-2A9 9 0 0 0 14 32z" /></svg>
);
const IconoArchivo = () => (
  <svg viewBox="0 0 40 48" aria-hidden="true"><path d="M8 4h16l10 10v30H8z" /><path d="M24 4v10h10" /><path d="M14 26h14M14 32h14M14 38h9" /></svg>
);

export function DondePesos({ paso = 0, final, quieto }) {
  const p = final ? 3 : paso;
  return (
    <div className="programa-cuerpo">
      <div className="donde-pesos">
        <div className={`escenario api aparece-p ${p >= 1 ? 'visto' : ''} ${p >= 3 ? 'resaltado' : ''}`}>
          <b className="titulo-escenario">Detrás de una API</b>
          <div className="camino-escenario">
            <span className="caja-escenario"><IconoComputador /><small>tu programa</small></span>
            <span className={`flecha-datos ${p >= 3 ? 'alerta' : ''} ${quieto ? 'quieta' : ''}`}><i /><em>tu texto viaja</em></span>
            <span className="caja-escenario nube"><IconoNube /><small>pesos del proveedor</small></span>
          </div>
          <span className="ejemplos-escenario">Claude, Gemini y los modelos de OpenAI por API</span>
        </div>
        <div className={`escenario local aparece-p ${p >= 2 ? 'visto' : ''}`}>
          <b className="titulo-escenario">En tu computador</b>
          <div className="camino-escenario">
            <span className="caja-escenario"><IconoComputador /><small>tu programa</small></span>
            <span className="flecha-local"><i /><em>sin internet</em></span>
            <span className="caja-escenario archivo"><IconoArchivo /><small>pesos descargados</small></span>
          </div>
          <span className="ejemplos-escenario">Olmo 3 7B: 14.6 GB en 16 bits, cerca de 3.6 GB en 4 bits</span>
        </div>
      </div>
      <Pie textos={PIE_DONDE} paso={p} />
    </div>
  );
}
