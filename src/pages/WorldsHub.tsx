/**
 * WorldsHub.tsx
 * Main hub for exploring the 12 Worlds
 * Entry point for world discovery and content
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { WorldId } from '../constants/worlds';
import { getAllWorlds, getWorldArticles } from '../constants/worlds';
import '../styles/worlds-hub.css';

export default function WorldsHub() {
  const [selectedWorld, setSelectedWorld] = useState<WorldId | null>(null);
  const worlds = getAllWorlds();

  const selectedWorldData = selectedWorld ? worlds.find((w) => w.id === selectedWorld) : null;
  const articles = selectedWorld ? getWorldArticles(selectedWorld) : [];

  return (
    <div className="worlds-hub">
      {/* Header */}
      <div className="wh-header">
        <h1>✨ The 12 Worlds</h1>
        <p className="wh-subtitle">
          Explore the dimensions of your life with Twin as your guide
        </p>
      </div>

      {/* World Grid */}
      <div className="wh-worlds-grid">
        {worlds.map((world) => (
          <WorldCard
            key={world.id}
            world={world}
            isSelected={selectedWorld === world.id}
            onClick={() => setSelectedWorld(world.id)}
            articleCount={getWorldArticles(world.id).length}
          />
        ))}
      </div>

      {/* Selected World Details */}
      {selectedWorldData && (
        <div className="wh-details">
          <div className="wh-details-header">
            <h2>{selectedWorldData.name}</h2>
            <p className="wh-world-description">{selectedWorldData.description}</p>

            <div className="wh-focus-areas">
              <span className="fa-label">Focus Areas:</span>
              {selectedWorldData.focusAreas.map((area) => (
                <span key={area} className="fa-tag">
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Articles Section */}
          {articles.length > 0 ? (
            <div className="wh-articles">
              <h3>📖 Explore This World</h3>
              <div className="articles-list">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </div>
          ) : (
            <div className="wh-empty">
              <p>Articles for this world coming soon</p>
            </div>
          )}

          {/* Twin Guidance */}
          <div className="wh-twin-guidance">
            <h3>💡 Twin's Guidance</h3>
            <p className="guidance-text">
              Twin can guide you deeper into this world with personalized insights and recommendations.
            </p>
            <Link to="/chat/twin" className="btn-explore">
              Chat with Twin about {selectedWorldData.name.toLowerCase()} →
            </Link>
          </div>
        </div>
      )}

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
  );
}

interface WorldCardProps {
  world: ReturnType<typeof getAllWorlds>[0];
  isSelected: boolean;
  onClick: () => void;
  articleCount: number;
}

function WorldCard({ world, isSelected, onClick, articleCount }: WorldCardProps) {
  return (
    <div
      className={`world-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ borderColor: world.color, '--world-color': world.color } as any}
    >
      <div className="wc-emoji">{world.emoji}</div>
      <h3>{world.name}</h3>
      <p>{world.tagline}</p>
      {articleCount > 0 && <span className="wc-articles">{articleCount} articles</span>}
    </div>
  );
}

interface ArticleCardProps {
  article: ReturnType<typeof getWorldArticles>[0];
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="article-card">
      <h4>{article.title}</h4>
      <p className="article-excerpt">{article.excerpt}</p>
      <div className="article-meta">
        <span className="meta-read-time">⏱️ {article.readTime} min</span>
        <span className="meta-author">✍️ {article.author}</span>
      </div>
      <button className="btn-read">Read Article →</button>
    </div>
  );
}
