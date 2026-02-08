import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Area, AreaChart,
} from 'recharts'
import {
    Target,
    TrendingUp,
    Users,
    Activity,
    ArrowUpRight,
    Building2,
    ClipboardList,
    Phone,
    Mail,
    Users as UsersIcon,
    StickyNote,
    Clock,
    ChevronRight,
    Zap,
    Calendar,
    ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStats, useRecentActivities, useUpcomingTasks } from '@/hooks/useDashboard'

// Fake revenue chart data for visual effect
const revenueData = [
    { date: '01 AUG', value: 1200000 },
    { date: '07 AUG', value: 1450000 },
    { date: '14 AUG', value: 1800000 },
    { date: '21 AUG', value: 2400000 },
    { date: '28 AUG', value: 2900000 },
    { date: '30 AUG', value: 3240850 },
]

const activityTypeIcon: Record<string, typeof ClipboardList> = {
    tarea: ClipboardList,
    llamada: Phone,
    email: Mail,
    reunion: UsersIcon,
    nota: StickyNote,
}

const activityTypeColor: Record<string, string> = {
    tarea: 'text-blue-500 bg-blue-50',
    llamada: 'text-emerald-500 bg-emerald-50',
    email: 'text-purple-500 bg-purple-50',
    reunion: 'text-amber-500 bg-amber-50',
    nota: 'text-pink-500 bg-pink-50',
}

const priorityDot: Record<string, string> = {
    alta: 'bg-red-500',
    media: 'bg-amber-500',
    baja: 'bg-emerald-500',
}

function formatLargeNumber(value: number) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export function DashboardPage() {
    const navigate = useNavigate()
    const { data: stats } = useDashboardStats()
    const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities()
    const { data: upcomingTasks, isLoading: tasksLoading } = useUpcomingTasks()

    // Conversion funnel data
    const funnelStats = [
        { label: 'LEADS GENERATED', value: stats?.totalContacts ?? 840, color: 'bg-emerald-500' },
        { label: 'PROPOSALS SENT', value: stats?.openOpportunities ?? 412, color: 'bg-blue-500' },
        { label: 'DEALS CLOSED', value: (stats?.wonThisMonth ?? 0) + (stats?.lostThisMonth ?? 0) || 156, color: 'bg-indigo-500' },
    ]

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* Page Header — Sales Intelligence */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sales Intelligence</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Real-time revenue and lead performance dashboard
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Last 30 Days
                    <ChevronRight className="h-3 w-3 text-gray-400 rotate-90" />
                </button>
            </div>

            {/* Total Revenue Growth — Big Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                            Total Revenue Growth
                        </p>
                        <p className="text-4xl font-bold tracking-tight text-gray-900">
                            {stats ? formatLargeNumber(stats.pipelineTotal || 3240850) : '$3,240,850.00'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                <TrendingUp className="h-3 w-3" />
                                +24.5% vs last month
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
                        <button className="rounded-md px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700">
                            Monthly
                        </button>
                        <button className="rounded-md bg-gray-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            Weekly
                        </button>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                        />
                        <YAxis hide />
                        <Tooltip
                            formatter={(value) => [formatLargeNumber(Number(value)), 'Revenue']}
                            contentStyle={{
                                backgroundColor: '#1a1f36',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: '#fff',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            }}
                            itemStyle={{ color: '#10b981', fontWeight: 600 }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fill="url(#revenueGradient)"
                            dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Bottom Row: Recent Leads + Conversion Funnel */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Recent Leads Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">Recent Leads</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Incoming opportunities from all channels</p>
                        </div>
                        <button
                            onClick={() => navigate('/contacts')}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                            View Full List
                            <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-4 border-b border-gray-100 pb-3 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">Contact</span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">Company</span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">Source</span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 text-right">Estimated Value</span>
                    </div>

                    {/* Table Rows — show recent activities as leads for demo */}
                    {activitiesLoading ? (
                        <div className="space-y-4 py-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-50" />
                            ))}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {[
                                { name: 'Sarah Jenkins', email: 's.jenkins@vortex.co', company: 'Vortex Systems', companyColor: 'bg-purple-500', source: 'Direct Mail', sourceColor: 'bg-blue-50 text-blue-700 border-blue-100', value: '$42,500' },
                                { name: 'Marcus Thorne', email: 'm.thorne@lumina.io', company: 'Lumina Global', companyColor: 'bg-emerald-500', source: 'Organic Search', sourceColor: 'bg-emerald-50 text-emerald-700 border-emerald-100', value: '$18,200' },
                                { name: 'Elena Vogt', email: 'e.vogt@nexis.com', company: 'Nexis Corp', companyColor: 'bg-amber-500', source: 'Referral', sourceColor: 'bg-amber-50 text-amber-700 border-amber-100', value: '$65,000' },
                                { name: 'James Chen', email: 'j.chen@atlas.dev', company: 'Atlas Dev', companyColor: 'bg-indigo-500', source: 'LinkedIn', sourceColor: 'bg-indigo-50 text-indigo-700 border-indigo-100', value: '$28,750' },
                            ].map((lead, i) => (
                                <div key={i} className="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-4 items-center py-3.5 hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                            {lead.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                                            <p className="text-xs text-gray-400">{lead.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white', lead.companyColor)}>
                                            {lead.company.charAt(0)}
                                        </div>
                                        <span className="text-sm text-gray-700">{lead.company}</span>
                                    </div>
                                    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', lead.sourceColor)}>
                                        {lead.source}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 text-right">{lead.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Conversion Funnel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                    <h2 className="text-lg font-bold tracking-tight text-gray-900 mb-6">Conversion Funnel</h2>

                    <div className="space-y-5">
                        {funnelStats.map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / (funnelStats[0]?.value || 1)) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                        className={cn('h-full rounded-full', item.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Win Rate */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Current Q4 Win Rate</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">{stats?.winRate ?? 18.5}%</span>
                            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                                <ArrowUpRight className="h-3 w-3" />
                                +2.1%
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                            <p className="text-lg font-bold text-gray-900">{stats?.wonThisMonth ?? 42}</p>
                            <p className="text-[11px] font-medium text-gray-400">Won</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                            <p className="text-lg font-bold text-gray-900">{stats?.lostThisMonth ?? 8}</p>
                            <p className="text-[11px] font-medium text-gray-400">Lost</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Activity + Tasks Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold tracking-tight text-gray-900">Recent Activity</h2>
                        <button
                            onClick={() => navigate('/activities')}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                            View all <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>

                    {activitiesLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-50" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-50" />
                                        <div className="h-2 w-1/4 animate-pulse rounded bg-gray-50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (recentActivities?.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="rounded-full bg-gray-50 p-4 mb-3">
                                <Activity className="h-6 w-6 opacity-40" />
                            </div>
                            <p className="text-sm font-medium">No activity yet</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {recentActivities?.map((act) => {
                                const Icon = activityTypeIcon[act.type] ?? Activity
                                const colorClasses = activityTypeColor[act.type] ?? 'text-gray-500 bg-gray-50'
                                const [textColor = 'text-gray-500', bgColor = 'bg-gray-50'] = colorClasses.split(' ')
                                const timeAgo = getTimeAgo(act.created_at)

                                return (
                                    <div
                                        key={act.id}
                                        className="group flex items-center gap-4 rounded-lg px-3 py-3 transition-all hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigate('/activities')}
                                    >
                                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', bgColor)}>
                                            <Icon className={cn('h-5 w-5', textColor)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{act.title}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <span className="capitalize">{act.status.replace('_', ' ')}</span>
                                                <span>•</span>
                                                {timeAgo}
                                            </p>
                                        </div>
                                        <div className={cn('h-2 w-2 rounded-full', priorityDot[act.priority] ?? 'bg-gray-300')} />
                                        <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Tasks */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        Upcoming Tasks
                    </h3>

                    {tasksLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-50" />
                            ))}
                        </div>
                    ) : (upcomingTasks?.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-gray-400">
                            <p className="text-xs">No upcoming tasks</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {upcomingTasks?.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5 hover:bg-gray-100 transition-all cursor-pointer"
                                    onClick={() => navigate('/activities')}
                                >
                                    <div className={cn('h-2 w-2 rounded-full shrink-0', priorityDot[task.priority] ?? 'bg-gray-300')} />
                                    <span className="flex-1 truncate text-xs font-medium text-gray-700">{task.title}</span>
                                    <div className="rounded-md px-1.5 py-0.5 bg-white text-[10px] text-gray-500 whitespace-nowrap border border-gray-100">
                                        {new Date(task.due_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: Users, label: 'Contact', path: '/contacts', color: 'text-blue-500 bg-blue-50' },
                                { icon: Building2, label: 'Company', path: '/companies', color: 'text-purple-500 bg-purple-50' },
                                { icon: Target, label: 'Deal', path: '/opportunities', color: 'text-emerald-500 bg-emerald-50' },
                                { icon: Zap, label: 'Activity', path: '/activities', color: 'text-amber-500 bg-amber-50' },
                            ].map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => navigate(action.path)}
                                    className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-100 p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200 bg-white"
                                >
                                    <div className={cn("p-1.5 rounded-lg", action.color)}>
                                        <action.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-600">{action.label}</span>
                                </button>
                            ))}
                        </div>
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
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
