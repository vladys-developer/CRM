import type { Contact, Activity } from '@/types/database'

export interface ScoreFactors {
    profile: number
    activity: number
    revenue: number
    decay: number
}

export interface LeadScoreResult {
    totalScore: number // 0-100
    factors: ScoreFactors
    level: 'cold' | 'warm' | 'hot'
}

/**
 * Calculates the Lead Score based on profile completeness and historical data.
 * @param contact The contact object
 * @returns detailed score breakdown
 */
export function calculateLeadScore(contact: Contact): LeadScoreResult {
    let profileScore = 0
    let revenueScore = 0
    let decayScore = 0

    // 1. Profile Completeness (Max 40)
    if (contact.email) profileScore += 10
    if (contact.phone_mobile || contact.phone_landline) profileScore += 10
    if (contact.job_title) profileScore += 5
    if (contact.company_id) profileScore += 5
    if (contact.address) profileScore += 5
    if (contact.preferred_language) profileScore += 5

    // 2. Revenue & Deals (Max 30)
    // +1 point per 1000 units of revenue, capped at 20
    const revenuePoints = Math.min(20, Math.floor((contact.total_revenue_generated || 0) / 1000))
    revenueScore += revenuePoints

    // +5 points per closed deal, capped at 10
    // (Assuming active_opportunities_count correlates somewhat, but ideally we'd use closed_deals_count if available. 
    // Using revenue as proxy for now plus explicit field if mapped)

    // 3. Time Decay (Negative Impact)
    // Lose 1 point for every 7 days since last interaction
    const daysSinceInteraction = contact.days_since_last_interaction || 0
    const decayPoints = Math.floor(daysSinceInteraction / 7)
    decayScore = Math.min(20, decayPoints) // Max deduction 20

    const totalCalculated = profileScore + revenueScore - decayScore
    // Ensure 0-100 range
    const totalScore = Math.max(0, Math.min(100, totalCalculated))

    let level: LeadScoreResult['level'] = 'cold'
    if (totalScore >= 70) level = 'hot'
    else if (totalScore >= 40) level = 'warm'

    return {
        totalScore,
        factors: {
            profile: profileScore,
            activity: 0, // Activity score usually comes from a separate 'recent activity' analysis
            revenue: revenueScore,
            decay: -decayScore
        },
        level
    }
}

/**
 * Calculates Engagement Score based on interaction frequency.
 * @param activities List of recent activities
 * @returns 0-100 score
 */
export function calculateEngagementScore(activities: Activity[]): number {
    if (!activities || activities.length === 0) return 0

    const now = new Date()
    let score = 0

    // Weight activities by type and recency
    activities.forEach(act => {
        const date = new Date(act.created_at)
        const daysAgo = (now.getTime() - date.getTime()) / (1000 * 3600 * 24)

        if (daysAgo > 30) return // Ignore old activities for engagement score

        // Weight by type
        let weight = 1
        switch (act.type) {
            case 'reunion': weight = 10; break;
            case 'llamada': weight = 5; break;
            case 'email': weight = 2; break;
            case 'tarea': weight = 1; break;
        }

        // Recency multiplier (newer = higher value)
        // 0 days ago = 1.0, 30 days ago = 0.0
        const recencyMultiplier = Math.max(0, (30 - daysAgo) / 30)

        score += weight * recencyMultiplier
    })

    return Math.min(100, Math.round(score))
}

/**
 * Estimates conversion probability based on lead score and stage.
 * @param leadScore The calculated lead score
 * @param hasActiveDeal Whether the contact has an open opportunity
 * @returns 0-100 probability
 */
export function calculateConversionProbability(leadScore: number, hasActiveDeal: boolean): number {
    let prob = leadScore * 0.5 // Base probability is half the lead score

    if (hasActiveDeal) {
        prob += 20 // Boost if they already have an active deal
    }

    if (leadScore > 80) prob += 10 // High quality bonus

    return Math.min(95, Math.round(prob)) // Cap at 95%
}
