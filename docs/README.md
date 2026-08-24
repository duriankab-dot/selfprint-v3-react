# SELFPRINT V3 Documentation

**Living Personal Intelligence Platform** — AI Twin that learns from your real decisions.

---

## 🚀 Quick Start

1. **New Developer?** → [SETUP.md](./SETUP.md) — local dev in 5 mins
2. **Want Architecture?** → [ARCHITECTURE.md](./ARCHITECTURE/README.md) — design decisions
3. **Building an API?** → [API/README.md](./API/README.md) — endpoint reference
4. **Need Tech Details?** → [TECH_STACK.md](./TECH_STACK.md) — frontend/backend/db

---

## 📚 Documentation Structure

```
docs/
├── README.md                  ← You are here
├── SETUP.md                   # Local development setup
├── TECH_STACK.md              # Technology choices & versions
├── DEPLOYMENT.md              # Vercel deploy flow
│
├── API/
│   ├── README.md              # API overview (rate limits, auth)
│   ├── TWIN.md                # POST /api/twin endpoint
│   ├── NOVA.md                # POST /api/nova endpoint
│   └── HANDLERS.md            # Unified handlers + middleware
│
└── ARCHITECTURE/
    ├── README.md              # Architecture overview
    ├── TWIN_VS_NOVA.md        # Why Sonnet vs Haiku
    ├── DATA_FLOW.md           # User → Analysis → Twin birth
    └── STATE_MANAGEMENT.md    # Zustand stores & contexts
```

---

## 🎯 Current Status (2026-08-24)

**Build:** ✅ TypeScript clean | 101/101 tests  
**Deploy:** Production-ready

### ✅ COMPLETED (This Session)

| Priority | Feature | Status |
|----------|---------|--------|
| P-1 | analysisStore persistence | ✅ Fixed |
| P-2 | Astrology funnel conversion | ✅ Fixed |
| P-3 | Dashboard Twin evolution | ✅ Fixed |
| P-5 | Sitemap consistency | ✅ Fixed |

### 🟡 IN PROGRESS

| Priority | Feature | Notes |
|----------|---------|-------|
| P-4 | E2E Tests | Files exist, need verification |
| P-6 | Documentation | This file + consolidation |

### 🔴 BLOCKED

- P-4: E2E smoke tests need OG endpoint verification
- P-6: API docs need finalization

---

## 🏗️ Architecture at a Glance

### Core Components

**Twin (Personal AI):**
- Model: Claude 3.5 Sonnet
- Context: Full user profile (archetype, strengths, blindSpots, birthData)
- Rate: 40 req/min per user
- File: `src/api/twin.ts`

**Nova (Guidance AI):**
- Model: Claude 3.5 Haiku
- Context: No user profile (universal guide)
- Rate: 60 req/min per user
- File: `src/api/nova.ts`

**Frontend (React 18):**
- State: Zustand stores (userStore, analysisStore, lifecycleStore, useTwin context)
- Styling: Tailwind CSS + CSS variables
- Testing: Vitest (unit), Playwright (E2E)

**Database: PostgreSQL (Supabase)**
- Tables: twins, user_profiles, personal_memory, profiles_blueprints, decisions, twin_world_expertise
- RLS: All tables row-level secured per user_id

**Deploy: Vercel Edge Functions**
- `/api/twin` → runs Sonnet
- `/api/nova` → runs Haiku
- SSG + ISR for landing pages

---

## 💾 Key Data Models

### Twin Profile
```typescript
{
  name: string;
  primaryArchetype: Archetype; // e.g., "visionary"
  secondaryArchetype?: Archetype;
  maturityScore: 0-100; // Evolution stage
  birthDate?: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  birthPlace?: string;
  strengths: [{name, description, confidence}];
  blindSpots: [{title, description, sensitivity, confidence}];
  selfOverview: string;
  guidance: string[];
}
```

### FullAnalysisOutput
```typescript
{
  selfOverview: string;
  behavioralPatterns: [{name, description, type, confidence}];
  strengths: [{name, description, confidence, evidence}];
  blindSpots: [{title, description, sensitivity, confidence}];
  trends: [{description, insight, since, confidence}];
  journey: {currentStage, description, growing[], changing[], stillWorking[]};
  focusAreas: string[];
  guidance: string[];
  nextSteps: string[];
  generatedAt: Date;
  modelAccuracy: 0-1;
  sourceCount: number;
}
```

---

## 📖 How to Use This Documentation

1. **Just deployed?** → [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Stuck on API?** → Search [API/README.md](./API/README.md)
3. **Questions about Twin?** → [ARCHITECTURE/TWIN_VS_NOVA.md](./ARCHITECTURE/TWIN_VS_NOVA.md)
4. **Need to add a feature?** → Read [ARCHITECTURE/DATA_FLOW.md](./ARCHITECTURE/DATA_FLOW.md) first
5. **Debugging state?** → [ARCHITECTURE/STATE_MANAGEMENT.md](./ARCHITECTURE/STATE_MANAGEMENT.md)

---

## 🔗 Related Files

- **Latest Handoff**: `/memory/HANDOFF_2026-08-23.md` (session notes)
- **Gap Analysis**: `/src/P0A_GAP_ANALYSIS.md` (known issues)
- **Project Status**: `/memory/projects/selfprint-v3.md` (long-term roadmap)
- **Code of Conduct**: `/CLAUDE.md` (development rules)

---

## ✋ Contributing

Before opening a PR:

1. Follow [SETUP.md](./SETUP.md) to get local dev working
2. Run `npm test` (must pass all 101 tests)
3. Run `npm run build` (TypeScript clean)
4. Read [ARCHITECTURE/README.md](./ARCHITECTURE/README.md) for context
5. Follow code discipline rules in `/CLAUDE.md`

---

## ❓ FAQ

**Q: Where's the API documentation?**  
A: [API/README.md](./API/README.md)

**Q: How do I run locally?**  
A: [SETUP.md](./SETUP.md)

**Q: Why Sonnet for Twin, Haiku for Nova?**  
A: [ARCHITECTURE/TWIN_VS_NOVA.md](./ARCHITECTURE/TWIN_VS_NOVA.md)

**Q: How does Twin know about the user?**  
A: [ARCHITECTURE/DATA_FLOW.md](./ARCHITECTURE/DATA_FLOW.md)

**Q: What Zustand stores exist?**  
A: [ARCHITECTURE/STATE_MANAGEMENT.md](./ARCHITECTURE/STATE_MANAGEMENT.md)

---

**Last Updated:** 2026-08-24  
**Status:** ✅ Production  
**Maintained by:** AI Dev + Senior Developer
