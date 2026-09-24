/**
 * scripts/scroll-diagnostic.mjs — SCROLL-BUG-001 OBSERVE phase
 *
 * Standalone Playwright script (not a test) that measures WHO controls
 * scrolling and WHAT sits on top of the DOM, on:
 *   1. Production landing  https://www.selfprint.one/th/      (deployed, logged out)
 *   2. Staging landing     https://selfprint-staging.pages.dev/th/ (deployed, logged out)
 *   3. Local landing       http://localhost:5173/th/           (local dev, logged out)
 *   4. Staging dashboard   https://selfprint-staging.pages.dev/th/dashboard (deployed, authed via e2e/.auth/user.json)
 *
 * Read-only. No clicks on destructive elements. Mobile viewport 390x844
 * (matches the user's phone-width report) + one desktop pass on local.
 */
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';

const DIAGNOSTIC_FN = () => {
  const styleOf = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      cls: (typeof el.className === 'string' ? el.className : '').split(' ').filter(Boolean).slice(0, 4).join(' '),
      overflowX: s.overflowX, overflowY: s.overflowY,
      cssHeight: s.height, position: s.position,
      pointerEvents: s.pointerEvents, zIndex: s.zIndex,
      rectH: Math.round(r.height), clientH: el.clientHeight, scrollH: el.scrollHeight,
    };
  };
  const pick = (sel) => {
    const el = document.querySelector(sel);
    return el ? styleOf(el) : 'NOT_FOUND';
  };
  const chainAt = (x, y) => {
    const out = [];
    let el = document.elementFromPoint(x, y);
    let i = 0;
    while (el && i < 6) {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.push(
        `${el.tagName}.${(typeof el.className === 'string' ? el.className : '').split(' ').filter(Boolean).slice(0, 3).join('.')}` +
        ` pos=${s.position} z=${s.zIndex} pe=${s.pointerEvents} fixed=${s.position === 'fixed'} rect=${Math.round(r.width)}x${Math.round(r.height)}`
      );
      el = el.parentElement;
      i++;
    }
    return out;
  };
  const w = window;
  w.scrollTo(0, 0);
  const before = w.scrollY;
  w.scrollTo(0, 800);
  const afterWin = w.scrollY;
  const de = document.scrollingElement || document.documentElement;
  de.scrollTop = 800;
  const afterDe = de.scrollTop;
  return {
    url: location.href,
    viewport: { w: w.innerWidth, h: w.innerHeight },
    htmlAttrs: [...document.documentElement.attributes].map((a) => `${a.name}=${a.value}`).join(' '),
    bodyClass: document.body.className,
    doc: { scrollHeight: de.scrollHeight, clientHeight: de.clientHeight, canScroll: de.scrollHeight > de.clientHeight },
    body: { scrollHeight: document.body.scrollHeight, clientHeight: document.body.clientHeight },
    scrollTest: { before, afterWin, afterDe, VIEWPORT_SCROLLS: afterWin > 0 || afterDe > 0 },
    html: styleOf(document.documentElement),
    body: styleOf(document.body),
    root: styleOf(document.getElementById('root')),
    appshell: pick('.sp-appshell'),
    appshellMain: pick('.sp-appshell-main'),
    pageContent: pick('.page-content'),
    immersivePage: pick('.immersive-page'),
    fixedOverlays: [...document.querySelectorAll('body *')].filter((el) => {
      const s = getComputedStyle(el);
      if (s.position !== 'fixed') return false;
      const r = el.getBoundingClientRect();
      return r.width >= w.innerWidth * 0.95 && r.height >= w.innerHeight * 0.9;
    }).map((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return `${el.tagName}.${(typeof el.className === 'string' ? el.className : '').split(' ').filter(Boolean).slice(0, 4).join('.')} z=${s.zIndex} pe=${s.pointerEvents} opacity=${s.opacity} visibility=${s.visibility} display=${s.display} rect=${Math.round(r.width)}x${Math.round(r.height)}`;
    }),
    chainCenter: chainAt(Math.round(w.innerWidth / 2), Math.round(w.innerHeight / 2)),
    chainBottom: chainAt(Math.round(w.innerWidth / 2), Math.round(w.innerHeight * 0.9)),
  };
};

async function run(browser, label, url, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 390, height: 844 },
    ...(opts.storageState ? { storageState: opts.storageState } : {}),
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 180));
  });
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  } catch (e) {
    console.log(`\n===== ${label} =====\nGOTO FAILED: ${e.message.split('\n')[0]}`);
    await ctx.close();
    return;
  }
  await page.waitForTimeout(opts.wait || 5000);
  const data = await page.evaluate(DIAGNOSTIC_FN);
  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify(data, null, 1));
  if (consoleErrors.length) {
    console.log('CONSOLE ERRORS (first 4):');
    consoleErrors.slice(0, 4).forEach((e) => console.log('  • ' + e));
  }
  await ctx.close();
}

const browser = await chromium.launch();
const authFile = './e2e/.auth/user.json';
const authState = existsSync(authFile) ? authFile : undefined;

await run(browser, '1. PROD LANDING selfprint.one/th/ — deployed', 'https://www.selfprint.one/th/');
await run(browser, '2. STAGING LANDING staging.pages.dev/th/ — deployed', 'https://selfprint-staging.pages.dev/th/');
await run(browser, '3. LOCAL LANDING localhost:5173/th/ — local fix applied', 'http://localhost:5173/th/');
await run(browser, '3b. LOCAL LANDING desktop 1280x800', 'http://localhost:5173/th/', { viewport: { width: 1280, height: 800 } });
if (authState) {
  await run(browser, '4. STAGING DASHBOARD /th/dashboard — deployed + authed', 'https://selfprint-staging.pages.dev/th/dashboard', { storageState: authState, wait: 7000 });
} else {
  console.log('\n4. STAGING DASHBOARD — SKIPPED: e2e/.auth/user.json not found');
}
await browser.close();
