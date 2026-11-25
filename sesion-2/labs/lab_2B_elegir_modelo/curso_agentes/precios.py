"""Precios por millón de tokens, en dólares, con su fecha y su fuente."""

FECHA_PRECIOS = "23 de noviembre de 2026"

# entrada y salida: USD por millón de tokens.
# Claude Haiku 5.5 cobra más si el prompt pasa de 100 000 tokens.
PRECIOS = {
    "claude-haiku-5-5": {
        "entrada": 0.10,
        "salida": 0.50,
        "umbral_tokens": 100_000,
        "entrada_alto": 0.50,
        "salida_alto": 2.50,
        "fuente": "https://platform.claude.com/docs/en/about-claude/pricing",
    },
    "claude-opus-5-5": {
        "entrada": 4.00,
        "salida": 20.00,
        "fuente": "https://platform.claude.com/docs/en/about-claude/pricing",
    },
    "gemini-2.5-flash-lite": {
        "entrada": 0.10,
        "salida": 0.40,
        "fuente": "https://aistudio.google.com/docs/pricing",
    },
    "gemini-3.5-flash-lite": {
        "entrada": 0.30,
        "salida": 2.50,
        "fuente": "https://aistudio.google.com/docs/pricing",
    },
}


def costo_usd(nombre_modelo: str, tokens_entrada: int, tokens_salida: int) -> float:
    """Costo de una llamada: tokens de entrada × su precio más tokens de salida × el suyo."""
    p = PRECIOS.get(nombre_modelo)
    if p is None:
        return float("nan")
    entrada, salida = p["entrada"], p["salida"]
    if p.get("umbral_tokens") and tokens_entrada > p["umbral_tokens"]:
        entrada, salida = p["entrada_alto"], p["salida_alto"]
    return tokens_entrada * entrada / 1_000_000 + tokens_salida * salida / 1_000_000
