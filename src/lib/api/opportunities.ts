import { supabase } from '@/lib/supabase'

export type Opportunity = {
    id: string
    name: string
    description: string | null
    monetary_value: number
    currency: string
    close_probability: number
    estimated_close_date: string | null
    actual_close_date: string | null
    sales_cycle_days: number | null
    stage_id: string | null
    pipeline_id: string | null
    status: string
    type: string | null
    product_category: string | null
    priority: string
    original_source: string | null
    primary_contact_id: string | null
    company_id: string | null
    owner_id: string | null
    team_id: string | null
    discount_global: number
    tax_amount: number
    total: number
    competitors: unknown[]
    competitive_advantages: string | null
    loss_reason: string | null
    winning_competitor: string | null
    created_by: string | null
    created_at: string
    updated_at: string
    // Joined
    stage?: { id: string; name: string; color: string; sort_order: number; close_probability: number }
    contact?: { id: string; first_name: string; last_name: string | null; email: string | null }
    company?: { id: string; legal_name: string; commercial_name: string | null }
}

export type PipelineStage = {
    id: string
    name: string
    sort_order: number
    close_probability: number
    color: string
    pipeline_id: string
}

export interface OpportunityFilters {
    search?: string
    status?: string
    priority?: string
    pipeline_id?: string
    stage_id?: string
    primary_contact_id?: string
}

export async function getPipelineStages(pipelineId?: string): Promise<PipelineStage[]> {
    let query = supabase
        .from('pipeline_stages')
        .select('*')
        .order('sort_order', { ascending: true })

    if (pipelineId) query = query.eq('pipeline_id', pipelineId)

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as PipelineStage[]
}

export async function getOpportunities(
    filters: OpportunityFilters = {},
    pagination = { page: 1, pageSize: 50, sortBy: 'created_at', sortOrder: 'desc' as const }
) {
    const { page, pageSize, sortBy, sortOrder } = pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
        .from('opportunities')
        .select(
            `*, stage:pipeline_stages(id, name, color, sort_order, close_probability),
       contact:contacts!primary_contact_id(id, first_name, last_name, email),
       company:companies!company_id(id, legal_name, commercial_name)`,
            { count: 'exact' }
        )

    if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.priority) query = query.eq('priority', filters.priority)
    if (filters.pipeline_id) query = query.eq('pipeline_id', filters.pipeline_id)
    if (filters.stage_id) query = query.eq('stage_id', filters.stage_id)
    if (filters.primary_contact_id) query = query.eq('primary_contact_id', filters.primary_contact_id)

    query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to)

    const { data, error, count } = await query
    if (error) throw error

    return {
        data: (data ?? []) as Opportunity[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
    }
}

export async function getOpportunity(id: string): Promise<Opportunity> {
    const { data, error } = await supabase
        .from('opportunities')
        .select(
            `*, stage:pipeline_stages(id, name, color, sort_order, close_probability),
       contact:contacts!primary_contact_id(id, first_name, last_name, email),
       company:companies!company_id(id, legal_name, commercial_name)`
        )
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Opportunity
}

export async function createOpportunity(opp: Record<string, unknown>) {
    const { data, error } = await supabase.from('opportunities').insert(opp).select().single()
    if (error) throw error
    return data
}

export async function updateOpportunity(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('opportunities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteOpportunity(id: string) {
    const { error } = await supabase.from('opportunities').delete().eq('id', id)
    if (error) throw error
}

export async function moveOpportunity(id: string, stageId: string) {
    return updateOpportunity(id, { stage_id: stageId })
}
