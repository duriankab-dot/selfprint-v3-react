import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initializeSentry, initializeWebVitals } from './services/monitoring'
import './styles/global.css'
import App from './App.tsx'

// Initialize Sentry for error tracking (must be before React renders)
initializeSentry()
initializeWebVitals()

/**
 * React Query client — shared across entire app
 * Intelligence components (IntelligencePanel, ExecutiveSummary, AnalysisPage)
 * all share the same query cache via these keys:
 *   'personalContext' | 'behavioralPatterns' | 'accuracyMetrics'
 * No duplicate Supabase fetches when multiple components mount simultaneously.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,   // 30s — avoid refetch on every focus
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// ============================================================================
// PWA: Service Worker Registration — Master Direction §35
// ============================================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Listen for SW updates — notify user to reload
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New SW ready — the SW itself will postMessage SW_UPDATED
              // App can listen to navigator.serviceWorker messages to show a
              // "New version available — reload" banner (see usePWAUpdate hook)
            }
          })
        })
      })
      .catch(() => {
        // Non-fatal — app still works without SW
      })

    // Forward SW messages to app (SW_UPDATED, SYNC_JOURNAL, etc.)
    navigator.serviceWorker.addEventListener('message', (event) => {
      window.dispatchEvent(new CustomEvent('sw-message', { detail: event.data }))
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
