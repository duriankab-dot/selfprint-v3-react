# 📐 SELFPRINT CODEBASE MAP
**Date**: 2026-08-14 (UPDATED)  
**Status**: 🟢 Architecture Scan Complete (Phase 1-3)

---

## 🔴 Nova ≠ Twin — Architecture

| Layer | Nova (AI Guide) | AI Twin (ฝาแฝดส่วนตัว) |
|-------|-----------------|----------------------|
| บทบาท | Guide / Teacher | Personal Companion |
| เกิดเมื่อ | มีอยู่แล้วในระบบ | หลัง Core Awakening (WOW 3) |
| Intelligence | Generic | Personal Intelligence Seed |
| การเรียนรู้ | ไม่เรียนรู้จากผู้ใช้ | เรียนรู้จากผู้ใช้ตลอดเวลา |

---

## 🧠 12 SICE — Core Intelligence

**12 SICE** เป็นแกน proprietary intelligence ของ Selfprint

| # | Engine | หน้าที่ |
|---|--------|--------|
| 1 | **PersonalContextBuilder** | สังเคราะห์ข้อมูลผู้ใช้ทั้งหมด |
| 2 | **PatternDetector** | ตรวจจับรูปแบบพฤติกรรม |
| 3 | **InsightEngine** | แปลง Pattern เป็นภาษามนุษย์ |
| 4 | **AIFeedbackLoop** | ปรับ Personal Model จาก Feedback |
| 5 | **TwinStateEngine** | คำนวณสถานะ Twin แบบ Real-time |
| 6 | **ExperienceEngine** | เลือกประสบการณ์ (Hub+Mood+Time) |
| 7 | **EnvironmentEngine** | ปรับ Environment (Theme+Audio) |
| 8 | **BadgeEngine** | ติดตาม Achievement |
| 9 | **BehavioralForecastEngine** | ทำนายทิศทางพฤติกรรม |
| 10 | **FutureSelfEngine** | สร้าง Future Self Projection |
| 11 | **MemoryManager** | จัดการความจำ |
| 12 | **DecisionIntelligenceEngine** | วิเคราะห์การตัดสินใจ |

---

## 🏗️ Architecture Overview
App.tsx (14+ Context Providers)
├─ AuthProvider (Passkey + OAuth + MagicLink)
├─ TwinProvider (18 Archetypes, maturityScore)
├─ EmotionProvider (6 moods: stressed/confused/confident/drained/ready/reflective)
├─ HubProvider (12 life hubs)
├─ ThemeProvider
├─ ExperienceProvider
├─ AudioProvider (background music)
├─ EnvironmentProvider
├─ EvolutionProvider (reflection tracking)
├─ PopupProvider (contextual popups)
├─ SubscriptionProvider (Pricing)
└─ React Router (20+ lazy-loaded routes)

text

---

## 🗺️ 5-Tab Navigation

| ลำดับ | แท็บ | เส้นทาง | ใช้ทำอะไร |
|-------|------|---------|----------|
| 1 | **วันนี้** | `/dashboard` | Dynamic Personal Home |
| 2 | **สำรวจ** | `/explore` | Discover yourself |
| 3 | **TWIN** | `/twin` | AI ฝาแฝดของคุณ (ศูนย์กลาง) |
| 4 | **กิจกรรม** | `/activities` | Do / Reflect / Practice |
| 5 | **ฉัน** | `/me` | Personal control |

**🔴 CHANGE NOTE:** Chat tab ถูกแทนที่ด้วย TWIN — Twin อยู่ตรงกลาง

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
  - Routes: / /onboarding /dashboard /twin /analysis /pricing /login /explore /activities /me
  - ⚠️ Import PHASE2_TEST_CONSOLE (line 53) → ต้องลบ
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
| AuthContext | session, isPasskeyAvailable | Supabase | Authentication |
| TwinContext | twin: TwinProfile | localStorage | Twin profile (18 archetypes) |
| EmotionContext | mood: Mood (6 types) | localStorage | Current mood + history |
| HubContext | hub: Hub (12 types) | localStorage | Life hub selection |
| ThemeContext | theme: 'light'\|'dark' | localStorage | UI theme |
| AudioContext | audioState | MemoryStorage | Background audio + ducking |
| EvolutionContext | reflectionCount | DB | Twin evolution tracking |
| PopupContext | popupQueue | Memory | Contextual popups |
| SubscriptionContext | plan: 'starter'\|'pro'\|'elite' | DB | Subscription status |

---

### **Services Layer**

#### **12 SICE Services**
```typescript
// SICE #1: PersonalContextBuilder
buildPersonalContext(userId) → PersonalContext
  - Synthesizes all user data
  - Extracts values, goals, strengths, blindspots

// SICE #2: PatternDetector
detectPatterns(userId) → BehavioralPattern[]
  - autonomy_trend, confidence_trend
  - mood_confidence, hub_autonomy

// SICE #3: InsightEngine
generateInsights(userId) → Insight[]
  - KNOW / INFER / UNKNOWN levels

// SICE #4: AIFeedbackLoop
recordFeedback(insightId, sentiment) → void
  - very_true / somewhat / not_sure / not_me
  - Calibrates personal model

// SICE #11: MemoryManager
addMemory(userId, type, content) → Memory
getMemories(userId, type?) → Memory[]
deleteMemory(memoryId) → void
nova-ai.ts (Nova Guide)
typescript
callNova(context: NovaContext) → SelfprintChatResponse
  - Prepares NovaContext with (hub, mood, archetype, messages)
  - Calls selfprintChat() which injects system prompt
  - Returns response

getSystemPrompt(context) → string
  - Uses getNovaPrompt() to generate 1,296 personality variations
  - 18 archetypes × 12 hubs × 6 moods

getStarterMessage(hub, mood) → string
  - Hub-specific opening messages
personalModel.ts (Feedback loop)
typescript
submitPersonalModelFeedback(payload) → FeedbackResponse
  - Sentiment: very_true/somewhat/not_sure/not_me
  - Sends to /api/personal-model (POST)
  - Triggers model recalibration

getPersonalModelStatus(userId) → CalibrationStatus
  - Checks if model is ready (scheduled/in_progress/complete)
supabase-service.ts (Database)
typescript
saveMessage(userId, hub, mood, role, content, autonomyLevel)
  - Inserts into chat_messages table

getChatHistory(userId, hub?, limit=50)
  - Queries chat_messages
  - Returns ordered by created_at
📊 Component Hierarchy
Pages (20+ lazy-loaded)
LandingPage (guest)

Onboarding

Dashboard (main hub)

Twin (AI Twin interaction — center)

AnalysisPage

ExplorePage (fingerprint/palm/hexagram)

ActivitiesPage (badges, journals)

MePage (profile, settings)

DecisionLoggerPage

VoiceChatPage

TwinProfilePage

LifeHubsPage (12 hubs)

PricingPage

LoginPage (Passkey/OAuth)

PasskeySettings

PrivacyCenter (PDPA)

DailyBriefPage

BadgePage

ComponentShowcase

FeatureMenu

Key Components
TwinEvolution.tsx - Global Twin evolution overlay

ContextualPopup.tsx - Contextual popups renderer

TwinEvolutionSceneWrapper.tsx - Scene component for milestone celebrations

PendingOnboardingSaver.tsx - Auto-save onboarding progress

DecisionForm.tsx ⚠️ TODO: Implement actual API call (line 62)

DecisionLogger.tsx ⚠️ TODO: Implement actual API call (line 77)

🔐 Authentication Flow
Passkey (WebAuthn)
AuthContext.registerPasskey()

Checks isPasskeyAvailable

Imports @/lib/auth/PasskeyProvider

Gets registration options

Registers credential

AuthContext.signInWithPasskey()

Supports biometric unlock

Updates session on success

OAuth (Google/Apple)
AuthContext.signInWithOAuth('google' | 'apple')

Browser redirect to provider

Magic Link (Email passwordless)
AuthContext.signInWithMagicLink(email)

Sends link via email

🧠 Intelligence System
12 SICE Core
PersonalContextBuilder — สังเคราะห์ข้อมูลผู้ใช้

PatternDetector — ตรวจจับรูปแบบพฤติกรรม

InsightEngine — สร้าง Insight

AIFeedbackLoop — ปรับ Personal Model

TwinStateEngine — คำนวณสถานะ Twin

ExperienceEngine — เลือกประสบการณ์

EnvironmentEngine — ปรับ Environment

BadgeEngine — ติดตาม Achievement

BehavioralForecastEngine — ทำนายทิศทาง

FutureSelfEngine — Future Self Projection

MemoryManager — จัดการความจำ

DecisionIntelligenceEngine — วิเคราะห์การตัดสินใจ

Personality Architecture
18 Archetypes (12 base + 6 hybrid)

12 Hub Worlds (Identity, Decision, Relationship, Career, Health, Money, AI-Twin, Learning, Creativity, Spirituality, Impact, Activities)

6 Moods (stressed, confused, confident, drained, ready, reflective)

Result: 1,296 combinations

🐛 Known Issues (from Audit)
Critical
□ PHASE2_TEST_CONSOLE.ts (line 53 in App.tsx) — Test utilities exposed
□ TODO Comments (9 total)
Line 62: DecisionForm - API call not implemented

Line 77: DecisionLogger - API call not implemented

Lines 102,347,357: crypto.ts - CBOR parser & signature verification

Line 593: PersonalContextBuilder - Extend for relationship types

□ console.log (183 total across 41 files)
High
□ Mock data in production components (300+ occurrences)
□ Hardcoded verification in crypto.ts (line 357)
🔗 Key API Endpoints
text
POST /api/personal-model
GET  /api/personal-model/status?userId={id}
POST /chat (selfprintChat wrapper)
📦 Tech Stack
Layer	Technology	Version
Frontend	React	19.2.8
Build	Vite	8.2.0
Language	TypeScript	~6.0.2
Routing	React Router	7.18.2
State	Zustand	5.0.14
Query	TanStack React Query	5.101.4
Database	Supabase	2.112.1
Styling	Tailwind CSS	4.3.3
AI	12 SICE + Claude API	—
Backend	Express + ts-node	4.18.2

Last Updated: 2026-08-14 (UPDATED)
Next Review: After implementation