export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        PostgrestVersion: '12'
        Tables: {
            teams: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            user_profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string
                    avatar_url: string | null
                    phone: string | null
                    role: 'super_admin' | 'admin' | 'sales_manager' | 'vendedor' | 'marketing_manager' | 'marketing_user' | 'soporte' | 'ejecutivo' | 'partner'
                    team_id: string | null
                    timezone: string
                    language: string
                    is_active: boolean
                    last_login_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name: string
                    avatar_url?: string | null
                    phone?: string | null
                    role?: 'super_admin' | 'admin' | 'sales_manager' | 'vendedor' | 'marketing_manager' | 'marketing_user' | 'soporte' | 'ejecutivo' | 'partner'
                    team_id?: string | null
                    timezone?: string
                    language?: string
                    is_active?: boolean
                    last_login_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string
                    avatar_url?: string | null
                    phone?: string | null
                    role?: 'super_admin' | 'admin' | 'sales_manager' | 'vendedor' | 'marketing_manager' | 'marketing_user' | 'soporte' | 'ejecutivo' | 'partner'
                    team_id?: string | null
                    timezone?: string
                    language?: string
                    is_active?: boolean
                    last_login_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            companies: {
                Row: {
                    id: string
                    legal_name: string
                    commercial_name: string | null
                    nif_cif: string | null
                    industry: string | null
                    subsector: string | null
                    type: 'B2B' | 'B2C' | 'B2B2C' | null
                    founded_year: number | null
                    employee_range: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
                    annual_revenue: number | null
                    parent_company_id: string | null
                    headquarters_address: Json | null
                    phone: string | null
                    email: string | null
                    website: string | null
                    social_links: Json | null
                    status: 'prospecto' | 'cliente_activo' | 'cliente_inactivo' | 'ex_cliente' | 'partner'
                    client_type: 'pequeño' | 'mediano' | 'estratégico' | 'enterprise' | null
                    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | null
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
                Insert: {
                    id?: string
                    legal_name: string
                    commercial_name?: string | null
                    nif_cif?: string | null
                    industry?: string | null
                    subsector?: string | null
                    type?: 'B2B' | 'B2C' | 'B2B2C' | null
                    founded_year?: number | null
                    employee_range?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
                    annual_revenue?: number | null
                    parent_company_id?: string | null
                    headquarters_address?: Json | null
                    phone?: string | null
                    email?: string | null
                    website?: string | null
                    social_links?: Json | null
                    status?: 'prospecto' | 'cliente_activo' | 'cliente_inactivo' | 'ex_cliente' | 'partner'
                    client_type?: 'pequeño' | 'mediano' | 'estratégico' | 'enterprise' | null
                    tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | null
                    territory?: string | null
                    account_manager_id?: string | null
                    active_opportunities_value?: number
                    total_closed_deals?: number
                    ltv?: number
                    arr?: number
                    mrr?: number
                    churn_risk_score?: number
                    next_renewal_date?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    legal_name?: string
                    commercial_name?: string | null
                    nif_cif?: string | null
                    industry?: string | null
                    subsector?: string | null
                    type?: 'B2B' | 'B2C' | 'B2B2C' | null
                    founded_year?: number | null
                    employee_range?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
                    annual_revenue?: number | null
                    parent_company_id?: string | null
                    headquarters_address?: Json | null
                    phone?: string | null
                    email?: string | null
                    website?: string | null
                    social_links?: Json | null
                    status?: 'prospecto' | 'cliente_activo' | 'cliente_inactivo' | 'ex_cliente' | 'partner'
                    client_type?: 'pequeño' | 'mediano' | 'estratégico' | 'enterprise' | null
                    tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | null
                    territory?: string | null
                    account_manager_id?: string | null
                    active_opportunities_value?: number
                    total_closed_deals?: number
                    ltv?: number
                    arr?: number
                    mrr?: number
                    churn_risk_score?: number
                    next_renewal_date?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            contacts: {
                Row: {
                    id: string
                    first_name: string
                    last_name: string | null
                    email: string | null
                    email_secondary: string | null
                    phone_mobile: string | null
                    phone_landline: string | null
                    phone_whatsapp: string | null
                    job_title: string | null
                    department: string | null
                    date_of_birth: string | null
                    gender: string | null
                    preferred_language: string
                    timezone: string | null
                    social_links: Json | null
                    avatar_url: string | null
                    company_id: string | null
                    address: Json | null
                    status: 'nuevo' | 'contactado' | 'calificado' | 'cliente' | 'inactivo' | 'descartado'
                    lead_score: number
                    source: 'formulario' | 'whatsapp' | 'importacion' | 'integracion' | 'referido' | 'evento' | 'web' | 'manual' | 'otro' | null
                    owner_id: string | null
                    team_id: string | null
                    priority: 'alta' | 'media' | 'baja'
                    total_revenue_generated: number
                    active_opportunities_count: number
                    conversion_probability: number
                    engagement_score: number
                    days_since_last_interaction: number
                    lifetime_value: number
                    is_blocked: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    first_name: string
                    last_name?: string | null
                    email?: string | null
                    email_secondary?: string | null
                    phone_mobile?: string | null
                    phone_landline?: string | null
                    phone_whatsapp?: string | null
                    job_title?: string | null
                    department?: string | null
                    date_of_birth?: string | null
                    gender?: string | null
                    preferred_language?: string
                    timezone?: string | null
                    social_links?: Json | null
                    avatar_url?: string | null
                    company_id?: string | null
                    address?: Json | null
                    status?: 'nuevo' | 'contactado' | 'calificado' | 'cliente' | 'inactivo' | 'descartado'
                    lead_score?: number
                    source?: 'formulario' | 'whatsapp' | 'importacion' | 'integracion' | 'referido' | 'evento' | 'web' | 'manual' | 'otro' | null
                    owner_id?: string | null
                    team_id?: string | null
                    priority?: 'alta' | 'media' | 'baja'
                    total_revenue_generated?: number
                    active_opportunities_count?: number
                    conversion_probability?: number
                    engagement_score?: number
                    days_since_last_interaction?: number
                    lifetime_value?: number
                    is_blocked?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    first_name?: string
                    last_name?: string | null
                    email?: string | null
                    email_secondary?: string | null
                    phone_mobile?: string | null
                    phone_landline?: string | null
                    phone_whatsapp?: string | null
                    job_title?: string | null
                    department?: string | null
                    date_of_birth?: string | null
                    gender?: string | null
                    preferred_language?: string
                    timezone?: string | null
                    social_links?: Json | null
                    avatar_url?: string | null
                    company_id?: string | null
                    address?: Json | null
                    status?: 'nuevo' | 'contactado' | 'calificado' | 'cliente' | 'inactivo' | 'descartado'
                    lead_score?: number
                    source?: 'formulario' | 'whatsapp' | 'importacion' | 'integracion' | 'referido' | 'evento' | 'web' | 'manual' | 'otro' | null
                    owner_id?: string | null
                    team_id?: string | null
                    priority?: 'alta' | 'media' | 'baja'
                    total_revenue_generated?: number
                    active_opportunities_count?: number
                    conversion_probability?: number
                    engagement_score?: number
                    days_since_last_interaction?: number
                    lifetime_value?: number
                    is_blocked?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            tags: {
                Row: {
                    id: string
                    name: string
                    color: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    color?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    color?: string
                    created_at?: string
                }
            }
            taggables: {
                Row: {
                    id: string
                    tag_id: string
                    taggable_type: 'contact' | 'company' | 'opportunity'
                    taggable_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    tag_id: string
                    taggable_type: 'contact' | 'company' | 'opportunity'
                    taggable_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    tag_id?: string
                    taggable_type?: 'contact' | 'company' | 'opportunity'
                    taggable_id?: string
                    created_at?: string
                }
            }
            pipelines: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    is_default: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    is_default?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    is_default?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            pipeline_stages: {
                Row: {
                    id: string
                    pipeline_id: string
                    name: string
                    description: string | null
                    sort_order: number
                    close_probability: number
                    color: string
                    required_fields: Json
                    avg_time_benchmark_days: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    pipeline_id: string
                    name: string
                    description?: string | null
                    sort_order: number
                    close_probability?: number
                    color?: string
                    required_fields?: Json
                    avg_time_benchmark_days?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    pipeline_id?: string
                    name?: string
                    description?: string | null
                    sort_order?: number
                    close_probability?: number
                    color?: string
                    required_fields?: Json
                    avg_time_benchmark_days?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            opportunities: {
                Row: {
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
                    status: 'abierto' | 'ganado' | 'perdido' | 'descartado'
                    type: 'nueva_venta' | 'upsell' | 'cross_sell' | 'renovacion' | null
                    product_category: string | null
                    priority: 'alta' | 'media' | 'baja'
                    original_source: string | null
                    primary_contact_id: string | null
                    company_id: string | null
                    owner_id: string | null
                    team_id: string | null
                    discount_global: number
                    tax_amount: number
                    total: number
                    competitors: Json
                    competitive_advantages: string | null
                    loss_reason: string | null
                    winning_competitor: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    monetary_value?: number
                    currency?: string
                    close_probability?: number
                    estimated_close_date?: string | null
                    actual_close_date?: string | null
                    sales_cycle_days?: number | null
                    stage_id?: string | null
                    pipeline_id?: string | null
                    status?: 'abierto' | 'ganado' | 'perdido' | 'descartado'
                    type?: 'nueva_venta' | 'upsell' | 'cross_sell' | 'renovacion' | null
                    product_category?: string | null
                    priority?: 'alta' | 'media' | 'baja'
                    original_source?: string | null
                    primary_contact_id?: string | null
                    company_id?: string | null
                    owner_id?: string | null
                    team_id?: string | null
                    discount_global?: number
                    tax_amount?: number
                    total?: number
                    competitors?: Json
                    competitive_advantages?: string | null
                    loss_reason?: string | null
                    winning_competitor?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    monetary_value?: number
                    currency?: string
                    close_probability?: number
                    estimated_close_date?: string | null
                    actual_close_date?: string | null
                    sales_cycle_days?: number | null
                    stage_id?: string | null
                    pipeline_id?: string | null
                    status?: 'abierto' | 'ganado' | 'perdido' | 'descartado'
                    type?: 'nueva_venta' | 'upsell' | 'cross_sell' | 'renovacion' | null
                    product_category?: string | null
                    priority?: 'alta' | 'media' | 'baja'
                    original_source?: string | null
                    primary_contact_id?: string | null
                    company_id?: string | null
                    owner_id?: string | null
                    team_id?: string | null
                    discount_global?: number
                    tax_amount?: number
                    total?: number
                    competitors?: Json
                    competitive_advantages?: string | null
                    loss_reason?: string | null
                    winning_competitor?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            activities: {
                Row: {
                    id: string
                    type: 'tarea' | 'llamada' | 'email' | 'reunion' | 'nota'
                    title: string
                    description: string | null
                    related_to_type: 'contact' | 'company' | 'opportunity' | null
                    related_to_id: string | null
                    status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada' | 'pospuesta'
                    priority: 'alta' | 'media' | 'baja'
                    due_date: string | null
                    completed_at: string | null
                    duration_minutes: number | null
                    metadata: Json
                    assigned_to: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    type: 'tarea' | 'llamada' | 'email' | 'reunion' | 'nota'
                    title: string
                    description?: string | null
                    related_to_type?: 'contact' | 'company' | 'opportunity' | null
                    related_to_id?: string | null
                    status?: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada' | 'pospuesta'
                    priority?: 'alta' | 'media' | 'baja'
                    due_date?: string | null
                    completed_at?: string | null
                    duration_minutes?: number | null
                    metadata?: Json
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    type?: 'tarea' | 'llamada' | 'email' | 'reunion' | 'nota'
                    title?: string
                    description?: string | null
                    related_to_type?: 'contact' | 'company' | 'opportunity' | null
                    related_to_id?: string | null
                    status?: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada' | 'pospuesta'
                    priority?: 'alta' | 'media' | 'baja'
                    due_date?: string | null
                    completed_at?: string | null
                    duration_minutes?: number | null
                    metadata?: Json
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            audit_log: {
                Row: {
                    id: string
                    user_id: string | null
                    action: string
                    entity_type: string
                    entity_id: string | null
                    old_values: Json | null
                    new_values: Json | null
                    ip_address: string | null
                    user_agent: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    action: string
                    entity_type: string
                    entity_id?: string | null
                    old_values?: Json | null
                    new_values?: Json | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    action?: string
                    entity_type?: string
                    entity_id?: string | null
                    old_values?: Json | null
                    new_values?: Json | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    contact_id: string | null
                    channel: 'email' | 'whatsapp' | 'phone' | 'internal'
                    subject: string | null
                    status: 'open' | 'closed' | 'archived'
                    last_message_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    contact_id?: string | null
                    channel: 'email' | 'whatsapp' | 'phone' | 'internal'
                    subject?: string | null
                    status?: 'open' | 'closed' | 'archived'
                    last_message_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    contact_id?: string | null
                    channel?: 'email' | 'whatsapp' | 'phone' | 'internal'
                    subject?: string | null
                    status?: 'open' | 'closed' | 'archived'
                    last_message_at?: string
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    direction: 'inbound' | 'outbound'
                    content: string
                    sent_at: string
                    sender_name: string | null
                    read: boolean
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    direction: 'inbound' | 'outbound'
                    content: string
                    sent_at?: string
                    sender_name?: string | null
                    read?: boolean
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    direction?: 'inbound' | 'outbound'
                    content?: string
                    sent_at?: string
                    sender_name?: string | null
                    read?: boolean
                }
            }
            automations: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    trigger_type: 'contact_created' | 'deal_stage_changed' | 'activity_due' | 'contact_birthday' | 'manual' | 'scheduled'
                    trigger_config: Json
                    conditions: Json
                    actions: Json
                    is_active: boolean
                    execution_count: number
                    last_executed_at: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    trigger_type: 'contact_created' | 'deal_stage_changed' | 'activity_due' | 'contact_birthday' | 'manual' | 'scheduled'
                    trigger_config?: Json
                    conditions?: Json
                    actions?: Json
                    is_active?: boolean
                    execution_count?: number
                    last_executed_at?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    trigger_type?: 'contact_created' | 'deal_stage_changed' | 'activity_due' | 'contact_birthday' | 'manual' | 'scheduled'
                    trigger_config?: Json
                    conditions?: Json
                    actions?: Json
                    is_active?: boolean
                    execution_count?: number
                    last_executed_at?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            automation_logs: {
                Row: {
                    id: string
                    automation_id: string
                    status: 'success' | 'error' | 'skipped'
                    trigger_data: Json | null
                    result: Json | null
                    error_message: string | null
                    executed_at: string
                }
                Insert: {
                    id?: string
                    automation_id: string
                    status: 'success' | 'error' | 'skipped'
                    trigger_data?: Json | null
                    result?: Json | null
                    error_message?: string | null
                    executed_at?: string
                }
                Update: {
                    id?: string
                    automation_id?: string
                    status?: 'success' | 'error' | 'skipped'
                    trigger_data?: Json | null
                    result?: Json | null
                    error_message?: string | null
                    executed_at?: string
                }
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
        CompositeTypes: Record<string, never>
    }
}

// Convenience type aliases
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Common entity types
export type UserProfile = Tables<'user_profiles'>
export type Contact = Tables<'contacts'>
export type Company = Tables<'companies'>
export type Opportunity = Tables<'opportunities'>
export type Activity = Tables<'activities'>
export type Pipeline = Tables<'pipelines'>
export type PipelineStage = Tables<'pipeline_stages'>
export type Tag = Tables<'tags'>
export type AuditLog = Tables<'audit_log'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>
export type Automation = Tables<'automations'>
export type AutomationLog = Tables<'automation_logs'>
