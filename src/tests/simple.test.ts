/**
 * Simple smoke test to verify mock setup works
 */
import { describe, it, expect } from 'vitest'

describe('Supabase Mock', () => {
  it('should have Supabase client mocked', async () => {
    // Try to import the Supabase client
    const { supabase } = await import('@/lib/supabase/client')

    // Verify it's mocked (should have from() method)
    expect(supabase.from).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })

  it('should handle Supabase queries', async () => {
    const { supabase } = await import('@/lib/supabase/client')

    // Try a mock query
    const result = await supabase
      .from('twins')
      .select('*')
      .eq('user_id', 'test-user')
      .single()

    expect(result.data).toBeDefined()
    expect(result.error).toBeNull()
  })
})

describe('AIFeedbackLoop Mock', () => {
  it('should instantiate AIFeedbackLoop', async () => {
    const { AIFeedbackLoop } = await import('@/lib/intelligence/AIFeedbackLoop')

    const loop = new AIFeedbackLoop()
    expect(loop).toBeDefined()
    expect(typeof loop.recordFeedback).toBe('function')
  })

  it('should recordFeedback without hanging', async () => {
    const { AIFeedbackLoop } = await import('@/lib/intelligence/AIFeedbackLoop')

    const loop = new AIFeedbackLoop()

    // This should resolve immediately (mocked)
    const result = await loop.recordFeedback(
      'user-123',
      'insight-456',
      'very_true',
      'Good insight'
    )

    expect(result).toBeDefined()
  })
})

describe('Component Imports', () => {
  it('should import FeedbackWidget without errors', async () => {
    const module = await import('@/components/intelligence/FeedbackWidget')
    expect(module.default).toBeDefined()
  })

  it('should import worldRecommender without errors', async () => {
    const { recommendWorld } = await import('@/lib/worldRecommender')
    expect(typeof recommendWorld).toBe('function')
  })
})
