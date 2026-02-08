import type { Contact, Activity, Opportunity } from '@/types/database'
import { calculateLeadScore } from './scoring'

export interface Suggestion {
    id: string
    type: 'action' | 'insight' | 'warning'
    title: string
    description: string
    actionLabel?: string
    actionLink?: string
    priority: 'high' | 'medium' | 'low'
}

/**
 * Generates smart suggestions based on contact data and context.
 */
export function getSmartSuggestions(
    contact: Contact,
    recentActivities: Activity[] = [],
    opportunities: Opportunity[] = []
): Suggestion[] {
    const suggestions: Suggestion[] = []
    const scoreResult = calculateLeadScore(contact)
    const daysSinceInteraction = contact.days_since_last_interaction || 0
    const hasOpenOpp = opportunities.some(o => o.status === 'abierto')

    // 1. High Score but No Opportunity
    if (scoreResult.totalScore > 70 && !hasOpenOpp) {
        suggestions.push({
            id: 'create-opp',
            type: 'action',
            title: 'Oportunidad Detectada',
            description: `Este contacto tiene un alto Lead Score (${scoreResult.totalScore}) pero no tiene oportunidades abiertas. Considera abrir una negociación.`,
            actionLabel: 'Crear Oportunidad',
            actionLink: '/opportunities/new',
            priority: 'high'
        })
    }

    // 2. Engaging but Needs Follow-up
    if (daysSinceInteraction > 14 && scoreResult.totalScore > 40) {
        suggestions.push({
            id: 'schedule-call',
            type: 'warning',
            title: 'Riesgo de Enfriamiento',
            description: `Han pasado ${daysSinceInteraction} días desde la última interacción. Programa una llamada para mantener el interés.`,
            actionLabel: 'Agendar Llamada',
            actionLink: '/calendar/new',
            priority: 'medium'
        })
    }

    // 3. New Lead Qualification
    if (contact.status === 'nuevo' && !contact.email && !contact.phone_mobile) {
        suggestions.push({
            id: 'enrich-data',
            type: 'action',
            title: 'Faltan Datos de Contacto',
            description: 'El perfil está incompleto. Intenta conseguir un email o teléfono para calificar el lead.',
            actionLabel: 'Editar Perfil',
            actionLink: `/contacts/${contact.id}/edit`,
            priority: 'high'
        })
    } else if (contact.status === 'nuevo') {
        suggestions.push({
            id: 'qualify-lead',
            type: 'insight',
            title: 'Calificar Lead',
            description: 'Este contacto es nuevo. Revisa su perfil y determina si es un prospecto viable.',
            actionLabel: 'Cambiar Estado',
            actionLink: '#status',
            priority: 'medium'
        })
    }

    // 4. Deal Closing
    if (hasOpenOpp && scoreResult.totalScore > 80) {
        suggestions.push({
            id: 'close-deal',
            type: 'insight',
            title: 'Alta Probabilidad de Cierre',
            description: 'Las señales indican una alta intención de compra. Prioriza el cierre de su oportunidad activa.',
            priority: 'high'
        })
    }

    return suggestions
}
