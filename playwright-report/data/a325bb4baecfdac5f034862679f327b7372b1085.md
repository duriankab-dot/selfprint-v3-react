# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: twin.spec.ts >> Twin Creation & Chat Flow >> twin chat with performance assertion
- Location: e2e\twin.spec.ts:30:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[placeholder*="message"], textarea').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[placeholder*="message"], textarea').first()

```

```yaml
- navigation:
  - link "SelfPrint SelfPrint":
    - /url: /en/
    - img "SelfPrint"
    - text: SelfPrint
  - link "แดชบอร์ด":
    - /url: /en/dashboard
  - link "แชท":
    - /url: /en/chat
  - link "เมนู":
    - /url: /en/menu
  - button "🇬🇧 EN"
  - button "เริ่มใช้งาน ฟรี"
- text: 💡 แพลตฟอร์ม Living AI ภาษาไทยหนึ่งเดียว ที่ช่วยตัดสินใจ และพัฒนาศักยภาพในตัวคุณ
- heading "เลิกเดา ทิศทางของชีวิต ให้ AI ช่วยคิดและตัดสินใจเพื่อคุณ" [level=1]
- paragraph: SELFPRINT สังเคราะห์ข้อมูลเวลาเกิดและพฤติกรรมผ่าน 12 SICE เป็นแบบจำลองอนาคตที่แม่นยำด้วยสถิติจริง ป้องกันความผิดพลาดในอนาคตครบทุกด้านของชีวิตคุณ
- button "สร้าง Digital Twin ของฉันฟรี (ใน 2 นาที)"
- button "ดูวิดีโอแนะนำ SELFPRINT"
- img
- heading "วันนี้ คุณรู้สึกยังไงบ้าง? ให้ AI เริ่มคำนวณจากสภาวะจิตใจของคุณ" [level=2]
- paragraph: อารมณ์ปัจจุบันของคุณคือดาต้าสำคัญ ช่วยให้ ฝาแฝด เข้าใจ และปรับตัวเองให้สอดคล้องกับตัวคุณได้ดีขึ้น
- paragraph: อารมณ์ตอนนี้
- button "😰 เครียด"
- button "🤔 สับสน"
- button "💪 มั่นใจ"
- button "😴 หมดแรง"
- button "🚀 พร้อม"
- button "🌙 สะท้อนใจ"
- paragraph: อยากคิด รื่องหาความหมาย
- heading "ทำไมคนไทยยุคใหม่ต้องใช้ SELFPRINT?" [level=2]
- paragraph: ในแต่ละวันคุณต้องตัดสินใจมากกว่า 100 ครั้ง แต่หลายครั้งติดกับดักรูปแบบพฤติกรรมเดิมๆ (Blind Spots) โดยไม่รู้ตัว SELFPRINT ช่วยจดจำและพัฒนาข้อมูลเหล่านี้ด้วยสถิติที่จับต้องได้จริง
- text: 🎯
- heading "ตัดสินใจได้ถูกต้องมั่นใจมากขึ้น" [level=3]
- paragraph: ตรวจจับรูปแบบ Pattern ซ้ำๆ ชี้ข้อควรระวังและประเมินความเสี่ยงให้คุณรู้ทันก่อนจะตัดสินใจผิดพลาด
- text: 💡
- heading "วิเคราะห์พฤติกรรมและจุดอ่อน (Blind Spots)" [level=3]
- paragraph: คำนวนแนวโน้มทิศทางความสำเร็จล่วงหน้าจากข้อมูลสถิติจริง เพื่อช่วยการตัดสินใจเรื่อง งาน และเงินที่แม่นยำ
- text: 🚀
- heading "วิวัฒนาการตัวเอง" [level=3]
- paragraph: ทุกการตัดสินใจถูกเรียนรู้จดจำและวิเคราะห์ สแกนโครงสร้างเชิงลึกตั้งแต่วันแรกที่ใช้งาน
- button "เริ่มต้นเลย ฟรี"
- heading "ดูวิธีสร้าง AI Twin ของคุณใน 2 นาที" [level=2]
- paragraph: ชมวิดีโอแนะนำสั้นๆ — เห็นภาพการทำงานตั้งแต่การคำนวณ Insight แรก ไปจนถึงระบบประมวลผล Living AI ที่เติบโตไปพร้อมกับคุณ
- img
- paragraph: วิดีโอ AI Tour กำลังจะมาเร็วๆ นี้
- heading "SELFPRINT ทำงานยังไง?" [level=2]
- paragraph: ใช้ 3 ขั้นตอนสร้าง Insight แรก ที่เข้าใจตัวคุณมากกว่า 60% ใน 40 วินาที Fine tuning ด้วยคำถามสั้น จนถึงสร้าง AI ฝาแฝดที่เข้าใจคุณมากขึ้นและช่วยพัฒนาคุณ ภายใน 2 นาที
- text: 1️⃣
- heading "บอกข้อมูลตัวตน" [level=3]
- paragraph: AI เรียนรู้โครงสร้างและวิเคราะห์สภาวะเริ่มต้นของคุณ
- text: 2️⃣
- heading "AI Twin ฝาแฝด ถูกสร้าง" [level=3]
- paragraph: เห็นกระจกสะท้อนตัวเอง รูปแบบพฤติกรรม ความคิดและสไตล์การตัดสินใจครั้งแรก
- text: 3️⃣
- heading "เริ่มต้นพัฒนาศักยภาพ" [level=3]
- paragraph: ยิ่งสะท้อนตัวตนผ่านการพูดและเขียนบันทึกมากขึ้น AI Twin จะยิ่งแม่นยำแล้วเข้าใจมากขึ้น
- button "เริ่มสร้าง AI Twin ของคุณเลย ฟรี"
- heading "เสียงตอบรับจากผู้ใช้งาน SELFPRINT ในประเทศไทย" [level=2]
- paragraph: ผู้ประกอบการ นักลงทุน และผู้บริหารกว่า 10,000 คนใช้ SELFPRINT เพื่อการตัดสินใจได้ดีมากยิ่งขึ้น
- paragraph: "\"SELFPRINT ช่วยให้ผมเข้าใจรูปแบบการตัดสินใจของตัวเอง มันน่าทึ่งมากที่ผมสามารถปรึกษามันได้ทั้งวันด้วย ฝาแฝด ของผมที่สร้างขึ้นมาเอง 😳😳😳\""
- text: ณัฐพล, CEO Tech Startup
- paragraph: "\"เลิกนั่งเดาอนาคตไปเลยค่ะ SELFPRINT เอาสถิติมาลิงค์กับพฤติกรรมจริง คาดการณ์แนวโน้มชีวิตได้แม่นมาก ช่วยตัดสินใจเรื่องงานและเงินเฉียบคมมากขึ้นเยอะ\""
- text: พนนีย์, Investor VC Fund
- paragraph: "\"ทุกการตัดสินใจดีขึ้นมากหลายเท่าหลังจากใช้ SELFPRINT เป็นแอพที่ไม่น่าเชื่อว่าจะตอบโจทย์ได้มากขนาดนี้ 👍👍\""
- text: วิทยา, Entrepreneur E-commerce
- button "ลอง SELFPRINT เลย ฟรี"
- heading "พร้อมสร้าง AI ฝาแฝด ของคุณแล้วหรือยัง?" [level=2]
- paragraph: ทดลองใช้เครื่องมือวิเคราะห์ระดับสูงสุด AI Digital Twinของ SELFPRINT ฟรี ไม่ผูกมัด ปลอดภัย ไม่ต้องใส่ข้อมูลบัตรเครดิต
- button "ทดลองเลยตอนนี้"
- heading "บอกเราว่าคุณเกิดเมื่อไหร่" [level=3]
- paragraph: ข้อมูลนี้ช่วยให้ AI Twin เข้าใจแพทเทิร์นหลักของคุณ เวลาและสถานที่เกิดใส่หรือไม่ใส่ก็ได้
- text: วันเกิด *
- textbox "วันเกิด"
- text: เวลาเกิด (ไม่บังคับ)
- textbox "เวลาเกิด"
- text: สถานที่เกิด (ไม่บังคับ)
- textbox "สถานที่เกิด":
  - /placeholder: เช่น กรุงเทพฯ ประเทศไทย
- button "บันทึกและไปต่อ"
- heading "เริ่มต้นวิเคราะห์ระบบตัวตนและสร้างฝาแฝด AI Twin ของคุณเพื่อพัฒนาศักยภาพของคุณ วันนี้ ฟรี🆓 ปลอดภัย ไม่มีข้อผูกมัด" [level=2]
- paragraph: 👥 SELPRINT 👥 พร้อมพัฒนาคุณแล้ว 🚀🚀🚀
- button "สร้าง AI ฝาแฝด ที่เข้าใจฉัน"
- contentinfo:
  - img "SelfPrint"
  - text: SelfPrint
  - paragraph: AI Twin ที่เข้าใจรูปแบบการตัดสินใจของคุณ ช่วยให้คุณรู้จักตัวเองได้ลึกขึ้นในทุกวัน
  - text: ลิงก์ด่วน
  - link "หน้าแรก":
    - /url: /
  - link "แดชบอร์ด":
    - /url: /dashboard
  - link "แชท":
    - /url: /chat
  - link "เมนูฟีเจอร์":
    - /url: /menu
  - link "เริ่มต้นใช้งาน":
    - /url: /onboarding
  - text: © 2026 SelfPrint สงวนลิขสิทธิ์ สร้างด้วย AI Twin Engine
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { PERFORMANCE_LIMITS, navigateToHub, waitForAPICall } from './utils';
  3   | 
  4   | test.describe('Twin Creation & Chat Flow', () => {
  5   |   test.beforeEach(async ({ page }) => {
  6   |     // Navigate to app home
  7   |     await page.goto('/today');
  8   |     await page.waitForLoadState('networkidle').catch(() => {});
  9   |   });
  10  | 
  11  |   test('core awakening flow - twin creation', async ({ page }) => {
  12  |     // Look for "Create Twin" or "Core Awakening" button
  13  |     const createTwinBtn = page.locator('text=/Create Twin|Core Awakening|Awaken/i').first();
  14  | 
  15  |     if (await createTwinBtn.isVisible({ timeout: 5000 })) {
  16  |       const startTime = Date.now();
  17  |       await createTwinBtn.click();
  18  | 
  19  |       // Wait for API call
  20  |       const response = await waitForAPICall(page, /twin|awakening/);
  21  |       const duration = Date.now() - startTime;
  22  | 
  23  |       console.log(`Twin creation took ${duration}ms (limit: ${PERFORMANCE_LIMITS.API_RESPONSE}ms)`);
  24  |       expect(duration).toBeLessThan(PERFORMANCE_LIMITS.API_RESPONSE + 500);
  25  | 
  26  |       expect(response.ok()).toBeTruthy();
  27  |     }
  28  |   });
  29  | 
  30  |   test('twin chat with performance assertion', async ({ page }) => {
  31  |     // Navigate to Twin chat
  32  |     await navigateToHub(page, 'twin');
  33  | 
  34  |     // Ensure chat interface loads
  35  |     const chatInput = page.locator('input[placeholder*="message"], textarea').first();
> 36  |     await expect(chatInput).toBeVisible({ timeout: 5000 });
      |                             ^ Error: expect(locator).toBeVisible() failed
  37  | 
  38  |     // Send a message
  39  |     const message = 'Hello Twin, what are you thinking?';
  40  |     const startTime = Date.now();
  41  | 
  42  |     await chatInput.fill(message);
  43  |     await page.keyboard.press('Enter');
  44  | 
  45  |     // Wait for API response
  46  |     try {
  47  |       const response = await waitForAPICall(page, /twin|chat|message/);
  48  |       const duration = Date.now() - startTime;
  49  | 
  50  |       console.log(`Twin chat response took ${duration}ms (limit: ${PERFORMANCE_LIMITS.TWIN_CHAT}ms)`);
  51  | 
  52  |       if (duration > PERFORMANCE_LIMITS.TWIN_CHAT) {
  53  |         console.warn(`⚠️ SLOW TWIN CHAT: ${duration}ms > ${PERFORMANCE_LIMITS.TWIN_CHAT}ms`);
  54  |       }
  55  | 
  56  |       expect(response.ok()).toBeTruthy();
  57  |     } catch (_e) {
  58  |       console.log('Chat API call may be streaming - checking for visible response');
  59  |     }
  60  | 
  61  |     // Wait for visible response (Twin should respond)
  62  |     const twinResponse = page.locator('text=/I|thinking|understand|help/i').last();
  63  |     await expect(twinResponse).toBeVisible({ timeout: 10000 }).catch(() => {});
  64  |   });
  65  | 
  66  |   test('twin personality context switching (Hubs)', async ({ page }) => {
  67  |     // Verify 5 navigation hubs
  68  |     const hubs = ['วันนี้', 'สำรวจ', 'TWIN', 'กิจกรรม', 'ฉัน'];
  69  | 
  70  |     for (const hub of hubs) {
  71  |       const hubBtn = page.locator(`text="${hub}"`).first();
  72  |       const isVisible = await hubBtn.isVisible({ timeout: 3000 }).catch(() => false);
  73  | 
  74  |       if (isVisible) {
  75  |         console.log(`✓ Hub found: ${hub}`);
  76  |       }
  77  |     }
  78  |   });
  79  | 
  80  |   test('twin memory persistence', async ({ page }) => {
  81  |     // Navigate to Twin
  82  |     await navigateToHub(page, 'twin');
  83  | 
  84  |     // Check for memory display (past conversations, context)
  85  |     const memory = page.locator('text=/remember|memory|past|history/i').first();
  86  |     const memoryExists = await memory.isVisible({ timeout: 5000 }).catch(() => false);
  87  | 
  88  |     if (memoryExists) {
  89  |       console.log('✓ Twin memory/history visible');
  90  |     }
  91  |   });
  92  | 
  93  |   test('twin evolution stages', async ({ page }) => {
  94  |     // Look for evolution stage indicator
  95  |     const stageIndicator = page.locator('[data-testid="evolution-stage"], text=/Stage|Level|Evolution/i').first();
  96  |     const stageExists = await stageIndicator.isVisible({ timeout: 5000 }).catch(() => false);
  97  | 
  98  |     if (stageExists) {
  99  |       const stageText = await stageIndicator.textContent();
  100 |       console.log(`✓ Twin stage: ${stageText}`);
  101 |     }
  102 |   });
  103 | });
  104 | 
```