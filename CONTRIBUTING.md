# 🤝 SELFPRINT — CONTRIBUTING GUIDE

**Version:** 17-Phase Master Direction  
**Date:** 14 สิงหาคม 2569

---

## 🔴 ก่อนเริ่มงาน — อ่านให้ครบ (CODEX v2.0)

### เอกสารที่ต้องอ่านก่อนทำงานทุกครั้ง

| ลำดับ | เอกสาร | เหตุผล |
|-------|--------|--------|
| 1 | `docs/SELFPRINT_PROJECT_CODEX.md` | **SOURCE OF TRUTH** — Complete project blueprint |
| 2 | `docs/onboarding/READING_LIST.md` | Recommended reading order for new developers |
| 3 | `AI_CONTEXT.md` | AI rules, skills, structure — for Claude context |
| 4 | `docs/SELFPRINT_EXECUTION_CHECKLIST_v1.0.md` | Development phases & checklist |

---

## 🔴 กฎเหล็กของโปรเจกต์ (ห้ามละเมิดเด็ดขาด)

| กฎ | รายละเอียด |
|----|-----------|
| **§1 Nova ≠ Twin** | Nova และ Twin เป็นคนละตัวกัน — ห้ามสับสนเด็ดขาด |
| **§2 Twin เกิดจาก Core Awakening** | Twin เกิดหลัง WOW 3 — ไม่ใช่ระหว่าง Onboarding |
| **§3 Twin Initial Intelligence** | Twin ได้รับ Seed จาก Nova + 12 SICE — ฉลาดตั้งแต่เกิด |
| **§4 12 SICE** | 12 SICE เป็นแกน Intelligence — ไม่ใช่ 10 layers |
| **§5 5 Navigation** | 5 แท็บ: วันนี้ / สำรวจ / TWIN / กิจกรรม / ฉัน |
| **§6 Twin อยู่ตรงกลาง** | Twin อยู่กลาง Navigation — เป็น focal point |
| **§7 Growth 5 Stages** | Twin มี 5 Growth Stages — ไม่ใช่ 3 |
| **§8 Gamification** | Gamification = ระบบสนับสนุน Twin Development — ไม่ใช่เกม |
| **§9 Digital Assets** | Purchase → Ownership → Entitlement → Use |
| **§10 Human Expert** | Premium hourly — แยกจาก AI |
| **§11 Trial** | 7-14 days Full Capability Trial |
| **§12 Viral Loop** | Insight → Share → Organic Discovery |
| **§13 SEO/GEO** | Semantic HTML, SSR/SSG, JSON-LD, Sitemap |
| **§14 Public/Private** | PRIVATE INTELLIGENCE ≠ PUBLIC SHARE |
| **§15 17 Phases** | 17-Phase Master Development Roadmap |
| **§16 User > AI** | AI ห้าม override การเลือกของผู้ใช้ |
| **§17 Feedback Loop** | ทุก Insight ต้องมีปุ่ม Feedback |
| **§18 No Hardcode Color** | ใช้ `var(--exp-*)` เท่านั้น |
| **§19 Depth, not Identity** | Basic Identity ฟรีตลอดไป |

---

## 🚀 การตั้งค่า Development Environment

### 1. Clone Project

```bash
git clone https://github.com/duriankab-dot/selfprint-v3-react.git
cd selfprint-v3-react
2. Install Dependencies
bash
npm install
3. Environment Variables
bash
cp .env.example .env.local
Variable	Description
VITE_SUPABASE_URL	Supabase URL
VITE_SUPABASE_ANON_KEY	Supabase Anon Key
VITE_CLAUDE_API_KEY	Claude API Key
VITE_STRIPE_PUBLISHABLE_KEY	Stripe Publishable Key
STRIPE_SECRET_KEY	Stripe Secret Key
STRIPE_WEBHOOK_SECRET	Stripe Webhook Secret
4. Start Development Server
bash
npm run dev
📂 โครงสร้างโปรเจกต์
text
src/
├── pages/               # 20+ หน้า
│   ├── Dashboard.tsx    # วันนี้ (Dynamic Home)
│   ├── Twin.tsx         # AI ฝาแฝด (ศูนย์กลาง)
│   ├── Explore.tsx      # สำรวจตัวเอง
│   ├── Activities.tsx   # กิจกรรม
│   └── Me.tsx           # ฉัน
├── components/          # 50+ Components
│   ├── features/       # Feature-specific
│   ├── intelligence/   # 12 SICE UI
│   ├── dashboard/      # Dashboard components
│   └── composites/     # Shared UI
├── lib/
│   ├── intelligence/   # 12 SICE Engines
│   ├── supabase/       # Supabase client
│   └── context/        # React Context
├── hooks/              # Custom Hooks
└── styles/             # Global Styles

docs/
├── AI_CONTEXT.md       # Operational AI Constitution
├── MASTER_PRD.md       # Product Source of Truth
├── PROJECT_SUMMARY.md  # Project Overview
├── CODEBASE_MAP.md     # Code Structure
└── ... (other docs)
🧠 12 SICE — Core Intelligence
#	Engine	หน้าที่
1	PersonalContextBuilder	สังเคราะห์ข้อมูลผู้ใช้
2	PatternDetector	ตรวจจับรูปแบบ
3	InsightEngine	สร้าง Insight
4	AIFeedbackLoop	ปรับ Personal Model
5	TwinStateEngine	คำนวณสถานะ Twin
6	ExperienceEngine	เลือกประสบการณ์
7	EnvironmentEngine	ปรับ Environment
8	BadgeEngine	ติดตาม Achievement
9	BehavioralForecastEngine	ทำนายทิศทาง
10	FutureSelfEngine	Future Self
11	MemoryManager	จัดการความจำ
12	DecisionIntelligenceEngine	วิเคราะห์การตัดสินใจ
✅ การเขียนโค้ด
TypeScript
typescript
// ✅ ถูกต้อง
interface UserProfile {
  id: string
  name: string
  email: string
}

// ❌ ผิด
const user: any = { name: 'John' }
CSS Variables
css
/* ✅ ถูกต้อง */
.element {
  color: var(--exp-primary);
  background: var(--tod-bg);
}

/* ❌ ผิด */
.element {
  color: #3b82f6;
}
Components
typescript
// ✅ ถูกต้อง
export const MyComponent: React.FC<Props> = ({ children }) => {
  return <div>{children}</div>
}

// ❌ ผิด
function MyComponent(props) {
  return <div>{props.children}</div>
}
🧪 การทดสอบ
Unit Tests
bash
npm test
Build
bash
npm run build
Lint
bash
npm run lint
📝 Pull Request Process
1. Branch
bash
git checkout -b feature/your-feature
2. Commit Message
text
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: maintenance
3. Push
bash
git push origin feature/your-feature
4. Pull Request
ระบุสิ่งที่ทำ

ระบุสิ่งที่ทดสอบ

ระบุเอกสารที่อัปเดต

📚 เอกสารที่ต้องอัปเดต
เมื่อเพิ่มฟีเจอร์ใหม่:

เอกสาร	เมื่อใด
MASTER_PRD.md	เพิ่ม FR ใหม่
PROJECT_SUMMARY.md	อัปเดตสถานะ
CODEBASE_MAP.md	ถ้ามีไฟล์/โฟลเดอร์ใหม่
USER_GUIDE_TH.md	เพิ่มคำอธิบายฟีเจอร์
CHANGELOG.md	บันทึกการเปลี่ยนแปลง
🔍 Checklist ก่อนส่ง PR
□ อ่าน AI_CONTEXT.md ครบแล้ว
□ TypeScript 0 errors
□ Lint 0 errors
□ Build สำเร็จ
□ ทดสอบ manual แล้ว
□ อัปเดตเอกสารที่เกี่ยวข้อง
□ Commit message ชัดเจน
อัปเดตล่าสุด: 14 สิงหาคม 2569