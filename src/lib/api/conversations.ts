import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

// ─── Types ───────────────────────────────────────────────────
export type Conversation = Tables<'conversations'> & {
    contact?: { first_name: string; last_name: string; email: string | null } | null
}

export type Message = Tables<'messages'>

export interface ConversationFilters {
    channel?: string
    status?: string
    search?: string
}

// ─── Conversations ───────────────────────────────────────────
export async function getConversations(filters: ConversationFilters = {}): Promise<Conversation[]> {
    let query = supabase
        .from('conversations')
        .select('*, contact:contacts(first_name, last_name, email)')
        .order('last_message_at', { ascending: false })
        .limit(50)

    if (filters.channel) query = query.eq('channel', filters.channel)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.search) query = query.ilike('subject', `%${filters.search}%`)

    const { data, error } = await query

    if (error) throw error
    return (data ?? []) as unknown as Conversation[]
}

// ─── Messages for a conversation ─────────────────────────────
export async function getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true })
        .limit(100)

    if (error) throw error
    return (data ?? []) as Message[]
}

// ─── Send Message ────────────────────────────────────────────
export async function sendMessage(conversationId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            direction: 'outbound' as const,
            content,
            sent_at: new Date().toISOString(),
            sender_name: 'Yo',
            read: true,
        })
        .select()
        .single()

    if (error) throw error

    // Update last_message_at on conversation
    await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)

    return data as Message
}
