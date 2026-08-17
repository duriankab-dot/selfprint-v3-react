# HANDOFF — 2026-08-10 §37 Offline Journal Queue Complete

**Date:** 2026-08-10  
**Session:** §37 Offline Journal Queue  
**Status:** ✅ §37 Complete | Full implementation 100% | TypeScript EXIT:0 ✅

---

## ✅ งานที่เสร็จในเซสชันนี้

### 1. Supabase Migration — `journal_queue` table ✅

| ไฟล์ | หน้าที่ |
|------|---------|
| `supabase/migrations/20260810_journal_queue.sql` | ตาราง journal_queue + RLS + indices |

**Schema:**
```sql
journal_queue (
  id UUID PRIMARY KEY
  user_id UUID FK auth.users
  content TEXT
  hub TEXT
  mood TEXT
  created_at TIMESTAMPTZ
  synced_at TIMESTAMPTZ (null = unsync)
  sync_error TEXT
  sync_attempts INT
  metadata JSONB
)
```

**Indices:**
- `idx_journal_queue_unsync` — find unsynced messages (user_id, synced_at IS NULL)
- `idx_journal_queue_user` — find by user + date

**RLS:** Users read/write only own messages

---

### 2. IndexedDB Wrapper ✅

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/lib/storage/journalQueueDB.ts` | IndexedDB operations — add/get/mark/delete |

**Functions:**
- `initJournalDB()` — open/init IndexedDB
- `addToQueue()` — save message locally (offline)
- `getUnSyncedMessages(userId)` — get all pending sync
- `markSynced(itemId)` — update synced_at + clear error
- `markSyncFailed(itemId, error)` — log error + increment retry
- `deleteSyncedOlderThan(days)` — cleanup synced >30d
- `getQueueSize(userId?)` — for debugging

**Real implementation:** No mock/placeholder — uses IDBKeyRange, indices, transactions

---

### 3. Service Worker ✅

| ไฟล์ | หน้าที่ |
|------|---------|
| `public/sw.js` | Install + Activate + Fetch + Sync + Message handlers |

**Features:**
- Install: cache critical assets (index.html, manifest.json)
- Activate: cleanup old caches
- Fetch: network-first (cache fallback for offline shell)
- Background Sync: `sync` event tag `journal-sync` → sync journal queue
- Message: receive `SKIP_WAITING` + `TRIGGER_SYNC` from client

**Handles offline:**
- Cache static assets on first visit
- Fallback to cache + offline shell when network fails
- Post message to client when online (trigger sync)

---

### 4. useJournalQueue Hook ✅

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/hooks/useJournalQueue.ts` | Hook: offline detection + save + sync |

**State:**
- `status: 'online' | 'offline' | 'syncing'`
- `pendingCount: number` — messages waiting to sync
- `lastError: string | null`

**Methods:**
- `saveOffline(content, hub?, mood?)` — add to IndexedDB
- `syncQueue()` — call API for each unsync message
- `requestBackgroundSync()` — register background sync

**Listeners:**
- `window.online/offline` events → update status
- Service Worker `SYNC_JOURNAL` message → auto sync on online
- Effect: auto-sync when online + pendingCount > 0

---

### 5. API Endpoint ✅

| ไฟล์ | หน้าที่ |
|------|---------|
| `api/journal-sync.ts` | Vercel function: sync + AI response + mark synced |

**Flow:**
```
POST /api/journal-sync
  {queueId, content, hub, mood, createdAt}
  ↓
verifyUser(JWT) ✓
  ↓
getTwinContext(userId) → personalize prompt
  ↓
Anthropic API → Claude response
  ↓
Save to Supabase:
  - chat_messages (user + assistant)
  - journal_queue.synced_at + clear error
  ↓
Response: {success, response, metadata}
```

**Handles:**
- User verification via Bearer token
- Twin context for personalization
- Rate limiting (inherits from Anthropic)
- Markdown responses

---

### 6. ChatPage Integration ✅

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/pages/ChatPage.tsx` | Offline support + UI indicators |

**Changes:**
- Import `useJournalQueue` hook
- Register Service Worker on mount
- Detect online/offline status
- Auto-sync when online + pending
- `handleSendMessage()` try/catch:
  - Success: send via API
  - Fail (offline): `saveOffline()` → show "💾 บันทึกไว้ในเครื่อง"
- Status indicator: offline/syncing/pending count
- Error display

**UI:**
- `§37 Offline Status Indicator` — shows:
  - 🔌 ออนไลน์ (offline)
  - 🔄 กำลังซิงค์... (syncing)
  - ✅ เชื่อมต่ออยู่ (online + pending)
  - 💾 บันทึกไว้ในเครื่อง (just saved)
  - ❌ Error (sync failed)

---

### 7. Service Worker Registration ✅

Manifest already updated:
```json
{
  "scope": "/",
  "start_url": "/",
  "display": "standalone",
  "icons": [...]
}
```

ChatPage registers on mount:
```tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('[ChatPage] Failed to register SW:', err);
    });
  }
}, []);
```

---

## TypeScript Verification

```bash
npx tsc -b --noEmit
# Output: (empty) — EXIT:0 ✅
```

---

## Architecture Flow

```
ChatPage (offline-aware)
  useJournalQueue
    ├── IndexedDB wrapper (journalQueueDB.ts)
    │   └── journal_queue table (local cache)
    ├── Online/offline detection
    │   └── navigator.onLine + events
    ├── Service Worker listener
    │   └── syncQueue() trigger
    └── sync → /api/journal-sync

Service Worker (public/sw.js)
  ├── Cache static assets
  ├── Fetch: network-first → cache fallback
  ├── Background sync: tag 'journal-sync'
  └── Message: post to client on online

Supabase
  ├── journal_queue table (offline queue)
  ├── chat_messages (synced messages)
  └── personal_models (Twin context)

API (api/journal-sync.ts)
  ├── Verify user (JWT)
  ├── Get Twin context
  ├── Call Claude
  ├── Save to DB
  ├── Mark synced
  └── Return response
```

---

## User Flow (Offline)

```
User is OFFLINE
  ↓
Type message + Send
  ↓
API call fails (network error)
  ↓
saveOffline(message)
  ↓
Save to IndexedDB journal_queue
  ↓
Show: "💾 บันทึกไว้ในเครื่อง"
  ↓
requestBackgroundSync()
  ↓
User comes ONLINE
  ↓
Browser detects online → Service Worker 'sync' event
  ↓
SW posts SYNC_JOURNAL message to client
  ↓
useJournalQueue effect: syncQueue()
  ↓
Read unsync messages from IndexedDB
  ↓
For each: POST /api/journal-sync
  ↓
API: verify, call Claude, save to Supabase, mark synced
  ↓
Mark in IndexedDB: synced_at = now
  ↓
Show: "✅ เชื่อมต่ออยู่ — 0 ข้อความรอการส่ง"
  ↓
pendingCount → 0
  ↓
User sees AI response
```

---

## ต้องทำก่อน Deploy

### 1. Run Supabase Migration

```bash
supabase db push
# หรือ paste SQL ใน Supabase Dashboard
```

### 2. Verify Service Worker Path

Ensure `public/sw.js` can be accessed at `/sw.js` (Vercel auto-serves /public)

### 3. Test Offline Flow

```bash
npm run dev
# 1. Open DevTools → Application → Network
# 2. Set throttling to "Offline"
# 3. Send message
# 4. Should show "💾 บันทึกไว้ในเครื่อง"
# 5. Go online
# 6. Should auto-sync
```

### 4. Verify Service Worker Registration

```bash
DevTools → Application → Service Workers
# Should see: /sw.js (activated)
```

---

## Files Created/Modified

| ไฟล์ | สถานะ |
|------|--------|
| `supabase/migrations/20260810_journal_queue.sql` | ✅ NEW |
| `src/lib/storage/journalQueueDB.ts` | ✅ NEW |
| `public/sw.js` | ✅ NEW |
| `src/hooks/useJournalQueue.ts` | ✅ NEW |
| `api/journal-sync.ts` | ✅ NEW |
| `src/pages/ChatPage.tsx` | ✅ UPDATED |

---

## Tests to Verify

### Test 1: Save Offline
1. Go offline (DevTools)
2. Send message
3. Should save to IndexedDB
4. Check: `navigator.serviceWorker.controller` exists ✓

### Test 2: Auto Sync
1. Send message offline
2. Go online
3. Should auto-sync within 1s
4. Check: `/api/journal-sync` POST ✓
5. Check: Supabase `journal_queue.synced_at` updated ✓

### Test 3: Queue Status
1. Offline: `status = 'offline'` ✓
2. Syncing: `status = 'syncing'` ✓
3. Online: `status = 'online'` ✓
4. `pendingCount` decrements as sync completes ✓

### Test 4: Error Handling
1. Offline → save message
2. Go online → trigger sync
3. API fails → mark `sync_error`
4. Show ❌ error message ✓
5. Retry on next online trigger ✓

---

## Known Limitations / Future

- **AI offline:** Not implemented (needs model on device — too large)
  - Current: save locally, sync + AI when online
  - Future: Consider WebLLM for small models
  
- **Background Sync timing:**
  - Browser decides when to sync (not guaranteed)
  - Manual sync via UI always works
  
- **IndexedDB size:** ~50MB default
  - Current: should handle 1000+ messages
  - Cleanup: `deleteSyncedOlderThan(30)` runs on sync

---

## สถานะรวม P0+P1+§31+§37 ✅ ครบ

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | Intelligence, Twin, Dashboard, Experience, PWA, Privacy, Auth, Push, TwinEvolution | ✅ |
| P1 | Daily Brief, Smart Push, Badge System, Voice Twin, Growth Visualization | ✅ |
| §31 | Monetization Backend + PricingPage | ✅ |
| §37 | Offline Journal Queue (IndexedDB + SW + API) | ✅ |

---

## Next Session — P2 หรือ §34

**Options:**

| Feature | § | Complexity | Note |
|---------|---|------------|------|
| Passkey (WebAuthn) | §34 | สูง | ต้อง Apple Dev Account |
| Advanced Environments | §46 | กลาง | Time-of-day themes |
| Life Intelligence Packs | §33 | กลาง | Career/Relationship/Money |
| Future Self | §46 | สูง | Projection engine |

**Recommend:** §34 Passkey (authentication layer) → more important than P2 features

---

**Branch: master/main | tsc EXIT:0 ✅ | Token budget: ~150-160k used**
