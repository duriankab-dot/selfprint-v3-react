# PHASE 6 — 12 Worlds (ภาษาไทย)

**วันที่:** 2026-08-17 | **Status:** 🔧 IN PROGRESS | **Token:** Managed

---

## 📊 สถานะ 12 Worlds

| # | World | Context | Expertise | Memory | Routing | UI | Status |
|---|-------|---------|-----------|--------|---------|-----|--------|
| 1 | Self | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | 40% |
| 2 | Health | ❌ | ⚠️ | ❌ | ❌ | ❌ | 25% |
| 3 | Wealth | ❌ | ⚠️ | ❌ | ❌ | ❌ | 20% |
| 4 | Relationships | ❌ | ❌ | ❌ | ❌ | ❌ | 15% |
| 5 | Career | ❌ | ❌ | ❌ | ❌ | ❌ | 15% |
| 6 | Learning | ❌ | ❌ | ❌ | ❌ | ❌ | 15% |
| 7 | Creativity | ❌ | ❌ | ❌ | ❌ | ❌ | 15% |
| 8 | Spirituality | ❌ | ❌ | ❌ | ❌ | ❌ | 15% |
| 9 | Adventure | ❌ | ❌ | ❌ | ❌ | ❌ | 15% |
| 10 | Legacy | ❌ | ❌ | ❌ | ❌ | ❌ | 15% |
| 11 | Joy | ❌ | ❌ | ❌ | ❌ | ❌ | 15% |
| 12 | Integration | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |

**รวม:** 30% complete | **ต้องแก้:** 11/12 worlds

---

## 🎯 Phase 6 ต้องทำ

### 1. World Context (ตั้งค่าฐาน)

```typescript
// constants/worlds.ts
const WORLDS = {
  self: {
    id: 'self',
    name: 'ตัวตน',
    expertise: 'Personal Growth Coach',
    prompt: 'คุณคือผู้เชี่ยวชาญการพัฒนาตัวตน...',
    color: '#3b82f6',
  },
  health: {
    id: 'health',
    name: 'สุขภาพ',
    expertise: 'Health Coach',
    prompt: 'คุณคือ health coach ที่เชี่ยวชาญ...',
    color: '#10b981',
  },
  wealth: {
    id: 'wealth',
    name: 'การเงิน',
    expertise: 'Financial Advisor',
    prompt: 'คุณคือ financial advisor ที่ชาญฉลาด...',
    color: '#f59e0b',
  },
  // ... (9 more)
};

// ✅ DONE: All 12 defined
// ❌ TODO: Prompts ต้องทำ expert-level
```

**Status:** ✅ Defined | ⚠️ Prompts incomplete

### 2. World Routing (Twin ต้องรู้ world)

```typescript
// ❌ BROKEN: Twin chat ไม่ส่ง world context
POST /api/twin {
  twinId,
  message,
  // ← missing: world
}

// ✅ FIXED: Include world
POST /api/twin {
  twinId,
  message,
  world: 'health'  // ← routing!
}

// getTwinContextForWorld() ต้องใช้ world
const context = await getTwinContextForWorld(twinId, world);
const systemPrompt = buildSystemPrompt(twin, context);
```

**Status:** ❌ Not implemented

### 3. Memory per World

```typescript
// ✅ DONE: Save with world
await saveTwinMemory(twinId, 'user', message, 'health');

// ✅ DONE: Database schema
// twin_memories.world_id (indexed)

// ❌ TODO: Verify all calls pass world
// Search: saveTwinMemory( → ต้องเพิ่ม world param
```

**Status:** ✅ Schema | ⚠️ Usage incomplete

### 4. World Expertise Prompts

```typescript
// ❌ STUB: Generic prompts
"You are a helpful assistant in the health world."

// ✅ NEEDED: Expert-level prompts
const healthPrompt = `
You are a certified health coach with 10+ years experience.
- Provide evidence-based wellness guidance
- Ask clarifying questions about user's health goals
- Recommend specific, actionable steps
- Acknowledge limitations (not a doctor)
- Use metrics: BMI, heart rate, sleep hours
- Reference latest health research
- Personalize to user's health history from Twin memory
`;

// Similar for all 12 worlds
const prompts = {
  health: healthPrompt,
  wealth: wealthPrompt,
  career: careerPrompt,
  // ... (9 more expert prompts)
};
```

**Status:** ❌ Prompts need improvement

### 5. World Stats Tracking

```typescript
// recordWorldVisit() ✅
// recordJournalEntry() ✅
// recordDecision() ✅
// recordInsight() ✅

// ❌ TODO: Update visits_count
const { error } = await supabase
  .from('world_stats')
  .update({ visits_count: visits_count + 1 })
  .eq('user_id', userId)
  .eq('world_id', world);

// ❌ LINE 183 TODO: Update visits_count in world_stats
```

**Status:** ⚠️ Partial

---

## 📋 Phase 6 Checklist

### World Definition (Quick)
- [x] 12 worlds defined in constants
- [x] World IDs, names, colors
- [ ] Expert prompts for all 12
- [ ] Cultural context (Thai relevance)

### Twin World Integration
- [ ] getTwinContextForWorld() function
- [ ] Build system prompt per world
- [ ] Route Twin chat to correct world
- [ ] Test: Chat in health → health context

### Memory Isolation
- [ ] Audit saveTwinMemory() calls
- [ ] Add world parameter to all calls
- [ ] Verify fetchTwinMemories() filters
- [ ] Test: Health memory ≠ wealth memory

### World Stats
- [ ] Implement recordWorldVisit()
- [ ] Implement recordJournalEntry()
- [ ] Implement recordDecision()
- [ ] Implement recordInsight()
- [ ] Fix line 183: Update visits_count

### UI / UX
- [ ] WorldSelector component works
- [ ] World switching smooth
- [ ] World context header visible
- [ ] Badge display per world

### Tests
- [ ] Unit: World context loading
- [ ] Integration: Twin switches world
- [ ] E2E: Chat in 2 worlds → memory isolated

---

## 🚨 Critical (ต้องแก้ก่อน Phase 7)

1. **getT winContextForWorld()** — Create function
2. **World prompts** — Write 12 expert prompts
3. **Memory isolation** — Verify all queries filter world_id
4. **Routing** — Ensure world passed in Twin chat API

---

## 📍 Files

```
src/constants/worlds.ts ✅ (definitions)
src/context/WorldContext.tsx ⚠️ (TODO line 183)
src/services/WorldExpertiseService.ts ⚠️ (partial)
src/components/WorldSelector.tsx ⚠️ (UI)
src/pages/WorldsHub.tsx ⚠️ (hub page)

Database:
  worlds (defined)
  world_stats (needs update logic)
  twin_memories.world_id ✅ (schema)
```

---

## ⏭️ After Phase 6

✅ Twin world-aware (same Twin, different expertise)  
✅ Memory isolation (12 separate contexts)  
✅ World routing (correct prompt per world)  
✅ Ready for Phase 7 (Decision Intelligence)

---

**Document:** PHASE_6_WORLDS_TH.md  
**Language:** ภาษาไทย | **Concise:** ✅ | **Token:** Managed
