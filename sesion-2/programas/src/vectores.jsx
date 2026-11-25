/* Parte 2 del bloque 2.1: de token a vector. Datos reales de GPT-2 pequeño.
   - BuscarFila: el número del token elige una fila de la tabla de embeddings.
   - Nube3D: las palabras parecidas quedan cerca; la analogía rey − hombre + mujer. */
import { ancho, color, suave, miles, useFuentes, MarcaEspacio, Pie, colorPeso, useIdSvg, FiltroBrillo } from './comun.jsx';
import gpt2 from '../../ejemplos/datos/gpt2.json';

const { useMemo, useRef, useEffect } = React;

/* ---------------------------------------------------------------- Buscar la fila */
const PIE_FILA = [
  'El token «·token» de GPT-2 pequeño. Su número en el vocabulario es el 11241.',
  'Paso 1. El tokenizer ya hizo su trabajo: el modelo recibe el número 11241.',
  'Paso 2. Ese número elige una fila de la tabla de embeddings: la fila 11241.',
  'Paso 3. La fila sale como una lista de 768 números: el vector del token.',
  'Paso 4. La tabla entera es parte de los pesos. Otra tabla aporta la posición.',
];

export function BuscarFila({ paso = 0, final }) {
  useFuentes();
  const idB = useIdSvg('brillo-fila');
  const p = final ? 4 : paso;
  const fila = gpt2.fila;
  const tabla = gpt2.tabla_embeddings;
  const filasVisibles = 21;
  const yTabla = 34;
  const altoFila = 17;
  const objetivo = 10; // la fila 11241 se dibuja en el centro de la muestra
  const valores = fila.primeros_valores;
  const max = Math.max(Math.abs(fila.minimo), Math.abs(fila.maximo));
  return (
    <div className="programa-cuerpo">
      <svg className="diagrama prog-svg" viewBox="0 0 1200 470" role="img" aria-label="El número del token elige una fila de la tabla de embeddings de GPT-2">
        <defs>
          <FiltroBrillo id={idB} fuerza={6} />
        </defs>
        {/* Paso 1: el token y su número */}
        <g className={`aparece-p ${p >= 1 ? 'visto' : ''}`}>
          <rect x={10} y={168} width={200} height={96} rx={16} fill={suave('var(--t1)', 20)} stroke="var(--t1)" strokeWidth={2.5} />
          <MarcaEspacio x={46} y={210} px={30} />
          <text x={64} y={200} dominantBaseline="central" fontSize={30} fontWeight={600}>
            token
          </text>
          <text x={110} y={240} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={700} className="t-acento">
            {fila.id}
          </text>
          <path d="M214 216 H292" className={`arista acento ${p >= 2 ? '' : 'oculto'}`} strokeWidth={3} />
          <path d="M296 216 l-14 -9 v18z" className={`relleno-acento ${p >= 2 ? '' : 'oculto'}`} />
        </g>

        {/* La tabla: 50 257 filas y 768 columnas. Se dibuja una muestra de filas alrededor de la 11241. */}
        <g className={`aparece-p ${p >= 2 ? 'visto' : ''}`}>
          <text x={520} y={14} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} className="t-suave">
            Tabla de embeddings · {miles(tabla.filas)} filas × {tabla.columnas} columnas
          </text>
          {Array.from({ length: filasVisibles }).map((_, k) => {
            const n = fila.id - objetivo + k;
            const y = yTabla + 6 + k * altoFila;
            const esta = k === objetivo;
            return (
              <g key={k}>
                <text x={372} y={y + altoFila / 2} textAnchor="end" dominantBaseline="central" fontSize={12} className={esta ? 't-acento' : 't-tenue'} fontWeight={esta ? 700 : 400}>
                  {n}
                </text>
                <rect x={382} y={y + 1} width={300} height={altoFila - 3} rx={3} className={esta && p >= 2 ? 'fila-tabla elegida' : 'fila-tabla'} filter={esta && p >= 2 ? `url(#${idB})` : undefined} />
              </g>
            );
          })}
          <text x={532} y={yTabla + 6 + filasVisibles * altoFila + 18} textAnchor="middle" dominantBaseline="central" fontSize={14} className="t-tenue">
            … filas de la 0 a la {miles(tabla.filas - 1)}
          </text>
          {!final && p === 2 ? <rect className="barrido-fila" x={382} y={yTabla + 6} width={300} height={altoFila - 3} rx={3} /> : null}
        </g>

        {/* Paso 3: la fila sale como una tira de celdas de colores, con sus valores reales */}
        <g className={`aparece-p desliza-der ${p >= 3 ? 'visto' : ''}`}>
          <text x={950} y={150} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700}>
            El vector de «token»
          </text>
          {valores.map((v, k) => {
            const col = k % 16;
            const fil = Math.floor(k / 16);
            return <rect key={k} x={732 + col * 27} y={176 + fil * 34} width={24} height={30} rx={5} fill={colorPeso(v, max)} stroke="var(--borde)" strokeWidth={1} />;
          })}
          {valores.slice(0, 6).map((v, k) => (
            <text key={k} x={745 + k * 27} y={262} textAnchor="end" dominantBaseline="central" fontSize={12} className="t-suave" transform={`rotate(-50 ${745 + k * 27} 262)`}>
              {v.toFixed(3)}
            </text>
          ))}
          <text x={950} y={310} textAnchor="middle" dominantBaseline="central" fontSize={16} className="t-suave">
            Se ven 32 de sus 768 números. Cian: positivo · rosa: negativo.
          </text>
          <path d="M690 216 C 710 216, 712 200, 728 196" className="arista acento" />
        </g>

        {/* Paso 4: la tabla es parte de los pesos; la posición viene de otra tabla */}
        <g className={`aparece-p ${p >= 4 ? 'visto' : ''}`}>
          <rect x={706} y={348} width={492} height={114} rx={16} className="panel-fondo" />
          <text x={952} y={378} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={700} className="t-acento">
            {miles(tabla.filas)} × {tabla.columnas} = {miles(tabla.filas * tabla.columnas)} pesos
          </text>
          <text x={952} y={408} textAnchor="middle" dominantBaseline="central" fontSize={15} className="t-suave">
            La tabla se aprende en el entrenamiento: es parte de los pesos.
          </text>
          <text x={952} y={436} textAnchor="middle" dominantBaseline="central" fontSize={15} className="t-suave">
            Otra tabla, de {miles(1024)} filas, le dice al modelo el orden de los tokens.
          </text>
        </g>
      </svg>
      <Pie textos={PIE_FILA} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- Nube 3D */
const GRUPOS = {
  lenguajes: { nombre: 'Lenguajes de programación', c: 'var(--t1)' },
  'países': { nombre: 'Países', c: 'var(--t2)' },
  'números': { nombre: 'Números', c: 'var(--t4)' },
  comida: { nombre: 'Comida', c: 'var(--t5)' },
  personas: { nombre: 'Personas', c: 'var(--t3)' },
};
const R = 230;
const ESTIRAR = 1.35; // separa los grupos en el plano horizontal; solo cambia la vista

/* Segmento 3D entre dos puntos, como un div rotado. Ver la explicación del ángulo en programas/README.md. */
function Segmento({ a, b, c }) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const largo = Math.hypot(dx, dy, dz);
  const phi = Math.asin(dy / largo);
  const theta = Math.atan2(-dz, dx);
  return (
    <div
      className="segmento3d"
      style={{
        width: `${largo}px`,
        '--c': c,
        transform: `translate3d(${a[0]}px, ${a[1]}px, ${a[2]}px) rotateY(${theta}rad) rotateZ(${phi}rad)`,
      }}
    >
      <span className="punta" />
    </div>
  );
}

const PIE_NUBE = [
  'Cada punto es el vector de una palabra en GPT-2, reducido a 3 dimensiones. Las parecidas quedan juntas.',
  'La flecha de «man» a «woman» es casi paralela a la de «king» a «queen»: una analogía.',
];

/* Ángulo de giro en el que las flechas de la analogía se ven de lado, con todo su largo. */
const ANGULO_ANALOGIA = 60;
const VUELTA_SEGUNDOS = 46;

export function Nube3D({ paso = 0, final, quieto }) {
  const p = final ? 1 : paso;
  const puntos = gpt2.espacio_3d.puntos;
  const pos = (pal) => {
    const q = puntos.find((k) => k.palabra === pal);
    return [q.x * R * ESTIRAR, -q.y * R, q.z * R * ESTIRAR];
  };
  const plano = document.documentElement.classList.contains('sin-3d');
  const analogia = gpt2.analogia;
  const giro = useRef(null);
  const angulo = useRef(-24);
  const pasoRef = useRef(p);
  pasoRef.current = p;

  // El giro lo mueve JavaScript: así, en el paso de la analogía, la nube frena suave en su mejor ángulo.
  useEffect(() => {
    const el = giro.current;
    if (!el) return undefined;
    const poner = () => el.style.setProperty('--ang', `${angulo.current}deg`);
    if (quieto) {
      angulo.current = ANGULO_ANALOGIA;
      poner();
      return undefined;
    }
    let anterior = performance.now();
    let id = 0;
    const cuadro = (ahora) => {
      const dt = Math.min(0.05, (ahora - anterior) / 1000);
      anterior = ahora;
      if (pasoRef.current >= 1) {
        // Va al ángulo de la analogía por el camino más corto.
        let d = ((ANGULO_ANALOGIA - angulo.current) % 360 + 540) % 360 - 180;
        angulo.current += d * Math.min(1, dt * 2.2);
      } else {
        angulo.current = (angulo.current + (360 / VUELTA_SEGUNDOS) * dt) % 360;
      }
      poner();
      id = requestAnimationFrame(cuadro);
    };
    id = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(id);
  }, [quieto, plano]);

  return (
    <div className="programa-cuerpo">
      <div className="nube-envoltura">
        {plano ? (
          <NubePlana puntos={puntos} conFlechas={p >= 1} />
        ) : (
          <div className={`nube3d ${p >= 1 ? 'con-analogia' : ''}`} aria-label="Nube de palabras en tres dimensiones">
            <div className="nube3d-giro" ref={giro}>
              {puntos.map((q) => (
                <div key={q.palabra} className={`punto3d ${q.grupo === 'personas' ? 'persona' : ''}`} style={{ transform: `translate3d(${q.x * R * ESTIRAR}px, ${-q.y * R}px, ${q.z * R * ESTIRAR}px)`, '--c': GRUPOS[q.grupo].c }}>
                  <div className="punto3d-cara">
                    <i />
                    <b>{q.palabra}</b>
                    {q.grupo === 'personas' ? <small>{q.es}</small> : null}
                  </div>
                </div>
              ))}
              {p >= 1 ? (
                <>
                  <Segmento a={pos('man')} b={pos('woman')} c="var(--t3)" />
                  <Segmento a={pos('king')} b={pos('queen')} c="var(--t3)" />
                </>
              ) : null}
            </div>
          </div>
        )}
        <div className="nube-leyenda">
          {Object.entries(GRUPOS).map(([k, g]) => (
            <span key={k} style={{ '--c': g.c }}>
              <i />
              {g.nombre}
            </span>
          ))}
          <div className={`nube-analogia aparece-p ${p >= 1 ? 'visto' : ''}`}>
            <b>king − man + woman</b>
            <span>
              La palabra más cercana al resultado es <b className="texto-acento">{analogia.mas_cercanas[0]}</b>.
            </span>
            <small>Cálculo con los 768 números de cada vector, sin contar las tres palabras de la pregunta.</small>
          </div>
        </div>
      </div>
      <Pie textos={PIE_NUBE} paso={p} />
    </div>
  );
}

/* Versión plana para ?sin3d=1: las mismas posiciones, vistas desde el ángulo de la analogía.
   Los rótulos que chocan se corren hacia abajo para que se lean. */
function NubePlana({ puntos, conFlechas }) {
  useFuentes();
  const idM = useIdSvg('punta-nube');
  const a = (ANGULO_ANALOGIA * Math.PI) / 180;
  const proy = puntos.map((q) => ({ ...q, px: 300 + (q.x * Math.cos(a) + q.z * Math.sin(a)) * 330 * ESTIRAR * 0.8, py: 240 - q.y * 215 }));
  // Rótulos sin choques: de arriba abajo, cada uno baja si toca a uno ya puesto.
  const puestos = [];
  [...proy].sort((m, n) => m.py - n.py).forEach((q) => {
    const w = ancho(q.palabra, 15, 600) + 6;
    let ty = q.py;
    let intentos = 0;
    while (intentos < 12 && puestos.some((r) => Math.abs(r.ty - ty) < 17 && q.px + 11 < r.x + r.w && r.x < q.px + 11 + w)) {
      ty += 17;
      intentos += 1;
    }
    puestos.push({ x: q.px + 11, ty, w, palabra: q.palabra });
    q.ty = ty;
  });
  const buscar = (pal) => proy.find((k) => k.palabra === pal);
  const flecha = (m, n) => {
    const p = buscar(m);
    const q = buscar(n);
    return <path d={`M${p.px} ${p.py} L${q.px} ${q.py}`} className="arista" style={{ stroke: 'var(--t3)', strokeWidth: 4 }} markerEnd={`url(#${idM})`} />;
  };
  return (
    <svg className="diagrama nube-plana" viewBox="0 0 660 500" role="img" aria-label="Nube de palabras vista desde un ángulo fijo">
      <defs>
        <marker id={idM} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 10 5 0 10z" style={{ fill: 'var(--t3)' }} />
        </marker>
      </defs>
      {proy.map((q) => (
        <g key={q.palabra} opacity={conFlechas && q.grupo !== 'personas' ? 0.45 : 1}>
          <circle cx={q.px} cy={q.py} r={6} style={{ fill: GRUPOS[q.grupo].c }} />
          <text x={q.px + 11} y={q.ty} dominantBaseline="central" fontSize={15} fontWeight={600}>
            {q.palabra}
          </text>
        </g>
      ))}
      {conFlechas ? (
        <>
          {flecha('man', 'woman')}
          {flecha('king', 'queen')}
        </>
      ) : null}
    </svg>
  );
}
