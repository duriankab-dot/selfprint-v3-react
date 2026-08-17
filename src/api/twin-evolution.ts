/**
 * Twin Evolution API Endpoints
 * POST /api/twin-evolution?action=...
 *
 * Actions:
 * - check-evolution: Check if Twin ready to evolve
 * - execute-evolution: Execute evolution to next stage
 * - get-status: Get evolution status + progress
 * - get-history: Get evolution history
 */

import { supabase } from '../lib/supabase/client';
import {
  checkMicroEvolution,
  evolveTwin,
  getEvolutionStatus,
  notifyEvolution,
} from '../services/TwinEvolutionService';
import type { TwinStage, ProgressMetrics } from '../constants/twinStages';

export const handler = async (req: any, res: any) => {
  try {
    const action = req.query.action as string;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (action) {
      case 'check-evolution':
        return handleCheckEvolution(req, res, userId);

      case 'execute-evolution':
        return handleExecuteEvolution(req, res, userId);

      case 'get-status':
        return handleGetStatus(req, res, userId);

      case 'get-history':
        return handleGetHistory(req, res, userId);

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Twin evolution API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check if Twin is ready to evolve
 * Body: { twinId: string }
 */
async function handleCheckEvolution(
  req: any,
  res: any,
  userId: string
) {
  const { twinId } = req.body;

  if (!twinId) {
    return res.status(400).json({ error: 'Missing twinId' });
  }

  try {
    // Get Twin current stage
    const { data: twin, error: twinError } = await supabase
      .from('twins')
      .select('stage, created_at')
      .eq('id', twinId)
      .eq('user_id', userId)
      .single();

    if (twinError || !twin) {
      return res.status(404).json({ error: 'Twin not found' });
    }

    const currentStage = twin.stage as TwinStage;

    // Calculate metrics
    const createdAt = new Date(twin.created_at);
    const daysSinceAwakening = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId);

    const { count: patternCount } = await supabase
      .from('detected_patterns')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId);

    const { count: memoryCount } = await supabase
      .from('twin_memory')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId);

    const { count: feedbackCount } = await supabase
      .from('user_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId);

    const metrics: ProgressMetrics = {
      daysSinceAwakening,
      messageCount: messageCount || 0,
      patternCount: patternCount || 0,
      memoryCount: memoryCount || 0,
      feedbackCount: feedbackCount || 0,
    };

    // Check evolution
    const result = await checkMicroEvolution(userId, twinId, metrics, currentStage);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Check evolution error:', error);
    return res.status(500).json({ error: 'Check evolution failed' });
  }
}

/**
 * Execute evolution to next stage
 * Body: { twinId: string, metrics: ProgressMetrics }
 */
async function handleExecuteEvolution(
  req: any,
  res: any,
  userId: string
) {
  const { twinId, metrics } = req.body;

  if (!twinId || !metrics) {
    return res.status(400).json({ error: 'Missing twinId or metrics' });
  }

  try {
    // Get current stage
    const { data: twin, error: twinError } = await supabase
      .from('twins')
      .select('stage, name')
      .eq('id', twinId)
      .eq('user_id', userId)
      .single();

    if (twinError || !twin) {
      return res.status(404).json({ error: 'Twin not found' });
    }

    const previousStage = twin.stage as TwinStage;
    const nextStage = ((previousStage + 1) as TwinStage) as TwinStage;

    // Evolve Twin
    const result = await evolveTwin(
      userId,
      twinId,
      previousStage,
      nextStage,
      metrics
    );

    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    // Send notification
    await notifyEvolution(userId, twinId, nextStage, twin.name);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Execute evolution error:', error);
    return res.status(500).json({ error: 'Evolution execution failed' });
  }
}

/**
 * Get evolution status for a Twin
 * Query: ?twinId=...
 */
async function handleGetStatus(
  req: any,
  res: any,
  userId: string
) {
  const { twinId } = req.query;

  if (!twinId) {
    return res.status(400).json({ error: 'Missing twinId' });
  }

  try {
    const result = await getEvolutionStatus(userId, twinId as string);

    if (!result.success) {
      return res.status(404).json({ error: 'Status fetch failed' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get status error:', error);
    return res.status(500).json({ error: 'Status fetch failed' });
  }
}

/**
 * Get evolution history for a Twin
 * Query: ?twinId=...
 */
async function handleGetHistory(
  req: any,
  res: any,
  userId: string
) {
  const { twinId } = req.query;

  if (!twinId) {
    return res.status(400).json({ error: 'Missing twinId' });
  }

  try {
    const { data: history, error } = await supabase
      .from('twin_evolution_history')
      .select('*')
      .eq('twin_id', twinId)
      .eq('user_id', userId)
      .order('evolved_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ error: 'History fetch failed' });
  }
}
