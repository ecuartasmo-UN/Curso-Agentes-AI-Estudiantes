/* Parte 1 del bloque 2.1: tokens y tokenizer.
   - CortarNumerar: la frase se corta en tokens y cada token muestra su número (o200k_base, real).
   - Bpe: cómo se arma el vocabulario, con el ejemplo del Algoritmo 1 de Sennrich et al. (2016).
   - Idiomas: el mismo texto en español y en inglés, contado con dos tokenizers (real).
   - Demo: el docente escribe y ve los tokens al instante (opcional). */
import { ancho, anchoFicha, color, suave, miles, useFuentes, MarcaEspacio, partirEspacio, Pie } from './comun.jsx';
import datos from '../../ejemplos/datos/tokens.json';
import bpe from '../../ejemplos/datos/bpe.json';

const { useState, useEffect, useMemo, useRef } = React;

/* ---------------------------------------------------------------- Cortar y numerar */
const PIE_CORTAR = [
  'El tokenizer de GPT-4o y GPT-5 se llama o200k_base. Lo vamos a ver trabajar.',
  'Paso 1. Entra la frase, tal como la escribes.',
  'Paso 2. El tokenizer la corta en tokens. Algunas palabras se parten en trozos.',
  'Paso 3. Cada token se cambia por su número en el vocabulario.',
  'Paso 4. El vocabulario es una lista fija: cada número es siempre el mismo token.',
  'Paso 5. Siete palabras se volvieron once tokens. El modelo solo ve los números.',
];

export function CortarNumerar({ paso = 0, final }) {
  useFuentes();
  const p = final ? 5 : paso;
  const tokens = datos.frase.o200k_base_es;
  const px = 30;
  const alto = 84;
  const anchoMax = 760;
  // Fichas con su número reservado desde el inicio: así no cambia el tamaño al numerar.
  const filas = useMemo(() => {
    const anchos = tokens.map((t) => Math.max(anchoFicha(t.texto, px), ancho(String(t.id), 22, 600) + 26));
    const res = [];
    let fila = [];
    let usado = 0;
    anchos.forEach((w, i) => {
      if (fila.length && usado + 14 + w > anchoMax) {
        res.push(fila);
        fila = [];
        usado = 0;
      }
      usado += (fila.length ? 14 : 0) + w;
      fila.push({ i, w });
    });
    res.push(fila);
    return res.map((f) => {
      const total = f.reduce((s, k) => s + k.w, 0) + 14 * (f.length - 1);
      let x = (anchoMax - total) / 2;
      return f.map((k) => {
        const r = { ...k, x };
        x += k.w + 14;
        return r;
      });
    });
  }, [tokens, ancho('Mm', px)]);
  const posiciones = [];
  filas.forEach((f, nf) => f.forEach((k) => (posiciones[k.i] = { x: k.x, y: 128 + nf * (alto + 24), w: k.w })));
  const ordenados = [...tokens.map((t, i) => ({ ...t, i }))].sort((a, b) => a.id - b.id);
  const palabras = datos.frase.palabras_es;

  return (
    <div className="programa-cuerpo">
      <svg className="diagrama prog-svg" viewBox="0 0 1200 470" role="img" aria-label="La frase de ejemplo cortada en once tokens, cada uno con su número">
        {/* Paso 1: la frase completa */}
        <text x={600} y={60} textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={600} className={`aparece-p ${p >= 1 && p < 4 ? 'visto' : ''} ${p >= 2 ? 'frase-cortada' : ''}`}>
          {datos.frase.es}
        </text>
        {/* La cuchilla que corta: solo acompaña el paso 2 */}
        {p === 2 && !final ? <rect className="cuchilla" x={0} y={110} width={6} height={210} rx={3} /> : null}
        {tokens.map((t, i) => {
          const pos = posiciones[i];
          const c = color(i);
          const { espacio, cuerpo } = partirEspacio(t.texto);
          const wCuerpo = ancho(cuerpo, px, 600) + (espacio ? 16 : 0);
          const x0 = pos.w / 2 - wCuerpo / 2;
          return (
            <g key={i} className={`ficha-token ${p >= 2 ? 'visto' : ''}`} style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transitionDelay: p >= 2 && !final ? `${0.12 * i}s` : '0s' }}>
              <rect width={pos.w} height={alto} rx={14} fill={suave(c, 20)} stroke={c} strokeWidth={2.5} />
              {espacio ? <MarcaEspacio x={x0} y={alto * 0.36 + 10} px={px} /> : null}
              <text x={x0 + (espacio ? 16 : 0)} y={alto * 0.36} dominantBaseline="central" fontSize={px} fontWeight={600}>
                {cuerpo}
              </text>
              <text x={pos.w / 2} y={alto * 0.77} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={700} className={`numero-token ${p >= 3 ? 'visto' : ''}`} style={{ fill: c, transitionDelay: p >= 3 && !final ? `${0.08 * i}s` : '0s' }}>
                {t.id}
              </text>
            </g>
          );
        })}
        <g className={`aparece-p ${p >= 2 ? 'visto' : ''}`}>
          <MarcaEspacio x={12} y={360} px={26} />
          <text x={34} y={354} dominantBaseline="central" fontSize={17} className="t-suave">
            marca el espacio: viaja pegado al token que sigue
          </text>
        </g>

        {/* Paso 4: un trozo del vocabulario, ordenado por número */}
        <g className={`aparece-p desliza-izq ${p >= 4 ? 'visto' : ''}`}>
          <rect x={800} y={10} width={392} height={452} rx={18} className="panel-fondo" />
          <text x={996} y={40} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={700} className="t-titulo">
            Vocabulario de o200k_base
          </text>
          {ordenados.map((t, k) => {
            const y = 76 + k * 32;
            const c = color(t.i);
            const { espacio, cuerpo } = partirEspacio(t.texto);
            return (
              <g key={t.id}>
                <rect x={816} y={y - 13} width={360} height={28} rx={8} fill={suave(c, 16)} />
                <text x={916} y={y + 1} textAnchor="end" dominantBaseline="central" fontSize={18} fontWeight={700} style={{ fill: c }}>
                  {t.id}
                </text>
                {espacio ? <MarcaEspacio x={938} y={y + 8} px={20} /> : null}
                <text x={espacio ? 952 : 938} y={y + 1} dominantBaseline="central" fontSize={18} fontWeight={600}>
                  {cuerpo}
                </text>
              </g>
            );
          })}
          <text x={996} y={440} textAnchor="middle" dominantBaseline="central" fontSize={15} className="t-suave">
            … y así hasta {miles(datos.tokens_definidos.o200k_base)} tokens
          </text>
        </g>

        {/* Paso 5: el contador */}
        <g className={`aparece-p ${p >= 5 ? 'visto' : ''}`}>
          <text x={150} y={396} textAnchor="middle" dominantBaseline="central" fontSize={46} fontWeight={700} className="t-titulo">
            {palabras}
          </text>
          <text x={150} y={430} textAnchor="middle" dominantBaseline="central" fontSize={17} className="t-suave">
            palabras
          </text>
          <path d="M240 396 H500" className="arista acento" strokeWidth={3} />
          <path d="M500 396 l-14 -9 v18z" className="relleno-acento" />
          <text x={600} y={396} textAnchor="middle" dominantBaseline="central" fontSize={46} fontWeight={700} className="t-acento t-titulo">
            {tokens.length}
          </text>
          <text x={600} y={430} textAnchor="middle" dominantBaseline="central" fontSize={17} className="t-suave">
            tokens
          </text>
        </g>
      </svg>
      <Pie textos={PIE_CORTAR} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- BPE */
const PIE_BPE = [
  'El ejemplo de Sennrich et al. (2016): cuatro palabras, con cuántas veces aparece cada una.',
  'Paso 1. Al comienzo, cada palabra es una fila de letras sueltas. «·» marca el final de la palabra.',
  'Paso 2. Se cuentan los pares de símbolos vecinos, según cuántas veces aparece cada palabra.',
  'Paso 3. El par más frecuente, e + s, se une en un símbolo nuevo: «es».',
  'Paso 4. Se repite: cada unión agrega un símbolo al vocabulario. Aquí, diez uniones.',
];

/* Símbolos de una palabra tras k uniones (k = 0: letras sueltas). */
function segmentos(k) {
  const lista = k === 0 ? bpe.vocabulario_inicial : bpe.pasos[k - 1].vocabulario_despues;
  return lista.map((v) => ({ simbolos: v.palabra.split(' ').map((s) => s.replace('</w>', '·')), frecuencia: v.frecuencia }));
}
const sym = (s) => s.replace('</w>', '·');

export function Bpe({ paso = 0, final, quieto }) {
  useFuentes();
  const p = final ? 4 : paso;
  // En el paso 4 las uniones avanzan solas, de la 2 a la 10. Con movimiento reducido se ve el final.
  const [uniones, setUniones] = useState(p >= 4 ? 10 : p >= 3 ? 1 : 0);
  useEffect(() => {
    if (p < 3) return setUniones(0);
    if (p === 3) return setUniones(1);
    if (final || quieto) return setUniones(10);
    setUniones(1);
    let k = 1;
    const reloj = setInterval(() => {
      k += 1;
      setUniones(k);
      if (k >= 10) clearInterval(reloj);
    }, 650);
    return () => clearInterval(reloj);
  }, [p, final, quieto]);

  const filas = segmentos(uniones);
  const px = 30;
  const altoT = 54;
  const paresPaso1 = bpe.pasos[0].pares.slice(0, 6);
  const maxPar = paresPaso1[0].frecuencia;
  const nuevos = bpe.pasos.slice(0, uniones);
  const ultimo = uniones > 0 ? sym(bpe.pasos[uniones - 1].union.join('')) : null;

  return (
    <div className="programa-cuerpo">
      <svg className="diagrama prog-svg" viewBox="0 0 1200 470" role="img" aria-label="El algoritmo BPE une los pares de símbolos más frecuentes">
        <text x={0} y={22} dominantBaseline="central" fontSize={18} fontWeight={700} className="t-suave">
          Corpus
        </text>
        {filas.map((f, r) => {
          let x = 0;
          const y = 50 + r * 92;
          return (
            <g key={r} className={`aparece-p ${p >= 1 ? 'visto' : ''}`}>
              {f.simbolos.map((s, k) => {
                const w = Math.max(44, ancho(s, px, 600) + 26);
                const esNuevo = ultimo && s === ultimo;
                const resaltarPar = p === 2 && ((s === 'e' && f.simbolos[k + 1] === 's') || (s === 's' && f.simbolos[k - 1] === 'e'));
                const g = (
                  <g key={k} className={`baldosa ${esNuevo ? 'nueva' : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
                    <rect width={w} height={altoT} rx={10} className={`baldosa-fondo ${resaltarPar ? 'par-elegido' : ''} ${s.length > 1 ? 'unida' : ''}`} />
                    <text x={w / 2} y={altoT / 2} textAnchor="middle" dominantBaseline="central" fontSize={px} fontWeight={600}>
                      {s}
                    </text>
                  </g>
                );
                x += w + 8;
                return g;
              })}
              <text x={x + 14} y={y + altoT / 2} dominantBaseline="central" fontSize={24} fontWeight={700} className="t-acento-2">
                × {f.frecuencia}
              </text>
            </g>
          );
        })}

        {/* Paso 2: los pares vecinos más frecuentes en la primera ronda */}
        <g className={`aparece-p desliza-izq ${p === 2 ? 'visto' : ''}`}>
          <rect x={760} y={10} width={432} height={400} rx={18} className="panel-fondo" />
          <text x={976} y={42} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={700} className="t-titulo">
            Pares vecinos más frecuentes
          </text>
          {paresPaso1.map((par, k) => {
            const y = 86 + k * 52;
            const w = (par.frecuencia / maxPar) * 220;
            return (
              <g key={k}>
                <text x={850} y={y} textAnchor="end" dominantBaseline="central" fontSize={22} fontWeight={700}>
                  {sym(par.par[0])} + {sym(par.par[1])}
                </text>
                <rect x={866} y={y - 14} width={w} height={28} rx={8} className={k === 0 ? 'barra-par elegida' : 'barra-par'} />
                <text x={874 + w} y={y} dominantBaseline="central" fontSize={20} fontWeight={700} className={k === 0 ? 't-acento' : 't-suave'}>
                  {par.frecuencia}
                </text>
              </g>
            );
          })}
          <text x={976} y={392} textAnchor="middle" dominantBaseline="central" fontSize={15} className="t-suave">
            Empatan tres pares con 9: el código toma el primero.
          </text>
        </g>

        {/* Pasos 3 y 4: el vocabulario crece */}
        <g className={`aparece-p desliza-izq ${p >= 3 ? 'visto' : ''}`}>
          <rect x={760} y={10} width={432} height={452} rx={18} className="panel-fondo" />
          <text x={976} y={42} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={700} className="t-titulo">
            Símbolos nuevos del vocabulario
          </text>
          {nuevos.map((u, k) => {
            const col = k < 5 ? 0 : 1;
            const fila = k % 5;
            const x = 790 + col * 206;
            const y = 92 + fila * 70;
            return (
              <g key={k} className="union-nueva">
                <text x={x} y={y} dominantBaseline="central" fontSize={16} className="t-suave">
                  {sym(u.union[0])} + {sym(u.union[1])}
                </text>
                <text x={x} y={y + 26} dominantBaseline="central" fontSize={24} fontWeight={700} className={k === uniones - 1 ? 't-acento' : ''}>
                  {sym(u.union.join(''))}
                </text>
                <text x={x + 176} y={y + 26} textAnchor="end" dominantBaseline="central" fontSize={15} className="t-tenue">
                  {u.frecuencia}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <Pie textos={PIE_BPE} paso={p} />
    </div>
  );
}

/* ---------------------------------------------------------------- Español e inglés */
export function Idiomas({ paso = 0, final }) {
  const p = final ? 2 : paso;
  const f = datos.frase;
  const a = datos.articulo;
  const pct = (es, en) => Math.round((es / en - 1) * 100);
  const grupos = [
    {
      titulo: 'La frase del ejemplo, con o200k_base',
      filas: [
        { rotulo: 'Español', valor: f.o200k_base_es.length, detalle: `${f.palabras_es} palabras` },
        { rotulo: 'Inglés', valor: f.o200k_base_en.length, detalle: `${f.palabras_en} palabras` },
      ],
      max: 12,
      dif: pct(f.o200k_base_es.length, f.o200k_base_en.length),
      paso: 0,
    },
    {
      titulo: 'El artículo de Lee y Trott (2023), con o200k_base',
      filas: [
        { rotulo: 'Español', valor: a.es.tokens_o200k_base, detalle: `${miles(a.es.palabras)} palabras` },
        { rotulo: 'Inglés', valor: a.en.tokens_o200k_base, detalle: `${miles(a.en.palabras)} palabras` },
      ],
      max: 17000,
      dif: pct(a.es.tokens_o200k_base, a.en.tokens_o200k_base),
      paso: 1,
    },
    {
      titulo: 'El mismo artículo, con el tokenizer de GPT-2 (2019)',
      filas: [
        { rotulo: 'Español', valor: a.es.tokens_gpt2 },
        { rotulo: 'Inglés', valor: a.en.tokens_gpt2 },
      ],
      max: 17000,
      dif: pct(a.es.tokens_gpt2, a.en.tokens_gpt2),
      paso: 2,
    },
  ];
  return (
    <div className="grafico-idiomas">
      {grupos.map((g) => (
        <div key={g.titulo} className={`grupo-barras aparece-p ${p >= g.paso ? 'visto' : ''}`}>
          <div className="grupo-titulo">
            {g.titulo}
            <span className="dif">+{g.dif} % en español</span>
          </div>
          {g.filas.map((r) => (
            <div key={r.rotulo} className="fila-barra">
              <span className="rotulo">{r.rotulo}</span>
              <span className="pista">
                <span className={`valor ${r.rotulo === 'Español' ? 'es' : 'en'}`} style={{ width: `${Math.max(2, (r.valor / g.max) * 100)}%` }} />
              </span>
              <span className="num">
                <b>{miles(r.valor)}</b> tokens{r.detalle ? <small> · {r.detalle}</small> : null}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Demostración en vivo */
export function Demo() {
  useFuentes();
  const tok = window.GPTTokenizer_o200k_base;
  const enVivo = !!(tok && tok.encode && tok.decode);
  const [texto, setTexto] = useState(datos.demo[0].texto);
  const [elegida, setElegida] = useState(0);
  const area = useRef(null);

  const tokens = useMemo(() => {
    if (enVivo) {
      try {
        return tok.encode(texto).map((id) => ({ id, texto: tok.decode([id]) }));
      } catch (e) {
        return [];
      }
    }
    return datos.demo[elegida].tokens;
  }, [texto, elegida, enVivo]);

  const palabras = (enVivo ? texto : datos.demo[elegida].texto).trim().split(/\s+/).filter(Boolean).length;
  const caracteres = [...(enVivo ? texto : datos.demo[elegida].texto)].length;

  return (
    <div className="demo-tokens">
      {enVivo ? (
        <textarea
          ref={area}
          className="demo-entrada"
          value={texto}
          spellCheck={false}
          aria-label="Escribe un texto para ver sus tokens"
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="demo-respaldo">
          <p>Sin el tokenizer del navegador. Elige una frase ya cortada:</p>
          <div className="demo-opciones">
            {datos.demo.map((d, i) => (
              <button key={i} type="button" className={i === elegida ? 'activa' : ''} onClick={(e) => { setElegida(i); e.currentTarget.blur(); }}>
                {d.texto}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="demo-fichas" aria-live="polite">
        {tokens.map((t, i) => {
          const { espacio, cuerpo } = partirEspacio(t.texto);
          return (
            <span key={i} className="demo-ficha" style={{ '--c': color(i) }}>
              <span className="txt">
                {espacio ? <i className="esp" aria-label="espacio" /> : null}
                {cuerpo === '' ? ' ' : cuerpo.replace(/\n/g, '↵')}
              </span>
              <span className="id">{t.id}</span>
            </span>
          );
        })}
      </div>
      <div className="demo-cuenta">
        <span><b>{caracteres}</b> caracteres</span>
        <span><b>{palabras}</b> palabras</span>
        <span className="tokens"><b>{tokens.length}</b> tokens</span>
        <span className="fuente">{enVivo ? 'o200k_base en tu navegador, sin internet (gpt-tokenizer 4.1.2)' : 'o200k_base, calculado antes con tiktoken'}</span>
      </div>
    </div>
  );
}
