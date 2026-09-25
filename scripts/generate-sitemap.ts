import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');
const PUBLIC_DIR = resolve(PROJECT_ROOT, 'public');

interface Route {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: string;
}

// Public routes that should be indexed
const PUBLIC_ROUTES: Route[] = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/onboarding', changefreq: 'weekly', priority: 0.8 },
  { path: '/pricing', changefreq: 'monthly', priority: 0.9 },
  { path: '/science', changefreq: 'monthly', priority: 0.7 },
  { path: '/vs-astrology', changefreq: 'monthly', priority: 0.8 },
  { path: '/faq', changefreq: 'weekly', priority: 0.7 },
  { path: '/blog', changefreq: 'daily', priority: 0.8 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
  { path: '/terms', changefreq: 'yearly', priority: 0.5 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.5 },
];

// Protected routes (excluded from sitemap)
const PROTECTED_PATHS = [
  '/dashboard',
  '/worlds',
  '/chat',
  '/twin',
  '/twin-profile',
  '/twin/settings',
  '/twin/personality',
  '/intelligence',
  '/analysis',
  '/brief',
  '/badges',
  '/settings',
  '/explore',
  '/activities',
  '/me',
  '/voice',
  '/life-hubs',
  '/decisions',
  '/decision-log',
  '/menu',
  '/core-awakening',
  '/chat/nova',
  '/chat/twin',
  '/tarot',
  '/palmistry',
  '/community',
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');
}

function generateSitemap(): string {
  const baseUrl = 'https://selfprint.one';
  const today = new Date().toISOString().split('T')[0];
  
  const urls = PUBLIC_ROUTES.flatMap((route) => {
    const thUrl = `${baseUrl}/th${route.path}`;
    const enUrl = `${baseUrl}/en${route.path}`;
    const lastmod = route.lastmod ?? today;
    
    return [
      {
        url: thUrl,
        alternates: [
          { lang: 'th', url: thUrl },
          { lang: 'en', url: enUrl },
          { lang: 'x-default', url: thUrl },
        ],
        lastmod,
        changefreq: route.changefreq,
        priority: route.priority,
      },
      {
        url: enUrl,
        alternates: [
          { lang: 'th', url: thUrl },
          { lang: 'en', url: enUrl },
          { lang: 'x-default', url: thUrl },
        ],
        lastmod,
        changefreq: route.changefreq,
        priority: route.priority,
      },
    ];
  });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
  xml += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const entry of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(entry.url)}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    
    for (const alt of entry.alternates) {
      xml += `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${escapeXml(alt.url)}" />\n`;
    }
    
    xml += '  </url>\n';
  }

  xml += '</urlset>';
  return xml;
}

function generateRobotsTxt(): string {
  let txt = '# SELFPRINT — robots.txt\n';
  txt += '# Generated automatically\n\n';
  txt += 'User-agent: *\n';
  txt += 'Allow: /th/\n';
  txt += 'Allow: /en/\n';
  
  for (const path of PROTECTED_PATHS) {
    txt += `Disallow: /th${path}\n`;
    txt += `Disallow: /en${path}\n`;
  }
  
  txt += 'Disallow: /api/\n';
  txt += '\n';
  txt += 'Sitemap: https://selfprint.one/sitemap.xml\n';
  
  return txt;
}

function main() {
  console.log('🔄 Generating sitemap.xml...');
  const sitemap = generateSitemap();
  const sitemapPath = resolve(PUBLIC_DIR, 'sitemap.xml');
  writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log(`✅ sitemap.xml written to ${sitemapPath}`);

  console.log('🔄 Generating robots.txt...');
  const robots = generateRobotsTxt();
  const robotsPath = resolve(PUBLIC_DIR, 'robots.txt');
  writeFileSync(robotsPath, robots, 'utf8');
  console.log(`✅ robots.txt written to ${robotsPath}`);

  console.log('🎉 SEO files generated successfully!');
}

main();