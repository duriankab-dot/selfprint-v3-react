/**
 * BlogArticle.tsx
 * Dynamic blog article renderer
 * - Uses index.json as the single source of truth for slug → filePath resolution
 * - Renders Markdown content with react-markdown
 * - Supports articles WITH or WITHOUT frontmatter
 * - Includes JSON-LD Article schema for SEO/GEO/AEO
 * - Dark sci-fi theme with glassmorphism
 *
 * NOTE (i18n): article.content itself (Markdown body) is sourced from Thai-only
 * markdown files in /public/blog — this is long-form editorial content, out of
 * scope for UI-string translation (same precedent as BlogListPage.tsx). Only
 * page chrome below is localized.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/context/LanguageContext';

interface ArticleMetadata {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  keywords: string[];
  author: string;
  date: string;
  category: string;
  featured: boolean;
  filePath: string;
  world: string;
}

interface Article extends ArticleMetadata {
  content: string;
}

/** Build Article JSON-LD for GEO / AEO */
function buildArticleSchema(article: Article, isTh: boolean) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.excerpt,
    'keywords': article.keywords.join(', '),
    'datePublished': article.date,
    'dateModified': article.date,
    'inLanguage': isTh ? 'th' : 'en',
    'author': { '@type': 'Organization', 'name': 'SELFPRINT', 'url': 'https://selfprint.one' },
    'publisher': {
      '@type': 'Organization',
      'name': 'SELFPRINT',
      'logo': { '@type': 'ImageObject', 'url': 'https://selfprint.one/logo.png' },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://selfprint.one/blog/${article.slug}`,
    },
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['h1', '.article-excerpt'],
    },
  };
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const langPrefix = isTh ? '/th' : '/en';
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setError('No article slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const indexRes = await fetch('/blog/index.json');
        if (!indexRes.ok) {
          throw new Error('Failed to load blog index');
        }
        const indexData = await indexRes.json();
        const entry = indexData.articles.find((a: any) => a.slug === slug);

        if (!entry) {
          throw new Error(`Article not found: ${slug}`);
        }

        const resolvedPath = `/blog/${entry.world}/${entry.filePath}.md`;
        const mdRes = await fetch(resolvedPath);
        if (!mdRes.ok) {
          throw new Error(`Failed to load markdown file: ${resolvedPath}`);
        }
        const markdown = await mdRes.text();

        const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const metadata: Partial<ArticleMetadata> = {
          id: entry.id,
          title: entry.title || '',
          slug: entry.slug || slug,
          excerpt: entry.excerpt || '',
          keywords: entry.keywords || [],
          author: 'SELFPRINT',
          date: new Date().toISOString().split('T')[0],
          category: entry.category || '',
          featured: entry.featured || false,
          filePath: entry.filePath || '',
          world: entry.world || 'selfprint',
        };

        const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

        if (frontmatterMatch) {
          const [, frontmatterStr, rawContent] = frontmatterMatch;

          frontmatterStr.split('\n').forEach(line => {
            const colonIdx = line.indexOf(':');
            if (colonIdx === -1) return;
            const key = line.slice(0, colonIdx).trim();
            const value = line.slice(colonIdx + 1).trim().replace(/^"|"$/g, '');

            if (key === 'title') metadata.title = value;
            if (key === 'description' || key === 'excerpt') metadata.excerpt = value;
            if (key === 'author') metadata.author = value;
            if (key === 'date') metadata.date = value;
            if (key === 'category') metadata.category = value;
            if (key === 'featured') metadata.featured = value === 'true';
            if (key === 'keywords') {
              try { metadata.keywords = JSON.parse(value); } catch { /* ignore */ }
            }
          });

          setArticle({
            ...(metadata as ArticleMetadata),
            content: rawContent.trim(),
          });
        } else {
          console.warn(`Article ${slug} has no frontmatter — using index.json metadata`);
          setArticle({
            ...(metadata as ArticleMetadata),
            content: normalized.trim(),
          });
        }

      } catch (err) {
        console.error('Failed to load article:', err);
        setError(err instanceof Error ? err.message : 'Failed to load article');
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-indigo-300">{isTh ? 'กำลังโหลดบทความ...' : 'Loading article...'}</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔬</div>
          <h1 className="text-2xl font-bold text-white mb-2">{isTh ? 'ไม่พบบทความ' : 'Article not found'}</h1>
          <p className="text-slate-400 mb-6">{error || (isTh ? 'ไม่พบเนื้อหาที่คุณต้องการ' : "We couldn't find the content you're looking for")}</p>
          <Link to={`${langPrefix}/blog`} className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
            {isTh ? 'กลับไปคลังบทความ' : 'Back to articles'}
          </Link>
        </div>
      </div>
    );
  }

  const articleSchema = buildArticleSchema(article, isTh);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={`${langPrefix}/blog`}
            className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium mb-8 transition-colors"
          >
            {isTh ? '← กลับไปคลังบทความ' : '← Back to articles'}
          </Link>

          <article className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 sm:px-8 lg:px-10 py-8 sm:py-12">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-500/30 text-indigo-300 rounded-full text-sm font-medium border border-indigo-400/30">
                  {article.category}
                </span>
                <span className="text-slate-400 text-sm">
                  {new Date(article.date).toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="article-excerpt text-lg text-indigo-200 mb-6 border-l-4 border-indigo-400 pl-4 italic">
                  {article.excerpt}
                </p>
              )}

              {article.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {article.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-full text-xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <hr className="border-white/10 my-8" />

              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-3 text-indigo-200">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-200">{children}</h3>,
                    p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-4">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-300">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-slate-300">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-300">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-indigo-400 pl-4 italic text-indigo-200 my-4">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} className="text-indigo-400 hover:text-indigo-300 underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-indigo-200">{children}</em>,
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="bg-indigo-500/10 backdrop-blur-sm border border-indigo-400/30 rounded-xl p-6 sm:p-8 text-center">
                  <div className="text-3xl mb-3">🚀</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isTh ? 'อยากเข้าใจตัวเองอย่างลึกซึ้ง?' : 'Want to understand yourself more deeply?'}
                  </h3>
                  <p className="text-slate-300 mb-6">
                    {isTh
                      ? 'ให้ AI Twin ของคุณวิเคราะห์พฤติกรรม 12 มิติ — ฟรี ไม่ต้องดูดวง'
                      : 'Let your AI Twin analyze 12 behavioral dimensions — free, no astrology involved'}
                  </p>
                  <Link
                    to={`${langPrefix}/onboarding`}
                    className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/25"
                  >
                    {isTh ? 'สร้าง SELFPRINT ของฉัน →' : 'Create my SELFPRINT →'}
                  </Link>
                </div>
              </div>

              <div className="mt-12">
                <h4 className="text-lg font-semibold text-white mb-4">{isTh ? '📖 อ่านต่อ' : '📖 Keep reading'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/blog/ai-twin-what-is-it"
                    className="block p-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-white text-sm">{isTh ? 'AI Twin คืออะไร?' : 'What is an AI Twin?'}</p>
                    <p className="text-xs text-slate-400">Digital Twin + Personal AI</p>
                  </Link>
                  <Link
                    to="/blog/12-dimensions-explained"
                    className="block p-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-white text-sm">{isTh ? '12 มิติ พฤติกรรมมนุษย์' : 'The 12 dimensions of human behavior'}</p>
                    <p className="text-xs text-slate-400">{isTh ? 'ทำไมต้อง 12 มิติ?' : 'Why 12 dimensions?'}</p>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
