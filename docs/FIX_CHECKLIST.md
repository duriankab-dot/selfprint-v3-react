# ✅ SELFPRINT FIX CHECKLIST
**Status**: 🔴 CRITICAL - ต้องแก้ก่อน Deployment  
**Updated**: 2026-08-11

---

## 🎯 P0 - CRITICAL (ต้องทำวันนี้)

### [ ] 1. ลบ PHASE2_TEST_CONSOLE.ts
```
File: src/PHASE2_TEST_CONSOLE.ts (380 lines, 12 KB)
Action: ✂️ DELETE หรือ MOVE → __tests__/
Impact: HIGH (ขึ้น window object ตอน load, ไม่ควรใน prod)
Estimate: 10 minutes
Command: rm src/PHASE2_TEST_CONSOLE.ts
```

### [ ] 2. ลบ console.log จากโค้ดจริง
```
Found in: 41 files, 183 total occurrences

Priority files:
  ❌ src/lib/intelligence/AIFeedbackLoop.ts (4 occurrences)
  ❌ src/hooks/useJournalQueue.ts (14 occurrences)
  ❌ src/hooks/useEvolutionTracking.ts (1 occurrence)
  ❌ src/context/EvolutionContext.tsx (6 occurrences)
  ❌ src/services/supabase-service.ts (20 occurrences)
  ❌ src/hooks/useAudioDucking.ts (4 occurrences)
  ❌ src/services/popupService.ts (5 occurrences)
  [... 34 files more ...]

Action: 
  Option A: Remove all console.log manually
  Option B: Use oxlint --fix (if configured)
  Option C: Replace with proper logger

Impact: HIGH
Estimate: 30-45 minutes
```

### [ ] 3. Implement Decision API Calls
```
Files:
  ❌ src/components/features/DecisionForm.tsx:62
     TODO: Implement actual API call
     
  ❌ src/components/features/DecisionLogger.tsx:77
     TODO: Implement actual API call to fetch decisions from database

Action:
  1. Create endpoint: POST /api/decisions
  2. Create endpoint: GET /api/decisions?userId={id}
  3. Replace mock return values with real API calls
  4. Add error handling
  5. Add loading states

Impact: CRITICAL
Estimate: 2-3 hours
Status: Blocking feature
```

### [ ] 4. Fix Crypto Signature Verification
```
File: src/lib/auth/crypto.ts

Issues:
  Line 102: // TODO: Implement full CBOR parser
  Line 347: // TODO: Implement signature verification based on key type
  Line 357: // TODO: Return actual verification result (currently returns hardcoded true)

Action:
  1. Implement full CBOR parser (or use library)
  2. Implement proper signature verification
  3. Test with real Passkey data

Impact: CRITICAL
Estimate: 1-2 hours
Status: Affects Passkey authentication
```

---

## 🟡 P1 - HIGH (ต้องทำเดี๋ยวนี้)

### [ ] 5. Remove Mock Data from Production Components
```
Files with mock data:
  ⚠️ src/components/features/TwinEvolutionChart.tsx (7 occurrences)
  ⚠️ src/components/features/DecisionForm.tsx (4 occurrences mock data)
  ⚠️ src/components/onboarding/AICreationSequence.tsx (1)
  ⚠️ src/components/dashboard/LivingTwin.tsx (1)
  [... more]

Action:
  1. Audit each file for mock return values
  2. Replace with actual API calls
  3. Add loading/error states
  4. Test integration

Impact: HIGH
Estimate: 1-2 hours
```

### [ ] 6. Extend PersonalContextBuilder
```
File: src/lib/intelligence/PersonalContextBuilder.ts:593

Issue:
  // TODO: Extend PersonalContextEntry to support relationship type or create separate table

Action:
  1. Review schema for PersonalContextEntry
  2. Add relationship type field
  3. Create database migration if needed
  4. Update query logic

Impact: MEDIUM
Estimate: 1 hour
```

### [ ] 7. Remove Test Console Imports
```
Search all files for:
  import ... from '@/PHASE2_TEST_CONSOLE'
  
Action:
  1. Find all imports of PHASE2_TEST_CONSOLE
  2. Remove them
  3. Verify no broken references

Impact: MEDIUM
Estimate: 15 minutes
```

---

## 🔵 P2 - MEDIUM (วันพรุ่งนี้)

### [ ] 8. Scan for Unused Imports
```
Tool: oxlint --fix (if supported)

Impact: MEDIUM
Estimate: 1 hour
Expected cleanup: ~50-100 lines
```

### [ ] 9. Find Dead Code Functions
```
Action:
  1. Use IDE "find references" for all functions
  2. Mark unused exports
  3. Document or remove

Impact: LOW-MEDIUM
Estimate: 2 hours
```

### [ ] 10. Consolidate Duplicate Dependencies
```
Tool: npm ls (check for duplicates)

Impact: LOW
Estimate: 30 minutes
```

---

## 📋 Verification Checklist

### Before Each Fix:
- [ ] Create feature branch: `git checkout -b fix/issue-name`
- [ ] Write/update tests
- [ ] Run `npm test`
- [ ] Run `npm run lint`
- [ ] Run `npm run build`

### After Each Fix:
- [ ] Commit: `git commit -m "fix: remove console.log from file.ts"`
- [ ] Verify no new console warnings
- [ ] Check file size change
- [ ] Review diff

### Before Deployment:
- [ ] All P0 items = ✅ DONE
- [ ] All P1 items = ✅ DONE
- [ ] npm run build = ✅ SUCCESS
- [ ] npm test = ✅ ALL PASS
- [ ] npm run lint = ✅ NO ERRORS
- [ ] git status = ✅ CLEAN

---

## 🎯 Success Criteria

| Item | Before | After | Target |
|------|--------|-------|--------|
| TODO Count | 9 | ??? | 0 |
| console.log (prod) | 183 | ??? | 0 |
| PHASE2_TEST_CONSOLE | present | removed | gone |
| Mock Data (prod) | 300+ | ??? | 0 |
| Build Time | ??? | ??? | < 30s |
| Lint Warnings | ??? | ??? | 0 |
| Test Pass Rate | ??? | ??? | 100% |

---

## 📝 Notes

- เอกสารนี้อัพเดตเมื่อเริ่มแก้ปัญหา
- ทุกหมวดต้องทำให้สำเร็จ ก่อนการ merge pull request
- ใช้ checklist นี้ติดตามความคืบหน้า

---

**Generated**: 2026-08-11 by AI Senior Developer Audit  
**Reference**: AUDIT_REPORT_2026-08-11.md
