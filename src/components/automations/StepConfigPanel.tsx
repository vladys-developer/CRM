import { motion } from 'framer-motion'
import { X, Settings2 } from 'lucide-react'
import type { WorkflowStep } from './types'
import { ACTION_META } from './StepNode'
import { cn } from '@/lib/utils'

interface StepConfigPanelProps {
    step: WorkflowStep
    onUpdate: (config: Record<string, any>) => void
    onClose: () => void
}

export function StepConfigPanel({ step, onUpdate, onClose }: StepConfigPanelProps) {
    const meta = ACTION_META[step.action_type]
    const Icon = meta?.icon ?? Settings2

    function handleChange(key: string, value: string) {
        onUpdate({ ...step.config, [key]: value })
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-xl border border-border bg-card shadow-lg overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', meta?.bg)}>
                        <Icon className={cn('h-4.5 w-4.5', meta?.color)} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{meta?.label ?? step.action_type}</p>
                        <p className="text-xs text-muted-foreground">Configuración</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-5">
                {renderFields(step, handleChange)}
            </div>
        </motion.div>
    )
}

function InputField({
    label, placeholder, value, onChange, type = 'text',
}: {
    label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
        </div>
    )
}

function SelectField({
    label, value, onChange, options,
}: {
    label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            >
                <option value="">Seleccionar...</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    )
}

function TextareaField({
    label, placeholder, value, onChange,
}: {
    label: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
            />
        </div>
    )
}

function renderFields(step: WorkflowStep, onChange: (key: string, val: string) => void) {
    const c = step.config

    switch (step.action_type) {
        case 'send_email':
            return (
                <>
                    <SelectField
                        label="Plantilla"
                        value={c.template ?? ''}
                        onChange={(v) => onChange('template', v)}
                        options={[
                            { value: 'welcome', label: 'Bienvenida' },
                            { value: 'follow_up', label: 'Seguimiento' },
                            { value: 'birthday', label: 'Cumpleaños' },
                            { value: 'promotion', label: 'Promoción' },
                            { value: 'custom', label: 'Personalizado' },
                        ]}
                    />
                    <InputField label="Asunto" placeholder="Ej: ¡Bienvenido a nuestro CRM!" value={c.subject ?? ''} onChange={(v) => onChange('subject', v)} />
                    <TextareaField label="Mensaje" placeholder="Escribe el contenido del email..." value={c.body ?? ''} onChange={(v) => onChange('body', v)} />
                </>
            )
        case 'send_notification':
            return (
                <>
                    <InputField label="Título" placeholder="Ej: Nueva oportunidad creada" value={c.title ?? ''} onChange={(v) => onChange('title', v)} />
                    <TextareaField label="Mensaje" placeholder="Descripción de la notificación..." value={c.message ?? ''} onChange={(v) => onChange('message', v)} />
                    <SelectField
                        label="Canal"
                        value={c.channel ?? ''}
                        onChange={(v) => onChange('channel', v)}
                        options={[
                            { value: 'in_app', label: 'In-App' },
                            { value: 'email', label: 'Email' },
                            { value: 'slack', label: 'Slack' },
                        ]}
                    />
                </>
            )
        case 'delay':
            return (
                <>
                    <InputField label="Duración" placeholder="Ej: 24" value={c.duration ?? ''} onChange={(v) => onChange('duration', v)} type="number" />
                    <SelectField
                        label="Unidad"
                        value={c.unit ?? ''}
                        onChange={(v) => onChange('unit', v)}
                        options={[
                            { value: 'minutos', label: 'Minutos' },
                            { value: 'horas', label: 'Horas' },
                            { value: 'dias', label: 'Días' },
                        ]}
                    />
                </>
            )
        case 'condition':
            return (
                <>
                    <InputField label="Campo" placeholder="Ej: lead_score" value={c.field ?? ''} onChange={(v) => onChange('field', v)} />
                    <SelectField
                        label="Operador"
                        value={c.operator ?? ''}
                        onChange={(v) => onChange('operator', v)}
                        options={[
                            { value: '=', label: 'Igual a' },
                            { value: '!=', label: 'Diferente de' },
                            { value: '>', label: 'Mayor que' },
                            { value: '<', label: 'Menor que' },
                            { value: 'contains', label: 'Contiene' },
                        ]}
                    />
                    <InputField label="Valor" placeholder="Ej: 80" value={c.value ?? ''} onChange={(v) => onChange('value', v)} />
                </>
            )
        case 'update_field':
            return (
                <>
                    <InputField label="Campo" placeholder="Ej: status" value={c.field ?? ''} onChange={(v) => onChange('field', v)} />
                    <InputField label="Nuevo valor" placeholder="Ej: qualified" value={c.value ?? ''} onChange={(v) => onChange('value', v)} />
                </>
            )
        case 'create_activity':
            return (
                <>
                    <InputField label="Título" placeholder="Ej: Llamada de seguimiento" value={c.title ?? ''} onChange={(v) => onChange('title', v)} />
                    <SelectField
                        label="Tipo"
                        value={c.activity_type ?? ''}
                        onChange={(v) => onChange('activity_type', v)}
                        options={[
                            { value: 'llamada', label: 'Llamada' },
                            { value: 'email', label: 'Email' },
                            { value: 'reunion', label: 'Reunión' },
                            { value: 'tarea', label: 'Tarea' },
                        ]}
                    />
                    <TextareaField label="Descripción" placeholder="Detalles..." value={c.description ?? ''} onChange={(v) => onChange('description', v)} />
                </>
            )
        case 'add_tag':
            return (
                <InputField label="Etiqueta" placeholder="Ej: VIP, hot-lead" value={c.tag ?? ''} onChange={(v) => onChange('tag', v)} />
            )
        case 'send_whatsapp':
            return (
                <TextareaField label="Mensaje" placeholder="Escribe el mensaje de WhatsApp..." value={c.message ?? ''} onChange={(v) => onChange('message', v)} />
            )
        case 'move_stage':
            return (
                <InputField label="Etapa destino" placeholder="Ej: Negociación" value={c.stage ?? ''} onChange={(v) => onChange('stage', v)} />
            )
        default:
            return (
                <p className="text-xs text-muted-foreground">No hay campos configurables para este tipo de acción.</p>
            )
    }
}
