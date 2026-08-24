# Local Development Setup

Get SELFPRINT running locally in **5 minutes**.

---

## Prerequisites

- **Node.js** 18+ (check: `node --version`)
- **npm** 9+ (check: `npm --version`)
- **Git** 2.30+ (check: `git --version`)
- **Supabase account** (free tier OK — for local, use `.env.local`)

---

## Installation

### 1. Clone & Install

```bash
cd D:\selfprint-v3-react
npm install
```

**Takes:** ~2 mins  
**Check:** No red errors, only warnings OK

### 2. Environment Setup

Create `.env.local` in project root:

```bash
# Supabase (use your test project credentials)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Claude API (for /api/twin, /api/nova)
ANTHROPIC_API_KEY=sk-ant-xxx

# App config
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

### 3. Start Dev Server

```bash
npm run dev
```

**Output:**
```
  VITE v5.x.x  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

✅ Open `http://localhost:5173/` — should see Landing Page

---

## Common Commands

### Development

```bash
# Start dev server (with hot reload)
npm run dev

# Run type checker
npm run tsc

# Run tests (all 101)
npm test

# Run linter + formatter check
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file change)
npm test -- --watch

# Run specific test file
npm test -- twin.spec.ts

# Generate coverage report
npm test -- --coverage
```

### Debugging

```bash
# Open Vitest UI (visual test runner)
npm test -- --ui

# Check TypeScript errors (no emit)
npm run tsc

# Run ESLint to find issues
npm run lint
```

---

## Project Structure

```
src/
├── pages/               # Route pages (TwinChat, Dashboard, etc.)
├── components/          # Reusable UI components
├── services/            # API calls, Supabase queries
├── context/             # React Context (Auth, Twin, World)
├── store/               # Zustand stores (analysisStore, userStore, etc.)
├── lib/
│   ├── intelligence/    # SICE Engines, PatternDetector
│   ├── memory/          # Memory loading/persistence
│   └── twin/            # Twin visual DNA, uniqueness
├── styles/              # Global CSS + component styles
├── api/                 # Edge function handlers (twin.ts, nova.ts)
└── constants/           # Static data (WORLDS, archetypes)

public/
├── index.html           # Entry point
├── sitemap.xml          # SEO
└── robots.txt           # SEO

docs/                    # This documentation
```

---

## Database Setup (Supabase)

1. Create free Supabase project: https://app.supabase.com
2. Copy credentials to `.env.local`
3. Tables auto-sync on first login (via `supabase-service.ts` migrations)

**Main tables:**
- `user_profiles` — User account data
- `twins` — Twin instances
- `personal_memory` — Stored memories
- `profiles_blueprints` — Analysis results
- `decisions` — Decision logs

---

## Troubleshooting

### "Cannot find module" error

```bash
# Clear node_modules + reinstall
rm -r node_modules
npm install
```

### Port 5173 already in use

```bash
# Use different port
npm run dev -- --port 3001
```

### Type errors ("TS2307: Cannot find module")

```bash
# Run type check
npm run tsc

# Should show specific file + line number
```

### Tests failing

```bash
# Run one test at a time
npm test -- twin.spec.ts

# Check test output for actual vs expected
```

### Supabase connection refused

- Check `.env.local` has correct `VITE_SUPABASE_URL` and key
- Verify Supabase project is active
- Try: `npm run build` (checks secrets at build time)

---

## First Run Checklist

- [ ] `npm install` completes
- [ ] `.env.local` created with Supabase credentials
- [ ] `npm run dev` starts on localhost:5173
- [ ] Landing page loads (no errors in console)
- [ ] `npm test` passes all 101 tests
- [ ] `npm run build` completes with no errors

**If all ✅, you're ready to code!**

---

## Next Steps

- Read [TECH_STACK.md](./TECH_STACK.md) for stack details
- Check [ARCHITECTURE/README.md](./ARCHITECTURE/README.md) for design
- Review `/CLAUDE.md` for coding rules
- Start on a task from the backlog

---

## Getting Help

1. Check error message carefully (includes file + line)
2. Search in [ARCHITECTURE/README.md](./ARCHITECTURE/README.md)
3. Ask in team chat with error output + reproduction steps
4. Last resort: Run with `DEBUG=*` for verbose logs

---

**Estimated first run time:** 5-10 minutes  
**Most common issue:** `.env.local` missing or wrong credentials  
**When in doubt:** `npm install && npm run dev`
