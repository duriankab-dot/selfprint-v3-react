/**
 * FeatureMenu.tsx
 *
 * หน้า "เมนูฟีเจอร์" — รวมทุกฟีเจอร์ของเว็บเป็นการ์ดคลิกได้ในที่เดียว
 * ให้ผู้ใช้เห็นภาพรวมทั้งหมดของ SelfPrint และกดเข้าฟีเจอร์ที่ต้องการได้ทันที
 */

import { Link } from 'react-router-dom';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { useLanguage } from '@/context/LanguageContext';

interface Feature {
  icon: string;
  title: string;
  description: string;
  to: string;
  tag?: string;
}

const FEATURES: Feature[] = [
  {
    icon: '🏠',
    title: 'หน้าแรก',
    description: 'ภาพรวมของ SelfPrint และวิธีการทำงานของ AI Twin',
    to: '/',
  },
  {
    icon: '✨',
    title: 'สร้าง AI Twin ของคุณ',
    description: 'เริ่มต้นสร้างโปรไฟล์ AI Twin จากวันเกิดและคำถามเจาะลึกเรื่องการตัดสินใจ',
    to: '/onboarding',
    tag: 'เริ่มต้นที่นี่',
  },
  {
    icon: '💬',
    title: 'คุยกับ AI ฝาแฝด',
    description: 'สนทนากับ AI ที่เข้าใจรูปแบบการตัดสินใจของคุณ ปรับระดับความเป็นอิสระได้เอง',
    // BOTTOMNAV-001 FIX: '/chat' redirects to /chat/nova (pre-Twin guide),
    // wrong assistant — this card is explicitly labeled "AI ฝาแฝด" (Twin).
    to: '/chat/twin',
  },
  {
    icon: '📊',
    title: 'แดชบอร์ด & AI Twin Blueprint',
    description: 'ดู Prototype Core, ข้อมูลเชิงลึก แนวโน้มความเป็นอิสระ ส่งออก และแชร์ทั้งหมดในที่เดียว',
    to: '/dashboard',
  },
];

export default function FeatureMenu() {
  const { language } = useLanguage();
  // ROUTELOOP-002 FIX: bare paths hit the app's catch-all route instead of
  // the intended page. "/" is left alone (own dedicated redirect rule).
  const prefixedTo = (to: string) => (to === '/' ? '/' : `/${language}${to}`);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, var(--accent-light, var(--color-bg-secondary)) 0%, var(--color-bg-primary) 100%)',
          padding: '48px 24px 64px',
        }}
      >
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1
              style={{
                fontSize: '30px',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: 'var(--color-text-primary)',
                margin: '0 0 10px 0',
              }}
            >
              เมนูฟีเจอร์
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: 0 }}>
              ทุกฟีเจอร์ของ SelfPrint ในที่เดียว เลือกได้เลยว่าอยากทำอะไรต่อ
            </p>
          </div>

          <style>{`
            .sp-feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
            .sp-feature-card { transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s; }
            .sp-feature-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); border-color: var(--color-accent-primary) !important; }
          `}</style>

          <div className="sp-feature-grid">
            {FEATURES.map((feature) => (
              <Link
                key={feature.title}
                to={prefixedTo(feature.to)}
                className="sp-feature-card"
                style={{
                  display: 'block',
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'var(--color-bg-secondary)',
                  border: '1.5px solid var(--color-border)',
                  textDecoration: 'none',
                  position: 'relative',
                }}
              >
                {feature.tag && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '18px',
                      right: '18px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'white',
                      background: 'var(--color-accent-primary)',
                      padding: '3px 10px',
                      borderRadius: '999px',
                    }}
                  >
                    {feature.tag}
                  </span>
                )}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '46px',
                    height: '46px',
                    borderRadius: '13px',
                    fontSize: '22px',
                    background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--accent-primary, var(--color-accent-primary)) 100%)',
                    marginBottom: '16px',
                  }}
                >
                  {feature.icon}
                </span>
                <h2
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    margin: '0 0 6px 0',
                  }}
                >
                  {feature.title}
                </h2>
                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
