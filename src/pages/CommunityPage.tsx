/**
 * CommunityPage.tsx
 * Phase B: Community Hub
 *
 * ชุมชน SELFPRINT — พื้นที่เชื่อมต่อ แบ่งปัน และเรียนรู้จากกัน
 *
 * Phase B.1 (this): live Insight Feed — community_insights table,
 * see supabase/migrations/033_community_insights.sql + CommunityService.ts.
 * Phase B.2 (designed, not built yet): leaderboard, weekly challenges,
 * Twin matching — see docs/PHASE_B_COMMUNITY_SPEC_TH.md.
 *
 * Rules:
 * - CSS: var(--...) only
 * - verbatimModuleSyntax: import type {} for types
 * - No fake/mock data
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { NavBar } from '../components/layout/NavBar';
import { BottomNav } from '../components/layout/BottomNav';
import { MetaTagManager } from '../components/MetaTagManager';
import { useAuth } from '../context/AuthContext';
import { useWorld } from '../context/WorldContext';
import { useLanguage } from '../context/LanguageContext';
import { WORLDS } from '../constants/worlds';
import {
  getFeed,
  shareInsight,
  toggleLike,
  deleteInsight,
  validateInsightContent,
  type CommunityInsight,
} from '../services/CommunityService';

function timeAgo(iso: string, isTh: boolean): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return isTh ? 'เมื่อสักครู่' : 'just now';
  if (mins < 60) return isTh ? `${mins} นาทีที่แล้ว` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return isTh ? `${hours} ชั่วโมงที่แล้ว` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return isTh ? `${days} วันที่แล้ว` : `${days}d ago`;
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { getTopWorlds } = useWorld();
  const { language } = useLanguage();
  const isTh = language === 'th';

  // Top world by visit count from WorldContext (real data, no mock)
  const topWorldIds = getTopWorlds(1);
  const topWorld = topWorldIds[0] ? WORLDS[topWorldIds[0]] : null;

  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id ?? null;

  // ─── Phase B.1: Insight Feed state ─────────────────────────────────────
  const [feed, setFeed] = useState<CommunityInsight[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [composeError, setComposeError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setFeedLoading(false);
      return;
    }
    let cancelled = false;
    getFeed(userId).then((rows) => {
      if (!cancelled) {
        setFeed(rows);
        setFeedLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userId]);

  async function handlePost() {
    if (!userId) return;
    const validationError = validateInsightContent(composeText);
    if (validationError) {
      setComposeError(validationError);
      return;
    }
    setPosting(true);
    setComposeError(null);
    const result = await shareInsight(userId, composeText, {
      world: topWorldIds[0],
    });
    setPosting(false);
    if (!result.success) {
      setComposeError(result.message);
      return;
    }
    setComposeText('');
    setComposeOpen(false);
    // Refresh feed to show the new post
    const rows = await getFeed(userId);
    setFeed(rows);
  }

  async function handleToggleLike(insight: CommunityInsight) {
    if (!userId) return;
    // Optimistic update
    setFeed((prev) =>
      prev.map((i) =>
        i.id === insight.id
          ? { ...i, likedByMe: !i.likedByMe, likeCount: i.likeCount + (i.likedByMe ? -1 : 1) }
          : i
      )
    );
    const result = await toggleLike(insight.id, userId, insight.likedByMe);
    if (result === null) {
      // Revert on failure
      setFeed((prev) =>
        prev.map((i) =>
          i.id === insight.id
            ? { ...i, likedByMe: insight.likedByMe, likeCount: insight.likeCount }
            : i
        )
      );
    }
  }

  async function handleDelete(insightId: string) {
    if (!userId) return;
    const ok = await deleteInsight(insightId, userId);
    if (ok) {
      setFeed((prev) => prev.filter((i) => i.id !== insightId));
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)', paddingBottom: 80 }}>
      <MetaTagManager
        title={isTh ? 'ชุมชน — SELFPRINT' : 'Community — SELFPRINT'}
        description={isTh ? 'เชื่อมต่อกับชุมชน SELFPRINT' : 'Connect with the SELFPRINT community'}
      />
      <NavBar />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 0' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            🤝 {isTh ? 'ชุมชน' : 'Community'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
            {isTh ? 'พื้นที่แบ่งปันและเรียนรู้จากกัน' : 'A space to share and learn from each other'}
          </p>
        </div>

        {/* Your contribution — Phase B.1: real compose + feed */}
        {isLoggedIn && (
          <Section title={isTh ? 'แบ่งปัน insight ของคุณ' : 'Share your insight'} emoji="💡">
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
              {isTh
                ? 'เขียนข้อคิดสั้นๆ ที่ได้จากการสำรวจตัวเองกับ Twin แบ่งปันให้คนอื่นได้อ่าน — เขียนเองเท่านั้น ไม่มีการดึงข้อมูล Blueprint ส่วนตัวไปแชร์อัตโนมัติ'
                : "Write a short reflection from exploring yourself with Twin and share it with others — written by you only, we never auto-share your private Blueprint data."}
            </p>

            {!composeOpen ? (
              <ActionCard
                emoji="📤"
                title={isTh ? 'เขียน insight ใหม่' : 'Write a new insight'}
                description={isTh ? 'แบ่งปันข้อคิดของคุณกับชุมชน' : 'Share your reflection with the community'}
                onClick={() => setComposeOpen(true)}
                accent
              />
            ) : (
              <div style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-accent-primary)',
                borderRadius: 16,
                padding: 16,
              }}>
                <textarea
                  value={composeText}
                  onChange={(e) => {
                    setComposeText(e.target.value);
                    setComposeError(null);
                  }}
                  placeholder={
                    isTh
                      ? 'วันนี้คุณค้นพบอะไรเกี่ยวกับตัวเอง? (10-500 ตัวอักษร)'
                      : 'What did you discover about yourself today? (10-500 characters)'
                  }
                  rows={4}
                  maxLength={500}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 14,
                    color: 'var(--color-text-primary)',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
                {composeError && (
                  <p style={{ fontSize: 12, color: 'var(--color-accent-danger, #ef4444)', margin: '8px 0 0' }}>
                    {composeError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setComposeOpen(false);
                      setComposeText('');
                      setComposeError(null);
                    }}
                    disabled={posting}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--color-border)',
                      borderRadius: 10,
                      padding: '10px 16px',
                      fontSize: 14,
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {isTh ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={posting || composeText.trim().length === 0}
                    style={{
                      background: 'var(--color-accent-primary)',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 20px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#fff',
                      cursor: posting ? 'default' : 'pointer',
                      opacity: posting ? 0.7 : 1,
                    }}
                  >
                    {posting ? (isTh ? 'กำลังแบ่งปัน...' : 'Sharing...') : (isTh ? 'แบ่งปัน' : 'Share')}
                  </button>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Insight feed — Phase B.1 */}
        {isLoggedIn && (
          <Section title={isTh ? 'Insight จากชุมชน' : 'Community insights'} emoji="🗨️">
            {feedLoading && (
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {isTh ? 'กำลังโหลด...' : 'Loading...'}
              </p>
            )}
            {!feedLoading && feed.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {isTh ? 'ยังไม่มี insight ในชุมชน — เป็นคนแรกที่แบ่งปันสิ!' : 'No insights yet — be the first to share!'}
              </p>
            )}
            {feed.map((insight) => (
              <div
                key={insight.id}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {insight.displayName}
                  </span>
                  {insight.world && WORLDS[insight.world as keyof typeof WORLDS] && (
                    <span style={{ fontSize: 12 }}>
                      {WORLDS[insight.world as keyof typeof WORLDS].emoji}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                    {timeAgo(insight.createdAt, isTh)}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.6, margin: '0 0 10px' }}>
                  {insight.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => handleToggleLike(insight)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: insight.likedByMe ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    {insight.likedByMe ? '❤️' : '🤍'} {insight.likeCount}
                  </button>
                  {insight.isOwner && (
                    <button
                      onClick={() => handleDelete(insight.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: 'var(--color-text-tertiary)',
                        padding: 0,
                      }}
                    >
                      {isTh ? 'ลบ' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Explore worlds together */}
        <Section title={isTh ? 'สำรวจโลกร่วมกัน' : 'Explore worlds together'} emoji="🌍">
          {topWorld && (
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                🔥 {isTh ? 'โลกที่คุณเยี่ยมชมบ่อยที่สุด' : 'Your most-visited world'}
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
            title={isTh ? 'ดูโลกทั้งหมด' : 'View all worlds'}
            description={isTh ? '12 โลกแห่งการเติบโตรอให้คุณสำรวจ' : '12 worlds of growth waiting to be explored'}
            onClick={() => navigate('/worlds')}
          />
        </Section>

        {/* Community activities */}
        <Section title={isTh ? 'กิจกรรมชุมชน' : 'Community activities'} emoji="✨">
          <ActionCard
            emoji="🃏"
            title={isTh ? 'การอ่านสัญลักษณ์' : 'Symbol reading'}
            description={isTh ? 'วาดไพ่และแบ่งปันผลการอ่านกับ Twin' : 'Draw a card and share the reading with Twin'}
            onClick={() => navigate('/tarot')}
          />
          <div style={{ height: 10 }} />
          <ActionCard
            emoji="🖐️"
            title={isTh ? 'อ่านลักษณะมือ' : 'Palm reading'}
            description={isTh ? 'วิเคราะห์บุคลิกภาพผ่านลักษณะมือ' : 'Analyze personality through palm features'}
            onClick={() => navigate('/palmistry')}
          />
          <div style={{ height: 10 }} />
          <ActionCard
            emoji="☯"
            title={isTh ? 'เปิดเซียมซี' : 'Draw a fortune stick'}
            description={isTh ? 'รับคำแนะนำจากสัญลักษณ์โบราณ' : 'Get guidance from ancient symbols'}
            onClick={() => navigate('/explore')}
          />
        </Section>

        {/* Coming soon */}
        <Section title={isTh ? 'กำลังมาเร็วๆ นี้' : 'Coming soon'} emoji="🚀">
          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 20,
          }}>
            {[
              { emoji: '🏆', label: isTh ? 'กระดานผู้นำชุมชน' : 'Community leaderboard' },
              { emoji: '🎯', label: isTh ? 'ความท้าทายชุมชนรายสัปดาห์' : 'Weekly community challenges' },
              { emoji: '🤝', label: isTh ? 'จับคู่ Twin ที่คล้ายกัน' : 'Match with similar Twins' },
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
                  {isTh ? 'เร็วๆ นี้' : 'Soon'}
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
              {isTh ? 'เข้าสู่ระบบเพื่อแบ่งปัน insight และเชื่อมต่อกับชุมชน' : 'Sign in to share insights and connect with the community'}
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
              {isTh ? 'เข้าสู่ระบบ' : 'Sign in'}
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
