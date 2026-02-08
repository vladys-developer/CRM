import { supabase } from '@/lib/supabase'
import type { Contact, InsertTables, UpdateTables } from '@/types/database'

export interface ContactFilters {
    search?: string
    status?: string
    source?: string
    priority?: string
    owner_id?: string
    company_id?: string
}

export interface PaginationParams {
    page: number
    pageSize: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
    data: T[]
    count: number
    page: number
    pageSize: number
    totalPages: number
}

export async function getContacts(
    filters: ContactFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 25 }
): Promise<PaginatedResponse<Contact>> {
    const { page, pageSize, sortBy = 'created_at', sortOrder = 'desc' } = pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
        query = query.or(
            `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_mobile.ilike.%${filters.search}%`
        )
    }
    if (filters.status) {
        query = query.eq('status', filters.status)
    }
    if (filters.source) {
        query = query.eq('source', filters.source)
    }
    if (filters.priority) {
        query = query.eq('priority', filters.priority)
    }
    if (filters.owner_id) {
        query = query.eq('owner_id', filters.owner_id)
    }
    if (filters.company_id) {
        query = query.eq('company_id', filters.company_id)
    }

    query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
        data: (data ?? []) as Contact[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
    }
}

export async function getContact(id: string): Promise<Contact> {
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Contact
}

export async function createContact(
    contact: InsertTables<'contacts'>
): Promise<Contact> {
    const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single()

    if (error) throw error
    return data as Contact
}

export async function updateContact(
    id: string,
    updates: UpdateTables<'contacts'>
): Promise<Contact> {
    const { data, error } = await supabase
        .from('contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as Contact
}

export async function deleteContact(id: string): Promise<void> {
    const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function deleteContacts(ids: string[]): Promise<void> {
    const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', ids)

    if (error) throw error
}

export async function bulkCreateContacts(
    records: Partial<InsertTables<'contacts'>>[]
): Promise<{ success: number; errors: number }> {
    let success = 0
    let errors = 0
    const batchSize = 50

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize) as InsertTables<'contacts'>[]
        const { error, data } = await supabase
            .from('contacts')
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

export async function getAllContactsForExport(): Promise<Contact[]> {
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000)

    if (error) throw error
    return (data ?? []) as Contact[]
}
