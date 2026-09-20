# Security

## Authentication

- **Provider:** Supabase Auth (email/password)
- **JWT Verification:** `verifyUser()` in CF Functions uses `SUPABASE_SERVICE_ROLE_KEY` to call `auth.getUser(token)`
- **Session Storage:** localStorage (Supabase default) — acceptable with CSP headers
- **Passkey:** Disabled (`PASSKEY-DISABLED-001`) pending rebuild with `@simplewebauthn/server`

## Authorization

### Row Level Security (RLS)

All user-data tables have RLS enabled:

| Migration | Tables | Policy Pattern |
|-----------|--------|----------------|
| 001–016 | profiles, blueprints, decisions, analytics, chat, credentials, journal, subscriptions | `auth.uid() = user_id` |
| 017 | auth_rate_limits | Re-enabled by migration 035 |
| 018–030 | passkey challenges, daily briefs, twin state/personality/memory/capabilities, conversations, notifications | Per-user policies |
| 032–040 | learning profiles, community insights, visual DNA, onboarding, lifecycle | Per-user policies |

Migration 035 (`forensic_consolidation_2026-09-03.sql`) re-enables RLS on `auth_rate_limits`, drops permissive policies without `TO service_role`, and consolidates missing INSERT policies.

### RPC Authorization Guards

- `create_twin_complete`: Added `IF p_user_id <> auth.uid() THEN RAISE EXCEPTION` (AUTHGUARD-001)
- `optimize_twin_creation`: Same guard added (AUTHGUARD-001)

Both functions are `SECURITY DEFINER` — the guard prevents IDOR before any DML executes.

### API Authorization

Every Cloudflare Function endpoint requires verified JWT:
- Twin/Nova: `verifyUser()` + 401 on missing/invalid token
- Unified handler: `verifyUser()` + 403 on userId mismatch (IDOR prevention)
- Past IDOR fixes: NOTIFAUTH-001, TWINEVOAUTH-001, METRICS-FIX-001, AUTONOMY-FIX-001

### Storage Policies

Bucket `profiles` has upload/update/delete policies checking `auth.uid()`. Note: path matching may need alignment with actual upload paths (see Known Issues below).

## Security Headers

Configured in `public/_headers` (Cloudflare Pages):

| Header | Value |
|--------|-------|
| Content-Security-Policy | Restrictive policy (self + allowed CDN origins) |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera(), microphone(), geolocation() disabled |

## Rate Limiting

| Endpoint | Limit | Mechanism |
|----------|-------|-----------|
| Twin API | 40 req/min | In-memory Map per isolate |
| Nova API | Configurable | In-memory Map per isolate |
| Unified handler | 100 req/min (authenticated) | `_utils/rate-limit.ts` |

**Known limitation:** In-memory maps reset on cold start. On Cloudflare Workers each isolate has its own memory. Future improvement: use Workers Rate Limiting binding or KV.

## Secrets Management

- `.env*`, `.dev.vars`, `KEY/`, `*.pem`, `*.key` are gitignored
- CF Pages secrets configured in dashboard (not committed)
- Historical incident: OpenRouter key was committed (documented in `.gitignore:40-43`) — verify rotation completed

## XSS Prevention

- All 9 `dangerouslySetInnerHTML` sites go through `safeJsonLd()` which escapes `</`
- Blog content rendered via `react-markdown` (no `rehype-raw`)
- Chat renders plain text only
- No raw `innerHTML` sinks found

## File Upload Validation

- Server-side: `allowed_mime_types`, 5 MB limit in migration 038
- Client-side: type/size validation in `FileUploadService.ts`

## Error Handling

- API responses don't leak stack traces or internal errors (DEBUGLEAK-001)
- Sentry integration lazy-loaded, captures exceptions with context
- Provider error details mapped to opaque codes where possible

## Known Issues

| ID | Severity | Description |
|----|----------|-------------|
| M-1 | Medium | Client-controlled system prompt — safety layer (`safetyCheck`) never called by server endpoints |
| M-3 | Medium | `record-outcome` no ownership validation of decision_log row |
| M-4 | Medium | Public storage bucket `profiles` — anonymous can list/download; path matching may be incorrect |
| M-8 | Low | Stream errors leak provider details (OpenRouter error body) |

## Dependency Vulnerabilities

`npm audit`: 1 moderate — `qs` 2.2.5–6.15.3 (bracket-key DoS + isBuffer DoS, GHSA-x5fp-wj9c-mxmx / GHSA-4mjr-xmp4-gh2g). Fix: `npm audit fix`.

No high or critical vulnerabilities.
