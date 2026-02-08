import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function MainLayout() {
    const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

    return (
        <div className="flex min-h-screen bg-mesh text-foreground">
            <Sidebar />

            <div
                className={cn(
                    'flex h-screen flex-1 flex-col transition-all duration-300 ease-in-out',
                    sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]',
                )}
            >
                <Header />

                <main className="flex-1 overflow-y-auto p-6 bg-white/60">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
