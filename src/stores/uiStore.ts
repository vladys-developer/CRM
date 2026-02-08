import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
    sidebarOpen: boolean
    sidebarCollapsed: boolean
    theme: 'light' | 'dark' | 'system'
    globalSearchOpen: boolean
    globalSearchQuery: string

    // Actions
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    setSidebarCollapsed: (collapsed: boolean) => void
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    toggleGlobalSearch: () => void
    setGlobalSearchQuery: (query: string) => void

    // Mobile Menu
    mobileMenuOpen: boolean
    toggleMobileMenu: () => void
    setMobileMenuOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            sidebarCollapsed: false,
            theme: 'light',
            globalSearchOpen: false,
            globalSearchQuery: '',

            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            setTheme: (theme) => set({ theme }),
            toggleGlobalSearch: () => set((state) => ({ globalSearchOpen: !state.globalSearchOpen })),
            setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

            // Mobile Menu
            mobileMenuOpen: false,
            toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
            setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
        }),
        {
            name: 'vendora-ui-store',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                theme: state.theme,
            }),
        }
    )
)
