# TROUBLESHOOTING GUIDE

**Version:** 1.0  
**Status:** Common Issues Documented  
**Last Updated:** 2026-08-18

---

## 🔴 CRITICAL ISSUES

### ❌ 504 Gateway Timeout on API Calls

**Symptom:** API returns `504 Vercel Runtime Timeout Error`

**Cause:** API function exceeds 10-second timeout

**Solution:**

1. Check Vercel logs:
   ```bash
   vercel logs --tail
   ```

2. Look for slow operations in logs

3. If Supabase query slow:
   - Check query performance in Supabase dashboard
   - Add database indexes if needed
   - Optimize query logic

4. If cold start slow:
   - Increase `maxDuration` in `vercel.json`:
     ```json
     {
       "functions": {
         "api/unified-handler.ts": {
           "maxDuration": 15
         }
       }
     }
     ```

5. Deploy: `git push origin master`

---

### ❌ Build Fails with "161 errors"

**Symptom:** `npm run build` exits with code 2

**Cause:** TypeScript strict mode errors (most common: nullable types)

**Solution:**

```bash
# 1. Check error types
npm run build 2>&1 | findstr "error TS"

# 2. Common fixes:
# - TS2339: Property does not exist → check imports
# - TS18047: Type is possibly null → add null check
# - TS2335: Extension not found → add .js to imports

# 3. Fix specific file
# Edit the file in src/ and add null checks:
if (value) {
  // use value
}

# 4. Retry build
npm run build
```

---

### ❌ "Missing Supabase credentials" Error

**Symptom:** Error at startup: `Missing Supabase credentials`

**Cause:** `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` not set

**Solution:**

1. **Local Development:**
   ```bash
   # Create .env.local
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

2. **Vercel Production:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure both variables are set
   - Verify they're set for "Production" environment
   - Re-deploy: `vercel --prod`

3. **Get values:**
   - Supabase Dashboard → Settings → API
   - Copy Project URL and anon key

---

### ❌ 404 API Routes Not Found

**Symptom:** `/api/stripe` returns 404 instead of 200

**Cause:** Missing rewrite rule in `vercel.json`

**Solution:**

Check `vercel.json` has rewrites:
```json
{
  "rewrites": [
    {
      "source": "/api/stripe/:action*",
      "destination": "/api/unified-handler?module=stripe&action=:action*"
    }
  ]
}
```

If missing, add it and deploy:
```bash
git add vercel.json
git commit -m "fix: add stripe rewrite rule"
vercel --prod
```

---

## ⚠️ COMMON ISSUES

### Authentication Failed

**Symptom:** "Unauthorized" on API calls

**Cause:** Session cookie missing or expired

**Solution:**

1. Verify login: Try passkey login flow
2. Check browser cookies: F12 → Application → Cookies
3. Verify Supabase auth: Check `auth.users` table in Supabase
4. Clear cookies and try again:
   ```javascript
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   ```

---

### Database Connection Timeout

**Symptom:** "Failed to connect to database" error

**Cause:** Supabase down or firewall blocking connection

**Solution:**

1. Check Supabase status: https://status.supabase.com
2. Check Vercel logs for connection details
3. Verify network connectivity:
   ```bash
   curl https://xxxxx.supabase.co/rest/v1/
   # Should return 200 with JSON
   ```
4. Check Supabase credentials in `.env`

---

### CORS Error on API Calls

**Symptom:** "Access to XMLHttpRequest blocked by CORS policy"

**Cause:** Cross-origin request denied

**Solution:**

1. Check request origin matches Supabase CORS settings
2. Supabase Dashboard → Settings → CORS
3. Add allowed origins:
   ```
   https://www.selfprint.one
   https://selfprint-v3-react-*.vercel.app
   http://localhost:5173
   ```
4. Retry request

---

### Notification Not Sending

**Symptom:** Scheduled notification doesn't arrive

**Cause:** Multiple possibilities

**Solution - Step by Step:**

1. **Verify scheduling:**
   ```bash
   # Check notification_queue in Supabase
   SELECT * FROM notification_queue 
   WHERE scheduled_for < NOW() AND status = 'scheduled'
   LIMIT 5;
   ```

2. **Check status:**
   - `scheduled` = pending
   - `sent` = sent successfully
   - `failed` = error occurred

3. **If status = "failed":**
   - Check notification service logs
   - Verify user has push permission
   - Check device is registered

4. **Manually retry:**
   ```bash
   # Trigger notification manually (if admin)
   POST /api/unified-handler?module=notifications&action=schedule
   ```

---

### Twin Not Evolving

**Symptom:** Twin stage stays same, milestones not updating

**Cause:** Evolution trigger not firing

**Solution:**

1. Check `twin_evolution_progress` table:
   ```bash
   SELECT * FROM twin_evolution_progress 
   WHERE twin_id = 'your-twin-id'
   ORDER BY stage DESC;
   ```

2. Verify milestones are being tracked:
   ```bash
   SELECT COUNT(*) as conversations
   FROM messages
   WHERE conversation_id IN (
     SELECT id FROM conversations WHERE twin_id = 'your-twin-id'
   );
   ```

3. If milestones exist but stage doesn't change:
   - Check TwinEvolutionService.triggerStageProgression() is called
   - Verify progression thresholds in PHASE_5_TWIN_ARCHITECTURE_TH.md

4. Manually trigger (if needed):
   - Admin panel (TODO: implement)
   - Or database update:
     ```sql
     UPDATE twin_evolution_progress 
     SET stage = 2 
     WHERE twin_id = 'xxx' AND stage = 1;
     ```

---

### AI Response Generation Slow

**Symptom:** Nova responses take > 5 seconds

**Cause:** API latency or token generation

**Solution:**

1. Check OpenAI/Claude API status
2. Monitor Vercel logs for processing time
3. Reduce context window:
   - Fewer messages in conversation history
   - Shorter decision context
4. Check network:
   - Browser network tab (DevTools)
   - Vercel function logs

---

### Permission Denied on Database Update

**Symptom:** "Permission denied" when updating own data

**Cause:** RLS policy blocks update

**Solution:**

1. Verify RLS policy in Supabase:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'decisions'
   AND policyname LIKE '%update%';
   ```

2. Common issue: Mismatched `auth.uid()` in WHERE clause
   
3. Fix policy:
   ```sql
   CREATE POLICY users_update_own_decisions ON public.decisions
     FOR UPDATE
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);
   ```

4. Verify auth context:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('Current user ID:', user.id);
   ```

---

## 🔍 DEBUGGING TIPS

### Enable Debug Logging

```typescript
// Add to src/main.tsx
import { enableLogging } from '@/lib/debug';
if (import.meta.env.DEV) {
  enableLogging();
}
```

### Check Browser Console

**F12 → Console tab shows:**
- API errors
- React component errors
- Network errors
- Auth events

### Check Vercel Function Logs

```bash
vercel logs --tail

# Filter by level
vercel logs --tail --level error
```

### Check Supabase Logs

1. Supabase Dashboard → Logs
2. View API requests, auth events, database queries
3. Search by user ID or timestamp

---

## 🆘 ESCALATION CHECKLIST

If issue persists after troubleshooting:

- [ ] Reproduced locally (`npm run dev`)
- [ ] Checked Vercel logs
- [ ] Checked Supabase status & logs
- [ ] Verified environment variables
- [ ] Cleared browser cache
- [ ] Tried in incognito mode
- [ ] Restarted development server
- [ ] Recent code changes? → Git diff

**If still unresolved:**
1. Create GitHub issue with reproduction steps
2. Include logs and screenshots
3. Mention `@jb_DEV` for review

---

## 📞 GET HELP

**Documentation:**
- API_REFERENCE.md — API endpoints
- DATABASE_SCHEMA.md — Database structure
- MONITORING.md — Observability setup
- DEPLOYMENT_GUIDE.md — Deployment issues

**External Resources:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev

---

**Authority:** Single source of truth for troubleshooting  
**Maintained by:** jb_DEV  
**Last Updated:** 2026-08-18
