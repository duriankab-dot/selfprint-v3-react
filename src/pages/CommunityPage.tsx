/**
 * CommunityPage.tsx
 * Phase B: Community Hub
 *
 * ชุมชน SELFPRINT — พื้นที่เชื่อมต่อ แบ่งปัน และเรียนรู้จากกัน
 *
 * Phase B MVP: functional navigation to existing sharing + worlds features.
 * Community feed (public_insights table) is Phase C — backend table needed.
 *
 * Rules:
 * - CSS: var(--...) only
 * - verbatimModuleSyntax: import type {} for types
 * - No fake/mock data
 */

import type { ReactNode } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { NavBar } from '../components/layout/NavBar';
import { BottomNav } from '../components/layout/BottomNav';
import { MetaTagManager } from '../components/MetaTagManager';
import { useAuth } from '../context/AuthContext';
import { useWorld } from '../context/WorldContext';
import { WORLDS } from '../constants/worlds';

export default function CommunityPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { getTopWorlds } = useWorld();

  // Top world by visit count from WorldContext (real data, no mock)
  const topWorldIds = getTopWorlds(1);
  const topWorld = topWorldIds[0] ? WORLDS[topWorldIds[0]] : null;

  const isLoggedIn = !!session?.user;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)', paddingBottom: 80 }}>
      <MetaTagManager title="ชุมชน — SELFPRINT" description="เชื่อมต่อกับชุมชน SELFPRINT" />
      <NavBar />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 0' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            🤝 ชุมชน
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
            พื้นที่แบ่งปันและเรียนรู้จากกัน
          </p>
        </div>

        {/* Your contribution */}
        {isLoggedIn && (
          <Section title="แบ่งปัน insight ของคุณ" emoji="💡">
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
              แชร์ข้อคิดจาก SELFPRINT Blueprint ของคุณให้คนอื่นได้อ่าน
              — แต่ละ insight ที่แบ่งปันสร้างผลกระทบในชุมชน
            </p>
            <ActionCard
              emoji="📤"
              title="สร้างลิงก์แบ่งปัน"
              description="แชร์ insight จากหน้า Dashboard ของคุณ"
              onClick={() => navigate('/dashboard')}
              accent
            />
          </Section>
        )}

        {/* Explore worlds together */}
        <Section title="สำรวจโลกร่วมกัน" emoji="🌍">
          {topWorld && (
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                🔥 โลกที่คุณเยี่ยมชมบ่อยที่สุด
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{topWorld.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 15 }}>
                    {topWorld.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {topWorld.tagline}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ActionCard
            emoji="🗺️"
            title="ดูโลกทั้งหมด"
            description="12 โลกแห่งการเติบโตรอให้คุณสำรวจ"
            onClick={() => navigate('/worlds')}
          />
        </Section>

        {/* Community activities */}
        <Section title="กิจกรรมชุมชน" emoji="✨">
          <ActionCard
            emoji="🃏"
            title="การอ่านสัญลักษณ์"
            description="วาดไพ่และแบ่งปันผลการอ่านกับ Twin"
            onClick={() => navigate('/tarot')}
          />
          <div style={{ height: 10 }} />
          <ActionCard
            emoji="🖐️"
            title="อ่านลักษณะมือ"
            description="วิเคราะห์บุคลิกภาพผ่านลักษณะมือ"
            onClick={() => navigate('/palmistry')}
          />
          <div style={{ height: 10 }} />
          <ActionCard
            emoji="☯"
            title="เปิดเซียมซี"
            description="รับคำแนะนำจากสัญลักษณ์โบราณ"
            onClick={() => navigate('/explore')}
          />
        </Section>

        {/* Coming soon */}
        <Section title="กำลังมาเร็วๆ นี้" emoji="🚀">
          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 20,
          }}>
            {[
              { emoji: '🏆', label: 'กระดานผู้นำชุมชน' },
              { emoji: '💬', label: 'กระทู้แบ่งปันประสบการณ์' },
              { emoji: '🎯', label: 'ความท้าทายชุมชนรายสัปดาห์' },
              { emoji: '🤝', label: 'จับคู่ Twin ที่คล้ายกัน' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{item.label}</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  color: 'var(--color-accent-primary)',
                  fontWeight: 600,
                  border: '1px solid var(--color-accent-primary)',
                  borderRadius: 8,
                  padding: '2px 8px',
                }}>
                  เร็วๆ นี้
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Login prompt */}
        {!isLoggedIn && (
          <div style={{
            background: 'color-mix(in srgb, var(--color-accent-primary) 8%, var(--color-bg-secondary))',
            border: '1px solid var(--color-accent-primary)',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center',
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 15, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
              เข้าสู่ระบบเพื่อแบ่งปัน insight และเชื่อมต่อกับชุมชน
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'var(--color-accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 28px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              เข้าสู่ระบบ
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function ActionCard({
  emoji,
  title,
  description,
  onClick,
  accent = false,
}: {
  emoji: string;
  title: string;
  description: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        background: accent
          ? 'color-mix(in srgb, var(--color-accent-primary) 10%, var(--color-bg-secondary))'
          : 'var(--color-bg-secondary)',
        border: accent
          ? '1px solid var(--color-accent-primary)'
          : '1px solid var(--color-border)',
        borderRadius: 16,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <span style={{ fontSize: 28, flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 3,
        }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {description}
        </div>
      </div>
      <span style={{ color: 'var(--color-text-secondary)', fontSize: 18, flexShrink: 0 }}>›</span>
    </button>
  );
}
