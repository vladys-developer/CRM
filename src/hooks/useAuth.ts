import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/database'

interface AuthState {
    user: User | null
    profile: UserProfile | null
    session: Session | null
    loading: boolean
    error: string | null
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        session: null,
        loading: true,
        error: null,
    })

    // Fetch user profile from user_profiles table
    const fetchProfile = useCallback(async (userId: string) => {
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
    }, [])

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Add timeout to prevent infinite hang if Supabase is unreachable
                const sessionPromise = supabase.auth.getSession()
                const timeoutPromise = new Promise<null>((resolve) =>
                    setTimeout(() => resolve(null), 5000)
                )

                const result = await Promise.race([sessionPromise, timeoutPromise])
                const session = result && 'data' in result ? result.data.session : null

                if (session?.user) {
                    const profile = await fetchProfile(session.user.id)
                    setState({
                        user: session.user,
                        profile,
                        session,
                        loading: false,
                        error: null,
                    })
                } else {
                    setState({
                        user: null,
                        profile: null,
                        session: null,
                        loading: false,
                        error: null,
                    })
                }
            } catch (err) {
                console.error('Auth init error:', err)
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : 'Error desconocido',
                }))
            }
        }

        initAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await fetchProfile(session.user.id)
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
                    setState((prev) => ({
                        ...prev,
                        session,
                    }))
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchProfile])

    // Login with email/password
    const login = useCallback(async (email: string, password: string) => {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        try {
            // Timeout after 10 seconds
            const loginPromise = supabase.auth.signInWithPassword({ email, password })
            const timeoutPromise = new Promise<{ error: { message: string } }>((resolve) =>
                setTimeout(() => resolve({ error: { message: 'Timeout: Supabase no responde. Inténtalo de nuevo.' } }), 10000)
            )

            const result = await Promise.race([loginPromise, timeoutPromise]) as any
            const error = result?.error

            if (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error.message,
                }))
                return false
            }

            // Login succeeded — the onAuthStateChange listener will update the full state
            setState((prev) => ({ ...prev, loading: false }))
            return true
        } catch (err) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : 'Error desconocido',
            }))
            return false
        }
    }, [])

    // Register with email/password
    const register = useCallback(async (
        email: string,
        password: string,
        fullName: string
    ) => {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        })

        if (error) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: error.message,
            }))
            return false
        }

        // Create user profile
        if (data.user) {
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: data.user.id,
                    email,
                    full_name: fullName,
                    role: 'admin',
                })

            if (profileError) {
                console.error('Error creating profile:', profileError)
            }
        }

        return true
    }, [])

    // Logout
    const logout = useCallback(async () => {
        await supabase.auth.signOut()
    }, [])

    // Clear error
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }))
    }, [])

    return {
        ...state,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: !!state.user,
    }
}
