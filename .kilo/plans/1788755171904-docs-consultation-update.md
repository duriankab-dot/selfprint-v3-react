# Plan — อัปเดทเอกสารตาม Consultation Session (7 Sep 2026)

## Goal
บันทึกผลการปรึกษา (visual/story Track C + สรุปโปรเจค + วิเคราะห์ตลาดไทย) ลงในเอกสาร 4 ไฟล์
ตามที่เจ้าของเลือกขอบเขต: **ครบ 4 แบบเต็ม** (SUMMARY TH + README ใหม่ + MARKET ANALYSIS + Track C addendum)
ไม่แตะ memory/glossary ฯลฯ (ขอบเขตยืนยันแล้ว)

## หลักการ (ยึดตามโปรเจค)
- เนื้อหาต้อง**ตรวจจากโค้ดจริง** ไม่ใช่เชื่อ `.md` เก่า (ตรงกับ forensic principle)
- `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` ยังเป็น **single source of truth** — ไฟล์ใหม่ต้องอ้าง ไม่แย่งบทบาท
- ภาษาไทยสำหรับไฟล์ `_TH` / README ภาษาไทยเป็นหลัก (technical term เป็น EN)
- ห้ามอวย / ห้ามอ้าง "100% product-verified" — ระบุ limitations จริง (stubs, soundscape, SEO gaps, C1 Twin 3 หน้าตา, C2 no SSR)
- ไม่แก้โค้ด — งานนี้เป็นเอกสารล้วน

## ไฟล์ที่ทำ

### 1. NEW — `docs/SELFPRINT_PROJECT_SUMMARY_TH.md`
สรุปโปรเจคฉบับภาษาไทย (จากเนื้อหาที่ปรึกษาเมื่อ session นี้) โครงสร้าง:
- `# SELFPRINT — PROJECT SUMMARY (ภาษาไทย)`
- สถานะเอกสาร: อ้างอิง `FORENSIC_...` เป็นหลัก · ไม่แทนที่
- **0. เรื่องของโปรเจค** — Living Intelligence Experience · core promise "Understand yourself. Meet your Twin. Keep evolving." · ไม่ใช่ chatbot/ดูดวง/dashboard
- **1. สถานะจริง (7 ก.ย. 2026 HEAD `710afa0` + ล่าสุด `4ed4762`)** — ตาราง gate (tsc/vite/oxlint/vitest 1037/E2E run #305/production) + Track A+B+C0 ปิด · Track C พร้อมเริ่ม
- **2. สถาปัตยกรรมจริง** — React 19/Tailwind 4/Vite · CF Pages Functions (โฟลเดอร์เดียวที่ deploy) · Supabase Edge 12 ตัว · SICE 12 engines (2 forks + SICEBridge) · 7 API modules
- **3. จุดแข็งโดยจริง** — honesty culture (forensic), Story layer §51 + anti-fake guardrails, dual language, lifecycle ครบ
- **4. ความเสี่ยง / สิ่งที่ยังค้าง (honest)** — stubs/mocks, preflight ปิดอยู่, soundscape พัง, Twin 3 implementation (C1), no SSR (C2), SEO meta 24/41 หน้า
- **5. แผนงาน Track A/B/C** — สรุป + 12 phases + G1–G8
- **6. เอกสารอ้างอิงหลัก** — 4 trusted docs

### 2. REWRITE — `README.md` (root)
แทนที่ README เดิมด้วยฉบับใหม่ เนื้อหา:
- Header "SELFPRINT — Living Intelligence Platform" + core promise
- สถานะเร็ว (gate table 7 ก.ย. 2026) + ลิงก์ไป `FORENSIC_...` ว่าเป็นฉบับเดียวที่ถูกต้อง
- **Experience** — Nova → 12 มิติ/SICE → Blueprint → Core Awakening → Twin Birth → Twin + memory/evolution → Today
- **5-tab nav** (TODAY/WORLDS/TWIN/EXPLORE/ME) + หมายเหตุ Worlds เป็น top-level tab (ไม่ใช่ Activities)
- **Tech stack** (React 19, Tailwind 4, Zustand, CF Pages Functions, Supabase, SICE ×12, Claude, Stripe, Passkeys, Sentry) — **ไม่เอา Express/Vercel กลับเข้ามา**
- **Quick start** (npm ci / .env / dev / test / lint / build)
- **Project structure** (src/, functions/, supabase/, docs/) + gotchas (2 forks อย่าลบ, personal_context ≠ personal_contexts, users_profiles.id เป็น surrogate)
- **Trusted documentation** ตาราง (4 ไฟล์ + Track C working docs)
- **Known limitations** — ตาม README เดิมที่ถูกต้อง (stubs, soundscape, no SSR)
- **Links** (GitHub / selfprint.one)
- หมายเหตุ: อัปเดทจาก README เดิมที่อ้าง HEAD เก่า `da855c5` → HEAD ปัจจุบัน

### 3. NEW — `docs/MARKET_ANALYSIS_THAILAND_TH.md`
บทวิเคราะห์ตลาดไทย (เนื้อหาจาก consultation) — **honest, ไม่อวย** โครงสร้าง:
- สถานะเอกสาร: บทวิเคราะห์เชิงกลยุทธ์ ไม่อ้างตัวเลขภายนอกที่ไม่ได้ verify
- **บริบท: สิ่งที่ SELFPRINT มีจริงจากโค้ด** — Trojan-horse content (VsAstrology, Tarot, Palmistry, blog awareness, `astrology.ts` birth-chart bridge) → behavioral science
- **ตลาดดูดวงไทย** — กลุ่มใหญ่ / ตอบโจทย์ความแน่นอน+ritual / decision reassurance / emotional contract
- **โจทย์จริง** — ตารางเปรียบเทียบ: ดูดวงให้ "ความแน่นอน+closure" vs SELFPRINT ให้ "insight ที่ต้องเรียนรู้" — ข้อได้เปรียบ (real behavior, personalize) และข้อจำกัด (user อาจไม่ closure ภายใน first minute)
- **สองกลุ่มเป้าหมาย** — skeptic จากตลาดดูดวง (active search "AI ดูดวง") + self-development ที่อยากได้ science-based
- **ข้อควรระวัง** — อย่าไปแข่งตรงๆ กับความเร็ว/closure ของดูดวง · subscription WTP ไทยต่ำ · อย่า fake story
- **Verdict (honest)** — ✅ asset: trojan funnel + "not astrology แต่ตรงกว่า" + self-discovery measured · ⛔ ความเสี่ยง: first-punch insight ต้องไม่ generic, pricing, คู่แข่ง self-help ราคาถูก
- **คำแนะนำ Dual-funnel** — Funnel A ดูดวง→premium insight (short-term) · Funnel B self-development→relationship/evolution (long-term) · metric: first-visit→first-named-Twin rate + Day-7 retention
- **อ้าง Track C** — Phase 2/4/6/8/11 + Tarot/Palmistry restyle ที่เสนอ

### 4. APPEND — `docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`
ต่อท้าย section ใหม่ "Consultation Addendum — 7 Sep 2026" (ไม่แก้เนื้อหาเดิม) ประกอบด้วยข้อแนะนำที่ปรึกษา:
- **A. Bilingual Typography System** — ไทยไม่มีช่องว่าง/คำยาวกว่า → เพิ่ม deliverable ใน Phase 2 (Landing) + Phase 8 (Today): font stack (Noto Sans Thai / IBM Plex Sans Thai), line-height, truncation, mixed-font baseline
- **B. Bridge pages restyle** (TarotPage/PalmistryPage/VsAstrologyPage) — อยู่นอก 12 phase เดิม → เสนอ micro-phase (Phase 2a หรือรวม Phase 4): restyle ด้วย CSS atmosphere §14 + เน้น "psychological framing" copy ที่มีอยู่แล้ว — รักษา Trojan funnel
- **C. Twin unification (C1) ลำดับ** — ทำ `useTwinIdentity()` facade ก่อน visual ของ Phase 7/8/9 (Twin 3 หน้าตา: LivingTwin orb / TwinPresence SVG / HologramBirth canvas)
- **D. Story payoff = highest leverage** — Twin Birth first message ต้องจาก real analysis (G6) + **Story Provenance Strip** (แสดง source of truth ของ insight เช่น "จาก 3 pattern ใน 2 สัปดาห์") เพื่อ enforce "NO FAKE STORY"
- **E. Today Micro Story** — Phase 8: header "Twin มองว่าวันนี้อะไรสำคัญ" (หนึ่ง insight เด่น) ไม่ใช่หลาย cards แข่งกัน (§6)
- **F. Performance note** — `chunk-intelligence` 345 kB ส่วนใหญ่คือ Supabase SDK ถูกกลืน (verify Phase 0) → split ก่อน decorate; 3D = canvas 2D เท่านั้น (C5)
- ระบุชัดว่า: ยังเป็น**ข้อเสนอ** ไม่ใช่ commit ที่ implement แล้ว · ห้ามแตะ §44 zones

## ขั้นตอนการลงมือ (สำหรับ implementation agent)
1. อ่าน `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` + `docs/PLAN_TRACKS_TH.md` (verify ตัวเลข/สถานะล่าสุดก่อนเขียน)
2. เขียน `docs/SELFPRINT_PROJECT_SUMMARY_TH.md` (ใหม่)
3. เขียน `README.md` ทับ (ใหม่ทั้งหมด)
4. เขียน `docs/MARKET_ANALYSIS_THAILAND_TH.md` (ใหม่)
5. ต่อท้าย addendum ใน `docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`
6. **ไม่**แก้โค้ด / ไม่รัน build/test (งานเอกสารล้วน)

## Validation
- `grep` ยืนยัน 4 ไฟล์มีเนื้อหาครบ section หลัก
- ตัวเลข gate ในเอกสารตรงกับ `FORENSIC_...` ฉบับ 7 ก.ย. 2026 (HEAD `710afa0`)
- ไม่มีคำอ้างเกินจริง ("100% product-verified" ห้าม) · ทุกจุดที่อ้าง "ยังค้าง" ตรงกับ known limitations จริง
- เนื้อหาไม่ขัด §44 (RECOMPOSE ไม่ใช่ REBUILD) · ไม่แตะ do-not-touch zones

## หมายเหตุ / Open
- ไฟล์ใหม่ 3 ไฟล์ + แก้ 1 ไฟล์ (append) = งานเอกสารล้วน ไม่แตะโค้ด
- commit แยกตามที่เจ้าของต้องการ (เล่า/ไม่เล่า) — ตามปกติโปรเจคนี้ commit แยกชัดเจน (docs: ...)
- README เดิมถูกเขียนทับ — หากอยากเก็บประวัติ ให้ดูใน git history (เนื้อหามีอยู่ใน commit เก่า)
