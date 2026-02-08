import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
    Target,
    TrendingUp,
    Users,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Calendar,
    Building2,
    Trophy,
    Percent,
    ClipboardList,
    Phone,
    Mail,
    Users as UsersIcon,
    StickyNote,
    Clock,
    Flag,
    ChevronRight,
    Zap,
    Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStats, usePipelineFunnel, useRecentActivities, useUpcomingTasks } from '@/hooks/useDashboard'

const activityTypeIcon: Record<string, typeof ClipboardList> = {
    tarea: ClipboardList,
    llamada: Phone,
    email: Mail,
    reunion: UsersIcon,
    nota: StickyNote,
}

const activityTypeColor: Record<string, string> = {
    tarea: 'text-blue-500 bg-blue-500/10',
    llamada: 'text-green-500 bg-green-500/10',
    email: 'text-purple-500 bg-purple-500/10',
    reunion: 'text-amber-500 bg-amber-500/10',
    nota: 'text-pink-500 bg-pink-500/10',
}

const priorityDot: Record<string, string> = {
    alta: 'bg-red-500',
    media: 'bg-amber-500',
    baja: 'bg-green-500',
}

function formatCurrency(value: number) {
    if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `€${(value / 1_000).toFixed(1)}K`
    return `€${value.toLocaleString('es-ES')}`
}

function SkeletonCard() {
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-7 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
        </div>
    )
}

export function DashboardPage() {
    const navigate = useNavigate()
    const { data: stats, isLoading: statsLoading } = useDashboardStats()
    const { data: funnel, isLoading: funnelLoading } = usePipelineFunnel()
    const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities()
    const { data: upcomingTasks, isLoading: tasksLoading } = useUpcomingTasks()

    const kpiCards = [
        {
            label: 'Pipeline Total',
            value: stats ? formatCurrency(stats.pipelineTotal) : '€0',
            change: stats ? `${stats.pipelineChange >= 0 ? '+' : ''}${stats.pipelineChange}%` : '+0%',
            trend: (stats?.pipelineChange ?? 0) >= 0 ? 'up' : 'down',
            icon: Target,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            label: 'Oportunidades Abiertas',
            value: stats?.openOpportunities.toString() ?? '0',
            change: stats ? `${stats.opportunitiesChange >= 0 ? '+' : ''}${stats.opportunitiesChange}%` : '+0%',
            trend: (stats?.opportunitiesChange ?? 0) >= 0 ? 'up' : 'down',
            icon: TrendingUp,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
        {
            label: 'Contactos',
            value: stats?.totalContacts.toString() ?? '0',
            change: stats ? `${stats.contactsChange >= 0 ? '+' : ''}${stats.contactsChange}%` : '+0%',
            trend: (stats?.contactsChange ?? 0) >= 0 ? 'up' : 'down',
            icon: Users,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            label: 'Actividades Pendientes',
            value: stats?.pendingActivities.toString() ?? '0',
            change: stats ? `${stats.overdueActivities} vencidas` : '0 vencidas',
            trend: (stats?.overdueActivities ?? 0) > 0 ? 'down' : 'neutral',
            icon: Activity,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
    ]

    const winRateData = stats ? [
        { name: 'Ganadas', value: stats.wonThisMonth, color: '#34D399' },
        { name: 'Perdidas', value: stats.lostThisMonth, color: '#F87171' },
    ] : []

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Resumen general de tu actividad comercial
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/activities')}
                        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Actividad
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsLoading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : kpiCards.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className={cn('rounded-lg p-2.5', stat.bgColor)}>
                                        <Icon className={cn('h-5 w-5', stat.color)} />
                                    </div>
                                    <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                                <div className="mt-3 flex items-center gap-1 text-xs">
                                    {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                                    {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                                    <span className={cn(
                                        stat.trend === 'up' && 'text-emerald-500',
                                        stat.trend === 'down' && 'text-red-500',
                                        stat.trend === 'neutral' && 'text-muted-foreground',
                                    )}>
                                        {stat.change}
                                    </span>
                                    <span className="text-muted-foreground">vs mes anterior</span>
                                </div>
                                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
                            </motion.div>
                        )
                    })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Pipeline Funnel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 rounded-xl border border-border bg-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Pipeline por Etapa</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Valor de oportunidades abiertas por etapa</p>
                        </div>
                        <button
                            onClick={() => navigate('/pipeline')}
                            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
                        >
                            Ver Pipeline <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {funnelLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : (funnel?.length ?? 0) === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                            <Target className="h-8 w-8 mb-2" />
                            <p className="text-sm">Sin datos de pipeline aún</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={funnel} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                                <XAxis
                                    type="number"
                                    tickFormatter={(v) => formatCurrency(v)}
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={90}
                                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                                />
                                <Tooltip
                                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={32}>
                                    {funnel?.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Win Rate Donut */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-border bg-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Win Rate</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Ratio de cierre este mes</p>
                        </div>
                        <div className={cn(
                            'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                            (stats?.winRate ?? 0) >= 50 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        )}>
                            <Percent className="h-3 w-3" />
                            {stats?.winRate ?? 0}%
                        </div>
                    </div>

                    {statsLoading ? (
                        <div className="h-48 flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : (stats?.wonThisMonth ?? 0) + (stats?.lostThisMonth ?? 0) === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                            <Trophy className="h-8 w-8 mb-2" />
                            <p className="text-sm">Sin cierres este mes</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={winRateData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {winRateData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Legend
                                    verticalAlign="bottom"
                                    formatter={(value: string) => <span className="text-xs text-foreground">{value}</span>}
                                />
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

                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                            <p className="text-xl font-bold text-emerald-500">{stats?.wonThisMonth ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Ganadas</p>
                        </div>
                        <div className="rounded-lg bg-red-500/10 p-3 text-center">
                            <p className="text-xl font-bold text-red-500">{stats?.lostThisMonth ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Perdidas</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="lg:col-span-2 rounded-xl border border-border bg-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Actividad Reciente</h2>
                        <button
                            onClick={() => navigate('/activities')}
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                        >
                            Ver todo <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {activitiesLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 py-2">
                                    <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
                                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (recentActivities?.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="rounded-full bg-muted p-4">
                                <Activity className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="mt-4 text-sm font-medium text-foreground">Sin actividad aún</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Las actividades recientes aparecerán aquí
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {recentActivities?.map((act) => {
                                const Icon = activityTypeIcon[act.type] ?? Activity
                                const colorClasses = activityTypeColor[act.type] ?? 'text-gray-500 bg-gray-500/10'
                                const [textColor, bgColor] = colorClasses.split(' ')
                                const timeAgo = getTimeAgo(act.created_at)

                                return (
                                    <div
                                        key={act.id}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50 cursor-pointer"
                                        onClick={() => navigate('/activities')}
                                    >
                                        <div className={cn('rounded-lg p-2', bgColor)}>
                                            <Icon className={cn('h-4 w-4', textColor)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{act.title}</p>
                                            <p className="text-xs text-muted-foreground">{timeAgo}</p>
                                        </div>
                                        <div className={cn('h-2 w-2 rounded-full', priorityDot[act.priority] ?? 'bg-gray-400')} />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions & Upcoming Tasks */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl border border-border bg-card p-6"
                >
                    <h2 className="text-lg font-semibold text-foreground">Acciones Rápidas</h2>
                    <div className="mt-4 space-y-1">
                        {[
                            { icon: Users, label: 'Nuevo Contacto', path: '/contacts' },
                            { icon: Building2, label: 'Nueva Empresa', path: '/companies' },
                            { icon: Target, label: 'Nueva Oportunidad', path: '/opportunities' },
                            { icon: Zap, label: 'Nueva Actividad', path: '/activities' },
                        ].map((action) => (
                            <button
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                            >
                                <action.icon className="h-4 w-4 text-muted-foreground" />
                                {action.label}
                                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </button>
                        ))}
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="mt-6 border-t border-border pt-4">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            Próximas Tareas
                        </h3>

                        {tasksLoading ? (
                            <div className="mt-3 space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
                                ))}
                            </div>
                        ) : (upcomingTasks?.length ?? 0) === 0 ? (
                            <div className="mt-3 flex flex-col items-center py-6">
                                <p className="text-xs text-muted-foreground">No hay tareas pendientes</p>
                            </div>
                        ) : (
                            <div className="mt-3 space-y-1">
                                {upcomingTasks?.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent/50 cursor-pointer transition-colors"
                                        onClick={() => navigate('/activities')}
                                    >
                                        <div className={cn('h-2 w-2 rounded-full', priorityDot[task.priority] ?? 'bg-gray-400')} />
                                        <span className="flex-1 truncate text-foreground">{task.title}</span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(task.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

// ─── Helper ──────────────────────────────────────────────────
function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return 'Ahora mismo'
    if (minutes < 60) return `Hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `Hace ${days}d`
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
