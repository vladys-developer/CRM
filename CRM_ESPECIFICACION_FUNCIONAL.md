# Especificación Funcional de CRM

**Documentación técnica para desarrollo de plataforma CRM empresarial**

---

## Resumen Ejecutivo

Sistema CRM integral para PYMEs que unifica comunicación, ventas y marketing con inteligencia artificial. Propuesta de valor: simplicidad sin sacrificar potencia, con énfasis en WhatsApp Business API, automatizaciones avanzadas y experiencia de usuario intuitiva.

**Diferenciadores clave:**

- Inbox multicanal unificado (WhatsApp, email, redes sociales, live chat)
- Motor de automatizaciones con +200 plantillas predefinidas
- IA integrada para generación de contenido, propuestas y enriquecimiento de datos
- Onboarding asistido con sesiones gratuitas y webinars

---

## 1. Módulos Funcionales

### 1.1 Dashboard Principal

**Propósito:** Centro de comando que proporciona visibilidad inmediata del estado del negocio con acceso contextual a todas las áreas críticas.

**Datos gestionados:**

| Categoría | Datos |
|-----------|-------|
| Ventas | Valor de pipeline, tasa de conversión, ingresos cerrados, forecast |
| Actividades | Contadores de pendientes/vencidas, KPIs por rol |
| Alertas | Notificaciones priorizadas, alertas críticas |
| Engagement | Conversaciones activas sin responder, feed de actividad |

**Acciones del usuario:**

- Navegar a módulos vía menú lateral colapsable
- Completar tareas pendientes directamente
- Personalizar widgets (drag & drop)
- Filtrar por período: hoy, semana, mes, trimestre, año, personalizado
- Búsqueda global de contactos, empresas y oportunidades
- Cambiar vista individual/equipo (managers)
- Exportar snapshot

**Automatizaciones del sistema:**

- Actualización en tiempo real vía WebSocket
- Alertas según reglas predefinidas
- Ordenamiento inteligente por prioridad, urgencia y valor
- Cálculo automático de forecast ponderado
- Sugerencias de IA para próxima mejor acción
- Refresh automático cada 30 segundos

---

### 1.2 Contactos

**Propósito:** Gestionar el ciclo de vida completo desde el primer contacto hasta la conversión y mantenimiento de relación.

**Modelo de datos:**

```
CONTACTO
├── Información Personal
│   ├── nombre, apellido
│   ├── email (validado, múltiples)
│   ├── teléfono (móvil, fijo, WhatsApp)
│   ├── cargo, departamento
│   ├── fecha_nacimiento, género
│   ├── idioma_preferido, zona_horaria
│   └── redes_sociales (LinkedIn, Twitter, Facebook)
│
├── Información Empresarial
│   ├── empresa_id (FK)
│   ├── industria, tamaño_empresa
│   └── dirección (calle, ciudad, código_postal, país)
│
├── Gestión
│   ├── estado: Nuevo | Contactado | Calificado | Cliente | Inactivo | Descartado
│   ├── lead_score (0-100, calculado)
│   ├── fuente: Formulario | WhatsApp | Importación | Integración | Referido | Evento
│   ├── propietario_id (FK usuario)
│   ├── equipo_id (FK)
│   ├── prioridad: Alta | Media | Baja
│   └── tags[] (ilimitados)
│
├── Timeline de Interacciones
│   ├── emails[], llamadas[], whatsapp[]
│   ├── reuniones[], propuestas[]
│   ├── formularios_completados[]
│   ├── paginas_visitadas[]
│   └── cambios_estado[]
│
└── Métricas Calculadas
    ├── valor_total_generado
    ├── oportunidades_activas
    ├── probabilidad_conversion (IA)
    ├── engagement_score
    ├── dias_desde_ultima_interaccion
    └── lifetime_value
```

**Acciones del usuario:**

- CRUD de contactos (manual, desde email/WhatsApp, importación masiva)
- Edición inline en vista detalle
- Asignar a usuario/equipo
- Cambiar estado manualmente
- Fusionar duplicados (wizard con selección de campos)
- Exportar (CSV, Excel con filtros)
- Importar con mapeo de campos
- Gestionar etiquetas
- Enviar email/WhatsApp directo
- Iniciar llamada VoIP (click-to-call)
- Programar reunión (integración calendario)
- Crear oportunidad desde contacto
- Bloquear (no enviar comunicaciones)

**Automatizaciones del sistema:**

- Cálculo continuo de lead score según interacciones
- Detección de duplicados por email/teléfono
- Enriquecimiento con IA (LinkedIn, cargo, empresa, ubicación, industria)
- Asignación automática según reglas: round-robin, geográfica, por industria, por fuente, por valor
- Registro automático multi-canal (Gmail/Outlook, VoIP, WhatsApp, landing pages)
- Transición automática de estados según comportamiento
- Alertas de inactividad configurables
- Sincronización bidireccional con integraciones

---

### 1.3 Empresas / Cuentas

**Propósito:** Gestionar información organizacional agrupando múltiples contactos para visión consolidada B2B.

**Modelo de datos:**

```
EMPRESA
├── Información Corporativa
│   ├── nombre_legal, nombre_comercial
│   ├── nif_cif
│   ├── industria, subsector
│   ├── tipo: B2B | B2C | B2B2C
│   ├── año_fundacion
│   ├── num_empleados (rangos)
│   ├── ingresos_anuales
│   └── empresa_matriz_id, filiales[]
│
├── Contacto Corporativo
│   ├── sede_central, oficinas[]
│   ├── telefono_corporativo
│   ├── email_generico
│   ├── sitio_web
│   └── redes_sociales_corporativas
│
├── Datos Comerciales
│   ├── estado: Prospecto | Cliente Activo | Cliente Inactivo | Ex-cliente | Partner
│   ├── tipo_cliente: Pequeño | Mediano | Estratégico | Enterprise
│   ├── tier: Platinum | Gold | Silver | Bronze
│   ├── territorio
│   └── account_manager_id (FK)
│
└── Métricas Financieras
    ├── valor_oportunidades_activas
    ├── contratos_cerrados
    ├── ltv, average_deal_size
    ├── arr, mrr
    ├── fecha_proxima_renovacion
    └── churn_risk_score
```

**Automatizaciones del sistema:**

- Enriquecimiento automático desde fuentes públicas y LinkedIn
- Cálculo de métricas: LTV, ARR/MRR, penetration rate
- Detección de duplicados por nombre, dominio web o NIF
- Alertas de renovación (90-60-30 días)
- Actualización automática de estado según actividad comercial
- Cálculo de churn risk score basado en: uso del producto, tickets, NPS, engagement

---

### 1.4 Oportunidades / Deals

**Propósito:** Gestionar cada oportunidad de venta desde identificación hasta cierre con visibilidad completa del pipeline.

**Modelo de datos:**

```
OPORTUNIDAD
├── Información Básica
│   ├── id, nombre, descripcion
│   ├── valor_monetario, moneda
│   ├── probabilidad_cierre (%)
│   ├── fecha_estimada_cierre
│   ├── fecha_real_cierre
│   └── duracion_ciclo_venta (días)
│
├── Clasificación
│   ├── etapa_actual (pipeline stage)
│   ├── estado: Abierto | Ganado | Perdido | Descartado
│   ├── tipo: Nueva venta | Upsell | Cross-sell | Renovación
│   ├── categoria_producto
│   ├── prioridad
│   └── fuente_original
│
├── Relaciones
│   ├── contacto_principal_id (FK)
│   ├── contactos_adicionales[] (N:N)
│   ├── empresa_id (FK)
│   ├── propietario_id (FK usuario)
│   └── equipo_id
│
├── Productos y Pricing
│   ├── lineas_productos[]
│   │   ├── producto, cantidad
│   │   ├── precio_unitario, descuento
│   │   └── subtotal
│   ├── descuento_global
│   ├── impuestos
│   └── total
│
└── Competencia y Contexto
    ├── competidores[]
    ├── ventajas_competitivas
    ├── razon_perdida (si aplica)
    └── competidor_ganador (si aplica)
```

**Acciones del usuario:**

- CRUD de oportunidades
- Mover entre etapas del pipeline (drag & drop)
- Añadir/editar productos y calcular totales
- Generar presupuesto/propuesta (plantillas o IA)
- Enviar propuesta (email, firma electrónica, tracking)
- Marcar como ganado (confirmar valor, crear contrato, generar factura)
- Marcar como perdido (razón, competidor ganador, fecha re-contacto)
- Registrar actividades de seguimiento
- Adjuntar archivos
- Transferir a otro vendedor

**Automatizaciones del sistema:**

- Actualización de probabilidad según etapa
- Cálculo de valor ponderado para forecast
- Recordatorios de seguimiento (inactividad, fecha cierre próxima, estancamiento)
- Alertas a manager si valor > umbral o si overdue
- Movimiento automático entre etapas según criterios
- Asignación automática de tareas por etapa
- Cálculo de comisiones
- Generación de insights con IA

---

### 1.5 Pipeline de Ventas

**Propósito:** Visualizar y gestionar el flujo de oportunidades con pronóstico preciso.

**Configuración del Pipeline:**

```
PIPELINE
├── nombre
├── etapas[]
│   ├── nombre, descripcion
│   ├── orden
│   ├── probabilidad_cierre (%)
│   ├── criterios_entrada[]
│   ├── criterios_salida[]
│   ├── tiempo_promedio_benchmark (días)
│   ├── campos_requeridos[]
│   ├── automatizaciones[]
│   └── color
│
└── métricas
    ├── oportunidades_por_etapa
    ├── valor_total_por_etapa
    ├── valor_ponderado
    ├── tasa_conversion_entre_etapas
    ├── tiempo_promedio_por_etapa
    ├── velocidad_pipeline
    ├── win_rate
    └── average_deal_size
```

**Vistas disponibles:**

- **Kanban:** Columnas por etapa, tarjetas arrastrables
- **Lista:** Tabla con filtros y ordenamiento
- **Forecast:** Proyección de ingresos por período

**Indicadores visuales:**

| Color | Significado |
|-------|-------------|
| Verde | Deal saludable, actividad reciente |
| Amarillo | En etapa más tiempo del promedio |
| Rojo | Sin actividad > 7 días |
| Parpadeante | Fecha de cierre pasada |

---

### 1.6 Actividades

**Propósito:** Gestionar todas las interacciones y tareas asegurando trazabilidad completa.

#### 1.6.1 Tareas

**Campos:**

- título, descripción (rich text)
- tipo: Llamada pendiente | Email a enviar | Preparar demo | Seguimiento | Otro
- fecha_vencimiento, duración_estimada
- prioridad: Alta | Media | Baja
- estado: Pendiente | En progreso | Completada | Cancelada | Pospuesta
- asignado_a, creado_por
- relacionado_con: contacto, empresa, oportunidad
- recordatorios: push, email, SMS
- subtareas[] (checklist con % completitud)
- recurrencia: diaria | semanal | mensual | personalizada

#### 1.6.2 Llamadas

**Campos:**

- tipo: Entrante | Saliente
- contacto, empresa, oportunidad
- fecha_hora, duración_real
- resultado: Contactado | No contactado | Buzón | Número equivocado | Rechazó
- disposición: Interesado | No interesado | Solicita info | Agendar reunión | Callback | Do not call
- notas, próximo_paso
- grabación (audio), transcripción (IA)
- sentimiento_ia: Positivo | Neutral | Negativo

#### 1.6.3 Emails

**Campos:**

- from, to[], cc[], bcc[]
- asunto, cuerpo (HTML), adjuntos[]
- estado: Borrador | Enviado | Entregado | Abierto | Clickeado | Respondido | Rebotado | Spam
- plantilla_usada, variables_usadas
- tracking: aperturas, clicks, dispositivo, ubicación
- thread_id (conversaciones relacionadas)
- sincronización: Gmail | Outlook | otro

#### 1.6.4 Reuniones

**Campos:**

- título, agenda
- tipo: Presencial | Virtual (Zoom, Meet, Teams)
- fecha_inicio, duración, fecha_fin
- ubicación_fisica | link_videollamada
- organizador, participantes_internos[], participantes_externos[]
- empresa, oportunidad
- estado: Programada | En curso | Completada | Cancelada | No asistieron
- recordatorios: email, push
- notas_pre, notas_durante, acta_post
- proximos_pasos, tareas_derivadas[]
- grabación, transcripción
- integración: Google Calendar | Outlook | iCal

---

### 1.7 Calendario / Agenda

**Propósito:** Vista temporal unificada de actividades facilitando organización y coordinación.

**Funcionalidades:**

- **Vistas:** Día, semana laboral, semana completa, mes, agenda, año
- **Vista split:** Mi calendario + calendario de colega
- **Vista overlay:** Calendarios de equipo superpuestos
- **Creación rápida:** Drag on time slot, click en slot
- **Booking links:** URLs personalizadas tipo Calendly para agendamiento externo
- **Sincronización bidireccional:** Google Calendar, Outlook, iCal
- **Generación automática:** Links de videollamada (Zoom, Meet, Teams)
- **Detección de conflictos:** Alerta y sugerencia de slots alternativos
- **Búsqueda de mejor slot:** Para reuniones grupales considerando disponibilidad de todos

**Configuración personal:**

- Horario laboral, zona horaria
- Días laborables, buffer entre reuniones
- Slots de disponibilidad para booking externo
- Color coding por tipo de evento

---

### 1.8 Usuarios, Equipos y Permisos

**Propósito:** Gestionar accesos, roles y estructura organizacional con seguridad granular.

#### Roles Predefinidos

| Rol | Descripción | Permisos Clave |
|-----|-------------|----------------|
| **Super Admin** | Control total del sistema | Todo: configuración, facturación, usuarios, datos |
| **Admin** | Administrador de cuenta | Todo excepto facturación |
| **Sales Manager** | Gestión de equipo comercial | Ver/gestionar equipo, configurar pipeline, reportes |
| **Vendedor** | Gestión de cartera propia | CRUD propio, ver equipo (config.), comunicación |
| **Marketing Manager** | Gestión de marketing | Campañas, listas, landing pages, analytics |
| **Marketing User** | Ejecución de marketing | Crear/editar campañas propias, analytics limitados |
| **Soporte** | Atención al cliente | Inbox, tickets, ver contactos (no editar) |
| **Ejecutivo** | Visibilidad de alto nivel | Dashboards, reportes, read-only en general |
| **Partner** | Acceso externo limitado | Solo datos compartidos, crear/ver leads referidos |

#### Permisos Granulares

```
PERMISOS
├── Por módulo (CRUD)
│   ├── contactos, empresas, oportunidades
│   ├── actividades, marketing, comunicación
│   └── reportes, configuración
│
├── Visibilidad de datos
│   ├── Solo míos
│   ├── Mi equipo
│   ├── Mi territorio
│   └── Todos
│
└── Límites operacionales
    ├── max_contactos_exportar
    ├── puede_eliminar_permanente
    └── puede_modificar_forecast
```

#### Seguridad

- Política de contraseñas (longitud, complejidad, expiración)
- 2FA obligatorio (configurable)
- SSO/SAML
- Timeout de sesión
- IP whitelisting
- Gestión de API keys
- Logs de auditoría completos
- Bloqueo automático tras X intentos fallidos

#### Campos de Auditoría (todos los registros)

- created_by, created_at
- modified_by, modified_at
- assigned_to
- last_viewed_by, last_viewed_at

---

### 1.9 Automatizaciones / Workflows

**Propósito:** Flujos automatizados basados en triggers y condiciones para eliminar trabajo manual y asegurar consistencia.

#### Estructura de Automatización

```
AUTOMATIZACIÓN
├── Configuración
│   ├── nombre, descripción
│   ├── estado: Activo | Inactivo | Borrador | En prueba
│   ├── carpeta: Ventas | Marketing | Soporte | Onboarding
│   └── métricas: ejecuciones, tasa_éxito
│
├── Trigger (Disparador)
│   ├── Basado en tiempo
│   │   ├── Fecha específica
│   │   ├── X días/horas después de evento
│   │   ├── Día de semana a hora específica
│   │   └── Fecha de campo (ej: cumpleaños)
│   │
│   └── Basado en eventos
│       ├── Contacto: creado, actualizado, tag añadido
│       ├── Email: abierto, clickeado
│       ├── Formulario completado, página visitada
│       ├── Oportunidad: creada, cambio etapa, ganada/perdida
│       ├── Tarea: creada, completada, vencida
│       ├── Mensaje WhatsApp recibido
│       ├── Lead score alcanza umbral
│       └── Webhook externo
│
├── Condiciones (Filtros)
│   ├── Datos: lead_score > X, industria = Y, país = Z
│   ├── Comportamiento: abrió X emails, visitó pricing
│   ├── Relaciones: tiene oportunidad activa, valor > €X
│   ├── Tiempo: día de semana, hora, mes
│   └── Lógica: AND / OR / NOT, grupos anidados
│
├── Acciones
│   ├── Comunicación
│   │   ├── Enviar email (plantilla, variables, adjuntos)
│   │   ├── Enviar WhatsApp (plantilla aprobada)
│   │   ├── Enviar SMS
│   │   └── Notificación interna/push
│   │
│   ├── Registros
│   │   ├── Crear/actualizar contacto, empresa, oportunidad
│   │   ├── Añadir/remover tag
│   │   ├── Cambiar estado, propietario
│   │   ├── Añadir/remover de lista marketing
│   │   └── Actualizar lead score
│   │
│   ├── Actividades
│   │   ├── Crear tarea, reunión
│   │   ├── Registrar llamada
│   │   └── Añadir nota
│   │
│   ├── Integraciones
│   │   ├── Webhook a URL externa
│   │   ├── Notificar en Slack
│   │   └── Actualizar Google Sheet
│   │
│   └── Lógica
│       ├── Esperar X tiempo
│       ├── Ramificación If/Then/Else
│       ├── Fin de automatización
│       └── Activar otra automatización
│
└── Logs de Ejecución
    ├── fecha_hora, contacto
    ├── acciones_completadas, acciones_fallidas
    └── tiempo_ejecución, condiciones_evaluadas
```

#### Plantillas Predefinidas (+200)

| Categoría | Ejemplos |
|-----------|----------|
| Gestión de Leads | Bienvenida, calificación automática, asignación geográfica, round-robin, nurturing, reactivación |
| Seguimiento de Ventas | Follow-up post-demo, seguimiento propuesta, recordatorio reunión, onboarding cliente |
| Marketing | Drip campaign, recuperación carrito, re-engagement, promoción cumpleaños |
| E-commerce | Confirmación pedido, notificación envío, solicitud review, upsell post-compra |
| Eventos | Confirmación registro, recordatorio previo, follow-up, encuesta satisfacción |

#### Builder Visual

- Canvas drag-and-drop con bloques conectables
- Bloques: Trigger, Condición, Acción, Espera, Ramificación
- Validación en tiempo real
- Preview del flujo completo
- Modo prueba (test mode) sin afectar datos reales
- A/B testing de variaciones

---

### 1.10 Reporting / Business Intelligence

**Propósito:** Análisis avanzados y visualización interactiva para toma de decisiones informadas.

#### Dashboards

**Predefinidos:** Ejecutivo, Ventas (Manager), Vendedor individual, Marketing, Soporte, Operaciones

**Personalizados:**
- Widgets configurables (drag & drop)
- Filtros globales
- Visibilidad: Privado | Equipo | Toda la empresa
- Refresh automático

#### Tipos de Visualización

| Tipo | Uso |
|------|-----|
| KPI (número grande) | Valor actual con comparación período anterior, sparkline |
| Línea | Tendencias temporales, múltiples series |
| Barra | Comparaciones entre categorías |
| Pie/Donut | Distribución porcentual |
| Embudo | Conversión por etapas |
| Tabla | Datos tabulares, ordenables, exportables |
| Heatmap | Actividad por día/hora, performance por región |
| Gauge | Progreso hacia meta |

#### Reportes Predefinidos

**Ventas:**
- Pipeline Analysis: valor total/ponderado, conversión entre etapas, velocidad
- Forecast: mensual/trimestral/anual, progreso vs cuota
- Win/Loss: win rate por vendedor/producto/fuente, razones de pérdida
- Performance: ingresos, deals cerrados, ciclo de venta
- Actividad: llamadas, emails, reuniones por vendedor

**Marketing:**
- Lead Generation: por fuente, campaña, CPL, conversión Lead→MQL→SQL
- Campaign Performance: open rate, CTR, ROI
- Email Metrics: deliverability, bounce, engagement por día/hora
- Conversion Funnel: visitante→lead→MQL→SQL→oportunidad→cliente
- Content Performance: más visitados, más descargados, más efectivos

**Comunicación:**
- Inbox Performance: tiempo primera respuesta, resolución, CSAT, NPS
- WhatsApp Metrics: entregados, leídos, conversión chat→venta
- Carga de trabajo por agente

**Clientes:**
- Customer Health: activos, en riesgo, inactivos
- Retention & Churn: tasa, revenue churn, MRR/ARR
- Lifetime Value: por segmento, fuente, producto, cohorte

#### Exportación

- Formatos: CSV, Excel, PDF, Google Sheets
- Envío automático programado
- Conexión con BI externos: Looker Studio, Tableau, Power BI

---

### 1.11 Inbox Multicanal Unificado

**Propósito:** Centralizar todas las conversaciones en una bandeja de entrada inteligente para respuesta rápida y contextualizada.

#### Canales Soportados

| Canal | Capacidades Clave |
|-------|-------------------|
| **WhatsApp Business API** | Mensajes 1:1, broadcast, plantillas (transaccional/marketing/auth), media rico, botones, listas interactivas, chatbot IA |
| **Email** | Sincronización bidireccional Gmail/Outlook, tracking apertura/clicks, plantillas, programación |
| **Live Chat** | Widget embebible, chat proactivo, pre-chat form, chatbot, offline form |
| **Facebook Messenger** | Mensajes, media, quick replies, templates |
| **Instagram DM** | Mensajes directos, respuesta a stories |
| **Telegram** | Bot, comandos, inline keyboards |
| **SMS** | Envío/recepción, campañas masivas |

#### Layout del Inbox

```
┌─────────────────────────────────────────────────────────────────┐
│                         INBOX UNIFICADO                          │
├──────────────┬────────────────────────┬────────────────────────┤
│  LISTA       │   CONVERSACIÓN         │   CONTEXTO              │
│  CONVERSACIONES │   ACTIVA             │   (SIDEBAR)            │
│              │                        │                        │
│ • Avatar     │ Thread de mensajes     │ • Info contacto        │
│ • Nombre     │ (cronológico)          │ • Lead score           │
│ • Canal 📱   │                        │ • Timeline reciente    │
│ • Preview    │ Diferenciación visual  │ • Oportunidades        │
│ • Timestamp  │ cliente vs agente      │ • Acciones rápidas     │
│ • Estado     │                        │                        │
│ • Sin leer   │ ─────────────────────  │ [Ver perfil]           │
│              │ Caja de respuesta      │ [Crear oportunidad]    │
│ [Filtros]    │ 📎 😊 /plantilla @     │ [Programar reunión]    │
└──────────────┴────────────────────────┴────────────────────────┘
```

#### Reglas de Asignación

| Tipo | Descripción |
|------|-------------|
| Round Robin | Distribución equitativa entre agentes disponibles |
| Por Canal | WhatsApp→Equipo A, Email→Equipo B |
| Por Idioma | Detecta idioma, asigna a agente que lo habla |
| Por Palabras Clave | "soporte"→Soporte, "ventas"→Comercial |
| Por Horario | Fuera de horario→cola/chatbot |
| Por VIP/Prioridad | Cliente VIP→agente senior |

#### Chatbot con IA

- Comprensión de lenguaje natural (NLP)
- Respuestas automáticas a FAQ
- Calificación de leads (preguntas de descubrimiento)
- Programación de reuniones
- Transferencia a humano cuando necesario
- Respuestas contextuales basadas en página/producto/conversación previa
- Entrenamiento: base FAQ + ML de conversaciones + feedback de agentes

#### Métricas y SLAs

- Tiempo primera respuesta
- Tiempo resolución completa
- CSAT, NPS
- FCR (First Contact Resolution)
- Tasa de transferencia
- Tasa de abandono

---

### 1.12 Marketing

**Propósito:** Gestionar campañas, listas, landing pages y contenido para generación y nurturing de leads.

#### Funcionalidades

**Campañas de Email:**
- Editor drag-and-drop
- Plantillas responsivas
- Variables de personalización
- A/B testing
- Programación de envío
- Tracking completo

**Landing Pages:**
- Builder visual sin código
- Plantillas optimizadas para conversión
- Formularios integrados
- Tracking de visitas y conversiones
- A/B testing

**Listas y Segmentación:**
- Listas estáticas y dinámicas
- Segmentación avanzada por atributos y comportamiento
- Supresión automática (bounces, unsubscribes)

**WhatsApp Campaigns:**
- Plantillas aprobadas por Meta
- Broadcast masivo
- Personalización con variables
- Tracking de entrega/lectura/respuesta

---

## 2. Modelo de Datos Global

### Diagrama de Relaciones

```
┌─────────────┐     N:1     ┌─────────────┐
│  CONTACTO   │────────────►│   EMPRESA   │
└─────────────┘             └─────────────┘
       │                           │
       │ 1:N                       │ 1:N
       ▼                           ▼
┌─────────────┐             ┌─────────────┐
│ OPORTUNIDAD │◄────────────│ OPORTUNIDAD │
└─────────────┘             └─────────────┘
       │
       │ N:1
       ▼
┌─────────────┐
│   PIPELINE  │
│    (Etapa)  │
└─────────────┘

┌─────────────┐     N:1     ┌─────────────┐
│  ACTIVIDAD  │────────────►│  CONTACTO   │
│  (Tarea,    │             │  /EMPRESA   │
│   Llamada,  │             │  /OPORTUNIDAD│
│   Email,    │             └─────────────┘
│   Reunión)  │
└─────────────┘

┌─────────────┐     N:N     ┌─────────────┐
│  CONTACTO   │◄───────────►│   LISTA     │
└─────────────┘             │  MARKETING  │
                            └─────────────┘

┌─────────────┐     N:1     ┌─────────────┐
│ CONVERSACIÓN│────────────►│  CONTACTO   │
└─────────────┘             └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│   MENSAJE   │
└─────────────┘

┌─────────────┐     N:1     ┌─────────────┐
│   USUARIO   │────────────►│   EQUIPO    │
└─────────────┘             └─────────────┘
       │
       │ N:N
       ▼
┌─────────────┐
│     ROL     │
└─────────────┘
```

---

## 3. Integraciones

### Integraciones Nativas

| Categoría | Plataformas |
|-----------|-------------|
| Comunicación | WhatsApp Business API, Gmail, Outlook, Telegram |
| Calendario | Google Calendar, Outlook Calendar, iCal |
| Videollamadas | Zoom, Google Meet, Microsoft Teams |
| Redes Sociales | Facebook Messenger, Instagram DM |
| Storage | Google Drive, Dropbox |
| Pagos | Stripe (opcional) |
| VoIP | Twilio (click-to-call, grabación) |

### API y Webhooks

- API REST documentada
- Webhooks para eventos clave
- Zapier / Make para integraciones sin código
- SDK para integraciones personalizadas

---

## 4. Requisitos No Funcionales

### Performance

| Métrica | Objetivo |
|---------|----------|
| Tiempo de carga de página | < 2 segundos |
| Tiempo de respuesta API | < 200ms (p95) |
| Actualización en tiempo real | WebSocket, latencia < 1 segundo |
| Disponibilidad | 99.9% uptime |

### Seguridad

- Encriptación en tránsito (TLS 1.3)
- Encriptación en reposo (AES-256)
- Autenticación: password + 2FA + SSO/SAML
- Auditoría completa de acciones
- Cumplimiento GDPR

### Escalabilidad

- Arquitectura multi-tenant
- Auto-scaling según carga
- CDN para assets estáticos
- Cache distribuido (Redis)
- Base de datos con réplicas de lectura

---

## 5. Métricas de Éxito

### KPIs de Producto

| Métrica | Descripción |
|---------|-------------|
| DAU/MAU | Ratio de usuarios activos diarios vs mensuales |
| Time to First Value | Tiempo hasta que usuario completa acción de valor |
| Feature Adoption | % de usuarios usando cada funcionalidad clave |
| NPS | Net Promoter Score del producto |
| Churn Rate | Tasa de abandono mensual |

### KPIs de Negocio (para usuarios del CRM)

| Área | Métricas |
|------|----------|
| Ventas | Pipeline value, win rate, ciclo de venta, forecast accuracy |
| Marketing | CPL, conversión, ROI de campañas, engagement |
| Comunicación | Tiempo de respuesta, CSAT, resolución en primer contacto |
| Retención | Churn rate, LTV, NPS |

---

## 6. Roadmap de Funcionalidades

### MVP (Fase 1)

- Contactos y Empresas (CRUD completo)
- Oportunidades y Pipeline básico
- Actividades (tareas, notas)
- Dashboard básico
- Usuarios y permisos básicos
- Importación/exportación CSV

### Fase 2

- Inbox multicanal (Email, WhatsApp)
- Automatizaciones básicas
- Calendario integrado
- Reportes predefinidos
- Mobile app

### Fase 3

- IA integrada (lead scoring, sugerencias, enriquecimiento)
- Automatizaciones avanzadas (builder visual)
- Marketing (campañas, landing pages)
- Integraciones externas
- API pública

### Fase 4

- Chatbot avanzado
- Forecasting predictivo
- Análisis de sentimiento
- Gamificación
- Marketplace de integraciones

---

## Anexo: Glosario

| Término | Definición |
|---------|------------|
| ARR | Annual Recurring Revenue - Ingresos recurrentes anuales |
| BANT | Budget, Authority, Need, Timeline - Framework de calificación |
| CAC | Customer Acquisition Cost - Costo de adquisición de cliente |
| CPL | Cost Per Lead - Costo por lead |
| CSAT | Customer Satisfaction Score |
| CTR | Click-Through Rate - Tasa de click |
| FCR | First Contact Resolution - Resolución en primer contacto |
| LTV | Lifetime Value - Valor de vida del cliente |
| MQL | Marketing Qualified Lead |
| MRR | Monthly Recurring Revenue - Ingresos recurrentes mensuales |
| NPS | Net Promoter Score |
| SQL | Sales Qualified Lead |
| SLA | Service Level Agreement |

---

*Documento generado para desarrollo de plataforma CRM. Versión consolidada y optimizada.*
