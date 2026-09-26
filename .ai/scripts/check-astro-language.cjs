const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for astrology/fortune language...');

// Allowed files that can contain astrology terms (comparison, engine, internal)
const ALLOWED_PATTERNS = [
  'vs-astrology',
  'lib/astrology',
  'lib/intro-summary',
  'config/nova-prompts',
  'config/twin-prompts',
  'constants/faqs',
  'constants/seoMetadata',
  'constants/worlds',
  'lib/ArchetypeScoreEngine',
  'lib/aeoSchemas',
  'lib/astrovera-adapter',
  'lib/intelligence',
  'services/CoreAwakeningService',
  'services/VisualDNAService',
  'types/badges',
  'components/dashboard',
  'components/onboarding',
  'components/layout/Footer',
  'pages/AboutPage',
  'pages/BlogArticle',
  'pages/BlogListPage',
  'pages/LandingPage',
  'pages/Onboarding',
  'pages/PalmistryPage',
  'pages/PrivacyCenter',
  'pages/SciencePage',
  'pages/TarotPage',
  'pages/VsAstrologyPage',
  'pages/Onboarding.test',
  'lib/intro-summary',
  'lib/intelligence/BehavioralForecastEngine',
  'lib/intelligence/EvidenceAnalyzer',
  'lib/intelligence/NatalChartEngine',
];

function findFiles(dir, pattern) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        results.push(...findFiles(fullPath, pattern));
      }
    } else if (entry.isFile() && pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = findFiles(path.join(__dirname, '..', '..', 'src'), /\.(tsx|ts)$/);
const forbiddenTerms = ['ดูดวง', 'โหราศาสตร์', 'ดาว', 'ราศี', 'โชค', 'ทำนาย'];

let violations = [];

for (const file of files) {
  const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  
  // Check if file is in allowed list
  const isAllowed = ALLOWED_PATTERNS.some(p => relativePath.includes(p));
  if (isAllowed) continue;
  
  const content = fs.readFileSync(file, 'utf-8');
  for (const term of forbiddenTerms) {
    if (content.includes(term)) {
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes(term)) {
          violations.push(`${relativePath}:${i + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

if (violations.length > 0) {
  console.error('❌ Astrology language found in non-allowed files:');
  violations.forEach(v => console.error('  ', v));
  process.exit(1);
}

console.log('✅ Astrology language check passed (only allowed files contain these terms)');