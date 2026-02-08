import { useQuery } from '@tanstack/react-query'
import {
    getSalesOverview,
    getRevenueByMonth,
    getPipelineHealth,
    getActivityBreakdown,
} from '@/lib/api/reports'

const reportKeys = {
    all: ['reports'] as const,
    salesOverview: () => [...reportKeys.all, 'salesOverview'] as const,
    revenueByMonth: () => [...reportKeys.all, 'revenueByMonth'] as const,
    pipelineHealth: () => [...reportKeys.all, 'pipelineHealth'] as const,
    activityBreakdown: () => [...reportKeys.all, 'activityBreakdown'] as const,
}

export function useSalesOverview() {
    return useQuery({
        queryKey: reportKeys.salesOverview(),
        queryFn: getSalesOverview,
        staleTime: 5 * 60_000,
    })
}

export function useRevenueByMonth() {
    return useQuery({
        queryKey: reportKeys.revenueByMonth(),
        queryFn: getRevenueByMonth,
        staleTime: 5 * 60_000,
    })
}

export function usePipelineHealth() {
    return useQuery({
        queryKey: reportKeys.pipelineHealth(),
        queryFn: getPipelineHealth,
        staleTime: 5 * 60_000,
    })
}

export function useActivityBreakdown() {
    return useQuery({
        queryKey: reportKeys.activityBreakdown(),
        queryFn: getActivityBreakdown,
        staleTime: 5 * 60_000,
    })
}
