/**
 * Nova AI Service — Claude API Integration with Hub × Mood × Archetype
 * Supports 1,296 personality combinations (18 archetypes × 12 hubs × 6 moods)
 */

import { getNovaPrompt } from '@/lib/nova-prompts/getNovaPrompt';
import { selfprintChat, type SelfprintChatRequest, type SelfprintChatResponse } from '@/lib/api/selfprintChat';
import type { Hub } from '@/context/HubContext';
import type { Mood } from '@/context/EmotionContext';

export interface NovaContext {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  hub: Hub;
  mood: Mood;
  archetype?: string; // e.g., 'strategist', 'dreamer'
  autonomy?: number; // 0-100, used as maturityScore
  userProfile?: {
    name?: string;
    scienceScore?: number;
    primaryArchetype?: string;
    secondaryArchetype?: string;
  };
  birthData?: {
    date: string;
    time?: string;
    latitude?: number;
    longitude?: number;
  };
  userId?: string;
  sessionId?: string;
  plan?: 'starter' | 'pro' | 'elite';
}

/**
 * Call Nova with full context
 * Internally uses selfprintChat (which injects system prompt)
 */
export async function callNova(context: NovaContext): Promise<SelfprintChatResponse> {
  try {
    // Use last message as the question
    const lastMessage = context.messages[context.messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    const chatRequest: SelfprintChatRequest = {
      userId: context.userId || 'anonymous',
      sessionId: context.sessionId || `session-${Date.now()}`,
      hub: context.hub as any,
      mood: context.mood as any,
      archetype: context.archetype || context.userProfile?.primaryArchetype,
      question: lastMessage.content,
      history: context.messages.slice(0, -1),
      twinProfile: context.userProfile ? {
        id: `twin-${context.userId || 'anonymous'}`,
        userId: context.userId || 'anonymous',
        name: context.userProfile.name,
        primaryArchetype: context.userProfile.primaryArchetype,
        secondaryArchetype: context.userProfile.secondaryArchetype,
        maturityScore: context.autonomy || 50,
      } : undefined,
      birthData: context.birthData,
      plan: context.plan,
    };

    return await selfprintChat(chatRequest);
  } catch (error) {
    console.error('Nova API error:', error);
    throw error;
  }
}

/**
 * Generate system prompt directly (for testing/display)
 */
export function getSystemPrompt(context: Omit<NovaContext, 'messages'>): string {
  return getNovaPrompt({
    hub: context.hub as any,
    mood: context.mood as any,
    archetype: context.archetype || context.userProfile?.primaryArchetype || 'sage',
    userProfile: context.userProfile,
    maturityScore: context.autonomy || 50,
  });
}

/**
 * Generate a starter message based on hub + mood + optional archetype
 */
export function getStarterMessage(hub: Hub, mood: Mood): string {
  const starters: Record<Hub, Record<Mood, string>> = {
    identity: {
      stressed: "What's one thing about yourself that still feels true, even in this moment?",
      confused: "Let's explore who you are beneath the confusion. What feels real to you?",
      confident: "You seem to know yourself well. What's one thing you're becoming?",
      drained: "Rest first. When you're ready, I'm curious what drew you here.",
      ready: "You're in a good place. Let's talk about who you're becoming.",
      reflective: "This is good ground for reflection. Who do you want to be?",
    },
    decision: {
      stressed: "Let's break this down into pieces. What's the core question?",
      confused: "Confusion often means you need more info. What's missing?",
      confident: "You have good instincts. What does your gut say?",
      drained: "Too many options? Let's narrow to what actually matters.",
      ready: "You're ready to decide. What are you choosing between?",
      reflective: "Good time to think deeply. What decision are you facing?",
    },
    relationship: {
      stressed: "Relationships get hard. What's happening between you two?",
      confused: "Relationship dynamics can be complex. Help me understand.",
      confident: "You handle relationships well. What's working?",
      drained: "Relationships take energy. What do you need right now?",
      ready: "You're in good shape emotionally. Who do you want to connect with?",
      reflective: "This is good space for relationship reflection.",
    },
    career: {
      stressed: "Career stress is real. What's the pressure right now?",
      confused: "Career choices can feel unclear. What are you exploring?",
      confident: "You're growing. What's next for you?",
      drained: "Burnout is real. What would restore you?",
      ready: "You're in your power. What opportunity calls to you?",
      reflective: "Good time to think about your direction.",
    },
    health: {
      stressed: "Stress affects the body. How are you feeling physically?",
      confused: "Health decisions are personal. What's confusing you?",
      confident: "You're taking care of yourself. That's powerful.",
      drained: "Your body is telling you something. What does it need?",
      ready: "You're in a good place health-wise. What's next?",
      reflective: "Good time to check in with your body.",
    },
    money: {
      stressed: "Money stress is common. What's the worry?",
      confused: "Money decisions don't have to be complicated. What's unclear?",
      confident: "You have financial clarity. That's valuable.",
      drained: "Financial overwhelm is exhausting. Let's simplify.",
      ready: "You're ready to make financial moves. What matters?",
      reflective: "Good time to reflect on your money values.",
    },
    'ai-twin': {
      stressed: "How's our relationship feeling? What would help?",
      confused: "You seem uncertain about me. That's fair—ask away.",
      confident: "You trust me. I'm learning from you.",
      drained: "Take space if you need it. I'm here when ready.",
      ready: "You're in a great place. What should we explore together?",
      reflective: "Good moment to reflect on how I'm serving you.",
    },
    learning: {
      stressed: "Learning while stressed is hard. What are you trying to understand?",
      confused: "Confusion is where learning happens. What's the core concept?",
      confident: "You're learning well. What's next?",
      drained: "Learning takes energy. What's worth learning right now?",
      ready: "You're ready to level up. What are you curious about?",
      reflective: "Good time to integrate what you've learned.",
    },
    creativity: {
      stressed: "Creativity and stress don't mix well. What wants to emerge from you?",
      confused: "Confusion can be creative fuel. What are you imagining?",
      confident: "Your creative confidence is high. Create.",
      drained: "Rest first. Creativity needs energy.",
      ready: "You're in your creative power. What's calling?",
      reflective: "Reflection fuels creativity. What do you sense?",
    },
    spirituality: {
      stressed: "Spiritual crisis in stress? What are you seeking?",
      confused: "Confusion can deepen spiritual understanding. What questions arise?",
      confident: "You're aligned. What does that alignment reveal?",
      drained: "Spiritual resources exist. What do you need right now?",
      ready: "You're open to deeper questions. What are they?",
      reflective: "Deep reflection is spiritual practice. Go there.",
    },
    impact: {
      stressed: "Impact work under stress? How can you simplify your contribution?",
      confused: "Unclear on your impact? Let's get specific.",
      confident: "Your impact is real. What's your next move?",
      drained: "Burnout is the enemy of impact. What would restore you?",
      ready: "You're in your power. What impact do you want to have?",
      reflective: "Legacy thinking. What do you want to be known for?",
    },
    activities: {
      stressed: "When overwhelmed, focus on one thing. What's most important right now?",
      confused: "Too many tasks? Let's prioritize what actually matters.",
      confident: "You know how to get things done. What's your target?",
      drained: "Energy is low. What's the one thing worth doing today?",
      ready: "You're in flow. What will you accomplish?",
      reflective: "Good time to reflect on how you spend your time.",
    },
  };

  const baseMessage = starters[hub]?.[mood] || "I'm here. What's on your mind?";

  // If archetype is provided, optionally add archetype-aware nuance
  // (This is optional—can be enhanced later with archetype-specific starters)
  return baseMessage;
}

export default { callNova, getStarterMessage, getSystemPrompt };
