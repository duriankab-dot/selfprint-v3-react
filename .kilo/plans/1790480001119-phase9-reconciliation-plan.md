# Phase 9 Reconciliation — Plan (RECONCILIATION ONLY)

Repo: `D:\selfprint-v3-react` · Date: 2026-09-27
Source doc: `docs/FORENSIC_PHASE_09_DEAD_ORPHAN_LEGACY_DUPLICATION_TH.md` (1,549 lines, fully read)

## Goal

Reconcile the Phase 9 forensic document into a canonical, evidence-verified final inventory — **no remediation, no source/test/DB/config/deployment changes, no commit/push, STOP after reconciliation for human review.**

## User decisions (confirmed)

1. **Deliverables = BOTH:**
   - A) New standalone report: `docs/FORENSIC_PHASE_09_RECONCILIATION_REPORT_TH.md`
   - B) Minimal in-place fixes to the Phase 9 doc, limited to evidence-proven errors (typo, stale claims, ID collisions, duplicated blocks)
2. **Re-verify scope = contested points only** (not a full recount of all ~70 items; no new speculative findings).

## Hard constraints

- Touch ONLY 2 files: `docs/FORENSIC_PHASE_09_DEAD_ORPHAN_LEGACY_DUPLICATION_TH.md` (edits) + `docs/FORENSIC_PHASE_09_RECONCILIATION_REPORT_TH.md` (new).
- No source code, tests, DB, config, CI, deployment changes. No `git add/commit/push`.
- No new findings without source evidence; every correction cites `file:line`.
- No remediation execution; recommendations stay as-is except classification fixes.

## Classification buckets (canonical — 7 only)

| Bucket | Maps from old status |
|---|---|
| VERIFIED DEAD | ⚫ DEAD (all 22 invocation paths eliminated, E1) |
| VERIFIED ACTIVE | 🟢 LIVE / VERIFIED ACTIVE with proven production caller |
| LEGACY ACTIVE | 🟠 LEGACY ACTIVE, 🟡 PARTIAL items that still execute (route dup, stale banner, mounted-but-gated) |
| ORPHAN-UNPROVEN | ⚪ UNPROVEN, ⏸️ EXTERNAL/DEFERRED — exists, consumer unproven either way |
| TEST-ONLY | consumers are tests/loadtests only |
| DISCONTINUED | intentionally disabled + backend deleted (`/api/coach` cluster, migration v2/v3 stubs) |
| DUPLICATE CANDIDATE | DP-* + intentional dual-layer + name collisions + SC-* consolidation candidates |

Mapping of existing 🟡 PARTIAL: LG-02 → VERIFIED DEAD (chain unreachable; keep note), LG-03 → DISCONTINUED (flag=0, backend deleted), LG-06/LG-07 → LEGACY ACTIVE, DP-01 DUAL-LAYER → DUPLICATE CANDIDATE (intentional per CLAUDE.md:92).

## Verified corrections (evidence checked 2026-09-27 — apply to doc + report)

1. **TowerStateEngine = typo of TwinStateEngine.** No file and no string `TowerStateEngine` exists in src/. Fix Sections 26 + 26A ("lib/experience/TowerStateEngine") → `lib/experience/TwinStateEngine`, consistent with LG-01 / Section 8 #2. (VERIFIED ACTIVE)
2. **`functions/api/metrics.ts` → ORPHAN-UNPROVEN (TEST/LOADTEST-ONLY).** Zero callers in src/ and index.html; only `loadtests/*`. Fix: Section 14 "Resolved" table row + "Critical correction" paragraph, Section 20 reclassification row (was "🟢 VERIFIED ACTIVE"), RV-02 ("E1 proven (has callers)" → "E1: zero production callers; k6/loadtest only"), Section 26/26A counts.
3. **`functions/api/autonomy-log.ts` → ORPHAN-UNPROVEN (chain severed).** `useChat.ts:160` is the only caller; useChat's only importer is `ChatWindow.tsx` which has zero importers (verified). Fix same locations as metrics + RV-03.
4. **PersonalContextBuilder — downgrade "confirmed runtime bug".** E1-proven: `TwinPersonalityPage.tsx:116-166` returns `PersonalityMetrics` shape under shared key `['personalContext', userId]` (9 other sites expect `PersonalContext`; `AnalysisPage.tsx:202` reads `sourceCount`). 13 runtime instantiation sites re-verified (grep matches M4 exactly). NOT E5-proven: "silent type errors"/"full analysis silently null" runtime consequence — and the doc's own mechanism claim is internally inconsistent (`sourceCount===undefined` is not `===0`). Reclassify risk as "cache-shape collision proven at source level (E1); runtime impact unproven (E5)" in Sections 26/26A and risk tables.
5. **TwinVisualDNA = ×3 canonical (F1/F2/F3).** All files exist: `src/lib/twinVisualDNA.ts` (F1), `src/lib/twin/twinVisualDNA.ts` (F2), `src/services/VisualDNAService.ts` (F3; consumer `CoreAwakeningService.ts:14,427` verified). Fix DP-03 (×2 → ×3 F1/F2/F3) and Section 26 "Intentional Duplicates: TwinVisualDNA ×2" → ×3. Section 9 stays canonical. Recount F1 "10 Active Consumers" vs the 11 names listed.
6. **OP-02 `useDecisionCache` — doc claim FALSE.** File EXISTS (`src/hooks/useDecisionCache.ts`, 148 ln, exports useDecisions/useDecisionOutcomes/useDecisionPatterns/useInvalidateDecisionCache/DECISION_CACHE_KEYS/CACHE_CONFIG). All exports have zero importers (verified) → VERIFIED DEAD (E1) with corrected evidence text.
7. **lib/intelligence import count.** Measured 81 `from '@/lib/intelligence/` subpath imports (incl. tests). Replace inconsistent "88" (Section 15) and "~32 files" (L1) with one canonical measured pair: total imports + unique files, split prod vs test.
8. **ID collisions / double-count fixes:**
   - Section 5 reuses OP-01..OP-03 with different meanings → renumber to OP-05..OP-07 (keep Section 1 OP-01..04 as canonical).
   - DC-58 (DecisionIntelligence) duplicates DC-39 → merge into DC-39, delete DC-58 row.
   - DC-57 (PCB ×13 sites) sits in "Dead Lib/Utilities" table but is NOT dead → move/re-tag DUPLICATE CANDIDATE.
   - DC-19 (⏸️ UNPROVEN), DC-40 (⚪ UNPROVEN) must not count toward dead totals → ORPHAN-UNPROVEN.
   - DC-29 (TwinAvatar, 1 test consumer), DC-30 (JsonLdSchemas, test-only — verified) → TEST-ONLY, not dead.
   - DC-49 voice-twin.css has "(unverified)" caveat → ORPHAN-UNPROVEN.
   - Section 26 counts table: "Orphan CF Functions | 8" lists 5 items; dead hooks/components/services counts (10/18/14) inconsistent with Section 21 (18 removal items) → recompute all totals from reconciled tables, exact numbers only (no "70+").
9. **Doc hygiene (evidence-based, minimal):** second `## 7.7` header → renumber `7.8`; remove duplicated 7.2–7.5 block after the Supabase table (lines ~565-571); fix Section 25 numbering (two "9."/"10."); stale size notes ("~87 KB", "~65 items") → actual/removed.

## Work steps (ordered)

1. Re-read Phase 9 doc end-to-end; build working list of every item with its current status (DC-01..60, OP-01..04 + Section-5 OPs, LG-01..08, DP-01..06, RV-01..07, SC-01..06, M1-M9, AA-1..6).
2. Run targeted re-verification greps for contested items only (metrics, autonomy-log, useDecisionCache, PCB sites, TwinVisualDNA F1-F3 consumers, lib/intelligence import count, TowerStateEngine). Record file:line evidence.
3. Apply in-place corrections (correction list §Verified corrections) to the Phase 9 doc with minimal diffs.
4. Build canonical inventory: re-tag every item into the 7 buckets; dedupe IDs; compute exact counts with zero double-counting.
5. Write `docs/FORENSIC_PHASE_09_RECONCILIATION_REPORT_TH.md` (TH, same style as Phase 9) with the mandated sections (below).
6. Validation (see below). Then STOP — no remediation, no commit.

## Report structure (mandated 8 outputs)

1. **Canonical dead count** — exact N + full VERIFIED DEAD list (deduped, corrected).
2. **Canonical active/legacy count** — exact N, split VERIFIED ACTIVE / LEGACY ACTIVE / DISCONTINUED.
3. **Canonical orphan/unproven list** — ORPHAN-UNPROVEN + TEST-ONLY items with missing-evidence note each.
4. **Canonical duplicate candidates** — TRUE (accidental) vs INTENTIONAL (CLAUDE.md-gated) vs name-collision; each with SC ref.
5. **Confirmed architecture risks** — with evidence level (E1 vs E5-pending) per risk.
6. **Unresolved external/runtime items** — updated RV table (RV-02/03 corrected wording).
7. **Contradictions resolved** — full table: claim → verified evidence → resolution (every item above).
8. **"ยังไม่ควรแตะ" list for Phase 10** — dual-layer SICE engines (CLAUDE.md:92 gate), TwinStateEngine ×3 rename/merge, TwinVisualDNA F1/F2/F3 consolidation, PersonalContextBuilder consolidation + cache-key fix (needs E5 repro first), `/api/metrics` + `/api/autonomy-log` (need E5/external verification), SFXProvider/sfx chain (RV-01), Supabase Edge orphan functions (RV-05), `run-migrations.cjs` v1, TwinBirth dead chain (SC-05 wire-or-remove decision first), `src/package.json` (RV-06), production SHA (RV-07).
Plus: methodology note (recount scope = contested items only; no new speculative findings) and 🛑 STOP notice awaiting human review.

## Validation

- `git status` → only the 2 doc files changed/untracked; nothing else.
- Grep the Phase 9 doc: no remaining "TowerStateEngine", no duplicated OP-01 in Section 5, no DC-58, metrics/autonomy-log no longer labeled VERIFIED ACTIVE anywhere, no duplicate `## 7.7` header, no "×2" TwinVisualDNA remnants (except historical-claim quotes kept verbatim where they describe the old wrong claim).
- Report: every count cross-sums; every listed item has bucket + evidence line reference; no item in two buckets.
- No "confirmed runtime bug" wording left for PCB without E5 qualifier.

## Out of scope / STOP

- Any removal, rename, code change, migration, flag change — forbidden.
- New forensic findings — forbidden.
- Commit/push — forbidden. Hand off to human review after step 6.
