/* Monta los programas de la sesión 2 en las diapositivas o en su página propia.
   - En una presentación de reveal.js: cada <div data-programa="nombre"> recibe sus pasos como fragmentos
     invisibles. El docente solo presiona la flecha; al retroceder, el paso se deshace.
   - En una página sola (programas/*.html): el programa trae sus botones de Anterior y Siguiente.
   - Con movimiento reducido, sin 3D o al imprimir: el programa muestra su estado final completo.
   Este archivo se compila con esbuild a un IIFE (ver programas/README.md). Debe cargarse antes de deck.js. */
import { cargarFuentes } from './comun.jsx';
import { Mapa, Minimapa } from './mapa.jsx';
import { CortarNumerar, Bpe, Idiomas, Demo } from './tokens.jsx';
import { BuscarFila, Nube3D } from './vectores.jsx';
import { Atencion } from './atencion.jsx';
import { Cabezas } from './cabezas.jsx';
import { Encoder } from './encoder.jsx';
import { Decoder } from './decoder.jsx';
import { Traduccion } from './traduccion.jsx';
import { Parametros, Calculadora, Aprendizaje, Congelados, BaseAsistente } from './pesos.jsx';
import { Llamada } from './llamada.jsx';
import { Razonamiento, Adivinar, Sesgo, Cuenta, CostoAcierto, PruebasCapa, DondePesos } from './bloque2.jsx';
import { PlausibleFalso, FechaCorte, Precios, Horizonte } from './bloque2b.jsx';

const { useState, useEffect } = React;

/* Nombre del programa → componente y número de pasos (clics). */
export const REGISTRO = {
  mapa: { componente: Mapa, pasos: 1, titulo: 'El mapa de un LLM', props: { modo: 'apertura' } },
  'mapa-pesos': { componente: Mapa, pasos: 5, titulo: '¿Dónde están los pesos?', props: { modo: 'pesos' } },
  'mapa-sintesis': { componente: Mapa, pasos: 0, titulo: 'Síntesis', props: { modo: 'sintesis' } },
  minimapa: { componente: Minimapa, pasos: 0 },
  cortar: { componente: CortarNumerar, pasos: 5, titulo: 'Cortar y numerar' },
  bpe: { componente: Bpe, pasos: 4, titulo: 'Cómo se arma el vocabulario' },
  idiomas: { componente: Idiomas, pasos: 2 },
  demo: { componente: Demo, pasos: 0, titulo: 'Demostración en vivo' },
  fila: { componente: BuscarFila, pasos: 4, titulo: 'Buscar la fila' },
  nube: { componente: Nube3D, pasos: 1, titulo: 'El espacio de los significados' },
  atencion: { componente: Atencion, pasos: 6, titulo: 'La atención' },
  cabezas: { componente: Cabezas, pasos: 5, titulo: 'Muchas cabezas' },
  encoder: { componente: Encoder, pasos: 5, titulo: 'El encoder' },
  decoder: { componente: Decoder, pasos: 6, titulo: 'El decoder' },
  traduccion: { componente: Traduccion, pasos: 5, titulo: 'Encoder y decoder juntos' },
  parametros: { componente: Parametros, pasos: 3 },
  calculadora: { componente: Calculadora, pasos: 3 },
  aprendizaje: { componente: Aprendizaje, pasos: 4, titulo: 'Cómo se aprenden' },
  congelados: { componente: Congelados, pasos: 2 },
  'base-asistente': { componente: BaseAsistente, pasos: 3 },
  llamada: { componente: Llamada, pasos: 3, titulo: 'Una llamada' },
  // Bloque 2.2
  razonamiento: { componente: Razonamiento, pasos: 3, titulo: 'Razonar antes de responder' },
  horizonte: { componente: Horizonte, pasos: 3, titulo: 'Tareas cada vez más largas' },
  plausible: { componente: PlausibleFalso, pasos: 4, titulo: 'Plausible, pero falso' },
  adivinar: { componente: Adivinar, pasos: 4, titulo: 'Adivinar o decir no sé' },
  sesgo: { componente: Sesgo, pasos: 3, titulo: 'Sesgos en los embeddings' },
  'fecha-corte': { componente: FechaCorte, pasos: 4, titulo: 'La fecha de corte' },
  'donde-pesos': { componente: DondePesos, pasos: 3, titulo: 'Dónde están los pesos' },
  cuenta: { componente: Cuenta, pasos: 4, titulo: 'La cuenta' },
  'costo-acierto': { componente: CostoAcierto, pasos: 4, titulo: 'Costo por acierto' },
  precios: { componente: Precios, pasos: 2, titulo: 'Los precios' },
  'pruebas-capa': { componente: PruebasCapa, pasos: 4, titulo: 'Las pruebas de la capa 1' },
};

const clases = () => document.documentElement.classList;
const imprimiendo = () => clases().contains('print-pdf') || /print-pdf/.test(window.location.search);
const modoFinal = () => clases().contains('movimiento-reducido') || clases().contains('sin-3d') || imprimiendo();
const modoQuieto = () => clases().contains('movimiento-reducido') || imprimiendo();

const montajes = [];

function dibujar(m) {
  const C = m.def.componente;
  m.raiz.render(<C paso={m.paso} final={m.final} quieto={m.quieto} base={m.base} {...(m.def.props || {})} {...m.extra} />);
}

/* Página sola: el programa con sus propios controles. Las flechas del teclado también avanzan. */
function Solo({ def, base, extra, final, quieto }) {
  const [paso, setPaso] = useState(final ? def.pasos : 0);
  useEffect(() => {
    const tecla = (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (/input|textarea|select/i.test(tag)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') setPaso((k) => Math.min(def.pasos, k + 1));
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') setPaso((k) => Math.max(0, k - 1));
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [def.pasos]);
  const C = def.componente;
  return (
    <div className="solo-programa">
      {def.pasos > 0 ? (
        <div className="solo-controles">
          <button type="button" onClick={() => setPaso((k) => Math.max(0, k - 1))} disabled={paso === 0}>
            ← Anterior
          </button>
          <span>
            Paso <b>{paso}</b> de {def.pasos}
          </span>
          <button type="button" onClick={() => setPaso((k) => Math.min(def.pasos, k + 1))} disabled={paso === def.pasos}>
            Siguiente →
          </button>
        </div>
      ) : null}
      <C paso={paso} final={final} quieto={quieto} base={base} {...(def.props || {})} {...extra} />
    </div>
  );
}

function actualizar() {
  montajes.forEach((m) => {
    if (m.final || !m.seccion) return;
    const n = m.seccion.querySelectorAll(`.fragment.visible[data-paso="${m.nombre}"]`).length;
    if (n !== m.paso) {
      m.paso = n;
      dibujar(m);
    }
  });
}

function montar() {
  if (!window.React || !window.ReactDOM) {
    console.error('Falta React: revisa assets/vendor/react-18.3.1.');
    return;
  }
  cargarFuentes();
  const revealEl = document.querySelector('.reveal');
  const conReveal = !!(window.Reveal && revealEl);
  const final = modoFinal();
  const quieto = modoQuieto();
  document.querySelectorAll('[data-programa]').forEach((el) => {
    const nombre = el.getAttribute('data-programa');
    const def = REGISTRO[nombre];
    if (!def) {
      console.error(`Programa desconocido: ${nombre}`);
      return;
    }
    const extra = {};
    if (el.dataset.resaltar) extra.resaltar = el.dataset.resaltar;
    const base = el.dataset.base || 'assets/';
    const raiz = ReactDOM.createRoot(el);
    el.classList.add('programa-montado');
    if (!conReveal) {
      raiz.render(<Solo def={def} base={base} extra={extra} final={final} quieto={quieto} />);
      return;
    }
    const seccion = el.closest('section');
    // Los pasos del programa son fragmentos invisibles al final de su diapositiva.
    if (seccion && !final && def.pasos > 0) {
      for (let k = 0; k < def.pasos; k++) {
        const s = document.createElement('span');
        s.className = 'fragment paso-programa';
        s.setAttribute('data-paso', nombre);
        s.setAttribute('aria-hidden', 'true');
        seccion.appendChild(s);
      }
    }
    const m = { el, nombre, seccion, def, raiz, paso: final ? def.pasos : 0, final, quieto, base, extra };
    montajes.push(m);
    dibujar(m);
  });
  if (conReveal) {
    ['ready', 'slidechanged', 'fragmentshown', 'fragmenthidden', 'overviewhidden'].forEach((ev) => revealEl.addEventListener(ev, actualizar));
  }
}

window.ProgramasS2 = { REGISTRO, actualizar };
montar();
