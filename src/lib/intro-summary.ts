/**
 * intro-summary.ts
 *
 * Chronopsychology Narrative Generator — translates Vedic astrology / Panchang
 * outputs into scientific/chronopsychology language for UI display.
 *
 * STRICT RULES: No fortune-telling terms allowed in output.
 * Replaced mappings:
 *   ฤกษ์มงคลนาทีทอง → Accelerated Phase Window
 *   ช่วงเวลากาลกิณี → High Friction Interval
 *   สีมงคลประจำวัน → Circadian Color Alignment
 *   โชคลาภ → External Attraction Vector
 *   คนอุปถัมภ์/สายเปย์ → Relational Resonance Graph (Analytical Nodes)
 *   ศัตรู/คนคิดร้าย → Social Friction Intercept
 */

import type { InitialDisciplines } from './astrology.js';

// ─── System Prompt Spec ──────────────────────────────────────────────────────

export const CHRONOPSYCHOLOGY_SYSTEM_PROMPT = `คุณคือระบบ AI ผู้เชี่ยวชาญด้านจิตวิทยากาลเวลา (Chronopsychology) และการออกแบบประสบการณ์ผู้ใช้ (UX Psychology)

หน้าที่ของคุณคือแปลงข้อมูลผลลัพธ์ที่คำนวณได้จากระบบเบื้องหลัง (ที่มาจากฐานดวงรายวัน, ฤกษ์มงคล, ช่วงเวลากาลกิณี, และสีมงคลประจำวัน) ให้กลายเป็นภาษาเทคโนโลยีและการบริหารประสิทธิภาพชีวิตส่วนบุคคล

[ข้อกำหนดด้านคำศัพท์ - STRICT RULES]
ห้ามใช้คำเหล่านี้เด็ดขาด:
ดูดวง, โชคชะตา, พระเวท, มูเตลู, ราหู, ดวงตก, ดวงดี, แม่นๆ, หมอดู, ราศี, เทวดา, เคราะห์กรรม, ศัตรู, เจ้ากรรมนายเวร, ลาภลอย, เนื้อคู่

จงใช้คำทดแทนเชิงวิทยาศาสตร์ระบบ:
• ฤกษ์มงคลนาทีทอง ➡️ หน้าต่างจังหวะเร่งประสิทธิภาพ (Accelerated Phase Window)
• ช่วงเวลากาลกิณี/ข้อควรระวังรายวัน ➡️ ช่วงสภาวะแรงต้านแวดล้อมสูง (High Friction Interval)
• สีมงคลประจำวัน ➡️ ความถี่คลื่นแสงปรับสมดุลพฤติกรรม (Circadian Color Alignment)
• โชคลาภ / เงินทองวิ่งเข้าหา ➡️ ดัชนีแรงดึงดูดวัตถุและโอกาสภายนอก (External Attraction Vector)
• คนอุปถัมภ์ / สายเปย์ / ตัวช่วย ➡️ คลื่นความสัมพันธ์ส่งเสริมกลุ่มตรรกะ (Relational Resonance Graph: Analytical Nodes)
• ศัตรู / คนคิดร้าย / ขัดลาภ ➡️ ดัชนีแรงเสียดทานจากบุคคลภายนอก (Social Friction Intercept)

จัดโครงสร้างข้อมูลให้สั้น กระชับ เป็นท่อนสั้นๆ เน้นตัวเลขเปอร์เซ็นต์และช่วงเวลาที่ชัดเจน เพื่อให้ผู้ใช้นำไปใช้วางแผนชีวิตประจำวันได้ทันที`;

// ─── Forbidden words list (for validation) ───────────────────────────────────

export const FORBIDDEN_WORDS_TH = [
  'ดูดวง', 'โชคชะตา', 'พระเวท', 'มูเตลู', 'ราหู', 'ดวงตก', 'ดวงดี',
  'แม่นๆ', 'หมอดู', 'ราศี', 'เทวดา', 'เคราะห์กรรม', 'ศัตรู',
  'เจ้ากรรมนายเวร', 'ลาภลอย', 'เนื้อคู่',
];

export const FORBIDDEN_WORDS_EN = [
  'fortune telling', 'destiny', 'vedic', 'superstition', 'rahu',
  'bad luck', 'good luck', 'predictor', 'zodiac sign', 'deity',
  'karma', 'enemy', 'past life debt', 'windfall', 'soulmate',
];

// ─── Narrative builders ──────────────────────────────────────────────────────

export function buildDailyNarrative(disciplines: InitialDisciplines): DailyNarrative {
  return {
    acceleratedPhase: {
      start: disciplines.dailyAcceleratedPhaseStart ?? '--:--',
      end: disciplines.dailyAcceleratedPhaseEnd ?? '--:--',
      descriptionTh: 'ช่วงเวลาที่สมองเข้าสู่โหมดลื่นไหลสูงสุด เหมาะแก่การยื่นข้อเสนอ ปิดดีลสำคัญ หรือเจรจาผลประโยชน์',
      descriptionEn: 'Peak cognitive flow state — optimal for proposals, deal closure, or high-stakes negotiations',
    },
    highFrictionInterval: {
      start: disciplines.dailyHighFrictionStart ?? '--:--',
      end: disciplines.dailyHighFrictionEnd ?? '--:--',
      descriptionTh: 'ตรวจพบแรงต้านทางอารมณ์จากสิ่งแวดล้อมรอบตัว ระวังการปะทะ แนะนำให้ลดความเร็วในการตัดสินใจ',
      descriptionEn: 'Elevated environmental emotional resistance detected. Exercise caution; reduce decision-making velocity',
    },
    circadianColor: {
      name: disciplines.dailyCircadianColorNameTh ?? '',
      hex: disciplines.dailyCircadianColorHex ?? '#8FBC8F',
      descriptionTh: 'การเปิดรับหรือใช้สีนี้ในพื้นที่ทำงานวันนี้ จะช่วยลดแรงกระตุ้นประจุลบ และเพิ่มสมาธิในการวิเคราะห์',
      descriptionEn: 'Exposure to this color reduces negative charge stimulation and enhances analytical focus today',
    },
    attractionVector: disciplines.dailyAttractionVectorScore ?? 50,
    relationalResonance: {
      descriptionTh: 'วันนี้คลื่นความถี่ของคุณเปิดรับการส่งเสริมจากผู้ที่มีลักษณะตรรกะสูง (Analytical Nodes) การปรึกษาหรือทำงานร่วมกับคนกลุ่มนี้จะช่วยขยายผลลัพธ์ได้ทวีคูณ',
      descriptionEn: 'Your frequency band is open to support from highly analytical individuals. Collaboration amplifies outcomes exponentially.',
    },
    socialFriction: {
      start: disciplines.dailyHighFrictionStart ?? '--:--',
      end: disciplines.dailyHighFrictionEnd ?? '--:--',
      descriptionTh: 'ตรวจพบสัญญาณแรงเสียดทานทางอารมณ์จากบุคคลรอบข้างในช่วงเวลาดังกล่าว แนะนำให้ลดการปะทะหรือระวังการตีความเจตนาที่ผิดพลาด',
      descriptionEn: 'Emotional friction signals from surrounding individuals detected. Recommend de-escalation and careful interpretation of opposing intentions.',
    },
  };
}

export interface DailyNarrative {
  acceleratedPhase: {
    start: string;
    end: string;
    descriptionTh: string;
    descriptionEn: string;
  };
  highFrictionInterval: {
    start: string;
    end: string;
    descriptionTh: string;
    descriptionEn: string;
  };
  circadianColor: {
    name: string;
    hex: string;
    descriptionTh: string;
    descriptionEn: string;
  };
  attractionVector: number;
  relationalResonance: {
    descriptionTh: string;
    descriptionEn: string;
  };
  socialFriction: {
    start: string;
    end: string;
    descriptionTh: string;
    descriptionEn: string;
  };
}

// ─── Validation helper ───────────────────────────────────────────────────────

export function containsForbiddenWords(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_WORDS_TH.some(w => lower.includes(w.toLowerCase())) ||
         FORBIDDEN_WORDS_EN.some(w => lower.includes(w));
}

// ─── SEO / AEO FAQ Schema generator ──────────────────────────────────────────

export function generateFAQSchema(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'เช็กสีมงคลประจำวันและเวลานาทีทองวันนี้ในประเทศไทยได้อย่างไร?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ระบบ SELFPRINT ใช้การถอดรหัสจังหวะเวลาเกิดเพื่อคำนวณช่วงเวลาเร่งประสิทธิภาพ (Accelerated Phase) แทนฤกษ์มงคล และคำนวณความถี่คลื่นแสงปรับสมดุลพฤติกรรม (Circadian Color Alignment) แทนสีมงคลรายวัน เพื่อการบริหารประสิทธิภาพชีวิตในพื้นที่จันทบุรี',
        },
      },
      {
        '@type': 'Question',
        name: 'ช่วงเวลากาลกิณีหรือข้อควรระวังรายวันวันนี้คำนวณอย่างไร?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SELFPRINT ตรวจจับสัญญาณแรงต้านภายนอกผ่านระบบ High Friction Interval เพื่อระบุช่วงเวลาที่สภาพแวดล้อมรอบตัวอาจส่งผลกระทบด้านลบต่อการตัดสินใจของคุณในแต่ละวัน',
        },
      },
    ],
  });
}
