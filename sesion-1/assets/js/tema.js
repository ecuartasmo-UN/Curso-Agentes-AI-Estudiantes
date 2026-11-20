/* Tema de las presentaciones de Agentes de IA (aplicado).
   - Oscuro por defecto. El botón (o la tecla T) cambia a claro y vuelve a oscuro.
   - La elección se guarda en localStorage y viaja en los enlaces como ?tema=.
   - ?movimiento=reducido fuerza la versión con movimiento reducido. */
(function () {
  var CLAVE = 'agentes-tema';
  var raiz = document.documentElement;
  var parametros = null;
  try { parametros = new URLSearchParams(window.location.search); } catch (e) { parametros = null; }

  function temaInicial() {
    var p = parametros ? parametros.get('tema') : null;
    if (p === 'claro' || p === 'oscuro') { guardar(p); return p; }
    try {
      var g = window.localStorage.getItem(CLAVE);
      if (g === 'claro' || g === 'oscuro') return g;
    } catch (e) { /* almacenamiento no disponible */ }
    return 'oscuro';
  }
  function guardar(t) { try { window.localStorage.setItem(CLAVE, t); } catch (e) { /* sin almacenamiento */ } }
  function aplicar(t) { raiz.setAttribute('data-tema', t); }
  function actual() { return raiz.getAttribute('data-tema') === 'claro' ? 'claro' : 'oscuro'; }

  aplicar(temaInicial());

  var con3d = false;
  try { con3d = !!(window.CSS && CSS.supports && CSS.supports('transform-style', 'preserve-3d')); } catch (e) { con3d = false; }
  if (!con3d || (parametros && parametros.get('sin3d') === '1')) raiz.classList.add('sin-3d');
  var reducido = false;
  try { reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reducido = false; }
  if (reducido || (parametros && parametros.get('movimiento') === 'reducido')) raiz.classList.add('movimiento-reducido');

  function alternar() {
    var t = actual() === 'claro' ? 'oscuro' : 'claro';
    aplicar(t);
    guardar(t);
    actualizarEnlaces();
  }

  /* Los enlaces internos llevan el tema elegido, por si el navegador no comparte localStorage entre archivos. */
  function actualizarEnlaces() {
    var enlaces = document.querySelectorAll('a[data-con-tema]');
    for (var i = 0; i < enlaces.length; i++) {
      var a = enlaces[i];
      var base = a.getAttribute('data-base') || a.getAttribute('href').split('?')[0];
      a.setAttribute('data-base', base);
      var partes = base.split('#');
      a.setAttribute('href', partes[0] + '?tema=' + actual() + (partes[1] ? '#' + partes[1] : ''));
    }
  }

  var ICONO_SOL = '<svg class="icono-sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 1.8v2.6M12 19.6v2.6M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M1.8 12h2.6M19.6 12h2.6M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9"/></svg>';
  var ICONO_LUNA = '<svg class="icono-luna" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>';

  function crearBoton() {
    if (document.querySelector('.boton-tema')) { actualizarEnlaces(); return; }
    var b = document.createElement('button');
    b.className = 'boton-tema';
    b.type = 'button';
    b.setAttribute('aria-label', 'Cambiar entre el tema oscuro y el claro');
    b.title = 'Cambiar entre el tema oscuro y el claro (tecla T)';
    b.innerHTML = ICONO_SOL + ICONO_LUNA;
    b.addEventListener('click', function (ev) { ev.stopPropagation(); alternar(); b.blur(); });
    document.body.appendChild(b);
    actualizarEnlaces();
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (/input|textarea|select/i.test(tag)) return;
    if (e.key === 't' || e.key === 'T') alternar();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crearBoton);
  else crearBoton();

  window.AgentesTema = { alternar: alternar, actual: actual, actualizarEnlaces: actualizarEnlaces };
})();
