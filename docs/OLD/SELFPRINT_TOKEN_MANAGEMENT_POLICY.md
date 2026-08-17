# 🔐 SELFPRINT TOKEN MANAGEMENT & AUTHORIZATION POLICY
**API Keys, Credentials & Access Control**

**Document Version**: V1.0 | **Date**: 2026-08-03 | **Classification**: CONFIDENTIAL

---

## 📋 OVERVIEW

This document defines how to securely manage API tokens, credentials, and authorization across the SelfPrint development team.

**Applies To**: All team members with code/infra access
**Updates**: Every 90 days (token rotation) + policy review quarterly

---

## 🔑 TOKENS REQUIRED FOR SELFPRINT

### Production Tokens (Needed Before Launch)

| Token | Service | Purpose | Who Needs | Rotation |
|-------|---------|---------|-----------|----------|
| **Firebase Config** | Google Firebase | Auth + Firestore DB | All devs | Static |
| **Claude API Key** | Anthropic Claude | Nova AI responses | AI/ML engineer | 90 days |
| **PostgreSQL URI** | Database | User data + logs | Backend dev | 180 days |
| **JWT Secret** | Internal | Session tokens | Backend dev | 90 days |
| **SendGrid API Key** | SendGrid | Email notifications | Backend dev | 90 days |
| **Mixpanel Token** | Mixpanel | User analytics | All devs | Static |
| **GitHub Token** | GitHub | CI/CD deployments | Tech lead | 90 days |
| **Vercel/Railway Token** | Hosting | Production deploy | Tech lead | 90 days |

### Development Tokens (Local Testing)

| Token | Service | Purpose | Scope |
|-------|---------|---------|-------|
| Firebase Dev Project | Google Firebase | Local auth testing | `localhost:3000` only |
| Claude API Key (dev tier) | Anthropic Claude | Testing Nova responses | Rate limited to 100/day |
| PostgreSQL Dev DB | Local/Docker | Schema testing | Local machine only |
| Stripe Test Keys | Stripe (if needed later) | Payment testing | Test environment |

---

## 📦 CREDENTIAL DISTRIBUTION PROCESS

### For Each New Team Member

1. **Access Request**
   - Submit to: Tech Lead
   - Include: Role, start date, manager approval
   - Timeline: 24 hours

2. **Credentials Setup**
   ```
   Tech Lead creates .env.local file with:
   - Firebase config (development project)
   - Claude API key (development tier)
   - Local PostgreSQL credentials
   - Other dev credentials
   ```

3. **Delivery Method** (Choose one)
   - **1Password Vault**: Shared team vault (preferred)
   - **LastPass**: Enterprise account access
   - **Manual handoff**: In-person with tech lead (sensitive keys)
   - **Email**: Encrypted with PGP key (fallback)

4. **Confirmation**
   - [ ] Member confirms receipt
   - [ ] Member confirms working `.env.local`
   - [ ] Tech lead revokes if not used in 7 days

---

## 🗂️ FOLDER STRUCTURE (.env FILES)

### Repository Structure
```
selfprint/
├── .env.local (GITIGNORED - developer sets up)
├── .env.example (template for new devs)
├── .env.production (CI/CD only, never commit)
├── src/
│   └── config/
│       └── firebase.js (loads from .env.local)
├── server/
│   └── config/
│       └── database.js (loads from .env.local)
└── README.md (mentions .env setup)
```

### .env.local Template (Developer Copy)
```bash
# FRONTEND

# Firebase (Development Project)
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx

# Claude AI (Development Tier)
REACT_APP_CLAUDE_API_KEY=sk-ant-xxx (DEV tier, rate-limited)

# Analytics (Dev Project)
REACT_APP_MIXPANEL_TOKEN=xxx-dev

# Environment
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:5000

# BACKEND

# Database (Local or Dev Server)
DATABASE_URL=postgresql://user:pass@localhost:5432/selfprint_dev

# Claude API
CLAUDE_API_KEY=sk-ant-xxx (same as frontend for consistency)

# JWT Secret (Generate: openssl rand -hex 32)
JWT_SECRET=xxx (change per developer if you have own server)

# Email (SendGrid - Dev Key)
SENDGRID_API_KEY=SG.xxx-dev

# Session Secret
SESSION_SECRET=xxx (change per developer)

# Firebase Admin SDK (Backend)
FIREBASE_ADMIN_KEY=xxx (JSON - keep secure)

# GitHub Token (for CI/CD testing)
GITHUB_TOKEN=ghp_xxx (personal access token, limited scope)

# Vercel/Railway Token (if hosting there)
VERCEL_TOKEN=xxx (for deployments)
RAILWAY_TOKEN=xxx (for deployments)
```

### .env.example (Commit to Repo)
```bash
# Developers: Copy .env.example to .env.local and fill in your values

# FRONTEND
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_CLAUDE_API_KEY=
REACT_APP_MIXPANEL_TOKEN=
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:5000

# BACKEND
DATABASE_URL=
CLAUDE_API_KEY=
JWT_SECRET=
SENDGRID_API_KEY=
SESSION_SECRET=
FIREBASE_ADMIN_KEY=
GITHUB_TOKEN=
VERCEL_TOKEN=
RAILWAY_TOKEN=
```

### .gitignore (Add These Lines)
```
.env
.env.local
.env.local.backup
.env.production
.env.*.local
secrets.bat
secrets.sh
```

---

## 🔐 CREDENTIAL SECURITY PRACTICES

### DO's ✅
- ✅ Store credentials in `.env.local` (never in code)
- ✅ Use environment variables in all config files
- ✅ Rotate tokens every 90 days
- ✅ Use read-only API keys where possible
- ✅ Log credential access (audit trail)
- ✅ Use 1Password / LastPass for backup
- ✅ Use development/test API keys for local work
- ✅ Test deployments with separate CI/CD tokens

### DON'Ts ❌
- ❌ Never commit `.env.local` or secrets to git
- ❌ Never hardcode API keys in source code
- ❌ Never send credentials via email (plain text)
- ❌ Never share production tokens on Slack
- ❌ Never reuse the same API key across environments
- ❌ Never leave API keys in browser console (debug)
- ❌ Never commit Firebase Admin SDK JSON files
- ❌ Never leave `.env` files in Docker images

---

## 🏢 TOKEN ROTATION SCHEDULE

### Quarterly (Every 90 Days)

| Token | Rotation | Owner | Checklist |
|-------|----------|-------|-----------|
| **Claude API Key** | ✅ 90 days | AI/ML Lead | - [ ] Generate new key in Anthropic dashboard<br>- [ ] Update 1Password<br>- [ ] Notify team<br>- [ ] Keep old key for 1 week overlap<br>- [ ] Delete old key |
| **GitHub Token** | ✅ 90 days | Tech Lead | - [ ] Revoke old token in GitHub settings<br>- [ ] Generate new personal access token<br>- [ ] Update in 1Password<br>- [ ] Update CI/CD secrets<br>- [ ] Verify deployments work |
| **SendGrid API** | ✅ 90 days | Backend Dev | - [ ] Generate new API key in SendGrid dashboard<br>- [ ] Test email sending<br>- [ ] Update .env in all environments<br>- [ ] Revoke old key |
| **JWT Secret** | ✅ 90 days | Backend Dev | - [ ] Generate new: `openssl rand -hex 32`<br>- [ ] Update .env files<br>- [ ] Sessions will be invalidated (expected)<br>- [ ] Test login flow |

### Semi-Annual (Every 180 Days)

| Token | Rotation | Owner |
|-------|----------|-------|
| **PostgreSQL Password** | ✅ 180 days | Database Admin |
| **Firebase Admin Key** | ✅ 180 days | Firebase Admin |
| **Production Hosting Token** | ✅ 180 days | Deployment Lead |

### As-Needed (Immediate)

- 🚨 **If token is compromised**: Revoke immediately + replace same day
- 🚨 **If team member leaves**: Revoke all their tokens + regenerate shared tokens
- 🚨 **If token appears in logs**: Audit access logs + rotate immediately

---

## 👥 ACCESS LEVELS & PERMISSIONS

### Frontend Developer (2 people)
**What they get**:
- ✅ Firebase Development Project config
- ✅ Claude API Key (dev tier)
- ✅ Mixpanel analytics token
- ✅ GitHub token (read + push to develop branch)

**What they DON'T get**:
- ❌ Database connection string
- ❌ Production Firebase config
- ❌ SendGrid API key
- ❌ GitHub token (main branch access)

**Revoke if**: Leave team, role changes to non-engineering

---

### Backend Developer (1 person)
**What they get**:
- ✅ PostgreSQL dev + production connection strings
- ✅ Claude API Key
- ✅ JWT Secret
- ✅ SendGrid API key
- ✅ Firebase Admin SDK key
- ✅ GitHub token (read + push to develop branch)

**What they DON'T get**:
- ❌ Production deployment tokens (only Tech Lead)
- ❌ Database admin password (only DBA)

**Revoke if**: Leave team, role changes

---

### AI/ML Engineer (1 person)
**What they get**:
- ✅ Claude API Key (full tier after approval)
- ✅ Zustand store setup for learning system
- ✅ Firebase Firestore read-only access
- ✅ GitHub token (read + push to develop branch)

**What they DON'T get**:
- ❌ Database passwords
- ❌ Deployment tokens
- ❌ Firebase Admin SDK

**Revoke if**: Leave team, role changes

---

### Design Lead (1 person)
**What they get**:
- ✅ Figma workspace access
- ✅ Storybook access (read-only)
- ✅ GitHub token (read + comments only)

**What they DON'T get**:
- ❌ Any API tokens
- ❌ Code access
- ❌ Database access

**Revoke if**: Leave team

---

### Tech Lead (1 person)
**What they get**:
- ✅ **ALL development tokens**
- ✅ Production deployment tokens (Vercel/Railway)
- ✅ GitHub token (admin access)
- ✅ Firebase Firestore admin access
- ✅ Database admin access
- ✅ SendGrid admin access

**Responsibilities**:
- [ ] Distribute credentials securely
- [ ] Rotate tokens on schedule
- [ ] Audit access logs monthly
- [ ] Revoke tokens when team members leave
- [ ] Update 1Password / secrets manager

**Revoke if**: Leave team (someone else promoted immediately)

---

### Product Manager (1 person)
**What they get**:
- ✅ Mixpanel analytics (read-only)
- ✅ GitHub access (read + comments)
- ✅ Firebase Console (read-only usage stats)

**What they DON'T get**:
- ❌ Any API tokens
- ❌ Code/infra access
- ❌ Database access

**Revoke if**: Leave team

---

## 🛡️ COMPROMISED TOKEN RESPONSE (Emergency)

### If You Suspect a Token is Leaked

**Immediately** (within 5 minutes):
1. Post in Slack #security: "🚨 [TOKEN_NAME] potentially compromised"
2. Message Tech Lead directly
3. Do NOT post the token itself

**Within 30 minutes**:
1. Tech Lead revokes the token in its service
2. Tech Lead generates new token
3. Tech Lead updates in 1Password + CI/CD
4. Tech Lead checks logs for unauthorized access
5. Team notified via email + Slack

**Within 24 hours**:
1. Incident report written
2. Root cause analysis
3. Process improvements identified
4. All passwords rotated as precaution

**Example**:
```
🚨 INCIDENT: Claude API key exposed in GitHub PR comments
- Time: 2026-08-03 14:22
- Severity: HIGH
- Revoked: Immediately
- Action: Generated new key, rotated all sensitive tokens
- Status: Resolved ✅
```

---

## 📋 ONBOARDING CHECKLIST (For Tech Lead)

When a new engineer joins:

**Day 1**:
- [ ] Give them repo read access
- [ ] Point to `.env.example` file
- [ ] Explain credential setup process

**Day 2**:
- [ ] Create `.env.local` file for them
- [ ] Add to 1Password team vault
- [ ] Verify they can `npm start` locally
- [ ] Verify they can run tests

**Week 1**:
- [ ] Walk through `.gitignore` practices
- [ ] Review token rotation schedule
- [ ] Explain access levels (their role)
- [ ] Set up GitHub personal access token
- [ ] Test their ability to commit + push

**Ongoing**:
- [ ] Monitor token usage (no unexpected calls)
- [ ] 90-day rotation reminders
- [ ] Quarterly access review

---

## 🔄 FIREBASE SETUP (Step-by-Step)

### For Developers (Development Project)

1. **Create Firebase Account**
   - Go to https://console.firebase.google.com
   - Sign in with your work email

2. **Request Access to Team Project**
   - Message Tech Lead: "Request Firebase access"
   - Tech Lead adds you to `selfprint-dev` project
   - Verify you have Editor access

3. **Create Web App Config**
   - In Firebase Console → Project Settings → Your Apps
   - Click "Web" app
   - Copy config object
   - Paste into `.env.local` as `REACT_APP_FIREBASE_*`

4. **Test Login**
   - Run `npm start`
   - Click "Sign Up"
   - Create test account
   - Verify you're logged in
   - Delete test account

5. **Backup Admin Key** (Backend only)
   - Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Store in 1Password (never commit)
   - Reference as `FIREBASE_ADMIN_KEY` env var

---

## 🔄 CLAUDE API SETUP (Step-by-Step)

### For AI/ML Engineer

1. **Create Anthropic Account**
   - Go to https://console.anthropic.com
   - Sign up with work email

2. **Request API Access**
   - Message Tech Lead: "Need Claude API access"
   - Tech Lead approves (usually immediate)

3. **Generate API Key**
   - Console → API Keys → Create New Key
   - Name it: "SelfPrint Development"
   - Copy the key: `sk-ant-xxx`
   - Add to `.env.local` as `CLAUDE_API_KEY`
   - Never commit this key

4. **Set Rate Limit** (Important!)
   - Dev tier limits to 100 calls/day
   - This prevents accidental overspending
   - Request higher limit only when ready for production

5. **Test Integration**
   - Run: `npm run test:claude`
   - Verify you get a response
   - Check console for no errors

---

## 📊 TOKEN USAGE MONITORING

### Weekly Review (Tech Lead)

```bash
# Check Claude API usage
curl https://api.anthropic.com/usage \
  -H "x-api-key: $CLAUDE_API_KEY" | jq .

# Check Firebase usage
gcloud firebase projects usage \
  --project=selfprint-dev

# Check GitHub token activity
curl https://api.github.com/user \
  -H "Authorization: token $GITHUB_TOKEN"
```

### Alerts to Set Up
- 🔴 Claude API: Alert if usage > 80% of monthly budget
- 🔴 Firebase: Alert if costs > $50/day
- 🔴 GitHub Actions: Alert if minutes > 1000/month
- 🔴 Database: Alert if storage > 10GB or QPS > 1000

---

## ✅ COMPLIANCE CHECKLIST

- [ ] All tokens use development keys (not production) for local work
- [ ] All .env files are in .gitignore
- [ ] All tokens rotate every 90 days
- [ ] All token access is logged
- [ ] Team members have least-privilege access
- [ ] Compromised tokens have incident response plan
- [ ] Onboarding includes token security training
- [ ] Offboarding revokes all team member tokens immediately

---

## 📞 SUPPORT & QUESTIONS

**Token issues?**
- DM Tech Lead on Slack
- Include: which token, what error you're getting
- Tech Lead will debug within 2 hours

**Rotation questions?**
- See schedule above (section: Token Rotation Schedule)
- Email: tech-lead@selfprint.com

**Security concerns?**
- Post in Slack #security (don't DM individual)
- Include: what the concern is, urgency level
- Tech Lead will assess within 1 hour

---

## 📝 DOCUMENT HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-08-03 | Initial version | Tech Lead |

---

**Status**: ✅ READY TO IMPLEMENT
**Next Review**: 2026-11-03 (90 days)
**Approval**: Tech Lead signature required

---

*Policy prepared: 2026-08-03*
*Classification: CONFIDENTIAL*
*Distribution: Team members only (signed NDA)*
