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

## หมายเหตุ — deploy แล้วรีเทสต์ ยัง 504 เหมือนเดิม
Deploy commit `6008cad` (dedupe verifyUser + region hnd1) สำเร็จ ยืนยันเป็น
Production จริง แต่รีเทสต์แล้ว 504 เกิดเหมือนเดิมทุกจุด — แปลว่า 2 จุดนี้
ไม่ใช่สาเหตุจริง (ยังคุ้มเก็บไว้เป็น latency optimization) ต้องขุดต่อด้วย
Vercel runtime logs จริง

## ROOT CAUSE จริง (พบจาก Vercel Runtime Logs, ไม่ใช่เดา) — API504-002

Log จริงตอน 504 เกิด:
```
Error in unified handler: TypeError: request.headers.get is not a function
    at handler (/vercel/path0/api/unified-handler.ts:30:40)
WARN: default export returned a `Response`.
├▶ The default-export signature is `(req, res) => void` — returns are
│  ignored. You likely meant the Web `fetch`-style API.
Vercel Runtime Timeout Error: Task timed out after 10 seconds
```

**สาเหตุจริง**: ไฟล์มี `export default handler;` ควบคู่กับ
`export const GET = handler;` และ `export const POST = handler;` —
รูปแบบ named-export ตาม HTTP method (`GET`/`POST`) นี้คือ convention ของ
**Next.js App Router route handlers** ไม่ใช่ของ Vite/Vercel Function ธรรมดา
ตอน build เองก็มี warning เตือนอยู่แล้ว:
"WARNING! When using Next.js, it is recommended to place JavaScript
Functions inside of the `pages/api` ... directory instead of `api`"

ผลคือ Vercel เข้าใจไฟล์นี้ผิด แล้ว invoke ด้วย signature แบบเก่า
`(req, res)` แทนที่จะเป็น Web Fetch API `(request: Request) => Response`
ที่โค้ดเขียนไว้จริง — `request.headers.get()` เลย throw ทันทีตั้งแต่บรรทัดแรกๆ
ของ `handler()` (บรรทัด 30) ก่อนจะได้ตอบอะไรกลับไปเลย เพราะ signature
`(req,res)` ไม่รองรับการ `return Response.json(...)` (ค่า return ถูกทิ้ง)
ต้องเรียก `res.end()` ถึงจะตอบกลับได้ — โค้ดนี้ไม่เคยเรียก `res` เลย
ทุก request เลยค้างจน Vercel ตัดที่ 10 วินาที = **504 ที่เห็นทุกจุด**
(`/api/profile`, `/api/blueprint`, `/api/stripe/subscription`)

`GET`/`POST` สอง export นี้เป็น dead code จริงๆ — grep ทั้งโปรเจกต์แล้ว
ไม่มีที่ไหน import มาใช้ (Vercel function ถูกเรียกผ่าน file convention
ไม่ใช่ import ตรงๆ)

**แก้ (ครั้งที่ 1 — ผิด)**: ลบ `export const GET = handler;` กับ
`export const POST = handler;` ออก เหลือแค่ `export default handler;`
เดาว่า Next.js-style export ทำให้ Vercel เข้าใจผิด — **deploy แล้วรีเทสต์
ยัง error เดิมทุกตัวอักษรเป๊ะ** (เห็นจาก log commit `99adf15` ที่ deploy
จริงหลังแก้) พิสูจน์ว่าเดาผิด: `export const GET = handler` (const alias
ไปยัง identifier) กับ `export default handler` (ก็ identifier เดียวกัน)
ไม่ต่างกันเลยในสายตา Vercel build analysis — ไม่มีอะไรเปลี่ยนจริง

**สาเหตุจริงกว่านั้น (ครั้งที่ 2 — ตาม log ของ Vercel เองบอกตรงๆ)**:
runtime warning บอกวิธีแก้ไว้ชัดเจนอยู่แล้วว่า:
```
Fix: export a `fetch` function or a named HTTP method:
        export function GET(request) { return new Response('ok') }
```
คือต้องเป็น **function declaration จริงตรง export** ไม่ใช่ const ที่ไป
alias identifier ของฟังก์ชันที่ประกาศไว้ที่อื่น — Vercel build-time
analysis (`@vercel/node`) ต้องเห็น shape ของฟังก์ชันตรงจุด export ถึงจะ
สร้าง Web Fetch API adapter ให้ถูก ถ้าเป็นแค่ identifier reference มันไม่
รู้จัก เลย fallback ไปใช้ legacy `(req,res)` adapter เหมือนเดิม

**แก้จริง**: เปลี่ยนจาก `export const GET/POST = handler;` เป็น
function declaration จริง:
```ts
export async function GET(request: Request): Promise<Response> {
  return handler(request);
}
export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
```
(grep ยืนยันทั้งไฟล์ใช้แค่ GET/POST เท่านั้น ไม่มี PUT/DELETE/PATCH)

**ผล**: deploy แล้วรีเทสต์จริง — 504 หายจริง เห็นจาก Vercel Logs:
`GET /api/stripe/subscription` ตอบ 200, `POST /api/profile`/`POST /api/blueprint`
ตอบ 400 (ไม่ใช่ 504) → **504 root cause ปิดเคสแล้ว**

## API504-004 — ตามมาติดๆ: 400 Bad Request บน /api/profile, /api/blueprint

หลัง 504 หาย เจอปัญหาใหม่ (เล็กกว่ามาก): `POST /api/profile` และ
`POST /api/blueprint` ตอบ 400 ทุกครั้งที่ `PendingOnboardingSaver.tsx`
ยิงหลัง login ผ่าน magic link (เช็ค Network tab response body จริงแล้ว):

```json
{"success":false,"error":"module and action parameters required"}
```

**สาเหตุ**: `vercel.json` rewrite `/api/profile/:action*` →
`...&module=profile&action=:action*` — ตอน frontend เรียก `/api/profile`
เฉยๆ (ไม่มี segment ต่อท้าย, ดู `PendingOnboardingSaver.tsx`:
`fetch('/api/profile', ...)`) `:action*` แทนค่าเป็น string ว่าง `action=`
→ `url.searchParams.get('action')` คืนค่า `''` (falsy) → ชนเงื่อนไข
`if (!module || !action)` ที่ handler() บนสุดของไฟล์ ทั้งที่
`handleProfile`/`handleBlueprint` ไม่เคยใช้ค่า `action` ตัดสินใจอะไรเลย
(branch แค่จาก `request.method`)

**แก้**: default `action` เป็น `'default'` เมื่อไม่มีค่า (ตรงกับ convention
ที่ `/api/share` ใช้อยู่แล้ว: `...&module=share&action=default`) เอา
`action` ออกจากเงื่อนไข required เหลือแค่ `module` — เช็คแล้วไม่มี module
ไหนใน switch มี `case 'default'` ที่จะชนกัน

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
