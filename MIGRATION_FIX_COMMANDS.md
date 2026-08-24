# ⚡ MIGRATION FIX COMMANDS (Windows)

**ปัญหา:** Migration ทับซ้ำกัน — มีหลาย migration ชื่อ `001_` และ `002_`

**วิธีแก้:** ลบไฟล์เก่า + ใช้ไฟล์ใหม่ที่มี timestamp

---

## 🔧 Step-by-Step Commands (Run on Command Prompt / PowerShell)

### Step 1: Navigate to project
```cmd
cd D:\selfprint-v3-react
```

### Step 2: Stop Supabase
```cmd
supabase stop
```

### Step 3: Delete old migration files (that cause collision)
```cmd
REM Delete old numbered migrations that conflict:
del supabase\migrations\001_create_twins_table.sql
del supabase\migrations\002_create_awakening_essence_table.sql
del supabase\migrations\add_awakening_essence_table.sql

REM Optional: Delete database to reset
rmdir /s /q .supabase
```

### Step 4: Clean database completely
```cmd
REM Make sure .supabase folder is gone
cd .supabase
cd ..
```

### Step 5: Start Supabase again (will use timestamp-based migrations)
```cmd
supabase start
```

**Expected output:**
```
✓ Postgres database started
✓ Initialising schema...
✓ Applying migration 20260824_001_create_twins_table.sql
✓ Applying migration 20260824_002_create_awakening_essence_table.sql
✓ Applying migration 003_decision_log_autonomy_tracking.sql
✓ ...
✓ Local development server started successfully
```

### Step 6: Verify Supabase is running
```cmd
supabase status
```

**Expected:**
```
Supabase local development server is running.
```

### Step 7: Run tests
```cmd
npm test
```

**Should pass without `twins` table errors**

---

## ✅ IF YOU GET ERRORS

### Error: "relation twins does not exist"
```cmd
→ Migration didn't apply
→ Check: supabase status
→ If problem persists: 
   - supabase stop
   - rmdir /s /q .supabase
   - supabase start
```

### Error: "column expires_at does not exist"
```cmd
→ Old migration still running
→ Delete: supabase\migrations\add_awakening_essence_table.sql
→ Delete: supabase\migrations\002_*.sql (old one)
→ Reset: rmdir /s /q .supabase
→ Restart: supabase start
```

### Error: "Migration already exists"
```cmd
→ supabase db reset
→ supabase start
```

---

## 📋 CHECKLIST

- [ ] `supabase stop` (stop old instance)
- [ ] Delete old migration files:
  - `001_create_twins_table.sql`
  - `002_create_awakening_essence_table.sql`
  - `add_awakening_essence_table.sql`
- [ ] Delete `.supabase` folder (or keep for local data)
- [ ] `supabase start` (restart with new migrations)
- [ ] Wait for migrations to complete (look for ✓)
- [ ] `supabase status` (verify running)
- [ ] `npm test` (tests should pass)

---

## 📁 NEW MIGRATION FILES (ใช้ Timestamp)

```
supabase/migrations/
  ├── 20260824_001_create_twins_table.sql        ✅ NEW
  ├── 20260824_002_create_awakening_essence_table.sql  ✅ NEW
  ├── 003_decision_log_autonomy_tracking.sql     (existing)
  ├── 004_profiles_blueprints.sql                (existing)
  ├── 005_core_awakening_ceremony.sql            (existing)
  └── ... (others follow)
```

---

## 🚀 AFTER FIX: PHASE A STEPS 4-5

```bash
# STEP 4: Unit Tests
npm test
# Should now pass ✅

# STEP 5: E2E Tests
npm run dev         # Terminal 1
npm run test:e2e    # Terminal 2
# Should now pass ✅
```

---

**Run these commands now on your machine!**
