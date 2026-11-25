"""Elige el modo (grabado o en vivo) y el modelo, y carga la clave sin mostrarla."""
import getpass
import os
from dataclasses import dataclass, field
from pathlib import Path

MODELO_POR_DEFECTO = "anthropic:claude-haiku-5-5"

# Variable de entorno con la clave de cada proveedor.
CLAVES = {"anthropic": "ANTHROPIC_API_KEY", "google_genai": "GOOGLE_API_KEY"}

# Parámetros de cada modelo, comprobados en la documentación el 23 de noviembre de 2026.
# - Claude Haiku 5.5 razona por defecto y cobra ese razonamiento como salida. El curso lo desactiva.
# - Claude Haiku 5.5 rechaza temperature, top_p y top_k: no se envían.
# - Google recomienda no enviar temperature a los modelos Gemini 3.x.
PARAMETROS = {
    "anthropic:claude-haiku-5-5": {
        "thinking": {"type": "disabled"},
        "max_tokens": 512,
        "timeout": 60,
        "max_retries": 3,
    },
    "google_genai:gemini-3.5-flash-lite": {
        "max_tokens": 512,
        "timeout": 60,
        "max_retries": 3,
    },
    # Claude Opus 5.5 razona siempre (adaptativo, esfuerzo «medium» por defecto): no acepta desactivarlo.
    # Es el modelo de contraste del Laboratorio 2B, y el curso lo usa solo en modo grabado.
    "anthropic:claude-opus-5-5": {
        "max_tokens": 2048,
        "timeout": 120,
        "max_retries": 3,
    },
}

# Modelos que el curso usa solo con grabaciones, para cuidar el crédito de la clave.
SOLO_GRABADO = {"anthropic:claude-opus-5-5"}
_claves_probadas: dict = {}


@dataclass
class Configuracion:
    """Lo que el notebook necesita saber para llamar al modelo."""

    modo: str
    modelo: str
    parametros: dict = field(default_factory=dict)
    carpeta: Path = field(default_factory=Path.cwd)
    max_llamadas: int = 150
    max_tokens: int = 300_000
    llamadas: int = 0
    tokens: int = 0

    @property
    def proveedor(self) -> str:
        return self.modelo.split(":", 1)[0]

    @property
    def nombre_modelo(self) -> str:
        return self.modelo.split(":", 1)[-1]


def versiones() -> dict:
    """Las versiones de los paquetes de LangChain del kernel, para dejarlas junto a los resultados."""
    from importlib.metadata import PackageNotFoundError, version

    salida = {}
    for paquete in ("langchain", "langchain-core", "langchain-anthropic", "langchain-google-genai"):
        try:
            salida[paquete] = version(paquete)
        except PackageNotFoundError:
            salida[paquete] = "no instalado"
    return salida


def _cargar_env() -> None:
    """Busca un archivo .env en la carpeta actual y en las de arriba, y carga sus variables."""
    try:
        from dotenv import find_dotenv, load_dotenv
    except ImportError:
        return
    ruta = find_dotenv(usecwd=True)
    if ruta:
        load_dotenv(ruta, override=False)


def _probar_clave(proveedor: str):
    """Comprueba la clave con la lista de modelos del proveedor, que no consume tokens.

    Devuelve True si la clave sirve, False si el proveedor la rechaza y None si no se pudo comprobar.
    """
    try:
        if proveedor == "anthropic":
            import anthropic
            anthropic.Anthropic(max_retries=0, timeout=15).models.list(limit=1)
        elif proveedor == "google_genai":
            from google import genai
            cliente = genai.Client()  # se guarda en una variable: si no, se cierra antes de usarse
            next(iter(cliente.models.list(config={"page_size": 1})))
        else:
            return None
        return True
    except Exception as e:  # sin conexión, clave rechazada u otro problema
        texto = f"{type(e).__name__} {e}".lower()
        codigo = getattr(e, "status_code", None) or getattr(e, "code", None)
        if codigo in (401, 403) or "api key not valid" in texto or "authentication" in texto:
            return False
        return None


def puede_ir_en_vivo(config, modelo: str) -> bool:
    """¿Este modelo puede correr en vivo en esta corrida? Si no, dice por qué: el modelo irá en modo grabado."""
    nombre = modelo.split(":", 1)[-1]
    if config.modo != "en_vivo":
        return False
    if modelo in SOLO_GRABADO:
        print(f"{nombre}: va en modo grabado. El curso no lo usa en vivo, para cuidar el crédito de la clave.")
        return False
    proveedor = modelo.split(":", 1)[0]
    variable = CLAVES.get(proveedor)
    if not variable or not os.environ.get(variable):
        print(f"{nombre}: falta la clave {variable or 'del proveedor'}. Va en modo grabado.")
        return False
    if proveedor not in _claves_probadas:
        _claves_probadas[proveedor] = _probar_clave(proveedor)
    if _claves_probadas[proveedor] is False:
        print(f"{nombre}: el proveedor rechazó la clave {variable}. Va en modo grabado.")
        return False
    return True


def configurar(modo: str = "auto", modelo: str = MODELO_POR_DEFECTO, max_llamadas: int = 150,
               max_tokens: int = 300_000, carpeta=None, varios_modelos: bool = False) -> Configuracion:
    """Decide el modo y el modelo. Con modo «auto», usa el modo en vivo solo si encuentra una clave que sirve.

    En vivo, max_llamadas y max_tokens ponen un tope a la corrida: así un error no gasta el crédito del curso.
    """
    if ":" not in modelo:
        raise ValueError(f"El modelo debe incluir su proveedor, por ejemplo «{MODELO_POR_DEFECTO}».")
    if modo not in ("auto", "grabado", "en_vivo"):
        raise ValueError("El modo debe ser «auto», «grabado» o «en_vivo».")
    carpeta = Path(carpeta) if carpeta else Path.cwd()
    proveedor = modelo.split(":", 1)[0]
    variable = CLAVES.get(proveedor)
    _cargar_env()
    hay_clave = bool(variable and os.environ.get(variable))

    if modo == "auto":
        modo = "en_vivo" if hay_clave else "grabado"
    if modo == "en_vivo" and not hay_clave:
        # Pide la clave sin mostrarla. Solo queda en la memoria de esta sesión.
        try:
            clave = getpass.getpass(f"Pega tu clave ({variable}) y presiona Enter. No se va a mostrar: ")
        except Exception:  # el notebook corre sin una persona que escriba, por ejemplo con nbconvert
            clave = ""
        if clave.strip():
            os.environ[variable] = clave.strip()
        else:
            print("No hay clave: el notebook usa el modo grabado.")
            modo = "grabado"
    if modo == "en_vivo":
        valida = _probar_clave(proveedor)
        _claves_probadas[proveedor] = valida
        if valida is False:
            print(f"El proveedor rechazó la clave ({variable}). Revisa tu archivo .env.")
            print("Mientras tanto, el notebook usa el modo grabado.")
            modo = "grabado"
        elif valida is None:
            print("No pude comprobar la clave. Sigo en vivo: si las llamadas fallan, revisa tu conexión.")

    config = Configuracion(
        modo=modo,
        modelo=modelo,
        parametros=dict(PARAMETROS.get(modelo, {"max_tokens": 512, "timeout": 60, "max_retries": 3})),
        carpeta=carpeta,
        max_llamadas=max_llamadas,
        max_tokens=max_tokens,
    )
    etiqueta = "Modelos: los eliges en la sección 3.2" if varios_modelos else f"Modelo: {config.nombre_modelo}"
    if modo == "en_vivo":
        print(f"Modo: en vivo · {etiqueta} · "
              f"Límites de esta corrida: {max_llamadas} llamadas y {max_tokens:,} tokens.".replace(",", " "))
        print("El notebook cargó la clave sin mostrarla. Cada llamada usa crédito de la clave.")
    else:
        print(f"Modo: grabado · {etiqueta} · Sin clave y sin costo.")
        print("Las respuestas vienen de corridas reales guardadas en la carpeta «grabaciones».")
    return config
