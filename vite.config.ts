import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// TWFIX-001 (4 ก.ย. 2026): Tailwind ไม่เคยถูกคอมไพล์เลยตั้งแต่ต้นโปรเจกต์ —
// @tailwind directive อยู่ใน src/index.css ที่ไม่มีใคร import, ไม่มี
// postcss.config.js, และ vite ไม่มี plugin ตัวนี้ → utility class ~800 จุด
// ใน 37 ไฟล์ไม่มีผลอะไรเลย (ยืนยันจาก dist: ไม่มี --tw- สักตัว)
// Tailwind v4 ใช้ plugin ของ vite โดยตรง ไม่ผ่าน postcss แล้ว
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA-PHASE2-001 (7 ก.ย. 2026): injectManifest (NOT generateSW) — keeps
    // our hand-written src/sw.js (push notifications §26-27, journal
    // background sync, notification click routing) fully intact. The
    // plugin only injects the hashed build-asset manifest into
    // `self.__WB_MANIFEST` inside that file; it does not generate or
    // replace the service worker logic itself.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // main.tsx already registers '/sw.js' manually (with its own
      // updatefound listener) — don't let the plugin inject a second,
      // competing registration script into index.html.
      injectRegister: false,
      // public/manifest.json is hand-maintained (id/start_url/theme/
      // background/icons/screenshots — see Phase 1) — don't generate/
      // overwrite it.
      manifest: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,json,ico,png,svg,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    emptyOutDir: false,

    // CHUNK-SPLIT-001: warn when any single chunk exceeds 500 KB (unminified).
    // Pages are already lazy-loaded via React.lazy() in App.tsx.
    //
    // DEADDEP-001 (3 ก.ย. 2026): คอมเมนต์เดิมตรงนี้อธิบาย vendor-three ว่าเป็น
    // chunk ใหญ่สุด ~350 KB — แต่ตรวจแล้วไม่มีไฟล์ไหนใน src/ import 'three' เลย
    // สักบรรทัด chunk นั้นจึงไม่เคยถูกสร้างขึ้นจริง (ยืนยันจาก build output)
    // ลบทั้ง dependency, @types/three และ manualChunks branch ออกแล้ว
    // chunk ที่ใหญ่จริงคือ chunk-intelligence (345 KB raw / 87 KB gzip)
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ────────────────────────────────────────────────────────────────────
          // VENDOR CHUNKS — each major library in its own cacheable file.
          // Order matters: more-specific patterns first.
          // ────────────────────────────────────────────────────────────────────

          // 1. Supabase auth + realtime client
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';

          // 2. React core — react + react-dom + scheduler must stay together
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) return 'vendor-react';

          // 4. Routing — react-router-dom + @remix-run/*
          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/@remix-run')
          ) return 'vendor-router';

          // 5. Data fetching — @tanstack/react-query
          if (id.includes('node_modules/@tanstack')) return 'vendor-query';

          // 6. State management — zustand
          if (id.includes('node_modules/zustand')) return 'vendor-state';

          // 8. SEO — react-helmet-async
          if (
            id.includes('node_modules/react-helmet-async') ||
            id.includes('node_modules/invariant')
          ) return 'vendor-helmet';

          // 8.5. Markdown rendering stack (react-markdown + its full remark/
          // micromark/unified/mdast/hast/unist/vfile dependency tree — 55
          // packages total per package-lock.json, confirmed 8 ก.ย. 2026).
          // The ONLY consumer is BlogArticle.tsx (`lazy(() => import(...))`
          // in App.tsx) — but without this bucket, all 55 packages fell into
          // the single catch-all 'vendor-misc' chunk below alongside small
          // utilities LandingPage's eager code *does* need, so Rollup shipped
          // one physical vendor-misc file everywhere. Lighthouse (8 ก.ย. 2026,
          // mobile, LandingPage) measured 82.1 KiB transferred / 50.8 KiB
          // "unused JavaScript" for vendor-misc — this is that 50.8 KiB.
          // Splitting it into its own chunk lets it load only when
          // BlogArticle's dynamic import actually requests it.
          // VENDORMD-001 (8 ก.ย. 2026): the trailing `\/` this pattern had at
          // first draft required prefix entries (mdast-util-, unist-util-,
          // hast-util-, rehype-) to be the package's *entire* name — so
          // `mdast-util-to-hast/…` never matched and 51 of these 59 packages
          // would have silently fallen through to vendor-misc anyway,
          // defeating the split. Verified against all 393 top-level
          // node_modules packages in package-lock.json: this pattern (no
          // trailing slash) matches exactly react-markdown's 59-package
          // dependency tree and nothing else.
          if (
            /node_modules\/(react-markdown|remark-parse|remark-rehype|rehype-|micromark|mdast-util-|unist-util-|hast-util-|unified|vfile|bail|trough|property-information|space-separated-tokens|comma-separated-tokens|zwitch|ccount|stringify-entities|character-entities|decode-named-character-reference|devlop|is-plain-obj|longest-streak|estree-util-is-identifier-name|trim-lines)/.test(id)
          ) return 'vendor-markdown';

          // 9. All remaining node_modules → one shared vendor-misc chunk
          //    (lodash, date-fns, tiny utilities, etc.)
          if (id.includes('node_modules/')) return 'vendor-misc';

          // ────────────────────────────────────────────────────────────────────
          // APP FEATURE CHUNKS — heavy src modules shared across lazy routes.
          // ────────────────────────────────────────────────────────────────────

          // Personality intelligence engine (dashboard widgets)
          // NOTE: chunk-astrology and chunk-sice were removed — supabase-service.ts
          // is statically imported by AIContext (a core provider in App.tsx), so
          // any module that imports supabase-service cannot be moved to a separate
          // chunk; Rollup would inline it into the main bundle anyway.
          // DEADCHUNK-001 (4 ก.ย. 2026): ลบ branch ที่ตายไปแล้ว 2 อัน —
          // vendor-motion (ไม่มี framer-motion ใน dependencies) และ
          // decision-components (ชี้ src/components/decision/ ที่ถูกลบทั้งโฟลเดอร์)
          //
          // ⚠️ chunk-intelligence 345 kB ที่เห็นใน build **ไม่ใช่** โค้ดใน
          // lib/intelligence — Rollup กลืน @supabase/supabase-js เข้ามาทั้งก้อน
          // เพราะ supabase-service.ts ถูก static import จาก AIContext ซึ่งเป็น
          // provider หลักใน App.tsx → chunk นี้ถูกโหลดทุกหน้ารวมหน้าแรก
          // (ดู F-02 ใน docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md)
          // การแก้ต้องตัด static import chain ก่อน = งานของ Track C Phase 1
          if (id.includes('/src/lib/intelligence')) return 'chunk-intelligence';

          if (
            id.includes('/src/services/DecisionService') ||
            id.includes('/src/services/DecisionLearningService') ||
            id.includes('/src/services/FollowUpScheduler')
          ) return 'decision-services';
        },
      },
    },
  },
})
