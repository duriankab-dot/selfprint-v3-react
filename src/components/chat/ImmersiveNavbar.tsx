/**
 * ImmersiveNavbar.tsx
 *
 * Compact top bar for ImmersiveTwinChat — glassmorphism style
 * [← Exit]  💫 Twin Name — World    [⚙ Settings]
 *
 * Auto-hides on scroll down, shows on scroll up (optional)
 * Height: 56px mobile / 64px desktop
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import type { WorldId } from '@/constants/worlds';

interface ImmersiveNavbarProps {
  twinName?: string;
  currentWorld?: WorldId;
  onSettingsClick?: () => void;
}

const WORLD_ICONS: Record<WorldId, string> = {
  self: '🧠',
  mind: '💭',
  relationship: '❤️',
  love: '💕',
  career: '💼',
  wealth: '💰',
  life: '🌱',
  growth: '📈',
  decision: '⚖️',
  purpose: '🎯',
  wellbeing: '🧘',
  future: '🔮',
};

export function ImmersiveNavbar({
  twinName,
  currentWorld,
  onSettingsClick,
}: ImmersiveNavbarProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down → hide
        setHidden(true);
      } else {
        // Scrolling up → show
        setHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleExit = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const worldIcon = currentWorld ? WORLD_ICONS[currentWorld] || '🌍' : '';
  const worldName = currentWorld
    ? isTh
      ? `— ${currentWorld}`
      : ` — ${currentWorld}`
    : '';

  return (
    <nav
      className="immersive-navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
        color: '#F9FAFB',
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}
    >
      {/* Left: Exit button */}
      <button
        onClick={handleExit}
        aria-label={isTh ? 'ออกจากแชท' : 'Exit chat'}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.08)',
          color: '#F9FAFB',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        ←
      </button>

      {/* Center: Twin name + world */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          paddingRight: '40px',
        }}
      >
        <span style={{ opacity: 0.9 }}>
          {twinName || (isTh ? 'AI Twin' : 'Your Twin')}
        </span>
        {worldIcon && (
          <span style={{ marginLeft: '6px', opacity: 0.7, fontSize: '12px' }}>
            {worldIcon}{worldName}
          </span>
        )}
      </div>

      {/* Right: Settings button */}
      {onSettingsClick && (
        <button
          onClick={onSettingsClick}
          aria-label={isTh ? 'ตั้งค่า' : 'Settings'}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#F9FAFB',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ⚙
        </button>
      )}
    </nav>
  );
}
