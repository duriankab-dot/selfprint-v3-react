# 🔧 SUPABASE MIGRATION FIX

**ปัญหา:** Migration ล้มเพราะ `twins` table ไม่มี  
**สาเหตุ:** Migration files ไม่ครบถ้วน (missing foundation tables)  
**วิธีแก้:** ติดตั้ง 2 migration files ใหม่ก่อนรัน supabase start

---

## ✅ สิ่งที่ผมทำให้คุณ

สร้าง 2 migration files ที่หายไป:

### 1. `001_create_twins_table.sql` (NEW)
- สร้าง `twins` table (base table ที่ส่วนอื่น reference)
- Setup RLS policies
- Create indexes

### 2. `002_create_awakening_essence_table.sql` (NEW)
- สร้าง `awakening_essence` table
- Rename จากไฟล์เก่า `add_awakening_essence_table.sql`
- เพิ่ม foreign key ให้ `twins`

---

## 🚀 วิธีแก้ (บนเครื่องของคุณ)

### Step 1: Reset Supabase
```bash
cd D:\selfprint-v3-react

# Stop Supabase
supabase stop

# Remove old database
rm -rf .supabase/  # or rmdir /s .supabase on Windows
```

### Step 2: Delete old migration (optional)
```bash
# The old file with wrong naming
del supabase\migrations\add_awakening_essence_table.sql
```

### Step 3: Start Supabase Again
```bash
supabase start

# Expected output:
# ✓ Postgres database started
# ✓ Initialising schema...
# ✓ Applying migration 001_create_twins_table.sql
# ✓ Applying migration 002_create_awakening_essence_table.sql
# ✓ Applying migration 003_decision_log_autonomy_tracking.sql
# ✓ Applying migration 004_profiles_blueprints.sql
# ✓ Applying migration 005_core_awakening_ceremony.sql
# ✓ ...
# ✓ Local development server started successfully
```

### Step 4: Verify Setup
```bash
# Check if migrations passed
supabase status

# Expected: All migrations should show ✓ status
```

### Step 5: Run Tests
```bash
npm test

# Should now connect to Supabase local at http://localhost:54321
# All tests should pass
```

---

## 📋 Migration Order (ต้องรัน 1 → 2 → 3 →...)

```
1. 001_create_twins_table.sql                    ✅ NEW (creates `twins` table)
2. 002_create_awakening_essence_table.sql        ✅ NEW (creates `awakening_essence`)
3. 003_decision_log_autonomy_tracking.sql        ✅ (existing)
4. 004_profiles_blueprints.sql                   ✅ (existing)
5. 005_core_awakening_ceremony.sql               ✅ (existing - now works)
   ... (others follow)
```

---

## 🔍 ถ้าขึ้น Error อีก

### Error: "relation "twins" does not exist"
```
→ Step 1 ไม่สำเร็จ
→ ลอง: supabase stop && rm -rf .supabase && supabase start
```

### Error: "migration skipped - filename doesn't match pattern"
```
→ Old file name was wrong
→ ลบไฟล์: supabase\migrations\add_awakening_essence_table.sql
→ ใช้ไฟล์ใหม่: 002_create_awakening_essence_table.sql
```

### Error: "Already exists"
```
→ Table ถูกสร้างโดย old migration
→ ลอง: supabase db reset
→ รีรัน: supabase start
```

---

## ✅ CHECKLIST

- [ ] `supabase stop` (stop old instance)
- [ ] Delete `.supabase/` folder
- [ ] Verify new migration files exist:
  - `001_create_twins_table.sql`
  - `002_create_awakening_essence_table.sql`
- [ ] `supabase start` (restart with new migrations)
- [ ] Wait for migrations to complete (look for ✓)
- [ ] `npm test` (tests should pass)
- [ ] `npm run test:e2e` (E2E tests should pass)

---

## 📊 PHASE A STEP 4-5 Ready After Fix

When Supabase is fixed:
```
✅ STEP 4: npm test         → Ready to run
✅ STEP 5: npm run test:e2e → Ready to run
```

---

**Fix Created:** 2026-08-24  
**Status:** ✅ READY TO APPLY  
**Action:** Run steps above on your local machine

