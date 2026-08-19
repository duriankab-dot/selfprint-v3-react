# GitHub Secrets Setup for PHASE 3 Automation

Add these secrets to GitHub repository settings (Settings → Secrets and variables → Actions):

## Required Secrets

```
PRODUCTION_URL
  Value: https://www.selfprint.one
  
SENTRY_DSN
  Value: https://[KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]
  (from Sentry project settings)
  
TEST_EMAIL
  Value: loadtest@selfprint.one
  (test user email for Playwright)
  
TEST_PASSWORD
  Value: [secure-password-for-test-user]
  (test user password)
  
SLACK_WEBHOOK_URL
  Value: https://hooks.slack.com/services/[PATH]
  (from Slack → Apps → Incoming Webhooks)
```

## Setup Steps

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret above
4. Save

## Verification

After adding secrets, commit this workflow file and push:
- GitHub Actions should trigger automatically
- Check Actions tab for workflow status
- Verify Slack notifications arrive

## Monitoring Secrets

- Rotate secrets every 3 months
- Revoke old Slack webhooks
- Regenerate test user password quarterly
