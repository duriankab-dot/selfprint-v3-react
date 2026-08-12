/**
 * LandingPage.tsx
 *
 * Phase 3 MEMO V2 Implementation
 * Landing page with emotion-first engagement + progressive CTAs
 * Birth data moved to END
 */

import { EmotionSelector } from '@/components/features/EmotionSelector';
import { ProgressiveCTA } from '@/components/landing/ProgressiveCTA';
import { BirthDataInput } from '@/components/landing/BirthDataInput';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { useEmotion } from '@/context/EmotionContext';
import { useUserStore } from '@/store/userStore';

interface LandingPageProps {
  onStartOnboarding?: () => void;
}

export default function LandingPage({ onStartOnboarding }: LandingPageProps) {
  const { mood } = useEmotion();
  const { setLandingContext } = useUserStore();

  const handleHeroClick = () => {
    setTimeout(() => {
      document.getElementById('why-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFinalCTA = () => {
    setLandingContext({ mood });
    if (onStartOnboarding) {
      onStartOnboarding();
    } else {
      window.location.href = '/onboarding';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: "'Inter', 'Noto Sans Thai', sans-serif",
        minHeight: '100vh',
      }}
    >
      {/* NAVIGATION */}
      <NavBar
        position="fixed"
        rightSlot={<ProgressiveCTA section="next" text="สร้าง AI Twin ฟรี" variant="primary" />}
      />

      {/* HERO SECTION - SIMPLIFIED */}
      <section
        style={{
          paddingTop: '140px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center',
          minHeight: '80vh',
          background: 'linear-gradient(135deg, #F7F8FA 0%, #FFFFFF 100%)',
          padding: '140px 48px 80px',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              background: 'var(--color-accent-primary)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            💡 AI ที่เข้าใจตัวคุณ
          </span>
          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '20px',
              color: 'var(--color-text-primary)',
            }}
          >
            เข้าใจตัวเองให้ลึกขึ้น
            <br />
            ตัดสินใจได้มั่นใจขึ้นทุกวัน
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.8,
              marginBottom: '32px',
              maxWidth: '520px',
            }}
          >
            SELFPRINT สร้าง AI Twin ที่เรียนรู้จากตัวคุณ เพื่อช่วยให้ทุกการตัดสินใจดีขึ้นเรื่อย ๆ
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <ProgressiveCTA section="why" text="สร้าง AI Twin ของฉัน" variant="primary" />
            <button
              onClick={handleHeroClick}
              style={{
                padding: '14px 32px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '16px',
                cursor: 'pointer',
                border: '2px solid var(--color-accent-primary)',
                background: 'transparent',
                color: 'var(--color-accent-primary)',
                transition: 'all 0.3s',
              }}
            >
              ลองสัมผัสก่อน
            </button>
          </div>
        </div>
        {/* Hero visual — AI network diagram (SVG, no emoji) */}
        <div
          style={{
            textAlign: 'center',
            minHeight: '400px',
            background: 'linear-gradient(135deg, rgba(91, 92, 235, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Central CPU node */}
            <rect x="72" y="72" width="56" height="56" rx="12" fill="var(--color-accent-primary)" opacity="0.15" stroke="var(--color-accent-primary)" strokeWidth="2"/>
            <rect x="84" y="84" width="32" height="32" rx="6" fill="var(--color-accent-primary)" opacity="0.3"/>
            {/* CPU pins */}
            <line x1="86" y1="72" x2="86" y2="60" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="100" y1="72" x2="100" y2="60" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="114" y1="72" x2="114" y2="60" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="86" y1="128" x2="86" y2="140" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="100" y1="128" x2="100" y2="140" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="114" y1="128" x2="114" y2="140" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="72" y1="86" x2="60" y2="86" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="72" y1="100" x2="60" y2="100" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="72" y1="114" x2="60" y2="114" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="128" y1="86" x2="140" y2="86" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="128" y1="100" x2="140" y2="100" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="128" y1="114" x2="140" y2="114" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round"/>
            {/* Orbit nodes */}
            <circle cx="100" cy="30" r="10" fill="var(--color-accent-primary)" opacity="0.2" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
            <circle cx="170" cy="100" r="10" fill="var(--color-accent-primary)" opacity="0.2" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
            <circle cx="100" cy="170" r="10" fill="var(--color-accent-primary)" opacity="0.2" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
            <circle cx="30" cy="100" r="10" fill="var(--color-accent-primary)" opacity="0.2" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
            {/* Connection lines */}
            <line x1="100" y1="40" x2="100" y2="60" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
            <line x1="160" y1="100" x2="140" y2="100" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
            <line x1="100" y1="160" x2="100" y2="140" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
            <line x1="40" y1="100" x2="60" y2="100" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
          </svg>
        </div>
      </section>

      {/* EMOTION SELECTOR - FIRST INTERACTION (MOVED UP) */}
      <section
        style={{
          background: 'linear-gradient(135deg, #F7F8FA 0%, #EFF2FF 100%)',
          padding: '80px 48px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: '16px',
          }}
        >
          วันนี้ คุณรู้สึกยังไง?
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.8,
            marginBottom: '48px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          อารมณ์ของคุณช่วยให้ AI Twin เข้าใจตัวคุณได้ดีขึ้น
        </p>

        <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
          <EmotionSelector />
        </div>
      </section>

      {/* WHY SECTION - Feature Value */}
      <section
        id="why-section"
        style={{
          background: 'white',
          padding: '100px 48px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: '16px',
          }}
        >
          ทำไมคุณถึงต้องใช้ AI Twin?
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            marginBottom: '40px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.8,
          }}
        >
          คุณทำการตัดสินใจ 100+ ครั้งต่อวัน แต่ผลลัพธ์ส่วนใหญ่เกิดจากรูปแบบที่ซ้ำ ๆ กัน
          ที่คุณยังไม่เข้าใจตัวเอง
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '40px' }}>
          <div style={{ padding: '24px', background: 'var(--color-bg-secondary)', borderRadius: '12px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>ตัดสินใจได้ชัด</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              เข้าใจสไตล์การตัดสินใจของคุณ
            </p>
          </div>
          <div style={{ padding: '24px', background: 'var(--color-bg-secondary)', borderRadius: '12px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💡</div>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>จดจำรูปแบบของคุณ</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              AI มองเห็นสิ่งที่คุณมองข้าม
            </p>
          </div>
          <div style={{ padding: '24px', background: 'var(--color-bg-secondary)', borderRadius: '12px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>เติบโตช่วยตัวเอง</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              ทุกการตัดสินใจถูกเรียนรู้
            </p>
          </div>
        </div>

        <ProgressiveCTA section="why" text="สร้าง AI Twin ของฉัน" variant="primary" />
      </section>

      {/* AI TOUR VIDEO SECTION */}
      <section
        style={{
          background: 'white',
          padding: '80px 48px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 3.5vw, 40px)',
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: '12px',
          }}
        >
          ดูว่า AI ฝาแฝดทำงานยังไง
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            marginBottom: '40px',
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.7,
          }}
        >
          ชม Demo สั้น 2 นาที — เห็นตั้งแต่สร้าง AI ฝาแฝดจนถึงรับ Insight แรก
        </p>

        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
            minHeight: '280px',
          }}
        >
          {/* Video จะ load จาก VITE_AI_TOUR_VIDEO_URL */}
          {import.meta.env.VITE_AI_TOUR_VIDEO_URL ? (
            <video
              controls
              playsInline
              preload="metadata"
              poster={import.meta.env.VITE_AI_TOUR_POSTER_URL}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            >
              <source src={import.meta.env.VITE_AI_TOUR_VIDEO_URL} type="video/mp4" />
            </video>
          ) : (
            /* Placeholder — ใส่ VITE_AI_TOUR_VIDEO_URL ใน .env เพื่อเปิดใช้ */
            <>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="var(--color-text-secondary)" stroke="none"/>
              </svg>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, margin: 0 }}>
                วิดีโอ AI Tour กำลังจะมาเร็วๆ นี้
              </p>
            </>
          )}
        </div>
      </section>

      {/* HOW SECTION - Process */}
      <section
        style={{
          background: 'var(--color-bg-secondary)',
          padding: '100px 48px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: '16px',
          }}
        >
          ทำงานยังไง?
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            marginBottom: '60px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.8,
          }}
        >
          ใช้ 3 ขั้นตอนสร้าง AI Twin ที่เข้าใจตัวคุณ 60% ใน 40 วินาที
        </p>

        <div style={{ maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--color-accent-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                1️⃣
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>บอกข้อมูลตัวเอง</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                AI เรียนรู้ข้อมูลเบื้องต้น
              </p>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--color-accent-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                2️⃣
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Twin ถูกสร้าง</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                เห็นตัวเองครั้งแรก
              </p>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--color-accent-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                3️⃣
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>เริ่มใช้งาน</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                AI ฝาแฝดเรียนรู้คุณทุกวัน
              </p>
            </div>
          </div>
        </div>

        <ProgressiveCTA section="how" text="เริ่มสร้างเลย" variant="primary" />
      </section>

      {/* WHO SECTION - Social Proof */}
      <section
        style={{
          background: 'white',
          padding: '100px 48px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: '16px',
          }}
        >
          ใครใช้อยู่บ้าง?
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            marginBottom: '60px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.8,
          }}
        >
          ผู้ประกอบการ นักลงทุน และผู้บริหารกว่า 1,000 คนใช้ SELFPRINT เพื่อตัดสินใจได้ดีขึ้น
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '40px' }}>
          <div style={{ padding: '24px', background: 'var(--color-bg-secondary)', borderRadius: '12px', textAlign: 'left' }}>
            <p style={{ fontSize: '16px', fontStyle: 'italic', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
              "SELFPRINT ช่วยให้ฉันเข้าใจรูปแบบการตัดสินใจของตัวเอง"
            </p>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>ณัฐพล, CEO</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Tech Startup</div>
          </div>
          <div style={{ padding: '24px', background: 'var(--color-bg-secondary)', borderRadius: '12px', textAlign: 'left' }}>
            <p style={{ fontSize: '16px', fontStyle: 'italic', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
              "ไม่คิดว่า AI จะเข้าใจฉันได้ลึกขึ้นจากข้อมูลวันเกิด"
            </p>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>สดชลา, Investor</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>VC Fund</div>
          </div>
          <div style={{ padding: '24px', background: 'var(--color-bg-secondary)', borderRadius: '12px', textAlign: 'left' }}>
            <p style={{ fontSize: '16px', fontStyle: 'italic', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
              "ทุกการตัดสินใจหลังจากใช้ SELFPRINT ดีขึ้นหลายเท่า"
            </p>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>วิทยา, Entrepreneur</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>E-commerce</div>
          </div>
        </div>

        <ProgressiveCTA section="who" text="พร้อมแล้ว" variant="primary" />
      </section>

      {/* NEXT SECTION - Final Context */}
      <section
        style={{
          background: 'var(--color-bg-secondary)',
          padding: '100px 48px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: '16px',
          }}
        >
          พร้อมสร้าง AI Twin ของคุณเลยไหม?
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            marginBottom: '40px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.8,
          }}
        >
          ฟรีแบบเต็มศักยภาพ ไม่ต้องใส่บัตรเครดิต
        </p>

        <ProgressiveCTA section="next" text="สร้างเลยตอนนี้" variant="primary" />
      </section>

      {/* BIRTH DATA INPUT - MOVED TO END */}
      <section
        style={{
          background: 'white',
          padding: '80px 48px',
        }}
      >
        <BirthDataInput onComplete={handleFinalCTA} />
      </section>

      {/* FINAL CTA - After Birth Data */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, #8B5CF6 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '100px 48px',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: '16px',
            color: 'white',
          }}
        >
          เริ่มต้นการเดินทางของคุณวันนี้
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '32px',
          }}
        >
          AI Twin ของคุณพร้อมแล้ว
        </p>
        <button
          onClick={handleFinalCTA}
          style={{
            padding: '18px 48px',
            fontSize: '18px',
            background: 'white',
            color: 'var(--color-accent-primary)',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          สร้าง AI Twin ของฉัน
        </button>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
