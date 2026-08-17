import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useContext } from 'react';
import * as Sentry from '@sentry/react';
import { validateWorldPersonalities } from './constants/worldPersonalities';
import { AuthContext } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AIProvider } from './context/AIContext';
import { EmotionProvider } from './context/EmotionContext';
import { HubProvider } from './context/HubContext';
import { TwinProvider } from './context/TwinContext';
import { WorldProvider } from './context/WorldContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ExperienceProvider } from './context/ExperienceContext';
import { AudioProvider } from './context/AudioContext';
import { PopupProvider } from './context/PopupContext';
import { EvolutionProvider } from './context/EvolutionContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { EnvironmentProvider } from './context/EnvironmentContext';
import { PendingOnboardingSaver } from './components/PendingOnboardingSaver';
import { TwinEvolution } from './components/twin/TwinEvolution';
import ContextualPopup from './components/ContextualPopup';
import TwinEvolutionSceneWrapper from './components/TwinEvolutionSceneWrapper';
import './styles/global.css';
import './styles/nova-twin.css';
import './styles/core-awakening.css';
import './styles/twin-evolution.css';
import './styles/decision-dashboard.css';
import './styles/worlds-hub.css';
import './styles/twin-nav.css';
import './styles/twin-settings.css';
import './styles/twin-personality.css';
import './styles/faq-page.css';
import './styles/faq-accordion.css';
import './App.css';

// Phase 5.9: Code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
// Chat is now redirected to /twin
// const Chat = lazy(() => import('./pages/Chat'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const PrivacyCenter = lazy(() => import('./pages/PrivacyCenter'));
const Share = lazy(() => import('./pages/Share'));
const FeatureMenu = lazy(() => import('./pages/FeatureMenu'));
const CoreAwakening = lazy(() => import('./pages/CoreAwakening'));
const NovaChat = lazy(() => import('./pages/NovaChat'));
const TwinChat = lazy(() => import('./pages/TwinChat'));
const TwinSettingsPage = lazy(() => import('./pages/TwinSettingsPage'));
const TwinPersonalityPage = lazy(() => import('./pages/TwinPersonalityPage'));
const ComponentShowcase = lazy(() => import('./pages/ComponentShowcase'));
const DailyBriefPage = lazy(() => import('./pages/DailyBriefPage'));
const BadgePage = lazy(() => import('./pages/BadgePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PricingSuccessPage = lazy(() => import('./pages/PricingSuccessPage'));
const LoginPage = lazy(() => import('./pages/Login'));
const PasskeySettings = lazy(() => import('./pages/PasskeySettings'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const MePage = lazy(() => import('./pages/MePage'));
const VoiceChatPage = lazy(() => import('./pages/VoiceChatPage'));
const TwinProfilePage = lazy(() => import('./pages/TwinProfilePage'));
const LifeHubsPage = lazy(() => import('./pages/LifeHubsPage'));
const DecisionDashboard = lazy(() => import('./pages/DecisionDashboard'));
const DecisionLoggerPage = lazy(() => import('./pages/DecisionLoggerPage'));
const WorldsHub = lazy(() => import('./pages/WorldsHub'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const MonitoringDashboard = lazy(() => import('./pages/MonitoringDashboard'));

/**
 * HomeRoute — LandingPage for guest, redirect to /dashboard if logged in
 */
function HomeRoute({ onStartOnboarding }: { onStartOnboarding: () => void }) {
  const auth = useContext(AuthContext);
  if (auth?.loading) return null;
  if (auth?.session) return <Navigate to="/dashboard" replace />;
  return <LandingPage onStartOnboarding={onStartOnboarding} />;
}

/**
 * Route list generator: สร้าง /en/* และ /th/* routes
 */
function getLanguagePrefixedRoutes(): React.ReactElement[] {
  // Define all routes with language prefix
  const routes: React.ReactElement[] = [];

  // Home route
  routes.push(
    <Route key="en-home" path="/en/" element={<HomeRoute onStartOnboarding={() => window.location.href = '/en/onboarding'} />} />,
    <Route key="th-home" path="/th/" element={<HomeRoute onStartOnboarding={() => window.location.href = '/th/onboarding'} />} />,
    <Route key="home-redirect" path="/" element={<Navigate to="/en/" replace />} />
  );

  // Public pages (support both /en and /th)
  const publicPages = [
    { path: '/onboarding', element: <Onboarding /> },
    { path: '/core-awakening', element: <CoreAwakening /> },
    { path: '/chat', element: <Navigate to="/chat/nova" replace /> },
    { path: '/chat/nova', element: <NovaChat /> },
    { path: '/chat/twin', element: <TwinChat /> },
    { path: '/twin', element: <Navigate to="/chat/twin" replace /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/analysis', element: <AnalysisPage /> },
    { path: '/privacy', element: <PrivacyCenter /> },
    { path: '/share/:code', element: <Share /> },
    { path: '/brief', element: <DailyBriefPage /> },
    { path: '/badges', element: <BadgePage /> },
    { path: '/pricing', element: <PricingPage /> },
    { path: '/pricing/success', element: <PricingSuccessPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/settings/passkeys', element: <PasskeySettings /> },
    { path: '/explore', element: <ExplorePage /> },
    { path: '/activities', element: <ActivitiesPage /> },
    { path: '/me', element: <MePage /> },
    { path: '/voice', element: <VoiceChatPage /> },
    { path: '/twin-profile', element: <TwinProfilePage /> },
    { path: '/life-hubs', element: <LifeHubsPage /> },
    { path: '/decisions', element: <DecisionDashboard /> },
    { path: '/decision-log', element: <DecisionLoggerPage /> },
    { path: '/faq', element: <FAQPage /> },
    { path: '/menu', element: <FeatureMenu /> },
    { path: '/components', element: <ComponentShowcase /> },
    { path: '/monitoring', element: <ProtectedRoute><MonitoringDashboard /></ProtectedRoute> },
  ];

  // Add all public routes for both languages
  publicPages.forEach((page, idx) => {
    routes.push(
      <Route key={`en-${idx}`} path={`/en${page.path}`} element={page.element} />,
      <Route key={`th-${idx}`} path={`/th${page.path}`} element={page.element} />
    );
  });

  // Protected routes (support both /en and /th)
  routes.push(
    <Route key="en-twin-settings" path="/en/twin/settings" element={<ProtectedRoute><TwinSettingsPage /></ProtectedRoute>} />,
    <Route key="th-twin-settings" path="/th/twin/settings" element={<ProtectedRoute><TwinSettingsPage /></ProtectedRoute>} />,
    <Route key="en-twin-personality" path="/en/twin/personality" element={<ProtectedRoute><TwinPersonalityPage /></ProtectedRoute>} />,
    <Route key="th-twin-personality" path="/th/twin/personality" element={<ProtectedRoute><TwinPersonalityPage /></ProtectedRoute>} />,
    <Route key="en-worlds" path="/en/worlds" element={<ProtectedRoute><WorldsHub /></ProtectedRoute>} />,
    <Route key="th-worlds" path="/th/worlds" element={<ProtectedRoute><WorldsHub /></ProtectedRoute>} />
  );

  return routes;
}

function App() {
  // Validate world personalities on app startup
  useEffect(() => {
    const { isValid, missingWorlds } = validateWorldPersonalities();
    if (!isValid) {
      console.error('World personality validation failed. Missing worlds:', missingWorlds);
    }
  }, []);

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }: { error: Error | null; resetError: () => void }) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '20px',
          }}
        >
          <h1>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            onClick={resetError}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error && import.meta.env.DEV && (
            <pre
              style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '300px',
                maxWidth: '100%',
              }}
            >
              {error.toString()}
            </pre>
          )}
        </div>
      )}
    >
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <AIProvider>
              <PendingOnboardingSaver />
              <EmotionProvider>
                <HubProvider>
                  <TwinProvider>
                    <WorldProvider>
                      <SubscriptionProvider>
                      <ExperienceProvider>
                        <AudioProvider>
                          <EnvironmentProvider>
                            <EvolutionProvider>
                              <PopupProvider>
                              <TwinEvolution />
                              <ContextualPopup />
                              <TwinEvolutionSceneWrapper />
                              <Router>
                                <LanguageProvider>
                              <Suspense fallback={null}>
                                <Routes>
                                  {getLanguagePrefixedRoutes()}
                                  {/* Catch-all fallback redirects to /en/ */}
                                  <Route path="*" element={<Navigate to="/en/" replace />} />
                                </Routes>
                              </Suspense>
                                </LanguageProvider>
                              </Router>
                            </PopupProvider>
                          </EvolutionProvider>
                        </EnvironmentProvider>
                      </AudioProvider>
                    </ExperienceProvider>
                  </SubscriptionProvider>
                  </WorldProvider>
                </TwinProvider>
              </HubProvider>
            </EmotionProvider>
          </AIProvider>
        </AuthProvider>
      </ThemeProvider>
      </HelmetProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;