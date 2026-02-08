---
name: orquestacion-de-diseno
description: >
  Orquesta flujos de trabajo de diseño dirigiendo el trabajo a través de la 
  lluvia de ideas (brainstorming), revisión multia-agente y preparación para la 
  ejecución en el orden correcto. Evita la implementación prematura, la 
  omisión de validaciones y los diseños de alto riesgo sin revisar.
---

# Orquestación de Diseño (Meta-Habilidad)

## Propósito

Asegurar que las **ideas se conviertan en diseños**, que los **diseños sean revisados** y que 
**solo los diseños validados lleguen a la implementación**.

Esta habilidad no genera diseños por sí misma.
**Controla el flujo entre otras habilidades**.

---

## Modelo Operativo

Esta es una **habilidad de enrutamiento y cumplimiento**, no creativa.

Decide:
- Qué habilidad debe ejecutarse a continuación.
- Si se requiere una escalada hacia una revisión más profunda.
- Si la ejecución (implementación) está permitida.

---

## Habilidades Controladas

esta meta-habilidad coordina las siguientes:

- `brainstorming` — generación de diseño.
- `multi-agent-brainstorming` — validación de diseño.
- Habilidades de planificación o implementación posteriores (downstream).

---

## Condiciones de Entrada

Invoca esta habilidad cuando:
- Un usuario proponga una nueva funcionalidad, sistema o cambio.
- Una decisión de diseño conlleve un riesgo significativo.
- La corrección importe más que la velocidad.

---

## Lógica de Enrutamiento

### Paso 1 — Lluvia de Ideas / Brainstorming (Obligatorio)

Si no existe un diseño validado:

- Invoca `brainstorming`.
- Requiere:
  - "Lock" de Entendimiento (Understanding Lock).
  - Diseño Inicial.
  - Inicio del Registro de Decisiones (Decision Log).

NO está permitido avanzar sin estos artefactos.

---

### Paso 2 — Evaluación de Riesgos

Después de completar la fase de brainstorming, clasifica el diseño como:

- **Riesgo bajo**
- **Riesgo moderado**
- **Riesgo alto**

Utiliza factores como:
- Impacto en el usuario.
- Irreversibilidad.
- Coste operativo.
- Complejidad.
- Incertidumbre.
- Novedad.

---

### Paso 3 — Escalada Condicional

- **Riesgo bajo**  
  → Proceder a la planificación de la implementación.

- **Riesgo moderado**  
  → Recomendar `multi-agent-brainstorming`.

- **Riesgo alto**  
  → REQUERIR `multi-agent-brainstorming`.

Prohibido omitir la escalada cuando sea requerida.

---

### Paso 4 — Revisión Multi-Agente (Si se invoca)

Si se ejecuta `multi-agent-brainstorming`:

Requiere:
- "Lock" de Entendimiento completado.
- Diseño actual.
- Registro de Decisiones (Decision Log).

NO permitas:
- Nueva ideación desde cero.
- Expansión del alcance (scope creep).
- Reabrir la definición del problema.

Solo se permite la crítica, revisión y resolución de decisiones.

---

### Paso 5 — Control de Preparación para la Ejecución

Antes de permitir la implementación:

Confirma:
- El diseño está aprobado (por un solo agente o multi-agente).
- El Registro de Decisiones (Decision Log) está completo.
- Las suposiciones principales están documentadas.
- Los riesgos conocidos han sido reconocidos.

Si alguna condición falla:
- Bloquea la ejecución.
- Regresa a la habilidad apropiada.

---

## Reglas de Cumplimiento

- NO permitas la implementación sin un diseño validado.
- NO permitas omitir una revisión requerida.
- NO permitas escaladas o desescaladas silenciosas.
- NO fusiones las fases de diseño e implementación.

---

## Condiciones de Salida

Esta meta-habilidad finaliza ÚNICAMENTE cuando:
- El siguiente paso está identificado explícitamente, Y
- Todos los pasos previos requeridos están completos.

Posibles salidas:
- “Proceder a la planificación de la implementación”.
- “Ejecutar multi-agent-brainstorming”.
- “Regresar a brainstorming para aclaraciones”.
- "Si un diseño revisado reporta una disposición final de APROBADO, REVISAR o RECHAZAR, DEBES enrutar el flujo de trabajo en consecuencia y establecer el siguiente paso elegido explícitamente."

---

## Filosofía de Diseño

Esta habilidad existe para:
- Ralentizar las decisiones correctas.
- Acelerar la ejecución correcta.
- Prevenir errores costosos.

Los buenos sistemas fallan pronto.
Los malos sistemas fallan en producción.

Esta meta-habilidad existe para imponer lo primero.
