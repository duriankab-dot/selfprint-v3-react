/**
 * NarrativeHook.tsx
 *
 * Track C Story Narrative Layer — §51 STORYTELLING ARCHITECTURE
 * Layer 3: MICRO STORY — Today's single most important beat
 *
 * Renders at Today/Dashboard header as a narrative hook that tells the user
 * what matters RIGHT NOW based on real data only.
 *
 * NO FAKE STORY: If no micro story data exists → renders nothing.
 */

import { useStoryNarrative } from '@/hooks/useStoryNarrative';
import { ProvenanceStrip } from '@/components/story/ProvenanceStrip';
import { useLanguage } from '@/context/LanguageContext';

export function NarrativeHook() {
  const { microStory } = useStoryNarrative();
  const { language } = useLanguage();
  const isTh = language === 'th';

  if (!microStory) return null;

  // Tone-based emoji and styling
  const toneConfig = {
    insightful: { emoji: '💡', color: '#FFB74D' },
    encouraging: { emoji: '🌟', color: '#81C784' },
    curious: { emoji: '🔍', color: '#64B5F6' },
    reflective: { emoji: '🪞', color: '#CE93D8' },
    celebratory: { emoji: '🎉', color: '#FFD54F' },
  };

  const config = toneConfig[microStory.tone] ?? toneConfig.insightful;

  return (
    <div
      className="narrative-hook"
      style={{
        padding: '12px 16px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${config.color}15, ${config.color}08)`,
        border: `1px solid ${config.color}30`,
        marginBottom: '12px',
      }}
      role="article"
      aria-label={isTh ? 'เรื่องราววันนี้' : "Today's story"}
    >
      {/* Header with emoji + headline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px' }} aria-hidden="true">
          {config.emoji}
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {microStory.headline}
        </h2>
      </div>

      {/* Detail */}
      <p
        style={{
          margin: '0 0 8px 26px',
          fontSize: '13px',
          lineHeight: '1.5',
          color: 'var(--color-text-secondary)',
        }}
      >
        {microStory.detail}
      </p>

      {/* Provenance strip — source of truth */}
      <div style={{ marginLeft: '26px' }}>
        <ProvenanceStrip
          patternCount={microStory.provenance.evidenceCount}
          extra={
            microStory.provenance.source === 'daily_brief'
              ? isTh
                ? 'จาก Daily Brief'
                : 'From Daily Brief'
              : microStory.provenance.source === 'twin_memory'
                ? isTh
                  ? 'จากความจำของ Twin'
                  : 'From Twin memory'
                : undefined
          }
        />
      </div>

      {/* Action prompt */}
      {microStory.actionPrompt && (
        <div
          style={{
            marginTop: '8px',
            marginLeft: '26px',
            fontSize: '12px',
            fontStyle: 'italic',
            color: config.color,
          }}
        >
          {isTh ? '→ ' : '→ '}
          {microStory.actionPrompt}
        </div>
      )}
    </div>
  );
}

export default NarrativeHook;
