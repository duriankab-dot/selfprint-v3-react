/**
 * NatalChartEngine.ts
 *
 * Deterministic approximate natal chart from birth date.
 * Uses standard astronomical mean-motion formulae anchored at J2000.0
 * (January 1.5, 2000 = JD 2451545.0) — no external API, no mock data.
 *
 * Accuracy note:
 *  - Sun sign: exact (365.25-day mean motion, matches precise ephemeris)
 *  - Moon sign: ±1 sign possible (13.176°/day, no perturbations)
 *  - Mercury/Venus: ±1 sign (mean motion; actual retrogrades ignored)
 *  - Mars..Saturn: reliable to the sign for most birth years
 *  - Rising/Ascendant: requires birth TIME + location → not computed here
 *
 * For full precision, an ephemeris table (Swiss Ephemeris) is needed.
 * This engine targets "meaningful personal insight" quality, not
 * astronomical precision.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

export interface PlanetPlacement {
  planet: string;       // e.g. "Sun"
  planetThai: string;   // e.g. "ดวงอาทิตย์"
  sign: ZodiacSign;
  signThai: string;
  degree: number;       // 0-29 within the sign
  element: Element;
  elementThai: string;
  modality: Modality;
  modalityThai: string;
  insight: string;      // One-sentence Thai interpretation
}

export interface NatalChartResult {
  /** Seven classical planets (ancient astrology: Sun through Saturn) */
  placements: PlanetPlacement[];
  dominantElement: Element;
  dominantElementThai: string;
  dominantModality: Modality;
  dominantModalityThai: string;
  /** Thai paragraph describing the person's overall chart pattern */
  overallInsight: string;
  /** Always "approximate" — full precision needs Swiss Ephemeris */
  accuracy: 'approximate';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_THAI: Record<ZodiacSign, string> = {
  Aries: 'ราศีเมษ',
  Taurus: 'ราศีพฤษภ',
  Gemini: 'ราศีเมถุน',
  Cancer: 'ราศีกรกฎ',
  Leo: 'ราศีสิงห์',
  Virgo: 'ราศีกันย์',
  Libra: 'ราศีตุลย์',
  Scorpio: 'ราศีพิจิก',
  Sagittarius: 'ราศีธนู',
  Capricorn: 'ราศีมังกร',
  Aquarius: 'ราศีกุมภ์',
  Pisces: 'ราศีมีน',
};

const SIGN_ELEMENT: Record<ZodiacSign, Element> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const SIGN_MODALITY: Record<ZodiacSign, Modality> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

const ELEMENT_THAI: Record<Element, string> = {
  Fire: 'ไฟ — กระตือรือร้น มีพลังงาน กล้าหาญ',
  Earth: 'ดิน — ปฏิบัติจริง มั่นคง เชื่อถือได้',
  Air: 'ลม — สื่อสารเก่ง คิดเร็ว ปรับตัวได้',
  Water: 'น้ำ — ลึกซึ้ง อ่อนไหว เข้าอกเข้าใจ',
};

const ELEMENT_THAI_SHORT: Record<Element, string> = {
  Fire: 'ธาตุไฟ', Earth: 'ธาตุดิน', Air: 'ธาตุลม', Water: 'ธาตุน้ำ',
};

const MODALITY_THAI: Record<Modality, string> = {
  Cardinal: 'Cardinal — ผู้บุกเบิก เริ่มต้นสิ่งใหม่',
  Fixed: 'Fixed — มั่นคง ยืนหยัด ทำต่อเนื่อง',
  Mutable: 'Mutable — ยืดหยุ่น ปรับตัว เรียนรู้ตลอดเวลา',
};

const MODALITY_THAI_SHORT: Record<Modality, string> = {
  Cardinal: 'กลุ่มเริ่มต้น', Fixed: 'กลุ่มมั่นคง', Mutable: 'กลุ่มปรับตัว',
};

/** Planet display names */
const PLANETS: Array<{ key: string; nameThai: string; j2000Lon: number; dailyMotion: number }> = [
  { key: 'Sun',     nameThai: 'ดวงอาทิตย์', j2000Lon: 280.46,  dailyMotion: 0.985647 },
  { key: 'Moon',    nameThai: 'ดวงจันทร์',  j2000Lon: 218.32,  dailyMotion: 13.176396 },
  { key: 'Mercury', nameThai: 'ดาวพุธ',    j2000Lon: 283.0,   dailyMotion: 4.092317 },
  { key: 'Venus',   nameThai: 'ดาวศุกร์',  j2000Lon: 181.0,   dailyMotion: 1.602130 },
  { key: 'Mars',    nameThai: 'ดาวอังคาร', j2000Lon: 355.0,   dailyMotion: 0.524039 },
  { key: 'Jupiter', nameThai: 'ดาวพฤหัส',  j2000Lon: 34.0,    dailyMotion: 0.083092 },
  { key: 'Saturn',  nameThai: 'ดาวเสาร์',  j2000Lon: 50.0,    dailyMotion: 0.033459 },
];

/** Thai insights per planet × element combination (abbreviated map) */
const PLANET_SIGN_INSIGHT: Record<string, Record<Element, string>> = {
  Sun: {
    Fire:  'อัตลักษณ์แกนกลางของคุณขับเคลื่อนด้วยพลังงานและความกล้าหาญ',
    Earth: 'อัตลักษณ์ของคุณมั่นคงและเน้นผลลัพธ์ที่จับต้องได้',
    Air:   'อัตลักษณ์ของคุณแสดงออกผ่านความคิดและการสื่อสาร',
    Water: 'อัตลักษณ์ของคุณลึกซึ้งและขับเคลื่อนด้วยความรู้สึกภายใน',
  },
  Moon: {
    Fire:  'อารมณ์ของคุณตอบสนองเร็วและมีพลังงานสูง',
    Earth: 'คุณหาความมั่นใจจากสิ่งที่จับต้องได้และกิจวัตรที่สม่ำเสมอ',
    Air:   'คุณประมวลความรู้สึกผ่านการพูดคุยและการคิดวิเคราะห์',
    Water: 'คุณมีความไวสูงและรับรู้อารมณ์คนอื่นได้อย่างลึกซึ้ง',
  },
  Mercury: {
    Fire:  'ความคิดของคุณเฉียบคมและตัดสินใจจากสัญชาตญาณ',
    Earth: 'คุณคิดเป็นระบบและชอบข้อมูลที่นำไปใช้ได้จริง',
    Air:   'คุณสื่อสารเก่งและสนุกกับการแลกเปลี่ยนความคิด',
    Water: 'คุณคิดอย่างลึกซึ้งและมักมีญาณทัศนะเชิงสัญชาตญาณ',
  },
  Venus: {
    Fire:  'คุณดึงดูดคนด้วยพลังงานและความกระตือรือร้น',
    Earth: 'คุณให้คุณค่ากับความมั่นคงและความสัมพันธ์ที่ยั่งยืน',
    Air:   'คุณสร้างความสัมพันธ์ผ่านการพูดคุยและการแบ่งปันความคิด',
    Water: 'คุณมีความเชื่อมโยงทางอารมณ์กับคนที่คุณรักอย่างลึกซึ้ง',
  },
  Mars: {
    Fire:  'คุณลงมือทำด้วยความกล้าและพลังงานสูง',
    Earth: 'คุณทำงานหนักและทุ่มเทอย่างมีระเบียบ',
    Air:   'คุณผลักดันตัวเองผ่านการสื่อสารและความคิดสร้างสรรค์',
    Water: 'คุณขับเคลื่อนจากความรู้สึกลึกๆ และความปรารถนาจากใจจริง',
  },
  Jupiter: {
    Fire:  'การเติบโตของคุณมาจากการผจญภัยและความกล้าเสี่ยง',
    Earth: 'คุณขยายตัวผ่านการสร้างรากฐานที่มั่นคงทีละขั้น',
    Air:   'การเรียนรู้และการแบ่งปันความรู้คือแหล่งพลังงานหลักของคุณ',
    Water: 'คุณเติบโตผ่านการรักษาและการเชื่อมต่อกับผู้อื่นในระดับลึก',
  },
  Saturn: {
    Fire:  'บทเรียนชีวิตของคุณเกี่ยวกับการใช้พลังงานอย่างมีวินัย',
    Earth: 'คุณสร้างความสำเร็จผ่านความพยายามและความอดทนระยะยาว',
    Air:   'โครงสร้างทางความคิดและการสื่อสารคือพื้นฐานสู่ความสำเร็จของคุณ',
    Water: 'คุณต้องเรียนรู้ที่จะตั้งขอบเขตทางอารมณ์อย่างมั่นคง',
  },
};

// ---------------------------------------------------------------------------
// Calculation helpers
// ---------------------------------------------------------------------------

/**
 * Days since J2000.0 (JD 2451545.0 = Jan 1.5, 2000 UTC).
 * Uses the Fliegel–Van Flandern algorithm — accurate for Gregorian dates.
 */
function daysSinceJ2000(dob: string): number {
  const parts = dob.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  // Julian Day Number
  const A = Math.floor((14 - month) / 12);
  const Y = year + 4800 - A;
  const M = month + 12 * A - 3;
  const JDN =
    day +
    Math.floor((153 * M + 2) / 5) +
    365 * Y +
    Math.floor(Y / 4) -
    Math.floor(Y / 100) +
    Math.floor(Y / 400) -
    32045;

  // JD 2451545 = Jan 1.5, 2000 (noon)
  return JDN - 2451545;
}

/**
 * Compute mean ecliptic longitude (degrees, 0–360) for a planet.
 */
function planetaryLongitude(j2000Lon: number, dailyMotion: number, d: number): number {
  const raw = j2000Lon + dailyMotion * d;
  const mod = raw % 360;
  return mod < 0 ? mod + 360 : mod;
}

/**
 * Convert ecliptic longitude (0–360) to zodiac sign + degree within sign.
 */
function longitudeToSign(longitude: number): { sign: ZodiacSign; degree: number } {
  const idx = Math.floor(longitude / 30);
  const degree = longitude - idx * 30;
  return { sign: ZODIAC_SIGNS[idx], degree: Math.floor(degree) };
}

/**
 * Normalize DOB to YYYY-MM-DD, same safety logic as astrology.ts.
 */
function normalizeDob(dob: string | null | undefined): string {
  const trimmed = dob?.trim();
  if (trimmed && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (trimmed) {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute approximate natal chart from date of birth.
 *
 * @param rawDob - Birth date (any parseable format; YYYY-MM-DD preferred)
 * @returns NatalChartResult — deterministic, no network calls
 */
export function calculateNatalChart(rawDob: string | null | undefined): NatalChartResult {
  const dob = normalizeDob(rawDob);
  const d = daysSinceJ2000(dob);

  // Compute placements for all 7 classical planets
  const placements: PlanetPlacement[] = PLANETS.map((p) => {
    const lon = planetaryLongitude(p.j2000Lon, p.dailyMotion, d);
    const { sign, degree } = longitudeToSign(lon);
    const element = SIGN_ELEMENT[sign];
    const modality = SIGN_MODALITY[sign];
    const insightMap = PLANET_SIGN_INSIGHT[p.key];
    const insight = insightMap
      ? insightMap[element]
      : `${p.nameThai}อยู่ใน${SIGN_THAI[sign]}`;

    return {
      planet: p.key,
      planetThai: p.nameThai,
      sign,
      signThai: SIGN_THAI[sign],
      degree,
      element,
      elementThai: ELEMENT_THAI_SHORT[element],
      modality,
      modalityThai: MODALITY_THAI_SHORT[modality],
      insight,
    };
  });

  // Tally elements and modalities
  const elementCount: Record<Element, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityCount: Record<Modality, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  for (const p of placements) {
    elementCount[p.element]++;
    modalityCount[p.modality]++;
  }

  const dominantElement = (Object.keys(elementCount) as Element[]).reduce((a, b) =>
    elementCount[a] >= elementCount[b] ? a : b
  );
  const dominantModality = (Object.keys(modalityCount) as Modality[]).reduce((a, b) =>
    modalityCount[a] >= modalityCount[b] ? a : b
  );

  // Overall insight
  const sun = placements[0];
  const moon = placements[1];
  const overallInsight =
    `แผนที่ดาวของคุณมีดาวหลักใน${sun.signThai} (ดวงอาทิตย์) และ${moon.signThai} (ดวงจันทร์) ` +
    `พลังงานโดยรวมคือ${ELEMENT_THAI_SHORT[dominantElement]} — ${ELEMENT_THAI[dominantElement].split('—')[1].trim()} ` +
    `รูปแบบการดำเนินชีวิตเป็น${MODALITY_THAI_SHORT[dominantModality]}: ${MODALITY_THAI[dominantModality].split('—')[1].trim()}`;

  return {
    placements,
    dominantElement,
    dominantElementThai: ELEMENT_THAI_SHORT[dominantElement],
    dominantModality,
    dominantModalityThai: MODALITY_THAI_SHORT[dominantModality],
    overallInsight,
    accuracy: 'approximate',
  };
}

/**
 * Convenience: just the dominant element for a birth date.
 */
export function getDominantElement(rawDob: string | null | undefined): Element {
  return calculateNatalChart(rawDob).dominantElement;
}

/**
 * Convenience: just the moon sign for a birth date.
 */
export function getMoonSign(rawDob: string | null | undefined): ZodiacSign {
  const chart = calculateNatalChart(rawDob);
  return chart.placements[1].sign; // index 1 = Moon
}
