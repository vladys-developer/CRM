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
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    Calendar,
    Building2,
    User,
    Plus,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useOpportunities, usePipelineStages, useMoveOpportunity } from '@/hooks/useOpportunities'
import type { Opportunity, PipelineStage } from '@/lib/api/opportunities'

// ─── Kanban Card ───
function KanbanCard({ opportunity, isDragging = false, className }: { opportunity: Opportunity; isDragging?: boolean; className?: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: opportunity.id,
        data: { opportunity },
    })

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                'group relative flex cursor-grab flex-col rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5',
                isDragging ? 'z-50 cursor-grabbing opacity-50 rotate-3 scale-105 shadow-xl ring-2 ring-primary/40' : 'border-border/60',
                className
            )}
        >
            {/* Priority Indicator Line */}
            <div
                className={cn(
                    "absolute left-0 top-3 bottom-3 w-1 rounded-r-full opacity-60 transition-opacity group-hover:opacity-100",
                    opportunity.priority === 'high' ? "bg-red-500" :
                        opportunity.priority === 'medium' ? "bg-yellow-500" : "bg-blue-500"
                )}
            />

            <div className="pl-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {opportunity.name}
                    </h4>
                </div>

                <div className="mb-3">
                    <p className="text-lg font-bold tracking-tight text-foreground">
                        {formatCurrency(opportunity.monetary_value)}
                    </p>
                </div>

                <div className="space-y-1.5">
                    {opportunity.company && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{opportunity.company.commercial_name || opportunity.company.legal_name}</span>
                        </div>
                    )}

                    {opportunity.contact && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">{`${opportunity.contact.first_name} ${opportunity.contact.last_name ?? ''}`.trim()}</span>
                        </div>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
                    {opportunity.estimated_close_date && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                                {formatDate(opportunity.estimated_close_date)}
                            </span>
                        </div>
                    )}

                    <div className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                        opportunity.priority === 'high' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                            opportunity.priority === 'medium' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    )}>
                        {opportunity.priority === 'high' ? 'Alta' :
                            opportunity.priority === 'medium' ? 'Media' : 'Baja'}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Droppable Column ───
function KanbanColumn({ stage, opportunities }: { stage: PipelineStage; opportunities: Opportunity[] }) {
    const { isOver, setNodeRef } = useDroppable({ id: stage.id })
    const totalValue = opportunities.reduce((sum, o) => sum + (o.monetary_value || 0), 0)
    const count = opportunities.length

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'flex h-full min-w-0 flex-1 flex-col rounded-xl border transition-all duration-300',
                isOver ? 'bg-accent/50 ring-2 ring-primary/20' : 'bg-card/30 hover:bg-card/50',
                'backdrop-blur-sm'
            )}
            style={{
                borderColor: isOver ? stage.color : 'transparent',
                borderTopWidth: 3,
                borderTopColor: stage.color,
            }}
        >
            {/* Column Header - Fixed Height for Alignment */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4">
                <div className="flex items-center gap-2">
                    <div
                        className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: stage.color, color: stage.color }}
                    />
                    <h3 className="font-medium text-foreground text-sm tracking-wide line-clamp-1" title={stage.name}>
                        {stage.name}
                    </h3>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                        {count}
                    </span>
                </div>
                {/* Total Value */}
                {totalValue > 0 && (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                        {formatCurrency(totalValue)}
                    </span>
                )}
            </div>

            {/* Opportunities List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20">
                <SortableContext
                    items={opportunities.map((opp) => opp.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2.5">
                        {opportunities.map((opportunity) => (
                            <KanbanCard key={opportunity.id} opportunity={opportunity} />
                        ))}
                    </div>
                </SortableContext>

                {opportunities.length === 0 && (
                    <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/40 bg-muted/5 text-center transition-colors hover:bg-muted/10">
                        <div className="rounded-full bg-muted/20 p-2 text-muted-foreground/40">
                            <Plus className="h-5 w-5 opacity-50" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground/60">
                            Sin oportunidades
                        </p>
                    </div>
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
            <div className="flex items-center justify-between pb-6 pt-2">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Pipeline
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground font-medium">
                        {oppsData?.count ?? 0} oportunidades <span className="mx-2 text-border/60">|</span> {formatCurrency(totalPipelineValue)} en pipeline
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0">
                    <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
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

                    <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                                active: {
                                    opacity: '0.5',
                                },
                            },
                        }),
                    }}>
                        {activeOpp ? (
                            <div className="w-72"> {/* Fixed width for drag preview to match column width approximation or look better */}
                                <KanbanCard opportunity={activeOpp} isDragging />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    )
}
