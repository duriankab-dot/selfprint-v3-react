# คู่มือการปรับใช้

**สภาพแวดล้อมเป้าหมาย:** Vercel (Production)  
**เวอร์ชัน:** 1.0  
**สถานะ:** Production Ready  
**อัปเดตครั้งสุดท้าย:** 2026-08-18

---

## 🚀 เริ่มต้นด่วน

**ข้อกำหนดเบื้องต้น:**
- Node.js 24+ ติดตั้ง
- Git (สำหรับการควบคุมเวอร์ชัน)
- บัญชี Vercel (เชื่อมต่อกับ GitHub)
- โปรเจกต์ Supabase (ข้อมูลประจำตัวฐานข้อมูล)

**ระยะเวลา:** 5 นาที

```bash
# 1. ตรวจสอบตัวแปรสภาพแวดล้อมในตั้งค่า Vercel
vercel env list

# 2. ปรับใช้ในการผลิต
vercel --prod

# 3. ตรวจสอบการปรับใช้
curl https://www.selfprint.one

# 4. ตรวจสอบบันทึก
vercel logs --tail
```

---

## 🔑 ENVIRONMENT VARIABLES

**ตัวแปรที่จำเป็น (ตั้งค่าใน Vercel Dashboard):**

| ตัวแปร | ค่า | ตัวอย่าง |
|--------|-----|---------|
| `VITE_SUPABASE_URL` | URL โปรเจกต์ Supabase | `https://orxteuufqeohptpbwkqx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | คีย์ Supabase anon | `sb_publishable_q5nNmAvkitf6QrYyl6O6BA_VJQaDoqH` |

**วิธีรับค่า:**

1. ไปที่ [Supabase Dashboard](https://supabase.com)
2. เลือกโปรเจกต์ของคุณ
3. คลิก **Settings** → **API**
4. คัดลอก:
   - `Project URL` → `VITE_SUPABASE_URL`
   - คีย์ `anon` → `VITE_SUPABASE_ANON_KEY`

**ตั้งค่าใน Vercel:**

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. เพิ่มตัวแปรทั้งสอง
3. ตั้งขอบเขตเป็น **Production**
4. คลิก **Save**

---

## 📦 การตั้งค่าการสร้าง

**คำสั่งสร้าง:**
```bash
npm install --legacy-peer-deps && npm run build
```

**คำสั่ง Dev:**
```bash
npm run dev
```

**คำสั่งติดตั้ง:**
```bash
npm install --legacy-peer-deps
```

**Framework:** Vite (React 19)  
**ไดเรกทอรี่ผลลัพธ์:** `dist/`  
**เวอร์ชัน Node:** 24.x

---

## 🔧 การตั้งค่า Vercel (vercel.json)

**ไฟล์:** `vercel.json`

```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "vite",
  "functions": {
    "api/unified-handler.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "rewrites": [
    {
      "source": "/api/notifications/:action*",
      "destination": "/api/unified-handler?module=notifications&action=:action*"
    },
    {
      "source": "/api/stripe/:action*",
      "destination": "/api/unified-handler?module=stripe&action=:action*"
    }
  ]
}
```

**การตั้งค่าหลัก:**
- `maxDuration: 10` — ท่อ 10 วินาที
- `memory: 1024` — 1GB จัดสรรหน่วยความจำ

---

## 📥 ขั้นตอนการปรับใช้ทีละขั้น

### ขั้นตอนที่ 1: เตรียมโค้ด
```bash
# ตรวจสอบสถานะ
git status
# ควรแสดง "working tree clean"

# ดึงเวอร์ชันล่าสุด
git pull origin master
```

### ขั้นตอนที่ 2: ตรวจสอบเฉพาะที่
```bash
# ติดตั้งแพคเกจ
npm install --legacy-peer-deps

# สร้างเฉพาะที่
npm run build

# ควรเสร็จโดยไม่มีข้อผิดพลาด
# ผลลัพธ์: สร้างโฟลเดอร์ dist/
```

### ขั้นตอนที่ 3: ตรวจสอบตัวแปรสภาพแวดล้อม
```bash
# ตรวจสอบตัวแปร Vercel env
vercel env list

# ควรแสดง:
# - VITE_SUPABASE_URL ✓
# - VITE_SUPABASE_ANON_KEY ✓
```

### ขั้นตอนที่ 4: ปรับใช้
```bash
# ปรับใช้ในการผลิต
vercel --prod

# ผลลัพธ์จะแสดง:
# Production: https://www.selfprint.one
# Inspect: https://vercel.com/...
```

### ขั้นตอนที่ 5: ตรวจสอบการปรับใช้
```bash
# ตรวจสอบสถานะ
vercel deployments

# ควรแสดง "READY" สำหรับล่าสุด

# ทดสอบ API
curl https://www.selfprint.one/api/unified-handler?module=stripe&action=subscription

# ควรส่งคืน 200 OK
```

### ขั้นตอนที่ 6: ตรวจสอบบันทึก
```bash
# ดูบันทึก production
vercel logs --tail

# ดูข้อผิดพลาด (ควรสะอาด)
```

---

## ✅ รายการตรวจสอบก่อนการปรับใช้

- [ ] `npm run build` สำเร็จเฉพาะที่ (ไม่มีข้อผิดพลาด)
- [ ] `npm run lint` ผ่าน (ไม่มีคำเตือน)
- [ ] ทดสอบทั้งหมดผ่าน: `npm test`
- [ ] TypeScript strict mode: `npx tsc --noEmit`
- [ ] ตั้งค่าตัวแปรสภาพแวดล้อมใน Vercel (ตัวแปรทั้งสองอยู่)
- [ ] ไม่มีข้อมูลลับในโค้ด (ตรวจสอบ `.env.local` ไม่ยืนยัน)
- [ ] สาขา Git สะอาด: `git status`
- [ ] ดึงโค้ดล่าสุด: `git pull origin master`

---

## 🚨 ขั้นตอนการยึดคืน

**หากการปรับใช้ล้มเหลว:**

```bash
# ย้อนกลับไปยังคอมมิตก่อนหน้า
git revert HEAD
git push origin master

# Vercel จะปรับใช้คอมมิตก่อนหน้าโดยอัตโนมัติ
```

---

## 📊 การตรวจสอบการปรับใช้

### เมตริกหลัก

**ประสิทธิภาพ:**
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

**ความน่าเชื่อถือ:**
- เวลา uptime: > 99.9%
- อัตราข้อผิดพลาด: < 0.1%
- เวลาตอบสนอง API: < 500ms

---

## 📚 อ้างอิง

**เอกสารอย่างเป็นทางการ:**
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Supabase Setup](https://supabase.com/docs)

**ไฟล์การตั้งค่า:**
- `vercel.json` — การตั้งค่า Vercel
- `tsconfig.json` — การตั้งค่า TypeScript
- `.env.example` — เทมเพลตตัวแปร

---

**หน่วยงาน:** แหล่งความจริงเดียวสำหรับขั้นตอนการปรับใช้  
**ดูแลโดย:** jb_DEV  
**อัปเดตครั้งสุดท้าย:** 2026-08-18
