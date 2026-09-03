# FORENSIC AUDIT — HONEST STATUS TH
## SELFPRINT V3 — Living Handoff Document
**อัพเดตล่าสุด:** 2 กันยายน 2026 (Session 7 — AnalysisNarrative Integration + P2 100% Complete)
**เขียนโดย:** jb_DEV + Claude
**วัตถุประสงค์:** เอกสารตั้งต้นสำหรับ AI agent ทุกตัวที่จะเข้ามาทำงานต่อ — อ่านไฟล์นี้ก่อนแตะโค้ดใดๆ ห้ามเชื่อ HANDOFF_*.md / PHASE_A*.md / SESSION_*.md ไฟล์อื่น

---

## ⚡ TL;DR สถานะปัจจุบัน

| Layer | สถานะ |
|-------|--------|
| Production URL | ✅ selfprint.one (CF Pages, auto-deploy master) |
| Build | ✅ ผ่าน (TypeScript strict, Vite 8, 0 errors) |
| Database bugs (P0) | ✅ แก้+deploy แล้ว |
| Runtime crashes (P1) | ✅ แก้+deploy แล้ว |
| React warnings (P2) | ✅ แก้+deploy แล้ว |
| SICE 12 Engines | ✅ ทำงานครบ (dynamic intelligence %) |
| TTS Language | ✅ respects app locale (th-TH / en-US) |
| /api/metrics | ✅ Real Supabase storage (Session 6) |
| /api/autonomy-log | ✅ Real Supabase storage (Session 6) |
| PerformanceMonitor.ts | ✅ re-enabled + reports to /api/metrics |
| Analysis Narrative | ✅ Wired to AnalysisPage (Session 7) |
| P2 Status | ✅ 100% COMPLETE — Ready P3 |
| UI/UX redesign | ⏳ วางแผนแล้ว ยังไม่ implement |
| Rate limiting (CF) | ⚠️ in-memory per isolate (ไม่ scale) |
| Code splitting/perf | ❌ ยังไม่แตะ — งาน architecture ใหญ่ |

---

## 1. Tech Stack (ยืนยันจากโค้ดจริง)

```
Frontend:  React 19, Vite 8, TypeScript 6, Tailwind 4
State:     Zustand 5, TanStack Query 5
Router:    React Router 7
AI:        Anthropic Claude (server-side CF Functions เท่านั้น)
DB:        Supabase (selfprint.* schema — ไม่ใช่ public schema)
Deploy:    Cloudflare Pages (auto-deploy master branch)
Payment:   Stripe 16 (wired แต่ checkout ยังไม่ production)
3D:        Three.js 0.185
```

### CF Functions routing
```
functions/api/nova.ts         → /api/nova    (AI analysis — มี JWT auth ✅)
functions/api/twin.ts         → /api/twin    (Twin chat — มี JWT auth ✅)
functions/api/og.ts           → /api/og      (OG image gen)
functions/api/metrics.ts      → /api/metrics (✅ Real Supabase selfprint.performance_metrics)
functions/api/autonomy-log.ts → /api/autonomy-log (✅ Real Supabase selfprint.autonomy_signals)
functions/api/[[route]].ts    → catch-all → api/unified-handler.ts
```

### Dead code (ห้ามลบโดยไม่ตัดสินใจก่อน)
```
api/nova.ts, api/twin.ts, api/og.ts  — Vercel format เก่า เป็น rollback path
src/api/unified-api-handler.ts        — DEAD CODE marked ชัดเจน
```

### ชื่อตารางที่ยืนยันจาก migration (ใช้ผิดพัง)
```
selfprint.users_profiles   ← schema selfprint + plural
decision_log               ← singular (ไม่ใช่ decision_logs)
twin_memories              ← plural (ไม่ใช่ twin_memory)
personal_contexts          ← plural
```

---

## 2. งานที่สำเร็จทั้งหมด

### Session 1–2
- ✅ FeedbackService (FBS) data persistence, 11/11 tests
- ✅ CI Node 20→22, E2E SK-01, k6 disabled on push
- ✅ Vercel→Cloudflare Pages migration + CF Functions ported
- ✅ Security CVE assessment (10 CVEs accepted, transitive devDeps)

### Session 3 — Phase A UX
- ✅ LandingPage 3-screen story mode + NovaEyeSvg
- ✅ WOW2 FullAnalysis revelation UX (3-phase)
- ✅ WOW3 HolographicBirth + ParticleFormation (Three.js จริง)

### Session 4-5 — Bug Sweep + SICE Translation

**P0 — Database (crash แน่นอน)**
- ✅ ชื่อตาราง DB ทุกจุด (decision_log, selfprint.users_profiles, twin_memories, personal_contexts)
- ✅ .single()→.maybeSingle() ทุก query (ป้องกัน crash เมื่อไม่มี row)
- ✅ JWT auth gate + CORS Authorization header (nova.ts, twin.ts)
- ✅ VITE_ANTHROPIC_API_KEY ลบออก (security)
- ✅ DecisionService circular import → dynamic import()
- ✅ Map.get()! null guards (Notifier, SICEOrchestrator, AIFeedbackLoop, rateLimiter)
- ✅ CF stub functions: metrics.ts, autonomy-log.ts

**P1 — Runtime crashes (เกิดบ่อย)**
- ✅ .maybeSingle() เพิ่มเติม (core-awakening API, MemoryManager x4, SelfPrintOrchestrator x8)
- ✅ ลบ localhost:3001 fallback (usePushSubscription, personalModel)
- ✅ OG image XSS → escapeHtml() helper
- ✅ Memory leaks: AdaptiveAudioEngine, ShareButton, SelfPrintOrchestrator → destroy()
- ✅ unified-handler.ts JWT cross-check user.id

**P2 — React warnings / quality**
- ✅ Stable keys ทุก list (TwinChat, InitialBlueprint, ExecutiveSummary, FutureSelfPanel, IntelligencePanels x6, PatternInsights)
- ✅ safeJsonLd() helper → ป้องกัน JSON injection ใน SEO
- ✅ useCallback handleSend (TwinChat)
- ✅ NovaChat StrictMode double-greeting → initializedRef guard

### Session 5 — SICE Translation + Analysis Narrative
- ✅ SICE Engine strings → Thai (InsightEngine, PatternDetector, FutureSelfEngine)
- ✅ AnalysisNarrativeBuilder.ts created (400-500 word Thai narrative from 12 engines)
- ✅ Intelligence % dynamic (SICEOrchestrator synthesis.confidenceScore ≠ hardcoded 0.6)
- ✅ TTS language respects app locale (CoreAwakening → useLanguage() → 'th-TH' or 'en-US')
- ✅ SICE orchestration verified end-to-end (12 engines running)

### Session 6 — P2 Production Verification ✅ 100% COMPLETE
- ✅ Migration files created (selfprint.performance_metrics + selfprint.autonomy_signals)
- ✅ /api/metrics rewritten → Real Supabase storage (Web Vitals + metrics collection)
- ✅ /api/autonomy-log rewritten → Real Supabase storage (Twin autonomy signals)
- ✅ PerformanceMonitor.ts re-enabled → POSTs to /api/metrics
- ✅ TypeScript strict: `tsc -b --noEmit` = 0 errors
- ✅ Commit 2c62758 LIVE on Cloudflare Pages (selfprint.one)
- ✅ Zero stubs remaining — all endpoints production-ready

### Session 7 — AnalysisNarrative Integration ✅ COMPLETE
- ✅ AnalysisPage.tsx wired to generateAnalysisNarrative() (Session 5 integration)
- ✅ Import generateAnalysisNarrative + OrchestratorResult type
- ✅ useMemo generates 400-500 word Thai narrative from SICE results
- ✅ Render in "01 ภาพรวมตัวตน" as "📖 บทสรุปวิเคราะห์ส่วนตัว"
- ✅ Graceful fallback for incomplete SICE data
- ✅ TypeScript strict: 0 errors (type casting verified)

---

## 3. งานค้าง — Tech Debt

### จาก Bug Sweep (non-UI)

| # | ปัญหา | ไฟล์ | Priority |
|---|-------|------|----------|
| TD-01 | Sentry ไม่ทำงาน | SentryService.ts | P2 |
| | ใช้ `process.env.REACT_APP_SENTRY_DSN` → ต้องเปลี่ยนเป็น `import.meta.env.VITE_SENTRY_DSN` | | |
| TD-03 | CF Rate Limiting in-memory | functions/api/ | P3 |
| | Map ต่อ isolate ไม่ scale — ต้องเปลี่ยนเป็น CF KV | | |
| TD-04 | `as any` ใน SICE layer | SICEOrchestrator, validators | P3 |
| TD-05 | structuredData.ts placeholder | src/lib/seo/ | P3 |
| | telephone `+66-XX-XXXX-XXXX` โชว์ใน Google Rich Results | | |
| TD-06 | Dead code: src/api/core-awakening.ts | src/api/ | P4 |
| TD-07 | Payment analytics commented out | stripeService.ts | P4 |
| TD-08 | Code splitting | chunk-intelligence | P4 |
| | main-thread 6.0s, ต้องรื้อ intelligence engine splitting | | |

### Component ขนาดใหญ่ (แตกหลัง UI redesign)
```
ExplorePage.tsx    938 บรรทัด
LandingPage.tsx    877 บรรทัด
Onboarding.tsx     768 บรรทัด
TwinChat.tsx       751 บรรทัด
AnalysisPage.tsx   699 บรรทัด
TarotPage.tsx      670 บรรทัด
PrivacyCenter.tsx  655 บรรทัด
ChatPage.tsx       615 บรรทัด
```

### จากไฟล์ ค้าง.txt (owner)
| # | งาน |
|---|-----|
| CG-01 | Core Awakening redesign — Twin + 12 world 3D sphere + ปุ่มใหญ่ + flash |
| CG-02 | Onboarding birth data → App Selector (bottom sheet/popover) |
| CG-03 | ตรวจภาษาไทยทั้งเว็บ (Dashboard ทำแล้ว ที่เหลือแยก sprint) |

---

## 4. UI Redesign Vision

> **หลักการ:** SELFPRINT = Web App ที่ทำงานเหมือน Mobile App — ไม่รื้อ SICE/API/DB เปลี่ยนแค่ Presentation Layer

### App Shell — ทุกหน้าใช้ shell เดียวกัน

**Mobile/Tablet (< 768px): Bottom Navigation**
```
┌────────────────────────────────────┐
│           CURRENT PAGE             │
├────────────────────────────────────┤
│ วันนี้ │ Worlds │ AI ฝาแฝด │ สำรวจ │ ฉัน │
└────────────────────────────────────┘
```

**Desktop (≥ 768px): Left Sidebar Rail**
```
┌──────────┬─────────────────────────┐
│SELFPRINT │                         │
│          │     CURRENT SPACE       │
│ วันนี้   │                         │
│ AI ฝาแฝด│                         │
│ Worlds   │                         │
│ สำรวจ   │                         │
│ ฉัน     │                         │
└──────────┴─────────────────────────┘
```

### 4 Layout Types
| Layout | หน้าที่ใช้ |
|--------|-----------|
| Journey (progress bar) | Analysis, Core Awakening, Twin Birth |
| Chat (conversation) | Twin Chat, SELFPRINT |
| Exploration (grid) | Worlds, Articles, Insights |
| Command (card+summary) | Dashboard, Memory, Learning |

### Dashboard → Command Center (4 sections เท่านั้น)
```
1. ฉันเป็นใครตอนนี้     → Today Snapshot (Energy, Mood, Theme, Pattern)
2. Twin รู้จักอะไรเพิ่ม  → +X Insights, +X Memory, 1 Recommendation
3. World ที่แนะนำวันนี้  → Recommended Worlds
4. กลับทำสิ่งล่าสุด     → Continue (Chat / Analysis / Article)
```
Intelligence/Insights/Patterns → ย้ายไปหน้า Intelligence  
Decision Log เต็ม → ย้ายไป Decision Center (Dashboard แสดงแค่ preview)

### SELFPRINT vs Twin (แสดงต่างกันชัดเจน)
```
SELFPRINT (ชื่อเดิม: NOVA):
  บทบาท: สะท้อนและอธิบายตัวฉัน
  ปรับ: label "NOVA" ทุกตัวที่ user เห็น → "SELFPRINT" (ไม่แก้ internal code)

Twin:
  บทบาท: ตัวฉันที่เอา intelligence ไปสนทนา/คิดต่อ
  UI: Chat Layout เท่านั้น — ไม่มี Dashboard cards รอบ chat
```

### Onboarding Birth Data → AppSelector Component
```
ไม่ใช้ browser <select>
AppSelector:
  Mobile: bottom sheet / picker
  Desktop: popover / panel
  Component เดียวกันทั้งระบบ

Fields: Birthday (DD/MM/YYYY), Birth time (HH:MM), Birth place (optional)
+ Quick emotion check-in button
+ SELFPRINT guide messages ("ก่อนเริ่ม ขอข้อมูลเล็กน้อย..." / "เยี่ยมมาก!")
```

### Landing Visual Story (7 Scenes — milestone แยก)
```
Scene 0: Human silhouette → scan → controlled decomposition → particles
Scene 1: Data signals (BEHAVIOR, DECISION, EMOTION, PATTERN ปรากฏทีละตัว)
Scene 2: Data → center → Twin Genesis → TWIN SEED
Scene 3: Twin grows (Seed → Skeleton → Neural body → Holographic human)
Scene 4: 12 SICE = 12 intelligence streams → Twin สว่าง 32%→94%
Scene 5: Holographic human (luminous, data veins, constellation, internal glow)
Scene 6: Mini holographic UI รอบตัว → CTA: "BUILD MY SELFPRINT"
Scene 7: กด → Onboarding: "INITIALIZING YOUR SELFPRINT"
```
Landing ปัจจุบัน (3-screen story mode) เป็น interim — 7-scene เป็น milestone แยก

---

## 5. Patch Plan (ลำดับที่แนะนำ)

### UI-01: App Shell + Navigation — ทำก่อนสุด (foundation)
```
สร้าง: src/components/layout/AppShell.tsx
สร้าง: src/components/layout/BottomNav.tsx   (mobile)
สร้าง: src/components/layout/SidebarNav.tsx  (desktop)
แก้:   App.tsx / router — wrap ทุกหน้าด้วย AppShell
ลบ:    Header ซ้ำซ้อนของแต่ละหน้า
ห้ามแตะ: SICE, Zustand, services, API layer
```

### UI-02: Dashboard → Command Center
```
Refactor: Dashboard.tsx → 4 sections เท่านั้น
ย้าย: IntelligencePanels → หน้า Intelligence
ย้าย: Decision Log → preview + link
เพิ่ม: Continue section
เปลี่ยน: label "NOVA" → "SELFPRINT" ทุกจุด user เห็น
```

### UI-03: AppSelector Component (CG-02)
```
สร้าง: src/components/common/AppSelector.tsx
แทนที่: <select> ใน InitialBlueprint.tsx / Onboarding
เพิ่ม: SELFPRINT guide messages
```

### UI-04: Core Awakening Redesign (CG-01)
```
12 World cards → 3D sphere grid
Twin hologram ใหญ่ขึ้น
ปุ่ม "รับชม" ใหญ่ + flash effect
```

### UI-05: Twin Chat Layout
```
ลบ Dashboard-style cards รอบ chat
ใช้ Chat Layout: header (← Twin ⋮) + conversation + input bar
เพิ่ม Twin Space sub-nav: Conversation, What Twin knows, Personality, Settings
```

---

## 6. กฎสำหรับ AI Agent

### ก่อนเริ่มงาน
1. อ่านไฟล์นี้ครบ
2. อ่าน CLAUDE.md ที่ root
3. ตรวจ `git log --oneline -5` ดู deploy ล่าสุด

### Working Rules
- Surgical changes only — แตะเฉพาะไฟล์ที่เกี่ยวงานนั้น
- เห็นของเก่าควรแก้นอก scope → บอก ไม่ใช่แก้เอง
- รัน `npm run build` ผ่านก่อนบอกว่าเสร็จ — ไม่ผ่าน = ยังไม่เสร็จ
- ห้ามแตะ: .env, migration ที่ apply แล้ว, config production

### Stack Rules
- Supabase: `.schema('selfprint')` เสมอสำหรับ users_profiles
- CF Functions: ทุก user endpoint ต้องมี `verifyUser()`
- Frontend: `import.meta.env.VITE_*` เท่านั้น (ห้าม `process.env`)
- React: ห้าม `as any`, ห้าม index-only key ใน list

### Commands
```bash
npm run build   # ต้องผ่านก่อน commit
npm run lint    # 219 warnings OK, 0 errors required
npm run dev     # dev server
npx playwright test  # E2E
git push origin master  # trigger CF Pages auto-deploy
```

---

## 7. ตัดสินใจที่ยังค้าง

| # | คำถาม |
|---|-------|
| DEC-01 | ✅ SOLVED: /api/metrics ported to Supabase (Session 6) |
| DEC-02 | Rate limiting: CF KV หรือ Durable Objects? |
| DEC-03 | Stripe checkout: เปิด production เมื่อไหร่? |
| DEC-04 | Landing 7-scene visual story: timeline? |
| DEC-05 | Nova→SELFPRINT: แค่ label (confirmed) ไม่แก้ code internal |
| DEC-06 | P3 Mobile QA: iOS Safari + Android Chrome (manual testing) |

---

*อัพเดตทุกครั้งที่ session สำคัญจบ — AI agent ทุกตัวอ่านก่อนเริ่มเสมอ*

---

## Session 8 Status (3 กันยายน 2026 — Service Worker + Tech Debt Prep)

### ✅ Deployed (Master a9a0fb0)
| Fix | Files | Status | Time |
|-----|-------|--------|------|
| **SW cache v5** | public/sw.js | ✅ LIVE | 9:03 AM |
| **AnalysisPage guards** | src/pages/AnalysisPage.tsx | ✅ LIVE | 11 min ago |
| **PerformanceMonitor safety** | src/services/PerformanceMonitor.ts | ✅ LIVE | 3 min ago |

### ⏳ Pending (Next Session — FULL IMPLEMENTATION REQUIRED)
| ID | Task | File(s) | Scope | Effort |
|----|------|---------|-------|--------|
| **TD-01** | Sentry DSN: `process.env.REACT_APP_` → `import.meta.env.VITE_` | SentryService.ts | Replace env var reference | 10 min |
| **TD-03** | CF Rate Limiting: in-memory Map → CF KV persistence | functions/api/rate-limiter.ts | Full KV integration + tests | 45 min |
| **TD-04** | Remove `as any` from SICE layer | SICEOrchestrator.ts, validators | Proper TypeScript typing | 30 min |
| **TD-05** | structuredData.ts: replace placeholder | src/lib/seo/structuredData.ts | Real schema generation (ld+json) | 20 min |
| **CG-03** | Thai language audit (full system) | Dashboard ✅, rest UI | Scan all .tsx for hardcoded English | 90 min |

### 🚀 Next Session Instructions
1. **Do NOT skip or mock these tasks** — all must be 100% production-ready
2. **Token strategy**: CG-03 is heavy (~90 min) — may need 2 passes
3. **Priority order**: TD-01 (quick) → TD-05 (quick) → TD-03 (moderate) → TD-04 (moderate) → CG-03 (heavy)
4. **Verification**: TypeScript `tsc -b` must pass, all tasks merged to master before closing

### ⚡ Quick Facts
- **Latest deploy**: master a9a0fb0 (3 min ago — PerformanceMonitor fix + null guards)
- **Build status**: ✅ TypeScript 0 errors, Vite build ready
- **User action**: Clear site data in DevTools (v4→v5 cache) + reload to see fixes
- **Database**: selfprint schema fully migrated, RLS ✅ (Session 4)
- **SICE**: All 12 engines running, Thai output working, dynamic intelligence % ✅

---

