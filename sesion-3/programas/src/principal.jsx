/* Monta los programas de la sesión 3 en las diapositivas o en su página propia.
   - En una presentación de reveal.js: cada <div data-programa="nombre"> recibe sus pasos como fragmentos
     invisibles. El docente solo presiona la flecha; al retroceder, el paso se deshace.
   - En una página sola (programas/*.html): el programa trae sus botones de Anterior y Siguiente.
   - Con movimiento reducido, sin 3D o al imprimir: el programa muestra su estado final completo.
   Este archivo se compila con esbuild a un IIFE (ver programas/README.md). Debe cargarse antes de deck.js.
   La estructura viene de la sesión 2. */
import { cargarFuentes } from './comun.jsx';
import { MapaSesion, Minimapa } from './mapa.jsx';
import { AppApi, CicloTrabajo, ArmarPrompt, DemoTokens } from './prompt.jsx';
import { TextoRegistro, TokensValidos, Validador } from './json.jsx';
import { Conversacion, Tablero, Variantes, CuentaPrevia } from './api.jsx';
import { LeerPrograma, PruebasCapa2 } from './codigo.jsx';
import { SISTEMA_APP } from './datos.jsx';

const { useState, useEffect } = React;

/* Nombre del programa → componente y número de pasos (clics). */
export const REGISTRO = {
  'mapa-31': { componente: MapaSesion, pasos: 1, titulo: 'El mapa de la sesión', props: { modo: '31' } },
  'mapa-32': { componente: MapaSesion, pasos: 1, titulo: 'El mapa de la sesión', props: { modo: '32' } },
  'mapa-sintesis': { componente: MapaSesion, pasos: 0, titulo: 'Síntesis', props: { modo: 'sintesis' } },
  minimapa: { componente: Minimapa, pasos: 0 },
  // Bloque 3.1
  'app-api': { componente: AppApi, pasos: 3, titulo: 'Lo que agrega la app', props: { tokensSistema: SISTEMA_APP ? SISTEMA_APP.tokens_o200k : null } },
  'ciclo-trabajo': { componente: CicloTrabajo, pasos: 5, titulo: 'El orden del trabajo' },
  'armar-prompt': { componente: ArmarPrompt, pasos: 5, titulo: 'Armar un prompt' },
  'taller-prompt': { componente: ArmarPrompt, pasos: 0, titulo: 'El taller del prompt', props: { interactivo: true } },
  'demo-tokens': { componente: DemoTokens, pasos: 0, titulo: 'Demostración en vivo' },
  'texto-registro': { componente: TextoRegistro, pasos: 5, titulo: 'Del texto al registro' },
  'tokens-validos': { componente: TokensValidos, pasos: 3, titulo: 'Solo tokens válidos' },
  validador: { componente: Validador, pasos: 0, titulo: 'El validador' },
  // Bloque 3.2
  conversacion: { componente: Conversacion, pasos: 3, titulo: 'La conversación se reenvía' },
  tablero: { componente: Tablero, pasos: 5, titulo: 'El tablero de una llamada' },
  variantes: { componente: Variantes, pasos: 4, titulo: 'La cuadrícula de variantes' },
  'cuenta-previa': { componente: CuentaPrevia, pasos: 3, titulo: 'La cuenta antes de correr' },
  'leer-programa': { componente: LeerPrograma, pasos: 7, titulo: 'Leer un programa corto' },
  'pruebas-capa2': { componente: PruebasCapa2, pasos: 5, titulo: 'Las pruebas de la capa 2' },
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
      if (/input|textarea|select|button/i.test(tag)) return;
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

window.ProgramasS3 = { REGISTRO, actualizar };
montar();
