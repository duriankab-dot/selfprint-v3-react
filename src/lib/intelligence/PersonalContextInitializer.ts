/**
 * PersonalContextInitializer.ts
 *
 * Bridge between Onboarding flow and PersonalContextBuilder
 * Transforms onboarding data (birth date, mood, analysis) into PersonalContext
 *
 * @module PersonalContextInitializer
 */

import { PersonalContextBuilder } from './PersonalContextBuilder';
import type { PersonalContext, Value, Goal, BlindSpot } from './types';
import type { AnalysisResponse } from '@/lib/types/astrovera';
import type { Mood } from '@/context/EmotionContext';

export interface OnboardingContextData {
  userId: string;
  birthDate: string;
  mood: Mood;
  analysisResponse: AnalysisResponse;
  finetuneAnswers?: Record<string, string>;
}

/**
 * Initializes PersonalContext from Onboarding data
 *
 * Transform flow:
 * 1. Extract strengths → Values (KNOW level)
 * 2. Extract insights → Goals (INFER level)
 * 3. Extract blind spots → BlindSpots (INFER level)
 * 4. Extract decision style → PersonalContext.decisionStyle (KNOW level)
 * 5. Store confidence from analysisResponse.confidence
 *
 * @param data - Onboarding data with analysis results
 * @returns PersonalContext ready for storage
 */
export async function initializeContextFromOnboarding(
  data: OnboardingContextData
): Promise<PersonalContext> {
  const contextBuilder = new PersonalContextBuilder();

  // Initialize with onboarding metadata
  const response = await contextBuilder.initialize({
    userId: data.userId,
    birthDate: new Date(data.birthDate), // Convert string to Date
    mood: data.mood,
    onboardingAnswers: data.finetuneAnswers || {},
    hubsActive: extractActiveHubs(data.analysisResponse),
  });

  const context = response.context;

  // Store onboarding metadata
  context.birthDate = data.birthDate;
  context.moodState = data.mood;

  // Transform analysis response into context entries
  const inferredValues = transformStrengthsToValues(
    data.analysisResponse.strengths,
    data.analysisResponse.confidence
  );

  const inferredGoals = transformInsightsToGoals(
    data.analysisResponse.insights,
    data.analysisResponse.confidence
  );

  const inferredBlindSpots = transformBlindSpots(
    data.analysisResponse.blindSpots,
    data.analysisResponse.confidence
  );

  // Merge with existing context
  context.values = [...(context.values || []), ...inferredValues];
  context.goals = [...(context.goals || []), ...inferredGoals];
  context.blindSpots = [...(context.blindSpots || []), ...inferredBlindSpots];

  // Add decision style from analysis
  context.decisionStyle = {
    type: data.analysisResponse.decisionStyle as any,
    description: data.analysisResponse.decisionStyle,
    confidence: data.analysisResponse.confidence * 0.9,
    evidence: data.analysisResponse.insights.slice(0, 2),
    sourceOfTruth: 'onboarding_analysis',
  };

  return context;
}

/**
 * Extract active hubs from analysis opportunities
 * Maps analysis insights to life hubs (career, relationships, health, etc.)
 *
 * @param analysisResponse - Response from Astrovera analysis
 * @returns Array of active hub identifiers
 */
function extractActiveHubs(analysisResponse: AnalysisResponse): string[] {
  // Map analysis to common hubs
  // This is a simple mapping; production would be more sophisticated
  const hubs: string[] = [];

  // All onboarding users start with these core hubs
  hubs.push('personal-growth');
  hubs.push('relationships');
  hubs.push('career');

  // Add hubs based on analysis content
  if (analysisResponse.insights.some((i) => i.toLowerCase().includes('decision'))) {
    hubs.push('decision-making');
  }

  if (
    analysisResponse.insights.some((i) => i.toLowerCase().includes('creative')) ||
    analysisResponse.blindSpots.some((b) => b.toLowerCase().includes('creative'))
  ) {
    hubs.push('creativity');
  }

  if (analysisResponse.blindSpots.some((b) => b.toLowerCase().includes('emotion'))) {
    hubs.push('emotional-intelligence');
  }

  return [...new Set(hubs)]; // Remove duplicates
}

/**
 * Transform analysis strengths into Value entries
 * Strengths = things the user does well = core values
 *
 * @param strengths - Array of strength descriptions
 * @param confidence - Base confidence from analysis
 * @returns Array of Value entries
 */
function transformStrengthsToValues(strengths: string[], confidence: number): Value[] {
  return strengths.map((strength, index) => ({
    id: `strength-${index}`,
    title: strength.split(':')[0] || strength,
    name: strength.split(':')[0] || strength,
    description: strength,
    importance: 'high',
    confidence: Math.min(confidence * 0.95, 0.95),
    evidence: [strength],
    sourceOfTruth: 'onboarding_strengths',
    inferredFromSources: [{
      type: 'question_answer' as const,
      id: `strength-${index}`,
      date: new Date(),
      excerpt: strength,
    }],
    inferred: true,
  }));
}

/**
 * Transform analysis insights into Goal entries
 * Insights = opportunities = directions the user should explore = goals
 *
 * @param insights - Array of insight/opportunity descriptions
 * @param confidence - Base confidence from analysis
 * @returns Array of Goal entries
 */
function transformInsightsToGoals(insights: string[], confidence: number): Goal[] {
  return insights.map((insight, index) => ({
    id: `insight-${index}`,
    title: insight.split(':')[0] || insight,
    description: insight,
    timeframe: '6-months',
    confidence: Math.min(confidence * 0.85, 0.85),
    evidence: [insight],
    sourceOfTruth: 'onboarding_insights',
    inferredFromSources: [{
      type: 'question_answer' as const,
      id: `insight-${index}`,
      date: new Date(),
      excerpt: insight,
    }],
  }));
}

/**
 * Transform analysis blind spots into BlindSpot entries
 * Blind spots = areas for growth and awareness
 *
 * @param blindSpots - Array of blind spot descriptions
 * @param confidence - Base confidence from analysis
 * @returns Array of BlindSpot entries
 */
function transformBlindSpots(blindSpots: string[], confidence: number): BlindSpot[] {
  return blindSpots.map((blindSpot, index) => ({
    id: `blindspot-${index}`,
    title: blindSpot.split(':')[0] || blindSpot,
    description: blindSpot,
    potentialImpact: 'medium',
    confidence: Math.min(confidence * 0.75, 0.75),
    evidence: [blindSpot],
    actionable: true,
    sourceOfTruth: 'onboarding_blindspots',
    inferredFromSources: [{
      type: 'question_answer' as const,
      id: `blindspot-${index}`,
      date: new Date(),
      excerpt: blindSpot,
    }],
  }));
}

/**
 * Validate onboarding data completeness
 * Ensures all required fields are present before initialization
 *
 * @param data - Onboarding context data to validate
 * @throws Error if required fields are missing
 */
export function validateOnboardingData(data: OnboardingContextData): void {
  if (!data.userId) throw new Error('userId is required');
  if (!data.birthDate) throw new Error('birthDate is required');
  if (!data.mood) throw new Error('mood is required');
  if (!data.analysisResponse) throw new Error('analysisResponse is required');

  const analysis = data.analysisResponse;
  if (!analysis.strengths || !Array.isArray(analysis.strengths)) {
    throw new Error('analysisResponse.strengths must be an array');
  }
  if (!analysis.insights || !Array.isArray(analysis.insights)) {
    throw new Error('analysisResponse.insights must be an array');
  }
  if (!analysis.blindSpots || !Array.isArray(analysis.blindSpots)) {
    throw new Error('analysisResponse.blindSpots must be an array');
  }
  if (typeof analysis.confidence !== 'number' || analysis.confidence < 0 || analysis.confidence > 1) {
    throw new Error('analysisResponse.confidence must be a number between 0 and 1');
  }
}
