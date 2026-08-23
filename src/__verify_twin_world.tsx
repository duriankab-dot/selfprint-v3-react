// TEMP verification script (P0-H Gap 4) — not part of the app, deleted after use.
// Renders TwinPresence for all 12 Worlds via ReactDOMServer (no browser/jsdom
// needed) to genuinely execute the component code and check real output,
// since Playwright is network-blocked in this sandbox and Vitest's include
// glob deliberately excludes component tests project-wide.
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { TwinPresence } from './components/twin/TwinPresence';
import { getAllWorlds } from './constants/worlds';

const worlds = getAllWorlds();
const outputs: Record<string, string> = {};
let failed = false;

for (const world of worlds) {
  try {
    const html = renderToStaticMarkup(
      createElement(TwinPresence, {
        primaryArchetype: 'sage',
        worldColor: world.color,
        seedKey: 'verify-seed',
        worldId: world.id,
        contained: true,
      })
    );
    outputs[world.id] = html;
    if (!html.includes('<svg')) {
      console.error(`FAIL: ${world.id} did not render an <svg>`);
      failed = true;
    }
  } catch (err) {
    console.error(`FAIL: ${world.id} threw during render:`, err);
    failed = true;
  }
}

// Distinctness check — every World's markup must differ from every other's.
const htmlList = Object.entries(outputs);
for (let i = 0; i < htmlList.length; i++) {
  for (let j = i + 1; j < htmlList.length; j++) {
    if (htmlList[i][1] === htmlList[j][1]) {
      console.error(`FAIL: ${htmlList[i][0]} and ${htmlList[j][0]} rendered identical markup`);
      failed = true;
    }
  }
}

// Full-screen (non-contained, the real WorldDetail.tsx usage) + no worldId
// (neutral fallback) must also render without throwing.
try {
  renderToStaticMarkup(createElement(TwinPresence, { primaryArchetype: 'hero', worldColor: '#000000' }));
  renderToStaticMarkup(createElement(TwinPresence, { worldColor: '#000000' })); // no archetype at all
} catch (err) {
  console.error('FAIL: default/no-archetype render threw:', err);
  failed = true;
}

// Spot-check: career should include its collar-bar <rect>, self its
// ring-focus accent, wellbeing its lotus <ellipse> petals — confirms the
// switch in TwinAccessory isn't silently falling through to `default: null`.
const spotChecks: Array<[string, RegExp]> = [
  ['career', /<rect/],
  ['self', /<circle[^>]*r="6"/],
  ['wellbeing', /<ellipse/],
  ['purpose', /<polygon points="50,8/],
];
let spotFailed = false;
for (const [worldId, pattern] of spotChecks) {
  const html = outputs[worldId] || '';
  if (!pattern.test(html)) {
    console.error(`SPOT-CHECK FAIL: ${worldId} missing expected accessory pattern ${pattern}`);
    spotFailed = true;
  } else {
    console.log(`SPOT-CHECK OK: ${worldId}`);
  }
}

console.log(`Rendered ${worlds.length} worlds. Sample (career) length: ${outputs.career?.length} chars`);
const allPassed = !failed && !spotFailed;
console.log(allPassed ? 'RESULT: PASS' : 'RESULT: FAIL');
process.exit(allPassed ? 0 : 1);
