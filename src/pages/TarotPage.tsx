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
import { NavRail } from '../components/layout/NavRail';
import { useTwin } from '../context/TwinContext';
import { useLanguage } from '../context/LanguageContext';
import { MetaTagManager } from '../components/MetaTagManager';

// ─── Card definitions ────────────────────────────────────────────────────────

interface TarotCard {
  id: number;
  nameTh: string;
  nameEn: string;
  emoji: string;
  selfprintThemeTh: string;
  selfprintThemeEn: string;
  insightTh: string; // SELFPRINT-framed (behavioral / psychological)
  insightEn: string;
  keywordTh: string;
  keywordEn: string;
}

// 22 Major Arcana mapped to SELFPRINT psychological themes
const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0,
    nameTh: 'นักเดินทาง',
    nameEn: 'The Fool',
    emoji: '🌀',
    selfprintThemeTh: 'ความเปิดกว้าง',
    selfprintThemeEn: 'Openness',
    insightTh: 'คุณอยู่ในสภาวะที่พร้อมเรียนรู้สิ่งใหม่ — จิตใจที่เปิดกว้างคือจุดแข็งที่แท้จริงของคุณตอนนี้',
    insightEn: "You're in a state ready to learn something new — an open mind is your true strength right now.",
    keywordTh: 'เปิดกว้าง',
    keywordEn: 'Open',
  },
  {
    id: 1,
    nameTh: 'ผู้สร้าง',
    nameEn: 'The Magician',
    emoji: '✨',
    selfprintThemeTh: 'ความสามารถ',
    selfprintThemeEn: 'Capability',
    insightTh: 'ทรัพยากรที่คุณต้องการอยู่ในมือคุณแล้ว — ถึงเวลาที่จะใช้ความสามารถที่มีอยู่ให้เต็มที่',
    insightEn: "The resources you need are already in your hands — it's time to fully use the ability you already have.",
    keywordTh: 'ลงมือทำ',
    keywordEn: 'Take action',
  },
  {
    id: 2,
    nameTh: 'ผู้รู้ภายใน',
    nameEn: 'The High Priestess',
    emoji: '🌙',
    selfprintThemeTh: 'สัญชาตญาณ',
    selfprintThemeEn: 'Intuition',
    insightTh: 'คำตอบอยู่ที่ความรู้สึกภายใน — การฟังเสียงตัวเองมากขึ้นจะเปิดเผยสิ่งที่การวิเคราะห์ยังมองไม่เห็น',
    insightEn: "The answer lies in your inner feeling — listening to yourself more will reveal what analysis alone can't see.",
    keywordTh: 'ฟังตัวเอง',
    keywordEn: 'Listen within',
  },
  {
    id: 3,
    nameTh: 'ผู้บ่มเพาะ',
    nameEn: 'The Empress',
    emoji: '🌺',
    selfprintThemeTh: 'การดูแล',
    selfprintThemeEn: 'Nurturing',
    insightTh: 'พลังงานสร้างสรรค์ของคุณกำลังเติบโต — การดูแลตัวเองและสิ่งรอบข้างจะให้ผลลัพธ์ที่ยิ่งใหญ่',
    insightEn: 'Your creative energy is growing — caring for yourself and what surrounds you will yield great results.',
    keywordTh: 'เติบโต',
    keywordEn: 'Growth',
  },
  {
    id: 4,
    nameTh: 'ผู้นำ',
    nameEn: 'The Emperor',
    emoji: '⚔️',
    selfprintThemeTh: 'ความเป็นผู้นำ',
    selfprintThemeEn: 'Leadership',
    insightTh: 'ถึงเวลาตัดสินใจอย่างชัดเจนและมั่นคง — ความมีระเบียบวินัยคือพื้นฐานของความมั่นคงที่คุณต้องการ',
    insightEn: "It's time to decide clearly and firmly — discipline is the foundation of the stability you need.",
    keywordTh: 'มั่นคง',
    keywordEn: 'Steady',
  },
  {
    id: 5,
    nameTh: 'ผู้ถ่ายทอด',
    nameEn: 'The Hierophant',
    emoji: '📚',
    selfprintThemeTh: 'ความรู้',
    selfprintThemeEn: 'Knowledge',
    insightTh: 'การเรียนรู้จากผู้มีประสบการณ์หรือระบบที่พิสูจน์แล้วจะช่วยย่นเวลาและเพิ่มความแม่นยำ',
    insightEn: 'Learning from someone experienced, or a proven system, will save time and sharpen your accuracy.',
    keywordTh: 'เรียนรู้',
    keywordEn: 'Learn',
  },
  {
    id: 6,
    nameTh: 'ทางเลือก',
    nameEn: 'The Lovers',
    emoji: '💫',
    selfprintThemeTh: 'การเลือก',
    selfprintThemeEn: 'Choice',
    insightTh: 'การตัดสินใจสำคัญที่รอคุณอยู่ต้องการความชัดเจนด้านคุณค่า — เลือกตามสิ่งที่คุณเป็น ไม่ใช่สิ่งที่คาดหวังจากภายนอก',
    insightEn: "The important decision ahead of you needs clarity about your values — choose based on who you are, not what's expected of you.",
    keywordTh: 'ความชัดเจน',
    keywordEn: 'Clarity',
  },
  {
    id: 7,
    nameTh: 'นักเดินทางแห่งเจตจำนง',
    nameEn: 'The Chariot',
    emoji: '🚀',
    selfprintThemeTh: 'ความมุ่งมั่น',
    selfprintThemeEn: 'Determination',
    insightTh: 'ความสำเร็จมาจากการควบคุมทั้งแรงผลักดันภายในและภายนอก — ทิศทางที่ชัดเจนคือกุญแจสำคัญ',
    insightEn: 'Success comes from mastering both your inner drive and outer forces — a clear direction is the key.',
    keywordTh: 'มุ่งมั่น',
    keywordEn: 'Determined',
  },
  {
    id: 8,
    nameTh: 'พลังภายใน',
    nameEn: 'Strength',
    emoji: '🦁',
    selfprintThemeTh: 'ความกล้าหาญ',
    selfprintThemeEn: 'Courage',
    insightTh: 'พลังที่แท้จริงของคุณอยู่ที่ความสามารถในการรับมือกับความกลัวด้วยความสงบ ไม่ใช่การข่มใจ',
    insightEn: 'Your true power lies in your ability to face fear with calm — not by suppressing it.',
    keywordTh: 'กล้าหาญ',
    keywordEn: 'Courageous',
  },
  {
    id: 9,
    nameTh: 'ผู้อยู่กับตัวเอง',
    nameEn: 'The Hermit',
    emoji: '🕯️',
    selfprintThemeTh: 'การสะท้อนคิด',
    selfprintThemeEn: 'Reflection',
    insightTh: 'ช่วงเวลาแห่งการถอยออกมาเพื่อมองภาพรวมคือสิ่งที่คุณต้องการ — คำตอบอยู่ในความเงียบสงบ',
    insightEn: 'A moment of stepping back to see the bigger picture is what you need — the answer is in the quiet.',
    keywordTh: 'สะท้อนคิด',
    keywordEn: 'Reflect',
  },
  {
    id: 10,
    nameTh: 'วงล้อแห่งโอกาส',
    nameEn: 'Wheel of Fortune',
    emoji: '🎡',
    selfprintThemeTh: 'การเปลี่ยนแปลง',
    selfprintThemeEn: 'Change',
    insightTh: 'วงจรชีวิตกำลังเปลี่ยน — สิ่งที่คุณทำในช่วงเปลี่ยนผ่านนี้จะกำหนดทิศทางของวงรอบถัดไป',
    insightEn: "Life's cycle is turning — what you do during this transition will shape the direction of the next cycle.",
    keywordTh: 'โอกาส',
    keywordEn: 'Opportunity',
  },
  {
    id: 11,
    nameTh: 'ความสมดุล',
    nameEn: 'Justice',
    emoji: '⚖️',
    selfprintThemeTh: 'ความยุติธรรม',
    selfprintThemeEn: 'Fairness',
    insightTh: 'การตัดสินใจที่ซื่อสัตย์ต่อตัวเองและผู้อื่นจะสร้างรากฐานที่มั่นคงในระยะยาว',
    insightEn: 'Decisions that stay honest to yourself and others build a stable foundation for the long run.',
    keywordTh: 'ซื่อสัตย์',
    keywordEn: 'Honest',
  },
  {
    id: 12,
    nameTh: 'ผู้หยุดพัก',
    nameEn: 'The Hanged Man',
    emoji: '🌊',
    selfprintThemeTh: 'การยอมรับ',
    selfprintThemeEn: 'Acceptance',
    insightTh: 'บางครั้งการหยุดดิ้นรนชั่วคราวและปล่อยให้กระบวนการดำเนินไปเองคือสิ่งที่ฉลาดที่สุด',
    insightEn: 'Sometimes pausing the struggle and letting the process unfold on its own is the wisest move.',
    keywordTh: 'ปล่อยวาง',
    keywordEn: 'Let go',
  },
  {
    id: 13,
    nameTh: 'การเปลี่ยนแปลง',
    nameEn: 'Death',
    emoji: '🦋',
    selfprintThemeTh: 'การเริ่มต้นใหม่',
    selfprintThemeEn: 'New beginnings',
    insightTh: 'บทบาทหรือความเชื่อบางอย่างได้หมดอายุแล้ว — การปล่อยวางสิ่งเหล่านั้นจะเปิดพื้นที่ให้สิ่งใหม่เข้ามา',
    insightEn: "A role or belief has run its course — letting it go opens space for something new.",
    keywordTh: 'ปล่อยวาง',
    keywordEn: 'Let go',
  },
  {
    id: 14,
    nameTh: 'ผสานพลัง',
    nameEn: 'Temperance',
    emoji: '🌈',
    selfprintThemeTh: 'สมดุล',
    selfprintThemeEn: 'Balance',
    insightTh: 'ความสมดุลระหว่างสองสิ่งที่ดูขัดแย้งกันคือแก่นสำคัญที่คุณกำลังเรียนรู้ในช่วงนี้',
    insightEn: "Balancing two seemingly conflicting things is the core lesson you're learning right now.",
    keywordTh: 'สมดุล',
    keywordEn: 'Balance',
  },
  {
    id: 15,
    nameTh: 'ข้อจำกัด',
    nameEn: 'The Devil',
    emoji: '⛓️',
    selfprintThemeTh: 'รูปแบบที่ติดอยู่',
    selfprintThemeEn: 'Stuck patterns',
    insightTh: 'มีรูปแบบความคิดหรือพฤติกรรมบางอย่างที่จำกัดคุณอยู่ — การรับรู้มันคือก้าวแรกสู่อิสรภาพ',
    insightEn: "There's a thought or behavior pattern holding you back — recognizing it is the first step to freedom.",
    keywordTh: 'ตระหนักรู้',
    keywordEn: 'Awareness',
  },
  {
    id: 16,
    nameTh: 'ความเปลี่ยนแปลงกะทันหัน',
    nameEn: 'The Tower',
    emoji: '⚡',
    selfprintThemeTh: 'การเปิดเผย',
    selfprintThemeEn: 'Revelation',
    insightTh: 'สิ่งที่ถูกสร้างบนรากฐานที่ไม่มั่นคงจำเป็นต้องพัง เพื่อให้คุณสร้างสิ่งที่แข็งแกร่งกว่าได้',
    insightEn: 'What was built on unstable ground needs to fall, so you can build something stronger.',
    keywordTh: 'ปรับตัว',
    keywordEn: 'Adapt',
  },
  {
    id: 17,
    nameTh: 'ความหวัง',
    nameEn: 'The Star',
    emoji: '⭐',
    selfprintThemeTh: 'แรงบันดาลใจ',
    selfprintThemeEn: 'Inspiration',
    insightTh: 'หลังจากผ่านความท้าทาย ทิศทางของคุณเริ่มชัดเจนขึ้น — ความหวังที่แท้จริงมาจากการเห็นศักยภาพของตัวเอง',
    insightEn: 'After facing challenges, your direction is becoming clearer — real hope comes from seeing your own potential.',
    keywordTh: 'หวัง',
    keywordEn: 'Hope',
  },
  {
    id: 18,
    nameTh: 'ความไม่แน่นอน',
    nameEn: 'The Moon',
    emoji: '🌕',
    selfprintThemeTh: 'จิตใต้สำนึก',
    selfprintThemeEn: 'Subconscious',
    insightTh: 'ความรู้สึกที่คลุมเครืออยู่ในตอนนี้มีข้อมูลสำคัญซ่อนอยู่ — ลองสังเกตรูปแบบในความคิดและความฝันของคุณ',
    insightEn: 'The unclear feelings you have right now hold important information — try noticing patterns in your thoughts and dreams.',
    keywordTh: 'สังเกต',
    keywordEn: 'Observe',
  },
  {
    id: 19,
    nameTh: 'พลังชีวิต',
    nameEn: 'The Sun',
    emoji: '☀️',
    selfprintThemeTh: 'ความสุข',
    selfprintThemeEn: 'Joy',
    insightTh: 'ช่วงเวลาของความสำเร็จและความชัดเจนกำลังมาถึง — ความมั่นใจในตัวเองของคุณคือพลังงานที่แท้จริง',
    insightEn: 'A period of success and clarity is arriving — your own confidence is the real energy here.',
    keywordTh: 'มั่นใจ',
    keywordEn: 'Confident',
  },
  {
    id: 20,
    nameTh: 'การตื่นรู้',
    nameEn: 'Judgement',
    emoji: '🔔',
    selfprintThemeTh: 'การตื่นรู้',
    selfprintThemeEn: 'Awakening',
    insightTh: 'คุณกำลังอยู่ในช่วงของการประเมินตัวเองใหม่ — การยอมรับทั้งจุดแข็งและสิ่งที่ต้องพัฒนาจะพาคุณไปข้างหน้าได้จริง',
    insightEn: "You're in a period of re-evaluating yourself — accepting both your strengths and what needs growth will truly move you forward.",
    keywordTh: 'ยอมรับ',
    keywordEn: 'Accept',
  },
  {
    id: 21,
    nameTh: 'ความสมบูรณ์',
    nameEn: 'The World',
    emoji: '🌍',
    selfprintThemeTh: 'ความสำเร็จ',
    selfprintThemeEn: 'Fulfillment',
    insightTh: 'วงจรหนึ่งกำลังสิ้นสุด คุณได้เรียนรู้สิ่งสำคัญจากมัน — ความสำเร็จที่แท้จริงคือการเติบโตที่เกิดขึ้นในการเดินทาง',
    insightEn: "One cycle is ending, and you've learned something important from it — true success is the growth that happens along the way.",
    keywordTh: 'สำเร็จ',
    keywordEn: 'Fulfilled',
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

const POSITION_LABELS_TH: Record<ReadingPosition, { label: string; description: string }> = {
  situation: { label: 'สถานการณ์', description: 'สิ่งที่คุณกำลังเผชิญอยู่' },
  action: { label: 'แนวทาง', description: 'วิธีการรับมือที่เหมาะสม' },
  outcome: { label: 'ทิศทาง', description: 'ผลที่เป็นไปได้จากการกระทำ' },
};

const POSITION_LABELS_EN: Record<ReadingPosition, { label: string; description: string }> = {
  situation: { label: 'Situation', description: "What you're currently facing" },
  action: { label: 'Approach', description: 'The right way to handle it' },
  outcome: { label: 'Direction', description: 'The possible outcome from your actions' },
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
  const { language } = useLanguage();
  const isTh = language === 'th';
  const POSITION_LABELS = isTh ? POSITION_LABELS_TH : POSITION_LABELS_EN;

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
      .map((d) => `${POSITION_LABELS[d.position].label}: ${isTh ? d.card.nameTh : d.card.nameEn} (${isTh ? d.card.keywordTh : d.card.keywordEn})`)
      .join(', ');
    navigate('/chat/twin', {
      state: {
        initialMessage: isTh
          ? `ฉันเพิ่งทำการอ่านสัญลักษณ์ SELFPRINT ได้ไพ่ 3 ใบ: ${summary} — ช่วยฉันสำรวจความหมายของมันในแง่ของตัวตนและทิศทางชีวิตของฉันได้ไหม?`
          : `I just did a SELFPRINT symbol reading and drew 3 cards: ${summary} — can you help me explore what this means for who I am and where my life is headed?`,
      },
    });
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)', paddingBottom: 80 }}>
      <MetaTagManager
        title={isTh ? 'การอ่านสัญลักษณ์ — SELFPRINT' : 'Symbol Reading — SELFPRINT'}
        description={isTh ? 'สะท้อนความคิดผ่านสัญลักษณ์ทางจิตวิทยา' : 'Reflect on yourself through psychological symbols'}
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
            🃏 {isTh ? 'การอ่านสัญลักษณ์' : 'Symbol Reading'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
            {isTh
              ? `สะท้อนความคิดผ่านสัญลักษณ์ทางจิตวิทยา — ออกแบบสำหรับ ${archetypeLabel}`
              : `Reflect through psychological symbols — designed for ${archetypeLabel}`}
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
              {isTh ? (
                <>
                  ไพ่แต่ละใบคือกระจกสะท้อนมุมมองทางจิตวิทยา<br />
                  ไม่ใช่การทำนาย — แต่เป็นการตั้งคำถามกับตัวเอง
                </>
              ) : (
                <>
                  Each card is a mirror reflecting a psychological perspective<br />
                  It's not a prediction — it's a way to question yourself
                </>
              )}
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 32 }}>
              {isTh ? 'วาด 3 ใบ: สถานการณ์ · แนวทาง · ทิศทาง' : 'Draw 3 cards: Situation · Approach · Direction'}
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
              {isTh ? '✨ เริ่มการอ่าน' : '✨ Start reading'}
            </button>
          </div>
        )}

        {/* Shuffling Phase */}
        {phase === 'shuffling' && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite' }}>🔮</div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>
              {isTh ? 'กำลังสุ่มไพ่...' : 'Shuffling cards...'}
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Reading Phase */}
        {phase === 'reading' && (
          <div>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20, textAlign: 'center' }}>
              {isTh ? 'แตะไพ่แต่ละใบเพื่อเปิด' : 'Tap each card to reveal it'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {drawnCards.map((drawn, index) => (
                <CardSlot
                  key={drawn.card.id}
                  drawn={drawn}
                  index={index}
                  isTh={isTh}
                  positionLabels={POSITION_LABELS}
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
                  {isTh
                    ? '💬 คุยกับ Twin เพื่อสำรวจความหมายเหล่านี้ในบริบทของคุณ'
                    : '💬 Chat with your Twin to explore what these mean for you'}
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
                  {isTh ? 'คุยกับ Twin เกี่ยวกับการอ่านนี้ →' : 'Chat with Twin about this reading →'}
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
              {isTh ? '🔄 สุ่มใหม่' : '🔄 Draw again'}
            </button>
          </div>
        )}
      </div>

      <NavRail />
      <BottomNav />
    </div>
  );
}

// ─── Sub-component: CardSlot ──────────────────────────────────────────────────

function CardSlot({
  drawn,
  index,
  isTh,
  positionLabels,
  onReveal,
}: {
  drawn: DrawnCard;
  index: number;
  isTh: boolean;
  positionLabels: Record<ReadingPosition, { label: string; description: string }>;
  onReveal: () => void;
}) {
  const pos = positionLabels[drawn.position];
  const name = isTh ? drawn.card.nameTh : drawn.card.nameEn;
  const theme = isTh ? drawn.card.selfprintThemeTh : drawn.card.selfprintThemeEn;
  const keyword = isTh ? drawn.card.keywordTh : drawn.card.keywordEn;

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
          {isTh ? `ใบที่ ${index + 1} · ${pos.label}` : `Card ${index + 1} · ${pos.label}`}
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
                {name}
                {drawn.reversed && (
                  <span style={{
                    fontSize: 11,
                    color: 'var(--color-text-secondary)',
                    fontWeight: 400,
                    marginLeft: 6,
                  }}>
                    {isTh ? '(กลับหัว)' : '(reversed)'}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {theme} · {keyword}
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
              ? (isTh
                  ? `[มุมมองย้อนกลับ] สิ่งที่ขัดขวาง${theme}ของคุณอาจมาจากภายใน — ลองสำรวจว่าความกลัวหรือความเชื่อใดที่ทำให้คุณไม่กล้าก้าวไปข้างหน้า`
                  : `[Reversed] What's blocking your ${theme.toLowerCase()} may come from within — try exploring what fear or belief is holding you back from moving forward.`)
              : (isTh ? drawn.card.insightTh : drawn.card.insightEn)}
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
          <span>{isTh ? 'แตะเพื่อเปิดไพ่' : 'Tap to reveal'}</span>
        </button>
      )}
    </div>
  );
}
