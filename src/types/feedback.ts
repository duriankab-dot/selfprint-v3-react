/**
 * feedback.ts
 * Phase F: Feedback Loop Type Definitions
 */

export type FeedbackType = 'quality' | 'relevance' | 'accuracy' | 'tone' | 'helpfulness';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Severity = 'low' | 'medium' | 'high';

export interface UserFeedback {
  id: string;
  userId: string;
  twinId: string;
  responseId: string;
  feedbackType: FeedbackType;
  sentiment: Sentiment;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSentiment {
  id: string;
  responseId: string;
  sentiment: Sentiment;
  score: number; // -1 to 1
  categories: string[];
  qualityScore: number; // 0-100
  improvements: string[];
  createdAt: string;
}

export interface QualityMetric {
  id: string;
  twinId: string;
  world: string;
  qualityScore: number; // 0-100
  userRating: number; // 1-5
  feedbackCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QualityMetrics {
  averageQualityScore: number;
  totalRatings: number;
  worldMetrics: Record<string, { average: number; count: number }>;
  trend: 'improving' | 'stable' | 'declining';
}

export interface QualityTrend {
  direction: 'improving' | 'stable' | 'declining';
  dataPoints: Array<{ date: string; score: number }>;
  changePercentage: number;
}

export interface ImprovementAction {
  id: string;
  feedbackId: string;
  improvementArea: string;
  severity: Severity;
  description: string;
  status: 'pending' | 'applied' | 'completed' | 'reverted';
  targetChange?: Record<string, unknown>;
  appliedAt?: string;
  metricsBeforeChange?: Record<string, number>;
  metricsAfterChange?: Record<string, number>;
  createdAt: string;
}

export interface ImprovementImpact {
  totalImprovementsApplied: number;
  averageQualityIncrease: number;
  areaImpact: Record<string, { applied: number; avgIncrease: number }>;
  successRate: number; // % of improvements that improved quality
}

export interface TwinPromptUpdate {
  id: string;
  twinId: string;
  version: number;
  changes: Record<string, unknown>;
  appliedAt: string;
  createdAt: string;
}

export interface SentimentAnalysisResult {
  sentiment: Sentiment;
  score: number; // -1 to 1
  categories: string[];
  confidence: number; // 0-1
}

export interface ResponseQualityScore {
  quality: number; // 0-100
  improvements: string[];
  strengths: string[];
}

export interface FeedbackStats {
  totalFeedback: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  averageSentimentScore: number; // -1 to 1
  commonImprovementAreas: string[];
}

export interface QualityDegradationAlert {
  isDegraded: boolean;
  previousScore: number;
  currentScore: number;
  dropPercentage: number;
  trend: QualityTrend;
}
