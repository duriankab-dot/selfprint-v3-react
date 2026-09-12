# 🟢 SELFPRINT PRODUCTION STATUS ภาษาไทย

**อัปเดต:** 13 กันยายน 2026 — เขียนทับข้อมูลเดิม

---

## Production (https://selfprint.one)

| รายการ | สถานะ |
|--------|--------|
| หน้า landing /en /th /pricing /components /login | ✅ 200 ผ่าน |
| SK-01..12 production smoke | ✅ 27/27 `/api/og`, `/llms.txt`, CTA, JS errors, cold-start(<8s) |
| Mobile production smoke | ✅ 12/12 (Chrome), 12/12 (Safari/WebKit) |
| ข้อความ Trojan rule (ไม่ให้มี "ดูดวง") | ✅ ผ่าน |

**สรุป production: ✅ พร้อมใช้งาน (Phase A 51/51)**

## Staging (https://selfprint-staging.pages.dev)

| รายการ | สถานะ |
|--------|--------|
| Auth pipeline (REST login → inject → storageState) | ✅ ทำงานจริง |
| Phase B lifecycle (local, chromium-staging) | ✅ 25/25 PASS (13 ก.ย. 2026 00:17 UTC) |
| CI E2E (GitHub Actions) | ️ 36/49 PASS — 7 FAIL |
| สาเหตุ CI 7 FAIL | 1 typo (LIFE-01, แก้แล้ว) + 6 staging URL 525 |
| `staging.selfprint.one` | ❌ Cloudflare 525 SSL — ใช้ `selfprint-staging.pages.dev` แทนได้ |

**สรุป staging: ⚠️ Local lifecycle 25/25 ✅ — CI blocked by staging URL mismatch**

## GitHub Actions Secrets

| Secret | Purpose | Status |
|--------|---------|--------|
| `E2E_SUPABASE_URL` | Staging Supabase URL | ✅ set |
| `E2E_SUPABASE_ANON_KEY` | Staging Supabase anon key | ✅ set |
| `E2E_TEST_PASSWORD` | Test user password | ✅ set |
| `TEST_EMAIL` | Test user email | ✅ set |
| `TEST_PASSWORD` | Legacy (not used by global-setup) | ✅ set |

## Gate โดยรวม

```text
MASTER GATE = NOT PASS ❌  (blocked: CI staging URL + MG testid drift)

Production: ✅ 51/51
Staging lifecycle (local): ✅ 25/25
Staging CI: ⚠️ 36/49 (6 from URL 525, 1 typo fixed)
MG suite: ❌ testid drift (deployed bundle lacks testids)
```

เส้นทางปิด:
1. แก้ `STAGING_URL` → `https://selfprint-staging.pages.dev` (不是在 `staging.selfprint.one`)
2. Rerun CI → confirm 0 FAIL from URL issue
3. Reconcile MG test contract with immersion-first design
4. Commit/push URL fix

---

**Status: ⚠️ NOT PASS — production ✅, staging lifecycle ✅ (local), CI blocked by URL**
