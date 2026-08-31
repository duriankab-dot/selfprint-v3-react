/**
 * WorldDetail.tsx
 * P0-D Gap #1: Full-screen entry point for a single World.
 * Route: /worlds/:worldId — no NavBar/Footer/BottomNav (full immersion,
 * per SELFPRINT_MASTER_COMMAND_AI_DEV.md P0-D spec: "NO navbar/tabs visible").
 *
 * Wires two things that existed but were never connected:
 * - WorldContext.recordWorldVisit() — analytics/badges service had zero callers
 * - /chat/twin?world=X — TwinChat.tsx already reads this param and injects a
 *   real per-world expert prompt (twin-prompts.ts), but nothing ever linked
 *   to it with the param set, so it never actually fired in production.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { WORLDS, getWorldArticles, type WorldId } from '../constants/worlds';
import { useWorld } from '../context/WorldContext';
import { MetaTagManager } from '../components/MetaTagManager';
import { useLanguage } from '../context/LanguageContext';
import { WorldEnvironment } from '../components/world/WorldEnvironment';
import { TwinPresence } from '../components/twin/TwinPresence';
import { useWorldAmbientTone } from '../hooks/useWorldAmbientTone';
import { useEnvironment } from '../context/EnvironmentContext';
import { useTwin } from '../context/TwinContext';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/common/BackButton';
import { NavRail } from '../components/layout/NavRail';
import '../styles/worlds-hub.css';

function isValidWorldId(id: string | undefined): id is WorldId {
  return !!id && Object.prototype.hasOwnProperty.call(WORLDS, id);
}

export default function WorldDetail() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { recordWorldVisit } = useWorld();

  const valid = isValidWorldId(worldId);
  const world = valid ? WORLDS[worldId] : null;
  const articles = valid ? getWorldArticles(worldId) : [];
  // WORLDCONTENT-001 FIX: article cards used to be inert (no onClick, no
  // link) — content existed nowhere to read even after being written.
  // Click-to-expand in place, same pattern as BlogListPage.tsx.
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  // Hook must run unconditionally (Rules of Hooks) — falls back to 'self'
  // when the id is invalid; the invalid-id branch redirects away before
  // this ever renders anything audible.
  const ambientWorldId = valid ? worldId : 'self';
  const ambientTone = useWorldAmbientTone(ambientWorldId);

  // VISUAL-DIRECTIVE-001: EnvironmentEngine's soundscape recommendation
  // (real time-of-day + mood driven, via WorldContext.currentWorld — set by
  // recordWorldVisit() below) — surfaced next to the sound toggle so the
  // "SOUND ADAPT" beat (directive §23) is actually visible, not just computed
  // and discarded onto unread CSS vars.
  const { environment } = useEnvironment();

  // TWIN-PRESENCE-001: Twin's own Visual DNA (archetype-driven, constant
  // across worlds per §34) — null-safe, TwinPresence falls back to a
  // neutral default if a twin hasn't loaded yet.
  const { twin } = useTwin();
  // TWINPRESENCE-005: seed for this Twin's unique traits — session.user.id
  // (not twin.id), so the exact same traits shown here also drove the
  // birth-ceremony visuals in CoreAwakening.tsx (which runs before the
  // twins row/id exists and seeds off the same session id) — the Twin the
  // user watched being born is the one they see in the World.
  const { session } = useAuth();

  // GUARD: unknown world id → back to selector, don't render a broken page
  useEffect(() => {
    if (!valid) {
      navigate('/worlds', { replace: true });
    }
  }, [valid, navigate]);

  // Record the visit once per mount — wires WorldContext's existing
  // (previously orphaned) analytics/badge tracking to a real entry point.
  useEffect(() => {
    if (valid) {
      recordWorldVisit(worldId as WorldId).catch((err) =>
        console.error('Failed to record world visit:', err)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldId, valid]);

  if (!world) return null;

  return (
    <>
      <MetaTagManager
        title={`${isTh ? world.nameTh : world.name} — Selfprint`}
        description={isTh ? world.descriptionTh : world.description}
        canonicalUrl={`/${language}/worlds/${world.id}`}
      />
      {/* P0-H: full-screen procedural environment (directive §17/§23) —
          layered behind all content, pointer-events disabled so it never
          intercepts clicks. */}
      <WorldEnvironment worldId={world.id} />
      {/* TWIN-PRESENCE-001: Twin appears in the world (directive §23/§35/§36)
          — composited above the environment, below the text/UI column. */}
      <TwinPresence
        primaryArchetype={twin?.primaryArchetype}
        secondaryArchetype={twin?.secondaryArchetype}
        worldColor={world.color}
        seedKey={session?.user?.id ?? twin?.id}
        worldId={world.id}
        maturityScore={twin?.maturityScore}
      />
      {/* APPSHELL-006 FIX: user explicitly asked for the desktop nav rail
          here too, overriding the earlier "full-immersion, no chrome"
          decision. */}
      <NavRail />
      <div
        className="world-detail"
        style={{ '--world-color': world.color } as React.CSSProperties}
      >
        <div className="wd-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* BACKBUTTON-001: real history-back — goes to wherever the
                  user actually came from (WorldsHub grid, a Twin chat link,
                  etc), not always /worlds. "All worlds" below stays as a
                  deliberate hierarchical shortcut, not a replacement. */}
              <BackButton fallbackTo="/worlds" style={{ color: 'rgba(255,255,255,0.85)' }} />
              <button className="wd-back" onClick={() => navigate('/worlds')} aria-label="Back to worlds">
                {isTh ? '← โลกทั้งหมด' : '← All worlds'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                aria-label="Go to dashboard"
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: 13,
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                🏠 {isTh ? 'หน้าหลัก' : 'Home'}
              </button>
            </div>
            <button
              onClick={ambientTone.toggle}
              aria-label={
                environment
                  ? (isTh
                      ? `${ambientTone.isPlaying ? 'ปิด' : 'เปิด'}เสียงบรรยากาศ — แนะนำ: ${environment.soundscape.labelThai}`
                      : `${ambientTone.isPlaying ? 'Turn off' : 'Turn on'} ambient sound — suggested: ${environment.soundscape.labelThai}`)
                  : (isTh
                      ? (ambientTone.isPlaying ? 'ปิดเสียงบรรยากาศ' : 'เปิดเสียงบรรยากาศ')
                      : (ambientTone.isPlaying ? 'Turn off ambient sound' : 'Turn on ambient sound'))
              }
              title={
                environment
                  ? (isTh
                      ? `${ambientTone.isPlaying ? 'ปิด' : 'เปิด'}เสียงบรรยากาศ — แนะนำ: ${environment.soundscape.labelThai}`
                      : `${ambientTone.isPlaying ? 'Turn off' : 'Turn on'} ambient sound — suggested: ${environment.soundscape.labelThai}`)
                  : (isTh
                      ? (ambientTone.isPlaying ? 'ปิดเสียงบรรยากาศ' : 'เปิดเสียงบรรยากาศ')
                      : (ambientTone.isPlaying ? 'Turn off ambient sound' : 'Turn on ambient sound'))
              }
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 8,
                color: 'rgba(255,255,255,0.75)',
                fontSize: 13,
                padding: '4px 10px',
                cursor: 'pointer',
              }}
            >
              {ambientTone.isPlaying
                ? `🔊 ${environment?.soundscape.labelThai ?? (isTh ? 'เสียงบรรยากาศ' : 'Ambient sound')}`
                : `🔈 ${environment?.soundscape.labelThai ?? (isTh ? 'เสียงบรรยากาศ' : 'Ambient sound')}`}
            </button>
          </div>
          <div className="wd-emoji">{world.emoji}</div>
          <h1>{isTh ? world.nameTh : world.name}</h1>
          <p className="wd-tagline">{isTh ? world.taglineTh : world.tagline} · {isTh ? world.moodTh : world.mood}</p>
          {environment && (
            <p className="wd-tagline" style={{ fontSize: '0.85rem', opacity: 0.75 }}>
              {environment.ambientDescription}
            </p>
          )}
          <p className="wd-description">{isTh ? world.descriptionTh : world.description}</p>

          <div className="wh-focus-areas">
            <span className="fa-label">{isTh ? 'จุดโฟกัส:' : 'Focus Areas:'}</span>
            {(isTh ? world.focusAreasTh : world.focusAreas).map((area) => (
              <span key={area} className="fa-tag">{area}</span>
            ))}
          </div>
        </div>

        {articles.length > 0 && (
          <div className="wh-articles">
            <h3>📖 {isTh ? `สำรวจโลก${world.nameTh}` : 'Explore This World'}</h3>
            <div className="articles-list">
              {articles.map((article) => {
                const isOpen = openSlug === article.slug;
                return (
                  <div
                    key={article.slug}
                    className="article-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenSlug(isOpen ? null : article.slug)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenSlug(isOpen ? null : article.slug);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                    aria-expanded={isOpen}
                  >
                    <h4>{isTh ? article.titleTh : article.title}</h4>
                    <p className="article-excerpt">{isTh ? article.excerptTh : article.excerpt}</p>
                    <div className="article-meta">
                      <span className="meta-read-time">⏱️ {article.readTime} {isTh ? 'นาที' : 'min'}</span>
                      <span className="meta-author">✍️ {article.author}</span>
                      <span className="meta-author">{isOpen ? '▲' : (isTh ? '▼ อ่านต่อ' : '▼ Read more')}</span>
                    </div>
                    {isOpen && (
                      <div
                        className="article-full-content"
                        style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        {(isTh ? article.contentTh : article.content).map((para, i) => (
                          <p key={i} style={{ marginBottom: 10, lineHeight: 1.7, opacity: 0.9 }}>
                            {para}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="wh-twin-guidance">
          <h3>💡 {isTh ? 'คำแนะนำจากทวิน' : "Twin's Guidance"}</h3>
          <p className="guidance-text">
            {isTh
              ? `ทวินปรับความเชี่ยวชาญให้เข้ากับโลก${world.nameTh} — ให้ข้อมูลเชิงลึกและคำแนะนำที่ยึดตามจุดโฟกัสของโลกนี้`
              : `Twin adapts expertise to ${world.name} — insights and advice grounded in this world's focus.`}
          </p>
          <Link to={`/${language}/chat/twin?world=${world.id}`} className="btn-explore">
            {isTh ? `คุยกับทวินเรื่อง${world.nameTh} →` : `Chat with Twin about ${world.name.toLowerCase()} →`}
          </Link>
        </div>
      </div>
    </>
  );
}
