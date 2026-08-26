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
    environment: 'node',
    globals: true,
    setupFiles: [],
    testTimeout: 60000,
    singleFork: true,
    include: [
      '**/test/minimal.test.ts',
      '**/sice/__tests__/SICEEngines.test.ts',
      '**/lib/prompts/__tests__/promptBuilder.test.ts', // P0-F
      '**/lib/worlds/__tests__/worldsVerification.test.ts', // P0-G
      '**/lib/memory/__tests__/memoryLoop.test.ts',         // P0-I
      '**/lib/entry/__tests__/entryResolver.test.ts',       // Smart Entry (P0-SMART)
      '**/lib/visual/__tests__/VisualStateEngine.test.ts',  // Visual State Engine (P2-8)
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

