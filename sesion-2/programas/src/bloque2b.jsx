/* Programas del bloque 2.2 que usan cifras verificadas con fuente primaria (23 de noviembre de 2026).
   - PlausibleFalso: un paquete que no existe, con el caso de Lasso Security y Spracklen et al. (2025).
   - FechaCorte: la línea de tiempo del corte, el lanzamiento y una versión posterior de LangChain.
   - Precios: los precios por millón de tokens y el costo de un laboratorio. */
import { Pie, Ilustrativo, miles } from './comun.jsx';
import { DATOS } from './datos_bloque2.jsx';

/* ---------------------------------------------------------------- Plausible, pero falso */
const PIE_PLAUSIBLE = [
  'Pregunta de un desarrollador. El modelo elige cada token por probabilidad, sin consultar una fuente.',
  'Paso 1. Los candidatos: todos se ven razonables para el modelo.',
  'Paso 2. El elegido suena correcto, pero ese paquete no existía.',
  'Paso 3. No es un caso aislado: pasa a gran escala en los modelos que generan código.',
  'Paso 4. El riesgo: alguien registra ese nombre y quien copia el comando instala su paquete.',
];

export function PlausibleFalso({ paso = 0, final }) {
  const p = final ? 4 : paso;
  const d = DATOS.plausible;
  return (
    <div className="programa-cuerpo">
      <div className="plausible">
        <div className="plausible-pregunta">
          <span className="rol">usuario</span>
          {d.pregunta}
        </div>
        <div className={`plausible-candidatos aparece-p ${p >= 1 ? 'visto' : ''}`}>
          <span className="rotulo">Comandos candidatos</span>
          {d.candidatos.map((c, i) => (
            <div key={c.texto} className={`candidato ${p >= 2 && i === 0 ? 'elegido' : ''} ${p >= 2 && c.real ? 'real' : ''}`}>
              <code>{c.texto}</code>
              <span className="barra-candidato"><i style={{ width: `${c.prob}%` }} /></span>
              <span className="prob">{c.prob} %</span>
              {p >= 2 && i === 0 ? <span className="sello no-existe">no existía</span> : null}
              {p >= 2 && c.real ? <span className="sello existe">sí existe</span> : null}
            </div>
          ))}
        </div>
        <div className={`plausible-escala aparece-p ${p >= 3 ? 'visto' : ''}`}>
          {d.escala.map((e) => (
            <div key={e.rotulo} className="cifra-escala-b">
              <b>{e.valor}</b>
              <span>{e.rotulo}</span>
            </div>
          ))}
          <small>{d.fuenteEscala}</small>
        </div>
        <div className={`plausible-riesgo aparece-p ${p >= 4 ? 'visto' : ''}`}>
          <b>{d.riesgoTitulo}</b>
          <span>{d.riesgoTexto}</span>
          <small>{d.fuenteRiesgo}</small>
        </div>
      </div>
      <div className="fila-marcas">
        <Pie textos={PIE_PLAUSIBLE} paso={p} />
        {p >= 1 ? <Ilustrativo texto="Probabilidades ilustrativas" /> : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- La fecha de corte */
const PIE_CORTE = [
  'Los pesos se congelan al final del entrenamiento. Lo que pasó después no está en ellos.',
  'Paso 1. La fecha de corte: el final de los datos de entrenamiento.',
  'Paso 2. El lanzamiento llega meses después del corte.',
  'Paso 3. El mundo sigue: una nueva versión de LangChain sale después del corte.',
  'Paso 4. Si preguntas por ella, el modelo no la conoce. Puede inventar una respuesta plausible.',
];

export function FechaCorte({ paso = 0, final }) {
  const p = final ? 4 : paso;
  const t = DATOS.corte;
  const inicio = t.inicio;
  const fin = t.fin;
  const pos = (fecha) => ((new Date(fecha) - new Date(inicio)) / (new Date(fin) - new Date(inicio))) * 100;
  return (
    <div className="programa-cuerpo">
      <div className="linea-corte">
        <div className="riel-corte">
          <span className="tramo-datos" style={{ width: `${pos(t.hitos[0].fecha)}%` }}>datos de entrenamiento</span>
          <span className={`tramo-despues aparece-p ${p >= 1 ? 'visto' : ''}`} style={{ left: `${pos(t.hitos[0].fecha)}%` }}>los pesos no saben esto</span>
        </div>
        {t.hitos.map((h, i) => (
          <div key={h.rotulo} className={`hito-corte ${h.clase} aparece-p ${p >= i + 1 || (i === 3 && p >= 3) ? 'visto' : ''}`} style={{ left: `${pos(h.fecha)}%` }}>
            <i />
            <b>{h.rotulo}</b>
            <small>{h.texto}</small>
          </div>
        ))}
        <div className={`pregunta-corte aparece-p ${p >= 4 ? 'visto' : ''}`}>
          <span className="rol">usuario</span>
          «¿Qué cambió en LangChain 1.5.0?»
          <span className="respuesta-corte">El modelo no la conoce: puede inventar. La solución es darle la información, con herramientas y contexto (sesiones 5 y 6).</span>
        </div>
      </div>
      <Pie textos={PIE_CORTE} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- Los precios */
const PIE_PRECIOS = [
  'Precios por millón de tokens, en dólares. La salida cuesta más que la entrada.',
  'Paso 1. El costo de un laboratorio por estudiante: 50 llamadas de 2 000 tokens de entrada y 500 de salida.',
  'Paso 2. Un modelo grande cuesta decenas de veces más. Para la mayoría de las tareas del curso no hace falta.',
];

export function Precios({ paso = 0, final }) {
  const p = final ? 2 : paso;
  const modelos = DATOS.precios.modelos;
  const max = Math.max(...modelos.map((m) => m.salida));
  const lmin = Math.log10(0.05);
  const lmax = Math.log10(max * 1.4);
  const ancho = (v) => ((Math.log10(v) - lmin) / (lmax - lmin)) * 100;
  const marcas = [0.1, 1, 10].filter((v) => v < max * 1.4);
  return (
    <div className="programa-cuerpo">
      <div className="precios">
        <div className="eje-precios">
          {marcas.map((v) => (
            <span key={v} style={{ left: `${ancho(v)}%` }}>USD {v}</span>
          ))}
        </div>
        {modelos.map((m) => {
          const lab = 50 * ((2000 * m.entrada) / 1e6 + (500 * m.salida) / 1e6);
          return (
            <div key={m.nombre} className={`fila-precio ${m.contraste ? 'contraste' : ''} ${p >= 2 && m.contraste ? 'resaltada' : ''}`}>
              <span className="nombre">
                <b>{m.nombre}</b>
                <small>{m.proveedor}</small>
              </span>
              <span className="pistas-precio">
                <span className="pista-p">
                  {marcas.map((v) => <i key={v} style={{ left: `${ancho(v)}%` }} />)}
                  <span className="valor-p entrada" style={{ width: `${ancho(m.entrada)}%` }} />
                  <em style={{ left: `calc(${ancho(m.entrada)}% + 8px)` }}>{m.entrada.toFixed(2)}</em>
                </span>
                <span className="pista-p">
                  {marcas.map((v) => <i key={v} style={{ left: `${ancho(v)}%` }} />)}
                  <span className="valor-p salida" style={{ width: `${ancho(m.salida)}%` }} />
                  <em style={{ left: `calc(${ancho(m.salida)}% + 8px)` }}>{m.salida.toFixed(2)}</em>
                </span>
              </span>
              <span className={`costo-lab aparece-p ${p >= 1 ? 'visto' : ''}`}>
                USD {lab < 0.1 ? lab.toFixed(4) : lab.toFixed(2)}
                <small>por laboratorio</small>
              </span>
            </div>
          );
        })}
        <div className="leyenda-precios">
          <span><i className="entrada" />entrada</span>
          <span><i className="salida" />salida</span>
          <span>USD por millón de tokens, en escala logarítmica</span>
        </div>
      </div>
      <Pie textos={PIE_PRECIOS} paso={p} />
    </div>
  );
}

export { miles };

/* ---------------------------------------------------------------- Tareas cada vez más largas (METR) */
const PIE_HORIZONTE = [
  'METR mide qué tan largas son las tareas de software que completa un agente con 50 % de éxito.',
  'Paso 1. Cada punto es un modelo, en su fecha de lanzamiento. El eje usa escala logarítmica.',
  'Paso 2. La tendencia: la duración de esas tareas se duplica cada 3.6 meses.',
  'Paso 3. Las líneas son la incertidumbre. En los modelos más nuevos es enorme.',
];
const ETIQUETAS_H = ['GPT-4o', 'o1', 'GPT-5', 'Claude Opus 4.6', 'GPT-6 Astra'];

function duracion(min) {
  if (min < 60) return `${Math.round(min)} min`;
  const h = min / 60;
  return `${h < 10 ? h.toFixed(1) : Math.round(h)} h`;
}

export function Horizonte({ paso = 0, final }) {
  const p = final ? 3 : paso;
  const { modelos, tendencia } = DATOS.horizonte;
  const x0 = 110;
  const x1 = 1150;
  const yA = 30;
  const yB = 380;
  const t0 = new Date('2024-03-01').getTime();
  const t1 = new Date('2026-11-01').getTime();
  const lmin = 0;
  const lmax = Math.log10(12000);
  const X = (fecha) => x0 + ((new Date(fecha).getTime() - t0) / (t1 - t0)) * (x1 - x0);
  const Y = (min) => yB - ((Math.log10(Math.max(min, 1)) - lmin) / (lmax - lmin)) * (yB - yA);
  const marcasY = [
    [1, '1 min'],
    [10, '10 min'],
    [60, '1 h'],
    [600, '10 h'],
    [6000, '100 h'],
  ];
  const marcasX = ['2024-07-01', '2025-01-01', '2025-07-01', '2026-01-01', '2026-07-01'];
  const etiquetaX = (f) => {
    const [a, m] = f.split('-');
    return `${m === '01' ? 'ene' : 'jul'} ${a}`;
  };
  const recorte = (min) => Math.min(min, 11500);
  return (
    <div className="programa-cuerpo">
      <svg className="diagrama prog-svg" viewBox="0 0 1200 430" role="img" aria-label="Horizonte de tiempo de las tareas que completan los agentes, por fecha de lanzamiento del modelo">
        {marcasY.map(([v, t]) => (
          <g key={v}>
            <path d={`M${x0} ${Y(v)} H${x1}`} className="linea-guia" />
            <text x={x0 - 12} y={Y(v)} textAnchor="end" dominantBaseline="central" fontSize={15} className="t-suave">
              {t}
            </text>
          </g>
        ))}
        {marcasX.map((f) => (
          <text key={f} x={X(f)} y={yB + 24} textAnchor="middle" dominantBaseline="central" fontSize={15} className="t-suave">
            {etiquetaX(f)}
          </text>
        ))}
        <text x={x0} y={yB + 46} dominantBaseline="central" fontSize={14} className="t-tenue">
          Fecha de lanzamiento del modelo
        </text>
        <text x={14} y={yA - 12} dominantBaseline="central" fontSize={14} className="t-tenue">
          Duración de la tarea para un experto humano
        </text>

        {/* Paso 3: intervalos de confianza del 95 % */}
        <g className={`aparece-p ${p >= 3 ? 'visto' : ''}`}>
          {modelos.map((m) => (
            <g key={`ic${m.modelo}`}>
              <path d={`M${X(m.fecha)} ${Y(m.bajo)} V${Y(recorte(m.alto))}`} className="intervalo" />
              {m.alto > 11500 ? <path d={`M${X(m.fecha) - 6} ${Y(11500) + 9} L${X(m.fecha)} ${Y(11500)} L${X(m.fecha) + 6} ${Y(11500) + 9}`} className="intervalo" /> : null}
            </g>
          ))}
        </g>

        {/* Paso 2: la tendencia */}
        <g className={`aparece-p ${p >= 2 ? 'visto' : ''}`}>
          <path d={`M${X(tendencia.desde)} ${Y(tendencia.minDesde)} L${X(tendencia.hasta)} ${Y(tendencia.minHasta)}`} className="tendencia" />
          <rect x={150} y={60} width={420} height={62} rx={14} className="panel-fondo" />
          <text x={170} y={82} dominantBaseline="central" fontSize={20} fontWeight={700} className="t-acento">
            Se duplica cada {tendencia.duplicacion.toFixed(1)} meses
          </text>
          <text x={170} y={106} dominantBaseline="central" fontSize={14} className="t-suave">
            Intervalo del 95 %: de {tendencia.bajo.toFixed(1)} a {tendencia.alto.toFixed(1)} meses
          </text>
        </g>

        {/* Paso 1: los modelos */}
        <g className={`aparece-p ${p >= 1 ? 'visto' : ''}`}>
          {modelos.map((m) => (
            <circle key={m.modelo} cx={X(m.fecha)} cy={Y(m.min)} r={m.frontera ? 8 : 6} className={m.frontera ? 'punto-h frontera' : 'punto-h'} />
          ))}
          {modelos
            .filter((m) => ETIQUETAS_H.includes(m.modelo))
            .map((m) => {
              const derecha = m.modelo !== 'GPT-6 Astra';
              return (
                <text key={`e${m.modelo}`} x={X(m.fecha) + (derecha ? 14 : -14)} y={Y(m.min) + (m.modelo === 'GPT-6 Astra' ? -16 : 14)} textAnchor={derecha ? 'start' : 'end'} dominantBaseline="central" fontSize={15} fontWeight={600}>
                  {m.modelo} · {duracion(m.min)}
                </text>
              );
            })}
        </g>
      </svg>
      <div className="fila-marcas">
        <Pie textos={PIE_HORIZONTE} paso={p} />
      </div>
    </div>
  );
}
