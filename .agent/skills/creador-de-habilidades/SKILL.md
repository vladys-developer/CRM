---
name: creador-de-habilidades
description: Crea nuevas habilidades (skills) para el agente Antigravity siguiendo el formato estándar, con instrucciones y documentación en español.
---

# Creador de Habilidades

Este skill permite al agente crear otras habilidades modulares dentro del espacio de trabajo o de forma global, asegurando que sigan la estructura requerida por Antigravity.

## Objetivo
Automatizar y estandarizar la creación de nuevas capacidades para el agente, manteniendo la coherencia y el idioma español en toda la documentación técnica de las habilidades.

## Instrucciones

1. **Entender el Requerimiento**: Analiza qué función específica debe cumplir la nueva habilidad.
2. **Definir el Ámbito**: Decide si la habilidad será local (`.agent/skills/`) o global (`~/.gemini/antigravity/skills/`).
3. **Crear el Directorio**: Crea una carpeta con un nombre descriptivo en `kebab-case`.
4. **Redactar el SKILL.md**:
    - Incluye el Frontmatter YAML con `name` y `description` (en español).
    - El cuerpo debe contener: `# Nombre`, `## Objetivo`, `## Instrucciones` y opcionalmente `## Ejemplos` y `## Restricciones`.
5. **Añadir Recursos (Opcional)**: Crea scripts o archivos de configuración si la habilidad los requiere.

## Ejemplos

### Ejemplo de Prompt
"Crea una habilidad para formatear archivos JSON en español."

### Acción del Agente
El agente creará el directorio `formateador-json` y el archivo `SKILL.md` con las instrucciones pertinentes para validar y embellecer JSONs.

## Restricciones
- No crear habilidades que ejecuten comandos destructivos sin confirmación explícita.
- Mantener siempre el idioma español en los nombres y descripciones de las habilidades creadas.
