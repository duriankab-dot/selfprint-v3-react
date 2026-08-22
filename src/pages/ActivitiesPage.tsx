/**
 * ActivitiesPage.tsx — กิจกรรม (Activities)
 *
 * §5.5 กิจกรรม = Activity Library สำหรับ Growth Loop
 *
 * 6 หมวดหมู่ (Master Directive §5.5):
 * - สะท้อนคิด (Reflect)
 * - ค้นพบ (Discover)
 * - ตัดสินใจ (Decide)
 * - เชื่อมต่อ (Connect)
 * - เติบโต (Grow)
 * - ประจำวัน (Daily)
 *
 * แต่ละกิจกรรมเชื่อมไปยังฟีเจอร์ที่มีจริง (/chat, /brief, /analysis, /badges)
 */

import { useState } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { NavBar } from '../components/layout/NavBar';
import { BottomNav } from '../components/layout/BottomNav';

interface Activity {
  id: string;
  emoji: string;
  title: string;
  description: string;
  duration: string;
  route?: string;
  chatPrompt?: string;  // ถ้า route='/chat' จะส่ง initialMessage นี้
}

interface ActivityCategory {
  id: string;
  emoji: string;
  label: string;
  color: string;
  activities: Activity[];
}

const CATEGORIES: ActivityCategory[] = [
  {
    id: 'reflect',
    emoji: '🪞',
    label: 'สะท้อนคิด',
    color: 'var(--color-accent-primary)',
    activities: [
      {
        id: 'daily-brief',
        emoji: '📰',
        title: 'อ่านสรุปประจำวัน',
        description: 'AI ฝาแฝดสรุปสิ่งสำคัญสำหรับวันนี้โดยเฉพาะสำหรับคุณ',
        duration: '3 นาที',
        route: '/brief',
      },
      {
        id: 'evening-reflect',
        emoji: '🌙',
        title: 'สะท้อนคิดตอนเย็น',
        description: 'ทบทวนวันนี้: สิ่งที่ดี สิ่งที่เรียนรู้ สิ่งที่อยากเปลี่ยน',
        duration: '5 นาที',
        route: '/chat',
        chatPrompt: 'ขอทำ Evening Reflection กับคุณ — วันนี้เป็นอย่างไรบ้าง? มีอะไรที่ดีเกิดขึ้น อะไรที่เรียนรู้ และอะไรที่อยากปรับในวันพรุ่งนี้?',
      },
      {
        id: 'week-review',
        emoji: '📋',
        title: 'ทบทวนสัปดาห์',
        description: 'มองภาพรวมสัปดาห์ที่ผ่านมาว่าคุณเดินหน้าไปทิศไหน',
        duration: '10 นาที',
        route: '/chat',
        chatPrompt: 'ขอทำ Weekly Review กับคุณ — สัปดาห์นี้เป็นอย่างไรบ้าง? มีความสำเร็จอะไร มีอุปสรรคอะไร และสัปดาห์หน้าจะโฟกัสที่อะไร?',
      },
    ],
  },
  {
    id: 'discover',
    emoji: '🔍',
    label: 'ค้นพบ',
    color: '#8B5CF6',
    activities: [
      {
        id: 'hexagram',
        emoji: '☯',
        title: 'เปิดเซียมซีวันนี้',
        description: 'รับคำแนะนำจากวิชา I Ching ตามวันเกิดของคุณ',
        duration: '5 นาที',
        route: '/explore',
      },
      {
        id: 'values',
        emoji: '🧭',
        title: 'ค้นหาคุณค่าชีวิต',
        description: 'สำรวจว่าอะไรสำคัญที่สุดสำหรับคุณจริงๆ',
        duration: '10 นาที',
        route: '/chat',
        chatPrompt: 'ช่วยฉันค้นหาคุณค่าชีวิตที่แท้จริงของฉัน ด้วยการถามคำถามแบบ Socratic — ถามทีละข้อ รอฟังคำตอบ แล้วค่อยถามต่อ',
      },
      {
        id: 'strength',
        emoji: '💪',
        title: 'สำรวจจุดแข็ง',
        description: 'ค้นพบสิ่งที่คุณทำได้ดีโดยธรรมชาติ',
        duration: '7 นาที',
        route: '/chat',
        chatPrompt: 'ช่วยฉันสำรวจจุดแข็งของตัวเอง — ถามฉันเกี่ยวกับสถานการณ์ที่ฉันรู้สึกว่าตัวเองทำได้ดี และช่วยสรุปรูปแบบที่เห็น',
      },
    ],
  },
  {
    id: 'decide',
    emoji: '⚖️',
    label: 'ตัดสินใจ',
    color: '#F59E0B',
    activities: [
      {
        id: 'decision-coach',
        emoji: '🤔',
        title: 'โค้ชตัดสินใจ',
        description: 'คุยกับ AI ฝาแฝดเพื่อคิดทบทวนการตัดสินใจที่กำลังเผชิญ',
        duration: '10 นาที',
        route: '/chat',
        chatPrompt: 'ฉันมีการตัดสินใจที่ต้องคิด — ช่วยโค้ชฉันแบบถามคำถามที่ทำให้ฉันเห็นมุมมองที่หลากหลายได้ไหม? ไม่ต้องบอกว่าฉันควรทำอะไร แค่ช่วยให้ฉันคิดได้รอบด้านขึ้น',
      },
      {
        id: 'pros-cons',
        emoji: '📊',
        title: 'วิเคราะห์ข้อดี-ข้อเสีย',
        description: 'ใช้ AI ช่วยจัดระเบียบความคิดก่อนตัดสินใจ',
        duration: '8 นาที',
        route: '/chat',
        chatPrompt: 'ช่วยฉันทำ Pros & Cons Analysis — บอกฉันมาก่อนว่าคุณกำลังพิจารณาตัดสินใจเรื่องอะไร แล้วฉันจะช่วยจัดระเบียบความคิด',
      },
    ],
  },
  {
    id: 'connect',
    emoji: '🤝',
    label: 'เชื่อมต่อ',
    color: '#10B981',
    activities: [
      {
        id: 'voice-chat',
        emoji: '🎤',
        title: 'คุยกับ AI ด้วยเสียง',
        description: 'พูดคุยกับ AI ฝาแฝดแบบ real-time ด้วย Speech-to-Text',
        duration: '5–15 นาที',
        route: '/voice',
      },
      {
        id: 'share-insight',
        emoji: '💡',
        title: 'แบ่งปันข้อคิด',
        description: 'สร้างลิงก์แชร์ insight ของคุณให้คนอื่นได้อ่าน',
        duration: '3 นาที',
        route: '/dashboard',
      },
      {
        id: 'relationship',
        emoji: '💬',
        title: 'สำรวจความสัมพันธ์',
        description: 'คุยกับ AI เพื่อทำความเข้าใจพลวัตในความสัมพันธ์ของคุณ',
        duration: '10 นาที',
        route: '/chat',
        chatPrompt: 'ฉันอยากสำรวจเรื่องความสัมพันธ์ในชีวิตของฉัน — ช่วยถามคำถามที่ทำให้ฉันเข้าใจรูปแบบในความสัมพันธ์ที่ฉันมีกับคนรอบข้าง',
      },
    ],
  },
  {
    id: 'grow',
    emoji: '🌱',
    label: 'เติบโต',
    color: '#06B6D4',
    activities: [
      {
        id: 'view-badges',
        emoji: '🏅',
        title: 'ดูเหรียญรางวัล',
        description: 'ดูความก้าวหน้าและเหรียญที่ได้รับจากการสำรวจตัวเอง',
        duration: '2 นาที',
        route: '/badges',
      },
      {
        id: 'life-hubs',
        emoji: '🎯',
        title: 'Life Hubs',
        description: 'มองภาพรวม 5 ด้านชีวิต: อาชีพ / ความสัมพันธ์ / สุขภาพ / เติบโต / สมดุล',
        duration: '5 นาที',
        route: '/life-hubs',
      },
      {
        id: 'decisions',
        emoji: '📋',
        title: 'บันทึกการตัดสินใจ',
        description: 'Log การตัดสินใจสำคัญ ดูสถิติและรูปแบบที่เกิดขึ้น',
        duration: '5 นาที',
        route: '/decisions',
      },
      {
        id: 'goal-setting',
        emoji: '🎯',
        title: 'ตั้งเป้าหมาย',
        description: 'คุยกับ AI เพื่อสร้างเป้าหมายที่ตรงกับตัวตนของคุณจริงๆ',
        duration: '10 นาที',
        route: '/chat',
        chatPrompt: 'ช่วยฉันตั้งเป้าหมายที่ตรงกับคุณค่าและตัวตนของฉัน — ถามฉันก่อนว่าฉันอยากเติบโตด้านไหน แล้วช่วยทำให้เป้าหมายนั้นชัดเจนและจริงจัง',
      },
      {
        id: 'pattern-explore',
        emoji: '🔄',
        title: 'สำรวจรูปแบบพฤติกรรม',
        description: 'AI วิเคราะห์รูปแบบที่เกิดซ้ำในชีวิตของคุณ',
        duration: '7 นาที',
        route: '/analysis',
      },
    ],
  },
  {
    id: 'daily',
    emoji: '☀️',
    label: 'ประจำวัน',
    color: '#EF4444',
    activities: [
      {
        id: 'morning-intention',
        emoji: '🌅',
        title: 'ตั้งเจตนาเช้า',
        description: 'เริ่มวันด้วยการชัดเจนว่าวันนี้คุณต้องการอะไร',
        duration: '3 นาที',
        route: '/chat',
        chatPrompt: 'ช่วยฉันตั้งเจตนาสำหรับวันนี้ — ถามฉันเกี่ยวกับสิ่งที่ต้องการทำสำเร็จ ความรู้สึกที่อยากมี และสิ่งที่จะหลีกเลี่ยง',
      },
      {
        id: 'gratitude',
        emoji: '🙏',
        title: 'บันทึกความขอบคุณ',
        description: '3 สิ่งที่คุณรู้สึกขอบคุณในวันนี้',
        duration: '3 นาที',
        route: '/chat',
        chatPrompt: 'ขอทำ Gratitude Practice กัน — ช่วยถามฉัน 3 คำถามเกี่ยวกับสิ่งที่ฉันรู้สึกขอบคุณในวันนี้ ทีละข้อ แล้วช่วยสรุปสิ่งที่ฉันพูดถึง',
      },
      {
        id: 'quick-check',
        emoji: '💊',
        title: 'เช็คอินด่วน',
        description: 'บอก AI ว่าตอนนี้รู้สึกอย่างไร — รับ insight ทันที',
        duration: '2 นาที',
        route: '/chat',
        chatPrompt: 'เช็คอินด่วน — ตอนนี้ฉันรู้สึก...',
      },
    ],
  },
];

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const visibleCategories =
    selectedCategory === 'all'
      ? CATEGORIES
      : CATEGORIES.filter(c => c.id === selectedCategory);

  const handleActivity = (activity: Activity) => {
    if (!activity.route) return;
    if (activity.route === '/chat' && activity.chatPrompt) {
      navigate('/chat', { state: { initialMessage: activity.chatPrompt } });
    } else {
      navigate(activity.route);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)', paddingBottom: 80 }}>
      <NavBar />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 0' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            กิจกรรม
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--color-text-secondary)',
            margin: '6px 0 0',
          }}>
            เลือกกิจกรรมที่ตรงกับสิ่งที่คุณต้องการตอนนี้
          </p>
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: 20,
          scrollbarWidth: 'none',
        }}>
          <FilterChip
            label="ทั้งหมด"
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />
          {CATEGORIES.map(cat => (
            <FilterChip
              key={cat.id}
              label={`${cat.emoji} ${cat.label}`}
              active={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            />
          ))}
        </div>

        {/* Activity Categories */}
        {visibleCategories.map(category => (
          <div key={category.id} style={{ marginBottom: 28 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 20 }}>{category.emoji}</span>
              <h2 style={{
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}>
                {category.label}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {category.activities.map(activity => (
                <button
                  key={activity.id}
                  onClick={() => handleActivity(activity)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{activity.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      marginBottom: 3,
                    }}>
                      {activity.title}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                    }}>
                      {activity.description}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 4,
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 11,
                      color: 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                    }}>
                      ⏱ {activity.duration}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 18 }}>›</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px',
        borderRadius: 20,
        border: active ? '1.5px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
        background: active
          ? 'color-mix(in srgb, var(--color-accent-primary) 14%, transparent)'
          : 'var(--color-bg-secondary)',
        color: active ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}
