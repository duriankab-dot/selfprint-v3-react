/**
 * Mock API responses for E2E testing
 * Frontend will use these instead of /api/intelligence, /api/push, etc.
 */

export async function mockIntelligence(body: {
  mood: string
  birthDate: string
  finetuneAnswers?: Record<string, string>
  question?: string
}) {
  // Return mock analysis response
  return {
    decisionStyle: 'Analytical',
    strengths: ['Leadership', 'Problem-solving', 'Communication'],
    insights: ['You are a natural strategist'],
    opportunities: ['Develop public speaking skills'],
    blindSpots: ['May overlook emotional impact of decisions'],
  }
}

export async function mockPush(body: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}) {
  // Return mock push subscription response
  return {
    success: true,
    subscriptionId: 'mock-' + Date.now(),
  }
}

export async function mockAuth(body: {
  email: string
  password: string
}) {
  // Return mock auth response
  return {
    user: {
      id: 'user-' + Math.random().toString(36).slice(2),
      email: body.email,
    },
    session: {
      access_token: 'mock-token-' + Math.random().toString(36).slice(2),
      token_type: 'bearer',
      expires_in: 3600,
    },
  }
}
