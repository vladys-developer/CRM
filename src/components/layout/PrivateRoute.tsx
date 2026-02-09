import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface PrivateRouteProps {
    children: React.ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
    // In development, bypass auth (Supabase auth API may not be reachable)
    if (import.meta.env.DEV) {
        return <>{children}</>
    }

    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Cargando Vendora...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
