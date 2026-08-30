/**
 * PalmistryPage.tsx
 * Phase B: Hand Pattern Reading Activity
 *
 * กรอบ: วิเคราะห์ลักษณะมือสัมพันธ์กับบุคลิกภาพ (ไม่ใช่การดูดวง)
 * ผู้ใช้เลือกลักษณะมือ → ระบบ map เป็น behavioral traits ตาม SELFPRINT framing
 * ไม่มีกล้อง — ใช้ interactive selection UI
 *
 * Rules:
 * - CSS: var(--...) only
 * - verbatimModuleSyntax: import type {} for types
 */

import { useState } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { NavBar } from '../components/layout/NavBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useLanguage } from '../context/LanguageContext';
import { MetaTagManager } from '../components/MetaTagManager';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HandOption {
  id: string;
  labelTh: string;
  labelEn: string;
  descriptionTh: string;
  descriptionEn: string;
  emoji: string;
}

interface HandSection {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  options: HandOption[];
}

interface PalmResult {
  traitTh: string;
  traitEn: string;
  insightTh: string;
  insightEn: string;
  tendency: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HAND_SECTIONS: HandSection[] = [
  {
    id: 'shape',
    titleTh: 'รูปทรงมือโดยรวม',
    titleEn: 'Overall hand shape',
    descriptionTh: 'เลือกที่ใกล้เคียงมือของคุณมากที่สุด',
    descriptionEn: 'Pick the one closest to your hand',
    options: [
      {
        id: 'square_short',
        labelTh: 'สี่เหลี่ยม · นิ้วสั้น',
        labelEn: 'Square · short fingers',
        descriptionTh: 'ฝ่ามือกว้าง นิ้วดูเตี้ย',
        descriptionEn: 'Wide palm, short-looking fingers',
        emoji: '🏔️',
      },
      {
        id: 'square_long',
        labelTh: 'สี่เหลี่ยม · นิ้วยาว',
        labelEn: 'Square · long fingers',
        descriptionTh: 'ฝ่ามือกว้าง นิ้วยาวสม่ำเสมอ',
        descriptionEn: 'Wide palm, evenly long fingers',
        emoji: '🌲',
      },
      {
        id: 'rectangle_short',
        labelTh: 'สี่เหลี่ยมผืนผ้า · นิ้วสั้น',
        labelEn: 'Rectangular · short fingers',
        descriptionTh: 'ฝ่ามือยาว นิ้วดูเตี้ย',
        descriptionEn: 'Long palm, short-looking fingers',
        emoji: '🌊',
      },
      {
        id: 'rectangle_long',
        labelTh: 'สี่เหลี่ยมผืนผ้า · นิ้วยาว',
        labelEn: 'Rectangular · long fingers',
        descriptionTh: 'ฝ่ามือยาว นิ้วเรียว',
        descriptionEn: 'Long palm, slender fingers',
        emoji: '💨',
      },
    ],
  },
  {
    id: 'headline',
    titleTh: 'เส้นความคิด (Head Line)',
    titleEn: 'Head line',
    descriptionTh: 'เส้นกลางฝ่ามือ — ขีดในแนวนอน',
    descriptionEn: 'The horizontal line across the middle of your palm',
    options: [
      {
        id: 'short_straight',
        labelTh: 'สั้น · ตรง',
        labelEn: 'Short · straight',
        descriptionTh: 'คิดตรงไปตรงมา โฟกัสด้านปฏิบัติ',
        descriptionEn: 'Straightforward thinking, practically focused',
        emoji: '➡️',
      },
      {
        id: 'long_straight',
        labelTh: 'ยาว · ตรง',
        labelEn: 'Long · straight',
        descriptionTh: 'คิดเป็นระบบ วิเคราะห์เชิงลึก',
        descriptionEn: 'Systematic thinking, deep analysis',
        emoji: '📐',
      },
      {
        id: 'curved',
        labelTh: 'โค้งลง',
        labelEn: 'Curving downward',
        descriptionTh: 'คิดสร้างสรรค์ จินตนาการสูง',
        descriptionEn: 'Creative thinking, highly imaginative',
        emoji: '🌙',
      },
      {
        id: 'broken',
        labelTh: 'ขาดหรือหลายแขนง',
        labelEn: 'Broken or branching',
        descriptionTh: 'คิดหลายมิติพร้อมกัน ปรับตัวได้สูง',
        descriptionEn: 'Thinks in multiple dimensions at once, highly adaptable',
        emoji: '⚡',
      },
    ],
  },
  {
    id: 'lifeline',
    titleTh: 'เส้นชีวิต (Life Line)',
    titleEn: 'Life line',
    descriptionTh: 'เส้นโค้งรอบนิ้วหัวแม่มือ',
    descriptionEn: 'The curved line around the base of your thumb',
    options: [
      {
        id: 'wide_arc',
        labelTh: 'โค้งกว้าง',
        labelEn: 'Wide arc',
        descriptionTh: 'พลังงานสูง ชอบความท้าทาย',
        descriptionEn: 'High energy, drawn to challenges',
        emoji: '🔥',
      },
      {
        id: 'close_thumb',
        labelTh: 'ชิดนิ้วหัวแม่มือ',
        labelEn: 'Close to the thumb',
        descriptionTh: 'รอบคอบ ประหยัดพลังงาน',
        descriptionEn: 'Careful, conserves energy',
        emoji: '🎯',
      },
      {
        id: 'forked',
        labelTh: 'แตกสาขา',
        labelEn: 'Forked',
        descriptionTh: 'ชีวิตมีหลายเส้นทาง ชอบเปลี่ยนแปลง',
        descriptionEn: 'Life takes multiple paths, drawn to change',
        emoji: '🌿',
      },
    ],
  },
  {
    id: 'heartline',
    titleTh: 'เส้นหัวใจ (Heart Line)',
    titleEn: 'Heart line',
    descriptionTh: 'เส้นบนสุดของฝ่ามือ',
    descriptionEn: 'The topmost line across your palm',
    options: [
      {
        id: 'starts_index',
        labelTh: 'เริ่มต้นใต้นิ้วชี้',
        labelEn: 'Starts beneath the index finger',
        descriptionTh: 'ให้ความสำคัญกับความสัมพันธ์',
        descriptionEn: 'Values relationships highly',
        emoji: '💕',
      },
      {
        id: 'starts_middle',
        labelTh: 'เริ่มต้นใต้นิ้วกลาง',
        labelEn: 'Starts beneath the middle finger',
        descriptionTh: 'เชิงปฏิบัติในความรัก',
        descriptionEn: 'Practical when it comes to love',
        emoji: '⚖️',
      },
      {
        id: 'straight',
        labelTh: 'ตรง',
        labelEn: 'Straight',
        descriptionTh: 'แสดงอารมณ์ตามเหตุผล',
        descriptionEn: 'Expresses emotion through reason',
        emoji: '📊',
      },
      {
        id: 'deeply_curved',
        labelTh: 'โค้งลึก',
        labelEn: 'Deeply curved',
        descriptionTh: 'แสดงอารมณ์อย่างเต็มที่',
        descriptionEn: 'Expresses emotion fully and openly',
        emoji: '🌊',
      },
    ],
  },
];

// Mapping: (shape, headline, lifeline, heartline) → behavioral traits
const TRAIT_MAP: Record<string, PalmResult> = {
  // Fire hand (square/short)
  square_short_short_straight: {
    traitTh: 'นักปฏิบัติที่มุ่งเป้า',
    traitEn: 'The goal-driven doer',
    insightTh: 'คุณประมวลข้อมูลรวดเร็ว ตัดสินใจเด็ดขาด และชอบเห็นผลลัพธ์ที่จับต้องได้ จุดแข็งคือประสิทธิภาพ — จุดที่ควรพัฒนาคือการรับฟังมุมมองที่ต่างออกไป',
    insightEn: "You process information quickly, decide firmly, and like seeing tangible results. Your strength is efficiency — the growth edge is staying open to different perspectives.",
    tendency: 'Action-oriented · Pragmatic · Results-focused',
  },
  square_short_curved: {
    traitTh: 'นักสร้างสรรค์ที่มีพลังงาน',
    traitEn: 'The energetic creator',
    insightTh: 'คุณผสมผสานความคิดสร้างสรรค์กับพลังงานในการลงมือทำได้ดี จุดแข็งคือไอเดียที่ได้รับการ execute — จุดที่ควรพัฒนาคือความสม่ำเสมอในระยะยาว',
    insightEn: 'You combine creative thinking with the energy to act on it. Your strength is turning ideas into execution — the growth edge is staying consistent over the long run.',
    tendency: 'Creative · Energetic · Entrepreneurial',
  },
  // Air hand (square/long)
  square_long_long_straight: {
    traitTh: 'นักวิเคราะห์เชิงลึก',
    traitEn: 'The deep analyst',
    insightTh: 'คุณคิดเป็นระบบ วิเคราะห์ข้อมูลได้ละเอียด และชอบความแม่นยำ จุดแข็งคือการวางแผนที่รัดกุม — จุดที่ควรพัฒนาคือการลงมือทำเมื่อข้อมูลยังไม่สมบูรณ์ 100%',
    insightEn: "You think systematically, analyze in detail, and value precision. Your strength is airtight planning — the growth edge is acting even when the data isn't 100% complete.",
    tendency: 'Analytical · Systematic · Detail-oriented',
  },
  // Water hand (rectangle/long)
  rectangle_long_curved: {
    traitTh: 'ผู้รับรู้ทางอารมณ์',
    traitEn: 'The emotionally attuned',
    insightTh: 'คุณมีความสามารถในการอ่านอารมณ์ผู้อื่นและเชื่อมต่อในระดับลึก จุดแข็งคือ empathy และความเข้าใจมนุษย์ — จุดที่ควรพัฒนาคือการรักษาขอบเขตส่วนตัว',
    insightEn: "You're skilled at reading others' emotions and connecting on a deep level. Your strength is empathy and understanding people — the growth edge is holding your own boundaries.",
    tendency: 'Empathetic · Intuitive · Emotionally-aware',
  },
  // Earth hand (rectangle/short)
  rectangle_short_short_straight: {
    traitTh: 'ผู้มั่นคงและน่าเชื่อถือ',
    traitEn: 'The steady and reliable',
    insightTh: 'คุณให้ความสำคัญกับความมั่นคงและความน่าเชื่อถือ ทำสิ่งที่พูดไว้เสมอ จุดแข็งคือความไว้วางใจได้ — จุดที่ควรพัฒนาคือการยืดหยุ่นต่อการเปลี่ยนแปลง',
    insightEn: 'You value stability and reliability, and always follow through on what you say. Your strength is being trustworthy — the growth edge is staying flexible when things change.',
    tendency: 'Reliable · Grounded · Consistent',
  },
};

function getResult(selections: Record<string, string>): PalmResult {
  const key = `${selections.shape}_${selections.headline}`;
  if (TRAIT_MAP[key]) return TRAIT_MAP[key];

  // Fallback: shape-only matching
  const shapeKey = Object.keys(TRAIT_MAP).find((k) => k.startsWith(selections.shape ?? ''));
  if (shapeKey) return TRAIT_MAP[shapeKey];

  return {
    traitTh: 'บุคลิกภาพแบบผสม',
    traitEn: 'The versatile blend',
    insightTh: 'ลักษณะมือของคุณบ่งบอกถึงบุคลิกภาพที่ผสมผสานหลายจุดแข็ง คุณสามารถปรับตัวกับสถานการณ์ที่หลากหลายได้ดี',
    insightEn: 'Your hand shows a personality that blends several strengths — you adapt well to a wide range of situations.',
    tendency: 'Versatile · Adaptive · Multi-dimensional',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PalmistryPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<'select' | 'result'>('select');
  const [result, setResult] = useState<PalmResult | null>(null);

  const completedSections = Object.keys(selections).length;
  const totalSections = HAND_SECTIONS.length;
  const canAnalyze = completedSections >= 2; // need at least shape + one more

  const handleSelect = (sectionId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [sectionId]: optionId }));
  };

  const handleAnalyze = () => {
    const res = getResult(selections);
    setResult(res);
    setPhase('result');
  };

  const handleChatWithTwin = () => {
    if (!result) return;
    const trait = isTh ? result.traitTh : result.traitEn;
    navigate('/chat/twin', {
      state: {
        initialMessage: isTh
          ? `จากการวิเคราะห์ลักษณะมือของฉัน พบว่าฉันมีแนวโน้มเป็น "${trait}" (${result.tendency}) — ช่วยฉันเชื่อมโยงสิ่งนี้กับ SELFPRINT Blueprint ของฉันได้ไหม?`
          : `My palm analysis suggests I lean toward "${trait}" (${result.tendency}) — can you help me connect this to my SELFPRINT Blueprint?`,
      },
    });
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)', paddingBottom: 80 }}>
      <MetaTagManager
        title={isTh ? 'อ่านลักษณะมือ — SELFPRINT' : 'Palm Reading — SELFPRINT'}
        description={isTh ? 'วิเคราะห์ลักษณะมือสัมพันธ์กับบุคลิกภาพ' : 'Explore how your hand shape relates to personality'}
      />
      <NavBar />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 0' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate('/activities')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: 14,
              cursor: 'pointer',
              padding: '0 0 16px',
            }}
          >
            {isTh ? '← กลับ' : '← Back'}
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            🖐️ {isTh ? 'อ่านลักษณะมือ' : 'Palm Reading'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
            {isTh
              ? 'วิเคราะห์ลักษณะมือสัมพันธ์กับบุคลิกภาพ — ตามแนวทางจิตวิทยาบุคลิกภาพ'
              : 'Explore how your hand shape relates to personality — grounded in personality psychology'}
          </p>
        </div>

        {phase === 'select' && (
          <>
            {/* Progress */}
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                flex: 1,
                height: 4,
                background: 'var(--color-border)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(completedSections / totalSections) * 100}%`,
                  background: 'var(--color-accent-primary)',
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                {isTh ? `${completedSections}/${totalSections} หัวข้อ` : `${completedSections}/${totalSections} sections`}
              </span>
            </div>

            {/* Sections */}
            {HAND_SECTIONS.map((section) => (
              <div key={section.id} style={{ marginBottom: 24 }}>
                <h2 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 4px',
                }}>
                  {isTh ? section.titleTh : section.titleEn}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
                  {isTh ? section.descriptionTh : section.descriptionEn}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {section.options.map((option) => {
                    const selected = selections[section.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(section.id, option.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '14px 16px',
                          background: selected
                            ? 'color-mix(in srgb, var(--color-accent-primary) 12%, var(--color-bg-secondary))'
                            : 'var(--color-bg-secondary)',
                          border: selected
                            ? '1.5px solid var(--color-accent-primary)'
                            : '1px solid var(--color-border)',
                          borderRadius: 12,
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                        }}
                      >
                        <span style={{ fontSize: 24, flexShrink: 0 }}>{option.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: selected ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                          }}>
                            {isTh ? option.labelTh : option.labelEn}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            {isTh ? option.descriptionTh : option.descriptionEn}
                          </div>
                        </div>
                        {selected && (
                          <span style={{ color: 'var(--color-accent-primary)', fontSize: 18, flexShrink: 0 }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              style={{
                width: '100%',
                padding: '16px',
                background: canAnalyze ? 'var(--color-accent-primary)' : 'var(--color-border)',
                color: canAnalyze ? '#fff' : 'var(--color-text-secondary)',
                border: 'none',
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 700,
                cursor: canAnalyze ? 'pointer' : 'not-allowed',
                marginBottom: 32,
              }}
            >
              {isTh ? '🔍 วิเคราะห์ลักษณะมือ' : '🔍 Analyze my hand'}
            </button>
          </>
        )}

        {phase === 'result' && result && (
          <div>
            {/* Result card */}
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-accent-primary)',
              borderRadius: 20,
              padding: 24,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🖐️</div>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 8,
              }}>
                {isTh ? 'ลักษณะบุคลิกภาพของคุณ' : 'Your personality profile'}
              </div>
              <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 8px',
              }}>
                {isTh ? result.traitTh : result.traitEn}
              </h2>
              <p style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                margin: '0 0 16px',
                fontStyle: 'italic',
              }}>
                {result.tendency}
              </p>
              <p style={{
                fontSize: 15,
                color: 'var(--color-text-primary)',
                lineHeight: 1.7,
                margin: 0,
                textAlign: 'left',
              }}>
                {isTh ? result.insightTh : result.insightEn}
              </p>
            </div>

            {/* Chat with Twin */}
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
                {isTh
                  ? '💬 ให้ Twin ช่วยเชื่อมโยงข้อมูลนี้กับ SELFPRINT Blueprint ของคุณ'
                  : '💬 Let your Twin connect this to your SELFPRINT Blueprint'}
              </p>
              <button
                onClick={handleChatWithTwin}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: 'var(--color-accent-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isTh ? 'คุยกับ Twin เกี่ยวกับลักษณะนี้ →' : 'Chat with Twin about this →'}
              </button>
            </div>

            <button
              onClick={() => {
                setSelections({});
                setPhase('select');
                setResult(null);
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                fontSize: 14,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              {isTh ? '🔄 เริ่มใหม่' : '🔄 Start over'}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
