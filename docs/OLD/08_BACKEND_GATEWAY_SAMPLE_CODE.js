/**
 * ============================================
 * Brain Gateway Sample Implementation
 * ============================================
 *
 * Date: 2026-08-07
 * Phase: Phase 3 Integration
 * Purpose: Reference code for Brain Gateway system parameter injection
 * Target: Astrovera v2 backend (Cloudflare Workers / Wrangler)
 * Status: REFERENCE IMPLEMENTATION
 *
 * Use this as a guide for implementing the `system` parameter
 * in POST /api/chat endpoint to support Nova system prompt injection.
 *
 * ============================================
 */

// ============================================
// OPTION 1: Cloudflare Workers (Wrangler)
// ============================================
// File: astrovera-v2/functions/chat.js
// Environment: Cloudflare Workers KV

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://selfprint.io',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Parse request body
      const requestData = await request.json();
      const { messages, model, temperature, system } = requestData;

      // Validate required fields
      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: 'Invalid request: messages array required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Build Claude API request
      const claudeRequest = {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        temperature: temperature || 0.7,
        messages: messages,
      };

      // 🔑 KEY CHANGE: Add optional system parameter
      if (system && typeof system === 'string') {
        claudeRequest.system = system;
        console.log(`[Brain Gateway] System prompt injected (length: ${system.length})`);
      }

      // Add rate limiting check (if using KV)
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitKey = `ratelimit:${clientIP}`;
      const currentCount = await env.SELFPRINT_KV.get(rateLimitKey, { type: 'json' }) || { count: 0, timestamp: Date.now() };

      const now = Date.now();
      const timeDiff = now - currentCount.timestamp;

      // Reset if more than 60 seconds have passed
      if (timeDiff > 60000) {
        currentCount.count = 0;
        currentCount.timestamp = now;
      }

      currentCount.count += 1;

      // Allow max 100 requests per minute per IP
      if (currentCount.count > 100) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded (max 100 req/min)' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Store updated count in KV
      await env.SELFPRINT_KV.put(rateLimitKey, JSON.stringify(currentCount), { expirationTtl: 120 });

      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(claudeRequest),
      });

      // Handle Claude API errors
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Brain Gateway] Claude API error:', errorData);
        return new Response(
          JSON.stringify({ error: 'Claude API error', details: errorData }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Parse Claude response
      const claudeResponse = await response.json();

      // Log successful request (for monitoring)
      console.log(`[Brain Gateway] Success - IP: ${clientIP}, Model: ${claudeRequest.model}, System: ${system ? 'YES' : 'NO'}`);

      // Return response to client
      return new Response(JSON.stringify(claudeResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://selfprint.io',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });

    } catch (error) {
      console.error('[Brain Gateway] Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', message: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};

// ============================================
// OPTION 2: Express.js Backend (Node.js)
// ============================================
// File: astrovera-v2/src/routes/chat.js
// Environment: Node.js + Express

const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiter middleware
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max 100 requests per minute per IP
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * POST /api/chat
 *
 * Request body:
 * {
 *   "messages": [
 *     { "role": "user", "content": "Hello" }
 *   ],
 *   "model": "claude-3-5-sonnet-20241022",
 *   "temperature": 0.7,
 *   "system": "Optional: You are Nova, an AI Twin..."
 * }
 *
 * Response:
 * {
 *   "id": "msg_...",
 *   "content": [
 *     { "type": "text", "text": "Response from Nova..." }
 *   ],
 *   "usage": { "input_tokens": 150, "output_tokens": 200 }
 * }
 */
router.post('/chat', chatLimiter, async (req, res) => {
  try {
    const { messages, model, temperature, system } = req.body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request: messages array required',
      });
    }

    // Build Claude API request
    const claudeRequest = {
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      temperature: temperature || 0.7,
      messages: messages,
    };

    // 🔑 KEY CHANGE: Add optional system parameter
    if (system && typeof system === 'string') {
      claudeRequest.system = system;
      console.log(`[Brain Gateway] System prompt injected (length: ${system.length})`);
    }

    // Call Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      claudeRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        timeout: 15000, // 15 second timeout
      }
    );

    // Log successful request
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log(
      `[Brain Gateway] Success - IP: ${clientIP}, Model: ${claudeRequest.model}, System: ${system ? 'YES' : 'NO'}`
    );

    // Return response to client
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('[Brain Gateway] Error:', error.message);

    // Handle specific Claude API errors
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Claude API error',
        details: error.response.data,
      });
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Gateway timeout',
        message: 'Claude API request took too long',
      });
    }

    // Generic error
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

module.exports = router;

// ============================================
// OPTION 3: FastAPI (Python Backend)
// ============================================
// File: astrovera-v2/routes/chat.py

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
import logging

app = FastAPI()
logger = logging.getLogger(__name__)

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = "claude-3-5-sonnet-20241022"
    temperature: Optional[float] = 0.7
    system: Optional[str] = None  # 🔑 NEW: Optional system prompt

class ChatResponse(BaseModel):
    id: str
    content: List[dict]
    usage: dict

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, http_request: Request):
    """
    POST /api/chat

    Accepts optional `system` parameter for Nova system prompt injection.
    """
    try:
        # Validate messages
        if not request.messages:
            raise HTTPException(
                status_code=400,
                detail="messages array required"
            )

        # Build Claude API request
        claude_request = {
            "model": request.model,
            "max_tokens": 2048,
            "temperature": request.temperature,
            "messages": [msg.dict() for msg in request.messages],
        }

        # 🔑 KEY CHANGE: Add optional system parameter
        if request.system:
            claude_request["system"] = request.system
            logger.info(f"[Brain Gateway] System prompt injected (length: {len(request.system)})")

        # Get client IP
        client_ip = http_request.client.host

        # Call Claude API via httpx
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                json=claude_request,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": os.getenv("CLAUDE_API_KEY"),
                    "anthropic-version": "2023-06-01",
                },
            )

        # Handle Claude API errors
        if response.status_code != 200:
            logger.error(f"[Brain Gateway] Claude error: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Claude API error: {response.json()}"
            )

        # Log successful request
        logger.info(
            f"[Brain Gateway] Success - IP: {client_ip}, Model: {request.model}, System: {'YES' if request.system else 'NO'}"
        )

        return response.json()

    except httpx.TimeoutException:
        logger.error("[Brain Gateway] Request timeout")
        raise HTTPException(
            status_code=504,
            detail="Gateway timeout - Claude API took too long"
        )
    except Exception as error:
        logger.error(f"[Brain Gateway] Error: {str(error)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(error)}"
        )

# ============================================
// TEST EXAMPLES
// ============================================

/*
TEST 1: cURL - Basic Request (No System)
-----------------------------------------
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, who are you?"}
    ]
  }'

Expected Response:
{
  "id": "msg_...",
  "content": [
    {"type": "text", "text": "I am Claude, an AI assistant..."}
  ],
  "usage": {"input_tokens": 20, "output_tokens": 45}
}

---

TEST 2: cURL - With Nova System Prompt (IMPORTANT TEST)
-------------------------------------------------------
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Tell me about myself."}
    ],
    "system": "You are Nova, an AI Twin personality based on birth data. Hub: EXPLORER, Mood: ADVENTUROUS, Archetype: THE_SEEKER. Respond as if you are this unique twin personality."
  }'

Expected Response:
{
  "id": "msg_...",
  "content": [
    {"type": "text", "text": "As your EXPLORER Twin with an ADVENTUROUS spirit, I see the world as a place of endless discovery..."}
  ],
  "usage": {"input_tokens": 250, "output_tokens": 180}
}

---

TEST 3: JavaScript / Fetch API
-------------------------------
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'What is my personality type?' }
    ],
    system: 'You are Nova, Hub: DREAMER, Mood: THOUGHTFUL, Archetype: THE_PHILOSOPHER'
  })
});

const data = await response.json();
console.log(data.content[0].text);

---

TEST 4: Python / requests
-------------------------
import requests

response = requests.post(
  'http://localhost:3000/api/chat',
  json={
    'messages': [
      {'role': 'user', 'content': 'Describe my strengths.'}
    ],
    'system': 'You are Nova, Hub: LEADER, Mood: CONFIDENT, Archetype: THE_COMMANDER'
  }
)

print(response.json()['content'][0]['text'])
*/

// ============================================
// DEPLOYMENT VERIFICATION
// ============================================

/*
After implementing system parameter, verify with:

1. Check if system parameter is accepted:
   curl -X POST https://brain.astrovera.dev/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "Hi"}], "system": "test"}'

   Should NOT return 400 "unexpected field" error.

2. Check if system prompt affects response:
   - Send same message WITHOUT system → generic response
   - Send same message WITH system → personalized response
   - Verify personalization matches system prompt

3. Check error handling:
   - Invalid system (not string) → should reject or ignore
   - Very long system (>10k chars) → should handle gracefully
   - Empty system string → should ignore

4. Check rate limiting:
   - Send 101 requests in 60 seconds → should return 429
   - Wait 60+ seconds → should reset

5. Performance test:
   - System prompt should NOT add >100ms latency
   - Check Claude API response time in logs
*/

// ============================================
// MONITORING & LOGGING
// ============================================

/*
Key metrics to monitor post-deployment:

1. System Prompt Usage:
   - Count requests WITH system parameter
   - Count requests WITHOUT system parameter
   - Track system prompt lengths (histogram)

2. Error Rates:
   - Invalid system parameter errors (should be 0)
   - Claude API errors (should be <1%)
   - Timeout errors (should be <0.1%)

3. Performance:
   - API response time (p50, p95, p99)
   - Request queue depth
   - Rate limit hits per hour

4. User Impact:
   - Tracks how many twins created per day
   - Average Twin accuracy score
   - User retention (7-day, 30-day)

Alert if:
- Error rate > 5%
- Response time p95 > 5 seconds
- Rate limit hits > 100/hour
- Claude API key invalid (recurring 401 errors)
*/

// ============================================
// END OF SAMPLE CODE
// ============================================
