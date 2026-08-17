# HANDOFF — 2026-08-10 Experience Engine Session

## สิ่งที่ทำเสร็จในเซสชันนี้

### ✅ Experience Engine (§16-18, §20) — 100% Real Implementation

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/lib/experience/EmotionSignalEngine.ts` | Maps PersonalContext.emotionalRange + time-of-day → EmotionSignal |
| `src/lib/experience/ThemeResolver.ts` | Mood × Hub → ThemeResolution + `--exp-*` CSS vars |
| `src/lib/experience/ExperienceEngine.ts` | Main orchestrator → ExperienceConfig |
| `src/lib/experience/index.ts` | Central exports |
| `src/context/ExperienceContext.tsx` | React context + effect hooks wiring |
| `src/App.tsx` | Added `<ExperienceProvider>` inside TwinProvider |

### CSS vars injected to `<html>` automatically
- `--exp-motion-multiplier` — speed modifier on animation durations (0.5–1.8)
- `--exp-particle-density` — Twin particle count (1–5)
- `--exp-twin-glow` — Living Twin orb glow color
- `--exp-atmosphere` — ambient label (cosmic/ambient/energetic/minimal)

### §17 Theme System
- 72 themes (12 hub × 6 mood) already exist in CSS
- ThemeResolver just selects + adds supplementary `--exp-*` vars
- NO new themes generated

### §19 User Preference respected
- `shouldAutoApplyHub` = true **only** when `hubHistoryLength === 0` (never manually switched)
- Mood suggestion only if `hasCheckedIn === false`

### TypeScript: EXIT:0 ✅

---

## สถานะ P0 ตาม Master Direction §44

### ✅ เสร็จแล้ว

| หมวด | รายการ |
|------|--------|
| Intelligence | Native Engine, Personal Context, Memory, Evidence, Pattern Detection, User Feedback, First-session |
| Twin | Living AI Twin (§3), Synthesis WOW MOMENT (§4), Processing States (§5), TwinStateEngine |
| Dashboard | Executive Summary (§9), Full Analysis (§10), Behavioral Patterns (§11), Growth Space (§12) |
| Experience | Experience Engine (§16), Theme Resolver 66-72 themes (§17), Emotion Signal (§18), Adaptive Hub (§20) |
| Platform | PWA (§35): sw.js + manifest + meta + SW registration |
| Privacy | PDPA Privacy Center (§38): Export + Delete + Consent + Clear Memory |
| Auth | Magic Link (§34) |

### ❌ P0 ที่ยังขาด — ต้องทำในเซสชันถัดไป

#### 1. Google Login (§34 — P0)
**ไฟล์ที่ต้องแก้:** `src/pages/Login.tsx` หรือ `src/components/auth/`
**วิธีทำ:**
```typescript
// ใช้ supabase.auth.signInWithOAuth
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
  },
});
```
**ต้อง enable ใน Supabase Dashboard:** Authentication → Providers → Google → เพิ่ม Client ID + Secret

#### 2. Apple Login (§34 — P0)
**วิธีทำ:** เหมือน Google แต่ provider: 'apple'
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'apple',
  options: { redirectTo: `${window.location.origin}/dashboard` },
});
```
**ต้อง:** Apple Developer account, Services ID, Sign in with Apple

#### 3. Push Infrastructure (§26-27 — P0)
**สถานะ:** sw.js มี push handler แล้ว แต่ยังไม่มี VAPID keys + backend endpoint

**ขั้นตอน:**
```bash
# Generate VAPID keys
npx web-push generate-vapid-keys
```

**ต้องสร้าง:**
- `server/push-endpoint.ts` — Edge Function ที่รับ subscribe + send notification
- `src/hooks/usePushSubscription.ts` — subscribe user ใน browser
- `supabase/migrations/20260810_push_subscriptions.sql` — table: push_subscriptions(user_id, endpoint, keys_p256dh, keys_auth)

**Flow:**
```
User approves notification
  ↓
browser.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC })
  ↓
POST /api/push/subscribe { endpoint, keys }
  ↓
Supabase: upsert push_subscriptions WHERE user_id
  ↓
Trigger: ON INSERT personal_memory / behavioral_patterns → call push send
```

#### 4. Twin Evolution Experience (§30 — P0)
**สิ่งที่ต้องทำ:** Animation scene เมื่อ Twin state เลื่อนขึ้น (เช่น awakening → aware)

**ไฟล์ที่ต้องสร้าง:** `src/components/twin/TwinEvolution.tsx`
- Detect state change: เปรียบ `prevState` vs `newState` จาก TwinStateEngine
- Show celebratory overlay: particles burst + ring expand + state label
- Store `prev_twin_state` ใน Supabase user metadata เพื่อ detect real upgrade
- Badge unlock ถ้า unlock condition ตรง (§30)

---

## P1 ที่ยังไม่แตะ (ทำหลัง P0 ครบ)

- Voice Twin (§21-22) — Web Speech API STT + TTS
- Daily Brief (§25) — 20-40 วินาที summary จาก PersonalContext
- Smart Push Timing (§27) — learning loop บน notification engagement
- Badge System (§29-30) — progression + unlock system
- Growth Visualization depth (30/60/90/180/365 day view)
- Passkey (§34) — WebAuthn API (ยาก, อาจเป็น P1 จริงกว่า)

---

## กฎที่ห้ามลืม (สำหรับเซสชันถัดไป)

```
ห้ามม้อคอัพและฮาร์โค้ดทุกเฟส — 100% real implementation เท่านั้น
```

1. `verbatimModuleSyntax: true` → ใช้ `import type { }` สำหรับ type-only imports
2. userId ต้องมาจาก `useAuth()` เท่านั้น — ห้ามใช้ localStorage
3. ใช้ `getContext(userId)` จาก PersonalContextBuilder (ไม่ใช่ buildContext)
4. ทุก React Query ใช้ shared cache keys: `['personalContext', userId]`, `['behavioralPatterns', userId]`
5. CSS ใช้ `var(--...)` เท่านั้น — ห้าม hardcode สี/ขนาด
6. run `npx tsc -b --noEmit` ก่อน declare เสร็จ — ต้อง EXIT:0

---

## Architecture ณ วันนี้

```
App.tsx
  ThemeProvider
    AuthProvider
      EmotionProvider (6 moods → data-mood)
        HubProvider (12 hubs → data-hub)
          TwinProvider
            ExperienceProvider ← NEW §16-20
              QueryClientProvider (main.tsx)
                Router + Routes
```

**CSS layer (66-72 themes):**
```
[data-hub="career"][data-mood="confident"]
  → hub-themes.css: --color-accent-primary, --hub-bg-gradient
  + mood-themes.css: --saturation, --brightness, --duration-mood
  + ExperienceContext: --exp-motion-multiplier, --exp-particle-density, --exp-twin-glow
```

**Experience Engine data flow:**
```
PersonalContext (Supabase)
  + currentHub (HubContext)
  + currentMood (EmotionContext)
  + hubHistory.length (first-session detection)
  + twinState (TwinStateEngine)
  + time-of-day
    ↓
ExperienceEngine.compute()
    ↓
ExperienceConfig {
  suggestedHub, shouldAutoApplyHub,
  activeMood, themeResolution,
  dashboardPriority, isAdaptive
}
    ↓
ExperienceContext → applies --exp-* CSS vars to <html>
                  → switchHub() if first session
                  → updateMood() if never checked in
```

---

## Supabase migrations ที่ต้องรันถ้ายังไม่ได้รัน

```sql
-- 1. ต้องรันก่อน (สร้างตาราง)
supabase/migrations/20260809_intelligence_core_schema.sql

-- 2. รันหลัง (เพิ่ม consent columns)
supabase/migrations/20260810_privacy_consent_columns.sql
```
