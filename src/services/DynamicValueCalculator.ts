/**
 * DynamicValueCalculator.ts
 *
 * Phase A.1: Remove all hardcoded numeric defaults
 * Calculate Twin maturity, SICE scores, and other metrics dynamically
 * from actual user data instead of using flat defaults (30, 50, etc.)
 */

/**
 * Calculate Twin maturity score dynamically from user understanding
 * and analysis depth metrics instead of hardcoding 30
 *
 * Priority order:
 * 1. If SICE provided userUnderstanding, use it (0-100 already normalized)
 * 2. Calculate from analysis depth if available
 * 3. Calculate from personal intelligence confidence
 */
export function calculateMaturityScore(params: {
  userUnderstanding?: number; // From SICE orchestration result
  analysisInsightCount?: number; // Number of insights extracted
  analysisCoherence?: number; // 0-100 coherence metric
  personalIntelConfidence?: number; // 0-100 confidence from intelligence service
}): number {
  // If SICE already calculated understanding, use it directly
  if (typeof params.userUnderstanding === 'number' && params.userUnderstanding >= 0) {
    return Math.max(0, Math.min(100, params.userUnderstanding));
  }

  // Calculate from analysis depth metrics
  let calculatedScore = 0;
  let components = 0;

  // Component 1: Analysis insight depth (0-100)
  // More insights = better understanding of user
  // Assume 10+ insights = 100% on this metric
  if (typeof params.analysisInsightCount === 'number' && params.analysisInsightCount > 0) {
    const insightScore = Math.min(100, (params.analysisInsightCount / 10) * 100);
    calculatedScore += insightScore;
    components++;
  }

  // Component 2: Analysis coherence
  // How well the analysis themes connect (from NLP analysis)
  if (typeof params.analysisCoherence === 'number' && params.analysisCoherence >= 0) {
    calculatedScore += params.analysisCoherence;
    components++;
  }

  // Component 3: Personal intelligence confidence
  // How confident the intelligence extraction was
  if (typeof params.personalIntelConfidence === 'number' && params.personalIntelConfidence >= 0) {
    calculatedScore += params.personalIntelConfidence;
    components++;
  }

  // Average the components (if any were available)
  if (components > 0) {
    const averageScore = calculatedScore / components;
    return Math.max(0, Math.min(100, Math.round(averageScore)));
  }

  // Last resort: if NO data at all, start at 10 (not 30) as a signal
  // that this Twin is newly born and hasn't been analyzed yet
  // 10 is much lower than 30 so it indicates incompleteness
  return 10;
}

/**
 * Calculate SICE engine baseline score dynamically from:
 * 1. Engine-specific confidence from sice_results
 * 2. Engine-specific thresholds and expected ranges
 * 3. Fallback to a minimal score (not 50) if data missing
 */
export function calculateSICEEngineScore(params: {
  engineName: string;
  engineConfidence?: number; // From this engine's result
  analysisDepth?: number; // Overall analysis depth (0-100)
  userUnderstanding?: number; // Overall understanding (0-100)
}): number {
  // If this engine reported a confidence, use it with bounds
  if (typeof params.engineConfidence === 'number' && params.engineConfidence >= 0) {
    return Math.max(0, Math.min(100, params.engineConfidence));
  }

  // Otherwise, derive from overall metrics
  let score = 0;
  let components = 0;

  // Component 1: User understanding (how well we know them)
  if (typeof params.userUnderstanding === 'number' && params.userUnderstanding >= 0) {
    score += params.userUnderstanding;
    components++;
  }

  // Component 2: Analysis depth
  if (typeof params.analysisDepth === 'number' && params.analysisDepth >= 0) {
    score += params.analysisDepth;
    components++;
  }

  if (components > 0) {
    const avgScore = score / components;
    return Math.max(0, Math.min(100, Math.round(avgScore)));
  }

  // Fallback: 20 (not 50) indicates minimal/uninitialized engine confidence
  // This is a much lower signal than 50, which looked like "adequate"
  return 20;
}

/**
 * Calculate overall analysis depth from collected data
 * Returns 0-100 representing how complete/deep the analysis is
 */
export function calculateAnalysisDepth(params: {
  insightCount?: number;
  responsesProvided?: number;
  totalResponsesExpected?: number;
  analysisTimeMs?: number;
}): number {
  let depth = 0;
  let components = 0;

  // Component 1: Insight count (more insights = deeper analysis)
  // 10 insights = 100% on this metric
  if (typeof params.insightCount === 'number' && params.insightCount > 0) {
    depth += Math.min(100, (params.insightCount / 10) * 100);
    components++;
  }

  // Component 2: Response coverage
  // How complete are the user's responses to the analysis questions
  if (
    typeof params.responsesProvided === 'number' &&
    typeof params.totalResponsesExpected === 'number' &&
    params.totalResponsesExpected > 0
  ) {
    const coverage = (params.responsesProvided / params.totalResponsesExpected) * 100;
    depth += coverage;
    components++;
  }

  // Component 3: Analysis time spent
  // Longer analysis = more thorough (but with diminishing returns)
  // 5+ minutes = 100% on this metric
  if (typeof params.analysisTimeMs === 'number' && params.analysisTimeMs > 0) {
    const timeMinutes = params.analysisTimeMs / 60000;
    const timeScore = Math.min(100, (timeMinutes / 5) * 100);
    depth += timeScore;
    components++;
  }

  if (components > 0) {
    return Math.max(0, Math.min(100, Math.round(depth / components)));
  }

  return 0;
}

/**
 * Determine if a fallback/default score is appropriate
 * Returns true if we should use a calculated default instead of a hardcoded one
 */
export function shouldUseCalculatedDefault(siceResult: any): boolean {
  // If we have any substantive data from SICE, don't use defaults
  if (!siceResult) return true;

  const hasEngineResults =
    siceResult.sice_results &&
    (Array.isArray(siceResult.sice_results) ? siceResult.sice_results.length > 0 : Object.keys(siceResult.sice_results).length > 0);

  const hasInsights = siceResult.synthesis?.themes && Array.isArray(siceResult.synthesis.themes) && siceResult.synthesis.themes.length > 0;
  const hasPersonalIntel = siceResult.personal_intelligence?.userUnderstanding;

  // If we have any of these, we should calculate instead of defaulting
  return !(hasEngineResults || hasInsights || hasPersonalIntel);
}
