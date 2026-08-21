# P0-B: Gap Analysis — Existing User Recovery
**Date:** 2026-08-21  
**Status:** 🔴 Not implemented

---

## CURRENT STATE

### What Works ✅
- AuthContext loads session on mount (`supabase.auth.getSession()`)
- Lifecycle store created (`src/store/lifecycleStore.ts`) with load capability
- Database table ready: `user_lifecycle` (user_id, status, twin_id, timestamps)

### What's Missing ❌

**GAP #1: No Automatic Lifecycle Loading on Login**
- AuthContext fetches session but doesn't load lifecycle state
- User lands on same page regardless of where they were before
- No resume flow

**GAP #2: No Route-Based Recovery**
- App.tsx routes all authenticated users to `/dashboard`
- No check for lifecycle status
- ONBOARDING user who finished ANALYSIS gets sent to Dashboard, not to CoreAwakening

**GAP #3: No UI Awareness of Lifecycle**
- Pages don't know user's lifecycle stage
- Can't show appropriate content (e.g., "Complete Analysis First" vs "Start Twin Birth")
- No breadcrumb or progress indicator

**GAP #4: Incomplete Lifecycle Initialization**
- New user: lifecycle should be set to ONBOARDING
- Returning user: lifecycle should be loaded + resumed

---

## GAPS DETAILED

### Issue #1: AuthContext → Lifecycle Connection Missing
```typescript
// Current: AuthContext.tsx
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session);  // ← Only sets session
    setLoading(false);         // ← Doesn't load lifecycle
  });
}, []);

// Need: Also call useLifecycleStore.loadLifecycle(userId)
```

**Impact:** User logs in but lifecycle state isn't in memory

---

### Issue #2: No Smart Routing on Auth Change
```typescript
// Current: App.tsx line 75-80
function HomeRoute() {
  if (auth?.session) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

// Need: Route based on lifecycle status
// ONBOARDING → /onboarding
// ANALYSIS → /analysis (or /dashboard if already completed)
// AWAKENING → /core-awakening
// TWIN_ALIVE → /dashboard (or /chat/twin)
// WORLD_ACTIVE → /worlds
```

**Impact:** User can't resume their actual place in the journey

---

### Issue #3: Lifecycle Store Not Hooked to Auth
- `useLifecycleStore.loadLifecycle()` exists but never called
- useEffect in components needs to fire when session changes
- No initialization for new users

---

### Issue #4: Resumed User Experience Incomplete
- User logs back in after 1 week
- Lifecycle loads but no confirmation message
- No "Welcome back! You were at [stage]"
- Activity timestamp not updated on login

---

## VERIFICATION CRITERIA

**P0-B Complete When:**
- ✅ Returning user logs in → lifecycle loads automatically
- ✅ Lifecycle status determines which page user sees
- ✅ User sees appropriate onboarding/progress indicator
- ✅ Activity timestamp updates on login
- ✅ New user auto-creates lifecycle record as ONBOARDING
- ✅ All 5-layer tests pass

---

## SUCCESS FLOW

```
User Opens Selfprint
  ↓
AuthContext checks Supabase session
  ↓
New Session Found?
  ├─ YES → Load Lifecycle from DB
  │        ├─ Exists? → Resume state (ANALYSIS/AWAKENING/etc)
  │        └─ Doesn't Exist? → Create new (ONBOARDING)
  │
  └─ NO → Show Landing Page

With Lifecycle Loaded
  ↓
Route to appropriate page:
  - ONBOARDING → /onboarding
  - ANALYSIS → /analysis
  - AWAKENING → /core-awakening
  - TWIN_ALIVE → /dashboard (or /chat/twin)
  - WORLD_ACTIVE → /worlds
  ↓
User sees progress indicator: "Step 3 of 5"
```

---

**Next:** P0B_IMPLEMENTATION_PLAN.md (action steps)
