/* Programas del bloque 3.2 sobre el código y las pruebas:
   - LeerPrograma: un programa de 12 líneas, leído línea por línea. Es el de ejemplos/programa_corto.py.
   - PruebasCapa2: la cuadrícula de las pruebas de la capa 2. */
import { useFuentes, Pie, Ilustrativo, ver } from './comun.jsx';

/* ---------------------------------------------------------------- Leer un programa corto */
export const LINEAS_PROGRAMA = [
  'modelo = init_chat_model("anthropic:claude-haiku-5-5")',
  'lector = modelo.with_structured_output(Ticket, method="json_schema", include_raw=True)',
  'casos = [',
  '    {"id": "T-01", "texto": "La app se cierra al subir una foto."},',
  '    {"id": "T-02", "texto": "Quiero ordenar los álbumes por fecha."},',
  ']',
  'def clasificar(texto):',
  '    return lector.invoke([("system", INSTRUCCION), ("user", texto)])',
  'resultados = {}',
  'for caso in casos:',
  '    respuesta = clasificar(caso["texto"])',
  '    resultados[caso["id"]] = respuesta["parsed"]',
];

const PASOS_LECTURA = [
  { lineas: [], concepto: '', texto: 'Un programa de 12 líneas. Lo leemos línea por línea, sin escribir código.' },
  { lineas: [1, 2], concepto: 'Variable', texto: 'Dos variables. «modelo» guarda el modelo. «lector» guarda el modelo que responde con el esquema Ticket.' },
  { lineas: [3, 4, 5, 6], concepto: 'Lista y diccionario', texto: 'Una lista con dos casos. Cada caso es un diccionario: claves y valores, como un JSON.' },
  { lineas: [7, 8], concepto: 'Función', texto: 'Una función. Recibe un texto, arma los mensajes de sistema y de usuario, y llama al modelo.' },
  { lineas: [9], concepto: 'Diccionario vacío', texto: 'Un diccionario vacío. Ahí se van a guardar los resultados.' },
  { lineas: [10], concepto: 'Ciclo', texto: 'Un ciclo. Repite las dos líneas de abajo para cada caso de la lista.' },
  { lineas: [11], concepto: 'Llamar a la función', texto: 'Llama a la función con el texto del caso. La respuesta trae raw, parsed y parsing_error.' },
  { lineas: [12], concepto: 'Guardar en el diccionario', texto: 'Guarda el registro validado, «parsed», con la clave del caso. Por ejemplo, T-01.' },
];

const PALABRAS = new Set(['def', 'for', 'in', 'return', 'True', 'False', 'None']);

/* Resaltado sencillo: textos, palabras clave, funciones y el resto. */
function resaltar(linea) {
  const partes = [];
  const re = /("[^"]*")|(\b[A-Za-z_][A-Za-z_0-9]*\b)(?=\()|(\b[A-Za-z_][A-Za-z_0-9]*\b)|([^"A-Za-z_]+)/g;
  let m;
  let i = 0;
  while ((m = re.exec(linea))) {
    if (m[1]) partes.push(<span key={i++} className="c-texto">{m[1]}</span>);
    else if (m[2]) partes.push(<span key={i++} className="c-funcion">{m[2]}</span>);
    else if (m[3]) partes.push(<span key={i++} className={PALABRAS.has(m[3]) ? 'c-clave' : ''}>{m[3]}</span>);
    else partes.push(<span key={i++}>{m[4]}</span>);
  }
  return partes;
}

/* En el estado final, cada grupo de líneas lleva su concepto al lado. */
const CONCEPTO_DE_LINEA = {};
PASOS_LECTURA.forEach((k) => {
  if (k.lineas.length) CONCEPTO_DE_LINEA[k.lineas[0]] = k.concepto;
});

export function LeerPrograma({ paso = 0, final }) {
  useFuentes();
  const p = final ? 0 : paso;
  const actual = PASOS_LECTURA[Math.min(p, PASOS_LECTURA.length - 1)];
  return (
    <div className="programa-cuerpo">
      <div className={`leer-programa ${p >= 1 ? 'leyendo' : ''} ${final ? 'final' : ''}`}>
        <pre className="lp-codigo" aria-label="Programa de 12 líneas en Python">
          {LINEAS_PROGRAMA.map((l, i) => (
            <div key={i} className={`lp-linea ${actual.lineas.includes(i + 1) ? 'activa' : ''}`}>
              <span className="lp-numero">{i + 1}</span>
              <span className="lp-texto">{resaltar(l)}</span>
              {final && CONCEPTO_DE_LINEA[i + 1] ? <span className="lp-concepto-linea">{CONCEPTO_DE_LINEA[i + 1]}</span> : null}
            </div>
          ))}
        </pre>
        {!final ? (
          <div className="lp-explicacion tarjeta acento" aria-live="polite">
            {actual.concepto ? <span className="lp-concepto">{actual.concepto}</span> : null}
            <p>{actual.texto}</p>
          </div>
        ) : null}
      </div>
      <p className="chico texto-suave lp-nota">Arriba del programa van los import, la instrucción y el esquema Ticket del bloque 3.1.</p>
    </div>
  );
}

/* ---------------------------------------------------------------- Las pruebas de la capa 2 */
const PIE_PRUEBAS2 = [
  'Las pruebas de la capa 2 se arman como una cuadrícula. Cada clic agrega una fila.',
  'Fila 1. Conectar por API el modelo que eligieron en la capa 1, con la clave del curso.',
  'Fila 2. Validar el esquema en los diez casos: ¿cada respuesta cumple el esquema?',
  'Fila 3. Comparar los campos de cada caso con su registro esperado.',
  'Fila 4. Los tres casos de robustez: entrada incompleta, respuesta mal formada y fuera de alcance.',
  'Fila 5. Cada prueba queda en la tabla de resultados, con las columnas del Anexo J.7.',
];

/* Patrón ilustrativo de resultados: true pasa, false falla. */
const PATRON_ESQUEMA = [true, true, true, true, true, true, false, true, true, true];
const PATRON_CAMPOS = [true, true, true, false, true, true, false, true, true, true];
const ROBUSTEZ = [
  { rotulo: 'Entrada incompleta', pasa: true },
  { rotulo: 'Respuesta mal formada', pasa: true },
  { rotulo: 'Fuera de alcance', pasa: false },
];
const COLUMNAS_J7 = ['caso_id', 'etapa', 'tipo_prueba', 'esperado', 'obtenido', 'resultado', 'razon_fallo', 'modelo', 'tokens_entrada', 'tokens_salida', 'costo_usd', 'latencia_s'];

function Celdas({ patron, encendidas, rotulos }) {
  return (
    <div className="celdas2">
      {patron.map((ok, i) => (
        <span key={i} className={`celda2 ${encendidas ? (ok ? 'pasa' : 'falla') : ''}`} style={{ transitionDelay: `${i * 0.06}s` }}>
          <small>{rotulos ? rotulos[i] : `C${String(i + 1).padStart(2, '0')}`}</small>
          <b>{encendidas ? (ok ? '✓' : '✗') : ''}</b>
        </span>
      ))}
    </div>
  );
}

export function PruebasCapa2({ paso = 0, final }) {
  useFuentes();
  const p = final ? 5 : paso;
  return (
    <div className="programa-cuerpo">
      <div className="pruebas-capa2">
        <div className={`fila-prueba2 ${p >= 1 ? 'activa' : ''}`}>
          <span className="rotulo-prueba2">
            <b>Conectar por API</b>
            <small>el modelo de la capa 1</small>
          </span>
          <Celdas patron={[true]} encendidas={p >= 1} rotulos={['Llamada']} />
        </div>
        <div className={`fila-prueba2 ${p >= 2 ? 'activa' : ''}`}>
          <span className="rotulo-prueba2">
            <b>Validar el esquema</b>
            <small>los diez casos</small>
          </span>
          <Celdas patron={PATRON_ESQUEMA} encendidas={p >= 2} />
        </div>
        <div className={`fila-prueba2 ${p >= 3 ? 'activa' : ''}`}>
          <span className="rotulo-prueba2">
            <b>Campos correctos</b>
            <small>contra el registro esperado</small>
          </span>
          <Celdas patron={PATRON_CAMPOS} encendidas={p >= 3} />
        </div>
        <div className={`fila-prueba2 ${p >= 4 ? 'activa' : ''}`}>
          <span className="rotulo-prueba2">
            <b>Robustez</b>
            <small>tres casos</small>
          </span>
          <Celdas patron={ROBUSTEZ.map((r) => r.pasa)} encendidas={p >= 4} rotulos={ROBUSTEZ.map((r) => r.rotulo)} />
        </div>
        <div className={`fila-j7 ${ver(p >= 5)}`}>
          <b>Tabla de resultados</b>
          <div>
            {COLUMNAS_J7.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE_PRUEBAS2} paso={p} />
        <Ilustrativo texto="Resultados ilustrativos" />
      </div>
    </div>
  );
}
