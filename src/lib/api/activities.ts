import { supabase } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────
export type ActivityType = 'tarea' | 'llamada' | 'email' | 'reunion' | 'nota'
export type ActivityStatus = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada' | 'pospuesta'
export type ActivityPriority = 'alta' | 'media' | 'baja'
export type RelatedToType = 'contact' | 'company' | 'opportunity'

export interface Activity {
    id: string
    type: ActivityType
    title: string
    description: string | null
    related_to_type: RelatedToType | null
    related_to_id: string | null
    status: ActivityStatus
    priority: ActivityPriority
    due_date: string | null
    completed_at: string | null
    duration_minutes: number | null
    metadata: Record<string, unknown>
    assigned_to: string | null
    created_by: string | null
    created_at: string
    updated_at: string
    // Joined
    assigned_user?: { full_name: string; avatar_url: string | null } | null
}

export interface ActivityFilters {
    search?: string
    type?: ActivityType | ''
    status?: ActivityStatus | ''
    priority?: ActivityPriority | ''
    related_to_type?: RelatedToType | ''
    related_to_id?: string
    assigned_to?: string
    page?: number
    pageSize?: number
}

export interface ActivityFormData {
    type: ActivityType
    title: string
    description?: string
    related_to_type?: RelatedToType | ''
    related_to_id?: string
    status?: ActivityStatus
    priority?: ActivityPriority
    due_date?: string
    duration_minutes?: number
    assigned_to?: string
    metadata?: Record<string, unknown>
}

// ─── Fetch Activities ────────────────────────────────────────
export async function getActivities(filters: ActivityFilters = {}) {
    const { search, type, status, priority, related_to_type, related_to_id, assigned_to, page = 1, pageSize = 20 } = filters

    let query = supabase
        .from('activities')
        .select(`
            *,
            assigned_user:user_profiles!activities_assigned_to_fkey(full_name, avatar_url)
        `, { count: 'exact' })

    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (type) {
        query = query.eq('type', type)
    }
    if (status) {
        query = query.eq('status', status)
    }
    if (priority) {
        query = query.eq('priority', priority)
    }
    if (related_to_type) {
        query = query.eq('related_to_type', related_to_type)
    }
    if (related_to_id) {
        query = query.eq('related_to_id', related_to_id)
    }
    if (assigned_to) {
        query = query.eq('assigned_to', assigned_to)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) throw error
    return { data: data as Activity[], count: count ?? 0 }
}

// ─── Get Single Activity ─────────────────────────────────────
export async function getActivity(id: string) {
    const { data, error } = await supabase
        .from('activities')
        .select(`
            *,
            assigned_user:user_profiles!activities_assigned_to_fkey(full_name, avatar_url)
        `)
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Activity
}

// ─── Create Activity ─────────────────────────────────────────
export async function createActivity(data: ActivityFormData) {
    const { data: result, error } = await supabase
        .from('activities')
        .insert(data as any)
        .select()
        .single()

    if (error) throw error
    return result
}

// ─── Update Activity ─────────────────────────────────────────
export async function updateActivity(id: string, data: Partial<ActivityFormData>) {
    const { data: result, error } = await supabase
        .from('activities')
        .update({ ...data, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return result
}

// ─── Delete Activity ─────────────────────────────────────────
export async function deleteActivity(id: string) {
    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// ─── Complete Activity ───────────────────────────────────────
export async function completeActivity(id: string) {
    return updateActivity(id, {
        status: 'completada' as ActivityStatus,
    })
}

// ─── Get Activity Counts by Type ─────────────────────────────
export async function getActivityCounts() {
    const types: ActivityType[] = ['tarea', 'llamada', 'email', 'reunion', 'nota']
    const counts: Record<string, number> = {}

    for (const type of types) {
        const { count, error } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('type', type)
            .in('status', ['pendiente', 'en_progreso'])

        if (!error) counts[type] = count ?? 0
    }

    return counts
}
