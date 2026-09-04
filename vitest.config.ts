import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': `${__dirname}/src`,
    },
  },
  test: {
    environment: 'jsdom',   // QA-01: มีเทสต์ .tsx ที่ต้อง render DOM
    globals: true,
    // QA-01 FIX: src/test/setup.ts มี global Supabase mock เต็มรูปแบบอยู่แล้ว
    // (เขียนไว้ตั้งแต่แรก 200+ บรรทัด) แต่ setupFiles เป็น [] ว่างเปล่า
    // → mock ไม่เคยถูกโหลด เทสต์จึงยิง network จริงไป Supabase production
    // ทุกครั้ง (เห็น EAI_AGAIN orxteu...supabase.co ใน stderr) แล้ว fail เงียบ ๆ
    setupFiles: ['./src/test/setup.ts'],
    // QA-01: ลดจาก 60s — เทสต์ที่ค้างควรพังเร็ว ๆ ไม่ใช่หน่วง suite ทั้งชุด
    testTimeout: 15000,
    singleFork: true,
    // QA-01 FIX (4 ก.ย. 2026): เดิม include เป็น allowlist แค่ 7 pattern
    // ทั้งที่ repo มีไฟล์เทสต์ 66 ไฟล์ → `npm test` รันแค่ 10% ของ suite
    // แล้วขึ้นเขียว ทุกเอกสารที่เขียนว่า "เทสต์ผ่านหมด" จึงไม่เคยจริง
    // เปิดครบทุกไฟล์ ไฟล์ไหนพังต้องแก้หรือลบ ไม่ใช่ซ่อนด้วย allowlist
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'e2e/**',        // Playwright ไม่ใช่ vitest
      'tests/e2e/**',
    ],
    env: {
      // Dummy credentials — prevents client.ts from throwing in test env
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key-for-mocking-only',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key-for-mocking-only',
    },
  },
})

