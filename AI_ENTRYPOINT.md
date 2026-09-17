# AI ENTRYPOINT
# Version: 1.0
# Universal project bootstrap for all AI coding agents
#
# This file is intentionally short.
# It exists to force every AI agent to enter the project through the same
# operating procedure without duplicating the full rules or product spec.

===============================================================================
STOP — MANDATORY AI BOOTSTRAP
===============================================================================

Before doing ANY project work:

1. Read `UNIVERSAL_MASTER_AI_RULES.md`
2. Read `AI_WORK_STATE.md`
3. Follow both files as mandatory operating rules/state.
4. Do not modify project files before completing these steps.
5. Continue an existing Task ID when one already covers the objective.
6. Do not repeat work that is already `PASS` + verified without new evidence.
7. Investigate the repository before asking questions.
8. Ask the user only when genuinely blocked or an explicit product decision
   is required.
9. No Evidence = Not Done.
10. SKIPPED ≠ PASS.
11. Documentation changes cannot make implementation pass.
12. Never reduce/redefine requirements to make work appear complete.
13. Maximum 2 attempts for a single bug/build/test failure.
14. Model switching does NOT reset the attempt counter.
15. After Attempt 2 fails: STOP and produce the Mandatory Halt Report.
16. After meaningful work, update `AI_WORK_STATE.md`.

===============================================================================
OPERATING FLOW
===============================================================================

AI_ENTRYPOINT.md
      ↓
UNIVERSAL_MASTER_AI_RULES.md
      ↓
AI_WORK_STATE.md
      ↓
Project Product Spec / Codex
      ↓
Relevant Code / DB / API / Tests
      ↓
Implement
      ↓
Verify with actual evidence
      ↓
Update AI_WORK_STATE.md
      ↓
Report concise status

===============================================================================
SOURCE OF TRUTH
===============================================================================

Unless the project explicitly defines another hierarchy:

1. Actual Code
2. Database / Migration
3. API / Edge / Runtime
4. Tests / Runtime Evidence
5. Documentation

===============================================================================
ANTI-GAMING
===============================================================================

NEVER:
- edit documentation just to obtain PASS;
- edit work-state just to hide failures;
- skip/delete/weaken tests to obtain PASS;
- silently reduce scope;
- silently change requirements;
- claim runtime behavior from static inspection when runtime verification exists;
- repeat the same failed fix without new evidence;
- create duplicate tasks for the same objective.

===============================================================================
FINAL RULE
===============================================================================

DO NOT MAKE THE PROJECT LOOK COMPLETE.
MAKE THE PROJECT ACTUALLY COMPLETE — OR CLEARLY RECORD WHY IT IS NOT.
