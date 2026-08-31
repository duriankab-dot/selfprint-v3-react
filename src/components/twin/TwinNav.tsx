/**
 * src/components/twin/TwinNav.tsx
 * Sub-nav for the Twin "App Space" (APPSHELL-004 FIX)
 * Tabs: Conversation | What Twin Knows | Personality | Settings
 *
 * APPSHELL-004 FIX: this component existed (P0 #7.1) but was never
 * imported anywhere — TwinChat.tsx, TwinProfilePage.tsx,
 * TwinPersonalityPage.tsx and TwinSettingsPage.tsx were 4 disconnected
 * pages with no way to move between them except a typed URL. Per the
 * app-shell redesign, Twin is one space with 4 sub-destinations sharing
 * this strip; "profile" (accuracy/evolution/insights) is renamed here to
 * "What Twin Knows" to match that spec without touching its route or file.
 */

import { useLocation } from 'react-router-dom';
import { useLangNavigate as useNavigate } from '../../hooks/useLangNavigate';
import { useAuth } from '../../context/AuthContext';
import { useTwin } from '../../context/TwinContext';
import { useLanguage } from '../../context/LanguageContext';
import { BackButton } from '../common/BackButton';
import '../../styles/twin-nav.css';

type TwinTabId = 'chat' | 'knows' | 'personality' | 'settings';

interface TwinNavProps {
  currentTab?: TwinTabId;
  onTabChange?: (tab: TwinTabId) => void;
}

function getTwinTabs(isTh: boolean) {
  return [
    { id: 'chat' as const, label: isTh ? 'บทสนทนา' : 'Conversation', icon: '💬', path: '/chat/twin' },
    { id: 'knows' as const, label: isTh ? 'สิ่งที่ทวินรู้' : 'What Twin Knows', icon: '🧠', path: '/twin-profile' },
    { id: 'personality' as const, label: isTh ? 'บุคลิกภาพ' : 'Personality', icon: '✨', path: '/twin/personality' },
    { id: 'settings' as const, label: isTh ? 'ตั้งค่า' : 'Settings', icon: '⚙️', path: '/twin/settings' },
  ];
}

export function TwinNav({ currentTab, onTabChange }: TwinNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const { twin } = useTwin();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const TWIN_TABS = getTwinTabs(isTh);

  // Detect current tab from location
  const detectTabFromPath = (): TwinTabId => {
    if (location.pathname.endsWith('/twin/personality')) return 'personality';
    if (location.pathname.endsWith('/twin/settings')) return 'settings';
    if (location.pathname.endsWith('/twin-profile')) return 'knows';
    return 'chat';
  };

  const activeTab = currentTab || detectTabFromPath();

  const handleTabClick = (tab: ReturnType<typeof getTwinTabs>[number]) => {
    if (!session?.user?.id) {
      navigate('/login');
      return;
    }
    navigate(tab.path);
    onTabChange?.(tab.id);
  };

  return (
    <nav className="twin-nav">
      <div className="twin-nav-container">
        <div className="twin-nav-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* BACKBUTTON-002 FIX: 'chat' (/chat/twin) is a BottomNav root
              destination ("AI ฝาแฝด") — no back button there, same as
              /dashboard/worlds/explore/me. The other 3 tabs (knows/
              personality/settings) are real sub-pages reached by tapping a
              tab here, so they keep it. */}
          {activeTab !== 'chat' && <BackButton fallbackTo="/dashboard" />}
          <h2 className="twin-nav-title">
            {twin?.maturityScore !== undefined ? `Twin (${Math.floor(twin.maturityScore)}%)` : 'Twin'}
          </h2>
        </div>

        <div className="twin-nav-tabs">
          {TWIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`twin-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="twin-nav-status">
          {twin && (
            <div className="twin-status">
              <span className="status-badge">{twin.name || (isTh ? 'ทวินของคุณ' : 'Your Twin')}</span>
              {twin.updatedAt && (
                <span className="status-time">
                  {isTh ? 'อัปเดต' : 'Updated'}: {new Date(twin.updatedAt).toLocaleDateString(isTh ? 'th-TH' : 'en-US')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default TwinNav;
