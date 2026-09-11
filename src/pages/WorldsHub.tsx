/**
 * WorldsHub.tsx
 * World selector — entry point for the 12 Worlds.
 *
 * P0-D: This used to hold each world's full detail inline (expand-in-place).
 * Per the P0-D spec ("Click → enter world (full-screen)"), each card now
 * navigates to /worlds/:worldId (WorldDetail.tsx) instead — the detail
 * rendering logic moved there to avoid duplicating it in two places.
 */

import { useNavigate } from 'react-router-dom';
import { getAllWorlds, getWorldArticles, WORLDS } from '../constants/worlds';
import { MetaTagManager } from '../components/MetaTagManager';
import { useLanguage } from '../context/LanguageContext';
import { getSeoMetadata } from '../constants/seoMetadata';
import { AppShell } from '../components/layout/AppShell';
import { Twin } from '../components/twin/Twin';
import { useTwin } from '../context/TwinContext';
import { useAuth } from '../context/AuthContext';
import '../styles/worlds-hub.css';

/**
 * §37 World Transition: wrap navigate() with the View Transitions API so the
 * browser captures the current frame, runs the navigation, then crossfades.
 * Falls back to a plain navigate() on browsers that don't support it yet.
 * Progressive enhancement — no deps, no extra bundle size.
 */
function useWorldNavigate() {
  const navigate = useNavigate();
  return (path: string) => {
    if ('startViewTransition' in document) {
      (document as Document & { startViewTransition: (cb: () => void) => unknown })
        .startViewTransition(() => { navigate(path); });
    } else {
      navigate(path);
    }
  };
}

export default function WorldsHub() {
  const navigate = useWorldNavigate();
  const worlds = getAllWorlds();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const seoData = getSeoMetadata('worlds', language);
  const { twin } = useTwin();
  const { session } = useAuth();

  return (
    <>
      {seoData && (
        <MetaTagManager
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords?.join(', ')}
          ogImage={seoData.ogImage}
          canonicalUrl={`/${language}/worlds`}
        />
      )}
      <AppShell>
      <div className="worlds-hub immersive-page page-content" data-testid="worlds-container">
        {/* Header */}
        <div className="wh-header">
          {/* TWINGUIDE-001 (Track C Phase 9, G1 / §4.5 / §13): the subtitle
              below already claimed "Twin as your guide", but no Twin was
              actually visible anywhere on this page -- WorldsHub was a bare
              grid, exactly the "directory" pattern §13 calls out. Reusing
              the same Twin facade WorldDetail.tsx already renders per-world
              (contained, small, decorative) makes the guide real instead of
              just a line of copy. Self world's own color (#22D3EE) is used
              as the aura tint since no single world is selected yet here. */}
          <div style={{ width: 72, height: 72, margin: '0 auto 12px' }}>
            <Twin
              variant="presence"
              primaryArchetype={twin?.primaryArchetype}
              secondaryArchetype={twin?.secondaryArchetype}
              worldColor={WORLDS.self.color}
              seedKey={session?.user?.id ?? twin?.id}
              contained
              maturityScore={twin?.maturityScore}
            />
          </div>
          <h1>✨ {isTh ? '12 โลกแห่งชีวิต' : 'The 12 Worlds'}</h1>
          <p className="wh-subtitle">
            {isTh
              ? 'สำรวจทั้ง 12 มิติของชีวิตคุณ โดยมีทวินเป็นไกด์นำทาง — เลื่อนลงเพื่อดูทั้งหมด'
              : 'Explore all 12 dimensions of your life with Twin as your guide — scroll down to see them all'}
          </p>
        </div>

        {/* World Grid */}
        <div className="wh-worlds-grid" data-testid="worlds-scroller">
          {worlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
              isTh={isTh}
              onClick={() => navigate(`/${language}/worlds/${world.id}`)}
              articleCount={getWorldArticles(world.id).length}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="wh-info">
          <h3>{isTh ? '12 โลกทำงานอย่างไร' : 'How the 12 Worlds Work'}</h3>
          <p>
            {isTh
              ? 'แต่ละโลกแทนหนึ่งมิติของชีวิตคุณ เมื่อคุณสำรวจไปพร้อมกับทวิน คุณจะได้รับข้อมูลเชิงลึก ติดตามการตัดสินใจ และเติบโตผ่านแต่ละโลก ทวินของคุณจะปรับตัวและเรียนรู้เพื่อรับใช้แต่ละโลกตามความต้องการและคุณค่าเฉพาะตัวของคุณ'
              : "Each World represents a dimension of your life. As you explore with Twin, you'll gain insights, track decisions, and grow through each world. Your Twin adapts and learns to serve each world according to your unique needs and values."}
          </p>
        </div>
      </div>
      </AppShell>
    </>
  );
}

interface WorldCardProps {
  world: ReturnType<typeof getAllWorlds>[0];
  isTh: boolean;
  onClick: () => void;
  articleCount: number;
}

function WorldCard({ world, isTh, onClick, articleCount }: WorldCardProps) {
  return (
    <div
      className="world-card immersive-glass"
      data-testid="world-tile"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      style={{ borderColor: world.color, '--world-color': world.color } as React.CSSProperties}
    >
      <div className="wc-emoji" data-testid="world-icon">{world.emoji}</div>
      <h3 data-testid="world-name">{isTh ? world.nameTh : world.name}</h3>
      <p>{isTh ? world.taglineTh : world.tagline}</p>
      {articleCount > 0 && (
        <span className="wc-articles">
          {isTh ? `${articleCount} บทความ` : `${articleCount} articles`}
        </span>
      )}
    </div>
  );
}
