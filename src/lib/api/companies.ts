import { supabase } from '@/lib/supabase'
import type { InsertTables, UpdateTables } from '@/types/database'

export type Company = {
    id: string
    legal_name: string
    commercial_name: string | null
    nif_cif: string | null
    industry: string | null
    subsector: string | null
    type: string | null
    founded_year: number | null
    employee_range: string | null
    annual_revenue: number | null
    parent_company_id: string | null
    headquarters_address: Record<string, unknown> | null
    phone: string | null
    email: string | null
    website: string | null
    social_links: Record<string, unknown> | null
    status: string
    client_type: string | null
    tier: string | null
    territory: string | null
    account_manager_id: string | null
    active_opportunities_value: number
    total_closed_deals: number
    ltv: number
    arr: number
    mrr: number
    churn_risk_score: number
    next_renewal_date: string | null
    created_by: string | null
    created_at: string
    updated_at: string
}

export interface CompanyFilters {
    search?: string
    status?: string
    type?: string
    tier?: string
    industry?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    count: number
    page: number
    pageSize: number
    totalPages: number
}

export async function getCompanies(
    filters: CompanyFilters = {},
    pagination = { page: 1, pageSize: 25, sortBy: 'created_at', sortOrder: 'desc' as const }
): Promise<PaginatedResponse<Company>> {
    const { page, pageSize, sortBy, sortOrder } = pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
        .from('companies')
        .select('*', { count: 'exact' })

    if (filters.search) {
        query = query.or(
            `legal_name.ilike.%${filters.search}%,commercial_name.ilike.%${filters.search}%,nif_cif.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        )
    }
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.type) query = query.eq('type', filters.type)
    if (filters.tier) query = query.eq('tier', filters.tier)
    if (filters.industry) query = query.eq('industry', filters.industry)

    query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
        data: (data ?? []) as Company[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
    }
}

export async function getCompany(id: string): Promise<Company> {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Company
}

export async function createCompany(company: InsertTables<'companies'>): Promise<Company> {
    const { data, error } = await supabase
        .from('companies')
        .insert(company)
        .select()
        .single()

    if (error) throw error
    return data as Company
}

export async function updateCompany(
    id: string,
    updates: UpdateTables<'companies'>
): Promise<Company> {
    const { data, error } = await supabase
        .from('companies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as Company
}

export async function deleteCompany(id: string): Promise<void> {
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) throw error
}

export async function deleteCompanies(ids: string[]): Promise<void> {
    const { error } = await supabase.from('companies').delete().in('id', ids)
    if (error) throw error
}

export async function bulkCreateCompanies(
    records: Partial<InsertTables<'companies'>>[]
): Promise<{ success: number; errors: number }> {
    let success = 0
    let errors = 0
    const batchSize = 50

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize) as InsertTables<'companies'>[]
        const { error, data } = await supabase
            .from('companies')
            .insert(batch)
            .select('id')

        if (error) {
            errors += batch.length
        } else {
            success += data?.length ?? 0
        }
    }

    return { success, errors }
}

export async function getAllCompaniesForExport(): Promise<Company[]> {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000)

    if (error) throw error
    return (data ?? []) as Company[]
}
