/**
 * QualityMetricsService.ts
 * Phase F: Quality Metrics Tracking
 */

import { supabase } from './supabase-service';
import type { QualityMetric, QualityMetrics, QualityTrend, QualityDegradationAlert } from '../types/feedback';

/**
 * Record quality metric
 */
export async function recordQualityMetric(params: {
  twinId: string;
  world: string;
  qualityScore: number;
  userRating: number;
  feedbackCount: number;
}): Promise<QualityMetric> {
  if (params.qualityScore < 0 || params.qualityScore > 100) {
    throw new Error('Quality score must be between 0 and 100');
  }
  if (params.userRating < 1 || params.userRating > 5) {
    throw new Error('User rating must be between 1 and 5');
  }

  if (!supabase) {
    throw new Error('Database connection unavailable');
  }

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('quality_metrics')
      .insert({
        twin_id: params.twinId,
        world: params.world,
        quality_score: params.qualityScore,
        user_rating: params.userRating,
        feedback_count: params.feedbackCount,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record metric: ${error.message}`);
    }

    return {
      id: data.id,
      twinId: data.twin_id,
      world: data.world,
      qualityScore: data.quality_score,
      userRating: data.user_rating,
      feedbackCount: data.feedback_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Get Twin quality metrics
 */
export async function getTwinQualityMetrics(twinId: string): Promise<QualityMetrics> {
  if (!supabase) {
    return {
      averageQualityScore: 0,
      totalRatings: 0,
      worldMetrics: {},
      trend: 'stable',
    };
  }

  try {
    const { data, error } = await supabase
      .from('quality_metrics')
      .select('*')
      .eq('twin_id', twinId);

    if (error || !data || data.length === 0) {
      return {
        averageQualityScore: 0,
        totalRatings: 0,
        worldMetrics: {},
        trend: 'stable',
      };
    }

    let totalScore = 0;
    let totalRatings = 0;
    const worldMetrics: Record<string, { average: number; count: number }> = {};

    for (const metric of data) {
      totalScore += metric.quality_score;
      totalRatings += metric.user_rating;

      if (!worldMetrics[metric.world]) {
        worldMetrics[metric.world] = { average: 0, count: 0 };
      }
      worldMetrics[metric.world].average += metric.quality_score;
      worldMetrics[metric.world].count++;
    }

    // Calculate averages
    for (const world in worldMetrics) {
      worldMetrics[world].average /= worldMetrics[world].count;
    }

    const averageQualityScore = data.length > 0 ? totalScore / data.length : 0;

    return {
      averageQualityScore,
      totalRatings,
      worldMetrics,
      trend: 'stable',
    };
  } catch (err) {
    return {
      averageQualityScore: 0,
      totalRatings: 0,
      worldMetrics: {},
      trend: 'stable',
    };
  }
}

/**
 * Get quality trend over time
 */
export async function getQualityTrend(
  twinId: string,
  world: string,
  days: number = 7
): Promise<QualityTrend> {
  if (!supabase) {
    return {
      direction: 'stable',
      dataPoints: [],
      changePercentage: 0,
    };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('quality_metrics')
      .select('*')
      .eq('twin_id', twinId)
      .eq('world', world)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return {
        direction: 'stable',
        dataPoints: [],
        changePercentage: 0,
      };
    }

    const dataPoints = data.map(metric => ({
      date: metric.created_at.split('T')[0],
      score: metric.quality_score,
    }));

    // Calculate trend
    const firstScore = data[0].quality_score;
    const lastScore = data[data.length - 1].quality_score;
    const changePercentage = firstScore > 0 ? ((lastScore - firstScore) / firstScore) * 100 : 0;

    let direction: 'improving' | 'stable' | 'declining' = 'stable';
    if (changePercentage > 5) direction = 'improving';
    else if (changePercentage < -5) direction = 'declining';

    return {
      direction,
      dataPoints,
      changePercentage,
    };
  } catch (err) {
    return {
      direction: 'stable',
      dataPoints: [],
      changePercentage: 0,
    };
  }
}

/**
 * Check quality degradation
 */
export async function checkQualityDegradation(
  twinId: string,
  world: string,
  threshold: number
): Promise<QualityDegradationAlert> {
  const trend = await getQualityTrend(twinId, world, 7);

  if (trend.dataPoints.length < 2) {
    return {
      isDegraded: false,
      previousScore: 0,
      currentScore: 0,
      dropPercentage: 0,
      trend,
    };
  }

  const previousScore = trend.dataPoints[0].score;
  const currentScore = trend.dataPoints[trend.dataPoints.length - 1].score;
  const dropPercentage = previousScore > 0
    ? ((previousScore - currentScore) / previousScore) * 100
    : 0;

  const isDegraded = currentScore < threshold && dropPercentage > 0;

  return {
    isDegraded,
    previousScore,
    currentScore,
    dropPercentage,
    trend,
  };
}
