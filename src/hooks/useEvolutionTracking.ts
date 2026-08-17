import { useEvolution } from '@/context/EvolutionContext';
import { useContextualPopup } from './useContextualPopup';

/**
 * Hook for Twin Evolution Tracking
 * § 30: Integration with reflection/chat system
 *
 * Usage in Chat/Reflection components:
 * ```tsx
 * function ChatComponent() {
 *   const { recordReflectionSession } = useEvolutionTracking();
 *
 *   async function handleSubmitReflection(text: string) {
 *     // Process reflection...
 *     await submitReflection(text);
 *
 *     // Record for evolution tracking
 *     recordReflectionSession();
 *   }
 * }
 * ```
 */

export function useEvolutionTracking() {
  const { state, recordReflection, isUnlocked } = useEvolution();
  const { showMilestone, showDiscovery } = useContextualPopup();

  /**
   * Call this after user completes a reflection
   * Auto-shows milestone popups at key thresholds
   */
  const recordReflectionSession = () => {
    // Record the reflection
    recordReflection();

    // Check for milestone unlocks (these happen in recordReflection)
    const newCount = state.reflectionCount + 1; // +1 because recordReflection increments

    // Milestone 1: First Reflection (Twin Awakening)
    if (newCount === 1) {
      showMilestone(
        'first-reflection',
        'First Reflection',
        'You completed your first reflection with your Twin.'
      );
    }

    // Milestone 2: 10 Reflections (Pattern Finder unlock)
    if (newCount === 10) {
      showMilestone(
        'pattern-finder-10',
        'Pattern Finder',
        'After 10 reflections, patterns are starting to emerge.'
      );

      // Suggest pattern analysis
      setTimeout(() => {
        showDiscovery('ANALYSIS');
      }, 1000);
    }

    // Milestone 3: 30 Reflections (Twin Evolution Scene)
    if (newCount === 30) {
      // Scene will auto-trigger from EvolutionContext
      console.log('[Evolution] 🎬 30 reflections reached - Evolution Scene unlocking...');
    }

    // Optional: More milestones
    if (newCount === 50) {
      showMilestone(
        'journey-explorer-50',
        'Journey Explorer',
        'Your self-discovery journey is deepening with each reflection.'
      );
    }

    if (newCount === 100) {
      showMilestone(
        'deep-thinker-100',
        'Deep Thinker',
        'After 100 reflections, you are now a truly deep thinker.'
      );
    }
  };

  /**
   * Get reflection progress for display
   */
  const getProgressInfo = () => {
    const count = state.reflectionCount;

    if (count === 0) {
      return {
        stage: 'Just Getting Started',
        progress: 0,
        nextMilestone: 1,
        nextMilestoneLabel: 'First Reflection',
      };
    }

    if (count < 10) {
      return {
        stage: 'Building Awareness',
        progress: Math.round((count / 10) * 100),
        nextMilestone: 10,
        nextMilestoneLabel: 'Pattern Finder',
      };
    }

    if (count < 30) {
      return {
        stage: 'Finding Patterns',
        progress: Math.round(((count - 10) / 20) * 100),
        nextMilestone: 30,
        nextMilestoneLabel: 'Twin Evolution',
      };
    }

    if (count < 50) {
      return {
        stage: 'Twin Evolution Unlocked',
        progress: Math.round(((count - 30) / 20) * 100),
        nextMilestone: 50,
        nextMilestoneLabel: 'Journey Explorer',
      };
    }

    return {
      stage: 'Master Reflector',
      progress: 100,
      nextMilestone: count,
      nextMilestoneLabel: 'Beyond Milestones',
    };
  };

  return {
    reflectionCount: state.reflectionCount,
    recordReflectionSession,
    getProgressInfo,
    isEvolutionUnlocked: isUnlocked('twin-evolution'),
  };
}
