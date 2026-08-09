import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EmotionProvider } from './context/EmotionContext';
import { HubProvider } from './context/HubContext';
import { TwinProvider } from './context/TwinContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PendingOnboardingSaver } from './components/PendingOnboardingSaver';
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
const Share = lazy(() => import('./pages/Share'));
const FeatureMenu = lazy(() => import('./pages/FeatureMenu'));
const ComponentShowcase = lazy(() => import('./pages/ComponentShowcase'));

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
              <Router>
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<LandingPage onStartOnboarding={() => window.location.href = '/onboarding'} />} /> {/* Phase 3.2: New Landing */}
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/share/:code" element={<Share />} />
                    <Route path="/menu" element={<FeatureMenu />} />
                    <Route path="/components" element={<ComponentShowcase />} />
                  </Routes>
                </Suspense>
              </Router>
            </TwinProvider>
          </HubProvider>
        </EmotionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;