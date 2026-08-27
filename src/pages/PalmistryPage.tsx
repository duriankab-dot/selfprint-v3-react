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
import { MetaTagManager } from '../components/MetaTagManager';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HandOption {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

interface HandSection {
  id: string;
  title: string;
  description: string;
  options: HandOption[];
}

interface PalmResult {
  trait: string;
  insight: string;
  tendency: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HAND_SECTIONS: HandSection[] = [
  {
    id: 'shape',
    title: 'รูปทรงมือโดยรวม',
    description: 'เลือกที่ใกล้เคียงมือของคุณมากที่สุด',
    options: [
      {
        id: 'square_short',
        label: 'สี่เหลี่ยม · นิ้วสั้น',
        description: 'ฝ่ามือกว้าง นิ้วดูเตี้ย',
        emoji: '🏔️',
      },
      {
        id: 'square_long',
        label: 'สี่เหลี่ยม · นิ้วยาว',
        description: 'ฝ่ามือกว้าง นิ้วยาวสม่ำเสมอ',
        emoji: '🌲',
      },
      {
        id: 'rectangle_short',
        label: 'สี่เหลี่ยมผืนผ้า · นิ้วสั้น',
        description: 'ฝ่ามือยาว นิ้วดูเตี้ย',
        emoji: '🌊',
      },
      {
        id: 'rectangle_long',
        label: 'สี่เหลี่ยมผืนผ้า · นิ้วยาว',
        description: 'ฝ่ามือยาว นิ้วเรียว',
        emoji: '💨',
      },
    ],
  },
  {
    id: 'headline',
    title: 'เส้นความคิด (Head Line)',
    description: 'เส้นกลางฝ่ามือ — ขีดในแนวนอน',
    options: [
      {
        id: 'short_straight',
        label: 'สั้น · ตรง',
        description: 'คิดตรงไปตรงมา โฟกัสด้านปฏิบัติ',
        emoji: '➡️',
      },
      {
        id: 'long_straight',
        label: 'ยาว · ตรง',
        description: 'คิดเป็นระบบ วิเคราะห์เชิงลึก',
        emoji: '📐',
      },
      {
        id: 'curved',
        label: 'โค้งลง',
        description: 'คิดสร้างสรรค์ จินตนาการสูง',
        emoji: '🌙',
      },
      {
        id: 'broken',
        label: 'ขาดหรือหลายแขนง',
        description: 'คิดหลายมิติพร้อมกัน ปรับตัวได้สูง',
        emoji: '⚡',
      },
    ],
  },
  {
    id: 'lifeline',
    title: 'เส้นชีวิต (Life Line)',
    description: 'เส้นโค้งรอบนิ้วหัวแม่มือ',
    options: [
      {
        id: 'wide_arc',
        label: 'โค้งกว้าง',
        description: 'พลังงานสูง ชอบความท้าทาย',
        emoji: '🔥',
      },
      {
        id: 'close_thumb',
        label: 'ชิดนิ้วหัวแม่มือ',
        description: 'รอบคอบ ประหยัดพลังงาน',
        emoji: '🎯',
      },
      {
        id: 'forked',
        label: 'แตกสาขา',
        description: 'ชีวิตมีหลายเส้นทาง ชอบเปลี่ยนแปลง',
        emoji: '🌿',
      },
    ],
  },
  {
    id: 'heartline',
    title: 'เส้นหัวใจ (Heart Line)',
    description: 'เส้นบนสุดของฝ่ามือ',
    options: [
      {
        id: 'starts_index',
        label: 'เริ่มต้นใต้นิ้วชี้',
        description: 'ให้ความสำคัญกับความสัมพันธ์',
        emoji: '💕',
      },
      {
        id: 'starts_middle',
        label: 'เริ่มต้นใต้นิ้วกลาง',
        description: 'เชิงปฏิบัติในความรัก',
        emoji: '⚖️',
      },
      {
        id: 'straight',
        label: 'ตรง',
        description: 'แสดงอารมณ์ตามเหตุผล',
        emoji: '📊',
      },
      {
        id: 'deeply_curved',
        label: 'โค้งลึก',
        description: 'แสดงอารมณ์อย่างเต็มที่',
        emoji: '🌊',
      },
    ],
  },
];

// Mapping: (shape, headline, lifeline, heartline) → behavioral traits
const TRAIT_MAP: Record<string, PalmResult> = {
  // Fire hand (square/short)
  square_short_short_straight: {
    trait: 'นักปฏิบัติที่มุ่งเป้า',
    insight: 'คุณประมวลข้อมูลรวดเร็ว ตัดสินใจเด็ดขาด และชอบเห็นผลลัพธ์ที่จับต้องได้ จุดแข็งคือประสิทธิภาพ — จุดที่ควรพัฒนาคือการรับฟังมุมมองที่ต่างออกไป',
    tendency: 'Action-oriented · Pragmatic · Results-focused',
  },
  square_short_curved: {
    trait: 'นักสร้างสรรค์ที่มีพลังงาน',
    insight: 'คุณผสมผสานความคิดสร้างสรรค์กับพลังงานในการลงมือทำได้ดี จุดแข็งคือไอเดียที่ได้รับการ execute — จุดที่ควรพัฒนาคือความสม่ำเสมอในระยะยาว',
    tendency: 'Creative · Energetic · Entrepreneurial',
  },
  // Air hand (square/long)
  square_long_long_straight: {
    trait: 'นักวิเคราะห์เชิงลึก',
    insight: 'คุณคิดเป็นระบบ วิเคราะห์ข้อมูลได้ละเอียด และชอบความแม่นยำ จุดแข็งคือการวางแผนที่รัดกุม — จุดที่ควรพัฒนาคือการลงมือทำเมื่อข้อมูลยังไม่สมบูรณ์ 100%',
    tendency: 'Analytical · Systematic · Detail-oriented',
  },
  // Water hand (rectangle/long)
  rectangle_long_curved: {
    trait: 'ผู้รับรู้ทางอารมณ์',
    insight: 'คุณมีความสามารถในการอ่านอารมณ์ผู้อื่นและเชื่อมต่อในระดับลึก จุดแข็งคือ empathy และความเข้าใจมนุษย์ — จุดที่ควรพัฒนาคือการรักษาขอบเขตส่วนตัว',
    tendency: 'Empathetic · Intuitive · Emotionally-aware',
  },
  // Earth hand (rectangle/short)
  rectangle_short_short_straight: {
    trait: 'ผู้มั่นคงและน่าเชื่อถือ',
    insight: 'คุณให้ความสำคัญกับความมั่นคงและความน่าเชื่อถือ ทำสิ่งที่พูดไว้เสมอ จุดแข็งคือความไว้วางใจได้ — จุดที่ควรพัฒนาคือการยืดหยุ่นต่อการเปลี่ยนแปลง',
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
    trait: 'บุคลิกภาพแบบผสม',
    insight: 'ลักษณะมือของคุณบ่งบอกถึงบุคลิกภาพที่ผสมผสานหลายจุดแข็ง คุณสามารถปรับตัวกับสถานการณ์ที่หลากหลายได้ดี',
    tendency: 'Versatile · Adaptive · Multi-dimensional',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PalmistryPage() {
  const navigate = useNavigate();
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
    navigate('/chat/twin', {
      state: {
        initialMessage: `จากการวิเคราะห์ลักษณะมือของฉัน พบว่าฉันมีแนวโน้มเป็น "${result.trait}" (${result.tendency}) — ช่วยฉันเชื่อมโยงสิ่งนี้กับ SELFPRINT Blueprint ของฉันได้ไหม?`,
      },
    });
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)', paddingBottom: 80 }}>
      <MetaTagManager title="อ่านลักษณะมือ — SELFPRINT" description="วิเคราะห์ลักษณะมือสัมพันธ์กับบุคลิกภาพ" />
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
            ← กลับ
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            🖐️ อ่านลักษณะมือ
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
            วิเคราะห์ลักษณะมือสัมพันธ์กับบุคลิกภาพ — ตามแนวทางจิตวิทยาบุคลิกภาพ
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
                {completedSections}/{totalSections} หัวข้อ
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
                  {section.title}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
                  {section.description}
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
                            {option.label}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            {option.description}
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
              🔍 วิเคราะห์ลักษณะมือ
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
                ลักษณะบุคลิกภาพของคุณ
              </div>
              <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 8px',
              }}>
                {result.trait}
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
                {result.insight}
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
                💬 ให้ Twin ช่วยเชื่อมโยงข้อมูลนี้กับ SELFPRINT Blueprint ของคุณ
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
                คุยกับ Twin เกี่ยวกับลักษณะนี้ →
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
              🔄 เริ่มใหม่
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
