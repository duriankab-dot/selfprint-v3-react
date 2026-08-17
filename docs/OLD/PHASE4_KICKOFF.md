# 🚀 Phase 4 Kickoff — Astrovera Brain Integration

**Status:** READY TO START  
**Blockers:** NONE  
**Phase 3 Completion:** ✅ 100%

---

## 📌 Phase 4 Scope

### Primary Objective
**Connect SelfPrint Frontend → Astrovera Brain**

Turn mood + hub selection into personalized Nova AI Twin conversation

### Key Deliverables

#### 1. Onboarding Flow (`src/pages/Onboarding.tsx`)
- [ ] Create component
- [ ] Read mood/hub from context
- [ ] Fetch Brain API initialization
- [ ] Display loading state
- [ ] Redirect to Chat on success

#### 2. Astrovera Brain Service (`src/services/astrovera.ts`)
- [ ] Create API client
- [ ] Initialize twin endpoint
- [ ] Connection handling
- [ ] Error recovery

#### 3. Nova AI Integration
- [ ] Select personality (mood + hub combo)
- [ ] Load system prompt
- [ ] Setup conversation thread
- [ ] Memory/context passing

#### 4. ChatWindow Enhancement
- [ ] Connect to Nova
- [ ] Message sending/receiving
- [ ] Loading states
- [ ] Error handling

#### 5. End-to-End Testing
- [ ] User journey: Landing → Onboarding → Chat
- [ ] Message flow works
- [ ] Nova responds with hub/mood context
- [ ] Conversation history saved

---

## 🎯 User Journey (Phase 4)

```
USER JOURNEY: Landing → Onboarding → Chat

1. User on LandingPage "/"
   ├─ Selects mood: "confident"
   ├─ Selects hub: "decision"
   └─ Clicks "สร้าง AI Twin ของฉัน"
   ↓
2. handleStartOnboarding()
   └─ window.location.href = '/onboarding'
   ↓
3. Router: <Route path="/onboarding" element={<Onboarding />} />
   ↓
4. Onboarding Component Loads
   ├─ useEmotion() → mood = "confident"
   ├─ useHub() → hub = "decision"
   └─ Call Brain API
   ↓
5. Brain Response
   ├─ Twin ID generated
   ├─ Nova personality loaded (decision + confident combo)
   └─ Chat thread initialized
   ↓
6. Redirect to Chat Page
   └─ window.location.href = '/chat'
   ↓
7. ChatWindow Component
   ├─ Nova AI Twin loaded
   ├─ First message displayed
   └─ User can type conversation
   ↓
8. Message Exchange
   ├─ User: "ฉันต้อง make decision..."
   ├─ Nova: [responds with decision-hub expertise + confident tone]
   └─ Conversation continues...
```

---

## 📋 Phase 4 Task List

### Task 1: Onboarding Component
```typescript
// src/pages/Onboarding.tsx

export default function Onboarding() {
  const { mood } = useEmotion();
  const { currentHub } = useHub();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch Brain API
    initializeTwin(mood, currentHub)
      .then(response => {
        // 2. Save twin ID
        // 3. Redirect to /chat
        navigate('/chat');
      })
      .catch(err => setError(err.message));
  }, [mood, currentHub, navigate]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
}
```

### Task 2: Brain Service
```typescript
// src/services/astrovera.ts

export async function initializeTwin(mood: Mood, hub: Hub) {
  const response = await fetch('/api/brain/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mood,
      hub,
      userId: generateId(), // or from auth
    })
  });

  if (!response.ok) throw new Error('Twin init failed');
  return response.json();
}

export async function sendMessage(twinId: string, message: string) {
  // Call Brain chat endpoint
  // Return AI response
}
```

### Task 3: Nova Personality Selection
```typescript
// src/services/nova-ai.ts (EXTEND)

export function getNovaPrompt(hub: Hub, mood: Mood): string {
  const hubPrompt = HUB_PROMPTS[hub];
  const moodAdjustment = starters[hub][mood];
  return `${hubPrompt}\n\n${moodAdjustment}`;
}

// Example:
// getNovaPrompt('decision', 'confident')
// → Returns Nova prompt optimized for decision-making + confident tone
```

### Task 4: ChatWindow Integration
```typescript
// src/components/chat/ChatWindow.tsx (UPDATE)

export function ChatWindow() {
  const { mood } = useEmotion();
  const { currentHub } = useHub();
  
  // Connect to Brain API
  const { messages, sendMessage, isLoading } = useChat({
    twinId: getCurrentTwinId(), // from localStorage
    systemPrompt: getNovaPrompt(currentHub, mood)
  });

  // Rest stays the same...
}
```

### Task 5: Integration & Testing
- [ ] Manual test: Landing → Onboarding → Chat flow
- [ ] Message sending/receiving
- [ ] Nova responds appropriately for mood + hub
- [ ] Error handling (network, API)
- [ ] Conversation persistence

---

## 🔗 Dependencies

### From Phase 3 (Already Done)
✅ EmotionContext (mood selection)
✅ HubContext (hub selection)
✅ localStorage persistence
✅ Design tokens system
✅ ChatWindow component (partial)
✅ nova-ai.ts (HUB_PROMPTS defined)

### Need to Define
- [ ] Astrovera Brain API endpoint
- [ ] API authentication (if needed)
- [ ] Twin initialization schema
- [ ] Message format/protocol
- [ ] Error codes/handling
- [ ] Session management

### Questions for Brain Team
1. What's the Brain API base URL?
2. How do we authenticate? (API key, OAuth, etc?)
3. What's the request format for twin initialization?
   ```json
   {
     "mood": "confident",
     "hub": "decision",
     "userId": "xyz",
     "?": "?"
   }
   ```
4. What's the response format?
   ```json
   {
     "twinId": "123",
     "sessionToken": "...",
     "firstMessage": "...",
     "?"
   }
   ```
5. Chat message format?
   - How do we send messages?
   - How do we receive responses?
   - Context/memory passing?

---

## 📊 Success Criteria

| Criterion | How to Verify |
|-----------|---------------|
| User selects mood + hub | localStorage has both values |
| Onboarding calls Brain API | Network request visible in DevTools |
| Twin initializes | Response has twinId |
| Redirect works | URL changes to /chat |
| ChatWindow loads | Chat interface renders |
| Nova responds | Message from AI appears |
| Mood/hub context applied | Nova's tone matches mood, content matches hub |
| Error handling works | Network error shows graceful message |

---

## 🐛 Known Issues to Handle

### From Phase 3 Carry-over
1. ChatWindow still needs full integration (useChat hook)
2. Message type missing `id` field (might be handled by Brain)
3. Error boundaries for API failures

### Phase 4 Specific
1. Network timeouts
2. Invalid mood/hub combinations (shouldn't happen, but handle)
3. Twin initialization failures
4. Message send failures
5. Session expiration

---

## 📚 Reference Files

**Must Read Before Starting:**
1. `CONTEXT_SUMMARY.md` — Phase 3 handoff + context usage
2. `LANDING_PAGE_SPEC.md` — Full landing page structure
3. `src/context/EmotionContext.tsx` — Mood hook
4. `src/context/HubContext.tsx` — Hub hook
5. `src/services/nova-ai.ts` — HUB_PROMPTS + starters

**To Review:**
- `src/pages/LandingPage.tsx` — CTA routing flow
- `src/components/chat/ChatWindow.tsx` — Current state
- `PHASE3_COMPLETION.md` — What was accomplished

---

## 🎯 Estimated Timeline

| Task | Effort | Days |
|------|--------|------|
| 1. Onboarding component | 2-3 hrs | 1 |
| 2. Brain service client | 2-3 hrs | 1 |
| 3. Nova integration | 1-2 hrs | 0.5 |
| 4. ChatWindow updates | 2-3 hrs | 1 |
| 5. Testing + debugging | 3-4 hrs | 1 |
| **Total** | **10-15 hrs** | **4-5 days** |

---

## ✅ Go/No-Go Decision

**READY TO START PHASE 4?**

- ✅ Landing page complete + deployed
- ✅ Mood + hub selection working
- ✅ localStorage persistence tested
- ✅ All TypeScript errors fixed
- ✅ Design tokens applied
- ✅ Routing verified
- ✅ Documentation complete
- ✅ Architecture audit passed

**STATUS: GO** 🚀

---

## 📞 Handoff Notes

**To Brain Team:**
- Frontend ready to accept Brain API
- Need: endpoint URL, auth method, schema docs
- Timeline: Phase 4 starts when API specs provided

**To DevOps:**
- Staging environment needed for Phase 4 testing
- API endpoint connectivity verification
- Rate limits/quotas to set

**To QA:**
- Phase 3 complete, ready for integration testing
- Phase 4 test cases: user journey end-to-end
- Performance benchmarks: message latency, API response

---

## 🚀 Next Steps

1. **Get Brain API Details** (blocking)
2. **Create Onboarding.tsx** component
3. **Build astrovera.ts** service
4. **Integrate ChatWindow** with Brain
5. **E2E Testing** of full flow
6. **Deploy to Staging**
7. **Handoff to QA**

---

**Phase 4 Status: READY FOR KICKOFF** 🎯

Awaiting Brain API specifications to begin implementation.
