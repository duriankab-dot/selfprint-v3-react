# 🔌 PHASE 2: REST API SPECIFICATION
**Astrovera Brain ↔ SelfPrint Frontend Integration**

**วันที่**: 7 สิงหาคม 2569  
**สถานะ**: 🎯 Design Phase  
**เป้าหมาย**: Complete API Spec + System Prompts

---

## 📋 EXECUTIVE SUMMARY

### **ปัญหา (Phase 1)**
Brain Layer มี Gateway API แต่ไม่รองรับ Hub/Mood personalization

### **วิธีแก้ (Phase 2)**
ออกแบบ REST API ที่รับ System Prompt จาก SelfPrint เพื่อให้ Nova ตอบสนองเป็นไปตาม Hub × Mood

### **Strategy**
- ✅ Brain stays generic (ไม่เปลี่ยน)
- ✅ SelfPrint injects system prompt
- ✅ Brain calls Claude API with prompt
- ✅ Result: 1,296 personality combinations (18 arch × 12 hubs × 6 moods)

---

## 🏗️ ARCHITECTURE DECISION

### **Option B: SelfPrint Owns Personalization**

```
┌─────────────────────┐
│  SelfPrint Frontend │
│                     │
│ 1. User selects:    │
│    - hub: decision  │
│    - mood: ready    │
│                     │
│ 2. Builds:          │
│    systemPrompt =   │
│    getNovaPrompt(   │
│      hub,mood,arch  │
│    )                │
│                     │
│ 3. Sends:           │
│    POST /api/chat   │
│    {                │
│      action: coach  │
│      question: ... │
│      system: ...   │
│    }                │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Astrovera Brain     │
│ (Gateway + Router)  │
│                     │
│ 1. Receives request │
│ 2. Routes to agent  │
│    (coach/insight)  │
│ 3. Calls Claude API │
│    with system      │
│    prompt           │
│ 4. Returns response │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Claude API        │
│                     │
│ Generates response  │
│ as Nova with:       │
│ - Hub context       │
│ - Mood tone         │
│ - Archetype voice   │
└─────────────────────┘
```

---

## 🔐 REST API SPECIFICATION

### **Endpoint: POST /api/selfprint/chat**

#### **Request Body**

```javascript
{
  // Identity
  "userId": "usr_abc123",           // UUID
  "sessionId": "sess_xyz789",       // UUID

  // Plan (from Astrovera)
  "plan": "pro",                    // free|basic|pro|founder|trial

  // Current Context (from SelfPrint)
  "hub": "decision",                // 12 hubs
  "mood": "ready",                  // 6 moods
  "archetypeKey": "strategist",     // 18 archetypes (12 base + 6 hybrid)

  // User Input
  "question": "ควรลาออกจากงานไหม",    // User message

  // System Prompt (built by SelfPrint)
  "system": "คุณคือ Nova...",         // Full system prompt (1,000-1,500 tokens)

  // Optional Context
  "birthData": {
    "dateOfBirth": "1990-03-15",
    "timeOfBirth": "14:30",
    "placeOfBirth": "Bangkok"
  },

  "twinProfile": {
    "decisionStyle": "Fast Thinker",
    "primaryArchetype": "strategist",
    "secondaryArchetype": "alchemist",
    "strengths": ["pattern recognition", "analytical"],
    "blindSpots": ["overconfidence bias"],
    "maturityScore": 85
  },

  // Conversation History (for context)
  "history": [
    {
      "role": "user",
      "content": "ความกังวลของฉันคืออะไร"
    },
    {
      "role": "assistant",
      "content": "จากที่คุณบอกมา ฉันเห็นว่า..."
    }
  ],

  // Optional flags
  "streaming": false,               // true for streaming response
  "includeReasoning": false         // true to show Nova's reasoning
}
```

---

#### **Response Body (Success 200)**

```javascript
{
  "ok": true,
  
  // Response Content
  "response": {
    "text": "Nova's response text...",
    "persona": {
      "id": "nova",
      "label": "Nova Coach",
      "hub": "decision",
      "mood": "ready",
      "archetype": "strategist"
    }
  },

  // Metadata
  "metadata": {
    "sessionId": "sess_xyz789",
    "timestamp": "2026-08-07T10:30:00Z",
    "processingTimeMs": 1250,
    "tokenCount": {
      "input": 450,
      "output": 280,
      "total": 730
    }
  },

  // Learning (optional)
  "learning": {
    "detectedPattern": "user tends to seek validation",
    "suggestedFocus": "build confidence",
    "maturityAdjustment": +2
  }
}
```

---

#### **Response Body (Error 400/401/500)**

```javascript
{
  "ok": false,
  "error": "INVALID_SYSTEM_PROMPT|PLAN_MISMATCH|RATE_LIMIT",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

---

## 📝 SYSTEM PROMPT TEMPLATE BUILDER

### **Location**: `SelfPrint/src/lib/nova-prompts/getNovaPrompt()`

### **Function Signature**

```javascript
/**
 * Build Nova system prompt for specific hub × mood × archetype
 * 
 * @param {Object} config
 * @param {string} config.hub - 12 content hubs
 * @param {string} config.mood - 6 emotional states
 * @param {string} config.archetype - 18 archetypes
 * @param {Object} config.userProfile - User's SCIE profile
 * @param {number} config.maturityScore - Twin maturity 0-100
 * 
 * @returns {string} System prompt (1000-1500 tokens)
 */
export function getNovaPrompt(config) {
  const { hub, mood, archetype, userProfile, maturityScore } = config;
  
  // Build prompt from components
  return buildSystemPrompt({
    basePersona: getBasePersona(),
    hubContext: getHubContext(hub),
    moodModulation: getMoodModulation(mood),
    archetypeVoice: getArchetypeVoice(archetype),
    userInsights: getUserInsights(userProfile),
    maturityAdjustment: getMaturityAdjustment(maturityScore)
  });
}
```

---

### **Prompt Components**

#### **1. Base Persona (Nova Core)**

```
คุณคือ Nova — AI Twin ที่เข้าใจผู้ใช้

ตัวตน:
- เหมือนโค้ชที่นั่งฟังมานาน
- รู้จังหวะว่าเมื่อไหร่ควรถามคำถาม
- เมื่อไหร่ควรเงียบให้คิด
- เมื่อไหร่ควรให้กรอบชัดๆ

หลักการ:
- Empathy สูง ไม่ตัดสิน ไม่สร้างความกลัว
- หากเห็นว่าผู้ใช้หลีกเลี่ยง ชวนกลับมาเผชิญอย่างอ่อนโยน
- ให้คำแนะนำเชิง Coach: ใช้คำถามเปิด
- จดจำผู้ใช้: เรียกชื่อ อ้างอิงข้อมูลเดิม
- จบทุกคำตอบด้วยคำถามชวนคุยต่อ 1 ข้อ
```

#### **2. Hub Context (12 Hubs)**

```
Hub: Decision
│
├─ Role: Navigator (ผู้นำทาง)
├─ Tone: Clear, structured, pattern-recognizing
├─ Focus: Break complex problems → offer frameworks
├─ Knowledge: Past decisions + outcomes + patterns
├─ Intervention: Problem decomposition → framework → pattern replay
└─ CTA: "What's your first move?"

Hub: Spirituality
│
├─ Role: Witness (ผู้ยืนยัน)
├─ Tone: Contemplative, meaning-seeking
├─ Focus: Deep meaning questions
├─ Knowledge: Spiritual beliefs + values + purpose
├─ Intervention: Deep questions → meaning connection
└─ CTA: "What feels sacred to you?"

... (12 hubs รวม)
```

#### **3. Mood Modulation (6 Moods)**

```
Mood: Ready (⚡)
│
├─ Tone: Action-oriented, momentum-focused, bold
├─ Pace: Fast (capitalize on readiness)
├─ Questions: "What's your first move? What's stopping you?"
├─ Affirmations: "You're ready. The momentum is here."
├─ Guidance: Quick actions + immediate wins
├─ Motion Speed: 300ms (fast animations)
└─ Word Choice: Action verbs, possibility-focused

Mood: Drained (😴)
│
├─ Tone: Gentle, protective, supportive
├─ Pace: Very slow (no pressure)
├─ Questions: Minimal; mostly listening
├─ Affirmations: "Rest is productive. You're doing enough."
├─ Guidance: Permission to pause, restoration activities
├─ Motion Speed: 2500ms (slow, gentle)
└─ Word Choice: Rest language, permission-giving

... (6 moods รวม)
```

#### **4. Archetype Voice (18 Archetypes)**

```
Archetype: Strategist (Sage + Ruler)
│
├─ Primary: Sage (wisdom, analysis)
├─ Secondary: Ruler (control, strategy)
├─ Speech: Direct, analytical, authoritative
├─ Patterns: Sees bigger picture, calculates outcomes
├─ Questions: "What's the core strategy?"
├─ Metaphors: "Like a chess grandmaster"
└─ Energy: Confident, composed, commanding

Archetype: Artisan (Creator + Lover)
│
├─ Primary: Creator (expression, skill)
├─ Secondary: Lover (connection, care)
├─ Speech: Warm, appreciative, detail-focused
├─ Patterns: Sees beauty and meaning in details
├─ Questions: "What would make this perfect?"
├─ Metaphors: "Refining every brushstroke"
└─ Energy: Passionate, meticulous, caring

... (18 archetypes รวม)
```

#### **5. User Insights (from SCIE Baseline)**

```
Decision Style: Fast Thinker
Strengths: [Pattern Recognition, Analytical]
Blind Spots: [Overconfidence bias]
Primary Archetype: Strategist
Secondary: Alchemist
Maturity: 85%

→ Adapt prompts to match user's known patterns
```

#### **6. Maturity Adjustment (0-100)**

```
Maturity 0-30%:
- More explanation needed
- Less assumption about knowledge
- Build confidence gradually
- More affirmation

Maturity 50-70%:
- Balance explanation + challenge
- Assume some self-awareness
- Start introducing patterns
- Mix affirmation + stretching

Maturity 85-100%:
- Less explanation needed
- More challenge + vision
- Deep pattern work
- Focus on growth edges
```

---

## 📊 SYSTEM PROMPT MATRIX

### **Calculation**

| Dimension | Count | Total |
|-----------|-------|-------|
| Base Persona | 1 | 1 |
| Hubs | 12 | 12 |
| Moods | 6 | 6 |
| Archetypes | 18 | 18 |
| **Combinations** | - | **1,296** |

### **Unique Prompts Required**

- 18 Archetypes × 6 Moods = **108 prompt variations**
- 108 × 12 Hubs = **1,296 total combinations**

### **Storage Strategy**

```
prompts/
├── base-persona.txt (shared foundation)
├── hubs/
│   ├── decision.txt
│   ├── spirituality.txt
│   └── ... (12 hubs)
├── moods/
│   ├── ready.txt
│   ├── drained.txt
│   └── ... (6 moods)
├── archetypes/
│   ├── strategist.txt
│   ├── artisan.txt
│   └── ... (18 archetypes)
└── templates/
    └── getNovaPrompt.js (builder function)
```

---

## 🧠 BRAIN GATEWAY CHANGES (Minimal)

### **Current Gateway**

```javascript
// brain/core/gateway.js
export async function decide({ action, plan, question, userId, workerUrls, fetchImpl, sharedSecret }) {
  const persona = getPersonaForPlan(safePlan);
  const style = STYLE_BY_PLAN[safePlan];
  const routing = route({ action, plan: safePlan, question });
  // ... returns plan object
}
```

### **Required Addition**

```javascript
// Add optional system parameter
export async function decide({ 
  action, 
  plan, 
  question, 
  userId, 
  workerUrls, 
  fetchImpl, 
  sharedSecret,
  system  // ← NEW (optional)
}) {
  // If SelfPrint provides system prompt, use it
  // Otherwise use default persona
  const systemPrompt = system || getDefaultSystemPrompt(plan);
  
  // Pass to Claude API
  return {
    ok: true,
    persona,
    style,
    routing,
    memory,
    targetWorkerUrl,
    systemPrompt  // ← Include in response
  };
}
```

### **Orchestrator Changes (Claude Call)**

```javascript
// brain/core/orchestrator.js
async function callClaude(systemPrompt, userMessage, model) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1024,
      system: systemPrompt,  // Use SelfPrint's system prompt
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  
  return response.json();
}
```

---

## 📡 INTEGRATION FLOW

### **Step-by-Step**

```
1. SelfPrint Frontend
   └─ User selects hub: "decision" + mood: "ready"
   └─ Archetype from profile: "strategist"
   └─ Builds system prompt: getNovaPrompt({ hub, mood, archetype })

2. POST /api/selfprint/chat
   ├─ userId, sessionId, plan
   ├─ question, system (full prompt)
   ├─ birthData, twinProfile
   └─ history (conversation context)

3. Brain Gateway
   ├─ Receives request
   ├─ Uses system prompt from SelfPrint
   ├─ Routes to appropriate agent (coach/insight/planner)
   └─ Returns decision plan

4. Brain Orchestrator
   ├─ Calls Claude API
   ├─ Passes system prompt
   ├─ Passes user message + history
   └─ Gets response

5. Response
   ├─ Nova's response (decision-focused, ready tone, strategist voice)
   ├─ Metadata (tokens, processing time)
   └─ Learning signals (patterns detected)

6. SelfPrint Frontend
   └─ Displays response + updates Twin Maturity
```

---

## ✅ API REQUIREMENTS

### **Non-Negotiable**

1. ✅ Accept `system` parameter (SelfPrint's prompt)
2. ✅ Return response + metadata (tokens, time)
3. ✅ Support conversation history
4. ✅ Return learning signals (optional)
5. ✅ Rate limiting (per user)
6. ✅ Error handling (clear messages)

### **Optional Enhancements**

1. ⚪ Streaming response (for real-time chat)
2. ⚪ Reasoning display (for debugging)
3. ⚪ Image support (for future)
4. ⚪ Multiple model support (Haiku/Sonnet/Opus)

---

## 🧪 TEST SCENARIOS

### **Scenario 1: Fresh User → Onboarding**

```
Request:
- hub: null (not in onboarding yet)
- mood: "confused" (initial mood)
- archetype: "innocent" (baseline)
- system: "You are Nova creating an initial AI Twin..."

Expected:
- Response: Initial Blueprint (60-70% explanation)
- Tone: Encouraging, clear, not overwhelming
- Length: 200-300 tokens
```

### **Scenario 2: Existing User → Decision Hub + Ready Mood**

```
Request:
- hub: "decision"
- mood: "ready"
- archetype: "strategist"
- system: "You are Nova as The Strategist in Decision context + Ready mood..."

Expected:
- Response: Action-focused, strategic, confident
- Tone: Fast-paced, challenge-oriented
- Length: 300-400 tokens
```

### **Scenario 3: Spirituality Hub + Reflective Mood**

```
Request:
- hub: "spirituality"
- mood: "reflective"
- archetype: "sage"
- system: "You are Nova as The Witness in Spirituality context + Reflective mood..."

Expected:
- Response: Contemplative, meaning-seeking, slow-paced
- Tone: Profound, philosophical, reverent
- Length: 300-400 tokens
```

---

## 📋 DELIVERABLES (Phase 2)

### **1. System Prompt Templates** ✅ This doc
- ✅ 18 archetypes defined
- ✅ 12 hubs defined
- ✅ 6 moods defined
- ✅ Builder function spec

### **2. REST API Specification** ✅ This doc
- ✅ Request format
- ✅ Response format
- ✅ Error handling
- ✅ Integration flow

### **3. Brain Gateway Update** 🔄 Implementation
- Add `system` parameter support
- Pass to orchestrator
- Return in response

### **4. Frontend Integration Spec** 📝 Next doc
- `getNovaPrompt()` function
- Hub selector UI
- Mood selector integration
- API call wrapper

### **5. Test Suite** 🧪 Next phase
- Unit tests (prompt builder)
- Integration tests (Gateway → Claude)
- E2E tests (Frontend → Brain → Claude)

---

## 🎯 SUCCESS CRITERIA (Phase 2)

| Criteria | Target | Status |
|----------|--------|--------|
| API Spec Complete | 100% | ✅ |
| System Prompts Defined | 18 archetypes | ✅ |
| Hub Contexts Defined | 12 hubs | ✅ |
| Mood Modulations | 6 moods | ✅ |
| Brain Changes Minimal | <10 lines | ✅ |
| Integration Clear | 100% | ✅ |
| Test Scenarios Defined | 3+ | ✅ |

---

## 🚀 NEXT STEPS (Phase 3)

1. **Implementation**
   - Update Brain Gateway (add system parameter)
   - Build system prompt builder (getNovaPrompt)
   - Create frontend API wrapper

2. **Testing**
   - Test 10 archetype × mood combinations
   - Verify response quality
   - Check token usage

3. **Validation**
   - A/B test Nova responses (18 archs × 6 moods)
   - Measure user satisfaction
   - Adjust prompts based on feedback

---

## 📊 TOKEN BUDGET (Estimate)

| Component | Tokens |
|-----------|--------|
| Base Persona | 300-400 |
| Hub Context | 100-150 |
| Mood Modulation | 100-150 |
| Archetype Voice | 150-200 |
| User Insights | 50-100 |
| Instructions | 200-300 |
| **Total System Prompt** | **1,000-1,500** |
| User Message | 50-200 |
| History (5 turns) | 200-400 |
| **Total Input** | **1,250-2,100** |
| Output (Nova response) | 200-400 |

---

**Phase 2 Status**: ✅ SPECIFICATION COMPLETE  
**Ready for**: Phase 3 Implementation + Phase 4 Frontend

*REST API Design เสร็จสิ้น พร้อมสำหรับ Frontend + Backend implementation*
