# public/audio — Audio Asset Library

**สถานะ (8 ก.ย. 2026):** มีไฟล์เสียงจริงแล้ว 79 ไฟล์ (CC0 จาก mixkit/freesound ที่เจ้าของโหลดเอง)
จัดเก็บแยกโฟลเดอร์ตามประเภท — **แต่ยังไม่มีโค้ดในระบบเรียกใช้ไฟล์เหล่านี้** (ดูหัวข้อ "ยังไม่ได้ทำ" ด้านล่าง)

## โครงสร้างโฟลเดอร์ + bitrate policy

| โฟลเดอร์ | ใช้สำหรับ | Bitrate | จำนวนไฟล์ | ขนาดรวม |
|---------|-----------|---------|-----------|----------|
| `soundscapes/` | เสียงพื้นหลังยาว/บรรยากาศหลัก (heartbeat, ambient drone, sci-fi computer hum) | 144 kbps | 9 | ~5.0 MB |
| `environment/` | เสียงบรรยากาศ/ธรรมชาติ/ฝูงชนแบบวนลูป (นก, สวน, ฝูงชน, เสียงปรบมือ) | 112 kbps | 8 | ~6.4 MB |
| `twin/` | เสียง AI Twin / robotic / sci-fi voice SFX | 96 kbps | 18 | ~632 KB |
| `transition/` | Whoosh / sweep / scene transition | 96 kbps | 14 | ~640 KB |
| `ui/` | คลิก / chime / notification / feedback สั้นๆ | 96 kbps | 30 | ~820 KB |

รวม 79 ไฟล์ ~14 MB (ลดจากต้นฉบับ WAV ดิบ ~307 MB — แปลงเป็น MP3 ตาม bitrate ข้างบนด้วย `ffmpeg -codec:a libmp3lame`)
ไฟล์ต้นฉบับซ้ำกันเป๊ะ 8 กลุ่ม (เช่น `mixkit-morning-birds-2472.wav` มี 3 ชุด) ถูก dedupe เหลือชุดเดียวต่อชื่อก่อนแปลง

## Bitrate rationale
- **Long soundscape (30 นาที)** ต้องการ bitrate สูงกว่าเพราะฟังต่อเนื่องนาน → 128–160 kbps (ใช้ 144 kbps)
- **Environment loop** ฟังวนซ้ำ ไม่ต้องละเอียดเท่าเพลงหลัก → 96–128 kbps (ใช้ 112 kbps)
- **UI / Twin SFX** ยาว 1–3 วินาที ไม่จำเป็นต้องแบก bitrate สูง → 64–128 kbps (ใช้ 96 kbps ให้ยังคมชัด)
- ไม่บังคับทุกไฟล์เป็น 192 kbps เดียวกันทั้งหมด ตามหลัก "ใช้เท่าที่จำเป็น ไม่ preload เกินจำเป็น" ของ `selfprint-senior-dev` skill

## ยังไม่ได้ทำ (ต้องตัดสินใจ scope ก่อน)
1. **ไม่มี manifest/loader เรียกใช้ไฟล์เหล่านี้** — `src/services/adaptive-audio-engine.ts` อ้างถึง
   `/audio/reflection-high.mp3` ฯลฯ (5 experience x 2 quality) และ `public/soundscape-manifest.json`
   อ้างถึง 20 track id คนละชื่อ (เช่น `/audio/morning-forest.mp3`, 1800 วินาที/192kbps) — **ทั้งสองระบบนี้ยังไม่ตรงกับไฟล์ 79 ไฟล์ที่จัดเก็บไว้**
   ไฟล์ที่มีตอนนี้เป็น SFX/ambience สั้น (มิกซ์คิทเทค คลิปเสียงเดี่ยว) ไม่ใช่แทร็กเพลงยาว 30 นาที 20 แทร็กตาม manifest เดิม
2. **lazy-load ตาม route/state** — ยังไม่มี hook/component เรียกใช้ `public/audio/{category}/*.mp3`
   ต้องออกแบบใหม่ (เช่น `useTwinSFX()`, `useTransitionSFX()`) และตัดสินใจว่าจะผูกกับ event ไหนบ้าง (Twin awakening, page transition, ปุ่มกด ฯลฯ)
3. **soundscape-manifest.json 20 แทร็กเดิม** ยังเป็น placeholder อยู่ — ไม่ได้แก้ในรอบนี้ เพราะไฟล์ที่มีไม่ตรง spec (ต้องหา/ตัดต่อเพลงยาว 30 นาทีจริงถ้าจะปิดงานนี้)

## Migration ที่ทำไปแล้ว (8 ก.ย. 2026)
- โหลดไฟล์ CC0 จาก mixkit จริงแล้ว (เจ้าของโหลดเองนอก sandbox เพราะ network allowlist บล็อก mixkit.co)
- Dedupe ไฟล์ซ้ำ + แปลง WAV → MP3 ตาม bitrate policy ข้างบน + จัดเข้าโฟลเดอร์ตามประเภท
- **ยังไม่ wire เข้าโค้ด** — รอตัดสินใจ scope ของงาน integration (ดูหัวข้อ "ยังไม่ได้ทำ")
