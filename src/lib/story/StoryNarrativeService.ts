/**
 * StoryNarrativeService.ts
 *
 * Track C Story Narrative Layer — §51 STORYTELLING ARCHITECTURE
 *
 * Fetches real data from existing tables:
 *   - twin_memories (via supabase direct query)
 *   - decision_log / decision_outcomes / follow_up_schedule (via DecisionService)
 *   - daily_briefs (via DailyBriefEngine)
 *   - evolution_stage (via lifecycleStore / Supabase)
 *
 * NO FAKE STORY: If no real data exists → returns empty/null.
 * NO NEW TABLES: Reads only from existing tables.
 * NO NEW ENGINE: Uses existing SICE output via DailyBriefEngine.
 */

import { supabase } from '@/services/supabase-service';
import type { WorldId } from '@/constants/worlds';
import type {
  BigStoryData,
  CurrentChapterData,
  MicroStoryData,
  PatternInsight,
  ChapterMemory,
  DecisionSnapshot,
  TurningPoint,
  OpenQuestion,
  EvolutionStageEntry,
  ProvenanceInfo,
  ModeContext,
  AvailableMode,
} from './storyNarrative.types';
import * as DecisionService from '@/services/DecisionService';
import { DailyBriefEngine } from '@/lib/intelligence/DailyBriefEngine';
import { WORLDS } from '@/constants/worlds';

// ─── Utility ──────────────────────────────────────────────────────────────────

function getLanguage(): 'th' | 'en' {
  // Simple heuristic: check if URL path has /en/ prefix
  return window.location.pathname.includes('/en/') ? 'en' : 'th';
}

// ─── Stage labels (Thai) ──────────────────────────────────────────────────────

const STAGE_LABELS_TH: Record<string, string> = {
  awakening: 'กำลังตื่นรู้',
  aware: 'เริ่มตระหนัก',
  connected: 'เชื่อมโยงแล้ว',
  reflective: 'ใคร่ครวญลึก',
  insightful: 'เข้าใจเชิงลึก',
  aligned: 'สอดคล้องสมบูรณ์',
};

// ─── Utility ──────────────────────────────────────────────────────────────────

// TWINS406-STORM-002 (9 ก.ย. 2026): two problems in one —
//
// 1. `.single()` sends `Accept: application/vnd.pgrst.object+json`; when the
//    user has no twins row yet PostgREST answers 406 and Chrome logs a red
//    console error on EVERY failed response, even though the code catches it.
//    (TWINS406-001 fixed the supabase-service copy of this query; this was
//    the remaining one.) `.limit(1)` + array read returns 200 `[]` instead —
//    identical semantics, zero console noise.
//
// 2. useStoryNarrative fires buildMicroStory/buildCurrentChapter/buildBigStory/
//    buildStoryModeState in parallel, and it is mounted as an INDEPENDENT hook
//    instance per component (Dashboard mounts NarrativeHook + CurrentChapter) —
//    so one page load issued 4×N identical twins lookups. A module-level
//    in-flight cache collapses them to one request per user.
const twinIdCache = new Map<string, Promise<string | null>>();

function getTwinId(userId: string): Promise<string | null> {
  if (!supabase || !userId) return Promise.resolve(null);
  const cached = twinIdCache.get(userId);
  if (cached) return cached;
  const pending = (async () => {
    try {
      const { data, error } = await supabase!
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      if (error || !data || data.length === 0) return null;
      return data[0].id as string;
    } catch {
      return null;
    }
  })();
  twinIdCache.set(userId, pending);
  // Only memoize a FOUND twin. A null here usually means "not awakened yet"
  // — the CoreAwakening flow can create the twin later in the same session,
  // and a permanently cached null would freeze every story surface at
  // "no narrative". Evict on null so the next call re-queries (the in-flight
  // entry above still collapses the current 4×N parallel burst).
  void pending.then((id) => {
    if (id === null && twinIdCache.get(userId) === pending) twinIdCache.delete(userId);
  });
  return pending;
}

async function getEvolutionHistory(twinId: string): Promise<EvolutionStageEntry[]> {
  if (!supabase || !twinId) return [];
  try {
    const { data, error } = await supabase
      .from('evolution_log')
      .select('stage, labeled_at')
      .eq('twin_id', twinId)
      .order('labeled_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row: any) => ({
      stage: row.stage,
      labeledAt: row.labeled_at,
      labelThai: STAGE_LABELS_TH[row.stage] ?? row.stage,
    }));
  } catch {
    return [];
  }
}

async function getCurrentStage(twinId: string): Promise<string | null> {
  if (!supabase || !twinId) return null;
  try {
    const { data, error } = await supabase
      .from('twins')
      .select('evolution_stage')
      .eq('id', twinId)
      .single();
    if (error || !data) return null;
    return data.evolution_stage as string;
  } catch {
    return null;
  }
}

// ─── Layer 3: Micro Story (Today's single beat) ───────────────────────────────

export async function buildMicroStory(
  userId: string,
): Promise<MicroStoryData | null> {
  const twinId = await getTwinId(userId);
  if (!twinId) return null;

  // Try DailyBriefEngine first — it already synthesizes top observation
  try {
    const engine = new DailyBriefEngine();
    const brief = await engine.buildBrief(userId);
    if (brief.observations.length > 0) {
      const top = brief.observations[0];
      const provenance: ProvenanceInfo = {
        source: 'daily_brief',
        sourceId: top.id,
        evidenceCount: top.evidenceCount,
        confidence: top.confidence,
      };

      const toneMap: Record<string, MicroStoryData['tone']> = {
        pattern: 'insightful',
        strength: 'celebratory',
        memory: 'reflective',
        question: 'curious',
      };

      return {
        headline: top.headline,
        detail: top.detail,
        provenance,
        tone: toneMap[top.category] ?? 'insightful',
        actionPrompt: brief.closingPrompt,
      };
    }
  } catch {
    // DailyBriefEngine may fail if user has no data yet
  }

  // Fallback: check for recent memories
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('twin_memories')
      .select('content, created_at, id')
      .eq('twin_id', twinId)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(1);

    if (data?.[0]) {
      const memory = data[0];
      return {
        headline: getLanguage() === 'th' ? 'Twin จำได้' : 'Twin Remembers',
        detail: `${getLanguage() === 'th' ? 'เมื่อเร็วๆ นี้คุณบอกว่า' : 'You recently shared'}: ${memory.content}`,
        provenance: {
          source: 'twin_memory',
          sourceId: memory.id as string,
          evidenceCount: 1,
          confidence: 1.0,
        },
        tone: 'reflective',
      };
    }
  } catch {
    // No memories
  }

  return null;
}

// ─── Layer 2: Current Chapter ─────────────────────────────────────────────────

export async function buildCurrentChapter(
  userId: string,
  currentWorld?: WorldId,
): Promise<CurrentChapterData | null> {
  const twinId = await getTwinId(userId);
  if (!twinId) return null;

  // Get patterns from DailyBriefEngine
  let dominantPatterns: PatternInsight[] = [];
  let currentObservation = '';
  try {
    const engine = new DailyBriefEngine();
    const brief = await engine.buildBrief(userId);
    dominantPatterns = brief.observations
      .filter((o) => o.category === 'pattern')
      .map((o) => ({
        patternName: o.headline,
        confidence: o.confidence,
        description: o.detail,
        evidenceCount: o.evidenceCount,
      }));
    currentObservation = brief.greeting;
  } catch {
    currentObservation = getLanguage() === 'th' ? 'Twin กำลังเรียนรู้รูปแบบของคุณ' : 'Twin is learning your patterns';
  }

  // Get recent memories this period
  const recentMemories: ChapterMemory[] = [];
  if (supabase) {
    try {
      const { data } = await supabase
        .from('twin_memories')
        .select('id, content, created_at, world_id')
        .eq('twin_id', twinId)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) {
        for (const m of data) {
          recentMemories.push({
            id: m.id as string,
            content: m.content as string,
            createdAt: m.created_at as string,
            worldId: (m.world_id as string | null) ?? undefined,
          });
        }
      }
    } catch {
      // No memories
    }
  }

  // Get decisions in this period
  const decisions = await DecisionService.getUserDecisions(twinId, currentWorld);
  const periodDecisions: DecisionSnapshot[] = decisions.slice(0, 5).map((d) => ({
    question: d.question,
    choice: d.userChoice,
    date: d.chosenAt,
    world: d.world,
  }));

  // Derive chapter title from dominant pattern or stage
  const stage = await getCurrentStage(twinId);
  const chapterTitle = dominantPatterns.length > 0
    ? dominantPatterns[0].patternName.replace(/_/g, ' ')
    : STAGE_LABELS_TH[stage ?? ''] ?? (userId ? 'บทใหม่' : '');

  const emoji = dominantPatterns.length > 0
    ? dominantPatterns[0].confidence > 0.7 ? '🔥' : '🌱'
    : '📖';

  return {
    chapterTitle,
    emoji,
    dominantPatterns,
    recentMemories,
    periodDecisions,
    currentObservation,
    timeframeLabel: getLanguage() === 'th' ? 'ช่วงเวลาปัจจุบัน' : 'Current Period',
  };
}

// ─── Layer 1: Big Story ───────────────────────────────────────────────────────

export async function buildBigStory(userId: string): Promise<BigStoryData | null> {
  const twinId = await getTwinId(userId);
  if (!twinId) return null;

  // Evolution history
  const evolutionHistory = await getEvolutionHistory(twinId);

  // Count total memories
  let totalMemories = 0;
  if (supabase) {
    try {
      const { count } = await supabase
        .from('twin_memories')
        .select('*', { count: 'exact', head: true })
        .eq('twin_id', twinId)
        .eq('role', 'user');
      totalMemories = count ?? 0;
    } catch {
      // No count available
    }
  }

  // Count total decisions
  let totalDecisions = 0;
  try {
    const decisions = await DecisionService.getUserDecisions(twinId);
    totalDecisions = decisions.length;
  } catch {
    // No decisions
  }

  // Turning points: decisions with positive outcomes
  const turningPoints: TurningPoint[] = [];
  try {
    const decisions = await DecisionService.getUserDecisions(twinId);
    for (const d of decisions) {
      const outcomes = await DecisionService.getDecisionOutcomes(d.id);
      for (const outcome of outcomes) {
        if (outcome.impact === 'positive') {
          turningPoints.push({
            id: outcome.id,
            description: d.question,
            impact: outcome.impact,
            lessons: outcome.lessons,
            date: outcome.recordedAt,
            world: d.world,
          });
        }
      }
    }
  } catch {
    // No turning points
  }

  // Open questions: decisions without outcomes yet
  const openQuestions: OpenQuestion[] = [];
  try {
    const decisions = await DecisionService.getUserDecisions(twinId);
    for (const d of decisions.slice(0, 10)) {
      const outcomes = await DecisionService.getDecisionOutcomes(d.id);
      if (outcomes.length === 0 && d.context) {
        openQuestions.push({
          id: d.id,
          question: d.question,
          reason: getLanguage() === 'th' ? 'ยังไม่ทราบผลลัพธ์ — Twin รอติดตามผล' : 'Outcome unknown — Twin is tracking',
          relatedDecisionId: d.id,
        });
      }
    }
  } catch {
    // No open questions
  }

  // Current chapter title
  const stage = await getCurrentStage(twinId);
  const currentChapterTitle = STAGE_LABELS_TH[stage ?? ''] ?? (userId ? 'กำลังเดินทาง' : '');

  // Journey summary
  const lang = getLanguage();
  const journeySummary = buildJourneySummary(evolutionHistory, totalMemories, totalDecisions, userId, lang);

  return {
    journeySummary,
    evolutionHistory,
    totalMemoriesLearned: totalMemories,
    totalDecisionsMade: totalDecisions,
    turningPoints,
    currentChapterTitle,
    openQuestions,
  };
}

function buildJourneySummary(
  evolutionHistory: EvolutionStageEntry[],
  totalMemories: number,
  totalDecisions: number,
  _userId: string,
  lang: 'th' | 'en',
): string {
  const th = `ตั้งแต่เริ่มต้น คุณมี ${totalMemories} สิ่งที่แบ่งปันกับ Twin และ ${totalDecisions} การตัดสินใจสำคัญ`;
  const en = `Since you started, you've shared ${totalMemories} things with your Twin and made ${totalDecisions} important decisions`;

  if (evolutionHistory.length >= 2) {
    const first = evolutionHistory[0];
    const last = evolutionHistory[evolutionHistory.length - 1];
    return lang === 'th' ? `${th} — จาก "${first.labelThai}" สู่ "${last.labelThai}"` : `${en} — from "${first.labelThai}" to "${last.labelThai}"`;
  }

  return totalMemories > 0
    ? (lang === 'th' ? th : en)
    : (lang === 'th' ? 'Twin เพิ่งเริ่มรู้จักคุณ — ทุกอย่างเริ่มต้นจากขั้นตอนแรก' : 'Twin is just getting to know you — everything starts from the first step');
}

// ─── Story Modes ──────────────────────────────────────────────────────────────

export async function buildStoryModeState(
  userId: string,
  currentWorld?: WorldId,
): Promise<{ availableModes: AvailableMode[]; modeContext: ModeContext }> {
  const twinId = await getTwinId(userId);
  if (!twinId) {
    return { availableModes: [], modeContext: {} as ModeContext };
  }

  const availableModes: AvailableMode[] = [];
  const modeContext: ModeContext = {};

  // REVEAL: Check if we have insights from analysis
  try {
    const engine = new DailyBriefEngine();
    const brief = await engine.buildBrief(userId);
    if (brief.observations.length > 0) {
      const topObs = brief.observations[0];
      availableModes.push({
        mode: 'REVEAL',
        labelThai: 'เปิดโปง',
        labelEn: 'Reveal',
        icon: '💡',
        enabled: true,
        triggerReason: getLanguage() === 'th' ? `พบรูปแบบที่น่าสนใจ: ${topObs.headline}` : `Interesting pattern found: ${topObs.headline}`,
        dataReady: topObs.confidence > 0.4,
      });
      modeContext.revealInsight = {
        text: topObs.detail,
        category: topObs.category,
        confidence: topObs.confidence,
        evidenceCount: topObs.evidenceCount,
      };
    }
  } catch {
    // No reveal data
  }

  // EXPLORE: Check if current world has real data
  if (currentWorld) {
    try {
      const decisions = await DecisionService.getUserDecisions(twinId, currentWorld);
      if (decisions.length > 0 || supabase) {
        // Check memories for this world
        let worldMemoryCount = 0;
        if (supabase) {
          try {
            const { count } = await supabase
              .from('twin_memories')
              .select('*', { count: 'exact', head: true })
              .eq('twin_id', twinId)
              .eq('world_id', currentWorld.toUpperCase());
            worldMemoryCount = count ?? 0;
          } catch { /* ignore */ }
        }

        if (decisions.length > 0 || worldMemoryCount > 0) {
          const worldDef = WORLDS[currentWorld];
          availableModes.push({
            mode: 'EXPLORE',
            labelThai: 'สำรวจ',
            labelEn: 'Explore',
            icon: '🔭',
            enabled: true,
            triggerReason: getLanguage() === 'th'
              ? `โลกนี้มีข้อมูลจริง ${decisions.length} การตัดสินใจ${worldMemoryCount > 0 ? ` + ${worldMemoryCount} ความจำ` : ''}`
              : `This world has ${decisions.length} decisions${worldMemoryCount > 0 ? ` + ${worldMemoryCount} memories` : ''}`,
            dataReady: decisions.length > 0 || worldMemoryCount > 0,
          });
          modeContext.exploreWorld = {
            worldId: currentWorld,
            worldName: worldDef?.nameTh ?? currentWorld,
            connectionToPattern: getLanguage() === 'th'
              ? `โลกนี้เชื่อมกับประสบการณ์จริงของคุณ`
              : `This world connects to your real experience`,
            hasRealData: decisions.length > 0 || worldMemoryCount > 0,
          };
        }
      }
    } catch {
      // No explore data
    }
  }

  // CHOICE: Check for recent decisions
  try {
    const decisions = await DecisionService.getUserDecisions(twinId);
    if (decisions.length > 0) {
      const latest = decisions[0];
      availableModes.push({
        mode: 'CHOICE',
        labelThai: 'ทางเลือก',
        labelEn: 'Choice',
        icon: '⚖️',
        enabled: true,
        triggerReason: getLanguage() === 'th' ? `คุณเคยตัดสินใจ: "${latest.question.substring(0, 60)}..."` : `You chose: "${latest.question.substring(0, 60)}..."`,
        dataReady: true,
      });
      modeContext.choiceDecision = {
        question: latest.question,
        chosenOption: latest.userChoice,
        date: latest.chosenAt,
        world: latest.world,
      };
    }
  } catch {
    // No choices
  }

  // CONSEQUENCE: Check for decision outcomes
  try {
    const decisions = await DecisionService.getUserDecisions(twinId);
    for (const d of decisions) {
      const outcomes = await DecisionService.getDecisionOutcomes(d.id);
      if (outcomes.length > 0) {
        const latestOutcome = outcomes[outcomes.length - 1];
        const daysSince = Math.floor(
          (Date.now() - new Date(d.chosenAt).getTime()) / (1000 * 60 * 60 * 24),
        );
        availableModes.push({
          mode: 'CONSEQUENCE',
          labelThai: 'ผลลัพธ์',
          labelEn: 'Consequence',
          icon: '🔄',
          enabled: true,
          triggerReason: getLanguage() === 'th'
            ? `ผลลัพธ์จากการตัดสินใจเมื่อ ${daysSince} วันที่แล้ว`
            : `Result from ${daysSince} days ago`,
          dataReady: true,
        });
        modeContext.consequenceOutcome = {
          decisionQuestion: d.question,
          feedback: latestOutcome.feedback,
          impact: latestOutcome.impact,
          lessons: latestOutcome.lessons,
          daysSinceChoice: daysSince,
        };
        break; // Only show latest consequence
      }
    }
  } catch {
    // No consequences
  }

  // EVOLUTION: Check for stage changes
  try {
    const history = await getEvolutionHistory(twinId);
    if (history.length >= 2) {
      const current = history[history.length - 1];
      const previous = history[history.length - 2];
      if (current.stage !== previous.stage) {
        availableModes.push({
          mode: 'EVOLUTION',
          labelThai: 'พัฒนาการ',
          labelEn: 'Evolution',
          icon: '🧬',
          enabled: true,
          triggerReason: getLanguage() === 'th'
            ? `เปลี่ยนจาก "${previous.labelThai}" เป็น "${current.labelThai}"`
            : `Changed from "${previous.labelThai}" to "${current.labelThai}"`,
          dataReady: true,
        });
        modeContext.evolutionChange = {
          fromStage: previous.stage,
          toStage: current.stage,
          toStageLabel: current.labelThai,
          fromStageLabel: previous.labelThai,
          deltaDescription: getLanguage() === 'th'
            ? 'Twin เข้าใจคุณลึกขึ้น'
            : 'Twin understands you more deeply',
        };
      }
    }
  } catch {
    // No evolution data
  }

  return { availableModes, modeContext };
}
