/**
 * World type definitions and registry
 */

export type WorldId =
  | 'self'
  | 'career'
  | 'love'
  | 'health'
  | 'creativity'
  | 'spirituality'
  | 'relationships'
  | 'wealth'
  | 'learning'
  | 'adventure'
  | 'solitude'
  | 'community';

export const WORLD_REGISTRY: Record<WorldId, { name: string; icon: string }> = {
  self: { name: 'Self', icon: '🔮' },
  career: { name: 'Career', icon: '💼' },
  love: { name: 'Love', icon: '💕' },
  health: { name: 'Health', icon: '🏃' },
  creativity: { name: 'Creativity', icon: '🎨' },
  spirituality: { name: 'Spirituality', icon: '✨' },
  relationships: { name: 'Relationships', icon: '👥' },
  wealth: { name: 'Wealth', icon: '💰' },
  learning: { name: 'Learning', icon: '📚' },
  adventure: { name: 'Adventure', icon: '🧭' },
  solitude: { name: 'Solitude', icon: '🌙' },
  community: { name: 'Community', icon: '🌍' },
};
