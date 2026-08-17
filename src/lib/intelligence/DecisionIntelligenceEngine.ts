/**
 * DecisionIntelligenceEngine.ts
 *
 * Master Direction §46 — Advanced Decision Intelligence
 *
 * วิเคราะห์รูปแบบการตัดสินใจของผู้ใช้จาก PersonalContext และ
 * ให้ framework, bias risk, checklist ที่เหมาะกับ decision style ของพวกเขา
 *
 * กฎ: No mocks — ทุกอย่างคำนวณจาก PersonalContext จริง
 *     ถ้าข้อมูลน้อย → degrade gracefully ด้วย generic guidance
 */

import type { PersonalContext, BlindSpot } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DecisionFramework =
  | 'pros_cons'
  | 'second_order'
  | 'regret_minimization'
  | 'values_alignment'
  | 'consensus'
  | 'gut_check'
  | 'data_driven'
  | 'scenario_planning';

export interface DecisionBiasRisk {
  name: string;
  descriptionThai: string;
  severity: 'low' | 'medium' | 'high';
  /** Specific to this user's blindspots */
  personalizedNote: string | null;
}

export interface DecisionFrameworkRecommendation {
  framework: DecisionFramework;
  nameThai: string;
  descriptionThai: string;
  whenToUseThai: string;
  steps: string[]; // Thai steps
}

export interface DecisionChecklistItem {
  question: string; // Thai
  rationale: string; // Thai — why this matters for THIS user
}

export interface DecisionIntelligenceReport {
  /** Decision style summary */
  styleProfile: {
    type: string;
    strengthsThai: string[];
    watchoutsThai: string[];
    signatureTendencyThai: string;
  };
  /** Bias risks ordered by severity */
  biasRisks: DecisionBiasRisk[];
  /** Recommended frameworks for this user's style */
  recommendedFrameworks: DecisionFrameworkRecommendation[];
  /** Pre-decision checklist personalized to user */
  preDecisionChecklist: DecisionChecklistItem[];
  /** Single insight sentence for UI */
  topInsight: string;
  /** Confidence based on PersonalContext data depth */
  confidence: number;
}

// ─── Framework Library ────────────────────────────────────────────────────────

const FRAMEWORKS: Record<DecisionFramework, Omit<DecisionFrameworkRecommendation, 'framework'>> = {
  pros_cons: {
    nameThai: 'เปรียบข้อดี-ข้อเสีย',
    descriptionThai: 'วิธีคลาสสิก: เขียนข้อดีและข้อเสียออกมาให้หมด แล้วชั่งน้ำหนัก',
    whenToUseThai: 'เมื่อมีตัวเลือก 2–3 ทาง และต้องการความชัดเจนทางตรรกะ',
    steps: [
      'เขียนตัวเลือกทั้งหมด',
      'ใส่ข้อดีและข้อเสียของแต่ละตัวเลือก',
      'ให้น้ำหนักตามความสำคัญ',
      'ดูว่าทางไหน "ชนะ" บนกระดาษ',
      'ตรวจสอบว่า gut feeling ตรงกับผลหรือไม่',
    ],
  },
  second_order: {
    nameThai: 'คิด 2nd Order',
    descriptionThai: 'ไม่แค่ถามว่า "แล้วจะเกิดอะไร" แต่ถามว่า "แล้วหลังจากนั้นจะเกิดอะไร"',
    whenToUseThai: 'เมื่อตัดสินใจเรื่องที่มีผลระยะยาวหรือ cascade effects',
    steps: [
      'ระบุผลทันที (1st order)',
      'ถามว่า "แล้วหลังจากนั้น?" (2nd order)',
      'ถามอีกครั้ง "แล้วหลังจากนั้น?" (3rd order)',
      'ระบุผลที่ไม่ตั้งใจ',
      'ตัดสินใจจากภาพใหญ่',
    ],
  },
  regret_minimization: {
    nameThai: 'Regret Minimization',
    descriptionThai: 'ถามตัวเองว่าตอนอายุ 80 ปี จะเสียใจกับการ "ทำ" หรือการ "ไม่ทำ" มากกว่า',
    whenToUseThai: 'เมื่อตัดสินใจเรื่องใหญ่ในชีวิต หรือเมื่อกลัวความเสี่ยง',
    steps: [
      'ฉายภาพตัวเองอายุ 80 ปี',
      'ถามว่า "ฉันจะเสียใจที่ทำหรือไม่ทำ?"',
      'ระบุว่า action ไหนลด regret มากที่สุด',
      'ลองใจก่อนตัดสินใจจริง',
    ],
  },
  values_alignment: {
    nameThai: 'ตรวจสอบ Values Alignment',
    descriptionThai: 'ตรวจว่าการตัดสินใจนี้สอดคล้องกับค่านิยมหลักของคุณหรือเปล่า',
    whenToUseThai: 'เมื่อรู้สึกขัดแย้งภายในหรือไม่แน่ใจว่าทำถูก',
    steps: [
      'ระบุ top 3 ค่านิยมของคุณ',
      'ถามว่าแต่ละตัวเลือกสนับสนุนหรือขัดแย้งกับค่านิยมไหน',
      'เลือกทางที่ align กับค่านิยมมากที่สุด',
    ],
  },
  consensus: {
    nameThai: 'หาฉันทามติ',
    descriptionThai: 'รวมมุมมองจากคนสำคัญในชีวิตก่อนตัดสินใจ',
    whenToUseThai: 'เมื่อการตัดสินใจกระทบผู้อื่น หรือเมื่อต้องการ buy-in จากคนรอบข้าง',
    steps: [
      'ระบุ stakeholders ที่เกี่ยวข้อง',
      'รับฟังมุมมองแต่ละคน',
      'สังเคราะห์ความเห็น',
      'ตัดสินใจอย่างโปร่งใสและแจ้งให้ทราบ',
    ],
  },
  gut_check: {
    nameThai: 'ตรวจสอบ Gut Feeling',
    descriptionThai: 'ฟัง intuition อย่างมีโครงสร้าง — ไม่ใช่แค่ "รู้สึก" แต่ "เข้าใจว่ารู้สึกอะไร"',
    whenToUseThai: 'เมื่อมีข้อมูลเพียงพอแต่ยังลังเล หรือเมื่อตัวเลขบอกทางหนึ่งแต่ใจบอกอีกทาง',
    steps: [
      'หยุดคิดและฟังความรู้สึก',
      'ถามว่า "ความรู้สึกนี้มาจากอะไร?"',
      'แยกความกลัว vs สัญชาตญาณที่เชื่อถือได้',
      'ใช้ gut feeling เป็น tiebreaker เมื่อข้อมูลเท่ากัน',
    ],
  },
  data_driven: {
    nameThai: 'ใช้ข้อมูลนำ',
    descriptionThai: 'เก็บ data ก่อนตัดสินใจ และกำหนด threshold ล่วงหน้า',
    whenToUseThai: 'เมื่อมีเวลาพอ และการตัดสินใจสามารถวัดผลได้เชิงปริมาณ',
    steps: [
      'กำหนดว่าต้องการข้อมูลอะไร',
      'ตั้ง threshold: "ถ้า X > Y จะทำ"',
      'เก็บข้อมูลให้พอ',
      'ตัดสินใจตาม threshold ที่กำหนดไว้',
      'Review ผลเพื่อ calibrate ครั้งหน้า',
    ],
  },
  scenario_planning: {
    nameThai: 'วางแผน Scenarios',
    descriptionThai: 'วางภาพ 3 สถานการณ์: ดีที่สุด / น่าจะเป็น / แย่ที่สุด',
    whenToUseThai: 'เมื่อ future มีความไม่แน่นอนสูง หรือเมื่อ risk มีหลาย scenario',
    steps: [
      'วาด Best Case Scenario',
      'วาด Most Likely Scenario',
      'วาด Worst Case Scenario',
      'เตรียม contingency สำหรับ Worst Case',
      'ตัดสินใจที่ทนได้กับทุก scenario',
    ],
  },
};

// ─── Bias Risk Library ────────────────────────────────────────────────────────

interface BiasDefinition {
  name: string;
  descriptionThai: string;
  relatedStyles: string[];
  severity: 'low' | 'medium' | 'high';
}

const BIAS_LIBRARY: BiasDefinition[] = [
  {
    name: 'Confirmation Bias',
    descriptionThai: 'มองหาข้อมูลที่สนับสนุนสิ่งที่เชื่ออยู่แล้ว และมองข้ามข้อมูลที่ขัดแย้ง',
    relatedStyles: ['analytical', 'data_driven'],
    severity: 'high',
  },
  {
    name: 'Analysis Paralysis',
    descriptionThai: 'คิดมากจนไม่ตัดสินใจ เพราะกลัวว่าข้อมูลยังไม่พอ',
    relatedStyles: ['analytical'],
    severity: 'medium',
  },
  {
    name: 'Gut Override',
    descriptionThai: 'ใช้ intuition โดยไม่ตรวจสอบด้วยข้อเท็จจริง ทำให้พลาดข้อมูลสำคัญ',
    relatedStyles: ['intuitive'],
    severity: 'medium',
  },
  {
    name: 'Social Proof Bias',
    descriptionThai: 'ตัดสินใจตามสิ่งที่คนรอบข้างทำ แทนที่จะพิจารณาความเหมาะสมส่วนตัว',
    relatedStyles: ['collaborative'],
    severity: 'medium',
  },
  {
    name: 'Status Quo Bias',
    descriptionThai: 'ชอบสิ่งที่คุ้นเคยมากกว่า เลือก default เสมอแม้จะมีทางเลือกที่ดีกว่า',
    relatedStyles: ['mixed', 'analytical'],
    severity: 'medium',
  },
  {
    name: 'Sunk Cost Fallacy',
    descriptionThai: 'ยังคงทำสิ่งที่ไม่ได้ผลต่อไป เพราะลงทุนไปแล้วมาก',
    relatedStyles: ['mixed', 'collaborative', 'analytical'],
    severity: 'high',
  },
  {
    name: 'Overcorrection',
    descriptionThai: 'หลังจากพลาดครั้งใหญ่ มักแกว่งไปสุดขั้วตรงข้าม',
    relatedStyles: ['intuitive', 'mixed'],
    severity: 'low',
  },
  {
    name: 'Recency Bias',
    descriptionThai: 'ให้น้ำหนักเหตุการณ์ล่าสุดมากเกินไป ทำให้มองภาพระยะยาวไม่ชัด',
    relatedStyles: ['mixed', 'intuitive'],
    severity: 'low',
  },
];

// ─── Checklist per decision style ─────────────────────────────────────────────

const CHECKLIST_BY_STYLE: Record<string, string[]> = {
  analytical: [
    'ข้อมูลที่มีอยู่นี้ครบเพียงพอแล้วหรือยัง หรือยังมีช่องว่างสำคัญ?',
    'ถ้าข้อมูลบอกทางหนึ่ง แต่ gut บอกอีกทาง — ฉันจะให้น้ำหนักอย่างไร?',
    'มี assumption อะไรที่ฉันยังไม่ได้ตั้งคำถาม?',
    'ถ้าต้องตัดสินใจภายใน 5 นาที ฉันจะเลือกอะไร?',
  ],
  intuitive: [
    'ความรู้สึกนี้มาจากประสบการณ์จริง หรือจากความกลัว?',
    'ฉันได้รับฟังมุมมองที่แตกต่างจาก intuition ของตัวเองแล้วหรือยัง?',
    'มีข้อมูลสำคัญอะไรที่ฉันอาจมองข้ามไปบ้าง?',
    'ถ้าคนที่ฉันไว้ใจสุดๆ มองเรื่องนี้ พวกเขาจะเห็นอะไรที่ฉันไม่เห็น?',
  ],
  collaborative: [
    'ฉันกำลังตัดสินใจตาม consensus หรือเพราะนี่คือทางที่ถูกต้องสำหรับฉัน?',
    'มีมุมมองสำคัญที่ยังไม่ได้ยิน?',
    'ถ้าต้องตัดสินใจคนเดียว ฉันจะเลือกอะไร?',
    'ใครที่ได้รับผลกระทบโดยตรงและยังไม่ได้มีส่วนร่วม?',
  ],
  mixed: [
    'ฉันได้ใช้ทั้งข้อมูลและ intuition ประกอบการตัดสินใจนี้หรือยัง?',
    'ถ้าย้อนเวลาไปดูการตัดสินใจนี้ใน 1 ปี ฉันจะรู้สึกอย่างไร?',
    'ฉันมีความชัดเจนพอที่จะตัดสินใจตอนนี้หรือควรรอ?',
    'สิ่งที่ฉันกลัวที่สุดในการตัดสินใจนี้คืออะไร — และมันสมเหตุสมผลไหม?',
  ],
};

// ─── DecisionIntelligenceEngine ───────────────────────────────────────────────

export class DecisionIntelligenceEngine {

  analyze(ctx: PersonalContext): DecisionIntelligenceReport {
    const style = ctx.decisionStyle?.type ?? 'mixed';
    const confidence = ctx.confidenceOverall ?? 0.3;

    // ── Style Profile ──────────────────────────────────────────────────────
    const styleProfiles: Record<string, {
      strengthsThai: string[];
      watchoutsThai: string[];
      signatureTendencyThai: string;
    }> = {
      analytical: {
        strengthsThai: [
          'มองเห็น pattern และ data ที่คนอื่นมองข้าม',
          'ตัดสินใจบนพื้นฐานที่มีเหตุมีผล ไม่ถูก emotion ครอบงำง่าย',
          'สามารถอธิบายเหตุผลของการตัดสินใจได้อย่างชัดเจน',
        ],
        watchoutsThai: [
          'อาจ "คิดมากเกินไป" จนไม่ลงมือทำ',
          'มีความเสี่ยง confirmation bias สูง',
          'อาจมองข้าม emotional context ที่สำคัญ',
        ],
        signatureTendencyThai: 'คุณมักต้องการข้อมูลเพิ่มขึ้นก่อนจะตัดสินใจ — นี่คือทั้งความแข็งแกร่งและจุดอ่อนในเวลาเดียวกัน',
      },
      intuitive: {
        strengthsThai: [
          'ตัดสินใจได้เร็วในสถานการณ์ที่ต้องการความคล่องตัว',
          'มักจับ signal สำคัญที่ข้อมูลยังวัดไม่ได้',
          'เชื่อมโยงประสบการณ์อดีตกับปัจจุบันได้ดี',
        ],
        watchoutsThai: [
          'Gut feeling บางครั้งเป็น fear ในชุดของ intuition',
          'อาจพลาดข้อมูลสำคัญที่ต้องใช้เวลาวิเคราะห์',
          'ยากต่อการอธิบายเหตุผลให้คนอื่นเข้าใจ',
        ],
        signatureTendencyThai: 'คุณมักรู้คำตอบก่อนที่จะรู้เหตุผล — ความสามารถนี้ทรงพลังมากถ้าได้รับการฝึกฝน',
      },
      collaborative: {
        strengthsThai: [
          'ตัดสินใจแล้วมี buy-in จากคนรอบข้างสูง',
          'มักพิจารณามุมมองที่หลากหลายก่อนตัดสินใจ',
          'สร้างความไว้วางใจในกระบวนการ',
        ],
        watchoutsThai: [
          'อาจถูก social pressure ดึงออกจากทิศทางที่ถูกต้อง',
          'กระบวนการอาจช้ากว่าจำเป็น',
          'ยากต่อการตัดสินใจในสถานการณ์ที่ต้องทำคนเดียว',
        ],
        signatureTendencyThai: 'คุณเติบโตได้ดีในกระบวนการที่มีการมีส่วนร่วม แต่ต้องระวังอย่าสูญเสียเสียงตัวเองในกระบวนการนั้น',
      },
      mixed: {
        strengthsThai: [
          'ปรับ approach ได้ตามสถานการณ์',
          'ไม่ยึดติดกับวิธีเดียว',
          'มักหา balance ระหว่างข้อมูลและ intuition ได้ดี',
        ],
        watchoutsThai: [
          'บางครั้งไม่แน่ใจว่าควรใช้วิธีไหน',
          'อาจถูกดึงไปหลายทิศทางพร้อมกัน',
          'ต้องการ framework ชัดเจนในสถานการณ์ซับซ้อน',
        ],
        signatureTendencyThai: 'ความยืดหยุ่นของคุณเป็นจุดแข็ง — แต่ในบางครั้งการมี "go-to framework" จะช่วยตัดสินใจได้เร็วและมั่นใจขึ้น',
      },
    };

    const styleData = styleProfiles[style] ?? styleProfiles['mixed'];

    // ── Bias Risks ─────────────────────────────────────────────────────────
    const relevantBiases = BIAS_LIBRARY.filter((b) => b.relatedStyles.includes(style));

    const biasRisks: DecisionBiasRisk[] = relevantBiases.map((b) => {
      // ตรวจว่ามี blindspot ที่เกี่ยวข้องหรือเปล่า
      const related = ctx.blindSpots.find((bs: BlindSpot) =>
        bs.title.toLowerCase().includes(b.name.toLowerCase().split(' ')[0]) ||
        b.name.toLowerCase().includes(bs.title.toLowerCase().split(' ')[0])
      );

      return {
        name: b.name,
        descriptionThai: b.descriptionThai,
        severity: b.severity,
        personalizedNote: related
          ? `AI ตรวจพบ pattern ที่เกี่ยวข้องกับ "${related.title}" ในประวัติของคุณ`
          : null,
      };
    }).sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    });

    // ── Recommended Frameworks ─────────────────────────────────────────────
    const frameworksByStyle: Record<string, DecisionFramework[]> = {
      analytical:    ['data_driven', 'pros_cons', 'scenario_planning', 'second_order'],
      intuitive:     ['gut_check', 'regret_minimization', 'values_alignment', 'pros_cons'],
      collaborative: ['consensus', 'values_alignment', 'pros_cons', 'scenario_planning'],
      mixed:         ['values_alignment', 'second_order', 'regret_minimization', 'pros_cons'],
    };

    const frameworkKeys = frameworksByStyle[style] ?? frameworksByStyle['mixed'];
    const recommendedFrameworks: DecisionFrameworkRecommendation[] = frameworkKeys.slice(0, 3).map((key) => ({
      framework: key,
      ...FRAMEWORKS[key],
    }));

    // ── Pre-decision Checklist ─────────────────────────────────────────────
    const checklistQuestions = CHECKLIST_BY_STYLE[style] ?? CHECKLIST_BY_STYLE['mixed'];

    const preDecisionChecklist: DecisionChecklistItem[] = checklistQuestions.map((q, i) => ({
      question: q,
      rationale: i === 0
        ? `เพราะ decision style "${style}" ของคุณมักมีจุดอ่อนในด้านนี้`
        : `เพื่อให้มั่นใจว่าการตัดสินใจนี้ผ่านการตรวจสอบจากหลายมุม`,
    }));

    // ── Top Insight ────────────────────────────────────────────────────────
    const topInsight = styleData.signatureTendencyThai;

    return {
      styleProfile: {
        type: style,
        ...styleData,
      },
      biasRisks,
      recommendedFrameworks,
      preDecisionChecklist,
      topInsight,
      confidence,
    };
  }
}

export default DecisionIntelligenceEngine;
