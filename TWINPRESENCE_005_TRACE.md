# TWINPRESENCE-005 — พิธีเกิด Twin ในโลก (Phase 1)

## บริบท
Phase 1 ของ scope ใหญ่ที่ผู้ใช้ขอ (Twin ต้องดูไม่เหมือนกันในแต่ละคน +
เสียงพูดทักทายตอนเกิด) ผู้ใช้เลือกเริ่มที่ "พิธีเกิด Twin ในโลก" ก่อน,
ใช้เสียงฟรี (Web Speech API ในเบราว์เซอร์ ไม่ใช้บริการ TTS แบบเสียเงิน),
และให้ระบบ unique ต่อคนเป็น procedural ใหม่ (ไม่ใช่แค่ 6-shape/18-archetype
เดิม) แต่ยังใช้ไอเดียการเคลื่อนไหวจาก 18 archetype และทำงานร่วมกับธีม
World เดิมได้

## ไฟล์ใหม่

**`src/lib/twin/twinUniqueness.ts`**
Deterministic seeded PRNG (djb2 hash → mulberry32) แปลง seed key (ใช้
`session.user.id` เป็น seed — เสถียรตั้งแต่ก่อน Twin เกิดจนถึงทุกครั้งที่
เข้า World ภายหลัง ต่างจาก `twin.id` ที่ยังไม่มีตอนพิธีเกิด) เป็น
`TwinUniqueTraits`: hueShiftDeg, facetCount, facetRadiusRatio,
facetSizeRatio, rotationOffsetDeg, pulseSpeedFactor, shapeJitterSeed,
orbitDirection — layer นี้ซ้อนทับบน `TWIN_VISUAL_DNA` (18-archetype) เดิม
ไม่ได้แทนที่ ยังคง "archetype family" เดิมไว้ แค่ไม่ให้สองคน archetype
เดียวกันดูเหมือนกันเป๊ะอีกต่อไป

`shiftHue(hex, degrees)` — shift hue ของสี hex คงค่า saturation/lightness

**`src/lib/twin/twinVoice.ts`**
Wrapper รอบ `window.speechSynthesis`/`SpeechSynthesisUtterance` (ฟรี,
ไม่ต้องสมัครบริการ/ไม่ต้องมี API key) — `speakTwinGreeting()` (never
throws, no-op ถ้า browser ไม่รองรับหรือไม่มีเสียงที่ตรงภาษา),
`stopTwinVoice()` (เรียกตอน unmount กัน Twin พูดค้างข้ามหน้า),
`buildTwinGreeting(twinName, lang)` (ประโยคทักทายภาษาไทย/อังกฤษ)

## ไฟล์ที่แก้

**`src/components/twin/TwinPresence.tsx`** (World-page Twin glow)
- เพิ่ม prop `seedKey?: string`
- เพิ่ม `OrbitFacets` — วง facet เล็กๆ หมุนรอบ core glyph จำนวน/รัศมี/
  ทิศทาง/ความเร็วมาจาก unique traits
- `CoreGlyph` เดิม (sphere/crystal/ring/diamond/bloom/wave) เพิ่ม
  `jitteredPolygonPoints()` สำหรับ crystal/diamond ให้รูปทรงเหลี่ยมมี
  ความเบี้ยวเฉพาะตัว (deterministic, ไม่ใช่ Math.random())
- สี core/aura ผ่าน `shiftHue()` ตาม `hueShiftDeg` ก่อนใช้ในทุกจุด (gradient,
  box-shadow, glow filter)
- `--twin-pulse-speed` CSS var จาก `traits.pulseSpeedFactor` คุมทั้ง
  breathing animation duration และ orbit spin speed ให้ Twin แต่ละตัวมี
  จังหวะ "หายใจ" ของตัวเอง

**`src/pages/WorldDetail.tsx`**
- เพิ่ม `useAuth()` → ส่ง `seedKey={session?.user?.id ?? twin?.id}` ให้
  `<TwinPresence>` (ใช้ userId ไม่ใช่ twin.id เพื่อให้ seed เดียวกันกับตอน
  พิธีเกิดใน CoreAwakening.tsx ซึ่งยังไม่มี twin.id ตอนนั้น — Twin ที่เห็น
  ตอนเกิดกับตอนอยู่ใน World ต้องเป็นตัวเดียวกัน)

**`src/components/twin/HologramBirth.tsx`** (canvas particle-birth
animation — เดิม converge เข้าเป็นวงกลมเปล่าๆ ทุก archetype เหมือนกันหมด
ต่างกันแค่สี)
- เพิ่ม prop `shape?: TwinCoreShape` และ `seedKey?: string`
- รูปทรงที่ค่อยๆ ก่อร่างตอนจบ animation เปลี่ยนตาม archetype จริง
  (sphere/crystal/ring/diamond/bloom/wave — ใช้ polygon-jitter แบบเดียวกับ
  TwinPresence.tsx) ไม่ใช่วงกลมเปล่าตายตัวอีกต่อไป
- เพิ่ม orbiting facets (fade-in หลัง core ก่อร่างเกินครึ่ง) และสีผ่าน
  `shiftHue()` ตาม unique traits — Twin ที่เห็นตอน "เกิด" กับตอนอยู่ใน
  World ใช้ seed/traits ชุดเดียวกัน จึงเป็น "ตัวเดียวกัน" จริงๆ

**`src/pages/CoreAwakening.tsx`**
- เพิ่ม `birthShape` (จาก `getTwinVisualDNA(birthArchetype).coreShape`)
  และส่ง `shape={birthShape}` + `seedKey={session.user.id}` ให้
  `<HologramBirth>`
- เพิ่ม `useLanguage()` เพื่อรู้ภาษาปัจจุบัน (th/en)
- ใน `handleTwinNamed()` หลัง `setPhase('celebration')`: เรียก
  `speakTwinGreeting(buildTwinGreeting(twinName, language), {...})` —
  fire-and-forget เสียงทักทายตอน Twin เพิ่งถูกตั้งชื่อ
- เพิ่ม cleanup effect เรียก `stopTwinVoice()` ตอน unmount กันเสียงพูดค้าง
  ข้ามหน้าถ้า user กดออกกลางคัน

## ยังไม่ทำ (deferred ตามที่ผู้ใช้เลือก phase นี้ก่อน)
- Landing page hero redesign (ธีม "Deep intelligence blue" ข้อมูล
  ประกอบร่าง)
- Analysis-page "วิทยาศาสตร์ที่จริงๆ คือโหราศาสตร์" transition theme
- Dashboard orb (`LivingTwin.tsx`/`living-twin.css`) ยังไม่ได้ใส่ unique
  traits ชุดนี้ (เดิมมี breathing/bob แล้วจาก TWINPRESENCE-002/003/004
  รอบก่อน) — ถ้าต้องการให้ตรงกับ World แบบ pixel-level เหมือนกันเป๊ะ
  ต้องขยายเพิ่ม ยังไม่ได้ทำในรอบนี้เพราะไม่ได้อยู่ใน scope "พิธีเกิดใน
  โลก" ที่เลือกไว้

## Verify
```
npm run build   → ✓ built in 22.61s (ไม่มี error)
npx oxlint src/lib/twin/twinUniqueness.ts src/lib/twin/twinVoice.ts \
  src/components/twin/TwinPresence.tsx src/components/twin/HologramBirth.tsx \
  src/pages/CoreAwakening.tsx src/pages/WorldDetail.tsx
  → Found 0 warnings and 0 errors
npx tsc --noEmit -p tsconfig.json | grep -E "(ไฟล์ที่แก้ทั้งหมด)"
  → ไม่มี error ในไฟล์ที่แก้
```

**ยังไม่ได้ verify ด้วยตา** (ไม่ได้ login เข้า production เพื่อดูจริง —
ตาม rule ห้าม login แทนผู้ใช้) — รอผู้ใช้ทดสอบจริงบน dev/staging หรือหลัง
deploy แล้ว feedback กลับมา
