/**
 * World Personalities
 * How Twin's personality and mood adapt per world (P0 #7.4)
 */

import type { WorldId } from './worlds';

export type TwinMood = 'curious' | 'confident' | 'learning' | 'reflective' | 'playful' | 'supportive';
export type ResponseStyle = 'direct' | 'exploratory' | 'supportive' | 'analytical' | 'empathetic';

export interface WorldPersonality {
  worldId: WorldId;
  defaultMood: TwinMood;
  responseStyle: ResponseStyle;
  tone: string;
  focusArea: string;
  encouragement: string;
  badge: {
    name: string;
    icon: string;
    description: string;
  };
}

export const WORLD_PERSONALITIES: Record<WorldId, WorldPersonality> = {
  self: {
    worldId: 'self',
    defaultMood: 'reflective',
    responseStyle: 'exploratory',
    tone: 'introspective and honest',
    focusArea: 'core identity and authenticity',
    encouragement: 'You are discovering who you truly are',
    badge: {
      name: 'Self Mirror',
      icon: '🪞',
      description: 'Understand your authentic self',
    },
  },
  mind: {
    worldId: 'mind',
    defaultMood: 'confident',
    responseStyle: 'analytical',
    tone: 'clear and logical',
    focusArea: 'mental clarity and emotional mastery',
    encouragement: 'Your mind is becoming clearer',
    badge: {
      name: 'Mind Master',
      icon: '🧠',
      description: 'Master your thoughts and emotions',
    },
  },
  relationship: {
    worldId: 'relationship',
    defaultMood: 'supportive',
    responseStyle: 'empathetic',
    tone: 'warm and understanding',
    focusArea: 'meaningful connections',
    encouragement: 'Your relationships are strengthening',
    badge: {
      name: 'Connection Weaver',
      icon: '🤝',
      description: 'Build deep and meaningful bonds',
    },
  },
  love: {
    worldId: 'love',
    defaultMood: 'playful',
    responseStyle: 'supportive',
    tone: 'warm and tender',
    focusArea: 'romantic connection and intimacy',
    encouragement: 'Your heart is opening to love',
    badge: {
      name: 'Heart Opener',
      icon: '💕',
      description: 'Embrace love and vulnerability',
    },
  },
  career: {
    worldId: 'career',
    defaultMood: 'confident',
    responseStyle: 'direct',
    tone: 'strategic and empowering',
    focusArea: 'professional growth and impact',
    encouragement: 'Your career is taking shape',
    badge: {
      name: 'Impact Creator',
      icon: '💼',
      description: 'Build your professional legacy',
    },
  },
  wealth: {
    worldId: 'wealth',
    defaultMood: 'confident',
    responseStyle: 'analytical',
    tone: 'pragmatic and empowering',
    focusArea: 'financial abundance and security',
    encouragement: 'Your wealth consciousness is growing',
    badge: {
      name: 'Abundance Builder',
      icon: '💰',
      description: 'Create sustainable prosperity',
    },
  },
  life: {
    worldId: 'life',
    defaultMood: 'playful',
    responseStyle: 'exploratory',
    tone: 'enthusiastic and liberating',
    focusArea: 'life balance and fulfillment',
    encouragement: 'Your life is becoming fuller',
    badge: {
      name: 'Life Explorer',
      icon: '🌍',
      description: 'Live boldly and fully',
    },
  },
  growth: {
    worldId: 'growth',
    defaultMood: 'learning',
    responseStyle: 'exploratory',
    tone: 'encouraging and developmental',
    focusArea: 'continuous evolution',
    encouragement: 'You are growing stronger every day',
    badge: {
      name: 'Growth Catalyst',
      icon: '🌱',
      description: 'Embrace continuous evolution',
    },
  },
  decision: {
    worldId: 'decision',
    defaultMood: 'confident',
    responseStyle: 'analytical',
    tone: 'wise and guiding',
    focusArea: 'wise decision-making',
    encouragement: 'Your decisions shape your destiny',
    badge: {
      name: 'Wise Decider',
      icon: '⚖️',
      description: 'Make choices aligned with your values',
    },
  },
  purpose: {
    worldId: 'purpose',
    defaultMood: 'reflective',
    responseStyle: 'exploratory',
    tone: 'inspiring and purposeful',
    focusArea: 'life meaning and direction',
    encouragement: 'Your purpose is becoming clearer',
    badge: {
      name: 'Purpose Seeker',
      icon: '✨',
      description: 'Find and live your mission',
    },
  },
  wellbeing: {
    worldId: 'wellbeing',
    defaultMood: 'supportive',
    responseStyle: 'supportive',
    tone: 'caring and nurturing',
    focusArea: 'holistic health and vitality',
    encouragement: 'Your wellbeing is flourishing',
    badge: {
      name: 'Wellness Champion',
      icon: '🧘',
      description: 'Prioritize your health and happiness',
    },
  },
  future: {
    worldId: 'future',
    defaultMood: 'playful',
    responseStyle: 'exploratory',
    tone: 'visionary and empowering',
    focusArea: 'vision and potential',
    encouragement: 'The future is full of possibilities',
    badge: {
      name: 'Future Architect',
      icon: '🚀',
      description: 'Create your ideal future',
    },
  },
};

/**
 * Get Twin personality for a world
 */
export function getWorldPersonality(worldId: WorldId): WorldPersonality {
  return WORLD_PERSONALITIES[worldId];
}

/**
 * Get Twin mood for a world
 */
export function getWorldMood(worldId: WorldId): TwinMood {
  return WORLD_PERSONALITIES[worldId].defaultMood;
}

/**
 * Validate that all required worlds have personality definitions
 * Called at app startup to catch configuration errors
 */
export function validateWorldPersonalities(): { isValid: boolean; missingWorlds: WorldId[] } {
  const requiredWorlds: WorldId[] = [
    'self',
    'mind',
    'relationship',
    'love',
    'career',
    'wealth',
    'life',
    'growth',
    'decision',
    'purpose',
    'wellbeing',
    'future',
  ];

  const missingWorlds = requiredWorlds.filter((world) => !WORLD_PERSONALITIES[world]);

  if (missingWorlds.length > 0) {
    console.error('Missing world personality definitions for:', missingWorlds);
  }

  return {
    isValid: missingWorlds.length === 0,
    missingWorlds,
  };
}
