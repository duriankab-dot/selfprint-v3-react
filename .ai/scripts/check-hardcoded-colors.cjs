const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for hardcoded colors in .tsx files...');

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

const files = findFiles(path.join(__dirname, '..', '..', 'src'), /\.tsx$/);
const hexColorRegex = /#[0-9a-fA-F]{6}/g;
const rgbRegex = /rgb\(/g;

let violations = [];

for (const file of files) {
  const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  
  // Skip test and story files
  if (relativePath.includes('.test.') || relativePath.includes('.stories.')) continue;
  
  // Skip files that are already in the fix list (TC-003)
  const isInFixList = [
    'components/chat/ImmersiveNavbar.tsx',
    'components/dashboard/TrendChart.tsx',
    'components/ErrorBoundary.tsx',
    'components/features/DailyBrief.tsx',
    'components/features/DecisionCompare.tsx',
    'components/features/NovaAvatar.tsx',
    'components/features/TwinAvatar.tsx',
    'components/intelligence/AccuracyBadge.tsx',
    'components/intelligence/InsightCardWithFeedback.tsx',
    'components/intelligence/PatternDisplay.tsx',
    'components/landing/BirthDataInput.tsx',
    'components/landing/EvolutionaryVisualSystem.tsx',
    'components/landing/QuickSummary.tsx',
    'components/landing/TodayBioEnvironmentReport.tsx',
    'components/onboarding/AICreationSequence.tsx',
    'components/onboarding/ClaimAccount.tsx',
    'components/onboarding/FinetuningQuestions.tsx',
    'components/onboarding/FullAnalysis.tsx',
    'components/onboarding/InitialBlueprint.tsx',
    'components/story/NarrativeHook.tsx',
    'components/twin/HologramBirth.tsx',
    'components/twin/Twin.tsx',
    'components/twin/TwinPresence.tsx',
    'components/viral/ShareButton.tsx',
    'components/world/WorldEnvironment.tsx',
    'pages/AnalysisPage.tsx',
    'pages/CommunityPage.tsx',
    'pages/CoreAwakening.tsx',
    'pages/DecisionDashboard.tsx',
    'pages/ExplorePage.tsx',
    'pages/ImmersiveTwinChat.tsx',
    'pages/Login.tsx',
    'pages/MePage.tsx',
    'pages/SciencePage.tsx',
    'pages/WorldsHub.tsx',
    'components/features/TwinAvatar.tsx',
    'components/intelligence/AccuracyBadge.tsx',
    'components/intelligence/InsightCardWithFeedback.tsx',
    'components/intelligence/PatternDisplay.tsx',
    'components/landing/BirthDataInput.tsx',
    'components/landing/EvolutionaryVisualSystem.tsx',
    'components/landing/QuickSummary.tsx',
    'components/landing/TodayBioEnvironmentReport.tsx',
    'components/onboarding/AICreationSequence.tsx',
    'components/onboarding/ClaimAccount.tsx',
    'components/onboarding/FinetuningQuestions.tsx',
    'components/onboarding/FullAnalysis.tsx',
    'components/onboarding/InitialBlueprint.tsx',
    'components/story/NarrativeHook.tsx',
    'components/twin/HologramBirth.tsx',
    'components/twin/Twin.tsx',
    'components/twin/TwinPresence.tsx',
    'components/viral/ShareButton.tsx',
    'components/world/WorldEnvironment.tsx',
    'pages/AnalysisPage.tsx',
    'pages/CommunityPage.tsx',
    'pages/CoreAwakening.tsx',
    'pages/DecisionDashboard.tsx',
    'pages/ExplorePage.tsx',
    'pages/ImmersiveTwinChat.tsx',
    'pages/Login.tsx',
    'pages/MePage.tsx',
    'pages/SciencePage.tsx',
    'pages/WorldsHub.tsx',
  ].some(f => relativePath.includes(f));
  
  if (isInFixList) continue;
  
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    const hexMatches = line.match(hexColorRegex);
    const rgbMatches = line.match(rgbRegex);
    
    if (hexMatches || rgbMatches) {
      violations.push(`${relativePath}:${i + 1}: ${line.trim()}`);
    }
  });
}

if (violations.length > 0) {
  console.error('❌ Hardcoded colors found in source files (not in fix list):');
  violations.forEach(v => console.error('  ', v));
  process.exit(1);
}

console.log('✅ Token compliance check passed (no hardcoded colors in new .tsx files)');