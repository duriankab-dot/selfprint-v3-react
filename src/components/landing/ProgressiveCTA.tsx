/**
 * ProgressiveCTA.tsx
 *
 * Reusable CTA button for Landing Page sections
 * - Tracks which section user came from (why/how/who/next)
 * - Mood-aware styling
 * - Navigates to onboarding with context
 */

import { useLangNavigate as useNavigate } from '../../hooks/useLangNavigate';
import { useEmotion } from '@/context/EmotionContext';
import { useUserStore } from '@/store/userStore';
import type { CTASource } from '@/store/userStore';

interface ProgressiveCTAProps {
  section: CTASource;
  text: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export const ProgressiveCTA: React.FC<ProgressiveCTAProps> = ({
  section,
  text,
  className = '',
  variant = 'primary',
}) => {
  const navigate = useNavigate();
  const { mood } = useEmotion();
  const { setLandingContext } = useUserStore();

  const handleClick = () => {
    // Track which CTA was clicked
    setLandingContext({
      mood,
      ctaSource: section,
    });

    // Also store in localStorage for redundancy
    localStorage.setItem('landing_cta_source', section || '');
    localStorage.setItem('landing_mood', mood || '');

    // Navigate to onboarding
    navigate('/onboarding', {
      state: {
        mood,
        ctaSource: section,
      },
    });
  };

  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={handleClick}
      className={`progressive-cta progressive-cta--${variant} ${className}`}
      style={{
        padding: isPrimary ? '14px 32px' : '12px 28px',
        borderRadius: '10px',
        fontWeight: 600,
        fontSize: '16px',
        cursor: 'pointer',
        border: isPrimary ? 'none' : '2px solid var(--color-accent-primary)',
        background: isPrimary ? 'var(--color-accent-primary)' : 'transparent',
        color: isPrimary ? 'white' : 'var(--color-accent-primary)',
        transition: 'all 0.3s ease',
        minWidth: '160px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.8';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      title={`CTA from ${section} section`}
    >
      {text}
    </button>
  );
};

export default ProgressiveCTA;
