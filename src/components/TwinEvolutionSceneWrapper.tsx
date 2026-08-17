import React, { useEffect, useState } from 'react';
import { useEvolution } from '@/context/EvolutionContext';
import { usePopup } from '@/context/PopupContext';
import { createMilestonePopup } from '@/services/popupService';
import TwinEvolutionScene from './TwinEvolutionScene';

/**
 * Wrapper for Twin Evolution Scene
 * § 30: Triggers celebration when user unlocks Twin Evolution
 * (typically at 30 reflections)
 *
 * Integration points:
 * - Listens to EvolutionContext
 * - Shows celebration scene when twinEvolution unlocks
 * - Shows milestone popup after animation completes
 * - Replays via milestone tracking
 */

export const TwinEvolutionSceneWrapper: React.FC = () => {
  const { state, isUnlocked } = useEvolution();
  const { showPopup } = usePopup();
  const [showScene, setShowScene] = useState(false);
  const [lastTriggeredAt, setLastTriggeredAt] = useState<string | null>(null);

  // Trigger scene when twinEvolution first unlocks
  useEffect(() => {
    // Check if just unlocked (not previously shown)
    if (isUnlocked('twin-evolution') && state.lastEvolutionTriggeredAt) {
      // Only show once per unlock
      if (lastTriggeredAt !== state.lastEvolutionTriggeredAt) {
        setLastTriggeredAt(state.lastEvolutionTriggeredAt);
        setShowScene(true);
      }
    }
  }, [state.twinEvolution, state.lastEvolutionTriggeredAt, isUnlocked, lastTriggeredAt]);

  const handleSceneComplete = () => {
    setShowScene(false);

    // Show milestone popup after scene completes
    const popup = createMilestonePopup(
      'twin-evolution-30',
      'Twin Evolution',
      `After ${state.reflectionCount} reflections, your Twin has evolved into something more insightful and aware.`
    );

    showPopup(popup);
  };

  return (
    <TwinEvolutionScene
      trigger={showScene ? state.lastEvolutionTriggeredAt : undefined}
      onComplete={handleSceneComplete}
      message="✨ Twin Evolution Unlocked! ✨"
      autoDismiss={5000}
    />
  );
};

export default TwinEvolutionSceneWrapper;
