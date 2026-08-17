/**
 * WorldContextAdapter.ts
 * Adapt SICE engine outputs to be world-specific
 * Takes base engine output + world context → world-aware response
 *
 * P0 #5: World Routing - Context Adaptation
 */

import type { WorldContext } from './WorldRoutingService';

/**
 * Adapt behavioral forecast to world context
 */
export function adaptBehavioralForecast(
  forecast: any,
  worldContext: WorldContext
): any {
  if (!forecast) return forecast;

  const { worldName, twinMood, expertiseScore } = worldContext;

  // Modify confidence based on world expertise
  const baseConfidence = forecast.confidence || 50;
  const adapted = {
    ...forecast,
    confidence: Math.min(100, baseConfidence * worldContext.confidenceModifier),
    worldContext: {
      worldName,
      moodInWorld: twinMood,
      expertiseLevel: getExpertiseLabel(expertiseScore),
    },
  };

  // Add world-specific forecast guidance
  adapted.worldGuidance = generateMoodGuidance(twinMood, worldName);

  return adapted;
}

/**
 * Adapt decision intelligence analysis to world context
 */
export function adaptDecisionIntelligence(
  analysis: any,
  worldContext: WorldContext
): any {
  if (!analysis) return analysis;

  const { worldName, expertiseScore, twinMood } = worldContext;

  // Filter insights to be world-relevant
  const worldRelevantInsights = (analysis.insights || []).map((insight: string) => {
    return `[${worldName}] ${insight}`;
  });

  const adapted = {
    ...analysis,
    insights: worldRelevantInsights,
    worldContext: {
      worldName,
      expertiseLevel: getExpertiseLabel(expertiseScore),
      decisionMood: twinMood,
    },
    confidence: Math.min(100, (analysis.confidence || 50) * worldContext.confidenceModifier),
  };

  // Add world-specific next step
  adapted.worldNextStep = generateDecisionNextStep(worldName, analysis.successRate);

  return adapted;
}

/**
 * Adapt future vision to world context
 */
export function adaptFutureSelfVision(
  vision: any,
  worldContext: WorldContext
): any {
  if (!vision) return vision;

  const { worldName, expertiseScore, twinMood } = worldContext;

  // Contextualize vision to world
  const worldContextualizedVision = `${vision.visionStatement} — especially in your ${worldName} world.`;

  // Filter milestones to be world-relevant
  const worldMilestones = (vision.milestones || [])
    .filter((m: string) => isRelevantToWorld(m, worldName))
    .slice(0, 3);

  const adapted = {
    ...vision,
    visionStatement: worldContextualizedVision,
    milestones: worldMilestones,
    worldContext: {
      worldName,
      expertiseLevel: getExpertiseLabel(expertiseScore),
      alignedMood: twinMood,
    },
    confidence: Math.min(100, (vision.confidence || 50) * worldContext.confidenceModifier),
  };

  // Add world-specific opportunity
  adapted.worldOpportunity = generateWorldOpportunity(worldName, expertiseScore);

  return adapted;
}

/**
 * Adapt environment context to world
 */
export function adaptEnvironmentEngine(
  context: any,
  worldContext: WorldContext
): any {
  if (!context) return context;

  const { worldName, twinMood, expertiseScore } = worldContext;

  // Filter recommendations to world
  const worldRecommendations = (context.recommendations || [])
    .map((rec: string) => {
      // If recommendation doesn't mention world, add it
      if (!rec.toLowerCase().includes(worldName.toLowerCase())) {
        return `${rec} (in ${worldName} world)`;
      }
      return rec;
    })
    .slice(0, 3);

  const adapted = {
    ...context,
    recommendations: worldRecommendations,
    worldContext: {
      worldName,
      currentMood: twinMood,
      expertiseLevel: getExpertiseLabel(expertiseScore),
    },
    stressLevel: adjustStressForWorld(context.stressLevel, worldName, expertiseScore),
    confidence: Math.min(100, (context.confidence || 60) * worldContext.confidenceModifier),
  };

  return adapted;
}

/**
 * Adapt insight engine output to world
 */
export function adaptInsightEngine(
  insight: any,
  worldContext: WorldContext
): any {
  if (!insight) return insight;

  const { worldName, expertiseScore, twinMood } = worldContext;

  // Frame insight within world context
  const worldFramedInsight = {
    ...insight,
    title: `${insight.title} [${worldName}]`,
    worldContext: {
      worldName,
      expertiseLevel: getExpertiseLabel(expertiseScore),
      relevantMood: twinMood,
    },
    confidence: Math.min(100, (insight.confidence || 50) * worldContext.confidenceModifier),
  };

  // Add world-specific interpretation
  worldFramedInsight.worldInterpretation = generateWorldInterpretation(
    insight.insight,
    worldName,
    twinMood
  );

  return worldFramedInsight;
}

/**
 * Get expertise level label (0-100 → beginner/intermediate/advanced/expert)
 */
function getExpertiseLabel(score: number): string {
  if (score < 25) return 'beginner';
  if (score < 50) return 'intermediate';
  if (score < 75) return 'advanced';
  return 'expert';
}

/**
 * Generate mood-specific guidance for world
 */
function generateMoodGuidance(mood: string, world: string): string {
  const guidanceMap: Record<string, Record<string, string>> = {
    introspective: {
      self: 'Deep introspection time — perfect for inner exploration',
      mind: 'Analytical mindset — great for understanding',
      career: 'Strategic thinking opportunity',
      default: `${mood} state supports growth in ${world}`,
    },
    analytical: {
      mind: 'Peak analytical state — tackle complex problems',
      decision: 'Clear thinking for decisions',
      career: 'Strategic clarity for career decisions',
      default: `Clear thinking helps progress in ${world}`,
    },
    empathetic: {
      relationship: 'Peak empathy — excellent for connecting',
      love: 'Open-hearted state for intimacy',
      career: 'Collaborative moment in career',
      default: `Empathy serves well in ${world}`,
    },
  };

  const moodGuide = guidanceMap[mood];
  if (moodGuide) {
    return moodGuide[world] || moodGuide.default || `Favorable state for ${world} world focus`;
  }

  return `Your ${mood} state aligns with ${world} exploration`;
}

/**
 * Generate world-specific next step for decision
 */
function generateDecisionNextStep(world: string, successRate: number): string {
  const actions: Record<string, string> = {
    self: 'Deepen self-awareness with next decision',
    mind: 'Explore cognitive implications further',
    relationship: 'Apply learning to your relationships',
    love: 'Strengthen intimate connections',
    career: 'Leverage this insight for career growth',
    wealth: 'Build financial momentum',
    life: 'Integrate lesson into daily life',
    growth: 'Push boundaries toward next level',
    decision: 'Document decision framework for future use',
    purpose: 'Align with life purpose',
    wellbeing: 'Support continued health journey',
    future: 'Track progress toward your vision',
  };

  const baseAction = actions[world] || 'Continue building expertise';
  const confidence = successRate > 70 ? 'confidently' : 'thoughtfully';
  return `${baseAction} ${confidence}`;
}

/**
 * Check if milestone is relevant to world
 */
function isRelevantToWorld(milestone: string, world: string): boolean {
  const worldKeywords: Record<string, string[]> = {
    career: ['career', 'job', 'work', 'professional', 'leadership'],
    relationship: ['relationship', 'connection', 'friend', 'family'],
    love: ['love', 'romance', 'intimate', 'partner'],
    health: ['health', 'fitness', 'wellness', 'exercise'],
    mind: ['learn', 'knowledge', 'understand', 'skill'],
    self: ['self', 'identity', 'authentic', 'aware'],
    money: ['financial', 'money', 'wealth', 'income'],
  };

  const keywords = worldKeywords[world] || [];
  return keywords.some(kw => milestone.toLowerCase().includes(kw));
}

/**
 * Generate world-specific opportunity
 */
function generateWorldOpportunity(world: string, expertise: number): string {
  const opportunities: Record<string, string> = {
    self: expertise > 70 ? 'Ready for deep identity integration' : 'Build deeper self-understanding',
    mind: expertise > 70 ? 'Master complex intellectual challenges' : 'Expand your knowledge base',
    relationship: expertise > 70 ? 'Deepen meaningful connections' : 'Build stronger relationships',
    love: expertise > 70 ? 'Cultivate authentic intimacy' : 'Explore romantic growth',
    career: expertise > 70 ? 'Pursue leadership opportunities' : 'Develop key skills',
    wealth: expertise > 70 ? 'Build advanced financial strategies' : 'Strengthen financial foundation',
    life: expertise > 70 ? 'Create holistic life design' : 'Improve life balance',
    growth: expertise > 70 ? 'Transform into best self' : 'Unlock personal potential',
    decision: expertise > 70 ? 'Create personal decision system' : 'Improve decision clarity',
    purpose: expertise > 70 ? 'Live aligned with deep purpose' : 'Discover your purpose',
    wellbeing: expertise > 70 ? 'Achieve optimal wellbeing' : 'Build healthy habits',
    future: expertise > 70 ? 'Manifest your vision' : 'Clarify your future',
  };

  return opportunities[world] || 'Continue world exploration';
}

/**
 * Adjust stress level based on world context
 */
function adjustStressForWorld(baseStress: number, world: string, expertise: number): number {
  // Expertise reduces stress in familiar worlds
  const expertiseReduction = (expertise / 100) * 10;

  // Some worlds naturally have different stress profiles
  const worldMod: Record<string, number> = {
    wellbeing: -5,
    self: -3,
    love: 5,
    career: 3,
    decision: 2,
  };

  const mod = worldMod[world] || 0;
  return Math.max(0, Math.min(100, baseStress - expertiseReduction + mod));
}

/**
 * Generate world-specific interpretation of insight
 */
function generateWorldInterpretation(insight: string, world: string, mood: string): string {
  return `In your ${world} world, this insight suggests: "${insight}" — especially given your current ${mood} state.`;
}
