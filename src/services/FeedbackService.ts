/**
 * FeedbackService.ts
 * Phase F: User Feedback Loop Management
 *
 * Handles user feedback collection, storage, and analysis
 */

import { supabase } from './supabase-service';
import type {
  UserFeedback,
  Sentiment,
  FeedbackStats,
} from '../types/feedback';

/**
 * Validate user ID
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== 'string' || userId.length < 1) {
    throw new Error('Invalid user ID');
  }
  if (!/^[a-zA-Z0-9\-]+$/.test(userId)) {
    throw new Error('Invalid user ID format');
  }
}

/**
 * Save user feedback
 */
export async function saveFeedback(
  feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'updatedAt'>
): Promise<UserFeedback> {
  validateUserId(feedback.userId);

  if (!supabase) {
    throw new Error('Database connection unavailable');
  }

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        ...feedback,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save feedback: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      twinId: data.twin_id,
      responseId: data.response_id,
      feedbackType: data.feedback_type,
      sentiment: data.sentiment,
      comment: data.comment,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Get user's feedback history
 */
export async function getUserFeedback(
  userId: string,
  twinId?: string
): Promise<UserFeedback[]> {
  validateUserId(userId);

  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', userId);

    if (twinId) {
      query = query.eq('twin_id', twinId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return (data || []).map(feedback => ({
      id: feedback.id,
      userId: feedback.user_id,
      twinId: feedback.twin_id,
      responseId: feedback.response_id,
      feedbackType: feedback.feedback_type,
      sentiment: feedback.sentiment,
      comment: feedback.comment,
      createdAt: feedback.created_at,
      updatedAt: feedback.updated_at,
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Extract improvement areas from negative feedback comments
 */
function extractImprovementAreas(feedbacks: Array<{ sentiment: string; comment?: string }>): string[] {
  const negativeFeedbacks = feedbacks
    .filter(f => f.sentiment === 'negative' && f.comment)
    .map(f => f.comment!.toLowerCase());

  if (negativeFeedbacks.length === 0) return [];

  // Keyword frequency analysis on negative comments
  const keywords: Record<string, number> = {};
  const stopWords = new Set(['the', 'a', 'an', 'is', 'it', 'to', 'i', 'and', 'or', 'not', 'this', 'that', 'was', 'are']);

  negativeFeedbacks.forEach(comment => {
    comment
      .replace(/[^a-zA-Zก-๙\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
  });

  return Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Get Twin feedback statistics
 */
export async function getTwinFeedbackStats(twinId: string): Promise<FeedbackStats> {
  if (!supabase) {
    return {
      totalFeedback: 0,
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
      averageSentimentScore: 0,
      commonImprovementAreas: [],
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('sentiment, comment')
      .eq('twin_id', twinId);

    if (error) {
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    const feedbacks = data || [];
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    let sentimentSum = 0;

    for (const feedback of feedbacks) {
      const sentiment = feedback.sentiment as Sentiment;
      sentimentCounts[sentiment]++;

      // Convert to numeric score
      if (sentiment === 'positive') sentimentSum += 1;
      else if (sentiment === 'negative') sentimentSum -= 1;
    }

    const averageSentimentScore =
      feedbacks.length > 0 ? sentimentSum / feedbacks.length : 0;

    return {
      totalFeedback: feedbacks.length,
      sentimentBreakdown: sentimentCounts,
      averageSentimentScore,
      commonImprovementAreas: extractImprovementAreas(feedbacks),
    };
  } catch (err) {
    return {
      totalFeedback: 0,
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
      averageSentimentScore: 0,
      commonImprovementAreas: [],
    };
  }
}

/**
 * Filter feedback by sentiment
 */
export async function getFeedbackBySentiment(
  twinId: string,
  sentiment: Sentiment
): Promise<UserFeedback[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('twin_id', twinId)
      .eq('sentiment', sentiment)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return (data || []).map(feedback => ({
      id: feedback.id,
      userId: feedback.user_id,
      twinId: feedback.twin_id,
      responseId: feedback.response_id,
      feedbackType: feedback.feedback_type,
      sentiment: feedback.sentiment,
      comment: feedback.comment,
      createdAt: feedback.created_at,
      updatedAt: feedback.updated_at,
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Get feedback with comments (for analysis)
 */
export async function getFeedbackWithComments(twinId: string): Promise<UserFeedback[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('twin_id', twinId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return (data || []).map(feedback => ({
      id: feedback.id,
      userId: feedback.user_id,
      twinId: feedback.twin_id,
      responseId: feedback.response_id,
      feedbackType: feedback.feedback_type,
      sentiment: feedback.sentiment,
      comment: feedback.comment,
      createdAt: feedback.created_at,
      updatedAt: feedback.updated_at,
    }));
  } catch (err) {
    return [];
  }
}
