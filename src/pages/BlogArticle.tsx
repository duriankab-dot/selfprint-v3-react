/**
 * BlogArticle.tsx
 * Dynamic blog article renderer
 * - Loads markdown from /public/blog/[world]/[category]/[slug].md
 * - Parses frontmatter + renders markdown as HTML
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface ArticleMetadata {
  title: string;
  slug: string;
  excerpt: string;
  keywords: string[];
  author: string;
  date: string;
  category: string;
  featured: boolean;
}

interface Article extends ArticleMetadata {
  content: string;
}

export default function BlogArticle() {
  const { world = 'selfprint', category, slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);

        // Construct path to markdown file
        const path = `/blog/${world}/${category}/${slug}.md`;

        // Fetch markdown
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Article not found: ${path}`);

        const markdown = await response.text();

        // Parse frontmatter
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);

        if (!match) throw new Error('Invalid article format');

        const [, frontmatterStr, content] = match;

        // Parse YAML-like frontmatter
        const metadata: ArticleMetadata = {
          title: '',
          slug: slug || '',
          excerpt: '',
          keywords: [],
          author: 'SELFPRINT AI',
          date: new Date().toISOString().split('T')[0],
          category: category || '',
          featured: false
        };

        frontmatterStr.split('\n').forEach(line => {
          if (line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();

            if (key.trim() === 'title') metadata.title = value.replace(/^"|"$/g, '');
            if (key.trim() === 'excerpt') metadata.excerpt = value.replace(/^"|"$/g, '');
            if (key.trim() === 'keywords') metadata.keywords = JSON.parse(value);
            if (key.trim() === 'author') metadata.author = value;
            if (key.trim() === 'date') metadata.date = value;
            if (key.trim() === 'featured') metadata.featured = value === 'true';
          }
        });

        // Simple markdown to HTML (basic conversion)
        const htmlContent = content
          .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
          .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
          .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n\n/g, '</p><p>')
          .split('\n')
          .map(line => line.trim() ? `<p>${line}</p>` : '')
          .join('');

        setArticle({
          ...metadata,
          content: htmlContent
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [world, category, slug]);

  if (loading) {
    return (
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Loading article...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1>⚠️ Article not found</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>No article data</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <article>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>{article.title}</h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
            {article.excerpt}
          </p>
          <div style={{ fontSize: '14px', color: '#999' }}>
            <span>{article.author}</span> • <span>{article.date}</span> • <span>{article.category}</span>
          </div>
          {article.keywords.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {article.keywords.map(kw => (
                <span
                  key={kw}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '16px',
                    fontSize: '12px'
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#333'
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </main>
  );
}
