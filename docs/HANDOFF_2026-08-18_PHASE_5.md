# Selfprint v3 — Handoff Summary (Phase 5)

## ✅ งานที่เสร็จในแชทนี้ (Phase 4)

| Task | ไฟล์ | สถานะ |
|------|------|--------|
| TwinMigration.ts — 4 Supabase TODOs | `src/services/TwinMigration.ts` | ✅ done |
| deleteTwinFromDatabase | `src/services/TwinSupabaseService.ts` | ✅ done |
| TwinContext resetTwin → ลบ DB จริง | `src/context/TwinContext.tsx` | ✅ done |
| TwinAPIService.ts — auth session verify | `src/services/TwinAPIService.ts` | ✅ done |
| DecisionDashboard — wire DecisionForm | `src/pages/DecisionDashboard.tsx` | ✅ done |
| Content/Social + Monetization scan | unified-handler.ts + shareService | ✅ scanned |

**Vercel:** Ready ✅ | **TSC:** 0 errors ✅

---

## 🔴 Gap ที่ scan พบ (ยังเหลือ)

### Gap A — Stripe backend stubbed (Priority Medium)
ไฟล์: `api/unified-handler.ts → handleStripe()`

```
line 333: create-checkout → hardcoded fake URL 'https://checkout.stripe.com/pay/...'
line 323: subscription → hardcoded { plan: 'free' }
```

Real implementation มีอยู่แล้วใน `api/_archived/stripe.ts` แต่ใช้ Vercel Node.js format (VercelRequest/VercelResponse) ไม่ compatible กับ Edge Runtime

**ต้องทำ:**
- Port `api/_archived/stripe.ts` → Edge Runtime format (ใช้ `Request`/`Response`)
- ใส่ใน unified-handler.ts `handleStripe()` แทน stub
- ต้องมี env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PLUS_MONTHLY`, `STRIPE_PRICE_PLUS_ANNUAL`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL`, `STRIPE_PRICE_LIFETIME`

### Gap B — Share/Viral backend missing (Priority Low)
ไฟล์: `src/features/viral/api/shareService.ts` เรียก `/api/share`

`/api/share` ไม่มีใน unified-handler.ts เลย — route ถูก archive ไปแล้ว (`api/_archived/share.ts`)

**ต้องทำ:**
- เพิ่ม `handleShare()` ใน unified-handler.ts
- Port logic จาก `api/_archived/share.ts`
- Supabase table: `selfprint.share_links`, `selfprint.blueprints`

### Gap C — Error Tracking ยัง defer (Priority รอ P0 #6)
ไฟล์: `src/services/error-tracking.ts`  
8 TODOs ทั้งหมด — รอ install `@sentry/react` ก่อน (P0 #6)

---

## 📋 Gap Matrix (อัปเดต Phase 5)

| หัวข้อ | สถานะ | หมายเหตุ |
|--------|--------|----------|
| TwinMigration | ✅ 100% | Supabase queries จริงทั้ง 4 |
| TwinContext delete | ✅ 100% | deleteTwinFromDatabase |
| Auth session verify | ✅ 100% | getDecisionInsights verified |
| DecisionDashboard UI | ✅ 100% | DecisionForm wired |
| SICE Engines | ✅ 100% | ทั้ง 12 clean |
| Rate limiting | ✅ 100% | /api/sice/process |
| Stripe frontend | ✅ 100% | stripeService.ts + SubscriptionContext |
| Stripe backend | ❌ ~30% | handleStripe() stubbed ใน unified-handler |
| Share/Viral backend | ❌ ~10% | /api/share ไม่มีใน unified-handler |
| Error Tracking | defer | รอ P0 #6 + Sentry |
| getNovaPrompt language | defer | เล็กน้อย, ไม่กระทบ UX |

---

## 🛠 กติกา (ไม่เปลี่ยน)

- แก้เฉพาะไฟล์ที่เกี่ยว
- `npx tsc -b --noEmit` ต้องผ่านก่อน commit
- Linux sandbox push ไม่ได้ → ใช้ `_push_now.bat` บน Windows
- commit message บรรทัดเดียวเสมอ
- Supabase tables: `twins`, `twin_memories`, `decision_patterns`, `world_stats`, `follow_up_schedule`, `awakening_essence`, `decisions`, `user_feedback`, `user_profiles`, `world_preferences`

## 📝 .bat template ที่ถูก (บรรทัดเดียว)

```bat
git commit -m "fix: short one-line message only"
```

**อย่า** ใส่ multiline body ใน .bat — cmd.exe จะ parse `-` เป็น command แยก
