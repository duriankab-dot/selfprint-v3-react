/**
 * ChoiceConsequence.tsx
 * Track C — Story Narrative Layer, Phase 10 (change-map verified 8 ก.ย. 2026,
 * see docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md).
 *
 * "Since [choice], here's what changed" — surfaces a REAL recorded outcome
 * (decision_outcomes) for a past decision. Renders nothing if no outcome
 * exists yet (§51 NO FAKE STORY — never fabricate a consequence).
 */

import type { Decision, DecisionOutcome } from '@/types/decision';

interface ChoiceConsequenceProps {
  isTh: boolean;
  decision: Decision;
  outcome: DecisionOutcome;
}

const IMPACT_EMOJI: Record<DecisionOutcome['impact'], string> = {
  positive: '📈',
  neutral: '➖',
  negative: '📉',
};

export function ChoiceConsequence({ isTh, decision, outcome }: ChoiceConsequenceProps) {
  if (!outcome.feedback && !outcome.lessons) return null;

  return (
    <div
      className="choice-consequence-card"
      style={{
        margin: '0 0 16px',
        padding: '14px 16px',
        borderRadius: 14,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
    >
      <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
        {IMPACT_EMOJI[outcome.impact]}{' '}
        {isTh
          ? `จากที่คุณเลือก "${decision.userChoice}" — นี่คือสิ่งที่เปลี่ยนไป`
          : `Since you chose "${decision.userChoice}" — here's what changed`}
      </p>
      {outcome.feedback && (
        <p style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--color-text-primary)' }}>{outcome.feedback}</p>
      )}
      {outcome.lessons && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {isTh ? '💡 บทเรียน: ' : '💡 Lesson: '}
          {outcome.lessons}
        </p>
      )}
    </div>
  );
}
