/* El mapa de la sesión 3: el camino de un caso dentro de un programa.
   - MapaSesion: el mapa grande que abre cada bloque. modo '31' ilumina el prompt y la validación;
     modo '32', la llamada por API y la prueba; modo 'sintesis', todo el camino.
   - Minimapa: la versión pequeña que va al inicio de cada parte, con la pieza de esa parte iluminada. */
import { ancho, useFuentes, useIdSvg, Particulas, Pie } from './comun.jsx';

export const NODOS = [
  { id: 'caso', titulo: ['Caso'], corto: 'Caso', sub: 'un ticket de soporte' },
  { id: 'prompt', titulo: ['Prompt'], corto: 'Prompt', sub: 'instrucciones, contexto, ejemplos y formato' },
  { id: 'api', titulo: ['Llamada', 'por API'], corto: 'API', sub: 'mensajes y parámetros' },
  { id: 'modelo', titulo: ['Modelo'], corto: 'Modelo', sub: 'Claude o Gemini' },
  { id: 'cruda', titulo: ['Respuesta', 'cruda'], corto: 'Cruda', sub: 'el texto que devuelve' },
  { id: 'validacion', titulo: ['Validación'], corto: 'Validación', sub: '¿cumple el esquema?' },
  { id: 'registro', titulo: ['Registro'], corto: 'Registro', sub: 'los campos listos' },
  { id: 'prueba', titulo: ['Prueba'], corto: 'Prueba', sub: '«pasa» o «falla»' },
];

const BLOQUE = {
  31: { ids: ['prompt', 'validacion'], rotulo: 'Bloque 3.1' },
  32: { ids: ['api', 'prueba'], rotulo: 'Bloque 3.2' },
  sintesis: { ids: NODOS.map((n) => n.id), rotulo: 'Sesión 3' },
};

/* Parte un texto en líneas que no pasen de anchoMax, midiendo con la fuente real. */
export function partirLineas(texto, px, anchoMax, peso = 500) {
  const palabras = texto.split(' ');
  const lineas = [];
  let actual = '';
  palabras.forEach((p) => {
    const prueba = actual ? `${actual} ${p}` : p;
    if (actual && ancho(prueba, px, peso) > anchoMax) {
      lineas.push(actual);
      actual = p;
    } else actual = prueba;
  });
  if (actual) lineas.push(actual);
  return lineas;
}

const PIE_MAPA = {
  31: [
    'El camino de un caso dentro de un programa: del ticket a la prueba que da «pasa» o «falla».',
    'Este bloque trata dos piezas: cómo escribir el prompt y cómo validar la respuesta con un esquema.',
  ],
  32: [
    'El mismo camino del bloque 3.1. Ahora miramos la llamada por API y cómo se prueba.',
    'Este bloque trata la llamada: mensajes, parámetros y razonamiento. Y cómo comparar variantes con pruebas.',
  ],
  sintesis: ['El camino completo de la sesión 3.'],
};

export function MapaSesion({ paso = 0, final, quieto, modo = '31' }) {
  useFuentes();
  const idP = useIdSvg('punta-mapa');
  const p = final ? 1 : paso;
  const activos = p >= 1 || modo === 'sintesis' ? BLOQUE[modo].ids : [];
  const w = 122;
  const gap = 20;
  const x0 = (1160 - (NODOS.length * w + (NODOS.length - 1) * gap)) / 2;
  const y0 = 58;
  const h = 100;
  const centroY = y0 + h / 2;
  const camino = `M${x0 + w / 2} ${centroY} H${x0 + 7 * (w + gap) + w / 2}`;
  return (
    <div className="programa-cuerpo">
      <svg className="diagrama mapa-sesion" viewBox="0 0 1160 280" role="img" aria-label="El camino de un caso dentro de un programa">
        <defs>
          <marker id={idP} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 10 5 0 10z" className="relleno-tenue" />
          </marker>
        </defs>
        {NODOS.slice(0, -1).map((n, i) => {
          const xa = x0 + i * (w + gap) + w;
          return <path key={n.id} className="arista" d={`M${xa + 2} ${centroY} H${xa + gap - 3}`} markerEnd={`url(#${idP})`} />;
        })}
        <Particulas d={camino} n={2} c="var(--acento)" dur={6} r={6} quieto={quieto} />
        {NODOS.map((n, i) => {
          const x = x0 + i * (w + gap);
          const on = activos.includes(n.id);
          const apagado = activos.length > 0 && !on;
          const lineas = partirLineas(n.sub, 15, w + 8);
          return (
            <g key={n.id} className={apagado ? 'nodo-apagado' : ''}>
              <g className={`nodo ${on ? 'acento nodo-encendido' : ''}`}>
                <rect x={x} y={y0} width={w} height={h} rx={16} />
                {n.titulo.map((t, k) => (
                  <text key={t} x={x + w / 2} y={centroY + (k - (n.titulo.length - 1) / 2) * 24} textAnchor="middle" dominantBaseline="central" fontSize={20} className="t-titulo">
                    {t}
                  </text>
                ))}
              </g>
              {lineas.map((l, k) => (
                <text key={l} x={x + w / 2} y={y0 + h + 24 + k * 19} textAnchor="middle" dominantBaseline="central" fontSize={15} className="t-suave">
                  {l}
                </text>
              ))}
              {on && modo !== 'sintesis' ? (
                <g className="chip-bloque">
                  <rect x={x + 6} y={y0 - 42} width={w - 12} height={28} rx={14} />
                  <text x={x + w / 2} y={y0 - 28} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700}>
                    {BLOQUE[modo].rotulo}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      <Pie textos={PIE_MAPA[modo]} paso={modo === 'sintesis' ? 0 : p} />
    </div>
  );
}

export function Minimapa({ resaltar = '' }) {
  useFuentes();
  const idM = useIdSvg('punta-mini');
  const activos = resaltar.split(',').map((s) => s.trim()).filter(Boolean);
  const gap = 16;
  const w = (1200 - gap * (NODOS.length - 1)) / NODOS.length;
  const y0 = 10;
  const h = 56;
  return (
    <svg className="diagrama minimapa" viewBox="0 0 1200 76" role="img" aria-label={`Mapa de la sesión. Esta parte: ${activos.join(', ')}`}>
      <defs>
        <marker id={idM} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 10 5 0 10z" className="relleno-tenue" />
        </marker>
      </defs>
      {NODOS.slice(0, -1).map((n, i) => {
        const xa = i * (w + gap) + w;
        return <path key={n.id} className="arista" d={`M${xa + 1} ${y0 + h / 2} H${xa + gap - 2}`} markerEnd={`url(#${idM})`} />;
      })}
      {NODOS.map((n, i) => {
        const on = activos.includes(n.id);
        const px = Math.min(26, (26 * (w - 18)) / Math.max(1, ancho(n.corto, 26, 700, 'Space Grotesk')));
        return (
          <g key={n.id} className={`nodo ${on ? 'acento mini-activo' : 'mini-apagado'}`}>
            <rect x={i * (w + gap)} y={y0} width={w} height={h} rx={14} />
            <text x={i * (w + gap) + w / 2} y={y0 + h / 2} textAnchor="middle" dominantBaseline="central" fontSize={px} className="t-titulo">
              {n.corto}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
