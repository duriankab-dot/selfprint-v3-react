# แผนแก้ไข k6 Twin/Twin-stream Failures

## สถานะปัจจุบัน (จาก screenshot 3 screenshots)

### Screenshot 1 (9:38 PM - Run 1)
- checks_total: 283, succeeded: 99.64% (282/283), failed: 0.35% (1/283)
- `twin POST 200 or 429`: 96% — 31/1 (31 ผ่าน, 1 ล้มเหลว)
- `load_error_rate`: 0.57% (1 out of 175)
- `rate_limited_rate`: 0.00% (0 out of 163)

### Screenshot 2 (9:41 PM - Run 2)
- checks_total: 271, succeeded: 92.98% (252/271), failed: 7.01% (19/271)
- `twin POST 200 or 429`: 54% — 17/14 (17 ผ่าน, **14 ล้มเหลว!**)
- `twin-stream POST returns 200 or 429`: 81% — 22/5 (22 ผ่าน, **5 ล้มเหลว!**)
- `load_error_rate`: 11.51% (19 out of 165) — **เกิน threshold 1%**

### Screenshot 3 (9:41 PM - HTTP Metrics)
- `http_req_failed`: 14.97% (25 out of 167)
- `http_req_duration`: avg=5.62s, p(95)=16.18s, max=30s
- `iteration_duration`: avg=7.68s, p(95)=19.87s
- `vus`: 4 min=0, max=20 (quick profile: 20 VU x 60s)
- **ERROR[0071] thresholds on metrics 'load_error_rate' have been crossed**

---

## วิเคราะห์รากเหง้า (Root Cause Analysis)

### ปัญหาหลัก: Rate Limiter ใช้ IP address เป็น key

ไฟล์ `functions/api/twin.ts:58-72` และ `functions/api/twin-stream.ts:58-72`:

```typescript
const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('cf-connecting-ip') || 'unknown';
if (!checkRateLimit(ip, env.TWIN_RATE_LIMIT)) {
  return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429);
}
```

**ปัญหา:**
1. k6 รันจาก GitHub Actions runner IP เดียว (single IP)
2. 20 VUs ทั้งหมดใช้ IP เดียวกัน → ทั้งหมดแชร์ rate limit bucket เดียว
3. Twin rate limit = 40 req/min, Twin-stream weight = 35% ของ total requests
4. 20 VUs x 60s = 1200 requests, twin+twin-stream = 35% = 420 requests
5. 420 requests / 40 req/min = 10.5 นาที → ชน limit ภายใน 1 นาทีแรก
6. Request ที่เหลือทั้งหมดโดน 429 → check `200 or 429` ผ่าน → **แต่ 429 นับเป็น rate_limited_rate ไม่ใช่ load_error_rate**

**แต่ทำไม load_error_rate ถึง 11.51%?**

ดูจาก k6 script `loadtest.js:337-343`:
```javascript
const ok = check(res, {
  'twin POST 200 or 429': (r) => r.status === 200 || r.status === 429,
  'twin has content on success': (r) => (r.status === 200 ? !!r.json('content') : true),
});
loadErrorRate.add(!ok);
```

ถ้า `check()` คืน `false` (เพราะ `twin has content on success` ล้มเหลวเมื่อ status !== 200) → `loadErrorRate.add(true)` → **นับเป็น error**

**สรุป:** 429 responses → check `twin has content on success` ล้มเหลว (เพราะไม่มี content ใน 429 response) → `!ok = true` → **นับเป็น load_error_rate**

นี่คือ bug ใน logic: 429 ควรนับเป็น `rate_limited_rate` เท่านั้น ไม่ควรนับเป็น `load_error_rate`

---

## ประวัติการแก้ไขก่อนหน้า (จาก session memory)

### Correction: staging_service_key_revoked_blocker (14 ก.ย. 2026)
- **ปัญหา:** SUPABASE_SERVICE_ROLE_KEY ถูก revoke → ทุก endpoint ที่ต้อง auth คืน 401
- **แก้ไข:** หมุน key ผ่าน wrangler: `wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name selfprint-staging`
- **ผลลัพธ์:** ✅ แก้เสร็จแล้ว

### Correction: OPENROUTER_API_KEY on staging
- **ปัญหา:** OPENROUTER_API_KEY ไม่มีใน staging → twin/nova คืน 500
- **แก้ไข:** เพิ่ม OPENROUTER_API_KEY เป็น secret บน selfprint-staging
- **ผลลัพธ์:** ✅ แก้เสร็จแล้ว (500 errors ลดลงจาก 100% → <1%)

### สถานะปัจจุบัน:
- ✅ SUPABASE_SERVICE_ROLE_KEY: มีแล้ว
- ✅ OPENROUTER_API_KEY: มีแล้ว
- ❌ Rate limiter ใช้ IP → ชน limit เร็วเกินไป
- ❌ k6 script นับ 429 เป็น load_error_rate (ควรนับเป็น rate_limited_rate เท่านั้น)

---

## แผนแก้ไข (Fix Plan)

### Fix 1: เปลี่ยน Rate Limiter จาก IP-based เป็น User-based

**ไฟล์:** `functions/api/twin.ts`, `functions/api/twin-stream.ts`

**เปลี่ยนจาก:**
```typescript
const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('cf-connecting-ip') || 'unknown';
if (!checkRateLimit(ip, env.TWIN_RATE_LIMIT)) {
  return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429);
}
```

**เป็น:**
```typescript
// ใช้ user ID จาก JWT แทน IP (สำหรับ production: per-user rate limiting)
// สำหรับ staging/test: ใช้ user ID เพื่อป้องกัน shared IP problem
const userId = user.id; // จาก verifyUser() ที่รันก่อนหน้า
if (!checkRateLimit(userId, env.TWIN_RATE_LIMIT)) {
  return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429);
}
```

**ไฟล์ที่ต้องแก้:**
1. `functions/api/twin.ts` — line 58-65
2. `functions/api/twin-stream.ts` — line 58-65

**หมายเหตุ:** ต้องย้าย rate limit check ไปหลัง `verifyUser()` เพื่อ lấy user.id

---

### Fix 2: แก้ k6 Script นับ 429 ไม่ควรเป็น load_error_rate

**ไฟล์:** `loadtests/loadtest.js`

**เปลี่ยนจาก:**
```javascript
const ok = check(res, {
  'twin POST 200 or 429': (r) => r.status === 200 || r.status === 429,
  'twin has content on success': (r) => (r.status === 200 ? !!r.json('content') : true),
});
loadErrorRate.add(!ok);  // ❌ 429 จะทำให้ !ok = true → นับเป็น error
rateLimitedRate.add(res.status === 429);
```

**เป็น:**
```javascript
const isRateLimited = res.status === 429;
const hasContent = res.status === 200 ? !!r.json('content') : true;
const ok = res.status === 200 || res.status === 429;

// 429 นับเป็น rate_limited_rate เท่านั้น ไม่ นับเป็น load_error_rate
loadErrorRate.add(!ok && !isRateLimited);  // ✅ 429 ไม่นับเป็น error
rateLimitedRate.add(isRateLimited);
```

**ไฟล์ที่ต้องแก้:**
1. `loadtests/loadtest.js` — lines 337-343 (twin), 357-363 (twin-stream), 379-384 (nova), 399-405 (nova-stream), 417-421 (profile-get), 430-435 (profile-post), 445-449 (notifications-list), 464-468 (notifications-schedule), 481-485 (notifications-mark-read), 494-498 (blueprint), 555-559 (twin-evolution)

---

### Fix 3: เพิ่ม Retry Logic กับ Exponential Backoff ใน k6

**ไฟล์:** `loadtests/loadtest.js`

เพิ่ม function `retryWithBackoff()` สำหรับ endpoint ที่อาจโดน rate limit:

```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
```

**หมายเหตุ:** k6 http เป็น synchronous → ต้องใช้ callback หรือ modify logic

**ทางเลือก بهتر:** เพิ่ม `sleep()` หลัง 429 response แทน retry:

```javascript
if (res.status === 429) {
  const retryAfter = parseInt(res.headers['Retry-After'] || '60');
  console.log(`Rate limited on ${endpoint}, waiting ${retryAfter}s...`);
  sleep(retryAfter);
  // loop ใหม่หรือ skip iteration นี้
}
```

---

### Fix 4: เพิ่ม Rate Limit สำหรับ Staging Environment

**ไฟล์:** `.env.e2e.staging` หรือ `loadtests/config.js`

เพิ่ม env var:
```
TWIN_RATE_LIMIT=200  # จาก 40 → 200 (สำหรับ staging test)
TWIN_STREAM_RATE_LIMIT=200
NOVA_RATE_LIMIT=200
NOVA_STREAM_RATE_LIMIT=200
```

**หรือ** modify `config.js` เพื่อ read staging-specific limits:

```javascript
export const TWIN_RATE_LIMIT = parseInt(env.TWIN_RATE_LIMIT || '40', 10);
export const TWIN_STREAM_RATE_LIMIT = parseInt(env.TWIN_STREAM_RATE_LIMIT || '40', 10);
export const NOVA_RATE_LIMIT = parseInt(env.NOVA_RATE_LIMIT || '60', 10);
export const NOVA_STREAM_RATE_LIMIT = parseInt(env.NOVA_STREAM_RATE_LIMIT || '60', 10);
```

---

### Fix 5: Verify OPENROUTER_API_KEY on Staging

**คำสั่ง:**
```powershell
wrangler pages secret list --project-name selfprint-staging
```

**ถ้าไม่มี:**
```powershell
wrangler pages secret put OPENROUTER_API_KEY --project-name selfprint-staging
```

**หมายเหตุ:** ต้องมี OAuth token ที่มี pages:write permission

---

## ลำดับการแก้ไข (Execution Order)

1. **Fix 1:** เปลี่ยน Rate Limiter จาก IP-based เป็น User-based (twin.ts, twin-stream.ts)
2. **Fix 2:** แก้ k6 Script นับ 429 ไม่ควรเป็น load_error_rate (loadtest.js)
3. **Fix 3:** เพิ่ม Retry Logic / Sleep หลัง 429 (loadtest.js)
4. **Fix 4:** เพิ่ม Rate Limit สำหรับ Staging (.env.e2e.staging, config.js)
5. **Fix 5:** Verify OPENROUTER_API_KEY on Staging (wrangler command)

---

## การทดสอบ (Verification)

### Local Test:
```powershell
# Set env vars
$env:BASE_URL="https://selfprint-staging.pages.dev"
$env:SUPABASE_URL="https://xxx.supabase.co"
$env:SUPABASE_ANON_KEY="sb_publishable_..."
$env:TEST_EMAIL="test-phase-b@selfprint.one"
$env:TEST_PASSWORD="..."
$env:LOAD_PROFILE="quick"

# Run quick test
k6 run loadtests/loadtest.js
```

### CI Test:
```yaml
# .github/workflows/testing.yml
# k6 jobs มี continue-on-error: true → failures ไม่ block CI
# แต่ควร fix ให้ PASS เพื่อความถูกต้อง
```

### Expected Results After Fix:
- `twin POST 200 or 429`: 100% (ไม่มี 500 errors)
- `twin-stream POST returns 200 or 429`: 100%
- `load_error_rate`: < 1% (429 นับเป็น rate_limited_rate เท่านั้น)
- `rate_limited_rate`: < 10% (rate limiter ทำงานถูกต้อง)

---

## สรุป

**ปัญหาหลัก:** Rate limiter ใช้ IP address → ทุก VU จาก GitHub Actions共用同一个 bucket → ชน limit เร็ว

**วิธีแก้:**
1. เปลี่ยนเป็น User-based rate limiting (ใช้ user.id จาก JWT)
2. แก้ k6 script นับ 429 ไม่ควรเป็น load_error_rate
3. เพิ่ม retry/sleep หลัง 429
4. เพิ่ม rate limit สำหรับ staging
5. Verify OPENROUTER_API_KEY

**เวลาที่ใช้:** ~30-60 นาที (แก้ไข 5 files + deploy + test)
