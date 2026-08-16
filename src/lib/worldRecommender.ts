/**
 * worldRecommender.ts
 * Extract topics from conversation and recommend world for Twin guidance (P0 #7)
 * Simple keyword-based matching with confidence scoring
 */

import type { WorldId } from '../constants/worlds';

interface WorldRecommendation {
  world: WorldId;
  confidence: number; // 0-1
  keywords: string[];
}

const WORLD_KEYWORDS: Record<WorldId, string[]> = {
  self: ['identity', 'self', 'who am i', 'authentic', 'values', 'beliefs', 'myself', 'true self', 'essence'],
  mind: ['thoughts', 'emotions', 'mental', 'clarity', 'focus', 'anxiety', 'stress', 'overwhelm', 'confused'],
  relationship: ['relationship', 'friend', 'family', 'communication', 'connection', 'bond', 'people', 'social', 'interaction'],
  love: ['love', 'romance', 'intimate', 'partner', 'heart', 'dating', 'attraction', 'feelings', 'affection'],
  career: ['career', 'work', 'job', 'professional', 'business', 'leadership', 'purpose', 'role', 'industry', 'promotion'],
  wealth: ['money', 'finance', 'wealth', 'budget', 'investment', 'abundance', 'income', 'financial', 'economy'],
  life: ['life', 'meaning', 'direction', 'path', 'journey', 'balance', 'lifestyle', 'living'],
  growth: ['growth', 'learn', 'develop', 'improve', 'potential', 'skill', 'progress', 'evolution', 'better'],
  decision: ['decision', 'choice', 'choose', 'dilemma', 'uncertain', 'option', 'next step', 'crossroad'],
  purpose: ['purpose', 'meaning', 'mission', 'calling', 'why', 'legacy', 'impact', 'contribution'],
  wellbeing: ['health', 'wellness', 'wellbeing', 'exercise', 'nutrition', 'sleep', 'body', 'fitness', 'energy'],
  future: ['future', 'tomorrow', 'ahead', 'next', 'vision', 'goals', 'dream', 'aspiration', 'ahead'],
};

/**
 * Recommend world based on message content
 * Uses simple keyword matching with confidence scoring
 */
export function recommendWorld(messageContent: string): WorldRecommendation | null {
  if (!messageContent || messageContent.trim().length === 0) {
    return null;
  }

  const content = messageContent.toLowerCase();
  const words = content.split(/\s+/);

  const scores: Record<WorldId, { count: number; keywords: string[] }> = {} as Record<WorldId, { count: number; keywords: string[] }>;

  // Initialize scores
  Object.keys(WORLD_KEYWORDS).forEach((world) => {
    scores[world as WorldId] = { count: 0, keywords: [] };
  });

  // Count keyword matches
  for (const [world, keywords] of Object.entries(WORLD_KEYWORDS) as Array<[WorldId, string[]]>) {
    for (const keyword of keywords) {
      const keywordWords = keyword.split(/\s+/);

      // Check both single-word and multi-word keywords
      if (keywordWords.length === 1) {
        // Single word keyword - check if it appears in the words array
        for (const word of words) {
          if (word.includes(keyword)) {
            scores[world].count += 1;
            scores[world].keywords.push(keyword);
            break;
          }
        }
      } else {
        // Multi-word keyword - check in full content
        if (content.includes(keyword)) {
          scores[world].count += 2; // Weight multi-word matches higher
          scores[world].keywords.push(keyword);
        }
      }
    }
  }

  // Find best match
  let bestWorld: WorldId | null = null;
  let maxScore = 0;

  for (const [world, data] of Object.entries(scores) as Array<[WorldId, { count: number; keywords: string[] }]>) {
    if (data.count > maxScore) {
      maxScore = data.count;
      bestWorld = world;
    }
  }

  if (!bestWorld || maxScore === 0) {
    return null;
  }

  return {
    world: bestWorld,
    confidence: Math.min(1, maxScore / 5), // Normalize: 5+ matches = 1.0 confidence
    keywords: [...new Set(scores[bestWorld].keywords)],
  };
}

/**
 * Get world recommendations sorted by confidence
 */
export function getWorldRecommendations(messageContent: string): WorldRecommendation[] {
  if (!messageContent || messageContent.trim().length === 0) {
    return [];
  }

  const content = messageContent.toLowerCase();
  const recommendations: WorldRecommendation[] = [];

  for (const [world, keywords] of Object.entries(WORLD_KEYWORDS) as Array<[WorldId, string[]]>) {
    let matches = 0;
    const foundKeywords: string[] = [];

    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        matches += 1;
        foundKeywords.push(keyword);
      }
    }

    if (matches > 0) {
      recommendations.push({
        world,
        confidence: Math.min(1, matches / 3), // Normalize
        keywords: foundKeywords,
      });
    }
  }

  // Sort by confidence (descending)
  return recommendations.sort((a, b) => b.confidence - a.confidence);
}
