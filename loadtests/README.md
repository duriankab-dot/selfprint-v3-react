# k6 Performance Tests — SELFPRINT V3

**สถานะ (14 ก.ย. 2026 — K6V2-FIX-001):** ✅ สคริปต์ k6 ทั้งสองไฟล์แก้แล้ว (pure k6 API) และ **พิสูจน์แล้วด้วยการรันจริง** — `k6 inspect` ผ่านทั้ง 2 ไฟล์, `k6 run` บน local `wrangler pages dev` ผ่าน checks ทุกตัวที่ไม่ต้องใช้ LLM key, Node.js smoke ผ่าน 10/10 บน non-AI endpoints

⚠️ **Blocker ฝั่ง staging เท่านั้น:** legacy JWT `SUPABASE_SERVICE_ROLE_KEY` ใน Cloudflare Pages env **ถูก Supabase revoke** (พิสูจน์: `GET /auth/v1/user` ด้วย key เดิม → 401 "Invalid API key", ด้วย `sb_secret_` key → 200) ทำให้ `verifyUser()` ล้มเหลว → ทุก endpoint ที่ต้อง auth คืน 401 จาก staging — ต้องอัปเดต env นี้ใน Cloudflare Pages dashboard แล้ว Redeploy ก่อนรันสด

## Overview

ชุดทดสอบประสิทธิภาพสำหรับ SELFPRINT V3 API endpoints — primary runner คือ **k6** (v2.2.0 ผ่านการ probe แล้ว: รองรับ `import http from 'k6/http'` แต่ไม่มี global `fetch`)

### ไฟล์

| File | Description |
|------|-------------|
| `config.js` | Shared configuration + endpoint map + shared payloads (k6 + Node.js compatible) |
| `config.cjs` | CommonJS shim (โหลด `.env.e2e` ผ่าน dotenv ให้ smoke-test.cjs) |
| `loadtest-smoke.js` | **k6 smoke test** — 5 VUs, 5 min, pure `k6/http` API |
| `loadtest.js` | **k6 full load test** — peak 100 VUs, 45 min, 5 phases |
| `smoke-test.cjs` | Node.js smoke test (fallback เมื่อไม่มี k6) |
| `smoke-test.mjs` | Node.js smoke test เวอร์ชัน ESM |

## Required Environment Variables

```bash
# จาก .env.e2e หรือ GitHub Actions secrets:
BASE_URL=https://selfprint-staging.pages.dev
SUPABASE_URL=https://vkjwqrjflxztcctmyzgh.supabase.co
SUPABASE_ANON_KEY=sb_publishable_2kfBoRnpTE3JHAF8TiSPwg_GMmwlNgp
TEST_EMAIL=test-phase-b@selfprint.one
TEST_PASSWORD=TestPass123!
```

**หมายเหตุ:** รองรับทั้งแบบมีและไม่มี prefix `E2E_` (เช่น `E2E_SUPABASE_URL`) — config อ่านทั้งสองแบบ

## Quick Start (PowerShell)

```powershell
# โหลด env จาก .env.e2e เข้า session (k6 ไม่อ่าน .env เอง)
Get-Content .env.e2e | Where-Object { $_ -match '^\s*([^#][^=]+)=(.*)$' } | ForEach-Object {
  [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
}

# Smoke test — เต็มรูปแบบ (5 VUs, 5 นาที)
k6 run loadtests/loadtest-smoke.js

# Smoke test — โหมดเร็ว (2 VUs, 30 วินาที)
$env:SMOKE_VUS = '2'; $env:SMOKE_DURATION = '30s'
k6 run loadtests/loadtest-smoke.js

# Full load test (45 นาที, peak 100 VUs — รันเมื่อพร้อมรับ load)
k6 run loadtests/loadtest.js

# Export ผลลัพธ์เป็น JSON
k6 run --out json=smoke-results.json loadtests/loadtest-smoke.js

# Node.js smoke test (fallback เมื่อไม่มี k6 — อ่าน .env.e2e อัตโนมัติ)
node loadtests/smoke-test.cjs 10
```

## Endpoints Tested

### Smoke (k6 / Node.js) — 7 tests ต่อ iteration
- ✅ GET /api/share?code=invalid → คาดหวัง 400/404 (public endpoint)
- ✅ POST /api/profile (upsert) → 200 + success=true
- ✅ GET /api/profile (retrieve) → 200
- ✅ POST /api/twin (AI chat) → 200 (มี content) หรือ 429
- ✅ POST /api/nova (AI chat) → 200 (มี content) หรือ 429
- ✅ POST /api/autonomy-log → 200
- ✅ Unauthenticated GET /api/profile → 401

### Full load (k6) — เพิ่มจาก smoke
- ✅ POST /api/twin-stream, /api/nova-stream (SSE)
- ✅ POST /api/blueprint
- ✅ GET /api/notifications/list (ไม่ส่ง userId — handler ใช้จาก JWT)
- ✅ POST /api/notifications/schedule, /api/notifications/mark-read
- ✅ GET /api/twin-evolution (ใช้ twinId จริงจาก setup; ถ้าไม่มี twin → fallback notifications)
- ✅ POST /api/metrics (web vitals)

**ตัดออก:** `/api/sice/get-patterns` — ตาราง `public.pattern_analysis` ไม่มีใน staging DB (probe: PGRST205) → endpoint คืน 500 เสมอ

## Thresholds

ผูกกับ `name` tag ต่อ endpoint (ดูในไฟล์สคริปต์):
- Auth login: p95 < 2s
- Profile/Autonomy/Notifications/Share: p95 < 1s
- POST /api/twin: p95 < 8s, p99 < 15s
- POST /api/nova: p95 < 7s, p99 < 12s
- Streams: p95 < 15s
- Error: `smoke_error_rate < 5%` (smoke), `load_error_rate < 1%` (full)

**ทำไมไม่ใช้ `http_req_failed`** — k6 นับทุก response ≥ 400 เป็น failed รวมถึง share-invalid (คาดหวัง 400/404) และ unauth (คาดหวัง 401) ซึ่งเป็น assertion ที่ "ต้องผ่าน" — จึงใช้ custom metric ที่นับเฉพาะความผิดปกติที่ไม่คาดหวังแทน

## สิ่งที่แก้ใน K6V2-FIX-001 (14 ก.ย. 2026)

1. **สคริปต์ k6 ใช้ global `fetch()` ซึ่ง k6 ไม่มี** (probe ยืนยัน `typeof fetch === 'undefined'`) → เขียนใหม่ด้วย `http` จาก `k6/http`
2. `loadtest.js` ไม่เคย import `k6/http` + import functions ที่ไม่มีอยู่จาก config.js → module load fail
3. `setup()` เรียก async auth โดยไม่ await → token เป็น Promise → 401 ทุก request
4. `http.post(url, body, headers, {timeout})` signature ผิด → k6 คือ `http.post(url, [body], [params])`
5. `?userId=test` ใน notifications/sice โดน 403 guard (userId ต้องมาจาก JWT) → ไม่ส่ง userId
6. `smoke-test.cjs`/`.mjs`: `metrics.totalRequests` ไม่เคยถูกนับ → report โชว์ `Total requests: 0`, `Error rate: Infinity%`

## CI Integration

k6 ถูก trigger ผ่าน **workflow_dispatch only** (manual):

1. Actions tab → "E2E & Load Testing (PHASE 3)" → Run workflow
2. เลือก test type: `load` (smoke) หรือ `full`

**สำคัญ:** k6 ไม่ใช่ dependency ของ Master Gate — รันแยก ไม่ block reporting

## Troubleshooting

### ทุก endpoint ที่ต้อง auth คืน 401 ({"success":false,"error":"Unauthorized"})

**สาเหตุที่พบจริง (14 ก.ย. 2026):** `SUPABASE_SERVICE_ROLE_KEY` ฝั่ง deployment ถูก revoke — `verifyUser()` ใช้ key นี้เรียก `auth.getUser(token)` เมื่อ key ไม่ valid → คืน null → 401

**วิธีตรวจ:**
```powershell
node -e "require('dotenv').config({path:'.env.e2e'});fetch(process.env.SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json',apikey:process.env.SUPABASE_ANON_KEY,Authorization:'Bearer '+process.env.SUPABASE_ANON_KEY},body:JSON.stringify({email:process.env.TEST_EMAIL,password:process.env.TEST_PASSWORD})}).then(r=>r.json()).then(async b=>{const u=await fetch(process.env.SUPABASE_URL+'/auth/v1/user',{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+b.access_token}});console.log('getUser with service key:',u.status)})"
```
- `200` = key ใช้ได้ → ปัญหาอยู่ที่อื่น
- `401 Invalid API key` = key ถูก revoke → อัปเดต env ใน Cloudflare Pages dashboard → Redeploy

### Missing Auth Env Vars

```
Error: Missing auth env vars: SUPABASE_URL, SUPABASE_ANON_KEY, and TEST_PASSWORD are required.
```
→ ตั้ง env ก่อนรัน (ดู Quick Start)

### 401 บาง endpoint แต่ login สำเร็จ

- ตรวจว่า `TEST_EMAIL`/`TEST_PASSWORD` seed แล้ว: `npm run seed:test-users`
- ตรวจว่า SUPABASE_URL ที่ test ใช้ = โปรเจกต์เดียวกับที่ deployment ตั้งไว้

### 429 Rate Limited

- Twin: 40 req/min/IP, Nova: 60 req/min/IP → ลด VUs หรือเพิ่ม sleep

## Requirements

- k6 v2.2.0 (ตรวจ: `k6 version`) — หรือใช้ Node.js 18+ fallback
- Valid `SUPABASE_SERVICE_ROLE_KEY` บน deployment ที่ยิง test ใส่ (ผ่าน Cloudflare Pages env)
- Test user: `npm run seed:test-users`
