/**
 * @deprecated ORPHANED — verify 8 ก.ย. 2026 (i18n consolidation รอบที่ 10)
 *
 * ไฟล์นี้เคยเป็นระบบ i18n คู่ขนานกับ `isTh ? 'ไทย' : 'English'` inline
 * (ระบบหลักที่ใช้จริง 98 ไฟล์) — ตอนนี้ 7 ไฟล์สุดท้ายที่เคย import `t()`/`TRANSLATIONS`
 * จากไฟล์นี้ (LandingPage.tsx, AnalysisPage.tsx, BirthdateInput.tsx, TwinChat.tsx,
 * CoreAwakening.tsx, Dashboard.tsx, AICreationSequence.tsx) ถูก migrate ไปใช้
 * isTh inline แทนเรียบร้อยแล้ว (byte-identical กับค่าที่ TRANSLATIONS เคยคืนกลับมา)
 *
 * ไฟล์นี้จึงเหลือ 0 importer จริง (verify ด้วย grep ทั้ง src/ แล้ว)
 *
 * ⚠️ ไม่สามารถลบไฟล์จริงได้จาก sandbox นี้ (bash rm ถูกบล็อกบนโฟลเดอร์โปรเจกต์ที่เชื่อมมา)
 * เจ้าของ repo ควรรัน `git rm src/constants/translations.ts` เอง แล้ว commit
 */
export {};
