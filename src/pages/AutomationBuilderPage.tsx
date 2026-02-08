import { useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import {
    ArrowLeft,
    Save,
    Zap,
    Loader2,
    Eye,
    UserPlus,
    ArrowRightLeft,
    Bell,
    Cake,
    Hand,
    Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useCreateAutomation, useUpdateAutomation, useAutomation } from '@/hooks/useAutomations'
import { WorkflowCanvas } from '@/components/automations/WorkflowCanvas'
import { StepConfigPanel } from '@/components/automations/StepConfigPanel'
import {
    type WorkflowStep,
    type ActionType,
    type TriggerType,
    TRIGGER_OPTIONS,
} from '@/components/automations/types'

// ─── Trigger icons ───────────────────────────────────────────
const triggerIcons: Record<string, typeof Zap> = {
    contact_created: UserPlus,
    deal_stage_changed: ArrowRightLeft,
    activity_due: Bell,
    contact_birthday: Cake,
    manual: Hand,
    scheduled: Calendar,
}

const TRIGGER_COLORS: Record<string, string> = {
    contact_created: 'text-emerald-500 bg-emerald-500/10',
    deal_stage_changed: 'text-blue-500 bg-blue-500/10',
    activity_due: 'text-amber-500 bg-amber-500/10',
    contact_birthday: 'text-pink-500 bg-pink-500/10',
    manual: 'text-purple-500 bg-purple-500/10',
    scheduled: 'text-cyan-500 bg-cyan-500/10',
}

export function AutomationBuilderPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const isEditing = !!id

    const { data: existing } = useAutomation(id ?? '')
    const createMut = useCreateAutomation()
    const updateMut = useUpdateAutomation()

    // ─── Draft State ─────────────────────────────────────
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [triggerType, setTriggerType] = useState<TriggerType>('contact_created')
    const [steps, setSteps] = useState<WorkflowStep[]>([])
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
    const [initialized, setInitialized] = useState(false)

    // Load existing automation when editing
    if (isEditing && existing && !initialized) {
        setName(existing.name)
        setDescription(existing.description ?? '')
        setTriggerType(existing.trigger_type as TriggerType)
        const existingActions = (existing.actions as any[]) ?? []
        setSteps(existingActions.map((a: any, i: number) => ({
            id: `step-${i}-${Date.now()}`,
            action_type: a.type ?? 'send_email',
            config: a,
        })))
        setInitialized(true)
    }

    const selectedStep = steps.find((s) => s.id === selectedStepId)

    // ─── Step Operations ─────────────────────────────────
    const addStep = useCallback((type: ActionType, afterIndex: number) => {
        const newStep: WorkflowStep = {
            id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            action_type: type,
            config: {},
        }
        setSteps((prev) => {
            const next = [...prev]
            next.splice(afterIndex, 0, newStep)
            return next
        })
        setSelectedStepId(newStep.id)
    }, [])

    const deleteStep = useCallback((id: string) => {
        setSteps((prev) => prev.filter((s) => s.id !== id))
        if (selectedStepId === id) setSelectedStepId(null)
    }, [selectedStepId])

    const handleReorder = useCallback((event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        setSteps((prev) => {
            const oldIndex = prev.findIndex((s) => s.id === active.id)
            const newIndex = prev.findIndex((s) => s.id === over.id)
            return arrayMove(prev, oldIndex, newIndex)
        })
    }, [])

    const updateStepConfig = useCallback((config: Record<string, any>) => {
        if (!selectedStepId) return
        setSteps((prev) =>
            prev.map((s) => (s.id === selectedStepId ? { ...s, config } : s)),
        )
    }, [selectedStepId])

    // ─── Save ────────────────────────────────────────────
    const isSaving = createMut.isPending || updateMut.isPending

    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Introduce un nombre para la automatización')
            return
        }

        const actions = steps.map((s) => ({
            type: s.action_type,
            ...s.config,
        }))

        if (isEditing && id) {
            updateMut.mutate(
                { id, data: { name, description, trigger_type: triggerType, actions, trigger_config: {} } },
                {
                    onSuccess: () => {
                        toast.success('Automatización actualizada')
                        navigate('/automations')
                    },
                    onError: () => toast.error('Error al actualizar'),
                },
            )
        } else {
            createMut.mutate(
                { name, description, trigger_type: triggerType, trigger_config: {}, conditions: [], actions },
                {
                    onSuccess: () => {
                        toast.success('Automatización creada')
                        navigate('/automations')
                    },
                    onError: () => toast.error('Error al crear'),
                },
            )
        }
    }

    const TIcon = triggerIcons[triggerType] ?? Zap
    const tColor = TRIGGER_COLORS[triggerType] ?? 'text-muted-foreground bg-muted'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/automations')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                {isEditing ? 'Editar Automatización' : 'Nueva Automatización'}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Diseña tu flujo de trabajo visual
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Guardar
                    </button>
                </div>
            </div>

            {/* Config Bar */}
            <div className="rounded-xl border border-border bg-card p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nombre</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Seguimiento de Lead"
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Descripción</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descripción opcional"
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Trigger</label>
                        <select
                            value={triggerType}
                            onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                            className="h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                        >
                            {TRIGGER_OPTIONS.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Trigger Header Node */}
            <div className="flex justify-center">
                <div className={cn(
                    'flex items-center gap-3 rounded-xl border-2 border-dashed px-5 py-3',
                    tColor.split(' ')[1],
                    'border-current',
                )}>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tColor)}>
                        <TIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cuando</p>
                        <p className={cn('text-sm font-semibold', tColor.split(' ')[0])}>
                            {TRIGGER_OPTIONS.find((t) => t.value === triggerType)?.label}
                        </p>
                    </div>
                </div>
            </div>

            {/* Canvas + Config Panel */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <WorkflowCanvas
                        steps={steps}
                        selectedStepId={selectedStepId}
                        onSelectStep={setSelectedStepId}
                        onDeleteStep={deleteStep}
                        onReorder={handleReorder}
                        onAddStep={addStep}
                    />
                </div>

                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedStep ? (
                            <StepConfigPanel
                                key={selectedStep.id}
                                step={selectedStep}
                                onUpdate={updateStepConfig}
                                onClose={() => setSelectedStepId(null)}
                            />
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border"
                            >
                                <div className="text-center space-y-2">
                                    <Zap className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona un paso para configurarlo
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
