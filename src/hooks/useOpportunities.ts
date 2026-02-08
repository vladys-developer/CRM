import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getOpportunities,
    getOpportunity,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    moveOpportunity,
    getPipelineStages,
    type OpportunityFilters,
} from '@/lib/api/opportunities'

const OPPS_KEY = 'opportunities'
const STAGES_KEY = 'pipeline-stages'

export function usePipelineStages(pipelineId?: string) {
    return useQuery({
        queryKey: [STAGES_KEY, pipelineId],
        queryFn: () => getPipelineStages(pipelineId),
    })
}

export function useOpportunities(
    filters: OpportunityFilters = {},
    pagination = { page: 1, pageSize: 50, sortBy: 'created_at', sortOrder: 'desc' as const }
) {
    return useQuery({
        queryKey: [OPPS_KEY, filters, pagination],
        queryFn: () => getOpportunities(filters, pagination),
    })
}

export function useOpportunity(id: string | undefined) {
    return useQuery({
        queryKey: [OPPS_KEY, id],
        queryFn: () => getOpportunity(id!),
        enabled: !!id,
    })
}

export function useCreateOpportunity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (opp: Record<string, unknown>) => createOpportunity(opp),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [OPPS_KEY] })
            toast.success('Oportunidad creada')
        },
        onError: (error: Error) =>
            toast.error('Error al crear oportunidad', { description: error.message }),
    })
}

export function useUpdateOpportunity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
            updateOpportunity(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [OPPS_KEY] })
            toast.success('Oportunidad actualizada')
        },
        onError: (error: Error) =>
            toast.error('Error al actualizar', { description: error.message }),
    })
}

export function useDeleteOpportunity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteOpportunity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [OPPS_KEY] })
            toast.success('Oportunidad eliminada')
        },
        onError: (error: Error) =>
            toast.error('Error al eliminar', { description: error.message }),
    })
}

export function useMoveOpportunity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
            moveOpportunity(id, stageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [OPPS_KEY] })
        },
        onError: (error: Error) =>
            toast.error('Error al mover oportunidad', { description: error.message }),
    })
}
