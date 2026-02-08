import { motion } from 'framer-motion'
import { Check, TrendingUp, AlertCircle, User, DollarSign, Clock } from 'lucide-react'
import { calculateLeadScore } from '@/lib/ai/scoring'
import type { Contact } from '@/types/database'
import { cn } from '@/lib/utils'

interface LeadScoreCardProps {
    contact: Contact
}

export function LeadScoreCard({ contact }: LeadScoreCardProps) {
    const { totalScore, factors, level } = calculateLeadScore(contact)

    const getColor = (score: number) => {
        if (score >= 70) return 'text-emerald-500 stroke-emerald-500'
        if (score >= 40) return 'text-amber-500 stroke-amber-500'
        return 'text-blue-500 stroke-blue-500'
    }

    const colorClass = getColor(totalScore)

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    AI Lead Score
                </h3>
                <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full uppercase',
                    level === 'hot' ? 'bg-emerald-500/10 text-emerald-500' :
                        level === 'warm' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-blue-500/10 text-blue-500'
                )}>
                    {level === 'hot' ? 'Alto Potencial' : level === 'warm' ? 'En Seguimiento' : 'Frío'}
                </span>
            </div>

            <div className="mt-6 flex flex-col items-center">
                <div className="relative h-32 w-32">
                    {/* Background Circle */}
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="8"
                            className="opacity-20"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            initial={{ strokeDashoffset: 314 }}
                            animate={{ strokeDashoffset: 314 - (totalScore / 100) * 314 }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="314"
                            className={colorClass}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn('text-3xl font-bold', colorClass.split(' ')[0])}>
                            {totalScore}
                        </span>
                    </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Puntuación basada en IA</p>
            </div>

            {/* Score Breakdown */}
            <div className="mt-6 space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>Perfil</span>
                    </div>
                    <span className="font-medium text-emerald-500">+{factors.profile}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Valor</span>
                    </div>
                    <span className="font-medium text-emerald-500">+{factors.revenue}</span>
                </div>

                {/* Only show decay if it exists */}
                {factors.decay < 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Inactividad</span>
                        </div>
                        <span className="font-medium text-red-500">{factors.decay}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
