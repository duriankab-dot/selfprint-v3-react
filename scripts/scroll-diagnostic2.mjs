/**
 * scripts/scroll-diagnostic2.mjs — SCROLL-BUG-001 PROVE phase
 *
 * Tests REAL user scrolling (mouse.wheel) + instant programmatic scroll,
 * body scroll-lock state, and chat internal scroller, on:
 *   1. PROD landing /th/           (deployed, logged out)
 *   2. STAGING landing /th/        (deployed, logged out)
 *   3. LOCAL landing /th/          (local, logged out)
 *   4. STAGING dashboard /th/dashboard (deployed, authed)
 *   5. STAGING chat /th/chat           (deployed, authed — body lock BY DESIGN, internal area must scroll)
 */
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

const PROBE = async (page) => {
  const read = () => page.evaluate(() => ({
    scrollY: window.scrollY,
    deTop: (document.scrollingElement || document.documentElement).scrollTop,
    bodyPos: getComputedStyle(document.body).position,
    bodyOv: getComputedStyle(document.body).overflow + '/' + getComputedStyle(document.body).overflowY,
    bodyTop: document.body.style.top || '(none)',
    bodyInlineOv: document.body.style.overflow || '(none)',
  }));
  const r = {};
  // A) instant programmatic scroll (bypasses scroll-behavior:smooth)
  await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'instant' }));
  await page.waitForTimeout(300);
  r.afterInstantScroll = await read();
  // B) REAL wheel scroll (what the user does)
  await page.mouse.move(200, 400);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(600);
  r.afterWheel = await read();
  return r;
};

async function run(browser, label, url, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 390, height: 844 },
    ...(opts.storageState ? { storageState: opts.storageState } : {}),
  });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  } catch (e) {
    console.log(`\n===== ${label} =====\nGOTO FAILED: ${e.message.split('\n')[0]}`);
    await ctx.close();
    return;
  }
  await page.waitForTimeout(opts.wait || 5000);
  const r = await PROBE(page);
  // C) chat-internal scroller test (only meaningful on chat page)
  let chatInternal = null;
  if (opts.chat) {
    chatInternal = await page.evaluate(() => {
      const el = document.querySelector('.immersive-chat-area');
      if (!el) return 'NO .immersive-chat-area';
      el.scrollTop = 300;
      return { setTo300_readBack: el.scrollTop, scrollH: el.scrollHeight, clientH: el.clientHeight };
    });
  }
  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify({ ...r, chatInternal }, null, 1));
  await ctx.close();
}

const browser = await chromium.launch();
const authFile = './e2e/.auth/user.json';
const auth = existsSync(authFile) ? authFile : undefined;

await run(browser, '1. PROD LANDING /th/ — wheel test', 'https://www.selfprint.one/th/');
await run(browser, '2. STAGING LANDING /th/ — wheel test', 'https://selfprint-staging.pages.dev/th/');
await run(browser, '3. LOCAL LANDING /th/ — wheel test', 'http://localhost:5173/th/');
if (auth) {
  await run(browser, '4. STAGING DASHBOARD /th/dashboard — wheel test', 'https://selfprint-staging.pages.dev/th/dashboard', { storageState: auth, wait: 7000 });
  await run(browser, '5. STAGING CHAT /th/chat — body lock + internal scroll', 'https://selfprint-staging.pages.dev/th/chat', { storageState: auth, wait: 7000, chat: true });
} else {
  console.log('\n4/5 SKIPPED — no auth state');
}
await browser.close();
