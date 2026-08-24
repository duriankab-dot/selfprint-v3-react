# ⚡ MANUAL STEPS (Copy-Paste One by One)

**Don't paste all at once!** — Run each command separately

---

## Step 1: Stop Supabase
```cmd
supabase stop
```
**Wait for it to finish** ⏳

---

## Step 2: Delete old migration 1
```cmd
del "supabase\migrations\001_create_twins_table.sql"
```

---

## Step 3: Delete old migration 2
```cmd
del "supabase\migrations\002_create_awakening_essence_table.sql"
```

---

## Step 4: Delete old migration 3
```cmd
del "supabase\migrations\add_awakening_essence_table.sql"
```

---

## Step 5: Reset database
```cmd
rmdir /s /q .supabase
```
**Press Y if asked**

---

## Step 6: Start Supabase
```cmd
supabase start
```

**Wait for:**
```
✓ Postgres database started
✓ Initialising schema...
✓ Applying migration 20260824_001_create_twins_table.sql
✓ Applying migration 20260824_002_create_awakening_essence_table.sql
✓ Applying migration 003_decision_log_autonomy_tracking.sql
...
✓ Local development server started successfully
```

**This takes 2-3 minutes** ⏳

---

## Step 7: Check status
```cmd
supabase status
```

**Expected output:**
```
Supabase local development server is running.
```

---

## Step 8: Run unit tests
```cmd
npm test
```

**Should see:**
```
✓ All tests passed
```

---

## ✅ If all pass:

**STEP 4 COMPLETE!** 🎉

---

## ❌ If error "twins does not exist":

```cmd
supabase stop
rmdir /s /q .supabase
supabase start
```

Then wait for it to finish and try `npm test` again.

---

## 📝 Or Run the Batch File

Instead of manual steps, you can run:
```cmd
FIX_MIGRATIONS_RUN_THIS.bat
```

This automates all the steps above.

