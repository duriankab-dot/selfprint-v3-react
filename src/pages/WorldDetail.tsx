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

import { useEffect } from 'react';
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
        title={`${world.name} — Selfprint`}
        description={world.description}
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
      <div
        className="world-detail"
        style={{ '--world-color': world.color } as React.CSSProperties}
      >
        <div className="wd-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
          <h1>{world.name}</h1>
          <p className="wd-tagline">{world.tagline} · {world.mood}</p>
          {environment && (
            <p className="wd-tagline" style={{ fontSize: '0.85rem', opacity: 0.75 }}>
              {environment.ambientDescription}
            </p>
          )}
          <p className="wd-description">{world.description}</p>

          <div className="wh-focus-areas">
            <span className="fa-label">Focus Areas:</span>
            {world.focusAreas.map((area) => (
              <span key={area} className="fa-tag">{area}</span>
            ))}
          </div>
        </div>

        {articles.length > 0 && (
          <div className="wh-articles">
            <h3>📖 Explore This World</h3>
            <div className="articles-list">
              {articles.map((article) => (
                <div key={article.slug} className="article-card">
                  <h4>{article.title}</h4>
                  <p className="article-excerpt">{article.excerpt}</p>
                  <div className="article-meta">
                    <span className="meta-read-time">⏱️ {article.readTime} min</span>
                    <span className="meta-author">✍️ {article.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="wh-twin-guidance">
          <h3>💡 Twin's Guidance</h3>
          <p className="guidance-text">
            Twin adapts expertise to {world.name} — insights and advice grounded in this world's focus.
          </p>
          <Link to={`/${language}/chat/twin?world=${world.id}`} className="btn-explore">
            Chat with Twin about {world.name.toLowerCase()} →
          </Link>
        </div>
      </div>
    </>
  );
}
