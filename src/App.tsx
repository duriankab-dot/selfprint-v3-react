import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { validateWorldPersonalities } from './constants/worldPersonalities';
import { AuthContext } from './context/AuthContext';
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

/**
 * HomeRoute — LandingPage for guest, redirect to /dashboard if logged in
 */
function HomeRoute({ onStartOnboarding }: { onStartOnboarding: () => void }) {
  const auth = useContext(AuthContext);
  if (auth?.loading) return null;
  if (auth?.session) return <Navigate to="/dashboard" replace />;
  return <LandingPage onStartOnboarding={onStartOnboarding} />;
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
                            <Suspense fallback={null}>
                              <Routes>
                                <Route path="/" element={<HomeRoute onStartOnboarding={() => window.location.href = '/onboarding'} />} />
                                <Route path="/onboarding" element={<Onboarding />} />
                                <Route path="/core-awakening" element={<CoreAwakening />} />
                                <Route path="/chat" element={<Navigate to="/chat/nova" replace />} />
                                <Route path="/chat/nova" element={<NovaChat />} />
                                <Route path="/chat/twin" element={<TwinChat />} />
                                <Route path="/twin" element={<Navigate to="/chat/twin" replace />} />
                                <Route path="/twin/settings" element={<ProtectedRoute><TwinSettingsPage /></ProtectedRoute>} />
                                <Route path="/twin/personality" element={<ProtectedRoute><TwinPersonalityPage /></ProtectedRoute>} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/analysis" element={<AnalysisPage />} />
                                <Route path="/privacy" element={<PrivacyCenter />} />
                                <Route path="/share/:code" element={<Share />} />
                                <Route path="/brief" element={<DailyBriefPage />} />
                                <Route path="/badges" element={<BadgePage />} />
                                <Route path="/pricing" element={<PricingPage />} />
                                <Route path="/pricing/success" element={<PricingSuccessPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/settings/passkeys" element={<PasskeySettings />} />
                                <Route path="/explore" element={<ExplorePage />} />
                                <Route path="/activities" element={<ActivitiesPage />} />
                                <Route path="/me" element={<MePage />} />
                                <Route path="/voice" element={<VoiceChatPage />} />
                                <Route path="/twin-profile" element={<TwinProfilePage />} />
                                <Route path="/life-hubs" element={<LifeHubsPage />} />
                                <Route path="/decisions" element={<DecisionDashboard />} />
                                <Route path="/decision-log" element={<DecisionLoggerPage />} />
                                <Route path="/worlds" element={<ProtectedRoute><WorldsHub /></ProtectedRoute>} />
                                <Route path="/faq" element={<FAQPage />} />
                                <Route path="/menu" element={<FeatureMenu />} />
                                <Route path="/components" element={<ComponentShowcase />} />
                              </Routes>
                            </Suspense>
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
  );
}

export default App;