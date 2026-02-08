import { useQuery } from '@tanstack/react-query'
import {
    getDashboardStats,
    getPipelineFunnel,
    getRecentActivities,
    getUpcomingTasks,
} from '@/lib/api/dashboard'

const dashboardKeys = {
    all: ['dashboard'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
    funnel: () => [...dashboardKeys.all, 'funnel'] as const,
    recentActivities: () => [...dashboardKeys.all, 'recentActivities'] as const,
    upcomingTasks: () => [...dashboardKeys.all, 'upcomingTasks'] as const,
}

export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: getDashboardStats,
        refetchInterval: 60_000, // auto-refresh every minute
    })
}

export function usePipelineFunnel() {
    return useQuery({
        queryKey: dashboardKeys.funnel(),
        queryFn: getPipelineFunnel,
        refetchInterval: 60_000,
    })
}

export function useRecentActivities(limit = 8) {
    return useQuery({
        queryKey: [...dashboardKeys.recentActivities(), limit],
        queryFn: () => getRecentActivities(limit),
        refetchInterval: 30_000,
    })
}

export function useUpcomingTasks(limit = 5) {
    return useQuery({
        queryKey: [...dashboardKeys.upcomingTasks(), limit],
        queryFn: () => getUpcomingTasks(limit),
        refetchInterval: 30_000,
    })
}
