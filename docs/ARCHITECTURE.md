# 🏗️ Architecture Overview

**System Design & Technical Stack**

---

## **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     SELFPRINT V3 FRONTEND                   │
│                      (React 18 + Vite)                      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
       ┌───────▼────────────┐        ┌────────▼────────────┐
       │  SUPABASE CLIENT   │        │   EDGE FUNCTIONS    │
       │  (Real-time Auth)  │        │   (API Handlers)    │
       └───────┬────────────┘        └────────┬────────────┘
               │                              │
       ┌───────▼──────────────────────────────▼────────────┐
       │      SUPABASE PLATFORM (PostgreSQL + Auth)       │
       │  ├─ Realtime Subscriptions                       │
       │  ├─ Row Level Security (RLS)                     │
       │  ├─ Database Migrations                          │
       │  └─ Storage (File Uploads)                       │
       └─────────────────────────────────────────────────┘
```

---

## **Core Components**

### **1. Frontend Layer (React 18)**

**Technology:**
- React 18 (Hooks: useState, useContext, useEffect)
- TypeScript (strict mode)
- Tailwind CSS (utility-first styling)
- Vite (build tool)

**Key Patterns:**
- Context API for global state (TwinContext, AuthContext)
- Custom hooks for business logic
- Component composition (not class components)

**Entry Point:** `src/App.tsx`

### **2. Service Layer**

**Core Services:**

| Service | Purpose | Key Functions |
|---------|---------|------------------|
| `supabase-service.ts` | Supabase client initialization | `getSupabaseClient()` |
| `CoreAwakeningService.ts` | Twin creation & awakening flow | `initializeTwin()`, `checkReadyForAwakening()` |
| `TwinSupabaseService.ts` | Twin CRUD operations | `createTwinInDatabase()`, `getTwinsForUser()` |
| `SICEOrchestrator.ts` | 12 SICE engines orchestration | `orchestrate()`, `registerEngines()` |
| `database-init.ts` | Database initialization | `ensureUserProfile()` |

**Service Layer Features:**
- Async/await patterns
- Error handling & logging
- Type-safe Supabase queries
- RLS compliance (row-level security)

### **3. Database Layer (PostgreSQL + Supabase)**

**Key Tables:**

```sql
-- Users & Authentication
users (auth.users)
personal_contexts
  ├─ user_id (FK users)
  ├─ awakening_essence_id (FK awakening_essence)
  └─ preferences, metadata

-- Essence & Twin Creation
awakening_essence
  ├─ user_id (FK users)
  ├─ personal_intelligence (JSONB)
  ├─ sice_results (JSONB array)
  ├─ status: 'pending' | 'used' | 'failed'
  └─ twin_id (FK twins, after creation)

-- Twin Records
twins
  ├─ user_id (FK users)
  ├─ name, primary_archetype, secondary_archetype
  ├─ maturity_score, evolution_stage
  └─ timestamps (created_at, updated_at)

-- Twin Interactions
twin_memories
  ├─ twin_id (FK twins)
  ├─ world_id, role, content
  ├─ metadata (JSONB)
  └─ timestamps

twin_sice_scores
  ├─ twin_id (FK twins)
  ├─ sice_name (engine name)
  ├─ contribution_score (0-100)
  ├─ last_active, updated_at
  └─ Used for Twin personality & evolution
```

**RLS Policies:**
- Users can only read/write their own data
- Authenticated users only
- Service role bypass for admin operations

**Migrations:**
Located in `supabase/migrations/`:
```bash
20260824_001_initial_schema.sql      # P1: Core tables
20260824_002_add_constraints.sql     # P2: Constraints & indexes
20260824_003_add_rls_policies.sql    # P3: Security policies
```

---

## **Key Workflows**

### **Twin Awakening Flow**

```
1. USER COMPLETES FULL ANALYSIS
   ↓
2. SICE ORCHESTRATION
   ├─ Run 12 engines (parallel)
   ├─ Collect confidence scores
   └─ Generate personal_intelligence (JSONB)
   ↓
3. ESSENCE CREATION
   ├─ Save to awakening_essence table
   ├─ Store SICE results & intelligence
   └─ Status: 'pending'
   ↓
4. TWIN INITIALIZATION (P5 OPTIMIZED)
   ├─ [Parallel Operations]
   ├─ Insert Twin record → twins table
   ├─ Update awakening_essence → status: 'used'
   ├─ Link personal_context → essence_id
   ├─ Insert baseline SICE scores → twin_sice_scores
   └─ Insert birth memory → twin_memories
   ↓
5. TWIN READY
   ├─ Twin personality loaded
   ├─ Ready for chat interactions
   └─ Memory & evolution tracking begins
```

**Performance:**
- Before P5: 3.0 seconds (sequential DB calls)
- After P5 Step 1: 2.4 seconds (parallelized operations)
- Future: SQL function optimization if needed

### **Twin Chat & Evolution**

```
USER MESSAGE
   ↓
CONTEXT RETRIEVAL
   ├─ Load Twin memories (twin_memories)
   ├─ Load SICE scores (twin_sice_scores)
   └─ Load Twin personality (twins)
   ↓
ORCHESTRATION
   ├─ Format context for Twin personality
   ├─ Generate response
   └─ Log interaction (non-blocking)
   ↓
EVOLUTION (Periodic)
   ├─ Analyze conversation trends
   ├─ Update Twin maturity_score
   ├─ Update evolution_stage
   └─ Refresh SICE scores
```

---

## **Data Flow: Complete Picture**

### **Authentication Flow**
```
User Signs Up/In
  ↓
Supabase Auth (auth.users table)
  ↓
Session token stored (client-side)
  ↓
All subsequent queries include auth header
  ↓
RLS policies check user_id match
```

### **State Management**

**Global State (Context API):**
```typescript
TwinContext
  ├─ currentTwin: Twin | null
  ├─ twinMemories: TwinMemory[]
  ├─ siceScores: Map<engineName, score>
  └─ updateTwin(), addMemory(), updateScores()

AuthContext
  ├─ user: User | null
  ├─ session: Session | null
  ├─ login(), logout(), signUp()
  └─ isAuthenticated: boolean
```

**Local Component State:**
- Form input (useState)
- UI state (collapsed, loading)
- Temporary data

**No Redux/Zustand:**
- Context API sufficient for app complexity
- Simpler mental model
- Fewer dependencies

---

## **API Layer (Supabase RPC & REST)**

### **Supabase Client Usage**

```typescript
// Query
const { data, error } = await supabase
  .from('twins')
  .select('*')
  .eq('user_id', userId);

// Insert
const { data, error } = await supabase
  .from('twins')
  .insert([{ user_id, name, ... }]);

// Update
const { data, error } = await supabase
  .from('twins')
  .update({ maturity_score })
  .eq('id', twinId);

// Real-time Subscription
const subscription = supabase
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'twins',
  }, (payload) => {
    setTwins([...]);
  })
  .subscribe();
```

### **Edge Functions**

Located in `supabase/functions/`:
- API handlers for complex logic
- SICE orchestration (if running server-side)
- Webhook handlers

---

## **Performance Optimizations (P4 & P5)**

### **P4: Dependency Management**
- `.npmrc` with `save-exact=true` → reproducible builds
- `engine-strict=true` → version consistency
- `npm ci` in production (not `npm install`)

### **P5: Database Performance**
- **Parallelization:** 4 independent DB operations run in parallel
  - Before: 5 sequential queries @ 200ms each = 1.0s
  - After: 4 parallel queries on 1 round-trip = 0.2s
- **Batch Inserts:** Twin SICE scores batched into 1 insert (12 rows)
- **No N+1 Queries:** Always select required data upfront

**Measured Performance:**
- Twin creation E2E: 2.4s (from 3.0s baseline)
- 20% improvement via parallelization
- Network latency dominant factor (~0.5-1.0s)

---

## **Security (P3 Verified)**

### **RLS Policies**
- Users isolated by `user_id`
- All tables have `user_id` column
- Authenticated users only

### **CVE Monitoring**
- 10 CVEs in devDependencies (transitive, not exploitable in runtime)
- `npm audit --audit-level=moderate` in CI
- See `docs/SECURITY.md` for full CVE assessment

### **Data Privacy**
- Fingerprint data minimized (not stored)
- RLS ensures user isolation
- Auth via Supabase (email + password)

---

## **Tech Stack Summary**

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18 | UI framework |
| | TypeScript | 5+ | Type safety |
| | Tailwind CSS | 3+ | Styling |
| | Vite | 5+ | Build tool |
| **Backend** | Supabase | Latest | Database + Auth |
| | PostgreSQL | 15+ | Database engine |
| **Testing** | Vitest | Latest | Unit tests |
| | Playwright | Latest | E2E tests |
| **Deployment** | Vercel | N/A | Hosting |
| **Version Control** | Git | Latest | Source control |

---

## **Development Workflow**

```
1. Create branch: git checkout -b feature/xyz
2. Make changes: Edit code, follow rules
3. Test: npm test + npm run test:e2e
4. Lint: npm run lint
5. Build: npm run build (no errors)
6. Commit: git add . && git commit -m "..."
7. Push: git push origin feature/xyz
8. PR: Create GitHub pull request
9. Merge: After review, merge to main
10. Deploy: Vercel auto-deploys on main push
```

**Rules:**
- No manual refactoring outside scope
- Surgical edits only (touch affected files)
- TypeScript strict mode must pass
- All tests must pass before commit

---

**Last Updated:** 2026-08-24  
**Architecture Version:** 1.0 (PHASE A + P3 + P5 optimized)
