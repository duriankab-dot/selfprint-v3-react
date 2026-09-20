# docs/archive/ — Historical Documents

เอกสารในโฟลเดอร์นี้ถูกย้ายออกจากตำแหน่งเดิม (root / `docs/`) ระหว่าง **Sep 19 2026
documentation cleanup** เพราะเป็น:

| Category | Files | Reason |
|----------|-------|--------|
| Phase / release closing plans | `PHASE_12/13/14`, `PHASE_A_*`, `PHASE_B_COMMUNITY_SPEC`, `PHASE_STATUS_SUMMARY` | superseded โดย Master Gate closure — ข้อมูลจบที่ 18 ก.ย. 2026 |
| Planning / execution notes | `00_CLEANUP_PLAN`, `00_START_HERE`, `EXECUTIVE_SUMMARY`, `QUICK_ACTION_PLAN`, `PLAN_TRACKS`, `MASTER DIRECTION UPDATE…` | one-off planning; ไม่ใช่ reference ปัจจุบัน |
| PRD / spec ที่ถูกแทน | `MASTER_PRD.md`, `PERSONAL_AI_OS_MASTER_SPEC_V1`, `SELF_MASTER_VISUAL…` | superseded โดย `docs/SELFPRINT MASTER PRODUCT SPEC & 100% CLOSURE BOOK.md` |
| Audits dated | `CODEBASE_AUDIT_2026-08-16`, `SECURITY_AUDIT_2026-08-18`, `SELFPRINT COMPLETE_GAP_MAP_FINAL_THAI`, `SELFPRINT FINAL PRODUCTION CLOSURE AUDIT` | dated snapshots; อ้างอิงได้ตามวันที่เท่านั้น |
| Ops/handoff notes | `LIGHTHOUSE_FIX_SUMMARY`, `SMOKE_TEST_FIX_SUMMARY`, `MASTER_GATE_CHANGE_MAP`, `MASTER_GATE_REMEDIATION_PLAN`, `PRODUCTION_VERIFICATION_CLOSURE_PLAN`, `HANDOFF_2026-09-13`, `PRODUCTION-VERIFICATION` | evidence ของการแก้ไขเฉพาะจุด; ถูกแทนโดย evidence ล่าสุดใน `MASTER_GATE_AS_IS.md` / `MASTER_GATE_EVIDENCE.md` |
| Migrated operator/supp docs | `I18N_*`, `MARKET_ANALYSIS`, `BLOG_ARTICLE_MANIFEST`, `DIGITAL_ASSETS_CATALOG`, `E2E_FLOW_TEST_PLAN`, `AI_CONTEXT_CLOSE_ITEMS`, `AI_WORKING_DISCIPLINE_RULES`, `BUNDLE_PERF_A3`, `OPENROUTER_MIGRATION`, `SELF_MASTER_…` | historic baseline / คนส่วนใหญ่ที่ไม่ต้องอ่านจาก status ปัจจุบัน |
| Status ที่ล้าสมัย | `SELFPRINT_PRODUCTION_STATUS_TH.md` (13 ก.ย., "12/12 · 30 skips · 100%") | ถูกแทนโดย `docs/SELFPRINT_STATUS_HONEST_TH.md` (19 ก.ย. — 38/0/11) |

**กฎการใช้งาน:**

1. อย่านำตัวเลข/status จากเอกสารเหล่านี้มาเป็น "สถานะปัจจุบัน" — ใช้เป็น historical evidence เท่านั้น
2. Current source of truth: `README.md` (root) → `docs/SELFPRINT MASTER PRODUCT SPEC & 100% CLOSURE BOOK.md` → `docs/README.md`
3. ถ้าต้องอ้างอิง ค่าที่ verify แล้ว: `MASTER_GATE_AS_IS.md` (11-skip inventory) + `MASTER_GATE_EVIDENCE.md` (evidence) + `FINAL_TEST_CLOSURE_REPORT.md` (run 07:22 UTC) + `npm test` = 1050/1050