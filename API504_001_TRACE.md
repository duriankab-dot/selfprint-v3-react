# API504-001 — ลด latency ใน api/unified-handler.ts

## บริบท
ตอบคำถาม "นายเช็คในโค๊ดให้อีกทีมันตรงกันหมดไหม" ต่อจาก 504 ที่เจอบน
`/api/profile`, `/api/blueprint`, `/api/stripe/subscription`

ผลเช็ค:
- Supabase ไม่ได้ pause (dashboard แสดง Healthy + compute metrics ยังทำงาน)
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` มีอยู่จริงใน Vercel env vars
  (Production + Preview) → ตัดสมมติฐาน env var หายทิ้งได้
- โค้ด auth (`verify-user.ts`) fail แบบเร็ว (คืน `null`/500 ทันที) ไม่มี
  จุด hang — จึงไม่อธิบาย 504 (timeout) ได้ตรงๆ

## จุดที่เจอและแก้

**1. `verifyUser()` ถูกเรียกซ้ำ 2 รอบต่อ 1 request**
`handler()` เรียก `verifyUser(authHeader)` ที่บรรทัดบนสุดของไฟล์
(ใช้แค่สำหรับ rate-limit key) แล้วทิ้งผลลัพธ์ไป — จากนั้น
`handleProfile`/`handleBlueprint`/`handleStripe` เรียก `verifyUser()`
ซ้ำอีกรอบ ทำให้ทุก request ที่ authenticated ยิงไป Supabase Auth API
สองรอบโดยไม่จำเป็น

แก้: ส่ง `user` ที่ verify แล้วจาก `handler()` ลงไปเป็น parameter ของ
`handleProfile(request, action, user)`, `handleBlueprint(request, action, user)`,
`handleStripe(request, action, user)` แทนการ verify ซ้ำ — เอา
`verifyUser()` call ที่ซ้ำออกทั้ง 5 จุด (3 จุดใน handleStripe,
1 จุดใน handleProfile, 1 จุดใน handleBlueprint)

ไม่แตะ `handleShare`'s POST (บรรทัด 637) — ไม่ใช่ endpoint ที่รายงานว่าพัง
เก็บไว้นอก scope ตามเดิม

**2. Vercel function ไม่ได้ตั้ง region — รันที่ US (default) ในขณะที่
Supabase อยู่ Tokyo (Northeast Asia)**

แก้: เพิ่ม `"regions": ["hnd1"]` ใน `vercel.json` เฉพาะ
`api/unified-handler.ts` (Hobby plan รองรับ 1 region ต่อ deployment —
เช็คกับ Vercel docs แล้ว) ให้ function รันใกล้ Supabase มากขึ้น

## หมายเหตุ — นี่คือการลด latency ที่สะสม ไม่ใช่ fix ที่ยืนยัน 100%
โค้ดทุกจุดที่อ่านมา fail แบบเร็ว ไม่มี infinite loop/deadlock ให้เจอ
เพราะงั้น 504 ที่เกิดน่าจะมาจาก latency สะสม (auth call ซ้ำ + ข้าม
continent + cold start) ไม่ใช่ bug ที่ทำให้ค้างตรงๆ การแก้ 2 จุดนี้
ลด latency ได้จริงแต่ยังต้อง**รีเทสต์หลัง deploy**เพื่อยืนยันว่า 504
หายจริงหรือลดลงแค่ไหน — ถ้ายังเจอ 504 อยู่ ต้องดู Vercel function logs
ตรงเวลาที่ error เกิดเพื่อหาสาเหตุจริงต่อ

## Verification
1. `npm run build` (`tsc -b && vite build`) — ผ่าน, 0 error
2. `npx oxlint api/unified-handler.ts` — 0 warnings, 0 errors
3. อ่าน `handleProfile`/`handleBlueprint` เต็มไฟล์ก่อนแก้ ยืนยันว่า
   error path ทุกจุด (`!supabaseAdmin`, `!user`, DB error) return
   response ทันที ไม่มี await ที่ไม่มี timeout
4. grep ยืนยันเหลือ `verifyUser(` แค่ 2 จุดในไฟล์ (top-level `handler()`
   ที่เป็น source of truth ใหม่ + `handleShare` ที่ตั้งใจไม่แตะ)

## ยังไม่แก้ (นอก scope, พบระหว่างตรวจ)
- `NEXT_PUBLIC_SUPABASE_URL` ใน `src/api/core-awakening.ts` — ยังไม่ได้
  ตรวจว่าไฟล์นี้ live/ถูกเรียกจริงหรือ dead code
- `handleShare`'s POST ก็มี `verifyUser()` เดี่ยวๆ ไม่ซ้ำกับ top-level —
  ปล่อยไว้เพราะไม่ใช่จุดที่รายงานว่าพัง
