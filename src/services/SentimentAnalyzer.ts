/**
 * SentimentAnalyzer.ts
 * Phase F: Sentiment Analysis & Quality Scoring
 */

import type {
  Sentiment,
  SentimentAnalysisResult,
  ResponseQualityScore,
} from '../types/feedback';

// Sentiment keywords for basic analysis
const POSITIVE_KEYWORDS = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'helpful',
  'insightful', 'clear', 'accurate', 'detailed', 'thorough', 'impressed', 'grateful',
];
const NEGATIVE_KEYWORDS = [
  'bad', 'terrible', 'awful', 'horrible', 'useless', 'wrong', 'inaccurate', 'confusing',
  'unclear', 'misleading', 'frustrating', 'disappointing', 'poor', 'inadequate',
];

/**
 * Analyze sentiment from text
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
  if (!text || text.trim().length === 0) {
    return {
      sentiment: 'neutral',
      score: 0,
      categories: [],
      confidence: 0.5,
    };
  }

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  // Count positive keywords
  for (const keyword of POSITIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    positiveCount += (lowerText.match(regex) || []).length;
  }

  // Count negative keywords
  for (const keyword of NEGATIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    negativeCount += (lowerText.match(regex) || []).length;
  }

  const total = positiveCount + negativeCount;
  let sentiment: Sentiment = 'neutral';
  let score = 0;
  let confidence = 0.5;

  if (total > 0) {
    const positiveRatio = positiveCount / total;
    confidence = Math.min(total * 0.1, 0.95); // Increase confidence with more keywords

    if (positiveRatio > 0.6) {
      sentiment = 'positive';
      score = positiveRatio * 1;
    } else if (positiveRatio < 0.4) {
      sentiment = 'negative';
      score = -(1 - positiveRatio);
    } else {
      sentiment = 'neutral';
      score = positiveRatio - 0.5;
    }
  }

  // Extract categories from sentiment
  const categories: string[] = [];
  if (lowerText.includes('short') || lowerText.includes('long')) {
    categories.push('length');
  }
  if (lowerText.includes('accurate') || lowerText.includes('correct')) {
    categories.push('accuracy');
  }
  if (lowerText.includes('clear') || lowerText.includes('confusing')) {
    categories.push('clarity');
  }
  if (lowerText.includes('helpful') || lowerText.includes('useful')) {
    categories.push('usefulness');
  }
  if (lowerText.includes('relevant') || lowerText.includes('off-topic')) {
    categories.push('relevance');
  }

  return {
    sentiment,
    score,
    categories: categories.length > 0 ? categories : ['general'],
    confidence,
  };
}

/**
 * Score Twin response quality
 */
export async function scoreResponseQuality(params: {
  responseText: string;
  userSentiment: Sentiment;
  responseLength: number;
  hasFollowUp: boolean;
}): Promise<ResponseQualityScore> {
  let score = 50; // Base score

  // User sentiment weight: 40%
  if (params.userSentiment === 'positive') {
    score += 20;
  } else if (params.userSentiment === 'negative') {
    score -= 20;
  }

  // Response length: 30%
  if (params.responseLength > 200) {
    score += 15;
  } else if (params.responseLength > 100) {
    score += 10;
  } else if (params.responseLength < 50) {
    score -= 10;
  }

  // Follow-up quality: 20%
  if (params.hasFollowUp) {
    score += 10;
  }

  // Text analysis: 10%
  const sentiment = await analyzeSentiment(params.responseText);
  score += sentiment.confidence * 5;

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  // Identify improvements
  const improvements: string[] = [];
  if (params.responseLength < 100) {
    improvements.push('Response is too short - consider providing more detail');
  }
  if (!params.hasFollowUp) {
    improvements.push('Consider adding follow-up questions');
  }
  if (params.userSentiment === 'negative') {
    improvements.push('Response did not meet user expectations');
  }

  return {
    quality: Math.round(score),
    improvements,
    strengths: params.userSentiment === 'positive'
      ? ['User found the response helpful']
      : [],
  };
}

/**
 * Detect improvement areas from feedback comments
 */
export async function detectImprovementAreas(
  feedbacks: Array<{ sentiment: Sentiment; comment?: string }>
): Promise<Array<{ area: string; frequency: number; examples: string[] }>> {
  if (feedbacks.length === 0) {
    return [];
  }

  const themes = new Map<string, { count: number; examples: string[] }>();

  for (const feedback of feedbacks) {
    if (!feedback.comment) continue;

    const comment = feedback.comment.toLowerCase();

    // Detect common improvement themes
    if (comment.includes('short') || comment.includes('length')) {
      const data = themes.get('response_length') || { count: 0, examples: [] };
      data.count++;
      data.examples.push(feedback.comment);
      themes.set('response_length', data);
    }

    if (comment.includes('detailed') || comment.includes('depth')) {
      const data = themes.get('depth') || { count: 0, examples: [] };
      data.count++;
      data.examples.push(feedback.comment);
      themes.set('depth', data);
    }

    if (comment.includes('generic') || comment.includes('specific')) {
      const data = themes.get('specificity') || { count: 0, examples: [] };
      data.count++;
      data.examples.push(feedback.comment);
      themes.set('specificity', data);
    }

    if (comment.includes('accurate') || comment.includes('wrong')) {
      const data = themes.get('accuracy') || { count: 0, examples: [] };
      data.count++;
      data.examples.push(feedback.comment);
      themes.set('accuracy', data);
    }

    if (comment.includes('tone') || comment.includes('friendly')) {
      const data = themes.get('tone') || { count: 0, examples: [] };
      data.count++;
      data.examples.push(feedback.comment);
      themes.set('tone', data);
    }
  }

  // Convert to array and sort by frequency
  const result = Array.from(themes.entries())
    .map(([area, data]) => ({
      area,
      frequency: data.count,
      examples: data.examples.slice(0, 3), // Top 3 examples
    }))
    .sort((a, b) => b.frequency - a.frequency);

  return result;
}

/**
 * Analyze sentiment trend over time
 */
export async function analyzeSentimentTrend(
  sentiments: Sentiment[]
): Promise<{ trend: 'improving' | 'stable' | 'declining'; avgSentiment: number }> {
  if (sentiments.length === 0) {
    return { trend: 'stable', avgSentiment: 0 };
  }

  let sentimentSum = 0;
  for (const sentiment of sentiments) {
    if (sentiment === 'positive') sentimentSum += 1;
    else if (sentiment === 'negative') sentimentSum -= 1;
  }

  const avgSentiment = sentimentSum / sentiments.length;

  // Check trend: compare first half vs second half
  const mid = Math.floor(sentiments.length / 2);
  let firstHalfSum = 0;
  let secondHalfSum = 0;

  for (let i = 0; i < mid; i++) {
    if (sentiments[i] === 'positive') firstHalfSum += 1;
    else if (sentiments[i] === 'negative') firstHalfSum -= 1;
  }

  for (let i = mid; i < sentiments.length; i++) {
    if (sentiments[i] === 'positive') secondHalfSum += 1;
    else if (sentiments[i] === 'negative') secondHalfSum -= 1;
  }

  const firstHalfAvg = mid > 0 ? firstHalfSum / mid : 0;
  const secondHalfAvg = sentiments.length - mid > 0
    ? secondHalfSum / (sentiments.length - mid)
    : 0;

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (secondHalfAvg > firstHalfAvg + 0.1) {
    trend = 'improving';
  } else if (secondHalfAvg < firstHalfAvg - 0.1) {
    trend = 'declining';
  }

  return { trend, avgSentiment };
}
