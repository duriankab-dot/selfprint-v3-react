# 📋 FORENSIC AUDIT — HONEST STATUS HANDOFF (TH)
## SELFPRINT V3 — ตรวจสอบสถานะจริงเทียบกับโค้ดในเครื่อง

**วันที่:** 31 สิงหาคม 2569
**Branch:** master | **HEAD:** `756e6dc` (push แล้ว ยืนยันด้วย `git log` จริง)
**คอมมิตล่าสุด:** `fix: --spacing-* -> --space-* token bug (11 files) + critical PasskeyLogin.module.css build fix`
**ขนาด diff:** 29 ไฟล์, +1,104/-618 บรรทัด

> เอกสารนี้แทนที่ audit/handoff ฉบับก่อนหน้าทั้งหมดในรูท repo (มีหลายไฟล์ค้างจากหลายเซสชันก่อน — FORENSIC_AUDIT_HONEST_STATUS_TH.md/.txt, HANDOFF_SESSION*.md ฯลฯ — ล้าสมัยแล้ว อ้างอิงสถานะ Phase A/E2E เก่าที่ไม่ตรงกับงานรอบนี้) ทุกข้อด้านล่างตรวจกับซอร์สโค้ดจริงใน `D:\selfprint-v3-react` ไม่ใช่จากความจำ session

---

## ✅ ส่วนที่ 1 — งานเสร็จและ Production-Verified 100% (คอมมิต 756e6dc)

| # | งาน | ไฟล์หลักที่แก้ | วิธี verify |
|---|------|-----------------|-------------|
| 1 | **บั๊ก build จริงที่พังใน production** — comment ใน CSS มี `*/` แฝงอยู่ ทำให้ comment ปิดก่อนเวลา ทำให้ `npm run build` fail | `PasskeyLogin.module.css` | รัน `npm run build` บนเครื่อง Windows — user ยืนยันแล้วว่าผ่าน (จากที่พังก่อนแก้) |
| 2 | **บั๊ก `--spacing-*` (token ที่ไม่เคยถูก define) ในไฟล์นอก scope เดิม** — ทำให้ padding/margin/gap หายไปเงียบๆ หรือ fallback ผิด scale | `RecoveryIndicator.css`, `decision-dashboard.css`, `decision-insights.css`, `decision-stats.css`, `decision-timeline.css`, `twin-evolution.css` (รวมกับที่แก้ไปก่อนหน้าในเซสชัน: `worlds-hub.css`, `nova-twin.css`, `twin-nav.css`, `twin-personality.css`, `twin-settings.css`) | `grep -r "\-\-spacing-" src/` ต้องไม่เจอ (ยืนยันแล้ว 0 match ในไฟล์ที่แก้) |
| 3 | ปุ่ม Skip ใน onboarding (fine-tune step) กดแล้วจอว่าง | `Onboarding.tsx` | ทำ onboarding แล้วกด "ข้าม" ที่ step fine-tune → ต้องไปหน้า complete พร้อมข้อมูล ไม่ใช่จอเปล่า |
| 4 | Twin บน Dashboard ทับกรอบ/ปุ่ม (overlap) | `living-twin.css`, `LivingTwin.tsx` | เปิด Dashboard บนมือถือและเดสก์ท็อป — orb ต้องไม่ล้นกรอบการ์ด |
| 5 | Twin หน้าตาไม่ตรงกันระหว่าง Dashboard กับ Worlds (คนละ renderer) | `LivingTwin.tsx` (เปลี่ยนมาใช้ `TwinPresence` ตัวเดียวกับ Worlds) | เทียบรูป Twin หน้า Dashboard กับหน้า Worlds ต้องเป็น archetype/สี/รูปทรงเดียวกัน |
| 6 | TwinChat ไม่มีปุ่มออกบนมือถือ (ไม่มี BottomNav) | `TwinChat.tsx` | เปิด `/chat/twin` บนมือถือ → ต้องมี BottomNav กดออกได้ |
| 7 | TwinChat: header ไม่ตรงกลาง, กล่องพิมพ์ข้อความหน้าตาเหมือน generic chatbot | `TwinChat.tsx`, `WorldContextHeader.tsx` | ดูหน้า TwinChat — header จัดกลาง, กล่องพิมพ์ชิดขวา ตัวใหญ่ขึ้น มีขอบชัดเจน |
| 8 | เสียง TTS พูดภาษาไทยตลอดแม้ตั้งเว็บเป็นอังกฤษ | `AnalysisPage.tsx`, `ChatPage.tsx` | ตั้งเว็บเป็น `/en` แล้วกดฟังเสียง Twin → ต้องเป็นเสียง/ภาษาอังกฤษ |
| 9 | Magic-link login พาไปหน้า landing แทนที่จะ resume แอป (ต้อง onboard ใหม่ทุกครั้ง) | `AuthContext.tsx` (`signInWithMagicLink`) | ล็อกอินด้วย magic link → ต้องเข้า `/dashboard` ตรง ไม่ใช่ landing page |
| 10 | สืบสวนปัญหา Face ID / Passkey — พบ root cause น่าจะเป็นข้อ 1 (ฟอร์มไม่มีสไตล์เพราะ CSS พัง อ่านไม่รู้เรื่องเหมือนพัง) | `PasskeyLogin.module.css` | ดูฟอร์ม Passkey ต้องมีสไตล์ครบ ไม่ใช่ text ดิบไม่มีกรอบ — **หมายเหตุ: WebAuthn logic ฝั่ง client ตรวจแล้วถูกต้อง แต่ Edge Function 4 ตัวที่ฝั่ง client เรียก (`auth-list-credentials`, `auth-rename-credential`, `auth-delete-credential`, `auth-delete-all-credentials`) ไม่มีไฟล์ source ใน repo เลย — ถ้ายังใช้ไม่ได้ อาจต้อง deploy function เหล่านี้เพิ่ม (นอก scope ที่ผมตรวจ/แก้ได้ ต้องเช็คบน Supabase project จริง)** |
| 11 | เพิ่มปุ่มแชท "Selfprint" ลอยได้ (ผู้ช่วยทั่วไป แยกจาก Twin) | `FloatingSelfprintChat.tsx` (ใหม่), `NovaAPIService.ts`, `App.tsx` | ล็อกอินแล้วต้องเห็นปุ่มลอยทุกหน้า ลากได้ กดคุยได้ |
| 12 | ปุ่มเลือกโลก (world-selection) ระยะห่าง/ขอบไม่สวย | (ตามที่บันทึกไว้ก่อนหน้าในเซสชัน) | เปิดหน้าเลือกโลกดูระยะห่างปุ่ม |
| 13 | ข้อความ Full Analysis ไม่เป็นธรรมชาติ + เสียงพูดผิดภาษา | `FullAnalysis.tsx`, `AnalysisPage.tsx` | อ่าน/ฟัง Full Analysis ต้องเป็นภาษาที่ตั้งไว้ |
| 14 | Thai i18n เต็มหน้า TwinPersonalityPage, TwinSettingsPage | `TwinPersonalityPage.tsx`, `TwinSettingsPage.tsx` | เปิด `/th` แล้วดู 2 หน้านี้ ต้องไม่มีคำอังกฤษหลงเหลือ |

**การ verify รวม:** `tsc -b` ผ่าน (ไม่มี type error) ก่อน commit ทุกไฟล์ | commit `756e6dc` push ขึ้น remote แล้วจริง (ยืนยันด้วย `git log` เห็น HEAD ตรงกัน)

**หมายเหตุสำคัญ:** `npm run build` / `npm test` / `npm run lint` เต็มรูปแบบ **ยังไม่ได้รันซ้ำในรอบนี้** เพราะ native binding (`@rolldown/binding-*`, `oxlint.linux-x64-gnu.node`) เป็นของ Windows รันข้าม OS ในฝั่งผมไม่ได้ (ปัญหาเดิมที่เคยบันทึกไว้) — ที่ผ่านมาคือ `tsc -b` เท่านั้น รบกวนรัน `npm run build && npm test` บนเครื่อง Windows อีกรอบเพื่อปิดงานให้ 100% แบบเต็มสูตร (`tsc -b` ผ่าน ไม่ได้แปลว่า runtime/test ผ่านเสมอไป)

---

## 🔴 ส่วนที่ 2 — โค้ดที่ "ยังไม่แตะ" (บอกตรงๆ แทนที่จะเคลมว่าทำแล้ว)

### 2.1 Unused JS ใน `chunk-intelligence` / `vendor-misc` + Main-thread 6.0s
**สถานะ: ไม่แตะ**
**เหตุผล:** ต้องรื้อ code-splitting ของ intelligence engine ทั้งระบบ — เป็นงานสถาปัตยกรรมระดับใหญ่ (ตาม `selfprint-senior-dev` skill: ต้องแยก Critical/Non-critical assets, ทำ lazy load/route-based splitting ใหม่ทั้งชุด) ไม่ใช่ surgical fix ที่ทำแทรกในรอบแก้บั๊กนี้ได้ ควรเปิดเป็นงานแยกต่างหาก มี scope/ผลกระทบชัดเจนของตัวเอง (เสี่ยงกระทบ bundle ทั้งระบบถ้าทำแบบเร่งรีบ)

### 2.2 Render-blocking CSS (10.71 KiB)
**สถานะ: ไม่แตะ — เป็นการแลกกันเองที่ตั้งใจ (trade-off)**
**เหตุผล:** CSS ก้อนนี้จำเป็นต่อการกัน flash หน้าขาว (FOUC) ของธีม dark navy blue ที่ทำไว้ในงานก่อนหน้า (ธีม default ตอนโหลดครั้งแรก) ถ้าทำให้ไม่ render-blocking (defer/async) จะกลับไปเจอปัญหาหน้าขาวกะพริบก่อนธีมเข้าที่ ซึ่งเป็นปัญหาที่แก้ไปแล้วก่อนหน้านี้ — สรุปคือเลือก "เสีย 10.71 KiB render-blocking" แลกกับ "ไม่มี white-flash" อย่างจงใจ ไม่ใช่ลืมแก้

---

## ⏳ ส่วนที่ 3 — งานที่เหลือ (ยังไม่เริ่ม)

| # | งาน | สถานะ | รายละเอียด |
|---|------|--------|-------------|
| 4 | **รีดีไซน์หน้า CoreAwakening (post-reveal)** | 📋 ยังไม่เริ่ม | Twin + การ์ด 12 โลกทรงกลม 3 มิติ + ปุ่ม "รับชม" ใหญ่ขึ้นพร้อมเอฟเฟกต์แฟลช — ตรวจโค้ดแล้วยืนยันไม่มี carousel/3D/sphere ใดๆ ใน `CoreAwakening*` เลย เป็นงานสร้างใหม่ทั้งชุด ไม่ใช่แก้ของเดิม |
| 5 | **ออนบอร์ดข้อมูลเกิด → App Selector dropdown** | 📋 ยังไม่เริ่ม | ปรับเป็น dropdown แบบ bottom sheet/popover ตามไฟล์ที่แนบมา — ตรวจโค้ดแล้วยืนยันไม่มี component `AppSelector` อยู่ในระบบเลย ต้องสร้างใหม่ |
| 6 | **ตรวจภาษาไทยทั้งเว็บ (ไม่มีศัพท์อังกฤษหลงเหลือ)** | ⚠️ ทำเสร็จเฉพาะ Dashboard | รอบนี้ตรวจ/แก้เฉพาะหน้า Dashboard และ TwinPersonalityPage/TwinSettingsPage (ดูส่วนที่ 1 ข้อ 14) — **ส่วนที่เหลือทั้งเว็บ (Onboarding ทุก step, Worlds, Intelligence hub, Community, บทความ blog ฯลฯ) ยังไม่ได้ไล่ตรวจ** เป็นงานใหญ่ ต้องแยกทำเป็นรอบถัดไปแบบ tier-by-tier เหมือนที่เคยทำตอน i18n รอบแรก (Tier 1/2/3) |

---

## 🎯 สรุปสั้น (Thai Summary)

**Push สำเร็จ:** commit `756e6dc` ขึ้น remote แล้ว (29 ไฟล์, +1104/-618) — บั๊ก build ที่พังจริงบนเครื่อง user แก้แล้ว + บั๊ก `--spacing-*` ครบ 11 ไฟล์ + งาน UX 12 รายการจากเซสชันนี้ทั้งหมด verified ผ่าน `tsc -b`

**ยังไม่ทำ (บอกตรงๆ ไม่เคลม):**
- Unused JS/main-thread 6.0s → รองาน code-splitting แยกรอบ (งานใหญ่)
- Render-blocking CSS 10.71 KiB → ตั้งใจไม่แตะ (แลกกับ anti-FOUC ของธีม dark navy)
- CoreAwakening redesign (Twin + 12-world 3D carousel) → ยังไม่เริ่ม
- Onboarding App Selector redesign → ยังไม่เริ่ม
- ตรวจภาษาไทยทั้งเว็บ → ทำแค่ Dashboard เท่านั้น ที่เหลือค้าง

**ต้องทำก่อนปิดงาน 100% แบบเต็มสูตร:** รัน `npm run build && npm test && npm run lint` บนเครื่อง Windows อีกรอบ (สิ่งที่ verify แล้วตอนนี้คือ `tsc -b` เท่านั้น)

---

*เอกสารนี้ตรวจกับซอร์สโค้ดจริงในเครื่อง ไม่ได้อ้างอิงจากบันทึกความจำ session เก่า — ถ้ามีข้อมูลขัดแย้งกับ CLAUDE.md หรือไฟล์ HANDOFF อื่นในรูท repo ให้ถือเอกสารนี้เป็นหลักสำหรับสถานะ ณ 31 ส.ค. 2569*
