/**
 * DailyBriefEngine.ts
 *
 * Master Direction §25 — Daily Brief
 *
 * Generates a personalized brief (20–40 sec listen) based on real data:
 *   - PersonalContext (values, strengths)
 *   - BehavioralPatterns
 *   - Recent memories
 *   - TwinState
 *
 * Rule: real data only — no mocks, no motivational quotes.
 */

import { PersonalContextBuilder } from './PersonalContextBuilder';
import { PatternDetector } from './PatternDetector';
import { MemoryManager } from './MemoryManager';
import { TwinStateEngine } from './TwinStateEngine';
import type { PersonalContext, BehavioralPattern, PersonalMemory } from './types';

const twinStateEngine = new TwinStateEngine();

// ============================================================================
// Types
// ============================================================================

export interface BriefObservation {
  id: string;
  category: 'pattern' | 'strength' | 'memory' | 'question';
  headline: string;
  detail: string;
  confidence: number;
  evidenceCount: number;
}

export interface DailyBrief {
  userId: string;
  generatedAt: Date;
  twinState: string;
  greeting: string;
  observations: BriefObservation[];
  closingPrompt: string;
  listenDurationEstimate: number; // seconds
  dataRichness: 'minimal' | 'moderate' | 'rich';
}

// ============================================================================
// Engine
// ============================================================================

export class DailyBriefEngine {
  private pcBuilder = new PersonalContextBuilder();
  private patternDetector = new PatternDetector();
  private memoryManager = new MemoryManager();

  async buildBrief(userId: string): Promise<DailyBrief> {
    const [context, patterns, memories] = await Promise.all([
      this.pcBuilder.getContext(userId).catch((): PersonalContext | null => null),
      this.patternDetector.detectPatterns(userId).catch((): BehavioralPattern[] => []),
      this.memoryManager.getMemories(userId).catch((): PersonalMemory[] => []),
    ]);

    const twinResult = twinStateEngine.computeState((context ?? {}) as PersonalContext);
    const richness = this.dataRichness(context, patterns.length, memories.length);
    const observations = this.synthesizeObservations(context, patterns, memories);

    return {
      userId,
      generatedAt: new Date(),
      twinState: twinResult.state,
      greeting: this.greeting(twinResult.state, richness),
      observations,
      closingPrompt: this.closingPrompt(observations, richness),
      listenDurationEstimate: this.estimateDuration(observations),
      dataRichness: richness,
    };
  }

  // ---------------------------------------------------------------------------

  private synthesizeObservations(
    context: PersonalContext | null,
    patterns: BehavioralPattern[],
    memories: PersonalMemory[],
  ): BriefObservation[] {
    const items: BriefObservation[] = [];

    // Top pattern
    const topPattern = [...patterns]
      .sort((a, b) => b.confidence - a.confidence)
      .find((p) => p.confidence > 0.45);

    if (topPattern) {
      items.push({
        id: `pattern-${topPattern.id}`,
        category: 'pattern',
        headline: topPattern.patternName.replace(/_/g, ' '),
        detail: topPattern.description +
          (topPattern.aiInsight ? ` ${topPattern.aiInsight}` : ''),
        confidence: topPattern.confidence,
        evidenceCount: topPattern.evidencePoints?.length ?? 1,
      });
    }

    // Top strength
    const topStrength = context?.strengths
      ?.filter((s) => s.confidence > 0.4)
      .sort((a, b) => b.confidence - a.confidence)[0];

    if (topStrength) {
      items.push({
        id: `strength-${topStrength.name}`,
        category: 'strength',
        headline: `จุดแข็ง: ${topStrength.name}`,
        detail: topStrength.description
          ? `${topStrength.description} สิ่งนี้ปรากฏใน ${topStrength.evidence.length} ครั้งที่ผ่านมา`
          : `Twin สังเกตว่า ${topStrength.name} ปรากฏซ้ำในหลายสิ่งที่คุณอธิบาย`,
        confidence: topStrength.confidence,
        evidenceCount: topStrength.evidence.length,
      });
    }

    // Recent important memory
    const recentMemory = [...memories]
      .filter((m) => m.memoryType === 'important_moment' || m.memoryType === 'discovery')
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())[0];

    if (recentMemory) {
      items.push({
        id: `memory-${recentMemory.id}`,
        category: 'memory',
        headline: recentMemory.title,
        detail: `Twin จำได้ว่าเมื่อเร็ว ๆ นี้: ${recentMemory.content}`,
        confidence: 1.0,
        evidenceCount: 1,
      });
    }

    // Fallback if data sparse
    if (items.length < 2) {
      items.push({
        id: 'question-explore',
        category: 'question',
        headline: 'Twin อยากรู้จักคุณมากขึ้น',
        detail: 'ยิ่งคุณสะท้อนตัวเอง Twin จะเข้าใจคุณได้ลึกขึ้น ลองบอก Twin เรื่องหนึ่งที่กำลังคิดอยู่ตอนนี้',
        confidence: 1.0,
        evidenceCount: 0,
      });
    }

    return items.slice(0, 4);
  }

  private greeting(state: string, richness: 'minimal' | 'moderate' | 'rich'): string {
    if (richness === 'minimal') {
      return 'Twin กำลังเรียนรู้จากคุณมากขึ้นทุกวัน นี่คือสิ่งที่สังเกตเห็นในตอนนี้';
    }
    const map: Record<string, string> = {
      awakening: 'Twin เพิ่งเริ่มรู้จักคุณ — นี่คือสิ่งแรกที่สังเกตเห็น',
      aware: 'Twin กำลังเห็นรูปแบบในสิ่งที่คุณแชร์ นี่คือสิ่งที่น่าสนใจ',
      connected: 'Twin เห็นความเชื่อมโยงบางอย่างเกี่ยวกับคุณ นี่คือ 3 เรื่องที่อยากบอก',
      reflective: 'Twin สังเกตเห็นบางสิ่งที่คุณอาจยังไม่ทันสังเกตตัวเอง',
      insightful: 'Twin เริ่มเข้าใจวิธีที่คุณคิดและรู้สึก นี่คือสิ่งที่เกิดขึ้น',
      aligned: 'Twin รู้จักคุณดีพอที่จะบอกสิ่งนี้ด้วยความมั่นใจ',
    };
    return map[state] ?? map.aware;
  }

  private closingPrompt(obs: BriefObservation[], richness: 'minimal' | 'moderate' | 'rich'): string {
    if (richness === 'minimal') return 'ลองบอก Twin เกี่ยวกับตัวเอง เพื่อให้ Brief นี้ลึกขึ้นในวันถัดไป';
    if (obs.some((o) => o.category === 'pattern')) {
      return 'รูปแบบนี้เป็นจริงกับคุณไหม? บอก Twin เพื่อให้เข้าใจถูกต้องมากขึ้น';
    }
    return 'มีอะไรในช่วงนี้ที่อยากให้ Twin รู้ไหม?';
  }

  private estimateDuration(obs: BriefObservation[]): number {
    const totalChars = obs.reduce((sum, o) => sum + o.detail.length, 0);
    // Thai ~4 chars/word, ~3 words/sec reading aloud
    const estimated = Math.round(totalChars / 4 / 3 + obs.length * 2);
    return Math.min(40, Math.max(20, estimated));
  }

  private dataRichness(
    ctx: PersonalContext | null,
    patternCount: number,
    memoryCount: number,
  ): 'minimal' | 'moderate' | 'rich' {
    const score =
      (ctx?.values?.length ?? 0) +
      (ctx?.strengths?.length ?? 0) +
      patternCount * 2 +
      memoryCount;
    if (score >= 8) return 'rich';
    if (score >= 3) return 'moderate';
    return 'minimal';
  }
}
