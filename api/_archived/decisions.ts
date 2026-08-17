/**
 * api/decisions.ts
 * Decision CRUD handlers for backend server
 * Handles: create, read, update, delete, and follow-up completion
 */

import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import type { Decision, FollowUp, FollowUpDays } from '../src/types/decision';
import { getFollowUpDueDate } from '../src/types/decision';

// Initialize Supabase client
function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * POST /api/decisions
 * Create a new decision with auto-generated follow-ups at 30/90/180/365 days
 */
export async function createDecision(req: Request, res: Response): Promise<void> {
  try {
    const { userId, title, description, category, expectedOutcome, world, confidence } = req.body;

    if (!userId || !title || !category) {
      res.status(400).json({ error: 'userId, title, and category required' });
      return;
    }

    const supabase = getSupabaseClient();
    const decisionDate = new Date().toISOString().split('T')[0];
    const decisionId = generateId();

    // Auto-generate follow-ups at 30/90/180/365 days
    const followUpDays: FollowUpDays[] = [30, 90, 180, 365];
    const followUps: FollowUp[] = followUpDays.map((days) => ({
      id: generateId(),
      decisionId,
      days,
      scheduledDate: getFollowUpDueDate(decisionDate, days),
      completed: false,
      notificationSent: false,
    }));

    const newDecision: Decision = {
      id: decisionId,
      userId,
      title,
      description,
      category,
      decisionDate,
      confidence: confidence || 50,
      expectedOutcome,
      followUps,
      world: world || undefined,
      status: 'pending-followup',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('decisions')
      .insert([newDecision])
      .select();

    if (error) {
      console.error('Error creating decision:', error);
      res.status(500).json({ error: 'Failed to create decision' });
      return;
    }

    res.status(201).json({ success: true, decision: data?.[0] || newDecision });
  } catch (err) {
    console.error('Create decision error:', err);
    res.status(500).json({ error: String(err) });
  }
}

/**
 * GET /api/decisions
 * Fetch all decisions for a user
 */
export async function getDecisions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching decisions:', error);
      res.status(500).json({ error: 'Failed to fetch decisions' });
      return;
    }

    res.status(200).json({ success: true, decisions: data || [] });
  } catch (err) {
    console.error('Get decisions error:', err);
    res.status(500).json({ error: String(err) });
  }
}

/**
 * PUT /api/decisions/:id
 * Update a decision
 */
export async function updateDecision(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      res.status(400).json({ error: 'Decision ID required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('decisions')
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating decision:', error);
      res.status(500).json({ error: 'Failed to update decision' });
      return;
    }

    res.status(200).json({ success: true, decision: data?.[0] });
  } catch (err) {
    console.error('Update decision error:', err);
    res.status(500).json({ error: String(err) });
  }
}

/**
 * DELETE /api/decisions/:id
 * Delete a decision
 */
export async function deleteDecision(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Decision ID required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('decisions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting decision:', error);
      res.status(500).json({ error: 'Failed to delete decision' });
      return;
    }

    res.status(200).json({ success: true, message: 'Decision deleted' });
  } catch (err) {
    console.error('Delete decision error:', err);
    res.status(500).json({ error: String(err) });
  }
}

/**
 * POST /api/decisions/:id/followup/:followUpId
 * Complete a follow-up with reflection and result score
 */
export async function completeFollowUp(req: Request, res: Response): Promise<void> {
  try {
    const { id, followUpId } = req.params;
    const { reflection, resultScore } = req.body;

    if (!id || !followUpId) {
      res.status(400).json({ error: 'Decision ID and Follow-Up ID required' });
      return;
    }

    if (resultScore !== undefined && (resultScore < 0 || resultScore > 100)) {
      res.status(400).json({ error: 'resultScore must be 0-100' });
      return;
    }

    const supabase = getSupabaseClient();

    // Fetch decision
    const { data: decisions, error: fetchError } = await supabase
      .from('decisions')
      .select('*')
      .eq('id', id);

    if (fetchError || !decisions || decisions.length === 0) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }

    const decision = decisions[0] as Decision;

    // Update follow-up
    const updatedFollowUps = decision.followUps.map((f) => {
      if (f.id === followUpId) {
        return {
          ...f,
          completed: true,
          completedAt: new Date().toISOString(),
          reflection: reflection || undefined,
          resultScore: resultScore || undefined,
        };
      }
      return f;
    });

    // Determine new status
    const allCompleted = updatedFollowUps.every((f) => f.completed);
    const newStatus = allCompleted ? 'completed' : 'pending-followup';

    // Calculate success rate if all follow-ups completed
    let successRate: number | undefined;
    if (allCompleted) {
      const scores = updatedFollowUps
        .map((f) => f.resultScore)
        .filter((s) => s !== undefined) as number[];
      if (scores.length > 0) {
        successRate = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }

    // Update decision
    const { data, error } = await supabase
      .from('decisions')
      .update({
        followUps: updatedFollowUps,
        status: newStatus,
        successRate,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error completing follow-up:', error);
      res.status(500).json({ error: 'Failed to complete follow-up' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Follow-up completed',
      decision: data?.[0],
    });
  } catch (err) {
    console.error('Complete follow-up error:', err);
    res.status(500).json({ error: String(err) });
  }
}

/**
 * GET /api/decisions/:id/pending-followups
 * Get pending follow-ups for a decision (due today or earlier)
 */
export async function getPendingFollowUps(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Decision ID required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('id', id);

    if (error || !data || data.length === 0) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }

    const decision = data[0] as Decision;
    const today = new Date().toISOString().split('T')[0];

    const pending = decision.followUps.filter(
      (f) => !f.completed && f.scheduledDate <= today
    );

    res.status(200).json({
      success: true,
      pending,
      decision,
    });
  } catch (err) {
    console.error('Get pending follow-ups error:', err);
    res.status(500).json({ error: String(err) });
  }
}
