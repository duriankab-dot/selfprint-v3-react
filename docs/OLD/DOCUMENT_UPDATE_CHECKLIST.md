# 📋 Checklist: เอกสารที่ต้องอัพเดท/สร้าง

**ทำตามใจที่เลือก PATH (STANDALONE or HYBRID)**

---

## 🔴 BOTH PATHS — ต้องทำทั้งคู่

### **1. Update PROJECT_ROADMAP.md**
```
File: D:\selfprint-v3-react\PROJECT_ROADMAP.md

ต้องแก้:
□ Line 3: Change status from "Ready for Testing/Deploy" 
         → "v1.0 Ready / v2.0 Planned"
         
□ Line 13: Add new status line:
         Phase 9:   (Choose based on PATH)
         
□ Section "MVP vs Full Product":
         ✅ Update "Ready for MVP launch"
         
□ Section "Recommended Path Forward":
         ✅ Add "PATH 1: STANDALONE" section
         ✅ Add "PATH 2: HYBRID" section
         ✅ Show PROs/CONs
```

**Owner:** PM  
**Time:** 1 hour  
**Status:** [ ] TODO

---

### **2. Update README.md (root)**
```
File: D:\selfprint-v3-react\README.md

ต้องเพิ่ม:
□ Deployment section
  - URL: https://selfprint.one
  - How to access
  - Features working

□ Quick Start for users
  - Step 1: Go to selfprint.one
  - Step 2: Select hub + mood
  - Step 3: Send message
  - Step 4: Check dashboard

□ Support section
  - Report bugs to: [email]
  - Feature requests: [form]
```

**Owner:** Frontend Lead  
**Time:** 1 hour  
**Status:** [ ] TODO

---

### **3. Create DEPLOYMENT_GUIDE.md**
```
File: D:\selfprint-v3-react\DEPLOYMENT_GUIDE.md (NEW)

Contents:
□ Prerequisites
  - Vercel account
  - GitHub connected
  - Environment variables set
  
□ Manual Deploy Steps
  - Push to GitHub
  - Check Vercel build
  - Verify selfprint.one
  
□ CI/CD Pipeline
  - Auto-deploy on push to main
  - Staging URL (vercel preview)
  
□ Troubleshooting
  - SSL errors
  - Build failures
  - API errors
  
□ Monitoring
  - Error tracking (Sentry)
  - Performance metrics
  - User analytics
```

**Owner:** DevOps  
**Time:** 2 hours  
**Status:** [ ] TODO

---

## 🟢 IF CHOOSING STANDALONE

### **4. Update HANDOFF_PHASE8.md**
```
File: D:\selfprint-v3-react\HANDOFF_PHASE8.md

ต้องเพิ่ม:
□ Section "Phase 9: Deployment"
  - Fix SSL error
  - Deploy to production
  - Monitor metrics
  - Support runbook

□ Section "v1.0 Success Criteria"
  - ✅ selfprint.one accessible
  - ✅ HTTPS working
  - ✅ All features tested
  - ✅ Users can signup
  
□ Section "v1.1+ Roadmap"
  - Mobile responsive improvements
  - Dark mode
  - Performance optimization
  - User feedback features
```

**Owner:** Frontend Lead  
**Time:** 1 hour  
**Status:** [ ] TODO

---

### **5. Create PRODUCTION_RUNBOOK.md**
```
File: D:\selfprint-v3-react\PRODUCTION_RUNBOOK.md (NEW)

Contents:
□ Daily Checklist
  - Error rate OK?
  - API latency OK?
  - Disk space OK?
  - Users can login?

□ Common Issues
  - Claude API quota exceeded → action
  - Supabase RLS error → action
  - Vercel build failed → action

□ Escalation Path
  - Level 1: Auto fix (restart, clear cache)
  - Level 2: On-call engineer (1 hour)
  - Level 3: Full team (critical bugs)

□ Rollback Procedure
  - How to revert to previous version
  - Data safety checks
  - Communication to users
```

**Owner:** DevOps  
**Time:** 2 hours  
**Status:** [ ] TODO

---

### **6. Update Astrovera docs (mark as N/A)**
```
Files:
- D:\SelfPrint\Docs\ASTROVERA_TO_SELFPRINT_MIGRATION_PHASE_PLAN.md
- D:\SelfPrint\Docs\INTEGRATION_SPEC_V1_PRELIMINARY.md

ต้องเพิ่ม:
□ Top of file:
  ⚠️ "NOT APPLICABLE FOR v1.0 (STANDALONE)"
  "See HANDOFF_STRATEGIC_DECISION_HYBRID_vs_STANDALONE.md"
  "Relevant only for v2.0+ (if HYBRID path chosen)"

□ Create section "DEFERRED TO v2.0"
  - These docs apply only if company chooses HYBRID path
  - Timeline: Month 2 evaluation
```

**Owner:** PM  
**Time:** 30 min  
**Status:** [ ] TODO

---

## 🔵 IF CHOOSING HYBRID

### **7. Finalize INTEGRATION_SPEC_V1_PRELIMINARY.md**
```
File: D:\SelfPrint\Docs\INTEGRATION_SPEC_V1_PRELIMINARY.md

ต้องแก้:
□ Line 4: Change from "DRAFT - Awaiting Approval" 
         → "APPROVED - Ready to Build"

□ Add section "Error Handling"
  - What if Brain API down?
  - Fallback to Claude?
  - Error response format

□ Add section "Authentication"
  - API key format
  - Token expiry
  - Refresh mechanism

□ Add section "Rate Limiting"
  - Brain API limits
  - Proxy rate limits
  - Backoff strategy

□ Add section "Monitoring"
  - Log format
  - Metrics to track
  - Alerting thresholds
```

**Owner:** Backend Lead  
**Time:** 2 hours  
**Status:** [ ] TODO

---

### **8. Create ASTROVERA_EXTRACTION_CHECKLIST.md**
```
File: D:\selfprint-v3-react\ASTROVERA_EXTRACTION_CHECKLIST.md (NEW)

Contents:
□ Phase 1: Audit (Week 1)
  - [ ] List all files in D:\astrovera-v2\core
  - [ ] Identify 11 hub archetypes
  - [ ] Identify 6 mood modifiers
  - [ ] List dependencies (external libs)
  - [ ] Estimate lines of code to extract
  
□ Phase 2: Extract (Week 2-3)
  - [ ] Copy prompt templates to JSON
  - [ ] Copy state machines to JS/TS
  - [ ] Copy personality configs
  - [ ] Create standalone Brain service
  - [ ] Test locally
  
□ Phase 3: API (Week 3-4)
  - [ ] Build /api/v1/twin/state
  - [ ] Build /api/v1/twin/mood
  - [ ] Build /api/v1/twin/coaching
  - [ ] Build /api/v1/twin/learn
  - [ ] Deploy to staging
  - [ ] Test all 66 combos
  
□ Phase 4: Integration (Week 5-6)
  - [ ] Update api/nova.ts
  - [ ] Update error handling
  - [ ] Update rate limiting
  - [ ] Test end-to-end
  
□ Phase 5: Migration (Week 7)
  - [ ] Export v2 users
  - [ ] Create migration script
  - [ ] Test restore
  - [ ] Create rollback plan
```

**Owner:** Backend Lead  
**Time:** 1 hour  
**Status:** [ ] TODO

---

### **9. Create BACKEND_MICROSERVICE_SPEC.md**
```
File: D:\selfprint-v3-react\BACKEND_MICROSERVICE_SPEC.md (NEW)

Contents:
□ Architecture Overview
  - Microservice name: Astrovera Brain v3.0
  - Stack: Node.js + Express (or Python + FastAPI)
  - Database: PostgreSQL (for learning history)
  - Deployment: Docker + Railway/Render

□ API Endpoints
  - GET /api/v1/twin/state
  - POST /api/v1/twin/mood
  - POST /api/v1/twin/coaching
  - POST /api/v1/twin/learn
  - GET /api/v1/health (liveness)

□ Response Format
  - Success: { data: {}, error: null }
  - Error: { data: null, error: { code, message } }

□ Environment Variables
  - NODE_ENV=production
  - PERSONALITY_CONFIG_PATH=./config/personalities.json
  - LOG_LEVEL=info

□ Performance Requirements
  - Response time: < 2 seconds (p99)
  - Uptime: 99.5%
  - Concurrent users: 1000+
```

**Owner:** Backend Lead  
**Time:** 2 hours  
**Status:** [ ] TODO

---

### **10. Update ASTROVERA_TO_SELFPRINT_MIGRATION_PHASE_PLAN.md**
```
File: D:\SelfPrint\Docs\ASTROVERA_TO_SELFPRINT_MIGRATION_PHASE_PLAN.md

ต้องแก้:
□ Add at top:
  ⚠️ "Updated for HYBRID Path (Phase 0+)"
  "See HANDOFF_STRATEGIC_DECISION_HYBRID_vs_STANDALONE.md"

□ Update timeline:
  - Phase 0: Week 1 (Preparation)
  - Phase A: (Deferred - using SelfPrint React instead)
  - Phase B: (Deferred - using SelfPrint React instead)
  - Phase C: Weeks 2-8 (Hybrid Integration)

□ Clarify:
  - "Using extracted Astrovera Brain, not full Phase A-B"
  - Link to BACKEND_MICROSERVICE_SPEC.md
```

**Owner:** PM  
**Time:** 1 hour  
**Status:** [ ] TODO

---

### **11. Create DATA_MIGRATION_GUIDE.md**
```
File: D:\selfprint-v3-react\DATA_MIGRATION_GUIDE.md (NEW)

Contents:
□ Migration Overview
  - Source: Astrovera v2 database
  - Destination: Supabase (v3.2)
  - Sample data test first!

□ User Migration
  - Export v2 users (email, name, preferences)
  - Map to Supabase users table
  - Test restore (load old user → see old data)

□ Twin State Migration
  - Export v2 twin states
  - Map autonomy_level, learned_patterns
  - Create migration SQL script

□ Chat History Migration
  - Export v2 conversations
  - Import to Supabase chat_messages
  - Verify timestamps, format

□ Rollback Plan
  - Keep v2 backup
  - Document rollback SQL
  - Test rollback procedure

□ Validation
  - Sample data: 100 users
  - Full run: all users
  - Checksum verification
```

**Owner:** DevOps  
**Time:** 2 hours  
**Status:** [ ] TODO

---

## 📊 Document Status Summary

### **STANDALONE Path (Total: 6 docs)**
```
✅ HANDOFF_STRATEGIC_DECISION_HYBRID_vs_STANDALONE.md (NEW)
□ PROJECT_ROADMAP.md (UPDATE)
□ README.md (UPDATE)
□ DEPLOYMENT_GUIDE.md (NEW)
□ HANDOFF_PHASE8.md (UPDATE)
□ PRODUCTION_RUNBOOK.md (NEW)

Total Time: ~8 hours
Owners: PM (2h), Frontend (2h), DevOps (4h)
```

### **HYBRID Path (Total: 11 docs)**
```
✅ HANDOFF_STRATEGIC_DECISION_HYBRID_vs_STANDALONE.md (NEW)
□ INTEGRATION_SPEC_V1_PRELIMINARY.md (UPDATE)
□ ASTROVERA_EXTRACTION_CHECKLIST.md (NEW)
□ BACKEND_MICROSERVICE_SPEC.md (NEW)
□ ASTROVERA_TO_SELFPRINT_MIGRATION_PHASE_PLAN.md (UPDATE)
□ DATA_MIGRATION_GUIDE.md (NEW)
□ PROJECT_ROADMAP.md (UPDATE)
□ README.md (UPDATE)
□ DEPLOYMENT_GUIDE.md (NEW)
□ PRODUCTION_RUNBOOK.md (NEW)

Total Time: ~16 hours
Owners: PM (4h), Backend (6h), DevOps (6h)
```

---

## ✅ How to Use This Checklist

1. **Decide PATH** → STANDALONE or HYBRID
2. **Print this checklist** → Give to owners
3. **Assign each checkbox** → Who + deadline
4. **Track progress** → Weekly status
5. **Merge to main** → When all ✅

---

## 🎯 Priority Order

### **STANDALONE (Do First)**
1. HANDOFF_STRATEGIC_DECISION.md ✅ (done)
2. DEPLOYMENT_GUIDE.md (DevOps - 2h)
3. HANDOFF_PHASE8.md (Frontend - 1h)
4. README.md (Frontend - 1h)
5. PROJECT_ROADMAP.md (PM - 1h)
6. PRODUCTION_RUNBOOK.md (DevOps - 2h)

**Total: 8 hours → Ready to deploy**

### **HYBRID (Do in Parallel)**
1. HANDOFF_STRATEGIC_DECISION.md ✅ (done)
2. INTEGRATION_SPEC_V1_PRELIMINARY.md (Backend - 2h)
3. ASTROVERA_EXTRACTION_CHECKLIST.md (Backend - 1h)
4. BACKEND_MICROSERVICE_SPEC.md (Backend - 2h)
5. ASTROVERA_TO_SELFPRINT_MIGRATION_PHASE_PLAN.md (PM - 1h)
6. DATA_MIGRATION_GUIDE.md (DevOps - 2h)
7. DEPLOYMENT_GUIDE.md (DevOps - 2h)
8. PRODUCTION_RUNBOOK.md (DevOps - 2h)
9. PROJECT_ROADMAP.md (PM - 1h)
10. README.md (Frontend - 1h)

**Total: 16 hours → Ready to build**

---

**Last Updated:** 2026-08-06  
**Version:** 1.0  
**Status:** ⏳ PRINT & ASSIGN
