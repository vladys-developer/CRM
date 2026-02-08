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
    Receipt,
    TrendingUp,
    X,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'

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
    Receipt,
    TrendingUp,
}

// Grouped navigation sections
const navSections = [
    {
        label: 'CORE DIRECTORY',
        items: [
            { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
            { path: '/contacts', label: 'Contacts', icon: 'Users' },
            { path: '/pipeline', label: 'Pipelines', icon: 'Kanban' },
            { path: '/inbox', label: 'Invoicing', icon: 'Receipt' },
        ],
    },
    {
        label: 'WORKSPACE',
        items: [
            { path: '/reports', label: 'Performance', icon: 'TrendingUp' },
            { path: '/automations', label: 'Automations', icon: 'Zap' },
        ],
    },
]

// Flatten for mobile
const allNavItems = navSections.flatMap((s) => s.items)

const bottomItems = [
    { path: '/settings', label: 'Settings', icon: 'Settings' },
]

export function Sidebar() {
    const collapsed = useUIStore((s) => s.sidebarCollapsed)
    const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)
    const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
    const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
    const location = useLocation()
    const { profile } = useAuth()

    const isActive = (path: string) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

    // Nav item renderer
    const renderNavItem = (item: typeof allNavItems[0], isMobile = false) => {
        const Icon = iconMap[item.icon]!
        const active = isActive(item.path)

        return (
            <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
                    active
                        ? 'text-white'
                        : 'text-[#8b8fa3] hover:text-[#c8cad3] hover:bg-white/[0.03]'
                )}
            >
                {/* Emerald active indicator — left bar with glow */}
                {active && (
                    <motion.div
                        layoutId={isMobile ? 'mobile-active' : 'sidebar-active'}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                        style={{
                            background: 'linear-gradient(180deg, #34d399, #10b981)',
                            boxShadow: '0 0 12px rgba(16, 185, 129, 0.4), 0 0 4px rgba(16, 185, 129, 0.3)',
                        }}
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                )}

                {/* Active background */}
                {active && (
                    <motion.div
                        layoutId={isMobile ? 'mobile-active-bg' : 'sidebar-active-bg'}
                        className="absolute inset-0 rounded-lg bg-white/[0.06]"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                )}

                <Icon
                    className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-colors duration-200 relative z-10',
                        active ? 'text-emerald-400' : 'text-[#6b7084] group-hover:text-[#a0a3b1]'
                    )}
                />
                <AnimatePresence>
                    {(isMobile || !collapsed) && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden whitespace-nowrap relative z-10"
                        >
                            {item.label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </NavLink>
        )
    }

    // Shared Logo component
    const Logo = ({ showText = true }: { showText?: boolean }) => (
        <div className="flex items-center gap-3">
            <img
                src="/vendora-logo.svg"
                alt="Vendora"
                className="h-7 w-7 shrink-0"
            />
            {showText && (
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">
                    Vendora
                </span>
            )}
        </div>
    )

    // User profile
    const UserProfile = ({ compact = false }: { compact?: boolean }) => {
        const initials = profile ? getInitials(profile.full_name) : 'AS'
        const name = profile?.full_name ?? 'Alex Sterling'

        return (
            <div className={cn(
                'flex items-center gap-3 rounded-lg transition-colors',
                compact ? 'justify-center p-1' : 'px-2 py-2 hover:bg-white/[0.03]'
            )}>
                <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                    style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    }}
                >
                    {initials}
                </div>
                {!compact && (
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-[#e0e1e6]">
                            {name}
                        </p>
                        <p className="truncate text-[11px] text-[#6b7084]">
                            Admin
                        </p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 72 : 240 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className={cn(
                    'fixed left-0 top-0 z-40 flex h-screen flex-col',
                    'hidden md:flex'
                )}
                style={{
                    background: 'linear-gradient(180deg, #0f1225 0%, #131729 50%, #0f1225 100%)',
                }}
            >
                {/* Logo */}
                <div className="flex h-14 items-center px-5">
                    <AnimatePresence mode="wait">
                        {collapsed ? (
                            <motion.div
                                key="collapsed-logo"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Logo showText={false} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="expanded-logo"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Logo />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Gradient divider */}
                <div className="mx-4 h-px" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.2) 50%, transparent 100%)',
                }} />

                {/* Nav Sections */}
                <nav className="flex-1 overflow-y-auto px-3 pt-5 space-y-5">
                    {navSections.map((section) => (
                        <div key={section.label}>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a4e64]"
                                    >
                                        {section.label}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            <div className="space-y-0.5">
                                {section.items.map((item) => renderNavItem(item))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="px-3 pb-3 space-y-1">
                    {/* Subtle divider */}
                    <div className="mx-1 mb-2 h-px bg-white/[0.04]" />

                    {/* Settings */}
                    {bottomItems.map((item) => renderNavItem(item))}

                    {/* User Profile */}
                    <AnimatePresence mode="wait">
                        {collapsed ? (
                            <motion.div
                                key="collapsed-user"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <UserProfile compact />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="expanded-user"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <UserProfile />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setSidebarCollapsed(!collapsed)}
                        className="flex w-full items-center justify-center rounded-lg py-1.5 text-[#4a4e64] transition-colors hover:bg-white/[0.03] hover:text-[#8b8fa3]"
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
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col shadow-2xl md:hidden"
                            style={{
                                background: 'linear-gradient(180deg, #0f1225 0%, #131729 50%, #0f1225 100%)',
                            }}
                        >
                            {/* Logo + Close */}
                            <div className="flex h-14 items-center justify-between px-5">
                                <Logo />
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-lg p-1.5 text-[#6b7084] hover:bg-white/[0.05] hover:text-[#8b8fa3] transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Gradient divider */}
                            <div className="mx-4 h-px" style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.2) 50%, transparent 100%)',
                            }} />

                            {/* Nav Sections */}
                            <nav className="flex-1 overflow-y-auto px-3 pt-5 space-y-5">
                                {navSections.map((section) => (
                                    <div key={section.label}>
                                        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a4e64]">
                                            {section.label}
                                        </p>
                                        <div className="space-y-0.5">
                                            {section.items.map((item) => renderNavItem(item, true))}
                                        </div>
                                    </div>
                                ))}
                            </nav>

                            {/* Bottom */}
                            <div className="px-3 py-3 space-y-1">
                                <div className="mx-1 mb-2 h-px bg-white/[0.04]" />
                                {bottomItems.map((item) => renderNavItem(item, true))}
                                <UserProfile />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
