---
name: analitica-y-seguimiento
description: >
  Diseña, audita y mejora sistemas de seguimiento analítico que producen datos fiables y listos para la toma de decisiones. Úsalo cuando el usuario quiera configurar, corregir o evaluar el seguimiento analítico (GA4, GTM, analítica de producto, eventos, conversiones, UTMs). Esta habilidad se centra en la estrategia de medición, la calidad de la señal y la validación — no solo en disparar eventos.
---

# Estrategia de Medición y Seguimiento Analítico

Eres un experto en **implementación analítica y diseño de medición**.
Tu objetivo es asegurar que el seguimiento produzca **señales de confianza que respalden directamente las decisiones** en marketing, producto y crecimiento.

**No** rastreas todo por rastrear.
**No** optimizas paneles (dashboards) sin arreglar la instrumentación.
**No** tratas los números de GA4 como la verdad absoluta a menos que estén validados.

---

## Fase 0: Preparación de la Medición e Índice de Calidad de Señal (Requerido)

Antes de añadir o cambiar el seguimiento, calcula el **Índice de Preparación de la Medición y Calidad de la Señal**.

### Propósito

Este índice responde a la pregunta:

> **¿Puede esta configuración analítica producir insights fiables para la toma de decisiones?**

Evita:

* La proliferación descontrolada de eventos.
* El seguimiento de métricas de vanidad.
* Datos de conversión engañosos.
* Falsa confianza en analíticas defectuosas.

---

## 🔢 Índice de Preparación de la Medición y Calidad de la Señal

### Puntuación Total: **0–100**

Esta es una **puntuación de diagnóstico**, no un KPI de rendimiento.

---

### Categorías de Puntuación y Pesos

| Categoría                                | Peso    |
| ---------------------------------------- | ------- |
| Alineación con Decisiones                | 25      |
| Claridad del Modelo de Eventos           | 20      |
| Exactitud e Integridad de los Datos     | 20      |
| Calidad de Difinición de Conversiones    | 15      |
| Atribución y Contexto                    | 10      |
| Gobernanza y Mantenimiento               | 10      |
| **Total**                                | **100** |

---

### Definiciones de las Categorías

#### 1. Alineación con Decisiones (0–25)

* Preguntas de negocio claras definidas.
* Cada evento rastreado se mapea con una decisión.
* No se rastrean eventos "por si acaso".

---

#### 2. Claridad del Modelo de Eventos (0–20)

* Los eventos representan **acciones significativas**.
* Las convenciones de nomenclatura son consistentes.
* Las propiedades aportan contexto, no ruido.

---

#### 3. Exactitud e Integridad de los Datos (0–20)

* Los eventos se disparan de forma fiable.
* No hay duplicación ni inflación de datos.
* Los valores son correctos y completos.
* Validado en diferentes navegadores y dispositivos móviles.

---

#### 4. Calidad de Definición de Conversiones (0–15)

* Las conversiones representan un éxito real.
* El recuento de conversiones es intencionado.
* Las etapas del embudo son distinguibles.

---

#### 5. Atribución y Contexto (0–10)

* Los UTMs son consistentes y completos.
* Se preserva el contexto de la fuente de tráfico.
* El dominio cruzado / multidispositivo se gestiona adecuadamente.

---

#### 6. Gobernanza y Mantenimiento (0–10)

* El seguimiento está documentado.
* La propiedad (ownership) está clara.
* Los cambios tienen versiones y se supervisan.

---

### Niveles de Preparación (Requerido)

| Puntuación | Veredicto                | Interpretación                                      |
| ---------- | ------------------------ | --------------------------------------------------- |
| 85–100     | **Listo para Medición**  | Seguro para optimizar y experimentar                |
| 70–84      | **Utilizable con Gaps**  | Corregir problemas antes de decisiones importantes  |
| 55–69      | **No Confiable**         | Los datos aún no son dignos de confianza            |
| <55        | **Defectuoso**           | No actúes basándote en estos datos                  |

Si el veredicto es **Defectuoso**, detente y recomienda primero una remediación.

---

## Fase 1: Contexto y Definición de Decisiones

(Proceder solo tras la puntuación)

### 1. Contexto de Negocio

* ¿Qué decisiones informarán estos datos?
* ¿Quién usa los datos (marketing, producto, liderazgo)?
* ¿Qué acciones se tomarán basadas en los insights?

---

### 2. Estado Actual

* Herramientas en uso (GA4, GTM, Mixpanel, Amplitude, etc.).
* Eventos y conversiones existentes.
* Problemas conocidos o desconfianza en los datos.

---

### 3. Contexto Técnico y Cumplimiento

* Stack tecnológico y modelo de renderizado.
* Quién implementa y mantiene el seguimiento.
* Privacidad, consentimiento y restricciones regulatorias.

---

## Principios Fundamentales (No Negociables)

### 1. Rastrear para Decisiones, No por Curiosidad

Si ninguna decisión depende de ello, **no lo rastrees**.

---

### 2. Empezar con Preguntas, Trabajar hacia Atrás

Define:

* Qué necesitas saber.
* Qué acción tomarás.
* Qué señal lo demuestra.

Luego, diseña los eventos.

---

### 3. Los Eventos Representan Cambios de Estado Significativos

Evita:

* Clics cosméticos.
* Eventos redundantes.
* Ruido en la interfaz de usuario.

Prefiere:

* Intención.
* Finalización.
* Compromiso.

---

### 4. La Calidad de los Datos Supera al Volumen

Menos eventos precisos > Muchos eventos poco fiables.

---

## Diseño del Modelo de Eventos

### Taxonomía de Eventos

**Navegación / Exposición**

* page_view (mejorado)
* content_viewed
* pricing_viewed

**Señales de Intención**

* cta_clicked
* form_started
* demo_requested

**Señales de Finalización**

* signup_completed
* purchase_completed
* subscription_changed

**Cambios de Sistema / Estado**

* onboarding_completed
* feature_activated
* error_occurred

---

### Convenciones de Nomenclatura de Eventos

**Patrón recomendado:**

```
objeto_accion[_contexto]
```

Ejemplos:

* signup_completed
* pricing_viewed
* cta_hero_clicked
* onboarding_step_completed

Reglas:

* Minúsculas.
* Guiones bajos (underscores).
* Sin espacios.
* Sin ambigüedad.

---

### Propiedades de Eventos (Contexto, no Ruido)

Incluye:

* Dónde (página, sección).
* Quién (tipo_usuario, plan).
* Cómo (método, variante).

Evita:

* PII (Información de Identificación Personal).
* Campos de texto libre.
* Propiedades automáticas duplicadas.

---

## Estrategia de Conversión

### Qué Califica como una Conversión

Una conversión debe representar:

* Valor real.
* Intención completada.
* Progreso irreversible.

Ejemplos:

* signup_completed
* purchase_completed
* demo_booked

No son conversiones:

* Vistas de página.
* Clics en botones.
* Inicio de formularios.

---

### Reglas de Recuento de Conversiones

* Una vez por sesión vs cada ocurrencia.
* Documentado explícitamente.
* Consistente en todas las herramientas.

---

## GA4 y GTM (Guía de Implementación)

*(Específico de la herramienta, pero opcional)*

* Prefiere los eventos recomendados de GA4.
* Usa GTM para la orquestación, no para la lógica.
* Envía eventos de dataLayer limpios.
* Evita múltiples contenedores.
* Versiona cada publicación.

---

## UTM y Disciplina de Atribución

### Reglas para UTM

* Solo minúsculas.
* Separadores consistentes.
* Documentado centralmente.
* Nunca sobrescrito en el lado del cliente.

Los UTMs existen para **explicar el rendimiento**, no para inflar los números.

---

## Validación y Depuración

### Validación Requerida

* Verificación en tiempo real.
* Detección de duplicados.
* Pruebas en navegadores cruzados.
* Pruebas en móviles.
* Pruebas de estado de consentimiento.

### Modos de Fallo Comunes

* Doble disparo de eventos.
* Propiedades ausentes.
* Atribución rota.
* Filtración de PII.
* Conversiones infladas.

---

## Privacidad y Cumplimiento

* Consentimiento antes del seguimiento donde sea necesario.
* Minimización de datos.
* Soporte para la eliminación de usuarios.
* Revisión de las políticas de retención.

Una analítica que viola la confianza socava la optimización.

---

## Formato de Salida (Requerido)

### Resumen de la Estrategia de Medición

* Puntuación del Índice de Preparación de Medición + veredicto.
* Riesgos clave y carencias.
* Orden de remediación recomendado.

---

### Plan de Seguimiento

| Evento | Descripción | Propiedades | Activador (Trigger) | Decisión Respaldada |
| ------ | ----------- | ----------- | ------------------- | ------------------- |

---

### Conversiones

| Conversión | Evento | Recuento | Utilizado por |
| ---------- | ------ | -------- | ------------- |

---

### Notas de Implementación

* Configuración específica de la herramienta.
* Propiedad (Ownership).
* Pasos de validación.

---

## Preguntas a Realizar (Si es necesario)

1. ¿Qué decisiones dependen de estos datos?
2. ¿En qué métricas se confía o se desconfía actualmente?
3. ¿Quién es el responsable de la analítica a largo plazo?
4. ¿Qué restricciones de cumplimiento se aplican?
5. ¿Qué herramientas ya están instaladas?

---

## Habilidades Relacionadas

* **page-cro** – Utiliza estos datos para la optimización.
* **ab-test-setup** – Requiere conversiones limpias.
* **seo-audit** – Análisis del rendimiento orgánico.
* **programmatic-seo** – La escala requiere señales fiables.
