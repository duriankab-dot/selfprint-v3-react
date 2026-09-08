/**
 * WorldStoryPanel.tsx
 * Track C — Story Narrative Layer, Phase 9 (change-map verified 8 ก.ย. 2026,
 * see docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md).
 *
 * Renders 2 of the originally-planned 4 scene sections for a World:
 * Story (real memories tagged to this world) and Decision (real past
 * decisions made in this world). "Pattern" and "Reflection" are
 * deliberately NOT included here — verification found no `world`/`world_id`
 * column on behavioral_patterns or personal_context, so attributing either
 * to a single World would be a fabricated link (violates §51 "NO FAKE
 * STORY"). They stay a P1 item pending a schema change, per the change-map.
 *
 * Guardrail: a section that has zero real items is not rendered at all —
 * no placeholder copy, no fake "coming soon" card (same principle as
 * Phase 11's "What Twin Knows").
 */

import type { LearnedMemory } from '@/lib/memory/getTwinKnowledge';
import type { Decision } from '@/types/decision';

interface WorldStoryPanelProps {
  isTh: boolean;
  worldNameTh: string;
  worldName: string;
  memories: LearnedMemory[];
  decisions: Decision[];
}

function formatDate(iso: string | null, isTh: boolean): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function WorldStoryPanel({ isTh, worldNameTh, worldName, memories, decisions }: WorldStoryPanelProps) {
  const hasStory = memories.length > 0;
  const hasDecisions = decisions.length > 0;

  if (!hasStory && !hasDecisions) return null;

  return (
    <div className="wh-world-story" style={{ marginTop: 24, marginBottom: 24 }}>
      {hasStory && (
        <div className="wh-articles" style={{ marginBottom: hasDecisions ? 20 : 0 }}>
          <h3>
            📔 {isTh ? `เรื่องราวของคุณในโลก${worldNameTh}` : `Your story in ${worldName}`}
          </h3>
          <div className="articles-list">
            {memories.map((m) => (
              <div key={m.id} className="article-card" style={{ cursor: 'default' }}>
                <p className="article-excerpt" style={{ margin: 0 }}>{m.content}</p>
                {m.createdAt && (
                  <div className="article-meta">
                    <span className="meta-author">🕐 {formatDate(m.createdAt, isTh)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasDecisions && (
        <div className="wh-articles">
          <h3>
            🧭 {isTh ? `การตัดสินใจของคุณในโลก${worldNameTh}` : `Your decisions in ${worldName}`}
          </h3>
          <div className="articles-list">
            {decisions.map((d) => (
              <div key={d.id} className="article-card" style={{ cursor: 'default' }}>
                <h4>{d.question}</h4>
                <p className="article-excerpt">
                  {isTh ? 'สิ่งที่คุณเลือก: ' : 'What you chose: '}
                  {d.userChoice}
                </p>
                {d.createdAt && (
                  <div className="article-meta">
                    <span className="meta-author">🕐 {formatDate(d.createdAt, isTh)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
