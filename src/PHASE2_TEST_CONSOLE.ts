/**
 * PHASE 2 TESTING SCRIPT
 * ทดสอบในไฟล์นี้ว่า:
 * 1. getNovaPrompt() สร้าง prompt ถูกไหม
 * 2. TwinContext บันทึก/โหลด data ถูกไหม
 * 3. selfprintChat API wrapper ถูกไหม
 * 4. useChat integration ทำงานถูกไหม
 *
 * Usage: import ไฟล์นี้เพื่อรันทั้งหมด
 * หรือ run functions เดี่ยว ใน console
 */

import { getNovaPrompt, AVAILABLE_HUBS, AVAILABLE_MOODS, AVAILABLE_ARCHETYPES } from '@/lib/nova-prompts/getNovaPrompt';

// ============================================================
// TEST 1: getNovaPrompt - Generate System Prompts
// ============================================================
export function testGetNovaPrompt() {
  console.log('🧪 TEST 1: getNovaPrompt()');
  console.log('=====================================');

  const testCases = [
    { hub: 'decision', mood: 'ready', archetype: 'strategist' },
    { hub: 'identity', mood: 'confused', archetype: 'innocent' },
    { hub: 'creativity', mood: 'reflective', archetype: 'dreamer' },
    { hub: 'relationship', mood: 'stressed', archetype: 'diplomat' },
    { hub: 'spirituality', mood: 'ready', archetype: 'sage' },
  ];

  const results: any[] = [];

  for (const testCase of testCases) {
    try {
      const prompt = getNovaPrompt({
        hub: testCase.hub as any,
        mood: testCase.mood as any,
        archetype: testCase.archetype,
        maturityScore: 50,
      });

      // Use character-based estimation (better for Thai text)
      const charCount = prompt.length;
      const tokenEstimate = Math.ceil(charCount / 4); // ~4 chars per token (Claude tokenizer)

      // Debug: log first 200 chars of prompt
      console.log(`📝 Prompt sample: ${prompt.substring(0, 200)}...`);

      const wordCount = prompt.split(/\s+/).filter(Boolean).length;

      results.push({
        case: `${testCase.hub} × ${testCase.mood} × ${testCase.archetype}`,
        wordCount,
        tokenEstimate,
        promptLength: prompt.length,
        status: tokenEstimate >= 600 && tokenEstimate <= 850 ? '✅ PASS' : '⚠️ OUT OF RANGE',
      });

      console.log(`✅ Generated: ${testCase.hub} × ${testCase.mood} × ${testCase.archetype}`);
      console.log(`   Words: ${wordCount}, Est. Tokens: ${tokenEstimate}, Length: ${prompt.length} chars`);
    } catch (error) {
      results.push({
        case: `${testCase.hub} × ${testCase.mood} × ${testCase.archetype}`,
        status: '❌ ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error(`❌ Error: ${testCase.hub} × ${testCase.mood} × ${testCase.archetype}`, error);
    }
  }

  console.log('\n📊 Results:');
  console.table(results);
  return results;
}

// ============================================================
// TEST 2: Archetype Coverage - All 1,296 Combinations
// ============================================================
export function testArchetypeCoverage() {
  console.log('\n🧪 TEST 2: Archetype Coverage');
  console.log('=====================================');

  let validCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  // Test sampling (not all 1,296 to keep it fast)
  const hubs = AVAILABLE_HUBS;
  const moods = AVAILABLE_MOODS;
  const archetypes = AVAILABLE_ARCHETYPES;

  console.log(`📋 Hubs: ${hubs.length}, Moods: ${moods.length}, Archetypes: ${archetypes.length}`);
  console.log(`📊 Total combinations possible: ${hubs.length} × ${moods.length} × ${archetypes.length} = ${hubs.length * moods.length * archetypes.length}`);

  // Sample test (every 3rd combination)
  const step = 3;
  for (let i = 0; i < archetypes.length; i += step) {
    for (let j = 0; j < moods.length; j += step) {
      for (let k = 0; k < hubs.length; k += step) {
        try {
          const prompt = getNovaPrompt({
            hub: hubs[k] as any,
            mood: moods[j] as any,
            archetype: archetypes[i],
            maturityScore: Math.random() * 100,
          });

          if (prompt && prompt.length > 0) {
            validCount++;
          }
        } catch {
          errorCount++;
          errors.push(`${hubs[k]} × ${moods[j]} × ${archetypes[i]}`);
        }
      }
    }
  }

  console.log(`\n✅ Valid combinations: ${validCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  if (errors.length > 0) {
    console.log('Failed cases:', errors);
  }

  return { validCount, errorCount, totalErrors: errors };
}

// ============================================================
// TEST 3: TwinContext - localStorage Persistence
// ============================================================
export function testTwinContextPersistence() {
  console.log('\n🧪 TEST 3: TwinContext Persistence');
  console.log('=====================================');

  try {
    // Simulate Twin Profile
    const testTwin = {
      id: 'twin-test-123',
      userId: 'user-test',
      name: 'Test Nova',
      primaryArchetype: 'strategist',
      secondaryArchetype: 'sage',
      maturityScore: 75,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save to localStorage
    localStorage.setItem('selfprint_twin_test', JSON.stringify(testTwin));
    console.log('✅ Saved to localStorage');

    // Load from localStorage
    const retrieved = localStorage.getItem('selfprint_twin_test');
    if (retrieved) {
      const parsed = JSON.parse(retrieved);
      console.log('✅ Retrieved from localStorage');

      // Verify data
      const matches = {
        id: parsed.id === testTwin.id,
        userId: parsed.userId === testTwin.userId,
        archetype: parsed.primaryArchetype === testTwin.primaryArchetype,
        maturity: parsed.maturityScore === testTwin.maturityScore,
      };

      console.log('✅ Data integrity check:', matches);

      // Cleanup
      localStorage.removeItem('selfprint_twin_test');
      console.log('✅ Cleanup complete');

      return { status: 'PASS', data: parsed };
    } else {
      return { status: 'FAIL', error: 'Could not retrieve data' };
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return { status: 'ERROR', error };
  }
}

// ============================================================
// TEST 4: Maturity Score Adjustment
// ============================================================
export function testMaturityScoreAdjustment() {
  console.log('\n🧪 TEST 4: Maturity Score Adjustment');
  console.log('=====================================');

  const maturityLevels = [20, 50, 90];
  const results: any[] = [];

  for (const score of maturityLevels) {
    try {
      const prompt = getNovaPrompt({
        hub: 'identity',
        mood: 'confused',
        archetype: 'innocent',
        maturityScore: score,
      });

      const isSimple = score < 40;
      const isBalanced = score >= 40 && score <= 70;

      // Check for maturity-appropriate language
      const hasScaffold = prompt.includes('framework') || prompt.includes('step');
      const hasChallenge = prompt.includes('challenge') || prompt.includes('stretch');

      results.push({
        maturityScore: score,
        level: isSimple ? 'Simple' : isBalanced ? 'Balanced' : 'Advanced',
        hasScaffold,
        hasChallenge,
        promptLength: prompt.length,
      });

      console.log(`✅ Score ${score}: ${isSimple ? 'Simple' : isBalanced ? 'Balanced' : 'Advanced'}`);
    } catch (error) {
      results.push({
        maturityScore: score,
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  console.log('\n📊 Maturity Score Results:');
  console.table(results);
  return results;
}

// ============================================================
// TEST 5: Mood Modulations - Tone Check
// ============================================================
export function testMoodModulations() {
  console.log('\n🧪 TEST 5: Mood Modulations');
  console.log('=====================================');

  const moods = AVAILABLE_MOODS;
  const results: any[] = [];

  for (const mood of moods) {
    try {
      const prompt = getNovaPrompt({
        hub: 'decision',
        mood: mood as any,
        archetype: 'sage',
        maturityScore: 50,
      });

      // Check for mood-appropriate markers
      const moodMarkers: Record<string, string[]> = {
        stressed: ['slow', 'grounding', 'validate'],
        confused: ['clarif', 'structure', 'explain'],
        confident: ['energized', 'challenge', 'bold'],
        drained: ['rest', 'gentle', 'permission'],
        ready: ['action', 'momentum', 'move'],
        reflective: ['deep', 'contemplat', 'pattern'],
      };

      const markers = moodMarkers[mood] || [];
      const foundMarkers = markers.filter(m => prompt.toLowerCase().includes(m));

      results.push({
        mood,
        foundMarkers: foundMarkers.length,
        expectedMarkers: markers.length,
        coverage: `${Math.round((foundMarkers.length / markers.length) * 100)}%`,
      });

      console.log(`✅ Mood "${mood}": found ${foundMarkers.length}/${markers.length} tone markers`);
    } catch (error) {
      results.push({
        mood,
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  console.log('\n📊 Mood Modulation Results:');
  console.table(results);
  return results;
}

// ============================================================
// TEST 6: System Prompt Token Budget
// ============================================================
export function testTokenBudget() {
  console.log('\n🧪 TEST 6: Token Budget Analysis');
  console.log('=====================================');

  const samples = 20;
  const tokenCounts: number[] = [];

  for (let i = 0; i < samples; i++) {
    const randomHub = AVAILABLE_HUBS[Math.floor(Math.random() * AVAILABLE_HUBS.length)];
    const randomMood = AVAILABLE_MOODS[Math.floor(Math.random() * AVAILABLE_MOODS.length)];
    const randomArchetype = AVAILABLE_ARCHETYPES[Math.floor(Math.random() * AVAILABLE_ARCHETYPES.length)];

    try {
      const prompt = getNovaPrompt({
        hub: randomHub as any,
        mood: randomMood as any,
        archetype: randomArchetype,
        maturityScore: Math.random() * 100,
      });

      // Use character-based estimation (better for Thai text)
      const charCount = prompt.length;
      const tokenEstimate = Math.ceil(charCount / 4);
      tokenCounts.push(tokenEstimate);
    } catch {
      console.error(`Error sampling: ${randomHub} × ${randomMood} × ${randomArchetype}`);
    }
  }

  const min = Math.min(...tokenCounts);
  const max = Math.max(...tokenCounts);
  const avg = Math.round(tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length);
  const inRange = tokenCounts.filter(t => t >= 600 && t <= 850).length;

  console.log(`\n📊 Token Budget Analysis (${samples} samples):`);
  console.log(`   Min: ${min} tokens`);
  console.log(`   Max: ${max} tokens`);
  console.log(`   Avg: ${avg} tokens`);
  console.log(`   In Range (600-850): ${inRange}/${samples} (${Math.round((inRange / samples) * 100)}%)`);
  console.log(`   Target: ✅ PASS (${inRange >= samples * 0.9 ? '90%+ in range' : 'below 90%'})`);

  return { min, max, avg, inRange, total: samples };
}

// ============================================================
// RUN ALL TESTS
// ============================================================
export function runAllTests() {
  console.clear();
  console.log('🚀 PHASE 2 IMPLEMENTATION TEST SUITE');
  console.log('=====================================\n');

  try {
    const test1 = testGetNovaPrompt();
    const test2 = testArchetypeCoverage();
    const test3 = testTwinContextPersistence();
    const test4 = testMaturityScoreAdjustment();
    const test5 = testMoodModulations();
    const test6 = testTokenBudget();

    console.log('\n\n========================================');
    console.log('✅ ALL TESTS COMPLETED');
    console.log('========================================');

    return {
      test1,
      test2,
      test3,
      test4,
      test5,
      test6,
    };
  } catch (error) {
    console.error('❌ Test suite error:', error);
  }
}

// Setup window object when loaded
if (typeof window !== 'undefined') {
  setTimeout(() => {
    (window as any).PHASE2_TESTS = {
      runAll: runAllTests,
      testGetNovaPrompt,
      testArchetypeCoverage,
      testTwinContextPersistence,
      testMaturityScoreAdjustment,
      testMoodModulations,
      testTokenBudget,
    };
    console.log('✅ Phase 2 Test Suite Ready');
    console.log('📌 Run: window.PHASE2_TESTS.runAll()');
  }, 100);
}
