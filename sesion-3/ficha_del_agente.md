# Ficha del agente: <nombre del proyecto>

**Agentes de IA (aplicado)**

La ficha crece con cada capa del proyecto. La sección 0 es la ficha inicial de la sesión 1. Cada capa agrega una sección, que se entrega al inicio de la sesión siguiente.

**Versión de la sesión 3.** Agrega la guía de la sección 2. Si ya tienen su ficha con las secciones 0 y 1, copien en ella la sección 2.

| Proyecto | | Grupo | |
|---|---|---|---|
| **Integrantes** | | **Última actualización** | |

## 0. La idea (sesión 1)

Copien aquí la ficha inicial, con los ajustes que pidió el docente.

**Problema y usuario.** *Qué problema resuelve el agente y para quién. Nombren el rol que lo sufre.*

**Tarea central.** *Qué hace el agente, en una o dos frases. Un verbo y un objeto.*

**Entradas y salidas.** *Qué recibe y qué entrega, con su formato: texto, tabla, correo o archivo.*

**Acciones.** *Qué tendría que hacer: consultar, calcular, escribir o enviar. Marquen cuáles escriben o envían.*

**Criterio de éxito.** *Cómo se comprueba que el agente hizo bien la tarea. Algo que se cuenta o se compara.*

**Datos.** *De dónde salen los datos. Deben ser sintéticos o anonimizados. Nunca datos personales reales.*

**Riesgos.** *Qué puede salir mal y qué decisiones debe tomar una persona.*

**¿Flujo o agente?** *La primera hipótesis: LLM directo, flujo o agente. Se revisa en la sesión 4.*

## 1. El modelo (capa 1, sesión 2)

La parte 1 se escribe después del bloque 2.1: los diez casos y los tres de robustez. La parte 2 se completa después del bloque 2.2: correr, medir y elegir. La sección se entrega al inicio del bloque 3.1.

**Modelo elegido y razón.** *El modelo del proyecto y por qué: calidad en los diez casos, costo por acierto, latencia y tratamiento de los datos.*

**Modelos comparados.** *Los dos modelos que probaron, con su nombre exacto y su proveedor.*

### Tabla de los diez casos

*Diez casos de la tarea central, a partir de los cinco de la ficha inicial. Mezclen fáciles, difíciles y de borde. El resultado esperado se debe poder comprobar.*

| Caso | Tipo | Entrada | Resultado esperado |
|---|---|---|---|
| C01 | fácil | | |
| C02 | | | |
| C03 | | | |
| C04 | | | |
| C05 | | | |
| C06 | | | |
| C07 | | | |
| C08 | | | |
| C09 | | | |
| C10 | | | |

### Casos de robustez

*Tres entradas difíciles a propósito. El resultado esperado dice qué debe hacer el modelo: pedir aclaración, corregir la premisa o reconocer que no sabe.*

| Caso | Tipo | Entrada | Resultado esperado |
|---|---|---|---|
| R01 | entrada ambigua | | |
| R02 | premisa falsa | | |
| R03 | fuera de alcance | | |

### Tabla de resultados

*Una fila por cada caso, por modelo y por intento. Las columnas siguen el esquema de resultados del curso.*

| caso_id | tipo_prueba | modelo | modo | intento | esperado | obtenido | resultado | razon_fallo | tokens_entrada | tokens_salida | costo_usd | latencia_s | fecha |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | | |

- *`tipo_prueba`: `funcionamiento` para los diez casos y `robustez` para los tres de robustez.*
- *`modo`: `grabado` o `en_vivo`.*
- *`resultado`: `pasa` o `falla`. Si falla, `razon_fallo` dice por qué.*

**Consistencia (pass^k).** *Repitan tres casos tres veces cada uno. Reporten qué proporción acertó en los tres intentos.*

**Costo por caso.** *El costo promedio por caso de cada modelo y el costo por acierto: el costo total entre los casos bien resueltos.*

## 2. Las instrucciones (capa 2, sesión 3)

La parte 1 se escribe después del bloque 3.1: el prompt de sistema, el esquema y los registros esperados. La parte 2 se completa después del bloque 3.2: conectar por API, correr las pruebas y registrar. La sección se entrega al inicio del bloque 4.1, con el código de la capa.

**Prompt de sistema.** *El texto completo, con sus piezas: instrucción clara, contexto, ejemplos y formato de salida. Marquen dónde entra el caso de cada llamada, por ejemplo con `{ticket}`.*

**Modelo y parámetros.** *El modelo de la capa 1 y los parámetros que fijaron: máximo de tokens de salida, esfuerzo de razonamiento, tiempo de espera y reintentos. Los modelos del curso no usan la temperatura.*

### Esquema de la salida estructurada

*Un campo por fila. Ningún campo pide datos personales. Prevean una salida para las entradas que no aplican, por ejemplo una categoría «fuera de alcance».*

| Campo | Tipo | ¿Obligatorio? | Valores permitidos | Qué contiene |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

### Registros esperados

*El registro esperado de cada uno de los diez casos de la capa 1, campo por campo. Un dato que no está en la entrada queda vacío (null).*

| Caso | Registro esperado |
|---|---|
| C01 | |
| C02 | |
| C03 | |
| C04 | |
| C05 | |
| C06 | |
| C07 | |
| C08 | |
| C09 | |
| C10 | |

### Casos de robustez

*Tres casos difíciles a propósito. Digan cómo se provoca cada uno y qué debe pasar.*

| Caso | Tipo | Entrada o cómo se provoca | Resultado esperado |
|---|---|---|---|
| R01 | entrada incompleta | | |
| R02 | respuesta mal formada | | |
| R03 | fuera de alcance | | |

### Resultados de la validación

*Una fila por caso, por etapa y por intento. Las columnas siguen el esquema de resultados del curso.*

| caso_id | etapa | tipo_prueba | modelo | modo | intento | esperado | obtenido | resultado | razon_fallo | tokens_entrada | tokens_salida | costo_usd | latencia_s | fecha |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | | | |

- *`etapa`: `esquema` si la prueba revisa que la salida cumpla el esquema, o `campos` si compara cada campo con el registro esperado.*
- *`tipo_prueba`: `funcionamiento` para los diez casos y `robustez` para los tres de robustez.*
- *`resultado`: `pasa` o `falla`. Si falla, `razon_fallo` dice por qué; por ejemplo, «falta el campo prioridad».*

**Resumen de la capa.** *El porcentaje de salidas válidas, el porcentaje de campos correctos y el costo total de las pruebas.*

## 3. El ciclo del agente (capa 3)
Se completa después de la sesión 4.

## 4. Las herramientas (capa 4)
Se completa después de la sesión 5.

## 5. El contexto (capa 5)
Se completa después de la sesión 6.

## 6. La orquestación (capa 6)
Se completa después de la sesión 7 y se entrega en la sesión 8.

## 7. Resultados de todas las pruebas
Se completa a lo largo del curso, con la tabla de resultados de cada capa.

## 8. Interfaz (opcional)
Se completa si el grupo construye una interfaz.
