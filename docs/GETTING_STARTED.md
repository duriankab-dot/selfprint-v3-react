# 🚀 Getting Started with SELFPRINT V3

**Personal Intelligence Platform** — Your Living Twin Awakening System

---

## **⚡ Quick Start (5 minutes)**

### Prerequisites
```bash
Node.js: v20+ (check: node -v)
npm: v10+ (check: npm -v)
Git: latest (check: git --version)
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/selfprint-v3-react.git
cd selfprint-v3-react

# 2. Install dependencies (exact versions via npm ci)
npm ci

# 3. Environment setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run development server
npm run dev
# Open http://localhost:5173
```

---

## **📋 Essential Commands**

### Development
```bash
npm run dev              # Start dev server (Vite)
npm run build            # TypeScript build + Vite bundle
npm run lint             # ESLint + Prettier check
npm run test             # Unit tests (Vitest)
npm run test:e2e         # End-to-end tests (Playwright)
```

### Production
```bash
npm ci                   # Install exact versions (not npm install)
npm run build            # Production build
npm audit                # Security check (CVEs)
```

---

## **🔧 Environment Variables**

Create `.env.local` in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_URL=http://localhost:3000

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=info
```

**Never commit `.env.local`** — use `.env.example` as template.

---

## **📁 Project Structure**

```
selfprint-v3-react/
├── src/
│   ├── components/          # React UI components
│   ├── pages/               # Page components (routing)
│   ├── services/            # Business logic & APIs
│   │   ├── TwinSupabaseService.ts
│   │   ├── CoreAwakeningService.ts
│   │   ├── SICEOrchestrator.ts
│   │   └── supabase-service.ts
│   ├── context/             # React Context (state)
│   ├── lib/                 # Utilities & helpers
│   ├── types/               # TypeScript interfaces
│   └── App.tsx              # Root component
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge functions
├── tests/
│   ├── e2e/                 # Playwright tests
│   └── unit/                # Vitest tests
├── docs/                    # Documentation (this folder)
├── .npmrc                   # npm configuration (P4 hardening)
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite build config
└── README.md                # Project overview
```

---

## **🔐 Authentication**

SELFPRINT uses **Supabase Auth** (email + password):

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

---

## **💾 Database Setup**

Supabase PostgreSQL database with RLS (Row Level Security):

```bash
# Run migrations (auto-applied on Supabase)
npm run supabase:migrate

# View migrations applied
ls supabase/migrations/
```

Key tables:
- `users` — User profiles
- `awakening_essence` — Essence data from SICE orchestration
- `twins` — Living Twin records
- `twin_memories` — Twin conversation history
- `twin_sice_scores` — SICE engine baseline scores
- `personal_contexts` — User context & preferences

---

## **🧪 Testing**

### Run All Tests
```bash
npm test                    # Unit tests (Vitest)
npm run test:e2e            # E2E tests (Playwright)
npm run test:e2e -- --watch # Watch mode
```

### Key E2E Tests
- `Twin Creation & Chat Flow › core awakening flow - twin creation` (2.4s)
- `Twin Creation & Chat Flow › twin personality context switching` (2.7s)
- `Image Upload & Handling › upload profile picture` (3.8s)

---

## **🚨 Common Issues**

### Issue: `npm ci` fails with peer dependency warning
**Solution:** Already configured in `.npmrc` via `legacy-peer-deps=true`

### Issue: Supabase connection error
**Solution:** 
1. Check `.env.local` has correct `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
2. Verify Supabase project is running
3. Check RLS policies allow your user

### Issue: TypeScript compilation error
**Solution:**
```bash
npm run build              # Full build with type check
npx tsc --noEmit          # Type check only
```

### Issue: Port 5173 already in use
**Solution:**
```bash
npm run dev -- --port 3000  # Use different port
```

---

## **📚 Next Steps**

- **Architecture Overview** → See `docs/ARCHITECTURE.md`
- **API Documentation** → See `docs/API.md`
- **Deployment Guide** → See `docs/DEPLOYMENT.md`
- **Security & CVEs** → See `docs/SECURITY.md`

---

## **🤝 Support**

- Issues: Create GitHub issue
- Documentation: See `docs/` folder
- Code Examples: Check `src/` folder and tests

---

**Last Updated:** 2026-08-24  
**Status:** ✅ Production Ready (PHASE A + P3 verified)
