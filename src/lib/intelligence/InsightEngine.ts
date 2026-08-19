/**
 * InsightEngine.ts
 *
 * Synthesizes PersonalContext + BehavioralPatterns + AccuracyMetrics
 * into structured human-language summaries (Thai).
 *
 * Master Direction §9 — Dashboard Executive Summary:
 * "ส่วนแรกควรเป็นบทวิเคราะห์สรุปแบบภาษามนุษย์ ไม่ใช่ card ตัวเลขจำนวนมาก"
 *
 * Rules:
 * - 100% deterministic — data comes from real Supabase PersonalContext
 * - No LLM call here (that's AskCoach); templates fill with real field values
 * - Never fabricate insights — only surface what the model actually knows
 * - Every claim has evidence count or confidence backing it
 *
 * @module intelligence/InsightEngine
 */

import type {
  PersonalContext,
  BehavioralPattern,
  AccuracyMetrics,
  KnowledgeLevel,
} from './types';

// ============================================================================
// Output Types
// ============================================================================

export interface ExecutiveSummaryOutput {
  /** Opening line — "สิ่งที่ Selfprint เห็นในตัวคุณตอนนี้" */
  headline: string;

  /** 2–4 human-language insight sentences from real context data */
  insights: InsightLine[];

  /** Detected pattern if any */
  topPattern: PatternHighlight | null;

  /** How much the AI knows about this user (data quality) */
  dataDepth: DataDepth;

  /** Link to full analysis page if data is sufficient */
  readMoreEnabled: boolean;
}

export interface InsightLine {
  text: string;
  /** Evidence source label — shown as subtext */
  sourceLabel: string;
  /** KNOW | INFER | UNKNOWN */
  knowledgeLevel: KnowledgeLevel;
}

export interface PatternHighlight {
  name: string;
  description: string;
  type: 'repeating' | 'emerging' | 'changing';
  confidence: number;
}

export type DataDepth = 'empty' | 'minimal' | 'growing' | 'established' | 'deep';

// ============================================================================
// Main Engine
// ============================================================================

/**
 * InsightEngine
 * Converts structured intelligence data into human-readable Thai summaries.
 */
export class InsightEngine {

  /**
   * Generate ExecutiveSummary from available user intelligence data.
   * Safe to call with empty/partial data — degrades gracefully.
   */
  generateExecutiveSummary(
    context: PersonalContext | null,
    patterns: BehavioralPattern[],
    metrics: AccuracyMetrics | null
  ): ExecutiveSummaryOutput {
    const depth = this.assessDataDepth(context, patterns, metrics);
    const insights = this.buildInsightLines(context, patterns, depth);
    const topPattern = this.pickTopPattern(patterns);
    const readMoreEnabled = depth !== 'empty' && depth !== 'minimal';

    return {
      headline: this.buildHeadline(depth, context),
      insights,
      topPattern,
      dataDepth: depth,
      readMoreEnabled,
    };
  }

  /**
   * Assess how much real data we have about this user.
   */
  assessDataDepth(
    context: PersonalContext | null,
    patterns: BehavioralPattern[],
    metrics: AccuracyMetrics | null
  ): DataDepth {
    if (!context || context.sourceCount === 0) return 'empty';

    const valueCount = context.values?.length ?? 0;
    const goalCount = context.goals?.length ?? 0;
    const patternCount = patterns.length;
    const feedbackCount = metrics?.totalInsights ?? 0;

    const score = valueCount + goalCount + patternCount * 2 + feedbackCount;

    if (score === 0) return 'empty';
    if (score < 4) return 'minimal';
    if (score < 10) return 'growing';
    if (score < 20) return 'established';
    return 'deep';
  }

  // --------------------------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------------------------

  private buildHeadline(depth: DataDepth, context: PersonalContext | null): string {
    if (depth === 'empty') {
      return 'Twin ของคุณเพิ่งเริ่มต้น';
    }
    if (depth === 'minimal') {
      return 'Selfprint กำลังเรียนรู้ตัวคุณ';
    }

    const name = context?.userId ? '' : '';
    const base = 'สิ่งที่ Selfprint เห็นในตัวคุณตอนนี้';
    return name ? `${name} — ${base}` : base;
  }

  private buildInsightLines(
    context: PersonalContext | null,
    patterns: BehavioralPattern[],
    depth: DataDepth
  ): InsightLine[] {
    const lines: InsightLine[] = [];

    if (depth === 'empty') {
      lines.push({
        text: 'เริ่มบันทึกความทรงจำหรือทำ reflection เพื่อให้ AI Twin เริ่มเรียนรู้คุณ',
        sourceLabel: 'คำแนะนำจากระบบ',
        knowledgeLevel: 'UNKNOWN',
      });
      return lines;
    }

    // 1. Top value (KNOW if user stated, INFER if AI-derived)
    const topValue = context?.values?.sort((a, b) => b.confidence - a.confidence)[0];
    if (topValue) {
      const level: KnowledgeLevel = topValue.inferred ? 'INFER' : 'KNOW';
      lines.push({
        text: `คุณให้ความสำคัญกับ${level === 'KNOW' ? '' : 'ดูเหมือนจะให้ความสำคัญกับ'} "${topValue.name}"`,
        sourceLabel: level === 'KNOW'
          ? 'จากสิ่งที่คุณบอกโดยตรง'
          : `สรุปจาก ${topValue.evidence.length} หลักฐาน`,
        knowledgeLevel: level,
      });
    }

    // 2. Decision style
    const ds = context?.decisionStyle;
    if (ds && ds.confidence > 0.4) {
      const styleMap: Record<string, string> = {
        analytical: 'วิเคราะห์ข้อมูลก่อนตัดสินใจ',
        intuitive: 'ใช้สัญชาตญาณในการตัดสินใจ',
        collaborative: 'ชอบปรึกษาก่อนตัดสินใจ',
        mixed: 'ผสมผสานระหว่างการวิเคราะห์และสัญชาตญาณ',
      };
      const styleText = styleMap[ds.type] ?? ds.description;
      lines.push({
        text: `รูปแบบการตัดสินใจของคุณ: ${styleText}`,
        sourceLabel: `ความมั่นใจ ${Math.round(ds.confidence * 100)}%`,
        knowledgeLevel: 'INFER',
      });
    }

    // 3. Current goal (top by confidence)
    const topGoal = context?.goals?.sort((a, b) => b.confidence - a.confidence)[0];
    if (topGoal) {
      lines.push({
        text: `ช่วงนี้คุณดูเหมือนกำลังมุ่งหน้าไปสู่: "${topGoal.title}"`,
        sourceLabel: `จาก ${topGoal.evidence.length} reflection`,
        knowledgeLevel: 'INFER',
      });
    }

    // 4. Emerging pattern if available
    const emerging = patterns
      .filter((p) => p.patternType === 'emerging' && p.confidence > 0.5)
      .sort((a, b) => b.confidence - a.confidence)[0];
    if (emerging) {
      lines.push({
        text: `มี pattern ใหม่ที่กำลังเกิดขึ้น: ${emerging.description}`,
        sourceLabel: `พบล่าสุด ${new Date(emerging.lastDetected).toLocaleDateString('th-TH')}`,
        knowledgeLevel: 'INFER',
      });
    }

    // 5. Blind spot mention (sensitive — only if high confidence)
    const topBlindSpot = context?.blindSpots
      ?.filter((b) => b.confidence > 0.65 && b.sensitivity !== 'high')
      .sort((a, b) => b.confidence - a.confidence)[0];
    if (topBlindSpot && lines.length < 4) {
      lines.push({
        text: `สิ่งที่อาจมองข้ามไป: "${topBlindSpot.title}"`,
        sourceLabel: 'AI สังเกตเห็นจากรูปแบบพฤติกรรม',
        knowledgeLevel: 'INFER',
      });
    }

    return lines.slice(0, 4); // max 4 insight lines
  }

  private pickTopPattern(patterns: BehavioralPattern[]): PatternHighlight | null {
    if (patterns.length === 0) return null;

    // Prefer repeating patterns with highest confidence
    const top = patterns
      .sort((a, b) => {
        const typeScore = (p: BehavioralPattern) =>
          p.patternType === 'repeating' ? 3 : p.patternType === 'emerging' ? 2 : 1;
        return b.confidence * typeScore(b) - a.confidence * typeScore(a);
      })[0];

    return {
      name: top.patternName,
      description: top.description,
      type: top.patternType,
      confidence: top.confidence,
    };
  }

  /**
   * Generate the 9-section Full Personal Analysis content.
   * Used by AnalysisPage.
   */
  generateFullAnalysis(
    context: PersonalContext,
    patterns: BehavioralPattern[],
    metrics: AccuracyMetrics | null
  ): FullAnalysisOutput {
    return {
      selfOverview: this.buildSelfOverview(context),
      behavioralPatterns: patterns.map((p) => ({
        name: p.patternName,
        description: p.description,
        insight: p.aiInsight,
        type: p.patternType,
        confidence: p.confidence,
        frequency: p.frequency,
        lastDetected: new Date(p.lastDetected),
      })),
      strengths: (context.strengths ?? []).map((s) => ({
        name: s.name,
        description: s.description ?? '',
        confidence: s.confidence,
        evidence: s.evidence,
      })),
      blindSpots: (context.blindSpots ?? [])
        .filter((b) => b.sensitivity !== 'high' || b.confidence > 0.75)
        .map((b) => ({
          title: b.title,
          description: b.description ?? '',
          sensitivity: b.sensitivity,
          confidence: b.confidence,
        })),
      trends: this.buildTrends(patterns),
      journey: this.buildJourney(context, patterns),
      focusAreas: this.buildFocusAreas(context, patterns),
      guidance: this.buildGuidance(context, patterns),
      nextSteps: this.buildNextSteps(context, patterns),
      generatedAt: new Date(),
      modelAccuracy: metrics?.accuracy ?? 0,
      sourceCount: context.sourceCount,
    };
  }

  private buildSelfOverview(context: PersonalContext): string {
    const parts: string[] = [];
    const topValue = context.values?.sort((a, b) => b.confidence - a.confidence)[0];
    const ds = context.decisionStyle;

    if (topValue) {
      parts.push(`คุณเป็นคนที่ให้ความสำคัญกับ "${topValue.name}"`);
    }
    if (ds && ds.confidence > 0.4) {
      const styleMap: Record<string, string> = {
        analytical: 'มักวิเคราะห์อย่างละเอียดก่อนตัดสินใจ',
        intuitive: 'มักใช้สัญชาตญาณในการตัดสินใจ',
        collaborative: 'ชอบรับฟังความเห็นจากคนอื่นก่อนตัดสินใจ',
        mixed: 'มีความยืดหยุ่นในการตัดสินใจตามสถานการณ์',
      };
      parts.push(styleMap[ds.type] ?? ds.description);
    }
    if (context.emotionalRange?.responseToStress) {
      parts.push(`เมื่อเผชิญแรงกดดัน มักตอบสนองโดย: ${context.emotionalRange.responseToStress}`);
    }

    return parts.length > 0
      ? parts.join(' และ') + '.'
      : 'AI Twin ของคุณยังคงเรียนรู้เพื่อให้ภาพรวมที่ครบถ้วนมากขึ้น';
  }

  private buildTrends(patterns: BehavioralPattern[]): TrendItem[] {
    return patterns
      .filter((p) => p.patternType === 'changing')
      .map((p) => ({
        description: p.description,
        insight: p.aiInsight,
        since: new Date(p.lastDetected),
        confidence: p.confidence,
      }));
  }

  private buildJourney(context: PersonalContext, patterns: BehavioralPattern[]): JourneyOutput {
    const goalCount = context.goals?.length ?? 0;
    const patternCount = patterns.length;
    const depth = this.assessDataDepth(context, patterns, null);

    const stageMap: Record<DataDepth, string> = {
      empty: 'เริ่มต้น',
      minimal: 'กำลังค้นหาตัวเอง',
      growing: 'กำลังเติบโต',
      established: 'กำลังพัฒนา',
      deep: 'กำลังก้าวหน้า',
    };

    return {
      currentStage: stageMap[depth],
      description: `คุณมี ${goalCount} เป้าหมายที่ AI สังเกตเห็น และพบ ${patternCount} รูปแบบพฤติกรรม`,
      growing: context.strengths?.map((s) => s.name) ?? [],
      changing: patterns.filter((p) => p.patternType === 'changing').map((p) => p.patternName),
      stillWorking: context.blindSpots
        ?.filter((b) => b.sensitivity !== 'high')
        .map((b) => b.title) ?? [],
    };
  }

  private buildFocusAreas(context: PersonalContext, patterns: BehavioralPattern[]): string[] {
    const highConfidenceGoals = context.goals
      ?.filter((g) => g.confidence > 0.5)
      .map((g) => g.relatedHub)
      .filter((h): h is string => !!h) ?? [];

    const patternHubs = patterns
      .filter((p) => p.confidence > 0.6)
      .flatMap((p) => p.relatedGoals ?? []);

    return [...new Set([...highConfidenceGoals, ...patternHubs])].slice(0, 3);
  }

  private buildGuidance(context: PersonalContext, patterns: BehavioralPattern[]): string[] {
    const guidance: string[] = [];

    // From blind spots
    const actionableBlindSpot = context.blindSpots
      ?.filter((b) => b.confidence > 0.5 && b.sensitivity !== 'high')[0];
    if (actionableBlindSpot) {
      guidance.push(`ลองสังเกตตัวเองเรื่อง: ${actionableBlindSpot.title}`);
    }

    // From repeating patterns
    const repeating = patterns.find((p) => p.patternType === 'repeating' && p.confidence > 0.6);
    if (repeating) {
      guidance.push(`Pattern "${repeating.patternName}" กำลังเกิดซ้ำ — ลองสำรวจว่ามันส่งผลต่อชีวิตคุณอย่างไร`);
    }

    // From goals
    const topGoal = context.goals?.sort((a, b) => b.confidence - a.confidence)[0];
    if (topGoal) {
      guidance.push(`สิ่งที่คุณกำลังมุ่งหน้าไป "${topGoal.title}" — ลองทบทวนว่ากิจกรรมปัจจุบันสอดคล้องกับเป้าหมายนี้แค่ไหน`);
    }

    return guidance.slice(0, 3);
  }

  private buildNextSteps(context: PersonalContext, patterns: BehavioralPattern[]): string[] {
    const steps: string[] = [];

    if (context.sourceCount < 5) {
      steps.push('บันทึกความทรงจำหรือ reflection อีก 3–5 ครั้งเพื่อให้ AI เรียนรู้ได้ดีขึ้น');
    }

    if (patterns.length === 0) {
      steps.push('ใช้ Selfprint ต่อเนื่องอีกสักระยะ AI จะเริ่มสังเกตรูปแบบพฤติกรรมของคุณ');
    }

    const unratedPattern = patterns.find((p) => p.confidence > 0.5);
    if (unratedPattern) {
      steps.push(`ให้ feedback กับ insight "${unratedPattern.patternName}" เพื่อช่วย calibrate AI Twin`);
    }

    steps.push('กลับมา Selfprint ในอีก 7–14 วันเพื่อดูว่า AI เรียนรู้อะไรเพิ่มขึ้น');

    return steps.slice(0, 3);
  }
}

// ============================================================================
// Full Analysis Types
// ============================================================================

export interface FullAnalysisOutput {
  selfOverview: string;
  behavioralPatterns: Array<{
    name: string;
    description: string;
    insight: string;
    type: 'repeating' | 'emerging' | 'changing';
    confidence: number;
    frequency: string;
    lastDetected: Date;
  }>;
  strengths: Array<{ name: string; description: string; confidence: number; evidence: string[] }>;
  blindSpots: Array<{ title: string; description: string; sensitivity: string; confidence: number }>;
  trends: TrendItem[];
  journey: JourneyOutput;
  focusAreas: string[];
  guidance: string[];
  nextSteps: string[];
  generatedAt: Date;
  modelAccuracy: number;
  sourceCount: number;
}

interface TrendItem {
  description: string;
  insight: string;
  since: Date;
  confidence: number;
}

interface JourneyOutput {
  currentStage: string;
  description: string;
  growing: string[];
  changing: string[];
  stillWorking: string[];
}

export default InsightEngine;
