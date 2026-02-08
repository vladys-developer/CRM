import { motion } from 'framer-motion'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area,
    PieChart, Pie, Cell,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import {
    DollarSign,
    TrendingUp,
    Trophy,
    Clock,
    Target,
    Percent,
    BarChart3,
    Activity,
    ClipboardList,
    Phone,
    Mail,
    Users,
    StickyNote,
    Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSalesOverview, useRevenueByMonth, usePipelineHealth, useActivityBreakdown } from '@/hooks/useReports'

const activityColors: Record<string, { color: string; label: string; icon: typeof ClipboardList }> = {
    tarea: { color: '#3B82F6', label: 'Tareas', icon: ClipboardList },
    llamada: { color: '#22C55E', label: 'Llamadas', icon: Phone },
    email: { color: '#A855F7', label: 'Emails', icon: Mail },
    reunion: { color: '#F59E0B', label: 'Reuniones', icon: Users },
    nota: { color: '#EC4899', label: 'Notas', icon: StickyNote },
}

function formatCurrency(value: number) {
    if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `€${(value / 1_000).toFixed(1)}K`
    return `€${value.toLocaleString('es-ES')}`
}

function SkeletonBlock({ height = 'h-64' }: { height?: string }) {
    return <div className={cn('animate-pulse rounded-xl bg-muted', height)} />
}

export function ReportsPage() {
    const { data: sales, isLoading: salesLoading } = useSalesOverview()
    const { data: revenue, isLoading: revenueLoading } = useRevenueByMonth()
    const { data: pipeline, isLoading: pipelineLoading } = usePipelineHealth()
    const { data: activities, isLoading: activitiesLoading } = useActivityBreakdown()

    const overviewCards = [
        {
            label: 'Ingresos (30d)',
            value: sales ? formatCurrency(sales.totalRevenue) : '€0',
            icon: DollarSign,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
        {
            label: 'Deals Ganados',
            value: sales?.dealsWon.toString() ?? '0',
            icon: Trophy,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            label: 'Win Rate',
            value: `${sales?.winRate ?? 0}%`,
            icon: Percent,
            color: (sales?.winRate ?? 0) >= 50 ? 'text-emerald-500' : 'text-amber-500',
            bgColor: (sales?.winRate ?? 0) >= 50 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
        },
        {
            label: 'Tamaño Medio',
            value: sales ? formatCurrency(sales.avgDealSize) : '€0',
            icon: Target,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            label: 'Ciclo de Venta',
            value: `${sales?.avgSalesCycle ?? 0}d`,
            icon: Clock,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        {
            label: 'Deals Perdidos',
            value: sales?.dealsLost.toString() ?? '0',
            icon: TrendingUp,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
    ]

    // Activity pie chart data
    const activityPieData = activities?.map((a) => ({
        name: activityColors[a.type]?.label ?? a.type,
        value: a.count,
        color: activityColors[a.type]?.color ?? '#94A3B8',
    })).filter((a) => a.value > 0) ?? []

    // Activity radar data
    const activityRadarData = activities?.map((a) => ({
        type: activityColors[a.type]?.label ?? a.type,
        total: a.count,
        completado: a.completed,
    })) ?? []

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Reportes</h1>
                    <p className="text-sm text-muted-foreground">
                        Análisis de ventas, pipeline y actividad
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent">
                    <Download className="h-4 w-4" />
                    Exportar
                </button>
            </div>

            {/* Overview KPI Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {salesLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4">
                            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted mb-3" />
                            <div className="h-6 w-16 animate-pulse rounded bg-muted mb-1" />
                            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                        </div>
                    ))
                    : overviewCards.map((card, index) => {
                        const Icon = card.icon
                        return (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
                            >
                                <div className={cn('rounded-lg p-2 w-fit', card.bgColor)}>
                                    <Icon className={cn('h-4 w-4', card.color)} />
                                </div>
                                <p className="mt-3 text-xl font-bold text-foreground">{card.value}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
                            </motion.div>
                        )
                    })}
            </div>

            {/* Revenue Trend + Pipeline Health */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Revenue Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-xl border border-border bg-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Tendencia de Ingresos</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Últimos 6 meses</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {revenueLoading ? (
                        <SkeletonBlock height="h-72" />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGanado" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                <Tooltip
                                    formatter={(value: number | undefined, name: string | undefined) => [formatCurrency(value ?? 0), (name === 'ganado' ? 'Ganado' : name === 'perdido' ? 'Perdido' : 'Pipeline')]}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                    }}
                                />
                                <Legend formatter={(value) => value === 'ganado' ? 'Ganado' : value === 'perdido' ? 'Perdido' : 'Pipeline'} />
                                <Area type="monotone" dataKey="ganado" stroke="#34D399" strokeWidth={2} fill="url(#colorGanado)" />
                                <Area type="monotone" dataKey="pipeline" stroke="#60A5FA" strokeWidth={2} fill="url(#colorPipeline)" />
                                <Area type="monotone" dataKey="perdido" stroke="#F87171" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Pipeline Health */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-border bg-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Salud del Pipeline</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Oportunidades por etapa</p>
                        </div>
                        <Target className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {pipelineLoading ? (
                        <SkeletonBlock height="h-72" />
                    ) : (pipeline?.length ?? 0) === 0 ? (
                        <div className="h-72 flex flex-col items-center justify-center text-muted-foreground">
                            <Target className="h-8 w-8 mb-2" />
                            <p className="text-sm">Sin datos de pipeline</p>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={pipeline} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="stage" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                                    <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                    <Tooltip
                                        formatter={(value: number | undefined) => [formatCurrency(value ?? 0), 'Valor']}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                                        {pipeline?.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>

                            {/* Pipeline table */}
                            <div className="mt-4 space-y-2">
                                {pipeline?.map((stage) => (
                                    <div key={stage.stage} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
                                            <span className="text-foreground">{stage.stage}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{stage.count} deals</span>
                                            <span className="font-medium text-foreground">{formatCurrency(stage.value)}</span>
                                            <span title="Edad promedio">{stage.avgAge}d avg</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Activity Breakdown */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Activity Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-xl border border-border bg-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Distribución de Actividades</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Últimos 30 días</p>
                        </div>
                        <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {activitiesLoading ? (
                        <SkeletonBlock height="h-64" />
                    ) : activityPieData.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                            <Activity className="h-8 w-8 mb-2" />
                            <p className="text-sm">Sin actividades registradas</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={activityPieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={50}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                >
                                    {activityPieData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Activity Radar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-border bg-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Actividades: Total vs Completado</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Últimos 30 días</p>
                        </div>
                    </div>

                    {activitiesLoading ? (
                        <SkeletonBlock height="h-64" />
                    ) : activityRadarData.every(d => d.total === 0) ? (
                        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                            <Activity className="h-8 w-8 mb-2" />
                            <p className="text-sm">Sin datos de actividades</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={activityRadarData}>
                                <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <PolarAngleAxis dataKey="type" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                <PolarRadiusAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                                <Radar name="Total" dataKey="total" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                                <Radar name="Completado" dataKey="completado" stroke="#34D399" fill="#34D399" fillOpacity={0.3} />
                                <Legend />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    )}

                    {/* Activity summary cards */}
                    <div className="mt-4 grid grid-cols-5 gap-2">
                        {activities?.map((a) => {
                            const config = activityColors[a.type]
                            const Icon = config?.icon ?? Activity
                            const completionRate = a.count > 0 ? Math.round((a.completed / a.count) * 100) : 0
                            return (
                                <div key={a.type} className="rounded-lg border border-border p-2 text-center">
                                    <Icon className="h-4 w-4 mx-auto mb-1" style={{ color: config?.color }} />
                                    <p className="text-xs font-bold text-foreground">{a.count}</p>
                                    <p className="text-[10px] text-muted-foreground">{completionRate}% done</p>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
