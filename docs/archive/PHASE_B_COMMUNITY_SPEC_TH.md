# Phase B — Community: PRD (ฉบับร่างโดย AI Dev)

วันที่: 30 สิงหาคม 2026
สถานะเอกสาร: ไม่มี spec ต้นฉบับมาก่อน — เอกสารนี้เขียนขึ้นจากการตีความ
`CommunityPage.tsx` (ซึ่งมี "Coming soon" 4 รายการอยู่แล้วในโค้ด) บวกกับ
สามัญสำนึกของ product ประเภท Personal Intelligence Platform ผู้ใช้ (jb_DEV)
ควรอ่านและแก้ scope ได้ตามต้องการ — นี่คือข้อเสนอ ไม่ใช่คำสั่งที่ fix ตายตัว

---

## ทำไมต้องมี Phase B

SELFPRINT ตอนนี้ (Phase A) เป็นประสบการณ์ 1-ต่อ-1 ระหว่างผู้ใช้กับ Twin ของ
ตัวเอง — ไม่มีจุดเชื่อมระหว่างผู้ใช้ด้วยกัน Phase B เพิ่ม "ชุมชน" เพื่อ:
1. เพิ่ม retention — เหตุผลให้กลับมาเปิดแอปนอกจาก self-reflection ส่วนตัว
2. Social proof / viral loop เสริมจาก share_links (migration 004) ที่มีอยู่แล้ว
3. ให้ผู้ใช้เห็นว่าคนอื่นก็ค้นพบตัวเองผ่าน Twin เหมือนกัน (normalize the product)

## หลักการออกแบบที่ยึดตลอดทั้งเอกสาร (ไม่ใช่ทางเลือก)

- **Data minimization**: ห้าม auto-share ข้อมูล Blueprint/SICE ดิบ
  (blind_spots, decision_style, archetype ฯลฯ) ออกสู่สาธารณะโดยผู้ใช้ไม่รู้ตัว
  ทุกอย่างที่ปรากฏต่อสาธารณะต้องเป็นสิ่งที่ผู้ใช้ "เขียน/เลือก" เอง ไม่ใช่ระบบ
  ดึงไปโพสต์ให้อัตโนมัติ (ตรงตาม CLAUDE.md rule ปัจจุบันเรื่อง privacy สำหรับ
  fingerprint data — ขยายหลักการเดียวกันมาใช้กับ community sharing)
- **Anonymous by default**: ไม่ใช้ real name/email เป็น default display —
  ให้ผู้ใช้ตั้งชื่อที่โชว์ในชุมชนเอง (default: "Anonymous Twin")
- **Solo-dev-friendly**: ไม่มีทีม ops/moderation — ฟีเจอร์ต้องไม่ต้องพึ่งคนคอย
  ดูแลตลอดเวลา (ใช้ RLS + self-serve delete แทน moderation queue ในช่วงแรก)

---

## Phase B.1 — Insight Feed ✅ สร้างเสร็จแล้วในรอบนี้

**สิ่งที่ทำ**: ผู้ใช้เขียนข้อคิดสั้นๆ (10-500 ตัวอักษร) แบ่งปันในชุมชน, กดไลก์
โพสต์คนอื่นได้, ลบโพสต์ตัวเองได้

**Data model** (`supabase/migrations/033_community_insights.sql`):
- `public.community_insights` (id, user_id, content, world?, display_name,
  status, created_at) — RLS: อ่านได้เฉพาะ published, เขียน/ลบได้เฉพาะเจ้าของ
- `public.community_insight_likes` (id, insight_id, user_id, created_at,
  UNIQUE(insight_id, user_id)) — RLS: ใครก็ไลก์/เลิกไลก์แทนตัวเองได้

**Code**:
- `src/services/CommunityService.ts` — shareInsight, getFeed, toggleLike,
  deleteInsight, validateInsightContent
- `src/pages/CommunityPage.tsx` — compose form + live feed UI (แทนที่
  ActionCard เดิมที่แค่ navigate ไป /dashboard เฉยๆ)

**ยังไม่ทำ (deliberately out of scope รอบนี้)**:
- Pagination / infinite scroll (ตอนนี้ดึง 20 รายการล่าสุดเท่านั้น)
- Report/flag ระบบ (ตอนนี้มีแค่ self-delete เป็น safety valve)
- Rich text / รูปภาพในโพสต์ (ตอนนี้ plain text เท่านั้น)

---

## Phase B.2 — ออกแบบไว้แล้ว ยังไม่ได้สร้าง (ของเดิมใน "Coming soon")

### 1. 🏆 กระดานผู้นำชุมชน (Community Leaderboard)

**แนวคิด**: จัดอันดับผู้ใช้ตาม engagement ที่ "ดี" ต่อชุมชน ไม่ใช่ competitive
ในเชิงลบ (เช่น ไม่จัดอันดับตาม "เก่งกว่า" ในแบบจิตวิทยา ซึ่งเสี่ยงสร้าง
ความรู้สึกแย่กับผู้ใช้ที่คะแนนต่ำ — SELFPRINT ไม่ใช่แอปดูดวง ไม่ควรมี "top
score ของความเป็นคน")

**Metric ที่แนะนำ**: "Contribution score" = จำนวน insight ที่แบ่งปัน + likes
ที่ได้รับ (ไม่ใช่ accuracy_level หรือ SICE score ส่วนตัว) — วัด "มีส่วนร่วม"
ไม่ใช่ "ดีกว่า"

**Data model ที่ต้องเพิ่ม**:
```sql
-- Materialized view หรือ scheduled query, ไม่ใช่ real-time table
CREATE VIEW public.community_leaderboard AS
SELECT
  ci.user_id,
  MAX(ci.display_name) AS display_name, -- ใช้ชื่อล่าสุดที่ตั้ง
  COUNT(DISTINCT ci.id) AS insights_shared,
  COUNT(cil.id) AS total_likes_received
FROM public.community_insights ci
LEFT JOIN public.community_insight_likes cil ON cil.insight_id = ci.id
WHERE ci.status = 'published'
GROUP BY ci.user_id
ORDER BY total_likes_received DESC, insights_shared DESC
LIMIT 50;
```
ใช้ VIEW แทน denormalized table — ไม่ต้อง sync/trigger, คำนวณสดตอน query
(scale ของ SELFPRINT ตอนนี้ยังเล็ก พอไหว)

**ทำไมยังไม่สร้างรอบนี้**: ขึ้นกับ Insight Feed (B.1) มีข้อมูลสะสมพอสมควรก่อน
ถึงจะมีลีดเดอร์บอร์ดที่มีความหมาย (ถ้าสร้างตอนนี้จะว่างเปล่า)

**ประมาณงาน**: 1 migration (view) + 1 UI page (~ครึ่งวัน)

---

### 2. 🎯 ความท้าทายชุมชนรายสัปดาห์ (Weekly Community Challenges)

**แนวคิด**: โจทย์ reflection รายสัปดาห์ (เช่น "สัปดาห์นี้: เขียนถึงช่วงเวลาที่
คุณเชื่อสัญชาตญาณตัวเองแล้วถูก") — ผู้ใช้ตอบผ่านฟอร์มเดียวกับ Insight Feed
แต่ tag ด้วย challenge_id เพื่อรวมกลุ่ม

**Data model ที่ต้องเพิ่ม**:
```sql
CREATE TABLE public.community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_th TEXT NOT NULL,
  prompt_en TEXT NOT NULL,
  world TEXT, -- เชื่อมกับ 1 ใน 12 worlds ถ้ามี
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- เพิ่ม column ใน community_insights (nullable, ไม่กระทบของเดิม)
ALTER TABLE public.community_insights
  ADD COLUMN challenge_id UUID REFERENCES public.community_challenges(id);
```

**ปัญหาที่ต้องตัดสินใจก่อนสร้าง**: ใครเป็นคนตั้งโจทย์รายสัปดาห์? เป็น solo
dev ไม่มีทีม content — ต้องเตรียม prompt ล่วงหน้าเป็น batch (เช่น เขียน 12
โจทย์ครั้งเดียว ผูกกับ 12 worlds, หมุนเวียนอัตโนมัติ) หรือให้ Twin/Nova
generate โจทย์เองทุกสัปดาห์ (ต้องมี cron job — CF Pages ไม่มี cron ในตัว
ต้องใช้ Cloudflare Cron Triggers แยก)

**ทำไมยังไม่สร้างรอบนี้**: ต้องตัดสินใจเรื่อง content pipeline ก่อน
(manual batch vs AI-generated) — เป็น business decision ไม่ใช่แค่ technical

**ประมาณงาน**: 1 migration + cron/scheduled task + UI (~1-2 วัน หลังตัดสินใจ
content pipeline)

---

### 3. 🤝 จับคู่ Twin ที่คล้ายกัน (Twin Matching)

**แนวคิด**: แนะนำผู้ใช้ที่มี decision_style/archetype คล้ายกันให้เจอกัน

**⚠️ นี่คือฟีเจอร์ที่ sensitive ที่สุดใน Phase B ทั้งหมด** เพราะต้องเปรียบเทียบ
ข้อมูล Blueprint จริง (decision_style, primaryArchetype) ระหว่างผู้ใช้ 2 คน —
ขัดกับหลักการ "data minimization" ด้านบนโดยตรงถ้าทำไม่ระวัง

**ข้อเสนอที่ปลอดภัยกว่า**: ไม่เปิดเผยว่า "ใครคล้ายใคร" ต่อสาธารณะ ให้เป็น
ระบบ opt-in ที่ผู้ใช้ต้องกดยินยอมให้ระบบจับคู่ตัวเองกับคนอื่นโดยเฉพาะ (แยก
consent จาก consent การใช้งาน SELFPRINT ทั่วไป) และ matching ทำงานฝั่ง
server เท่านั้น (ไม่ expose archetype ของคนอื่นให้ client เห็นตรงๆ)

**Data model ที่ต้องเพิ่ม**:
```sql
CREATE TABLE public.twin_matching_consent (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  opted_in BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Matching query ทำเป็น server-side function (Edge Function/CF Pages
-- Function) ที่ join กับ blueprints เฉพาะแถวที่ opted_in = true เท่านั้น
-- ไม่มี client-side query ตรงเข้า blueprints ของคนอื่นเด็ดขาด
```

**ทำไมยังไม่สร้างรอบนี้**: ความเสี่ยงด้าน privacy สูงสุดใน Phase B ทั้งหมด
ต้องมีการตัดสินใจเรื่อง consent flow + legal (privacy policy ต้องอัปเดต) ก่อน
เขียนโค้ดสักบรรทัด — แนะนำให้เป็นฟีเจอร์สุดท้ายที่สร้างใน Phase B ทั้งหมด

**ประมาณงาน**: 2-3 วัน (รวม consent UI + server-side matching function +
privacy policy update)

---

## ลำดับที่แนะนำ (ถ้าจะทำต่อ)

1. ✅ **B.1 Insight Feed** — เสร็จแล้ว (รอบนี้)
2. **B.2a Leaderboard** — ง่ายที่สุด ใช้ข้อมูลที่มีจาก B.1 อยู่แล้ว ไม่มี
   privacy risk ใหม่ (แนะนำทำถัดไปหลัง B.1 มีข้อมูลสะสม ~1-2 สัปดาห์)
3. **B.2b Weekly Challenges** — ต้องตัดสินใจ content pipeline ก่อน
4. **B.2c Twin Matching** — เสี่ยงสุด ทำท้ายสุด ต้องคุย privacy/legal ก่อน

## Checklist ก่อนเริ่ม B.2 ตัวถัดไป

- [ ] Insight Feed มีข้อมูลจริงพอสมควร (ไม่ใช่ตารางว่าง)
- [ ] Migration 033 apply บน staging + production แล้ว (ดูสถานะใน
      FORENSIC_AUDIT_HONEST_STATUS_TH.txt)
- [ ] ตัดสินใจ content pipeline ของ Weekly Challenges (manual vs AI-gen)
- [ ] ทบทวน privacy policy ก่อนแตะ Twin Matching
