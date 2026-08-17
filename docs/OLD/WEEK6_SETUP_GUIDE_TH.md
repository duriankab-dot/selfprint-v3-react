# 🚀 WEEK 6: Nova AI Setup Guide (ภาษาไทย)

**วัตถุประสงค์:** ตั้งค่า Nova AI บน Vercel + Supabase + Claude API  
**เวลา:** 2-3 ชั่วโมง (มือใหม่)  
**ยากระดับ:** ⭐⭐⭐ (ปานกลาง — ต้องจาก 3 บริการ)

---

## 🎯 **ขั้นตอนรวม**

```
1. สร้าง Firebase Project (สำหรับ login/logout)
2. สร้าง Supabase Project (ฐานข้อมูล)
3. สร้าง Claude API Key (Anthropic)
4. ใส่ API Keys ใน .env.local
5. ทดสอบ Vercel Function
6. เชื่อม Frontend + Backend
```

---

## 📋 **Phase 1: Firebase Setup (30 นาที)**

### ทำไมต้อง Firebase?
- ให้ผู้ใช้ login/logout
- เก็บ user ID เพื่อเชื่อมกับ Supabase

### Step 1.1: สร้าง Firebase Project
```
1. เปิด https://console.firebase.google.com/
2. Click "Add Project"
3. ตั้งชื่อ: "SelfPrint-V3-Dev"
4. ยอมรับ Terms → Create Project
5. รอ 2-3 นาที
```

### Step 1.2: ตั้งค่า Firestore
```
1. ด้านซ้าย: Build → Firestore Database
2. Click "Create Database"
3. ที่ Location: เลือก "asia-southeast1" (ใกล้ไทย)
4. Mode: เลือก "Start in test mode"
5. Create → เสร็จแล้ว
```

### Step 1.3: ตั้งค่า Authentication
```
1. ด้านซ้าย: Build → Authentication
2. Click "Get Started"
3. Enable → Email/Password
4. ตั้ง Authorized domains (ลอยไปตอน production)
```

### Step 1.4: Copy API Keys
```
1. ด้านบนขวา: Settings icon ⚙️ → Project settings
2. เลื่อนลง: "Your web app"
3. Copy ค่าทั้งหมด:
   - apiKey → VITE_FIREBASE_API_KEY
   - authDomain → VITE_FIREBASE_AUTH_DOMAIN
   - projectId → VITE_FIREBASE_PROJECT_ID
   - storageBucket → VITE_FIREBASE_STORAGE_BUCKET
   - messagingSenderId → VITE_FIREBASE_MESSAGING_SENDER_ID
   - appId → VITE_FIREBASE_APP_ID
```

### Step 1.5: ใส่ใน .env.local
```bash
# Copy-Paste จาก Firebase
VITE_FIREBASE_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=selfprint-dev.firebaseapp.com
# ... (ทั้งหมด 6 ค่า)
```

---

## 📊 **Phase 2: Supabase Setup (30 นาที)**

### ทำไมต้อง Supabase?
- เก็บ chat messages
- เก็บ user insights
- เก็บ decision log

### Step 2.1: สร้าง Supabase Project
```
1. เปิด https://app.supabase.com/
2. Click "New Project"
3. ตั้งชื่อ: "selfprint-dev"
4. Database Password: ใส่รหัสแรง (เก็บไว้!)
5. Region: "Southeast Asia (Singapore)" ← ใกล้ไทย
6. Create new project → รอ 2-3 นาที
```

### Step 2.2: Copy API Keys
```
1. ด้านขวา: Settings ⚙️ → API
2. Copy:
   - "Project URL" → VITE_SUPABASE_URL
   - "anon public" key → VITE_SUPABASE_ANON_KEY
   - "service_role" key → SUPABASE_SERVICE_ROLE_KEY (เอา backend)
```

### Step 2.3: สร้าง Tables (ฐานข้อมูล)
```
1. ด้านซ้าย: SQL Editor
2. Click "New Query"
3. Copy-paste นี้:
```

```sql
-- Table 1: Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  autonomy_level INT DEFAULT 50,
  current_hub TEXT DEFAULT 'identity',
  created_at TIMESTAMP DEFAULT now()
);

-- Table 2: Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  hub TEXT NOT NULL,
  mood TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Table 3: Insights
CREATE TABLE user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  hub TEXT,
  insight_text TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Table 4: Decision Log
CREATE TABLE decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  decision_text TEXT,
  recorded_at TIMESTAMP DEFAULT now()
);
```

```
4. Click "Run" → ต้อง "Success" ถึงจบ
5. ด้านซ้าย: Table Editor → ดูตาราง (4 ตาราง)
```

### Step 2.4: ใส่ใน .env.local
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsxxxxxxxxxxxx
```

---

## 🤖 **Phase 3: Claude API Setup (15 นาที)**

### ทำไมต้อง Claude?
- Nova AI ใช้ Claude เพื่อตอบคำถาม

### Step 3.1: สร้าง Anthropic Account
```
1. เปิด https://console.anthropic.com/
2. Click "Sign up"
3. ใส่ email, password
4. ยืนยัน email
```

### Step 3.2: สร้าง API Key
```
1. ซ้าย: API Keys
2. Click "Create Key"
3. ตั้งชื่อ: "selfprint-dev"
4. Copy ตัวอักษรยาวๆ (เริ่มด้วย "sk-ant-")
```

### Step 3.3: ใส่ใน .env.local
```bash
ANTHROPIC_API_KEY=sk-ant-v7-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ **Phase 4: ใส่ API Keys ใน .env.local**

ตัวอย่าง `.env.local` เสร็จสิ้น:

```bash
# Firebase
VITE_FIREBASE_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=selfprint-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=selfprint-dev
VITE_FIREBASE_STORAGE_BUCKET=selfprint-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef1234567890

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsxxxxxxxxxxxx

# Backend API
VITE_API_BASE_URL=http://localhost:3001

# Claude API
ANTHROPIC_API_KEY=sk-ant-v7-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase (Backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsxxxxxxxxxxxx

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Environment
NODE_ENV=development
```

---

## 🧪 **Phase 5: ทดสอบด้วย cURL**

ตรวจสอบว่า /api/nova รับ request ได้ไหม:

### Step 5.1: ตัวอย่างทดสอบ

```bash
# เปิด Terminal/PowerShell ใน VS Code
# คัดลอก-วาง คำสั่งนี้:

curl -X POST http://localhost:3001/api/nova \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "สวัสดี Nova ฉันรู้สึกเครียด"
      }
    ],
    "hub": "identity",
    "mood": "stressed",
    "autonomy": 50,
    "userProfile": {
      "name": "ผู้ใช้"
    }
  }'
```

### Step 5.2: ควรเห็น Response:

```json
{
  "content": "สวัสดี ผู้ใช้! ฉันคือ Nova The Mirror...",
  "conversationId": "conv-1722699600000",
  "tokensUsed": 45,
  "timestamp": "2026-08-04T10:00:00.000Z"
}
```

**ถ้าเห็นแบบนี้ = ✅ สำเร็จ!**

---

## ⚠️ **ปัญหาธรรมชาติ**

### Error: "ANTHROPIC_API_KEY is undefined"
**เหตุ:** .env.local ไม่มีค่า  
**แก้:** ตรวจสอบ ANTHROPIC_API_KEY ใน .env.local

### Error: "SUPABASE_URL is undefined"
**เหตุ:** Supabase URL หาย  
**แก้:** Copy อีกครั้งจาก Supabase Dashboard

### Error: "Unauthorized"
**เหตุ:** API Key ผิด  
**แก้:** ใช้ service_role key (ไม่ใช่ anon key)

---

## 📝 **Checklist ก่อนไป Phase 2**

- [ ] Firebase Project สร้างเสร็จ + API Keys copy ได้
- [ ] Supabase Project สร้างเสร็จ + Tables สร้างแล้ว
- [ ] Claude API Key copy ได้
- [ ] .env.local เต็มไปด้วยค่าทั้งหมด 10 ค่า
- [ ] cURL test ส่ง response มาด้วย

---

## 🎉 **ข้างหน้า: Phase 2 (Frontend Components)**

เมื่อ setup เสร็จ → สร้าง:
- `HubSwitcher.tsx` (เลือก hub)
- `EmotionSelector.tsx` (เลือก mood)
- `ChatWindow.tsx` update (รับ stream)

ตั้งตรงไป! 🚀
