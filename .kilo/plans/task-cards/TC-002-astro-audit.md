# TC-002: Astro language audit + replacement list
**Phase**: 0 | **Priority**: P0 | **Estimate**: 1 ชม.
**Assignee**: AI-Docs | **Depends On**: None
**Feature Flag**: NO_ASTRO_LANG

## 🎯 OBJECTIVE
สแกน codebase หาคำที่เกี่ยวกับโหราศาสตร์/ดูดวง ทั้งหมด สร้างรายการเปลี่ยนคำ เพื่อทำให้ภาษาทุกหน้าเป็น Behavioral Science เท่านั้น (ยกเว้นหน้า /vs-astrology)

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `astro-audit.txt` — ผลลัพธ์ grep ทุกคำ запрет พร้อมไฟล์:บรรทัด
- [ ] `replacement-map.csv` — mapping คำเก่า → คำใหม่ (Thai + English)
- [ ] ระบุชัดเจนว่าคำไหน "ยกเว้นได้" (เฉพาะ /vs-astrology page)
- [ ] **Docs updated**: MASTER_PLAN.md
- [ ] **All tests pass**: N/A (audit only)
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
```bash
# รันคำสั่งนี้:
grep -rn "ดูดวง\|โหราศาสตร์\|ดาว\|ราศี\|โชค\|ทำนาย\| horoscope\|astrology\|zodiac\|fortune\|destiny" src/ --include="*.tsx" --include="*.ts" --include="*.md" > astro-audit.txt

# คำที่ต้องเปลี่ยน (ตัวอย่าง):
# "ดูดวง AI" → "วิเคราะห์นิสัย AI"
# "แม่นกว่าดูดวง" → "แม่นกว่าการทายท่วงทั่วไป"
# "โหราศาสตร์" → "Behavioral Science"
# "ดาวบอกว่า" → "พฤติกรรมชี้ว่า"
```

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- astro-audit.txt, replacement-map.csv
- .ai/context-pack/session-XXX-context.json