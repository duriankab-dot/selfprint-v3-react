# English (/en) Translation — Handoff

วันที่: 31 สิงหาคม 2026 (อัปเดตล่าสุด: Tier 3 เสร็จสมบูรณ์)
สถานะ: **Tier 1 + Tier 2 + Tier 3 เสร็จสมบูรณ์ทั้งหมด** — เหลือเฉพาะ
data-layer decision (ดูหัวข้อ "สิ่งที่ตั้งใจไม่แตะ" ด้านล่าง)

## บริบท

เว็บนี้ไม่มี i18n library (ไม่มี react-i18next) — ใช้ URL prefix `/en` `/th`
ผ่าน `LanguageContext` (`useLanguage()` คืน `language: 'en' | 'th'`) แต่ไม่มี
translation function ให้ใช้ — **แต่ละ component ต้องเขียน bilingual เอง**
ด้วย pattern `const isTh = language === 'th'; ... {isTh ? 'ไทย' : 'English'}`

**อย่าลาก i18n library ใหม่เข้ามาโดยไม่ถาม jb_DEV ก่อน** (กติกาโปรเจกต์: ห้าม
ลาก lib ใหม่โดยไม่ถาม) — ให้ทำตาม pattern เดิมต่อไปสำหรับไฟล์ใหม่ในอนาคต

## ✅ Tier 1 — Shared layout (เสร็จสมบูรณ์)

- `src/components/layout/NavBar.tsx`, `BottomNav.tsx`, `Footer.tsx`

## ✅ Tier 2 — Core app flow (เสร็จสมบูรณ์ทั้งหมด)

Dashboard, Onboarding, Login, LandingPage, CommunityPage, WorldDetail,
FeatureMenu, Chat, ChatPage, CoreAwakening, NovaConversation — ครบทุกไฟล์

## ✅ Tier 3 — เสร็จสมบูรณ์ทั้งหมด (~85+ ไฟล์)

**Batch 1 — dashboard components (14 ไฟล์):** AITwinSection, AnalyticsSummary,
AskCoach, DecisionLogTable, ExecutiveSummary, ExportButton, FilterBar,
FutureSelfPanel, GrowthSpace, IntelligencePanel(s), LivingTwin,
PatternInsights, TrendChart ฯลฯ

**Batch 2 — features components (~21 ไฟล์):** decision/voice/twin
sub-components ทั้งหมด

**Batch 3 — intelligence + twin + chat components (~14 ไฟล์):** MemoryList,
InsightCardWithFeedback, FeedbackSummary, AccuracyBadge, VoiceTwin,
PatternDisplay ฯลฯ

**Batch 4 — onboarding remaining (6 ไฟล์):** BirthdateInput,
AICreationSequence, ClaimAccount, InitialBlueprint, FullAnalysis,
FinetuningQuestions (+ แก้ `components.test.tsx` เพิ่ม `LanguageProvider`
wrapper เพราะ 3 component ที่ test เรียก `useLanguage()` ซึ่ง throw ถ้าไม่มี
provider)

**Batch 5 — marketing/content pages (~23 ไฟล์):** TarotPage, ActivitiesPage,
PalmistryPage, BlogListPage (UI chrome — บทความยังเป็นภาษาไทยล้วน ดูหมายเหตุ),
AnalysisPage (UI chrome — `displayAnalysis` เป็น engine-generated), PrivacyCenter,
PricingPage, PricingSuccessPage, PasskeySettings, SciencePage, MePage,
VsAstrologyPage (bilingual อยู่แล้ว), blog-astrology-vs-behavioral (bilingual
อยู่แล้ว), LifeHubsPage, ContactPage, AboutPage, TermsPage, BlogArticle,
BlogIndex, Share, FAQPage (+ `src/constants/faqs.ts` แปลครบ 15 ข้อ),
DecisionLoggerPage (wrapper เปล่า — ไม่มีข้อความ), VoiceChatPage (wrapper
เปล่า), ExplorePage (UI chrome — hexagram data ยังเป็น Thai-only ดูหมายเหตุ)

**Batch 6 — misc small components (7 ไฟล์):** LanguageSwitcher,
PWAInstallPrompt, PendingOnboardingSaver (ไม่มีข้อความ UI), ShareButton
(`src/components/viral/ShareButton.tsx`), landing/BirthDataInput (dead
code — ไม่มีใคร import แต่แปลไว้เผื่ออนาคต), auth/PasskeyLogin,
today/TodaySection (แปล `SECTION_LIBRARY` 9 การ์ดครบ)

**Bug แถมที่เจอและแก้:** `SoundscapePlayer.tsx` มี aria-label เป็นภาษาจีน
(`暂停`/`播放`) ผิดที่มาแต่แรก — แก้เป็น bilingual TH/EN แล้ว

**Verify**: `tsc -b` ผ่านสะอาดหลังทุกไฟล์/ทุก batch — full sweep สุดท้ายก็ผ่าน

## 🚫 สิ่งที่ตั้งใจไม่แตะ (data-layer / long-form content — ไม่ใช่ scope ของ
งานแปล UI string)

ทั้งหมดนี้ flag ไว้ด้วย code comment ในไฟล์ที่เกี่ยวข้องแล้ว:

1. **`environment.soundscape.labelThai` / `.descriptionThai` /
   `timeOfDay.labelThai`** — มาจาก `SoundscapeEngine.ts` +
   `TimeOfDayEngine.ts` (data-layer, ใช้ร่วมกันใน `WorldDetail.tsx`,
   `SoundscapePlayer.tsx`, `WorldEnvironment.tsx`, `AmbientBadge.tsx`) —
   เปลี่ยน data model (เพิ่ม `labelEn`) ไม่ใช่แค่แก้ข้อความหน้าเว็บ
2. **`hexagram.thaiName` / `.theme` / `.guidance` / `.keywords`**
   (`HexagramEngine.ts`, ตาราง 64 รายการ) — ใช้ใน `ExplorePage.tsx`
3. **InsightEngine / PersonalContextBuilder / PatternDetector** —
   analysis text ที่ AI สร้างขึ้น เป็น Thai-only โดยธรรมชาติของ engine
   (`AnalysisPage.tsx` แสดงผล `displayAnalysis`)
4. **`BlogListPage.tsx`'s `STATIC_ARTICLES`** + บทความ markdown ~25 ไฟล์ที่
   fetch จาก server — long-form editorial content, ไม่ใช่ UI string
5. **`FinetuningQuestions.tsx`'s `QuestionOption.value`** — ค่า canonical
   ภาษาไทยที่ `astrovera-adapter.ts`'s `PHASE_ANSWER_TO_KEY` ใช้ map (q5
   เท่านั้น) — ห้ามแปล มิฉะนั้น mapping จะพัง (label ที่แสดงแปลแล้ว)

ทั้งหมดนี้ต้องการ **decision แยกต่างหาก** จาก jb_DEV ว่าจะ:
(ก) เพิ่ม field ภาษาอังกฤษคู่ขนานใน data model, หรือ
(ข) ปล่อยให้เป็น Thai-only ต่อไปโดยเจตนา (เช่น engine-generated text
อาจจะ prompt ให้ AI ตอบเป็นภาษาที่ user เลือกแทนก็ได้ ซึ่งเป็นงานคนละ scope)

## แนวทางสำหรับไฟล์ใหม่ในอนาคต

Pattern เดิม: เพิ่ม `const { language } = useLanguage();` +
`const isTh = language === 'th';` แล้ว wrap ข้อความด้วย
`{isTh ? 'ไทย' : 'English'}` — ห้ามเปลี่ยนเป็น i18n library ใหม่โดยไม่ถามก่อน
รัน `npx tsc -b` หลังทุกไฟล์เพื่อจับ syntax error (โดยเฉพาะ apostrophe ใน
string ภาษาอังกฤษที่ใช้ single quote — ต้องสลับเป็น double quote หรือ escape)
