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
    // Phase G: Code splitting optimization
    rollupOptions: {
      output: {
        // Split decision components into separate chunk
        manualChunks: {
          'decision-components': [
            './src/components/decision/DecisionStats.tsx',
            './src/components/decision/DecisionInsights.tsx',
            './src/components/decision/DecisionTimeline.tsx',
            './src/components/decision/TwinConfidenceIndicator.tsx',
          ],
          // Split services into separate chunk
          'decision-services': [
            './src/services/DecisionService.ts',
            './src/services/DecisionLearningService.ts',
            './src/services/FollowUpScheduler.ts',
          ],
        },
      },
    },
  },
})