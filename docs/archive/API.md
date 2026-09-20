# 📡 API Documentation

**Core Services & Database Operations**

---

## **Service Exports & Usage**

### **CoreAwakeningService**

**Purpose:** Twin creation & awakening workflow

```typescript
import {
  initializeTwin,
  checkReadyForAwakening,
  AwakeningResult,
} from '../services/CoreAwakeningService';

// Check if user is ready
const isReady = await checkReadyForAwakening(userId);
if (!isReady) {
  console.log('Complete Full Analysis first');
  return;
}

// Initialize Twin (create & setup)
const result: AwakeningResult = await initializeTwin(
  userId,
  'Twin Name',
  essenceId,
  birthDate
);

if (result.success) {
  console.log('Twin awakened:', result.twinId);
  console.log('First insight:', result.firstInsight);
} else {
  console.log('Error:', result.message);
}
```

**Methods:**

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `checkReadyForAwakening(userId)` | UUID | boolean | Check if user completed Analysis |
| `initializeTwin(userId, name, essenceId?, birthDate?)` | UUID, string, UUID?, string? | AwakeningResult | Create Twin & setup |

**Types:**
```typescript
interface AwakeningResult {
  success: boolean;
  message: string;
  twinId?: string;
  twin?: Twin;          // Full Twin record
  firstInsight?: string; // Birth memory grounded in essence
}
```

---

### **TwinSupabaseService**

**Purpose:** Twin CRUD operations & database access

```typescript
import {
  createTwinInDatabase,
  getTwinsForUser,
  getTwinById,
  updateTwin,
  deleteTwin,
} from '../services/TwinSupabaseService';

// Get all twins for user
const twins = await getTwinsForUser(userId);

// Get specific twin
const twin = await getTwinById(twinId);

// Update twin
const updated = await updateTwin(twinId, {
  maturityScore: 75,
  evolution_stage: 2,
});

// Delete twin
const success = await deleteTwin(twinId);
```

**Methods:**

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `getTwinsForUser(userId)` | UUID | Twin[] | Get all twins for user |
| `getTwinById(twinId)` | UUID | Twin \| null | Get specific twin |
| `updateTwin(twinId, updates)` | UUID, Partial<Twin> | Twin \| null | Update twin record |
| `deleteTwin(twinId)` | UUID | boolean | Delete twin |
| `createTwinInDatabase(userId, data)` | UUID, TwinData | Twin \| null | Create new twin |

**Types:**
```typescript
interface Twin {
  id: string;                    // UUID
  user_id: string;               // FK users
  name: string;
  primary_archetype: Archetype;
  secondary_archetype: Archetype;
  maturity_score: number;        // 0-100
  evolution_stage: number;       // 1-5
  created_at: string;            // ISO timestamp
  updated_at: string;
}

type Archetype =
  | 'explorer' | 'sage' | 'caregiver' | 'ruler'
  | 'creator' | 'hero' | 'outlaw' | 'everyman'
  | 'lover' | 'jester' | 'magician' | 'innocent';
```

---

### **SICEOrchestrator**

**Purpose:** Run 12 SICE engines & collect scores

```typescript
import { SICEOrchestrator } from '../services/sice/SICEOrchestrator';

const orchestrator = new SICEOrchestrator();

// Run orchestration (get essence)
const essence = await orchestrator.orchestrate(userContext);

// Result contains:
// - personal_intelligence: { userUnderstanding, recommendedAction, insights }
// - sice_results: Array of { engineName, confidence }

console.log('User understanding:', essence.personal_intelligence.userUnderstanding);
console.log('Engines run:', essence.sice_results.length); // 12
```

**SICE Engines (12):**
```typescript
[
  'PersonalContextBuilder',
  'PatternDetector',
  'InsightEngine',
  'AIFeedbackLoop',
  'TwinStateEngine',
  'ExperienceEngine',
  'EnvironmentEngine',
  'BadgeEngine',
  'BehavioralForecastEngine',
  'FutureSelfEngine',
  'MemoryManagerEngine',
  'DecisionIntelligenceEngineAdapter',
]
```

**Output:**
```typescript
interface Essence {
  personal_intelligence: {
    userUnderstanding: number;      // 0-100 confidence
    recommendedAction: string;      // Actionable insight
    insights: string[];             // Array of insights
  };
  sice_results: Array<{
    engineName: string;
    confidence: number;             // 0-100
  }>;
}
```

---

## **Database Queries (Supabase)**

### **Read Twin Memories**

```typescript
// Get all memories for a twin
const { data: memories, error } = await supabase
  .from('twin_memories')
  .select('*')
  .eq('twin_id', twinId)
  .order('created_at', { ascending: false });

// Result:
// [{
//   id, twin_id, world_id, role, content,
//   metadata: { eventType, timestamp, grounded },
//   created_at, updated_at
// }]
```

### **Read SICE Scores**

```typescript
// Get all SICE scores for a twin
const { data: scores, error } = await supabase
  .from('twin_sice_scores')
  .select('*')
  .eq('twin_id', twinId);

// Result: Array of {
//   id, twin_id, sice_name, contribution_score,
//   last_active, updated_at, created_at
// }
```

### **Insert Twin Memory**

```typescript
const { data, error } = await supabase
  .from('twin_memories')
  .insert({
    twin_id: twinId,
    world_id: 'chat',
    role: 'user' | 'twin',
    content: 'Message text',
    metadata: {
      eventType: 'chat_exchange',
      timestamp: new Date().toISOString(),
    },
  });
```

### **Update Twin Maturity**

```typescript
const { data, error } = await supabase
  .from('twins')
  .update({
    maturity_score: newScore,
    evolution_stage: newStage,
    updated_at: new Date().toISOString(),
  })
  .eq('id', twinId)
  .select()
  .single();
```

---

## **Real-time Subscriptions**

### **Listen for Twin Updates**

```typescript
// Subscribe to Twin changes
const subscription = supabase
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'twins',
      filter: `id=eq.${twinId}`,
    },
    (payload) => {
      console.log('Twin updated:', payload.new);
      setTwin(payload.new);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### **Listen for New Memories**

```typescript
// Subscribe to new memories
const subscription = supabase
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'twin_memories',
      filter: `twin_id=eq.${twinId}`,
    },
    (payload) => {
      console.log('New memory:', payload.new);
      addMemory(payload.new);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## **Error Handling**

### **Standard Error Response**

```typescript
const { data, error } = await supabase.from('twins').select('*');

if (error) {
  // error has:
  // - message: string (human-readable)
  // - code: string (error code)
  // - details: string (additional context)
  
  console.error(`Database error [${error.code}]: ${error.message}`);
  
  // Handle specific errors
  if (error.code === 'PGRST116') {
    // Not found
    console.log('Twin not found');
  } else if (error.code === '42P01') {
    // Relation does not exist
    console.log('Table missing');
  }
} else {
  console.log('Success:', data);
}
```

### **Common Error Codes**

| Code | Meaning | Action |
|------|---------|--------|
| `PGRST116` | Not found (404) | Check ID exists |
| `42501` | Permission denied (403) | Check RLS policy & auth |
| `22P02` | Invalid data type | Check parameter types |
| `23503` | Foreign key violation | Check FK references |
| `23505` | Unique constraint | Check for duplicates |

---

## **Performance Tips**

### **Use `.single()` for Single Row**

```typescript
// ❌ Returns array (slower)
const { data } = await supabase
  .from('twins')
  .select('*')
  .eq('id', twinId);
// data: Twin[]

// ✅ Returns single object (faster)
const { data } = await supabase
  .from('twins')
  .select('*')
  .eq('id', twinId)
  .single();
// data: Twin
```

### **Select Only Needed Columns**

```typescript
// ❌ Gets all columns
const { data } = await supabase
  .from('twins')
  .select('*')
  .eq('user_id', userId);

// ✅ Gets only needed columns (faster)
const { data } = await supabase
  .from('twins')
  .select('id, name, maturity_score')
  .eq('user_id', userId);
```

### **Batch Operations**

```typescript
// ❌ Slow: Multiple inserts
for (const score of scores) {
  await supabase.from('twin_sice_scores').insert(score);
}

// ✅ Fast: Single batch insert
const { data } = await supabase
  .from('twin_sice_scores')
  .insert(scores); // All 12 at once
```

---

## **Authentication & Authorization**

### **Get Current User**

```typescript
// Get authenticated user
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  console.log('Not authenticated');
  return;
}

console.log('Current user:', user.id);
```

### **Check Permissions**

```typescript
// Supabase RLS handles this automatically
// But always verify on client before attempting operation

const canUpdate = currentUser.id === twin.user_id;

if (canUpdate) {
  await updateTwin(twin.id, updates);
} else {
  throw new Error('Permission denied');
}
```

---

## **Type Definitions**

```typescript
// User context (from analysis)
interface UserContext {
  userId: string;
  birthDate?: string;
  analysisData?: Record<string, unknown>;
  fingerprint?: FingerPrintData;
}

// Personal intelligence (from SICE)
interface PersonalIntelligence {
  userUnderstanding: number;      // 0-100
  recommendedAction: string;
  insights: string[];
}

// SICE Result
interface SICEResult {
  engineName: string;
  confidence: number;             // 0-100
}

// Twin Memory
interface TwinMemory {
  id: string;
  twin_id: string;
  world_id: string;               // 'self' | 'chat' | etc
  role: 'system' | 'user' | 'twin';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// SICE Score
interface TwinSICEScore {
  id: string;
  twin_id: string;
  sice_name: string;              // Engine name
  contribution_score: number;     // 0-100
  last_active: string;
  updated_at: string;
  created_at: string;
}
```

---

**Last Updated:** 2026-08-24  
**API Version:** 1.0  
**Status:** ✅ Production Ready
