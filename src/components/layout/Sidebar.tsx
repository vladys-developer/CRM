import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    Building2,
    Target,
    Kanban,
    CheckSquare,
    Inbox,
    Calendar,
    BarChart3,
    Zap,
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Users,
    Building2,
    Target,
    Kanban,
    CheckSquare,
    Inbox,
    Calendar,
    BarChart3,
    Zap,
    Settings,
}

const navItems = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/contacts', label: 'Contactos', icon: 'Users' },
    { path: '/companies', label: 'Empresas', icon: 'Building2' },
    { path: '/opportunities', label: 'Oportunidades', icon: 'Target' },
    { path: '/pipeline', label: 'Pipeline', icon: 'Kanban' },
    { path: '/activities', label: 'Actividades', icon: 'CheckSquare' },
    { path: '/inbox', label: 'Inbox', icon: 'Inbox' },
    { path: '/calendar', label: 'Calendario', icon: 'Calendar' },
    { path: '/reports', label: 'Reportes', icon: 'BarChart3' },
    { path: '/automations', label: 'Automatizaciones', icon: 'Zap' },
]

const bottomItems = [
    { path: '/settings', label: 'Ajustes', icon: 'Settings' },
]

export function Sidebar() {
    const collapsed = useUIStore((s) => s.sidebarCollapsed)
    const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)
    const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
    const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
    const location = useLocation()

    // Helper to render nav items
    const renderNavItems = (items: typeof navItems, isMobile = false) => (
        <div className="space-y-1">
            {items.map((item) => {
                const Icon = iconMap[item.icon]!
                const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path)

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                        className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                            isActive
                                ? 'bg-sidebar-primary/10 text-sidebar-primary'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
                                isActive
                                    ? 'bg-sidebar-primary text-white'
                                    : 'text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                        </div>
                        <AnimatePresence>
                            {(isMobile || !collapsed) && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                )
            })}
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 72 : 260 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className={cn(
                    'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background',
                    'hidden md:flex'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                            >
                                <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">
                                    Vendora
                                </h1>
                                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                    CRM
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {renderNavItems(navItems)}
                </nav>

                {/* Bottom Items */}
                <div className="border-t border-sidebar-border px-3 py-3">
                    {renderNavItems(bottomItems)}

                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setSidebarCollapsed(!collapsed)}
                        className="mt-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar-background shadow-xl md:hidden"
                        >
                            {/* Logo */}
                            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">
                                            Vendora
                                        </h1>
                                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                            CRM Mobile
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-lg p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Nav Items */}
                            <nav className="flex-1 overflow-y-auto px-4 py-4">
                                {renderNavItems(navItems, true)}
                            </nav>

                            {/* Bottom Items */}
                            <div className="border-t border-sidebar-border px-4 py-4">
                                {renderNavItems(bottomItems, true)}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
