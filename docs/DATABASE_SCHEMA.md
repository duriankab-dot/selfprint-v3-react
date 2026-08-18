# DATABASE SCHEMA

**Database:** Supabase PostgreSQL  
**Version:** 1.0  
**Status:** Production  
**Last Updated:** 2026-08-18

---

## 📊 SCHEMA OVERVIEW

Selfprint uses **Supabase PostgreSQL** for persistent data storage with **Row-Level Security (RLS)** policies for multi-tenancy and privacy.

**Total Tables:** 15+  
**Primary Features:** Twin system, Decision tracking, World contexts, User auth

---

## 🔐 AUTHENTICATION TABLES

### users
Supabase built-in auth table (managed by Supabase)

```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_sign_in_at TIMESTAMP,
  -- WebAuthn credential management
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB
);
```

**Purpose:** User authentication & session management  
**Access:** Supabase Auth system  
**RLS:** Managed by Supabase

---

## 👤 USER PROFILE TABLES

### public.profiles
User profile information

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
```

**Columns:**
- `id` — Foreign key to auth.users
- `email` — User email (normalized)
- `name` — Display name
- `timezone` — User timezone for notifications
- `preferences` — JSON settings (theme, language, etc.)
- `created_at` — Account creation timestamp
- `updated_at` — Last profile update

**RLS Policy:**
```sql
-- Users can only read/update their own profile
CREATE POLICY users_own_profile ON public.profiles
  USING (auth.uid() = id);
```

---

## 🧠 TWIN SYSTEM TABLES

### public.twins
Twin entity records

```sql
CREATE TABLE public.twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  essence TEXT,
  stage INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_twins_user_id ON public.twins(user_id);
```

**Columns:**
- `id` — Twin UUID
- `user_id` — Owner user ID
- `name` — Twin name (e.g., "My Future Self", "Nova")
- `essence` — Core essence/personality description (from Core Awakening)
- `stage` — Evolution stage (1-5)
- `created_at` — Creation timestamp
- `updated_at` — Last update

**RLS Policy:**
```sql
-- Users can only access their own twins
CREATE POLICY users_own_twins ON public.twins
  USING (auth.uid() = user_id);
```

---

### public.twin_evolution_progress
Twin stage progression tracking

```sql
CREATE TABLE public.twin_evolution_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.twins(id),
  stage INT NOT NULL,
  progress FLOAT DEFAULT 0.0,
  milestones JSONB DEFAULT '{
    "conversations": 0,
    "decisions_logged": 0,
    "worlds_explored": 0,
    "insights_received": 0
  }',
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(twin_id, stage)
);

CREATE INDEX idx_twin_evolution_twin_id ON public.twin_evolution_progress(twin_id);
```

**Columns:**
- `twin_id` — Reference to twin
- `stage` — Stage number (1-5)
- `progress` — Completion percentage (0-100)
- `milestones` — JSON tracking: conversations, decisions, worlds, insights
- `unlocked_at` — When stage was reached
- `created_at` — Record creation

**Milestones:**
```json
{
  "conversations": 45,
  "decisions_logged": 12,
  "worlds_explored": 5,
  "insights_received": 8
}
```

---

## 💬 CONVERSATION TABLES

### public.conversations
Chat history with twin

```sql
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.twins(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  world_context UUID REFERENCES public.worlds(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_twin_id ON public.conversations(twin_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_world_id ON public.conversations(world_context);
```

**Purpose:** Group messages into conversations by topic/world

---

### public.messages
Individual chat messages

```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INT,
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_embedding ON public.messages USING ivfflat (embedding vector_cosine_ops);
```

**Columns:**
- `role` — 'user' or 'assistant'
- `content` — Message text
- `tokens_used` — API token count (for billing)
- `embedding` — Vector embedding for semantic search

---

## 🎯 DECISION TABLES

### public.decisions
User decisions & tracking

```sql
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  twin_id UUID NOT NULL REFERENCES public.twins(id),
  world_context UUID REFERENCES public.worlds(id),
  decision_text TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'made', 'reviewed')),
  made_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX idx_decisions_twin_id ON public.decisions(twin_id);
CREATE INDEX idx_decisions_status ON public.decisions(status);
```

**Columns:**
- `decision_text` — The decision being made
- `options` — Array of options considered
- `status` — pending | made | reviewed
- `made_at` — When decision was finalized

**Example options:**
```json
[
  "Accept job offer",
  "Decline and continue searching",
  "Negotiate salary"
]
```

---

### public.decision_outcomes
Decision follow-up outcomes

```sql
CREATE TABLE public.decision_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  twin_id UUID NOT NULL REFERENCES public.twins(id),
  outcome TEXT NOT NULL CHECK (outcome IN ('positive', 'neutral', 'negative')),
  decision_text TEXT,
  follow_up_day INT,
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_decision_outcomes_decision_id ON public.decision_outcomes(decision_id);
CREATE INDEX idx_decision_outcomes_user_id ON public.decision_outcomes(user_id);
```

**Columns:**
- `outcome` — positive | neutral | negative
- `follow_up_day` — Days until follow-up (30, 90, 180, 365)
- `notes` — User notes on outcome

---

## 🌍 WORLD CONTEXT TABLES

### public.worlds
12 world contexts for expertise tracking

```sql
CREATE TABLE public.worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  expertise_level INT DEFAULT 1,
  total_conversations INT DEFAULT 0,
  total_decisions INT DEFAULT 0,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_worlds_user_id ON public.worlds(user_id);
```

**12 Standard Worlds:**
1. Career & Work
2. Health & Wellness
3. Relationships & Family
4. Finance & Money
5. Personal Growth & Learning
6. Creativity & Expression
7. Travel & Adventure
8. Home & Living
9. Spirituality & Meaning
10. Social & Community
11. Entertainment & Hobbies
12. Legacy & Impact

---

### public.world_badges
Achievement tracking per world

```sql
CREATE TABLE public.world_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES public.worlds(id),
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(world_id, badge_type)
);

CREATE INDEX idx_world_badges_world_id ON public.world_badges(world_id);
```

**Badge Types:**
- `explorer` — 5 conversations
- `decision_maker` — 3 decisions logged
- `reflective` — Outcome reviewed
- `evolving` — Stage 2 reached
- `master` — 20+ conversations

---

## 📢 NOTIFICATION TABLES

### public.notification_queue
Scheduled notifications

```sql
CREATE TABLE public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  twin_id UUID REFERENCES public.twins(id),
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed')),
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notification_queue(user_id);
CREATE INDEX idx_notifications_scheduled_for ON public.notification_queue(scheduled_for);
CREATE INDEX idx_notifications_status ON public.notification_queue(status);
```

**Notification Types:**
- `decision_reminder` — Follow-up on decision
- `world_update` — New world context available
- `milestone_reached` — Twin stage progression
- `insight_generated` — SICE engine insight
- `daily_brief` — Morning summary

---

## 🔍 ANALYTICS TABLES

### public.pattern_analysis
SICE pattern detection results

```sql
CREATE TABLE public.pattern_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  twin_id UUID REFERENCES public.twins(id),
  category TEXT NOT NULL,
  pattern TEXT,
  frequency TEXT,
  confidence FLOAT,
  examples JSONB DEFAULT '[]',
  analyzed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pattern_analysis_user_id ON public.pattern_analysis(user_id);
```

**Categories:**
- `decision_type` — Patterns in decision outcomes
- `emotion_pattern` — Emotional triggers
- `communication_style` — How user communicates
- `value_alignment` — Core values revealed

---

## 🔒 ROW-LEVEL SECURITY (RLS)

**Enabled Tables:**
- profiles
- twins
- conversations
- messages
- decisions
- decision_outcomes
- worlds
- world_badges
- notification_queue
- pattern_analysis

**RLS Policies:**
1. **User Own Profile** — Can only access own row
2. **User Own Twins** — Can only access twins they own
3. **User Own Decisions** — Can only access decisions they created
4. **User Own Worlds** — Can only access worlds in their account

**Example:**
```sql
-- Ensure users can only read their own data
CREATE POLICY users_own_data ON public.decisions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 📈 PERFORMANCE INDEXES

**Frequently Queried:**
- `idx_twins_user_id` — Fetch user's twins
- `idx_conversations_twin_id` — Fetch twin's conversations
- `idx_messages_created_at` — Recent messages
- `idx_decisions_status` — Filter pending decisions
- `idx_notifications_scheduled_for` — Fetch scheduled notifications
- `idx_messages_embedding` — Semantic search via vectors

---

## 🔄 DATABASE MIGRATIONS

**Migration Status:** ✅ Complete  
**Version:** 1.0  
**Applied:** 2026-08-15

**Migration File:** `supabase/migrations/001_init_schema.sql`

---

## 📊 DATA RELATIONSHIPS

```
users (Supabase Auth)
  ├── profiles (1:1)
  ├── twins (1:M)
  │   ├── conversations (1:M)
  │   │   └── messages (1:M)
  │   ├── decisions (1:M)
  │   │   └── decision_outcomes (1:M)
  │   └── twin_evolution_progress (1:M)
  ├── worlds (1:M)
  │   └── world_badges (1:M)
  ├── notification_queue (1:M)
  └── pattern_analysis (1:M)
```

---

## 🧹 DATA RETENTION

| Table | Retention | Cleanup |
|-------|-----------|---------|
| messages | Unlimited | Manual purge |
| conversations | Unlimited | Manual purge |
| decisions | Unlimited | Keep for analysis |
| decision_outcomes | Unlimited | Keep for learning |
| notification_queue | 90 days | Auto-purge via Vercel cron |
| pattern_analysis | Unlimited | Updated monthly |

---

## ✅ VERIFICATION

**Total Tables:** 15  
**Total Indexes:** 20+  
**RLS Policies:** Enabled on 10 tables  
**Backup Status:** ✅ Automated daily  
**Replication:** ✅ Enabled

---

**Authority:** Single source of truth for database structure  
**Maintained by:** jb_DEV  
**Last Updated:** 2026-08-18
