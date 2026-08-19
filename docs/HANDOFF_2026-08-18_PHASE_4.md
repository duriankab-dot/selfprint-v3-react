# Selfprint v3 — Handoff Summary (Phase 4)

## ✅ งานที่เสร็จในแชทนี้ (Phase 3 continuation)

| Task | ไฟล์ | Commit |
|------|------|--------|
| Scan 12 SICE engines | engines/*.ts | — (clean, ไม่มี stub) |
| routeToWorld() → call SICEOrchestrator จริง | WorldRoutingService.ts | e489f50 |
| Rate limiting /api/sice/process | process.ts + middleware | e489f50 |
| TwinPersonalityPage metrics จาก PersonalContextBuilder จริง | TwinPersonalityPage.tsx | b4dda8a |

**CI/CD:** ผ่านทุก run | **Vercel:** Ready ทุก deploy ✅

---

## 🔴 งานที่ยังเหลือ (scan จาก grep)

### Priority 1 — TwinMigration.ts (4 TODOs)
ไฟล์: `src/services/TwinMigration.ts`

```
line 27: TODO: Query Supabase for twin_profiles where user_id = userId and awakened_at IS NOT NULL
line 70: TODO: Transform old Twin schema to new system
line 98: TODO: Query Supabase twin_profiles where user_id = userId
line 117: TODO: Insert new row in twin_profiles
```

ต้อง implement จริง ใช้ table `twins` (ไม่ใช่ `twin_profiles` — ระวัง table name)

### Priority 2 — TwinContext.tsx:216
```
TODO: P1 — Delete Twin from Supabase
```
ลบ row จาก `twins` + `twin_memories` + `world_stats` เมื่อ user delete twin

### Priority 3 — TwinAPIService.ts:174
```
TODO: Phase G — Add auth middleware to verify user context
```
verify user session ก่อน call twin API

### Priority 4 — DecisionDashboard.tsx (UI comment, low priority)
```
line 107: TODO: <DecisionForm onSubmit={handleNewDecision} />
line 112: TODO: Integrated in Phase F Dashboard
```

### ❌ ไม่ต้องทำตอนนี้
- `error-tracking.ts` — 8 TODO ทั้งหมด defer ไป P0 #6 (Sentry) ต้อง install `@sentry/react` ก่อน
- `getNovaPrompt.ts:648` — language TODO เล็กน้อย

---

## 📋 Gap Matrix (อัปเดต)

| หัวข้อ | สถานะ | หมายเหตุ |
|--------|--------|----------|
| 12 Worlds routing | ✅ ~90% | routeToWorld() call SICE จริงแล้ว |
| Rate limiting | ✅ 100% | /api/sice/process + middleware |
| SICE Engines | ✅ 100% | ทั้ง 12 engines clean |
| TwinPersonalityPage | ✅ 100% | real PersonalContextBuilder |
| TwinMigration | ~10% | 4 TODO ยังอยู่ |
| TwinContext delete | ~0% | P1 TODO |
| Error Tracking | defer | รอ P0 #6 + Sentry |
| Content/Social | ~40% | ยังไม่ scan |
| Monetization/Stripe | ~35% | ยังไม่ scan |

---

## 🛠 กติกา (ไม่เปลี่ยน)

- แก้เฉพาะไฟล์ที่เกี่ยว
- `npx tsc -b --noEmit` ต้องผ่านก่อน commit
- Linux sandbox push ไม่ได้ → ใช้ `_push_now.bat` บน Windows
- commit message บรรทัดเดียวเสมอ (หลีก `-` multiline ใน .bat)
- Supabase tables: `twins`, `twin_memories`, `decision_patterns`, `world_stats`, `follow_up_schedule`, `awakening_essence`, `decisions`, `user_feedback`, `user_profiles`, `world_preferences`

## 📝 .bat template ที่ถูก (บรรทัดเดียว)

```bat
git commit -m "fix: short one-line message only"
```

**อย่า** ใส่ multiline body ใน .bat — cmd.exe จะ parse `-` เป็น command แยก
