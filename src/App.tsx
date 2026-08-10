import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EmotionProvider } from './context/EmotionContext';
import { HubProvider } from './context/HubContext';
import { TwinProvider } from './context/TwinContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ExperienceProvider } from './context/ExperienceContext';
import { AudioProvider } from './context/AudioContext';
import { PendingOnboardingSaver } from './components/PendingOnboardingSaver';
import { TwinEvolution } from './components/twin/TwinEvolution';
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
              {/* §16 Experience Engine — must be inside Auth+Hub+Emotion providers */}
              <ExperienceProvider>
                {/* §23 Adaptive Background Music — must be inside Hub+Emotion providers */}
                <AudioProvider>
              {/* §30 Twin Evolution overlay — global, above all routes */}
              <TwinEvolution />
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
                    <Route path="/brief" element={<DailyBriefPage />} />   {/* §25 */}
                    <Route path="/badges" element={<BadgePage />} />        {/* §29-30 */}
                    <Route path="/menu" element={<FeatureMenu />} />
                    <Route path="/components" element={<ComponentShowcase />} />
                  </Routes>
                </Suspense>
              </Router>
                </AudioProvider>
              </ExperienceProvider>
            </TwinProvider>
          </HubProvider>
        </EmotionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;