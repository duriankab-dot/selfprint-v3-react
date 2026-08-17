# 📖 SELFPRINT — DEVELOPER READING LIST

**New Developer?** Follow this reading order to understand Selfprint from first principles.

**Estimated Time:** 2-3 hours total  
**Level:** Essential reading for all developers

---

## 🎯 Phase 1: Core Vision (30 minutes)

Read these to understand **what** Selfprint is:

### 1. README.md (5 min)
**Path:** `README.md`  
**Purpose:** Project overview, quick start, tech stack  
**Key Takeaway:** Architecture and navigation structure

### 2. SELFPRINT_PROJECT_CODEX.md (25 min) ⭐ **START HERE**
**Path:** `docs/SELFPRINT_PROJECT_CODEX.md`  
**Purpose:** Complete project blueprint — everything in one place  
**Key Sections:**
- Executive Summary
- Three Acts of Experience (Self Print → Core Awakening → AI Twin)
- 12 Worlds & SICE system
- Architecture overview
- 7 Critical P0 Gaps
- 30-day roadmap

**This is your single source of truth.** Everything else supports this.

---

## 🧠 Phase 2: Development Rules (20 minutes)

Read these to understand **how** to code for Selfprint:

### 3. AI CONTEXT.md (10 min)
**Path:** `AI_CONTEXT.md`  
**Purpose:** AI model's understanding of the project  
**Key Learning:** Nova vs AI Twin distinction (§1 of §18 rules)

### 4. CONTRIBUTING.md (10 min)
**Path:** `CONTRIBUTING.md`  
**Purpose:** Development guidelines and 18 core rules  
**Key Learning:**
- §1–§19: Inviolable rules (Nova ≠ Twin, 12 SICE, 5 Navigation, etc.)
- Development environment setup
- Git workflow

---

## ⚡ Phase 3: Execution (45 minutes)

Read these to understand **what to build next**:

### 5. SELFPRINT_EXECUTION_CHECKLIST_v1.0.md (25 min)
**Path:** `docs/SELFPRINT_EXECUTION_CHECKLIST_v1.0.md`  
**Purpose:** Phased breakdown of work (Week 1–4)  
**Key Takeaway:** Your immediate task queue  
**Sections:**
- Week 1: P0 Critical Gaps
- Week 2–4: Phase-by-phase roadmap
- Quality gates for each phase

### 6. SELFPRINT_COMPLETE_GAP_MAP_v1.0.md (20 min)
**Path:** `docs/SELFPRINT_COMPLETE_GAP_MAP_v1.0.md`  
**Purpose:** Technical gap analysis vs. current implementation  
**Key Learning:** Exactly what's missing and why  
**Sections:**
- Feature Completeness Audit
- Each gap with: Impact, Prerequisites, Difficulty

---

## 🏗️ Phase 4: Code & Architecture (1.5 hours)

Read these to understand **how to structure code**:

### 7. docs/development/ARCHITECTURE.md (30 min)
**Path:** `docs/development/ARCHITECTURE.md`  
**Purpose:** Codebase structure, component hierarchy, data flow  
**Key Learning:** Where to find & create files

### 8. docs/development/CODE_DISCIPLINE.md (30 min)
**Path:** `docs/development/CODE_DISCIPLINE.md`  
**Purpose:** Coding standards, TypeScript patterns, naming conventions  
**Key Rules:** No hardcoded colors, var(--exp-*) only, component patterns

### 9. docs/development/GIT_WORKFLOW.md (15 min)
**Path:** `docs/development/GIT_WORKFLOW.md`  
**Purpose:** Git branching, commit messages, PR process  
**Key Learning:** Commit discipline and PR templates

### 10. docs/development/TESTING_STRATEGY.md (15 min)
**Path:** `docs/development/TESTING_STRATEGY.md`  
**Purpose:** Testing approach, test coverage targets, test locations  
**Key Learning:** What to test and how

---

## 📋 Quick Reference

| When You Need | Read This | Time |
|---------------|-----------|------|
| Project overview | README.md | 5 min |
| **Complete understanding** | **SELFPRINT_PROJECT_CODEX.md** | **25 min** ⭐ |
| Development rules | CONTRIBUTING.md | 10 min |
| Immediate tasks | SELFPRINT_EXECUTION_CHECKLIST_v1.0.md | 25 min |
| Technical gaps | SELFPRINT_COMPLETE_GAP_MAP_v1.0.md | 20 min |
| Code structure | docs/development/ARCHITECTURE.md | 30 min |
| Coding standards | docs/development/CODE_DISCIPLINE.md | 30 min |
| Git workflow | docs/development/GIT_WORKFLOW.md | 15 min |
| Testing approach | docs/development/TESTING_STRATEGY.md | 15 min |

---

## ✅ After Reading

**You should be able to:**
- Explain what Selfprint is in 2 minutes
- Describe the difference between Self Print (guide) and AI Twin
- List the 12 Worlds and why they matter
- Identify the 7 Critical P0 gaps
- Run the development environment
- Create a new component following code discipline
- Write a proper git commit message
- Know what to test and where

**Next Steps:**
1. Run `npm install && npm run dev`
2. Pick a task from SELFPRINT_EXECUTION_CHECKLIST_v1.0.md
3. Reference SELFPRINT_COMPLETE_GAP_MAP_v1.0.md for technical details
4. Open a PR following GIT_WORKFLOW.md

---

## 📚 Archive & Historical Docs

**Previous versions and deprecated docs are in:**  
`docs/archive/`

These contain older PRDs, master direction documents, and project iterations. They are kept for historical context only and should NOT be used for current development.

**Current version is CODEX v2.0** (SELFPRINT_PROJECT_CODEX.md)

---

**Last Updated:** 16 August 2026  
**CODEX Version:** v2.0  
**Questions?** See AI_CONTEXT.md or CONTRIBUTING.md
