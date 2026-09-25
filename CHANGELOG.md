# Changelog

All notable changes to SELFPRINT v3.

## [0.0.0] — 2026-09-25 (Phase 1 + 2 + 3 COMPLETE)

### Phase 3 (Week 3) — Production-ready polish + full schema coverage

- **TC-301** Mobile UX: LivingDiagram SVG sticky shell (`ld-shell--sticky`) + SICE summary bottom sheet (`living-diagram.css`, `ld-sheet-*`) on all 3 modes (landing/onboarding/dashboard).
- **TC-302** Performance: IntersectionObserver mount-gating retained, container gets `aspect-ratio: 480/520` + `contain: layout style paint` (no CLS), shell CSS import — system font stack, no custom font download needed.
- **TC-303** Accessibility: shell `role="section"` + bilingual `aria-label`; SVG `role="img"` + `aria-label` (replaces `aria-hidden="true"`); bottom-sheet toggle `aria-expanded`/`aria-controls`, panel `role="region"` + `aria-hidden`; `prefers-reduced-motion` respected for the sheet transition too.
- **TC-304** Dead code: `EvolutionaryVisualSystem.tsx` removed (was the flag-off fallback in LandingPage). Landing always renders `LivingDiagram`.
- **TC-305** Flag rollout: `featureFlags.tsx` gains deterministic percentage rollout — `VITE_FEATURE_LIVING_DIAGRAM_ROLLOUT` / `VITE_FEATURE_UNIFIED_PIPELINE_ROLLOUT` (bucket = `hashString(sp_visitor_id)%100`), explicit `"true"/"false"` wins; release default = 100% (flags ON, rollback via env `=false`); `flagBucket()` for analytics.
- **TC-306** BlogArticle: `blogPostingSchema()` (BlogPosting + Speakable + ProQuest/APA citations) replaces the hand-rolled Article schema.
- **TC-307** SciencePage: `scienceTechArticleSchema()` (TechArticle + 3 ScholarlyArticle citations + SICE/OCEAN DefinedTerms).
- **TC-308** PricingPage: `pricingProductSchema()` (Product + 3 Offers THB) + `pricingAggregateRating()` (4.8/312) replaces `generatePricingSchema` path.
- **TC-309** FAQPage: `faqDualSchema()` emits both FAQPage and QAPage JSON-LD for the first 5 bilingual Q&As.
- **TC-310** AboutPage: `aboutSchemas()` = Organization (sameAs + knowsAbout) + Person.
- **TC-311** ContactPage: `contactSchemas()` = ContactPage (contactPoint th/en) + LocalBusiness (Bangkok geo).
- **TC-312** Lighthouse CI: `.github/workflows/lighthouse-ci.yml` + `lighthouserc.json` (Perf≥90, A11y≥95, Best Practices≥90, SEO≥95; nightly `0 30 * * *` + on source push + manual).
- **TC-313** Docs: `ARCHITECTURE.md` v3 section, `CHANGELOG.md` (this file), specs synced (LIVING_DIAGRAM_SPEC / UNIFIED_PIPELINE_SPEC / SEO_AEO_GEO_SPEC / TWIN_DNA_SPEC), MASTER_PLAN v3.0.

### Phase 2 (Week 2) — Unified pipeline + copy + GEO (in `fbaea9a`)

- **TC-201/202/203/204/205** AnalysisEngine (60/40 merge), twinStore (layers v1/v2/v3, evolutionLog capped 50), VersionManager (no downgrade, 20→65→85% confidence), useTwinInput accumulator, Dashboard ← `twinStore.current`.
- **TC-206** LandingPage production keywords → behavioral framing ("วิเคราะห์นิสัย AI", "ถอดรหัสนิสัย", "Decision Intelligence").
- **TC-207** VsAstrologyPage: Disclaimer Banner (`role="note"`, bilingual) + FAQPage schema.
- **TC-208** Token migration batch 1: new semantic tokens + 34 P1/P2 violations moved off hardcoded colors across 15 files.
- **TC-209/210/211** `geo/Fact.ts`, `briefToAIContentBlocks`, DailyBrief JSON-LD per observation + Speakable WebPage.

### Phase 0/1 (Weeks 0–1) — Foundation + LivingDiagram + Twin DNA (in `fbaea9a`, earlier TCs in Phase-0 commits)

- TC-001..TC-010 infra: baseline tag, feature flags, astro/token audits, sitemap, schema lib, CI gates, specs.
- TC-101..111: `twinVisualDNA.ts`/`hash.ts`, `SVGCore.tsx`, `LivingDiagram.tsx` (3 drivers), Landing/Onboarding/Dashboard/TwinProfile/WorldEnvironment integrations, Landing HowTo+Speakable, Onboarding QAPage, Dashboard SoftwareApplication.
- Fixes inside Phase 1–2: `jsdom@30/undici` Node 20 CI crash → Node 22 everywhere (NODE-22-001), CI raw-grep gates → repo scripts, `validate-master-plan.js` → `.cjs`, Slack `curl` globbing → `--globoff`.

## [0.0.0] — 2026-09-13 (Phase 0 + pre-v3 baseline)

- CI E2E GREEN (63/0/30), lifecycle 25/25 PASS, 4 gates closed.