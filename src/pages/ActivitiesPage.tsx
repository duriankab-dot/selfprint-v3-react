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
import { useLanguage } from '../context/LanguageContext';

interface Activity {
  id: string;
  emoji: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  durationTh: string;
  durationEn: string;
  route?: string;
  chatPromptTh?: string;  // ถ้า route='/chat' จะส่ง initialMessage นี้
  chatPromptEn?: string;
}

interface ActivityCategory {
  id: string;
  emoji: string;
  labelTh: string;
  labelEn: string;
  color: string;
  activities: Activity[];
}

const CATEGORIES: ActivityCategory[] = [
  {
    id: 'reflect',
    emoji: '🪞',
    labelTh: 'สะท้อนคิด',
    labelEn: 'Reflect',
    color: 'var(--color-accent-primary)',
    activities: [
      {
        id: 'daily-brief',
        emoji: '📰',
        titleTh: 'อ่านสรุปประจำวัน',
        titleEn: "Read today's brief",
        descriptionTh: 'AI ฝาแฝดสรุปสิ่งสำคัญสำหรับวันนี้โดยเฉพาะสำหรับคุณ',
        descriptionEn: 'Your AI twin summarizes what matters today, made just for you',
        durationTh: '3 นาที',
        durationEn: '3 min',
        route: '/brief',
      },
      {
        id: 'evening-reflect',
        emoji: '🌙',
        titleTh: 'สะท้อนคิดตอนเย็น',
        titleEn: 'Evening reflection',
        descriptionTh: 'ทบทวนวันนี้: สิ่งที่ดี สิ่งที่เรียนรู้ สิ่งที่อยากเปลี่ยน',
        descriptionEn: 'Review today: what went well, what you learned, what to change',
        durationTh: '5 นาที',
        durationEn: '5 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ขอทำ Evening Reflection กับคุณ — วันนี้เป็นอย่างไรบ้าง? มีอะไรที่ดีเกิดขึ้น อะไรที่เรียนรู้ และอะไรที่อยากปรับในวันพรุ่งนี้?',
        chatPromptEn: "Let's do an Evening Reflection — how was today? What went well, what did you learn, and what would you like to adjust tomorrow?",
      },
      {
        id: 'week-review',
        emoji: '📋',
        titleTh: 'ทบทวนสัปดาห์',
        titleEn: 'Weekly review',
        descriptionTh: 'มองภาพรวมสัปดาห์ที่ผ่านมาว่าคุณเดินหน้าไปทิศไหน',
        descriptionEn: 'Look back at the week and see which direction you moved in',
        durationTh: '10 นาที',
        durationEn: '10 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ขอทำ Weekly Review กับคุณ — สัปดาห์นี้เป็นอย่างไรบ้าง? มีความสำเร็จอะไร มีอุปสรรคอะไร และสัปดาห์หน้าจะโฟกัสที่อะไร?',
        chatPromptEn: "Let's do a Weekly Review — how was this week? What went well, what got in the way, and what will you focus on next week?",
      },
    ],
  },
  {
    id: 'discover',
    emoji: '🔍',
    labelTh: 'ค้นพบ',
    labelEn: 'Discover',
    color: '#8B5CF6',
    activities: [
      {
        id: 'tarot',
        emoji: '🃏',
        titleTh: 'การอ่านสัญลักษณ์',
        titleEn: 'Symbol reading',
        descriptionTh: 'วาดไพ่ 3 ใบและสะท้อนความคิดผ่านสัญลักษณ์ทางจิตวิทยา',
        descriptionEn: 'Draw 3 cards and reflect through psychological symbols',
        durationTh: '5 นาที',
        durationEn: '5 min',
        route: '/tarot',
      },
      {
        id: 'palmistry',
        emoji: '🖐️',
        titleTh: 'อ่านลักษณะมือ',
        titleEn: 'Palm reading',
        descriptionTh: 'วิเคราะห์ลักษณะมือสัมพันธ์กับบุคลิกภาพและจุดแข็ง',
        descriptionEn: 'Explore how your hand shape relates to personality and strengths',
        durationTh: '7 นาที',
        durationEn: '7 min',
        route: '/palmistry',
      },
      {
        id: 'hexagram',
        emoji: '☯',
        titleTh: 'เปิดเซียมซีวันนี้',
        titleEn: "Today's hexagram",
        descriptionTh: 'รับคำแนะนำจากวิชา I Ching ตามวันเกิดของคุณ',
        descriptionEn: 'Get guidance from I Ching based on your birth date',
        durationTh: '5 นาที',
        durationEn: '5 min',
        route: '/explore',
      },
      {
        id: 'values',
        emoji: '🧭',
        titleTh: 'ค้นหาคุณค่าชีวิต',
        titleEn: 'Discover your values',
        descriptionTh: 'สำรวจว่าอะไรสำคัญที่สุดสำหรับคุณจริงๆ',
        descriptionEn: "Explore what truly matters most to you",
        durationTh: '10 นาที',
        durationEn: '10 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ช่วยฉันค้นหาคุณค่าชีวิตที่แท้จริงของฉัน ด้วยการถามคำถามแบบ Socratic — ถามทีละข้อ รอฟังคำตอบ แล้วค่อยถามต่อ',
        chatPromptEn: 'Help me discover my true life values using Socratic questioning — ask me one question at a time, wait for my answer, then continue.',
      },
      {
        id: 'strength',
        emoji: '💪',
        titleTh: 'สำรวจจุดแข็ง',
        titleEn: 'Explore your strengths',
        descriptionTh: 'ค้นพบสิ่งที่คุณทำได้ดีโดยธรรมชาติ',
        descriptionEn: "Discover what you naturally do well",
        durationTh: '7 นาที',
        durationEn: '7 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ช่วยฉันสำรวจจุดแข็งของตัวเอง — ถามฉันเกี่ยวกับสถานการณ์ที่ฉันรู้สึกว่าตัวเองทำได้ดี และช่วยสรุปรูปแบบที่เห็น',
        chatPromptEn: 'Help me explore my strengths — ask me about situations where I felt I did well, then summarize the patterns you see.',
      },
    ],
  },
  {
    id: 'decide',
    emoji: '⚖️',
    labelTh: 'ตัดสินใจ',
    labelEn: 'Decide',
    color: '#F59E0B',
    activities: [
      {
        id: 'decision-coach',
        emoji: '🤔',
        titleTh: 'โค้ชตัดสินใจ',
        titleEn: 'Decision coach',
        descriptionTh: 'คุยกับ AI ฝาแฝดเพื่อคิดทบทวนการตัดสินใจที่กำลังเผชิญ',
        descriptionEn: "Talk with your AI twin to think through a decision you're facing",
        durationTh: '10 นาที',
        durationEn: '10 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ฉันมีการตัดสินใจที่ต้องคิด — ช่วยโค้ชฉันแบบถามคำถามที่ทำให้ฉันเห็นมุมมองที่หลากหลายได้ไหม? ไม่ต้องบอกว่าฉันควรทำอะไร แค่ช่วยให้ฉันคิดได้รอบด้านขึ้น',
        chatPromptEn: "I have a decision to think through — can you coach me by asking questions that help me see different angles? Don't tell me what to do, just help me think it through.",
      },
      {
        id: 'pros-cons',
        emoji: '📊',
        titleTh: 'วิเคราะห์ข้อดี-ข้อเสีย',
        titleEn: 'Pros & cons analysis',
        descriptionTh: 'ใช้ AI ช่วยจัดระเบียบความคิดก่อนตัดสินใจ',
        descriptionEn: 'Let AI help organize your thinking before you decide',
        durationTh: '8 นาที',
        durationEn: '8 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ช่วยฉันทำ Pros & Cons Analysis — บอกฉันมาก่อนว่าคุณกำลังพิจารณาตัดสินใจเรื่องอะไร แล้วฉันจะช่วยจัดระเบียบความคิด',
        chatPromptEn: "Help me do a Pros & Cons Analysis — first tell me what decision you're considering, then I'll help organize your thinking.",
      },
    ],
  },
  {
    id: 'connect',
    emoji: '🤝',
    labelTh: 'เชื่อมต่อ',
    labelEn: 'Connect',
    color: '#10B981',
    activities: [
      {
        id: 'community',
        emoji: '🤝',
        titleTh: 'ชุมชน SELFPRINT',
        titleEn: 'SELFPRINT community',
        descriptionTh: 'แบ่งปัน insight และเชื่อมต่อกับผู้ใช้คนอื่น',
        descriptionEn: 'Share insights and connect with other users',
        durationTh: '5 นาที',
        durationEn: '5 min',
        route: '/community',
      },
      {
        id: 'voice-chat',
        emoji: '🎤',
        titleTh: 'คุยกับ AI ด้วยเสียง',
        titleEn: 'Talk to your AI by voice',
        descriptionTh: 'พูดคุยกับ AI ฝาแฝดแบบ real-time ด้วย Speech-to-Text',
        descriptionEn: 'Talk to your AI twin in real time with speech-to-text',
        durationTh: '5–15 นาที',
        durationEn: '5–15 min',
        route: '/voice',
      },
      {
        id: 'share-insight',
        emoji: '💡',
        titleTh: 'แบ่งปันข้อคิด',
        titleEn: 'Share an insight',
        descriptionTh: 'สร้างลิงก์แชร์ insight ของคุณให้คนอื่นได้อ่าน',
        descriptionEn: 'Create a shareable link so others can see your insight',
        durationTh: '3 นาที',
        durationEn: '3 min',
        route: '/dashboard',
      },
      {
        id: 'relationship',
        emoji: '💬',
        titleTh: 'สำรวจความสัมพันธ์',
        titleEn: 'Explore relationships',
        descriptionTh: 'คุยกับ AI เพื่อทำความเข้าใจพลวัตในความสัมพันธ์ของคุณ',
        descriptionEn: 'Talk with AI to understand the dynamics in your relationships',
        durationTh: '10 นาที',
        durationEn: '10 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ฉันอยากสำรวจเรื่องความสัมพันธ์ในชีวิตของฉัน — ช่วยถามคำถามที่ทำให้ฉันเข้าใจรูปแบบในความสัมพันธ์ที่ฉันมีกับคนรอบข้าง',
        chatPromptEn: 'I want to explore my relationships — ask me questions that help me understand the patterns in how I relate to the people around me.',
      },
    ],
  },
  {
    id: 'grow',
    emoji: '🌱',
    labelTh: 'เติบโต',
    labelEn: 'Grow',
    color: '#06B6D4',
    activities: [
      {
        id: 'view-badges',
        emoji: '🏅',
        titleTh: 'ดูเหรียญรางวัล',
        titleEn: 'View your badges',
        descriptionTh: 'ดูความก้าวหน้าและเหรียญที่ได้รับจากการสำรวจตัวเอง',
        descriptionEn: 'See your progress and the badges earned from self-exploration',
        durationTh: '2 นาที',
        durationEn: '2 min',
        route: '/badges',
      },
      {
        id: 'life-hubs',
        emoji: '🎯',
        titleTh: 'Life Hubs',
        titleEn: 'Life Hubs',
        descriptionTh: 'มองภาพรวม 5 ด้านชีวิต: อาชีพ / ความสัมพันธ์ / สุขภาพ / เติบโต / สมดุล',
        descriptionEn: 'See the big picture across 5 areas of life: career / relationships / health / growth / balance',
        durationTh: '5 นาที',
        durationEn: '5 min',
        route: '/life-hubs',
      },
      {
        id: 'decisions',
        emoji: '📋',
        titleTh: 'บันทึกการตัดสินใจ',
        titleEn: 'Decision log',
        descriptionTh: 'Log การตัดสินใจสำคัญ ดูสถิติและรูปแบบที่เกิดขึ้น',
        descriptionEn: 'Log important decisions and see the stats and patterns behind them',
        durationTh: '5 นาที',
        durationEn: '5 min',
        route: '/decisions',
      },
      {
        id: 'goal-setting',
        emoji: '🎯',
        titleTh: 'ตั้งเป้าหมาย',
        titleEn: 'Set a goal',
        descriptionTh: 'คุยกับ AI เพื่อสร้างเป้าหมายที่ตรงกับตัวตนของคุณจริงๆ',
        descriptionEn: 'Talk with AI to build a goal that truly fits who you are',
        durationTh: '10 นาที',
        durationEn: '10 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ช่วยฉันตั้งเป้าหมายที่ตรงกับคุณค่าและตัวตนของฉัน — ถามฉันก่อนว่าฉันอยากเติบโตด้านไหน แล้วช่วยทำให้เป้าหมายนั้นชัดเจนและจริงจัง',
        chatPromptEn: 'Help me set a goal that matches my values and who I am — first ask what area I want to grow in, then help make that goal clear and concrete.',
      },
      {
        id: 'pattern-explore',
        emoji: '🔄',
        titleTh: 'สำรวจรูปแบบพฤติกรรม',
        titleEn: 'Explore behavioral patterns',
        descriptionTh: 'AI วิเคราะห์รูปแบบที่เกิดซ้ำในชีวิตของคุณ',
        descriptionEn: 'AI analyzes the recurring patterns in your life',
        durationTh: '7 นาที',
        durationEn: '7 min',
        route: '/analysis',
      },
    ],
  },
  {
    id: 'daily',
    emoji: '☀️',
    labelTh: 'ประจำวัน',
    labelEn: 'Daily',
    color: '#EF4444',
    activities: [
      {
        id: 'morning-intention',
        emoji: '🌅',
        titleTh: 'ตั้งเจตนาเช้า',
        titleEn: 'Morning intention',
        descriptionTh: 'เริ่มวันด้วยการชัดเจนว่าวันนี้คุณต้องการอะไร',
        descriptionEn: 'Start the day clear on what you want out of it',
        durationTh: '3 นาที',
        durationEn: '3 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ช่วยฉันตั้งเจตนาสำหรับวันนี้ — ถามฉันเกี่ยวกับสิ่งที่ต้องการทำสำเร็จ ความรู้สึกที่อยากมี และสิ่งที่จะหลีกเลี่ยง',
        chatPromptEn: "Help me set an intention for today — ask me what I want to accomplish, how I want to feel, and what to avoid.",
      },
      {
        id: 'gratitude',
        emoji: '🙏',
        titleTh: 'บันทึกความขอบคุณ',
        titleEn: 'Gratitude journal',
        descriptionTh: '3 สิ่งที่คุณรู้สึกขอบคุณในวันนี้',
        descriptionEn: "3 things you're grateful for today",
        durationTh: '3 นาที',
        durationEn: '3 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'ขอทำ Gratitude Practice กัน — ช่วยถามฉัน 3 คำถามเกี่ยวกับสิ่งที่ฉันรู้สึกขอบคุณในวันนี้ ทีละข้อ แล้วช่วยสรุปสิ่งที่ฉันพูดถึง',
        chatPromptEn: "Let's do a Gratitude Practice — ask me 3 questions about what I'm grateful for today, one at a time, then summarize what I shared.",
      },
      {
        id: 'quick-check',
        emoji: '💊',
        titleTh: 'เช็คอินด่วน',
        titleEn: 'Quick check-in',
        descriptionTh: 'บอก AI ว่าตอนนี้รู้สึกอย่างไร — รับ insight ทันที',
        descriptionEn: 'Tell AI how you feel right now — get an instant insight',
        durationTh: '2 นาที',
        durationEn: '2 min',
        // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
        // (pre-Twin guide) — wrong assistant once a Twin exists.
        route: '/chat/twin',
        chatPromptTh: 'เช็คอินด่วน — ตอนนี้ฉันรู้สึก...',
        chatPromptEn: "Quick check-in — right now I feel...",
      },
    ],
  },
];

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const visibleCategories =
    selectedCategory === 'all'
      ? CATEGORIES
      : CATEGORIES.filter(c => c.id === selectedCategory);

  const handleActivity = (activity: Activity) => {
    if (!activity.route) return;
    const chatPrompt = isTh ? activity.chatPromptTh : activity.chatPromptEn;
    if (activity.route === '/chat/twin' && chatPrompt) {
      navigate('/chat/twin', { state: { initialMessage: chatPrompt } });
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
            {isTh ? 'กิจกรรม' : 'Activities'}
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--color-text-secondary)',
            margin: '6px 0 0',
          }}>
            {isTh ? 'เลือกกิจกรรมที่ตรงกับสิ่งที่คุณต้องการตอนนี้' : "Pick an activity that matches what you need right now"}
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
            label={isTh ? 'ทั้งหมด' : 'All'}
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />
          {CATEGORIES.map(cat => (
            <FilterChip
              key={cat.id}
              label={`${cat.emoji} ${isTh ? cat.labelTh : cat.labelEn}`}
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
                {isTh ? category.labelTh : category.labelEn}
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
                      {isTh ? activity.titleTh : activity.titleEn}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                    }}>
                      {isTh ? activity.descriptionTh : activity.descriptionEn}
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
                      ⏱ {isTh ? activity.durationTh : activity.durationEn}
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
