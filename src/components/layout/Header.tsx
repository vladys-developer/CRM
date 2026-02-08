import { Search, Bell, Moon, Sun, LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { getInitials } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

export function Header() {
    const { profile, logout } = useAuth()
    const theme = useUIStore((s) => s.theme)
    const setTheme = useUIStore((s) => s.setTheme)
    const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

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

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
            {/* Mobile Menu Toggle */}
            <button
                onClick={toggleMobileMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent md:hidden"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="flex flex-1 items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar contactos, empresas, oportunidades..."
                        className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary/30"
                    />
                    <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label="Cambiar tema"
                >
                    {theme === 'dark' ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </button>

                {/* Notifications */}
                <button
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label="Notificaciones"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                </button>

                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex h-9 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-accent"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {profile ? getInitials(profile.full_name) : '?'}
                        </div>
                        <span className="hidden text-sm font-medium md:inline-block">
                            {profile?.full_name ?? 'Usuario'}
                        </span>
                    </button>

                    {userMenuOpen && (
                        <div className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-popover p-1 shadow-lg">
                            <div className="border-b border-border px-3 py-2">
                                <p className="text-sm font-medium">{profile?.full_name}</p>
                                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                            </div>
                            <button
                                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <User className="h-4 w-4" />
                                Mi Perfil
                            </button>
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
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
