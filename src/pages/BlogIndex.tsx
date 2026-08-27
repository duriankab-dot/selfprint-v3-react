/**
 * BlogIndex.tsx
 * Blog listing page - displays all articles
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  world: string;
  publishedAt: string;
  featured: boolean;
}

export default function BlogIndex() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch('/blog/index.json');
        if (!response.ok) throw new Error('Failed to load blog index');

        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error loading articles:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Loading articles...</p>
      </main>
    );
  }

  // Group by category
  const grouped = articles.reduce((acc, article) => {
    const key = article.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(article);
    return acc;
  }, {} as Record<string, ArticleListItem[]>);

  const categoryOrder = ['Self-Discovery', 'Features', 'Problem-Solving', 'Advanced'];

  return (
    <main style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '40px', marginBottom: '12px' }}>SELFPRINT Blog</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px' }}>
        Discover behavioral science, AI Twin insights, and personal growth strategies
      </p>

      {categoryOrder.map(category => {
        const categoryArticles = grouped[category] || [];
        if (categoryArticles.length === 0) return null;

        return (
          <section key={category} style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '24px', borderBottom: '2px solid #eee', paddingBottom: '12px', marginBottom: '20px' }}>
              {category}
            </h2>

            <div style={{ display: 'grid', gap: '20px' }}>
              {categoryArticles.map(article => (
                <article
                  key={article.id}
                  style={{
                    padding: '20px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = '#ddd';
                    }
                  }}
                  onMouseLeave={e => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#eee';
                    }
                  }}
                >
                  <Link
                    to={`/blog/${article.world}/${article.category.toLowerCase().replace('-', '-')}/${article.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <h3 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>
                      {article.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', margin: '8px 0' }}>
                      {article.excerpt}
                    </p>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(article.publishedAt).toLocaleDateString()} • {article.category}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {articles.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '60px' }}>
          No articles found. Check back soon!
        </p>
      )}
    </main>
  );
}
