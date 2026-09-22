# AI WORK STATE
# Version: 1.0
# Purpose: Compact operational state ledger for AI coding agents.
#
# RULE:
# This file records CURRENT PROJECT STATE.
# It is NOT a replacement for project specifications or documentation.
# Keep it factual, compact, and updated after meaningful work.
#
# IMPORTANT:
# - Do not use this file to turn FAIL into PASS.
# - Do not remove unresolved failures merely to make the project look clean.
# - This file is an evidence/state ledger, not a completion mechanism.
# - Do not duplicate large documentation here.
# - Completed + VERIFIED work should not be repeated without new evidence.


===============================================================================
MANDATORY AI BOOTSTRAP
===============================================================================

Every AI session MUST load, in this order, before substantial work:

1. AI_ENTRYPOINT.md (if present)
2. UNIVERSAL_MASTER_AI_RULES.md
3. AI_WORK_STATE.md

BOOTSTRAP STATUS:
- AI_ENTRYPOINT loaded: YES / NO / N/A
- UNIVERSAL_MASTER_AI_RULES loaded: YES / NO
- AI_WORK_STATE loaded: YES / NO
- Bootstrap complete: YES / NO

RULE:
Do not begin project modifications until Bootstrap complete = YES.

If these files are already present in current context and unchanged, do not
reload them solely for repetition. Reuse the existing context.

===============================================================================
PROJECT IDENTITY
===============================================================================

Project:
Repository:
Current Branch:
Last Known Commit:
Last Inspected Commit:
Files Changed Since Last Inspection:
Tests Run Since Last Inspection:
Environment:
Deployment Target:

===============================================================================
CURRENT TASK
===============================================================================

Task ID:
Phase:
Status: NOT_STARTED | IN_PROGRESS | PASS | FAIL | BLOCKED | UNVERIFIED | DEFERRED

Objective:
Scope:

Started:
Last Updated:

===============================================================================
CURRENT STATE
===============================================================================

What is known to be working:

What is currently failing:

What is currently unverified:

What is blocked:

Known risks:

===============================================================================
LOCKED CONSTRAINTS
===============================================================================

List only constraints that are actually locked by the project owner.

- 
- 
- 

===============================================================================
SOURCE OF TRUTH
===============================================================================

Default hierarchy:

1. Actual Code
2. Database / Migration
3. API / Edge / Runtime
4. Tests / Runtime Evidence
5. Documentation

Project-specific override (if explicitly approved):

===============================================================================
REQUIREMENT TRACEABILITY
===============================================================================

Use stable IDs for important requirements.

| ID | Requirement | Implementation | Verification | Evidence | Status |
|----|-------------|----------------|--------------|----------|--------|
|    |             |                |              |          |        |

Status values:
PASS / FAIL / PARTIAL / UNVERIFIED / BLOCKED / DEFERRED / NOT_STARTED

===============================================================================
ACTIVE WORK
===============================================================================

Current Task:
Current Hypothesis:
Current Attempt: 0 / 1 / 2

Planned Action:
Expected Verification:

===============================================================================
ATTEMPT LOG
===============================================================================

ATTEMPT 1
- Problem:
- Root-cause hypothesis:
- Files changed:
- Fix:
- Verification command/test:
- Exact result:
- Status:

ATTEMPT 2
- Why Attempt 1 failed:
- Alternative hypothesis:
- Files changed:
- Fix:
- Verification command/test:
- Exact result:
- Status:

If Attempt 2 fails:
STOP.
Do not add Attempt 3.
Use the Mandatory Halt Report.

===============================================================================
VERIFICATION LEDGER
===============================================================================

Record only meaningful checks.

| Check | Command / Method | Result | Date/Session | Evidence/Notes |
|-------|------------------|--------|--------------|----------------|
| Typecheck | | | | |
| Lint | | | | |
| Build | | | | |
| Unit | | | | |
| Integration | | | | |
| E2E | | | | |
| API/Edge | | | | |
| Database | | | | |
| Security/Auth/RLS | | | | |
| UI/Mobile | | | | |

IMPORTANT:
- SKIPPED is not PASS.
- NOT RUN is not PASS.
- MOCKED is not production proof.

===============================================================================
SKIPPED / UNVERIFIED TEST REGISTER
===============================================================================

| Test/Check | Status | Reason | Impact | Temporary/Permanent | Follow-up |
|------------|--------|--------|--------|--------------------|-----------|
|            |        |        |        |                    |           |

===============================================================================
FILES & CHANGE TRACKING
===============================================================================

Files already inspected:
- 

Files changed in current task:
- 

Files changed since last inspection:
- 

Files that must NOT be reread unless changed or required for verification:
- 

Relevant dependencies/interfaces:
- 

===============================================================================
KNOWN FAILURES / BLOCKERS
===============================================================================

| ID | Failure/Blocker | Evidence | Impact | Attempt | Next Action |
|----|------------------|----------|--------|---------|-------------|
|    |                  |          |        |         |             |

===============================================================================
DOCUMENTATION DRIFT
===============================================================================

If code/runtime and documentation disagree, record it here.

| Item | Actual State | Documentation Claim | Required Action | Status |
|------|--------------|---------------------|-----------------|--------|
|      |              |                     |                 |        |

RULE:
Documentation changes do not resolve implementation failures.

===============================================================================
DUPLICATE WORK PROTECTION
===============================================================================

Existing related tasks:
- 

Tasks already completed + verified:
- 

Do not recreate:
- 

Reason to revisit completed work (only if applicable):
- Regression / requirement change / dependency change / environment change

===============================================================================
SESSION HANDOFF
===============================================================================

Completed:
- 

Verified:
- 

Failed:
- 

Blocked:
- 

Files Changed:
- 

Tests / Commands Run:
- 

Known Risks:
- 

Next Exact Action:
- 

User Decision Required:
- NONE / <specific decision>

===============================================================================
PRODUCTION READINESS SNAPSHOT
===============================================================================

This is a snapshot, not a substitute for actual evidence.

[ ] Requirements closed
[ ] Typecheck
[ ] Lint
[ ] Build
[ ] Unit tests
[ ] Integration tests
[ ] E2E
[ ] API/Edge/runtime
[ ] Database/persistence
[ ] Security/auth/RLS/user isolation
[ ] Critical UI/mobile flows
[ ] No critical blockers
[ ] Documentation synchronized

Overall:
NOT PRODUCTION READY / PRODUCTION READY

IMPORTANT:
`PRODUCTION READY` is permitted only when the applicable gates have actual
supporting evidence. Do not tick boxes to make the status look complete.

===============================================================================
COMPACT SESSION START CHECKLIST
===============================================================================

[ ] Read current task
[ ] Read known blockers
[ ] Check last inspected commit
[ ] Check changed files
[ ] Reuse verified context
[ ] Avoid duplicate work
[ ] Identify exact next action

===============================================================================
COMPACT SESSION END CHECKLIST
===============================================================================

[ ] Record what changed
[ ] Record actual verification
[ ] Record failures/blockers
[ ] Record attempt number
[ ] Record next exact action
[ ] Update documentation only if state changed and evidence supports it
[ ] Leave no misleading PASS/COMPLETE claim

===============================================================================
FINAL RULE
===============================================================================

DO NOT MAKE THE PROJECT LOOK COMPLETE.
MAKE THE PROJECT ACTUALLY COMPLETE — OR CLEARLY REPORT WHY IT IS NOT.
