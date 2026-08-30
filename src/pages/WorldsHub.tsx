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
      <div className="worlds-hub" data-testid="worlds-container">
        {/* Header */}
        <div className="wh-header">
          <h1>✨ The 12 Worlds</h1>
          <p className="wh-subtitle">
            Explore all 12 dimensions of your life with Twin as your guide — scroll down to see them all
          </p>
        </div>

        {/* World Grid */}
        <div className="wh-worlds-grid" data-testid="worlds-scroller">
          {worlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
              onClick={() => navigate(`/${language}/worlds/${world.id}`)}
              articleCount={getWorldArticles(world.id).length}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="wh-info">
          <h3>How the 12 Worlds Work</h3>
          <p>
            Each World represents a dimension of your life. As you explore with Twin, you'll gain insights,
            track decisions, and grow through each world. Your Twin adapts and learns to serve each world
            according to your unique needs and values.
          </p>
        </div>
      </div>
    </>
  );
}

interface WorldCardProps {
  world: ReturnType<typeof getAllWorlds>[0];
  onClick: () => void;
  articleCount: number;
}

function WorldCard({ world, onClick, articleCount }: WorldCardProps) {
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
      <h3 data-testid="world-name">{world.name}</h3>
      <p>{world.tagline}</p>
      {articleCount > 0 && <span className="wc-articles">{articleCount} articles</span>}
    </div>
  );
}
