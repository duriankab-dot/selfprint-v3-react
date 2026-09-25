# Context Pack Template — Session Handoff

Copy this to `.ai/context-pack/session-XXX-context.json` and fill in.

```json
{
  "sessionId": "session-XXX",
  "timestamp": "2026-09-25T00:00:00Z",
  "phase": 0,
  "completedTasks": ["TC-XXX"],
  "currentState": {
    "featureFlags": {
      "LIVING_DIAGRAM": false,
      "UNIFIED_PIPELINE": false,
      "NO_ASTRO_LANG": true
    },
    "baselineTag": "baseline-eb26e59-1727251200",
    "lastCommit": "abc1234",
    "openPRs": []
  },
  "nextTasks": [
    { "id": "TC-XXX", "title": "Next Task Title", "phase": 0, "priority": "P0" }
  ],
  "blockers": [],
  "decisions": [
    "Decision 1: description",
    "Decision 2: description"
  ],
  "filesModified": [
    "src/lib/featureFlags.ts",
    "MASTER_PLAN.md"
  ],
  "testResults": {
    "typecheck": "pass",
    "lint": "pass",
    "test": "pass (127/127)",
    "build": "pass"
  },
  "apis": {
    "featureFlags": "useFeatureFlag(flag), FeatureFlag component",
    "twinDNA": "generateTwinDNA(input, userId) → TwinVisualDNA",
    "schemas": "SoftwareApplication, BlogPosting, FAQPage, QAPage, HowTo, Speakable"
  }
}
```