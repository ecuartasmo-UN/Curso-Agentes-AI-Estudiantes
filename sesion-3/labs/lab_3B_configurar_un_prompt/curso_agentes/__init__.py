"""Módulo del curso Agentes de IA (aplicado).

Reúne la plomería de los laboratorios:
- el modo grabado, que responde sin clave con respuestas reales guardadas;
- las llamadas al modelo, con sus tokens, su costo y su latencia;
- la tabla de precios, con su fecha y su fuente;
- las pruebas de la capa de evaluación (Anexo J) y la tabla de resultados;
- la presentación de respuestas, tablas y gráficos, y la comprobación de la entrega.

Las llamadas de LangChain que enseña cada laboratorio quedan a la vista en el notebook.
En la sesión 2: init_chat_model, los mensajes, invoke y usage_metadata.
En la sesión 3 se suman el esquema de Pydantic y with_structured_output (Laboratorio 3A),
y ChatPromptTemplate (Laboratorio 3B).

Versión de la sesión 3: amplía la de la sesión 2 sin cambiar sus funciones.
- modelo_grabado: el modelo grabado acepta with_structured_output, y la clave de una grabación incluye el esquema;
- estructurado: lo propio del Laboratorio 3A (el esquema, la lectura, la validación y los campos);
- variantes: lo propio del Laboratorio 3B (las plantillas, la etiqueta de cada respuesta y las medidas).
"""
from .configuracion import MODELO_POR_DEFECTO, PARAMETROS, Configuracion, configurar, versiones
from .formato import miles
from .modelo_grabado import ErrorGrabado, ModeloGrabado, SinGrabacion, clave_de, clave_esquema, modelo_grabado
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
from .estructurado import (
    CAMPOS_BASE,
    COLUMNAS_3A,
    INSTRUCCIONES_3A,
    LIMITE_RESUMEN,
    PLATAFORMAS,
    Lectura,
    armar_campos_nuevos,
    armar_casos_3A,
    armar_limites,
    armar_ticket,
    cargar_tickets,
    casos_para_casa,
    codigo_del_esquema,
    comparar_campo,
    comparar_campos,
    comparar_corridas,
    comprobar_entrega_3A,
    correr_tickets,
    explicar_errores,
    grafico_campos,
    leer_con_reintento,
    leer_ticket,
    listo_para_casa,
    mostrar_ausentes,
    mostrar_banco_campos,
    mostrar_banco_limites,
    mostrar_campos,
    mostrar_esquema,
    mostrar_etapa,
    mostrar_lectura,
    mostrar_resultados_3A,
    mostrar_resumen_3A,
    mostrar_revision_3A,
    mostrar_tickets,
    plantilla_limites,
    prueba_respuesta_cortada,
    prueba_texto_vacio,
    puede_quedar_vacio,
    resumen_3A,
    revisar_configuracion,
    tabla_del_esquema,
    tabla_para_revisar_3A,
    tabla_resultados_3A,
    traducir_error,
    variante_de,
    version_de,
)

from .variantes import (
    COLUMNAS_3B,
    DESEMPATES,
    ETIQUETAS,
    VARIANTES_CLASE,
    armar_casos_3B,
    armar_plantilla,
    armar_plantillas,
    cargar_issues,
    comprobar_entrega_3B,
    correr_variantes,
    cuenta_previa,
    es_rechazo,
    grafico_variantes,
    juzgar_mi_variante,
    leer_etiqueta,
    llamar,
    mensajes_de,
    mostrar_banco_variantes,
    mostrar_consistencia_variantes,
    mostrar_issues,
    mostrar_mensajes,
    mostrar_por_issue,
    mostrar_respuesta_completa,
    mostrar_resultados_3B,
    mostrar_resumen_variantes,
    mostrar_variantes,
    nombre_de,
    parametros_razonamiento,
    probar_construccion,
    recomendar,
    resumen_variantes,
    revisar_criterio_3B,
    revisar_ejemplos,
    revisar_eleccion,
    revisar_mi_variante,
    texto_sistema,
)

__version__ = "2026.11.24-sesion3"
