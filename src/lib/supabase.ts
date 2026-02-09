import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Supabase env vars missing.',
        'VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗',
        'VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗'
    )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
    },
})
