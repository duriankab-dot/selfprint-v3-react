# 🚀 STAGING SETUP — Step-by-Step Guide ภาษาไทย

**วันที่:** 30 ส.ค. 2566  
**เป้าหมาย:** Setup staging environment + seeded test users → Phase B tests pass  
**เวลาประมาณ:** 2-4 ชั่วโมง (first time)

---

## 🎯 เป้าหมายสุดท้าย

```
Production                Staging
├─ selfprint.one         ├─ staging.selfprint.one (หรือ dev)
├─ Real users            ├─ Test users (test@selfprint.one)
├─ Real DB              ├─ Test DB (isolated)
└─ No test data         └─ Seeded test data
```

---

## 📋 ขั้นตอน (ทีละขั้น)

### **STEP 1: ตรวจสอบว่า Database ใช้อะไร**

```bash
# ดูที่ code
cat D:\selfprint-v3-react\src\services\supabase-service.ts

# ค้นหา: SUPABASE_URL + SUPABASE_KEY
```

**ถ้ามี Supabase:**
- ✅ ใช้ Supabase staging environment
- ❌ ไม่ต้องสร้าง DB ใหม่

**ถ้ามี Firebase / อื่น:**
- ⏸️ ต้องปรับให้เหมาะ

---

### **STEP 2: สร้าง Staging Database (Supabase)**

#### **Option A: Clone Production DB (ปลอดภัย)**
```sql
-- ใน Supabase console
-- Settings → Database → Backups → Create backup

-- Create new project from backup:
-- "Create new DB from backup"
-- Select: backup_latest
-- Name: selfprint-staging
-- Region: same as production
```

**เวลา:** ~30 นาที

#### **Option B: Fresh DB (เร็ว)**
```bash
# สร้าง Supabase project ใหม่
# 1. supabase.com → New Project
# 2. Name: selfprint-staging
# 3. Copy URL + Key ใหม่
# 4. Run migrations จาก production
```

**เวลา:** ~15 นาที

---

### **STEP 3: Setup Environment Variables**

สร้างไฟล์ `.env.staging` ใน root:

```bash
# .env.staging

# Staging Database
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key

# Staging Frontend URL
BASE_URL=http://localhost:5173
# หรือ
# BASE_URL=https://staging.selfprint.one

# Test Users
TEST_USER_EMAIL=test@selfprint.one
TEST_USER_PASSWORD=Test@Selfprint123!SecurePass99

# Features
ENABLE_TEST_MODE=true
```

---

### **STEP 4: เขียน Seeding Script**

สร้างไฟล์ `scripts/seed-test-users.ts`:

```typescript
// scripts/seed-test-users.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for seeding
);

const TEST_USERS = [
  {
    email: 'test@selfprint.one',
    password: 'Test@Selfprint123!SecurePass99',
    metadata: { stage: 'active', onboardingComplete: true },
  },
  {
    email: 'test-voice@selfprint.one',
    password: 'Test@Selfprint123!SecurePass99',
    metadata: { stage: 'onboarding_voice', onboardingComplete: false },
  },
  {
    email: 'test-twin@selfprint.one',
    password: 'Test@Selfprint123!SecurePass99',
    metadata: { stage: 'active', twinCreated: true, onboardingComplete: true },
  },
];

async function seedTestUsers() {
  console.log('🌱 Seeding test users...');

  for (const user of TEST_USERS) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata,
      });

      if (authError) throw authError;

      console.log(`✅ Created user: ${user.email}`);

      // Create profile (if needed)
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: user.email,
            full_name: `Test User ${user.email.split('@')[0]}`,
            stage: user.metadata.stage,
            onboarding_complete: user.metadata.onboardingComplete,
            created_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;
        console.log(`✅ Created profile: ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Failed to seed ${user.email}:`, error);
    }
  }

  console.log('🌱 Seeding complete!');
}

seedTestUsers().catch(console.error);
```

---

### **STEP 5: Run Seeding Script**

```bash
# สั่ง compile + run
npx ts-node scripts/seed-test-users.ts
```

**ผลที่คาดว่า:**
```
🌱 Seeding test users...
✅ Created user: test@selfprint.one
✅ Created profile: test@selfprint.one
✅ Created user: test-voice@selfprint.one
✅ Created profile: test-voice@selfprint.one
✅ Created user: test-twin@selfprint.one
✅ Created profile: test-twin@selfprint.one
🌱 Seeding complete!
```

---

### **STEP 6: Deploy Staging Frontend**

#### **Option A: Cloudflare Pages (Recommended)**

```bash
# 1. Connect staging DB branch to Cloudflare Pages
# 2. Create new site: staging.selfprint.one
# 3. Link environment variables

# wrangler.toml (add staging config)
[env.staging]
name = "selfprint-staging"
routes = [
  { pattern = "staging.selfprint.one", zone_name = "selfprint.one" }
]

[[env.staging.env]]
vars = { SUPABASE_URL = "...", BASE_URL = "https://staging.selfprint.one" }
```

```bash
# Deploy
npx wrangler deploy --env staging
```

#### **Option B: Local Dev (ง่ายที่สุดสำหรับ testing)**

```bash
# Terminal 1: Start dev server
npm run dev

# URL: http://localhost:5173
# Automatically uses .env.staging if you set it
```

---

### **STEP 7: Verify Staging Setup**

```bash
# ✅ Test user login
curl -X POST https://your-staging.supabase.co/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@selfprint.one",
    "password": "Test@Selfprint123!SecurePass99"
  }'

# Expected: JWT token ได้มา ✅
```

---

### **STEP 8: Run Phase B Tests Against Staging**

```bash
# Set staging URL
$env:BASE_URL="http://localhost:5173"  # If local dev
# OR
$env:BASE_URL="https://staging.selfprint.one"  # If deployed

# Run Phase B tests
npm run test:e2e -- --project=chromium --grep "^(TWIN|DECISION|UPLOAD|WORLD)" --timeout 180000
```

**Expected Output:**
```
✅ TWIN-01 passed
✅ TWIN-02 passed
✅ TWIN-03 passed
✅ TWIN-04 passed
✅ TWIN-05 passed
✅ DECISION-01 passed
... (22 total)
```

---

## 🛠️ Quick Setup (Shortcuts)

### สำหรับ Supabase (if already using)

```bash
# 1. Create staging project clone
cd D:\selfprint-v3-react
npx supabase link --project-ref staging_project_id
npx supabase db pull

# 2. Create .env.staging
cat > .env.staging << EOF
SUPABASE_URL=https://your-staging.supabase.co
SUPABASE_ANON_KEY=your-key
BASE_URL=http://localhost:5173
TEST_USER_EMAIL=test@selfprint.one
TEST_USER_PASSWORD=Test@Selfprint123!SecurePass99
EOF

# 3. Seed users
npx ts-node scripts/seed-test-users.ts

# 4. Run dev
npm run dev

# 5. Test
npm run test:e2e -- --project=chromium --grep "TWIN"
```

**Total Time:** ~1 hour

---

## 📊 Staging Infrastructure Map

```
┌────────────────────────────────────┐
│   Staging Frontend                 │
│   http://localhost:5173            │
│   (OR staging.selfprint.one)       │
└──────────────┬─────────────────────┘
               │
               ↓
┌────────────────────────────────────┐
│   Staging Database (Supabase)      │
│   supabase-staging.supabase.co     │
│   - Test users seeded ✅            │
│   - Isolated from production       │
│   - Same schema as production      │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   Playwright Tests (Phase B)       │
│   - Read staging URL from env      │
│   - Authenticate as test@...one    │
│   - Create twin + decisions + ... │
│   - Verify all workflows           │
└────────────────────────────────────┘
```

---

## ⚠️ Troubleshooting

### ❌ "Seeding script fails"
```bash
# Check service role key is correct
echo $SUPABASE_SERVICE_ROLE_KEY
# Should NOT be empty

# If empty, get from Supabase console:
# Project Settings → API → Service Role Secret
```

### ❌ "Tests still timeout"
```bash
# Check network latency
ping staging.selfprint.one
# Should be < 100ms

# Check database connection
SUPABASE_URL=https://... npm run dev
# Should start without connection errors
```

### ❌ "Test user login fails"
```bash
# Verify user exists in Supabase
# Dashboard → Auth → Users
# Should see: test@selfprint.one ✅

# Verify password is correct
# Password: Test@Selfprint123!SecurePass99
```

### ❌ "Seed script hangs"
```bash
# Ctrl+C to stop
# Check if Supabase is online

# Try with verbose logging
DEBUG=* npx ts-node scripts/seed-test-users.ts
```

---

## ✅ Checklist

- [ ] Database setup (Supabase staging project created)
- [ ] Environment variables (.env.staging created)
- [ ] Seeding script written + tested
- [ ] Test users exist in database
- [ ] Frontend deployed to staging URL
- [ ] Can login as test@selfprint.one
- [ ] Phase B tests run and PASS

---

## 📞 Summary

**ต้องทำ 3 อย่างหลัก:**

1. **Database:** สร้าง staging DB (Supabase)
2. **Users:** Seed test users (script)
3. **Tests:** Run Phase B ✅

**ค่าใช้จ่าย:**
- Supabase: ~$25/month (staging project)
- Cloudflare: ฟรี (Pages)

**เวลา:** 2-4 ชั่วโมง (first time)

---

**Generated:** 30 Aug 2026  
**Status:** Ready to implement ✅
