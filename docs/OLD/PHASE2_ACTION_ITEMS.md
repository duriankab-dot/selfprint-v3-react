# Phase 2 Action Items — Implementation Complete
**Status**: ✅ Core Implementation Finished  
**Date**: 2026-08-07

---

## 📌 IMMEDIATE NEXT STEPS

### 1. Brain Gateway Update (Astrovera v2)
**Owner**: Astrovera Backend Team  
**Priority**: CRITICAL  
**Effort**: 15 minutes

**Requirement**:  
Add optional `system` parameter to Brain Gateway POST /api/chat endpoint

**Changes**:
```javascript
// In D:\astrovera-v2\api\gateway.js (or orchestrator.js)

// Before:
POST /api/chat {
  messages: [{ role, content }, ...]
}

// After:
POST /api/chat {
  messages: [{ role, content }, ...],
  system: "optional Nova system prompt..."  // NEW
}

// Pass system to Claude API call if provided
if (system) {
  claudeResponse = await api.messages.create({
    system: system,  // NEW
    messages: messages,
    ...
  });
}
```

**Validation**:
- [ ] POST /api/chat without `system` still works (backward compatible)
- [ ] POST /api/chat with `system` injects prompt correctly
- [ ] Response format unchanged

---

### 2. Environment Configuration
**Owner**: SelfPrint Team  
**Priority**: HIGH  
**Effort**: 5 minutes

**Create/Update `.env`**:
```bash
# .env (Development)
REACT_APP_BRAIN_GATEWAY_URL=http://localhost:3000
REACT_APP_PLAN=starter

# .env.production (Production)
REACT_APP_BRAIN_GATEWAY_URL=https://brain.astrovera.com
REACT_APP_PLAN=pro
```

**Validation**:
- [ ] Dev environment connects to local Brain
- [ ] Prod environment connects to deployed Brain
- [ ] Missing env vars default gracefully

---

### 3. Test Suite Setup
**Owner**: SelfPrint QA Team  
**Priority**: HIGH  
**Effort**: 4-6 hours

**Files to Create**:

#### 3.1 `src/__tests__/nova-prompts.test.ts`
```typescript
describe('getNovaPrompt', () => {
  test('generates 1,296 unique combinations', () => {
    const combos = new Set();
    for (const hub of AVAILABLE_HUBS) {
      for (const mood of AVAILABLE_MOODS) {
        for (const arch of AVAILABLE_ARCHETYPES) {
          const prompt = getNovaPrompt({ hub, mood, archetype: arch });
          combos.add(prompt);
        }
      }
    }
    expect(combos.size).toBe(1296);
  });

  test('generates 1,000-1,500 token prompts', () => {
    const prompt = getNovaPrompt({
      hub: 'decision',
      mood: 'ready',
      archetype: 'strategist'
    });
    const tokenEstimate = prompt.split(/\s+/).length; // rough estimate
    expect(tokenEstimate).toBeGreaterThan(1000);
    expect(tokenEstimate).toBeLessThan(1500);
  });

  test('respects maturity score levels', () => {
    const lowMaturity = getNovaPrompt({
      hub: 'identity',
      mood: 'confused',
      archetype: 'innocent',
      maturityScore: 20
    });

    const highMaturity = getNovaPrompt({
      hub: 'identity',
      mood: 'confused',
      archetype: 'sage',
      maturityScore: 90
    });

    expect(lowMaturity).toContain('confidence');
    expect(highMaturity).toContain('challenge');
  });
});
```

#### 3.2 `src/__tests__/selfprint-chat.test.ts`
```typescript
describe('selfprintChat', () => {
  test('formats request correctly for Brain Gateway', async () => {
    // Mock Brain Gateway
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: 'Test response',
        metadata: { inputTokens: 1000, outputTokens: 200 }
      })
    });
    global.fetch = mockFetch;

    await selfprintChat({
      userId: 'user123',
      sessionId: 'session456',
      hub: 'decision',
      mood: 'ready',
      question: 'What should I do?'
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-User-Id': 'user123'
        })
      })
    );
  });

  test('parses response into SelfprintChatResponse', async () => {
    // ... test response parsing
  });

  test('handles Brain Gateway errors gracefully', async () => {
    // ... test error handling
  });
});
```

#### 3.3 `src/__tests__/integration.test.ts`
```typescript
describe('Nova Chat Integration', () => {
  test('Full flow: select hub/mood → send message → get response', async () => {
    // ... end-to-end test
  });

  test('10 archetype × mood combinations produce unique responses', async () => {
    const testCases = [
      { archetype: 'strategist', mood: 'ready', hub: 'decision' },
      { archetype: 'dreamer', mood: 'reflective', hub: 'creativity' },
      { archetype: 'diplomat', mood: 'stressed', hub: 'relationship' },
      // ... 7 more
    ];

    for (const testCase of testCases) {
      const response = await selfprintChat({ ...testCase, question: 'Test' });
      expect(response.response.text).toBeDefined();
      expect(response.response.text.length).toBeGreaterThan(0);
    }
  });

  test('Twin maturity score affects guidance depth', async () => {
    const lowMaturity = await selfprintChat({
      userId: 'user1',
      sessionId: 'session1',
      hub: 'identity',
      mood: 'confused',
      question: 'Who am I?',
      twinProfile: { maturityScore: 20 }
    });

    const highMaturity = await selfprintChat({
      userId: 'user1',
      sessionId: 'session1',
      hub: 'identity',
      mood: 'confused',
      question: 'Who am I?',
      twinProfile: { maturityScore: 90 }
    });

    // High maturity should have more complex/challenging guidance
    expect(highMaturity.response.text.length)
      .toBeGreaterThan(lowMaturity.response.text.length);
  });
});
```

**Running Tests**:
```bash
npm test -- src/__tests__/
npm test -- --coverage  # Generate coverage report
```

---

### 4. Browser Console Verification
**Owner**: SelfPrint Dev Team  
**Priority**: MEDIUM  
**Effort**: 30 minutes

When running the app, verify in browser console:

```javascript
// Check if TwinContext loaded
window.__twin  // Should show twin data if available

// Check current hub/mood/archetype
const hubContext = document.documentElement.getAttribute('data-hub');
const moodContext = document.documentElement.getAttribute('data-mood');
console.log({ hub: hubContext, mood: moodContext });

// Test getNovaPrompt directly
import { getNovaPrompt } from './lib/nova-prompts/getNovaPrompt';
const prompt = getNovaPrompt({
  hub: 'decision',
  mood: 'ready',
  archetype: 'strategist'
});
console.log('Prompt length:', prompt.split(' ').length);
```

---

### 5. Documentation Updates
**Owner**: Documentation Team  
**Priority**: MEDIUM  
**Effort**: 1-2 hours

**Create**:
- [ ] `docs/NOVA_SYSTEM_PROMPTS_GUIDE.md` — How system prompts work
- [ ] `docs/SELFPRINT_API_INTEGRATION.md` — How to call selfprintChat
- [ ] `docs/TWIN_PROFILE_MANAGEMENT.md` — How to manage Twin context
- [ ] `docs/TESTING_GUIDE.md` — How to test new hub/mood/archetype combos

**Update**:
- [ ] README.md with new 12-hub structure
- [ ] CONTRIBUTING.md with integration guidelines

---

### 6. Visual/UI Refinements
**Owner**: SelfPrint UX Team  
**Priority**: LOW (Phase 3)  
**Effort**: 4-8 hours

**Components to Create/Update**:
- [ ] Display current personality state badge (shows hub/mood/archetype)
- [ ] Maturity score visual (0-100 progress bar)
- [ ] Learning signals display (discovered archetypes, blind spots)
- [ ] Hub/mood selector mobile responsiveness
- [ ] Archetype explanation tooltip in Twin profile

---

## 🔍 Verification Checklist

Before moving to Phase 3, verify:

### Development Environment
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts server on http://localhost:5173
- [ ] No TypeScript errors in IDE
- [ ] `.env` file configured correctly

### Frontend Code
- [ ] `getNovaPrompt.ts` imports without errors
- [ ] `selfprintChat.ts` imports without errors
- [ ] `TwinContext.tsx` exports correctly
- [ ] `useChat.ts` calls useTwin() without errors
- [ ] App renders with all providers

### Backend Connection
- [ ] Brain Gateway `/api/chat` endpoint accessible
- [ ] Optional `system` parameter added to request format
- [ ] Response format unchanged (backward compatible)
- [ ] Health check passes: `await healthCheckBrainGateway()`

### Data Flow
- [ ] Hub selection updates context.hub
- [ ] Mood selection updates context.mood
- [ ] Twin creation saves to localStorage
- [ ] Chat message passes hub/mood/archetype to selfprintChat
- [ ] Response received and displayed

---

## 📅 Timeline

| Task | Owner | Duration | Start | End |
|------|-------|----------|-------|-----|
| Brain Gateway Update | Backend | 15 min | TBD | TBD |
| Environment Config | Dev | 5 min | TBD | TBD |
| Unit Tests | QA | 2h | TBD | TBD |
| Integration Tests | QA | 2h | TBD | TBD |
| Console Verification | Dev | 30 min | TBD | TBD |
| Documentation | Docs | 2h | TBD | TBD |
| UI Refinements | UX | 6h | TBD | TBD |
| **Total** | **All** | **~14h** | | |

---

## 🚨 Critical Blockers

1. **Brain Gateway Update** ← Must happen before full integration
2. **Environment Variables** ← Must be set before deployment
3. **Test Suite** ← Recommended before production release

---

## 🎯 Phase 3 Readiness

✅ System prompt builder: READY  
✅ API integration layer: READY  
✅ Frontend context: READY  
✅ Chat hook integration: READY  
⏳ Brain Gateway update: PENDING (backend team)  
⏳ Testing: IN PROGRESS  
⏳ Documentation: IN PROGRESS  

**Phase 3 can begin once Brain Gateway accepts `system` parameter**

---

*Implementation complete. All code in D:\selfprint-v3-react. Awaiting backend integration for full personality matrix activation.*
