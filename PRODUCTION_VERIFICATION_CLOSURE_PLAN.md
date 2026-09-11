# SELFPRINT — PRODUCTION VERIFICATION CLOSURE PLAN

**สร้างเมื่อ:** 2026-09-11  
**HEAD:** 1f57f46c7ffebfdc1bdba1223b1f1ec7e757ef4b  
**สถานะปัจจุบัน:** MASTER GATE = NOT PASS (6 critical blocks)  
**เป้าหมาย:** ปิดทุก gap → MASTER GATE = PASS

---

## กฎการทำงาน

1. **ห้าม rewrite ทั้งระบบ** — แก้เฉพาะสิ่งที่จำเป็นเพื่อให้ผ่าน gate
2. **preserve existing** DB/Supabase/Auth/RLS/Cloudflare/SICE/Twin/Memory/APIs
3. **เขียนทับเอกสารเดิม** ไม่ append ประวัติรายรอบ
4. **build/test/lint ต้องผ่าน** ทุก commit (tsc -b + vite build + vitest + oxlint)
5. **อ่าน MASTER_GATE_AS_IS.md + CHANGE_MAP.md ก่อนเริ่ม** — เป็น source of truth ของ gap ที่ต้องปิด

---

## Phase 0: Environment Setup & Verification (ทำก่อนทุกงาน)

### 0.1 ติดตั้ง dependencies และ verify build
```powershell
cd D:\selfprint-v3-react
npm ci
npm run build                 # tsc -b && vite build — ต้องผ่าน 0 errors
npm run typecheck:functions   # tsc -p tsconfig.functions.json --noEmit
npm test                      # vitest run — ต้องผ่าน 0 failures
npm run lint                  # oxlint — 0 errors (warning ไม่บล็อก)
```

**Acceptance Criteria:**
- `npm run build` ผ่าน 0 errors
- `npm run typecheck:functions` ผ่าน 0 errors
- `npm test` ผ่าน 0 failures
- `npm run lint` 0 errors

**ถ้าล้มเหลว:** แก้ type error/compile error ก่อนไปต่อ ห้าม skip

---

## Phase 1: Growth Pipeline Wiring (P0 CRITICAL)

### Problem
Conversation → Experience → Memory → Growth → Visual change loop ตัด. Product lock requires "GROWTH = EVOLUTION".

### Current Evidence
- `src/services/TwinEvolutionService.ts:44` checkMicroEvolution() — real logic, queries messages/patterns/memories/feedback counts
- `src/services/TwinEvolutionService.ts:109` evolveTwin() — real DB updates (twins.stage, twin_evolution_history insert, birth memory)
- `src/hooks/useEvolutionTracking.ts:24` hook exists but ZERO production callers
- maturityScore set once at birth (CoreAwakeningService.ts:354), static afterward

### Required Change

#### ไฟล์: `src/pages/ImmersiveTwinChat.tsx`

เพิ่ม growth tracking call ใน handleSend หลัง saveTwinMemory สำเร็จ:

```typescript
// เพิ่ม import ด้านบนไฟล์
import { useEvolutionTracking } from '@/hooks/useEvolutionTracking';

// เพิ่มใน component body (หลัง const handleSend = useCallback(...))
const { recordInteraction } = useEvolutionTracking();

// เพิ่มใน handleSend หลังบรรทัด saveTwinMemory twin response (ประมาณ line 432):
try {
  await recordInteraction(twin.id); // บันทึก interaction → trigger evolution check
} catch (evErr) {
  console.warn('[ImmersiveTwinChat] Evolution tracking failed:', evErr);
  // Non-fatal: don't break conversation if evolution check fails
}
```

#### ไฟล์: `src/hooks/useEvolutionTracking.ts`

ตรวจสอบว่า hook มี method `recordInteraction(userId: string)` ที่:
1. คำนวณ metrics จาก DB (messageCount, daysSinceAwakening, patternCount, memoryCount, feedbackCount)
2. เรียก `checkMicroEvolution(userId, twinId, metrics, currentStage)`
3. ถ้า evolved=true → เรียก `evolveTwin(userId, twinId, previousStage, newStage, metrics)`
4. Update local state ให้ TwinPresence re-render ด้วย maturityScore ใหม่

### Acceptance Criteria
- [ ] ส่ง message อย่างน้อย 10 ข้อความ → maturity_score increment ใน DB
- [ ] Reload page → evolutionStage เปลี่ยน → visual changes (evo rings at stage 3+, glow increases)
- [ ] Evolution history recorded ใน twin_evolution_history table
- [ ] npm run build ผ่าน 0 errors
- [ ] npm test ผ่าน 0 failures
- [ ] npm run lint 0 errors

### Verification
```sql
-- ตรวจสอบใน Supabase SQL Editor:
SELECT * FROM twins WHERE user_id = '<your-user-id>' ORDER BY updated_at DESC LIMIT 1;
SELECT * FROM twin_evolution_history WHERE twin_id IN (SELECT id FROM twins WHERE user_id = '<your-user-id>') ORDER BY evolved_at DESC;
```

---

## Phase 2: World Transition CSS Wiring (P0 MAJOR)

### Problem
Engine computes correct transition type, sets className on container, but CSS has no rule for `.world-transition--${type}` so animations don't trigger.

### Current Evidence
- `src/pages/ImmersiveTwinChat.tsx:200` sets `container.className = world-transition-container world-transition--${config.type}`
- `src/styles/world-transitions.css` defines @keyframes world-* (all 18 animation names match engine's ANIMATION_MAP)
- MISSING: Rules like `.world-transition--attraction { ... apply keyframes ... }` — these don't exist

### Required Change

#### ไฟล์: `src/styles/world-transitions.css`

เพิ่ม CSS rules mapping transition types to their keyframes (ใส่ท้ายไฟล์):

```css
/* ========== World Transition Type Selectors ========== */
/* Map runtime class names to existing keyframes */

.world-transition--attraction .world-transition--old-world {
  animation: world-attraction-pull var(--transition-narrative, 800ms) ease-out forwards;
}
.world-transition--attraction .world-transition--new-world {
  animation: world-attraction-emerge var(--transition-narrative, 800ms) ease-in forwards;
}

.world-transition--pull .world-transition--old-world {
  animation: world-pull-directional var(--transition-narrative, 800ms) ease-out forwards;
}
.world-transition--pull .world-transition--new-world {
  animation: world-pull-reverse var(--transition-narrative, 800ms) ease-in forwards;
}

.world-transition--absorption .world-transition--old-world {
  animation: world-absorption-spiral-in var(--transition-narrative, 900ms) ease-out forwards;
}
.world-transition--absorption .world-transition--new-world {
  animation: world-absorption-spiral-out var(--transition-narrative, 900ms) ease-in forwards;
}

.world-transition--dissolution .world-transition--old-world {
  animation: world-dissolution-scatter var(--transition-narrative, 1000ms) ease-out forwards;
}
.world-transition--dissolution .world-transition--new-world {
  animation: world-dissolution-gather var(--transition-narrative, 1000ms) ease-in forwards;
}

.world-transition--flow .world-transition--old-world {
  animation: world-flow-drift-right var(--transition-narrative, 700ms) ease-out forwards;
}
.world-transition--flow .world-transition--new-world {
  animation: world-flow-drift-left var(--transition-narrative, 700ms) ease-in forwards;
}

.world-transition--fold .world-transition--old-world {
  animation: world-fold-collapse var(--transition-narrative, 800ms) ease-out forwards;
}
.world-transition--fold .world-transition--new-world {
  animation: world-fold-unfold var(--transition-narrative, 800ms) ease-in forwards;
}

.world-transition--tunnel .world-transition--old-world {
  animation: world-tunnel-rush var(--transition-narrative, 1000ms) ease-out forwards;
}
.world-transition--tunnel .world-transition--new-world {
  animation: world-tunnel-emerge var(--transition-narrative, 1000ms) ease-in forwards;
}

.world-transition--gravity_shift .world-transition--old-world {
  animation: world-gravity-shift-fall var(--transition-narrative, 800ms) ease-out forwards;
}
.world-transition--gravity_shift .world-transition--new-world {
  animation: world-gravity-shift-settle var(--transition-narrative, 800ms) ease-in forwards;
}

.world-transition--env_wave .world-transition--old-world {
  animation: world-wave-sweep var(--transition-narrative, 900ms) ease-out forwards;
}
.world-transition--env_wave .world-transition--new-world {
  animation: world-wave-ripple var(--transition-narrative, 900ms) ease-in forwards;
}

/* Twin reaction classes */
.twin-transition-react.is-attracted { /* already defined at line 387 */ }
.twin-transition-react.is-pulled { /* already defined at line 393 */ }
.twin-transition-react.is-absorbing { /* already defined at line 398 */ }
.twin-transition-react.is-dissolving { /* already defined at line 404 */ }
.twin-transition-react.is-flowing { /* already defined at line 410 */ }
/* Add remaining reaction classes for fold/tunnel/gravity_shift/env_wave */
```

#### ไฟล์: `src/pages/ImmersiveTwinChat.tsx`

เพิ่ม old/new-world wrapper elements ใน transition container:

```tsx
// แก้จาก <div className="world-transition-container" />
<div className="world-transition-container">
  <div className="world-transition--old-world" />
  <div className="world-transition--new-world" />
</div>
```

### Acceptance Criteria
- [ ] เปลี่ยน world → เห็น transition animation matching narrative type
- [ ] Animation ถูกต้อง (attraction=pull inward, dissolution=scatter, flow=drift, etc.)
- [ ] Twin reaction class ทำงาน (is-attracted/is-pulled/etc.)
- [ ] Lighting overlay flash ตาม config color
- [ ] npm run build ผ่าน 0 errors
- [ ] npm test ผ่าน 0 failures

---

## Phase 3: Migration 035/034 Application (P0 CRITICAL)

### Problem
Without migration 035 applied to production, Twin birth fails silently due to missing INSERT policies on twin_state/twin_personality/twin_capabilities tables.

### Current Evidence
- `supabase/migrations/035_forensic_consolidation_2026-09-03.sql:776-858` adds missing INSERT policies
- PRODUCTION_DB_CATCHUP (09-01) does NOT include 035 (09-03)
- Comment in 035:1186 ยืนยันว่าไม่สามารถ verify ว่า apply แล้วหรือไม่

### Required Action

#### วิธี A: Run via Supabase Dashboard (แนะนำ)
1. เปิด https://app.supabase.com/project/<project-id>/sql/new
2. คัดลอกเนื้อหาทั้งหมดของ `supabase/migrations/035_forensic_consolidation_2026-09-03.sql`
3. วางใน SQL Editor → กด Run

#### วิธี B: Run via CLI
```powershell
supabase db push --include-all
```

#### Verify After Apply
```sql
-- ตรวจสอบ policy count สำหรับแต่ละตาราง
SELECT tablename, COUNT(*) AS policy_count 
FROM pg_policies 
WHERE schemaname='public' AND tablename IN ('twin_state','twin_personality','twin_capabilities') 
GROUP BY tablename ORDER BY tablename;
-- Expected: each has policy_count >= 2
```

### Acceptance Criteria
- [ ] twin_state มี INSERT policy (users_insert_own_twin_state)
- [ ] twin_personality มี INSERT policy (users_insert_own_twin_personality)
- [ ] twin_capabilities มี INSERT+SELECT policies
- [ ] Test Twin creation succeeds end-to-end without rollback
- [ ] Full Analysis data persists to twins.full_analysis column (migration 034)

---

## Phase 4: Streaming Path Consumer (P0 MAJOR)

### Problem
`/api/twin-stream` endpoint และ `streamTwinResponse()` client function มี implementation แต่ไม่มี UI caller

### Current Evidence
- `functions/api/twin-stream.ts` — complete SSE stream transform, same auth/rate-limit as twin.ts
- `src/services/TwinAPIService.ts:121-203` streamTwinResponse() — uses shared buildPrompt(), identical semantics
- `src/pages/ImmersiveTwinChat.tsx:423` ใช้ callTwinAPI เท่านั้น

### Required Change

#### ไฟล์: `src/pages/ImmersiveTwinChat.tsx`

เปลี่ยน handleSend ให้ใช้ streaming เป็น primary พร้อม fallback:

```typescript
// แก้จาก:
const twinResponse = await callTwinAPI(
  apiMessages, twin.name || 'Twin', twinProfile,
  currentWorld || undefined, recentMemories, language,
);

// เป็น:
let twinResponse: string;
try {
  // Try streaming first
  const chunks: string[] = [];
  await streamTwinResponse(
    apiMessages,
    twin.name || 'Twin',
    twinProfile,
    currentWorld || undefined,
    (chunk) => chunks.push(chunk),
    recentMemories,
    language,
  );
  twinResponse = chunks.join('');
} catch (streamError) {
  // Fallback to non-streaming
  console.warn('[ImmersiveTwinChat] Streaming failed, falling back:', streamError);
  twinResponse = await callTwinAPI(
    apiMessages, twin.name || 'Twin', twinProfile,
    currentWorld || undefined, recentMemories, language,
  );
}
```

### Acceptance Criteria
- [ ] Chat responses stream character-by-character
- [ ] Error handling gracefully falls back to non-streaming
- [ ] Same system prompt, memories, rate limiting as non-streaming path
- [ ] npm run build ผ่าน 0 errors
- [ ] npm test ผ่าน 0 failures

---

## Phase 5: Audio Behavior Wiring (P1 MAJOR)

### Problem
SFX infrastructure complete แต่ไม่มี component ใด consume useSFX() เพื่อเล่น sound ระหว่าง interaction

### Current Evidence
- `src/App.tsx:356` SFXProvider mounted globally
- `src/components/audio/SFXProvider.tsx:54-56` hooks initialized + preloaded
- grep useSFX() consumers: zero outside provider definition

### Required Change

#### ไฟล์: `src/pages/ImmersiveTwinChat.tsx`

เพิ่ม sound playback เมื่อ state เปลี่ยน:

```typescript
// เพิ่ม import ด้านบนไฟล์
import { useSFX } from '@/components/audio/SFXProvider';

// เพิ่มใน component body:
const sfx = useSFX?.() ?? null;

// ใน handleSend หลัง startListening():
if (sfx?.twin) sfx.twin.play('interact');

// ใน handleSend หลัง startThinking():
if (sfx?.twin) sfx.twin.play('glitch');

// ใน handleSend หลัง startResponding():
if (sfx?.twin) sfx.twin.play('sweep');

// ใน handleSend หลัง stopResponding():
if (sfx?.ui) sfx.ui.play('select');
```

### Acceptance Criteria
- [ ] Sound เล่นเมื่อส่ง message (interact)
- [ ] Sound เล่นเมื่อ Twin thinking (glitch)
- [ ] Sound เล่นเมื่อ Twin responding (sweep)
- [ ] Sound respects audio preferences (masterEnabled/volume)
- [ ] Browser autoplay policy handled

---

## Phase 6: Cleanup Dead Code (P2 CLEANUP)

### ไฟล์ที่ต้อง mark as deprecated

#### ไฟล์: `src/pages/TwinChat.tsx`
เพิ่ม JSDoc comment บรรทัดแรก:
```typescript
/**
 * @deprecated Use ImmersiveTwinChat instead. This file is kept as backup only.
 * Route /chat/twin now points to ImmersiveTwinChat (App.tsx:116).
 */
```

#### ไฟล์: `src/services/SICEOrchestratorImpl.ts`
เพิ่ม JSDoc comment บรรทัดแรก:
```typescript
/**
 * @deprecated Legacy SICE orchestrator implementation. No longer imported anywhere.
 * Kept for reference only. The live implementation is in src/services/sice/SICEOrchestrator.ts
 */
```

#### ไฟล์: `src/services/world-routing/WorldRoutingService.ts`
เพิ่ม JSDoc comment บรรทัดแรก:
```typescript
/**
 * @deprecated routeToWorld() has zero production callers.
 * World selection is done manually via WorldDrawer in ImmersiveTwinChat.
 * Kept for reference only.
 */
```

### Acceptance Criteria
- [ ] npm run build ผ่าน 0 errors
- [ ] npm test ผ่าน 0 failures
- [ ] ไม่มี regression

---

## Phase 7: Documentation Updates

### ไฟล์: `MASTER_GATE_AS_IS.md`
อัพเดททุก gate ที่ผ่านการแก้ไขจาก ORANGE/YELLOW/RED → GREEN

### ไฟล์: `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`
อัพเดท TL;DR → "MASTER GATE = PASS" + ตาราง gate ใหม่

### ไฟล์: `README.md`
อัพเดท status badge → "Production Ready ✅" + ลบ blocker table

### ไฟล์: `docs/SELFPRINT_PROJECT_SUMMARY_TH.md`
อัพเดท gate table → ทุก gate = GREEN

### ไฟล์: `docs/SELFPRINT_STATUS_HONEST_TH.md`
อัพเดท gate table → ทุก gate = GREEN

---

## Final Verification Checklist

ก่อนประกาศ Production Verified ต้องผ่านทุกข้อ:

### Build & Test
- [ ] `npm run build` — 0 errors
- [ ] `npm run typecheck:functions` — 0 errors
- [ ] `npm test` — 0 failures
- [ ] `npm run lint` — 0 errors

### Functional
- [ ] Growth: 10+ messages → maturity_score increment → reload → visual change
- [ ] World Transition: เปลี่ยน world → เห็น animation matching narrative type
- [ ] Streaming: responses stream character-by-character (fallback tested)
- [ ] Audio: sounds play on send/think/respond states
- [ ] Twin Birth: สร้าง Twin ใหม่สำเร็จ (ไม่ rollback)
- [ ] Auth: JWT verified บนทุก endpoint
- [ ] RLS: user isolation verified (A cannot access B's data)

### Database
- [ ] Migration 035 applied (policy_count >= 2 สำหรับ twin_state/personality/capabilities)
- [ ] Migration 034 applied (twins.full_analysis column exists)
- [ ] Test Twin creation succeeds

### Manual E2E Flow
- [ ] Onboarding → Finetune → Full Analysis → Core Awakening → Twin Birth → Naming → Chat
- [ ] Send 10+ messages → check maturity_score → reload → check evolutionStage
- [ ] Change world → observe transition animation
- [ ] Play sounds during interaction

---

## Order of Execution

| # | Phase | Priority | Estimated Effort | Dependencies |
|---|-------|----------|-----------------|--------------|
| 0 | Environment Setup | P0 | 5 min | None |
| 1 | Growth Wiring | P0 CRITICAL | 30 min | Phase 0 |
| 2 | World Transition CSS | P0 MAJOR | 20 min | Phase 0 |
| 3 | Migration 035/034 Apply | P0 CRITICAL | 5 min | None (can do anytime) |
| 4 | Streaming Path Consumer | P0 MAJOR | 15 min | Phase 0 |
| 5 | Audio Behavior Wiring | P1 MAJOR | 15 min | Phase 0 |
| 6 | Cleanup Dead Code | P2 CLEANUP | 5 min | Anytime |
| 7 | Documentation Updates | P2 CLEANUP | 15 min | All above |

**Total estimated effort:** ~2 hours

---

## Notes for Next Session

1. อ่าน `MASTER_GATE_AS_IS.md`, `MASTER_GATE_CHANGE_MAP.md`, `MASTER_GATE_EVIDENCE.md` ก่อนเริ่ม — เป็น source of truth ของ gap ทั้งหมด
2. เริ่มจาก Phase 0 (npm ci + npm run build) เพื่อยืนยัน environment ทำงาน
3. ทำตามลำดับ Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7
4. หลังแต่ละ phase: รัน `npm run build && npm test && npm run lint` — ถ้าผ่านค่อยไป phase ถัดไป
5. หลังจบทุก phase: ทำ Final Verification Checklist (Phase 7)
6. อัพเดทเอกสารทั้ง 8 ไฟล์ (overwrite ไม่ใช่ append)
7. ถ้าเจอปัญหา: แก้เฉพาะที่จำเป็น preserve existing architecture

**ห้าม:** rewrite ทั้งระบบ, เพิ่ม feature ใหม่ที่ไม่ได้ระบุในแผน, ลบไฟล์ที่ไม่ใช่ dead code จริง
