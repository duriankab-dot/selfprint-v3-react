# Selfprint — Living Personal Intelligence Platform

แพลตฟอร์มที่ใช้ **Nova (AI Guide)** ช่วยให้ผู้ใช้สร้าง **AI Twin** (ฝาแฝดเวอร์ชันดิจิทัลของคุณ) ที่เรียนรู้จากคุณสะสมตลอดเวลา

---

## 📖 START HERE — CODEX v2.0

**Source of Truth:** [docs/SELFPRINT_PROJECT_CODEX.md](docs/SELFPRINT_PROJECT_CODEX.md) (English) | [docs/SELFPRINT_PROJECT_CODEX_TH.md](docs/SELFPRINT_PROJECT_CODEX_TH.md) (Thai)

### 🎯 Developer Path (ทำตามลำดับ)

1. **Read:** [docs/SELFPRINT_PROJECT_CODEX.md](docs/SELFPRINT_PROJECT_CODEX.md) — Complete project blueprint
2. **Understand:** [docs/onboarding/READING_LIST.md](docs/onboarding/READING_LIST.md) — Essential docs in order
3. **Execute:** [docs/SELFPRINT_EXECUTION_CHECKLIST_v1.0.md](docs/SELFPRINT_EXECUTION_CHECKLIST_v1.0.md) — Phase checklist
4. **Reference:** [docs/SELFPRINT_COMPLETE_GAP_MAP_v1.0.md](docs/SELFPRINT_COMPLETE_GAP_MAP_v1.0.md) — Feature gap analysis

### 📚 Documentation Structure

| Folder | Purpose |
|--------|---------|
| `docs/onboarding/` | Developer onboarding & alignment |
| `docs/development/` | Code guidelines, architecture, testing |
| `docs/reference/` | Complete project specifications |
| `docs/archive/` | Deprecated/historical documents |

---

## 🔴 Nova ≠ AI Twin

| บุคลิก | บทบาท |
|--------|-------|
| **Nova** | AI Guide — ผู้แนะนำที่มีอยู่ในระบบ |
| **AI Twin** | AI ฝาแฝดส่วนตัว — เกิดหลัง Core Awakening (WOW 3) |

---

## 🚀 Quick Start

```bash
# Clone project
git clone https://github.com/duriankab-dot/selfprint-v3-react.git
cd selfprint-v3-react

# Install dependencies
npm install

# Create .env.local from .env.example
cp .env.example .env.local

# Run development server
npm run dev
```

---

## 🧠 Architecture

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS  
**State:** Zustand + React Query  
**Backend:** Express.js (Node)  
**Database:** Supabase (PostgreSQL + Auth)  
**AI:** 12 SICE (Selfprint Intelligence Core Engines) + Claude API  
**Payment:** Stripe  
**Deploy:** Vercel  

---

## 🗺️ 5-Navigation Architecture

| # | Tab | Purpose |
|---|-----|---------|
| 1 | วันนี้ | Dynamic Personal Home |
| 2 | สำรวจ | Discover yourself |
| 3 | **TWIN** | **Chat with AI Twin (center)** |
| 4 | กิจกรรม | Do / Reflect / Practice |
| 5 | ฉัน | Personal control |

---

## 🔑 Environment Variables

See `.env.example` for required environment variables.

---

## 📞 Contact & Links

- **GitHub:** https://github.com/duriankab-dot/selfprint-v3-react
- **Production:** https://selfprint.one
- **Documentation:** Start with SELFPRINT_PROJECT_CODEX.md

**Last Updated:** 16 สิงหาคม 2569 (CODEX v2.0)