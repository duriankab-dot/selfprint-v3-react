# English (/en) Translation — Handoff

วันที่: 30 สิงหาคม 2026 (อัปเดตล่าสุด: Tier 2 เสร็จสมบูรณ์)
สถานะ: Tier 1 + Tier 2 (core flow ทั้งหมด) เสร็จแล้ว — เหลือ Tier 3 (~85 ไฟล์)

## บริบท

เว็บนี้ไม่มี i18n library (ไม่มี react-i18next) — ใช้ URL prefix `/en` `/th`
ผ่าน `LanguageContext` (`useLanguage()` คืน `language: 'en' | 'th'`) แต่ไม่มี
translation function ให้ใช้ — **แต่ละ component ต้องเขียน bilingual เอง**
ด้วย pattern `const isTh = language === 'th'; ... {isTh ? 'ไทย' : 'English'}`
(ตาม pattern ที่มีอยู่แล้วใน 10 ไฟล์เดิมก่อนเซสชันนี้)

**อย่าลาก i18n library ใหม่เข้ามาโดยไม่ถาม jb_DEV ก่อน** (กติกาโปรเจกต์: ห้าม
ลาก lib ใหม่โดยไม่ถาม) — ให้ทำตาม pattern เดิมต่อไป

## ✅ ทำเสร็จแล้วในเซสชันนี้ (30 ส.ค. 2026)

**Tier 1 — Shared layout (ขึ้นทุกหน้า, priority สูงสุด):**
- `src/components/layout/NavBar.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/Footer.tsx`

**Tier 2 — Core flow (เสร็จสมบูรณ์ทั้งหมด):**
- `src/pages/Dashboard.tsx`
- `src/pages/Login.tsx`
- `src/pages/CommunityPage.tsx`
- `src/pages/WorldDetail.tsx` (หมายเหตุ: `environment.soundscape.labelThai`
  ยังเป็น Thai-only field ในชั้น data model — `SoundscapeEngine.ts` +
  `TimeOfDayEngine.ts` + `EnvironmentEngine.ts` + 4 component ที่ใช้ยังไม่มี
  `labelEn` — ไม่ได้แก้รอบนี้ เพราะเป็นการเปลี่ยน data model ไม่ใช่แค่ข้อความ
  หน้าเว็บ ควรตัดสินใจ scope แยกต่างหาก)
- `src/pages/FeatureMenu.tsx`, `src/pages/Chat.tsx`, `src/pages/ChatPage.tsx`
- `src/pages/CoreAwakening.tsx` (เติม `isTh` ให้ครบทุกจุดที่เหลือ)
- `src/components/onboarding/NovaConversation.tsx` (เติม error/placeholder
  strings ที่เหลือ — `NOVA_MESSAGES_TH/EN` เดิมครบอยู่แล้ว)
- `src/pages/LandingPage.tsx` (`STORY`/`SEO_COPY` เดิม bilingual ครบอยู่แล้ว —
  แก้เพิ่ม: `TwinBornSvg`/`NovaEyeSvg` เคย hardcode label 12 มิติเป็นไทย
  เสมอไม่ว่า `/en` หรือ `/th` — เพิ่ม `SICE_LABELS_EN`/`SICE_EN_LABELS` +
  ส่ง `isTh` prop เข้าไปแล้ว)
- `src/pages/Onboarding.tsx` (737 บรรทัด — ไม่เคยมี `useLanguage` เลยตั้งแต่ต้น
  เพิ่ม import + แปลทุกจุด: emotion step h1/p/button, lifecycle-error screen,
  retry button)

**Verify**: `tsc -b` ผ่านสะอาดหลังทุกไฟล์/ทุก batch

## ✅ Tier 2 — เสร็จสมบูรณ์ทั้งหมด

Tier 2 (core app flow) ที่ user ระบุไว้ (Onboarding, LandingPage,
CoreAwakening, NovaConversation, Chat, ChatPage, FeatureMenu) ทำครบทุกไฟล์แล้ว
ในเซสชันนี้ — เหลือแค่ Tier 3

## 📋 Tier 3 — ที่เหลือทั้งหมด (~85 ไฟล์)

ไฟล์เต็มอยู่ที่ (รันคำสั่งนี้เพื่อดู list ปัจจุบัน จะหด/ขยายตามที่ทำไปแล้ว):
```bash
grep -rlP '[\x{0E00}-\x{0E7F}]' src/pages src/components --include="*.tsx" | grep -v "__tests__\|\.test\.tsx"
```

หมวดที่เหลือเยอะสุด:
- `src/components/dashboard/*` (~10 ไฟล์ — AITwinSection, AnalyticsSummary,
  AskCoach, DecisionLogTable, ExecutiveSummary, ExportButton, FilterBar,
  FutureSelfPanel, GrowthSpace, IntelligencePanel(s), LivingTwin,
  PatternInsights, TrendChart)
- `src/components/features/*` (~16 ไฟล์ — decision/voice/twin components)
- `src/components/onboarding/*` (~6 ไฟล์ที่เหลือ — AICreationSequence,
  BirthdateInput, ClaimAccount, FinetuningQuestions, FullAnalysis,
  InitialBlueprint)
- `src/pages/*` marketing/content pages (~20 ไฟล์ — AboutPage, FAQPage,
  SciencePage, TermsPage, PrivacyCenter, BlogIndex/BlogArticle,
  PricingPage/PricingSuccessPage ฯลฯ)
- `src/components/intelligence/*`, `src/components/twin/*`,
  `src/components/chat/*` (~8 ไฟล์)

## แนวทางแนะนำสำหรับ session ถัดไป (Tier 3)

1. อย่าไล่ทำตามลำดับตัวอักษร — ทำตามความถี่ใช้งานจริง (dashboard/onboarding
   sub-component ก่อน marketing pages เพราะ user ที่ login แล้วเจอบ่อยกว่า)
2. เช็คไฟล์ที่อาจมี partial bilingual อยู่แล้วก่อนเขียนใหม่ทั้งไฟล์เสมอ
3. Pattern ทุกไฟล์: เพิ่ม `const { language } = useLanguage();` +
   `const isTh = language === 'th';` แล้ว wrap ข้อความด้วย
   `{isTh ? 'ไทย' : 'English'}` — ห้ามเปลี่ยนเป็น i18n library ใหม่
4. รัน `npx tsc -b` หลังทุกไฟล์หรือทุก batch เล็กๆ อย่าสะสมหลายไฟล์ก่อนเช็ค
5. `environment.soundscape.labelThai` (data-layer, 7 ไฟล์เชื่อมกัน) เป็น
   decision แยกที่ jb_DEV ควรตัดสินใจก่อน — ไม่ใช่แค่แปลข้อความ
