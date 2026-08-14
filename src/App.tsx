import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { EmotionProvider } from './context/EmotionContext';
import { HubProvider } from './context/HubContext';
import { TwinProvider } from './context/TwinContext';
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
const TwinChat = lazy(() => import('./pages/TwinChat'));
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
const DecisionLoggerPage = lazy(() => import('./pages/DecisionLoggerPage'));

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
  return (
    <ThemeProvider>
      <AuthProvider>
        <PendingOnboardingSaver />
        <EmotionProvider>
          <HubProvider>
            <TwinProvider>
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
                                <Route path="/chat" element={<Navigate to="/twin" replace />} />
                                <Route path="/twin" element={<TwinChat />} />
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
                                <Route path="/decisions" element={<DecisionLoggerPage />} />
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
            </TwinProvider>
          </HubProvider>
        </EmotionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;