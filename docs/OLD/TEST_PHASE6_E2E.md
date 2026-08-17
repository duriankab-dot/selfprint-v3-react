# Phase 6: Autonomy Tracking — E2E Test Checklist

## 🚀 Pre-Test Setup

### ✅ Before You Start

- [ ] Run Supabase migration: `supabase/migrations/003_decision_log_autonomy_tracking.sql`
- [ ] Confirm `decision_log` table exists in Supabase
- [ ] Check `.env` has Supabase URL and keys
- [ ] Check `.env.local` has `VITE_API_BASE_URL=http://localhost:3001`
- [ ] Run `npm install` to install dependencies

### ✅ Environment Variables (in .env)

```
ANTHROPIC_API_KEY=sk-ant-api03-...          ✓ Set
CLAUDE_MODEL_ID=claude-haiku-4-5-20251001   ✓ Set
SUPABASE_URL=https://...supabase.co         ✓ Set
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...     ✓ Set
VITE_SUPABASE_URL=https://...supabase.co    ✓ Set
VITE_SUPABASE_ANON_KEY=sb_secret_...        ✓ Set
```

## 🧪 Test Steps

### Step 1: Start Backend

```bash
# Terminal 1: Backend API
cd D:\selfprint-v3-react
vercel dev --listen 3001
```

✅ Expected:
```
Ready on http://localhost:3001
```

### Step 2: Start Frontend

```bash
# Terminal 2: Frontend
cd D:\selfprint-v3-react
npm run dev
```

✅ Expected:
```
VITE v8.2.0  ready in 123 ms
➜  Local:   http://localhost:5173
```

### Step 3: Navigate to Chat Page

```
Open: http://localhost:5173/chat
```

✅ Expected:
- [ ] Page loads without errors
- [ ] Left sidebar shows:
  - ⚙️ ตั้งค่า (Hub Selector)
  - Emotion Selector
  - 🎯 **Autonomy Level** (NEW) with slider 0-100
  - 📊 สถานะ showing Autonomy: 50%
- [ ] Chat area on right shows "ยินดีต้อนรับเข้า Nova Chat"

### Step 4: Test Autonomy Slider

```
Interaction:
1. Move slider left (decrease to 30%)
   → Status updates to "Autonomy: 30%" ✓
   → Description changes to "🤔 Very dependent..." ✓

2. Move slider middle (50%)
   → Status updates to "Autonomy: 50%" ✓
   → Description: "⚖️ Balanced..." ✓

3. Move slider right (increase to 80%)
   → Status updates to "Autonomy: 80%" ✓
   → Description: "💪 Mostly autonomous..." ✓
```

### Step 5: Select Hub & Mood

```
1. Click Hub Selector → choose one (e.g., "identity")
2. Click Emotion Selector → choose one (e.g., "confident")
3. Verify Status box updates:
   - Hub: identity ✓
   - Mood: confident ✓
```

### Step 6: Send Message at Autonomy 50%

```
1. Keep slider at 50%
2. Type message: "สวัสดี ฉันต้องการคำแนะนำ"
3. Click "📤 ส่ง"
```

✅ Expected:
- [ ] Message appears in chat (user side)
- [ ] Loading indicator: "⏳ Nova กำลังคิด..."
- [ ] Nova responds within 2-3 seconds
- [ ] Assistant message appears in chat

### Step 7: Check Browser Console Logs

```
Press F12 → Console tab
Look for logs:

✅ Should see:
🔌 API URL: http://localhost:3001
✅ Autonomy logged: { autonomyLevel: 50, confidence: 0.85, hesitation: 0.15, responseTime: 1234 }
```

### Step 8: Check Backend Console Logs

```
Look at Terminal 1 (backend) for:

✅ Should see:
[Nova] Hub: identity, Mood: confident, Messages: 1
✅ Autonomy logged: {
  userId: 'anonymous',
  hub: 'identity',
  mood: 'confident',
  autonomyLevel: 50,
  confidence: 0.85,
  hesitation: 0.15,
  responseTime: 1234
}
```

### Step 9: Send Multiple Messages at Different Autonomy Levels

```
Test 1 (Low Autonomy = 20%):
1. Drag slider to 20%
2. Send message: "ช่วยให้คำแนะนำทั้งหมด"
3. Check console for autonomy tracking ✓

Test 2 (High Autonomy = 90%):
1. Drag slider to 90%
2. Send message: "ฉันตัดสินใจแล้ว"
3. Check console for autonomy tracking ✓

Test 3 (Medium Autonomy = 55%):
1. Drag slider to 55%
2. Send message: "ให้คำแนะนำมา"
3. Check console for autonomy tracking ✓
```

### Step 10: Check Supabase Data

```
Go to Supabase Dashboard:
1. Click SQL Editor → New Query
2. Run:
   SELECT * FROM decision_log 
   ORDER BY created_at DESC 
   LIMIT 5;

✅ Should see 3+ rows with:
- autonomy_level: 20, 90, 55 (your test values)
- confidence: varies by response time
- hesitation: 1 - confidence
- response_time_ms: actual response time
- created_at: recent timestamps
```

## ❌ Troubleshooting

### Issue: "❌ Cannot POST /api/autonomy-log"

**Cause:** Backend not running or wrong port

**Fix:**
```bash
# Check Terminal 1 (backend) is running
vercel dev --listen 3001
# Verify http://localhost:3001 responds
```

### Issue: "CORS error" in Console

**Cause:** CORS headers missing or wrong origin

**Fix:**
- Verify `/api/autonomy-log.ts` has CORS headers set
- Check `Access-Control-Allow-Origin: *` is present

### Issue: "Supabase error" in console

**Cause:** Migration not applied or table missing

**Fix:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM information_schema.tables 
WHERE table_name = 'decision_log';
-- Should return 1 row
```

### Issue: "autonomyLevel is not defined"

**Cause:** ChatPage didn't pass autonomyLevel to useChat

**Fix:**
- Check ChatPage.tsx has: `const [autonomyLevel, setAutonomyLevel] = useState(50);`
- Check useChat call has: `useChat(autonomyLevel)`

### Issue: "No data appearing in Supabase"

**Cause:** userId is 'anonymous' or RLS policy blocking

**Fix:**
1. Check browser console: `localStorage.getItem('userId')`
2. If 'anonymous', set a test user ID:
   ```javascript
   localStorage.setItem('userId', 'test-user-123');
   ```
3. Reload and resend message

## ✅ Success Criteria

All should be ✓:

- [ ] Autonomy slider renders on ChatPage
- [ ] Slider changes autonomy_level 0-100
- [ ] Status box updates when slider moves
- [ ] Descriptions change based on autonomy level
- [ ] Messages send without errors
- [ ] Console shows autonomy tracking logs
- [ ] `/api/autonomy-log` endpoint responds 200
- [ ] Supabase `decision_log` table receives data
- [ ] No CORS errors
- [ ] No 500 errors

## 📊 Expected Metrics (After Test)

```
Console Output Example:

✅ Autonomy logged: {
  autonomyLevel: 50,
  confidence: 0.85,        // Based on response time
  hesitation: 0.15,        // 1 - confidence
  responseTime: 1234,      // milliseconds
}

Supabase Row Example:

id: 550e8400-e29b-41d4-a716-446655440000
user_id: anonymous
hub: identity
mood: confident
autonomy_level: 50
confidence: 0.85
hesitation: 0.15
response_time_ms: 1234
message_length: 23
response_length: 156
created_at: 2025-08-06T10:30:45.123Z
```

## 🚀 Next Steps (Phase 7)

If all tests pass:
1. ✅ Phase 6 autonomy tracking is complete
2. 🔜 Phase 7: Build Dashboard
   - Create /pages/Dashboard.tsx
   - Query decision_log for insights
   - Display autonomy trends chart
   - Show stats and analytics

---

**Questions?**
- Check console.log output in browser (F12)
- Review `/api/autonomy-log.ts` for endpoint logic
- Review `useChat.ts` for tracking logic
- Review migration: `supabase/migrations/003_decision_log_autonomy_tracking.sql`
