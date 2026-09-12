# MASTER GATE — REMEDIATION PLAN

**Updated:** 2026-09-12 (overwritten; previous plan assumed a gate that had not actually passed)

Current measured state: **Phase A ✅ 51/51 (+ mobile), Phase B ❌ 21/49.**

## Gap 1 — Deployed staging bundle is out of sync with `src`
- Evidence: served `selfprint-staging.pages.dev/en/dashboard` lacks `dashboard-container` even though `src/pages/Dashboard.tsx:84` has it; bundle also lacks the other asserted testids.
- Action: rebuild + redeploy staging from HEAD; re-run `npm run test:e2e:staging`.
- Exit: 22 dashboard-gated failures re-evaluated.

## Gap 2 — Test/product contract conflict (Living Twin + immersive layers)
- MG-01 (Three.js Living Body), MG-02-01 (WorldDrawer/transition container), MG-06 (immersive-page wrapper + CSS) assert UI removed by the immersion-first restructure. Two options:
  1. **Keep tests** → port the Living Twin / WorldDrawer / immersive layer back into the app and add testids.
  2. **Intentional deferral** → convert the affected assertions to real `test.fixme(title, body)` declarations (executed-as-skipped, honest) and document.
- Exit: MG suite state is explicitly rationalized in code, not by deleting tests.

## Gap 3 — Missing testids in `src`
- `decision-form`, `decision-history-list`, `twin-insight-message`, `profile-picture-upload`, `upload-preview/error/success`, `world-detail`, `world-insight`, `nova-screen`, `blueprint-screen`, `holographic-birth`, `twin-interact-button` do not exist anywhere in `src` (confirmed by grep).
- Action: add the testids to the corresponding components **only if** the flows are to be tested; otherwise fold into Gap 2's deferral decision.
- Exit: every remaining failing assertion points at a real, present component or a documented skip.

## Gap 4 — `staging.selfprint.one` DNS/SSL (Cloudflare 525)
- Action: fix alias/certificate so the canonical URL works, or point `STAGING_URL` consistently at `selfprint-staging.pages.dev`.
- Exit: no 525 page reachable during a staging run.

## Gap 5 — `test.fixme(true, '…')` no-ops
- 17 calls at module scope are runtime API misuse (they affect nothing). Convert to correct declarations or remove, per Gap 2 outcome.

## Definition of done
Re-run the full suite (`npx playwright test`) and report: **100 discovered, 0 unexpected failures, skips explicitly declared.** Full-suite number currently **72/27/1**.