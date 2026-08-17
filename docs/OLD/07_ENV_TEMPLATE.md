# 🔐 Environment Configuration Template

**Date:** 2026-08-07  
**Language:** English + Thai  
**Phase:** Phase 3 Integration  
**Owner:** DevOps + Backend Team  
**Duration:** 1 hour setup  
**Status:** REQUIRED - All environments

---

## 🎯 OBJECTIVE

ตั้งค่า **environment variables** สำหรับ development, staging, production environments

---

## ⚠️ SECURITY RULES

1. **NEVER commit .env files to Git** → Add to .gitignore
2. **NEVER hardcode API keys** → Use environment variables only
3. **Rotate secrets monthly** → AWS Secrets Manager or HashiCorp Vault
4. **Log rotation policy** → Never log API keys, user PII
5. **Access control** → Only DevOps team has production secrets

---

## 📋 FILE STRUCTURE

```
selfprint-v3-react/
├── .env                      (git ignored, local development)
├── .env.development          (development environment)
├── .env.staging              (staging/QA environment)
├── .env.production           (production - SECURED)
├── .env.example              (template, safe to commit)
└── .env.local.example        (local override template)
```

---

## 📝 .ENV.EXAMPLE (Safe to Commit)

```bash
# ============================================
# SELFPRINT v3.2 - Environment Configuration
# ============================================

# ---- APPLICATION ----
REACT_APP_ENV=development
REACT_APP_NAME=SelfPrint v3.2
REACT_APP_VERSION=3.2.0
NODE_ENV=development

# ---- API ENDPOINTS ----
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_CHAT_ENDPOINT=/api/chat
REACT_APP_BRAIN_GATEWAY_URL=https://api.astrovera.dev/chat

# ---- CLAUDE API ----
REACT_APP_CLAUDE_MODEL=claude-3-5-sonnet-20241022
REACT_APP_CLAUDE_TEMPERATURE=0.7
REACT_APP_CLAUDE_MAX_TOKENS=2048

# ---- AUTH (if using) ----
REACT_APP_AUTH_PROVIDER=none  # or 'auth0', 'firebase', etc.
REACT_APP_OAUTH_CLIENT_ID=placeholder_only

# ---- ANALYTICS ----
REACT_APP_GA_ID=placeholder_only
REACT_APP_MIXPANEL_TOKEN=placeholder_only
REACT_APP_SENTRY_DSN=placeholder_only

# ---- FEATURE FLAGS ----
REACT_APP_ENABLE_SCIE_BASELINE=false
REACT_APP_ENABLE_VIRAL_LOOP=false
REACT_APP_DEBUG_MODE=true

# ---- RATE LIMITING ----
REACT_APP_MAX_REQUESTS_PER_MINUTE=60
REACT_APP_MAX_REQUESTS_PER_HOUR=1000
```

---

## 🔧 .ENV.DEVELOPMENT (Local Development)

**Location:** `selfprint-v3-react/.env`

```bash
# ============================================
# DEVELOPMENT ENVIRONMENT
# ============================================

# Application
REACT_APP_ENV=development
NODE_ENV=development
REACT_APP_VERSION=3.2.0-dev

# API (Local Backend)
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_CHAT_ENDPOINT=/api/chat
REACT_APP_BRAIN_GATEWAY_URL=http://localhost:8787/chat

# Claude API
REACT_APP_CLAUDE_MODEL=claude-3-5-sonnet-20241022
REACT_APP_CLAUDE_TEMPERATURE=0.7

# Auth (Disabled in dev)
REACT_APP_AUTH_PROVIDER=none

# Analytics (Disabled in dev)
REACT_APP_GA_ID=dev_ga_id
REACT_APP_DEBUG_MODE=true

# Feature Flags
REACT_APP_ENABLE_SCIE_BASELINE=false
REACT_APP_ENABLE_VIRAL_LOOP=false

# Rate Limiting (Relaxed for testing)
REACT_APP_MAX_REQUESTS_PER_MINUTE=1000
```

**Setup Instructions:**
```bash
cd selfprint-v3-react
cp .env.example .env
# Edit .env with your local values
npm install
npm run dev
```

---

## 🟡 .ENV.STAGING (QA / Staging)

**Location:** `selfprint-v3-react/.env.staging`

```bash
# ============================================
# STAGING ENVIRONMENT
# ============================================

# Application
REACT_APP_ENV=staging
NODE_ENV=production
REACT_APP_VERSION=3.2.0-staging

# API (Staging Backend)
REACT_APP_API_BASE_URL=https://api-staging.selfprint.io/api
REACT_APP_CHAT_ENDPOINT=/api/chat
REACT_APP_BRAIN_GATEWAY_URL=https://brain-staging.astrovera.dev/chat

# Claude API (Production)
REACT_APP_CLAUDE_MODEL=claude-3-5-sonnet-20241022
REACT_APP_CLAUDE_TEMPERATURE=0.7
REACT_APP_CLAUDE_MAX_TOKENS=2048

# Auth
REACT_APP_AUTH_PROVIDER=auth0
REACT_APP_OAUTH_CLIENT_ID=staging_client_id_here  # From Auth0 dashboard

# Analytics
REACT_APP_GA_ID=G-STAGING-ID
REACT_APP_MIXPANEL_TOKEN=staging_token_here
REACT_APP_SENTRY_DSN=https://key@sentry.io/project-staging

# Feature Flags
REACT_APP_ENABLE_SCIE_BASELINE=true
REACT_APP_ENABLE_VIRAL_LOOP=false
REACT_APP_DEBUG_MODE=false

# Rate Limiting
REACT_APP_MAX_REQUESTS_PER_MINUTE=100
REACT_APP_MAX_REQUESTS_PER_HOUR=5000
```

**Secrets in Staging** (AWS Secrets Manager):
```json
{
  "CLAUDE_API_KEY": "sk-ant-...",
  "AUTH0_SECRET": "staging_secret_key",
  "DATABASE_URL": "postgres://staging-db:5432/selfprint_staging"
}
```

---

## 🟢 .ENV.PRODUCTION (SECURE)

**Location:** `selfprint-v3-react/.env.production`  
**ACCESS:** DevOps Only (stored in AWS Secrets Manager, never in Git)

```bash
# ============================================
# PRODUCTION ENVIRONMENT
# ============================================

# Application
REACT_APP_ENV=production
NODE_ENV=production
REACT_APP_VERSION=3.2.0

# API (Production Backend)
REACT_APP_API_BASE_URL=https://api.selfprint.io/api
REACT_APP_CHAT_ENDPOINT=/api/chat
REACT_APP_BRAIN_GATEWAY_URL=https://brain.astrovera.dev/chat

# Claude API (Production)
REACT_APP_CLAUDE_MODEL=claude-3-5-sonnet-20241022
REACT_APP_CLAUDE_TEMPERATURE=0.7
REACT_APP_CLAUDE_MAX_TOKENS=2048

# Auth (Auth0)
REACT_APP_AUTH_PROVIDER=auth0
REACT_APP_OAUTH_CLIENT_ID=prod_client_id_here

# Analytics
REACT_APP_GA_ID=G-PROD-ID
REACT_APP_MIXPANEL_TOKEN=prod_token_here
REACT_APP_SENTRY_DSN=https://key@sentry.io/project-prod

# Feature Flags
REACT_APP_ENABLE_SCIE_BASELINE=true
REACT_APP_ENABLE_VIRAL_LOOP=false
REACT_APP_DEBUG_MODE=false

# Rate Limiting (Strict)
REACT_APP_MAX_REQUESTS_PER_MINUTE=60
REACT_APP_MAX_REQUESTS_PER_HOUR=3000
```

**Secrets in Production** (AWS Secrets Manager):
```json
{
  "CLAUDE_API_KEY": "sk-ant-...",
  "AUTH0_SECRET": "prod_secret_key",
  "DATABASE_URL": "postgres://prod-db-secure:5432/selfprint_prod",
  "ENCRYPTION_KEY": "encrypted_master_key_here",
  "STRIPE_SECRET_KEY": "sk_live_...",
  "SENDGRID_API_KEY": "SG...."
}
```

---

## 🛠️ BACKEND ENVIRONMENT (Astrovera v2 - Brain Gateway)

**File:** `astrovera-v2/functions/.env`

```bash
# Brain Gateway Backend Configuration

# Wrangler / Cloudflare Workers
ENVIRONMENT=production
ACCOUNT_ID=your_cloudflare_account_id
WORKERS_KV_NAMESPACE=selfprint_brain_gateway

# Claude API
CLAUDE_API_KEY=sk-ant-...  (stored in Wrangler secrets)
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Logging
LOG_LEVEL=info
SENTRY_DSN=https://key@sentry.io/project-backend

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=5000

# CORS
ALLOWED_ORIGINS=https://selfprint.io,https://app.selfprint.io
```

---

## 🚀 DEPLOYMENT SETUP

### Option 1: GitHub Actions (Automated)

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Load production secrets
        run: |
          aws secretsmanager get-secret-value \
            --secret-id selfprint/prod/env \
            --query SecretString --output text > .env.production
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel deploy --prod --env-file .env.production
```

### Option 2: Manual Deployment

```bash
# 1. Get production secrets from AWS
aws secretsmanager get-secret-value \
  --secret-id selfprint/prod/env \
  --query SecretString --output text > .env.production

# 2. Build
npm run build

# 3. Deploy
vercel deploy --prod --env-file .env.production

# 4. Verify
curl https://selfprint.io/api/health
```

---

## 🔐 SECRETS ROTATION SCHEDULE

| Secret | Rotation Frequency | Owner | Method |
|--------|-------------------|-------|--------|
| CLAUDE_API_KEY | Monthly | Backend Lead | AWS Secrets Manager |
| AUTH0_SECRET | Quarterly | DevOps | Auth0 Dashboard |
| DATABASE_PASSWORD | Quarterly | DevOps | AWS RDS console |
| STRIPE_SECRET | Annually or on breach | Finance | Stripe Dashboard |

---

## ✅ VERIFICATION CHECKLIST

After setting up environment:

```bash
# 1. Verify React app loads
npm run dev
# → Open http://localhost:3000 (should load without errors)

# 2. Verify API connectivity
curl http://localhost:3000/api/health
# → Should return { status: "ok" }

# 3. Verify Claude API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
# → Should return Claude response

# 4. Verify Brain Gateway (if ready)
curl -X POST https://brain.astrovera.dev/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}], "system": "You are Nova..."}'
# → Should return personalized response

# 5. Check for hardcoded secrets
grep -r "sk-ant-" src/ || echo "✅ No hardcoded keys found"
grep -r "CLAUDE_API_KEY=" .env.production && echo "❌ Leaked in Git!" || echo "✅ Secured"
```

---

## 🚨 TROUBLESHOOTING

| Error | Cause | Fix |
|-------|-------|-----|
| `API_BASE_URL not defined` | Missing .env file | Copy .env.example → .env, add values |
| `401 Unauthorized` | Invalid CLAUDE_API_KEY | Check AWS Secrets Manager |
| `CORS error` | Domain not in ALLOWED_ORIGINS | Add to CORS config in backend |
| `Rate limit exceeded` | Too many requests | Check REACT_APP_MAX_REQUESTS_PER_MINUTE |

---

## 🔗 Related Documents

- **06_DEPLOYMENT_READINESS_TH.md** — Deployment checklist
- **08_BACKEND_GATEWAY_SAMPLE_CODE.js** — Backend implementation
- **00_CURRENT_STATUS_IMPLEMENTATION_PLAN_TH.md** — Full project status

---

**Created:** 2026-08-07  
**Last Updated:** 2026-08-07  
**Next Review:** On deployment day
