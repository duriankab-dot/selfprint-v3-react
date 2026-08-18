# API REFERENCE

**Version:** 1.0  
**Status:** Production Ready  
**Last Updated:** 2026-08-18

---

## 📋 OVERVIEW

Selfprint API consists of **12 consolidated endpoints** routed through a unified serverless handler (`api/unified-handler.ts`). All endpoints use query parameter routing: `?module=<module>&action=<action>`.

**Base URL:** `https://www.selfprint.one/api/unified-handler`

**Authentication:** Passkey (WebAuthn) + Session cookies + Supabase RLS

---

## 🔑 API MODULES (12 Endpoints)

### 1. **Notifications Module**
**Endpoint:** `?module=notifications&action=<action>`

#### 1.1 List Notifications
```http
GET /api/unified-handler?module=notifications&action=list&userId=user-123
```

**Query Parameters:**
- `userId` (required) — User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-1",
        "userId": "user-123",
        "type": "decision_reminder",
        "title": "Check your decision",
        "message": "Remember to log your outcome",
        "scheduledFor": "2026-08-18T10:00:00Z",
        "readAt": null,
        "createdAt": "2026-08-17T15:00:00Z"
      }
    ],
    "total": 50,
    "unread": 12
  }
}
```

**Status Codes:**
- `200` — Success
- `400` — Missing userId
- `500` — Database error

---

#### 1.2 Schedule Notification
```http
POST /api/unified-handler?module=notifications&action=schedule
Content-Type: application/json

{
  "userId": "user-123",
  "twinId": "twin-456",
  "type": "decision_reminder",
  "title": "Decision Check-in",
  "message": "Time to review your decision",
  "scheduledFor": "2026-08-20T10:00:00Z",
  "timezone": "Asia/Bangkok"
}
```

**Request Body:**
- `userId` (required) — User ID
- `twinId` (optional) — Twin ID
- `type` (required) — Notification type (decision_reminder, world_update, etc.)
- `title` (optional) — Notification title
- `message` (optional) — Notification message
- `scheduledFor` (optional) — ISO timestamp (defaults to now)
- `timezone` (optional) — User timezone (defaults to UTC)

**Response:**
```json
{
  "success": true,
  "data": {
    "notificationId": "notif-new-123",
    "status": "scheduled"
  }
}
```

**Status Codes:**
- `200` — Scheduled successfully
- `400` — Invalid parameters
- `500` — Scheduling failed

---

#### 1.3 Mark Notification as Read
```http
POST /api/unified-handler?module=notifications&action=mark-read
Content-Type: application/json

{
  "notificationId": "notif-1",
  "userId": "user-123"
}
```

**Request Body:**
- `notificationId` (required) — Notification ID
- `userId` (required) — User ID

**Response:**
```json
{
  "success": true,
  "message": "Marked as read"
}
```

---

#### 1.4 Record Decision Outcome
```http
POST /api/unified-handler?module=notifications&action=record-outcome
Content-Type: application/json

{
  "decisionId": "dec-123",
  "userId": "user-123",
  "twinId": "twin-456",
  "decisionText": "Should I take this job offer?",
  "outcome": "positive",
  "followUpDay": 30,
  "notes": "Great opportunity, accepted the offer",
  "timezone": "Asia/Bangkok"
}
```

**Request Body:**
- `decisionId` (required) — Decision ID
- `userId` (required) — User ID
- `twinId` (required) — Twin ID
- `decisionText` (optional) — Original decision text
- `outcome` (required) — One of: `positive`, `neutral`, `negative`
- `followUpDay` (optional) — Days until follow-up (30, 90, 180, 365)
- `notes` (optional) — Outcome notes
- `timezone` (optional) — User timezone

**Response:**
```json
{
  "success": true,
  "message": "Decision outcome recorded as positive"
}
```

---

### 2. **Twin Evolution Module**
**Endpoint:** `?module=twin-evolution&action=<action>`

#### 2.1 Get Twin Evolution Progress
```http
GET /api/unified-handler?module=twin-evolution&action=*&twinId=twin-456
```

**Query Parameters:**
- `twinId` (required) — Twin ID

**Response:**
```json
{
  "success": true,
  "data": {
    "twinId": "twin-456",
    "stage": 2,
    "stage_name": "Growing",
    "progress": 65,
    "milestones": {
      "conversations": 45,
      "decisions_logged": 12,
      "worlds_explored": 5,
      "insights_received": 8
    },
    "next_milestone": "Unlock World 6"
  }
}
```

**Status Codes:**
- `200` — Success
- `400` — Missing twinId
- `500` — Database error

---

### 3. **SICE (Self-Improvement Core Engine) Module**
**Endpoint:** `?module=sice&action=<action>`

#### 3.1 Get Pattern Analysis
```http
GET /api/unified-handler?module=sice&action=get-patterns&userId=user-123
```

**Query Parameters:**
- `userId` (required) — User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "patternId": "pat-1",
      "category": "decision_type",
      "pattern": "Career decisions typically positive outcomes",
      "frequency": "High",
      "confidence": 0.85,
      "examples": [
        "Job offer acceptance (positive)",
        "Project leadership (positive)"
      ]
    }
  ]
}
```

**Status Codes:**
- `200` — Success
- `400` — Missing userId
- `500` — Analysis failed

---

### 4. **Stripe Module** (Monetization)
**Endpoint:** `?module=stripe&action=<action>`

#### 4.1 Get Subscription Status
```http
GET /api/unified-handler?module=stripe&action=subscription
```

**Response:**
```json
{
  "success": true,
  "status": "active",
  "plan": "free",
  "message": "Subscription retrieved"
}
```

**Status Codes:**
- `200` — Success
- `400` — Invalid action
- `500` — Stripe API error

---

#### 4.2 Create Checkout Session
```http
POST /api/unified-handler?module=stripe&action=create-checkout
Content-Type: application/json

{
  "plan": "pro_monthly",
  "userId": "user-123"
}
```

**Request Body:**
- `plan` (required) — Plan ID (pro_monthly, pro_annual, etc.)
- `userId` (optional) — User ID for prefill

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_...",
  "message": "Checkout session created"
}
```

**Status Codes:**
- `200` — Success
- `400` — Invalid plan
- `500` — Checkout creation failed

---

### 5. **Profile Module**
**Endpoint:** `?module=profile&action=<action>`

#### 5.1 Get User Profile
```http
GET /api/unified-handler?module=profile&action=*
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-08-01T12:00:00Z"
  }
}
```

**Status Codes:**
- `200` — Success
- `405` — Method not allowed
- `500` — Database error

---

#### 5.2 Update User Profile
```http
PUT /api/unified-handler?module=profile&action=*
Content-Type: application/json

{
  "name": "Jane Doe",
  "timezone": "Asia/Bangkok"
}
```

**Request Body:**
- `name` (optional) — Display name
- `timezone` (optional) — User timezone
- Other profile fields as needed

**Response:**
```json
{
  "success": true,
  "message": "Profile updated"
}
```

**Status Codes:**
- `200` — Success
- `405` — Method not allowed
- `500` — Update failed

---

### 6. **Blueprint Module** (Template Management)
**Endpoint:** `?module=blueprint&action=<action>`

#### 6.1 Get Blueprints
```http
GET /api/unified-handler?module=blueprint&action=*
```

**Response:**
```json
{
  "success": true,
  "blueprints": [
    {
      "id": "bp-1",
      "name": "Default Blueprint",
      "version": "1.0",
      "description": "Standard decision template",
      "fields": ["decision", "options", "pros", "cons", "timeline"]
    }
  ]
}
```

**Status Codes:**
- `200` — Success
- `405` — Method not allowed
- `500` — Query failed

---

#### 6.2 Create Blueprint
```http
POST /api/unified-handler?module=blueprint&action=*
Content-Type: application/json

{
  "name": "Custom Blueprint",
  "description": "Career decision template",
  "fields": ["role", "company", "salary", "growth", "culture"]
}
```

**Request Body:**
- `name` (required) — Blueprint name
- `description` (optional) — Blueprint description
- `fields` (optional) — Custom fields array

**Response:**
```json
{
  "success": true,
  "blueprintId": "bp-new-123",
  "message": "Blueprint created"
}
```

**Status Codes:**
- `200` — Success
- `405` — Method not allowed
- `500` — Creation failed

---

## 🔒 AUTHENTICATION

All endpoints require valid user session established via Passkey (WebAuthn) authentication.

**Session Flow:**
1. User authenticates via Passkey → Session established
2. Session cookie included in all API requests
3. Supabase RLS policies enforce row-level security

**Error Response (Unauthenticated):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Status Code:** `401`

---

## ⚙️ COMMON RESPONSE FORMAT

All endpoints follow standard response format:

```json
{
  "success": boolean,
  "data": object | array (optional),
  "error": string (optional),
  "message": string (optional)
}
```

**Success Status:** `2xx` (200, 201)  
**Client Error Status:** `4xx` (400, 401, 404, 405)  
**Server Error Status:** `5xx` (500, 503)

---

## 🚀 DEPLOYMENT

**Production URL:** https://www.selfprint.one  
**API Base:** https://www.selfprint.one/api/unified-handler  
**Infrastructure:** Vercel Serverless  
**Timeout:** 10 seconds  
**Memory:** 1024 MB

---

## 📊 RATE LIMITING

**Current Status:** Not implemented (TODO)

**Recommended:**
- 100 requests/minute per user
- 1000 requests/minute per IP

---

## 🔄 WEBHOOK EVENTS

**Stripe Webhooks:**
- `charge.succeeded` — Payment successful
- `charge.failed` — Payment failed
- `customer.subscription.created` — Subscription started
- `customer.subscription.deleted` — Subscription cancelled

**Endpoint:** `/api/webhooks/stripe` (separate handler)

---

## 📚 EXAMPLE WORKFLOWS

### Flow 1: Log a Decision & Schedule Follow-up
```
1. User records decision via UI
2. POST /api/unified-handler?module=notifications&action=record-outcome
3. DecisionFollowUpNotifier schedules reminder
4. 30 days later: GET /api/unified-handler?module=notifications&action=list
5. User sees decision reminder notification
```

### Flow 2: Track Twin Evolution
```
1. User completes onboarding (Core Awakening)
2. GET /api/unified-handler?module=twin-evolution&action=*&twinId=twin-123
3. Shows current stage + progress
4. Each decision logged increments milestones
5. Stage progression unlocks new world contexts
```

### Flow 3: Upgrade Subscription
```
1. User clicks "Upgrade" button
2. POST /api/unified-handler?module=stripe&action=create-checkout
3. Redirects to Stripe Checkout
4. Payment success → subscription activated
5. GET /api/unified-handler?module=stripe&action=subscription (shows "pro")
```

---

## ✅ TESTING

**Local Dev:** `npm run dev` → http://localhost:5173  
**Staging:** https://selfprint-v3-react-staging.vercel.app  
**Production:** https://www.selfprint.one

**Test Tools:**
- Postman / Insomnia (API testing)
- Browser DevTools (Network tab)
- Vercel Logs (production debugging)

---

## 📞 SUPPORT

For API issues:
1. Check Vercel logs: https://vercel.com/self-print/selfprint-v3-react/logs
2. Review error response message
3. Verify authentication (session cookie present)
4. Check database connection (Supabase status)

---

**Authority:** Single source of truth for API endpoints  
**Maintained by:** jb_DEV  
**Last Updated:** 2026-08-18
