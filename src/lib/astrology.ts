/**
 * astrology.ts
 *
 * Deterministic numerology / zodiac calculations derived from a real birth
 * date. No AI calls, no network, no placeholder data — every value here is
 * computed per-user from `dob` (YYYY-MM-DD).
 *
 * Notes on accuracy:
 * - Life Path Number: standard numerology digit-sum reduction, with the
 *   11/22/33 master-number exception.
 * - Western Zodiac: exact, unambiguous (date-range lookup).
 * - Chinese/Thai Zodiac + Bazi Year Element: use the well-known anchor that
 *   1984 was "Jia-Zi" (Wood Rat), the start of a 60-year sexagenary cycle.
 *   The year boundary is approximated at Feb 4 (Li Chun) rather than the
 *   exact lunar new year, which is the standard simplification used by
 *   most non-astronomical implementations.
 */

export interface InitialDisciplines {
  lifePathNumber: number;
  westernZodiac: string;
  chineseZodiac: string;
  baziYearElement: string;
  prototypeCore: string;
}

export interface LifePathProfile {
  decisionStyle: string;
  strengths: string[];
  insights: string[];
  opportunities: string[];
  blindSpots: string[];
}

// ---------------------------------------------------------------------
// Input normalization
//
// The onboarding chat only checks that `new Date(input)` is parseable
// (see NovaConversation.tsx validateDate), so `dob` may arrive in almost
// any date format, not strictly YYYY-MM-DD. Every calculation below runs
// its input through this first so results stay correct regardless of the
// format the person typed. If the string truly can't be parsed, falls
// back to today's date rather than producing NaN/undefined that could
// silently stall the onboarding flow.
// ---------------------------------------------------------------------

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function normalizeDob(dob: string | null | undefined): string {
  const trimmed = dob?.trim();

  // Already strict YYYY-MM-DD — use as-is, no Date round-trip at all
  // (round-tripping through Date/toISOString is timezone-sensitive and
  // can shift the date by a day depending on the server's local offset).
  if (trimmed && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Any other format the onboarding chat may have accepted (it only
  // checks that `new Date(input)` parses, see NovaConversation.tsx) —
  // non-ISO strings parse in LOCAL time, so extract with local getters
  // to stay consistent and avoid a UTC-conversion shift.
  if (trimmed) {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
    }
  }

  const today = new Date();
  return `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
}

// ---------------------------------------------------------------------
// Life Path Number
// ---------------------------------------------------------------------

export function calculateLifePathNumber(rawDob: string): number {
  const dob = normalizeDob(rawDob);
  const digits = dob.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum)
      .split('')
      .reduce((a, b) => a + Number(b), 0);
  }
  return sum;
}

const LIFE_PATH_PROFILES: Record<number, LifePathProfile> = {
  1: {
    decisionStyle: 'ผู้นำที่พึ่งพาตัวเอง',
    strengths: ['พึ่งพาตัวเองได้', 'กล้าบุกเบิก', 'ตัดสินใจเด็ดขาดแม้ในภาวะกดดัน'],
    insights: ['คุณเชื่อการอ่านสถานการณ์ของตัวเองก่อนจะไปถามคนอื่น', 'คุณมักลงมือก่อนแล้วค่อยปรับทีหลัง แทนที่จะรอความแน่นอน'],
    opportunities: ['ลองรับฟังความเห็นคนอื่นตั้งแต่ต้นกระบวนการ ไม่ใช่แค่ตอนท้าย', 'ฝึกแบ่งความดีความชอบเมื่อความสำเร็จนั้นมาจากการร่วมมือกันจริงๆ'],
    blindSpots: ['อาจปัดความเห็นที่มีประโยชน์จากคนอื่นเร็วเกินไป'],
  },
  2: {
    decisionStyle: 'นักประสานความร่วมมือ',
    strengths: ['เข้าอกเข้าใจผู้อื่น', 'ร่วมมือได้ดี', 'อดทนกับรายละเอียดปลีกย่อย'],
    insights: ['คุณอ่านบรรยากาศในห้องก่อนจะดูข้อมูล', 'ความเห็นพ้องต้องกันสำคัญกับคุณมากกว่าการเป็นฝ่ายถูกก่อน'],
    opportunities: ['ฝึกบอกความต้องการของตัวเองก่อนที่จะถามคนอื่น', 'ตั้งเดดไลน์ส่วนตัวสำหรับการตัดสินใจที่มักถูกเลื่อนออกไปเรื่อยๆ'],
    blindSpots: ['หลีกเลี่ยงความขัดแย้งแม้ในเวลาที่จำเป็นต้องเผชิญหน้า'],
  },
  3: {
    decisionStyle: 'นักสร้างสรรค์ที่แสดงออก',
    strengths: ['สื่อสารเก่ง', 'มองโลกในแง่ดี', 'จินตนาการดีแม้มีข้อจำกัด'],
    insights: ['คุณคิดออกมาดังๆ และการพูดคือวิธีที่คุณใช้ตัดสินใจจริงๆ', 'คุณมักเลือกทางที่น่าสนใจที่สุด ไม่ใช่แค่ทางที่ปลอดภัยที่สุด'],
    opportunities: ['จดการตัดสินใจสุดท้ายไว้เป็นลายลักษณ์อักษร ไม่ให้ค้างอยู่แค่คำพูด', 'เลือกทำไอเดียเดียวให้เสร็จก่อนเริ่มอันใหม่'],
    blindSpots: ['กระจายความสนใจไปหลายอย่างพร้อมกันจนโฟกัสไม่อยู่'],
  },
  4: {
    decisionStyle: 'นักสร้างที่มีระบบ',
    strengths: ['มีวินัย', 'เชื่อถือได้', 'ใส่ใจรายละเอียด'],
    insights: ['คุณตัดสินใจบนพื้นฐานของกระบวนการ ไม่ใช่อารมณ์', 'คุณยอมช้าแต่ถูกต้อง มากกว่าเร็วแต่ผิดพลาด'],
    opportunities: ['ตั้งกรอบเวลาให้การค้นคว้า ไม่ให้กระบวนการกลายเป็นการถ่วงเวลา', 'ลองถามตัวเองว่า "ถ้ามีข้อมูลแค่ 80% จะตัดสินใจอะไร?"'],
    blindSpots: ['ต่อต้านการเปลี่ยนแปลงแม้เมื่อเห็นชัดแล้วว่าจำเป็น'],
  },
  5: {
    decisionStyle: 'นักสำรวจที่ปรับตัวเก่ง',
    strengths: ['ยืดหยุ่น', 'อยากรู้อยากเห็น', 'ปรับตัวเร็วเมื่อมีข้อมูลใหม่'],
    insights: ['อิสระในการเปลี่ยนเส้นทางสำคัญกับคุณมากกว่าแผนที่ตายตัว', 'คุณได้พลังจากการมีตัวเลือก แม้จะไม่ได้เลือกมันก็ตาม'],
    opportunities: ['ประกาศความมุ่งมั่นต่อทางเลือกหนึ่งต่อสาธารณะ เพื่อสร้างความต่อเนื่อง', 'สังเกตว่าเมื่อไหร่ที่ "เปิดทางเลือกไว้" จริงๆ แล้วคือการหลีกเลี่ยงการตัดสินใจ'],
    blindSpots: ['ทำต่อเนื่องได้ยากเมื่อความตื่นเต้นเริ่มจางลง'],
  },
  6: {
    decisionStyle: 'ผู้ดูแลที่รับผิดชอบ',
    strengths: ['เอาใจใส่ผู้อื่น', 'ภักดี', 'มีความเป็นธรรม'],
    insights: ['คุณคำนึงถึงผลกระทบต่อคนรอบข้างพอๆ กับผลลัพธ์ของการตัดสินใจ', 'คุณมักตัดสินใจเป็นคนสุดท้าย หลังพิจารณาทุกคนแล้ว'],
    opportunities: ['ถามตัวเองว่าอยากได้อะไร ก่อนจะถามว่าคนอื่นต้องการอะไร', 'ฝึกปฏิเสธโดยไม่ต้องอธิบายมากเกินไป'],
    blindSpots: ['ทุ่มเทให้ความต้องการของคนอื่นจนละเลยตัวเอง'],
  },
  7: {
    decisionStyle: 'นักวางกลยุทธ์เชิงวิเคราะห์',
    strengths: ['ครุ่นคิดใคร่ครวญ', 'มีมุมมองเฉียบคม', 'ละเอียดถี่ถ้วนแม้เรื่องซับซ้อน'],
    insights: ['คุณมองหารูปแบบที่ซ่อนอยู่ใต้ข้อเท็จจริงผิวเผิน', 'คุณต้องการเวลาคิดคนเดียวก่อนจะตัดสินใจทิศทางไหน'],
    opportunities: ['ตั้งจุดหยุดการวิเคราะห์ ก่อนที่มันจะกลายเป็นการหลีกเลี่ยงการตัดสินใจ', 'แชร์ความคิดที่ยังไม่สมบูรณ์กับคนอื่น แทนที่จะรอคำตอบที่เสร็จสมบูรณ์'],
    blindSpots: ['ปล่อยวางได้ยากเมื่อตัดสินใจไปแล้ว'],
  },
  8: {
    decisionStyle: 'ผู้บริหารที่เน้นผลลัพธ์',
    strengths: ['มีความทะเยอทะยาน', 'เป็นระบบระเบียบ', 'มั่นใจแม้ถูกจับตามอง'],
    insights: ['คุณวัดการตัดสินใจจากผลลัพธ์มากกว่ากระบวนการที่นำไปสู่มัน', 'คุณสบายใจที่จะตัดสินใจเรื่องที่คนอื่นหลีกเลี่ยง'],
    opportunities: ['พิจารณาต้นทุนด้านมนุษย์ของการตัดสินใจ ไม่ใช่แค่ผลตอบแทน', 'ชะลอก่อนตัดสินใจเรื่องใหญ่ เพื่อเปิดทางให้ความเห็นที่สอง'],
    blindSpots: ['อาจให้ความสำคัญกับผลลัพธ์มากกว่าคนที่เกี่ยวข้อง'],
  },
  9: {
    decisionStyle: 'นักอุดมคติเพื่อส่วนรวม',
    strengths: ['เห็นอกเห็นใจผู้อื่น', 'มองภาพใหญ่', 'ทุ่มเทเวลาและแรงกายอย่างไม่เห็นแก่ตัว'],
    insights: ['คุณคำนึงว่าการตัดสินใจสอดคล้องกับคุณค่าของคุณหรือไม่ พอๆ กับความเป็นไปได้จริง', 'คุณมักคิดถึงผลกระทบที่ไกลเกินตัวเองโดยธรรมชาติ'],
    opportunities: ['ถามตัวเองว่าอะไรที่ยั่งยืนสำหรับคุณ ไม่ใช่แค่อะไรที่มีความหมาย', 'ตั้งขอบเขตก่อนรับภาระเพิ่มอีกอย่าง'],
    blindSpots: ['แบกรับมากเกินกว่าที่จะยั่งยืนในระยะยาว'],
  },
  11: {
    decisionStyle: 'ผู้มีวิสัยทัศน์เชิงสัญชาตญาณ',
    strengths: ['มีมุมมองลึกซึ้ง', 'สร้างแรงบันดาลใจให้ผู้อื่น', 'สัญชาตญาณแม่นยำ'],
    insights: ['คุณมักรู้สึกถึงทิศทางที่ถูกต้องก่อนจะอธิบายเหตุผลได้', 'ไอเดียของคุณมักวิ่งนำหน้าสิ่งที่คนอื่นรู้สึกว่าปฏิบัติได้จริง'],
    opportunities: ['จับคู่สัญชาตญาณของคุณกับข้อมูลที่จับต้องได้อย่างน้อยหนึ่งอย่างก่อนลงมือ', 'ให้เวลาตัวเองฟื้นตัวหลังการตัดสินใจที่ใช้อารมณ์มาก'],
    blindSpots: ['อาจถูกครอบงำด้วยความไวต่อสถานการณ์ของตัวเอง'],
  },
  22: {
    decisionStyle: 'นักสร้างระดับปรมาจารย์',
    strengths: ['มีวิสัยทัศน์เชิงปฏิบัติ', 'มีวินัยสูงมาก', 'ทะเยอทะยานในระดับใหญ่'],
    insights: ['คุณคิดเป็นระบบและมองไกลในระยะยาว ไม่ใช่แค่การตัดสินใจครั้งเดียว', 'คุณตั้งมาตรฐานให้ตัวเองสูงจนคนส่วนใหญ่รู้สึกเหนื่อยแทน'],
    opportunities: ['แตกวิสัยทัศน์ใหญ่ให้กลายเป็นการตัดสินใจที่ทำได้ภายในสัปดาห์นี้', 'สังเกตเมื่อ "มาตรฐานสูง" ค่อยๆ กลายเป็นความสมบูรณ์แบบเกินไป'],
    blindSpots: ['ตั้งมาตรฐานสูงเกินจะยั่งยืนทั้งกับตัวเองและคนอื่น'],
  },
  33: {
    decisionStyle: 'ผู้นำทางด้วยความเมตตา',
    strengths: ['เสียสละ', 'เอาใจใส่ผู้อื่น', 'ฉลาดรอบคอบแม้ในภาวะกดดัน'],
    insights: ['คุณมักคิดถึงสิ่งที่เป็นประโยชน์ต่อกลุ่มก่อน บางครั้งก่อนจะเช็คว่าดีต่อตัวเองไหม', 'คนมักมาหาคุณเมื่อต้องการความมั่นคง ไม่ใช่แค่คำแนะนำ'],
    opportunities: ['ถามตัวเองว่าต้องการอะไร ก่อนจะเสนอสิ่งที่คนอื่นต้องการ', 'ปล่อยให้คนอื่นแบกรับการตัดสินใจบ้างสักครั้ง'],
    blindSpots: ['ละเลยความต้องการของตัวเองขณะดูแลคนอื่น'],
  },
};

export function getLifePathProfile(lifePathNumber: number): LifePathProfile {
  return LIFE_PATH_PROFILES[lifePathNumber] || LIFE_PATH_PROFILES[1];
}

// ---------------------------------------------------------------------
// Prototype Core
//
// The 12 Life Path Number values (1-9 plus master numbers 11/22/33) map
// 1:1 onto the 12 base Jungian archetypes, keeping this deterministic and
// tied to the person's real birth date rather than assigned arbitrarily.
// ---------------------------------------------------------------------

const PROTOTYPE_CORE_MAP: Record<number, string> = {
  1: 'Hero',
  2: 'Lover',
  3: 'Jester',
  4: 'Everyman',
  5: 'Explorer',
  6: 'Caregiver',
  7: 'Sage',
  8: 'Ruler',
  9: 'Innocent',
  11: 'Magician',
  22: 'Creator',
  33: 'Outlaw',
};

export function getPrototypeCore(lifePathNumber: number): string {
  return PROTOTYPE_CORE_MAP[lifePathNumber] || PROTOTYPE_CORE_MAP[1];
}

// ---------------------------------------------------------------------
// Western Zodiac
// ---------------------------------------------------------------------

const WESTERN_ZODIAC_STARTS: Array<{ sign: string; month: number; day: number }> = [
  { sign: 'Aquarius', month: 1, day: 20 },
  { sign: 'Pisces', month: 2, day: 19 },
  { sign: 'Aries', month: 3, day: 21 },
  { sign: 'Taurus', month: 4, day: 20 },
  { sign: 'Gemini', month: 5, day: 21 },
  { sign: 'Cancer', month: 6, day: 21 },
  { sign: 'Leo', month: 7, day: 23 },
  { sign: 'Virgo', month: 8, day: 23 },
  { sign: 'Libra', month: 9, day: 23 },
  { sign: 'Scorpio', month: 10, day: 23 },
  { sign: 'Sagittarius', month: 11, day: 22 },
  { sign: 'Capricorn', month: 12, day: 22 },
];

export function calculateWesternZodiac(rawDob: string): string {
  const dob = normalizeDob(rawDob);
  const [, monthStr, dayStr] = dob.split('-');
  const month = Number(monthStr);
  const day = Number(dayStr);

  let result = 'Capricorn'; // Jan 1-19 falls under the previous Dec 22 start
  for (const entry of WESTERN_ZODIAC_STARTS) {
    if (month > entry.month || (month === entry.month && day >= entry.day)) {
      result = entry.sign;
    }
  }
  return result;
}

// ---------------------------------------------------------------------
// Chinese / Thai Zodiac + Bazi Year Element
// (anchored on 1984 = Jia-Zi / Wood Rat, Li Chun boundary approximated Feb 4)
// ---------------------------------------------------------------------

const ZODIAC_ANIMALS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

const STEM_ELEMENTS = [
  'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water',
];

function baziYear(rawDob: string): number {
  const dob = normalizeDob(rawDob);
  const [yearStr, monthStr, dayStr] = dob.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  // Li Chun (start of the Bazi year) falls ~Feb 4; before that, use prior year.
  const beforeLiChun = month < 2 || (month === 2 && day < 4);
  return beforeLiChun ? year - 1 : year;
}

export function calculateChineseZodiac(dob: string): string {
  const year = baziYear(dob);
  const index = (((year - 4) % 12) + 12) % 12;
  return ZODIAC_ANIMALS[index];
}

export function calculateBaziYearElement(dob: string): string {
  const year = baziYear(dob);
  const index = (((year - 4) % 10) + 10) % 10;
  return STEM_ELEMENTS[index];
}

// ---------------------------------------------------------------------
// Combined entry point
// ---------------------------------------------------------------------

export function calculateInitialDisciplines(dob: string | null | undefined): InitialDisciplines {
  const safeDob = normalizeDob(dob);
  const lifePathNumber = calculateLifePathNumber(safeDob);
  return {
    lifePathNumber,
    westernZodiac: calculateWesternZodiac(safeDob),
    chineseZodiac: calculateChineseZodiac(safeDob),
    baziYearElement: calculateBaziYearElement(safeDob),
    prototypeCore: getPrototypeCore(lifePathNumber),
  };
}
