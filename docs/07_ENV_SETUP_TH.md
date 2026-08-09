# 📄 Environment Variables Setup Guide

**Date:** 2026-08-07  
**Language:** ไทย  
**Phase:** Phase 3 Setup  
**Owner:** DevOps + Frontend Lead  

---

## 🔐 ENVIRONMENT VARIABLES (Frontend)

### **Development (.env.local)**

```bash
# Brain Gateway
REACT_APP_BRAIN_GATEWAY_URL=http://localhost:8787

# Features
REACT_APP_ENABLE_NOVA_BETA=true
REACT_APP_LOG_LEVEL=debug

# Optional: Sentry/Logging
REACT_APP_SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[project]

# Feature Flags
REACT_APP_FF_MEMO_V2_LANDING=true
REACT_APP_FF_AI_CREATION_ANIMATION=true
REACT_APP_FF_FINE_TUNING=true
```

### **Staging (.env.staging)**

```bash
# Brain Gateway
REACT_APP_BRAIN_GATEWAY_URL=https://astrovera-staging.duriankab.workers.dev

# Features
REACT_APP_ENABLE_NOVA_BETA=true
REACT_APP_LOG_LEVEL=info

# Monitoring
REACT_APP_SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[project]-staging
REACT_APP_ANALYTICS_ID=G-[staging-id]

# Feature Flags
REACT_APP_FF_MEMO_V2_LANDING=true
REACT_APP_FF_AI_CREATION_ANIMATION=true
REACT_APP_FF_FINE_TUNING=true
```

### **Production (.env.production)**

```bash
# Brain Gateway
REACT_APP_BRAIN_GATEWAY_URL=https://astrovera.duriankab.workers.dev

# Features
REACT_APP_ENABLE_NOVA_BETA=false
REACT_APP_LOG_LEVEL=error

# Monitoring
REACT_APP_SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[project]
REACT_APP_ANALYTICS_ID=G-[prod-id]

# Feature Flags (all enabled for launch)
REACT_APP_FF_MEMO_V2_LANDING=true
REACT_APP_FF_AI_CREATION_ANIMATION=true
REACT_APP_FF_FINE_TUNING=true
```

---

## 🔐 ENVIRONMENT VARIABLES (Backend - Astrovera)

### **Development (wrangler.toml)**

```toml
[env.development]
vars = {
  ANTHROPIC_API_KEY = "sk-ant-[dev-key]",
  BRAIN_CACHE_TTL = "300",
  DEBUG_MODE = "true",
  LOG_LEVEL = "debug"
}

[env.development.kv_namespaces]
KV_CACHE = { binding = "KV_CACHE", id = "[dev-id]" }
```

### **Staging (wrangler.toml)**

```toml
[env.staging]
vars = {
  ANTHROPIC_API_KEY = "sk-ant-[staging-key]",
  BRAIN_CACHE_TTL = "3600",
  DEBUG_MODE = "false",
  LOG_LEVEL = "info"
}

[env.staging.kv_namespaces]
KV_CACHE = { binding = "KV_CACHE", id = "[staging-id]" }
```

### **Production (wrangler.toml)**

```toml
[env.production]
vars = {
  ANTHROPIC_API_KEY = "sk-ant-[prod-key]",
  BRAIN_CACHE_TTL = "7200",
  DEBUG_MODE = "false",
  LOG_LEVEL = "error"
}

[env.production.kv_namespaces]
KV_CACHE = { binding = "KV_CACHE", id = "[prod-id]" }
```

---

## 🛠️ SETUP INSTRUCTIONS

### Step 1: Frontend Setup

**Create .env.local (Development)**
```bash
cd D:\selfprint-v3-react

# Copy template
cp .env.example .env.local

# Edit with your values
code .env.local
```

**Build Command (Staging/Production)**
```bash
# Staging
REACT_APP_ENV=staging npm run build

# Production
REACT_APP_ENV=production npm run build
```

### Step 2: Backend Setup (Astrovera)

**Update wrangler.toml**
```bash
cd D:\astrovera-v2

# Edit wrangler.toml with environment-specific values
code wrangler.toml

# Deploy to development
wrangler publish --env development

# Deploy to staging
wrangler publish --env staging

# Deploy to production (requires approval)
wrangler publish --env production
```

### Step 3: Verify Setup

**Frontend**
```bash
npm run dev
# Should connect to Brain Gateway

curl -X GET http://localhost:3000
# Should load without errors
```

**Backend**
```bash
wrangler dev --env development
# Should start local worker

curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
# Should return response
```

---

## 🔑 SECRETS MANAGEMENT

### **Frontend (No Secrets)**
```
✅ All REACT_APP_* are public (safe to commit)
❌ NO API keys in frontend
❌ NO tokens in .env
```

### **Backend (Secrets Only in Workers)**
```
✅ Store in wrangler.toml [secrets] section
✅ Access via env.VARIABLE_NAME
✅ Never commit to git
```

**Add Secret:**
```bash
wrangler secret put ANTHROPIC_API_KEY --env production
# Will prompt for value (masked)
```

**List Secrets:**
```bash
wrangler secret list --env production
# Shows names only (not values)
```

---

## 🚀 DEPLOYMENT ENVIRONMENT SETUP

### **Staging Deployment**

```bash
# Frontend
npm run build
# Deploy to staging server

# Backend
wrangler publish --env staging
# Deploys to CloudFlare Workers
```

### **Production Deployment**

```bash
# Frontend
REACT_APP_ENV=production npm run build
# Deploy to production server

# Backend (requires 2 approvals)
wrangler publish --env production
# Deploys with monitoring
```

---

## ✅ ENVIRONMENT VALIDATION CHECKLIST

**Before Each Deploy:**

```
Frontend:
[ ] All REACT_APP_* variables defined
[ ] No console errors on build
[ ] Brain Gateway URL correct
[ ] Feature flags set appropriately
[ ] Source maps NOT in production
[ ] API keys NOT in .env

Backend:
[ ] ANTHROPIC_API_KEY set
[ ] Cache TTL appropriate
[ ] Log level set
[ ] Database connection tested
[ ] KV namespace bound
[ ] Routes configured

Shared:
[ ] CORS headers correct
[ ] Timeouts reasonable
[ ] Rate limits in place
[ ] Monitoring configured
[ ] Error reporting on
```

---

## 🔍 TROUBLESHOOTING

### "Cannot connect to Brain Gateway"
```bash
# Check URL in .env
echo $REACT_APP_BRAIN_GATEWAY_URL

# Test connectivity
curl $REACT_APP_BRAIN_GATEWAY_URL/health

# If fails:
# 1. Verify URL is correct
# 2. Check network/firewall
# 3. Restart local worker (wrangler dev)
```

### "ANTHROPIC_API_KEY not found"
```bash
# Check wrangler.toml
wrangler secret list --env [env]

# If missing:
wrangler secret put ANTHROPIC_API_KEY --env [env]
```

### "Feature flag not working"
```bash
# Check .env has the flag
grep REACT_APP_FF_ .env

# Check code uses feature flag
grep -r "process.env.REACT_APP_FF_" src/

# If still not working:
# 1. Rebuild (npm run build)
# 2. Clear browser cache
# 3. Verify flag spelling
```

---

## 📝 ENVIRONMENT SUMMARY TABLE

| Variable | Dev | Staging | Prod | Secret? |
|----------|-----|---------|------|---------|
| BRAIN_GATEWAY_URL | localhost:8787 | staging | prod | ❌ |
| ANTHROPIC_API_KEY | dev-key | staging-key | prod-key | ✅ |
| LOG_LEVEL | debug | info | error | ❌ |
| CACHE_TTL | 300s | 3600s | 7200s | ❌ |
| SENTRY_DSN | dev-project | staging | prod | ❌ |

---

## 🎯 NEXT STEPS

1. **Prepare secrets** with DevOps/Infrastructure
2. **Update .env templates** in repo
3. **Test deployment** to staging first
4. **Validate monitoring** before production
5. **Document any custom vars** in this guide

---

**Prepared by:** jb_DEV  
**Status:** 📋 Ready for Infrastructure Setup  
**Requires:** DevOps approval before production
