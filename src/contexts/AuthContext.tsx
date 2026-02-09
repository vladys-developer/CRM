import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/database'

interface AuthState {
    user: User | null
    profile: UserProfile | null
    session: Session | null
    loading: boolean
    error: string | null
    slowConnection: boolean
}

interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<boolean>
    register: (email: string, password: string, fullName: string) => Promise<boolean>
    logout: () => Promise<void>
    clearError: () => void
    isAuthenticated: boolean
}

// Mock profile for development mode
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

const isDev = import.meta.env.DEV

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: isDev ? ({ id: DEV_PROFILE.id, email: DEV_PROFILE.email } as User) : null,
        profile: isDev ? DEV_PROFILE : null,
        session: null,
        loading: isDev ? false : true,
        error: null,
        slowConnection: false,
    })

    // Fetch user profile from user_profiles table
    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                return null
            }
            return data as UserProfile
        } catch {
            console.error('Profile fetch failed')
            return null
        }
    }, [])

    // Initialize auth state (skipped in dev mode)
    useEffect(() => {
        if (isDev) return

        let cancelled = false

        const initAuth = async () => {
            try {
                const sessionPromise = supabase.auth.getSession()
                const timeoutPromise = new Promise<null>((resolve) =>
                    setTimeout(() => resolve(null), 10000)
                )

                const result = await Promise.race([sessionPromise, timeoutPromise])
                if (cancelled) return

                const session = result && 'data' in result ? result.data.session : null

                if (session?.user) {
                    const profile = await fetchProfile(session.user.id)
                    if (cancelled) return
                    setState({
                        user: session.user,
                        profile,
                        session,
                        loading: false,
                        error: null,
                        slowConnection: false,
                    })
                } else {
                    setState({
                        user: null,
                        profile: null,
                        session: null,
                        loading: false,
                        error: null,
                        slowConnection: false,
                    })
                }
            } catch {
                if (cancelled) return
                setState({
                    user: null,
                    profile: null,
                    session: null,
                    loading: false,
                    error: null,
                    slowConnection: false,
                })
            }
        }

        initAuth()

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
                        slowConnection: false,
                    })
                } else if (event === 'SIGNED_OUT') {
                    setState({
                        user: null,
                        profile: null,
                        session: null,
                        loading: false,
                        error: null,
                        slowConnection: false,
                    })
                } else if (event === 'TOKEN_REFRESHED' && session) {
                    setState((prev) => ({ ...prev, session }))
                }
            }
        )

        return () => {
            cancelled = true
            subscription.unsubscribe()
        }
    }, [fetchProfile])

    // Login with retry logic and detailed diagnostics
    const login = useCallback(async (email: string, password: string) => {
        if (isDev) return true

        console.time('Auth:LoginTotal')
        setState((prev) => ({ ...prev, loading: true, error: null, slowConnection: false }))

        const MAX_RETRIES = 1
        const TIMEOUT_MS = 15000 // 15s per attempt
        const SLOW_THRESHOLD_MS = 3000 // Show warning after 3s

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            let slowTimer: NodeJS.Timeout | undefined

            try {
                slowTimer = setTimeout(() => {
                    setState((prev) => ({ ...prev, slowConnection: true }))
                    console.warn('Auth:LoginSlow - Operation taking longer than 3s')
                }, SLOW_THRESHOLD_MS)

                console.time('Auth:SignInAPI')
                const loginPromise = supabase.auth.signInWithPassword({ email, password })
                const timeoutPromise = new Promise<{ error: { message: string } } | null>((resolve) =>
                    setTimeout(() => resolve(null), TIMEOUT_MS)
                )

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await Promise.race([loginPromise, timeoutPromise]) as any
                console.timeEnd('Auth:SignInAPI')

                clearTimeout(slowTimer)

                // Timeout hit — retry
                if (result === null) {
                    console.error(`Auth:Timeout - Attempt ${attempt + 1}/${MAX_RETRIES + 1} timed out after ${TIMEOUT_MS}ms`)
                    if (attempt < MAX_RETRIES) {
                        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
                        continue
                    }
                    setState((prev) => ({
                        ...prev,
                        loading: false,
                        slowConnection: false,
                        error: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
                    }))
                    console.timeEnd('Auth:LoginTotal')
                    return false
                }

                const error = result?.error
                if (error) {
                    console.error('Auth:Error', error)
                    setState((prev) => ({
                        ...prev,
                        loading: false,
                        slowConnection: false,
                        error: error.message === 'Invalid login credentials'
                            ? 'Credenciales incorrectas.'
                            : error.message,
                    }))
                    console.timeEnd('Auth:LoginTotal')
                    return false
                }

                // Success
                console.log('Auth:Success - Login credentials accepted')
                // Keep loading true until onAuthStateChange fires
                setState((prev) => ({ ...prev, slowConnection: false }))
                console.timeEnd('Auth:LoginTotal')
                return true
            } catch (err) {
                console.error('Auth:Exception', err)
                if (slowTimer) clearTimeout(slowTimer)

                if (attempt < MAX_RETRIES) {
                    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
                    continue
                }
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    slowConnection: false,
                    error: 'Error de conexión. Verifica tu red e inténtalo de nuevo.',
                }))
                console.timeEnd('Auth:LoginTotal')
                return false
            }
        }

        return false
    }, [])

    // Register
    const register = useCallback(async (email: string, password: string, fullName: string) => {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName } },
        })
        if (error) {
            setState((prev) => ({ ...prev, loading: false, error: error.message }))
            return false
        }
        if (data.user) {
            await supabase.from('user_profiles').insert({
                id: data.user.id, email, full_name: fullName, role: 'admin',
            } as any)
        }
        return true
    }, [])

    // Logout
    const logout = useCallback(async () => {
        if (isDev) return
        await supabase.auth.signOut()
    }, [])

    // Clear error
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }))
    }, [])

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

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
