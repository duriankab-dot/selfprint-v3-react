/**
 * NotificationTemplates Service
 *
 * Pre-defined notification message templates
 * Supports:
 * - Variable interpolation (name, Twin name, metrics)
 * - Personalization (timezone, language)
 * - A/B testing variants
 * - Analytics tracking
 */

export interface NotificationTemplate {
  type: string;
  subject: string;
  message: string;
  cta?: string; // Call-to-action
  variants?: Array<{ variant: string; message: string }>;
}

// Template library
const TEMPLATES: Record<string, NotificationTemplate> = {
  // Daily check-in
  'daily-checkin-morning': {
    type: 'daily-checkin',
    subject: 'Good morning, {{userName}}!',
    message:
      '{{twinName}} is ready to listen today. Share what\'s on your mind — a decision, a feeling, or just a thought.',
    cta: 'Start chat',
    variants: [
      {
        variant: 'reflective',
        message:
          'Take a moment to reflect with {{twinName}}. What\'s one thing you\'re proud of today?',
      },
      {
        variant: 'curious',
        message:
          '{{twinName}} is curious about your day. What\'s the most interesting thing happening right now?',
      },
    ],
  },

  'daily-checkin-evening': {
    type: 'daily-checkin',
    subject: 'Evening reflection',
    message: 'How did today go? {{twinName}} is ready to process your day with you.',
    cta: 'Reflect',
  },

  // Decision follow-ups
  'decision-1-day': {
    type: 'decision-reminder',
    subject: 'Check-in: {{decisionTitle}}',
    message:
      'It\'s been 1 day since your decision about {{decisionTitle}}. How\'s it feeling? Let\'s talk.',
    cta: 'Share update',
  },

  'decision-7-day': {
    type: 'decision-reminder',
    subject: 'A week of {{decisionTitle}}',
    message:
      'A week has passed since you decided on {{decisionTitle}}. {{twinName}} wants to learn how it\'s going.',
    cta: 'Tell me more',
  },

  'decision-30-day': {
    type: 'decision-reminder',
    subject: 'A month later: {{decisionTitle}}',
    message:
      '30 days later — how\'s {{decisionTitle}} working out? Time to assess and learn.',
    cta: 'Reflect',
  },

  // Evolution milestone
  'evolution-new-stage': {
    type: 'evolution-milestone',
    subject: '🌟 {{twinName}} evolved!',
    message:
      '{{twinName}} has reached {{stageName}}: {{stageDescription}}. Your connection deepens.',
    cta: 'See evolution',
  },

  // Pattern insight
  'pattern-detected': {
    type: 'pattern-insight',
    subject: 'Pattern insight: {{patternName}}',
    message:
      '{{twinName}} noticed something in your behavior: {{patternDescription}}. Worth exploring?',
    cta: 'Explore',
  },

  // Twin guidance
  'guidance-reflection': {
    type: 'twin-guidance',
    subject: 'A thought from {{twinName}}',
    message:
      'Your Twin has some wisdom: {{guidanceText}} Would you like to talk about this?',
    cta: 'Discuss',
  },

  'guidance-challenge': {
    type: 'twin-guidance',
    subject: 'A gentle challenge from {{twinName}}',
    message:
      '{{twinName}} wants to challenge you constructively: {{challengeText}} Ready to explore?',
    cta: 'Accept challenge',
  },

  // World nudges
  'world-nudge-career': {
    type: 'world-nudge',
    subject: '💼 Career insight',
    message:
      'Your {{twinName}} has a thought about your career. {{guidanceText}} Time to explore?',
    cta: 'Explore',
  },

  'world-nudge-relationships': {
    type: 'world-nudge',
    subject: '💕 Relationship insight',
    message:
      '{{twinName}} noticed something about your relationships: {{guidanceText}} Shall we dig in?',
    cta: 'Reflect',
  },

  'world-nudge-health': {
    type: 'world-nudge',
    subject: '🏃 Health & wellness',
    message:
      'Your {{twinName}} cares about your wellbeing: {{guidanceText}} Ready to commit?',
    cta: 'Let\'s do it',
  },
};

/**
 * Get template by type
 */
export function getTemplate(type: string): NotificationTemplate | null {
  return TEMPLATES[type] || null;
}

/**
 * Interpolate variables in template
 */
export function interpolateTemplate(
  template: NotificationTemplate,
  variables: Record<string, string>
): NotificationTemplate {
  const interpolate = (text: string) => {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  };

  return {
    type: template.type,
    subject: interpolate(template.subject),
    message: interpolate(template.message),
    cta: template.cta ? interpolate(template.cta) : undefined,
    variants: template.variants?.map(v => ({
      variant: v.variant,
      message: interpolate(v.message),
    })),
  };
}

/**
 * Select variant (for A/B testing)
 */
export function selectVariant(
  template: NotificationTemplate,
  userId: string
): string {
  if (!template.variants || template.variants.length === 0) {
    return template.message;
  }

  // Simple hash-based selection for consistent variant per user
  const hash = userId.charCodeAt(0) + userId.charCodeAt(userId.length - 1);
  const variantIndex = hash % template.variants.length;

  return template.variants[variantIndex].message;
}

/**
 * Get all available template types
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(TEMPLATES);
}

/**
 * Validate template rendering
 */
export function validateTemplateRender(
  template: NotificationTemplate,
  variables: Record<string, string>
): {
  valid: boolean;
  missingVariables?: string[];
} {
  const requiredVars = new Set<string>();

  // Extract required variables
  const regex = /{{(\w+)}}/g;
  const subjectMatches = template.subject.match(regex) || [];
  const messageMatches = template.message.match(regex) || [];
  const allMatches = [...subjectMatches, ...messageMatches];

  allMatches.forEach(match => {
    const varName = match.replace(/{{|}}/g, '');
    requiredVars.add(varName);
  });

  // Check which are missing
  const missing = Array.from(requiredVars).filter(v => !(v in variables));

  return {
    valid: missing.length === 0,
    missingVariables: missing.length > 0 ? missing : undefined,
  };
}
