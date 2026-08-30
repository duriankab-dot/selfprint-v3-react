/**
 * CommunityService.ts
 * Phase B.1: Community Insight Feed
 *
 * Supabase operations for community_insights + community_insight_likes.
 * Privacy note: content is always a user-WRITTEN excerpt, never an
 * automatic dump of Blueprint/SICE data (blind_spots, decision_style,
 * etc). See supabase/migrations/033_community_insights.sql for the
 * data-minimization rationale.
 */

import { supabase } from './supabase-service';

export class CommunityServiceError extends Error {
  cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'CommunityServiceError';
    this.cause = cause;
  }
}

export interface CommunityInsight {
  id: string;
  userId: string;
  content: string;
  world: string | null;
  displayName: string;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  isOwner: boolean;
}

const MIN_LEN = 10;
const MAX_LEN = 500;

/** Validate content length client-side before hitting the DB CHECK constraint. */
export function validateInsightContent(content: string): string | null {
  const trimmed = content.trim();
  if (trimmed.length < MIN_LEN) return `ข้อความสั้นเกินไป (อย่างน้อย ${MIN_LEN} ตัวอักษร)`;
  if (trimmed.length > MAX_LEN) return `ข้อความยาวเกินไป (ไม่เกิน ${MAX_LEN} ตัวอักษร)`;
  return null;
}

/**
 * Post a new insight to the community feed.
 */
export async function shareInsight(
  userId: string,
  content: string,
  options?: { world?: string; displayName?: string }
): Promise<{ success: boolean; insightId?: string; message: string }> {
  if (!userId || !supabase) {
    return { success: false, message: 'ต้องเข้าสู่ระบบก่อนแบ่งปัน' };
  }

  const validationError = validateInsightContent(content);
  if (validationError) {
    return { success: false, message: validationError };
  }

  try {
    const { data, error } = await supabase
      .from('community_insights')
      .insert({
        user_id: userId,
        content: content.trim(),
        world: options?.world ?? null,
        display_name: options?.displayName?.trim() || 'Anonymous Twin',
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new CommunityServiceError('Failed to post insight', error);
    }

    return { success: true, insightId: data.id, message: 'แบ่งปันสำเร็จ ✨' };
  } catch (err) {
    console.error('[CommunityService] shareInsight error:', err);
    return { success: false, message: 'แบ่งปันไม่สำเร็จ ลองอีกครั้งภายหลัง' };
  }
}

/**
 * Fetch the public feed, newest first, with per-insight like count and
 * whether the current viewer has already liked it.
 */
export async function getFeed(
  currentUserId: string | null,
  limit: number = 20
): Promise<CommunityInsight[]> {
  if (!supabase) return [];

  try {
    const { data: insights, error } = await supabase
      .from('community_insights')
      .select('id, user_id, content, world, display_name, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !insights) {
      console.error('[CommunityService] getFeed error:', error);
      return [];
    }
    if (insights.length === 0) return [];

    const insightIds = insights.map((i) => i.id);
    const { data: likes } = await supabase
      .from('community_insight_likes')
      .select('insight_id, user_id')
      .in('insight_id', insightIds);

    const likeCounts = new Map<string, number>();
    const likedByMeSet = new Set<string>();
    for (const like of likes ?? []) {
      likeCounts.set(like.insight_id, (likeCounts.get(like.insight_id) ?? 0) + 1);
      if (currentUserId && like.user_id === currentUserId) {
        likedByMeSet.add(like.insight_id);
      }
    }

    return insights.map((row) => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      world: row.world,
      displayName: row.display_name,
      createdAt: row.created_at,
      likeCount: likeCounts.get(row.id) ?? 0,
      likedByMe: likedByMeSet.has(row.id),
      isOwner: row.user_id === currentUserId,
    }));
  } catch (err) {
    console.error('[CommunityService] getFeed error:', err);
    return [];
  }
}

/**
 * Toggle a like on an insight for the current user.
 * Returns the new liked state, or null on failure.
 */
export async function toggleLike(
  insightId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<boolean | null> {
  if (!userId || !supabase) return null;

  try {
    if (currentlyLiked) {
      const { error } = await supabase
        .from('community_insight_likes')
        .delete()
        .eq('insight_id', insightId)
        .eq('user_id', userId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from('community_insight_likes')
        .insert({ insight_id: insightId, user_id: userId });
      if (error) throw error;
      return true;
    }
  } catch (err) {
    console.error('[CommunityService] toggleLike error:', err);
    return null;
  }
}

/**
 * Delete an insight (owner only — enforced by RLS regardless of this check).
 */
export async function deleteInsight(insightId: string, userId: string): Promise<boolean> {
  if (!userId || !supabase) return false;

  try {
    const { error } = await supabase
      .from('community_insights')
      .delete()
      .eq('id', insightId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[CommunityService] deleteInsight error:', err);
    return false;
  }
}
