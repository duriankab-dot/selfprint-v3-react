/**
 * BadgeGallery.tsx
 *
 * Master Direction §29-30 — Badge System + Unlock Experience
 *
 * Shows:
 *  - Earned badges with unlock text
 *  - Available (locked) badges with earn condition
 *  - Next badge to earn (highlighted)
 *
 * Rule: all data from BadgeEngine (Supabase). No mocks.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { BadgeEngine } from '@/lib/intelligence/BadgeEngine';
import type { BadgeDefinition, EarnedBadge, BadgeId } from '@/lib/intelligence/BadgeEngine';
import { BADGE_DEFINITIONS } from '@/lib/intelligence/BadgeEngine';

// ============================================================================
// Engine instance (shared)
// ============================================================================

const engine = new BadgeEngine();

// ============================================================================
// Sub-components
// ============================================================================

interface BadgeCardProps {
  definition: BadgeDefinition;
  earned?: EarnedBadge;
  isNext?: boolean;
  isTh: boolean;
}

function BadgeCard({ definition, earned, isNext, isTh }: BadgeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const earnedLabel = isTh ? 'ได้รับแล้ว' : 'Earned';
  const notEarnedLabel = isTh ? 'ยังไม่ได้รับ' : 'Not earned yet';

  return (
    <div
      className={[
        'badge-card',
        earned ? 'badge-card--earned' : 'badge-card--locked',
        isNext ? 'badge-card--next' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => setExpanded((e) => !e)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
      aria-expanded={expanded}
      aria-label={`${definition.nameTh} — ${earned ? earnedLabel : notEarnedLabel}`}
    >
      <div className="badge-card-header">
        <span className="badge-icon" aria-hidden="true">
          {earned ? definition.icon : '🔒'}
        </span>
        <div className="badge-info">
          <p className="badge-name">{definition.nameTh}</p>
          {earned ? (
            <p className="badge-earned-date">
              {isTh ? 'ได้รับ' : 'Earned'}{' '}
              {new Date(earned.earnedAt).toLocaleDateString(isTh ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
            </p>
          ) : isNext ? (
            <p className="badge-next-label">🎯 {isTh ? 'ถัดไป' : 'Next'}</p>
          ) : (
            <p className="badge-locked-label">{notEarnedLabel}</p>
          )}
        </div>
        <span className="badge-expand" aria-hidden="true">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="badge-detail">
          <p className="badge-desc">{definition.descriptionTh}</p>
          {!earned && (
            <p className="badge-requirement">
              <strong>{isTh ? 'เงื่อนไข:' : 'Requirement:'}</strong> {definition.requirementTh}
            </p>
          )}
          <div className="badge-unlock-info">
            <span className="badge-unlock-label">🔓 {isTh ? 'ปลดล็อก:' : 'Unlocks:'}</span>
            <span className="badge-unlock-text">{definition.unlockTh}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

export function BadgeGallery() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const { language } = useLanguage();
  const isTh = language === 'th';

  const { data, isLoading } = useQuery({
    queryKey: ['badgeState', userId],
    queryFn: () => engine.getBadgeState(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  if (!userId) return null;

  if (isLoading) {
    return (
      <div className="badge-gallery badge-gallery--loading">
        <p className="badge-loading-text">{isTh ? 'กำลังโหลด Badge ของคุณ...' : 'Loading your badges...'}</p>
      </div>
    );
  }

  const earned = data?.earned ?? [];
  const available = data?.available ?? [];
  const nextBadge = data?.nextToEarn;
  const ALL_IDS = Object.keys(BADGE_DEFINITIONS) as BadgeId[];
  const total = ALL_IDS.length;
  const earnedCount = earned.length;

  return (
    <section className="badge-gallery" aria-label="Badge Gallery">
      {/* Progress bar */}
      <div className="badge-gallery-header">
        <h2 className="badge-gallery-title">{isTh ? 'Badge ของคุณ' : 'Your Badges'}</h2>
        <p className="badge-gallery-progress">
          {earnedCount} / {total} {isTh ? 'ปลดล็อกแล้ว' : 'unlocked'}
        </p>
      </div>
      <div
        className="badge-progress-bar"
        role="progressbar"
        aria-valuenow={earnedCount}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="badge-progress-fill"
          style={{ width: `${(earnedCount / total) * 100}%` }}
        />
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="badge-section">
          <h3 className="badge-section-title">✅ {isTh ? 'ได้รับแล้ว' : 'Earned'}</h3>
          <div className="badge-grid">
            {earned.map((e) => (
              <BadgeCard
                key={e.id}
                definition={BADGE_DEFINITIONS[e.id]}
                earned={e}
                isTh={isTh}
              />
            ))}
          </div>
        </div>
      )}

      {/* Next + Available */}
      {available.length > 0 && (
        <div className="badge-section">
          <h3 className="badge-section-title">🔒 {isTh ? 'ยังไม่ได้รับ' : 'Not earned yet'}</h3>
          <div className="badge-grid">
            {available.map((def) => (
              <BadgeCard
                key={def.id}
                definition={def}
                isNext={def.id === nextBadge?.id}
                isTh={isTh}
              />
            ))}
          </div>
        </div>
      )}

      {earnedCount === total && (
        <div className="badge-complete-banner">
          {isTh ? '🌟 คุณปลดล็อก Badge ทั้งหมดแล้ว — Selfprint ของคุณสมบูรณ์แบบ!' : '🌟 You unlocked every badge — your Selfprint is complete!'}
        </div>
      )}
    </section>
  );
}

export default BadgeGallery;
