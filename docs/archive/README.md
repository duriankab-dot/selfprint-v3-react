# 📦 ARCHIVED DOCUMENTS — SELFPRINT

**This folder contains historical and superseded project documents.**

All current development should reference **CODEX v2.0** located in `docs/SELFPRINT_PROJECT_CODEX.md`.

---

## 🗂️ Archive Contents

### Project Direction Documents (Superseded)
These documents represent earlier versions of the project vision and direction.

| File | Status | Reason Archived |
|------|--------|-----------------|
| `MASTER_PRD.md` | v1.0 (Superseded) | Replaced by SELFPRINT_PROJECT_CODEX.md |
| `Master Direction ของ Selfprint เวอร์ชันใหม่.md` | v1.0 (Superseded) | Consolidated into CODEX v2.0 |
| `Master Direction ของ Selfprint เวอร์ชันใหม่.txt` | v1.0 (Superseded) | Consolidated into CODEX v2.0 |
| `MASTER DIRECTION UPDATE & DOCUMENT INTEGRATION ORDER.md` | Interim (Superseded) | Replaced by CODEX v2.0 |
| `MASTER DIRECTION UPDATE & DOCUMENT INTEGRATION ORDER.txt` | Interim (Superseded) | Replaced by CODEX v2.0 |
| `MASTER DOCUMENT UPDATE DIRECTIVE.txt` | Interim (Superseded) | Superseded by CODEX v2.0 |

### Development Directives (Superseded)
These documents contained phase-specific development guidance that is now integrated into the EXECUTION_CHECKLIST.

| File | Status | Reason Archived |
|------|--------|-----------------|
| `SELFPRINT_MASTER_DEVELOPMENT_DIRECTIVE_v2.md` | v2.0 (Superseded) | Replaced by EXECUTION_CHECKLIST & GAP_MAP |
| `SELFPRINT_CURRENT_IMPROVEMENT_DIRECTIVE_2026-08-12.md` | Interim (Superseded) | Task-specific, no longer relevant |

### Summary & Status Documents (Historical)
These documents were generated during project phases and are kept for reference but are no longer current.

| File | Status | Reason Archived |
|------|--------|-----------------|
| `PROJECT_ROADMAP_UPDATED.md` | Updated (Historical) | Replaced by EXECUTION_CHECKLIST roadmap |
| `PROJECT_SUMMARY.md` | Summary (Historical) | Content consolidated into CODEX |
| `IMPLEMENTATION_PLAN_2026-08-11.md` | Plan (Historical) | Phase-specific, superseded |
| `IMPLEMENTATION_PLAN_§34_PASSKEY_BACKEND.md` | Plan (Historical) | Technical plan, implementation complete |

---

## 📚 Document Consolidation Timeline

### CODEX v1.0 → v2.0 Consolidation (August 15-16, 2026)

**Sources consolidated into SELFPRINT_PROJECT_CODEX.md:**
1. Master PRD (Product Requirements)
2. Project vision statements
3. Architecture overview
4. 12 Worlds framework
5. SICE engines architecture
6. Three Acts of experience
7. Phase roadmap (now in EXECUTION_CHECKLIST)
8. Gap analysis summary (detailed in GAP_MAP)

**Result:**
- Single source of truth: SELFPRINT_PROJECT_CODEX.md
- Execution plan: SELFPRINT_EXECUTION_CHECKLIST_v1.0.md
- Technical gaps: SELFPRINT_COMPLETE_GAP_MAP_v1.0.md

---

## ✅ What Replaces These Documents

### If you need... → Read this instead:

| Looking For | Old Document | New Document |
|-------------|--------------|--------------|
| **Project overview** | MASTER_PRD.md | SELFPRINT_PROJECT_CODEX.md |
| **Development phases** | MASTER_DEVELOPMENT_DIRECTIVE_v2.md | SELFPRINT_EXECUTION_CHECKLIST_v1.0.md |
| **Technical gaps** | MASTER_PRD.md (scattered) | SELFPRINT_COMPLETE_GAP_MAP_v1.0.md |
| **Vision & direction** | Master Direction ของ Selfprint... | SELFPRINT_PROJECT_CODEX.md |
| **Code guidelines** | AI_CONTEXT.md | AI_CONTEXT.md + CODE_DISCIPLINE.md |
| **Architecture** | MASTER_PRD.md + various | docs/development/ARCHITECTURE.md |
| **Development setup** | Various | docs/onboarding/ONBOARDING.md |
| **Reading order** | Unclear | docs/onboarding/READING_LIST.md |

---

## 🔍 Historical Archive (Older)

The `archive/` subfolder contains additional historical documents:

```
docs/archive/
├── archive/              # Earlier iteration backups
├── audits/               # Historical audit reports
├── e2e_reports/          # Old E2E test reports
└── handoffs/             # Project handoff documents
```

These are preserved for reference but should NOT be used for current development.

---

## 🚀 For New Developers

**DO NOT** start with these archived documents.

**Instead, follow this path:**

1. Read `README.md` (5 min)
2. Read `docs/SELFPRINT_PROJECT_CODEX.md` (25 min) ⭐
3. Read `docs/onboarding/READING_LIST.md` (10 min)
4. Follow setup in `docs/onboarding/ONBOARDING.md` (15 min)
5. Start coding with `docs/development/` guides

---

## 📝 Why We Archive

**Benefits of archiving:**
- ✅ Prevents confusion (single source of truth in CODEX)
- ✅ Maintains project history (not deleted)
- ✅ Keeps docs folder clean
- ✅ Makes migration obvious (clearly marked as archived)
- ✅ Enables reference (historical lookup if needed)

**Risks of keeping outdated docs active:**
- ❌ Developers follow wrong processes
- ❌ Conflicting information causes bugs
- ❌ Time wasted on obsolete guidance
- ❌ Onboarding confusion increases

---

## 🔄 How to Use Archive

### Referencing Old Decisions
```
Question: "Why did we design X this way?"
Answer: Check archive for original design docs
Location: docs/archive/[relevant document]
```

### Historical Context
```
Question: "What was the evolution of Twin intelligence?"
Answer: Check Master Direction documents for phase progression
Location: docs/archive/MASTER_DIRECTION_*.md
```

### Rollback/Reverting Changes
```
Question: "What was implementation X before change Y?"
Answer: Check archived implementation docs
Location: docs/archive/IMPLEMENTATION_PLAN_*.md
```

---

## 📋 Archive Verification Checklist

**When reviewing archived documents:**

- ✅ Clearly marked as "archived" or "superseded"
- ✅ Referenced newer version exists
- ✅ File location is `docs/archive/` or subfolder
- ✅ Original content preserved (not modified)
- ✅ Not causing confusion with active docs

---

## 🔐 Archive Integrity

**Archive is read-only for developers.**

To update this README:
1. Update content in this file
2. Do NOT modify archived document contents
3. Add note if context changes (e.g., "See CODEX v2.0 for current version")

**Git tracking:**
- All files in `docs/archive/` are committed to git
- Prevents accidental loss of historical documents
- Enables `git log` to see when docs were archived

---

## 📞 Questions About Archive?

**Q: Should I read these archived documents?**  
A: No. Use SELFPRINT_PROJECT_CODEX.md instead.

**Q: Can I reference these in code comments?**  
A: Yes, for historical context only. Link CODEX instead.

**Q: Can I modify archived documents?**  
A: No. Archive is read-only. Update CODEX instead.

**Q: What if archived doc has info not in CODEX?**  
A: Open issue to update CODEX with missing info.

**Q: When will these be deleted?**  
A: Never. We keep complete project history.

---

## 📊 Archive Statistics

**Documents archived in CODEX v2.0 consolidation:**
- Master direction documents: 3
- Development directives: 2
- Project summaries: 2
- Implementation plans: 2
- **Total:** 9 documents consolidated into 1 CODEX

**Lines of documentation:**
- Old total: ~2,000 lines across 9 documents
- CODEX: ~1,500 lines (consolidated, reduced redundancy)
- Execution guide: ~800 lines (extracted tasks)
- Gap map: ~600 lines (extracted gaps)
- **Net:** Same information, better organized

---

## 🎯 Consolidation Results

✅ **Before:** Developers confused by 9 documents, multiple versions of truth  
✅ **After:** Single CODEX + supplementary docs with clear hierarchy  
✅ **Result:** Onboarding time reduced, fewer misunderstandings, faster development  

---

**Last Updated:** 16 August 2026  
**Archive Version:** CODEX v2.0 Consolidation  
**Status:** Complete, read-only  
**Next Update:** When CODEX v2.1 or later is released
