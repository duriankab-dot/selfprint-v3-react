# SELFPRINT TARGET PRODUCT SPEC

> เอกสารนี้กำหนดเป้าหมายผลิตภัณฑ์สุดท้าย โดยเริ่มจาก REALITY MAP แล้วเติมความต้องการใหม่
> ลำดับ: REALITY → Gap Analysis → TARGET → IMPLEMENTATION PLAN → CODE → TEST → PRODUCTION

---

## 0. DESIGN PRINCIPLES

1. **Mobile-first PWA app** — ไม่ใช่ responsive website แต่เป็น native-like mobile app ที่ deploy ผ่าน web
2. **Immersive chat first** — Twin Chat เป็นหัวใจของผลิตภัณฑ์ ต้องรู้สึกเหมือนคุยกับคนจริง
3. **Cost-aware AI** — ใช้ OpenRouter เลือกโมเดลที่ฟรี/ประหยัดก่อน สวยงามรอง
4. **Minimal chrome** — ซ่อน frame/border ทุกจุดที่ไม่จำเป็น ให้ UI ดู clean ทันสมัย
5. **Code is truth** — ห้ามถือเอกสารเป็นความจริง โค้ดและ DB จริงคือ source of truth

---

## 1. GAP ANALYSIS (REALITY → TARGET)

| Area | Current Reality | Target State | Gap |
|------|----------------|--------------|-----|
| Landing Footer | Footer.tsx exists but NEVER imported anywhere | Footer visible at bottom of LandingPage | NEW: Add Footer import + render |
| Onboarding Visual | No asymmetric visual in onboarding flow | Asymmetric unique shape per user (procedural from traits) | NEW: Procedural visual generator |
| Twin Chat Layout | Scrollable page, WorldTabs visible, navbar absent | Fixed single-page, no scroll, navbar + exit button, hidden frames | CHANGE: Restructure layout |
| Twin Voice | SFXProvider exists but Twin doesn't produce sound | Twin responds with voice/sound effects | NEW: Audio feedback system |
| Dashboard | Many bordered cards, verbose layout | Compact, borderless, minimal chrome | REPAIR: Remove borders, restructure |
| Mobile UX | AppShell with BottomNav + NavRail | Native app feel — safe areas, no nav rail, smooth transitions | CHANGE: Mobile-specific shell |
| AI Provider | Hardcoded claude-3.5-haiku via OpenRouter | Model selection: free → cheap → quality (DeepSeek, Qwen, GLM) | CHANGE: Model routing strategy |

---

## 2. CATEGORIZED ACTION MATRIX

### KEEP (ไม่ต้องแก้ — ทำงานถูกต้องแล้ว)

| Item | File | Reason |
|------|------|--------|
| Auth pipeline (OAuth/MagicLink/Passkey) | AuthContext.tsx | Working correctly, lazy session, proper guards |
| Supabase RLS policies | All migrations | User isolation verified, consistent pattern |
| API auth layer (verifyUser) | api/_utils/verify-user.ts | JWT verification working |
| Stripe integration | unified-handler.ts handleStripe | Checkout/portal/webhook all functional |
| React Query caching | @tanstack/react-query 5.10 | Server-state management solid |
| Zustand stores (user/twin/lifecycle) | src/store/* | Client state pattern correct |
| Language context (EN/TH) | LanguageContext.tsx | i18n working |
| PWA service worker | src/sw.js + VitePWA injectManifest | Push notifications, offline banner work |
| Sentry error tracking | @sentry/react | Monitoring configured |
| Code splitting (React.lazy + codeSplitting.groups) | App.tsx, vite.config.ts | Entry closure optimized |
| ConditionalPrivateProviders (marketing route skip) | App.tsx:332-375 | Heavy providers skipped on marketing routes |
| ProtectedRoute component | ProtectedRoute.tsx | Auth guard working |
| Twin fidelity renderer (FALLBACK/LOW/MEDIUM/HIGH) | Twin.tsx | Quality-adaptive rendering works |
| World expertise tracking | WorldExpertiseService.ts | World interaction recording functional |
| Decision logging/outcomes/follow-ups | decision_store + services | Full decision lifecycle works |
| OpenRouter API provider | functions/api/_utils/ai-provider.ts | REST client working, streaming supported |
| Twin memory persistence | twin_memories table | Messages saved and retrieved correctly |
| Lifecycle state machine | lifecycleStore.ts | ONBOARDING→ANALYSIS→AWAKENING→TWIN_ALIVE→WORLD_ACTIVE |
| Error boundaries | ErrorBoundary.tsx | Global error catching exists |
| SEO metadata (HelmetProvider) | MetaTagManager + getSeoMetadata | Bilingual meta configured |
| Bottom navigation (5 tabs) | BottomNav.tsx | Tab structure correct for mobile |
| AppShell viewport handling | AppShell.tsx + AppShell.css | 100dvh + safe area insets working |

### REPAIR (แก้เล็กน้อย — logic ถูกต้องแต่มี bug/polyfill)

| ID | Item | File | Issue | Fix |
|----|------|------|-------|-----|
| R-01 | Landing Page Footer | LandingPage.tsx | Footer.tsx never imported | Import + render below `<main>` inside AppShell |
| R-02 | Staging URL default | playwright.config.ts:56 | Defaults to staging.selfprint.one (525 SSL) | Change to selfprint-staging.pages.dev |
| R-03 | Dashboard resume banner | Dashboard.tsx:89-108 | Border + shadow visible | Remove border/shadow, make inline |
| R-04 | Dashboard cards | dashboard.css | Multiple bordered card elements | Remove border-radius, border, box-shadow from card classes |
| R-05 | Immersive message bubbles | ImmersiveTwinChat.tsx:694 | Visible border/background frames | Remove frame styling, use flat color blocks |
| R-06 | Tailwind not compiled | index.css | @tailwind directive never imported | Import index.css in main.tsx OR migrate to v4 composition |
| R-07 | Desktop NavRail on mobile | AppShell.tsx | NavRail shows ≥1024px only — OK, but mobile should NOT show it | Verify CSS media query prevents overlap |
| R-08 | Dashboard padding | dashboard.css:4 | Excessive padding on mobile (40px top) | Reduce to clamp(16px, 4vw, 24px) for mobile |
| R-09 | Immersive header buttons | ImmersiveTwinChat.tsx:648-672 | World button has visible border | Remove border, use transparent background |
| R-10 | Landing page post-screen section | LandingPage.tsx:992 | Inline styles instead of CSS classes | Migrate to CSS classes for consistency |

### CHANGE (แก้โครงสร้าง — design/pattern เปลี่ยน)

| ID | Item | Current | Target | Files |
|----|------|---------|--------|-------|
| C-01 | Twin Chat layout | Scrollable full-page with WorldDrawer | Fixed-height single view, messages overflow hidden, input pinned bottom | ImmersiveTwinChat.tsx |
| C-02 | Twin Chat navbar | Absent | Top bar: [← Exit] [Twin Name] [⚙ Settings] — compact, glass effect | ImmersiveTwinChat.tsx |
| C-03 | Twin Chat scrolling | Normal scroll | Disabled vertical scroll on body when in chat; messages area uses internal overflow | ImmersiveTwinChat.tsx, AppShell.css |
| C-04 | Dashboard compactness | 8+ sections with borders | 4 sections, borderless, tighter spacing | Dashboard.tsx, dashboard.css |
| C-05 | Mobile experience | Web-app with NavBar + BottomNav | Pure app feel: no NavBar on app pages, smooth page transitions, haptic-ready | AppShell.tsx, BottomNav.tsx, AppShell.css |
| C-06 | AI model routing | Single hardcoded model | Priority queue: free models (Qwen, DeepSeek) → paid (Claude) only when needed | functions/api/nova.ts, functions/api/twin.ts, NovaAPIService.ts, TwinAPIService.ts |
| C-07 | Mobile viewport detection | CSS media queries only | JS-based device detection for app-like behavior (standalone mode check) | AppShell.tsx |
| C-08 | Bottom nav icons | SVG icons mixed with emoji | All SVG, consistent sizing, active indicator | BottomNav.tsx |

### REMOVE (ลบออก — ไม่ตรงกับ target product)

| ID | Item | File | Reason |
|----|------|------|--------|
| RM-01 | Desktop NavRail on mobile/tablet | AppShell.tsx:59 | Mobile should NEVER show desktop nav rail |
| RM-02 | WorldTabs component | components/WorldTabs.tsx | Immersive chat hides world selector behind single tap drawer |
| RM-03 | ProvenanceStrip in chat | ImmersiveTwinChat.tsx:678 | Not needed in immersive mode — remove from chat flow |
| RM-04 | Decision system indicator badge | ImmersiveTwinChat.tsx:622-631 | Too much chrome — hide by default, show on demand |
| RM-05 | Inline styles in LandingPage | LandingPage.tsx | ~200 lines of inline styles — migrate to CSS classes |
| RM-06 | Ghost imports (unused components) | Various | Remove dead imports identified in forensic audit |

### NEW (เพิ่มใหม่ — ไม่มีในโค้ดปัจจุบัน)

| ID | Item | Description | Files to Create/Modify |
|----|------|-------------|----------------------|
| N-01 | Landing Footer | Add Footer component to LandingPage | LandingPage.tsx |
| N-02 | Procedural Twin Visual | Asymmetric shape generated from user traits (seeded procedural) | lib/twin/twinProceduralVisual.ts (new), ImmersiveTwinChat.tsx |
| N-03 | Twin Voice Feedback | Twin produces subtle audio cues on response (not TTS, just ambient SFX) | components/audio/TwinAudioFeedback.tsx (new), SFXProvider.tsx |
| N-04 | Model Router | OpenRouter model selection layer: free tier first, fallback to paid | lib/ai/modelRouter.ts (new), functions/api/nova.ts, functions/api/twin.ts |
| N-05 | Immersive Navbar | Compact top bar for Twin Chat with exit + settings | components/chat/ImmersiveNavbar.tsx (new) |
| N-06 | Mobile App Shell | Enhanced AppShell with standalone detection, smooth transitions | components/layout/AppShell.tsx, AppShell.css |
| N-07 | Onboarding Visual Step | Asymmetric visual generation during onboarding (step 3-4) | pages/Onboarding.tsx (modify), lib/twin/twinProceduralVisual.ts |
| N-08 | Chat Body Scroll Lock | Prevent body scroll when chat is open, lock to chat area | hooks/useScrollLock.ts (new), ImmersiveTwinChat.tsx |

### DEFER (ยังไม่ได้ทำ — รอภายหลัง)

| ID | Item | Reason | When |
|----|------|--------|------|
| D-01 | k6 load tests | No test files exist — need implementation before testing infrastructure | After production baseline |
| D-02 | /en/twin-birth route | Not implemented, test skipped | When standalone birth page is planned |
| D-03 | /en/twin/:id route | Not implemented, test skipped | When twin profile page is planned |
| D-04 | Fingerprint/NOVA flow in onboarding | Test skipped — flow not implemented | When onboarding redesign is scoped |
| D-05 | Accessibility audit & fixes | Requires systematic audit | P2 after core features |
| D-06 | Performance optimization (Lighthouse) | Bundle already split, needs measurement | After visual changes land |
| D-07 | Selfprint schema RLS policies | Currently bypasses RLS via service_role | Security review phase |
| D-08 | twin_memory vs twin_memories naming | Table naming inconsistency | Schema cleanup phase |
| D-09 | Duplicate decision_patterns migration | Two migrations define same table | Schema consolidation phase |
| D-10 | TypeScript strict types | @ts-nocheck in unified-handler.ts | Type safety improvement |

---

## 3. TARGET PRODUCT — FEATURE SPEC

### 3.1 Landing Page (/en/, /th/)

**Current:** 3 fullscreen screens + post-screen sections (BirthDataInput, IntroSummary, QuickSummary)
**Target:** Same content + Footer restored at bottom

```
[NavBar] ← keep as-is
[Screen 1: "คุณคือใคร"]
[Screen 2: "SELFPRINT อ่านคุณออก"]
[Screen 3: CTA - ให้กำเนิด AI Twin]
[Post-screen: BirthDataInput + Summary]
[Footer] ← NEW: restore from Footer.tsx
```

- Footer: 4-column layout (About, Resources, Security, Follow Us)
- Footer links to all SEO pages (about, science, contact, terms, blog, faq, etc.)
- Footer includes social links (Facebook, Line, Email)
- Footer copyright + privacy/terms links

### 3.2 Onboarding (7-step wizard)

**Steps:** emotion → nova-conversation → ai-creation → blueprint → fine-tune → analysis → claim
**Change:** Add procedural visual generation at steps 3-4 (AI creation + blueprint)

```
Step 1: Emotion Selection     — keep as-is
Step 2: Nova Conversation     — keep as-is
Step 3: AI Creation           — ADD: Procedural asymmetric visual appears
Step 4: Blueprint Generation  — ADD: Visual morphs based on blueprint data
Step 5: Fine-tuning           — keep as-is
Step 6: SICE Analysis         — keep as-is
Step 7: Claim Twin            — keep as-is
```

**Procedural Visual Design:**
- Generated from user traits: birth date, mood, archetype, SICE scores
- Deterministic: same user = same shape every time (seeded random)
- Asymmetric: never a perfect circle/sphere — organic, unique form
- Each user gets a unique shape — no two twins look identical
- Color derived from mood/archetype
- Rendered as canvas 2D or lightweight WebGL
- Lives inside onboarding wizard step, NOT a separate route

### 3.3 Immersive Twin Chat (/en/chat/twin)

**Current:** Scrollable full-page, WorldTabs visible, no navbar, messages scroll normally
**Target:** Fixed-height immersive single view, navbar, no body scroll, hidden frames

```
┌──────────────────────────────────────┐
│ [←]  💫 Your Twin — Mind      [⚙]   │ ← IMMERSIVE NAVBAR (compact, glass)
├──────────────────────────────────────┤
│                                      │
│  [Twin Visual — centered, floating]  │ ← Asymmetric procedural shape
│                                      │
├──────────────────────────────────────┤
│                                      │
│  Twin: "สวัสดีครับ มีอะไรให้ช่วย?"    │
│                                      │
│                    ผม: "ช่วยวิเคราะห์" │ ← Message bubbles (no borders)
│                                      │
├──────────────────────────────────────┤
│ [Type a message...]          [Send]  │ ← Input pinned bottom
└──────────────────────────────────────┘
```

**Layout Rules:**
- Page height = 100dvh (dynamic viewport height)
- Body scroll LOCKED when chat is open
- Header: fixed 56px, glassmorphism background
- Content: fixed space between header and input
- Messages area: flex-grow, overflow-y auto (internal scroll only)
- Input: fixed bottom, safe-area-inset-bottom respected
- Twin visual: centered in available space above messages
- NO horizontal scroll ever
- NO visible borders on message bubbles — flat color blocks only

**Immersive Navbar:**
- Height: 56px on mobile, 64px on desktop
- Left: back arrow (exit chat → return to previous page)
- Center: Twin name + world indicator (e.g., "💫 Mind")
- Right: settings gear (opens world drawer as overlay, not separate component)
- Glass effect: backdrop-filter blur, semi-transparent background
- Auto-hide on scroll down, show on scroll up (optional)

**Exit Behavior:**
- Back arrow navigates to previous route (useHistory.goBack)
- If coming from Dashboard → go to /dashboard
- If coming from Landing → go to /en/
- Confirmation dialog if unsent message exists

### 3.4 Twin Voice Interaction

**Current:** SFXProvider plays generic SFX (clicks, transitions). Twin does NOT produce voice.
**Target:** Twin produces subtle audio feedback on responses

**Audio Feedback System:**
- When Twin sends a message: play subtle "chime" or "ping" (world-dependent tone)
- When user sends a message: play soft "tap" confirmation
- World transitions: play ambient whoosh (subtle, non-intrusive)
- Error states: play low warning tone
- All audio optional — toggle in settings
- Volume controlled by SFXProvider volume slider
- No TTS (text-to-speech) — just ambient audio cues
- Audio files: generated procedurally via Web Audio API (no external assets needed)
- Frequency: max 1 sound per 2 seconds (debounce)

**Implementation:**
- New component: `TwinAudioFeedback` — listens to message changes via useEffect
- Uses Web Audio API (OscillatorNode) for procedural tones — no asset files needed
- Tone mapping: each WorldId → unique frequency (Mind=440Hz, Love=528Hz, etc.)
- Debounce: prevent rapid-fire sounds during streaming
- Accessibility: respect `prefers-reduced-motion` → disable audio

### 3.5 Dashboard (/en/dashboard)

**Current:** 8+ sections with visible borders, shadows, gradients — verbose
**Target:** Compact, borderless, 4 sections maximum

```
┌──────────────────────────────────────┐
│ Good morning, [Name]                 │ ← TodaySection (header variant)
├──────────────────────────────────────┤
│      [Twin Visual — compact]         │ ← LivingTwin (smaller, no frame)
├──────────────────────────────────────┤
│  ✨ One primary insight...           │ ← ExecutiveSummary (no card bg)
├──────────────────────────────────────┤
│  [💬 Explore with Twin →]            │ ← Recommended action (button only)
├──────────────────────────────────────┤
│  Recent: 3 decisions preview         │ ← Decision preview (list only, no card)
└──────────────────────────────────────┘
```

**Changes:**
- Remove ALL border declarations from dashboard sections
- Remove box-shadow from all cards
- LivingTwin: smaller size, no container frame
- ExecutiveSummary: text-only, no card background
- Resume banners: inline text + button, no border/shadow
- Decision preview: simple list, no card wrapper
- Total vertical sections: 8 → 4
- Padding reduced: 40px → clamp(16px, 4vw, 24px)
- Background: dark navy gradient stays (premium feel)

### 3.6 Mobile Experience

**Current:** AppShell with conditional NavBar/BottomNav based on CSS breakpoints
**Target:** Native app feel — seamless transitions, safe areas, no web chrome

**App Shell Redesign:**
- Mobile (≤1023px): ONLY BottomNav — NO NavBar, NO NavRail
- Desktop (≥1024px): NavRail on left side, content fills rest
- Page transitions: slide-fade on mobile (CSS transition)
- Safe area insets: env(safe-area-inset-top/bottom/left/right) applied
- Viewport: 100dvh (dynamic, handles mobile browser chrome)
- Standalone mode detection: `window.matchMedia('(display-mode: standalone)').matches`
- Pull-to-refresh: disabled (prevent accidental reloads)
- Touch targets: minimum 44px (Apple HIG compliant)
- Keyboard handling: input moves above keyboard on iOS/Android

**Bottom Nav Enhancement:**
- Active tab indicator: underline + icon color change
- Ripple effect on tap (material design style)
- Label text: Thai/English based on language setting
- Icons: all SVG, no emoji
- Tab order: Today | Worlds | Twin | Explore | Me

### 3.7 AI Model Routing

**Current:** Hardcoded `claude-3.5-haiku` via OpenRouter
**Target:** Priority-based model selection — free/cheap first, quality fallback

**Model Priority Queue:**

| Priority | Model | Provider | Cost | Use Case |
|----------|-------|----------|------|----------|
| 1 | qwen-plus | Qwen | ~$0.003/1K tokens | Daily chat, general questions |
| 2 | deepseek-v3 | DeepSeek | ~$0.005/1K tokens | Analysis, reasoning tasks |
| 3 | glm-4 | Zhipu | ~$0.007/1K tokens | Creative writing, stories |
| 4 | qwen-turbo | Qwen | FREE tier | Low-priority, quick responses |
| 5 | anthropic/claude-3.5-haiku | Anthropic | ~$0.008/1K tokens | Complex reasoning, fallback |
| 6 | anthropic/claude-3.5-sonnet | Anthropic | ~$0.003/1K tokens | Premium feature, opt-in |

**Routing Logic:**
```
function selectModel(context: CallContext): string {
  // Always use free/cheap models for routine chat
  if (context.type === 'chat') return 'qwen-plus';
  if (context.type === 'analysis') return 'deepseek-v3';
  if (context.type === 'creative') return 'glm-4';
  if (context.type === 'quick') return 'qwen-turbo';
  
  // Fallback to Claude only when explicitly needed
  if (context.needsHighQuality) return 'anthropic/claude-3.5-haiku';
  
  return 'qwen-plus'; // default
}
```

**Configuration:**
- Default models set via env vars: `NOVA_MODEL_ID`, `TWIN_MODEL_ID`
- Admin override: `/settings` allows users to choose "fast/cheap" vs "best quality"
- Model choice logged for cost analytics
- Fallback: if selected model fails → try next in queue (max 3 retries)

**Files Modified:**
- `functions/api/nova.ts` — use model router instead of hardcoded model
- `functions/api/twin.ts` — use model router
- `functions/api/nova-stream.ts` — use model router
- `functions/api/twin-stream.ts` — use model router
- `NovaAPIService.ts` — pass model selection to API
- `TwinAPIService.ts` — pass model selection to API
- New: `lib/ai/modelRouter.ts` — model selection logic

---

## 4. IMPLEMENTATION ORDER

### Phase 1: Foundation Repairs (R-01 through R-10)

These are low-risk, high-impact fixes that don't change architecture:

1. **R-01**: Add Footer to LandingPage
2. **R-02**: Fix staging URL in playwright.config.ts
3. **R-03/R-04/R-05**: Remove borders/shadows from Dashboard + Chat
4. **R-06**: Fix Tailwind compilation (import index.css in main.tsx)
5. **R-07-R-10**: Polish remaining issues

### Phase 2: Structure Changes (C-01 through C-08)

These require layout restructuring:

6. **C-01/C-02/C-03**: Restructure ImmersiveTwinChat layout + navbar + scroll lock
7. **C-04**: Compact Dashboard redesign
8. **C-05**: Mobile App Shell enhancement
9. **C-06**: AI Model Router implementation
10. **C-07/C-08**: Device detection + icon standardization

### Phase 3: New Features (N-01 through N-08)

These add new functionality:

11. **N-01**: (Already covered by R-01)
12. **N-02/N-07**: Procedural Twin Visual generator
13. **N-03**: Twin Audio Feedback system
14. **N-04**: (Already covered by C-06)
15. **N-05**: Immersive Navbar component
16. **N-06**: (Already covered by C-05)
17. **N-08**: useScrollLock hook

### Phase 4: Cleanup & Defer

18. **RM items**: Remove dead code/imports
19. **D items**: Document as deferred, do not implement

---

## 5. FILE MODIFICATION INDEX

### Files to CREATE (New)

| File | Purpose |
|------|---------|
| `lib/twin/twinProceduralVisual.ts` | Procedural asymmetric shape generator |
| `components/chat/ImmersiveNavbar.tsx` | Compact top bar for Twin Chat |
| `hooks/useScrollLock.ts` | Body scroll lock hook |
| `lib/ai/modelRouter.ts` | OpenRouter model selection logic |
| `components/audio/TwinAudioFeedback.tsx` | Procedural audio feedback for Twin |

### Files to MODIFY

| File | Changes | Category |
|------|---------|----------|
| `src/pages/LandingPage.tsx` | Import + render Footer | N-01 / R-01 |
| `src/pages/ImmersiveTwinChat.tsx` | Layout restructuring, navbar, scroll lock, remove frames | C-01/C-02/C-03 / N-05 / N-08 |
| `src/pages/Dashboard.tsx` | Compact layout, remove border wrappers | C-04 |
| `src/styles/dashboard.css` | Remove all border/radius/shadow from card classes | R-03/R-04 |
| `src/components/layout/AppShell.tsx` | Mobile-only mode, standalone detection | C-05 / N-06 |
| `src/components/layout/AppShell.css` | Safe area, page transitions, mobile overrides | C-05 / N-06 |
| `src/components/layout/BottomNav.tsx` | SVG-only icons, active indicator | C-08 |
| `functions/api/nova.ts` | Model routing | C-06 / N-04 |
| `functions/api/twin.ts` | Model routing | C-06 / N-04 |
| `functions/api/nova-stream.ts` | Model routing | C-06 / N-04 |
| `functions/api/twin-stream.ts` | Model routing | C-06 / N-04 |
| `src/services/NovaAPIService.ts` | Pass model to API | C-06 |
| `src/services/TwinAPIService.ts` | Pass model to API | C-06 |
| `src/pages/Onboarding.tsx` | Add procedural visual at steps 3-4 | N-07 |
| `src/components/audio/SFXProvider.tsx` | Integrate TwinAudioFeedback | N-03 |
| `playwright.config.ts` | Fix staging URL default | R-02 |
| `src/main.tsx` | Import index.css for Tailwind | R-06 |

### Files to REVIEW (minimal changes)

| File | Review | Category |
|------|--------|----------|
| `src/components/ProtectedRoute.tsx` | Verify exit behavior from chat | C-02 |
| `src/context/SFXProvider.tsx` | Audio debounce + accessibility | N-03 |
| `src/hooks/useLangNavigate.ts` | Navigation history for exit | C-02 |
| `e2e/smoke.spec.ts` | Update selectors if UI changes | Regression |
| `e2e/twin.spec.ts` | Update chat-related assertions | Regression |

---

## 6. VALIDATION CRITERIA

### Landing Page
- [ ] Footer renders at bottom with all 4 link groups
- [ ] Footer links navigate correctly
- [ ] No horizontal overflow on any breakpoint
- [ ] Footer respects safe-area-inset on mobile

### Twin Chat
- [ ] Page height = 100dvh, no body scroll
- [ ] Navbar visible with exit button, twin name, settings
- [ ] Exit button returns to previous page
- [ ] Messages scroll internally (not body scroll)
- [ ] Input pinned to bottom, above keyboard on mobile
- [ ] No visible borders on message bubbles
- [ ] Twin visual centered and fixed position

### Dashboard
- [ ] Zero visible borders on any card/section
- [ ] Four or fewer distinct sections
- [ ] LivingTwin displays without container frame
- [ ] Vertical padding ≤ 24px on mobile
- [ ] Resume banners display inline without borders

### Mobile
- [ ] No NavBar visible on app pages (≤1023px)
- [ ] Only BottomNav visible on mobile
- [ ] NavRail hidden on mobile
- [ ] Page transitions smooth (slide-fade)
- [ ] Touch targets ≥ 44px
- [ ] Safe area insets applied (notch/home indicator)
- [ ] Keyboard pushes input above itself

### AI Models
- [ ] Default model is qwen-plus (free/cheap)
- [ ] Model selection logged
- [ ] Fallback to next model on failure
- [ ] Admin can override model preference
- [ ] Streaming works with all models

### Audio
- [ ] Twin produces sound on message receive
- [ ] Sound is world-dependent (unique frequency per world)
- [ ] Audio debounced (max 1 per 2 seconds)
- [ ] Respects prefers-reduced-motion
- [ ] Toggle in settings controls audio on/off

---

## 7. RISK ASSESSMENT

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Procedural visual breaks existing Twin identity | Medium | Low | Keep current Three.js renderer as HIGH fidelity option |
| Scroll lock conflicts with native gestures | High | Medium | Implement touch-action CSS property alongside JS lock |
| Model downgrade causes poor responses | Medium | High | Allow user opt-in to "best quality" mode |
| Mobile-only shell breaks desktop experience | High | Low | Feature flag: mobile-shell enabled only on ≤1023px |
| Audio feedback annoys users | Low | Medium | Default OFF, explicit opt-in required |
| Removing borders breaks layout expectations | Low | Medium | Provide CSS custom properties for easy theme override |
| Footer breaks landing page CTA conversion | Low | Low | Footer appears AFTER CTA section, not before |

---

## 8. DEFINED TERMINOLOGY

| Term | Definition |
|------|-----------|
| **Twin** | The user's personal AI entity — created during Core Awakening, lives in chat |
| **Nova** | General assistant — pre-Twin guide, not personalized to user |
| **World** | One of 12 intelligence domains (Mind, Love, Career, etc.) that contextualizes Twin responses |
| **SICE** | Science, Intuition, Creative, Experience — 4-dimension personality scoring |
| **Blueprint** | User's behavioral profile generated from analysis |
| **Archetype** | Personality type derived from blueprint (e.g., Sage, Warrior, Healer) |
| **Immersive Chat** | The full-screen, no-scroll Twin conversation experience |
| **Procedural Visual** | Asymmetric shape generated algorithmically from user traits |
| **RLS** | Row Level Security — PostgreSQL feature for row-level data isolation |
| **100dvh** | Dynamic viewport height — accounts for mobile browser chrome |
| **Safe Area** | Screen region not obscured by notches, home indicators, rounded corners |

---

## 9. DOCUMENTATION CONFLICTS WITH TARGET

| Doc | Claims | Reality | Target Correction |
|-----|--------|---------|-------------------|
| README.md | "Tailwind CSS v4 configured" | Plugin loaded but CSS never compiled | Update: "Tailwind v4 plugin loaded, manual CSS needed" |
| README.md | Footer visible on landing | Footer.tsx exists but never imported | Update screenshot + description |
| README.md | k6 load tests available | No test files exist | Remove k6 references or mark as deferred |
| MASTER_GATE_AS_IS.md | Staging bundle state claims | Requires live verification | Mark as UNKNOWN until verified |
| FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md | Various production claims | Requires DB verification | Mark as UNKNOWN until verified |

---

## 10. PRODUCTION GATE TARGET

After all repairs and changes:

| Gate | Target Status |
|------|---------------|
| TypeScript 0 errors | ✅ |
| Lint 0 errors | ✅ |
| Build PASS | ✅ |
| Unit tests PASS | ✅ |
| E2E Phase A PASS | ✅ |
| E2E Mobile PASS | ✅ |
| E2E Phase B PASS | ✅ |
| Footer renders on Landing | ✅ NEW |
| Twin Chat: no body scroll | ✅ NEW |
| Twin Chat: navbar present | ✅ NEW |
| Dashboard: zero borders | ✅ NEW |
| Mobile: app-like feel | ✅ NEW |
| AI: free model default | ✅ NEW |
| Audio: optional feedback | ✅ NEW |
| No P0 blockers | ✅ |
| No unresolved P1 | ✅ |

---

## 11. NEXT STEPS

1. **User confirms this spec** — approve or request modifications
2. **Implementation begins** following the phased order (Phase 1 → 2 → 3 → 4)
3. **Each phase validated** against criteria in Section 5 before proceeding
4. **Final regression** — run all tests, verify no regressions
5. **Production deployment** — only when all gates pass

---

> **สถานะ:** Spec พร้อมรีวิว — รอการยืนยันจากผู้ใช้เพื่อเริ่มดำเนินการตามลำดับความสำคัญ
> **Flow:** REALITY → TARGET PRODUCT SPEC → IMPLEMENTATION PLAN → CODE → TEST → PRODUCTION
