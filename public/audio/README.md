# public/audio — Audio Asset Library

**สถานะ (8 ก.ย. 2026):** ไฟล์เสียงจริง 79 ตัว + rewrite soundscape-manifest.json + wire เข้าโค้ดแล้ว — **ระบบ Soundscape เล่น MP3 จริงได้แล้ว**

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

## Integration (8 ก.ย. 2026)

### ✅ ทำเสร็จแล้ว:
1. **rewrite `soundscape-manifest.json`** — 21 soundscapes ตรงกับ SOUNDSCAPE_LIBRARY ใน `SoundscapeEngine.ts` map กับไฟล์ MP3 จริงใน `public/audio/{category}/`
2. **แก้ `useSoundscapeAudioLoader.ts`** — โหลด MP3 จากไฟล์จริงเป็น priority แรก (fallback เป็น Web Audio API synthesis เหมือนเดิม)
3. **แก้ `adaptive-audio-engine.ts`** — `getAudioUrl()` map MusicExperience (reflection/focus/discovery/deep_reflection/celebration/idle) กับไฟล์ MP3 จริงแทน placeholder URLs ที่ไม่มี
4. **แก้ `SoundscapePlayer.tsx`** — comment อัพเดทให้ตรงกับ implementation ใหม่

### การทำงาน:
```
SoundscapePlayer.tsx
  ↓ useSoundscapeAudioLoader('morning-forest', audioContext)
    ↓ Priority 1: fetch('/audio/environment/mixkit-morning-birds-2472.mp3')
    ↓ Fallback: synthesizeSoundscapeBuffer() (Web Audio API)
    ↓ Cache in IndexedDB (selfprint-audio-cache/soundscapes)
  ↓ decodeAudioData() → AudioBuffer
  ↓ play() → loop (source.loop = true)
```

### ยังไม่ได้ทำ (เลือกทำถ้าต้องการ):
- **Twin SFX hooks** (`useTwinSFX()`, `useTransitionSFX()`) — สำหรับ twin awakening, page transitions, button clicks
- **UI SFX integration** — ปุ่มกด, notification sounds จาก `public/audio/ui/`
- **High-quality assets** — ถ้าต้องการเพลงยาว 30 นาทีจริงๆ แทน CC0 clips สั้นๆ
