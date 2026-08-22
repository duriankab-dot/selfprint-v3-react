/**
 * src/components/twin/TwinNav.tsx
 * Navigation bar for Twin section (P0 #7.1)
 * Tabs: Chat | Personality | Settings
 */

import { useLocation } from 'react-router-dom';
import { useLangNavigate as useNavigate } from '../../hooks/useLangNavigate';
import { useAuth } from '../../context/AuthContext';
import { useTwin } from '../../context/TwinContext';
import '../../styles/twin-nav.css';

interface TwinNavProps {
  currentTab?: 'chat' | 'personality' | 'settings';
  onTabChange?: (tab: 'chat' | 'personality' | 'settings') => void;
}

const TWIN_TABS = [
  { id: 'chat', label: 'Chat', icon: '💬', path: '/chat/twin' },
  { id: 'personality', label: 'Personality', icon: '✨', path: '/twin/personality' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/twin/settings' },
] as const;

export function TwinNav({ currentTab, onTabChange }: TwinNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const { twin } = useTwin();

  // Detect current tab from location
  const detectTabFromPath = (): 'chat' | 'personality' | 'settings' => {
    if (location.pathname === '/twin/personality') return 'personality';
    if (location.pathname === '/twin/settings') return 'settings';
    return 'chat';
  };

  const activeTab = currentTab || detectTabFromPath();

  const handleTabClick = (tab: typeof TWIN_TABS[number]) => {
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
        <div className="twin-nav-header">
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
              <span className="status-badge">{twin.name || 'Your Twin'}</span>
              {twin.updatedAt && (
                <span className="status-time">
                  Updated: {new Date(twin.updatedAt).toLocaleDateString()}
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
