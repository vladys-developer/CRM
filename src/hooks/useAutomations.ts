import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getAutomations,
    getAutomation,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    getAutomationLogs,
    type AutomationInsert,
    type AutomationUpdate,
} from '@/lib/api/automations'

const KEYS = {
    all: ['automations'] as const,
    list: () => [...KEYS.all, 'list'] as const,
    detail: (id: string) => [...KEYS.all, 'detail', id] as const,
    logs: (id: string) => [...KEYS.all, 'logs', id] as const,
}

export function useAutomations() {
    return useQuery({
        queryKey: KEYS.list(),
        queryFn: getAutomations,
        staleTime: 1000 * 60 * 5,
    })
}

export function useAutomation(id: string) {
    return useQuery({
        queryKey: KEYS.detail(id),
        queryFn: () => getAutomation(id),
        enabled: !!id,
    })
}

export function useAutomationLogs(automationId: string) {
    return useQuery({
        queryKey: KEYS.logs(automationId),
        queryFn: () => getAutomationLogs(automationId),
        enabled: !!automationId,
        staleTime: 1000 * 60 * 2,
    })
}

export function useCreateAutomation() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: AutomationInsert) => createAutomation(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list() }),
    })
}

export function useUpdateAutomation() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AutomationUpdate }) =>
            updateAutomation(id, data),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: KEYS.list() })
            qc.invalidateQueries({ queryKey: KEYS.detail(vars.id) })
        },
    })
}

export function useDeleteAutomation() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteAutomation(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list() }),
    })
}

export function useToggleAutomation() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            toggleAutomation(id, isActive),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: KEYS.list() })
            qc.invalidateQueries({ queryKey: KEYS.detail(vars.id) })
        },
    })
}
