/**
 * worlds.ts
 * The 12 Worlds of Self Print - Life domains for exploration
 */

export type WorldId =
  | 'self' | 'mind' | 'relationship' | 'love' | 'career' | 'wealth'
  | 'life' | 'growth' | 'decision' | 'purpose' | 'wellbeing' | 'future';

export interface World {
  id: WorldId;
  name: string;
  emoji: string;
  color: string;
  description: string;
  tagline: string;
  focusAreas: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  image?: string;
  publishedAt: string;
  readTime: number; // minutes
  tags: string[];
  world: WorldId;
}

export const WORLDS: Record<WorldId, World> = {
  self: {
    id: 'self',
    name: 'Self',
    emoji: '🪞',
    color: '#6366f1',
    description: 'Understanding who you are at your core',
    tagline: 'Know thyself',
    focusAreas: ['Identity', 'Values', 'Beliefs', 'Self-awareness', 'Authenticity'],
  },
  mind: {
    id: 'mind',
    name: 'Mind',
    emoji: '🧠',
    color: '#8b5cf6',
    description: 'Thoughts, emotions, and mental clarity',
    tagline: 'Master your mind',
    focusAreas: ['Thoughts', 'Emotions', 'Clarity', 'Focus', 'Mental health'],
  },
  relationship: {
    id: 'relationship',
    name: 'Relationships',
    emoji: '🤝',
    color: '#ec4899',
    description: 'Connections with others and social bonds',
    tagline: 'Build meaningful bonds',
    focusAreas: ['Communication', 'Boundaries', 'Trust', 'Conflict', 'Connection'],
  },
  love: {
    id: 'love',
    name: 'Love',
    emoji: '💕',
    color: '#f43f5e',
    description: 'Love, romance, intimacy, and heart connections',
    tagline: 'Open your heart',
    focusAreas: ['Romance', 'Intimacy', 'Attachment', 'Vulnerability', 'Partnership'],
  },
  career: {
    id: 'career',
    name: 'Career',
    emoji: '💼',
    color: '#06b6d4',
    description: 'Work, purpose, and professional growth',
    tagline: 'Build your legacy',
    focusAreas: ['Purpose', 'Skills', 'Leadership', 'Growth', 'Impact'],
  },
  wealth: {
    id: 'wealth',
    name: 'Wealth',
    emoji: '💰',
    color: '#10b981',
    description: 'Financial health, abundance, and resources',
    tagline: 'Create prosperity',
    focusAreas: ['Money', 'Abundance', 'Security', 'Investment', 'Generosity'],
  },
  life: {
    id: 'life',
    name: 'Life',
    emoji: '🌍',
    color: '#f59e0b',
    description: 'Balance, lifestyle, and life satisfaction',
    tagline: 'Live fully',
    focusAreas: ['Balance', 'Lifestyle', 'Health', 'Adventure', 'Fulfillment'],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    emoji: '🌱',
    color: '#34d399',
    description: 'Learning, development, and transformation',
    tagline: 'Never stop growing',
    focusAreas: ['Learning', 'Skills', 'Habits', 'Mindset', 'Evolution'],
  },
  decision: {
    id: 'decision',
    name: 'Decisions',
    emoji: '⚖️',
    color: '#a78bfa',
    description: 'Choices, wisdom, and decision-making',
    tagline: 'Choose wisely',
    focusAreas: ['Choices', 'Consequences', 'Wisdom', 'Timing', 'Confidence'],
  },
  purpose: {
    id: 'purpose',
    name: 'Purpose',
    emoji: '✨',
    color: '#fbbf24',
    description: 'Meaning, mission, and life direction',
    tagline: 'Find your why',
    focusAreas: ['Mission', 'Meaning', 'Values', 'Impact', 'Direction'],
  },
  wellbeing: {
    id: 'wellbeing',
    name: 'Wellbeing',
    emoji: '🧘',
    color: '#f87171',
    description: 'Health, wellness, and self-care',
    tagline: 'Prioritize yourself',
    focusAreas: ['Physical', 'Mental', 'Emotional', 'Spiritual', 'Recovery'],
  },
  future: {
    id: 'future',
    name: 'Future',
    emoji: '🚀',
    color: '#60a5fa',
    description: 'Vision, goals, and what\'s ahead',
    tagline: 'Create your future',
    focusAreas: ['Vision', 'Goals', 'Planning', 'Potential', 'Legacy'],
  },
};

/**
 * Get world by ID
 */
export function getWorld(id: WorldId): World {
  return WORLDS[id];
}

/**
 * Get all worlds
 */
export function getAllWorlds(): World[] {
  return Object.values(WORLDS);
}

/**
 * Map articles to worlds
 */
export const WORLD_ARTICLES: Record<WorldId, Article[]> = {
  self: [
    {
      slug: 'identity-exploration',
      title: 'Finding Your Core Identity',
      excerpt: 'Go beyond surface-level labels to discover who you truly are.',
      content: 'Your identity is not fixed...',
      author: 'Twin',
      publishedAt: '2026-01-15',
      readTime: 5,
      tags: ['identity', 'self-discovery'],
      world: 'self',
    },
    {
      slug: 'values-framework',
      title: 'Building Your Values Framework',
      excerpt: 'Create a personal philosophy that guides every decision.',
      content: 'Values are...',
      author: 'Twin',
      publishedAt: '2026-01-20',
      readTime: 6,
      tags: ['values', 'philosophy'],
      world: 'self',
    },
    {
      slug: 'authenticity-journey',
      title: 'The Authenticity Journey',
      excerpt: 'Learn to show up as your true self in all areas of life.',
      content: 'Authenticity is...',
      author: 'Twin',
      publishedAt: '2026-01-25',
      readTime: 5,
      tags: ['authenticity', 'self-expression'],
      world: 'self',
    },
  ],
  mind: [
    {
      slug: 'mental-clarity',
      title: 'Mental Clarity Through Simplification',
      excerpt: 'Declutter your mind and access your best thinking.',
      content: 'Mental clutter...',
      author: 'Twin',
      publishedAt: '2026-01-10',
      readTime: 6,
      tags: ['clarity', 'mindfulness'],
      world: 'mind',
    },
    {
      slug: 'emotion-mastery',
      title: 'Mastering Your Emotions',
      excerpt: 'Understand and work with your emotional landscape.',
      content: 'Emotions are...',
      author: 'Twin',
      publishedAt: '2026-01-18',
      readTime: 7,
      tags: ['emotions', 'self-regulation'],
      world: 'mind',
    },
    {
      slug: 'focus-protocol',
      title: 'Building Deep Focus',
      excerpt: 'Create environments and habits that support concentration.',
      content: 'Focus is...',
      author: 'Twin',
      publishedAt: '2026-01-22',
      readTime: 5,
      tags: ['focus', 'productivity'],
      world: 'mind',
    },
  ],
  relationship: [
    {
      slug: 'communication-skills',
      title: 'Mastering Vulnerable Communication',
      excerpt: 'Speak your truth while honoring others.',
      content: 'True communication...',
      author: 'Twin',
      publishedAt: '2026-01-12',
      readTime: 6,
      tags: ['communication', 'vulnerability'],
      world: 'relationship',
    },
    {
      slug: 'boundary-setting',
      title: 'Healthy Boundaries: A Love Language',
      excerpt: 'Set limits that strengthen, not damage, relationships.',
      content: 'Boundaries are...',
      author: 'Twin',
      publishedAt: '2026-01-19',
      readTime: 5,
      tags: ['boundaries', 'relationships'],
      world: 'relationship',
    },
    {
      slug: 'conflict-resolution',
      title: 'Turning Conflict Into Connection',
      excerpt: 'Use disagreements as opportunities to deepen bonds.',
      content: 'Conflict is...',
      author: 'Twin',
      publishedAt: '2026-01-26',
      readTime: 7,
      tags: ['conflict', 'resolution'],
      world: 'relationship',
    },
  ],
  love: [
    {
      slug: 'romantic-readiness',
      title: 'Preparing for Love',
      excerpt: 'Become the partner you wish to find.',
      content: 'Romantic love...',
      author: 'Twin',
      publishedAt: '2026-01-14',
      readTime: 6,
      tags: ['love', 'partnership'],
      world: 'love',
    },
    {
      slug: 'intimacy-depth',
      title: 'Building Intimacy Beyond Physical',
      excerpt: 'Create deep connection through vulnerability and presence.',
      content: 'True intimacy...',
      author: 'Twin',
      publishedAt: '2026-01-21',
      readTime: 6,
      tags: ['intimacy', 'connection'],
      world: 'love',
    },
    {
      slug: 'love-languages',
      title: 'Speaking Your Love Language',
      excerpt: 'Give and receive love in ways that matter most.',
      content: 'Love languages...',
      author: 'Twin',
      publishedAt: '2026-01-28',
      readTime: 5,
      tags: ['love', 'communication'],
      world: 'love',
    },
  ],
  career: [
    {
      slug: 'purpose-discovery',
      title: 'Finding Your Professional Purpose',
      excerpt: 'Move beyond paychecks to meaningful work.',
      content: 'Purpose in work...',
      author: 'Twin',
      publishedAt: '2026-01-11',
      readTime: 7,
      tags: ['purpose', 'career'],
      world: 'career',
    },
    {
      slug: 'leadership-journey',
      title: 'The Leadership Journey Within',
      excerpt: 'Lead from authenticity and vision.',
      content: 'Real leadership...',
      author: 'Twin',
      publishedAt: '2026-01-17',
      readTime: 8,
      tags: ['leadership', 'growth'],
      world: 'career',
    },
    {
      slug: 'skill-mastery',
      title: 'From Competence to Mastery',
      excerpt: 'Build skills that outlast trends.',
      content: 'Mastery is...',
      author: 'Twin',
      publishedAt: '2026-01-24',
      readTime: 6,
      tags: ['skills', 'mastery'],
      world: 'career',
    },
  ],
  wealth: [
    {
      slug: 'money-mindset',
      title: 'Healing Your Money Beliefs',
      excerpt: 'Transform limiting thoughts about wealth.',
      content: 'Money mindset...',
      author: 'Twin',
      publishedAt: '2026-01-13',
      readTime: 6,
      tags: ['money', 'mindset'],
      world: 'wealth',
    },
    {
      slug: 'abundance-flow',
      title: 'Creating Abundance Flows',
      excerpt: 'Build systems that generate sustainable wealth.',
      content: 'Abundance...',
      author: 'Twin',
      publishedAt: '2026-01-23',
      readTime: 7,
      tags: ['abundance', 'wealth'],
      world: 'wealth',
    },
    {
      slug: 'generosity-wealth',
      title: 'Wealth Through Generosity',
      excerpt: 'Discover how giving amplifies abundance.',
      content: 'Generosity...',
      author: 'Twin',
      publishedAt: '2026-01-29',
      readTime: 5,
      tags: ['generosity', 'wealth'],
      world: 'wealth',
    },
  ],
  life: [
    {
      slug: 'life-balance',
      title: 'Designing Your Ideal Lifestyle',
      excerpt: 'Balance ambition with presence and joy.',
      content: 'Balance is...',
      author: 'Twin',
      publishedAt: '2026-01-16',
      readTime: 7,
      tags: ['balance', 'lifestyle'],
      world: 'life',
    },
    {
      slug: 'adventure-spirit',
      title: 'Awakening Your Adventure Spirit',
      excerpt: 'Live boldly and embrace new experiences.',
      content: 'Adventure...',
      author: 'Twin',
      publishedAt: '2026-01-27',
      readTime: 6,
      tags: ['adventure', 'fulfillment'],
      world: 'life',
    },
    {
      slug: 'health-foundation',
      title: 'Health as Your Foundation',
      excerpt: 'Build vitality that supports all other pursuits.',
      content: 'Health is...',
      author: 'Twin',
      publishedAt: '2026-01-30',
      readTime: 6,
      tags: ['health', 'wellness'],
      world: 'life',
    },
  ],
  growth: [
    {
      slug: 'learning-mastery',
      title: 'Learning How to Learn',
      excerpt: 'Develop a lifelong learning practice.',
      content: 'Learning...',
      author: 'Twin',
      publishedAt: '2026-01-09',
      readTime: 7,
      tags: ['learning', 'growth'],
      world: 'growth',
    },
    {
      slug: 'habit-evolution',
      title: 'Evolving Through Habit Stacking',
      excerpt: 'Build momentum through small, consistent changes.',
      content: 'Habits...',
      author: 'Twin',
      publishedAt: '2026-01-20',
      readTime: 6,
      tags: ['habits', 'evolution'],
      world: 'growth',
    },
    {
      slug: 'mindset-transformation',
      title: 'From Fixed to Growth Mindset',
      excerpt: 'Embrace challenges as opportunities.',
      content: 'Mindset...',
      author: 'Twin',
      publishedAt: '2026-01-31',
      readTime: 5,
      tags: ['mindset', 'growth'],
      world: 'growth',
    },
  ],
  decision: [
    {
      slug: 'decision-framework',
      title: 'The SICE Decision Framework',
      excerpt: 'Make confident choices aligned with your values.',
      content: 'Decisions...',
      author: 'Twin',
      publishedAt: '2026-01-08',
      readTime: 8,
      tags: ['decisions', 'wisdom'],
      world: 'decision',
    },
    {
      slug: 'consequence-mapping',
      title: 'Mapping Consequences Before Deciding',
      excerpt: 'Think three steps ahead.',
      content: 'Consequences...',
      author: 'Twin',
      publishedAt: '2026-01-19',
      readTime: 6,
      tags: ['consequences', 'planning'],
      world: 'decision',
    },
    {
      slug: 'decision-confidence',
      title: 'Building Confidence in Your Choices',
      excerpt: 'Trust yourself even when uncertain.',
      content: 'Confidence...',
      author: 'Twin',
      publishedAt: '2026-02-01',
      readTime: 5,
      tags: ['confidence', 'trust'],
      world: 'decision',
    },
  ],
  purpose: [
    {
      slug: 'purpose-finding',
      title: 'Discovering Your Life Purpose',
      excerpt: 'Find the "why" that drives everything.',
      content: 'Purpose...',
      author: 'Twin',
      publishedAt: '2026-01-07',
      readTime: 8,
      tags: ['purpose', 'meaning'],
      world: 'purpose',
    },
    {
      slug: 'mission-statement',
      title: 'Crafting Your Personal Mission',
      excerpt: 'Write the story you want to live.',
      content: 'Mission...',
      author: 'Twin',
      publishedAt: '2026-01-18',
      readTime: 6,
      tags: ['mission', 'vision'],
      world: 'purpose',
    },
    {
      slug: 'impact-legacy',
      title: 'Creating Your Impact and Legacy',
      excerpt: 'Live in a way that outlasts you.',
      content: 'Impact...',
      author: 'Twin',
      publishedAt: '2026-02-02',
      readTime: 7,
      tags: ['impact', 'legacy'],
      world: 'purpose',
    },
  ],
  wellbeing: [
    {
      slug: 'physical-vitality',
      title: 'Reclaiming Physical Vitality',
      excerpt: 'Move, nourish, and strengthen your body.',
      content: 'Physical health...',
      author: 'Twin',
      publishedAt: '2026-01-06',
      readTime: 6,
      tags: ['physical', 'health'],
      world: 'wellbeing',
    },
    {
      slug: 'mental-wellness',
      title: 'Mental Wellness as Practice',
      excerpt: 'Build resilience and inner peace.',
      content: 'Mental wellness...',
      author: 'Twin',
      publishedAt: '2026-01-17',
      readTime: 7,
      tags: ['mental', 'wellness'],
      world: 'wellbeing',
    },
    {
      slug: 'spiritual-connection',
      title: 'Finding Your Spiritual Connection',
      excerpt: 'Tap into meaning beyond the material.',
      content: 'Spiritual...',
      author: 'Twin',
      publishedAt: '2026-02-03',
      readTime: 6,
      tags: ['spiritual', 'connection'],
      world: 'wellbeing',
    },
  ],
  future: [
    {
      slug: 'vision-creation',
      title: 'Crafting Your Future Vision',
      excerpt: 'Paint a compelling picture of what\'s possible.',
      content: 'Vision...',
      author: 'Twin',
      publishedAt: '2026-01-05',
      readTime: 7,
      tags: ['vision', 'future'],
      world: 'future',
    },
    {
      slug: 'goal-strategy',
      title: 'Strategic Goal Setting',
      excerpt: 'Turn vision into actionable milestones.',
      content: 'Goals...',
      author: 'Twin',
      publishedAt: '2026-01-16',
      readTime: 6,
      tags: ['goals', 'strategy'],
      world: 'future',
    },
    {
      slug: 'potential-unlock',
      title: 'Unlocking Your Full Potential',
      excerpt: 'Become the highest version of yourself.',
      content: 'Potential...',
      author: 'Twin',
      publishedAt: '2026-02-04',
      readTime: 8,
      tags: ['potential', 'growth'],
      world: 'future',
    },
  ],
};

/**
 * Get articles for a world
 */
export function getWorldArticles(worldId: WorldId): Article[] {
  return WORLD_ARTICLES[worldId] || [];
}
