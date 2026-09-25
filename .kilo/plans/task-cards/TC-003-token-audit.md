# TC-003: Token conflict audit
**Phase**: 0 | **Priority**: P0 | **Estimate**: 1 ชม.
**Assignee**: AI-Frontend | **Depends On**: None
**Feature Flag**: N/A

## 🎯 OBJECTIVE
สแกน codebase หา hardcoded colors (hex, rgb, rgba) ใน .tsx files ที่ควรใช้ design tokens แทน เพื่อให้ dark/light mode และ mood themes ทำงานถูกต้อง

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `token-violations.txt` — รายการไฟล์:บรรทัด:สีที่เจอ
- [ ] `fix-list.csv` — mapping ไฟล์ → token ที่ควรใช้แทน
- [ ] เพิ่ม stylelint rule `color-no-invalid-hex` และ `custom-property-pattern`
- [ ] **Docs updated**: MASTER_PLAN.md
- [ ] **All tests pass**: `npm run lint`
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
```bash
# รันคำสั่งนี้:
grep -rn "#[0-9a-fA-F]\{3,8\}\|rgb(a)?(" src/ --include="*.tsx" | grep -v "node_modules" | grep -v ".test." | grep -v ".stories." > token-violations.txt

# ตัวอย่างที่พบบ่อย:
# rgba(10, 12, 28, 0.5) → var(--color-bg-card)
# #0F1F3F → var(--color-bg-primary)
# #FFFFFF → var(--color-bg-primary) / var(--color-text-primary)
# #5B5CEB → var(--color-accent-primary)
```

```json
// .stylelintrc.json additions
{
  "rules": {
    "color-no-invalid-hex": true,
    "custom-property-pattern": "^color-|^font-|^space-|^radius-|^shadow-",
    "color-function-notation": "modern"
  }
}
```

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- token-violations.txt, fix-list.csv
- .ai/context-pack/session-XXX-context.json