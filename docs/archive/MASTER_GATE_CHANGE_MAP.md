# MASTER GATE — CHANGE MAP (2026-09-12)

**Overwrites the previous "FULL PASS" change map** — that map recorded no real E2E execution. This map reflects the actual code changes and measured outcomes.

## Changes applied this session (HEAD 60715c5 + uncommitted)

| # | File | Change | Why |
|---|------|--------|-----|
| 1 | `package.json` | Added `"typecheck": "tsc -b"` | `npm run typecheck` did not exist (was a claimed command) |
| 2 | `playwright.config.ts` | `chromium-staging` defined **unconditionally**; deleted `existsSync('./e2e/.auth/user.json')` gating | config-time existsSync raced globalSetup — project could disappear before auth state was created |
| 3 | `e2e/global-setup.ts` | Added ASCII/ByteString guard on header/URL values | non-ASCII char (e.g. Thai `ใ` pasted into `E2E_SUPABASE_ANON_KEY`) crashed `fetch` with cryptic `ByteString` error |
| 4 | `e2e/global-setup.ts` | Deterministic staging detection via `config.argv` + `E2E_STAGING_RUN` | staging run without creds now fails with a clear BLOCKED error instead of silently removing the project |
| 5 | `e2e/global-setup.ts` | Placeholder `{cookies:[],origins:[]}` storageState written on Phase A-only runs | keeps project index stable; `--project=chromium` in CI with no creds still works |
| 6 | `e2e/global-setup.ts` | Login failure / missing token → throws (never proceeds with stale state) | prevents false-PASS via an old/expired `user.json` |
| 7 | `e2e/fixtures/test-user.ts` | `requireEnv` moved into lazy getters | `--list`/collection no longer throws when E2E passwords absent; still fails loudly at first use in a test |
| 8 | `e2e/run-staging.mjs` | Sets `E2E_STAGING_RUN=1` | belt-and-braces marker for global-setup |

## Previous session's change (revalidated)
- `e2e/global-setup.ts` reload + `waitForFunction` after localStorage injection — kept; confirmed functional by live probe (authenticated dashboard renders).

## Not changed (explicitly)
- No test was skipped/removed/weakened.
- Phase B (chromium-staging) is fully preserved.
- No secrets were added to code or docs; the anon key previously leaked into committed reports has been scrubbed from the rewritten docs.
- `staging.selfprint.one` SSL issue and the deployed-bundle/test contract drift are environment/product blockers, not covered by these code changes.