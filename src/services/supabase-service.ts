/**
 * supabase-service.ts
 *
 * บันทึก/ดึง messages จาก Supabase
 */

import { createClient } from '@supabase/supabase-js';

// ตั้งค่า Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase env vars หาย — ดึงข้อมูลจาก localStorage แทน');
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * บันทึก message ไป Supabase
 */
export async function saveMessage(
  userId: string,
  hub: string,
  mood: string,
  role: 'user' | 'assistant',
  content: string,
  autonomyLevel: number = 50
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase ไม่พร้อม — ข้ามการบันทึก');
    return false;
  }

  try {
    const { error } = await supabase.from('chat_messages').insert({
      user_id: userId,
      hub,
      mood,
      role,
      content,
      autonomy_at_time: autonomyLevel,
    });

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Save message error:', err);
    return false;
  }
}

/**
 * ดึง chat history ของผู้ใช้
 */
export async function getChatHistory(userId: string, hub?: string, limit: number = 50) {
  if (!supabase) {
    console.warn('Supabase ไม่พร้อม');
    return [];
  }

  try {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (hub) {
      query = query.eq('hub', hub);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    return data?.reverse() || [];
  } catch (err) {
    console.error('Get history error:', err);
    return [];
  }
}

/**
 * บันทึก insight ของผู้ใช้
 */
export async function saveInsight(
  userId: string,
  hub: string,
  insightText: string,
  confidence: number = 0.5
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase ไม่พร้อม');
    return false;
  }

  try {
    const { error } = await supabase.from('user_insights').insert({
      user_id: userId,
      hub,
      insight_text: insightText,
      confidence,
    });

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Save insight error:', err);
    return false;
  }
}

/**
 * บันทึก decision ไป decision log
 */
export async function saveDecision(
  userId: string,
  hub: string,
  decisionText: string,
  context?: string
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase ไม่พร้อม');
    return false;
  }

  try {
    const { error } = await supabase.from('decision_log').insert({
      user_id: userId,
      hub,
      decision_text: decisionText,
      context,
    });

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Save decision error:', err);
    return false;
  }
}

// saveAutonomyLog() (client-side, direct decision_log insert) เคยอยู่ตรงนี้
// — ลบแล้ว 2026-08-09 เพราะย้ายไปเขียนผ่าน /api/autonomy-log แทน (server-side,
// verify JWT ก่อนเขียนเสมอ ปิดช่องโหว่ trust-client-user_id เดิม) ดู
// src/features/chat/hooks/useChat.ts + api/autonomy-log.ts

/**
 * Phase 7: ดึง dashboard insights (stats)
 */
export async function getDashboardInsights(userId: string) {
  if (!supabase) {
    console.warn('Supabase ไม่พร้อม');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('decision_log')
      .select('autonomy_level, confidence, hub, mood, response_time_ms')
      .eq('user_id', userId);

    if (error) {
      console.error('Get insights error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        totalInteractions: 0,
        avgAutonomy: 0,
        avgConfidence: 0,
        topHub: null,
        topMood: null,
        avgResponseTime: 0,
      };
    }

    // Calculate stats
    const totalInteractions = data.length;
    const avgAutonomy = Math.round(
      data.reduce((sum, item) => sum + item.autonomy_level, 0) / data.length
    );
    const avgConfidence = (
      data.reduce((sum, item) => sum + item.confidence, 0) / data.length
    ).toFixed(2);
    const avgResponseTime = Math.round(
      data.reduce((sum, item) => sum + (item.response_time_ms || 0), 0) / data.length
    );

    // Top hub
    const hubCounts: Record<string, number> = {};
    data.forEach((item) => {
      hubCounts[item.hub] = (hubCounts[item.hub] || 0) + 1;
    });
    const topHub = Object.entries(hubCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Top mood
    const moodCounts: Record<string, number> = {};
    data.forEach((item) => {
      moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1;
    });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      totalInteractions,
      avgAutonomy,
      avgConfidence: parseFloat(avgConfidence),
      topHub,
      topMood,
      avgResponseTime,
    };
  } catch (err) {
    console.error('Dashboard insights error:', err);
    return null;
  }
}

/**
 * Phase 7: ดึง decision logs พร้อม filters
 */
export async function getDecisionLogs(
  userId: string,
  hub?: string,
  mood?: string,
  startDate?: string,
  endDate?: string,
  limit: number = 50
) {
  if (!supabase) {
    console.warn('Supabase ไม่พร้อม');
    return [];
  }

  try {
    let query = supabase
      .from('decision_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (hub) {
      query = query.eq('hub', hub);
    }
    if (mood) {
      query = query.eq('mood', mood);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get decision logs error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Decision logs error:', err);
    return [];
  }
}

/**
 * Phase 7: ดึง autonomy trend data (สำหรับ chart)
 * Phase 5.4+: เพิ่ม hub/mood เข้า select ด้วย — ใช้ทำ mood/hub-specific
 * correlation ใน patternDetection.ts (เดิมมีแค่ created_at/autonomy_level/
 * confidence ไม่พอให้ detectPatterns() แยกกลุ่มตาม mood/hub ได้)
 */
export async function getAutonomyTrend(userId: string) {
  if (!supabase) {
    console.warn('Supabase ไม่พร้อม');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('decision_log')
      .select('created_at, autonomy_level, confidence, hub, mood')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get trend error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Autonomy trend error:', err);
    return [];
  }
}

/**
 * Phase 7: Export decision logs as CSV or JSON
 */
export async function exportDecisionLogs(userId: string, format: 'csv' | 'json') {
  if (!supabase) {
    console.warn('Supabase ไม่พร้อม');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('decision_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Export error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    if (format === 'csv') {
      return convertToCSV(data);
    } else {
      return JSON.stringify(data, null, 2);
    }
  } catch (err) {
    console.error('Export decision logs error:', err);
    return null;
  }
}

/**
 * Helper: Convert array of objects to CSV string
 */
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
      })
      .join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}
