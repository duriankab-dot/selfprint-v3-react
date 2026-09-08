/**
 * BigStory.tsx
 *
 * Track C Story Narrative Layer — §51 STORYTELLING ARCHITECTURE
 * Layer 1: BIG STORY — Entire journey narrative ("From where → Now → Where going")
 *
 * Renders in MePage as a comprehensive story overview showing:
 *   - Journey summary with evolution stages
 *   - Total memories learned and decisions made
 *   - Turning points (positive outcomes)
 *   - Open questions Twin holds
 *
 * NO FAKE STORY: All data from real tables only.
 */

import { useStoryNarrative } from '@/hooks/useStoryNarrative';
import { useLanguage } from '@/context/LanguageContext';

export function BigStory() {
  const { bigStory } = useStoryNarrative();
  const { language } = useLanguage();
  const isTh = language === 'th';

  if (!bigStory) return null;

  return (
    <div
      className="big-story"
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border)',
        marginBottom: '20px',
      }}
      role="region"
      aria-label={isTh ? 'เรื่องราวทั้งหมดของคุณ' : 'Your Complete Story'}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2
          style={{
            margin: '0 0 4px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {isTh ? '📖 เรื่องราวการเดินทางของคุณ' : '📖 Your Journey Story'}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.5',
          }}
        >
          {bigStory.journeySummary}
        </p>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <StatCard
          value={String(bigStory.totalMemoriesLearned)}
          label={isTh ? 'สิ่งที่แบ่งปัน' : 'Shared'}
          icon="💬"
        />
        <StatCard
          value={String(bigStory.totalDecisionsMade)}
          label={isTh ? 'การตัดสินใจ' : 'Decisions'}
          icon="⚖️"
        />
        <StatCard
          value={String(bigStory.turningPoints.length)}
          label={isTh ? 'จุดเปลี่ยน' : 'Turning Points'}
          icon="🔥"
        />
      </div>

      {/* Evolution timeline */}
      {bigStory.evolutionHistory.length >= 2 && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            {isTh ? 'พัฒนาการ' : 'Evolution'}
          </div>
          <div style={{ position: 'relative', paddingLeft: '20px' }}>
            {/* Timeline line */}
            <div
              style={{
                position: 'absolute',
                left: '6px',
                top: '4px',
                bottom: '4px',
                width: '2px',
                background: 'var(--color-border)',
              }}
            />
            {bigStory.evolutionHistory.slice(-4).map((entry, idx) => (
              <div key={idx} style={{ position: 'relative', marginBottom: '8px' }}>
                {/* Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-18px',
                    top: '2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--color-accent-primary)',
                    border: '2px solid var(--color-bg-tertiary)',
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {entry.labelThai}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginLeft: '8px' }}>
                  {new Date(entry.labeledAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Turning points */}
      {bigStory.turningPoints.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            {isTh ? 'จุดเปลี่ยนสำคัญ' : 'Key Turning Points'}
          </div>
          {bigStory.turningPoints.slice(0, 3).map((tp) => (
            <div
              key={tp.id}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
                marginBottom: '6px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {tp.description}
              </div>
              {tp.lessons && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  {isTh ? 'บทเรียน: ' : 'Lesson: '}
                  {tp.lessons}
                </div>
              )}
              <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                {new Date(tp.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Open questions */}
      {bigStory.openQuestions.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            {isTh ? 'คำถามที่ Twin ยังถือไว้' : 'Open Questions'}
          </div>
          {bigStory.openQuestions.slice(0, 3).map((q) => (
            <div
              key={q.id}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--color-bg-primary)',
                border: `1px solid ${q.relatedDecisionId ? 'var(--color-accent-primary)30' : 'var(--color-border)'}`,
                marginBottom: '6px',
              }}
            >
              <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--color-text-primary)' }}>
                "{q.question}"
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                {q.reason}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  value: string;
  label: string;
  icon: string;
}

function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div
      style={{
        flex: '1 1 100px',
        minWidth: '100px',
        padding: '12px',
        borderRadius: '10px',
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{label}</div>
    </div>
  );
}

export default BigStory;
