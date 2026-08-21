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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split decision components into separate chunk
          if (
            id.includes('/src/components/decision/DecisionStats') ||
            id.includes('/src/components/decision/DecisionInsights') ||
            id.includes('/src/components/decision/DecisionTimeline') ||
            id.includes('/src/components/decision/TwinConfidenceIndicator')
          ) {
            return 'decision-components'
          }
          
          // Split services into separate chunk
          if (
            id.includes('/src/services/DecisionService') ||
            id.includes('/src/services/DecisionLearningService') ||
            id.includes('/src/services/FollowUpScheduler')
          ) {
            return 'decision-services'
          }
        },
      },
    },
  },
})
