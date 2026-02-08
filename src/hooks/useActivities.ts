import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    completeActivity,
    getActivityCounts,
    type ActivityFilters,
    type ActivityFormData,
} from '@/lib/api/activities'

// ─── Query Keys ──────────────────────────────────────────────
const activityKeys = {
    all: ['activities'] as const,
    lists: () => [...activityKeys.all, 'list'] as const,
    list: (filters: ActivityFilters) => [...activityKeys.lists(), filters] as const,
    details: () => [...activityKeys.all, 'detail'] as const,
    detail: (id: string) => [...activityKeys.details(), id] as const,
    counts: () => [...activityKeys.all, 'counts'] as const,
}

// ─── Hooks ───────────────────────────────────────────────────
export function useActivities(filters: ActivityFilters = {}) {
    return useQuery({
        queryKey: activityKeys.list(filters),
        queryFn: () => getActivities(filters),
    })
}

export function useActivity(id: string) {
    return useQuery({
        queryKey: activityKeys.detail(id),
        queryFn: () => getActivity(id),
        enabled: !!id,
    })
}

export function useActivityCounts() {
    return useQuery({
        queryKey: activityKeys.counts(),
        queryFn: getActivityCounts,
    })
}

export function useCreateActivity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: ActivityFormData) => createActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all })
        },
    })
}

export function useUpdateActivity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ActivityFormData> }) =>
            updateActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all })
        },
    })
}

export function useDeleteActivity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteActivity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all })
        },
    })
}

export function useCompleteActivity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => completeActivity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all })
        },
    })
}
