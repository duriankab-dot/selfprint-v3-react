/**
 * TarotPage.tsx
 * Phase B: Symbolic Card Reading Activity
 *
 * กรอบ: การอ่านสัญลักษณ์ทางจิตวิทยา (ไม่ใช่การดูดวง)
 * แต่ละไพ่เชื่อมกับ archetype ของ SELFPRINT Blueprint
 * การวาด 3 ใบ = สะท้อนมุมมอง 3 มิติ (สถานการณ์ / แนวทาง / ผลลัพธ์ที่เป็นไปได้)
 *
 * Rules:
 * - CSS: var(--...) only
 * - verbatimModuleSyntax: import type {} for types
 * - No hardcoded colors / sizes
 */

import { useState } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { NavBar } from '../components/layout/NavBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useTwin } from '../context/TwinContext';
import { MetaTagManager } from '../components/MetaTagManager';

// ─── Card definitions ────────────────────────────────────────────────────────

interface TarotCard {
  id: number;
  nameTh: string;
  nameEn: string;
  emoji: string;
  selfprintTheme: string;
  insightTh: string; // SELFPRINT-framed (behavioral / psychological)
  keyword: string;
}

// 22 Major Arcana mapped to SELFPRINT psychological themes
const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0,
    nameTh: 'นักเดินทาง',
    nameEn: 'The Fool',
    emoji: '🌀',
    selfprintTheme: 'ความเปิดกว้าง',
    insightTh: 'คุณอยู่ในสภาวะที่พร้อมเรียนรู้สิ่งใหม่ — จิตใจที่เปิดกว้างคือจุดแข็งที่แท้จริงของคุณตอนนี้',
    keyword: 'เปิดกว้าง',
  },
  {
    id: 1,
    nameTh: 'ผู้สร้าง',
    nameEn: 'The Magician',
    emoji: '✨',
    selfprintTheme: 'ความสามารถ',
    insightTh: 'ทรัพยากรที่คุณต้องการอยู่ในมือคุณแล้ว — ถึงเวลาที่จะใช้ความสามารถที่มีอยู่ให้เต็มที่',
    keyword: 'ลงมือทำ',
  },
  {
    id: 2,
    nameTh: 'ผู้รู้ภายใน',
    nameEn: 'The High Priestess',
    emoji: '🌙',
    selfprintTheme: 'สัญชาตญาณ',
    insightTh: 'คำตอบอยู่ที่ความรู้สึกภายใน — การฟังเสียงตัวเองมากขึ้นจะเปิดเผยสิ่งที่การวิเคราะห์ยังมองไม่เห็น',
    keyword: 'ฟังตัวเอง',
  },
  {
    id: 3,
    nameTh: 'ผู้บ่มเพาะ',
    nameEn: 'The Empress',
    emoji: '🌺',
    selfprintTheme: 'การดูแล',
    insightTh: 'พลังงานสร้างสรรค์ของคุณกำลังเติบโต — การดูแลตัวเองและสิ่งรอบข้างจะให้ผลลัพธ์ที่ยิ่งใหญ่',
    keyword: 'เติบโต',
  },
  {
    id: 4,
    nameTh: 'ผู้นำ',
    nameEn: 'The Emperor',
    emoji: '⚔️',
    selfprintTheme: 'ความเป็นผู้นำ',
    insightTh: 'ถึงเวลาตัดสินใจอย่างชัดเจนและมั่นคง — ความมีระเบียบวินัยคือพื้นฐานของความมั่นคงที่คุณต้องการ',
    keyword: 'มั่นคง',
  },
  {
    id: 5,
    nameTh: 'ผู้ถ่ายทอด',
    nameEn: 'The Hierophant',
    emoji: '📚',
    selfprintTheme: 'ความรู้',
    insightTh: 'การเรียนรู้จากผู้มีประสบการณ์หรือระบบที่พิสูจน์แล้วจะช่วยย่นเวลาและเพิ่มความแม่นยำ',
    keyword: 'เรียนรู้',
  },
  {
    id: 6,
    nameTh: 'ทางเลือก',
    nameEn: 'The Lovers',
    emoji: '💫',
    selfprintTheme: 'การเลือก',
    insightTh: 'การตัดสินใจสำคัญที่รอคุณอยู่ต้องการความชัดเจนด้านคุณค่า — เลือกตามสิ่งที่คุณเป็น ไม่ใช่สิ่งที่คาดหวังจากภายนอก',
    keyword: 'ความชัดเจน',
  },
  {
    id: 7,
    nameTh: 'นักเดินทางแห่งเจตจำนง',
    nameEn: 'The Chariot',
    emoji: '🚀',
    selfprintTheme: 'ความมุ่งมั่น',
    insightTh: 'ความสำเร็จมาจากการควบคุมทั้งแรงผลักดันภายในและภายนอก — ทิศทางที่ชัดเจนคือกุญแจสำคัญ',
    keyword: 'มุ่งมั่น',
  },
  {
    id: 8,
    nameTh: 'พลังภายใน',
    nameEn: 'Strength',
    emoji: '🦁',
    selfprintTheme: 'ความกล้าหาญ',
    insightTh: 'พลังที่แท้จริงของคุณอยู่ที่ความสามารถในการรับมือกับความกลัวด้วยความสงบ ไม่ใช่การข่มใจ',
    keyword: 'กล้าหาญ',
  },
  {
    id: 9,
    nameTh: 'ผู้อยู่กับตัวเอง',
    nameEn: 'The Hermit',
    emoji: '🕯️',
    selfprintTheme: 'การสะท้อนคิด',
    insightTh: 'ช่วงเวลาแห่งการถอยออกมาเพื่อมองภาพรวมคือสิ่งที่คุณต้องการ — คำตอบอยู่ในความเงียบสงบ',
    keyword: 'สะท้อนคิด',
  },
  {
    id: 10,
    nameTh: 'วงล้อแห่งโอกาส',
    nameEn: 'Wheel of Fortune',
    emoji: '🎡',
    selfprintTheme: 'การเปลี่ยนแปลง',
    insightTh: 'วงจรชีวิตกำลังเปลี่ยน — สิ่งที่คุณทำในช่วงเปลี่ยนผ่านนี้จะกำหนดทิศทางของวงรอบถัดไป',
    keyword: 'โอกาส',
  },
  {
    id: 11,
    nameTh: 'ความสมดุล',
    nameEn: 'Justice',
    emoji: '⚖️',
    selfprintTheme: 'ความยุติธรรม',
    insightTh: 'การตัดสินใจที่ซื่อสัตย์ต่อตัวเองและผู้อื่นจะสร้างรากฐานที่มั่นคงในระยะยาว',
    keyword: 'ซื่อสัตย์',
  },
  {
    id: 12,
    nameTh: 'ผู้หยุดพัก',
    nameEn: 'The Hanged Man',
    emoji: '🌊',
    selfprintTheme: 'การยอมรับ',
    insightTh: 'บางครั้งการหยุดดิ้นรนชั่วคราวและปล่อยให้กระบวนการดำเนินไปเองคือสิ่งที่ฉลาดที่สุด',
    keyword: 'ปล่อยวาง',
  },
  {
    id: 13,
    nameTh: 'การเปลี่ยนแปลง',
    nameEn: 'Death',
    emoji: '🦋',
    selfprintTheme: 'การเริ่มต้นใหม่',
    insightTh: 'บทบาทหรือความเชื่อบางอย่างได้หมดอายุแล้ว — การปล่อยวางสิ่งเหล่านั้นจะเปิดพื้นที่ให้สิ่งใหม่เข้ามา',
    keyword: 'ปล่อยวาง',
  },
  {
    id: 14,
    nameTh: 'ผสานพลัง',
    nameEn: 'Temperance',
    emoji: '🌈',
    selfprintTheme: 'สมดุล',
    insightTh: 'ความสมดุลระหว่างสองสิ่งที่ดูขัดแย้งกันคือแก่นสำคัญที่คุณกำลังเรียนรู้ในช่วงนี้',
    keyword: 'สมดุล',
  },
  {
    id: 15,
    nameTh: 'ข้อจำกัด',
    nameEn: 'The Devil',
    emoji: '⛓️',
    selfprintTheme: 'รูปแบบที่ติดอยู่',
    insightTh: 'มีรูปแบบความคิดหรือพฤติกรรมบางอย่างที่จำกัดคุณอยู่ — การรับรู้มันคือก้าวแรกสู่อิสรภาพ',
    keyword: 'ตระหนักรู้',
  },
  {
    id: 16,
    nameTh: 'ความเปลี่ยนแปลงกะทันหัน',
    nameEn: 'The Tower',
    emoji: '⚡',
    selfprintTheme: 'การเปิดเผย',
    insightTh: 'สิ่งที่ถูกสร้างบนรากฐานที่ไม่มั่นคงจำเป็นต้องพัง เพื่อให้คุณสร้างสิ่งที่แข็งแกร่งกว่าได้',
    keyword: 'ปรับตัว',
  },
  {
    id: 17,
    nameTh: 'ความหวัง',
    nameEn: 'The Star',
    emoji: '⭐',
    selfprintTheme: 'แรงบันดาลใจ',
    insightTh: 'หลังจากผ่านความท้าทาย ทิศทางของคุณเริ่มชัดเจนขึ้น — ความหวังที่แท้จริงมาจากการเห็นศักยภาพของตัวเอง',
    keyword: 'หวัง',
  },
  {
    id: 18,
    nameTh: 'ความไม่แน่นอน',
    nameEn: 'The Moon',
    emoji: '🌕',
    selfprintTheme: 'จิตใต้สำนึก',
    insightTh: 'ความรู้สึกที่คลุมเครืออยู่ในตอนนี้มีข้อมูลสำคัญซ่อนอยู่ — ลองสังเกตรูปแบบในความคิดและความฝันของคุณ',
    keyword: 'สังเกต',
  },
  {
    id: 19,
    nameTh: 'พลังชีวิต',
    nameEn: 'The Sun',
    emoji: '☀️',
    selfprintTheme: 'ความสุข',
    insightTh: 'ช่วงเวลาของความสำเร็จและความชัดเจนกำลังมาถึง — ความมั่นใจในตัวเองของคุณคือพลังงานที่แท้จริง',
    keyword: 'มั่นใจ',
  },
  {
    id: 20,
    nameTh: 'การตื่นรู้',
    nameEn: 'Judgement',
    emoji: '🔔',
    selfprintTheme: 'การตื่นรู้',
    insightTh: 'คุณกำลังอยู่ในช่วงของการประเมินตัวเองใหม่ — การยอมรับทั้งจุดแข็งและสิ่งที่ต้องพัฒนาจะพาคุณไปข้างหน้าได้จริง',
    keyword: 'ยอมรับ',
  },
  {
    id: 21,
    nameTh: 'ความสมบูรณ์',
    nameEn: 'The World',
    emoji: '🌍',
    selfprintTheme: 'ความสำเร็จ',
    insightTh: 'วงจรหนึ่งกำลังสิ้นสุด คุณได้เรียนรู้สิ่งสำคัญจากมัน — ความสำเร็จที่แท้จริงคือการเติบโตที่เกิดขึ้นในการเดินทาง',
    keyword: 'สำเร็จ',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ReadingPosition = 'situation' | 'action' | 'outcome';

interface DrawnCard {
  card: TarotCard;
  position: ReadingPosition;
  reversed: boolean;
  revealed: boolean;
}

const POSITION_LABELS: Record<ReadingPosition, { label: string; description: string }> = {
  situation: { label: 'สถานการณ์', description: 'สิ่งที่คุณกำลังเผชิญอยู่' },
  action: { label: 'แนวทาง', description: 'วิธีการรับมือที่เหมาะสม' },
  outcome: { label: 'ทิศทาง', description: 'ผลที่เป็นไปได้จากการกระทำ' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffleAndDraw(count: number): DrawnCard[] {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
  const positions: ReadingPosition[] = ['situation', 'action', 'outcome'];
  return shuffled.slice(0, count).map((card, i) => ({
    card,
    position: positions[i],
    reversed: Math.random() < 0.3, // 30% chance reversed
    revealed: false,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TarotPage() {
  const navigate = useNavigate();
  const { twin } = useTwin();

  const [phase, setPhase] = useState<'intro' | 'shuffling' | 'reading' | 'complete'>('intro');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);

  const archetypeLabel = twin?.primaryArchetype
    ? twin.primaryArchetype.charAt(0).toUpperCase() + twin.primaryArchetype.slice(1)
    : 'Explorer';

  const handleDraw = () => {
    setPhase('shuffling');
    setTimeout(() => {
      const cards = shuffleAndDraw(3);
      setDrawnCards(cards);
      setPhase('reading');
    }, 1500);
  };

  const handleReveal = (index: number) => {
    setDrawnCards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], revealed: true };
      const nowAll = updated.every((c) => c.revealed);
      if (nowAll) setAllRevealed(true);
      return updated;
    });
  };

  const handleChatWithTwin = () => {
    const summary = drawnCards
      .map((d) => `${POSITION_LABELS[d.position].label}: ${d.card.nameTh} (${d.card.keyword})`)
      .join(', ');
    navigate('/chat/twin', {
      state: {
        initialMessage: `ฉันเพิ่งทำการอ่านสัญลักษณ์ SELFPRINT ได้ไพ่ 3 ใบ: ${summary} — ช่วยฉันสำรวจความหมายของมันในแง่ของตัวตนและทิศทางชีวิตของฉันได้ไหม?`,
      },
    });
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)', paddingBottom: 80 }}>
      <MetaTagManager title="การอ่านสัญลักษณ์ — SELFPRINT" description="สะท้อนความคิดผ่านสัญลักษณ์ทางจิตวิทยา" />
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
            🃏 การอ่านสัญลักษณ์
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
            สะท้อนความคิดผ่านสัญลักษณ์ทางจิตวิทยา — ออกแบบสำหรับ {archetypeLabel}
          </p>
        </div>

        {/* Intro Phase */}
        {phase === 'intro' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>🃏</div>
            <p style={{
              fontSize: 16,
              color: 'var(--color-text-primary)',
              lineHeight: 1.7,
              marginBottom: 12,
            }}>
              ไพ่แต่ละใบคือกระจกสะท้อนมุมมองทางจิตวิทยา<br />
              ไม่ใช่การทำนาย — แต่เป็นการตั้งคำถามกับตัวเอง
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 32 }}>
              วาด 3 ใบ: สถานการณ์ · แนวทาง · ทิศทาง
            </p>
            <button
              onClick={handleDraw}
              style={{
                background: 'var(--color-accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                padding: '16px 40px',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✨ เริ่มการอ่าน
            </button>
          </div>
        )}

        {/* Shuffling Phase */}
        {phase === 'shuffling' && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite' }}>🔮</div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>กำลังสุ่มไพ่...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Reading Phase */}
        {phase === 'reading' && (
          <div>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20, textAlign: 'center' }}>
              แตะไพ่แต่ละใบเพื่อเปิด
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {drawnCards.map((drawn, index) => (
                <CardSlot
                  key={drawn.card.id}
                  drawn={drawn}
                  index={index}
                  onReveal={() => handleReveal(index)}
                />
              ))}
            </div>

            {allRevealed && (
              <div style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  💬 คุยกับ Twin เพื่อสำรวจความหมายเหล่านี้ในบริบทของคุณ
                </p>
                <button
                  onClick={handleChatWithTwin}
                  style={{
                    background: 'var(--color-accent-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 24px',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  คุยกับ Twin เกี่ยวกับการอ่านนี้ →
                </button>
              </div>
            )}

            <button
              onClick={handleDraw}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 14,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              🔄 สุ่มใหม่
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// ─── Sub-component: CardSlot ──────────────────────────────────────────────────

function CardSlot({
  drawn,
  index,
  onReveal,
}: {
  drawn: DrawnCard;
  index: number;
  onReveal: () => void;
}) {
  const pos = POSITION_LABELS[drawn.position];

  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Position label */}
      <div style={{
        padding: '10px 16px 8px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--color-accent-primary)',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          ใบที่ {index + 1} · {pos.label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {pos.description}
        </span>
      </div>

      {/* Card face */}
      {drawn.revealed ? (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 40 }}>{drawn.card.emoji}</span>
            <div>
              <div style={{
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}>
                {drawn.card.nameTh}
                {drawn.reversed && (
                  <span style={{
                    fontSize: 11,
                    color: 'var(--color-text-secondary)',
                    fontWeight: 400,
                    marginLeft: 6,
                  }}>
                    (กลับหัว)
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {drawn.card.selfprintTheme} · {drawn.card.keyword}
              </div>
            </div>
          </div>
          <p style={{
            fontSize: 14,
            color: 'var(--color-text-primary)',
            lineHeight: 1.7,
            margin: 0,
            paddingLeft: 52,
          }}>
            {drawn.reversed
              ? `[มุมมองย้อนกลับ] สิ่งที่ขัดขวาง${drawn.card.selfprintTheme}ของคุณอาจมาจากภายใน — ลองสำรวจว่าความกลัวหรือความเชื่อใดที่ทำให้คุณไม่กล้าก้าวไปข้างหน้า`
              : drawn.card.insightTh}
          </p>
        </div>
      ) : (
        <button
          onClick={onReveal}
          style={{
            width: '100%',
            padding: '28px 16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            color: 'var(--color-text-secondary)',
            fontSize: 15,
          }}
        >
          <span style={{ fontSize: 32 }}>🎴</span>
          <span>แตะเพื่อเปิดไพ่</span>
        </button>
      )}
    </div>
  );
}
