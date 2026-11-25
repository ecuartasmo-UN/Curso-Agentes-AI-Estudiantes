/* Datos de los programas de la sesión 3.
   - Los conteos de tokens son reales: salen de ejemplos/tokens_s3.py, con tiktoken y o200k_base.
   - Los mensajes de error son reales: salen de ejemplos/validar_ticket.py, con Pydantic.
   - Las respuestas de los modelos son ilustrativas: la clave del curso no estaba disponible al construir la sesión.
   esbuild empaqueta estos JSON dentro de assets/js/programas.js. */
import TOK from '../../ejemplos/datos/tokens_s3.json';
import VAL from '../../ejemplos/datos/validacion.json';
import PS from '../../ejemplos/datos/prompt_sistema.json';

export { TOK, VAL, PS };

/* El prompt de sistema que Anthropic publica para la app de Claude con Haiku 5.5: tokens reales con o200k_base. */
export const SISTEMA_APP = PS.modelos.find((m) => m.modelo === 'claude-haiku-5-5');

export const PRECIOS = TOK.precios_usd_millon;
export const HAIKU = PRECIOS['claude-haiku-5-5'];

/* Formato de dinero con punto decimal y los decimales que pide cada cifra. */
export function usd(n, dec = 4) {
  return `USD ${Number(n).toFixed(dec)}`;
}

/* Costo de una llamada, en USD, con los precios por millón de tokens. */
export const costo = (entrada, salida, precio = HAIKU) => (entrada * precio.entrada + salida * precio.salida) / 1e6;

export const TICKET = TOK.ticket.texto;
export const REGISTRO = TOK.registro.campos;
export const CAMPOS = ['categoria', 'prioridad', 'plataforma', 'version_app', 'resumen'];

/* El esquema del ejemplo, igual al de ejemplos/validar_ticket.py. */
export const ESQUEMA = [
  { campo: 'categoria', tipo: 'texto', obligatorio: true, valores: ['fallo de la app', 'rendimiento', 'interfaz', 'cuenta y acceso', 'solicitud de función'] },
  { campo: 'prioridad', tipo: 'texto', obligatorio: true, valores: ['alta', 'media', 'baja'] },
  { campo: 'plataforma', tipo: 'texto', obligatorio: true, valores: ['Android', 'iOS', 'web'] },
  { campo: 'version_app', tipo: 'texto o vacío', obligatorio: false, valores: null },
  { campo: 'resumen', tipo: 'texto', obligatorio: true, valores: null },
];

/* Los mensajes reales de Pydantic para cada caso de ejemplos/validar_ticket.py. */
export const ERRORES = Object.fromEntries(VAL.casos.map((c) => [c.id, c]));

/* Las piezas del prompt, con su color y sus tokens reales. */
export const COLOR_PIEZA = {
  vaga: 'var(--texto-tenue)',
  clara: 'var(--t1)',
  contexto: 'var(--t2)',
  ejemplos: 'var(--t5)',
  formato: 'var(--t4)',
  ticket: 'var(--t3)',
};
export const PASOS_PROMPT = TOK.armar_prompt;

/* Respuestas ilustrativas del modelo en cada paso de «Armar un prompt». */
export const RESPUESTAS_PROMPT = [
  'Parece un problema técnico: la app falla al subir fotos. Conviene revisarlo pronto.',
  'Categoría: fallo de la app. Prioridad: no la puedo saber sin más información.',
  'Categoría: fallo de la app. Prioridad: alta, porque impide subir fotos.',
  'fallo de la app, alta',
  null, // el registro JSON
];

export const CONVERSACION = TOK.conversacion;
export const VARIANTES = TOK.variantes;
