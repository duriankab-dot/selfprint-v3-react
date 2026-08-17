/**
 * Production Backend Server
 * Express + TypeScript
 *
 * Handles:
 * - POST /api/intelligence (Astrovera Psychology via Claude)
 * - POST /api/decisions (Decision Logging)
 * - GET /api/decisions (Fetch Decision History)
 * - DELETE /api/decisions (Delete Decision)
 * - POST /api/push (Web Push subscriptions)
 * - DELETE /api/push (Unsubscribe Web Push)
 * - POST /api/auth/* (Passkey auth via Supabase)
 * - GET /health (Health Check)
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  buildAnalysisRequest,
  safeTransformAnalysisResponse,
  buildFallbackResponse,
} from '../src/lib/astrovera-adapter';
import type { AnalysisRequest, AnalysisResponse } from '../src/lib/types/astrovera';
import { buildPrompt, validate } from '../src/lib/astrovera-brain/psychology/index';
import { safetyCheck, SAFETY_SYSTEM_DIRECTIVE } from './middleware/safety';
import * as decisions from '../api/decisions';
// ✅ P0-B SECURITY MIDDLEWARE
import { configureSecurityMiddleware, applyAuth, applyOwnershipCheck } from './middleware/security-config';
import { validateDecisionData, validateUserId } from './middleware/validate';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────

// ✅ P0-B SECURITY: Configure security middleware FIRST
configureSecurityMiddleware(app);

// Standard middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb' }));

// ─── Clients ──────────────────────────────────────────────────────────────

function getAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// ─── /api/intelligence ────────────────────────────────────────────────────

interface IntelligenceRequestBody {
  mood: string;
  birthDate: string;
  finetuneAnswers?: Record<string, string>;
  question?: string;
}

const MOODS = ['stressed', 'confused', 'confident', 'drained', 'ready', 'reflective'];

function extractJson(raw: string): unknown {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// ✅ P0-B: Protected endpoint (requires authentication)
app.post('/api/intelligence', ...applyAuth(), async (req: Request, res: Response) => {
  try {
    const body: Partial<IntelligenceRequestBody> = req.body || {};

    // Validate
    if (!body.mood || !MOODS.includes(body.mood)) {
      return res.status(400).json({ error: `mood "${body.mood}" ไม่ถูกต้อง` });
    }
    if (!body.birthDate || typeof body.birthDate !== 'string') {
      return res.status(400).json({ error: 'birthDate จำเป็นต้องมี' });
    }

    const analysisRequest: AnalysisRequest = {
      mood: body.mood!,
      birthDate: body.birthDate!,
      finetuneAnswers: body.finetuneAnswers || {},
      question: body.question ?? null,
    };

    // Safety check
    const safety = safetyCheck(analysisRequest.question);
    if (!safety.safe) {
      console.log(`[Intelligence] Safety block: category=${safety.category}`);
      const fallback: AnalysisResponse = buildFallbackResponse(analysisRequest);
      return res.status(200).json(fallback);
    }

    // No API key → fallback
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[Intelligence] ANTHROPIC_API_KEY หาย');
      const fallback: AnalysisResponse = buildFallbackResponse(analysisRequest);
      return res.status(200).json(fallback);
    }

    // Call Claude
    try {
      const psychologyInput = buildAnalysisRequest(analysisRequest);
      const prompt = buildPrompt({ exampleCount: 1 }) + SAFETY_SYSTEM_DIRECTIVE;

      const response = await getAnthropicClient().messages.create({
        model: process.env.CLAUDE_MODEL_ID || 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: prompt,
        messages: [{ role: 'user', content: JSON.stringify(psychologyInput) }],
      });

      const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = extractJson(rawText);

      const schemaCheck = validate(parsed);
      if (!schemaCheck.ok) {
        console.warn('[Intelligence] Claude response ไม่ตรง schema:', schemaCheck.errors);
      }

      const result = safeTransformAnalysisResponse(parsed, analysisRequest);
      return res.status(200).json(result);
    } catch (error) {
      console.error('[Intelligence API Error]', error);
      const fallback: AnalysisResponse = buildFallbackResponse(analysisRequest);
      return res.status(200).json(fallback);
    }
  } catch (error) {
    console.error('[Intelligence] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── /api/decisions ──────────────────────────────────────────────────────

/**
 * Decision API Routes
 * - POST: Save a new decision log
 * - GET: Fetch decision history
 * - DELETE: Delete a decision log
 */
// ✅ P0-B: Protected decision endpoints (requires auth + validation)
app.post('/api/decisions', ...applyAuth(), validateDecisionData, decisions.POST);
app.get('/api/decisions', ...applyAuth(), decisions.GET);
app.delete('/api/decisions', ...applyAuth(), decisions.DELETE);

// ─── /api/decision/trigger-reminders ──────────────────────────────────────

/**
 * Trigger decision follow-up automation
 * POST /api/decision/trigger-reminders
 * Query params:
 *   - userId (optional): Trigger for specific user, or all users if omitted
 *
 * Security: Requires AUTOMATION_SECRET header for production
 */
app.post('/api/decision/trigger-reminders', async (req: Request, res: Response) => {
  try {
    // Verify automation secret (simple auth for scheduled jobs)
    const secret = req.headers['x-automation-secret'] as string;
    const expectedSecret = process.env.AUTOMATION_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      console.warn('[Decision Automation] Unauthorized trigger attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.query.userId as string | undefined;

    // Import automation service
    const { triggerFollowUpAutomation } = await import(
      '../src/services/DecisionAutomationService'
    );

    const result = await triggerFollowUpAutomation(userId);

    if (result.errors.length > 0) {
      console.warn('[Decision Automation] Completed with errors:', result.errors);
    }

    return res.status(200).json({
      success: true,
      message: `Decision follow-up automation triggered`,
      stats: {
        processed: result.processed,
        notified: result.notified,
        errors: result.errors,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Decision Automation] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// ─── /api/push ────────────────────────────────────────────────────────────

interface SubscribeRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UnsubscribeRequest {
  endpoint: string;
}

// ✅ P0-B: Protected push subscription endpoint
app.post('/api/push', ...applyAuth(), async (req: Request, res: Response) => {
  try {
    const body = req.body as SubscribeRequest;

    // Validate
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (typeof body.endpoint !== 'string') {
      return res.status(400).json({ error: 'Invalid endpoint format' });
    }

    if (!/^https?:\/\//.test(body.endpoint)) {
      return res.status(400).json({ error: 'Invalid endpoint URL' });
    }

    // Mock user ID (in production, extract from JWT)
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    const supabase = getSupabaseClient();

    // Upsert subscription
    const { error: upsertError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint: body.endpoint,
          keys_p256dh: body.keys.p256dh,
          keys_auth: body.keys.auth,
          is_active: true,
        },
        {
          onConflict: 'user_id,endpoint',
        }
      );

    if (upsertError) {
      console.error('[PUSH] Upsert error:', upsertError);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription saved',
    });
  } catch (error) {
    console.error('[PUSH] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// ✅ P0-B: Protected push unsubscribe endpoint
app.delete('/api/push', ...applyAuth(), async (req: Request, res: Response) => {
  try {
    const body = req.body as UnsubscribeRequest;

    if (!body.endpoint || typeof body.endpoint !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid endpoint' });
    }

    const userId = req.headers['x-user-id'] as string || 'anonymous';
    const supabase = getSupabaseClient();

    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .match({ user_id: userId, endpoint: body.endpoint });

    if (updateError) {
      console.error('[PUSH] Unsubscribe error:', updateError);
      return res.status(500).json({ error: 'Failed to unsubscribe' });
    }

    return res.status(200).json({
      success: true,
      message: 'Unsubscribed',
    });
  } catch (error) {
    console.error('[PUSH] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`API: http://localhost:${PORT}/api`);
});