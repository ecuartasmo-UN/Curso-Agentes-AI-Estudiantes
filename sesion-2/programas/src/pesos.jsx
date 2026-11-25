/* Parte 4 del bloque 2.1: los pesos del modelo.
   - Parametros: cuántos son, en escala logarítmica (GPT-2 pequeño, Olmo 3 7B y GPT-3).
   - Calculadora: parámetros × bytes por peso = tamaño del archivo (Olmo 3 7B, archivos reales).
   - Aprendizaje: el pretraining como un ciclo. La cuadrícula parte de pesos reales de GPT-2.
   - Congelados: después del entrenamiento, los pesos no cambian.
   - BaseAsistente: el fine-tuning y el RLHF ajustan los mismos pesos. */
import { miles, colorPeso, Pie, Ilustrativo, useIdSvg, FiltroBrillo, suave } from './comun.jsx';
import gpt2 from '../../ejemplos/datos/gpt2.json';

const { useMemo } = React;

/* Cifras de modelos con su fuente (consultadas el 23 de noviembre de 2026). */
export const MODELOS = {
  gpt2: { nombre: 'GPT-2 pequeño', anio: 2019, parametros: gpt2.parametros_total, fuente: 'conteo propio del archivo de pesos' },
  olmo: { nombre: 'Olmo 3 7B', anio: 2025, parametros: 7298011136, fuente: 'Ai2, ficha y archivos en Hugging Face' },
  gpt3: { nombre: 'GPT-3', anio: 2020, parametros: 175e9, fuente: 'Brown et al. (2020), tabla 2.1' },
};
const OLMO_BYTES_ARCHIVOS = [4969984976, 4981161496, 4644917240];

/* Texto corto de una cifra grande: «124 millones», «7.3 mil millones», «175 mil millones». */
export function cifraCorta(n) {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1).replace('.0', '')} billones`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e11 ? 0 : 1).replace('.0', '')} mil millones`;
  if (n >= 1e6) return `${Math.round(n / 1e6)} millones`;
  return miles(n);
}

/* ---------------------------------------------------------------- Cuántos son */
export function Parametros({ paso = 0, final }) {
  const p = final ? 3 : paso;
  const min = 7;
  const max = 12;
  const pct = (v) => ((Math.log10(v) - min) / (max - min)) * 100;
  const filas = [MODELOS.gpt2, MODELOS.olmo, MODELOS.gpt3];
  const marcas = [
    [1e7, '10 millones'],
    [1e8, '100 millones'],
    [1e9, 'mil millones'],
    [1e10, '10 mil millones'],
    [1e11, '100 mil millones'],
    [1e12, '1 billón'],
  ];
  const veces = Math.round(MODELOS.gpt3.parametros / MODELOS.gpt2.parametros);
  return (
    <div className="grafico-parametros">
      <div className="eje-log">
        {marcas.map(([v, t]) => (
          <span key={v} style={{ left: `${pct(v)}%` }}>
            {t}
          </span>
        ))}
      </div>
      {filas.map((m, k) => (
        <div key={m.nombre} className={`fila-param aparece-p ${p >= k + 1 ? 'visto' : ''}`}>
          <div className="rotulo">
            <b>{m.nombre}</b>
            <small>{m.anio}</small>
          </div>
          <div className="pista">
            {marcas.map(([v]) => (
              <i key={v} style={{ left: `${pct(v)}%` }} />
            ))}
            <span className="valor" style={{ width: `${pct(m.parametros)}%` }} />
            <span className="num" style={{ left: `calc(${pct(m.parametros)}% + 10px)` }}>
              {cifraCorta(m.parametros)}
            </span>
          </div>
        </div>
      ))}
      <p className={`nota-veces aparece-p ${p >= 3 ? 'visto' : ''}`}>
        GPT-3 tiene unas <b>{miles(veces)} veces</b> los parámetros de GPT-2 pequeño.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Cuánto pesan */
export function Calculadora({ paso = 0, final }) {
  const p = final ? 3 : paso;
  const n = MODELOS.olmo.parametros;
  const bytes16 = n * 2;
  const bytes4 = n * 0.5;
  const real = OLMO_BYTES_ARCHIVOS.reduce((a, b) => a + b, 0);
  const gb = (b) => (b / 1e9).toFixed(1);
  return (
    <div className="calculadora">
      <div className="formula">
        <span>parámetros</span>
        <i>×</i>
        <span>bytes por peso</span>
        <i>=</i>
        <span className="resultado">tamaño del archivo</span>
      </div>
      <div className={`calc-fila aparece-p ${p >= 1 ? 'visto' : ''}`}>
        <div className="calc-texto">
          <b>Olmo 3 7B, con pesos de 16 bits</b>
          <span>
            {miles(n)} × 2 bytes = <b className="texto-acento">{gb(bytes16)} GB</b>
          </span>
        </div>
        <div className="bloque-archivo" style={{ '--w': '100%' }}>
          16 bits
        </div>
      </div>
      <div className={`calc-fila aparece-p ${p >= 2 ? 'visto' : ''}`}>
        <div className="calc-texto">
          <b>Sus archivos reales en Hugging Face</b>
          <span>
            3 archivos: {OLMO_BYTES_ARCHIVOS.map((b) => (b / 1e9).toFixed(2)).join(' + ')} = <b className="texto-acento">{gb(real)} GB</b>
          </span>
        </div>
        <div className="bloque-archivo real" style={{ '--w': '100%' }}>
          {OLMO_BYTES_ARCHIVOS.map((b, k) => (
            <span key={k} style={{ flex: b }} />
          ))}
        </div>
      </div>
      <div className={`calc-fila aparece-p ${p >= 3 ? 'visto' : ''}`}>
        <div className="calc-texto">
          <b>Con quantization a 4 bits</b>
          <span>
            {miles(n)} × 0.5 bytes = <b className="texto-exito">{gb(bytes4)} GB</b>, cerca de la cuarta parte
          </span>
        </div>
        <div className="bloque-archivo cuarto" style={{ '--w': '25%' }}>
          4 bits
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Cuadrícula de pesos */
/* Cambio pequeño y repetible para cada celda: ilustrativo. */
function cambio(i, j, semilla) {
  const x = Math.sin((i + 1) * 12.9898 + (j + 1) * 78.233 + semilla * 37.719) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 0.09;
}

export function Cuadricula({ ajustes = 0, congelada = false, ancho = 520, filas = 12, cols = 24 }) {
  const base = gpt2.cuadricula_atencion_capa1.valores;
  const celda = ancho / cols;
  const valores = useMemo(() => {
    const out = [];
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < cols; j++) {
        let v = base[i][j];
        for (let s = 1; s <= ajustes; s++) v += cambio(i, j, s);
        out.push({ i, j, v });
      }
    }
    return out;
  }, [ajustes, filas, cols]);
  return (
    <svg className={`diagrama cuadricula-pesos ${congelada ? 'congelada' : ''}`} viewBox={`0 0 ${ancho} ${celda * filas}`} role="img" aria-label="Cuadrícula de pesos">
      {valores.map(({ i, j, v }) => (
        <rect key={`${i}-${j}`} x={j * celda + 1} y={i * celda + 1} width={celda - 2} height={celda - 2} rx={3} style={{ fill: colorPeso(v, 0.3) }} className="celda-peso" />
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------------- Cómo se aprenden */
const PIE_APRENDER = [
  'El pretraining es un ciclo que se repite. Ejemplo de Lee y Trott (2023).',
  'Paso 1. El modelo lee un texto y predice el siguiente token.',
  'Paso 2. Compara su predicción con el token real del texto.',
  'Paso 3. Ajusta un poco los pesos para acercarse al token real.',
  'Paso 4. Repite con billones de tokens. Así se fijan los pesos.',
];

export function Aprendizaje({ paso = 0, final, quieto }) {
  const idB = useIdSvg('brillo-apr');
  const p = final ? 4 : paso;
  const estaciones = [
    { t: 'Leer y predecir', x: 250, y: 60 },
    { t: 'Comparar', x: 440, y: 250 },
    { t: 'Ajustar los pesos', x: 250, y: 440 },
    { t: 'Repetir', x: 60, y: 250 },
  ];
  return (
    <div className="programa-cuerpo">
      <div className="aprender-rejilla">
        <svg className="diagrama ciclo-svg" viewBox="-40 -40 580 580" role="img" aria-label="Ciclo del pretraining: leer y predecir, comparar, ajustar y repetir">
          <defs>
            <FiltroBrillo id={idB} fuerza={6} />
          </defs>
          <circle cx={250} cy={250} r={190} className="anillo-ciclo" />
          {!quieto ? (
            <circle r={10} className="relleno-acento" filter={`url(#${idB})`}>
              <animateMotion dur="6s" repeatCount="indefinite" path="M250 60 A190 190 0 1 1 249.9 60" />
            </circle>
          ) : null}
          {estaciones.map((e, k) => (
            <g key={k} className={`estacion-ciclo ${p >= k + 1 ? 'activa' : ''}`}>
              <circle cx={e.x} cy={e.y} r={46} />
              <text x={e.x} y={e.y} textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={700} className="t-titulo">
                {k + 1}
              </text>
              <text x={e.x} y={e.y + (k === 0 ? -64 : 66)} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={700}>
                {e.t}
              </text>
            </g>
          ))}
        </svg>
        <div className="aprender-lado">
          <div className={`ejemplo-prediccion aparece-p ${p >= 1 ? 'visto' : ''}`}>
            <span className="texto">Me gusta el café con crema y</span>
            <span className={`prediccion ${p >= 2 ? 'mala' : ''}`}>leche</span>
            <span className={`real aparece-p ${p >= 2 ? 'visto' : ''}`}>
              real: <b>azúcar</b>
            </span>
          </div>
          <div className={`aparece-p ${p >= 3 ? 'visto' : ''}`}>
            <Cuadricula ajustes={p >= 3 ? 1 : 0} ancho={400} />
            <p className="nota-cuadricula">Pesos reales de GPT-2. El cambio es ilustrativo.</p>
          </div>
          <div className={`cifras-tokens aparece-p ${p >= 4 ? 'visto' : ''}`}>
            <span>
              <b>300 mil millones</b> de tokens: GPT-3 (Brown et al., 2020)
            </span>
            <span>
              <b>5.93 billones</b> de tokens: el pretraining de Olmo 3 7B (Ai2, 2025)
            </span>
          </div>
        </div>
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE_APRENDER} paso={p} />
        {p >= 1 ? <Ilustrativo texto="Predicción ilustrativa" /> : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Los pesos se congelan */
export function Congelados({ paso = 0, final }) {
  const p = final ? 2 : paso;
  return (
    <div className="congelados">
      <div className="congelados-cuadricula">
        <Cuadricula ajustes={0} congelada={p >= 1} ancho={460} />
        <span className={`sello-congelado aparece-p ${p >= 1 ? 'visto' : ''}`}>congelados</span>
      </div>
      <div className={`congelados-lado aparece-p ${p >= 2 ? 'visto' : ''}`}>
        <div className="rebote">
          <span className="globo">tu conversación</span>
          <span className="flecha-rebote" aria-hidden="true" />
          <small>no cambia los pesos</small>
        </div>
        <div className="mini-linea">
          <span>
            <i />
            datos de entrenamiento
          </span>
          <span className="corte">
            <i />
            fecha de corte
          </span>
          <span>
            <i />
            lanzamiento
          </span>
          <span>
            <i />
            hoy
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Del modelo base al asistente */
const PIE_BASE = [
  'Los mismos pesos del pretraining: un modelo base que completa texto.',
  'Paso 1. Fine-tuning con instrucciones: ejemplos de pedidos y buenas respuestas.',
  'Paso 2. RLHF: personas ordenan respuestas y el modelo se ajusta a sus preferencias.',
  'Paso 3. Cambios pequeños en los mismos pesos: el modelo pasa de completar a responder.',
];

export function BaseAsistente({ paso = 0, final }) {
  const p = final ? 3 : paso;
  const fase = p >= 2 ? 'RLHF' : p >= 1 ? 'fine-tuning' : 'pretraining';
  return (
    <div className="programa-cuerpo">
      <div className="base-asistente">
        <div className="fases">
          {['Modelo base', 'Fine-tuning con instrucciones', 'RLHF'].map((t, k) => (
            <span key={t} className={`fase ${p >= k ? 'activa' : ''}`}>
              {t}
            </span>
          ))}
        </div>
        <div className="base-cuerpo">
          <Cuadricula ajustes={1 + Math.min(p, 2)} ancho={460} />
          <div className="salida-modelo">
            <span className="rotulo-salida">Qué hace con un pedido</span>
            <span className={`burbuja ${p >= 3 ? 'responde' : ''}`}>{p >= 3 ? 'responde el pedido' : 'continúa el texto'}</span>
            <small>Fase actual: {fase}</small>
          </div>
        </div>
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE_BASE} paso={p} />
        <Ilustrativo texto="Cambios ilustrativos" />
      </div>
    </div>
  );
}
