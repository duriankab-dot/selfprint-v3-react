/**
 * BlogIndex.tsx
 * Blog listing page - displays all articles with categories
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  world: string;
  publishedAt: string;
  featured: boolean;
  keywords: string[];
}

export default function BlogIndex() {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  // Get unique categories for filter
  const categories = ['all', ...new Set(articles.map(a => a.category))];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{isTh ? 'กำลังโหลดบทความ...' : 'Loading articles...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            The Selfprint Blog
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto sm:mx-0">
            {isTh
              ? 'แนวทางการตัดสินใจสำหรับอาชีพ ความสัมพันธ์ และสุขภาวะ AI ฝาแฝดของคุณช่วยให้คิดเรื่องสำคัญได้ชัดเจนขึ้น'
              : 'Guided decision-making for career, relationships, and wellness. Your Twin helps you think clearly about what matters.'}
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-10 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder={isTh ? 'ค้นหาบทความ...' : 'Search articles...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
            <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? (isTh ? 'ทั้งหมด' : 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>⭐</span> {isTh ? 'บทความแนะนำ' : 'Featured articles'}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        {article.category}
                      </span>
                      <span className="text-yellow-500">★</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                      {isTh ? 'อ่านบทความ →' : 'Read article →'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All articles */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {isTh ? 'บทความทั้งหมด' : 'All articles'} {searchTerm && `(${filteredArticles.length})`}
          </h2>

          {regularArticles.length === 0 && filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <p className="text-slate-500">{isTh ? 'ไม่พบบทความที่ตรงกับคำค้นหา' : 'No articles match your search'}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
                >
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                      {isTh ? 'อ่าน →' : 'Read →'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
