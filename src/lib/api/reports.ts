import { supabase } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────
export interface SalesOverview {
    totalRevenue: number
    avgDealSize: number
    dealsWon: number
    dealsLost: number
    winRate: number
    avgSalesCycle: number // days
}

export interface RevenueByMonth {
    month: string
    ganado: number
    perdido: number
    pipeline: number
}

export interface PipelineHealthItem {
    stage: string
    count: number
    value: number
    avgAge: number // days since creation
    color: string
}

export interface ActivityBreakdown {
    type: string
    count: number
    completed: number
}

export interface ConversionRate {
    fromStage: string
    toStage: string
    rate: number
    color: string
}

export interface TopPerformer {
    userId: string
    name: string
    avatar: string | null
    dealsWon: number
    revenue: number
    activities: number
}

// ─── Sales Overview (last 30 days vs previous 30) ────────────
export async function getSalesOverview(): Promise<SalesOverview> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Won deals
    const { data: wonDeals } = await supabase
        .from('opportunities')
        .select('value, created_at, updated_at')
        .eq('status', 'ganada')
        .gte('updated_at', thirtyDaysAgo)

    // Lost deals
    const { count: dealsLost } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'perdida')
        .gte('updated_at', thirtyDaysAgo)

    const dealsWon = wonDeals?.length ?? 0
    const totalRevenue = wonDeals?.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0
    const avgDealSize = dealsWon > 0 ? Math.round(totalRevenue / dealsWon) : 0

    // Avg sales cycle (days from created to won)
    const avgSalesCycle = dealsWon > 0
        ? Math.round(wonDeals!.reduce((sum, d) => {
            const created = new Date(d.created_at).getTime()
            const closed = new Date(d.updated_at).getTime()
            return sum + (closed - created) / (1000 * 60 * 60 * 24)
        }, 0) / dealsWon)
        : 0

    const closedTotal = dealsWon + (dealsLost ?? 0)
    const winRate = closedTotal > 0 ? Math.round((dealsWon / closedTotal) * 100) : 0

    return {
        totalRevenue,
        avgDealSize,
        dealsWon,
        dealsLost: dealsLost ?? 0,
        winRate,
        avgSalesCycle,
    }
}

// ─── Revenue by Month (last 6 months) ────────────────────────
export async function getRevenueByMonth(): Promise<RevenueByMonth[]> {
    const months: RevenueByMonth[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const start = d.toISOString()
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()
        const monthLabel = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })

        const { data: won } = await supabase
            .from('opportunities')
            .select('value')
            .eq('status', 'ganada')
            .gte('updated_at', start)
            .lte('updated_at', end)

        const { data: lost } = await supabase
            .from('opportunities')
            .select('value')
            .eq('status', 'perdida')
            .gte('updated_at', start)
            .lte('updated_at', end)

        const { data: open } = await supabase
            .from('opportunities')
            .select('value')
            .in('status', ['abierta', 'open'])
            .gte('created_at', start)
            .lte('created_at', end)

        months.push({
            month: monthLabel,
            ganado: won?.reduce((s, o) => s + (o.value || 0), 0) ?? 0,
            perdido: lost?.reduce((s, o) => s + (o.value || 0), 0) ?? 0,
            pipeline: open?.reduce((s, o) => s + (o.value || 0), 0) ?? 0,
        })
    }

    return months
}

// ─── Pipeline Health ─────────────────────────────────────────
export async function getPipelineHealth(): Promise<PipelineHealthItem[]> {
    const { data: stages } = await supabase
        .from('pipeline_stages')
        .select('id, name, color, sort_order')
        .order('sort_order')

    if (!stages?.length) return []

    const health: PipelineHealthItem[] = []

    for (const stage of stages) {
        const { data: opps } = await supabase
            .from('opportunities')
            .select('value, created_at')
            .eq('stage_id', stage.id)
            .in('status', ['abierta', 'open'])

        const now = Date.now()
        const avgAge = opps?.length
            ? Math.round(opps.reduce((s, o) => s + (now - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24), 0) / opps.length)
            : 0

        health.push({
            stage: stage.name,
            count: opps?.length ?? 0,
            value: opps?.reduce((s, o) => s + (o.value || 0), 0) ?? 0,
            avgAge,
            color: stage.color || '#94A3B8',
        })
    }

    return health
}

// ─── Activity Breakdown (last 30 days) ───────────────────────
export async function getActivityBreakdown(): Promise<ActivityBreakdown[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const types = ['tarea', 'llamada', 'email', 'reunion', 'nota']
    const breakdown: ActivityBreakdown[] = []

    for (const type of types) {
        const { count: total } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('type', type)
            .gte('created_at', thirtyDaysAgo)

        const { count: completed } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('type', type)
            .eq('status', 'completada')
            .gte('created_at', thirtyDaysAgo)

        breakdown.push({
            type,
            count: total ?? 0,
            completed: completed ?? 0,
        })
    }

    return breakdown
}
