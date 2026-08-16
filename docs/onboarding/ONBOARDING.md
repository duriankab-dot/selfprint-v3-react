# 👋 SELFPRINT — DEVELOPER ONBOARDING

**Welcome to Selfprint!** This guide will get you from zero to productive in 2 hours.

---

## 🚀 First Time Setup (15 minutes)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/duriankab-dot/selfprint-v3-react.git
cd selfprint-v3-react

# Install dependencies
npm install

# Create .env.local (copy from .env.example)
cp .env.example .env.local

# Run development server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 2. Verify Setup
- Open http://localhost:5173/ in your browser
- You should see the Selfprint homepage
- No console errors (check browser DevTools)

### 3. Create Vercel Alias (if deploying)
```bash
# Link your Vercel account
vercel link

# This ensures environment variables sync correctly
```

---

## 📖 Read in This Order (90 minutes)

Follow [docs/onboarding/READING_LIST.md](READING_LIST.md) in this sequence:

1. **Phase 1 (30 min):** Core Vision
   - README.md
   - SELFPRINT_PROJECT_CODEX.md ⭐

2. **Phase 2 (20 min):** Development Rules
   - AI CONTEXT.md
   - CONTRIBUTING.md

3. **Phase 3 (45 min):** Execution
   - SELFPRINT_EXECUTION_CHECKLIST_v1.0.md
   - SELFPRINT_COMPLETE_GAP_MAP_v1.0.md

**After reading:** You understand what Selfprint is and what needs to be built.

---

## 🧠 Key Concepts to Internalize

### 🔴 §1: Nova ≠ AI Twin
**This is critical.** They are NOT the same:

| Aspect | Self Print (Nova) | AI Twin |
|--------|-------------------|---------|
| **What is it?** | Universal AI guide (exists from day 1) | User's personal AI (born at Core Awakening) |
| **Who has it?** | Everyone meets the same Nova | Each user has their own Twin |
| **Role** | Onboard, collect data, analyze | Live with user, learn from them, evolve |
| **Birth** | Built into Selfprint system | Born from user's own data (WOW 3) |
| **Code** | `src/components/chat/NovaChat.tsx` | `src/components/chat/TwinChat.tsx` |

**Rule §1:** Never confuse them. Ever.

### 🎯 The Three Acts
Every user goes through three experiences:

1. **ACT I: Self Print** (Days 1–7)
   - Guided discovery through 6 questions
   - Data collection from daily emotions & journal
   - First insights (WOW 1) → Pattern detection
   - Deep analysis (WOW 2) → Twin readiness
   - "Your intelligence core is ready to awaken"

2. **ACT II: Core Awakening** (The Transition)
   - Hologram birth animation
   - Twin appears for first time
   - "I'm you, learning from you"
   - User names their Twin
   - Connection established

3. **ACT III: Living with Twin** (Days 8+)
   - Chat, journal, reflect with Twin
   - 12 Worlds exploration (Intelligence categories)
   - Gamification through Actions (Do/Reflect/Practice)
   - Growth through decision tracking
   - Long-term intelligence building

### 12 SICE (Selfprint Intelligence Core Engines)
These 12 engines work together to understand and assist users:

1. **Emotion Engine** — Recognizes emotional patterns
2. **Memory Engine** — Recalls past interactions & decisions
3. **Insight Engine** — Generates meaningful discoveries
4. **Learning Engine** — Adapts to user behavior over time
5. **Prediction Engine** — Forecasts user needs & decisions
6. **Reflection Engine** — Prompts deep thinking
7. **Growth Engine** — Tracks personal development
8. **Decision Engine** — Helps decision-making processes
9. **Connection Engine** — Links related insights
10. **Expert Engine** — Routes to domain expertise (when needed)
11. **Gamification Engine** — Motivates through challenges & rewards
12. **Evolution Engine** — Evolves Twin's understanding & personality

**All 12 work in concert** from day 1. The Twin doesn't "get smarter" — it's always intelligent.

### 5-Tab Navigation
Every user sees 5 tabs:

| Tab | Icon | Purpose | Center of Experience? |
|-----|------|---------|----------------------|
| **วันนี้** | Calendar | Daily personal home | No |
| **สำรวจ** | Compass | Discover yourself | No |
| **TWIN** | Heart/Brain | Chat with your AI | **YES ⭐** |
| **กิจกรรม** | Rocket | Do/Reflect/Practice | No |
| **ฉัน** | User | Personal settings | No |

**Rule §6:** The TWIN tab is the focal point. Everything feeds into it.

### 12 Worlds
Users explore their intelligence through 12 domains:

1. **Career & Calling** — Professional identity & growth
2. **Relationships** — Connections & intimacy
3. **Health & Vitality** — Physical & mental wellbeing
4. **Learning & Growth** — Knowledge & skill building
5. **Creativity & Expression** — Artistic & innovative self
6. **Finance & Abundance** — Money & resources
7. **Purpose & Meaning** — Life direction & values
8. **Community & Impact** — Social contribution
9. **Mind & Consciousness** — Awareness & meditation
10. **Experience & Adventure** — Living fully
11. **Time & Energy** — Management & optimization
12. **Legacy & Evolution** — Long-term impact

Each World has unique Insights, Challenges, and Actions. The SICE system helps explore all 12.

---

## 🛠️ Developer Workflow

### Daily Standup
**What to update:**
1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers?
4. Reference the EXECUTION_CHECKLIST for phases

### Creating a Feature
**Follow this process:**

1. **Pick a task** from `SELFPRINT_EXECUTION_CHECKLIST_v1.0.md`
2. **Check the gap analysis** in `SELFPRINT_COMPLETE_GAP_MAP_v1.0.md`
3. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Follow code discipline** from `docs/development/CODE_DISCIPLINE.md`
5. **Test thoroughly** following `docs/development/TESTING_STRATEGY.md`
6. **Commit with discipline** (see `docs/development/GIT_WORKFLOW.md`)
7. **Push & create PR** with description
8. **Request review** (at least 1 approval before merge)

### Code Review Checklist
**Before approving a PR:**
- [ ] Code follows CODE_DISCIPLINE.md
- [ ] No hardcoded colors (use var(--exp-*))
- [ ] Tests are added/updated
- [ ] Commit messages are clear
- [ ] CONTRIBUTING.md rules (§1–§19) are followed
- [ ] Component matches ARCHITECTURE.md structure
- [ ] TypeScript has no implicit any
- [ ] Bundle size not increased significantly

---

## 📚 Essential Files Reference

### Project Documentation
| File | Purpose | Read First? |
|------|---------|------------|
| `docs/SELFPRINT_PROJECT_CODEX.md` | Complete project blueprint | ⭐ YES |
| `docs/SELFPRINT_EXECUTION_CHECKLIST_v1.0.md` | Phased task breakdown | ⭐ YES |
| `docs/SELFPRINT_COMPLETE_GAP_MAP_v1.0.md` | Technical gap analysis | ⭐ YES |

### Development Guides
| File | Purpose |
|------|---------|
| `docs/development/ARCHITECTURE.md` | Codebase structure |
| `docs/development/CODE_DISCIPLINE.md` | Coding standards |
| `docs/development/GIT_WORKFLOW.md` | Git & PR process |
| `docs/development/TESTING_STRATEGY.md` | Testing approach |

### AI & Context
| File | Purpose |
|------|---------|
| `AI_CONTEXT.md` | AI model's project understanding |
| `CONTRIBUTING.md` | Development rules (§1–§19) |

### Configuration
| File | Purpose |
|------|---------|
| `.env.example` | Required environment variables |
| `package.json` | Dependencies & scripts |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS configuration |

---

## 🔑 Environment Variables

### Required Variables
```bash
# .env.local should contain:

# Backend API
VITE_API_BASE_URL=http://localhost:3001

# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude AI API (for AI features)
VITE_CLAUDE_API_KEY=your_claude_api_key

# Stripe (for payments)
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id
```

**Note:** Copy from `.env.example` and fill in your values.

---

## ✅ Onboarding Verification Checklist

Verify you're ready to start development:

- [ ] Repository cloned locally
- [ ] `npm install` completed without errors
- [ ] `npm run dev` runs successfully
- [ ] Browser opens to http://localhost:5173/ without errors
- [ ] `.env.local` created and configured
- [ ] Read SELFPRINT_PROJECT_CODEX.md (25 min)
- [ ] Read CONTRIBUTING.md (10 min)
- [ ] Understand Nova ≠ Twin distinction
- [ ] Know the 3 Acts of the experience
- [ ] Understand the 12 Worlds framework
- [ ] Understand the 5-Tab navigation
- [ ] Read SELFPRINT_EXECUTION_CHECKLIST_v1.0.md
- [ ] Picked your first task
- [ ] Read ARCHITECTURE.md (understand code structure)
- [ ] Read CODE_DISCIPLINE.md (understand coding standards)
- [ ] Created your first feature branch
- [ ] Ready to code!

---

## 🚨 Common Mistakes to Avoid

1. **❌ Confusing Nova and Twin**
   - ✅ Remember: Nova = guide, Twin = user's personal AI

2. **❌ Building features outside the 3 Acts**
   - ✅ Everything should fit into Act I (Self Print), Act II (Awakening), or Act III (Living with Twin)

3. **❌ Hardcoding colors or using tailwind directly**
   - ✅ Use `var(--exp-*)` CSS variables only

4. **❌ Not writing tests**
   - ✅ Write tests as you code, reference TESTING_STRATEGY.md

5. **❌ Skipping code review**
   - ✅ Always get at least 1 approval before merging

6. **❌ Not reading the gap analysis**
   - ✅ SELFPRINT_COMPLETE_GAP_MAP_v1.0.md tells you exactly what's missing

7. **❌ Committing without clear messages**
   - ✅ Use the format from GIT_WORKFLOW.md

---

## 🆘 Getting Help

**Question Type** | **Where to Look**
--|--
"What is Selfprint?" | SELFPRINT_PROJECT_CODEX.md
"What should I build?" | SELFPRINT_EXECUTION_CHECKLIST_v1.0.md
"Why is something missing?" | SELFPRINT_COMPLETE_GAP_MAP_v1.0.md
"How do I code this?" | CODE_DISCIPLINE.md + ARCHITECTURE.md
"What are the rules?" | CONTRIBUTING.md (§1–§19)
"How do I git/PR?" | GIT_WORKFLOW.md
"What should I test?" | TESTING_STRATEGY.md
"Project context for AI?" | AI_CONTEXT.md

---

## 📞 Next Steps

1. **Verify setup:** Run `npm run dev` and confirm no errors
2. **Start reading:** Follow [READING_LIST.md](READING_LIST.md)
3. **Pick a task:** Open `docs/SELFPRINT_EXECUTION_CHECKLIST_v1.0.md` (Week 1)
4. **Create your branch:** `git checkout -b feature/your-first-task`
5. **Start coding:** Follow CODE_DISCIPLINE.md and ARCHITECTURE.md
6. **Create a PR:** Reference GIT_WORKFLOW.md for format

**Welcome aboard! 🚀**

---

**Last Updated:** 16 August 2026  
**CODEX Version:** v2.0  
**Setup Time:** ~2 hours first time, then ~10 min daily
