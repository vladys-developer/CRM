import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/database'

// ─── Types ───────────────────────────────────────────────
interface AuthState {
    user: User | null
    profile: UserProfile | null
    session: Session | null
    loading: boolean
    error: string | null
}

interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<boolean>
    register: (email: string, password: string, fullName: string) => Promise<boolean>
    logout: () => Promise<void>
    clearError: () => void
    isAuthenticated: boolean
}

// ─── Dev Mode Mock ───────────────────────────────────────
const isDev = import.meta.env.DEV

const DEV_PROFILE: UserProfile = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'dev@vendora.local',
    full_name: 'Dev User',
    role: 'admin',
    avatar_url: null,
    team_id: null,
    phone: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
} as UserProfile

// ─── Context ─────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: isDev ? ({ id: DEV_PROFILE.id, email: DEV_PROFILE.email } as User) : null,
        profile: isDev ? DEV_PROFILE : null,
        session: null,
        loading: !isDev, // Start loading only in production
        error: null,
    })

    // ── Fetch profile ────────────────────────────────────
    const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('[Auth] Profile fetch error:', error.message)
                return null
            }
            return data as UserProfile
        } catch (err) {
            console.error('[Auth] Profile fetch exception:', err)
            return null
        }
    }, [])

    // ── Initialize: check existing session on mount ──────
    useEffect(() => {
        if (isDev) return

        let cancelled = false

        const initSession = async () => {
            try {
                // Add validation for Supabase URL/Key to prevent silent failures
                if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
                    throw new Error('Missing Supabase credentials')
                }

                // Race between getSession and a timeout
                const sessionPromise = supabase.auth.getSession()
                const timeoutPromise = new Promise<{ data: { session: null }, error: { message: string } }>((resolve) => {
                    setTimeout(() => resolve({ data: { session: null }, error: { message: 'Auth initialization timed out' } }), 5000)
                })

                const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])

                if (cancelled) return

                if (error) {
                    console.warn('[Auth] Session init warning:', error.message)
                    // If timeout or error, just finish loading (user can try to login manually)
                    setState(prev => ({ ...prev, loading: false }))
                    return
                }

                if (session?.user) {
                    // If we have a session, try to fetch profile (also with timeout)
                    const profilePromise = fetchProfile(session.user.id)
                    const profileTimeout = new Promise<UserProfile | null>(r => setTimeout(() => r(null), 3000))

                    const profile = await Promise.race([profilePromise, profileTimeout])

                    if (cancelled) return
                    setState({
                        user: session.user,
                        profile,
                        session,
                        loading: false,
                        error: null,
                    })
                } else {
                    setState(prev => ({ ...prev, loading: false }))
                }
            } catch (err) {
                console.error('[Auth] Init exception:', err)
                if (!cancelled) {
                    setState(prev => ({ ...prev, loading: false }))
                }
            }
        }

        initSession()

        // Listen for auth state changes (sign-in from another tab, token refresh, sign-out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (cancelled) return

                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await fetchProfile(session.user.id)
                    if (cancelled) return
                    setState({
                        user: session.user,
                        profile,
                        session,
                        loading: false,
                        error: null,
                    })
                } else if (event === 'SIGNED_OUT') {
                    setState({
                        user: null,
                        profile: null,
                        session: null,
                        loading: false,
                        error: null,
                    })
                } else if (event === 'TOKEN_REFRESHED' && session) {
                    setState(prev => ({ ...prev, session }))
                }
            }
        )

        return () => {
            cancelled = true
            subscription.unsubscribe()
        }
    }, [fetchProfile])

    // ── Login ────────────────────────────────────────────
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        if (isDev) return true

        setState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                const msg = error.message === 'Invalid login credentials'
                    ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
                    : error.message
                setState(prev => ({ ...prev, loading: false, error: msg }))
                return false
            }

            if (data.user) {
                // Auth succeeded — fetch profile immediately
                const profile = await fetchProfile(data.user.id)
                setState({
                    user: data.user,
                    profile,
                    session: data.session,
                    loading: false,
                    error: null,
                })
                return true
            }

            setState(prev => ({ ...prev, loading: false }))
            return false
        } catch (err) {
            console.error('[Auth] Login exception:', err)
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Error de conexión. Verifica tu red e inténtalo de nuevo.',
            }))
            return false
        }
    }, [fetchProfile])

    // ── Register ─────────────────────────────────────────
    const register = useCallback(async (email: string, password: string, fullName: string): Promise<boolean> => {
        if (isDev) return true

        setState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } },
            })

            if (error) {
                setState(prev => ({ ...prev, loading: false, error: error.message }))
                return false
            }

            if (data.user) {
                // Create profile row
                await supabase.from('user_profiles').insert({
                    id: data.user.id,
                    email,
                    full_name: fullName,
                    role: 'admin',
                } as any)
            }

            setState(prev => ({ ...prev, loading: false }))
            return true
        } catch (err) {
            console.error('[Auth] Register exception:', err)
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Error al registrarse. Inténtalo de nuevo.',
            }))
            return false
        }
    }, [])

    // ── Logout ───────────────────────────────────────────
    const logout = useCallback(async () => {
        if (isDev) return
        await supabase.auth.signOut()
        // onAuthStateChange will handle state cleanup
    }, [])

    // ── Clear error ──────────────────────────────────────
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }))
    }, [])

    // ── Context value ────────────────────────────────────
    const value: AuthContextValue = {
        ...state,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: isDev ? true : !!state.user,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
