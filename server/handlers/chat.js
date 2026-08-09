/**
 * ============================================
 * Brain Gateway - Chat Handler
 * ============================================
 *
 * File: astrovera-v2/functions/chat.js
 * Date: 2026-08-08
 * Phase: Phase 3 Integration
 * Purpose: Handle POST /api/chat requests with system prompt injection
 * Status: PRODUCTION
 *
 * KEY FEATURE: Optional `system` parameter for Nova personality injection
 *
 * Request:
 * {
 *   "messages": [{"role": "user", "content": "Hello"}],
 *   "system": "You are Nova...",  ← NEW: System prompt for personalization
 *   "model": "claude-3-5-sonnet-20241022",
 *   "temperature": 0.7
 * }
 *
 * Response: Claude API response (personalized if system prompt provided)
 * ============================================
 */

// Rate limit tracking (in-memory for single instance, use Redis for production)
const rateLimitMap = new Map();

/**
 * Main handler for Cloudflare Workers / Wrangler
 * Accepts POST /api/chat with optional system parameter
 */
export default {
  async fetch(request, env, _ctx) {
    const startTime = Date.now();

    // ============================================
    // CORS Preflight
    // ============================================
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*', // ตาม convention เดียวกับ api/*.ts ทุกไฟล์ (Vercel) — เดิม hardcode เป็น 'https://selfprint.io' ผิดโดเมนจริง (selfprint.one) แก้ 2026-08-09
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // ============================================
    // Method Validation
    // ============================================
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        message: 'Only POST requests are supported'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // ============================================
      // Parse Request
      // ============================================
      let requestData;
      try {
        requestData = await request.json();
      } catch {
        return new Response(JSON.stringify({
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { messages, model, temperature, system } = requestData;

      // ============================================
      // Validate Required Fields
      // ============================================
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({
          error: 'Invalid request',
          message: 'messages array is required and must not be empty'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // Rate Limiting
      // ============================================
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitKey = `ratelimit:${clientIP}`;
      const now = Date.now();

      let currentCount = rateLimitMap.get(rateLimitKey) || { count: 0, timestamp: now };

      // Reset counter if more than 60 seconds passed
      if (now - currentCount.timestamp > 60000) {
        currentCount = { count: 0, timestamp: now };
      }

      currentCount.count += 1;
      rateLimitMap.set(rateLimitKey, currentCount);

      // Max 100 requests per minute per IP
      if (currentCount.count > 100) {
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Maximum 100 requests per minute allowed',
          retryAfter: 60
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'Access-Control-Allow-Origin': '*', // ตาม convention เดียวกับ api/*.ts ทุกไฟล์ (Vercel) — เดิม hardcode เป็น 'https://selfprint.io' ผิดโดเมนจริง (selfprint.one) แก้ 2026-08-09
          },
        });
      }

      // ============================================
      // Build Claude API Request
      // ============================================
      const claudeRequest = {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        temperature: temperature || 0.7,
        messages: messages,
      };

      // 🔑 CRITICAL: Add optional system parameter for Nova personalization
      let hasSystemPrompt = false;
      if (system && typeof system === 'string' && system.trim().length > 0) {
        claudeRequest.system = system;
        hasSystemPrompt = true;
        console.log(`[Brain Gateway] System prompt injected (length: ${system.length})`);
      }

      // ============================================
      // Call Claude API
      // ============================================
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(claudeRequest),
      });

      // ============================================
      // Handle Claude API Errors
      // ============================================
      if (!claudeResponse.ok) {
        const errorData = await claudeResponse.json();
        console.error('[Brain Gateway] Claude API error:', {
          status: claudeResponse.status,
          error: errorData,
          clientIP,
          hasSystem: hasSystemPrompt,
        });

        return new Response(JSON.stringify({
          error: 'Claude API error',
          message: errorData.message || 'Unknown error',
          type: errorData.type,
        }), {
          status: claudeResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // ตาม convention เดียวกับ api/*.ts ทุกไฟล์ (Vercel) — เดิม hardcode เป็น 'https://selfprint.io' ผิดโดเมนจริง (selfprint.one) แก้ 2026-08-09
          },
        });
      }

      // ============================================
      // Parse Claude Response
      // ============================================
      const responseData = await claudeResponse.json();

      const duration = Date.now() - startTime;
      console.log(`[Brain Gateway] Success in ${duration}ms`, {
        clientIP,
        model: claudeRequest.model,
        hasSystem: hasSystemPrompt,
        inputTokens: responseData.usage?.input_tokens || 0,
        outputTokens: responseData.usage?.output_tokens || 0,
      });

      // ============================================
      // Return Response
      // ============================================
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // ตาม convention เดียวกับ api/*.ts ทุกไฟล์ (Vercel) — เดิม hardcode เป็น 'https://selfprint.io' ผิดโดเมนจริง (selfprint.one) แก้ 2026-08-09
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Response-Time': `${duration}ms`,
        },
      });

    } catch (error) {
      console.error('[Brain Gateway] Unexpected error:', {
        message: error.message,
        stack: error.stack,
      });

      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // ตาม convention เดียวกับ api/*.ts ทุกไฟล์ (Vercel) — เดิม hardcode เป็น 'https://selfprint.io' ผิดโดเมนจริง (selfprint.one) แก้ 2026-08-09
        },
      });
    }
  },
};

// ============================================
// MONITORING FUNCTIONS (Optional)
// ============================================

/**
 * Get current rate limit stats
 * Debug endpoint: GET /api/gateway-stats
 */
export async function getStats() {
  const stats = {
    timestamp: new Date().toISOString(),
    rateLimitEntries: rateLimitMap.size,
    entries: Array.from(rateLimitMap.entries()).map(([key, value]) => ({
      ip: key,
      requests: value.count,
      age: Date.now() - value.timestamp,
    })),
  };
  return stats;
}

/**
 * Clear old rate limit entries (cleanup every hour)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.timestamp > 3600000) { // older than 1 hour
      rateLimitMap.delete(key);
      cleaned++;
    }
  }

  console.log(`[Brain Gateway] Cleanup: removed ${cleaned} expired rate limit entries`);
}
