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
import { useLangNavigate as useNavigate } from '../../hooks/useLangNavigate';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

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

const SECTION_LIBRARY_TH: SectionCard[] = [
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
    // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
    // (pre-Twin guide) — wrong assistant once a Twin exists.
    route: '/chat/twin',
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
    // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
    // (pre-Twin guide) — wrong assistant once a Twin exists.
    route: '/chat/twin',
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
    // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
    // (pre-Twin guide) — wrong assistant once a Twin exists.
    route: '/chat/twin',
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
    // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
    // (pre-Twin guide) — wrong assistant once a Twin exists.
    route: '/chat/twin',
    chatPrompt: 'ขอทำ Gratitude Practice กัน — ถามฉัน 3 คำถามเกี่ยวกับสิ่งที่ฉันรู้สึกขอบคุณในวันนี้ ทีละข้อ แล้วช่วยสรุป',
    priority: 7,
  },
  {
    id: 'tomorrow-prep',
    emoji: '🗓️',
    title: 'เตรียมพร้อมพรุ่งนี้',
    description: 'วางแผนวันพรุ่งนี้กับ AI ฝาแฝดของคุณ',
    cta: 'วางแผน',
    // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
    // (pre-Twin guide) — wrong assistant once a Twin exists.
    route: '/chat/twin',
    chatPrompt: 'ช่วยฉันวางแผนสำหรับวันพรุ่งนี้ — ถามฉันเกี่ยวกับสิ่งที่ต้องทำ และช่วยจัดลำดับความสำคัญ',
    priority: 8,
  },
];

const SECTION_LIBRARY_EN: SectionCard[] = [
  {
    id: 'daily-brief',
    emoji: '📰',
    title: 'Daily Brief',
    description: 'Your AI Twin sums up what matters most for you today',
    cta: 'Read brief',
    route: '/brief',
    priority: 10,
  },
  {
    id: 'morning-intention',
    emoji: '🌅',
    title: 'Set a morning intention',
    description: 'Get clear on what you want today before the day begins',
    cta: 'Start now',
    route: '/chat/twin',
    chatPrompt: 'Help me set an intention for today — ask me what I want to accomplish, how I want to feel, and what to avoid.',
    priority: 9,
  },
  {
    id: 'hexagram',
    emoji: '☯',
    title: "Today's Hexagram",
    description: 'Guidance from I Ching based on your birth date',
    cta: 'View hexagram',
    route: '/explore',
    priority: 7,
  },
  {
    id: 'checkin',
    emoji: '💊',
    title: 'Quick check-in',
    description: 'Tell the AI how you feel right now, get instant insight',
    cta: 'Check in',
    route: '/chat/twin',
    chatPrompt: "Quick check-in — right now I feel...",
    priority: 8,
  },
  {
    id: 'activities',
    emoji: '✨',
    title: 'Suggested activities',
    description: 'Pick an activity that matches what you need right now',
    cta: 'View activities',
    route: '/activities',
    priority: 6,
  },
  {
    id: 'evening-reflect',
    emoji: '🌙',
    title: 'Evening reflection',
    description: 'Review today: what went well, what you learned',
    cta: 'Start reflecting',
    route: '/chat/twin',
    chatPrompt: "Let's do an Evening Reflection — how was today? What went well, what did you learn, and what would you adjust tomorrow?",
    priority: 9,
  },
  {
    id: 'patterns',
    emoji: '🔄',
    title: 'Your behavior patterns',
    description: 'AI analyzes recurring patterns in your life',
    cta: 'View analysis',
    route: '/analysis',
    priority: 6,
  },
  {
    id: 'gratitude',
    emoji: '🙏',
    title: 'Gratitude journal',
    description: "3 things you're grateful for today",
    cta: 'Log it',
    route: '/chat/twin',
    chatPrompt: "Let's do a Gratitude Practice — ask me 3 questions about what I'm grateful for today, one at a time, then summarize.",
    priority: 7,
  },
  {
    id: 'tomorrow-prep',
    emoji: '🗓️',
    title: 'Prep for tomorrow',
    description: 'Plan tomorrow with your AI Twin',
    cta: 'Plan it',
    route: '/chat/twin',
    chatPrompt: 'Help me plan for tomorrow — ask me what I need to do, and help prioritize it.',
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

function getGreeting(name: string, timeSlot: TimeSlot, isTh: boolean): string {
  const greetingsTh: Record<TimeSlot, string> = {
    morning: `อรุณสวัสดิ์, ${name} ☀️`,
    midday: `สวัสดียามบ่าย, ${name} 🌤`,
    evening: `สวัสดียามเย็น, ${name} 🌇`,
    night: `สวัสดียามค่ำ, ${name} 🌙`,
  };
  const greetingsEn: Record<TimeSlot, string> = {
    morning: `Good morning, ${name} ☀️`,
    midday: `Good afternoon, ${name} 🌤`,
    evening: `Good evening, ${name} 🌇`,
    night: `Good evening, ${name} 🌙`,
  };
  return (isTh ? greetingsTh : greetingsEn)[timeSlot];
}

function selectSections(timeSlot: TimeSlot, hasHistory: boolean, library: SectionCard[]): SectionCard[] {
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
    .map(id => library.find(s => s.id === id))
    .filter((s): s is SectionCard => !!s && !seen.has(s.id) && !seen.add(s.id));
}

// ---------------------------------------------------------------------------
// Today's date
// ---------------------------------------------------------------------------

function getTodayLocalized(isTh: boolean): string {
  return new Date().toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
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
  const { language } = useLanguage();
  const isTh = language === 'th';
  const SECTION_LIBRARY = isTh ? SECTION_LIBRARY_TH : SECTION_LIBRARY_EN;

  const [timeSlot] = useState<TimeSlot>(getTimeSlot);
  const todayStr = getTodayLocalized(isTh);

  const name = session?.user?.user_metadata?.full_name
    || session?.user?.user_metadata?.name
    || session?.user?.email?.split('@')[0]
    || (isTh ? 'คุณ' : 'you');

  const greeting = getGreeting(name, timeSlot, isTh);
  const sections = selectSections(timeSlot, hasHistory, SECTION_LIBRARY);

  const handleSection = (section: SectionCard) => {
    if (section.route === '/chat/twin' && section.chatPrompt) {
      navigate('/chat/twin', { state: { initialMessage: section.chatPrompt } });
    } else {
      navigate(section.route);
    }
  };

  // time slot label
  const slotLabels: Record<TimeSlot, string> = isTh ? {
    morning: 'ช่วงเช้า',
    midday: 'ช่วงกลางวัน',
    evening: 'ช่วงเย็น',
    night: 'ช่วงกลางคืน',
  } : {
    morning: 'Morning',
    midday: 'Midday',
    evening: 'Evening',
    night: 'Night',
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
            isTh={isTh}
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
          {isTh ? 'ข้อมูลเชิงลึก' : 'Insights'}
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
  isTh: boolean;
  onClick: () => void;
}

function SectionCardView({ section, featured, isTh, onClick }: SectionCardViewProps) {
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
            {isTh ? 'แนะนำ' : 'Suggested'}
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
