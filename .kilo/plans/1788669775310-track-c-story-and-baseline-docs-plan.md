# Merged Plan - Docs Sync at da855c5 + Track A/B Closure + Track C Story

Status: READY FOR IMPLEMENTATION - DOCUMENTATION ONLY this round (owner: docs first, no code)
Baseline: da855c5 (master HEAD = origin/master) - 6 Sep 2026
Merges 2 plans: old Phase 0 plan (.kilo/plans/1788666847496-complete-pending-work-plan.md - SUPERSEDED) + this plan
Rule: verify from code first, never trust .md alone, use real numbers from T0

---

## Phase A - Documentation Update (this round, DOCS ONLY)

Update 8 doc files + optionally create 1 Story file. Single consistent set of numbers.

### T0. Re-measure gates at da855c5 (BEFORE touching docs)
Run in D:\selfprint-v3-react:
- npx tsc -b
- npm run typecheck:functions
- npm run build
- npm run lint
- npx vitest run
Record results as "re-measured 6 Sep 2026 - HEAD da855c5". Use instead of old 3fa100a numbers in D1/D2/D3/D4/D7.

### Canonical numbers (verified from source at da855c5)
- Edge Functions in repo = 12 (index.ts present in supabase/functions/):
  send-push, daily-brief, pattern-detect, memory-manager, data-export,
  auth-registration-options, auth-register-passkey, auth-authentication-options,
  auth-verify-passkey, auth-rate-limit, account-recovery, account-delete
- Deployment status: UNVERIFIED - must check Supabase dashboard (old doc said 0/11 on 5 Sep)
- A1 dead code remaining = 6 files:
  src/pages/Chat.tsx, src/pages/ChatPage.tsx,
  src/components/TwinHologramBirth.tsx, src/components/TwinEvolutionProgress.tsx,
  src/services/SentryService.ts, src/components/RecoveryIndicator.css
  (11 already deleted in 6cc2fe6)
- as any = 103 matches found by grep (incl. comment/string; real casts ~100)
- Migration 035 = APPLIED (verified 5 Sep 2026, never write "not applied" again)
- VoiceChat mock still at App.tsx:173 + VoiceChat.tsx:80
- Passkey broken: AuthContext.tsx:130 no supabase.auth.setSession();
  PasskeyProvider.ts:144-188 calls 4 non-existent functions;
  auth-verify-passkey/index.ts:134 dummy 32-byte JWT signature
- service-worker.js: does NOT exist in repo (handover claim false)

### D1 - FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md (root, single source of truth)
- Header: add round 6 (6 Sep 2026); Baseline 3fa100a -> da855c5
- Gate table in section 0: use T0 numbers; Edge "11/0/11" -> "12 functions in repo; deploy status unverified - check dashboard"
- "A1 (dead code 16+ files)" -> "A1 remains 6 files"
- "A7 (as any 114)" -> "103 (real casts ~100)"
- Section 8.6 conditions: migration 035 stays APPLIED; remaining 3 = deploy edges (needs decision), passkey (needs decision), voice (needs decision)

### D2 - docs/SELFPRINT_STATUS_HONEST_TH.md
- HEAD -> da855c5; add commit log entries 7ca1a4f -> da855c5:
  7ca1a4f(docs sync) 6cc2fe6(A1 delete 11) e25fc15(untrack v2 docs)
  6746f7a(X1 env) 13c70f8(ASSET404-001) 6e0aebd(STUB-001)
  bcf46f7/49995fa/0cf7ee4(A7 as-any) 5676db7(A1-cont) 875a5ca(A3-lazy) da855c5(A3-perf)
- A1: 11 deleted, 6 remain; A7: 103 (real casts ~100)
- Manual work list: add "passkey decision", "voice route decision", "deploy edge" (waiting decisions)
- Note: dist/ is stale (npm run build needed before quoting bundle numbers)
- Gate table -> T0

### D3 - docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md
- HEAD -> da855c5
- F-02 update (IMPORTANT): vite.config.ts:90 chunk-intelligence branch still exists;
  345 kB still includes @supabase/supabase-js; BUT after A3-lazy (875a5ca) + A3-perf
  (da855c5) ExperienceProvider is lazy + conditional (ConditionalExperience in App.tsx:239)
  so the chunk no longer loads on pre-login landing page - it loads only when a session exists.
  Status: PARTIAL (improved, still open for logged-in initial load)
- F-04/F-05: PARTIAL with fresh numbers
- 0.13 migration 035: BLOCKED -> APPLIED
- Gate table -> T0; L0-L3 benchmark cross-check with T0

### D4 - README.md (root)
- Line 12: "Status (measured 4-5 Sep 2026 - HEAD 3fa100a)" -> "Status (measured 6 Sep 2026 - HEAD da855c5)"
- Line 22: "A1 (dead code - 16+ files) and A7 (as any - 114 sites)" -> "A1 (dead code - 6 files) and A7 (as any - 103 sites, ~100 real casts)"
- Line 53 Tech stack: "Supabase Edge Functions (13 functions)" -> 12 functions
- Known Limitations "4 conditions" block: item 1 "migration 035 NOT yet applied / 42703" -> APPLIED (verified 5 Sep); renumber to 3 conditions (deploy edges, passkey, voice)
- Stub/mock table: remove AdvancedAnalytics.tsx:26 row (deleted in 6e0aebd); keep SentryService.ts:15 (orphan, delete candidate); keep VoiceChat.tsx:80 (still mock)
- Footer "Last verified: 5 September 2026 - HEAD 3fa100a" -> 6 Sep 2026 - da855c5

### D5 - CONTRIBUTING.md (root)
- Header: "5 September 2026 - HEAD 3fa100a" -> "6 Sep 2026 - HEAD da855c5"
- Any dead-code/as-any tables -> sync to canonical numbers
- Other rules unchanged

### D6 - docs/Experience Architecture v2.md (still untracked, per e25fc15)
- ADD section 51 STORYTELLING ARCHITECTURE at end of file (content per Plan section 4)
- Status bar: "50 topics" -> "51 topics"
- Still "Proposed Architecture"; holds RECOMPOSE per 44

### D7 - docs/PLAN_TRACKS_TH.md
- HEAD -> da855c5
- Migration 035 text "not applied / 42703" -> APPLIED (verified 5 Sep 2026)
- Track A: A1 remains 6; A7 = 103
- Gate table -> T0
- 4 conditions: move migration 035 to done; 3 remain (deploy edges, passkey, voice); Track C Phase 1 must NOT start before those 3 close

### D8 - docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md
- HEAD -> da855c5
- Sync sections 1 and 11: migration 035 APPLIED; Edge = 12 functions; passkey still broken; voice /voice still mock
- ADD section "STORY / NARRATIVE LAYER (from 51)" with phase mapping:
  - Phase 3 Onboarding -> 12 narrative continuity + "Why am I doing this?" on every screen
  - Phase 6 Twin Birth -> G6 first message from real analysis (10), never "Hi! Nice to meet you"
  - Phase 8 Today -> P0.2 + daily Narrative Hook (real data: twin_memories/decision_logs/daily_briefs)
  - Phase 9 Worlds -> World = "scene" (13/4.5) + Story/Pattern/Reflection/Decision
  - Phase 10/11 -> Choice->Consequence (P1.4/P1.5) + Memory Questions (16)
  - G2 JOURNEY (15) -> "Story History surface" - still P1/P2, record IA reserve in Today/Memory
- Note: this is still a plan doc - never present as shipped code

### T-NEW (recommended) - docs/Experience Architecture v2/STORY_NARRATIVE_LAYER_TH.md
New file, appendix to section 51:
- Story Audit of 12 phases (Landing..SEO): for each phase note where story is missing / repetitive / jumps / reveals too early / lacks payoff
- 7 primitives, 3 layers, rhythm table, 5 Story Modes, guardrails (per Plan section 4)

### T-FINAL - cross-check
- grep all 7 docs + README: no stray "3fa100a" in status sections
- "migration 035 APPLIED" everywhere
- A1=6 / as-any=103 / Edge=12 consistent in every file
- git status: only D1-D8 (+1 new file) changed; untracked v2 docs NOT touched
- Section 51 present after section 50 in Experience Architecture v2.md -> "51 topics"

---

## Phase B - Code Work (NEXT round, BLOCKED on owner decisions - NOT this round)

| # | Item | Status (da855c5) | Action | Gate |
|---|------|------------------|--------|------|
| B1 | Deploy Edge Functions (send-push, daily-brief, pattern-detect) | RED: deploy unverified | supabase functions deploy <name>; needs env SUPABASE_URL/ANON/SERVICE_ROLE + VAPID* (send-push) + ANTHROPIC_API_KEY (daily-brief/pattern-detect); or dashboard | needs decision on method |
| B2 | Passkey flow | RED: broken | (a) fix: AuthContext.tsx:130 add supabase.auth.setSession; PasskeyProvider.ts remove 4 non-existent calls; auth-verify-passkey real JWT signing; or (b) hide Passkey UI temporarily | needs P1 decision |
| B3 | VoiceChat mock | RED: live route | (a) remove /voice route (App.tsx:173) or (b) real placeholder page | needs P1 decision |
| B4 | A1 close: delete 6 orphan files | YELLOW | re-grep no importer -> delete; re-run all gates | code |
| B5 | A7 close: as-any 103 -> 0 | YELLOW | dedicated phase; ~100 real casts in non-test code | code |
| B6 | Rebuild dist/ | YELLOW | dist/ stale ~1 commit; npm run build | after code |
| B7 | Untracked v2 docs | YELLOW | (a) commit or (b) keep untracked (recommend: b, still Proposed Architecture) | P2 decision |
| B8 | Track C Phase 1 | BLOCKED | must not start until B1-B3 closed | stop gate |

Order after Phase A: 1) doc approval, 2) owner decisions B1-B3/B7, 3) run Phase B implementation.

---

## Plan section 4 - Story/Narrative for Track C (content to write into D6 section 51 and D8)

### 4.1 Principles
- Storytelling LAYER on top of existing data, NOT a new Story Engine (respects 44: no parallel intelligence systems)
- Twin + User are protagonists; SICE stays behind the scenes (19)
- No forced story (no chapter-lock / no fake storyline); Evolution reflects real data (17)
- Every screen passes 50: "Does this make SELFPRINT feel more like a Living Intelligence that knows me?"

### 4.2 Seven Story Primitives
1. Chapter - large phase of journey (e.g. Meeting Yourself -> Evolving Together); narrative state, not a locked level system
2. Story Beat - small event (Twin notices -> user explores -> hypothesis -> choice -> remember -> repeat -> pattern -> learning -> evolution)
3. Narrative Hook - reason to return ("I've noticed something...", "I have a hypothesis...")
4. Question - what Twin is still unsure about (matches 16 Memory Questions); creates Curiosity->Return instead of notification bait
5. Choice - what the user chooses
6. Consequence - what actually happened in life
7. Reveal - what Twin learned back

### 4.3 Three Story Layers
1. The Big Story - Curiosity -> Discover -> Understand -> Meet Twin -> Experience -> Choose -> Learn -> Evolve (= 45/46)
2. The Current Chapter - "which chapter am I in now" (narrative state from real data, not a level)
3. The Micro Story (today) - Narrative Hook changes each return visit; Today becomes the storytelling engine of presentation

### 4.4 Rhythm (anti-boredom)
| Moment | Story function |
|--------|----------------|
| Today | What is happening now? |
| Yesterday | What happened? |
| This period | What pattern is forming? |
| Earlier | What have we learned? |
| A decision | What did you choose? |
| After a decision | What happened because of it? |
| Long term | How are you changing? |

Five Story Modes: Reveal, Explore, Choice, Consequence, Evolution (rhythm: Discover -> Wonder -> Explore -> Choose -> Experience -> Reflect -> Reveal; never Insight repeated)

### 4.5 Guardrails (into section 51)
- No fake story / fake precision (17)
- No gamification (chapter-lock, task lists)
- No parallel memory (use existing twin_memories)
- No new intelligence engine (use SICE/InsightEngine)
- Only show a hook when real data exists to back it

---

## Validation (Phase A)
- [ ] Gate numbers in every table = T0 actual run at da855c5
- [ ] grep: no "3fa100a" left in status sections of D1-D8
- [ ] "migration 035 APPLIED" in every doc; A1=6, as-any=103, Edge=12 everywhere
- [ ] Section 51 present in Experience Architecture v2.md after section 50
- [ ] git status: only D1-D8 (+optional new file) changed; untracked v2 docs untouched

---

## Open Questions (block Phase B only, not Phase A)
1. Passkey: fix (a - recommended) or hide UI (b)?
2. Edge deployment: run CLI locally (needs Supabase login) or owner deploys via dashboard?
3. VoiceChat: remove /voice route or real placeholder?
4. Untracked v2 docs: commit or keep untracked (recommend: keep until Track C starts)