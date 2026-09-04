/**
 * ContinuousImprovementService.ts
 * Phase F: Continuous Improvement Actions
 */

import { supabase } from './supabase-service';
import type {
  ImprovementAction,
  ImprovementImpact,
  TwinPromptUpdate,
  Severity,
} from '../types/feedback';

const VALID_IMPROVEMENT_AREAS = [
  'response_length',
  'accuracy',
  'relevance',
  'tone',
  'specificity',
  'depth',
];

/**
 * Process improvement action from feedback
 */
export async function processImprovementAction(params: {
  feedbackId: string;
  improvementArea: string;
  severity: Severity;
  description: string;
}): Promise<ImprovementAction> {
  if (!VALID_IMPROVEMENT_AREAS.includes(params.improvementArea)) {
    throw new Error('Invalid improvement area');
  }

  if (!supabase) {
    throw new Error('Database connection unavailable');
  }

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('improvement_actions')
      .insert({
        feedback_id: params.feedbackId,
        improvement_area: params.improvementArea,
        severity: params.severity,
        description: params.description,
        status: 'pending',
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create improvement: ${error.message}`);
    }

    return {
      id: data.id,
      feedbackId: data.feedback_id,
      improvementArea: data.improvement_area,
      severity: data.severity,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Get pending improvements for Twin
 */
export async function getPendingImprovements(): Promise<ImprovementAction[]> {
  if (!supabase) {
    return [];
  }

  try {
    // REALBUG-001 FIX (4 ก.ย. 2026): เดิมใช้ .order('severity', { ascending: false })
    // แต่คอลัมน์ severity เป็น **TEXT** ไม่ใช่ enum
    // (migrations/001_feedback_tables.sql:46 — CHECK IN ('low','medium','high'))
    // Postgres จึงเรียงตามตัวอักษรแบบ descending = medium > low > high
    // → เรื่องที่ "รุนแรงที่สุด" ไปอยู่ท้ายสุด ตรงข้ามกับเจตนาของฟังก์ชันนี้ทั้งหมด
    //
    // แก้ที่ฝั่ง client แทนการเปลี่ยน schema (ตาราง improvement_actions อยู่ใน
    // โฟลเดอร์ migrations/ ที่ CLI ไม่เคย apply — ดู DB-01 ในไฟล์ forensic
    // ยังไม่ควรพึ่งว่ามีอยู่จริงบน production)
    const { data, error } = await supabase
      .from('improvement_actions')
      .select('*')
      .eq('status', 'pending');

    if (error || !data) {
      return [];
    }

    const SEVERITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };
    data.sort(
      (a, b) =>
        (SEVERITY_RANK[String((b as { severity?: string }).severity)] ?? 0) -
        (SEVERITY_RANK[String((a as { severity?: string }).severity)] ?? 0)
    );

    return data.map(action => ({
      id: action.id,
      feedbackId: action.feedback_id,
      improvementArea: action.improvement_area,
      severity: action.severity,
      description: action.description,
      status: action.status,
      createdAt: action.created_at,
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Apply improvement action
 */
export async function applyImprovement(improvementId: string): Promise<ImprovementAction> {
  if (!supabase) {
    throw new Error('Database connection unavailable');
  }

  try {
    const { data, error } = await supabase
      .from('improvement_actions')
      .update({
        status: 'applied',
        applied_at: new Date().toISOString(),
      })
      .eq('id', improvementId)
      .select()
      .single();

    if (error) {
      throw new Error('Improvement not found');
    }

    return {
      id: data.id,
      feedbackId: data.feedback_id,
      improvementArea: data.improvement_area,
      severity: data.severity,
      description: data.description,
      status: data.status,
      appliedAt: data.applied_at,
      createdAt: data.created_at,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Get improvement impact
 */
export async function getImprovementImpact(
  days: number = 7
): Promise<ImprovementImpact> {
  if (!supabase) {
    return {
      totalImprovementsApplied: 0,
      averageQualityIncrease: 0,
      areaImpact: {},
      successRate: 0,
    };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('improvement_actions')
      .select('*')
      .eq('status', 'applied')
      .gte('applied_at', startDate.toISOString());

    if (error || !data || data.length === 0) {
      return {
        totalImprovementsApplied: 0,
        averageQualityIncrease: 0,
        areaImpact: {},
        successRate: 0,
      };
    }

    const areaImpact: Record<string, { applied: number; avgIncrease: number }> = {};
    let totalIncrease = 0;

    for (const action of data) {
      if (!areaImpact[action.improvement_area]) {
        areaImpact[action.improvement_area] = { applied: 0, avgIncrease: 0 };
      }
      areaImpact[action.improvement_area].applied++;

      const increase = action.metrics_after_change?.quality || 0 -
        (action.metrics_before_change?.quality || 0);
      areaImpact[action.improvement_area].avgIncrease += increase;
      totalIncrease += increase;
    }

    for (const area in areaImpact) {
      areaImpact[area].avgIncrease /= areaImpact[area].applied || 1;
    }

    return {
      totalImprovementsApplied: data.length,
      averageQualityIncrease: data.length > 0 ? totalIncrease / data.length : 0,
      areaImpact,
      successRate: data.length > 0 ? (data.filter(a => a.metrics_after_change?.quality > a.metrics_before_change?.quality).length / data.length) * 100 : 0,
    };
  } catch (err) {
    return {
      totalImprovementsApplied: 0,
      averageQualityIncrease: 0,
      areaImpact: {},
      successRate: 0,
    };
  }
}

/**
 * Update Twin prompt based on improvements
 */
export async function updateTwinPrompt(
  twinId: string,
  improvementArea: string,
  changes: Record<string, unknown>
): Promise<TwinPromptUpdate> {
  if (!supabase) {
    throw new Error('Database connection unavailable');
  }

  try {
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from('twin_prompt_updates')
      .select('version')
      .eq('twin_id', twinId)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (existing?.[0]?.version || 0) + 1;

    const { data, error } = await supabase
      .from('twin_prompt_updates')
      .insert({
        twin_id: twinId,
        version: nextVersion,
        improvement_area: improvementArea,
        changes,
        applied_at: now,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update prompt: ${error.message}`);
    }

    return {
      id: data.id,
      twinId: data.twin_id,
      version: data.version,
      changes: data.changes,
      appliedAt: data.applied_at,
      createdAt: data.created_at,
    };
  } catch (err) {
    throw err;
  }
}
