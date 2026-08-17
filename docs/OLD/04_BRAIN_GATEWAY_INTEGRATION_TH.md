# 📄 Brain Gateway Integration Specification (Astrovera v2)

**Date:** 2026-08-07  
**Language:** ไทย  
**Phase:** Phase 3 Integration  
**Owner:** Astrovera Backend Team  
**Duration:** 1 day (Aug 8)  
**Status:** BLOCKER - Critical for Phase 3

---

## 🎯 OBJECTIVE

เพิ่ม **optional `system` parameter** ให้กับ Brain Gateway API endpoint เพื่อให้ SelfPrint สามารถส่ง **Nova system prompt** ได้

---

## 🔴 CRITICAL PATH

```
SelfPrint: "ต้องการส่ง system prompt"
  ↓
Brain Gateway: ต้องเพิ่ม system parameter
  ↓ BLOCKER - ต้องแก้ก่อนเนื่อง
Onboarding.tsx: ทำไม่ได้หากไม่มี system prompt
```

**ไม่แก้อันนี้ = Phase 3 + Phase 4 ติดขัด**

---

## 📋 WHAT TO CHANGE

### Current Flow (Before)
```
Client Request:
{
  messages: [...],
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7
}
  ↓
Brain Gateway:
  → Pass to Claude API (NO system prompt)
  ↓
Claude Response: Generic
```

### Target Flow (After)
```
Client Request:
{
  messages: [...],
  system: "You are Nova, an AI Twin...",  ← NEW
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7
}
  ↓
Brain Gateway:
  → Inject system prompt to Claude API
  ↓
Claude Response: Personalized (by hub/mood/archetype)
```

---

## 🔧 IMPLEMENTATION (Wrangler/Workers)

### Current Handler (Example)
```javascript
// functions/chat.js or src/index.js (Wrangler)

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { messages, model = 'claude-3-5-sonnet-20241022', temperature = 0.7 } = await request.json();

    try {
      const response = await fetch('https://api.anthropic.com/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model,
          temperature,
          max_tokens: 1024,
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify({
        text: data.content[0].text,
        tokens: data.usage.input_tokens + data.usage.output_tokens,
        metadata: { model, timestamp: Date.now() }
      }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

### Updated Handler (After)

```javascript
// functions/chat.js or src/index.js (Wrangler)

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { 
      messages, 
      system,  // ← NEW: optional system prompt
      model = 'claude-3-5-sonnet-20241022', 
      temperature = 0.7 
    } = await request.json();

    try {
      // Build Claude request
      const claudeRequest = {
        messages,
        model,
        temperature,
        max_tokens: 1024,
      };

      // NEW: Add system prompt if provided
      if (system) {
        claudeRequest.system = system;
      }

      const response = await fetch('https://api.anthropic.com/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claudeRequest),
      });

      const data = await response.json();
      return new Response(JSON.stringify({
        text: data.content[0].text,
        tokens: data.usage.input_tokens + data.usage.output_tokens,
        metadata: { 
          model, 
          timestamp: Date.now(),
          hasSystemPrompt: !!system  // ← Track if system was used
        }
      }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

### Changes Summary

**ก่อน:**
```javascript
body: JSON.stringify({
  messages,
  model,
  temperature,
  max_tokens: 1024,
}),
```

**หลัง:**
```javascript
const claudeRequest = {
  messages,
  model,
  temperature,
  max_tokens: 1024,
};

if (system) {
  claudeRequest.system = system;
}

body: JSON.stringify(claudeRequest),
```

**Lines changed:** ~10 lines (add if + system param)

---

## 🧪 TESTING CHECKLIST

### Test 1: Backward Compatibility (ไม่มี system)
```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "claude-3-5-sonnet-20241022"
  }'

# Expected: 200 OK, generic Claude response
# Response should have: { text: "...", tokens: N, metadata: { ... } }
```

### Test 2: With System Prompt (Generic)
```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Who are you?"}],
    "system": "You are a helpful assistant named Nova.",
    "model": "claude-3-5-sonnet-20241022"
  }'

# Expected: 200 OK, Nova response
# Response should have: { text: "I am Nova...", tokens: N, metadata: { hasSystemPrompt: true } }
```

### Test 3: With Real Nova Prompt (Identity + Ready)
```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What should I do today?"}],
    "system": "[Full Nova system prompt for identity hub + ready mood]",
    "model": "claude-3-5-sonnet-20241022"
  }'

# Expected: 200 OK, personalized Nova response
# Response should reflect identity hub + ready mood
```

### Test 4: Error Handling (Invalid System)
```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "system": "This is invalid" 
  }'

# Expected: 200 OK or 400 Bad Request
# Should not crash
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Code reviewed by team
- [ ] Tests pass (4 tests above)
- [ ] No console errors
- [ ] Backward compatible (old clients still work)

### Staging Deployment
- [ ] Deploy to staging environment
- [ ] Verify `/health` returns OK
- [ ] Run 4 tests against staging
- [ ] Monitor error rates for 1 hour

### Production Deployment
- [ ] Blue-green deployment (if applicable)
- [ ] Start with 10% traffic
- [ ] Monitor:
  - Response time (< 3s p95)
  - Error rate (< 1%)
  - Token usage (shouldn't spike)
- [ ] Gradual ramp: 10% → 50% → 100%

### Monitoring Setup
```javascript
// Add logging (production)
console.log({
  timestamp: Date.now(),
  method: 'chat',
  hasSystemPrompt: !!system,
  messageCount: messages.length,
  responseTime: Date.now() - startTime,
  tokenCount: data.usage.input_tokens + data.usage.output_tokens,
});
```

---

## 🔄 INTEGRATION WITH SELFPRINT

### Frontend Will Send
```typescript
// selfprintChat.ts (SelfPrint)
const systemPrompt = getNovaPrompt({
  hub: 'identity',
  mood: 'ready',
  archetype: 'strategist',
  maturityScore: 60,
});

const response = await fetch(`${BRAIN_GATEWAY_URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: userQuestion }],
    system: systemPrompt,  // ← Send system prompt
    model: 'claude-3-5-sonnet-20241022',
  }),
});
```

### Expected Response
```json
{
  "text": "Nova's personalized response based on hub/mood/archetype...",
  "tokens": 650,
  "metadata": {
    "model": "claude-3-5-sonnet-20241022",
    "timestamp": 1691234567,
    "hasSystemPrompt": true
  }
}
```

---

## 📊 IMPACT ANALYSIS

### What Changes
- ✅ Brain Gateway API adds optional `system` parameter
- ✅ Backward compatible (system is optional)
- ✅ Minimal code change (~10 lines)

### What Doesn't Change
- ❌ Authentication
- ❌ Rate limiting
- ❌ Response format (adds metadata flag only)
- ❌ Error handling
- ❌ Other endpoints

### Performance Impact
- Minimal (system prompt is just text in request body)
- Token usage increases slightly (system prompt tokens counted)
- Response time: unchanged

---

## ✅ SUCCESS CRITERIA

**Technical:**
- [ ] System parameter accepted
- [ ] System prompt injected to Claude API
- [ ] Responses differ with different system prompts
- [ ] Backward compatible (works without system)
- [ ] Tests pass (4/4)
- [ ] Error handling working
- [ ] Monitoring setup

**Timeline:**
- [ ] Code change: Aug 8, AM
- [ ] Staging deploy: Aug 8, PM
- [ ] Production deploy: Aug 8-9
- [ ] Verified working: Aug 8 EOD

---

## 🚨 ROLLBACK PLAN

**If anything breaks:**

### Immediate (< 5 min)
1. Stop new version / revert to old
2. Route all traffic to old Brain Gateway
3. Verify API responding
4. Page SelfPrint team

### Investigation (< 30 min)
1. Check error logs
2. Identify issue
3. Fix in code
4. Re-test

### Recovery (< 2 hours)
1. Fix verified in staging
2. Redeploy to production
3. Re-test

**Confidence Level:** 95% (change is minimal, backward compatible)

---

## 📞 CONTACTS

**SelfPrint Frontend:** duriankab@gmail.com  
**On-Call (Aug 8):** [Assign]  

**Approval Needed From:** Astrovera v2 Backend Lead

---

## 🔗 REFERENCES

- Claude API Docs: https://docs.anthropic.com/messages
- System Prompt Parameter: https://docs.anthropic.com/messages/api/messages-api
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/

---

## 📝 FILES TO MODIFY

**Astrovera v2:**
- `functions/chat.js` or `src/index.js` (Wrangler entry point)
  - Add system parameter handling
  - Conditionally inject into Claude request

**SelfPrint:**
- `src/lib/api/selfprintChat.ts` (ALREADY READY - no changes needed)

---

## 🎯 NEXT STEPS

1. **Today (Aug 7):** Astrovera reviews this spec
2. **Tomorrow (Aug 8 AM):** Implement code change
3. **Aug 8 PM:** Deploy to staging + test
4. **Aug 9 AM:** Deploy to production
5. **Aug 9 PM:** SelfPrint onboarding testing with real Brain

---

**Prepared by:** jb_DEV  
**Status:** 📋 Ready for Astrovera Team Implementation  
**Priority:** 🔴 CRITICAL - Blocks Phase 3  
**Effort:** 1-2 hours (code + testing + deploy)
