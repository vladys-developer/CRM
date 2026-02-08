export type TriggerType =
    | 'contact_created'
    | 'deal_stage_changed'
    | 'activity_due'
    | 'contact_birthday'
    | 'manual'
    | 'scheduled'

export type ActionType =
    | 'send_email'
    | 'send_notification'
    | 'create_activity'
    | 'update_field'
    | 'send_whatsapp'
    | 'add_tag'
    | 'move_stage'
    | 'delay'
    | 'condition'

export interface WorkflowStep {
    id: string
    action_type: ActionType
    config: Record<string, any>
}

export interface AutomationDraft {
    name: string
    description: string
    trigger_type: TriggerType
    trigger_config: Record<string, any>
    steps: WorkflowStep[]
}

export const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
    { value: 'contact_created', label: 'Contacto creado' },
    { value: 'deal_stage_changed', label: 'Etapa de oportunidad cambiada' },
    { value: 'activity_due', label: 'Actividad próxima a vencer' },
    { value: 'contact_birthday', label: 'Cumpleaños del contacto' },
    { value: 'manual', label: 'Ejecución manual' },
    { value: 'scheduled', label: 'Programada (cron)' },
]

export const ACTION_OPTIONS: { value: ActionType; label: string; description: string }[] = [
    { value: 'send_email', label: 'Enviar Email', description: 'Envía un email automático al contacto' },
    { value: 'send_notification', label: 'Notificación', description: 'Envía una notificación al equipo' },
    { value: 'create_activity', label: 'Crear Actividad', description: 'Crea una tarea o actividad nueva' },
    { value: 'update_field', label: 'Actualizar Campo', description: 'Modifica un campo del registro' },
    { value: 'send_whatsapp', label: 'Enviar WhatsApp', description: 'Envía un mensaje por WhatsApp Business' },
    { value: 'add_tag', label: 'Añadir Etiqueta', description: 'Agrega una etiqueta al contacto' },
    { value: 'move_stage', label: 'Mover Etapa', description: 'Mueve la oportunidad a otra etapa' },
    { value: 'delay', label: 'Esperar', description: 'Añade un tiempo de espera entre acciones' },
    { value: 'condition', label: 'Condición', description: 'Bifurca el flujo según una condición' },
]
