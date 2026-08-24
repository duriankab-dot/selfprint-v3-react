# Technology Stack

SELFPRINT V3 uses modern, production-proven technologies optimized for real-time AI interactions.

---

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI framework |
| TypeScript | 5.3+ | Type safety |
| Vite | 5.x | Build tool (instant HMR) |
| Tailwind CSS | 3.4+ | Styling + design tokens |
| React Router | 6.x | Routing |
| Zustand | 4.x | State management |
| React Query | 5.x | Server state + caching |
| Vitest | 1.0+ | Unit testing |
| Playwright | 1.4+ | E2E testing |

### Key Packages

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.x",
  "zustand": "^4.x",
  "@tanstack/react-query": "^5.x",
  "@supabase/supabase-js": "^2.x",
  "typescript": "^5.3"
}
```

---

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.x | (optional middleware) |
| Claude API | 3.5 Sonnet/Haiku | LLM |
| Supabase | v2 | PostgreSQL + Auth |
| Vercel Edge | Latest | Serverless functions |

### API Endpoints

```
POST /api/twin          → Claude Sonnet (personal expert)
POST /api/nova          → Claude Haiku (universal guide)
POST /api/unified-handler → Combined Twin + Nova routing
```

---

## Database

| Component | Tech | Notes |
|-----------|------|-------|
| Database | PostgreSQL 14+ | Hosted on Supabase |
| Auth | Supabase Auth | JWT + RLS |
| Real-time | Supabase Realtime | WebSocket for live updates |
| Storage | Supabase Storage | For user-generated content |

### Key Tables

- `user_profiles` — User account data, birth info
- `twins` — Twin instances per user
- `personal_memory` — User memories/reflections
- `profiles_blueprints` — Analysis results + SICE outputs
- `decisions` — Decision logs + outcomes
- `twin_world_expertise` — Per-world skill tracking
- `chat_messages` — Message history

---

## Deployment

| Service | Purpose | Cost |
|---------|---------|------|
| Vercel | Frontend hosting + Edge Functions | ~$10-50/mo |
| Supabase | Database + Auth | ~$25-50/mo (free tier available) |
| Anthropic API | Claude API calls | $0.01-0.03 per 1K tokens |

### Build Pipeline

```
1. GitHub commit
   ↓
2. Vercel detects change
   ↓
3. npm install + npm run build
   ↓
4. TypeScript type check
   ↓
5. ESLint validation
   ↓
6. Tests run (Vitest)
   ↓
7. If all pass → Deploy to Vercel Edge
   ↓
8. If failed → Reject + notify
```

---

## Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version control |
| npm | Package manager |
| Vite Dev Server | Local dev (port 5173) |
| Chrome DevTools | Browser debugging |
| Vitest UI | Visual test runner |
| TypeScript Server | IDE type hints |

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| FCP | < 1s | ✅ ~0.8s |
| LCP | < 2.5s | ✅ ~1.2s |
| INP | < 200ms | ✅ ~80ms |
| CLS | < 0.1 | ✅ ~0.05 |
| Build time | < 60s | ✅ ~32s |
| Test suite | < 30s | ✅ ~15s |

---

## Code Quality Standards

| Tool | Config | Purpose |
|------|--------|---------|
| TypeScript | `tsconfig.json` | Strict mode enabled |
| ESLint | `.eslintrc.cjs` | Code consistency |
| Prettier | `.prettierrc` | Auto-formatting |
| Vitest | `vitest.config.ts` | Test configuration |

---

## Security

| Layer | Implementation |
|-------|-----------------|
| Auth | Supabase JWT tokens |
| Database | Row-level security (RLS) |
| API | Rate limiting (40-60 req/min) |
| Secrets | `.env.local` (not committed) |
| HTTPS | Automatic on Vercel |

---

## Scaling Considerations

**Current:**
- Single Vercel deployment
- Supabase free → pro tier
- Claude API standard rate limits

**Future:**
- Redis for caching
- Message queue (Bull/Celery)
- Database read replicas
- CDN for static assets
- Background job workers

---

## Browser Support

- **Chrome/Edge** 90+
- **Firefox** 88+
- **Safari** 14+
- **Mobile** iOS Safari 14+, Chrome Android

---

## Related Files

- `.npmrc` — npm configuration
- `.env.local` — Local secrets (not committed)
- `.env.example` — Template for `.env.local`
- `.github/workflows/` — CI/CD configuration
- `tsconfig.json` — TypeScript configuration
- `vite.config.ts` — Build configuration

---

**Last Updated:** 2026-08-24  
**Stack Frozen:** For SELFPRINT V3 production
