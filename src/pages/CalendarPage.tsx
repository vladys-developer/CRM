import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    ClipboardList,
    Phone,
    Mail,
    Users,
    StickyNote,
    Clock,
    Calendar as CalendarIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCalendarEvents } from '@/hooks/useCalendar'
import type { CalendarEvent } from '@/lib/api/calendar'

const typeConfig: Record<string, { icon: typeof ClipboardList; color: string; bgColor: string; dotColor: string }> = {
    tarea: { icon: ClipboardList, color: 'text-blue-500', bgColor: 'bg-blue-500/10', dotColor: 'bg-blue-500' },
    llamada: { icon: Phone, color: 'text-green-500', bgColor: 'bg-green-500/10', dotColor: 'bg-green-500' },
    email: { icon: Mail, color: 'text-purple-500', bgColor: 'bg-purple-500/10', dotColor: 'bg-purple-500' },
    reunion: { icon: Users, color: 'text-amber-500', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-500' },
    nota: { icon: StickyNote, color: 'text-pink-500', bgColor: 'bg-pink-500/10', dotColor: 'bg-pink-500' },
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function CalendarPage() {
    const navigate = useNavigate()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [view, setView] = useState<'month' | 'week'>('month')

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Calculate date range for current view
    const { startDate, endDate } = useMemo(() => {
        const start = new Date(year, month, 1)
        const end = new Date(year, month + 1, 0, 23, 59, 59)
        // Extend to cover full weeks
        const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1
        start.setDate(start.getDate() - startDay)
        end.setDate(end.getDate() + (6 - (end.getDay() === 0 ? 6 : end.getDay() - 1)))
        return {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        }
    }, [year, month])

    const { data: events, isLoading } = useCalendarEvents(startDate, endDate)

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; events: CalendarEvent[] }[] = []
        const start = new Date(startDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        while (start <= new Date(endDate)) {
            const dateStr = start.toISOString().split('T')[0]
            const dayEvents = (events ?? []).filter((e) => {
                const eventDate = new Date(e.start).toISOString().split('T')[0]
                return eventDate === dateStr
            })

            days.push({
                date: new Date(start),
                isCurrentMonth: start.getMonth() === month,
                isToday: start.toDateString() === today.toDateString(),
                events: dayEvents,
            })

            start.setDate(start.getDate() + 1)
        }

        return days
    }, [startDate, endDate, events, month])

    // Events for selected date
    const selectedEvents = useMemo(() => {
        if (!selectedDate) return []
        return (events ?? []).filter((e) => {
            return new Date(e.start).toISOString().split('T')[0] === selectedDate
        })
    }, [selectedDate, events])

    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(year, month + direction, 1))
        setSelectedDate(null)
    }

    const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Calendario</h1>
                    <p className="text-sm text-muted-foreground">Visualiza tus actividades programadas</p>
                </div>
                <button
                    onClick={() => navigate('/activities')}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Actividad
                </button>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h2 className="text-lg font-semibold text-foreground capitalize min-w-[180px] text-center">
                        {monthName}
                    </h2>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setCurrentDate(new Date()); setSelectedDate(null) }}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                        Hoy
                    </button>
                    <div className="flex rounded-lg border border-border overflow-hidden">
                        <button
                            onClick={() => setView('month')}
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium transition-colors',
                                view === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                            )}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium transition-colors',
                                view === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                            )}
                        >
                            Semana
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Calendar Grid */}
                <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 border-b border-border bg-accent/30">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-7">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="border-b border-r border-border/50 p-2 h-28">
                                    <div className="h-5 w-5 animate-pulse rounded bg-muted mb-2" />
                                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, index) => {
                                const dateStr = day.date.toISOString().split('T')[0]
                                const isSelected = selectedDate === dateStr

                                return (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedDate(dateStr ?? null)}
                                        className={cn(
                                            'relative border-b border-r border-border/50 p-2 h-28 cursor-pointer transition-colors',
                                            !day.isCurrentMonth && 'bg-muted/20',
                                            isSelected && 'bg-primary/5 ring-2 ring-primary/30 ring-inset',
                                            day.isToday && 'bg-primary/5',
                                            'hover:bg-accent/50'
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn(
                                                'text-sm font-medium',
                                                day.isToday
                                                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground'
                                                    : day.isCurrentMonth
                                                        ? 'text-foreground'
                                                        : 'text-muted-foreground/50'
                                            )}>
                                                {day.date.getDate()}
                                            </span>
                                        </div>

                                        {/* Event dots / chips */}
                                        <div className="space-y-0.5">
                                            {day.events.slice(0, 3).map((event) => {
                                                const config = typeConfig[event.type]
                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={cn(
                                                            'truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight',
                                                            config?.bgColor ?? 'bg-muted'
                                                        )}
                                                        title={event.title}
                                                    >
                                                        <span className={config?.color ?? 'text-muted-foreground'}>
                                                            {event.title}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                            {day.events.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground pl-1">
                                                    +{day.events.length - 3} más
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Day Detail Sidebar */}
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {selectedDate
                            ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
                            : 'Selecciona un día'
                        }
                    </h3>

                    {!selectedDate ? (
                        <div className="mt-8 flex flex-col items-center text-center">
                            <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-xs text-muted-foreground">
                                Haz clic en un día del calendario para ver sus actividades
                            </p>
                        </div>
                    ) : selectedEvents.length === 0 ? (
                        <div className="mt-8 flex flex-col items-center text-center">
                            <CalendarIcon className="h-8 w-8 text-muted-foreground/30 mb-3" />
                            <p className="text-xs text-muted-foreground">Sin actividades para este día</p>
                            <button
                                onClick={() => navigate('/activities')}
                                className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                            >
                                <Plus className="h-3 w-3" />
                                Crear actividad
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-2">
                            {selectedEvents.map((event) => {
                                const config = typeConfig[event.type]
                                const Icon = config?.icon ?? ClipboardList
                                const time = new Date(event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            'rounded-xl border border-border p-3 transition-all hover:shadow-sm',
                                            event.status === 'completada' && 'opacity-60'
                                        )}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className={cn('rounded-lg p-2 mt-0.5', config?.bgColor ?? 'bg-muted')}>
                                                <Icon className={cn('h-3.5 w-3.5', config?.color ?? 'text-muted-foreground')} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    'text-sm font-medium text-foreground truncate',
                                                    event.status === 'completada' && 'line-through'
                                                )}>
                                                    {event.title}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {time}
                                                </div>
                                                {event.description && (
                                                    <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">
                                                        {event.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status + Priority */}
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={cn(
                                                'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                event.status === 'completada' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    event.status === 'pendiente' ? 'bg-amber-500/10 text-amber-500' :
                                                        event.status === 'en_progreso' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-muted text-muted-foreground'
                                            )}>
                                                {event.status}
                                            </span>
                                            <span className={cn(
                                                'h-2 w-2 rounded-full',
                                                event.priority === 'alta' ? 'bg-red-500' :
                                                    event.priority === 'media' ? 'bg-amber-500' : 'bg-green-500'
                                            )} />
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
