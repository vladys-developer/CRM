import { motion } from 'framer-motion'
import { Lightbulb, ArrowRight, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSmartSuggestions } from '@/lib/ai/recommendations'
import type { Contact, Activity, Opportunity } from '@/types/database'
import { cn } from '@/lib/utils'

interface SmartSuggestionsProps {
    contact: Contact
    activities?: Activity[]
    opportunities?: Opportunity[]
}

export function SmartSuggestions({ contact, activities = [], opportunities = [] }: SmartSuggestionsProps) {
    const suggestions = getSmartSuggestions(contact, activities, opportunities)

    if (suggestions.length === 0) return null

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Sugerencias de IA
            </h3>

            <div className="space-y-3">
                {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.type === 'warning' ? AlertTriangle :
                        suggestion.type === 'action' ? CheckCircle : Info

                    const colorClass = suggestion.priority === 'high' ? 'text-red-500 bg-red-500/10' :
                        suggestion.priority === 'medium' ? 'text-amber-500 bg-amber-500/10' :
                            'text-blue-500 bg-blue-500/10'

                    return (
                        <motion.div
                            key={suggestion.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="rounded-lg border border-border bg-background p-3"
                        >
                            <div className="flex gap-3">
                                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', colorClass)}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-foreground">{suggestion.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>

                                    {suggestion.actionLabel && (
                                        <Link
                                            to={suggestion.actionLink ?? '#'}
                                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                                        >
                                            {suggestion.actionLabel}
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
