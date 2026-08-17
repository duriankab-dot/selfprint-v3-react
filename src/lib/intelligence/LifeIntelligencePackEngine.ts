/**
 * LifeIntelligencePackEngine.ts
 *
 * Master Direction §46 — Life Intelligence Packs
 *
 * ให้ bundled insights สำหรับแต่ละ life domain (hub) ที่ผู้ใช้สนใจ
 * แต่ละ Pack ประกอบด้วย: key_questions, growth_areas, insight_prompts, recommended_actions
 *
 * กฎ: No mocks — ทุก pack personalized จาก PersonalContext จริง
 *     Degrade gracefully ถ้าไม่มีข้อมูล hub นั้นใน context
 */

import type { PersonalContext } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LifeHub =
  | 'identity'
  | 'career'
  | 'relationship'
  | 'health'
  | 'money'
  | 'creativity'
  | 'learning'
  | 'spirituality'
  | 'impact'
  | 'decision'
  | 'activities'
  | 'ai-twin';

export interface LifeIntelligencePack {
  hub: LifeHub;
  hubNameThai: string;
  hubEmoji: string;
  /** คำถามสำคัญที่ควรถามตัวเองเกี่ยวกับ hub นี้ */
  keyQuestions: string[];
  /** พื้นที่การเติบโตที่น่าสำรวจ */
  growthAreas: string[];
  /** Prompt สำหรับ reflection / journaling */
  insightPrompts: string[];
  /** Action ที่แนะนำ (concrete, doable) */
  recommendedActions: string[];
  /** ความเกี่ยวข้องกับ PersonalContext ของผู้ใช้ (0–1) */
  relevanceScore: number;
  /** หมายเหตุถ้า personalization มาจาก context จริง */
  personalizedNote: string | null;
}

export interface LifeIntelligenceReport {
  packs: LifeIntelligencePack[];
  /** Hub ที่ active อยู่ตาม context */
  activHubs: LifeHub[];
  /** Hub แนะนำที่ยังไม่ได้ active */
  suggestedHubs: LifeHub[];
  /** Hub ที่ score relevance สูงสุด */
  topFocusHub: LifeHub | null;
}

// ─── Hub metadata ─────────────────────────────────────────────────────────────

const HUB_META: Record<LifeHub, { nameThai: string; emoji: string }> = {
  identity:     { nameThai: 'ตัวตน',             emoji: '🪞' },
  career:       { nameThai: 'อาชีพ',             emoji: '💼' },
  relationship: { nameThai: 'ความสัมพันธ์',      emoji: '❤️' },
  health:       { nameThai: 'สุขภาพ',            emoji: '💪' },
  money:        { nameThai: 'การเงิน',           emoji: '💰' },
  creativity:   { nameThai: 'ความคิดสร้างสรรค์', emoji: '🎨' },
  learning:     { nameThai: 'การเรียนรู้',       emoji: '📚' },
  spirituality: { nameThai: 'จิตใจ',             emoji: '🧘' },
  impact:       { nameThai: 'ผลกระทบ',          emoji: '🌍' },
  decision:     { nameThai: 'การตัดสินใจ',       emoji: '🧭' },
  activities:   { nameThai: 'กิจกรรม',           emoji: '⚡' },
  'ai-twin':    { nameThai: 'AI Twin',           emoji: '🤖' },
};

// ─── Base pack templates (generic — will be merged with personalized data) ────

type BasePackTemplate = {
  keyQuestions: string[];
  growthAreas: string[];
  insightPrompts: string[];
  recommendedActions: string[];
};

const BASE_PACKS: Record<LifeHub, BasePackTemplate> = {
  identity: {
    keyQuestions: [
      'ค่านิยมที่สำคัญที่สุดของฉันในชีวิตตอนนี้คืออะไร?',
      'ฉันเป็นใครในสายตาของคนที่รักฉันมากที่สุด?',
      'มีส่วนไหนของตัวตนที่ฉันยังไม่ได้ explore?',
    ],
    growthAreas: [
      'ความชัดเจนในค่านิยมหลัก',
      'การรู้จักตัวเองผ่าน feedback ของผู้อื่น',
      'การแสดงตัวตนจริงในสังคม',
    ],
    insightPrompts: [
      'บรรยายตัวเองด้วย 5 คำ — แล้วถามว่าคำเหล่านั้นมาจากไหน',
      'เล่าถึงช่วงเวลาที่คุณรู้สึกว่าเป็นตัวเองมากที่สุด',
    ],
    recommendedActions: [
      'เขียน Personal Values Statement ฉบับร่าง',
      'ขอ feedback จากคนใกล้ชิด 3 คนว่าพวกเขาเห็นจุดแข็งอะไรในตัวคุณ',
    ],
  },
  career: {
    keyQuestions: [
      'งานที่ฉันทำอยู่ตอบสนอง "ทำไม" ของฉันหรือเปล่า?',
      'ทักษะไหนของฉันที่ตลาดต้องการและฉันชอบทำ?',
      'ถ้าไม่กลัวล้มเหลว ฉันจะทำอะไร?',
    ],
    growthAreas: [
      'Skill gaps ที่ต้องปิดเพื่อก้าวหน้า',
      'Networking และการสร้าง visibility',
      'Work-life integration (ไม่ใช่ balance)',
    ],
    insightPrompts: [
      'เล่าถึงวันทำงานที่คุณลืมเวลา — คุณกำลังทำอะไรอยู่?',
      'ถ้าคุณสามารถออกแบบงานในฝันได้ มันหน้าตาเป็นอย่างไร?',
    ],
    recommendedActions: [
      'ทำ skills inventory: แยก "ทำได้" vs "ชอบทำ" vs "คนต้องการ"',
      'คุยกับ mentor หรือ role model ใน career path ที่อยากไป',
    ],
  },
  relationship: {
    keyQuestions: [
      'ความสัมพันธ์ไหนในชีวิตฉันที่ทำให้ฉัน "ชาร์จ" พลัง?',
      'ฉันสื่อสารความต้องการของตัวเองได้ดีแค่ไหน?',
      'มีความสัมพันธ์ไหนที่ฉันต้องลงทุนมากกว่านี้?',
    ],
    growthAreas: [
      'การฟังอย่างลึกซึ้ง (deep listening)',
      'การกำหนดขอบเขตที่ชัดเจน (boundaries)',
      'การแสดงความรัก/ขอบคุณอย่างสม่ำเสมอ',
    ],
    insightPrompts: [
      'เล่าถึงความสัมพันธ์ที่ดีที่สุดในชีวิต — อะไรทำให้มันดี?',
      'ถ้าคนใกล้ชิดคุณอธิบายวิธีที่คุณรัก มันจะฟังดูอย่างไร?',
    ],
    recommendedActions: [
      'ส่ง "appreciation message" ให้คนสำคัญ 1 คนที่ไม่ได้บอกนานแล้ว',
      'กำหนดเวลา quality time กับคนที่สำคัญในปฏิทิน',
    ],
  },
  health: {
    keyQuestions: [
      'ร่างกายของฉันกำลังบอกอะไรฉันที่ฉันยังไม่ได้ฟัง?',
      'สิ่งไหนที่ทำแล้วรู้สึก "มีพลัง" ทางร่างกายมากที่สุด?',
      'นิสัยสุขภาพที่ฉันรู้ว่าควรทำแต่ยังไม่ทำคืออะไร?',
    ],
    growthAreas: [
      'Sleep quality และ recovery',
      'Movement ที่เหมาะกับ lifestyle',
      'Mental health และ stress management',
    ],
    insightPrompts: [
      'ในช่วงที่คุณรู้สึก "สุขภาพดี" ที่สุด ชีวิตหน้าตาเป็นอย่างไร?',
      'อะไรคืออุปสรรคหลักที่ขัดขวางคุณจากการดูแลสุขภาพ?',
    ],
    recommendedActions: [
      'เลือก 1 นิสัยสุขภาพที่จะเริ่มต้นสัปดาห์นี้ (เล็กพอที่จะทำได้จริง)',
      'Track energy level 3 วัน เพื่อดู pattern',
    ],
  },
  money: {
    keyQuestions: [
      'ความสัมพันธ์ของฉันกับเงินเป็นอย่างไร — กลัว ตื่นเต้น หรือไม่สนใจ?',
      'ฉันใช้เงินสอดคล้องกับค่านิยมของตัวเองหรือเปล่า?',
      'เป้าหมายทางการเงิน 1 ปีของฉันคืออะไร?',
    ],
    growthAreas: [
      'Financial literacy พื้นฐาน',
      'การ invest ใน asset ที่เหมาะกับ risk tolerance',
      'การสร้าง income stream หลากหลาย',
    ],
    insightPrompts: [
      'ย้อนดูค่าใช้จ่ายเดือนที่แล้ว — มีอะไรที่ surprise คุณบ้าง?',
      'ถ้ามีเงิน 1 ล้านบาทเพิ่มขึ้นมาทันที คุณจะทำอะไรกับมัน?',
    ],
    recommendedActions: [
      'ตั้ง "financial goal" 1 ข้อที่ต้องการบรรลุใน 6 เดือน',
      'ทำ budget review ทุกเดือนอย่างน้อย 15 นาที',
    ],
  },
  creativity: {
    keyQuestions: [
      'ความคิดสร้างสรรค์แสดงออกมาในชีวิตฉันอย่างไรบ้าง?',
      'มีโปรเจกต์สร้างสรรค์ที่ฉันอยากทำแต่ยังไม่ได้เริ่มไหม?',
      'อะไรทำให้ฉัน "flow" ในงานสร้างสรรค์?',
    ],
    growthAreas: [
      'การ protect เวลาสำหรับ creative work',
      'การทดลองกับ medium ใหม่',
      'การเผยแพร่งานสร้างสรรค์ให้คนอื่นเห็น',
    ],
    insightPrompts: [
      'บรรยายช่วงเวลาที่คุณรู้สึก "creative" ที่สุดในชีวิต',
      'ถ้าคุณไม่กลัวถูกตัดสิน คุณจะสร้างอะไร?',
    ],
    recommendedActions: [
      'จัดสรร 30 นาที/สัปดาห์สำหรับ creative time ที่ไม่มี output requirement',
      'เริ่ม side project เล็กๆ ที่ทำสนุกโดยไม่สนว่าจะ "ดี" ไหม',
    ],
  },
  learning: {
    keyQuestions: [
      'สิ่งที่อยากเรียนรู้มากที่สุดตอนนี้คืออะไร?',
      'ฉันเรียนรู้ได้ดีที่สุดในรูปแบบไหน — อ่าน ฟัง ดู หรือลงมือทำ?',
      'มีทักษะอะไรที่ถ้าเรียนรู้แล้วจะ unlock อีกหลายอย่างตามมา?',
    ],
    growthAreas: [
      'Spaced repetition และ active recall',
      'การเรียนรู้ข้ามสาขา (cross-domain learning)',
      'การสอนคนอื่นเพื่อทดสอบความเข้าใจตัวเอง',
    ],
    insightPrompts: [
      'อะไรที่คุณเรียนรู้ในช่วง 6 เดือนที่ผ่านมาและยังใช้อยู่ทุกวัน?',
      'ใครที่เป็น "teacher" ที่ดีที่สุดในชีวิตคุณ และทำไม?',
    ],
    recommendedActions: [
      'เลือก 1 ทักษะที่จะ deep dive ใน 30 วันนี้',
      'สรุปสิ่งที่เรียนรู้ประจำสัปดาห์ด้วย 3 ประโยค',
    ],
  },
  spirituality: {
    keyQuestions: [
      '"ความหมาย" ของชีวิตคุณคืออะไร?',
      'อะไรทำให้คุณรู้สึก "เชื่อมต่อ" กับบางสิ่งที่ใหญ่กว่าตัวเอง?',
      'practices อะไรที่ทำให้คุณรู้สึก grounded?',
    ],
    growthAreas: [
      'การปฏิบัติ mindfulness หรือ meditation อย่างสม่ำเสมอ',
      'การสำรวจความเชื่อและค่านิยมลึกๆ',
      'การเชื่อมต่อกับชุมชนที่มีคุณค่าร่วมกัน',
    ],
    insightPrompts: [
      'เล่าถึงช่วงเวลาที่คุณรู้สึก "ใหญ่กว่าตัวเอง" — มันเกิดขึ้นเมื่อไหร่?',
      'ถ้าชีวิตคุณเป็นบทเรียนให้คนรุ่นถัดไป มันสอนอะไร?',
    ],
    recommendedActions: [
      'ลอง meditation 5 นาที/วัน เป็นเวลา 7 วัน',
      'เขียน gratitude journal 3 รายการทุกเช้า',
    ],
  },
  impact: {
    keyQuestions: [
      'ฉันอยากเปลี่ยนแปลงอะไรในโลก — แม้แต่ในระดับเล็กๆ?',
      'skills ของฉันสามารถช่วยใครได้บ้างที่ฉันยังไม่ได้ช่วย?',
      '"legacy" ที่ฉันอยากทิ้งไว้คืออะไร?',
    ],
    growthAreas: [
      'การกำหนด impact ที่ชัดเจนและวัดได้',
      'การ leverage network เพื่อขยาย impact',
      'การเชื่อมโยง work กับ purpose ที่ใหญ่กว่า',
    ],
    insightPrompts: [
      'บรรยายครั้งที่คุณช่วยใครสักคนและรู้สึกว่ามันสำคัญมาก',
      'ถ้าคุณมีเวลา 10 ชั่วโมง/สัปดาห์เพิ่มขึ้น คุณจะใช้ทำอะไรเพื่อผู้อื่น?',
    ],
    recommendedActions: [
      'ระบุ "micro-impact" 1 อย่างที่ทำได้ภายในสัปดาห์นี้',
      'หา cause หรือ community ที่ align กับค่านิยมของคุณ',
    ],
  },
  decision: {
    keyQuestions: [
      'การตัดสินใจที่ยากที่สุดในชีวิตตอนนี้คืออะไร?',
      'ฉันมี bias อะไรที่อาจกระทบการตัดสินใจของฉัน?',
      'ฉันตัดสินใจดีที่สุดเมื่อไหร่ — เมื่อมีข้อมูลเพียงพอ หรือเมื่อเชื่อ gut?',
    ],
    growthAreas: [
      'Decision frameworks ที่เหมาะกับ style ของตัวเอง',
      'การรู้จัก cognitive bias ของตัวเอง',
      'Post-decision review เพื่อเรียนรู้จากผลลัพธ์',
    ],
    insightPrompts: [
      'เล่าถึงการตัดสินใจที่ดีที่สุดในชีวิต — คุณตัดสินใจอย่างไร?',
      'การตัดสินใจที่คุณเสียใจที่สุด — บทเรียนคืออะไร?',
    ],
    recommendedActions: [
      'สร้าง decision journal — บันทึกการตัดสินใจ + เหตุผล + ผลลัพธ์',
      'ก่อนตัดสินใจใหญ่ครั้งถัดไป ลองถามตัวเองว่า "ตอนอายุ 80 จะรู้สึกอย่างไร?"',
    ],
  },
  activities: {
    keyQuestions: [
      'กิจกรรมไหนที่ทำให้ฉันรู้สึก "alive"?',
      'มีสิ่งที่อยากลองทำมานานแต่ยังไม่ได้เริ่มไหม?',
      'ฉัน balance ระหว่าง "สนุก" และ "เติบโต" ได้ดีแค่ไหน?',
    ],
    growthAreas: [
      'การหา activities ที่เป็น flow state',
      'การลองกิจกรรมใหม่ที่ stretch comfort zone เล็กน้อย',
      'การ integrate กิจกรรมที่ชอบเข้ากับเป้าหมายชีวิต',
    ],
    insightPrompts: [
      'เล่าถึงวันหยุดที่สนุกที่สุดในชีวิต — คุณทำอะไร?',
      'ถ้ามี 1 เดือนว่างและไม่ต้องกังวลเรื่องเงิน คุณจะทำอะไร?',
    ],
    recommendedActions: [
      'เพิ่ม 1 activity ใหม่เข้าไปในตารางเดือนนี้',
      'ชวนคนที่ไม่ได้เจอนานไปทำกิจกรรมด้วยกัน',
    ],
  },
  'ai-twin': {
    keyQuestions: [
      'ฉันต้องการให้ AI Twin ช่วยเรื่องอะไรมากที่สุด?',
      'ข้อมูลอะไรที่ AI Twin ยังไม่รู้เกี่ยวกับฉัน แต่ควรรู้?',
      'ฉัน comfortable กับระดับไหนที่ AI จะรู้จักฉัน?',
    ],
    growthAreas: [
      'การสอน Twin ให้รู้จักตัวตนผ่าน reflection สม่ำเสมอ',
      'การใช้ Twin เป็น thinking partner แทน answer machine',
      'การ review และ update Personal Context ให้ accurate',
    ],
    insightPrompts: [
      'ถ้า Twin คือ "ฉันเวอร์ชันที่ดีที่สุด" มันจะพูดอะไรกับฉันตอนนี้?',
      'อะไรที่คุณอยากให้ Twin เตือนเมื่อคุณออกนอกทางจาก values?',
    ],
    recommendedActions: [
      'เพิ่ม reflection ใหม่อย่างน้อย 1 ครั้ง/สัปดาห์',
      'Review Personal Model ใน Intelligence Hub ทุก 2 สัปดาห์',
    ],
  },
};

// ─── LifeIntelligencePackEngine ───────────────────────────────────────────────

export class LifeIntelligencePackEngine {

  /**
   * Generate all 12 life intelligence packs for the user.
   * Packs are personalized if PersonalContext has relevant data for that hub.
   */
  generate(ctx: PersonalContext): LifeIntelligenceReport {
    const activeHubs = (ctx.hubsActive ?? []) as LifeHub[];
    const allHubs = Object.keys(HUB_META) as LifeHub[];
    const suggestedHubs = allHubs.filter((h) => !activeHubs.includes(h)).slice(0, 3);

    const packs = allHubs.map((hub) => this.buildPack(hub, ctx, activeHubs));

    // Sort: active hubs first, then by relevance
    packs.sort((a, b) => {
      const aActive = activeHubs.includes(a.hub) ? 1 : 0;
      const bActive = activeHubs.includes(b.hub) ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return b.relevanceScore - a.relevanceScore;
    });

    const topFocusHub = packs[0]?.hub ?? null;

    return { packs, activHubs: activeHubs, suggestedHubs, topFocusHub };
  }

  /**
   * Generate pack for a specific hub.
   */
  generateForHub(hub: LifeHub, ctx: PersonalContext): LifeIntelligencePack {
    return this.buildPack(hub, ctx, (ctx.hubsActive ?? []) as LifeHub[]);
  }

  private buildPack(
    hub: LifeHub,
    ctx: PersonalContext,
    activeHubs: LifeHub[]
  ): LifeIntelligencePack {
    const base = BASE_PACKS[hub];
    const meta = HUB_META[hub];
    const isActive = activeHubs.includes(hub);

    // Compute relevance from context
    const relevanceScore = this.computeRelevance(hub, ctx, isActive);

    // Personalization: inject user's specific data into questions/actions
    const { keyQuestions, recommendedActions, personalizedNote } =
      this.personalize(hub, ctx, base);

    return {
      hub,
      hubNameThai: meta.nameThai,
      hubEmoji: meta.emoji,
      keyQuestions,
      growthAreas: base.growthAreas,
      insightPrompts: base.insightPrompts,
      recommendedActions,
      relevanceScore,
      personalizedNote,
    };
  }

  private computeRelevance(hub: LifeHub, ctx: PersonalContext, isActive: boolean): number {
    let score = isActive ? 0.5 : 0.2;

    // Goals related to hub
    const goalMatches = ctx.goals.filter((g) => g.relatedHub === hub).length;
    score += goalMatches * 0.1;

    // Values that semantically map to hub (simple keyword check)
    const hubKeywords: Record<LifeHub, string[]> = {
      identity:     ['ตัวตน', 'identity', 'self', 'ตัวเอง'],
      career:       ['งาน', 'career', 'อาชีพ', 'business'],
      relationship: ['ความสัมพันธ์', 'relationship', 'ครอบครัว', 'family', 'เพื่อน'],
      health:       ['สุขภาพ', 'health', 'fitness', 'พลังงาน'],
      money:        ['เงิน', 'money', 'การเงิน', 'finance'],
      creativity:   ['สร้างสรรค์', 'creative', 'art', 'ศิลปะ'],
      learning:     ['เรียนรู้', 'learning', 'growth', 'พัฒนา'],
      spirituality: ['จิตใจ', 'spirit', 'mindful', 'ความหมาย'],
      impact:       ['impact', 'ผลกระทบ', 'สังคม', 'community'],
      decision:     ['ตัดสินใจ', 'decision', 'choice'],
      activities:   ['กิจกรรม', 'activities', 'hobby', 'สนุก'],
      'ai-twin':    ['twin', 'ai', 'digital'],
    };

    const keywords = hubKeywords[hub];
    const valueMatches = ctx.values.filter((v) =>
      keywords.some((k) => v.name.toLowerCase().includes(k.toLowerCase()))
    ).length;
    score += valueMatches * 0.05;

    return Math.min(1, score);
  }

  private personalize(
    hub: LifeHub,
    ctx: PersonalContext,
    base: BasePackTemplate
  ): { keyQuestions: string[]; recommendedActions: string[]; personalizedNote: string | null } {
    let keyQuestions = [...base.keyQuestions];
    let recommendedActions = [...base.recommendedActions];
    let personalizedNote: string | null = null;

    // Inject user's top strength into career/identity packs
    if ((hub === 'career' || hub === 'identity') && ctx.strengths.length > 0) {
      const topStrength = ctx.strengths[0].name;
      keyQuestions = [
        `"${topStrength}" ของคุณสามารถนำมาใช้ใน ${HUB_META[hub].nameThai} อย่างไรได้บ้าง?`,
        ...keyQuestions.slice(0, 2),
      ];
      personalizedNote = `personalized จาก strength: "${topStrength}"`;
    }

    // Inject user's top goal into relevant hub
    const relatedGoal = ctx.goals.find((g) => g.relatedHub === hub);
    if (relatedGoal) {
      recommendedActions = [
        `ก้าวต่อไปสำหรับเป้าหมาย "${relatedGoal.title}": วางแผน next action ที่เล็กที่สุดที่ทำได้วันนี้`,
        ...recommendedActions.slice(0, 1),
      ];
      personalizedNote = personalizedNote
        ? `${personalizedNote}; goal: "${relatedGoal.title}"`
        : `personalized จาก goal: "${relatedGoal.title}"`;
    }

    // Inject blindspot warning for decision hub
    if (hub === 'decision' && ctx.blindSpots.length > 0) {
      const topBlind = ctx.blindSpots.find((b) => b.sensitivityLevel !== 'high');
      if (topBlind) {
        keyQuestions = [
          `"${topBlind.title}" กำลังส่งผลต่อการตัดสินใจของฉันอย่างไร?`,
          ...keyQuestions.slice(0, 2),
        ];
        personalizedNote = `personalized จาก blindspot: "${topBlind.title}"`;
      }
    }

    return { keyQuestions, recommendedActions, personalizedNote };
  }
}

export default LifeIntelligencePackEngine;
