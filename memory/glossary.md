# Glossary — SELFPRINT V3

Complete decoder ring for SELFPRINT project terminology, acronyms, and internal language.

## Products & Versions
| Term | Meaning |
|------|---------|
| SELFPRINT | Personal Intelligence Platform |
| V3 | Current production version (React 18 + TypeScript) |
| Production Ready | Fully tested, verified, secured, documented, deployable |

## Roles & People
| Term | Meaning |
|------|---------|
| jb_DEV | Solo developer (Durian Kab) |
| AI Dev | Claude agent for implementation tasks |
| FE | Frontend (React layer) |
| BE | Backend (API / Edge functions) |

## Process & Workflow
| Term | Meaning |
|------|---------|
| Master Directive | Authoritative project instructions & constraints |
| Master Handoff | Current status, priorities, next steps |
| GAP Matrix | Gap between implementation and production (features, tests, security, docs, deployment) |
| GitHub audit | Scan repository for incomplete PRs, branch status, issues |
| Production audit | Verify deployed state: builds, tests, security, documentation |
| Production verify | Check actual implementation matches requirements |
| Handoff | Instructions to AI Dev with clear acceptance criteria |
| P0 / P1 / P2 | Priority levels (P0=drop everything, P1=important, P2=backlog) |

## Technical Components
| Term | Meaning |
|------|---------|
| FBS | Feedback Service (data persistence layer) ✅ |
| Edge | Edge Functions / serverless API layer |
| DB | Database (data storage) |
| UX/UI | User experience & interface layer |
| API | Application programming interface (REST/GraphQL) |
| E2E | End-to-end testing (Playwright) |

## Quality & Testing
| Term | Meaning |
|------|---------|
| Unit test | Test single function / component |
| Integration test | Test components interacting |
| E2E test | Test full user flow (Playwright) |
| Coverage | Percentage of code exercised by tests |
| Regression | Bug reintroduction after fix |
| Acceptance criteria | Definition of done for a task |

## Security & Performance
| Term | Meaning |
|------|---------|
| CVE | Common Vulnerabilities & Exposures (security issue) |
| npm audit | Scan for known vulnerabilities in dependencies |
| Linting | Check code style & quality (ESLint) |
| Build error | TypeScript / compilation error |
| Type error | TS type mismatch |

## Documentation & Communication
| Term | Meaning |
|------|---------|
| PRD | Product Requirements Document |
| Runbook | Step-by-step operational guide |
| Inline docs | Comments explaining code |
| README | Project overview & setup instructions |
| Reconcile | Make docs match actual code state |

## Priorities (Current)
| Priority | Task | Status |
|----------|------|--------|
| **P1** | Data Persistence (FBS) | ✅ Complete |
| **P2** | Test Stabilization (vitest timeout) | 🔴 Pending |
| **P3** | Security CVEs (npm audit) | 🔴 Pending |
| **P4** | Linting (ESLint errors) | 🟠 Pending |
| **P5** | E2E Tests (Playwright) | 🟠 Pending |
| **P6** | Documentation (reconcile) | 🟡 Pending |

## Tools & Commands
| Tool | Use |
|------|-----|
| `npm test` | Run Vitest suite |
| `npm run build` | TypeScript compilation + type check |
| `npm run lint` | ESLint check |
| `npm run dev` | Local dev server |
| `npm audit` | Security vulnerability scan |
| `git push` | Push to GitHub |
| `playwright` | E2E testing framework |

## Working Principles
- **Source of truth**: Current repository state (not cached/previous status)
- **Code-first**: Verify actual implementation before decisions
- **Production-focused**: Completeness over theory
- **Actionable**: Instructions + acceptance criteria
- **Async-first**: Self-contained messages, no back-and-forth
- **Concise**: Short, direct answers in Thai

---
Last updated: Session 1 (memory bootstrap)
