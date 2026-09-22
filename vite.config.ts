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
        // CHUNK-GROUPS-001 (9 ก.ย. 2026): replaced the `manualChunks` function
        // with Rolldown's native `codeSplitting.groups`.
        //
        // WHY: Vite 8 builds on Rolldown, and its `manualChunks` emulation is
        // advisory only in one important case — proven by the 9 ก.ย. debug
        // build: the function returned 'chunk-supabase-client' for
        // src/lib/supabase/client.ts (logged it), yet Rolldown still placed
        // the module in chunk-intelligence. Result: the ENTRY statically
        // imported chunk-intelligence (87 KiB gz) for `supabase` +
        // `getAuthHeaders`, react/jsx-runtime got co-located into
        // vendor-markdown (35 KiB), and the __vitePreload helper landed in
        // decision-services — so /th/ downloaded ~108 KiB of "unused
        // JavaScript" (Lighthouse 9 ก.ย.) before the hero could paint.
        // `codeSplitting.groups` with explicit priorities is the documented,
        // deterministic mechanism (manualChunks/advancedChunks are deprecated).
        //
        // includeDependenciesRecursively:false keeps a group to exactly the
        // modules its `test` matches — no silent absorption of shared deps.
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            // Vite's dynamic-import preload helper (virtual module) — keep it
            // out of feature chunks so the entry never pulls one of them.
            {
              name: 'vite-preload',
              test: /vite[\\/].*preload|preload[\\/]helper/,
              priority: 120,
            },
            // The supabase client pair — highest src priority so
            // chunk-intelligence can never swallow client.ts again
            // (SUPABASE-CLNT-001 history: entry → 345 kB intelligence chunk).
            {
              name: 'chunk-supabase-client',
              test: /[\\/]src[\\/](lib[\\/]supabase[\\/]|services[\\/]supabase-service\.ts)/,
              priority: 110,
            },
            // LAZYSPLIT-001 (9 ก.ย. 2026): client-lazy.ts + client-registry.ts
            // must NOT share a chunk with client.ts/supabase-service.ts. The
            // entry imports getSupabaseClient() from client-lazy — if the two
            // lived in the same chunk, that import would statically drag
            // client.ts AND its `createClient` SDK import → vendor-supabase —
            // back into the entry closure, undoing the whole POSITIVE LAZY
            // refactor. Higher priority than chunk-supabase-client so they
            // split out of it.
            {
              name: 'chunk-supabase-lazy',
              test: /[\\/]src[\\/]lib[\\/]supabase[\\/](client-lazy|client-registry)\.ts/,
              priority: 115,
            },
            // 1. Supabase auth + realtime client
            {
              name: 'vendor-supabase',
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              priority: 105,
            },
            // 2. React core — react + react-dom + scheduler must stay together
            {
              name: 'vendor-react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/,
              priority: 100,
            },
            // 4. Routing — react-router-dom + @remix-run/*
            {
              name: 'vendor-router',
              test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/,
              priority: 100,
            },
            // 5. Data fetching — @tanstack/react-query
            {
              name: 'vendor-query',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              priority: 100,
            },
            // 6. State management — zustand
            {
              name: 'vendor-state',
              test: /[\\/]node_modules[\\/]zustand[\\/]/,
              priority: 100,
            },
            // 8. SEO — react-helmet-async
            {
              name: 'vendor-helmet',
              test: /[\\/]node_modules[\\/](react-helmet-async|invariant)[\\/]/,
              priority: 100,
            },
            // 8.5. Markdown rendering stack (react-markdown + its full remark/
            // micromark/unified/mdast/hast/unist/vfile dependency tree — 59
            // packages verified 8 ก.ย. 2026 against package-lock.json). Only
            // consumer is BlogArticle.tsx (lazy route) — it must never sit on
            // the landing critical path.
            // VENDORMD-001 RE-STATED (9 ก.ย. 2026): the alternation MUST stay
            // prefix-matching — no trailing separator. `micromark`,
            // `mdast-util-`, `unist-util-`, `hast-util-`, `vfile`, `rehype-`
            // are prefixes of real package names (micromark-util-chunked,
            // mdast-util-to-hast, unist-util-position, vfile-message, …). The
            // first groups port dropped `[\\/]` to the end of the pattern by
            // mistake and all 30+ prefix packages fell through to vendor-misc,
            // which react-helmet-async's deps then dragged into the ENTRY's
            // static closure again — the exact regression this split exists to
            // prevent. Verified against the 9 ก.ย. build maps.
            {
              name: 'vendor-markdown',
              test: /[\\/]node_modules[\\/](react-markdown|remark-parse|remark-rehype|rehype-|micromark|mdast-util-|unist-util-|hast-util-|unified|vfile|bail|trough|property-information|space-separated-tokens|comma-separated-tokens|zwitch|ccount|stringify-entities|character-entities|decode-named-character-reference|devlop|is-plain-obj|longest-streak|estree-util-is-identifier-name|trim-lines)/,
              priority: 95,
            },
            // Personality intelligence engines (dashboard/brief/story widgets)
            {
              name: 'chunk-intelligence',
              test: /[\\/]src[\\/]lib[\\/]intelligence[\\/]/,
              priority: 90,
            },
            {
              name: 'decision-services',
              test: /[\\/]src[\\/]services[\\/](DecisionService|DecisionLearningService|FollowUpScheduler)\.ts/,
              priority: 90,
            },
            // 9. All remaining node_modules → one shared vendor-misc chunk
            //    (lodash, date-fns, tiny utilities, etc.)
            {
              name: 'vendor-misc',
              test: /[\\/]node_modules[\\/]/,
              priority: 50,
            },
          ],
        },
      },
    },
  },
})
