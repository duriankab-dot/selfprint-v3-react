/**
 * CoreAwakeningService.integration.ts
 * Integration test / verification flow for Twin awakening ceremony
 *
 * Usage: This shows the complete flow from analysis completion to Twin birth
 */

import {
  checkReadyForAwakening,
  startAwakening,
  initializeTwin,
  completeCoreAwakening,
  notifyAwakening,
} from '../CoreAwakeningService';

/**
 * SCENARIO: User completes Full Analysis and wants to awaken Twin
 *
 * Steps:
 * 1. User finishes Full Analysis questionnaire
 * 2. System marks full_analysis_completed = true in user_profiles
 * 3. User can now proceed to Twin Awakening ceremony
 * 4. System generates personal intelligence via SICE orchestration
 * 5. User names their Twin
 * 6. Twin is created in database with baseline stats
 * 7. Ceremony completes and Twin is ready for interaction
 */

export async function twinAwakeningCeremony(
  userId: string,
  twinName: string
): Promise<boolean> {
  try {
    console.log('🌟 Starting Twin Awakening Ceremony...\n');

    // STEP 1: Verify user is ready for awakening
    console.log('📋 Step 1: Checking readiness...');
    const isReady = await checkReadyForAwakening(userId);

    if (!isReady) {
      console.error(
        '❌ User not ready for awakening. Reasons:\n' +
        '   - Full Analysis not completed, or\n' +
        '   - Twin already exists, or\n' +
        '   - Database error'
      );
      return false;
    }
    console.log('✅ User ready for awakening!\n');

    // STEP 2: Start awakening process (SICE orchestration)
    console.log('⚙️ Step 2: Initiating SICE orchestration...');
    const awakeningResult = await startAwakening(userId);

    if (!awakeningResult.success) {
      console.error('❌ SICE orchestration failed:', awakeningResult.message);
      return false;
    }
    console.log(
      '✅ Personal intelligence generated!',
      awakeningResult.message,
      '\n'
    );

    // STEP 3: Initialize Twin with name and DB record
    console.log(`👶 Step 3: Initializing Twin "${twinName}"...`);
    const initResult = await initializeTwin(userId, twinName);

    if (!initResult.success) {
      console.error('❌ Twin initialization failed:', initResult.message);
      return false;
    }
    console.log(
      '✅ Twin created in database!',
      `TwinID: ${initResult.twinId}\n`
    );

    // STEP 4: Complete the ceremony
    console.log('🎊 Step 4: Completing awakening ceremony...');
    const completeResult = await completeCoreAwakening(userId, twinName);

    if (!completeResult.success) {
      console.error('❌ Ceremony completion failed:', completeResult.message);
      return false;
    }
    console.log('✅ Ceremony complete!\n', completeResult.message, '\n');

    // STEP 5: Send notifications
    console.log('📢 Step 5: Notifying user...');
    await notifyAwakening(userId, twinName);
    console.log('✅ Notifications sent!\n');

    console.log('🎉 🎉 🎉 TWIN AWAKENING COMPLETE! 🎉 🎉 🎉\n');
    console.log(`${twinName} is now alive and ready to grow with you.`);

    return true;
  } catch (error) {
    console.error('💥 Ceremony failed with error:', error);
    return false;
  }
}

/**
 * Test scenario verification
 */
export const testScenarios = {
  /**
   * Scenario A: Happy path - User completes analysis and awakens Twin
   */
  happyPath: async (userId: string, twinName: string) => {
    console.log('\n=== TEST SCENARIO A: Happy Path ===\n');
    return await twinAwakeningCeremony(userId, twinName);
  },

  /**
   * Scenario B: User tries to awaken without completing analysis
   */
  notReadyPath: async (userId: string) => {
    console.log('\n=== TEST SCENARIO B: User Not Ready ===\n');
    const isReady = await checkReadyForAwakening(userId);
    console.log(
      `User ${userId} ready: ${isReady} (expected: false)\n`
    );
    return !isReady; // Pass if NOT ready
  },

  /**
   * Scenario C: User tries to awaken second Twin (should fail)
   */
  twinAlreadyExists: async (userId: string) => {
    console.log('\n=== TEST SCENARIO C: Twin Already Exists ===\n');
    const isReady = await checkReadyForAwakening(userId);
    console.log(
      `User ${userId} ready for second awakening: ${isReady} (expected: false)\n`
    );
    return !isReady; // Pass if NOT ready (Twin already exists)
  },
};

/**
 * Usage example:
 *
 * // In your component or integration test:
 * const userId = 'user-123';
 * const twinName = 'Nova';
 *
 * const success = await twinAwakeningCeremony(userId, twinName);
 * if (success) {
 *   console.log(`Welcome to your Twin: ${twinName}!`);
 *   // Navigate to /chat/twin
 * }
 */
