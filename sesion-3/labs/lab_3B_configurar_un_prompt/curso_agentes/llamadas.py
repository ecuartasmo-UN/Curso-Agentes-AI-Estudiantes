"""Una llamada al modelo, con sus tokens, su costo y su latencia."""
import time
from dataclasses import asdict, dataclass

from .modelo_grabado import ErrorGrabado, ModeloGrabado, SinGrabacion
from .precios import costo_usd


@dataclass
class Respuesta:
    """Lo que devuelve una llamada, listo para la tabla de resultados."""

    caso_id: str
    pregunta: str
    texto: str
    tokens_entrada: int
    tokens_salida: int
    tokens_razonamiento: int
    costo_usd: float
    latencia_s: float
    modelo: str
    modo: str
    intento: int
    error: str | None = None

    def como_dict(self) -> dict:
        return asdict(self)


def texto_de(mensaje) -> str:
    """Devuelve el texto de una respuesta de LangChain, aunque venga en bloques."""
    contenido = mensaje.content
    if isinstance(contenido, str):
        return contenido.strip()
    partes = []
    for bloque in contenido:
        if isinstance(bloque, str):
            partes.append(bloque)
        elif isinstance(bloque, dict) and bloque.get("type") == "text":
            partes.append(bloque.get("text", ""))
    return "".join(partes).strip()


def _mensaje_corto(error: Exception) -> str:
    texto = str(error).replace("\n", " ")
    return texto if len(texto) <= 220 else texto[:217] + "…"


def _explicar(error: Exception) -> str:
    """Traduce los errores más comunes del proveedor a un mensaje que dice qué revisar."""
    texto = f"{type(error).__name__} {error}".lower()
    if any(s in texto for s in ("authentication", "error code: 401", "invalid x-api-key", "api key not valid")):
        return "El proveedor rechazó la clave (401). Revisa la clave del archivo .env, o cambia MODO a «grabado»."
    if any(s in texto for s in ("ratelimit", "rate_limit", "rate limit", "error code: 429", "resource_exhausted")):
        return "El proveedor pidió esperar (límite de tasa, 429). Espera un minuto y vuelve a ejecutar la celda."
    if "timeout" in texto or "timed out" in texto:
        return f"El modelo no respondió a tiempo ({type(error).__name__}). Vuelve a ejecutar la celda."
    return f"{type(error).__name__}: {_mensaje_corto(error)}"


def preguntar(modelo, sistema: str, pregunta: str, config, caso_id: str = "", intento: int = 1,
              validar: bool = True, nombre_modelo: str | None = None) -> Respuesta:
    """Envía el mensaje de sistema y la pregunta, y mide la respuesta.

    No falla en silencio: si algo sale mal, la respuesta trae el error explicado.
    Con validar=False, envía la pregunta aunque esté vacía, para ver qué hace el proveedor.
    Con nombre_modelo, calcula el costo con el precio de ese modelo: sirve para comparar varios modelos.
    """
    nombre = nombre_modelo.split(":", 1)[-1] if nombre_modelo else config.nombre_modelo
    modo = "grabado" if isinstance(modelo, ModeloGrabado) else "en_vivo"
    base = dict(caso_id=caso_id, pregunta=pregunta or "", modelo=nombre, modo=modo, intento=intento)
    vacia = dict(texto="", tokens_entrada=0, tokens_salida=0, tokens_razonamiento=0, costo_usd=0.0, latencia_s=0.0)

    # Una pregunta vacía no se envía: el notebook lo informa.
    if validar and (pregunta is None or not str(pregunta).strip()):
        return Respuesta(**base, **vacia, error="La pregunta está vacía: no se envió al modelo.")

    # En vivo, cada llamada cuenta contra los límites de la corrida.
    if modo == "en_vivo":
        if config.llamadas >= config.max_llamadas:
            return Respuesta(
                **base, **vacia,
                error=f"Llegaste al límite de {config.max_llamadas} llamadas. Súbelo en la celda de configuración si lo necesitas.",
            )
        if config.tokens >= config.max_tokens:
            return Respuesta(
                **base, **vacia,
                error=f"Llegaste al límite de {config.max_tokens} tokens. Súbelo en la celda de configuración si lo necesitas.",
            )
        config.llamadas += 1

    inicio = time.perf_counter()
    try:
        r = modelo.invoke([("system", sistema), ("user", pregunta or "")])
    except SinGrabacion as e:
        return Respuesta(**base, **vacia, error=str(e))
    except ErrorGrabado as e:
        return Respuesta(**base, **vacia, error=f"{e.tipo} (grabado): {e.mensaje}")
    except Exception as e:  # errores del proveedor: clave, red, tiempo de espera o límites
        return Respuesta(**base, **vacia, error=_explicar(e))
    medida = time.perf_counter() - inicio

    uso = r.usage_metadata or {}
    detalles = uso.get("output_token_details") or {}
    entrada = int(uso.get("input_tokens", 0))
    salida = int(uso.get("output_tokens", 0))
    if modo == "en_vivo":
        config.tokens += entrada + salida
    latencia = r.response_metadata.get("latencia_s") if r.response_metadata.get("grabado") else medida
    return Respuesta(
        **base,
        texto=texto_de(r),
        tokens_entrada=entrada,
        tokens_salida=salida,
        tokens_razonamiento=int(detalles.get("reasoning", 0) or 0),
        costo_usd=costo_usd(nombre, entrada, salida),
        latencia_s=round(float(latencia or 0.0), 3),
    )
