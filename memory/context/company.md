# Company Context — SELFPRINT

## Structure
- **Founder/Solo dev:** jb_DEV (Durian Kab)
- **Role:** Full-stack engineer, product strategist
- **Organization:** Solo operation, self-managed

## Communication
- **Language:** Thai (preferred), English (technical)
- **Style:** Async-first, concise, code-first
- **Cadence:** Session-based work, no fixed meetings
- **Decision-making:** Solo (jb_DEV final call)

## Tools & Systems
| Tool | Use |
|------|-----|
| GitHub | Code repository, version control |
| npm | Package manager, dependency management |
| Vitest | Unit testing framework |
| Playwright | E2E testing framework |
| Tailwind CSS | UI styling |
| TypeScript | Type-safe development |
| Docker | Containerization (if used) |
| Vercel / Railway | Deployment (TBD) |

## Working Principles
1. **Code-first:** Repository state is source of truth
2. **Surgical:** Minimal, focused changes only
3. **Verified:** Every task has acceptance criteria
4. **Disciplined:** No shortcuts, production quality
5. **Documented:** Clear commit messages, inline docs
6. **Async:** Self-contained work, no blocking dependencies

## Decision Process
1. Problem identified (gap in repo, failed test, security issue)
2. Verify current state (don't assume cached knowledge)
3. Identify root cause (why is it broken?)
4. Plan minimal fix (what's the smallest working solution?)
5. Implement & test (code must verify success)
6. Document (update CLAUDE.md, commit message)

## Success Metrics
- **Code quality:** Build passes, tests stable, linting clean
- **Security:** npm audit clean, no known CVEs
- **Test coverage:** >80% unit test coverage, critical flows E2E tested
- **Documentation:** README current, setup instructions clear, inline docs complete
- **Production readiness:** Can deploy to production without manual steps

## Known Challenges
1. Solo developer → time-boxed work, clear priorities
2. High quality bar → no "quick fixes" that regress later
3. Full-stack scope → need to balance FE/BE/testing/docs
4. Production focus → every decision considers deployment impact

## Values
- **Ecosystem thinking:** Systems that scale, interconnected components
- **Completion:** Shipping beats planning (ship early, iterate)
- **Clarity:** Clear instructions, measurable outcomes
- **Automation:** Reduce manual work through tools & tests
- **Learning:** Each session documents lessons for next time

---
Updated: Session 1 (initial bootstrap)
