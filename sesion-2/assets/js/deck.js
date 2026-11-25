/* Configuración común de las presentaciones (reveal.js 6.0.2).
   - Contador: número de diapositiva y minuto acumulado de la charla (atributo data-min).
   - Distintivo «Opcional» para las diapositivas con data-opcional.
   - Estados animados: un fragmento con data-estado="x" agrega la clase estado-x a su diapositiva.
   - Sin transiciones entre diapositivas: el cambio es inmediato. Las animaciones van dentro de cada diapositiva.
   - Movimiento reducido: animaciones SVG en pausa. */
(function () {
  var raiz = document.documentElement;
  var reducido = raiz.classList.contains('movimiento-reducido');
  var revealEl = document.querySelector('.reveal');
  if (!revealEl || !window.Reveal) return;
  var totalMin = parseFloat(revealEl.getAttribute('data-total-min') || '0');

  var contador = document.createElement('div');
  contador.className = 'contador';
  contador.setAttribute('aria-live', 'polite');
  document.body.appendChild(contador);

  var distintivo = document.createElement('div');
  distintivo.className = 'distintivo-opcional';
  distintivo.textContent = 'Opcional';
  document.body.appendChild(distintivo);

  var indice = document.querySelector('[data-enlace-indice]');

  Reveal.initialize({
    hash: true,
    width: 1280,
    height: 720,
    margin: 0.045,
    minScale: 0.2,
    maxScale: 2.0,
    center: false,
    controls: true,
    controlsTutorial: false,
    progress: true,
    slideNumber: false,
    transition: 'none',
    backgroundTransition: 'none',
    autoAnimate: false,
    pdfSeparateFragments: false,
    pdfMaxPagesPerSlide: 1,
    plugins: window.RevealNotes ? [window.RevealNotes] : []
  }).then(function () {
    actualizar();
    if (reducido) pausarSvg();
  });

  function minutoDe(seccion) {
    var m = parseFloat(seccion.getAttribute('data-min'));
    return isNaN(m) ? 0 : m;
  }

  /* Minuto acumulado al terminar la diapositiva horizontal h. */
  function acumulado(h) {
    var horizontales = Reveal.getHorizontalSlides();
    var suma = 0;
    for (var i = 0; i <= h && i < horizontales.length; i++) {
      var s = horizontales[i];
      var hijas = s.querySelectorAll(':scope > section');
      if (hijas.length) { for (var j = 0; j < hijas.length; j++) suma += minutoDe(hijas[j]); }
      else suma += minutoDe(s);
    }
    return suma;
  }

  function formato(n) { return (Math.round(n * 10) / 10).toString(); }

  function actualizarContador() {
    var idx = Reveal.getIndices();
    var total = Reveal.getHorizontalSlides().length;
    var numero = (idx.h + 1) + (idx.v ? '.' + (idx.v + 1) : '');
    var texto = '<b>' + numero + '</b> / ' + total;
    if (totalMin > 0) texto += ' · min <b>' + formato(acumulado(idx.h)) + '</b> de ' + formato(totalMin);
    contador.innerHTML = texto;
  }

  function actualizarOpcional() {
    var actual = Reveal.getCurrentSlide();
    var opcional = actual && (actual.hasAttribute('data-opcional') ||
      (actual.parentElement && actual.parentElement.hasAttribute && actual.parentElement.hasAttribute('data-opcional')));
    raiz.classList.toggle('diapositiva-opcional', !!opcional);
  }

  /* Recalcula los estados de la diapositiva según sus fragmentos visibles. */
  function recalcularEstados(seccion) {
    if (!seccion) return;
    var clases = Array.prototype.slice.call(seccion.classList);
    for (var i = 0; i < clases.length; i++) if (clases[i].indexOf('estado-') === 0) seccion.classList.remove(clases[i]);
    var visibles = seccion.querySelectorAll('.fragment.visible[data-estado]');
    for (var j = 0; j < visibles.length; j++) seccion.classList.add('estado-' + visibles[j].getAttribute('data-estado'));
  }

  function actualizar() {
    actualizarContador();
    actualizarOpcional();
    recalcularEstados(Reveal.getCurrentSlide());
  }

  function pausarSvg() {
    var svgs = document.querySelectorAll('svg');
    for (var i = 0; i < svgs.length; i++) if (svgs[i].pauseAnimations) svgs[i].pauseAnimations();
  }

  Reveal.on('slidechanged', actualizar);
  Reveal.on('fragmentshown', function () { recalcularEstados(Reveal.getCurrentSlide()); });
  Reveal.on('fragmenthidden', function () { recalcularEstados(Reveal.getCurrentSlide()); });
  Reveal.on('overviewhidden', actualizar);

  window.AgentesDeck = { acumulado: acumulado };
})();
