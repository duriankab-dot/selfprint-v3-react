/**
 * StoryModeSelector.tsx
 *
 * Track C Story Narrative Layer — §51 STORYTELLING ARCHITECTURE
 * UI for 5 Story Modes (REVEAL/EXPLORE/CHOICE/CONSEQUENCE/EVOLUTION)
 * mapped to §8 TWIN MODES.
 *
 * Each mode is enabled only when real data exists (NO FAKE STORY).
 */

import { useStoryNarrative } from '@/hooks/useStoryNarrative';
import { useLanguage } from '@/context/LanguageContext';
import type { StoryMode } from '@/lib/story/storyNarrative.types';

export function StoryModeSelector() {
  const { storyModes, setActiveMode } = useStoryNarrative();
  const { language } = useLanguage();
  const isTh = language === 'th';

  const { availableModes } = storyModes;

  if (availableModes.length === 0) return null;

  return (
    <div
      className="story-mode-selector"
      style={{
        padding: '12px',
        borderRadius: '12px',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border)',
        marginBottom: '16px',
      }}
      role="toolbar"
      aria-label={isTh ? 'โหมดเรื่องเล่า' : 'Story Modes'}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '10px',
        }}
      >
        {isTh ? 'สิ่งที่ Twin อยากบอก' : 'What Twin Wants to Share'}
      </div>

      {/* Mode buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {availableModes.map((mode) => (
          <ModeButton
            key={mode.mode}
            mode={mode}
            isTh={isTh}
            onClick={() => setActiveMode(mode.mode)}
          />
        ))}
      </div>

      {/* Active mode context panel */}
      {storyModes.activeMode && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-accent-primary)40',
          }}
        >
          <ActiveModePanel mode={storyModes.activeMode} context={storyModes.modeContext as any} isTh={isTh} />
        </div>
      )}
    </div>
  );
}

interface ModeButtonProps {
  mode: {
    mode: StoryMode;
    labelThai: string;
    labelEn: string;
    icon: string;
    enabled: boolean;
    triggerReason: string;
    dataReady: boolean;
  };
  isTh: boolean;
  onClick: () => void;
}

function ModeButton({ mode, isTh, onClick }: ModeButtonProps) {
  const label = isTh ? mode.labelThai : mode.labelEn;
  const disabled = !mode.enabled || !mode.dataReady;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        borderRadius: '8px',
        border: disabled ? '1px solid var(--color-border)' : '1px solid var(--color-accent-primary)',
        background: disabled ? 'var(--color-bg-primary)' : 'var(--color-accent-primary)15',
        color: disabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
      }}
      title={mode.triggerReason}
      aria-label={`${mode.icon} ${label}`}
    >
      <span aria-hidden="true">{mode.icon}</span>
      <span>{label}</span>
    </button>
  );
}

interface ActiveModePanelProps {
  mode: StoryMode;
  context: Record<string, unknown>;
  isTh: boolean;
}

function ActiveModePanel({ mode, context, isTh }: ActiveModePanelProps) {
  switch (mode) {
    case 'REVEAL': {
      const insight = (context as any).revealInsight;
      if (!insight) return null;
      return (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            💡 {isTh ? 'เปิดโปง' : 'Reveal'}
          </div>
          <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {insight.text}
          </p>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            {isTh ? `ความมั่นใจ ${(insight.confidence * 100).toFixed(0)}% · หลักฐาน ${insight.evidenceCount} จุด`
              : `Confidence ${(insight.confidence * 100).toFixed(0)}% · ${insight.evidenceCount} evidence points`}
          </div>
        </div>
      );
    }

    case 'EXPLORE': {
      const world = (context as any).exploreWorld;
      if (!world) return null;
      return (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            🔭 {isTh ? 'สำรวจ' : 'Explore'} — {world.worldName}
          </div>
          <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {world.connectionToPattern}
          </p>
        </div>
      );
    }

    case 'CHOICE': {
      const choice = (context as any).choiceDecision;
      if (!choice) return null;
      return (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            ⚖️ {isTh ? 'ทางเลือก' : 'Choice'}
          </div>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--color-text-primary)' }}>
            "{choice.question}"
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {isTh ? 'คุณเลือก: ' : 'You chose: '}
            <strong>{choice.chosenOption}</strong>
          </p>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            {new Date(choice.date).toLocaleDateString()}
          </div>
        </div>
      );
    }

    case 'CONSEQUENCE': {
      const consequence = (context as any).consequenceOutcome;
      if (!consequence) return null;
      const impactEmoji = consequence.impact === 'positive' ? '📈' : consequence.impact === 'negative' ? '📉' : '➖';
      return (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            🔄 {isTh ? 'ผลลัพธ์' : 'Consequence'} {impactEmoji}
          </div>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--color-text-primary)' }}>
            "{consequence.decisionQuestion}"
          </p>
          {consequence.feedback && (
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {isTh ? 'ผล: ' : 'Feedback: '}
              {consequence.feedback}
            </p>
          )}
          {consequence.lessons && (
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {isTh ? 'บทเรียน: ' : 'Lesson: '}
              {consequence.lessons}
            </p>
          )}
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            {isTh ? `${consequence.daysSinceChoice} วันที่แล้ว` : `${consequence.daysSinceChoice} days ago`}
          </div>
        </div>
      );
    }

    case 'EVOLUTION': {
      const evolution = (context as any).evolutionChange;
      if (!evolution) return null;
      return (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            🧬 {isTh ? 'พัฒนาการ' : 'Evolution'}
          </div>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--color-text-primary)' }}>
            {isTh
              ? `จาก "${evolution.fromStageLabel}" → "${evolution.toStageLabel}"`
              : `From "${evolution.fromStageLabel}" → "${evolution.toStageLabel}"`}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {evolution.deltaDescription}
          </p>
        </div>
      );
    }

    default:
      return null;
  }
}

export default StoryModeSelector;
