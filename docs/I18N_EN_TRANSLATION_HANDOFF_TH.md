# English (/en) Translation — Handoff

วันที่: 30 สิงหาคม 2026
สถานะ: งานใหญ่ (98 ไฟล์มี Thai hardcode) — ทำ Tier 1-2 บางส่วนในเซสชันนี้
ยังเหลืออีกมาก ต้องทำต่อในเซสชันถัดไป

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

**Tier 2 — Core flow (บางส่วน):**
- `src/pages/Dashboard.tsx`
- `src/pages/Login.tsx`
- `src/pages/CommunityPage.tsx`
- `src/pages/WorldDetail.tsx` (หมายเหตุ: `environment.soundscape.labelThai`
  ยังเป็น Thai-only field ในชั้น data model — `SoundscapeEngine.ts` +
  `TimeOfDayEngine.ts` + `EnvironmentEngine.ts` + 4 component ที่ใช้ยังไม่มี
  `labelEn` — ไม่ได้แก้รอบนี้ เพราะเป็นการเปลี่ยน data model ไม่ใช่แค่ข้อความ
  หน้าเว็บ ควรตัดสินใจ scope แยกต่างหาก)

**Verify**: `tsc -b` ผ่านสะอาดหลังทุกไฟล์

## 🔜 ยังไม่ได้ทำ — Tier 2 ที่เหลือ (core flow, priority สูง)

- `src/pages/Onboarding.tsx` (737 บรรทัด — ใหญ่ ใช้เวลานาน)
- `src/pages/LandingPage.tsx` (1206 บรรทัด — ใหญ่มาก, **มี partial bilingual
  อยู่แล้ว** ต้องตรวจว่า cover ครบหรือยัง ไม่ใช่เขียนใหม่ทั้งหมด)
- `src/pages/CoreAwakening.tsx` (มี partial bilingual อยู่แล้ว เช่นกัน)
- `src/components/onboarding/NovaConversation.tsx` (มี partial bilingual)
- `src/pages/Chat.tsx`, `src/pages/ChatPage.tsx` (หน้าแชทหลัก)
- `src/pages/FeatureMenu.tsx` (เมนู `/menu` ที่ NavBar ลิงก์ไป)

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

## แนวทางแนะนำสำหรับ session ถัดไป

1. อย่าไล่ทำตามลำดับตัวอักษร — ทำตามความถี่ใช้งานจริง (Onboarding ก่อน
   marketing pages เพราะ user ใหม่ทุกคนต้องผ่าน)
2. เช็คไฟล์ที่มี partial bilingual อยู่แล้วก่อน (LandingPage, CoreAwakening,
   NovaConversation) — อาจแค่เติมจุดที่ขาด ไม่ต้องเขียนใหม่ทั้งไฟล์
3. Pattern ทุกไฟล์: เพิ่ม `const { language } = useLanguage();` +
   `const isTh = language === 'th';` แล้ว wrap ข้อความด้วย
   `{isTh ? 'ไทย' : 'English'}` — ห้ามเปลี่ยนเป็น i18n library ใหม่
4. รัน `npx tsc -b` หลังทุกไฟล์หรือทุก batch เล็กๆ อย่าสะสมหลายไฟล์ก่อนเช็ค
5. `environment.soundscape.labelThai` (data-layer, 7 ไฟล์เชื่อมกัน) เป็น
   decision แยกที่ jb_DEV ควรตัดสินใจก่อน — ไม่ใช่แค่แปลข้อความ
