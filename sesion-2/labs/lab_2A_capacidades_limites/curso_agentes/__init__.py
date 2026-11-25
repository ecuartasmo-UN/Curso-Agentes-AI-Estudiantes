"""Módulo del curso Agentes de IA (aplicado).

Reúne la plomería de los laboratorios:
- el modo grabado, que responde sin clave con respuestas reales guardadas;
- las llamadas al modelo, con sus tokens, su costo y su latencia;
- la tabla de precios, con su fecha y su fuente;
- las pruebas de la capa de evaluación (Anexo J) y la tabla de resultados;
- la presentación de respuestas, tablas y gráficos, y la comprobación de la entrega.

Las llamadas de LangChain que enseña cada laboratorio quedan a la vista en el notebook:
init_chat_model, los mensajes, invoke y usage_metadata.
"""
from .configuracion import MODELO_POR_DEFECTO, PARAMETROS, Configuracion, configurar, versiones
from .formato import miles
from .modelo_grabado import ErrorGrabado, ModeloGrabado, SinGrabacion, clave_de, modelo_grabado
from .llamadas import Respuesta, preguntar, texto_de
from .precios import FECHA_PRECIOS, PRECIOS, costo_usd
from .pruebas import (
    COLUMNAS_RESULTADOS,
    TIPOS,
    armar_casos,
    cargar_preguntas,
    casos_para_consistencia,
    contiene_dato,
    corrige,
    correr_consistencia,
    correr_contenido,
    criterio,
    dice_no_se,
    huella_tipo,
    normalizar,
    pass_k,
    prueba_llamada,
    resumen_por_tipo,
    sistema_para,
)
from .vista import (
    grafico_por_tipo,
    mostrar_banco,
    mostrar_casos,
    mostrar_consistencia,
    mostrar_ficha_entrega,
    mostrar_respuesta,
    mostrar_resultados,
    mostrar_resumen,
    mostrar_revision,
    tabla_para_revisar,
    ver_codigo,
)
from .entrega import COSTO_ESTIMADO_G1, comprobar_entrega, costo_de_la_corrida, mostrar_comprobacion
from .configuracion import SOLO_GRABADO, puede_ir_en_vivo
from .clasificacion import (
    CATEGORIAS,
    COLUMNAS_2B,
    CRITERIOS,
    INSTRUCCIONES,
    PRIORIDADES,
    armar_casos_2B,
    cargar_reportes,
    comparar_variantes,
    comprobar_entrega_2B,
    correr_comparacion,
    criterio_clasificacion,
    grafico_comparacion,
    leer_clasificacion,
    modelo_grabado_si_hay,
    mostrar_banco_2B,
    mostrar_consistencia_modelos,
    mostrar_por_caso,
    mostrar_reportes,
    mostrar_resultados_2B,
    mostrar_resumen_modelos,
    prueba_tiempo_agotado,
    recalificar,
    resumen_por_modelo,
    revisar_criterio,
    revisar_instruccion,
    revisar_modelos,
    tabla_decision,
)

__version__ = "2026.11.24"
