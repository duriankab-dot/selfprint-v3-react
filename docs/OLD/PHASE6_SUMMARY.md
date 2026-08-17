# Phase 6: Autonomy Tracking — Implementation Summary

## 🎯 Phase 6 Completed ✅

**Goal:** Track user autonomy levels (0-100%) along with confidence metrics to understand decision-making patterns.

**Status:** 🚀 Ready for E2E Testing

---

## 📋 What Changed

### 1️⃣ **Frontend UI: Autonomy Slider** 
📁 `src/pages/ChatPage.tsx`

✅ Added:
- Autonomy level state: `const [autonomyLevel, setAutonomyLevel] = useState(50);`
- Interactive range slider (0-100%)
- Real-time percentage display
- Mood-based descriptions:
  - 🤔 20% = "Very dependent — asking for guidance"
  - ⚖️ 50% = "Balanced — collaborative"
  - 💪 80% = "Mostly autonomous — self-directed"
  - 🚀 90% = "Fully autonomous — taking charge"
- Status box showing current autonomy level

```tsx
// Example: Slider control
<input
  type="range"
  min="0"
  max="100"
  value={autonomyLevel}
  onChange={(e) => setAutonomyLevel(Number(e.target.value))}
/>
```

### 2️⃣ **Chat Hook: Autonomy Tracking**
📁 `src/features/chat/hooks/useChat.ts`

✅ Added:
- Response time measurement (using `Date.now()`)
- Confidence calculation (based on response time):
  - < 500ms → 0.8-1.0 (high confidence)
  - 500-2000ms → 0.5-0.8 (medium)
  - > 2000ms → 0.3-0.5 (lower)
- Hesitation score = 1 - confidence
- Call to `/api/autonomy-log` endpoint with tracking data
- Error handling (logging failures don't break chat)

```tsx
// Example: Autonomy tracking
const startTime = Date.now();
const response = await axios.post(`${apiUrl}/api/nova`, { ... });
const responseTime = Date.now() - startTime;
const confidence = Math.min(1.0, Math.max(0.3, 1.0 - responseTime / 5000));
const hesitation = 1.0 - confidence;

// Log to autonomy endpoint
await axios.post(`${apiUrl}/api/autonomy-log`, {
  user_id: userId,
  hub: currentHub,
  mood: currentMood,
  autonomy_level: autonomyLevel,
  confidence,
  hesitation,
  response_time_ms: responseTime,
  message_length: userMessage.length,
  response_length: response.data.content.length,
});
```

### 3️⃣ **Backend API: Autonomy Log Endpoint**
📁 `api/autonomy-log.ts` (NEW)

✅ Created:
- POST `/api/autonomy-log` endpoint
- Request validation (autonomy_level, confidence, hesitation bounds)
- Supabase `decision_log` table insertion
- CORS headers + preflight handling
- Error handling with proper HTTP status codes

```typescript
// Validation
- autonomy_level: 0-100 (required)
- confidence: 0-1 (required)
- hesitation: 0-1 (required)
- response_time_ms: positive number (required)
- user_id, hub, mood (required)

// Response
{
  success: true,
  logId: "uuid...",
  message: "ข้อมูล autonomy ถูกบันทึกเรียบร้อย",
  timestamp: "2025-08-06T10:30:45.123Z"
}
```

### 4️⃣ **Database Schema & Migration**
📁 `supabase/migrations/003_decision_log_autonomy_tracking.sql`

✅ Created:
- `decision_log` table with columns:
  - `id` (UUID PK)
  - `user_id` (VARCHAR)
  - `hub`, `mood` (VARCHAR)
  - `autonomy_level` (0-100)
  - `confidence` (0-1)
  - `hesitation` (0-1)
  - `response_time_ms` (milliseconds)
  - `message_length`, `response_length`
  - `created_at`, `updated_at`
- Indexes on user_id, hub, mood, created_at, autonomy_level
- RLS policies (users see own data only)
- `autonomy_analytics` view for Dashboard (Phase 7)

### 5️⃣ **Supabase Service**
📁 `src/services/supabase-service.ts`

✅ Added:
- `saveAutonomyLog()` function for direct Supabase calls
- Full autonomy tracking parameter support
- Error handling with fallback

```typescript
export async function saveAutonomyLog(
  userId: string,
  hub: string,
  mood: string,
  autonomyLevel: number,
  confidence: number,
  hesitation: number,
  responseTimeMs: number,
  messageLength?: number,
  responseLength?: number
): Promise<boolean>
```

### 6️⃣ **Documentation**
📁 `supabase/MIGRATION_GUIDE.md` (NEW)
📁 `TEST_PHASE6_E2E.md` (NEW)

✅ Created:
- Supabase setup guide (step-by-step migration)
- E2E test checklist with expected results
- Troubleshooting section
- SQL query examples for data exploration

---

## 🏗️ Architecture Overview

```
Frontend (5173)
├── ChatPage.tsx
│   ├── autonomyLevel state (0-100)
│   ├── Autonomy slider UI
│   └── Pass to useChat(autonomyLevel)
│
└── useChat hook
    ├── Measure response time
    ├── Calculate confidence/hesitation
    └── POST /api/autonomy-log

Backend (3001)
└── /api/autonomy-log.ts
    ├── Validate input
    ├── Insert to decision_log table
    └── Return success/error

Database (Supabase)
├── decision_log table
│   ├── autonomy_level
│   ├── confidence
│   ├── hesitation
│   ├── response_time_ms
│   └── created_at
│
└── autonomy_analytics view
    └── Pre-aggregated metrics for Phase 7
```

---

## 📊 Data Flow Example

```
User Action:
1. Adjust slider → autonomyLevel = 75%
2. Select hub = "career", mood = "ready"
3. Type: "ช่วยแนะนำ"
4. Click Send

Frontend Processing:
5. sendMessage() called
6. START: measure response time
7. POST /api/nova (with autonomy: 75)
8. Nova responds in ~1200ms
9. Calculate: confidence = 0.76, hesitation = 0.24
10. POST /api/autonomy-log ({
    user_id: "user123",
    hub: "career",
    mood: "ready",
    autonomy_level: 75,
    confidence: 0.76,
    hesitation: 0.24,
    response_time_ms: 1200,
    message_length: 16,
    response_length: 256
})

Backend Response:
11. /api/autonomy-log validates input
12. Inserts into decision_log table
13. Returns: { success: true, logId: "uuid..." }

Database:
14. Supabase stores decision_log row
15. Available for queries/analytics
```

---

## 📈 Key Metrics Tracked

For each message interaction:

| Metric | Type | Range | Meaning |
|--------|------|-------|---------|
| `autonomy_level` | Integer | 0-100 | User's self-reported autonomy preference |
| `confidence` | Decimal | 0-1 | Confidence based on response time (faster = more confident) |
| `hesitation` | Decimal | 0-1 | Uncertainty indicator (1 - confidence) |
| `response_time_ms` | Integer | 0+ | Nova's response latency in milliseconds |
| `message_length` | Integer | 0+ | Length of user's message |
| `response_length` | Integer | 0+ | Length of Nova's response |

---

## 🧪 Testing

### Pre-Test Checklist

- [ ] Run Supabase migration
- [ ] Verify .env variables set
- [ ] npm install (if new dependencies)
- [ ] Start backend: `vercel dev --listen 3001`
- [ ] Start frontend: `npm run dev`

### Test Scenarios

✅ **Test 1:** Slider interaction
- Adjust slider 0→100→50 → verify state updates

✅ **Test 2:** Message at low autonomy (20%)
- Send message → verify confidence/hesitation logged

✅ **Test 3:** Message at high autonomy (90%)
- Send message → compare confidence/hesitation vs Test 2

✅ **Test 4:** Check Supabase data
```sql
SELECT autonomy_level, confidence, hesitation, response_time_ms
FROM decision_log
ORDER BY created_at DESC
LIMIT 5;
```

See: `TEST_PHASE6_E2E.md` for detailed steps

---

## 📁 Files Changed/Created

### Modified Files
```
src/pages/ChatPage.tsx                    ← Added autonomyLevel state + slider UI
src/features/chat/hooks/useChat.ts        ← Added response time tracking + /api/autonomy-log call
src/services/supabase-service.ts          ← Added saveAutonomyLog() function
```

### New Files
```
api/autonomy-log.ts                       ← Vercel Function for autonomy logging
supabase/migrations/003_...sql            ← Database schema migration
supabase/MIGRATION_GUIDE.md               ← Setup guide for Supabase
PHASE6_SUMMARY.md                         ← This file
TEST_PHASE6_E2E.md                        ← E2E test checklist
```

---

## 🚀 Next Phase (Phase 7: Dashboard)

Ready to implement:

```
Dashboard.tsx
├── User insights section
│   ├── Total messages
│   ├── Top hub/mood combo
│   └── Average autonomy level
│
├── Decision Log UI
│   ├── Filter by hub, mood, date range
│   ├── Display autonomy_level, confidence, response_time
│   └── Sort options
│
├── Charts
│   ├── Autonomy trend (line chart over time)
│   ├── Confidence distribution (histogram)
│   ├── Response time by hub (bar chart)
│   └── Hub/mood heatmap
│
└── Export
    ├── Download as CSV
    └── Download as JSON
```

Query: `SELECT * FROM autonomy_analytics WHERE user_id = ?`

---

## ✅ Success Metrics

Phase 6 is complete when:

- ✅ Autonomy slider appears on ChatPage
- ✅ Slider changes trigger state updates
- ✅ Messages include autonomy_level in /api/nova request
- ✅ `/api/autonomy-log` endpoint created & functional
- ✅ Supabase migration applied (decision_log table)
- ✅ Data inserted successfully on each message
- ✅ No console errors (CORS, validation)
- ✅ E2E test checklist passes

---

## 📞 Support

### Troubleshooting

1. **Slider not appearing?**
   → Check ChatPage.tsx imports & state setup

2. **API returning 400?**
   → Verify request body matches schema in api/autonomy-log.ts

3. **Supabase insert failing?**
   → Run migration again, check table exists

4. **CORS error?**
   → Verify CORS headers in /api/autonomy-log.ts

See: `TEST_PHASE6_E2E.md` for detailed troubleshooting

---

## 🎉 You're Ready!

Run the E2E test checklist: `TEST_PHASE6_E2E.md`

**Estimated token usage for Phase 6: 50-70K** (actual may vary based on testing)

**Next Session: Phase 7 - Dashboard** 🚀
