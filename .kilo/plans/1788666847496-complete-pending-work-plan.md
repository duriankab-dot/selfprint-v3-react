# Phase 0 Complete Pending Work — Track C Entry Checklist

> ⛔ **SUPERSEDED (6 ก.ย. 2026) — แผนนี้เป็นฉบับ Phase 0 เดิม (HEAD `3fa100a`)**
> และมีข้อมูลเก่า (git push 14 commits ล้าแล้ว · migration 035 เคยอ่างระว่า pending ทั้งที่ APPLIED แล้ว · Edge "0/11")
> **แผนรวมที่ต้องใช้ตอนนี้:** `.kilo/plans/1788669775310-track-c-story-and-baseline-docs-plan.md`
> (HEAD `da855c5` · docs-first · blockers อยู่ใน §Phase B) — งานโค๊ดจากแผนนี้ (C1/C2/C3) ถูกโอนไปเป็น Phase B ของแผนรวม

## สถานะปัจจุบัน (6 ก.ย. 2026)

### ✅ งานที่เสร็จแล้ว (จาก forensic 5 ก.ย. 2026)
- `migration 035` apply แล้ว (verify Supabase SQL Editor)
- `git filter-repo` ติดตั้ง v2.47.0 แล้ว
- Tailwind v4 ทำงานแล้ว (TWFIX-001)
- REALBUG-001..004 แก้ครบ 1037/1037 tests
- NAVGAP-001 แก้ nav gap แล้ว
- RAFLOOP-001 แก้ rAF loop แล้ว
- Build/Test/Lint gates ผ่านหมด

### 🔴 งานค้างก่อนเข้า Track C (3 เงื่อนไข)

| # | งาน | สถานะ | หลักฐาน |
|---|------|--------|----------|
| **C1** | Deploy Edge Functions (send-push, daily-brief, pattern-detect) | ❌ 0/11 deployed | Supabase Functions dashboard 5 ก.ย. 2026 |
| **C2** | แก้/ตัดสินใจ passkey flow | ❌ พัง | `AuthContext.tsx:130` + `PasskeyProvider.ts:144` |
| **C3** | เอา VoiceChat mock ออกจาก route จริง | ❌ ยังอยู่ | `VoiceChat.tsx:80` → `/voice` |

### 🟡 งานค้างจาก PHASE0 Forensic (ไม่บล็อก Track C แต่ควรทำ)

| # | งาน | สถานะ | หลักฐาน |
|---|------|--------|----------|
| **F-02** | chunk-intelligence 345 kB = Supabase SDK อยู่ในนั้น | 🟡 ยังเปิด | `PHASE0_VISUAL_PERF_FORENSIC_TH.md:0.3` |
| **F-04** | manualChunks branches ตาย | 🟡 PARTIAL | DEADCHUNK-001 ลบ 2/4 แล้ว |
| **F-05** | dep ที่ไม่ใช้: web-vitals, @simplewebauthn/* | 🟡 ยังเปิด | 114+ as any ยังเหลือ |
| **ASSET404** | soundscape-manifest.json 23 CLOUDINARY_URL + public/audio/ หาย | 🟡 PARTIAL | `public/soundscape-manifest.json` |
| **STUB-001** | Voice mock + CommunityPage "Coming soon" + DecisionDashboard placeholder | 🟡 ยังเปิด | 5+ จุด |
| **A1-dead-code** | dead code 16+ ไฟล์ยังเหลือ | 🟡 ยังเปิด | orphan files list |

### ⚠️ งานที่ต้องตัดสินใจก่อน

| # | งาน | ทางเลือก |
|---|------|----------|
| **P1** | Passkey flow | (ก) ซ่อม หรือ (ข) ถอดออกจาก UI ชั่วคราว |
| **P2** | Experience Architecture v2 docs | (ก) commit หรือ (ข) .gitignore |

---

## Execution Plan

### Phase 1: Git Push (ไม่ต้อง approve)
```powershell
cd D:\selfprint-v3-react
git status  # verify 14 commits ahead
git push origin master
```

### Phase 2: Edge Functions Deployment (C1)
1. Deploy via Supabase CLI:
   ```powershell
   supabase functions deploy send-push
   supabase functions deploy daily-brief
   supabase functions deploy pattern-detect
   ```
2. หรือ deploy ผ่าน Supabase Dashboard
3. Verify: เปิด https://supabase.com/dashboard/project/orxteuufqeohptpbwkqx/functions

### Phase 3: Passkey Flow Decision (C2)
**ทางเลือก ก (ซ่อม):**
- แก้ `AuthContext.tsx:130` → เรียก `supabase.auth.setSession()` ด้วย
- แก้ `PasskeyProvider.ts:144` → ลบ Edge Function calls ที่ 404
- หรือ deploy Edge Functions ที่ขาด

**ทางเลือก ข (ถอดออก):**
- ซ่อน passkey UI ชั่วคราว
- ใช้แค่ email/password auth ก่อน

### Phase 4: VoiceChat Mock Removal (C3)
1. แก้ `/voice` route ให้ชี้ไป placeholder page
2. หรือ implement voice จริง

### Phase 5: Cleanup Tasks (ตามด้วย)
1. ลบ dead code 16+ ไฟล์
2. ลบ dep ที่ไม่ใช้ (web-vitals, @simplewebauthn/*)
3. แก้ soundscape-manifest.json CLOUDINARY_URL

### Phase 6: Documentation Update
1. อัปเดต `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`
2. อัปเดต `SELFPRINT_STATUS_HONEST_TH.md`
3. อัปเดต `PHASE0_VISUAL_PERF_FORENSIC_TH.md`

---

## Validation Steps
- [ ] `git log origin/master..master` = 14 commits
- [ ] Supabase Functions dashboard = 11/11 deployed
- [ ] Passkey login flow ทำงาน หรือ UI ถูกซ่อน
- [ ] `/voice` route ไม่มี mock response
- [ ] vitest run = 1037/1037 tests pass
- [ ] เอกสารทั้ง 3 ฉบับอัปเดตล่าสุด

## Open Questions
1. Passkey: ซ่อมหรือถอด?
2. Edge Functions env vars พร้อมหรือยัง?
3. Experience Architecture v2: commit หรือ ignore?