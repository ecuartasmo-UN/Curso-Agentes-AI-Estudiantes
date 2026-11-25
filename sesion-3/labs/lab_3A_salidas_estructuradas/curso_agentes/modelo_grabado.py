"""Un modelo simulado de LangChain que responde con grabaciones de corridas reales.

Sigue la guía de pruebas de LangChain: es un BaseChatModel que no llama a ningún proveedor.
Cada grabación guarda el texto, los tokens, el costo y la latencia de una respuesta real.
Si una pregunta tiene varias respuestas grabadas, el modelo las entrega en orden, una por intento.

Desde la sesión 3 también acepta with_structured_output, con los mismos argumentos que un modelo en vivo.
La grabación guarda la respuesta cruda. Al reproducirla, el modelo la vuelve a leer y a validar con Pydantic,
con el mismo analizador que usa LangChain con Claude y con Gemini.
"""
import hashlib
import json
from operator import itemgetter
from pathlib import Path
from typing import Any

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from pydantic import PrivateAttr


class SinGrabacion(LookupError):
    """La pregunta no tiene respuesta grabada."""


class ErrorGrabado(RuntimeError):
    """Un error real del proveedor, guardado en la grabación."""

    def __init__(self, tipo: str, mensaje: str):
        super().__init__(f"{tipo}: {mensaje}")
        self.tipo = tipo
        self.mensaje = mensaje


def _texto_mensaje(mensaje: BaseMessage) -> str:
    contenido = mensaje.content
    if isinstance(contenido, str):
        return contenido
    partes = []
    for bloque in contenido:
        if isinstance(bloque, str):
            partes.append(bloque)
        elif isinstance(bloque, dict) and bloque.get("type") == "text":
            partes.append(bloque.get("text", ""))
    return "".join(partes)


def clave_esquema(esquema) -> str:
    """El esquema escrito siempre igual: el JSON Schema de la clase de Pydantic, con las claves ordenadas."""
    if isinstance(esquema, str):
        return esquema
    if isinstance(esquema, dict):
        return json.dumps(esquema, sort_keys=True, ensure_ascii=False)
    return json.dumps(esquema.model_json_schema(), sort_keys=True, ensure_ascii=False)


def clave_de(nombre_modelo: str, mensajes, escenario: str = "", esquema: str = "") -> str:
    """Identifica una conversación por el modelo, el escenario, el esquema y el texto de sus mensajes.

    El escenario distingue una misma conversación grabada en otras condiciones, como un máximo de tokens muy bajo.
    El esquema solo cuenta en las salidas estructuradas: un cambio en el esquema deja el caso sin grabación.
    Sin escenario ni esquema, la clave es la misma de la sesión 2.
    """
    partes = [nombre_modelo] + ([f"escenario:{escenario}"] if escenario else [])
    partes += [f"esquema:{esquema}"] if esquema else []
    partes += [f"{m.type}:{_texto_mensaje(m)}" for m in mensajes]
    return hashlib.sha256("\x1f".join(partes).encode("utf-8")).hexdigest()[:20]


class ModeloGrabado(BaseChatModel):
    """Responde con las grabaciones del modelo indicado, sin clave y sin costo."""

    nombre_modelo: str
    carpeta: str
    escenario: str = ""

    _respuestas: dict = PrivateAttr(default_factory=dict)
    _contadores: dict = PrivateAttr(default_factory=dict)
    _info: dict = PrivateAttr(default_factory=dict)

    def model_post_init(self, __context: Any) -> None:
        archivos = sorted(Path(self.carpeta).glob("*.json"))
        for archivo in archivos:
            datos = json.loads(archivo.read_text(encoding="utf-8"))
            if datos.get("modelo") != self.nombre_modelo:
                continue
            self._respuestas.update(datos.get("respuestas", {}))
            self._info = {k: datos.get(k) for k in ("modelo", "fecha", "parametros", "simulado")}
        if not self._respuestas:
            raise SinGrabacion(
                f"No hay grabaciones del modelo «{self.nombre_modelo}» en la carpeta «{self.carpeta}». "
                "Revisa que la carpeta «grabaciones» esté junto al notebook."
            )
        if self._info.get("simulado"):
            print("Aviso: estas grabaciones son simuladas, solo para probar el notebook. No son respuestas reales.")

    @property
    def _llm_type(self) -> str:
        return "modelo-grabado"

    @property
    def info(self) -> dict:
        return dict(self._info)

    def reiniciar(self) -> None:
        """Vuelve al primer intento de cada pregunta."""
        self._contadores.clear()

    def tiene_grabacion(self, mensajes, esquema=None) -> bool:
        """¿Esta conversación tiene respuesta grabada? Sirve para avisar antes de correr."""
        from langchain_core.messages import convert_to_messages

        clave = clave_de(self.nombre_modelo, convert_to_messages(mensajes), self.escenario,
                         clave_esquema(esquema) if esquema is not None else "")
        return bool(self._respuestas.get(clave))

    def _generate(self, messages: list[BaseMessage], stop=None, run_manager=None, **kwargs: Any) -> ChatResult:
        clave = clave_de(self.nombre_modelo, messages, self.escenario, kwargs.get("esquema_grabacion", ""))
        intentos = self._respuestas.get(clave)
        if not intentos:
            raise SinGrabacion("Esta pregunta no tiene respuesta grabada. En modo grabado, usa solo los casos y las "
                               "opciones del laboratorio.")
        i = self._contadores.get(clave, 0)
        self._contadores[clave] = i + 1
        r = intentos[i % len(intentos)]
        if r.get("error"):
            raise ErrorGrabado(r["error"].get("tipo", "Error"), r["error"].get("mensaje", ""))
        uso = {
            "input_tokens": r["tokens_entrada"],
            "output_tokens": r["tokens_salida"],
            "total_tokens": r["tokens_entrada"] + r["tokens_salida"],
        }
        if r.get("tokens_razonamiento"):
            uso["output_token_details"] = {"reasoning": r["tokens_razonamiento"]}
        metadatos = {
            "model_name": self.nombre_modelo,
            "stop_reason": r.get("stop_reason"),
            "latencia_s": r.get("latencia_s"),
            "fecha_grabacion": r.get("fecha"),
            "grabado": True,
        }
        if r.get("stop_details"):  # el detalle de un rechazo, como la categoría reasoning_extraction
            metadatos["stop_details"] = r["stop_details"]
        mensaje = AIMessage(content=r["texto"], usage_metadata=uso, response_metadata=metadatos)
        return ChatResult(generations=[ChatGeneration(message=mensaje)])

    def bind_tools(self, tools, **kwargs: Any):
        """Como pide la guía de pruebas de LangChain: devuelve el mismo modelo."""
        return self

    def with_structured_output(self, schema, *, include_raw: bool = False, method: str = "json_schema", **kwargs: Any):
        """Lo mismo que with_structured_output en vivo, con la respuesta cruda de la grabación.

        Arma la misma cadena que langchain-anthropic y langchain-google-genai con method="json_schema":
        la respuesta cruda pasa por PydanticOutputParser. Con include_raw=True devuelve un diccionario
        con "raw", "parsed" y "parsing_error", y un error de lectura no detiene el programa.
        """
        from langchain_core.output_parsers import JsonOutputParser, PydanticOutputParser
        from langchain_core.runnables import RunnableMap, RunnablePassthrough
        from langchain_core.utils.pydantic import is_basemodel_subclass

        if isinstance(schema, type) and is_basemodel_subclass(schema):
            analizador = PydanticOutputParser(pydantic_object=schema)
        else:
            analizador = JsonOutputParser()
        llm = self.bind(esquema_grabacion=clave_esquema(schema))
        if not include_raw:
            return llm | analizador
        con_registro = RunnablePassthrough.assign(parsed=itemgetter("raw") | analizador, parsing_error=lambda _: None)
        sin_registro = RunnablePassthrough.assign(parsed=lambda _: None)
        return RunnableMap(raw=llm) | con_registro.with_fallbacks([sin_registro], exception_key="parsing_error")


def modelo_grabado(config, modelo: str | None = None, escenario: str = "") -> ModeloGrabado:
    """Crea el modelo grabado del modelo elegido.

    Sin `modelo`, usa el de la configuración. Si ese modelo no tiene grabaciones, lo dice y usa el del curso.
    Con `modelo`, crea ese y avisa con SinGrabacion si no tiene grabaciones: quien lo llama decide qué hacer.
    """
    from .configuracion import MODELO_POR_DEFECTO, PARAMETROS

    carpeta = str(Path(config.carpeta) / "grabaciones")
    if modelo is not None:
        return ModeloGrabado(nombre_modelo=modelo.split(":", 1)[-1], carpeta=carpeta, escenario=escenario)
    try:
        return ModeloGrabado(nombre_modelo=config.nombre_modelo, carpeta=carpeta, escenario=escenario)
    except SinGrabacion:
        if config.modelo == MODELO_POR_DEFECTO:
            raise
        print(f"No hay grabaciones de «{config.nombre_modelo}». Uso las de «{MODELO_POR_DEFECTO.split(':', 1)[-1]}».")
        config.modelo = MODELO_POR_DEFECTO
        config.parametros = dict(PARAMETROS[MODELO_POR_DEFECTO])
        return ModeloGrabado(nombre_modelo=config.nombre_modelo, carpeta=carpeta, escenario=escenario)
