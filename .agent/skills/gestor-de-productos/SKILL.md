---
name: gestor-de-productos
description: Kit de herramientas completo para Product Managers que incluye priorización RICE, análisis de entrevistas con clientes, plantillas de PRD, marcos de descubrimiento y estrategias de salida al mercado. Úsalo para la priorización de funciones, síntesis de investigación de usuarios, documentación de requisitos y desarrollo de estrategias de producto.
---

# Kit de Herramientas del Product Manager

Herramientas y marcos de trabajo esenciales para la gestión de productos moderna, desde el descubrimiento hasta la entrega.

## Inicio Rápido

### Para Priorización de Funciones
```bash
python scripts/rice_prioritizer.py sample  # Crear CSV de ejemplo
python scripts/rice_prioritizer.py sample_features.csv --capacity 15
```

### Para Análisis de Entrevistas
```bash
python scripts/customer_interview_analyzer.py interview_transcript.txt
```

### Para Creación de PRD
1. Elige una plantilla de `references/prd_templates.md`
2. Completa las secciones basadas en el trabajo de descubrimiento.
3. Revisa con los stakeholders.
4. Control de versiones en tu herramienta de PM.

## Flujos de Trabajo Principales

### Proceso de Priorización de Funciones

1. **Recopilar Solicitudes de Funciones**
   - Feedback de clientes
   - Solicitudes de ventas
   - Deuda técnica
   - Iniciativas estratégicas

2. **Puntuar con RICE**
   ```bash
   # Crear CSV con: name,reach,impact,confidence,effort
   python scripts/rice_prioritizer.py features.csv
   ```
   - **Reach (Alcance)**: Usuarios afectados por trimestre.
   - **Impact (Impacto)**: masivo/alto/medio/bajo/mínimo.
   - **Confidence (Confianza)**: alta/media/baja.
   - **Effort (Esfuerzo)**: xl/l/m/s/xs (meses-persona).

3. **Analizar el Portafolio**
   - Revisar "quick wins" (victorias rápidas) vs "big bets" (grandes apuestas).
   - Comprobar la distribución del esfuerzo.
   - Validar contra la estrategia.

4. **Generar Roadmap**
   - Planificación de capacidad trimestral.
   - Mapeo de dependencias.
   - Alineación de stakeholders.

### Proceso de Descubrimiento de Clientes

1. **Realizar Entrevistas**
   - Usar formato semi-estructurado.
   - Enfocarse en problemas, no en soluciones.
   - Grabar con permiso.

2. **Analizar Insights**
   ```bash
   python scripts/customer_interview_analyzer.py transcript.txt
   ```
   Extrae:
   - Puntos de dolor (Pain points) con severidad.
   - Solicitudes de funciones con prioridad.
   - Tareas a realizar (Jobs to be done).
   - Análisis de sentimiento.
   - Temas clave y citas.

3. **Sintetizar Hallazgos**
   - Agrupar puntos de dolor similares.
   - Identificar patrones entre entrevistas.
   - Mapear a áreas de oportunidad.

4. **Validar Soluciones**
   - Crear hipótesis de solución.
   - Probar con prototipos.
   - Medir comportamiento real vs esperado.

### Proceso de Desarrollo de PRD

1. **Elegir Plantilla**
   - **PRD Estándar**: Funciones complejas (6-8 semanas).
   - **PRD de una página**: Funciones simples (2-4 semanas).
   - **Brief de Función**: Fase de exploración (1 semana).
   - **Epic Ágil**: Entrega basada en sprints.

2. **Estructurar Contenido**
   - Problema → Solución → Métricas de éxito.
   - Siempre incluir lo que queda "fuera de alcance" (out-of-scope).
   - Criterios de aceptación claros.

3. **Colaborar**
   - Ingeniería para factibilidad.
   - Diseño para experiencia.
   - Ventas para validación de mercado.
   - Soporte para impacto operativo.

## Scripts Clave

### rice_prioritizer.py
Implementación avanzada del marco de trabajo RICE con análisis de portafolio.

**Funcionalidades**:
- Cálculo de puntuación RICE.
- Análisis de equilibrio de portafolio (quick wins vs big bets).
- Generación de roadmap trimestral.
- Planificación de capacidad del equipo.
- Múltiples formatos de salida (texto/json/csv).

**Ejemplos de Uso**:
```bash
# Priorización básica
python scripts/rice_prioritizer.py features.csv

# Con capacidad de equipo personalizada (meses-persona por trimestre)
python scripts/rice_prioritizer.py features.csv --capacity 20

# Salida como JSON para integración
python scripts/rice_prioritizer.py features.csv --output json
```

### customer_interview_analyzer.py
Análisis de entrevistas basado en NLP para extraer insights accionables.

**Capacidades**:
- Extracción de puntos de dolor con evaluación de severidad.
- Identificación y clasificación de solicitudes de funciones.
- Reconocimiento de patrones "Jobs-to-be-done".
- Análisis de sentimiento.
- Extracción de temas.
- Menciones a competidores.
- Identificación de citas clave.

**Ejemplos de Uso**:
```bash
# Analizar una sola entrevista
python scripts/customer_interview_analyzer.py interview.txt

# Salida como JSON para agregación
python scripts/customer_interview_analyzer.py interview.txt json
```

## Documentos de Referencia

### prd_templates.md
Múltiples formatos de PRD para diferentes contextos:

1. **Plantilla de PRD Estándar**
   - Formato exhaustivo de 11 secciones.
   - Ideal para funciones principales.
   - Incluye especificaciones técnicas.

2. **PRD de Una Página**
   - Formato conciso para alineación rápida.
   - Enfoque en problema/solución/métricas.
   - Bueno para funciones pequeñas.

3. **Plantilla de Epic Ágil**
   - Entrega basada en sprints.
   - Mapeo de historias de usuario.
   - Enfoque en criterios de aceptación.

4. **Brief de Función**
   - Exploración ligera.
   - Basado en hipótesis.
   - Fase previa al PRD.

## Marcos de Priorización

### Marco RICE
```
Puntuación = (Alcance × Impacto × Confianza) / Esfuerzo

Alcance: # de usuarios/trimestre
Impacto: 
  - Masivo = 3x
  - Alto = 2x
  - Medio = 1x
  - Bajo = 0.5x
  - Mínimo = 0.25x
Confianza:
  - Alta = 100%
  - Media = 80%
  - Baja = 50%
Esfuerzo: Meses-persona
```

### Matriz de Valor vs Esfuerzo
```
             Bajo Esfuerzo    Alto Esfuerzo
         
Alto Valor   QUICK WINS       BIG BETS
             [Priorizar]      [Estratégico]
         
Bajo Valor   FILL-INS         TIME SINKS
             [Quizás]         [Evitar]
```

### Método MoSCoW
- **Must Have**: Crítico para el lanzamiento.
- **Should Have**: Importante pero no crítico.
- **Could Have**: Deseable pero no necesario.
- **Won't Have**: Fuera de alcance.

## Marcos de Descubrimiento

### Guía de Entrevista con Clientes
```
1. Preguntas de Contexto (5 min)
   - Rol y responsabilidades.
   - Flujo de trabajo actual.
   - Herramientas utilizadas.

2. Exploración del Problema (15 min)
   - Puntos de dolor.
   - Frecuencia e impacto.
   - Soluciones provisionales actuales.

3. Validación de Soluciones (10 min)
   - Reacción a conceptos.
   - Percepción de valor.
   - Disposición a pagar.

4. Cierre (5 min)
   - Otros pensamientos.
   - Referencias.
   - Permiso para seguimiento.
```

### Plantilla de Hipótesis
```
Creemos que [construir esta función]
Para [estos usuarios]
Logrará [este resultado]
Sabremos que tenemos razón cuando [métrica]
```

### Árbol de Oportunidades-Soluciones
```
Resultado (Outcome)
├── Oportunidad 1
│   ├── Solución A
│   └── Solución B
└── Oportunidad 2
    ├── Solución C
    └── Solución D
```

## Métricas y Analíticas

### Marco de Métrica North Star
1. **Identificar el Valor Principal**: ¿Cuál es el valor número 1 para los usuarios?
2. **Hacerlo Medible**: Cuantificable y rastreable.
3. **Asegurar que sea Accionable**: Los equipos pueden influir en él.
4. **Verificar el Indicador Adelantado**: Predice el éxito del negocio.

### Plantilla de Análisis de Embudo (Funnel)
```
Adquisición → Activación → Retención → Ingresos → Referencia

Métricas Clave:
- Tasa de conversión en cada paso.
- Puntos de abandono.
- Tiempo entre pasos.
- Variaciones de cohortes.
```

### Métricas de Éxito de la Función
- **Adopción**: % de usuarios que usan la función.
- **Frecuencia**: Uso por usuario por período de tiempo.
- **Profundidad**: % de capacidad de la función utilizada.
- **Retención**: Uso continuado en el tiempo.
- **Satisfacción**: NPS/CSAT para la función.

## Mejores Prácticas

### Escribir grandes PRDs
1. Empieza con el problema, no con la solución.
2. Incluye métricas de éxito claras desde el principio.
3. Indica explícitamente qué queda fuera de alcance.
4. Usa elementos visuales (wireframes, flujos).
5. Mantén los detalles técnicos en el apéndice.
6. Control de versiones de los cambios.

### Priorización Efectiva
1. Mezcla victorias rápidas con apuestas estratégicas.
2. Considera el costo de oportunidad.
3. Ten en cuenta las dependencias.
4. Deja margen para trabajo inesperado (20%).
5. Revisa trimestralmente.
6. Comunica las decisiones claramente.

### Consejos para el Descubrimiento de Clientes
1. Pregunta "¿por qué?" 5 veces.
2. Enfócate en el comportamiento pasado, no en intenciones futuras.
3. Evita preguntas sugestivas.
4. Entrevista en su entorno.
5. Busca reacciones emocionales.
6. Valida con datos.

### Gestión de Stakeholders
1. Identifica el RACI para las decisiones.
2. Actualizaciones asíncronas regulares.
3. Demo antes que documentación.
4. Aborda las preocupaciones pronto.
5. Celebra las victorias públicamente.
6. Aprende de los fallos abiertamente.

## Errores Comunes a Evitar

1. **Pensar primero en la solución**: Saltar a funciones antes de entender los problemas.
2. **Parálisis por análisis**: Investigar demasiado sin entregar nada.
3. **Fábrica de funciones**: Entregar funciones sin medir el impacto.
4. **Ignorar la deuda técnica**: No asignar tiempo para la salud de la plataforma.
5. **Sorpresas a stakeholders**: No comunicar temprano y a menudo.
6. **Teatro de métricas**: Optimizar métricas de vanidad sobre el valor real.

## Puntos de Integración

Este kit se integra con:
- **Analíticas**: Amplitude, Mixpanel, Google Analytics.
- **Roadmapping**: ProductBoard, Aha!, Roadmunk.
- **Diseño**: Figma, Sketch, Miro.
- **Desarrollo**: Jira, Linear, GitHub.
- **Investigación**: Dovetail, UserVoice, Pendo.
- **Comunicación**: Slack, Notion, Confluence.

## Chuleta de Comandos Rápidos

```bash
# Priorización
python scripts/rice_prioritizer.py features.csv --capacity 15

# Análisis de Entrevistas
python scripts/customer_interview_analyzer.py interview.txt

# Crear datos de ejemplo
python scripts/rice_prioritizer.py sample

# Salidas JSON para integración
python scripts/rice_prioritizer.py features.csv --output json
python scripts/customer_interview_analyzer.py interview.txt json
```
