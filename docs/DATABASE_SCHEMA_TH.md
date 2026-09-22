# สกีมาฐานข้อมูล

**ฐานข้อมูล:** Supabase PostgreSQL  
**เวอร์ชัน:** 1.0  
**สถานะ:** Production  
**อัปเดตครั้งสุดท้าย:** 2026-08-18

---

## 📊 ภาพรวมสกีมา

Selfprint ใช้ **Supabase PostgreSQL** เพื่อเก็บข้อมูลอย่างถาวร พร้อม **Row-Level Security (RLS)** เพื่อความปลอดภัยและอนาคตที่เป็นเอกชน

**จำนวนตาราง:** 15+  
**ฟีเจอร์หลัก:** ระบบ Twin, การติดตามการตัดสินใจ, บริบทโลก, การรับรองสิทธิผู้ใช้

---

## 🔐 ตารางการรับรองสิทธิ

### users
ตารางการรับรองสิทธิที่สร้างโดย Supabase (จัดการโดย Supabase)

```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_sign_in_at TIMESTAMP,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB
);
```

**วัตถุประสงค์:** การรับรองสิทธิผู้ใช้และการจัดการเซสชัน  
**การเข้าถึง:** ระบบ Supabase Auth  
**RLS:** จัดการโดย Supabase

---

## 👤 ตารางโปรไฟล์ผู้ใช้

### public.profiles
ข้อมูลโปรไฟล์ผู้ใช้

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
```

**คอลัมน์:**
- `id` — Foreign key to auth.users
- `email` — อีเมลผู้ใช้
- `name` — ชื่อที่แสดง
- `timezone` — โซนเวลาผู้ใช้สำหรับการแจ้งเตือน
- `preferences` — การตั้งค่า JSON (ธีม, ภาษา ฯลฯ)
- `created_at` — เวลาสร้างบัญชี
- `updated_at` — การอัปเดตโปรไฟล์ล่าสุด

**นโยบาย RLS:**
```sql
-- ผู้ใช้สามารถอ่าน/อัปเดตเฉพาะโปรไฟล์ของตนเอง
CREATE POLICY users_own_profile ON public.profiles
  USING (auth.uid() = id);
```

---

## 🧠 ตารางระบบ Twin

### public.twins
บันทึกเอนทิตี Twin

```sql
CREATE TABLE public.twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  essence TEXT,
  stage INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_twins_user_id ON public.twins(user_id);
```

**คอลัมน์:**
- `id` — UUID ของ Twin
- `user_id` — ID ผู้ใช้เจ้าของ
- `name` — ชื่อ Twin (เช่น "ตัวตนอนาคต", "Nova")
- `essence` — คำอธิบายบุคลิกภาพหลัก (จาก Core Awakening)
- `stage` — ขั้นของวิวัฒนาการ (1-5)
- `created_at` — เวลาสร้าง
- `updated_at` — การอัปเดตครั้งสุดท้าย

**นโยบาย RLS:**
```sql
-- ผู้ใช้สามารถเข้าถึง Twin ของตนเองได้เท่านั้น
CREATE POLICY users_own_twins ON public.twins
  USING (auth.uid() = user_id);
```

---

### public.twin_evolution_progress
การติดตามความก้าวหน้าของขั้นวิวัฒนาการ Twin

```sql
CREATE TABLE public.twin_evolution_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.twins(id),
  stage INT NOT NULL,
  progress FLOAT DEFAULT 0.0,
  milestones JSONB DEFAULT '{
    "conversations": 0,
    "decisions_logged": 0,
    "worlds_explored": 0,
    "insights_received": 0
  }',
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(twin_id, stage)
);

CREATE INDEX idx_twin_evolution_twin_id ON public.twin_evolution_progress(twin_id);
```

**คอลัมน์:**
- `twin_id` — อ้างอิงถึง Twin
- `stage` — หมายเลขขั้น (1-5)
- `progress` — เปอร์เซ็นต์ความสำเร็จ (0-100)
- `milestones` — JSON ติดตาม: การสนทนา, การตัดสินใจ, โลก, ข้อมูลเชิงลึก
- `unlocked_at` — เมื่อถึงขั้นนั้น
- `created_at` — สร้างบันทึก

---

## 💬 ตารางการสนทนา

### public.conversations
ประวัติแชทกับ Twin

```sql
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.twins(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  world_context UUID REFERENCES public.worlds(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_twin_id ON public.conversations(twin_id);
```

---

### public.messages
ข้อความแชทแต่ละรายการ

```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INT,
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
```

---

## 🎯 ตารางการตัดสินใจ

### public.decisions
การตัดสินใจและการติดตามของผู้ใช้

```sql
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  twin_id UUID NOT NULL REFERENCES public.twins(id),
  world_context UUID REFERENCES public.worlds(id),
  decision_text TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  made_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX idx_decisions_status ON public.decisions(status);
```

---

### public.decision_outcomes
ผลลัพธ์การติดตามการตัดสินใจ

```sql
CREATE TABLE public.decision_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  twin_id UUID NOT NULL REFERENCES public.twins(id),
  outcome TEXT NOT NULL CHECK (outcome IN ('positive', 'neutral', 'negative')),
  decision_text TEXT,
  follow_up_day INT,
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_decision_outcomes_decision_id ON public.decision_outcomes(decision_id);
```

**คอลัมน์:**
- `outcome` — positive | neutral | negative
- `follow_up_day` — วันจนกว่าจะมีการติดตาม (30, 90, 180, 365)
- `notes` — หมายเหตุของผู้ใช้เกี่ยวกับผลลัพธ์

---

## 🌍 ตารางบริบทโลก

### public.worlds
12 บริบทโลกสำหรับการติดตามความเชี่ยวชาญ

```sql
CREATE TABLE public.worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  expertise_level INT DEFAULT 1,
  total_conversations INT DEFAULT 0,
  total_decisions INT DEFAULT 0,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_worlds_user_id ON public.worlds(user_id);
```

**12 โลกมาตรฐาน:**
1. อาชีพและงาน
2. สุขภาพและสวัสดิการ
3. ความสัมพันธ์และครอบครัว
4. การเงินและเงิน
5. การเติบโตส่วนตัวและการเรียนรู้
6. ความสร้างสรรค์และการแสดงออก
7. การท่องเที่ยวและการผจญภัย
8. บ้านและการอาศัย
9. จิตวิญญาณและความหมาย
10. สังคมและชุมชน
11. ความบันเทิงและงานอดิเรก
12. มรดกและผลกระทบ

---

## 📢 ตารางการแจ้งเตือน

### public.notification_queue
การแจ้งเตือนตามกำหนดเวลา

```sql
CREATE TABLE public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  twin_id UUID REFERENCES public.twins(id),
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  status TEXT DEFAULT 'scheduled',
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notification_queue(user_id);
CREATE INDEX idx_notifications_scheduled_for ON public.notification_queue(scheduled_for);
```

**ประเภทการแจ้งเตือน:**
- `decision_reminder` — ติดตามการตัดสินใจ
- `world_update` — บริบทโลกใหม่พร้อมใช้
- `milestone_reached` — ความก้าวหน้าของขั้น Twin
- `insight_generated` — ข้อมูลเชิงลึกจากเครื่องยนต์ SICE
- `daily_brief` — สรุปเช้า

---

## 🔒 Row-Level Security (RLS)

**ตารางที่เปิดใช้งาน:** profiles, twins, conversations, messages, decisions, worlds, notification_queue

**นโยบาย RLS:**
1. **ผู้ใช้เป็นเจ้าของโปรไฟล์** — เข้าถึงได้เฉพาะแถวของตนเอง
2. **ผู้ใช้เป็นเจ้าของ Twins** — เข้าถึง Twins ที่พวกเขาเป็นเจ้าของ
3. **ผู้ใช้เป็นเจ้าของการตัดสินใจ** — เข้าถึงการตัดสินใจที่พวกเขาสร้าง
4. **ผู้ใช้เป็นเจ้าของโลก** — เข้าถึงโลกในบัญชีของพวกเขา

---

## 📊 ความสัมพันธ์ข้อมูล

```
users (Supabase Auth)
  ├── profiles (1:1)
  ├── twins (1:M)
  │   ├── conversations (1:M)
  │   │   └── messages (1:M)
  │   ├── decisions (1:M)
  │   │   └── decision_outcomes (1:M)
  │   └── twin_evolution_progress (1:M)
  ├── worlds (1:M)
  ├── notification_queue (1:M)
  └── pattern_analysis (1:M)
```

---

**หน่วยงาน:** แหล่งความจริงเดียวสำหรับโครงสร้างฐานข้อมูล  
**ดูแลโดย:** jb_DEV  
**อัปเดตครั้งสุดท้าย:** 2026-08-18
