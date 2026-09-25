/**
 * Fact.ts — TC-209: GEO-ready Fact interface.
 *
 * ทุกข้อความของ Twin ต้องอ้างอิงได้ (citable): มี statement, หลักฐาน
 * (engine + metric), entity ที่เกี่ยวข้อง และ license/ช่วงเวลาที่ยังใช้ได้
 * เพื่อให้ AI engines (GEO) อ้างอิงข้อความของ SELFPRINT ได้ถูกต้อง.
 */

import { ENTITY_DICTIONARY } from '../schemas';

export type FactKind =
  | 'definition'
  | 'insight'
  | 'recommendation'
  | 'warning'
  | 'evidence';

export interface FactEvidence {
  /** ชื่อ engine ที่สร้าง fact (เช่น SICE engine) */
  engine: string;
  /** metric เชิงตัวเลข 0..1 หรือ percentile */
  value: number;
  /** เทียบกับ population (0..100) */
  percentile?: number;
  /** ความมั่นใจของ engine 0..1 */
  confidence: number;
}

export interface FactEntity {
  /** ชื่อ entity ตาม ENTITY_DICTIONARY key หรือ custom */
  key: keyof typeof ENTITY_DICTIONARY | string;
  name: string;
  /** schema url จาก Entity Dictionary เมื่อเป็น term ของระบบ */
  schema?: string;
}

export interface Fact {
  id: string;
  type: FactFactType;
  statement: { th: string; en: string };
  evidence?: FactEvidence;
  entities: FactEntity[];
  /** ข้อมูลอ้างอิงต่อยอด (citation-ready) */
  citations?: { text: string; url: string }[];
  /** อายุความสดของ fact (ISO date) */
  validUntil?: string;
  lang: 'th-TH' | 'en-US';
}

// FactFactType = structural schema.org type the fact maps to
export type FactFactType =
  | 'Claim'
  | 'Statement'
  | 'Recommendation'
  | 'Observation';

export function buildFact(
  fact: Omit<Fact, 'id'> & { id?: string },
): Fact {
  const id = fact.id ?? `fact:${fact.type.toLowerCase()}:${hashText(fact.statement.th + fact.statement.en)}`;
  return {
    ...fact,
    id,
    evidence: fact.evidence
      ? { ...fact.evidence, confidence: Math.max(0, Math.min(1, fact.evidence.confidence)) }
      : undefined,
    entities: fact.entities.map((e) => ({
      ...e,
      schema: e.schema ?? (ENTITY_DICTIONARY as Record<string, { schema: string }>)[e.key]?.schema,
    })),
  };
}

/** TC-210: Twin output → citable AIContentBlock (แปลง Fact ชุดเป็น JSON-LD) */
export function factsToCitations(facts: Fact[]): { text: string; url: string }[] {
  return facts
    .filter((f) => f.evidence)
    .map((f) => ({
      text: `${f.type}: ${f.statement.th || f.statement.en} (engine: ${f.evidence?.engine}, confidence: ${f.evidence?.confidence.toFixed(2)})`,
      url: `https://selfprint.one/science#${f.evidence?.engine.toLowerCase().replace(/\s+/g, '-')}`,
    }));
}

function hashText(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}