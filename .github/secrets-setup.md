# GitHub Secrets Setup — PHASE 3 Automation + STAGING DEPLOY (อัปเดต 22 ก.ย. 2026)

Add these secrets to GitHub repository settings
(Settings → Secrets and variables → **Actions** — repo-level, ไม่ใช่ Environments/Codespaces/Dependabot).
Secrets ที่ถูกใส่ใน **Environment** scope จะมองไม่เห็นจาก job ที่ไม่ได้ตั้ง `environment:` → ได้ค่า empty.

## Required Secrets

```
# ───── E2E / unit ─────
PRODUCTION_URL
  Value: https://www.selfprint.one

SENTRY_DSN
  Value: https://[KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]
  (จาก Sentry project settings)

SLACK_WEBHOOK_URL
  Value: https://hooks.slack.com/services/[PATH]
  หมายเหตุ: ถ้ายังไม่ตั้ง — ขั้น Notify Slack จะ curl exit code 3
  แต่มี continue-on-error: true → ไม่ล้ม job (มี annotation error ใน summary เท่านั้น)

TEST_EMAIL
  Value: loadtest@selfprint.one
  (test user email สำหรับ Playwright)

TEST_PASSWORD
  Value: [secure-password-for-test-user]

E2E_SUPABASE_URL
  Value: [Supabase URL สำหรับ seed test users (Phase B)]

E2E_SUPABASE_ANON_KEY
  Value: [Supabase anon key (public client key)]

E2E_TEST_PASSWORD
  Value: [password ของ test user Phase B]

# ───── Staging deploy (job: deploy-staging) ─────
CLOUDFLARE_API_TOKEN
  Value: Cloudflare API token — scope ต่ำสุด:
         Cloudflare Pages:Edit (+ Account:Read เวลาตรวจ project)

CLOUDFLARE_ACCOUNT_ID
  Value: Cloudflare Account ID
  (Dashboard → right sidebar → Account ID)

# ───── Build-time env สำหรับ staging bundle (CI-BUILD-ENV-001) ─────
#  ต้องมีค่าเดียวกับ .env.production ที่ใช้ build ท้องถิ่น (git-ignored)
#  ถ้า empty / missing → bundle ที่ CI deploy runtime-error
#    "Missing Supabase credentials" → chromium-staging fail 17/17 (deterministic)
VITE_SUPABASE_URL
  Value: [== .env.production VITE_SUPABASE_URL]

VITE_SUPABASE_ANON_KEY
  Value: [== .env.production VITE_SUPABASE_ANON_KEY]
```

## Deployment flow (อัตโนมัติทุก push master)

```
push master (SHA=X)
  ├─ unit-tests                     (อิสระ)
  ├─ deploy-staging                 (needs: none)
  │     checkout ref=<X> → npm ci → npm run build  (env: VITE_SUPABASE_*)
  │     → npx wrangler@4.131.2 pages deploy dist --project-name selfprint-staging
  │         --branch <ref_name> --commit-hash <X> --commit-message <msg>
  │     → verify https://selfprint-staging.pages.dev = HTTP 200
  └─ e2e-tests   (needs: deploy-staging)
        └─ เริ่มเมื่อ staging deploy ของ commit เดียวกันสำเร็จเท่านั้น
```

- staging deploy เป็น deterministic: build จาก commit เดียวกับ run, deployment ระบุ commit hash (provenance)
- การเปลี่ยน env ที่กระทบ staging bundle → ต้องให้ deploy เกิดใหม่เสมอ (re-run all jobs / push ใหม่)
- ห้ามใช้ manual `wrangler pages deploy` แทน CI (เฉพาะ debug fallback) — เดี๋ยว CI จะทับ deployment
- **Action Runtime:** GitHub Actions target Node 20 อยู่ (actions v4) → กำลังแก้ด้วย bump เป็น major ที่ node24 native: `checkout@v5`, `setup-node@v5`, `upload-artifact@v6`, `download-artifact@v7` (อ้างอิง release notes ทางการ) — warning "Node.js 20 is deprecated" คาดว่าจะหายหลัง run ถัดไป — ต้องยืนยันจาก run ถัดไปก่อนเขียนว่าหายจริง
- **Annotation อื่นที่คงอยู่:** notice ubuntu-latest → Ubuntu 26 migration (ไม่แตะรอบนี้), Slack `exit code 3` failure annotation (curl exit 3 — known behavior, `continue-on-error: true`)

## Setup Steps

1. ไปที่ GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. เพิ่ม secret แต่ละตัวตามรายการด้านบน (repo-level)
4. Save

## Verification

- ตรวจ: `git push` → Actions run → job `Deploy Staging` success → job `E2E Tests` success
- ตรวจ staging fingerprint ได้จาก CI log / หน้า Pages deployments (ดู `--commit-hash`)
- ถ้า E2E แดงกลุ่ม chromium-staging ด้วย "Missing Supabase credentials"
  → ตรวจ `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (ชื่อ/ค่า/scope)

## Monitoring Secrets

- Rotate secrets ทุก 3 เดือน (โดยเฉพาะ Cloudflare + Supabase)
- Revoke old Slack webhooks
- Regenerate test user password quarterly
- ห้าม commit ค่า secret จริงลง repo / docs (ดู `.env.example` สำหรับชื่อ key เท่านั้น)