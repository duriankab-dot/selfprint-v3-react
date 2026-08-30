# SELFPRINT V3 — เอกสารส่งต่อสถานะงาน (Honest Status Handoff)

**วันที่:** 30 สิงหาคม 2026
**Commit ล่าสุดที่ push แล้ว:** `ca2d1e4`
**หลักการของเอกสารนี้:** รายงานเฉพาะสิ่งที่ยืนยันแล้วจริง แยกให้ชัดว่าอะไร "เสร็จ", อะไร "ยังไม่ยืนยัน", อะไร "ยังไม่แตะเลย" — ไม่มีการเดาหรืออ้างว่าทำสิ่งที่ยังไม่ได้ทำ

---

## 1. งานที่เสร็จและยืนยันแล้ว (Verified Complete)

| งาน | รายละเอียด | ยืนยันด้วย |
|---|---|---|
| CF Pages migration | ย้าย API layer จาก Vercel serverless → Cloudflare Pages Functions | ดีพอยผ่าน, ทดสอบ production จริง |
| `/api/twin` | เปลี่ยน `TWIN_MODEL_ID` เป็น `claude-haiku-4-5-20251001` (โมเดล `claude-sonnet-5` reject `temperature` ที่ไม่ใช่ default) | ทดสอบแล้วได้ `200 {"content":"pong"}` |
| `/api/nova` | ใช้งานได้ปกติตลอด | ทดสอบซ้ำหลายรอบ |
| Schema mismatch `share/profile/blueprint` | เพิ่ม `.schema('selfprint')` ให้ query 9 จุดใน `unified-handler.ts` (ตารางจริงอยู่ schema `selfprint` ไม่ใช่ `public`) | โค้ด confirm ตาราง + exposed schema ถูกแล้ว |
| TwinChat หน้าขาว | สาเหตุคือ Service Worker cache เก่าค้าง หลัง deploy ถี่ๆ — แก้ด้วย Unregister SW + Clear site data (ไม่ต้องแก้โค้ด) | ผู้ใช้ทดสอบแล้วเห็นข้อความแอปจริงแทนหน้าขาว |
| Blog list ไม่มีปุ่มกลับ | เพิ่มปุ่ม "← กลับหน้าหลัก" ใน `BlogListPage.tsx` | คอมมิทแล้ว |
| Blog article render โค้ดดิบ | root cause: เช็ค Content-Type ไม่แม่น (CF Pages SPA fallback คืน `index.html` แบบไม่มี header ชัด) — เปลี่ยนไปเช็ค shape เนื้อหา (`---` frontmatter) แทน | คอมมิทแล้ว, ตรวจ path resolution ถูกต้อง |
| Migration schema พื้นฐาน (Twin/SICE) | `supabase-schema.sql`, `migrations/003_twin_world_expertise.sql`, `migrations/004_user_lifecycle.sql` — ทำเป็น idempotent (`DROP POLICY IF EXISTS` ก่อน `CREATE POLICY`) | ผู้ใช้รันแล้วขึ้น "Success" |
| `world_preferences`/`world_stats` | ทำ idempotent แล้วรันผ่าน | ผู้ใช้ยืนยัน "Success. No rows returned" |
| Soundscape 404 (บางส่วน) | เพิ่ม mapping ให้ 18 id ที่ขาดใน `useSoundscapeAudioLoader.ts` | คอมมิทแล้ว — **แต่ยังไม่ยืนยันว่าเสียงเล่นได้จริง (ดูข้อ 2.3)** |
| **3 จุดล่าสุด (commit `ca2d1e4`)** | (1) `NovaChat.tsx` redirect ไป `/chat/twin` แทนหน้า dead-end (2) `Dashboard.tsx` ไม่โชว์ทวินหลอนถ้า `twin` ยังเป็น null (3) `WorldEnvironment.tsx` เอารูปข้าวหลามตัดกลางจอโลก Self ออก ไม่ให้ซ้อนกับทวินจริง | `npx tsc -b --force` ผ่านสะอาด, ผู้ใช้ push สำเร็จ |

---

## 2. งานที่ค้าง — ยังไม่ยืนยัน หรือยังไม่แก้

### 2.1 Debug patch ที่ยังไม่ revert (มีผลจริงในโปรดักชัน)

`api/unified-handler.ts` มี 2 จุดที่ใส่ debug ชั่วคราวไว้แล้วยังไม่เอาออก:

- `TEMP-DEBUG-SHARE-001` — `handleShare` ส่ง `debug: {message, code, details, hint}` กลับไปกับ error response
- `TEMP-DEBUG-PROFILE-001` — `handleProfile`/`handleBlueprint` ทำแบบเดียวกัน

**ยังไม่เคยเห็น response body จริงของ debug นี้เลย** เพราะความสนใจย้ายไปบั๊กอื่นก่อน — ไม่รู้ว่า `/api/share` ที่เคย error "Database error" ยังพังอยู่ไหมหลัง migration ชุดใหญ่ผ่านไปแล้ว ต้อง**ทดสอบซ้ำแล้วดู debug field จริง** ก่อนตัดสินใจว่าจะ revert ได้หรือยัง

### 2.2 Database — ยังไม่ยืนยันสถานะ

- `migrations/001_feedback_tables.sql`, `migrations/002_security_tables.sql` — เอ่ยถึงในลำดับที่ต้องรัน แต่**ไม่เคยได้รับการยืนยันชัดเจนว่ารันผ่านหรือไม่**
- `personal_memory`, `decision_log` ยัง 401 อยู่ในคอนโซล — **ยังไม่ได้สืบเลย** (ตั้งใจ defer ไว้ก่อนตอนนั้นเพราะมีบั๊กเร่งด่วนกว่า) ตารางเหล่านี้มีอยู่จริงใน `public` schema (จาก migration เก่า) ดังนั้นไม่ใช่ปัญหา schema แบบเดียวกับ share/profile — น่าจะเป็นเรื่อง auth/RLS แยกต่างหาก ต้องเปิดสืบใหม่

### 2.3 Soundscape เสียงบรรยากาศ — ยังไม่จบ

เพิ่ม mapping ให้ id ที่ขาดไปแล้ว แต่**ไฟล์ที่อ้างว่า "ใช้ได้แน่ๆ" อย่าง `night-ambient.mp3` ก็ยัง 404 จาก Cloudinary** แปลว่าปัญหาอาจไม่ใช่แค่ mapping แต่ไฟล์เสียงอาจไม่มีอยู่จริงใน Cloudinary เลย — ผมไม่มีสิทธิ์เข้า Cloudinary Media Library ต้องให้คุณเปิดเช็คเองว่าโฟลเดอร์ `soundscapes/` มีไฟล์อะไรอยู่จริงบ้าง

### 2.4 สถาปัตยกรรมใหญ่ — จาก audit `edit 30 aug.txt` (P0-A ถึง P0-E)

นี่คือก้อนใหญ่ที่สุดที่ยังไม่แตะเลย เป็นรายงานตรวจโค้ดจริง (ไม่ใช่เดา) บนคอมมิท `7510ab6` พบว่า:

**P0-D/P0-E (ร้ายแรงสุด):**
`selfprintChat()` ที่ TwinChat/Nova เรียกจริงยิงไปที่ `/api/chat` — **route นี้ไม่มีอยู่จริงในโค้ดเลย** ทั้งฝั่ง Vercel เดิมและ Cloudflare ปัจจุบัน มีแค่ `/api/nova` กับ `/api/twin` ที่ทำงานได้ แต่ response shape ก็ไม่ตรงกับที่ `selfprintChat()` คาดหวัง (`data.response` vs `data.content`) แปลว่าเส้นทางแชทที่ตั้งใจออกแบบไว้ไปไม่ถึง Claude เลยในทางทฤษฎี (ต้องดูว่าจริงๆ TwinChat ใช้ path ไหนกันแน่ — ดูข้อ 3)

**P0-C:** World/SICE context ที่คำนวณไว้จริง (`expertPrompt` ต่อโลก) ไม่เคยถูกส่งเข้า Nova prompt เลย — `getNovaPrompt()` รับแค่ hub/mood/archetype/profile/maturity ไม่มีช่องให้ world expertise

**12 Worlds ≠ 15 Hubs:** เป็นคนละ domain model กัน (`worlds` มี 12 ตัว, `HubContext`/Nova prompt ใช้ 15 hub) ไม่มี mapper เชื่อมสองระบบ

**P0-A:** Twin birth ไม่ atomic — สร้าง `twins` สำเร็จแต่ SICE/Visual DNA/world_preferences ตัวไหนพังก็ยัง `return success: true` เหมือนเดิม (`Promise.allSettled` แบบ fail-soft)

**P0-B:** `user_lifecycle.status` ตัดสิน route โดยไม่เช็คว่า `twins` มีจริงไหม เกิด lifecycle-drift ได้ (กลับไป onboarding ทั้งที่เคยทำแล้ว) และ `fetchUserTwin()` ยุบทุก failure mode (network error, RLS, ไม่มีแถว) ให้กลายเป็น `null` เหมือนกันหมด — **แยกไม่ออกว่า "ไม่มีทวินจริง" กับ "โหลดพัง"**

รายงานฉบับเต็มแนะนำให้ออกแบบ **Canonical Intelligence Context Contract** ใหม่ทั้งระบบก่อนแก้ ไม่ใช่แพตช์ทีละจุด — เป็นงานสถาปัตยกรรมระดับใหญ่ ยังไม่ได้อ่านครบ 100% ด้วย (อ่านไปแล้ว ~2,550/3,299 บรรทัด)

### 2.5 Visual — ที่ยังไม่แตะ

- 3 จุดที่แก้ไปแล้ว (ในหัวข้อ 1) เป็นแค่บั๊กที่ root-cause ชัดเจนที่สุด — ยังไม่ได้ตรวจภาพรวมทั้ง 12 โลกทีละโลกว่ามีจุดชนแบบเดียวกันอีกไหมนอกจากโลก Self
- แสง/สี/เสียงของพิธี CoreAwakening, TwinBirth, WOW moments ทั้ง 3 — ที่คุณขอให้ดูไว้ตั้งแต่ต้น ("อย่าเพิ่งทำเอกสาร... เรื่องวิชวลไลซ์ของทั้งเว็บด้วย") ยังไม่ได้ตรวจสอบเป็นระบบ

---

## 3. ขั้นต่อไปที่กำลังจะทำ

ตามที่คุณสั่งต่อ — กำลังไปตรวจ **TwinChat.tsx / TwinContext.tsx** ทำไม TwinChat ถึงขึ้น "ทวินยังไม่ตื่น" ทั้งที่ควรจะมีทวินอยู่แล้ว โดยเน้นดูที่ `fetchUserTwin()` ตามที่ audit ชี้ไว้ในข้อ 2.4 (P0-B) ว่าอาจยุบทุก error ให้เป็น `null` เหมือนกันหมด

---

## หมายเหตุด้านเครื่องมือ

`npm test` / `npm run lint` / `npm run build` รันไม่ได้ในแซนด์บ็อกซ์ของผม (native binding ของ `node_modules` ที่ mount จาก Windows ไม่ตรงกับ Linux) — ทุกครั้งที่แก้โค้ด ผมยืนยันด้วย `npx tsc -b --force` (real build-mode typecheck) แต่ **คุณต้องรัน `npm test`/`npm run lint`/`npm run build` เองก่อน push ทุกครั้ง** เพื่อความชัวร์ 100%
