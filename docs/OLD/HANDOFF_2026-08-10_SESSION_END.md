# HANDOFF — 2026-08-10 (End of Session)

> อ่านไฟล์นี้ก่อนเริ่มแชทหน้าทุกครั้ง

---

## 1. สถานะโปรเจกต์

- **Stack:** React 18 + Vite 8 + TypeScript 6.0 + Supabase + Vercel
- **Branch:** `master`
- **Last commit:** `837517d` (feat: P3 complete)
- **tsc:** ✅ EXIT 0
- **build:** ✅ 15.94s
- **Deploy:** รอ `git push` + Vercel auto-deploy (หรือ `vercel --prod`)

---

## 2. งานที่เสร็จในเซสชันนี้ ✅

### Vercel Build Fix (critical)
- **Root cause:** `FutureSelfEngine.ts` + `AmbientBadge.tsx` เป็น untracked files — ไม่เคย `git add` → Vercel clone ไม่มีไฟล์ → TS2307
- **Fix:** `git add` → commit `9a5d606` → build ผ่าน "Ready in 41s"

### P2 Intelligence Engines (ทำในเซสชันก่อน)
| Engine | ไฟล์ | สถานะ |
|--------|------|--------|
| FutureSelfEngine | `src/lib/intelligence/FutureSelfEngine.ts` | ✅ |
| DecisionIntelligenceEngine | `src/lib/intelligence/DecisionIntelligenceEngine.ts` | ✅ |
| LifeIntelligencePackEngine | `src/lib/intelligence/LifeIntelligencePackEngine.ts` | ✅ |
| BehavioralForecastEngine | `src/lib/intelligence/BehavioralForecastEngine.ts` | ✅ |

### P3 UI Panels (commit `837517d`)
| Component | ไฟล์ | หน้าที่ |
|-----------|------|---------|
| FutureSelfPanel | `src/components/dashboard/FutureSelfPanel.tsx` | แสดง 3 scenarios 30/90/365 วัน |
| DecisionCard | `src/components/dashboard/IntelligencePanels.tsx` | decision style + bias risks |
| LifePackCarousel | `src/components/dashboard/IntelligencePanels.tsx` | 12 hub packs + emoji tabs |
| ForecastWidget | `src/components/dashboard/IntelligencePanels.tsx` | mood/hub forecast + risks |

- Dashboard.tsx wired ด้วย React Query `['personalContext', userId]` → shared cache กับ ExperienceContext

### §34 PasskeySettings (commit `837517d`)
- `src/pages/PasskeySettings.tsx` — list/add/delete passkeys
- `src/pages/PasskeySettings.css` — CSS var(--...) ทั้งหมด
- `src/App.tsx` — lazy route `/settings/passkeys`
- **WebAuthn flow:** `createPasskeyCredential(RegistrationOptions)` → store `rawId` เป็น public_key + counter=0

### Advanced Twin States (commit `837517d`)
| State | Score | Color | Label TH |
|-------|-------|-------|----------|
| flourishing | ≥70 | teal `rgba(52,211,153,0.85)` | เบ่งบาน |
| mastery | ≥90 | gold `rgba(251,191,36,0.9)` | เชี่ยวชาญ |

**ไฟล์ที่แก้:**
- `TwinStateEngine.ts` — type + STATE_DEFS + thresholds + getAllStates()
- `LivingTwin.tsx` — STATE_SHORT: BLOOM/MASTER
- `TwinEvolution.tsx` — STATE_ORDER/BADGE/LABELS
- `ExperienceEngine.ts` — DASHBOARD_PRIORITY_BY_STATE

---

## 3. กฎที่ต้องจำ (อย่าลืม)

```
CSS:    ใช้ var(--...) เท่านั้น — ห้าม hardcode สี/ขนาด
userId: useAuth().session?.user?.id เท่านั้น
import: verbatimModuleSyntax → ใช้ "import type {}" สำหรับ type-only
supabase: import { supabase } from '../services/supabase-service' (NOT from useAuth)
supabase อาจเป็น null ถ้า env vars ไม่ครบ — ต้องมี guard if (!supabase) return
ห้ามแตะ: .env / migrations / config production
ก่อนส่ง: npx tsc -b && npm run build ต้องผ่านก่อนเสมอ
git: ต้อง git add ทุกไฟล์ใหม่ก่อน commit — untracked = ไม่ไป Vercel
```

---

## 4. โครงสร้างไฟล์สำคัญ

```
src/
  lib/
    intelligence/
      types.ts                    ← PersonalContext type (แหล่งความจริงเดียว)
      PersonalContextBuilder.ts   ← getContext(userId): PersonalContext
      TwinStateEngine.ts          ← 8 states: awakening→mastery
      FutureSelfEngine.ts         ← project(ctx): FutureSelfProjection
      DecisionIntelligenceEngine.ts
      LifeIntelligencePackEngine.ts
      BehavioralForecastEngine.ts
    auth/
      webauthn.ts                 ← isPasskeyAvailable, createPasskeyCredential, RegistrationOptions
    experience/
      ExperienceEngine.ts         ← DASHBOARD_PRIORITY_BY_STATE (ต้องอัพเดทเมื่อเพิ่ม TwinState)
      EnvironmentEngine.ts        ← §46 time-of-day + soundscape
  context/
    AuthContext.tsx               ← useAuth() → { session } เท่านั้น (ไม่มี supabase)
    EnvironmentContext.tsx        ← useEnvironment() → tick 60s
    ExperienceContext.tsx         ← useQuery ['personalContext', userId]
  pages/
    Dashboard.tsx                 ← useQuery ['personalContext', userId] ← shared cache
    PasskeySettings.tsx           ← /settings/passkeys
    Login.tsx                     ← /login (Passkey + Google + Apple + Magic Link)
  components/
    dashboard/
      LivingTwin.tsx              ← STATE_SHORT Record<TwinState,string>
      FutureSelfPanel.tsx
      IntelligencePanels.tsx      ← DecisionCard, LifePackCarousel, ForecastWidget
    twin/
      TwinEvolution.tsx           ← STATE_ORDER/BADGE/LABELS
    experience/
      AmbientBadge.tsx            ← §46 ambient indicator
services/
  supabase-service.ts             ← export const supabase = ... | null
```

---

## 5. งานที่ยังเหลือ (แนะนำทำลำดับนี้)

### 🔴 Must-do ก่อน Launch
| งาน | ประมาณเวลา | หมายเหตุ |
|-----|-----------|---------|
| **E2E Testing** | 4-6h | Playwright หรือ Cypress — test critical flows: login→onboarding→dashboard→passkeys |
| **Error Monitoring (Sentry)** | 1-2h | `npm install @sentry/react` + DSN ใน `.env` |
| **PasskeySettings navigation** | 30m | เพิ่มลิงก์ไป `/settings/passkeys` จาก NavBar หรือ profile menu |
| **WebAuthn HTTPS check** | 30m | PasskeySettings ต้องแจ้ง error ถ้า `location.protocol !== 'https:'` |

### 🟡 Nice-to-have (post-MVP)
| งาน | ประมาณเวลา | หมายเหตุ |
|-----|-----------|---------|
| Account Recovery flow | 3-4h | Passkey สูญหาย → Magic Link re-registration |
| Rate Limiting auth | 2-3h | ป้องกัน brute force บน Supabase edge functions |
| Admin Dashboard | 8-12h | Monitor users + health metrics |
| Social Sharing | 4-6h | Share Twin snapshot |
| Push Notifications UI | 3-4h | Settings page สำหรับ customize notification types |

### 🟢 Technical Debt (ทำได้เมื่อมีเวลา)
- `PersonalContextBuilder.ts` — ตรวจสอบว่า query ครบทุก table หรือยัง
- `AskCoach.tsx` — ยังเป็น stub หรือเปล่า?
- CSS var consistency — audit `--color-*` vs `--text-*` naming ให้สม่ำเสมอ

---

## 6. คำสั่งตรวจงาน

```bash
# TypeScript check
npx tsc -b

# Build
npm run build

# Dev server
npm run dev

# รัน test (ถ้ามี)
npm test
```

---

## 7. Vercel Deploy

- **Auto-deploy:** push ไป `master` → Vercel build อัตโนมัติ
- **Manual:** `vercel --prod` จาก terminal
- **Team ID:** `team_edOuxEsMiF6EGWYJ0jl2389l`
- **⚠️ สำคัญ:** `git add` ทุกไฟล์ใหม่ก่อน push เสมอ — untracked files = Vercel build fail

---

*Last updated: 2026-08-10 | Commit: 837517d*
