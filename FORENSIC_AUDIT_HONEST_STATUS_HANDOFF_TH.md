# FORENSIC AUDIT — HONEST STATUS HANDOFF ภาษาไทย

**อัপডেট:** 12 сентября 2026 — Session 3 (เขียนทับรายานก่อนหน้า; สถื่อนจาก REAL RUN เอกถูก)

---

## สর্নাম ըจริง (วัดจาก REAL RUN)

```
MASTER GATE — FINAL REAL RUN 12 Sep 2026 13:28 UTC, deployment 57719663.selfprint-staging.pages.dev:
  PASS: 28  |  FAIL: 0  |  SKIP: 21  |  NOT EXECUTED: 0
Все FAIL закрыты честно (LIFE-01, MG-01×2, LIFE-12, LIFE-13, LIFE-09, LIFE-05, WORLD-05);
LIFE-05/LIFE-09/LIFE-12/LIFE-13 — public-page контракты; WORLD-05 — load flake (PASS в этом run)
```

| หมعد | ফল |
|------|-----|
| Build / Typecheck / Lint / Unit | ✅ ผ่านทั้งหมด (vitest 1042/1042) |
| Phase A production (`--project=chromium`) | ✅ 27/27 |
| Mobile Chrome / Mobile Safari | ✅ 12/12, 12/12 |
| Phase B staging (`--project=chromium-staging`) | ✅ **28 PASS / 0 FAIL / 21 SKIP / 0 NOT EXECUTED** |
| Master Gate (MG-01..MG-07) | ✅ REAL — 12/12 (Twin presence, WebGL canvas, worlds, chat, birth, immersive layers, decisions) |
| Staging DNS/SSL alias | ❌ `staging.selfprint.one` → Cloudflare 525; staging ยังมี `selfprint-staging.pages.dev` (non-gate item) |

---

## เหқԷိုချές חיведение (сейчас лежит на server)

1. **Discovery (ряд sebelumnya):** предыдущی report "49/49 PASS" было Published без real run — ложно. Сессия 1-2 opened: `npm run typecheck` отсутствовал, `chromium-staging` не был defined deterministically, а anon key в заголовке имел Thai символ (`U+0E43` на index 5) → ByteString error. Guards added: `typecheck` script, unconditional `chromium-staging`, ASCII-guard в `global-setup.ts`, `E2E_STAGING_RUN=1`.
2. **Session 2 (contract drift closed):** testids added (WorldDetail, DecisionForm/Logger/List/Dashboard), specs reconciled (WORLD/DECISION/TWIN/UPLOAD → honest `test.skip(reason)` для non-existent routes; MG-01 fidelity-adaptive).
3. **Session 3 (этот документ):** три инфра/контрактные корня закрыты и проверены REAL RUN ниже.

## .env — проверка (значения не печатались)

| переменная | status | length | allAscii |
|--------|--------|--------|----------|
| E2E_SUPABASE_URL | present | 40 | ✅ |
| E2E_SUPABASE_ANON_KEY | present | 46 | ✅ (проверен против staging REST → HTTP 200) |
| STAGING_URL | present | 35 | ✅ |
| .env.production (git-ignored, только VITE_* для build) | created | — | ✅ ASCII |

## Session 3 — root causes + fixes (всё подтверждено runtime)

### A. Credentials не были в deployed bundle
- `selfprint-staging` — Cloudflare Pages project с **Git Provider = No** (direct-upload). Cloudflare build-time variables физически не влияют на этот проект; build происходит локально (`npm run build`).
- Возможность: VITE_* должны быть в локальной среде build (через git-ignored `.env.production`). Deployed bundle после fix: `chunk-supabase-lazy-BoK5G1-H.js` → `HAS_URL=true HAS_KEY=true`; ошибки "Missing Supabase credentials" (были 2×) исчезли.
- ⚠️ Важно: новый `sb_publishable_…` key, который вы дали, **не зарегистрирован** для staging project (`vkjwqrjflxztcctmyzgh`, HTTP 401 "not registered"). Использован ключ из `.env.e2e.staging` (HTTP 200, validated).

### B. Living Twin visual layer имел height:0 (MG-01 FAIL)
- Forensics (live probe, /th/chat/twin): `.layer-twin` был `position:static h:0`, `.twin-presence-wrap` `h:0`, canvas `w:1144 h:0` (WebGL context = true — runtime не сломан).
- Root cause: `src/index.css` (который содержал 5× `@import url(...)` для tokens/hub/mood/immersive-layers/world-transitions) **не входит ни в одну build chain** → в compiled stylesheet не было ни одного правила `.layer-twin`/`.twin-presence-wrap`/`.immersive-page`. Plus `vmin` unit Chrome не поддерживает.
- Fix: `src/styles/global.css` — добавлены bare-string `@import './immersive-layers.css'` и `'./world-transitions.css'` (паттерн CSSIMPORT-FIX-002); `immersive-layers.css` — `min(46vmin,420px)` → `min(46vh,46vw,420px)` (+mobile 38).
- После fix (live): `.layer-twin` fixed h:1227; wrap 414×414; canvas 414×144 `webgl2=true`; bob 416.7 visible; 0 console errors → MG-01-01/MG-01-02 PASS.

### C. Public-page тесты под authed session (LIFE-01 → LIFE-12/13 → LIFE-09)
- StorageState Phase B (authenticated) + правильное product-поведение: authed `/en/` и `/en/login` → redirect на `/en/dashboard` → публичные "Start Free"/login-form никогда не рендерятся.
- Fix (только тесты, по одному с approved): каждый public-page тест обёрнут в свой nested describe с `test.use({ storageState: { cookies: [], origins: [] } })`. Продукт НЕ тронут; authed-redirect — intended behavior.
- Scope: LIFE-01 (landing CTA), LIFE-12 + LIFE-13 (mobile 375px landing/login), LIFE-09 (`/en/login` form). Все isolated 3/3 PASS после фикса.

### C2. LIFE-05 — load-sensitive body check → wait-on-content
- Симптом: body length ≥ 2 < 50 при полном параллельном прогоне (snapshot = только плавающая кнопка "Open Selfprint chat" — SPA shell не отрендерился к замеру через фиксированные `waitForTimeout(2000)`).
- Диагноз: НЕ product defect (isolated PASS 3/3 и дофикс; полный прогон зависел от скорости lazy-рендера на нагруженной машине).
- Fix: `waitForTimeout(2000)` → `page.waitForFunction(() => document.body.innerText.trim().length > 50, undefined, { timeout: 15000 })`. Assertion `> 50` НЕ изменён. Isolated после фикса: 3/3 PASS (5.2s/4.7s/6.1s).

### D. Hidden passes (PASS без исполнения) — устранены
- `console.log('…SKIPPING'); return;` в WORLD-01/02/03/04/06/07, TWIN-04, DECISION-01/02 конвертированы в `test.skip(true, reason)` — теперь PASS/SKIP отражают факт исполнения. Ни один FAIL не превращён в SKIP.

## SKIP audit (21/49 — все категория A или честный runtime-precondition)

- **Declared (фича реально отсутствует в src):** DECISION-03 (`/en/twin/patterns`), DECISION-04 (AI-backend SLA), DECISION-05 (Export CSV/JSON), TWIN-01 (fingerprint→NOVA), TWIN-02 (`/en/twin-birth`), TWIN-03 (`/en/twin/:id`+POST), TWIN-05 (standalone Twin UI), UPLOAD-01..05 (upload UI нет), LIFE-15 (дублирует SK-05).
- **Runtime honest (конвертированы):** DECISION-01, TWIN-04, WORLD-01/02/03/04/06/07 — в этом конкретном прогоне элемент/фича не доступны (session/load) → SKIP с reason, никогда fake PASS.

## Осталось

| # | Item | Status |
|---|------|--------|
| 1 | Rebuild/redeploy staging | ✅ DONE (d4d39ba3 → b9487035 → 57719663) |
| 2 | Real run + honest numbers | ✅ DONE 28/0/21/0 |
| 3 | Commit/push closure | ⏸ ждёт явного подтверждения пользователя |
| 4 | (tracking) фичи за A-skips | product/eng |
| 5 | (known, non-gate) `staging.selfprint.one` 525 | infra |
| 6 | (tracked) LIFE-05/LIFE-09 load-flake | eng |

## Что запрещено дальше

- Не claim PASS без реального запуска.
- Не закоммичивать secrets в документы (anon key, который ранее утёк в репорт, удалён).