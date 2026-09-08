/**
 * CurrentChapter.tsx
 *
 * Track C Story Narrative Layer — §51 STORYTELLING ARCHITECTURE
 * Layer 2: CURRENT CHAPTER — Current time-period theme
 *
 * Renders as a chapter frame connecting the world/user to their current
 * dominant SICE patterns and recent activity.
 *
 * Used in: WorldDetail, Today section
 */

import { useStoryNarrative } from '@/hooks/useStoryNarrative';
import { useLanguage } from '@/context/LanguageContext';

export function CurrentChapter() {
  const { currentChapter } = useStoryNarrative();
  const { language } = useLanguage();
  const isTh = language === 'th';

  if (!currentChapter) return null;

  return (
    <div
      className="current-chapter"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border)',
        marginBottom: '16px',
      }}
      role="region"
      aria-label={isTh ? 'บทปัจจุบัน' : 'Current Chapter'}
    >
      {/* Chapter header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span
          style={{
            fontSize: '24px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: 'var(--color-accent-primary)',
          }}
          aria-hidden="true"
        >
          {currentChapter.emoji}
        </span>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {currentChapter.chapterTitle}
          </h3>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
            }}
          >
            {currentChapter.timeframeLabel}
          </span>
        </div>
      </div>

      {/* Observation */}
      {currentChapter.currentObservation && (
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            lineHeight: '1.5',
            color: 'var(--color-text-secondary)',
            paddingLeft: '46px',
          }}
        >
          {currentChapter.currentObservation}
        </p>
      )}

      {/* Dominant patterns */}
      {currentChapter.dominantPatterns.length > 0 && (
        <div style={{ marginLeft: '46px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            {isTh ? 'รูปแบบหลัก' : 'Dominant Patterns'}
          </div>
          {currentChapter.dominantPatterns.slice(0, 3).map((pattern, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
                marginBottom: '6px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {pattern.patternName.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {pattern.description}
              </div>
              {pattern.evidenceCount > 0 && (
                <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                  {isTh ? `หลักฐาน ${pattern.evidenceCount} จุด` : `${pattern.evidenceCount} evidence points`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent memories */}
      {currentChapter.recentMemories.length > 0 && (
        <div style={{ marginLeft: '46px', marginTop: '10px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            {isTh ? 'ความจำล่าสุด' : 'Recent Memories'}
          </div>
          {currentChapter.recentMemories.slice(0, 3).map((mem) => (
            <div
              key={mem.id}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
                marginBottom: '4px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
              }}
            >
              {mem.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CurrentChapter;
