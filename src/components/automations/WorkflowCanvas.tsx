import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, ArrowDown } from 'lucide-react'
import { StepNode } from './StepNode'
import type { WorkflowStep, ActionType } from './types'
import { ACTION_OPTIONS } from './types'
import { ACTION_META } from './StepNode'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WorkflowCanvasProps {
    steps: WorkflowStep[]
    selectedStepId: string | null
    onSelectStep: (id: string) => void
    onDeleteStep: (id: string) => void
    onReorder: (event: DragEndEvent) => void
    onAddStep: (type: ActionType, afterIndex: number) => void
}

export function WorkflowCanvas({
    steps,
    selectedStepId,
    onSelectStep,
    onDeleteStep,
    onReorder,
    onAddStep,
}: WorkflowCanvasProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onReorder}>
            <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                    {steps.length === 0 ? (
                        <AddStepButton onAdd={(type) => onAddStep(type, 0)} isFirst />
                    ) : (
                        steps.map((step, i) => (
                            <div key={step.id}>
                                <StepNode
                                    step={step}
                                    index={i}
                                    isSelected={selectedStepId === step.id}
                                    onSelect={() => onSelectStep(step.id)}
                                    onDelete={() => onDeleteStep(step.id)}
                                />
                                {/* Connector + Add button */}
                                <div className="flex items-center justify-center py-1">
                                    <div className="flex flex-col items-center">
                                        <ArrowDown className="h-4 w-4 text-muted-foreground/30" />
                                        <AddStepButton onAdd={(type) => onAddStep(type, i + 1)} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SortableContext>
        </DndContext>
    )
}

// ─── Inline Add Step Button ────────────────────────────────────
function AddStepButton({ onAdd, isFirst }: { onAdd: (type: ActionType) => void; isFirst?: boolean }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="relative flex justify-center">
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium transition-all',
                    open
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary',
                    isFirst && 'px-5 py-3 text-sm',
                )}
            >
                <Plus className={cn('h-3.5 w-3.5', isFirst && 'h-4 w-4')} />
                {isFirst ? 'Añadir primer paso' : 'Añadir paso'}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full z-50 mt-2 w-72 rounded-xl border border-border bg-popover p-2 shadow-xl"
                    >
                        <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Tipo de acción
                        </p>
                        <div className="space-y-0.5 max-h-64 overflow-y-auto">
                            {ACTION_OPTIONS.map((opt) => {
                                const meta = ACTION_META[opt.value]
                                const Icon = meta?.icon
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            onAdd(opt.value)
                                            setOpen(false)
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                                    >
                                        {Icon && (
                                            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', meta.bg)}>
                                                <Icon className={cn('h-4 w-4', meta.color)} />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium">{opt.label}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{opt.description}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
