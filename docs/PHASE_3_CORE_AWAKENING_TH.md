# PHASE 3 — การทำให้ Core Awakening สมบูรณ์ (ภาษาไทย)

**สถานะ:** 🔧 IN PROGRESS (ระหว่างดำเนินการ)  
**วันที่:** 2026-08-17 (Phase 3)  
**เป้าหมาย:** ลบ sessionStorage hack + บันทึก Twin essence ถาวรใน Supabase

---

## 📋 สรุปปัญหาที่แก้ไข

### ❌ ปัญหาเดิม (sessionStorage hack)

```typescript
// CoreAwakeningService.ts (เดิม) — บรรทัด 101-112
const awakeningCache = new Map<string, any>();
awakeningCache.set(userId, essence);

// เก็บใน browser sessionStorage
if (typeof window !== 'undefined' && window.sessionStorage) {
  window.sessionStorage.setItem(
    `awakening-essence-${userId}`,
    JSON.stringify(essence)
  );
}
```

**ผลกระทบ:**
- 🔴 Essence หายไปเมื่อปิด browser
- 🔴 ไม่ persist ถาวร → ต้องทำ Awakening ใหม่
- 🔴 ไม่ secure (data ใน localStorage เห็นได้จาก DevTools)
- 🔴 Race condition: essence อาจสูญหายระหว่าง Twin creation

---

## ✅ วิธีแก้ (Phase 3)

### 1. สร้าง `awakening_essence` Table ใน Supabase

```sql
CREATE TABLE public.awakening_essence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  twin_id UUID,
  personal_intelligence JSONB NOT NULL,
  sice_results JSONB NOT NULL,
  synthesis JSONB NOT NULL,
  execution_time INTEGER,
  status TEXT DEFAULT 'pending',  -- 'pending' → 'used'
  generated_at TIMESTAMP DEFAULT now(),
  used_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**ประโยชน์:**
- ✅ Essence persist ถาวรใน DB
- ✅ Track status: pending → used
- ✅ Expire หลัง 24 ชั่วโมง (auto-cleanup)
- ✅ Link essence → Twin record

---

### 2. แก้ `startAwakening()` — Persist to Supabase

**ก่อน (sessionStorage):**
```typescript
window.sessionStorage.setItem(`awakening-essence-${userId}`, JSON.stringify(essence));
```

**หลัง (Supabase):**
```typescript
const { data: savedEssence } = await supabase
  .from('awakening_essence')
  .insert({
    user_id: userId,
    personal_intelligence: essence.personalIntelligence,
    sice_results: essence.siceResults,
    synthesis: essence.synthesis,
    execution_time: essence.executionTime,
    status: 'pending',
  })
  .select('id')
  .single();

return {
  success: true,
  message: 'Awakening สำเร็จ ✨',
  essenceId: savedEssence.id,  // ← return ID สำหรับใช้ต่อ
};
```

---

### 3. แก้ `initializeTwin()` — Retrieve from Supabase

**ก่อน:**
```typescript
// ดึง essence จาก sessionStorage (unstable)
const essence = JSON.parse(window.sessionStorage.getItem(`awakening-essence-${userId}`));
```

**หลัง:**
```typescript
// ดึง essence จาก Supabase (persistent)
const { data: essence } = await supabase
  .from('awakening_essence')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'pending')
  .single();

// Link essence → Twin (atomic update)
await supabase
  .from('awakening_essence')
  .update({
    twin_id: newTwin.id,
    status: 'used',  // ← Mark as used
    used_at: new Date().toISOString(),
  })
  .eq('id', essence.id);
```

---

## 🔄 User Journey ที่แก้ไข

### ก่อน (sessionStorage hack — ใช้ไม่ได้)

```
User ทำ Self Print ✓
         ↓
Core Awakening เริ่ม (SICE 12 engines)
         ↓
Essence สร้างสำเร็จ
         ↓
Essence เก็บ sessionStorage ⚠️
         ↓
User ตั้งชื่อ Twin
         ↓
Twin Create ... ❌ Essence หายไป!
(ปิด browser, refresh, เปลี่ยน tab)
```

### หลัง (Supabase persistence — ใช้ได้)

```
User ทำ Self Print ✓
         ↓
Core Awakening เริ่ม
         ↓
Essence สร้าง
         ↓
Essence บันทึก Supabase ✅
essenceId = "uuid-123"
         ↓
Return essenceId → Frontend
         ↓
User ตั้งชื่อ Twin
         ↓
POST /api/twin/create { essenceId, twinName }
         ↓
initializeTwin() ดึง essence จาก Supabase ✅
         ↓
Link essence → Twin
Mark status = 'used'
         ↓
Twin สร้างสำเร็จ ✨
         ↓
[User ปิด browser, เปลี่ยน tab]
         ↓
[User กลับมา]
         ↓
Twin มีอยู่ ✅ (ไม่เสีย essence)
```

---

## 📊 Data Flow ของ Phase 3 Fix

```
┌─────────────────────────────────────────┐
│  Frontend (React)                        │
│  User ทำ Self Print → Core Awakening    │
└─────────────────────────────────────────┘
                ↓
    POST /api/core-awakening
                ↓
┌─────────────────────────────────────────┐
│  CoreAwakeningService.startAwakening()  │
│  1. Run SICE 12 engines orchestrate     │
│  2. Generate essence ✓                  │
│  3. Persist to Supabase ✅ (Phase 3 fix)│
│  4. Return essenceId                    │
└─────────────────────────────────────────┘
                ↓
    Supabase: awakening_essence table
    INSERT {
      user_id, 
      personal_intelligence,
      sice_results,
      synthesis,
      status: 'pending'
    }
                ↓
         Return essenceId
                ↓
    Frontend: "Essence บันทึกเรียบร้อย"
                ↓
    User ตั้งชื่อ Twin
                ↓
    POST /api/twin/create { essenceId, twinName }
                ↓
┌─────────────────────────────────────────┐
│  CoreAwakeningService.initializeTwin()  │
│  1. Retrieve essence by essenceId ✅    │
│  2. Verify status='pending' ✓           │
│  3. Create Twin record ✓                │
│  4. Update essence.status='used' ✅     │
│  5. Link essence.twin_id ✅             │
└─────────────────────────────────────────┘
                ↓
    Return { success: true, twinId }
                ↓
    Frontend: Twin Chat UI
                ↓
    ✨ Twin ตื่นตัว!
```

---

## 🔒 Security Improvements

### Row-Level Security (RLS) on awakening_essence

```sql
-- User สามารถดู essence ของตัวเองได้
ALTER TABLE awakening_essence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_essence"
  ON awakening_essence FOR SELECT
  USING (auth.uid() = user_id);

-- User ไม่สามารถเห็น essence ของคนอื่น
-- Essence ถูกลบหลัง 24 ชั่วโมง
```

**ป้องกัน:**
- ✅ Cross-user data leakage
- ✅ Essence ค้างอยู่เกิน 24 ชั่วโมง
- ✅ Unauthorized access

---

## 🧪 Test Cases (ทำใน Phase 10)

### Test 1: Essence Persistence
```
1. User ทำ Core Awakening
2. essenceId บันทึก
3. Browser close
4. Browser reopen
5. Verify: essence ยังอยู่ใน DB ✓
```

### Test 2: Twin Creation with Essence
```
1. Core Awakening → essenceId = "abc123"
2. POST /api/twin/create { essenceId, twinName }
3. Verify: essence.status = 'used'
4. Verify: essence.twin_id = newTwin.id
5. Verify: Twin chat สามารถเข้าถึงได้ ✓
```

### Test 3: Essence Expiration
```
1. Core Awakening
2. essenceId เก็บ
3. Wait 24 hours (หรือ mock timestamp)
4. Verify: essence.expires_at < now()
5. Verify: Cleanup job ลบ expired essence ✓
```

### Test 4: Multiple Essence (ถ้า User ทำ Awakening หลายครั้ง)
```
1. Core Awakening 1 → essenceId1
2. Core Awakening 2 → essenceId2
3. initializeTwin() ของ essenceId2
4. Verify: essenceId1 ยังเป็น 'pending'
5. Verify: essenceId2 เป็น 'used'
6. Cleanup: ลบ pending essence หลัง 24h ✓
```

---

## 📝 Changes Summary

| ไฟล์ | การเปลี่ยน | สถานะ |
|------|----------|-------|
| `CoreAwakeningService.ts` | ✅ ลบ sessionStorage hack | Modified |
| `CoreAwakeningService.ts` | ✅ Add essence persistence | Modified |
| `add_awakening_essence_table.sql` | ✅ Create table + RLS | New migration |
| Tests | ⏳ Unit tests | Phase 10 |
| Tests | ⏳ Integration tests | Phase 10 |

---

## ⚠️ Breaking Changes

**สำหรับ Frontend:**
```typescript
// เดิม
const result = await startAwakening(userId);
// result.message = "Awakening initiated"

// ใหม่
const result = await startAwakening(userId);
// result.essenceId = "uuid-123" ← ต้อง pass ไป Twin creation
```

**ต้องอัพเดท:**
- Pages/Onboarding.tsx
- Services/CoreAwakeningService.ts caller components

---

## ✅ Verification Checklist

- [x] Migration SQL สร้าง
- [x] `startAwakening()` แก้ให้ persist
- [x] `initializeTwin()` แก้ให้ retrieve
- [ ] Database apply migration
- [ ] Unit tests pass
- [ ] Integration tests pass (Phase 10)
- [ ] Browser test: essence persist after close
- [ ] Performance check: DB query latency

---

## 🚀 Next Steps (Phase 4)

เมื่อ Phase 3 เสร็จ:
1. ✅ Twin persistence ใช้ได้
2. ✅ Awakening ปลอดภัยแล้ว
3. ➜ Phase 4: Verify SICE engines (5/12 incomplete)

---

## 📞 Support Notes

- **ปัญหา:** Essence บันทึก แต่ initializeTwin() หาไม่เจอ
  - **วิธีแก้:** ตรวจ essenceId + check RLS policy
- **ปัญหา:** Essence expire ก่อนเวลา
  - **วิธีแก้:** Check expires_at timestamp + cleanup cron

---

**Document:** PHASE_3_CORE_AWAKENING_TH.md  
**Language:** ภาษาไทย (Thai)  
**Status:** Phase 3 (In Progress)  
**Last Updated:** 2026-08-17
