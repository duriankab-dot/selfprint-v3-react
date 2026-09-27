# PHASE 11 — Batch 6 Commit + Batch 7 (B2 Chains) Execution Plan

**Owner directive (27 ก.ย. 2026):** Commit Batch 6 → execute Batch 7 safe removal (4 files) → verify → update Ledger (Batch 6 closure + Batch 7 log + UO-7) → send BATCH 7 REPORT. Remote push = HOLD.

## Verified context (27 ก.ย. 2026 · HEAD `4bc4a96` @ master · branch ahead of origin by 1)

- Working tree = exactly the 2 Batch 6 files modified (`src/hooks/useTwinBirth.ts` +12/-6 region, `src/pages/TwinBirthPage.tsx` +19) — matches Ledger §9.1. All forensic docs/plans are untracked and must stay out of the commit.
- Batch 7 targets — **zero-consumer proof repo-wide** (grep `ts/tsx/js/mjs/cjs`, 27 ก.ย.):
  - `src/features/chat/hooks/useChat.ts` — single consumer = `ChatWindow.tsx:2` (Phase 9 row 18, transitive dead)
  - `src/components/chat/ChatWindow.tsx` — zero importers (Phase 9 DC-20)
  - `src/hooks/useJournalQueue.ts` — zero consumers (Phase 9 row 49, M5/M9)
  - `src/lib/storage/journalQueueDB.ts` — single consumer = `useJournalQueue.ts:19`
- ⚠️ **Path correction:** Owner directive wrote `src/lib/journal/journalQueueDB.ts` — actual repo path is **`src/lib/storage/journalQueueDB.ts`** (glob-verified). Delete the actual path.
- **sw.js coupling (contradicts Ledger §8.2 assumption "มีเพียง type declaration อ้าง"):** real journal-sync machinery exists — `sw.js:57` (`SYNC_TAG='journal-sync'`), `sw.js:204-209` (sync listener), `sw.js:215-228` (`syncJournalQueue()` posts `SYNC_JOURNAL`), `sw.js:312-314` (`TRIGGER_SYNC` handler). Coupling is one-directional (SW posts messages to clients; SW never imports client code; **no sender of `TRIGGER_SYNC` exists anywhere**). Owner decision: delete the 2 client files only, leave sw.js untouched, register **UO-7** for the sw.js residue.
- `/api/journal-sync` has no CF Pages handler (JOURNAL404-001, `useJournalQueue.ts:172-186`) — end-to-end sync never worked in production; queued IndexedDB data becomes unreachable (harmless).
- No test file references any of the 4 files → vitest count expected to stay 1,102/1,102 (72 files).

## Task order

### Task 1 — Local commit Batch 6 (mutating; git add/commit require permission confirmation)
1. `git add src/hooks/useTwinBirth.ts src/pages/TwinBirthPage.tsx` — **stage only these 2 files** (untracked docs/plans must not be staged).
2. Commit on branch `master`:
   ```
   feat(phase11): wire twinBirth chain to TwinBirthPage via CoreAwakeningService (W2)
   ```
3. **Remote push = HOLD** (standing invariant).
4. Record the commit SHA for the Ledger.

### Task 2 — Batch 7 removal (4 files, exactly)
Delete:
1. `src/features/chat/hooks/useChat.ts`
2. `src/components/chat/ChatWindow.tsx`
3. `src/hooks/useJournalQueue.ts`
4. `src/lib/storage/journalQueueDB.ts` ← actual path, NOT `src/lib/journal/…`

**Do NOT touch (invariants + verified residues):** `src/sw.js`, `src/main.tsx`, `src/services/supabase-service.ts`, `src/pages/NovaChat.tsx`, `src/lib/global-webapi-types.d.ts`, `functions/api/autonomy-log.ts`, Supabase Functions ×8, PCB / SICE / TSE / TVD, `/api/metrics`, `/api/autonomy-log`, TEST-ONLY 9, `CoreAwakeningService.ts`, `twinBirthFlow.ts`, `dnaPersistence.ts`, sibling chat components (`FloatingSelfprintChat`, `TypingIndicator`, `ImmersiveNavbar` — outside B2 chain).

**Stop rule (owner-specified):** if `tsc -b`/`vitest` reveals a real consumer contradicting the zero-consumer claims → restore the deleted file(s) immediately (`git restore`), register a new UO, halt that chain's removal, report.

### Task 3 — Verification pipeline
- `tsc -b` → expect 0 errors.
- `vitest run` → expect ≥1,102 tests passing (baseline 1,102/1,102, 72 files).
- E2E/build not required by owner for Batch 7.

### Task 4 — Ledger update (`docs/PHASE_11_GATE_LEDGER_TH.md` — append-only, never edit prior sections)
- **§10 BATCH 6 CLOSURE:** DC-16 (`src/lib/twinBirth/twinBirthFlow.ts`), DC-17 (`src/lib/twinBirth/dnaPersistence.ts`), DC-18 (`src/hooks/useTwinBirth.ts`) → **WIRED (LIVE)** per owner decision; wiring summary per §9.1; Batch 6 commit SHA; push HOLD.
- **§11 BATCH 7 EXECUTION LOG:** 4 files deleted with canonical IDs (row 18, DC-20, row 49 M5/M9); verification results; residue list (comment-only, untouched): `supabase-service.ts:15-16,274` (useChat mention; `getChatHistory` loses last caller while `saveMessage` stays live via `NovaChat.tsx:16,90,121`), `functions/api/autonomy-log.ts:18,41`, `global-webapi-types.d.ts:30`, `main.tsx:67-70` (`sw-message` forward — generic, has no consumer today); **UO-7 registration:** sw.js journal-sync machinery (`sw.js:57, 204-209, 215-228, 312-314`) + `/api/journal-sync` (no CF handler) + unreachable IndexedDB queue data — candidate for later cleanup batch, awaiting owner decision; correction of §8.2 assumption ("มีเพียง type declaration อ้าง" is false — sw.js has real machinery).

### Task 5 — BATCH 7 REPORT (no Batch 7 commit)
Report results (deletion diff stat, tsc/vitest outputs, ledger §10/§11, UO-7) and **await owner approval before any Batch 7 commit** (pattern per Batch 5/6). Push remains HOLD.

## Validation
- After Task 1: `git status` shows clean tree except untracked docs/plans.
- After Task 2: `git status` shows exactly 4 deletions, nothing else.
- `tsc -b` 0 errors; `vitest run` ≥1,102 passing.
- No invariant file modified (confirm via `git status`/`git diff --name-only`).

## Out of scope (not authorized)
- Remote push; Batch 7 commit before owner approval; sw.js edits; everything in the do-not-touch list above.