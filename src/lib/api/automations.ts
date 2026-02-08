import { supabase } from '@/lib/supabase'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

export type Automation = Tables<'automations'>
export type AutomationLog = Tables<'automation_logs'>
export type AutomationInsert = InsertTables<'automations'>
export type AutomationUpdate = UpdateTables<'automations'>

// ─── CRUD ────────────────────────────────────────────────────
export async function getAutomations(): Promise<Automation[]> {
    const { data, error } = await supabase
        .from('automations')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
}

export async function getAutomation(id: string): Promise<Automation> {
    const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function createAutomation(automation: AutomationInsert): Promise<Automation> {
    const { data, error } = await supabase
        .from('automations')
        .insert(automation)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateAutomation(id: string, updates: AutomationUpdate): Promise<Automation> {
    const { data, error } = await supabase
        .from('automations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteAutomation(id: string): Promise<void> {
    const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function toggleAutomation(id: string, isActive: boolean): Promise<Automation> {
    return updateAutomation(id, { is_active: isActive })
}

// ─── Logs ────────────────────────────────────────────────────
export async function getAutomationLogs(automationId: string): Promise<AutomationLog[]> {
    const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .eq('automation_id', automationId)
        .order('executed_at', { ascending: false })
        .limit(50)

    if (error) throw error
    return data ?? []
}
