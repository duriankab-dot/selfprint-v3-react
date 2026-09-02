/**
 * AnalysisNarrativeBuilder.ts
 * Synthesizes 12 SICE engine outputs into a cohesive 400-500 word Thai narrative
 * Called "ภาพรวมส่วนตัว" (Personal Overview) on the Analysis page
 */

import type { OrchestratorResult, SICEOutput } from '../../types/sice';

/**
 * Build a narrative prose from SICE orchestration results
 * Weaves insights from all 12 engines into a story-like overview
 * Target: 400-500 words in Thai
 */
export function generateAnalysisNarrative(orchestrationResult: OrchestratorResult): string {
  if (!orchestrationResult || !orchestrationResult.personalIntelligence) {
    return 'ยังไม่มีข้อมูลเพียงพอสำหรับการวิเคราะห์ครบถ้วน';
  }

  const { personalIntelligence, results, synthesis, fineTuned } = orchestrationResult;
  const engineResults = new Map<string, SICEOutput>();
  results.forEach((r) => {
    if (!r.error) {
      engineResults.set(r.engineName, r);
    }
  });

  const parts: string[] = [];

  // ═══════════════════════════════════════════════════════════════════════════════
  // OPENING: Establish understanding and confidence
  // ═══════════════════════════════════════════════════════════════════════════════
  const understanding = personalIntelligence.userUnderstanding || 60;

  if (understanding >= 80) {
    parts.push(
      `เราเข้าใจตัวตนของคุณอย่างลึกซึ้ง ผ่านการวิเคราะห์ความเชี่ยวชาญจากระบบ 12 ด้าน ได้ระบุลักษณะเฉพาะที่กำหนดชีวิตและการตัดสินใจของคุณได้อย่างชัดเจน`
    );
  } else if (understanding >= 60) {
    parts.push(
      `เราได้ระบุลักษณะสำคัญและแนวโน้มต่างๆ ของบุคลิกภาพและพฤติกรรมของคุณจากการวิเคราะห์เชิงลึก โดยแต่ละมิติของการวิเคราะห์นั้นเสริมสร้างความเข้าใจที่ครอบคลุมมากขึ้น`
    );
  } else {
    parts.push(
      `เรากำลังสร้างความเข้าใจเกี่ยวกับตัวตนของคุณผ่านทางข้อมูลและปฏิสัมพันธ์ที่ยังน้อย เนื่องจากใหม่เริ่มต้น ข้อมูลเพิ่มเติมจะช่วยให้การวิเคราะห์มีความแม่นยำยิ่งขึ้น`
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CORE INSIGHTS: Personal understanding + key patterns
  // ═══════════════════════════════════════════════════════════════════════════════
  if (personalIntelligence.insights && personalIntelligence.insights.length > 0) {
    parts.push(
      '\nข้อคิดหลักที่ได้จากการวิเคราะห์: ' +
        personalIntelligence.insights.slice(0, 2).join(' และ ')
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // THEMES & AGREEMENTS: Cross-engine synthesis
  // ═══════════════════════════════════════════════════════════════════════════════
  if (synthesis.agreements && synthesis.agreements.length > 0) {
    const agreements = synthesis.agreements
      .slice(0, 2)
      .map((a) => a.replace(/\([^)]*\)/g, '').trim())
      .filter(Boolean);

    if (agreements.length > 0) {
      parts.push(
        `\nระบบ ${agreements.length} ด้านต่างๆ มีความเห็นตรงกันว่า: ${agreements.join(' นอกจากนี้ ')}`
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // THEMES: Overall patterns
  // ═══════════════════════════════════════════════════════════════════════════════
  if (synthesis.themes && synthesis.themes.length > 0) {
    const topThemes = synthesis.themes.slice(0, 3).join(' ');
    parts.push(
      `\nรูปแบบหลักที่ตรวจพบทั่วทั้งระบบวิเคราะห์: ${topThemes}`
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // RECOMMENDATIONS & NEXT STEPS
  // ═══════════════════════════════════════════════════════════════════════════════
  if (personalIntelligence.recommendedAction) {
    parts.push(`\nสิ่งที่ทวินแนะนำให้คุณเน้นสำหรับตอนนี้: ${personalIntelligence.recommendedAction}`);
  }

  if (personalIntelligence.nextStepsSuggested && personalIntelligence.nextStepsSuggested.length > 0) {
    const actionItems = personalIntelligence.nextStepsSuggested
      .slice(0, 2)
      .map((s) => s.toLowerCase())
      .join(' และ ');

    parts.push(`\nขั้นตอนที่เสนอ: ${actionItems}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // WARNINGS/CAUTIONS: If any
  // ═══════════════════════════════════════════════════════════════════════════════
  if (personalIntelligence.warningsOrCautions && personalIntelligence.warningsOrCautions.length > 0) {
    parts.push(`\nข้อควรระวัง: ${personalIntelligence.warningsOrCautions[0]}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CLOSING: Forward-looking statement
  // ═══════════════════════════════════════════════════════════════════════════════
  if (fineTuned.adjustedForFeedback && fineTuned.feedbackHistoryConsidered > 0) {
    parts.push(
      `\nการวิเคราะห์นี้มีการปรับปรุงโดยบังคับใจจากประวัติการให้ความเห็นของคุณในอดีต (${fineTuned.feedbackHistoryConsidered} ข้อมูล) ซึ่งทำให้ความแม่นยำเพิ่มขึ้นขึ้น`
    );
  }

  parts.push(
    '\nทวินของคุณพร้อมที่จะเติบโตไปพร้อมๆ กับการเดินทางของคุณ ด้วยความเข้าใจนี้เป็นรากฐาน'
  );

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Alternative version: More structured, with explicit sections
 * Use if you want clearer section breaks (not a continuous narrative)
 */
export function generateAnalysisNarrativeStructured(
  orchestrationResult: OrchestratorResult
): {
  understanding: string;
  coreInsights: string;
  keyPatterns: string;
  recommendations: string;
  conclusion: string;
} {
  const { personalIntelligence, synthesis } = orchestrationResult;

  return {
    understanding:
      personalIntelligence.userUnderstanding >= 70
        ? `เข้าใจตัวตนของคุณอย่างลึกซึ้ง (${personalIntelligence.userUnderstanding}%)`
        : `กำลังสร้างความเข้าใจ (${personalIntelligence.userUnderstanding}%)`,

    coreInsights:
      personalIntelligence.insights?.slice(0, 2).join('\n') || 'ยังในขั้นวิเคราะห์',

    keyPatterns: synthesis.themes?.slice(0, 3).join('\n') || 'ยังไม่พบรูปแบบ',

    recommendations:
      [personalIntelligence.recommendedAction, ...(personalIntelligence.nextStepsSuggested || [])]
        .filter(Boolean)
        .slice(0, 2)
        .join('\n') || 'กำลังเตรียมคำแนะนำ',

    conclusion:
      personalIntelligence.warningsOrCautions?.length > 0
        ? `ข้อควรระวัง: ${personalIntelligence.warningsOrCautions[0]}`
        : 'พร้อมเติบโตไปพร้อมกับคุณ',
  };
}
