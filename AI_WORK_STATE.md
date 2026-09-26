# AI WORK STATE

Version: 1.0
Project: Selfprint
Last Updated: 2026-09-26

---

## 1. CURRENT TASK

Task ID:
P0-CURRENT

Status:
IN_PROGRESS

Objective:
Maintain and complete Selfprint toward verified production readiness.

---

## 2. SESSION BOOTSTRAP

Before substantial work, every AI agent MUST read:

1. AI_ENTRYPOINT.md
2. UNIVERSAL_MASTER_AI_RULES.md
3. AI_WORK_STATE.md

Then inspect only the relevant project specification,
source files, tests, runtime evidence, and changed files.

---

## 3. CURRENT SOURCE OF TRUTH

Use this hierarchy unless the project explicitly overrides it:

1. Actual Code
2. Database / Migration
3. API / Edge / Runtime
4. Tests / Runtime Evidence
5. Documentation

If sources disagree:

DOC DRIFT must be reported.

Never modify documentation merely to make implementation appear complete.

---

## 4. CURRENT PROJECT STATE

### Architecture

- Platform: Selfprint
- Deployment architecture: Cloudflare
- AI provider: OpenRouter
- Model selection: model may be selected/configured through OpenRouter
- SICE architecture: 16 engines
- User-facing AI characters: 2
- Backend AI calculations/processing must follow the current project architecture
- Do not reintroduce obsolete architecture from older project versions

### Important Locked Context

- Cloudflare is the current deployment direction.
- Do NOT restore the old 12-API/Vercel limitation as a project requirement.
- SICE = 16 engines is the current architecture.
- Do NOT reduce SICE to 12 engines.
- Existing skipped tests must remain explicitly identified as SKIPPED/UNVERIFIED.
- OpenRouter-related k6 limitations must not be falsely reported as PASS.
- Documentation must follow implementation and verification evidence.

---

## 5. TASK CONTINUITY

Before creating a new task:

1. Search this file for an existing related Task ID.
2. Continue the existing task if it is still active.
3. Do not create duplicate implementation tracks.
4. Do not repeat verified work without new evidence.

---

## 6. STATUS DEFINITIONS

Use only:

- NOT_STARTED
- IN_PROGRESS
- PASS
- FAIL
- BLOCKED
- UNVERIFIED
- DEFERRED

Never use:

- COMPLETE without verification
- 100% without evidence
- PRODUCTION READY without passing applicable gates

---

## 7. CURRENT BLOCKERS

Record only verified blockers.

Example:

### BLOCKER-001
Status: OPEN
Area: k6 / OpenRouter
Description:
OpenRouter API behavior prevents the affected k6 verification from being treated as production PASS.

Required action:
Resolve or explicitly document the verification limitation.

---

## 8. KNOWN UNVERIFIED / SKIPPED TESTS

| Test | Status | Reason | Impact | Follow-up |
|---|---|---|---|---|
| OpenRouter k6 verification | UNVERIFIED | Provider/API constraint | Load verification incomplete | Re-run when environment supports it |

Do not convert SKIPPED or UNVERIFIED into PASS without actual evidence.

---

## 9. LAST INSPECTED STATE

Last inspected commit:

[UPDATE WITH ACTUAL COMMIT]

Last verification:

[UPDATE WITH ACTUAL COMMANDS / RESULTS]

Files changed since inspection:

[UPDATE]

Known failures:

[UPDATE]

---

## 10. ACTIVE TASKS

### TASK
ID:
Status:
Objective:
Files:
Verification:
Remaining:

---

## 11. COMPLETED VERIFIED WORK

Only record work that has actual evidence.

### TASK
ID:
Result:
Evidence:
Verification:
Commit:

---

## 12. SESSION HANDOFF

At the end of every substantial session update:

Task ID:
Status:
Objective:
Completed:
Verified:
Failed:
Blocked:
Files Changed:
Tests / Commands Run:
Known Risks:
Next Exact Action:

---

## 13. ANTI-GAMING RULE

This file is an evidence ledger.

Never change:

FAIL → PASS
UNVERIFIED → PASS
SKIPPED → PASS

unless new verification evidence exists.

Never modify requirements merely to match implementation.

---

## 14. NEXT EXACT ACTION

[AI MUST UPDATE THIS AFTER EACH SUBSTANTIAL SESSION]

---

# END OF AI WORK STATE