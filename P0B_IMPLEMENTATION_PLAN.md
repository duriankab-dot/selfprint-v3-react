# P0-B: Implementation Plan — Existing User Recovery
**Status:** Ready to implement  
**Branch:** p0-b/user-recovery  
**Time Est:** 6-8 hours

---

## MISSION
Connect AuthContext → LifecycleStore → Smart Routing  
Let users resume where they left off

---

## STEP-BY-STEP

### 1. INTEGRATE LIFECYCLE LOADING IN AUTHCONTEXT
**File:** `src/context/AuthContext.tsx`

**What to add:**
```typescript
import { useLifecycleStore } from '../store/lifecycleStore';

// In AuthProvider useEffect (after session is fetched):
useEffect(() => {
  if (!supabase) return;
  
  supabase.auth.getSession().then(({ data }) => {
    const session = data.session;
    setSession(session);
    
    // NEW: Load lifecycle if user is authenticated
    if (session?.user?.id) {
      const loadLifecycle = useLifecycleStore.getState().loadLifecycle;
      loadLifecycle(session.user.id)
        .catch(err => console.error('Failed to load lifecycle:', err));
    }
    
    setLoading(false);
  });
  
  // Listen for auth state changes
  const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
    setSession(newSession);
    
    // NEW: Reload lifecycle when auth state changes
    if (newSession?.user?.id) {
      const loadLifecycle = useLifecycleStore.getState().loadLifecycle;
      await loadLifecycle(newSession.user.id);
    }
  });
  
  return () => listener.subscription.unsubscribe();
}, []);
```

**Acceptance:** 
- ✅ No TypeScript errors
- ✅ lifecycle loads when session found
- ✅ lifecycle reloads on auth state change

---

### 2. CREATE RECOVERY HOOK
**File:** `src/hooks/useRecoveryRoute.ts` (NEW)

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLifecycleStore } from '../store/lifecycleStore';

/**
 * After user authenticates, redirect to appropriate page based on lifecycle
 * ONBOARDING → /onboarding
 * ANALYSIS → /analysis
 * AWAKENING → /core-awakening
 * TWIN_ALIVE → /dashboard
 * WORLD_ACTIVE → /worlds
 */
export function useRecoveryRoute() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const status = useLifecycleStore((state) => state.status);
  const isLoading = useLifecycleStore((state) => state.isLoading);

  useEffect(() => {
    if (authLoading || isLoading) return;
    if (!session?.user?.id) return;

    // Route based on lifecycle status
    const routeMap: Record<string, string> = {
      ONBOARDING: '/onboarding',
      ANALYSIS: '/analysis',
      AWAKENING: '/core-awakening',
      TWIN_ALIVE: '/dashboard',
      WORLD_ACTIVE: '/worlds',
    };

    const targetRoute = routeMap[status] || '/dashboard';
    const currentPath = window.location.pathname;

    // Only navigate if not already on target page
    if (!currentPath.includes(targetRoute)) {
      navigate(targetRoute, { replace: true });
    }
  }, [session, authLoading, status, isLoading, navigate]);
}
```

**Acceptance:**
- ✅ Hook exports cleanly
- ✅ No circular dependencies
- ✅ TypeScript passes

---

### 3. INTEGRATE RECOVERY HOOK IN APP.TSX
**File:** `src/App.tsx`

**What to modify:**
```typescript
function App() {
  // Call hook after providers are loaded
  useRecoveryRoute();

  useEffect(() => {
    const { isValid, missingWorlds } = validateWorldPersonalities();
    if (!isValid) {
      console.error('World personality validation failed:', missingWorlds);
    }
  }, []);

  return (
    // ... existing providers ...
  );
}
```

**Acceptance:**
- ✅ Hook called at app level
- ✅ Recovery routing fires after auth + lifecycle load
- ✅ No infinite redirects

---

### 4. CREATE RECOVERY UI COMPONENT
**File:** `src/components/RecoveryIndicator.tsx` (NEW)

Display progress bar showing user's journey stage:
```
[●●●●○○○○○○] Step 4 of 5: Twin Birth Ceremony
```

**Acceptance:**
- ✅ Shows on all pages
- ✅ Updates based on lifecycle status
- ✅ Styled consistently

---

### 5. UPDATE LIFECYCLE STORE
**File:** `src/store/lifecycleStore.ts`

**Enhancements needed:**
- Mark activity on app open (not just user action)
- Initialize new user if no record exists

```typescript
// In useLifecycleStore (loadLifecycle method):
// If user has no record, auto-create as ONBOARDING
if (!data) {
  await initializeLifecycle(userId, 'ONBOARDING');
}
```

**Acceptance:**
- ✅ New users auto-initialized
- ✅ Returning users loaded

---

### 6. EDGE CASE: ONBOARDING REDIRECT
**File:** `src/pages/Onboarding.tsx`

**Problem:** After completing onboarding, user is redirected to Analysis. But if they return later, they should NOT see Onboarding again.

**Solution:** 
```typescript
// In Onboarding.tsx
useEffect(() => {
  const status = useLifecycleStore((state) => state.status);
  
  // If user already past ONBOARDING, don't show this page
  if (status !== 'ONBOARDING') {
    navigate('/analysis', { replace: true });
  }
}, []);
```

**Acceptance:**
- ✅ Can't re-enter Onboarding if already passed
- ✅ Graceful redirect

---

### 7. HANDLE LIFECYCLE TRANSITIONS
**File:** `src/pages/*.tsx` (all key pages)

Update each page to call `useLifecycleStore.transitionTo()` when user completes that stage:

```typescript
// In AnalysisPage.tsx (when analysis complete)
const transitionTo = useLifecycleStore((state) => state.transitionTo);

const completeAnalysis = async () => {
  // ...analysis logic...
  await transitionTo(userId, 'ANALYSIS');
};
```

**Acceptance:**
- ✅ Lifecycle updates as user progresses
- ✅ Data persisted to Supabase
- ✅ Next login shows updated status

---

### 8. TESTS
**File:** `tests/e2e/user-recovery.spec.ts` (NEW)

```typescript
test('New user → sees ONBOARDING', async () => {
  // 1. Sign up new user
  // 2. Assert redirects to /onboarding
  // 3. Assert lifecycle status = ONBOARDING
});

test('Returning user → resumes at ANALYSIS', async () => {
  // 1. Sign in existing user with status=ANALYSIS
  // 2. Assert redirects to /analysis
  // 3. Assert lifecycle is loaded from DB
});

test('Can't re-enter completed stage', async () => {
  // 1. User with status=TWIN_ALIVE tries to revisit /onboarding
  // 2. Assert redirects away
});
```

**Acceptance:**
- ✅ All tests pass
- ✅ npm run test:e2e passes

---

## FILES TO CREATE/MODIFY

**Create:**
- `src/hooks/useRecoveryRoute.ts`
- `src/components/RecoveryIndicator.tsx`
- `tests/e2e/user-recovery.spec.ts`

**Modify:**
- `src/context/AuthContext.tsx` (add lifecycle loading)
- `src/App.tsx` (add useRecoveryRoute hook)
- `src/store/lifecycleStore.ts` (enhance auto-init)
- `src/pages/AnalysisPage.tsx` (transition on complete)
- `src/pages/CoreAwakening.tsx` (transition on complete)
- `src/pages/Onboarding.tsx` (prevent re-entry guard)

---

## VERIFICATION (5-LAYER)

```bash
# 1. TypeScript
npm run build

# 2. Linting
npm run lint

# 3. Unit tests
npm test:watch

# 4. E2E
npm run test:e2e

# 5. Manual testing
npm run dev
# → Sign up new user → see ONBOARDING
# → Log out, log back in → resume at same stage
```

---

## SUCCESS CRITERIA

- ✅ New user logs in → lifecycle auto-created (ONBOARDING)
- ✅ Returning user logs in → lifecycle loaded from DB
- ✅ User routed to correct page based on lifecycle status
- ✅ Progress bar shows current stage
- ✅ Can't re-enter completed stages
- ✅ Activity timestamp updates on login
- ✅ All tests pass
- ✅ Build succeeds

---

**Ready to code** ✅
