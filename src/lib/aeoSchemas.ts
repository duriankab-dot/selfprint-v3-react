/**
 * aeoSchemas.ts — TC-109/110/111/211: page-level AEO composite schemas.
 *
 * Built on top of the typed builders in schemas.ts. Every builder is a pure
 * function of (language, optional data) so pages can drop the result straight
 * into MetaTagManager.additionalScripts. Bilingual copy follows the
 * behavioral-science framing rules (NO_ASTRO_LANG): fortune-telling vocabulary
 * stays out of non-comparison pages.
 */

import { HowTo, QAPage, Speakable, SoftwareApplication } from './schemas';
import type { BilingualText } from './schemas';
import { createAIContentBlock } from './schemas';
import type { AIContentBlock } from './schemas';

type JsonLd = Record<string, unknown>;

export type PageLang = 'th-TH' | 'en-US';

// ─── TC-109: Landing — HowTo + WebPage(Speakable) ──────────────────────

const LANDING_HOWTO: Record<'th' | 'en', { name: BilingualText; description: BilingualText; steps: { name: BilingualText; text: BilingualText }[] }> = {
  th: {
    name: { th: 'วิธีสร้าง AI Twin ของคุณใน 2 นาที', en: 'How to create your AI Twin in 2 minutes' },
    description: {
      th: '3 ขั้นตอน: เช็คอินอารมณ์ → คุยกับ SELFPRINT → Twin เริ่มเรียนรู้พฤติกรรมของคุณ',
      en: '3 steps: a quick mood check-in → talk with SELFPRINT → your Twin starts learning your behavior',
    },
    steps: [
      { name: { th: 'เช็คอินอารมณ์', en: 'Mood check-in' }, text: { th: 'บอกอารมณ์ของวันนี้เป็นขั้นแรกของการวิเคราะห์', en: 'Share how you feel today — the first input of the analysis' } },
      { name: { th: 'คุยกับ SELFPRINT', en: 'Talk with SELFPRINT' }, text: { th: 'ตอบคำถามสั้นๆ เพื่อให้ระบบจับรูปแบบพฤติกรรมเบื้องต้น', en: 'Answer a few questions so the system captures your baseline behavioral patterns' } },
      { name: { th: 'AI Twin เริ่มทำงาน', en: 'Your AI Twin awakens' }, text: { th: 'Twin ของคุณถูกสร้างจากพิมพ์เขียวพฤติกรรม 12 มิติ และเรียนรู้ต่อจากการตัดสินใจจริง', en: 'Your Twin is built from a 12-dimension behavioral blueprint and keeps learning from real decisions' } },
    ],
  },
  en: {
    name: { th: 'วิธีสร้าง AI Twin ของคุณใน 2 นาที', en: 'How to create your AI Twin in 2 minutes' },
    description: {
      th: '3 ขั้นตอน: เช็คอินอารมณ์ → คุยกับ SELFPRINT → Twin เริ่มเรียนรู้พฤติกรรมของคุณ',
      en: '3 steps: a quick mood check-in → talk with SELFPRINT → your Twin starts learning your behavior',
    },
    steps: [
      { name: { th: 'เช็คอินอารมณ์', en: 'Mood check-in' }, text: { th: 'บอกอารมณ์ของวันนี้เป็นขั้นแรกของการวิเคราะห์', en: 'Share how you feel today — the first input of the analysis' } },
      { name: { th: 'คุยกับ SELFPRINT', en: 'Talk with SELFPRINT' }, text: { th: 'ตอบคำถามสั้นๆ เพื่อให้ระบบจับรูปแบบพฤติกรรมเบื้องต้น', en: 'Answer a few questions so the system captures your baseline behavioral patterns' } },
      { name: { th: 'AI Twin เริ่มทำงาน', en: 'Your AI Twin awakens' }, text: { th: 'Twin ของคุณถูกสร้างจากพิมพ์เขียวพฤติกรรม 12 มิติ และเรียนรู้ต่อจากการตัดสินใจจริง', en: 'Your Twin is built from a 12-dimension behavioral blueprint and keeps learning from real decisions' } },
    ],
  },
};

export function landingHowToSchema(lang: PageLang): JsonLd {
  const copy = LANDING_HOWTO[lang === 'th-TH' ? 'th' : 'en'];
  return HowTo({
    name: copy.name,
    description: copy.description,
    totalTime: 'PT2M',
    inLanguage: lang,
    steps: copy.steps,
  });
}

export function landingSpeakableWebPage(lang: PageLang, url: string): JsonLd {
  const th = lang === 'th-TH';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: th ? 'SELFPRINT — AI Twin ที่รู้จักคุณดีที่สุด' : 'SELFPRINT — the AI Twin that knows you best',
    url,
    inLanguage: lang,
    speakable: Speakable(['h1', '.hero-sub', '.sp-s2-enter h2']),
  };
}

// ─── TC-110: Onboarding — QAPage (Nova conversation, static sample) ────

export function onboardingQAPageSchema(lang: PageLang): JsonLd {
  const th = lang === 'th-TH';
  return QAPage({
    inLanguage: lang,
    conversation: th
      ? [
          {
            user: { th: 'วันนี้คุณรู้สึกยังไง?', en: '' },
            assistant: { th: 'อารมณ์ของคุณเป็นตัวแปรเบื้องต้นในการวิเคราะห์รูปแบบพฤติกรรมวันนี้', en: '' },
          },
          {
            user: { th: 'ระบบถามหาข้อมูลวันเกิดเพื่ออะไร?', en: '' },
            assistant: { th: 'วัน/เวลา/สถานที่เกิดใช้เป็น seed กำหนด DNA ของ Twin ของคุณ ทำให้ Twin ไม่ซ้ำใครและคงที่ตลอดไป', en: '' },
          },
          {
            user: { th: 'Twin วิเคราะห์จากอะไร?', en: '' },
            assistant: { th: '12 SICE engines วิเคราะห์พฤติกรรม การตัดสินใจ และคำตอบปรับแต่งของคุณ ไม่ใช่การเดาจากวันเกิดเพียงอย่างเดียว', en: '' },
          },
        ]
      : [
          {
            user: { th: '', en: 'How are you feeling today?' },
            assistant: { th: '', en: 'Your mood is the first input for today’s behavioral pattern analysis' },
          },
          {
            user: { th: '', en: 'Why does the system ask for my birth data?' },
            assistant: { th: '', en: 'Birth date/time/place seeds your Twin’s deterministic DNA — unique to you and stable forever' },
          },
          {
            user: { th: '', en: 'What does the Twin analyze?' },
            assistant: { th: '', en: '12 SICE engines analyze your behavior, decisions and fine-tuning answers — not birth data alone' },
          },
        ],
  });
}

// ─── TC-111: Dashboard — SoftwareApplication ───────────────────────────

export function dashboardSoftwareApplicationSchema(lang: PageLang, url: string): JsonLd {
  const th = lang === 'th-TH';
  return SoftwareApplication({
    inLanguage: lang,
    url,
    alternateLanguages: [
      { lang: 'th', url: url.replace('/en', '/th') },
      { lang: 'en', url: url.replace('/th', '/en') },
    ],
    name: {
      th: 'SELFPRINT — Living Personal Intelligence',
      en: 'SELFPRINT — Living Personal Intelligence',
    },
    description: {
      th: 'แดชบอร์ดปัญญาส่วนบุคคลที่มีชีวิต: Twin ของคุณเรียนรู้จากการตัดสินใจจริง วิเคราะห์ 12 มิติ และชี้ Blind Spots แบบเรียลไทม์',
      en: 'Your living personal intelligence dashboard: the Twin learns from real decisions, analyzes 12 dimensions and surfaces Blind Spots in real time',
    },
    features: th
      ? [
          'พิมพ์เขียวพฤติกรรม 12 มิติ (SICE)',
          'Twin เรียนรู้จากการตัดสินใจจริง',
          'ตรวจจับ Blind Spots',
          'แนวโน้มพฤติกรรมและรูปแบบการตัดสินใจ',
          'สรุปประจำวันที่อ้างอิงหลักฐานได้',
        ]
      : [
          '12-dimension behavioral blueprint (SICE)',
          'Twin learns from real decisions',
          'Blind spot detection',
          'Behavioral trends and decision patterns',
          'Citable daily brief with evidence',
        ],
    price: '0',
    priceCurrency: 'THB',
    applicationCategory: 'PersonalIntelligenceApplication',
  });
}

// ─── TC-211: Daily Brief — Speakable + AIContentBlock per insight ──────

export function dailyBriefSpeakableWebPage(lang: PageLang, url: string): JsonLd {
  const th = lang === 'th-TH';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: th ? 'สรุปประจำวันของคุณ — SELFPRINT' : 'Your Daily Brief — SELFPRINT',
    url,
    inLanguage: lang,
    speakable: Speakable(['h1', '[data-brief-headline]', '[data-brief-insight]']),
  };
}

/** Map brief insights to citable AIContentBlocks (TC-210/211) */
export function briefToAIContentBlocks(
  insights: {
    headline: { th: string; en: string };
    body: { th: string; en: string };
    engine?: string;
    confidence?: number;
  }[],
  lang: PageLang,
): JsonLd[] {
  return insights.slice(0, 5).map((i) => ({
    ...createAIContentBlock({
      type: 'insight',
      headline: i.headline as BilingualText,
      body: i.body as BilingualText,
      entities: [{ type: 'Thing', id: 'selfprint:sice-engine', name: i.engine ?? 'SICE' }],
      geoTags: {
        topic: ['behavioral-science', 'personal-intelligence', 'ai-twin'],
        audience: ['self-development', 'decision-making'],
        intent: 'informational',
      },
      evidence:
        i.engine && i.confidence !== undefined
          ? { engine: i.engine, value: i.confidence, percentile: Math.round(i.confidence * 100), confidence: i.confidence }
          : undefined,
    }),
    inLanguage: lang,
  }));
}

export type { AIContentBlock };