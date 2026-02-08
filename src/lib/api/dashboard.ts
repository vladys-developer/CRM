import { supabase } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────
export interface DashboardStats {
    pipelineTotal: number
    pipelineChange: number
    openOpportunities: number
    opportunitiesChange: number
    totalContacts: number
    contactsChange: number
    pendingActivities: number
    overdueActivities: number
    winRate: number
    wonThisMonth: number
    lostThisMonth: number
}

export interface PipelineFunnelItem {
    name: string
    value: number
    count: number
    color: string
}

export interface RevenueDataPoint {
    month: string
    ganado: number
    perdido: number
    pipeline: number
}

export interface RecentActivityItem {
    id: string
    type: string
    title: string
    related_to_type: string | null
    status: string
    created_at: string
    priority: string
}

export interface UpcomingTask {
    id: string
    title: string
    type: string
    due_date: string
    priority: string
    status: string
}

// ─── Dashboard Stats ─────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

    // Pipeline total (sum of open opportunity values)
    const { data: openOpps } = await supabase
        .from('opportunities')
        .select('value')
        .in('status', ['abierta', 'open'])

    const pipelineTotal = openOpps?.reduce((sum, o) => sum + (o.value || 0), 0) ?? 0
    const openOpportunities = openOpps?.length ?? 0

    // Last month comparisons
    const { count: lastMonthOpps } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfLastMonth)
        .lt('created_at', endOfLastMonth)

    const opportunitiesChange = lastMonthOpps ? Math.round(((openOpportunities - (lastMonthOpps ?? 0)) / Math.max(lastMonthOpps ?? 1, 1)) * 100) : 0

    // Contacts count
    const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })

    const { count: lastMonthContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', startOfMonth)

    const contactsChange = lastMonthContacts ? Math.round((((totalContacts ?? 0) - lastMonthContacts) / Math.max(lastMonthContacts, 1)) * 100) : 0

    // Pending & overdue activities
    const { count: pendingActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pendiente', 'en_progreso'])

    const { count: overdueActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pendiente', 'en_progreso'])
        .lt('due_date', now.toISOString())

    // Win rate (this month)
    const { count: wonThisMonth } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ganada')
        .gte('updated_at', startOfMonth)

    const { count: lostThisMonth } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'perdida')
        .gte('updated_at', startOfMonth)

    const closedTotal = (wonThisMonth ?? 0) + (lostThisMonth ?? 0)
    const winRate = closedTotal > 0 ? Math.round(((wonThisMonth ?? 0) / closedTotal) * 100) : 0

    return {
        pipelineTotal,
        pipelineChange: 0,
        openOpportunities,
        opportunitiesChange,
        totalContacts: totalContacts ?? 0,
        contactsChange,
        pendingActivities: pendingActivities ?? 0,
        overdueActivities: overdueActivities ?? 0,
        winRate,
        wonThisMonth: wonThisMonth ?? 0,
        lostThisMonth: lostThisMonth ?? 0,
    }
}

// ─── Pipeline Funnel ─────────────────────────────────────────
export async function getPipelineFunnel(): Promise<PipelineFunnelItem[]> {
    const { data: stages } = await supabase
        .from('pipeline_stages')
        .select('id, name, color, sort_order')
        .order('sort_order')

    if (!stages?.length) return []

    const funnel: PipelineFunnelItem[] = []

    for (const stage of stages) {
        const { data: opps } = await supabase
            .from('opportunities')
            .select('value')
            .eq('stage_id', stage.id)
            .in('status', ['abierta', 'open'])

        funnel.push({
            name: stage.name,
            value: opps?.reduce((s, o) => s + (o.value || 0), 0) ?? 0,
            count: opps?.length ?? 0,
            color: stage.color || '#94A3B8',
        })
    }

    return funnel
}

// ─── Recent Activities ───────────────────────────────────────
export async function getRecentActivities(limit = 8): Promise<RecentActivityItem[]> {
    const { data, error } = await supabase
        .from('activities')
        .select('id, type, title, related_to_type, status, created_at, priority')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return (data ?? []) as RecentActivityItem[]
}

// ─── Upcoming Tasks ──────────────────────────────────────────
export async function getUpcomingTasks(limit = 5): Promise<UpcomingTask[]> {
    const now = new Date().toISOString()

    const { data, error } = await supabase
        .from('activities')
        .select('id, title, type, due_date, priority, status')
        .in('status', ['pendiente', 'en_progreso'])
        .gte('due_date', now)
        .order('due_date', { ascending: true })
        .limit(limit)

    if (error) throw error
    return (data ?? []) as UpcomingTask[]
}
