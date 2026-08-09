import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EmotionProvider } from './context/EmotionContext';
import { HubProvider } from './context/HubContext';
import { TwinProvider } from './context/TwinContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PendingOnboardingSaver } from './components/PendingOnboardingSaver';
import LandingPage from './pages/LandingPage'; // NEW: Phase 3.2
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Share from './pages/Share';
import FeatureMenu from './pages/FeatureMenu';
import ComponentShowcase from './pages/ComponentShowcase';
import './styles/global.css';
import './App.css';

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
                <Routes>
                  <Route path="/" element={<LandingPage onStartOnboarding={() => window.location.href = '/onboarding'} />} /> {/* Phase 3.2: New Landing */}
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/share/:code" element={<Share />} />
                  <Route path="/menu" element={<FeatureMenu />} />
                  <Route path="/components" element={<ComponentShowcase />} />
                </Routes>
              </Router>
            </TwinProvider>
          </HubProvider>
        </EmotionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;