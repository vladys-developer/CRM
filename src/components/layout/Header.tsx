import { Search, Bell, LogOut, User, Menu, Plus, UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUIStore } from '@/stores/uiStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const breadcrumbMap: Record<string, { parent?: string; label: string }> = {
    '/': { label: 'Insights' },
    '/contacts': { parent: 'DIRECTORY', label: 'ALL CONTACTS' },
    '/companies': { parent: 'DIRECTORY', label: 'COMPANIES' },
    '/opportunities': { parent: 'SALES', label: 'OPPORTUNITIES' },
    '/pipeline': { parent: 'SALES', label: 'PIPELINES' },
    '/activities': { parent: 'WORKSPACE', label: 'ACTIVITIES' },
    '/inbox': { parent: 'FINANCE', label: 'INVOICING' },
    '/calendar': { parent: 'WORKSPACE', label: 'CALENDAR' },
    '/reports': { parent: 'WORKSPACE', label: 'PERFORMANCE' },
    '/automations': { parent: 'WORKSPACE', label: 'AUTOMATIONS' },
    '/settings': { parent: 'SYSTEM', label: 'SETTINGS' },
}

export function Header() {
    const { profile, logout } = useAuth()
    const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const location = useLocation()
    const navigate = useNavigate()

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Get breadcrumb for current route
    const basePath = '/' + (location.pathname.split('/')[1] ?? '')
    const crumb = breadcrumbMap[basePath] ?? { label: 'PAGE' }

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-100 bg-white px-5 md:px-6">
            {/* Mobile Menu Toggle */}
            <button
                onClick={toggleMobileMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 md:hidden"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider">
                {crumb.parent && (
                    <>
                        <span className="text-emerald-600">{crumb.parent}</span>
                        <span className="text-gray-300">›</span>
                    </>
                )}
                <span className="text-emerald-600">{crumb.label}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="hidden md:flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search accounts or values..."
                        className="h-9 w-64 rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:w-80"
                    />
                </div>

                {/* Filter button */}
                <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* LIVE indicator */}
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    <span className="text-[11px] font-semibold text-emerald-700 tracking-wide">LIVE</span>
                </div>

                {/* Notifications */}
                <button
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                    aria-label="Notificaciones"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                {/* New Contact Button */}
                <button
                    onClick={() => navigate('/contacts')}
                    className="hidden md:inline-flex items-center gap-2 rounded-xl bg-[#1a1f36] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition-all hover:bg-[#252b45] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                    <UserPlus className="h-4 w-4" />
                    New Contact
                </button>

                {/* User Menu (mobile fallback) */}
                <div className="relative md:hidden" ref={menuRef}>
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-700"
                    >
                        {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
                    </button>

                    {userMenuOpen && (
                        <div className="absolute right-0 top-12 w-56 rounded-xl border border-gray-100 bg-white p-1 shadow-xl">
                            <div className="border-b border-gray-100 px-3 py-2">
                                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                                <p className="text-xs text-gray-500">{profile?.email}</p>
                            </div>
                            <button
                                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                            >
                                <User className="h-4 w-4" />
                                Mi Perfil
                            </button>
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
