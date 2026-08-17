# HANDOFF — §34 Backend Complete
**วันที่:** 2026-08-11
**Session:** Backend Edge Functions — ทั้ง 8 ใหม่ + 2 migrations
**สถานะ:** ✅ โค้ดเสร็จ, tsc EXIT 0 — รอ git add + commit + push

---

## งานที่ทำเสร็จในเซสชันนี้

### ✅ Migrations ใหม่ (2 ไฟล์)
| ไฟล์ | ตาราง | หมายเหตุ |
|------|-------|---------|
| `supabase/migrations/20260811_auth_rate_limits.sql` | `auth_rate_limits` | Rate limiting สำหรับ auth attempts |
| `supabase/migrations/20260811_daily_briefs.sql` | `daily_briefs` | Cache daily briefs (1 ต่อ user ต่อวัน) |

### ✅ Supabase Edge Functions ใหม่ (8 ฟังก์ชัน)
| # | ชื่อ | Method | Auth | หน้าที่ |
|---|------|--------|------|--------|
| 1 | `send-push` | POST | service role | Web Push + VAPID + AES-128-GCM encryption |
| 2 | `pattern-detect` | POST | service role | Claude วิเคราะห์ behavioral patterns → behavioral_patterns |
| 3 | `daily-brief` | POST | service role | Claude สร้าง Daily Brief → cache ใน daily_briefs |
| 4 | `memory-manager` | POST | JWT required | CRUD personal_memory (list/add/update/delete/clear) |
| 5 | `data-export` | POST | JWT required | PDPA: Export ข้อมูลทั้งหมดเป็น JSON |
| 6 | `account-delete` | POST | JWT + confirmToken | PDPA: ลบ account + ข้อมูลทั้งหมด |
| 7 | `auth-rate-limit` | POST | service role | Rate limiting (check/increment/reset) |
| 8 | `account-recovery` | POST | ไม่ต้อง | ส่ง magic link สำหรับ passkey re-registration |

### ✅ Functions เก่า (4 — ยังคงอยู่ครบถ้วน)
- `auth-registration-options` — WebAuthn registration options
- `auth-register-passkey` — Register passkey
- `auth-authentication-options` — WebAuthn auth options
- `auth-verify-passkey` — Verify passkey

**รวม: 12 Supabase Edge Functions**

---

## สิ่งที่ต้องทำด้วยมือ (User ต้องทำ)

### 1. Git commit + push (ต้องทำบนเครื่อง Windows)

```bash
cd D:\selfprint-v3-react

# Add ทุกไฟล์ใหม่
git add supabase/functions/send-push/
git add supabase/functions/pattern-detect/
git add supabase/functions/daily-brief/
git add supabase/functions/memory-manager/
git add supabase/functions/data-export/
git add supabase/functions/account-delete/
git add supabase/functions/auth-rate-limit/
git add supabase/functions/account-recovery/
git add supabase/migrations/20260811_auth_rate_limits.sql
git add supabase/migrations/20260811_daily_briefs.sql

# Commit
git commit -m "feat: §34 complete — 8 new Supabase Edge Functions + 2 migrations

- send-push: Web Push VAPID + AES-128-GCM RFC8291
- pattern-detect: Claude behavioral pattern analysis
- daily-brief: Claude daily brief with cache
- memory-manager: CRUD for personal_memory
- data-export: PDPA data export as JSON
- account-delete: PDPA cascading delete + auth user
- auth-rate-limit: rate limiting with thresholds
- account-recovery: magic link for passkey recovery
- migrations: auth_rate_limits + daily_briefs tables"

# Push → Vercel auto-deploy
git push origin master
```

### 2. Apply Migrations ใน Supabase

ไปที่ Supabase Dashboard → SQL Editor → run ตามลำดับ:
1. `supabase/migrations/20260811_auth_rate_limits.sql`
2. `supabase/migrations/20260811_daily_briefs.sql`

### 3. Deploy Edge Functions ใน Supabase

```bash
# Install Supabase CLI ถ้ายังไม่มี
npm install -g supabase

# Login
supabase login

# Deploy ทั้ง 8 ฟังก์ชันใหม่
supabase functions deploy send-push --project-ref <YOUR_PROJECT_REF>
supabase functions deploy pattern-detect --project-ref <YOUR_PROJECT_REF>
supabase functions deploy daily-brief --project-ref <YOUR_PROJECT_REF>
supabase functions deploy memory-manager --project-ref <YOUR_PROJECT_REF>
supabase functions deploy data-export --project-ref <YOUR_PROJECT_REF>
supabase functions deploy account-delete --project-ref <YOUR_PROJECT_REF>
supabase functions deploy auth-rate-limit --project-ref <YOUR_PROJECT_REF>
supabase functions deploy account-recovery --project-ref <YOUR_PROJECT_REF>
```

### 4. Set Environment Variables ใน Supabase Functions

ใน Supabase Dashboard → Settings → Edge Functions → Secrets:

```
ANTHROPIC_API_KEY=sk-ant-...
VAPID_PUBLIC_KEY=<base64url encoded P-256 public key>
VAPID_PRIVATE_KEY=<base64url encoded P-256 private key PKCS8>
VAPID_SUBJECT=mailto:hello@selfprint.one
SITE_URL=https://selfprint.one
```

> **สร้าง VAPID keys:** ใช้ `npx web-push generate-vapid-keys`

---

## สถานะ TypeScript

```
npx tsc -b → EXIT 0 ✅ (ไม่มี type error)
npm run build → ❌ rolldown native binding (sandbox Linux ≠ Windows)
                  ✅ จะ build ได้ปกติบนเครื่อง Windows และ Vercel
```

---

## Architecture Summary — §34 Backend

```
Frontend (React/Vite)
    ↓ JWT
Vercel API Functions (/api/*.ts)
    ├── chat.ts          → Anthropic Claude
    ├── nova.ts          → Nova AI
    ├── coach.ts         → Decision support
    ├── intelligence.ts  → Astrovera Psychology
    ├── journal-sync.ts  → Offline journal + AI
    ├── personal-model.ts → AI feedback loop
    ├── push.ts          → Push subscription CRUD
    ├── profile.ts       → User profile
    ├── blueprint.ts     → Blueprint storage
    ├── share.ts         → Share links
    ├── autonomy-log.ts  → Autonomy scoring
    └── stripe.ts        → Payments

Supabase Edge Functions (/supabase/functions/)
    ├── auth-registration-options  → WebAuthn §34
    ├── auth-register-passkey      → WebAuthn §34
    ├── auth-authentication-options → WebAuthn §34
    ├── auth-verify-passkey         → WebAuthn §34
    ├── send-push          → Web Push notifications
    ├── pattern-detect     → Behavioral AI analysis
    ├── daily-brief        → Personal daily brief
    ├── memory-manager     → Personal memory CRUD
    ├── data-export        → PDPA data export
    ├── account-delete     → PDPA cascading delete
    ├── auth-rate-limit    → Auth rate limiting
    └── account-recovery   → Passkey recovery
```

---

## งานที่ยังเหลือ (Nice-to-have)

- [ ] PasskeySettings nav link (UI — เพิ่ม link ใน AccountPage หรือ Settings)
- [ ] WebAuthn HTTPS check ใน frontend (warn user ถ้า HTTP)
- [ ] Sentry error tracking
- [ ] E2E testing (Playwright)
- [ ] Admin Dashboard

---

## กฎที่ต้องจำเสมอ

```
CSS:    var(--...) เท่านั้น — ห้าม hardcode
userId: useAuth().session?.user?.id เท่านั้น
Guard:  if (!supabase) return ก่อนใช้ supabase
Git:    git add ทุกไฟล์ใหม่ก่อน commit
Build:  npx tsc -b ต้องผ่านก่อน push
```

---

**Last commit before this session:** `837517d` (feat: P3 complete)
**Next commit:** §34 backend complete (8 edge functions)
