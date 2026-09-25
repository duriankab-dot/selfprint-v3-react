# TC-001: Baseline tag + Feature flags infrastructure
**Phase**: 0 | **Priority**: P0 | **Estimate**: 30 นาที
**Assignee**: AI-Architect | **Depends On**: None
**Feature Flag**: N/A (infra)

## 🎯 OBJECTIVE
สร้าง baseline git tag และ feature flag system เพื่อควบคุม rollout ของ features ใหม่ทั้งหมด โดยไม่ต้องสร้าง branch แยก

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `git tag baseline-eb26e59-$(date +%s)` สร้างแล้ว
- [ ] `src/lib/featureFlags.ts` สร้างแล้ว พร้อม hook `useFeatureFlag`
- [ ] Component `FeatureFlag` สร้างแล้ว สำหรับ wrap features
- [ ] Environment variables ใน `.env.local` และ `.env.example` เพิ่มแล้ว
- [ ] **Docs updated**: ไม่มี (เป็น infra)
- [ ] **MASTER_PLAN.md updated**: Task status → Done
- [ ] **All tests pass**: `npm test -- featureFlags`
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
```typescript
// src/lib/featureFlags.ts
const FLAGS = {
  LIVING_DIAGRAM: import.meta.env.VITE_FEATURE_LIVING_DIAGRAM === 'true',
  UNIFIED_PIPELINE: import.meta.env.VITE_FEATURE_UNIFIED_PIPELINE === 'true',
  NO_ASTRO_LANG: import.meta.env.VITE_FEATURE_NO_ASTRO_LANG !== 'false',
} as const;

export function useFeatureFlag(flag: keyof typeof FLAGS): boolean { return FLAGS[flag]; }
export function FeatureFlag({ name, children, fallback = null }: { name: keyof typeof FLAGS; children: React.ReactNode; fallback?: React.ReactNode }) {
  return FLAGS[name] ? <>{children}</> : <>{fallback}</>;
}
```

```bash
# .env.local
VITE_FEATURE_LIVING_DIAGRAM=false
VITE_FEATURE_UNIFIED_PIPELINE=false
VITE_FEATURE_NO_ASTRO_LANG=true
```

## 🧪 TEST SPEC
```typescript
test('useFeatureFlag returns false by default', () => {
  expect(useFeatureFlag('LIVING_DIAGRAM')).toBe(false);
});
test('FeatureFlag renders children when flag true', () => {
  // mock env, render, assert
});
```

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- .ai/context-pack/session-XXX-context.json (includes: featureFlags API)