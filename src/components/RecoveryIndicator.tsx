import { useLifecycleStore } from '@/store/lifecycleStore';
import './RecoveryIndicator.css';

/**
 * RecoveryIndicator — Display user's journey stage
 * Shows progress bar: [●●●●○○○○○○] Step 4 of 5: Twin Birth Ceremony
 */
export function RecoveryIndicator() {
  const status = useLifecycleStore((state) => state.status);

  // Map status to step number and label
  const stageMap = {
    ONBOARDING: { step: 1, total: 5, label: 'Onboarding' },
    ANALYSIS: { step: 2, total: 5, label: 'Analysis' },
    AWAKENING: { step: 3, total: 5, label: 'Core Awakening' },
    TWIN_ALIVE: { step: 4, total: 5, label: 'Twin Birth' },
    WORLD_ACTIVE: { step: 5, total: 5, label: 'World Active' },
  };

  const stage = stageMap[status] || stageMap.ONBOARDING;
  const filledCount = stage.step;
  const emptyCount = stage.total - stage.step;

  // Build progress indicator
  const filled = '●'.repeat(filledCount);
  const empty = '○'.repeat(emptyCount);
  const progressBar = `[${filled}${empty}]`;

  return (
    <div className="recovery-indicator">
      <div className="progress-container">
        <span className="progress-bar">{progressBar}</span>
        <span className="progress-text">
          Step {stage.step} of {stage.total}: {stage.label}
        </span>
      </div>
    </div>
  );
}

export default RecoveryIndicator;
