# SELFPRINT AI ENTRYPOINT

Version: 1.0
Project: Selfprint

---

## MANDATORY SESSION START

Before performing substantial work, the AI MUST read:

1. `AI_ENTRYPOINT.md`
2. `UNIVERSAL_MASTER_AI_RULES.md`
3. `AI_WORK_STATE.md`

These files define:

- HOW the AI must work
- WHERE the project currently stands
- WHAT must be verified before claiming completion

---

## OPERATING ORDER

Follow this sequence:

AI_ENTRYPOINT.md
        ↓
UNIVERSAL_MASTER_AI_RULES.md
        ↓
AI_WORK_STATE.md
        ↓
Relevant project specification
        ↓
Relevant source files
        ↓
Implementation
        ↓
Verification
        ↓
AI_WORK_STATE.md update

---

## BEFORE EDITING

The AI MUST:

1. Identify the current Task ID.
2. Check the current status.
3. Check known blockers.
4. Check the last inspected commit.
5. Check relevant changed files.
6. Determine whether the requested work already exists.
7. Avoid duplicate work.

Do not begin implementation from assumptions.

---

## SOURCE OF TRUTH

Unless explicitly overridden:

1. Actual Code
2. Database / Migration
3. API / Edge / Runtime
4. Tests / Runtime Evidence
5. Documentation

Documentation does not override implementation.

---

## VERIFICATION

A fix is not complete until the affected behavior has been verified.

Use the strongest practical evidence:

- Runtime
- Executed tests
- Build
- Typecheck
- Lint
- API verification
- Database verification
- Browser/UI verification
- Security verification

SKIPPED is not PASS.

UNVERIFIED is not PASS.

---

## TWO-ATTEMPT RULE

For one bug/failure:

Attempt 1
→ diagnose → fix → verify

Attempt 2
→ reassess → materially different approach → verify

If Attempt 2 fails:

STOP.

Do not continue trial-and-error.

Produce the Mandatory Halt Report required by
`UNIVERSAL_MASTER_AI_RULES.md`.

---

## SELFPRINT ARCHITECTURE REMINDER

Current project context:

- Selfprint is the current product name.
- Cloudflare is the current deployment direction.
- OpenRouter is the current AI provider layer.
- SICE architecture = 16 engines.
- Do not restore obsolete 12-API/Vercel constraints.
- Do not reduce SICE from 16 engines.
- Do not create duplicate user-facing AI without verifying the current architecture.

Always verify the actual repository before changing architecture.

---

## END OF SESSION

Before ending substantial work:

Update `AI_WORK_STATE.md` with:

- Task ID
- Status
- Objective
- Completed
- Verified
- Failed
- Blocked
- Files Changed
- Tests / Commands Run
- Known Risks
- Next Exact Action

---

# FINAL RULE

DO NOT BUILD THE APPEARANCE OF COMPLETION.

BUILD THE PRODUCT.

Evidence outranks claims.
Implementation outranks documentation.
Requirements outrank convenience.
Verified state outranks assumptions.
New evidence outranks old context.