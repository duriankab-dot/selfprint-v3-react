/**
 * Popup Service
 * § 28: Contextual Popup Triggers
 *
 * Handles popup events for:
 * - Discovery: New feature suggestions
 * - Pattern: Pattern detection
 * - Milestone: Achievement unlocks
 * - Re-engagement: User return triggers
 */

import type { PopupData } from '@/context/PopupContext';

/**
 * Discovery Popup: Suggest related features
 *
 * @param featureId - ID of the feature to recommend
 * @param featureName - Display name of feature
 * @param description - What the feature does
 */
export function createDiscoveryPopup(
  featureId: string,
  featureName: string,
  description: string
): PopupData {
  return {
    id: `discovery-${featureId}`,
    type: 'discovery',
    title: `✨ Discover: ${featureName}`,
    description,
    icon: '🔍',
    action: {
      label: 'Explore',
      onClick: () => {
        // Navigate or trigger feature
        console.log(`[Popup] Exploring ${featureId}`);
      },
    },
    duration: 5000,
    dismissible: true,
  };
}

/**
 * Pattern Popup: New pattern detected
 *
 * @param patternType - Type of pattern (e.g., "emotional_cycle", "productivity_peak")
 * @param patternName - Display name
 * @param insight - The pattern insight
 */
export function createPatternPopup(
  patternType: string,
  patternName: string,
  insight: string
): PopupData {
  return {
    id: `pattern-${patternType}`,
    type: 'pattern',
    title: `📊 Pattern Found: ${patternName}`,
    description: insight,
    icon: '🎯',
    action: {
      label: 'Learn More',
      onClick: () => {
        console.log(`[Popup] Viewing pattern: ${patternType}`);
      },
    },
    duration: 6000,
    dismissible: true,
  };
}

/**
 * Milestone Popup: Achievement unlocked
 *
 * @param milestoneId - Unique achievement ID
 * @param milestoneName - Achievement name
 * @param description - What was achieved
 */
export function createMilestonePopup(
  milestoneId: string,
  milestoneName: string,
  description: string
): PopupData {
  return {
    id: `milestone-${milestoneId}`,
    type: 'milestone',
    title: `🏆 Achievement Unlocked!`,
    description: `${milestoneName}: ${description}`,
    icon: '⭐',
    action: {
      label: 'View Badge',
      onClick: () => {
        console.log(`[Popup] Viewing badge: ${milestoneId}`);
      },
    },
    duration: 7000, // Longer for achievements
    dismissible: true,
  };
}

/**
 * Re-engagement Popup: Welcome back after gap
 *
 * @param daysSinceLastVisit - How many days since last visit
 */
export function createReEngagementPopup(daysSinceLastVisit: number): PopupData {
  const greeting =
    daysSinceLastVisit > 30
      ? `We've missed you! It's been ${Math.round(daysSinceLastVisit / 30)} months.`
      : `Welcome back! It's been ${daysSinceLastVisit} days.`;

  return {
    id: 're-engagement-main',
    type: 're-engagement',
    title: '🎉 Welcome Back!',
    description: greeting + ' Your Twin has some insights waiting for you.',
    icon: '👋',
    action: {
      label: 'See Insights',
      onClick: () => {
        console.log('[Popup] Showing re-engagement insights');
      },
    },
    duration: 8000,
    dismissible: true,
  };
}

/**
 * Helper: Check if user is returning (based on last visit)
 *
 * @param lastVisitTimestamp - ISO timestamp of last visit
 * @returns Days since last visit (null if first visit)
 */
export function checkReEngagement(lastVisitTimestamp: string | null): number | null {
  if (!lastVisitTimestamp) return null;

  const lastVisit = new Date(lastVisitTimestamp).getTime();
  const now = new Date().getTime();
  const daysSince = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));

  // Only trigger re-engagement after 3+ days away
  return daysSince >= 3 ? daysSince : null;
}

/**
 * Helper: Detect new pattern from Twin responses
 *
 * Example patterns:
 * - User explores same hub repeatedly
 * - User asks similar questions
 * - User's mood consistent in time range
 */
export function detectPatterns(
  recentMessages: Array<{ hub: string; timestamp: string; sentiment?: string }>
) {
  if (recentMessages.length < 5) return null;

  // Simple pattern: same hub visited 5+ times in last week
  const hubFrequency: Record<string, number> = {};

  recentMessages.forEach(msg => {
    hubFrequency[msg.hub] = (hubFrequency[msg.hub] || 0) + 1;
  });

  const topHub = Object.entries(hubFrequency).sort(([, a], [, b]) => b - a)[0];

  if (topHub && topHub[1] >= 5) {
    return {
      type: `focus-${topHub[0]}`,
      name: `Focus on ${topHub[0]}`,
      insight: `You've been exploring "${topHub[0]}" a lot lately. You might be ready for deeper insights.`,
    };
  }

  return null;
}

/**
 * Example Discovery Popups (built-in suggestions)
 */
export const DISCOVERY_POPUPS = {
  CHAT_TIPS: createDiscoveryPopup(
    'chat-tips',
    'Chat Mastery',
    'Ask your Twin about patterns in your choices or daily habits.'
  ),

  DAILY_BRIEF: createDiscoveryPopup(
    'daily-brief',
    'Daily Brief',
    'Start your day with a personalized 20-40 second summary from your Twin.'
  ),

  ANALYSIS: createDiscoveryPopup(
    'analysis',
    'Personal Analysis',
    'Discover deep insights about yourself through comprehensive analysis.'
  ),

  VOICE_TWIN: createDiscoveryPopup(
    'voice-twin',
    'Voice Twin',
    'Hear your Twin speak your insights aloud with adaptive ambience.'
  ),

  BADGES: createDiscoveryPopup(
    'badges',
    'Achievement Badges',
    'Unlock badges as you deepen your self-understanding journey.'
  ),
};

/**
 * Log popup metrics (for analytics)
 */
export function logPopupMetric(popupId: string, action: 'shown' | 'clicked' | 'dismissed') {
  const timestamp = new Date().toISOString();
  console.log(`[Popup Metric] ${popupId}: ${action} at ${timestamp}`);

  // In production, send to analytics
  // analytics.track('popup_interaction', { popupId, action, timestamp });
}
