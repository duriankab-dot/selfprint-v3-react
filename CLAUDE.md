# Memory

## ⚠️ อ่านก่อนเริ่มงานทุกครั้ง — สถานะโปรเจกต์จริงล่าสุด
**`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`** (root ของ repo) คือเอกสารสถานะฉบับเดียวที่ถูกต้อง ณ ปัจจุบัน — repo นี้มีไฟล์ `HANDOFF_*.md`/`PHASE_A*.md`/`SESSION_*.md`/`*_STATUS_TH.md` เก่ากว่า 60 ไฟล์ที่ **ล้าสมัยและห้ามเชื่อ** อ่านไฟล์นั้นไฟล์เดียวก่อนแตะโค้ดใดๆ จะได้รู้ว่าอะไรแก้แล้วจริง (deploy+verify live), อะไรแก้ในโค้ดแล้วแต่ยังไม่ deploy, อะไรยังหาสาเหตุไม่เจอ

## Me
**jb_DEV** (Durian Kab). Senior dev + entrepreneur. Solo SELFPRINT V3 developer. Code-first, ecosystem thinking, production-focused.

## Terms
| Term | Meaning |
|------|---------|
| **SELFPRINT** | Personal Intelligence Platform |
| **V3** | Current production version |
| **AI Dev** | Coding agent (Claude) for implementation |
| **PRD** | Product Requirements Document |
| **Master Directive** | Authoritative project instructions |
| **Master Handoff** | Current status & next priorities |
| **Production Ready** | Fully tested, secured, documented, deployable |
| **GAP Matrix** | Implementation vs production gap tracking |
| **E2E** | End-to-end testing (Playwright) |
| **FBS** | Feedback Service (data persistence) ✅ P1 complete |
| **P0 / P1 / P2** | Priority levels (P0 = drop everything) |
| **Edge** | Edge Functions / API layer |
| **DB** | Database layer |
| **UX/UI** | User experience & interface |
| **API** | Application programming interface |

## Projects
| Name | Status |
|------|--------|
| **SELFPRINT V3** | Production - P1 ✅, P2 ✅, P3 CVE + .npmrc ⏳, P4-6 blocked |

## Active Workflows
```
GitHub audit → GAP Matrix → AI Dev handoff → 
Implementation → Production verify → Documentation
```

## Preferences
- **Async-first** communication
- **Concise** answers in Thai
- **Code-first** thinking
- Current repo state = source of truth
- Separate facts / gaps / recommendations / completed
- Actionable implementation instructions + acceptance criteria
- Production completeness over theory
- No cached assumptions—verify actual state first

## Session 2 Status
**Priority 1:** ✅ Data Persistence (FBS) — Complete
**Priority 2:** ✅ Test Stabilization — testTimeout fixed, FeedbackService 11/11 passing  
**Priority 3:** ✅ Security CVEs Assessment — 10 CVEs ACCEPTED (transitive devDeps, not exploitable in production)
**Priority 4:** ⏸️ Linting DEFERRED — 219 warnings, 0 errors (verified 30 ส.ค. 2026 via oxlint, 550 files), not blocking build.
**Priority 5:** ✅ E2E Tests — CI #157 green, SK-01 updated for story-mode landing
**Priority 6:** ✅ Documentation — CLAUDE.md updated (this entry)

## Session 3 Status (Phase A Completion)

### Completed This Session
- ✅ LandingPage.tsx — 3-screen story mode (NOVA reveal, fullscreen narrative)
- ✅ NovaEyeSvg — animated CSS scanner eye
- ✅ CI fix — GitHub Actions Node 20→22 (asamuzakjp/css-color compat)
- ✅ .gitignore — test-results/, playwright-report/ added
- ✅ E2E smoke SK-01 — updated CTA selectors for story-mode landing
- ✅ CI k6 load tests — disabled on push (was consuming Edge Request quota)
- ✅ WOW2 FullAnalysis.tsx — revelation UX ("ค้นพบตัวเอง" moment, 3-phase)
- ✅ subscription→500 — diagnosed as Vercel cold-start 504 (infra, not code)
- ✅ WOW3 animations — HolographicBirth + ParticleFormation already real Three.js

### Architecture Locked (Phase A → B)
```
Landing (3 screens) → CREATE SELFPRINT → APP MODE
→ Emotion → NOVA → Birth Data → Blueprint → FineTuning
→ FullAnalysis (WOW2 ✅) → CoreAwakening → WOW3/TwinBirth ✅
→ LIVING SELFPRINT → Phase B: Community
```

### Infra: Vercel → Cloudflare Migration — ✅ DONE (corrected 30 ส.ค. 2026)
- Vercel paused: Edge Requests 2.8M/1M (k6 CI was hammering production)
- k6 disabled on push — only manual workflow_dispatch now
- **CF Pages deploy: ✅ LIVE** — selfprint.one running on Cloudflare Pages,
  auto-deploy from `master` confirmed working
- **CF Pages Functions: ✅ PORTED** — `functions/api/{nova,twin,og}.ts` +
  `functions/api/[[route]].ts` (catch-all → `api/unified-handler.ts`, which
  is fetch-style and does NOT use `@vercel/node` — that earlier note was
  wrong, unified-handler.ts never needed the rewrite it was assumed to need)
- `api/nova.ts`, `api/twin.ts`, `api/og.ts` (old Vercel format) kept
  intentionally — still wired in `vercel.json` `functions` block as a
  rollback path, not dead code, do not delete without a business decision
- `src/pages/api/nova.ts` (Next.js-style, zero routing, 100% unreferenced)
  — removed 30 ส.ค. 2026, was genuinely dead
- **Known gap**: `api/metrics.ts` has no `functions/api/metrics.ts`
  counterpart — `PerformanceMonitor.ts` POSTs to `/api/metrics` and gets
  404 on CF Pages right now. Metrics are not being collected. Needs a
  decision: port it or retire the feature. (P1, not yet fixed)

---

## Session 4 Status (2 ก.ย. 2026) — DB Unlock + SICE Diagnosis

### ปัญหาหลักที่วินิจฉัยได้ในเซสชันนี้
ทั้งหมดเชื่อมโยงจาก root cause เดียว: **`/api/profile` + `/api/blueprint` POST → 500** ทำให้ SICE ไม่เคยรันได้จริง → `awakening_essence` ว่าง → Twin ไม่รู้อะไรเลย → Analysis แสดง fallback ภาษาอังกฤษ

### DB Fixes ที่รันผ่านแล้วใน Supabase SQL Editor ✅
```sql
-- decisions missing columns (42703)
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS world VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_decisions_world ON decisions(world);

-- selfprint schema permissions (42501)
GRANT USAGE ON SCHEMA selfprint TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA selfprint TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA selfprint TO anon, authenticated, service_role;

-- RLS policies
CREATE POLICY "Users can manage own profile" ON selfprint.users_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own blueprint" ON selfprint.blueprints
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Code Fixes ที่ deploy แล้ว ✅
| ไฟล์ | การแก้ไข |
|------|---------|
| `api/_utils/verify-user.ts` | เพิ่ม `auth: { autoRefreshToken: false, persistSession: false }` ใน service_role createClient |
| `src/services/sice/engines/AIFeedbackLoop.ts` | ลบ `lastUpdated: new Date().toISOString()` ออกจาก result (เป็นสาเหตุที่ "การใช้ชีวิต" แสดง timestamp) |
| `src/services/sice/engines/TwinStateEngine.ts` | เพิ่ม `description` field ภาษาไทยใน TwinState + interface |
| `src/services/sice/engines/BehavioralForecastEngine.ts` | Engine 9 graceful fallback เมื่อไม่มี twinId แทน throw Error |
| `src/pages/AnalysisPage.tsx` | UUID_RE filter ใน extractResultText, ลบ .schema('selfprint') จาก awakening_essence query |
| `src/pages/TwinChat.tsx` | ลบ .schema('selfprint') จาก awakening_essence, SICE per-engine text extraction |
| `src/components/AudioSettings.tsx` | Thai/English bilingual strings |
| `src/components/AudioSettings.css` | box-sizing: border-box fix overflow mobile |
| `public/sw.js` | CACHE_NAME v1→v3 (fix 503 stale chunks) |
| `src/pages/CoreAwakening.tsx` | Twin birth sound: enabled=true always |

### SW Cache Issue (ยังเกิดซ้ำได้)
- เมื่อ deploy ใหม่ → หน้าขาว/503 → ต้อง Clear site data ใน Chrome DevTools → Application → Storage
- สาเหตุ: SW cache เก่าเสิร์ฟ index.html ที่อ้าง chunk hash เก่าซึ่งไม่มีใน CF Pages แล้ว

### ปัญหาที่ยังไม่แก้ (P1 — Critical Path)

#### 1. /api/profile + /api/blueprint ยังอาจ 500 อยู่ — ROOT CAUSE ยังไม่ 100% แน่ใจ
- Forensic agent วินิจฉัย: `SUPABASE_SERVICE_ROLE_KEY` ใน CF Pages อาจเป็น anon key ไม่ใช่ service_role key
- service_role key (JWT) ต้อง decode แล้วมี `"role": "service_role"` ไม่ใช่ `"anon"`
- env var ที่ code ใช้: `SUPABASE_URL` (ไม่ใช่ VITE_SUPABASE_URL) + `SUPABASE_SERVICE_ROLE_KEY`
- **หากยังไม่หาย ให้รัน SQL นี้เพื่อ disable RLS บน selfprint tables:**
  ```sql
  ALTER TABLE selfprint.blueprints DISABLE ROW LEVEL SECURITY;
  ALTER TABLE selfprint.users_profiles DISABLE ROW LEVEL SECURITY;
  ```

#### 2. SICE Output ภาษาอังกฤษ (เมื่อ profile/blueprint แก้แล้ว)
- Engine output strings hardcode ภาษาอังกฤษทุกตัว
- `SICEInput` ไม่มี `language` field
- ไฟล์ที่ต้องแก้: `InsightEngine.ts`, `PatternDetector.ts`, `FutureSelfEngine.ts`, `PersonalContextBuilder.ts`
- แนวทาง: เพิ่ม `language: 'th'` ใน SICEInput type → pass จาก CoreAwakeningService → แต่ละ engine branch ภาษา

#### 3. Twin ยังไม่รู้ข้อมูล (เพราะ 1 ยังไม่แก้)
- chain: profile 200 → blueprint 200 → SICE runs → awakening_essence populated → Twin/Analysis แสดงข้อมูลจริง

#### 4. Analysis sections ที่ยังเป็น English
- "ความสัมพันธ์", "การเติบโต", "อนาคต", "ความมั่งคั่ง", "แนวโน้ม", "สิ่งที่ควรให้ความสนใจ", "guidance", "nextStep"
- เมื่อ SICE รันได้จริงด้วย Thai output → sections เหล่านี้จะได้ข้อมูลจริง
- บางส่วนยัง hardcode English ใน engine — ต้องแปลแยก

#### 5. TTS เสียงไม่ match ภาษา
- Twin พูดภาษาอังกฤษแม้ UI เป็นไทย — ต้องตรวจ voice param ใน TTS call

#### 6. Intelligence % stuck at 60%
- `buildFallbackResponse` hardcode `confidence: 0.6`
- ลำดับต่ำกว่า critical path — แก้ได้หลัง SICE ทำงาน

### Architecture ปัจจุบัน (ยืนยันจากโค้ด)
```
CF Pages (selfprint.one) ← auto-deploy from master
  ├── functions/api/[[route]].ts → api/unified-handler.ts (catch-all handler)
  ├── functions/api/nova.ts → Claude AI integration
  ├── functions/api/twin.ts → Twin chat
  └── functions/api/og.ts → OG image

DB (Supabase):
  ├── selfprint schema: users_profiles, blueprints (need SUPABASE_URL + SERVICE_ROLE_KEY)
  └── public schema: awakening_essence, decisions, twins, user_lifecycle, twin_memories

SICE (12 engines client-side):
  E1=PersonalContextBuilder, E2=PatternDetector, E3=InsightEngine,
  E4=AIFeedbackLoop, E5=TwinStateEngine, E9=BehavioralForecastEngine,
  E10=FutureSelfEngine, E12=DecisionIntelligenceEngineAdapter
  → SICEOrchestrator → CoreAwakeningService → awakening_essence (DB)
```

### Priority Queue สำหรับ Session ถัดไป
1. **[P0]** ยืนยัน SUPABASE_SERVICE_ROLE_KEY ใน CF Pages → test user ใหม่ → profile+blueprint 200
2. **[P0]** เมื่อ profile/blueprint ผ่าน: test full onboarding flow ด้วย user ใหม่ → ดูว่า SICE รันครบ 12 engines
3. **[P1]** แปล SICE engine output strings เป็นภาษาไทย (InsightEngine, PatternDetector, FutureSelfEngine)
4. **[P1]** Analysis "ภาพรวมส่วนตัว" → narrative prose ไทย 400-500 คำจาก 12 SICE engines
5. **[P2]** TTS language fix
6. **[P2]** Intelligence % dynamic (ไม่ hardcode 0.6)

---
Full glossary and deep context: `memory/`
