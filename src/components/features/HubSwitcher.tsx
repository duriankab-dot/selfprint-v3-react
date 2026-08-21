/**
 * HubSwitcher.tsx
 *
 * ให้ผู้ใช้เลือก 1 ใน 12 hubs (รวม Activity hub)
 * เมื่อเปลี่ยน hub → Nova มีตัวตนต่างกัน
 */

import { useHub } from '@/context/HubContext';
import { HUB_OPTIONS } from '@/constants/hubs';

interface HubSwitcherProps {
  className?: string;
}

export const HubSwitcher: React.FC<HubSwitcherProps> = ({ className = '' }) => {
  const { currentHub, switchHub } = useHub();

  return (
    <div className={`hub-switcher ${className}`}>
      <div className="hub-switcher__label">
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--tx)' }}>
          Hub ปัจจุบัน
        </p>
      </div>

      {/* Grid 12 hub buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '8px',
        }}
      >
        {HUB_OPTIONS.map((hub) => (
          <button
            key={hub.id}
            onClick={() => switchHub(hub.id)}
            className={`hub-button ${currentHub === hub.id ? 'active' : ''}`}
            style={{
              padding: '12px 8px',
              borderRadius: '8px',
              border: currentHub === hub.id ? '2px solid var(--color-accent-primary)' : '2px solid var(--color-border)',
              background: currentHub === hub.id ? 'var(--color-accent-primary)10' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              color: 'var(--color-text-primary)',
              fontWeight: currentHub === hub.id ? 600 : 500,
              fontSize: '13px',
            }}
            title={hub.description}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{hub.icon}</div>
            <div>{hub.label}</div>
          </button>
        ))}
      </div>

      {/* ข้อมูล Hub ปัจจุบัน */}
      {currentHub && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: 'var(--color-accent-primary)10',
            borderRadius: '8px',
            borderLeft: '4px solid var(--color-accent-primary)',
          }}
        >
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {HUB_OPTIONS.find((h) => h.id === currentHub)?.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default HubSwitcher;
