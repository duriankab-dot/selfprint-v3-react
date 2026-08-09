# 📋 HANDOFF: PHASE 7 — DASHBOARD & ANALYTICS

**Created:** 2026-08-06  
**Status:** Ready to Start  
**Token Budget:** ~35-55K remaining (conservative Phase 7)  
**Scope:** Autonomy Dashboard + Analytics UI

---

## 🎯 Phase 7 Scope: Dashboard

### What to Build

```
/pages/Dashboard.tsx
├── Section 1: User Insights (Stats)
│   ├── Total messages sent
│   ├── Total autonomy tracking records
│   ├── Top hub (most used)
│   ├── Top mood (most used)
│   ├── Average autonomy level
│   └── Average confidence score
│
├── Section 2: Decision Log UI
│   ├── Table of recent logs (last 50)
│   ├── Columns: timestamp, hub, mood, autonomy, confidence, response_time
│   ├── Filters: by hub, by mood, by date range
│   ├── Sort options
│   └── Pagination
│
├── Section 3: Charts
│   ├── Autonomy Trend (line chart - autonomy over time)
│   └── Confidence Distribution (simple stats)
│
└── Section 4: Export
    ├── Download as CSV
    └── Download as JSON
```

### Not in Phase 7 (Optional Later)

- Advanced charts (heatmap, response time by hub)
- Mood history visualization
- Complex analytics
- Real-time updates

---

## 📊 Data Source

**Query:** `autonomy_analytics` view + `decision_log` table

```sql
-- For User Insights (stats)
SELECT
  COUNT(*) as total_interactions,
  AVG(autonomy_level)::INTEGER as avg_autonomy,
  AVG(confidence)::DECIMAL(3, 2) as avg_confidence
FROM decision_log
WHERE user_id = 'current-user-id';

-- For Top Hub/Mood
SELECT hub, COUNT(*) as count
FROM decision_log
WHERE user_id = 'current-user-id'
GROUP BY hub
ORDER BY count DESC
LIMIT 1;

-- For Decision Log Table
SELECT 
  id, created_at, hub, mood, autonomy_level, 
  confidence, response_time_ms
FROM decision_log
WHERE user_id = 'current-user-id'
ORDER BY created_at DESC
LIMIT 50;

-- For Autonomy Trend Chart
SELECT 
  created_at, autonomy_level
FROM decision_log
WHERE user_id = 'current-user-id'
ORDER BY created_at ASC;
```

---

## 🔧 Implementation Plan

### Step 1: Create Dashboard Component
**File:** `src/pages/Dashboard.tsx`

```tsx
// Structure
export const Dashboard: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [insights, setInsights] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    hub: null,
    mood: null,
    startDate: null,
    endDate: null
  });
  
  useEffect(() => {
    fetchInsights();
    fetchLogs();
  }, [filters]);
  
  // Components:
  // - InsightsSection
  // - DecisionLogTable
  // - TrendChart
  // - FilterBar
  // - ExportButtons
}
```

### Step 2: Query Functions
**File:** `src/services/supabase-service.ts` (add new functions)

```typescript
// Add to supabase-service.ts

export async function getDashboardInsights(userId: string) {
  // Query stats: total messages, avg autonomy, etc.
  return await supabase
    .from('decision_log')
    .select('autonomy_level, confidence, hub, mood')
    .eq('user_id', userId);
}

export async function getDecisionLogs(
  userId: string,
  hub?: string,
  mood?: string,
  startDate?: string,
  endDate?: string,
  limit: number = 50
) {
  // Query decision log with filters
  let query = supabase
    .from('decision_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (hub) query = query.eq('hub', hub);
  if (mood) query = query.eq('mood', mood);
  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);
  
  return await query;
}

export async function getAutonomyTrend(userId: string) {
  // For chart: autonomy level over time
  return await supabase
    .from('decision_log')
    .select('created_at, autonomy_level')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
}

export async function exportDecisionLogs(userId: string, format: 'csv' | 'json') {
  // Fetch all logs
  const { data } = await supabase
    .from('decision_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (format === 'csv') {
    return convertToCSV(data);
  } else {
    return JSON.stringify(data, null, 2);
  }
}
```

### Step 3: UI Components
**File:** `src/components/dashboard/` (new folder)

```
src/components/dashboard/
├── InsightsCard.tsx      (Stats box)
├── DecisionLogTable.tsx  (Table with filters)
├── TrendChart.tsx        (Autonomy line chart)
├── FilterBar.tsx         (Hub, mood, date filters)
└── ExportButton.tsx      (CSV/JSON download)
```

### Step 4: Routing
**File:** `src/App.tsx`

```tsx
import { Dashboard } from '@/pages/Dashboard';

// Add route
<Route path="/dashboard" element={<Dashboard />} />
```

### Step 5: Navigation
Update Chat page or App layout to link to Dashboard

```tsx
<a href="/dashboard">📊 Dashboard</a>
```

---

## 📋 Implementation Checklist

### Phase 7 Deliverables

- [ ] Create `/pages/Dashboard.tsx` main component
- [ ] Add query functions to `supabase-service.ts`
  - [ ] `getDashboardInsights()`
  - [ ] `getDecisionLogs()`
  - [ ] `getAutonomyTrend()`
  - [ ] `exportDecisionLogs()`
- [ ] Create dashboard UI components
  - [ ] `InsightsCard.tsx` (stats section)
  - [ ] `DecisionLogTable.tsx` (table with data)
  - [ ] `FilterBar.tsx` (filters: hub, mood, date)
  - [ ] `TrendChart.tsx` (line chart of autonomy)
  - [ ] `ExportButton.tsx` (CSV/JSON download)
- [ ] Add route in `App.tsx`
- [ ] Test: Load dashboard page
- [ ] Test: Filters work correctly
- [ ] Test: Chart renders autonomy trend
- [ ] Test: Export downloads file
- [ ] Verify: No Supabase errors
- [ ] Verify: Data displays correctly

---

## 🎨 UI Layout Example

```
Dashboard Page
┌─────────────────────────────────────────────────────┐
│  📊 Autonomy Dashboard                              │
├─────────────────────────────────────────────────────┤
│                                                       │
│  [User Insights]                                    │
│  ┌──────────────┬──────────────┬──────────────┐    │
│  │ Total: 42    │ Avg Autonomy │ Avg Conf:    │    │
│  │ Messages     │ 65%          │ 0.78         │    │
│  ├──────────────┼──────────────┼──────────────┤    │
│  │ Top Hub:     │ Top Mood:    │ Records:     │    │
│  │ identity     │ confident    │ 42           │    │
│  └──────────────┴──────────────┴──────────────┘    │
│                                                       │
│  [Autonomy Trend Chart]                             │
│  ┌──────────────────────────────────────────────┐  │
│  │ 100 ┤     ╱╲     ╱╲                           │  │
│  │      │    ╱  ╲   ╱  ╲                         │  │
│  │  50  ├───╱────╲─╱────╲───                     │  │
│  │      │  ╱      ╲      ╲                       │  │
│  │   0  └──────────────────────→ Time            │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  [Filters]                                          │
│  Hub: [identity ▼]  Mood: [confident ▼]            │
│  From: [date] To: [date]  [Apply]                   │
│                                                       │
│  [Decision Log Table]                               │
│  ┌──────────────────────────────────────────────┐  │
│  │ Date | Hub | Mood | Autonomy | Confidence   │  │
│  ├──────────────────────────────────────────────┤  │
│  │ ... | ... | ... | ...        | ...           │  │
│  └──────────────────────────────────────────────┘  │
│  [← Prev] [1 2 3 4 5] [Next →]                      │
│                                                       │
│  [📥 Export CSV] [📥 Export JSON]                   │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 Test Cases

### Test 1: Load Dashboard
```
1. Navigate to /dashboard
2. Verify: Page loads without errors
3. Verify: Insights stats display (non-zero if data exists)
4. Verify: Table shows recent logs
5. Verify: Chart renders (if data > 2 points)
```

### Test 2: Filters
```
1. Select hub = "identity" in filter
2. Verify: Table updates to show only identity hub
3. Select mood = "confident"
4. Verify: Table shows only identity + confident rows
5. Clear filters
6. Verify: All rows reappear
```

### Test 3: Chart
```
1. Verify: Line chart shows autonomy_level over time
2. Verify: Y-axis is 0-100
3. Verify: X-axis is time (created_at)
4. Verify: Data points connect in order
```

### Test 4: Export
```
1. Click "📥 Export CSV"
2. Verify: File downloads with name decision_log_YYYYMMDD.csv
3. Verify: CSV has columns: id, user_id, hub, mood, autonomy_level, ...
4. Verify: Rows match table data
5. Click "📥 Export JSON"
6. Verify: File downloads with name decision_log_YYYYMMDD.json
7. Verify: Valid JSON format
```

---

## 🔗 Dependencies

### Already Installed
- ✅ React 19
- ✅ @supabase/supabase-js
- ✅ axios

### Need to Add (if not present)
```bash
# For charts (simple line chart)
npm install recharts

# OR use built-in canvas (no extra dependency)
# Use HTML Canvas + JS to draw chart
```

**Recommendation:** Use Recharts (already used in React ecosystem)

---

## 📁 Files to Create/Modify

### New Files
```
src/pages/Dashboard.tsx                    (main dashboard component)
src/components/dashboard/InsightsCard.tsx  (stats display)
src/components/dashboard/DecisionLogTable.tsx
src/components/dashboard/FilterBar.tsx
src/components/dashboard/TrendChart.tsx
src/components/dashboard/ExportButton.tsx
PHASE7_SUMMARY.md                          (implementation notes)
TEST_PHASE7_E2E.md                         (test checklist)
```

### Modified Files
```
src/services/supabase-service.ts           (+ query functions)
src/App.tsx                                (+ /dashboard route)
src/main.tsx OR App.tsx                    (+ navigation link)
```

---

## ⚡ Performance Tips

1. **Lazy load chart** — only render if data > 2 points
2. **Limit table to 50 rows** — paginate instead of loading all
3. **Cache queries** — use React state/Context to avoid refetches
4. **Memoize components** — use `React.memo()` for InsightsCard, etc.

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "No data in table" | Check userId matches localStorage; verify Supabase has decision_log rows |
| "Chart not rendering" | Ensure data has > 2 points; check data format (created_at must be parseable) |
| "Filters not working" | Verify hub/mood values match exactly (case-sensitive); check RLS policies allow read |
| "Export empty file" | Ensure user has data; check Supabase query returns results |
| "CORS error" | All queries use Supabase JS SDK (anon key), no API calls needed |

---

## 📝 Session Notes

**Token Budget for Phase 7:**
- Available: 35-55K tokens (conservative)
- Estimated: 40-50K tokens for basic dashboard
- Should be feasible if scope stays focused

**Key Optimization:**
- Skip advanced features (heatmap, advanced filters) for now
- Focus on core: stats + table + simple chart + export
- Can add complexity in future sessions

---

## 🚀 Next Session Checklist

### Before Starting Phase 7

```bash
# 1. Verify Phase 6 complete
□ npm run dev → no errors
□ Check localhost:5173/chat works
□ Autonomy slider responds

# 2. Verify Supabase migration applied
□ Go to Supabase → Tables
□ Verify decision_log table exists
□ Check it has 5+ rows from Phase 6 testing

# 3. Verify data in Supabase
SQL Query:
SELECT COUNT(*) FROM decision_log;
→ Should return > 0

# 4. Create new task list for Phase 7
□ Task 1: Create Dashboard.tsx
□ Task 2: Add query functions
□ Task 3: Create UI components
□ Task 4: Build filters
□ Task 5: Build chart
□ Task 6: Export functionality
□ Task 7: E2E test

# 5. Start coding
```

---

## 💾 Session Handoff Info

| Field | Value |
|-------|-------|
| Previous Session | Session 3 (Phase 6: Autonomy Tracking) ✅ |
| Phase Complete | 6 of 7 |
| Files Created | 8+ |
| Data Ready | ✅ decision_log table populated |
| API Endpoints | ✅ /api/nova, /api/autonomy-log |
| Testing | Phase 6 ready for E2E |

---

## 📞 Quick Reference

### Supabase Queries

**Get all user insights:**
```sql
SELECT 
  COUNT(*) as total,
  AVG(autonomy_level) as avg_autonomy,
  AVG(confidence) as avg_confidence
FROM decision_log
WHERE user_id = 'USER_ID';
```

**Get recent logs with filters:**
```sql
SELECT * FROM decision_log
WHERE user_id = 'USER_ID'
  AND (hub = 'SELECTED_HUB' OR 'SELECTED_HUB' IS NULL)
  AND (mood = 'SELECTED_MOOD' OR 'SELECTED_MOOD' IS NULL)
  AND created_at >= 'START_DATE'
  AND created_at <= 'END_DATE'
ORDER BY created_at DESC
LIMIT 50;
```

**Get trend data for chart:**
```sql
SELECT created_at, autonomy_level
FROM decision_log
WHERE user_id = 'USER_ID'
ORDER BY created_at ASC;
```

### React Hooks

```typescript
// Fetch insights
const [insights, setInsights] = useState(null);

useEffect(() => {
  getDashboardInsights(userId).then(data => {
    setInsights(data);
  });
}, [userId]);

// Fetch logs with filters
useEffect(() => {
  getDecisionLogs(userId, filters.hub, filters.mood, ...)
    .then(data => setLogs(data));
}, [filters]);
```

---

## ✨ Success Criteria for Phase 7

All should be ✓:

- ✅ Dashboard page loads without errors
- ✅ Insights stats display (or "No data yet")
- ✅ Decision log table shows 5+ rows
- ✅ Filters work (hub, mood, date range)
- ✅ Autonomy trend chart renders
- ✅ Chart shows data points connected over time
- ✅ Export CSV downloads valid file
- ✅ Export JSON downloads valid file
- ✅ No Supabase errors in console
- ✅ No CORS errors

---

## 🎉 You're Ready to Build!

**Phase 7: Dashboard & Analytics** is ready to start.

Copy this handoff file for reference during implementation.

**Happy coding! 🚀**

---

**Handoff Created:** 2026-08-06  
**Valid Until:** Next Session  
**Last Updated:** Phase 6 Complete
