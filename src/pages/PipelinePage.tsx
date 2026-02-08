import { useState, useMemo } from 'react'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
    Plus,
    Target,
    Calendar,
    Building2,
    User,
    GripVertical,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useOpportunities, usePipelineStages, useMoveOpportunity } from '@/hooks/useOpportunities'
import type { Opportunity, PipelineStage } from '@/lib/api/opportunities'

// ─── Kanban Card ───
function KanbanCard({ opportunity, isDragging = false }: { opportunity: Opportunity; isDragging?: boolean }) {
    const contactName = opportunity.contact
        ? `${opportunity.contact.first_name} ${opportunity.contact.last_name ?? ''}`.trim()
        : null
    const companyName = opportunity.company
        ? opportunity.company.commercial_name || opportunity.company.legal_name
        : null

    return (
        <div className={cn(
            'rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow',
            isDragging ? 'shadow-xl ring-2 ring-primary/30' : 'hover:shadow-md'
        )}>
            <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium text-foreground leading-tight pr-2">{opportunity.name}</h4>
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50 cursor-grab" />
            </div>

            <div className="mt-2 text-lg font-bold text-foreground">
                {formatCurrency(opportunity.monetary_value)}
            </div>

            <div className="mt-3 space-y-1.5">
                {companyName && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{companyName}</span>
                    </div>
                )}
                {contactName && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">{contactName}</span>
                    </div>
                )}
                {opportunity.estimated_close_date && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{formatDate(opportunity.estimated_close_date)}</span>
                    </div>
                )}
            </div>

            {/* Priority + probability bar */}
            <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/70 transition-all"
                        style={{ width: `${opportunity.close_probability}%` }} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{opportunity.close_probability}%</span>
            </div>
        </div>
    )
}

// ─── Draggable Card Wrapper ───
function DraggableCard({ opportunity }: { opportunity: Opportunity }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: opportunity.id,
        data: { opportunity },
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <KanbanCard opportunity={opportunity} />
        </div>
    )
}

// ─── Droppable Column ───
function KanbanColumn({ stage, opportunities }: { stage: PipelineStage; opportunities: Opportunity[] }) {
    const { isOver, setNodeRef } = useDroppable({ id: stage.id })
    const totalValue = opportunities.reduce((sum, o) => sum + (o.monetary_value || 0), 0)

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'flex h-full min-w-0 flex-1 flex-col rounded-xl border bg-muted/30 transition-colors',
                isOver ? 'border-primary/50 bg-primary/5' : 'border-border'
            )}
        >
            {/* Column Header */}
            <div className="border-b border-border px-3 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                        <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
                            {opportunities.length}
                        </span>
                    </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    {formatCurrency(totalValue)}
                </p>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {opportunities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Target className="h-6 w-6 text-muted-foreground/40" />
                        <p className="mt-2 text-xs text-muted-foreground/60">Sin oportunidades</p>
                    </div>
                ) : (
                    opportunities.map((opp) => (
                        <DraggableCard key={opp.id} opportunity={opp} />
                    ))
                )}
            </div>
        </div>
    )
}

// ─── Pipeline Page ───
export function PipelinePage() {
    const { data: stages } = usePipelineStages('00000000-0000-0000-0000-000000000001')
    const { data: oppsData, isLoading } = useOpportunities(
        { pipeline_id: '00000000-0000-0000-0000-000000000001', status: 'abierto' },
        { page: 1, pageSize: 200, sortBy: 'created_at', sortOrder: 'desc' }
    )
    const moveOpp = useMoveOpportunity()
    const [activeOpp, setActiveOpp] = useState<Opportunity | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    const oppsByStage = useMemo(() => {
        const map: Record<string, Opportunity[]> = {}
        for (const stage of stages ?? []) {
            map[stage.id] = []
        }
        for (const opp of oppsData?.data ?? []) {
            if (opp.stage_id && map[opp.stage_id]) {
                map[opp.stage_id]!.push(opp)
            }
        }
        return map
    }, [stages, oppsData?.data])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveOpp(event.active.data.current?.opportunity ?? null)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveOpp(null)
        const { active, over } = event
        if (!over || !active) return

        const oppId = active.id as string
        const newStageId = over.id as string
        const opportunity = oppsData?.data.find((o) => o.id === oppId)

        if (opportunity && opportunity.stage_id !== newStageId) {
            moveOpp.mutate({ id: oppId, stageId: newStageId })
        }
    }

    const totalPipelineValue = (oppsData?.data ?? []).reduce(
        (sum, o) => sum + (o.monetary_value || 0), 0
    )

    return (
        <div className="flex h-[calc(100vh-5rem)] flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Pipeline</h1>
                    <p className="text-sm text-muted-foreground">
                        {oppsData?.count ?? 0} oportunidades · {formatCurrency(totalPipelineValue)} en pipeline
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    Nueva Oportunidad
                </button>
            </div>

            {/* Kanban Board */}
            {isLoading ? (
                <div className="flex flex-1 gap-3 pb-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-full min-w-0 flex-1 animate-pulse rounded-xl bg-muted/50" />
                    ))}
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex flex-1 gap-3 pb-4">
                        {(stages ?? []).map((stage) => (
                            <KanbanColumn
                                key={stage.id}
                                stage={stage}
                                opportunities={oppsByStage[stage.id] ?? []}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeOpp ? (
                            <div className="w-64">
                                <KanbanCard opportunity={activeOpp} isDragging />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    )
}
