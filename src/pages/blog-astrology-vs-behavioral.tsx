/**
 * Blog: ดูดวง vs การวิเคราะห์พฤติกรรม
 * Bridge content for Trojan Horse strategy
 */

import { useLanguage } from '@/context/LanguageContext';

export default function BlogAstrologyVsBehavioral() {
  const { language } = useLanguage();

  const content = {
    th: {
      title: 'ดูดวง vs การวิเคราะห์พฤติกรรม — อะไรคือความแตกต่าง?',
      description: 'เลิกเดาทิศทางชีวิต ให้ AI Twin วิเคราะห์รูปแบบพฤติกรรมจริงของคุณ',
      intro: `ถ้าคุณเคยลองดูดวง คุณอาจสังเกตเห็นว่า:
        - ดวงบอกว่า "วันนี้คุณจะโชคดี"
        - แต่คุณยังสับสนว่า "ควรตัดสินใจอะไรต่อไป?"

SELFPRINT ตอบคำถามที่แตกต่าง — ไม่ใช่ "คุณจะโชค" แต่ "คุณควรทำ"`,
      sections: [
        {
          title: 'ดูดวง — ทำนายอนาคต',
          content: `ดูดวง (หรือ horoscope AI) ทำนายสิ่งที่จะเกิดขึ้น:
          • ข้อมูล: ตำแหน่งดาวเคราะห์ ณ วันเกิด
          • วิธี: แปลความหมายจากตำแหน่ง
          • ผลลัพธ์: "ดวงของคุณ"`,
        },
        {
          title: 'SELFPRINT — วิเคราะห์พฤติกรรม',
          content: `SELFPRINT ทำความเข้าใจว่า "คุณเป็นคนแบบไหน":
          • ข้อมูล: รูปแบบการตัดสินใจจริงของคุณ
          • วิธี: 12 SICE engines วิเคราะห์เชิงลึก
          • ผลลัพธ์: "Twin ของคุณ" ที่เรียนรู้จากคุณ`,
        },
        {
          title: 'ทำไมต้อง Twin แทน ดูดวง?',
          content: `1. แม่นยำขึ้น — ข้อมูลมาจากคุณจริง ไม่ใช่ดาว
2. ปรับเปลี่ยนได้ — Twin เรียนรู้เมื่อคุณเติบโต
3. ตอบสิ่งที่สำคัญ — "ฉันควรทำอะไร" ไม่ใช่ "โชคดี"`,
        },
      ],
      cta: 'ทดลอง Twin ของคุณ 2 นาที — ฟรี',
    },
    en: {
      title: 'Astrology vs Behavioral Analysis — What\'s the Difference?',
      description: 'Stop guessing. Let AI Twin analyze your real behavioral patterns.',
      intro: `If you\'ve tried astrology, you may have noticed:
        - "You\'ll be lucky today"
        - But it doesn\'t tell you what to decide

SELFPRINT answers a different question — not "you will be lucky" but "here\'s what you should do"`,
      sections: [
        {
          title: 'Astrology — Predicts the Future',
          content: `Astrology predicts what will happen:
          • Data: Star positions at birth
          • Method: Interpret the positions
          • Result: "Your horoscope"`,
        },
        {
          title: 'SELFPRINT — Understands Your Behavior',
          content: `SELFPRINT explains who you are:
          • Data: Your real decision patterns
          • Method: 12 SICE engines analyze deep
          • Result: "Your Twin" that learns from you`,
        },
        {
          title: 'Why Twin Over Astrology?',
          content: `1. Accuracy — Based on real data, not stars
2. Growth — Twin learns as you evolve
3. Answers What Matters — "What should I do?" not "You\'ll be lucky"`,
        },
      ],
      cta: 'Try Your Twin — 2 min, Free',
    },
  };

  const c = content[language === 'th' ? 'th' : 'en'];

  return (
    <main style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>{c.title}</h1>
      <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.8' }}>{c.intro}</p>

      {c.sections.map((sec, i) => (
        <section key={i} style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>{sec.title}</h2>
          <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>{sec.content}</p>
        </section>
      ))}

      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <button
          style={{
            padding: '12px 32px',
            background: '#3498DB',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          {c.cta} →
        </button>
      </div>
    </main>
  );
}
