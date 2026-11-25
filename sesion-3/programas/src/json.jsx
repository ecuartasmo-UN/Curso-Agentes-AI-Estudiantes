/* Programas del bloque 3.1 sobre el JSON:
   - TextoRegistro: del ticket al registro validado, con una respuesta mal formada y un dato vacío.
   - TokensValidos: la decodificación restringida, con las barras de probabilidad del bloque 2.1.
   - Validador: un registro que se rompe campo por campo. La validación es real para este esquema. */
import { useFuentes, Pie, Ilustrativo, ver } from './comun.jsx';
import { TICKET, REGISTRO, CAMPOS, ESQUEMA, ERRORES } from './datos.jsx';

const { useState } = React;

/* ---------------------------------------------------------------- Del texto al registro */
const PIE_REGISTRO = [
  'Un ticket de soporte, escrito por una persona. El programa necesita sus datos en campos.',
  'Paso 1. El esquema viaja con la petición: los campos, sus tipos y sus valores permitidos.',
  'Paso 2. El modelo devuelve un JSON con los cinco campos.',
  'Paso 3. La validación revisa cada campo contra el esquema. Todos cumplen.',
  'Paso 4. Otra respuesta trae un valor no permitido. La validación la detecta y el programa reintenta.',
  'Paso 5. Si un dato no está en el ticket, el campo queda vacío. No se inventa.',
];

/* Las partes del ticket que dan cada campo, para resaltarlas en el texto. */
const PISTAS = [
  { texto: 'la app se cierra', campo: 'categoria' },
  { texto: 'Android 15', campo: 'plataforma' },
  { texto: 'versión 4.2.1', campo: 'version_app' },
];

function TicketResaltado({ activo }) {
  let partes = [TICKET];
  PISTAS.forEach((k) => {
    partes = partes.flatMap((t) => {
      if (typeof t !== 'string' || !t.includes(k.texto)) return [t];
      const [a, b] = t.split(k.texto);
      return [a, { ...k }, b];
    });
  });
  return (
    <p className="tr-texto">
      {partes.map((t, i) => (typeof t === 'string' ? <span key={i}>{t}</span> : <mark key={i} className={activo ? 'pista visto' : 'pista'}>{t.texto}</mark>))}
    </p>
  );
}

export function TextoRegistro({ paso = 0, final }) {
  useFuentes();
  const p = final ? 5 : paso;
  const malo = p === 4;
  const error = ERRORES.valor_no_permitido.errores[0].mensaje;
  const valor = (c) => (malo && c === 'prioridad' ? 'urgente' : REGISTRO[c]);
  return (
    <div className="programa-cuerpo">
      <div className="texto-registro">
        <div className="tr-ticket tarjeta">
          <span className="tr-rotulo">Ticket de soporte · FotoNube (app ficticia)</span>
          <TicketResaltado activo={p >= 2} />
        </div>
        <div className="tr-medio">
          <div className={`tr-esquema ${ver(p >= 1)} ${p >= 1 ? 'viaja' : ''}`}>
            <b>Esquema</b>
            {ESQUEMA.map((e) => (
              <span key={e.campo}>
                {e.campo}
                {e.obligatorio ? '' : ' (opcional)'}
              </span>
            ))}
          </div>
          <div className="tr-modelo">Modelo</div>
          <div className={`tr-flecha ${p >= 2 ? 'activa' : ''}`} aria-hidden="true" />
        </div>
        <div className={`tr-registro tarjeta ${ver(p >= 2)} ${malo ? 'con-error' : ''}`}>
          <div className="tr-cabecera">
            <span className="tr-rotulo">{malo ? 'Otra respuesta: con un error' : 'La respuesta: un registro JSON'}</span>
            {p >= 2 ? <Ilustrativo texto="Respuesta ilustrativa" /> : null}
          </div>
          {CAMPOS.map((c, i) => {
            const mal = malo && c === 'prioridad';
            const estado = p >= 3 ? (mal ? 'mal' : 'bien') : '';
            return (
              <div key={c} className={`tr-fila ${estado}`} style={{ transitionDelay: p === 3 ? `${i * 0.18}s` : '0s' }}>
                <code className="j-clave">{c}</code>
                <code className={mal ? 'j-error' : 'j-texto'}>"{valor(c)}"</code>
                <span className="tr-marca" aria-label={estado === 'mal' ? 'No cumple' : estado === 'bien' ? 'Cumple' : ''}>
                  {estado === 'mal' ? '✗' : estado === 'bien' ? '✓' : ''}
                </span>
              </div>
            );
          })}
          <div className={`tr-error ${ver(malo)}`}>
            <b>Mensaje real de Pydantic:</b> <code>{error}</code>
            <span className="tr-reintento">↻ El programa reintenta</span>
          </div>
        </div>
      </div>
      <div className={`tr-vacio tarjeta ${ver(p >= 5)}`}>
        <span>Otro ticket: «La galería tarda en abrir en el iPhone.»</span>
        <code>
          <span className="j-clave">version_app</span>: <span className="j-nulo">null</span>
        </code>
        <b className="texto-exito">✓ vacío, no inventado</b>
      </div>
      <Pie textos={PIE_REGISTRO} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- Solo tokens válidos */
const PIE_VALIDOS = [
  'El modelo va escribiendo el JSON. El siguiente token es el valor de «prioridad».',
  'Paso 1. El esquema dice qué valores puede tener: alta, media o baja.',
  'Paso 2. Con decodificación restringida, los tokens que rompen el esquema se apagan. Los demás se reparten la probabilidad.',
  'Paso 3. El modelo elige entre los permitidos. El JSON sigue cumpliendo el esquema.',
];

const CANDIDATOS = [
  { t: 'alta', p: 41, valido: true },
  { t: 'urgente', p: 24, valido: false },
  { t: 'media', p: 13, valido: true },
  { t: 'crítica', p: 11, valido: false },
  { t: 'Alta', p: 6, valido: false },
  { t: 'baja', p: 5, valido: true },
];

export function TokensValidos({ paso = 0, final }) {
  useFuentes();
  const p = final ? 3 : paso;
  const sumaValidos = CANDIDATOS.filter((c) => c.valido).reduce((s, c) => s + c.p, 0);
  return (
    <div className="programa-cuerpo">
      <div className="tokens-validos">
        <pre className="tv-json">
          <span className="j-clave">{'{"categoria"'}</span>: <span className="j-texto">"fallo de la app"</span>, <span className="j-clave">"prioridad"</span>: "
          <span className={`tv-elegido ${p >= 3 ? 'visto' : ''}`}>alta"</span>
          <span className={`tv-cursor ${p >= 3 ? 'oculto' : ''}`}>▌</span>
        </pre>
        <div className={`tv-esquema ${ver(p >= 1)}`}>
          <span>Esquema:</span> <code>prioridad</code> es <b>alta</b>, <b>media</b> o <b>baja</b>
        </div>
        <div className="tv-barras">
          {CANDIDATOS.map((c) => {
            const apagado = p >= 2 && !c.valido;
            const pct = p >= 2 ? (c.valido ? Math.round((100 * c.p) / sumaValidos) : 0) : c.p;
            return (
              <div key={c.t} className={`tv-fila ${apagado ? 'apagado' : ''} ${p >= 3 && c.t === 'alta' ? 'ganador' : ''}`}>
                <span className="tv-token">«{c.t}»</span>
                <div className="tv-pista">
                  <div className="tv-barra" style={{ width: `${pct * 1.6}%` }} />
                </div>
                <span className="tv-pct">{apagado ? 'fuera del esquema' : `${pct} %`}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE_VALIDOS} paso={p} />
        <Ilustrativo texto="Probabilidades ilustrativas" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- El validador */
const VALORES_MALOS = { categoria: 'error grave', prioridad: 'urgente', plataforma: 'Windows', version_app: 4.21, resumen: 42 };

/* La misma validación que hace Pydantic con el esquema Ticket, para este esquema. */
export function validar(registro) {
  const errores = [];
  ESQUEMA.forEach((e) => {
    const v = registro[e.campo];
    if (v === undefined) {
      if (e.obligatorio) errores.push({ campo: e.campo, es: 'Falta un campo obligatorio.', en: 'Field required' });
      return;
    }
    if (v === null) {
      if (e.obligatorio) errores.push({ campo: e.campo, es: 'El campo no puede quedar vacío.', en: 'Input should be a valid string' });
      return;
    }
    if (e.valores) {
      if (!e.valores.includes(v)) {
        const lista = e.valores.map((x) => `'${x}'`);
        const en = `Input should be ${lista.slice(0, -1).join(', ')} or ${lista[lista.length - 1]}`;
        errores.push({ campo: e.campo, es: 'Ese valor no está permitido.', en });
      }
      return;
    }
    if (typeof v !== 'string') errores.push({ campo: e.campo, es: 'El tipo no coincide: debe ser texto.', en: 'Input should be a valid string' });
  });
  return errores;
}

export function Validador() {
  useFuentes();
  const [registro, setRegistro] = useState({ ...REGISTRO });
  const poner = (campo, valor) =>
    setRegistro((r) => {
      const n = { ...r };
      if (valor === undefined) delete n[campo];
      else n[campo] = valor;
      return n;
    });
  const soltar = (e) => e.currentTarget.blur();
  const errores = validar(registro);
  return (
    <div className="programa-cuerpo validador">
      <div className="val-registro tarjeta">
        {CAMPOS.map((c) => {
          const e = ESQUEMA.find((x) => x.campo === c);
          const v = registro[c];
          const malo = errores.some((x) => x.campo === c);
          return (
            <div key={c} className={`val-fila ${malo ? 'mal' : 'bien'}`}>
              <code className="j-clave">{c}</code>
              <code className={malo ? 'j-error' : v === null ? 'j-nulo' : 'j-texto'}>
                {v === undefined ? '(falta)' : v === null ? 'null' : typeof v === 'string' ? `"${v}"` : String(v)}
              </code>
              <div className="val-botones">
                <button type="button" onClick={(ev) => { poner(c, undefined); soltar(ev); }}>Quitar</button>
                <button type="button" onClick={(ev) => { poner(c, VALORES_MALOS[c]); soltar(ev); }}>{e.valores ? 'Valor no permitido' : 'Otro tipo'}</button>
                {!e.obligatorio ? <button type="button" onClick={(ev) => { poner(c, null); soltar(ev); }}>Vacío</button> : null}
                <button type="button" onClick={(ev) => { poner(c, REGISTRO[c]); soltar(ev); }}>Restaurar</button>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`val-resultado tarjeta ${errores.length ? 'alerta' : 'exito'}`} aria-live="polite">
        {errores.length === 0 ? (
          <p className="mediano">
            <b className="texto-exito">✓ El registro cumple el esquema.</b>
          </p>
        ) : (
          <>
            <p className="mediano">
              <b className="texto-alerta">
                ✗ {errores.length} {errores.length === 1 ? 'error' : 'errores'}
              </b>
            </p>
            {errores.map((x) => (
              <p key={x.campo} className="chico">
                <code>{x.campo}</code>: {x.es} <span className="texto-suave">Pydantic dice: «{x.en}».</span>
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
