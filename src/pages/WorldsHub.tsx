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
import { getAllWorlds, getWorldArticles } from '../constants/worlds';
import { MetaTagManager } from '../components/MetaTagManager';
import { useLanguage } from '../context/LanguageContext';
import { getSeoMetadata } from '../constants/seoMetadata';
import { NavRail } from '../components/layout/NavRail';
import { BottomNav } from '../components/layout/BottomNav';
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
      {/* APPSHELL-006 FIX: desktop nav rail — overrides the earlier
          "full-immersion, no chrome" decision, same as WorldDetail.tsx. */}
      <NavRail />
      {/* BACKBUTTON-002 FIX: /worlds is a BottomNav root destination
          ("โลก"), same as /dashboard, /explore, /chat/twin, /me — a
          history-back button here made no sense ("อยู่หน้าแรก จะย้อนไปไหน").
          WorldsHub previously had no BottomNav at all (leftover from the
          old full-immersion design) and stood in a lone ad-hoc back button
          as its only exit — replaced with the real 5-tab BottomNav that
          every other root page already has, consistent with the App Shell
          (see NavBar.tsx's ROOT_TAB_PATHS suppression for the matching fix
          on pages that do use NavBar). */}
      <BottomNav />
      <div className="worlds-hub" data-testid="worlds-container">
        {/* Header */}
        <div className="wh-header">
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
      className="world-card"
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
