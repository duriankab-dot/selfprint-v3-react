import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  world: 'career' | 'relationships' | 'health';
  category: string;
  publishedAt: string;
  featured: boolean;
  keywords: string[];
}

interface BlogMetadata {
  metadata: {
    totalArticles: number;
    lastUpdated: string;
    version: string;
  };
  articles: BlogArticle[];
}

export function BlogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<'career' | 'relationships' | 'health' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [article, setArticle] = useState<(BlogArticle & { content?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Load articles index
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch('/blog/index.json');
        const data: BlogMetadata = await response.json();
        setArticles(data.articles);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load blog index:', error);
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  // Load article content when slug changes
  useEffect(() => {
    if (!slug || articles.length === 0) {
      setArticle(null);
      return;
    }

    const foundArticle = articles.find(a => a.slug === slug);
    if (!foundArticle) {
      setArticle(null);
      return;
    }

    const loadArticleContent = async () => {
      try {
        const response = await fetch(`/blog/${foundArticle.world}/${slug}.md`);
        const markdown = await response.text();

        // Parse markdown (simple parsing for now)
        const content = markdown.split('---').slice(2).join('---').trim();

        setArticle({
          ...foundArticle,
          content
        });

        // Update page title
        document.title = `${foundArticle.title} | Selfprint`;
      } catch (error) {
        console.error('Failed to load article:', error);
      }
    };

    loadArticleContent();
  }, [slug, articles]);

  const filteredArticles = articles.filter(article => {
    const matchesWorld = selectedWorld === 'all' || article.world === selectedWorld;
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesWorld && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  // Article detail view
  if (article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/blog')}
            className="mb-8 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
          >
            ← Back to Blog
          </button>

          {/* Article header */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 sm:px-8 py-8 sm:py-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize">
                  {article.world}
                </span>
                <span className="text-slate-500 text-sm">{article.category}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {article.title}
              </h1>

              <p className="text-lg text-slate-600 mb-6">
                {article.excerpt}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-b border-slate-200 py-4">
                <span>Published {new Date(article.publishedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>By Twin</span>
              </div>

              {/* Article content */}
              <div className="mt-8 prose prose-sm sm:prose max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {article.content || 'Article content loading...'}
                </div>
              </div>

              {/* Keywords */}
              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map(keyword => (
                      <span
                        key={keyword}
                        className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related articles suggestion */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Continue Reading</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {regularArticles.slice(0, 2).map(related => (
                    <button
                      key={related.id}
                      onClick={() => navigate(`/blog/${related.slug}`)}
                      className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors"
                    >
                      <p className="font-medium text-slate-900 text-sm mb-1">{related.title}</p>
                      <p className="text-xs text-slate-600">{related.excerpt}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // Article list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            The Selfprint Blog
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Guided decision-making for career, relationships, and wellness. Your Twin helps you think clearly about what matters.
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles by title, keyword, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
          </div>

          {/* World filters */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'career', 'relationships', 'health'] as const).map(world => (
              <button
                key={world}
                onClick={() => setSelectedWorld(world)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedWorld === world
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {world === 'all' ? 'All Topics' : world.charAt(0).toUpperCase() + world.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Featured articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map(article => (
                <button
                  key={article.id}
                  onClick={() => navigate(`/blog/${article.slug}`)}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden transition-all"
                >
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium capitalize">
                        {article.world}
                      </span>
                      {article.featured && (
                        <span className="text-yellow-500">★</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                      Read article →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All articles */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            All Articles {searchTerm && `(${filteredArticles.length})`}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularArticles.map(article => (
              <button
                key={article.id}
                onClick={() => navigate(`/blog/${article.slug}`)}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden transition-all text-left"
              >
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium capitalize">
                      {article.world}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                    Read →
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No articles found. Try adjusting your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
