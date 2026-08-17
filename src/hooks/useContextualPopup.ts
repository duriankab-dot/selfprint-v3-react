import { usePopup } from '@/context/PopupContext';
import {
  createDiscoveryPopup,
  createPatternPopup,
  createMilestonePopup,
  createReEngagementPopup,
  checkReEngagement,
  DISCOVERY_POPUPS,
  logPopupMetric,
} from '@/services/popupService';

/**
 * Hook for easy popup triggering
 * § 28: Contextual Popup integration points
 *
 * Usage examples:
 * ```tsx
 * const { showDiscovery, showPattern, showMilestone } = useContextualPopup();
 *
 * // Show discovery popup
 * showDiscovery('chat-tips');
 *
 * // Show pattern popup
 * showPattern('emotional_cycle', 'Emotional Cycle', 'You have a 7-day emotional pattern...');
 *
 * // Show achievement
 * showMilestone('first-reflection', 'First Reflection', 'You completed your first reflection!');
 * ```
 */

export function useContextualPopup() {
  const { showPopup, hasShownPopup } = usePopup();

  /**
   * Show discovery popup (suggest feature)
   * @param featureId - ID of feature (e.g., 'chat-tips', 'daily-brief')
   */
  const showDiscovery = (featureId: keyof typeof DISCOVERY_POPUPS) => {
    const popup = DISCOVERY_POPUPS[featureId];

    if (hasShownPopup(popup.id)) {
      console.log(`[useContextualPopup] Discovery "${featureId}" already shown`);
      return;
    }

    showPopup(popup);
    logPopupMetric(popup.id, 'shown');
  };

  /**
   * Show pattern popup (pattern detected)
   * @param patternType - Unique pattern identifier
   * @param name - Display name
   * @param insight - The insight text
   */
  const showPattern = (patternType: string, name: string, insight: string) => {
    const popup = createPatternPopup(patternType, name, insight);

    if (hasShownPopup(popup.id)) {
      console.log(`[useContextualPopup] Pattern "${patternType}" already shown`);
      return;
    }

    showPopup(popup);
    logPopupMetric(popup.id, 'shown');
  };

  /**
   * Show milestone popup (achievement unlocked)
   * @param achievementId - Unique achievement ID
   * @param name - Achievement name
   * @param description - What was achieved
   */
  const showMilestone = (achievementId: string, name: string, description: string) => {
    const popup = createMilestonePopup(achievementId, name, description);

    if (hasShownPopup(popup.id)) {
      console.log(`[useContextualPopup] Milestone "${achievementId}" already shown`);
      return;
    }

    showPopup(popup);
    logPopupMetric(popup.id, 'shown');
  };

  /**
   * Check and show re-engagement popup if applicable
   * @param lastVisitTimestamp - ISO timestamp of last visit
   */
  const checkAndShowReEngagement = (lastVisitTimestamp: string | null) => {
    const daysSince = checkReEngagement(lastVisitTimestamp);

    if (daysSince !== null) {
      const popup = createReEngagementPopup(daysSince);

      if (!hasShownPopup(popup.id)) {
        showPopup(popup);
        logPopupMetric(popup.id, 'shown');
      }
    }
  };

  /**
   * Show custom discovery popup
   */
  const showCustomDiscovery = (featureName: string, description: string) => {
    const featureId = featureName.toLowerCase().replace(/\s+/g, '-');
    const popup = createDiscoveryPopup(featureId, featureName, description);

    showPopup(popup);
    logPopupMetric(popup.id, 'shown');
  };

  return {
    showDiscovery,
    showPattern,
    showMilestone,
    checkAndShowReEngagement,
    showCustomDiscovery,
  };
}
