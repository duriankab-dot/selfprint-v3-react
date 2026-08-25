# 📋 Migration Schema Audit Report (ภาษาไทย)

**วันที่:** 2026-08-25  
**สถานะ:** 🛑 **BLOCKING - ห้ามแก้ code ก่อน**

---

## **สรุปปัญหา**

| ประเภท | จำนวน | ความรุนแรง |
|--------|------|----------|
| Foreign key ordering issues | 4 | 🔴 CRITICAL |
| Duplicate migration numbers | 6 | 🟠 HIGH |
| Duplicate table definitions | 3 | 🟠 HIGH |

---

## **🔴 PROBLEM 1: Foreign Key Ordering (BLOCKING)**

### ปัญหา
migrations ทั้ง 4 ไฟล์ ต้องการ table `twins` แต่ `twins` ยังไม่มี

```
EXECUTION ORDER (Supabase applies alphabetically):
005_core_awakening_ceremony.sql       ← references twins (ไม่มี yet)
006_twin_evolution.sql                ← references twins (ไม่มี yet)
007_notifications.sql                 ← references twins (ไม่มี yet)
... (อีก 20+ files)
20260824_001_create_twins_table.sql   ← สร้าง twins (too late!)
```

### ไฟล์ที่ผิด
```
1. 005_core_awakening_ceremony.sql
   REFERENCES twins(id)  ← ต้องใช้ แต่ twins ยังไม่มี

2. 006_twin_evolution.sql
   REFERENCES twins(id)  ← ต้องใช้ แต่ twins ยังไม่มี

3. 007_notifications.sql
   REFERENCES twins(id)  ← ต้องใช้ แต่ twins ยังไม่มี

4. 20260817_p0_3_decision_learning.sql
   REFERENCES twins(id)  ← ต้องใช้ แต่ twins ยังไม่มี
```

### ผลกระทบ
- ❌ `supabase start` ล้มเหลว
- ❌ `supabase db reset` ไม่ได้
- ❌ ไม่สามารถทำ unit test
- ❌ ไม่สามารถทำ E2E test
- ❌ Phase A verification ถูก block

---

## **🟠 PROBLEM 2: Duplicate Migration Numbers**

```
005_core_awakening_ceremony.sql  ┐
005_share_links.sql              ├─ ทั้ง 2 file มี version "005"
                                  ┘

006_blueprint_prototype_core.sql  ┐
006_twin_evolution.sql            ├─ ทั้ง 2 file มี version "006"
                                  ┘

007_analytics_events.sql          ┐
007_notifications.sql             ├─ ทั้ง 3 file มี version "007"
007_world_stats_fixes.sql         ┘
```

**วิธี Supabase รัน:**
- Supabase sorts alphabetically
- ถ้า version ซ้ำ จะรัน filename order
- อาจ run ผิด sequence ถ้า dependencies ไม่ชัด

---

## **🟠 PROBLEM 3: Duplicate Table Definitions**

### Table `selfprint`
```
004_profiles_blueprints.sql      → CREATE TABLE selfprint (...)
005_share_links.sql              → CREATE TABLE selfprint (...)
```
**ปัญหา:** ได้ว่า version ไหนจะ "ชนะ"? อันไหนคือ truth?

### Table `decision_log`
```
003_decision_log_autonomy_tracking.sql  → CREATE TABLE decision_log (...)
20260816_create_decision_tables.sql     → CREATE TABLE decision_log (...)
```
**ปัญหา:** สกีมา conflicting?

### Table `decision_outcomes`
```
007_notifications.sql                   → CREATE TABLE decision_outcomes (...)
20260816_create_decision_tables.sql     → CREATE TABLE decision_outcomes (...)
```

---

## **🟡 PROBLEM 4: Unclear Schema Definitions**

ไฟล์เหล่านี้ create table แต่ชื่อ table คือ "public":
```
20260809_intelligence_core_schema.sql
20260810_chat_messages.sql
20260810_create_user_credentials.sql
20260810_journal_queue.sql
20260810_push_subscriptions.sql
20260810_subscriptions.sql
20260811_auth_rate_limits.sql
20260811_create_passkey_challenges.sql
20260811_daily_briefs.sql
20260816_world_preferences.sql
20260817_twin_learning_profiles.sql
20260824_002_create_awakening_essence_table.sql
```

ปัญหา: schema ของตารางเหล่านี้มีรายละเอียดอะไร? ต้องตรวจ

---

## **สาเหตุรากแท้ (Root Cause)**

```
Timeline of Development:
┌─────────────────────────────────────────────────┐
│ PHASE A Early (Session 1-3):                   │
│ - Created 003-007 migrations                   │
│ - Designed twin, profile, conversation schema  │
│ - Assumed 'twins' table exists                 │
│                                                 │
│ PHASE A Late (Session 4):                      │
│ - Discovered 'twins' table missing             │
│ - Created 20260824_001 with twins table        │
│ - But didn't rename/reorder old migrations     │
│                                                 │
│ Result: Schema overlap & FK ordering issues   │
└─────────────────────────────────────────────────┘
```

---

## **ขั้นตอนแก้ไข (Fix Strategy)**

### ❌ ห้ามทำ
- `rm migration` ← ทำลายประวัติ
- `rename migration` ← เพี้ยน sequence
- `delete old schema` ← สูญเสีย Phase A data

### ✅ ต้องทำ
1. **Identify truth:** ตารางใหม่ (20260824) vs เก่า (003-007)
2. **Reorder:** Rename migration ให้ถูกลำดับ (แต่ยังเก็บ history)
3. **Consolidate:** รวม duplicate definitions
4. **Verify:** รัน `supabase start` สำเร็จ

### 📋 Action List (ต่อจาก การตรวจเพิ่มเติม)
- [ ] ตรวจว่า 20260824 twins schema ถูกต้องไหม
- [ ] ตรวจว่า 005-007 ต้องการ twins table จริงหรือ
- [ ] ตรวจ duplicate table (selfprint, decision_log, decision_outcomes)
- [ ] ก่อนแก้ code - บันทึก root cause ก่อน

---

## **ข้อมูลสนับสนุน**

ดู:
- `/supabase/migrations/` — ไฟล์ migration ทั้งหมด (28 files)
- `/src/services/CoreAwakeningService.ts` — schema ที่ Phase A ใช้

---

## **สถานะปัจจุบัน**

| Item | Status |
|------|--------|
| Docker | ✅ Installed |
| Supabase CLI | ✅ Installed |
| twins table | ✅ Created (in 20260824_001) |
| FK ordering | 🔴 BROKEN |
| Test environment | 🔴 BLOCKED |

**Cannot proceed:** ห้าม `npm test` / `npm run test:e2e` ก่อน migrations ถูกต้อง

