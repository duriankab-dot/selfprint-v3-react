/**
 * BlogArticle.tsx
 * Dynamic blog article renderer
 * - Resolves filePath via /blog/index.json (slug → actual folder/filename)
 * - Falls back to route params: /blog/:world/:category/:slug
 * - JSON-LD Article schema for SEO/GEO/AEO
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface ArticleMetadata {
  title: string;
  slug: string;
  excerpt: string;
  keywords: string[];
  author: string;
  date: string;
  category: string;
  featured: boolean;
  filePath?: string;
}

interface Article extends ArticleMetadata {
  content: string;
}

/** Build Article JSON-LD for GEO / AEO */
function buildArticleSchema(article: Article, world: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.excerpt,
    'keywords': article.keywords.join(', '),
    'datePublished': article.date,
    'dateModified': article.date,
    'inLanguage': 'th',
    'author': { '@type': 'Organization', 'name': 'SELFPRINT', 'url': 'https://selfprint.one' },
    'publisher': {
      '@type': 'Organization',
      'name': 'SELFPRINT',
      'logo': { '@type': 'ImageObject', 'url': 'https://selfprint.one/logo.png' },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://selfprint.one/blog/${world}/${article.category}/${article.slug}`,
    },
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['h1', '.article-excerpt'],
    },
  };
}

/** Structured markdown renderer */
function renderMarkdownBlock(block: string, idx: number) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('### '))
    return (
      <h3 key={idx} style={{ fontSize: '18px', fontWeight: 700, marginTop: '28px', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
        {trimmed.replace(/^### /, '')}
      </h3>
    );
  if (trimmed.startsWith('## '))
    return (
      <h2 key={idx} style={{ fontSize: '22px', fontWeight: 800, marginTop: '40px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
        {trimmed.replace(/^## /, '')}
      </h2>
    );
  if (trimmed.startsWith('# '))
    return null; // skip H1 — already shown as page heading

  // Bullet list block
  if (trimmed.match(/^[-*]\s/m))
    return (
      <ul key={idx} style={{ marginBottom: '20px', paddingLeft: '24px' }}>
        {trimmed.split('\n').filter(l => l.trim()).map((line, j) => (
          <li key={j} style={{ marginBottom: '8px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {line.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
          </li>
        ))}
      </ul>
    );

  return (
    <p key={idx} style={{ marginBottom: '20px', lineHeight: 1.85, color: 'var(--color-text-secondary)' }}>
      {trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
    </p>
  );
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
        let markdown = '';

        // Production QA (2026-08-28): article files are named by a numbered
        // convention (e.g. "02-career-fit.md") that does NOT match the
        // article's URL slug (e.g. "career-fit-12-dimensions") — index.json
        // is the only reliable slug→filePath mapping. Step 1's direct-path
        // guess below therefore 404s for every such article; CF Pages
        // serves its SPA fallback (index.html) for the 404, and relying on
        // the Content-Type header to detect that (as this used to) is
        // unreliable — when the header comes back empty, the fallback's
        // raw HTML was silently accepted as "markdown" and rendered
        // verbatim (confirmed live on /th/blog/selfprint/conversion/
        // career-fit-12-dimensions). Validating the fetched text actually
        // *looks like* frontmatter markdown (starts with `---`) is a much
        // more reliable check than trusting Content-Type from a static
        // host's fallback response.
        const looksLikeMarkdown = (text: string) => text.trimStart().startsWith('---');

        // Step 1: Try direct path from route params
        const directPath = `/blog/${world}/${category}/${slug}.md`;
        const directRes = await fetch(directPath);
        if (directRes.ok) {
          const directText = await directRes.text();
          if (looksLikeMarkdown(directText)) {
            markdown = directText;
          }
        }

        // Step 2: If not found, resolve via index.json (slug → filePath)
        if (!markdown) {
          const indexRes = await fetch('/blog/index.json');
          if (indexRes.ok) {
            const indexData = await indexRes.json();
            const entry = (indexData.articles || []).find(
              (a: any) => a.slug === slug || a.id === slug
            );
            if (entry?.filePath && entry?.world) {
              const resolvedPath = `/blog/${entry.world}/${entry.filePath}.md`;
              const resolvedRes = await fetch(resolvedPath);
              if (resolvedRes.ok) {
                const resolvedText = await resolvedRes.text();
                if (looksLikeMarkdown(resolvedText)) {
                  markdown = resolvedText;
                }
              }
            }
          }
        }

        if (!markdown) throw new Error(`Article not found: ${slug}`);

        // Normalize CRLF → LF (Windows markdown files)
        const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // Parse frontmatter
        const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!frontmatterMatch) throw new Error('Invalid article format');

        const [, frontmatterStr, rawContent] = frontmatterMatch;

        const metadata: ArticleMetadata = {
          title: '',
          slug: slug || '',
          excerpt: '',
          keywords: [],
          author: 'SELFPRINT',
          date: new Date().toISOString().split('T')[0],
          category: category || '',
          featured: false,
        };

        frontmatterStr.split('\n').forEach(line => {
          const colonIdx = line.indexOf(':');
          if (colonIdx === -1) return;
          const key = line.slice(0, colonIdx).trim();
          const value = line.slice(colonIdx + 1).trim();

          if (key === 'title') metadata.title = value.replace(/^"|"$/g, '');
          if (key === 'description') metadata.excerpt = value.replace(/^"|"$/g, '');
          if (key === 'excerpt') metadata.excerpt = value.replace(/^"|"$/g, '');
          if (key === 'author') metadata.author = value;
          if (key === 'date') metadata.date = value;
          if (key === 'category') metadata.category = value;
          if (key === 'featured') metadata.featured = value === 'true';
          if (key === 'keywords') {
            try { metadata.keywords = JSON.parse(value); } catch { /* skip */ }
          }
        });

        setArticle({ ...metadata, content: rawContent });
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
      <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>กำลังโหลดบทความ...</p>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <h1 style={{ color: 'var(--color-text-primary)', marginBottom: '12px' }}>ไม่พบบทความ</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>{error}</p>
        <Link to="/th/blog" style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>
          ← กลับไปคลังบทความ
        </Link>
      </main>
    );
  }

  const articleSchema = buildArticleSchema(article, world);
  const blocks = article.content.split('\n\n');

  return (
    <>
      {/* JSON-LD Article schema — SEO + GEO + AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', padding: '0 0 100px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 0' }}>

          {/* Back */}
          <Link
            to="/th/blog"
            style={{ color: 'var(--color-accent-primary)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: '32px' }}
          >
            ← กลับไปคลังบทความ
          </Link>

          {/* Category + Meta */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', background: 'color-mix(in srgb,var(--color-accent-primary) 12%,transparent)', color: 'var(--color-accent-primary)', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
              {article.category}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
              {new Date(article.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Heading — AEO speakable */}
          <h1 style={{ fontSize: 'clamp(24px,5vw,40px)', fontWeight: 900, lineHeight: 1.3, marginBottom: '12px', color: 'var(--color-text-primary)' }}>
            {article.title}
          </h1>

          {/* Excerpt — AEO speakable */}
          {article.excerpt && (
            <p className="article-excerpt" style={{ fontSize: '17px', color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: 1.7, borderLeft: '3px solid var(--color-accent-primary)', paddingLeft: '16px' }}>
              {article.excerpt}
            </p>
          )}

          {/* Keywords chips */}
          {article.keywords.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {article.keywords.map(kw => (
                <span key={kw} style={{ padding: '3px 10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '20px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: '40px' }} />

          {/* Article body */}
          <div style={{ fontSize: '16px' }}>
            {blocks.map((block, idx) => renderMarkdownBlock(block, idx))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: '60px', padding: '32px', background: 'var(--color-bg-secondary)', border: '2px solid var(--color-accent-primary)', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🚀</div>
            <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-primary)' }}>
              อยากเข้าใจตัวเองอย่างลึกซึ้ง?
            </p>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              ให้ AI Twin ของคุณวิเคราะห์พฤติกรรม 12 มิติ — ฟรี ไม่ต้องดูดวง
            </p>
            <a href="/th/onboarding" style={{ display: 'inline-block', padding: '14px 32px', background: 'var(--color-accent-primary)', color: '#fff', borderRadius: '12px', fontWeight: 800, fontSize: '16px', textDecoration: 'none' }}>
              สร้าง SELFPRINT ของฉัน →
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
