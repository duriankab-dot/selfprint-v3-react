# Contributing to Selfprint

## 🧠 กฎเหล็กของโปรเจกต์

| กฎ | รายละเอียด |
|----|-----------|
| **§19 User > AI** | AI ห้าม override การเลือกของผู้ใช้ (Hub, Mood) |
| **§32 Depth, not Identity** | ตัวตนพื้นฐานฟรี ขายเฉพาะความลึก |
| **§15 Feedback Loop** | ทุก Insight ต้องมีปุ่ม Feedback |
| **§43 No Hardcode Color** | ใช้ `var(--exp-*)` เท่านั้น |
| **§18 Mood Detection** | AI detect soft signal เท่านั้น |

## 📝 Git Workflow

### Branch Strategy
- `main` — Production
- `develop` — Development
- `feature/*` — ฟีเจอร์ใหม่
- `fix/*` — แก้บั๊ก
- `docs/*` — แก้ไขเอกสาร

### Commit Format
type(scope): subject

body (optional)

text

**Type:** feat, fix, docs, style, refactor, perf, test, chore

## 🛠️ Development

```bash
npm install
npm run dev
npm run build
📂 โครงสร้างโค้ด
โฟลเดอร์	ใช้ทำอะไร
src/pages/	หน้าเว็บ
src/components/	UI Components
src/context/	React Context
src/hooks/	Custom Hooks
src/services/	API Services
server/	Backend Express.js
api/	API Routes
docs/	เอกสารทั้งหมด
อัปเดตล่าสุด: 12 สิงหาคม 2569