/**
 * TodaySection.tsx — "วันนี้" Home Section (AI Orchestrator)
 *
 * Master Directive §5.2 — Dynamic Home
 *
 * "Section Library + AI Orchestrator" — เลือก section ที่เหมาะสมกับ:
 *   - เวลาของวัน (เช้า/บ่าย/เย็น/กลางคืน)
 *   - สถานะ user (มีข้อมูลหรือไม่)
 *   - DailyBrief ที่โหลดจาก API
 *
 * วางที่ด้านบนของ Dashboard แทน header เดิม
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimeSlot = 'morning' | 'midday' | 'evening' | 'night';

interface SectionCard {
  id: string;
  emoji: string;
  title: string;
  description: string;
  cta: string;
  route: string;
  chatPrompt?: string;
  priority: number; // higher = show first
}

// ---------------------------------------------------------------------------
// Section Library — all available sections
// ---------------------------------------------------------------------------

const SECTION_LIBRARY: SectionCard[] = [
  {
    id: 'daily-brief',
    emoji: '📰',
    title: 'สรุปประจำวัน',
    description: 'AI ฝาแฝดสรุปสิ่งที่สำคัญสำหรับคุณวันนี้',
    cta: 'อ่านสรุป',
    route: '/brief',
    priority: 10,
  },
  {
    id: 'morning-intention',
    emoji: '🌅',
    title: 'ตั้งเจตนาเช้า',
    description: 'ชัดเจนว่าวันนี้คุณต้องการอะไรก่อนเริ่มวัน',
    cta: 'เริ่มเลย',
    route: '/chat',
    chatPrompt: 'ช่วยฉันตั้งเจตนาสำหรับวันนี้ — ถามฉันเกี่ยวกับสิ่งที่ต้องการทำสำเร็จ ความรู้สึกที่อยากมี และสิ่งที่จะหลีกเลี่ยง',
    priority: 9,
  },
  {
    id: 'hexagram',
    emoji: '☯',
    title: 'เซียมซีวันนี้',
    description: 'คำแนะนำจากวิชา I Ching ตามวันเกิดของคุณ',
    cta: 'ดูเซียมซี',
    route: '/explore',
    priority: 7,
  },
  {
    id: 'checkin',
    emoji: '💊',
    title: 'เช็คอินด่วน',
    description: 'บอก AI ว่าตอนนี้รู้สึกอย่างไร รับ insight ทันที',
    cta: 'เช็คอิน',
    route: '/chat',
    chatPrompt: 'เช็คอินด่วน — ตอนนี้ฉันรู้สึก...',
    priority: 8,
  },
  {
    id: 'activities',
    emoji: '✨',
    title: 'กิจกรรมแนะนำ',
    description: 'เลือกกิจกรรมที่ตรงกับสิ่งที่คุณต้องการตอนนี้',
    cta: 'ดูกิจกรรม',
    route: '/activities',
    priority: 6,
  },
  {
    id: 'evening-reflect',
    emoji: '🌙',
    title: 'สะท้อนคิดตอนเย็น',
    description: 'ทบทวนวันนี้: สิ่งที่ดี สิ่งที่เรียนรู้',
    cta: 'เริ่มสะท้อนคิด',
    route: '/chat',
    chatPrompt: 'ขอทำ Evening Reflection — วันนี้เป็นอย่างไรบ้าง? มีอะไรที่ดีเกิดขึ้น อะไรที่เรียนรู้ และอะไรที่อยากปรับในวันพรุ่งนี้?',
    priority: 9,
  },
  {
    id: 'patterns',
    emoji: '🔄',
    title: 'รูปแบบพฤติกรรมของคุณ',
    description: 'AI วิเคราะห์รูปแบบที่เกิดซ้ำในชีวิตของคุณ',
    cta: 'ดูการวิเคราะห์',
    route: '/analysis',
    priority: 6,
  },
  {
    id: 'gratitude',
    emoji: '🙏',
    title: 'บันทึกความขอบคุณ',
    description: '3 สิ่งที่คุณรู้สึกขอบคุณในวันนี้',
    cta: 'บันทึก',
    route: '/chat',
    chatPrompt: 'ขอทำ Gratitude Practice กัน — ถามฉัน 3 คำถามเกี่ยวกับสิ่งที่ฉันรู้สึกขอบคุณในวันนี้ ทีละข้อ แล้วช่วยสรุป',
    priority: 7,
  },
  {
    id: 'tomorrow-prep',
    emoji: '🗓️',
    title: 'เตรียมพร้อมพรุ่งนี้',
    description: 'วางแผนวันพรุ่งนี้กับ AI ฝาแฝดของคุณ',
    cta: 'วางแผน',
    route: '/chat',
    chatPrompt: 'ช่วยฉันวางแผนสำหรับวันพรุ่งนี้ — ถามฉันเกี่ยวกับสิ่งที่ต้องทำ และช่วยจัดลำดับความสำคัญ',
    priority: 8,
  },
];

// ---------------------------------------------------------------------------
// Orchestrator — เลือก sections ตาม time slot
// ---------------------------------------------------------------------------

function getTimeSlot(): TimeSlot {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'midday';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function getGreeting(name: string, timeSlot: TimeSlot): string {
  const greetings: Record<TimeSlot, string> = {
    morning: `อรุณสวัสดิ์, ${name} ☀️`,
    midday: `สวัสดียามบ่าย, ${name} 🌤`,
    evening: `สวัสดียามเย็น, ${name} 🌇`,
    night: `สวัสดียามค่ำ, ${name} 🌙`,
  };
  return greetings[timeSlot];
}

function selectSections(timeSlot: TimeSlot, hasHistory: boolean): SectionCard[] {
  // priority sections per time slot
  const priorityIds: Record<TimeSlot, string[]> = {
    morning: ['daily-brief', 'morning-intention', 'hexagram'],
    midday: ['checkin', 'activities', 'patterns'],
    evening: ['evening-reflect', 'gratitude', 'daily-brief'],
    night: ['tomorrow-prep', 'gratitude', 'patterns'],
  };

  const wantedIds = priorityIds[timeSlot];

  // fallback for users without history — replace analysis/patterns with simpler options
  const idsToUse = !hasHistory
    ? wantedIds.map(id => (id === 'patterns' ? 'activities' : id))
    : wantedIds;

  // pick from library, dedupe
  const seen = new Set<string>();
  return idsToUse
    .map(id => SECTION_LIBRARY.find(s => s.id === id))
    .filter((s): s is SectionCard => !!s && !seen.has(s.id) && !seen.add(s.id));
}

// ---------------------------------------------------------------------------
// Thai date
// ---------------------------------------------------------------------------

function getTodayThai(): string {
  return new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TodaySectionProps {
  hasHistory?: boolean; // true ถ้า user มี decision logs / chat history
}

export function TodaySection({ hasHistory = false }: TodaySectionProps) {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [timeSlot] = useState<TimeSlot>(getTimeSlot);
  const [todayStr] = useState(getTodayThai);

  const name = session?.user?.user_metadata?.full_name
    || session?.user?.user_metadata?.name
    || session?.user?.email?.split('@')[0]
    || 'คุณ';

  const greeting = getGreeting(name, timeSlot);
  const sections = selectSections(timeSlot, hasHistory);

  const handleSection = (section: SectionCard) => {
    if (section.route === '/chat' && section.chatPrompt) {
      navigate('/chat', { state: { initialMessage: section.chatPrompt } });
    } else {
      navigate(section.route);
    }
  };

  // time slot label
  const slotLabels: Record<TimeSlot, string> = {
    morning: 'ช่วงเช้า',
    midday: 'ช่วงกลางวัน',
    evening: 'ช่วงเย็น',
    night: 'ช่วงกลางคืน',
  };

  return (
    <div style={{
      maxWidth: 680,
      margin: '0 auto',
      padding: '20px 16px 0',
    }}>
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {todayStr} · {slotLabels[timeSlot]}
        </div>
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {greeting}
        </h1>
      </div>

      {/* Section Cards — AI Orchestrator output */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {sections.map((section, idx) => (
          <SectionCardView
            key={section.id}
            section={section}
            featured={idx === 0}
            onClick={() => handleSection(section)}
          />
        ))}
      </div>

      {/* Divider to analytics below */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
          ข้อมูลเชิงลึก
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card sub-component
// ---------------------------------------------------------------------------

interface SectionCardViewProps {
  section: SectionCard;
  featured: boolean;
  onClick: () => void;
}

function SectionCardView({ section, featured, onClick }: SectionCardViewProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
        padding: featured ? '20px 18px' : '16px 16px',
        background: featured
          ? 'color-mix(in srgb, var(--color-accent-primary) 10%, var(--color-bg-secondary))'
          : 'var(--color-bg-secondary)',
        border: featured
          ? '1.5px solid color-mix(in srgb, var(--color-accent-primary) 40%, transparent)'
          : '1px solid var(--color-border)',
        borderRadius: 16,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'transform 0.1s, box-shadow 0.2s',
        gridColumn: featured ? 'span 2' : 'span 1',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        <span style={{ fontSize: featured ? 32 : 26 }}>{section.emoji}</span>
        {featured && (
          <span style={{
            fontSize: 11,
            padding: '3px 8px',
            background: 'color-mix(in srgb, var(--color-accent-primary) 18%, transparent)',
            color: 'var(--color-accent-primary)',
            borderRadius: 8,
            fontWeight: 600,
          }}>
            แนะนำ
          </span>
        )}
      </div>

      <div>
        <div style={{
          fontSize: featured ? 15 : 14,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 4,
          lineHeight: 1.3,
        }}>
          {section.title}
        </div>
        <div style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}>
          {section.description}
        </div>
      </div>

      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--color-accent-primary)',
        marginTop: 'auto',
      }}>
        {section.cta} →
      </div>
    </button>
  );
}

export default TodaySection;
