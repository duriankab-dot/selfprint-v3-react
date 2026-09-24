FORENSIC BASELINE REPORT
Current Repository State
HEAD: 889d455 (master) — "Fix test_stabilize upload gate and secure e2e auth state"
Branch: master
Working tree: Clean except for untracked doc file
No debug test file exists at e2e/debug-twin-existence.spec.ts
Key Architecture Findings
Twin fetch path: ImmersiveTwinChat → TwinContext (useEffect, line 308-384) → fetchUserTwin(userId) → Supabase .maybeSingle()
Auth session: Stored in localStorage by e2e/global-setup.ts under key sb-<project-ref>-auth-token
RLS policy on twins table: auth.uid() = user_id (migration 024)
Seed script creates twins in public.twins with user_id from auth (seed-test-users.ts:188-202)
Lifecycle sync sets user_lifecycle.status = TWIN_ALIVE for active users (seed-test-users.ts:214-236)
fetchUserTwin uses .maybeSingle(): Critical — 0 rows returns data=null, error=null (NOT PGRST116). PGRST116 only fires for >1 rows. Missing Twin throws at line 103 (if (!data)), not line 78.
REQUIRED CHANGES (Manual Application)
1. Create Diagnostic Test: e2e/debug-twin-existence.spec.ts
/**
 * DEBUG / FORENSIC ONLY — MG-01-01 TwinNotFoundError root-cause proof.
 * HANDOFF-001 (corrected): prove Twin row exists for authenticated session user
 * via Supabase REST API with browser session's JWT.
 */
import { test, expect, type Page } from '@playwright/test';

const SUPABASE_URL = process.env.E2E_SUPABASE_URL;
const ANON_KEY = process.env.E2E_SUPABASE_ANON_KEY;

function projectRefFrom(url: string | undefined): string | null {
  return url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
}

interface BrowserSession {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  email?: string;
  source: string;
}

async function readBrowserSession(page: Page): Promise<BrowserSession | null> {
  const viaGlobal = await page.evaluate(async () => {
    const w = window as any;
    try {
      const client = w.supabase ?? w.__supabase;
      if (client?.auth?.getSession) {
        const { data } = await client.auth.getSession();
        if (data?.session?.access_token && data?.session?.user?.id) {
          return {
            access_token: data.session.access_token as string,
            refresh_token: data.session.refresh_token as string | undefined,
            user_id: data.session.user.id as string,
            email: data.session.user.email as string | undefined,
            source: 'window.supabase.auth.getSession()',
          };
        }
      }
    } catch {}
    return null;
  });
  if (viaGlobal) {
    return {
      accessToken: viaGlobal.access_token,
      refreshToken: viaGlobal.refresh_token,
      userId: viaGlobal.user_id,
      email: viaGlobal.email,
      source: viaGlobal.source,
    };
  }

  const ref = projectRefFrom(SUPABASE_URL);
  const viaStorage = await page.evaluate((projectRef) => {
    const keys = Object.keys(localStorage);
    const key = keys.find(
      (k) => k.includes('auth-token') && (!projectRef || k.includes(projectRef)),
    );
    if (!key) return { keys, found: null as null | Record<string, any> };
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '{}');
      const session = parsed?.currentSession ?? parsed;
      const access_token = session?.access_token as string | undefined;
      const refresh_token = session?.refresh_token as string | undefined;
      const user_id = session?.user?.id as string | undefined;
      if (access_token && user_id) {
        return {
          keys,
          found: {
            access_token,
            refresh_token,
            user_id,
            email: session?.user?.email,
            source: `localStorage:${key}`,
          },
        };
      }
    } catch {}
    return { keys, found: null };
  }, ref);

  if (!viaStorage.found) {
    console.log('[DEBUG] localStorage auth keys present:', viaStorage.keys);
    return null;
  }
  return {
    accessToken: viaStorage.found.access_token,
    refreshToken: viaStorage.found.refresh_token,
    userId: viaStorage.found.user_id,
    email: viaStorage.found.email,
    source: viaStorage.found.source,
  };
}

test.describe('DEBUG MG-01-01 Twin existence (forensic)', () => {
  test.beforeEach(() => {
    test.skip(
      !SUPABASE_URL || !ANON_KEY,
      'E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY not set. Run via `npm run test:e2e:staging` so .env.e2e.staging is loaded into the worker env.',
    );
  });

  test('DEBUG: Twin row exists for the authenticated session user', async ({ page }) => {
    const supabaseUrl = SUPABASE_URL as string;
    const anonKey = ANON_KEY as string;

    await page.goto('/th/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page
      .locator('[data-testid="dashboard-container"]')
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(1000);

    const session = await readBrowserSession(page);
    if (!session) {
      test.skip(
        true,
        'No authenticated browser session found — re-run with a fresh storageState (npm run test:e2e:staging).',
      );
      return;
    }
    console.log('[DEBUG] Session source:', session.source);
    console.log('[DEBUG] Authenticated user:', session.email ?? '(no email)', '| user_id:', session.userId);

    const url = `${supabaseUrl}/rest/v1/twins?user_id=eq.${session.userId}&select=*`;
    const response = await page.request.get(url, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${session.accessToken}`,
        Accept: 'application/json',
      },
    });

    const status = response.status();
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }

    console.log('[DEBUG] Twin REST url:', url);
    console.log('[DEBUG] Twin query status:', status);
    console.log('[DEBUG] Twin query body:', JSON.stringify(body, null, 2));

    if (status === 401 || status === 403) {
      console.log('[DEBUG] INTERPRETATION: 401/403 — JWT rejected (expired/invalid) or RLS denies the authenticated role.');
    } else if (Array.isArray(body) && body.length === 0) {
      console.log('[DEBUG] INTERPRETATION: 0 rows — Twin MISSING for this user (or hidden by RLS). Trace the seed step. STOP: do not patch app code.');
    } else if (Array.isArray(body) && body.length === 1) {
      console.log('[DEBUG] INTERPRETATION: exactly 1 Twin row — REST/DB read path is healthy. If the app still throws TwinNotFoundError, it is a client-side auth/session mismatch or RLS hiding the read from the app role.');
    } else if (Array.isArray(body) && body.length > 1) {
      console.log('[DEBUG] INTERPRETATION: multiple Twin rows — .maybeSingle() will raise PGRST116.');
    }

    expect(status, `REST query should succeed (got HTTP ${status})`).toBe(200);
    expect(Array.isArray(body), 'REST body should be a JSON array').toBeTruthy();
    const rows = body as any[];
    expect(rows.length, 'Exactly one Twin row must exist for the authenticated user').toBe(1);
    expect(rows[0]?.user_id, 'Twin row user_id must match the authenticated user').toBe(session.userId);
  });
});
2. Add Debug Logging: src/services/TwinSupabaseService.ts (replace lines 66-72)
    const supabase = await getSupabaseClient();

    // ── HANDOFF-002 (forensic, TEMPORARY — remove after proof) ──────────────
    console.log('[DEBUG] fetchUserTwin for userId:', userId);
    const { data, error } = await supabase
      .from('twins')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('[DEBUG] Supabase response:', {
      hasData: data !== null,
      dataUserId: (data as any)?.user_id ?? null,
      errorCode: error?.code ?? null,
      errorMessage: error?.message ?? null,
      errorDetails: error?.details ?? null,
      errorHint: error?.hint ?? null,
    });
    if (error?.code === 'PGRST116') {
      console.log('[DEBUG] Classification: PGRST116 — with maybeSingle() this means MULTIPLE rows, not "no row".');
    } else if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('permission') || m.includes('denied') || m.includes('rls')) {
        console.log('[DEBUG] Classification: PERMISSION/RLS error:', error.message);
      } else {
        console.log('[DEBUG] Classification: OTHER Supabase error:', error.code, error.message);
      }
    } else if (!data) {
      console.log('[DEBUG] Classification: NO ROW — data=null, error=null (maybeSingle()). Twin absent OR hidden by RLS.');
    } else {
      console.log('[DEBUG] Classification: ROW FOUND — id:', (data as any).id, 'user_id:', (data as any).user_id);
    }
    // ────────────────────────────────────────────────────────────────────────
    // Handle Supabase error response
3. Required Playwright Config Change
Add '**/debug-twin-existence.spec.ts' to playwright.config.ts:63-70 (chromium-staging.testMatch array) temporarily.

EXECUTION COMMANDS
# 1. Apply the two code changes above
# 2. Add debug test to testMatch in playwright.config.ts temporarily
# 3. Run diagnostic (loads .env.e2e.staging into worker env):
npm run test:e2e:staging -- e2e/debug-twin-existence.spec.ts

# 4. If Twin row exists, run master-gate to capture [DEBUG] logs:
npm run test:e2e:staging -- e2e/master-gate.spec.ts
FORENSIC HYPOTHESES (Do Not Fix Until Proven)
REST Query Result	Interpretation	Next Action
0 rows	Twin missing in DB or hidden by RLS	Trace seed-test-users.ts execution, verify user_id match, check RLS
1 row	DB read path healthy	If app still throws TwinNotFoundError → client auth/session mismatch or app-role RLS hiding
401/403	JWT invalid/expired or RLS denies	Check token freshness, RLS policy on authenticated role
>1 row	Duplicate twins	.maybeSingle() throws PGRST116 → investigate seed idempotency
Critical: The PGRST116 → TwinNotFoundError branch at line 78 is likely dead for missing-row case (.maybeSingle() returns data=null, error=null for 0 rows). The real throw is line 103. Confirm with new logs before touching read path.

NEXT STEPS
Please apply the two code changes above, then run the diagnostic. Report back:

REST query HTTP status
Response body (twin row count, user_id match)
[DEBUG] Classification from TwinSupabaseService logs
Whether MG-01-01 test passes after diagnosis
Once root cause is proven with evidence, we proceed to minimal targeted fix per the master plan.