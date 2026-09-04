import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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

          // 7. Animation — framer-motion (if imported)
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion';

          // 8. SEO — react-helmet-async
          if (
            id.includes('node_modules/react-helmet-async') ||
            id.includes('node_modules/invariant')
          ) return 'vendor-helmet';

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
          if (id.includes('/src/lib/intelligence')) return 'chunk-intelligence';

          // Decision feature components (used only in /decisions route)
          if (
            id.includes('/src/components/decision/DecisionStats') ||
            id.includes('/src/components/decision/DecisionInsights') ||
            id.includes('/src/components/decision/DecisionTimeline') ||
            id.includes('/src/components/decision/TwinConfidenceIndicator')
          ) return 'decision-components';

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
