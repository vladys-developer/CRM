import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { MainLayout } from '@/components/layout/MainLayout'
import { PrivateRoute } from '@/components/layout/PrivateRoute'
import { LoginPage } from '@/pages/LoginPage'

// Lazy-loaded pages
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
const ContactsPage = lazy(() =>
  import('@/pages/ContactsPage').then((m) => ({ default: m.ContactsPage }))
)
const ContactDetailPage = lazy(() =>
  import('@/pages/ContactDetailPage').then((m) => ({ default: m.ContactDetailPage }))
)
const CompaniesPage = lazy(() =>
  import('@/pages/CompaniesPage').then((m) => ({ default: m.CompaniesPage }))
)
const CompanyDetailPage = lazy(() =>
  import('@/pages/CompanyDetailPage').then((m) => ({ default: m.CompanyDetailPage }))
)
const OpportunitiesPage = lazy(() =>
  import('@/pages/OpportunitiesPage').then((m) => ({ default: m.OpportunitiesPage }))
)
const PipelinePage = lazy(() =>
  import('@/pages/PipelinePage').then((m) => ({ default: m.PipelinePage }))
)
const ActivitiesPage = lazy(() =>
  import('@/pages/ActivitiesPage').then((m) => ({ default: m.ActivitiesPage }))
)
const ReportsPage = lazy(() =>
  import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage }))
)
const CalendarPage = lazy(() =>
  import('@/pages/CalendarPage').then((m) => ({ default: m.CalendarPage }))
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
)
const InboxPage = lazy(() =>
  import('@/pages/InboxPage').then((m) => ({ default: m.InboxPage }))
)
const AutomationsPage = lazy(() =>
  import('@/pages/AutomationsPage').then((m) => ({ default: m.AutomationsPage }))
)
const AutomationBuilderPage = lazy(() =>
  import('@/pages/AutomationBuilderPage').then((m) => ({ default: m.AutomationBuilderPage }))
)

// Loading fallback
function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="contacts"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ContactsPage />
                  </Suspense>
                }
              />
              <Route
                path="contacts/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ContactDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="companies"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CompaniesPage />
                  </Suspense>
                }
              />
              <Route
                path="companies/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CompanyDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="opportunities"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <OpportunitiesPage />
                  </Suspense>
                }
              />
              <Route
                path="pipeline"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PipelinePage />
                  </Suspense>
                }
              />
              <Route
                path="activities"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ActivitiesPage />
                  </Suspense>
                }
              />
              <Route path="inbox" element={
                <Suspense fallback={<PageLoader />}>
                  <InboxPage />
                </Suspense>
              } />
              <Route path="calendar" element={
                <Suspense fallback={<PageLoader />}>
                  <CalendarPage />
                </Suspense>
              } />
              <Route path="reports" element={
                <Suspense fallback={<PageLoader />}>
                  <ReportsPage />
                </Suspense>
              } />
              <Route path="automations" element={
                <Suspense fallback={<PageLoader />}>
                  <AutomationsPage />
                </Suspense>
              } />
              <Route path="automations/new" element={
                <Suspense fallback={<PageLoader />}>
                  <AutomationBuilderPage />
                </Suspense>
              } />
              <Route path="automations/:id/edit" element={
                <Suspense fallback={<PageLoader />}>
                  <AutomationBuilderPage />
                </Suspense>
              } />
              <Route path="settings" element={
                <Suspense fallback={<PageLoader />}>
                  <SettingsPage />
                </Suspense>
              } />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
