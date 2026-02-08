import { supabase } from '@/lib/supabase'
import type { Activity } from '@/types/database'

// ─── Types ───────────────────────────────────────────────────
export interface CalendarEvent {
    id: string
    title: string
    type: string
    status: string
    priority: string
    start: string
    end: string
    allDay: boolean
    description: string | null
    related_to_type: string | null
    related_to_id: string | null
}

// ─── Fetch Events for Date Range ─────────────────────────────
export async function getCalendarEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
        .from('activities')
        .select('id, title, type, status, priority, due_date, duration_minutes, description, related_to_type, related_to_id')
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .order('due_date', { ascending: true })

    if (error) throw error

    return (data ?? []).map((a) => {
        const start = a.due_date ?? new Date().toISOString()
        const durationMs = (a.duration_minutes ?? 60) * 60 * 1000
        const end = new Date(new Date(start).getTime() + durationMs).toISOString()

        return {
            id: a.id,
            title: a.title,
            type: a.type,
            status: a.status,
            priority: a.priority,
            start,
            end,
            allDay: !a.due_date,
            description: a.description,
            related_to_type: a.related_to_type,
            related_to_id: a.related_to_id,
        }
    })
}
