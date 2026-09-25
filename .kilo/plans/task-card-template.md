# Task Card Template

Copy this to `.kilo/plans/task-cards/TC-XXX-task-name.md` and fill in.

```markdown
# TC-XXX: Task Title
**Phase**: X | **Priority**: P0/P1/P2 | **Estimate**: Xh
**Assignee**: AI-X | **Depends On**: TC-XXX / Phase X Gate
**Feature Flag**: FLAG_NAME

## 🎯 OBJECTIVE
[คำอธิบายสั้นๆ ว่าทำอะไร ทำไม จบแล้วได้อะไร]

## 📋 DEFINITION OF DONE (ALL REQUIRED - บังคับทุกข้อ)
- [ ] Deliverable 1 (เฉพาะเจาะจง: ไฟล์, ฟังก์ชัน, metric)
- [ ] Deliverable 2
- [ ] Unit tests: scope + coverage
- [ ] Storybook stories (ถ้าเป็น UI component)
- [ ] **Docs updated**: docs/XXX.md (section ใด)
- [ ] **MASTER_PLAN.md updated**: Task status, phase progress
- [ ] **All tests pass**: `npm test -- <scope>`
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
[รายละเอียดเทคนิค: source files, interfaces, algorithms, gotchas]

## 🧪 TEST SPEC
```typescript
// ตัวอย่าง test cases
test('description', () => { ... });
```

## 📦 HANDOFF ARTIFACTS (on completion - ส่งมอบเมื่อเสร็จ)
- Updated MASTER_PLAN.md
- Updated docs/XXX.md
- .ai/context-pack/session-XXX-context.json (includes: APIs, interfaces, decisions)
```