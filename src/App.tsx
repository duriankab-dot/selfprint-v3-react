import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { EnvironmentProvider } from './context/EnvironmentContext'; // §46
import { PendingOnboardingSaver } from './components/PendingOnboardingSaver';
import { TwinEvolution } from './components/twin/TwinEvolution';
import ContextualPopup from './components/ContextualPopup';
import TwinEvolutionSceneWrapper from './components/TwinEvolutionSceneWrapper';
import './styles/global.css';
import './App.css';

// Phase 5.9: code splitting — เดิม import ทุกหน้าแบบ static ทำให้ bundle
// เดียวใหญ่เกิน 500kB (918kB) ตอนนี้แยกแต่ละหน้าเป็น chunk ของตัวเอง โหลด
// เฉพาะตอนเข้า route นั้นจริง (React.lazy + Suspense — มีอยู่แล้วใน React,
// ไม่ได้ลาก lib ใหม่เข้ามา)
const LandingPage = lazy(() => import('./pages/LandingPage')); // NEW: Phase 3.2
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Chat = lazy(() => import('./pages/Chat'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage')); // Phase 4
const PrivacyCenter = lazy(() => import('./pages/PrivacyCenter')); // Phase 6
const Share = lazy(() => import('./pages/Share'));
const FeatureMenu = lazy(() => import('./pages/FeatureMenu'));
const ComponentShowcase = lazy(() => import('./pages/ComponentShowcase'));
const DailyBriefPage = lazy(() => import('./pages/DailyBriefPage')); // §25
const BadgePage = lazy(() => import('./pages/BadgePage'));            // §29-30
const PricingPage = lazy(() => import('./pages/PricingPage'));         // §31
const PricingSuccessPage = lazy(
  () => import('./pages/PricingPage').then((m) => ({ default: m.PricingSuccessPage }))
); // §31 success
const LoginPage = lazy(() => import('./pages/Login')); // §34 Passkey + OAuth + Magic Link
const PasskeySettings = lazy(() => import('./pages/PasskeySettings')); // §34 Passkey Management

// Phase 2 Testing
import('./PHASE2_TEST_CONSOLE').then(module => {
  (window as any).PHASE2_TESTS = module;
  console.log('✅ Phase 2 Tests Ready: window.PHASE2_TESTS.runAll()');
});

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PendingOnboardingSaver />
        <EmotionProvider>
          <HubProvider>
            <TwinProvider>
              {/* §31 Subscription & Monetization */}
              <SubscriptionProvider>
                {/* §16 Experience Engine — must be inside Auth+Hub+Emotion providers */}
                <ExperienceProvider>
                {/* §23 Adaptive Background Music — must be inside Hub+Emotion providers */}
                <AudioProvider>
                  {/* §46 Advanced Adaptive Environments — inside Audio+Hub+Emotion */}
                  <EnvironmentProvider>
                  {/* §30 Evolution tracking (reflection count, unlocks) */}
                  <EvolutionProvider>
                    {/* §28 Contextual Popup — must be inside all context providers */}
                    <PopupProvider>
                      {/* §30 Twin Evolution overlay — global, above all routes */}
                      <TwinEvolution />
                      {/* §28 Popup renderer */}
                      <ContextualPopup />
                      {/* §30 Twin Evolution Scene (30 reflections celebration) */}
                      <TwinEvolutionSceneWrapper />
              <Router>
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<LandingPage onStartOnboarding={() => window.location.href = '/onboarding'} />} /> {/* Phase 3.2: New Landing */}
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analysis" element={<AnalysisPage />} /> {/* Phase 4: Full Personal Analysis */}
                    <Route path="/privacy" element={<PrivacyCenter />} /> {/* Phase 6: PDPA Privacy Center */}
                    <Route path="/share/:code" element={<Share />} />
                    <Route path="/brief" element={<DailyBriefPage />} />             {/* §25 */}
                    <Route path="/badges" element={<BadgePage />} />                  {/* §29-30 */}
                    <Route path="/pricing" element={<PricingPage />} />               {/* §31 */}
                    <Route path="/pricing/success" element={<PricingSuccessPage />} /> {/* §31 */}
                    <Route path="/login" element={<LoginPage />} />              {/* §34 */}
                    <Route path="/settings/passkeys" element={<PasskeySettings />} /> {/* §34 */}
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