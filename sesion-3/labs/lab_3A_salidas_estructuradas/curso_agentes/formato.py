"""Formato de números para los textos del notebook."""


def miles(n) -> str:
    """Escribe un entero con espacios entre los miles, como pide el estilo del curso: 25 123."""
    return f"{int(n):,}".replace(",", " ")
