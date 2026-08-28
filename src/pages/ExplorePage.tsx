/**
 * ExplorePage.tsx — สำรวจ (Explore)
 *
 * §5.4 สำรวจ = Discover yourself through different lenses
 *
 * ประกอบด้วย:
 * - เซียมซี / Hexagram (HexagramEngine — standalone fn)
 * - คำถามชวนคิด (Self Question — deterministic per day)
 * - วิเคราะห์ตัวตน → /analysis
 * - ลายนิ้วมือ / ลายมือ (coming soon — real UI structure)
 */

import { useState, useEffect } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { NavBar } from '../components/layout/NavBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { calculateHexagram } from '../lib/intelligence/HexagramEngine';
import type { HexagramResult } from '../lib/intelligence/HexagramEngine';

// คำถามชวนคิดสำหรับ Self Exploration (deterministic per day-of-year)
const SELF_QUESTIONS = [
  'สิ่งที่ทำให้คุณรู้สึกมีชีวิตชีวาที่สุดในช่วงนี้คืออะไร?',
  'ความกลัวอะไรที่คุณยังไม่ยอมรับกับตัวเอง?',
  'ถ้าคุณรู้ว่าจะไม่ล้มเหลว คุณจะทำอะไร?',
  'คุณค่าอะไรที่คุณยึดถือโดยไม่เคยสงสัย?',
  'อะไรที่คุณหยุดทำแล้ว แต่ลึกๆ รู้ว่าควรทำต่อ?',
  'ถ้ามีคนรู้จักคุณดีที่สุด เขาจะบอกว่าคุณกลัวอะไร?',
  'ช่วงเวลาไหนที่คุณรู้สึกว่าตัวเองเป็น "ตัวเองที่แท้จริง" มากที่สุด?',
  'สิ่งใดที่คุณทำซ้ำๆ แต่รู้ว่ามันไม่ได้พาคุณไปไหน?',
  'ถ้าคุณเป็นเพื่อนตัวเอง คุณจะบอกว่าอะไร?',
  'อะไรที่คุณยังรอ "พร้อม" ก่อนจะเริ่ม?',
];

export default function ExplorePage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [hexagram, setHexagram] = useState<HexagramResult | null>(null);
  const [hexLoading, setHexLoading] = useState(false);
  const [hexRevealed, setHexRevealed] = useState(false);
  const [todayQuestion, setTodayQuestion] = useState('');
  const [questionOpen, setQuestionOpen] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionDone, setReflectionDone] = useState(false); // set true after send

  // คำถามประจำวัน — deterministic ตาม day-of-year
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    setTodayQuestion(SELF_QUESTIONS[dayOfYear % SELF_QUESTIONS.length]);
  }, []);

  // โหลด Hexagram จาก birth date ใน blueprint
  const loadHexagram = async () => {
    setHexLoading(true);
    try {
      let dob = '';

      // พยายาม fetch blueprint ถ้า login อยู่
      if (session?.access_token) {
        const res = await fetch('/api/blueprint', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const ct = res.headers.get('content-type') ?? '';
          if (ct.includes('application/json')) {
            const json = await res.json();
            dob = json.blueprint?.dob || json.blueprint?.content?.dob || '';
          }
        }
      }

      // fallback: ใช้วันที่ปัจจุบันถ้าไม่มี DOB
      if (!dob) {
        dob = new Date().toISOString().slice(0, 10);
      }

      const result = calculateHexagram(dob);
      setHexagram(result);
      setHexRevealed(true);
    } catch {
      // error fallback — still show hexagram based on today
      const result = calculateHexagram(new Date().toISOString().slice(0, 10));
      setHexagram(result);
      setHexRevealed(true);
    } finally {
      setHexLoading(false);
    }
  };

  const handleSendToChat = () => {
    if (!reflectionText.trim()) return;
    setReflectionDone(true);
    // BOTTOMNAV-001/CHATROUTE-001 FIX: '/chat' redirects to /chat/nova
    // (pre-Twin guide) — wrong assistant once a Twin exists.
    navigate('/chat/twin', {
      state: {
        initialMessage: `คำถามประจำวัน: "${todayQuestion}"\n\nความคิดของฉัน: ${reflectionText}`,
      },
    });
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)', paddingBottom: 80 }}>
      <NavBar />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 0' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            สำรวจตัวเอง
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--color-text-secondary)',
            marginTop: 6,
            margin: '6px 0 0',
          }}>
            มองตัวเองจากหลากหลายมุม เพื่อให้เข้าใจตัวเองมากยิ่งขึ้น
          </p>
        </div>

        {/* Hexagram Result */}
        {hexRevealed && hexagram && (
          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              {/* Pattern ID badge แทน ☯ emoji */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'color-mix(in srgb, var(--color-accent-primary) 12%, transparent)',
                marginBottom: 8,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '6px 0 2px' }}>
                รูปแบบที่ #{hexagram.number} · {hexagram.symbol}
              </div>
              <div style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: 2,
              }}>
                {hexagram.thaiName}
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-accent-primary)', marginBottom: 14 }}>
                {hexagram.theme}
              </div>
              <p style={{
                fontSize: 14,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.75,
                textAlign: 'left',
                margin: 0,
              }}>
                {hexagram.guidance}
              </p>
            </div>

            {hexagram.keywords?.length > 0 && (
              <div style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: 16,
              }}>
                {hexagram.keywords.map(kw => (
                  <span key={kw} style={{
                    background: 'color-mix(in srgb, var(--color-accent-primary) 12%, transparent)',
                    color: 'var(--color-accent-primary)',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}

            <p style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              margin: '16px 0 0',
              lineHeight: 1.6,
            }}>
              นี่เป็นมุมมองหนึ่งสำหรับการสำรวจตัวเอง ลองดูว่าตรงกับสิ่งที่คุณกำลังรู้สึกอยู่ตอนนี้ไหม?
            </p>

            <button
              onClick={() =>
                navigate('/chat/twin', {
                  state: {
                    initialMessage: `รูปแบบที่ AI วิเคราะห์ได้: "${hexagram.thaiName}" (${hexagram.theme}) — ช่วยเชื่อมโยงกับสิ่งที่ฉันกำลังเผชิญในชีวิตจริงได้ไหม?`,
                  },
                })
              }
              style={{
                display: 'block',
                width: '100%',
                marginTop: 16,
                padding: '12px',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                color: 'var(--color-text-secondary)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              💬 คุยกับ ฝาแฝด ของคุณเกี่ยวกับเรื่องนี้
            </button>
          </div>
        )}

        {/* Question Reflection */}
        {questionOpen && todayQuestion && (
          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              คำถามประจำวัน
            </div>
            <p style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 1.65,
              margin: '0 0 16px',
            }}>
              "{todayQuestion}"
            </p>

            {!reflectionDone ? (
              <>
                <textarea
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  placeholder="เขียนความคิดของคุณที่นี่..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    color: 'var(--color-text-primary)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
                {reflectionText.trim() && (
                  <button
                    onClick={handleSendToChat}
                    style={{
                      display: 'block',
                      width: '100%',
                      marginTop: 12,
                      padding: '13px',
                      background: 'var(--color-accent-primary)',
                      border: 'none',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    คุยกับ ฝาแฝด ของคุณเกี่ยวกับเรื่องนี้
                  </button>
                )}
              </>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--color-accent-primary)', margin: 0 }}>
                ✅ ส่งให้  ฝาแฝดของคุณแล้ว
              </p>
            )}
          </div>
        )}

        {/* Explore Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* เซียมซี */}
          <ExploreCard
            emoji="☯"
            title="เซียมซี / I Ching"
            subtitle={hexLoading ? 'กำลังโหลด…' : hexRevealed ? 'ดูแล้ว — แตะเพื่อดูอีกครั้ง' : 'คำแนะนำจากวิชาตะวันออกโบราณ'}
            available={!hexLoading}
            onClick={loadHexagram}
          />

          {/* คำถามชวนคิด */}
          <ExploreCard
            emoji="💭"
            title="คำถามชวนคิด"
            subtitle={questionOpen ? 'เปิดอยู่ด้านบน' : 'มองตัวเองจากมุมใหม่'}
            available
            onClick={() => setQuestionOpen(true)}
          />

          {/* วิเคราะห์ตัวตน */}
          <ExploreCard
            emoji="🧬"
            title="วิเคราะห์ตัวตน"
            subtitle="ภาพรวมจาก ฝาแฝด ของคุณ"
            available
            onClick={() => navigate('/analysis')}
          />

          {/* ลายนิ้วมือ — coming soon */}
          <ExploreCard
            emoji="👆"
            title="สำรวจลายนิ้วมือ"
            subtitle="Dermatoglyphics"
            available={false}
            comingSoon
            onClick={() => {}}
          />

          {/* ลายมือ — coming soon */}
          <ExploreCard
            emoji="✋"
            title="สำรวจลายมือ"
            subtitle="ลายเส้นชีวิต"
            available={false}
            comingSoon
            onClick={() => {}}
          />
        </div>

        <p style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          margin: '24px 0 0',
          lineHeight: 1.6,
          padding: '0 8px',
        }}>
          ข้อมูลจากการสำรวจตัวเองเป็นสัญญาณเพื่อสำรวจตัวเอง ไม่ใช่ข้อเท็จจริงสมบูรณ์โปรดใช้วิจารณญาณ
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

interface ExploreCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  available: boolean;
  comingSoon?: boolean;
  onClick: () => void;
}

function ExploreCard({ emoji, title, subtitle, available, comingSoon, onClick }: ExploreCardProps) {
  return (
    <button
      onClick={available ? onClick : undefined}
      disabled={!available}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        cursor: available ? 'pointer' : 'default',
        textAlign: 'left',
        opacity: comingSoon ? 0.5 : 1,
        width: '100%',
      }}
    >
      <span style={{ fontSize: 30, flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {title}
          {comingSoon && (
            <span style={{
              fontSize: 10,
              padding: '2px 7px',
              background: 'var(--color-border)',
              borderRadius: 8,
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
            }}>
              เร็วๆ นี้
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{subtitle}</div>
      </div>
      {available && <span style={{ color: 'var(--color-text-secondary)', fontSize: 18, flexShrink: 0 }}>›</span>}
    </button>
  );
}
