/**
 * Test User Fixtures — Phase B Integration Testing
 *
 * Provides:
 * - Test user credentials (for staging/testing)
 * - Test user with completed onboarding
 * - Test Twin (for decision logging, uploads)
 * - Authenticated session utilities
 */

export const TEST_USER = {
  email: 'test-phase-b@selfprint.one',
  password: 'Test@PhaseB123!',
  userId: 'test-user-phase-b-001',
  name: 'Test User Phase B',
};

export const TEST_TWIN = {
  id: 'test-twin-001',
  name: 'Digital Twin (Test)',
  status: 'active',
  createdAt: new Date().toISOString(),
};

export const TEST_FINGERPRINT = {
  captureDate: new Date().toISOString(),
  imageHash: 'test-fingerprint-hash-001',
  dimensions: { width: 640, height: 480 },
};

/**
 * Test user lifecycle stages (for testing different journey paths)
 */
export const TEST_USER_STAGES = {
  // Stage 1: Email verified, awaiting onboarding
  emailVerified: {
    ...TEST_USER,
    stage: 'email_verified',
    onboardingStart: new Date().toISOString(),
    onboardingComplete: null,
  },

  // Stage 2: Onboarding in progress (voice capture)
  onboardingVoice: {
    ...TEST_USER,
    stage: 'onboarding_voice',
    voiceRecorded: true,
    voiceAnalysis: { confidence: 0.95, traits: ['assertive', 'analytical'] },
  },

  // Stage 3: Onboarding complete, Twin created
  onboardingComplete: {
    ...TEST_USER,
    stage: 'onboarding_complete',
    twinId: TEST_TWIN.id,
    onboardingComplete: new Date().toISOString(),
    siceAnalysis: {
      complete: true,
      timestamp: new Date().toISOString(),
      dimensions: {
        selfAwareness: 0.85,
        impulseControl: 0.72,
        competence: 0.91,
        empathy: 0.78,
      },
    },
  },

  // Stage 4: Active user with decisions logged
  withDecisions: {
    ...TEST_USER,
    stage: 'active',
    twinId: TEST_TWIN.id,
    decisionsLogged: 5,
    lastDecisionDate: new Date().toISOString(),
  },

  // Stage 5: With profile picture uploaded
  withProfilePicture: {
    ...TEST_USER,
    stage: 'active',
    twinId: TEST_TWIN.id,
    profilePictureUrl: '/test-uploads/profile-picture.jpg',
    profilePictureUploadDate: new Date().toISOString(),
  },
};

/**
 * Test credentials for different user personas
 */
export const TEST_USERS = {
  techBuddy: { email: 'tech-buddy@selfprint.one', password: 'Test@TechBuddy123!' },
  mindfulLeader: { email: 'mindful-leader@selfprint.one', password: 'Test@Leader123!' },
  creative: { email: 'creative@selfprint.one', password: 'Test@Creative123!' },
};

/**
 * Test assertions for Phase B
 */
export const TEST_ASSERTIONS = {
  twin: {
    created: 'Twin successfully created',
    analyzed: 'Twin analysis complete (SICE)',
    visualized: '12 worlds rendering',
  },
  decision: {
    logged: 'Decision logged successfully',
    retrieved: 'Decision retrieved from DB',
    analyzed: 'Decision analyzed by Twin',
  },
  upload: {
    selected: 'Profile picture selected',
    uploaded: 'Profile picture uploaded to storage',
    verified: 'Profile picture visible in UI',
  },
  world: {
    rendered: 'World visualization rendered',
    interactive: 'World interactive (scroll/hover)',
    insights: 'World insights displayed',
  },
};
