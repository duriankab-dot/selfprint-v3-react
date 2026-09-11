# SELFPRINT LIVING INTELLIGENCE — AS-IS AUDIT + CHANGE MAP

**Baseline commit:** `ab42e3e584052d75862e20f7fc0aec558fe18d67`  
**Date:** 2026-09-11  
**Status:** Implementation-ready (plan_exit)

---

## 0. FOREWORD — HELD ARCHITECTURE

สิ่งต่อไปนี้ถือว่า **protected architecture** — ห้ามเปลี่ยนโดยไม่มี defect ที่พิสูจน์ได้:

| Layer | Status | Key Files |
|-------|--------|-----------|
| Database / Supabase / Auth / RLS | PROTECTED | `src/lib/supabase/`, `supabase/migrations/*.sql` |
| Cloudflare Functions / APIs | PROTECTED | `functions/api/*.ts` |
| SICE Orchestrator + 12 engines | PROTECTED | `src/services/sice/` |
| Twin business logic | PROTECTED | `TwinContext.tsx`, `TwinSupabaseService.ts` |
| Twin creation / Core Awakening | PROTECTED | `CoreAwakeningService.ts`, `CoreAwakening.tsx` |
| Memory system | PROTECTED | `src/lib/memory/` |
| Evolution logic | PROTECTED | `TwinEvolutionService.ts` |
| Canonical app state | PROTECTED | `store/*.ts`, contexts |

**New layer ที่จะเพิ่ม:** Visual Interpretation Layer → Twin/World/UI Renderer

---

## 1. CURRENT ARCHITECTURE CONFIRMED

### Technology Stack
- **Framework:** React 19.2 + Vite 8 (Rolldown) + TypeScript ~6.0
- **Routing:** react-router-dom 7.18 (BrowserRouter, bilingual `/en/*` + `/th/*`)
- **State:** Zustand (5 stores), React Context (15 contexts)
- **Data:** Supabase (lazy singleton), TanStack Query 5
- **AI Provider:** OpenRouter REST API via `functions/api/_utils/ai-provider.ts`
- **Styling:** Tailwind CSS 4.3 + CSS variables (tokens.css, 30+ CSS files)
- **Visual Rendering:** Canvas 2D (HologramBirth) + Procedural SVG (TwinPresence, WorldEnvironment) + CSS animations
- **Three.js/WebGL:** ไม่มีโดยออกแบบ (DEADDEP-001) — FALLBACK/LOW/MEDIUM fidelity pattern
- **Audio:** Web Audio API (SoundscapePlayer), SFXProvider, useSoundscape hook
- **Build:** Rolldown codeSplitting groups (supabase-lazy, vendor-react/router/query/state, chunk-intelligence, decision-services)

### Provider Stack (outer→inner in App.tsx)
```
HelmetProvider → Router → ThemeProvider → AuthProvider → EmotionProvider
→ TwinProvider → LanguageProvider → ConditionalPrivateProviders
  (AI/Hub/World/Subscription/Experience/Audio/SFX/Environment/Evolution/Popup)
→ Routes (45 pages, all React.lazy)
```

### Chunk Strategy
- Critical path: marketing routes skip heavy provider stack
- Intelligence chunk lazy-loaded
- Decision services lazy-loaded from TwinContext.saveDecision

---

## 2. CURRENT APP SHELL

**File:** `src/components/layout/AppShell.tsx` (+ `AppShell.css`)

### Architecture
- Mobile-first PWA layout: `100dvh`, safe-area insets
- Desktop NavRail (≥1024px) + Mobile BottomNav (≤1023px)
- Optional NavBar header for SEO/public pages
- Props: `children`, `showHeader`, `header`, `hideNav`, `forceShowNav`
- Used by ~30 pages

### Assessment
- **KEEP** — Ownership ไม่แตก, รองรับ immersive mode ผ่าน `hideNav`
- Immersive screens ใช้ `hideNav={true}` เพื่อซ่อน navigation
- **ห้ามสร้าง AppShell คู่ขนาน**

---

## 3. CURRENT TWIN IMPLEMENTATION

### 3.1 Facade Pattern

**File:** `src/components/twin/Twin.tsx`

Facade ที่ resolve renderer ตาม device capability:

| Fidelity | Renderer | Description |
|----------|----------|-------------|
| FALLBACK | TwinFallbackRenderer | Static gradient, zero motion |
| LOW | TwinLowRenderer | CSS-only breathing orb |
| MEDIUM | TwinPresence | Full-detail SVG glyph |
| HIGH | TwinPresence | Same as MEDIUM (WebGL not built) |

**variant="birth"** delegates to HologramBirth (canvas 2D)

### 3.2 Twin Presence (SVG Renderer)

**File:** `src/components/twin/TwinPresence.tsx` (521 lines)

Two-layer architecture:
1. **CORE IDENTITY** — constant across Worlds (from `twinVisualDNA.ts`, archetype-based)
2. **CONTEXTUAL STATE** — per World/mood/time (from `--twin-*` CSS vars via EnvironmentEngine)
3. **worldColor** — thin aura-ring tint only

Components inside:
- `CoreGlyph` — shape family (sphere/crystal/ring/diamond/bloom/wave)
- `OrbitFacets` — orbiting constellation (per-Twin unique)
- `TwinAccessory` — contextual accessory per World (12 kinds)
- `ExpressionGlint` — contextual "expression" warmth
- Evolution rings (stage 3+)

### 3.3 Visual DNA System

**Files:**
- `src/lib/twin/twinVisualDNA.ts` — deterministic core color/shape from archetype
- `src/lib/twin/twinUniqueness.ts` — per-user unique traits (seedKey-derived: facetCount, jitter, orbit, pulseSpeedFactor, etc.)
- `src/lib/twin/twinWorldContext.ts` — world posture/accessory/expression mapping
- `src/hooks/useTwinIdentity.ts` — shared hook (evolutionStage, glowMult, dna, traits, colors, worldCtx)

### 3.4 Twin Context

**File:** `src/context/TwinContext.tsx`

Manages: `twin`, `loading`, `error`, `currentWorld`, `createTwin`, `hydrateTwin`, `updateTwin`, `setMaturityScore`, `setCurrentWorld`, `recommendWorld`, `saveDecision`, `resetTwin`

Loads from Supabase on auth change. Maps snake_case DB → camelCase TS.

### 3.5 Current Issues in Twin Chat

**File:** `src/pages/TwinChat.tsx` (965 lines)

**Problems identified:**
1. ❌ `WorldTabs` rendered inline — competes visually with Twin
2. ❌ `TwinNav` rendered above chat — adds visual competition
3. ❌ `StoryModeSelector` rendered inline — competes with Twin
4. ❌ `ChoiceConsequence` rendered inline — competes with Twin
5. ❌ `WorldContextHeader` rendered inline — adds UI clutter
6. ❌ Twin rendered small (88×88 contained) in header — not full presence
7. ❌ Dashboard-style layout with cards, tabs, selectors around conversation
8. ❌ NOT an immersive living space per specification

### 3.6 Other Twin Components

| File | Role | Status |
|------|------|--------|
| `TwinNav.tsx` | Tab nav (Conversation/What Twin Knows/Personality/Settings) | KEEP but hide in immersive mode |
| `TwinSynthesis.tsx` | Personality synthesis UI | KEEP |
| `TwinNaming.tsx` | Naming ceremony | KEEP |
| `TwinEvolution.tsx` | Evolution tracking | KEEP |
| `LivingTwin.tsx` (dashboard) | Dashboard twin orb | EXTEND (use same hook) |
| `TwinAvatar.tsx`, `TwinProfile.tsx`, `TwinStatsCard.tsx` | Profile components | KEEP |

---

## 4. CURRENT BIRTH IMPLEMENTATION

**File:** `src/components/twin/HologramBirth.tsx` (371 lines)

### Architecture
- Canvas 2D particle system (200 particles)
- 5 phases, ~4 seconds total
- Deterministic seeded PRNG from `seedKey` + archetype
- Particle → Asymmetric Living Seed → Twin Emerges
- NO predefined shapes (no sphere/crystal/ring presets)

### Phases
1. **Phase 1 (0–30%):** Particles scattered in void
2. **Phase 2 (30–60%):** Attraction — particles gravitate asymmetrically
3. **Phase 3 (60–80%):** Living seed forms — organic shape emerges
4. **Phase 4 (80–95%):** Silhouette stabilizes — breathing/wobble begins
5. **Phase 5 (95–100%):** Reveal

### Visual DNA Integration
- Uses `getTwinVisualDNA()` for core color
- Uses `getUniqueTwinTraits()` for asymmetry, facets, pulse
- Growth bias, density center, breathing speed all per-Twin

### Birth Page

**File:** `src/pages/CoreAwakening.tsx`

Full-screen ceremony page. Currently has progress UI elements that may compete with birth animation.

### Assessment
- **KEEP** — Birth animation architecture matches spec
- **EXTEND** — Ensure canonical Twin continuity post-birth
- Verify visual DNA persistence from Birth → TwinChat

---

## 5. CURRENT WORLD IMPLEMENTATION

### 5.1 World Constants

**File:** `src/constants/worlds.ts`

12 Hub Worlds: self, mind, relationship, love, career, wealth, life, growth, decision, purpose, wellbeing, future

Each has: id, name, nameTh, color, archetype, description

### 5.2 World Environment Renderer

**File:** `src/components/world/WorldEnvironment.tsx` (335 lines)

Full-screen procedural SVG environment background:
- One `ArchetypePattern` per world (unique SVG geometry per archetype)
- Animated via CSS keyframes (spin/pulse/drift)
- Adapts to EnvironmentEngine (time-of-day, mood, particle speed)
- LightingEngine's `--lighting-filter` applied
- TimeOfDayEngine's `--tod-bg-tint` overlay

### 5.3 World Context & Routing

**Files:**
- `src/context/WorldContext.tsx` — current world state
- `src/context/EnvironmentContext.tsx` — time-of-day, mood, particles
- `src/services/world-routing/` — world routing logic
- `src/services/world-prompts/` — world-specific prompts
- `src/lib/worlds/` — world intelligence
- `src/lib/worldRecommender.ts` — world recommendation
- `src/lib/worldSystemPromptBuilder.ts` — prompt building

### 5.4 World Pages

| File | Role | Status |
|------|------|--------|
| `WorldsHub.tsx` | World selection hub | KEEP |
| `WorldDetail.tsx` | World detail page | KEEP (but adapt for immersion) |
| `LifeHubsPage.tsx` | Life hubs overview | KEEP |
| `WorldStoryPanel.tsx` | World narrative panel | KEEP |
| `WorldTabs.tsx` | World selector tab bar | MOVE to progressive disclosure |

### Assessment
- World system is well-architected
- **EXTEND** — World transition needs narrative grammar (attraction, pull, absorption, dissolve, etc.)
- **MOVE** — WorldTabs from inline to drawer/sheet/overlay in Twin Chat

---

## 6. CURRENT CHAT IMPLEMENTATION

### 6.1 Twin Chat

**File:** `src/pages/TwinChat.tsx`

Current features:
- Message send/receive via `callTwinAPI`
- Memory persistence to `twin_memories` table
- SICE context injection (fullAnalysis, userProfile, memories)
- World-aware expertise (`recordWorldInteraction`)
- Decision logging (`DecisionService.recordDecision`)
- Choice consequence display
- Story mode selector (§51)
- Language support (Thai/English)

### 6.2 Nova Chat

**File:** `src/pages/NovaChat.tsx`

General AI assistant chat (separate from Twin). Wrapped in NovaProvider.

### 6.3 Chat Infrastructure

**Files:**
- `src/features/chat/hooks/useChat.ts` — chat state/send logic
- `src/components/chat/ChatWindow.tsx` — generic chat window
- `src/components/chat/FloatingSelfprintChat.tsx` — global draggable button
- `src/components/chat/WorldContextHeader.tsx` — world context indicator
- `src/components/chat/TypingIndicator.tsx` — typing animation
- `functions/api/twin.ts`, `twin-stream.ts` — server endpoints
- `functions/api/nova.ts`, `nova-stream.ts` — Nova server endpoints

### Assessment
- Chat business logic is production-quality
- **KEEP** all chat logic (send, receive, memory, SICE context)
- **CHANGE** visual presentation → immersive living space
- **REMOVE** visual competitors (WorldTabs, TwinNav, StoryModeSelector, ChoiceConsequence from main flow)
- **MOVE** secondary info to progressive disclosure

---

## 7. EXISTING SVG / ANIMATION SYSTEMS

### 7.1 SVG Systems

| Component | File | Purpose |
|-----------|------|---------|
| TwinPresence | `twin/TwinPresence.tsx` | Main Twin SVG renderer |
| WorldEnvironment | `world/WorldEnvironment.tsx` | World SVG patterns |
| TwinEvolutionScene | `TwinEvolutionScene.tsx` | Milestone-30 celebration |
| NovaAvatar | `NovaAvatar.tsx` | Nova avatar (separate) |

### 7.2 Animation Systems

| System | Location | Description |
|--------|----------|-------------|
| CSS Keyframes | `src/styles/*.css` (30 files) | Breathing, bobbing, spinning, pulsing, drifting |
| Canvas 2D | `HologramBirth.tsx` | Birth particle animation (requestAnimationFrame) |
| Experience Engines | `src/lib/experience/` | EnvironmentEngine, LightingEngine, ParticleSystemEngine, TimeOfDayEngine, EmotionSignalEngine, TwinStateEngine, SoundscapeEngine |
| CSS Var Driven | Multiple | `--twin-*` vars from EnvironmentEngine → TwinPresence consumer |

### 7.3 Motion Grammar

- `twin-presence-breathe` — brightness oscillation (contextual duration)
- `twin-presence-bob` — vertical translation + scale
- `twin-low-breathe` — LOW fidelity breathing
- `twin-evo-ring-spin` — evolution ring rotation (stage 3+)
- `world-env-spin/pulse/drift` — world environment animations
- All durations modulated by CSS custom properties (`--twin-pulse-speed`, `--twin-world-breathe-mult`, etc.)

### Assessment
- Animation system is well-structured
- **KEEP** existing animation infrastructure
- **EXTEND** with world transition animations (attraction, pull, absorption, dissolve)
- **RESPECT** `reduceMotion` preference from AudioContext

---

## 8. EXISTING STYLES AND DESIGN TOKENS

### 8.1 Token System

**File:** `src/styles/tokens.css` (387 lines)

Design Tokens V3.1:
- Color palette (navy-900/800/700, purple-base/light, grays, status)
- Typography (h1-h5, body-large/base/small, caption, code)
- Spacing (xs through 3xl)
- Motion/easing (hub, mood, base durations; primary/secondary easing)
- 10 mood themes (reflective, ready, calm, focused, energetic, curious, stressed, confused, confident, drained)
- Dark mode overrides (navy-blue surfaces)

### 8.2 Component/Page Styles (30+ CSS files)

| Category | Files |
|----------|-------|
| Core | `global.css`, `index.css`, `App.css` |
| Twin | `living-twin.css`, `twin-evolution.css`, `twin-nav.css`, `twin-personality.css`, `twin-profile.css`, `twin-settings.css`, `twin-synthesis.css`, `nova-twin.css` |
| World | `world-tabs.css`, `worlds-hub.css`, `life-hubs-page.css`, `world-story.css` |
| Chat | `core-awakening.css` |
| Features | `analysis.css`, `badge-gallery.css`, `confidence-indicator.css`, `daily-brief.css`, `dashboard.css`, `decision-*.css`, `growth-space.css`, `hub-themes.css`, `mood-themes.css`, `pricing.css`, `privacy.css`, `voice-twin.css` |

### 8.3 Known Token Issues
- CARDBG-001: `--color-bg-card` was undefined, aliased to `--color-bg-secondary`
- TOKEN-ALIAS-001: shorthand tokens were undefined, now aliased
- DARKMOOD-001: Mood accents needed dark-mode overrides (flat selectors used)
- DARK_MODE_SMALL_TEXT_CONTRAST: Small text on navy-800 cards fails WCAG AA with mood accents — use `#A5B4FC` fixed

### Assessment
- Token system is mature
- **KEEP** all token definitions
- **ADD** visual grammar tokens for immersive layers (layer z-index order, glass rules, transition durations)
- **FIX** dark mode small text contrast constraint

---

## 9. EXISTING AUDIO

### 9.1 Audio Architecture

| Component | File | Purpose |
|-----------|------|---------|
| AudioProvider | `context/AudioContext.tsx` | Global audio state (type, music/sound/voice enabled, volume, ducking, reduceMotion) |
| SFXProvider | `components/audio/SFXProvider.tsx` | SFX context (ui, twin, transition play methods) |
| SoundscapePlayer | `components/audio/SoundscapePlayer.tsx` | Web Audio API ambient music (AudioContext + gain nodes, ducking, crossfade) |
| AudioSettings | `components/audio/AudioSettings.tsx` | User audio controls |

### 9.2 Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useSoundscape` | `hooks/useSoundscape.ts` | Soundscape management |
| `useSoundscapeAudioLoader` | `hooks/useSoundscapeAudioLoader.ts` | Audio asset loading |
| `useAudioDucking` | `hooks/useAudioDucking.ts` | Audio ducking behavior |
| `useUISFX` | `hooks/useUISFX.ts` | UI sound effects |
| `useTwinSFX` | `hooks/useTwinSFX.ts` | Twin-specific SFX |
| `useTransitionSFX` | `hooks/useTransitionSFX.ts` | Transition SFX |
| `useWorldAmbientTone` | `hooks/useWorldAmbientTone.ts` | World-specific ambient |

### 9.3 Services & Libraries

| File | Purpose |
|------|---------|
| `services/audioManager.ts` | Central audio management |
| `services/adaptive-audio-engine.ts` | Adaptive audio based on state |
| `lib/audio/synthesizeAmbientDrone.ts` | Web Audio drone synthesis |
| `lib/experience/SoundscapeEngine.ts` | Soundscape recommendations |

### 9.4 Assets

`public/audio/` — ui/, twin/, transition/, environment/, soundscapes/
`public/soundscape-manifest.json` — Asset manifest

### Assessment
- Audio system is production-quality
- **KEEP** all audio infrastructure
- **EXTEND** with state-based audio behaviors per spec (IDLE, LISTENING, THINKING, RESPONDING, WORLD TRANSITION, ABSORB, GROWTH, TWIN BIRTH)
- Already respects browser audio permission and user gesture requirements

---

## 10. FILE IMPACT MAP

### Phase 0: Forensic Visual Audit (No Code Changes)

| File | Action | Reason | Risk | Dependencies |
|------|--------|--------|------|--------------|
| `src/components/layout/AppShell.tsx` | KEEP | Layout ownership intact | None | None |
| `src/components/layout/BottomNav.tsx` | KEEP | Used by AppShell | Low | AppShell |
| `src/components/layout/NavRail.tsx` | KEEP | Used by AppShell | Low | AppShell |
| `src/components/layout/NavBar.tsx` | KEEP | Public pages | Low | AppShell |
| `src/App.tsx` | KEEP | Provider tree + routes | Medium | All providers |
| `src/styles/tokens.css` | KEEP | Token foundation | Low | All styled components |
| `src/styles/global.css` | KEEP | Global resets | Low | All pages |
| All 30+ CSS files | AUDIT | Check for obsolescence after restructuring | Low | N/A |

### Phase 1: Global Visual Foundation

| File | Action | Reason | Risk | Dependencies |
|------|--------|--------|------|--------------|
| `src/styles/tokens.css` | EXTEND | Add immersive layer tokens (z-order, glass, transition) | Low | Existing tokens |
| `src/styles/global.css` | EXTEND | Add universal layer rules | Low | tokens.css |
| New: `src/styles/immersive-layers.css` | CREATE | Layer 0-4 rules, glass/surface, motion grammar | Low | tokens.css |
| New: `src/styles/world-transitions.css` | CREATE | World transition animation grammar | Medium | immersive-layers.css |

### Phase 2: Canonical Twin Prototype

| File | Action | Reason | Risk | Dependencies |
|------|--------|--------|------|--------------|
| `src/components/twin/Twin.tsx` | KEEP | Facade pattern working | None | — |
| `src/components/twin/TwinPresence.tsx` | KEEP | SVG renderer working | Low | — |
| `src/components/twin/HologramBirth.tsx` | KEEP | Birth animation working | Low | — |
| `src/lib/twin/twinVisualDNA.ts` | KEEP | Deterministic DNA | None | — |
| `src/lib/twin/twinUniqueness.ts` | KEEP | Per-user traits | None | — |
| `src/hooks/useTwinIdentity.ts` | KEEP | Shared identity hook | Low | twinVisualDNA, twinUniqueness |
| `src/hooks/useTwinFidelity.ts` | KEEP | Device capability detection | None | — |
| New: `src/hooks/useTwinStates.ts` | CREATE | Twin state machine (IDLE/LISTENING/THINKING/RESPONDING) | Medium | useTwinIdentity |
| New: `src/lib/visual/TwinStateEngine.ts` | REVIEW | Check if existing engine covers new states | Low | ExperienceEngine |

### Phase 3: Birth Refinement

| File | Action | Reason | Risk | Dependencies |
|------|--------|--------|------|--------------|
| `src/components/twin/HologramBirth.tsx` | EXTEND | Ensure canonical identity continuity | Medium | twinVisualDNA, twinUniqueness |
| `src/pages/CoreAwakening.tsx` | EXTEND | Remove competing UI, keep immersive | Medium | HologramBirth |
| `src/services/CoreAwakeningService.ts` | KEEP | Business logic protected | None | — |
| `src/context/TwinContext.tsx` | KEEP | Twin persistence protected | None | — |
| `src/components/twin/Twin.tsx` | VERIFY | Birth variant uses same DNA as presence | Low | — |

### Phase 4: Immersive Twin Chat

| File | Action | Reason | Risk | Dependencies |
|------|--------|--------|------|--------------|
| `src/pages/TwinChat.tsx` | RECOMPOSE | Transform to immersive living space | HIGH | All chat deps |
| `src/components/world/WorldEnvironment.tsx` | EXTEND | Use as full-screen background | Medium | WorldEnvironment |
| `src/components/twin/Twin.tsx` | EXTEND | Full-screen presence mode | Low | TwinPresence |
| `src/components/WorldTabs.tsx` | MOVE | From inline to progressive disclosure | Medium | WorldContext |
| `src/components/twin/TwinNav.tsx` | MOVE | From inline to progressive disclosure | Low | TwinContext |
| `src/components/story/StoryModeSelector.tsx` | MOVE | From inline to progressive disclosure | Low | — |
| `src/components/twin/ChoiceConsequence.tsx` | MOVE | From inline to progressive disclosure | Low | DecisionService |
| `src/components/chat/WorldContextHeader.tsx` | ADAPT | Minimal world indicator | Low | WorldContext |
| `src/features/chat/hooks/useChat.ts` | KEEP | Chat logic protected | None | — |
| `src/services/TwinAPIService.ts` | KEEP | API contract protected | None | — |
| `functions/api/twin.ts` | KEEP | Server endpoint protected | None | — |

### Phase 5: World as Context + Transitions

| File | Action | Reason | Risk | Dependencies |
|------|--------|--------|------|--------------|
| `src/components/world/WorldEnvironment.tsx` | EXTEND | Narrative transitions | Medium | — |
| `src/context/WorldContext.tsx` | EXTEND | World transition events | Low | — |
| `src/context/EnvironmentContext.tsx` | EXTEND | Environmental force during transitions | Low | WorldContext |
| `src/lib/experience/EnvironmentEngine.ts` | EXTEND | Transition motion fields | Low | — |
| New: `src/lib/visual/WorldTransitionEngine.ts` | CREATE | Transition grammar (attraction/pull/absorption/dissolve) | Medium | WorldContext, EnvironmentEngine |

### Phase 6: Full-Site Visual Migration

| Page | Action | Reason | Risk | Dependencies |
|------|--------|--------|------|--------------|
| `Today/Dashboard` | ADAPT | Apply unified visual grammar | Medium | — |
| `WorldsHub` | ADAPT | Consistent with immersive language | Low | — |
| `WorldDetail` | ADAPT | Twin-in-world composition | Medium | WorldEnvironment |
| `Explore` | ADAPT | Unified visual grammar | Low | — |
| `Me` | ADAPT | Unified visual grammar | Low | — |
| `IntelligenceHub` | ADAPT | Twin as center of gravity | Medium | — |
| `DailyBrief` | ADAPT | Progressive disclosure | Low | — |
| `VoiceChat` | ADAPT | Immersive consistency | Medium | — |
| `TwinSettings` | KEEP | Settings are inherently secondary UI | Low | — |
| `Onboarding` | KEEP | Separate flow, already immersive | Low | — |
| `CoreAwakening` | KEEP | Already handled in Phase 3 | Low | — |

### Phase 7: Cleanup

| Target | Action | Prerequisite |
|--------|--------|--------------|
| Duplicate visual components | REMOVE | After migration verification |
| Obsolete CSS | REMOVE | After typecheck + build |
| Dead visual implementations | REMOVE | After audit |
| Duplicate animations | REMOVE | After verification |
| Unused assets | REMOVE | After audit |

---

## 11. SPECIFIC ISSUES TO ADDRESS

### 11.1 TwinChat Visual Competition (HIGH PRIORITY)

**Current problems in `TwinChat.tsx`:**
1. `WorldTabs` — horizontal tab bar takes significant vertical space
2. `TwinNav` — sub-navigation above chat area
3. `StoryModeSelector` — mode tabs below Twin header
4. `ChoiceConsequence` — decision outcome panel in flow
5. `WorldContextHeader` — world indicator above chat
6. Twin rendered at 88×88 contained — tiny compared to viewport
7. Dashboard-style card layout with multiple sections

**Target state:**
```
FULL SCREEN IMMERSIVE SPACE
│
├── LAYER 0: WorldEnvironment (full-screen background)
├── LAYER 1: Canonical Twin (full presence, centered/lower-middle)
├── LAYER 2: Contextual effects (particles, light)
├── LAYER 3: Primary Controls (minimal — input + send)
└── LAYER 4: Temporary UI (drawers/sheets for WorldTabs, TwinNav, etc.)
```

### 11.2 World Transition Missing (MEDIUM PRIORITY)

**Current:** Switching worlds = different `WorldEnvironment` SVG pattern, no narrative transition

**Required:** Contextual narrative transition with:
- Twin reaction (stretch/flow/react)
- Environmental force (attraction/pull/absorption)
- Previous world dissolves
- New world emerges
- Twin settles

**Transition grammar options:** attraction, pull, absorption, suction, flow, fold, dissolve, tunnel, gravity shift, environmental wave

### 11.3 Birth-to-Chat Continuity (MEDIUM PRIORITY)

**Need to verify:**
- Canonical Twin from Birth uses same `seedKey` as TwinChat
- Visual DNA (coreShape, coreColor, traits) is identical
- Evolution stage persists correctly
- No visual identity break between HologramBirth completion and TwinPresence first render

### 11.4 Dark Mode Small Text Contrast (KNOWN CONSTRAINT)

Per saved correction: Small text on navy-800 cards must use `#A5B4FC` fixed, not mood accent colors (which get ~3.7:1 contrast < AA 4.5:1)

### 11.5 Quick Summary ↔ SICE Integration (KNOWN GAP)

Quick Summary ต้องเชื่อม confidence floor และเส้นทาง SICE เข้ากับ Full Analysis ให้สมบูรณ์

### 11.6 twin_sice_scores Persistence (KNOWN GAP)

SICE scores persistence to database still needs verification

---

## 12. PHASED IMPLEMENTATION ORDER

### Phase 0: Forensic Visual Audit ✅ (THIS DOCUMENT)
- [x] Audit all files listed in Section 10
- [x] Create this Change Map
- [ ] Verify every finding against live code
- [ ] Confirm no parallel business logic will be created

### Phase 1: Global Visual Foundation
- [ ] Extend `tokens.css` with immersive layer tokens
- [ ] Create `immersive-layers.css` (Layer 0-4 rules)
- [ ] Create `world-transitions.css` (transition grammar)
- [ ] Update `global.css` with universal layer rules

### Phase 2: Canonical Twin State Machine
- [ ] Create `useTwinStates` hook (IDLE/LISTENING/THINKING/RESPONDING/GROWING)
- [ ] Review/create `TwinStateEngine` for state-driven visual changes
- [ ] Verify visual DNA persistence across all states
- [ ] Test mobile fallback chain (FALLBACK → LOW → MEDIUM)

### Phase 3: Birth Immersion
- [ ] Refine `CoreAwakening.tsx` — remove competing UI
- [ ] Ensure HologramBirth → TwinPresence continuity
- [ ] Verify seedKey consistency
- [ ] Test birth on mobile (320-430px)

### Phase 4: Immersive Twin Chat ⚡ HIGHEST RISK
- [ ] Recompose `TwinChat.tsx` into immersive living space
- [ ] Move WorldTabs, TwinNav, StoryModeSelector, ChoiceConsequence to progressive disclosure
- [ ] Full-screen WorldEnvironment as background
- [ ] Full-screen Twin presence (not 88×88 contained)
- [ ] Minimal primary controls
- [ ] Preserve ALL chat business logic
- [ ] Test message send/receive/memory/decision flows

### Phase 5: World Transitions
- [ ] Create `WorldTransitionEngine`
- [ ] Implement narrative transition grammar
- [ ] Add Twin reaction during transitions
- [ ] Test smooth world switching in Twin Chat

### Phase 6: Site-Wide Visual Migration
- [ ] Apply unified visual grammar to remaining pages
- [ ] Ensure same universe, different composition
- [ ] Progressive disclosure on all information-heavy pages

### Phase 7: Cleanup
- [ ] Remove duplicate visual components
- [ ] Remove obsolete CSS
- [ ] Remove dead implementations
- [ ] Typecheck + Build verification
- [ ] Performance audit (bundle size, mobile, battery)

---

## 13. NON-NEGOTIABLE RULES (REAFFIRMED)

✅ PRESERVE existing SICE architecture (12 engines, protected)
✅ PRESERVE existing database schema and API contracts
✅ PRESERVE existing auth flow and RLS
✅ PRESERVE existing Twin creation and memory logic
✅ ONE source of truth for Twin (existing TwinContext)
✅ Three.js not required (Canvas 2D + SVG + CSS sufficient)
✅ Canonical Twin from Birth = Canonical Twin in Chat
✅ World = context layer, not separate feature
✅ UI = secondary interface layer
✅ Mobile-first (320-430px target)
✅ AppShell ownership intact
✅ Existing tests must not regress
✅ Build and typecheck must pass

❌ NO rewrite of application
❌ NO parallel business logic
❌ NO new Twin source of truth
❌ NO hard-cut world transitions
❌ NO visual competition with Twin
❌ NO dashboard-style chat layout
❌ NO random blobs as Twins
❌ NO Three.js dependency

---

## 14. VALIDATION CHECKLIST (DEFINITION OF DONE)

### Architecture
- [ ] No parallel business logic created
- [ ] No new Twin source of truth
- [ ] Three.js not called (Canvas 2D + SVG only)
- [ ] AppShell ownership preserved
- [ ] SICE protected architecture intact
- [ ] All existing API contracts preserved

### Experience
- [ ] Twin is center of gravity in Chat
- [ ] World is living context (not wallpaper)
- [ ] Birth → Chat Twin continuity verified
- [ ] Chat is immersive (loose, Twin-focused)
- [ ] UI is secondary (progressive disclosure)
- [ ] World transitions have narrative quality
- [ ] Mobile usable (320-430px)

### Performance
- [ ] Build passes (no errors)
- [ ] Typecheck passes
- [ ] Existing tests don't regress
- [ ] No memory leaks detected
- [ ] Animation cleanup correct
- [ ] Bundle size within budget
- [ ] Fallback chain works (FALLBACK → LOW → MEDIUM)

### Cleanup
- [ ] Obsolete visual implementations removed
- [ ] No duplicate systems remain
- [ ] No giant unnecessary rewrites

---

**Plan complete. Ready for implementation.**
