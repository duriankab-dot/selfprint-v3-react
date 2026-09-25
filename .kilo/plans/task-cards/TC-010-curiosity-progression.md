# TC-010: Curiosity progression design
**Phase**: 0 | **Priority**: P0 | **Estimate**: 2 ชม.
**Assignee**: AI-Architect + AI-Docs | **Depends On**: TC-002
**Feature Flag**: NO_ASTRO_LANG

## 🎯 OBJECTIVE
ออกแบบ "ความอยากรู้ progression" — จากการล่อลูกค้าจากตลาดดูดวง (Astrology hook) → เปิดเผย Behavioral Science (Reveal) → รักษาให้พัฒนาตัวเองต่อไป (Retention) โดยไม่ใช้ภาษาโหราศาสตร์ใน production

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `docs/CURIOSITY_PROGRESSION.md` — design doc สมบูรณ์
- [ ] ระบุ 3 Stages: Hook → Reveal → Retention
- [ ] อธิบาย copy strategy แต่ละ stage (Thai + English)
- [ ] ระบุ UI/UX patterns ที่รองรับ progression
- [ ] กำหนด "Disclaimer Banner" สำหรับ /vs-astrology
- [ ] กำหนด upgrade triggers (World Lenses unlock)
- [ ] **Docs updated**: MASTER_PLAN.md, CURIOSITY_PROGRESSION.md
- [ ] **All tests pass**: N/A
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
```markdown
# CURIOSITY_PROGRESSION.md Outline

## Stage 1: HOOK (Landing) — "ดูดวง AI ฟรี 2 นาที"
- User expectation: ราศี, ดาว, โชคลาภ, ทำนายอนาคต
- Actual delivery: Behavioral Map Polygon + 12 SICE + Blind Spots
- Copy: "วิเคราะห์นิสัย AI 12 มิติ ฟรี 2 นาที — ไม่ใช่ดูดวง เป็นวิทยาศาสตร์พฤติกรรม"
- Visual: LivingDiagram mode=landing (scroll → Human→Twin→Map)
- CTA: "วิเคราะห์นิสัยฟรี 2 นาที" (ไม่ใช่ "สร้าง AI Twin")

## Stage 2: REVEAL (Onboarding) — "NOVA อ่านคุณลึกกว่าคิด"
- Nova validates belief THEN introduces science
- "หลายคนเชื่อว่าคุณเป็น X — แต่พฤติกรรมจริงแสดง Y"
- Blind Spot reveal: "Blind Spot: Overoptimism — คุณประเมินความเสี่ยงต่ำเกินจริง 3.2x"
- LivingDiagram mode=onboarding (step-driven, DNA refining)
- CTA: "Twin ของคุณพร้อม — จะให้ช่วยตัดสินใจไหนก่อน?"

## Stage 3: RETENTION (Dashboard) — "Twin ร่วมทางทุกวัน"
- Daily Brief: "พฤติกรรมวันนี้: Decision Confidence 78% — Blind Spot 'Impulsivity' active"
- Proactive alerts จาก blind spots/patterns
- World Lenses: "Unlock Career World → Twin simulate ตัวเลือกงาน 3 ทาง"
- LivingDiagram mode=dashboard (live data pulses, clickable nodes)
- Upgrade pitch: "Unlock World Lenses → ช่วยตัดสินใจเฉพาะด้าน" (ไม่ใช่ "ดูดวงละเอียดขึ้น")

## Disclaimer Banner (บังคับใน /vs-astrology)
🔬 SELFPRINT ไม่ใช่โหราศาสตร์ ไม่ใช้ดาว ไม่ทำนายโชค เราวิเคราะห์พฤติกรรมจากข้อมูลจริง

## Astrology → Behavioral Science Vocabulary Map
| Astrology Term | Behavioral Science Replacement |
|----------------|-------------------------------|
| ดูดวง / ทำนาย | วิเคราะห์นิสัย / จำลองการตัดสินใจ |
| ดาว / ราศี | พฤติกรรม / รูปแบบการตัดสินใจ |
| โชค / โชคลาภ | โอกาส / ความเสี่ยง / Blind Spots |
| ดวงชะตา / โชคชะตา | รูปแบบพฤติกรรม / Decision Patterns |
| โหราศาสตร์ | Behavioral Science / Decision Intelligence |
| บัณฑิตกาล / โหราศาสตร์ไทย | วิทยาศาสตร์พฤติกรรม / SICE Engines |
```

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- docs/CURIOSITY_PROGRESSION.md
- .ai/context-pack/session-XXX-context.json