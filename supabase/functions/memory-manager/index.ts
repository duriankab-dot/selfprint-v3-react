/**
 * Supabase Edge Function: memory-manager
 *
 * CRUD สำหรับ personal_memory table
 * Auth required — JWT from Supabase Auth
 *
 * @route POST /functions/v1/memory-manager
 * Body: { action, ...payload }
 *
 * Actions:
 *   list   - GET all memories for user (+ optional filter by memory_type)
 *   add    - INSERT new memory
 *   update - UPDATE memory by id
 *   delete - DELETE memory by id
 *   clear  - DELETE all memories for user (requires confirm: true)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

type MemoryType = 'small_win' | 'important_moment' | 'discovery' | 'personal';

interface MemoryRow {
  id?: string;
  user_id: string;
  memory_type: MemoryType;
  title: string;
  content: string;
  confidence?: number;
  tags?: string[];
}

interface RequestBody {
  action: 'list' | 'add' | 'update' | 'delete' | 'clear';
  // list
  memory_type?: MemoryType;
  limit?: number;
  // add
  title?: string;
  content?: string;
  memory_type_value?: MemoryType;
  confidence?: number;
  tags?: string[];
  // update
  id?: string;
  updates?: Partial<Omit<MemoryRow, 'id' | 'user_id'>>;
  // clear
  confirm?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return json({ error: 'Supabase not configured' }, 500);
  }

  // Auth: verify JWT from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);

  // Create user-scoped client to verify JWT
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

  // Use service role for actual DB ops (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceKey);
  const userId = user.id;

  try {
    const body = await req.json() as RequestBody;

    switch (body.action) {
      case 'list': {
        let query = supabase
          .from('personal_memory')
          .select('id, memory_type, title, content, confidence, tags, created_at, updated_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (body.memory_type) {
          query = query.eq('memory_type', body.memory_type);
        }
        if (body.limit) {
          query = query.limit(body.limit);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return json({ success: true, memories: data || [] });
      }

      case 'add': {
        if (!body.title || !body.content) {
          return json({ error: 'title and content required' }, 400);
        }
        const memType = body.memory_type_value || body.memory_type || 'personal';
        const validTypes: MemoryType[] = ['small_win', 'important_moment', 'discovery', 'personal'];
        if (!validTypes.includes(memType)) {
          return json({ error: `memory_type must be one of: ${validTypes.join(', ')}` }, 400);
        }

        const { data, error } = await supabase
          .from('personal_memory')
          .insert({
            user_id: userId,
            memory_type: memType,
            title: body.title.slice(0, 200),
            content: body.content.slice(0, 2000),
            confidence: Math.min(1, Math.max(0, body.confidence ?? 0.8)),
            tags: body.tags || [],
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        return json({ success: true, memory: data });
      }

      case 'update': {
        if (!body.id) return json({ error: 'id required' }, 400);
        if (!body.updates || Object.keys(body.updates).length === 0) {
          return json({ error: 'updates required' }, 400);
        }

        // Sanitize updates — only allow certain fields
        const allowed = ['memory_type', 'title', 'content', 'confidence', 'tags'] as const;
        const safeUpdates: Partial<MemoryRow> = {};
        for (const key of allowed) {
          if (key in (body.updates as object)) {
            (safeUpdates as Record<string, unknown>)[key] = (body.updates as Record<string, unknown>)[key];
          }
        }

        const { data, error } = await supabase
          .from('personal_memory')
          .update({ ...safeUpdates, updated_at: new Date().toISOString() })
          .eq('id', body.id)
          .eq('user_id', userId) // Security: ensure user owns this memory
          .select()
          .single();

        if (error) throw new Error(error.message);
        if (!data) return json({ error: 'Memory not found or not owned by user' }, 404);
        return json({ success: true, memory: data });
      }

      case 'delete': {
        if (!body.id) return json({ error: 'id required' }, 400);

        const { error } = await supabase
          .from('personal_memory')
          .delete()
          .eq('id', body.id)
          .eq('user_id', userId);

        if (error) throw new Error(error.message);
        return json({ success: true, deleted: body.id });
      }

      case 'clear': {
        if (!body.confirm) {
          return json({ error: 'Set confirm: true to delete all memories' }, 400);
        }

        const { count, error } = await supabase
          .from('personal_memory')
          .delete()
          .eq('user_id', userId)
          .select('id', { count: 'exact', head: true });

        if (error) throw new Error(error.message);
        return json({ success: true, deleted: count || 0 });
      }

      default:
        return json({ error: 'Unknown action. Valid: list, add, update, delete, clear' }, 400);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[memory-manager]', msg);
    return json({ error: msg }, 500);
  }
});
