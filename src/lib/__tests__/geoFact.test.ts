import { describe, it, expect } from 'vitest';
import { buildFact, factsToCitations } from '../geo/Fact';
import { landingHowToSchema, landingSpeakableWebPage, onboardingQAPageSchema, dashboardSoftwareApplicationSchema, briefToAIContentBlocks, dailyBriefSpeakableWebPage } from '../aeoSchemas';
import { createAIContentBlock } from '../schemas';

describe('TC-209 geo/Fact — GEO-ready Fact interface', () => {
  it('buildFact mints deterministic id + links entities to ENTITY_DICTIONARY', () => {
    const f1 = buildFact({
      type: 'Claim' as const,
      statement: { th: 'คุณมีแนวโน้มตัดสินใจเร็ว', en: 'You tend to decide quickly' },
      evidence: { engine: 'SICE Mind', value: 0.72, confidence: 0.9 },
      entities: [{ key: 'BlindSpot', name: 'BlindSpot' }],
      lang: 'th-TH',
    });
    const f2 = buildFact({
      type: 'Claim' as const,
      statement: { th: 'คุณคุณเอง', en: 'You yourself' },
      entities: [],
      lang: 'th-TH',
    });
    const f = buildFact({
      type: 'Claim' as const,
      statement: { th: 'คุณคุณเอง', en: 'You yourself' },
      entities: [],
      lang: 'th-TH',
    });
    expect(f.id).toBe(f2.id);
    expect(f1.entities[0].schema).toBe('https://schema.selfprint.one/BlindSpot');
    expect(f1.evidence?.confidence).toBeLessThanOrEqual(1);
    void f1;
    void f2;
  });

  it('factsToCitations produces citation-ready entries only with evidence', () => {
    const facts = [
      buildFact({
        type: 'Claim' as const,
        statement: { th: 'a', en: 'b' },
        evidence: { engine: 'Mind Engine', value: 0.8, confidence: 0.9 },
        entities: [],
        lang: 'th-TH',
      }),
      buildFact({
        type: 'Observation' as const,
        statement: { th: 'no evidence', en: 'no evidence' },
        entities: [],
        lang: 'th-TH',
      }),
    ];
    const cites = factsToCitations(facts);
    expect(cites).toHaveLength(1);
    expect(cites[0].url).toContain('#mind-engine');
  });
});

describe('TC-109/110/111 aeoSchemas — page-level composites', () => {
  it('landingHowToSchema renders 3 steps + totalTime PT2M in both languages', () => {
    const th = landingHowToSchema('th-TH');
    expect((th as { '@type': string })['@type']).toBe('HowTo');
    expect((th as { totalTime?: string }).totalTime).toBe('PT2M');
    const steps = (th as { step?: { name: string }[] }).step ?? [];
    expect(steps).toHaveLength(3);
    expect(String(steps[0].name)).toContain('เช็คอินอารมณ์');
    const en = landingHowToSchema('en-US');
    const enSteps = (en as { step?: { name: string }[] }).step ?? [];
    expect(String(enSteps[0].name)).toBe('Mood check-in');
  });

  it('landingSpeakableWebPage exposes speakable selectors', () => {
    const s = landingSpeakableWebPage('th-TH', 'https://selfprint.one/th/') as { speakable?: { cssSelector?: string[] } };
    expect(s.speakable?.cssSelector).toContain('h1');
  });

  it('onboardingQAPageSchema renders Q&A pairs per language', () => {
    const th = onboardingQAPageSchema('th-TH') as { mainEntity?: { name: string }[] };
    expect(th.mainEntity?.length).toBe(3);
    expect(th.mainEntity?.[0].name).toContain('รู้สึก');
    const en = onboardingQAPageSchema('en-US') as { mainEntity?: { name: string }[] };
    expect(en.mainEntity?.[0].name).toContain('feeling');
  });

  it('dashboardSoftwareApplicationSchema includes featureList + offer', () => {
    const s = dashboardSoftwareApplicationSchema('th-TH', 'https://selfprint.one/th/dashboard') as {
      featureList?: string[];
      offers?: { price: string };
    };
    expect(s.featureList?.length).toBeGreaterThan(3);
    expect((s.offers as { price?: string }).price).toBe('0');
  });

  it('dailyBriefSpeakableWebPage + briefToAIContentBlocks produce citable blocks', () => {
    const page = dailyBriefSpeakableWebPage('th-TH', 'https://selfprint.one/th/brief') as { '@type': string };
    expect(page['@type']).toBe('WebPage');
    const blocks = briefToAIContentBlocks(
      [
        { headline: { th: 'สรุปวันนี้', en: 'Today' }, body: { th: 'โฟกัสงานช่วงเช้า', en: 'Focus mornings' }, engine: 'Mind', confidence: 0.9 },
        { headline: { th: 'b', en: 'b2' }, body: { th: 'x', en: 'y' } },
      ],
      'th-TH',
    );
    expect(blocks).toHaveLength(2);
    const first = blocks[0] as { citation?: { '@type': string }[] };
    expect(first.citation?.length).toBe(1);
  });

  it('createAIContentBlock maps entities + geoTags into JSON-LD', () => {
    const block = createAIContentBlock({
      type: 'definition',
      headline: { th: 'SICE คืออะไร', en: 'What is SICE' },
      body: { th: 'ระบบเครื่องยนต์พฤติกรรม 12 มิติ', en: '12-dimension behavioral engine system' },
      entities: [{ type: 'Thing', id: 'selfprint:sice', name: 'SICE' }],
      geoTags: { topic: ['behavioral-science'], audience: ['self-development'], intent: 'informational' },
    });
    expect((block as { '@type': string })['@type']).toBe('CreativeWork');
    expect((block as { keywords?: string }).keywords).toContain('behavioral-science');
  });
});