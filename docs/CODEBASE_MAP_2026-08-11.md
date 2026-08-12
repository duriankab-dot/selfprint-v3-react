# 📐 SELFPRINT CODEBASE MAP
**Date**: 2026-08-11  
**Status**: 🟢 Architecture Scan Complete (Phase 1-3)

---

## 🏗️ Architecture Overview

```
App.tsx (14+ Context Providers)
  ├─ AuthProvider (Passkey + OAuth + MagicLink)
  ├─ TwinProvider (18 Archetypes, maturityScore)
  ├─ EmotionProvider (6 moods: stressed/confused/confident/drained/ready/reflective)
  ├─ HubProvider (5 life hubs)
  ├─ ThemeProvider
  ├─ ExperienceProvider
  ├─ AudioProvider (background music)
  ├─ EnvironmentProvider
  ├─ EvolutionProvider (reflection tracking)
  ├─ PopupProvider (contextual popups §28)
  ├─ SubscriptionProvider (§31 Pricing)
  └─ React Router (20+ lazy-loaded routes)
```

---

## 📂 File Structure & Purpose

### **Entry Points**
- **src/main.tsx**
  - React Query setup (staleTime: 30s, retry: 2)
  - Service Worker registration (PWA)
  - SW message listener
  
- **src/App.tsx**
  - 14+ Context Providers nested
  - Code splitting: React.lazy + Suspense ✅
  - Routes: / /onboarding /dashboard /chat /analyze /pricing /login /explore /activities /me
  - ⚠️ **Import PHASE2_TEST_CONSOLE (line 53)** → ต้องลบ
  - ⚠️ console.log ที่ line 55

---

### **State Management**

#### **Zustand Stores** (localStorage persistent)
- **userStore.ts**
  - profile: UserProfile (email, name, birthDate, birthTime, birthPlace)
  - SICE baseline: science/intuition/creative/experience scores
  - landingContext: mood + CTA source
  - Storage key: `selfprint-user-storage`

- **twinStore.ts**
  - messages: ConversationMessage[] (keep last 10)
  - autonomyScore: 0-100
  - patterns: Record<string, number>
  - feedbackCount: helpful/meh/unhelpful
  - Storage key: `selfprint-twin-storage`

#### **React Context Providers**

| Provider | Key State | Storage | Purpose |
|----------|-----------|---------|---------|
| AuthContext | session, isPasskeyAvailable | Supabase | Authentication (Passkey/OAuth/MagicLink) |
| TwinContext | twin: TwinProfile | localStorage | Twin profile (18 archetypes, maturityScore) |
| EmotionContext | mood: Mood (6 types) | localStorage | Current mood + history |
| HubContext | hub: Hub (5 types) | localStorage | Life hub selection |
| ThemeContext | theme: 'light'\|'dark' | localStorage | UI theme |
| AudioContext | audioState | MemoryStorage | Background audio + ducking |
| EvolutionContext | reflectionCount | DB | Twin evolution tracking |
| PopupContext | popupQueue | Memory | Contextual popups (§28) |
| SubscriptionContext | plan: 'starter'\|'pro'\|'elite' | DB | Subscription status (§31) |

---

### **Services Layer**

#### **nova-ai.ts** (Claude API wrapper)
```typescript
callNova(context: NovaContext) → SelfprintChatResponse
  - Prepares NovaContext with (hub, mood, archetype, messages)
  - Calls selfprintChat() which injects system prompt
  - Returns Twin response

getSystemPrompt(context) → string
  - Uses getNovaPrompt() to generate 1,296 personality variations
  - 18 archetypes × 12 hubs × 6 moods

getStarterMessage(hub, mood) → string
  - Hub-specific opening messages
```

#### **personalModel.ts** (Feedback loop)
```typescript
submitPersonalModelFeedback(payload) → FeedbackResponse
  - Sentiment: very_true/somewhat/not_sure/not_me
  - Sends to /api/personal-model (POST)
  - Triggers model recalibration

getPersonalModelStatus(userId) → CalibrationStatus
  - Checks if model is ready (scheduled/in_progress/complete)
```

#### **supabase-service.ts** (Database)
```typescript
saveMessage(userId, hub, mood, role, content, autonomyLevel)
  - Inserts into chat_messages table

getChatHistory(userId, hub?, limit=50)
  - Queries chat_messages
  - Returns ordered by created_at

// [Additional DB functions exist but cut off]
```

---

## 📊 Component Hierarchy

### **Pages** (20+ lazy-loaded)
- LandingPage (guest)
- Onboarding
- Dashboard (main hub)
- Chat (Nova Twin interaction)
- AnalysisPage (Phase 4)
- ExplorePage (fingerprint/palm/hexagram)
- ActivitiesPage (badges, journals)
- MePage (profile, settings)
- DecisionLoggerPage
- VoiceChatPage
- TwinProfilePage
- LifeHubsPage
- PricingPage (§31)
- LoginPage (Passkey/OAuth §34)
- PasskeySettings (§34)
- PrivacyCenter (PDPA §6)
- DailyBriefPage (§25)
- BadgePage (§29-30)
- ComponentShowcase
- FeatureMenu

### **Key Components**
- **TwinEvolution.tsx** - Global Twin evolution overlay (§30: 30 reflections celebration)
- **ContextualPopup.tsx** - Contextual popups renderer (§28)
- **TwinEvolutionSceneWrapper.tsx** - Scene component for milestone celebrations
- **PendingOnboardingSaver.tsx** - Auto-save onboarding progress
- **DecisionForm.tsx** ⚠️ **TODO: Implement actual API call (line 62)**
- **DecisionLogger.tsx** ⚠️ **TODO: Implement actual API call (line 77)**

---

## 🔐 Authentication Flow

### **Passkey (WebAuthn)**
1. **AuthContext.registerPasskey()**
   - Checks isPasskeyAvailable
   - Imports @/lib/auth/PasskeyProvider
   - Gets registration options
   - Registers credential

2. **AuthContext.signInWithPasskey()**
   - Supports biometric unlock
   - Updates session on success

### **OAuth** (Google/Apple §34)
- AuthContext.signInWithOAuth('google' | 'apple')
- Browser redirect to provider

### **Magic Link** (Email passwordless)
- AuthContext.signInWithMagicLink(email)
- Sends link via email

---

## 🧠 Intelligence System

### **PersonalContextBuilder** (Core engine)
- Builds personal intelligence from:
  - Direct user statements
  - Behavioral patterns
  - Reflections
  - Goals/Values
  - Journal entries
  - Journey tracking
- ⚠️ **TODO: Extend PersonalContextEntry to support relationship type (line 593)**

### **Personality Architecture**
- **18 Archetypes** (12 base + 6 hybrid)
  - Innocent, Explorer, Sage, Everyman, Lover, Jester, Hero, Outlaw, Magician, Caregiver, Creator, Ruler
  - Hybrid: Alchemist, Dreamer, Maverick, Strategist, Diplomat, Artisan

- **6 Moods** (emotional context)
  - stressed, confused, confident, drained, ready, reflective

- **5-12 Hubs** (life areas)
  - Identity, Decision, Creativity, Relationship, Spirituality (+ others)

---

## 🐛 Known Issues (from Audit)

### **Critical**
- [ ] **PHASE2_TEST_CONSOLE.ts** (line 53 in App.tsx) - Test utilities exposed to window object
- [ ] **TODO Comments** (9 total)
  - Line 62: DecisionForm - API call not implemented
  - Line 77: DecisionLogger - API call not implemented
  - Lines 102,347,357: crypto.ts - CBOR parser & signature verification
  - Line 593: PersonalContextBuilder - Extend for relationship types
- [ ] **console.log** (183 total across 41 files)
  - Production: 41 files need cleanup
  - Tests: Acceptable to keep

### **High**
- [ ] Mock data in production components (300+ occurrences)
- [ ] Hardcoded verification in crypto.ts (line 357)

---

## 🔗 Key API Endpoints (Expected)

Based on service calls, these endpoints should exist:

```
POST /api/personal-model
GET  /api/personal-model/status?userId={id}
POST /chat (selfprintChat wrapper)
[Others to be discovered in next phases]
```

---

## 📦 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 19.2.8 |
| **Build** | Vite | 8.2.0 |
| **Language** | TypeScript | ~6.0.2 |
| **Routing** | React Router | 7.18.2 |
| **State** | Zustand | 5.0.14 |
| **Query** | TanStack React Query | 5.101.4 |
| **Database** | Supabase | 2.112.1 |
| **Styling** | Tailwind CSS | 4.3.3 |
| **Testing** | Vitest | 4.1.10 |
| **Linting** | oxlint | 1.75.0 |
| **Backend** | Express + ts-node | 4.18.2 |
| **AI** | Anthropic Claude | 0.115.0 |

---

## 🎯 Next Phase: Intelligence System Deep Dive

Need to read:
1. PersonalContextBuilder (entire)
2. Intelligence engines (AIFeedbackLoop, DecisionIntelligenceEngine, etc.)
3. selfprintChat API wrapper
4. Pages (Dashboard, Onboarding, Chat)

---

## 📝 Notes

- Code splitting with React.lazy ✅ (Bundle optimization in progress)
- Service Worker + PWA support ✅
- Passkey biometric auth ✅
- 1,296 personality combinations ✅
- Multi-context provider setup ✅ (but complex nesting)
- Test console still exposed ⚠️ (needs removal)
- Mock data in production ⚠️ (needs replacement)

---

**Last Updated**: 2026-08-11  
**Next Review**: After Intelligence System read-through
