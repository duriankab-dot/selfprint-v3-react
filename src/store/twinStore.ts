import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feedback?: 'helpful' | 'meh' | 'unhelpful';
}

export interface TwinState {
  // Conversation memory
  messages: ConversationMessage[];
  addMessage: (message: ConversationMessage) => void;
  clearMessages: () => void;

  // Learning system
  autonomyScore: number;
  updateAutonomy: (delta: number) => void;

  // Pattern tracking
  patterns: Record<string, number>; // e.g., "decision_confidence": 75
  recordPattern: (key: string, value: number) => void;

  // User feedback
  feedbackCount: Record<'helpful' | 'meh' | 'unhelpful', number>;
  recordFeedback: (type: 'helpful' | 'meh' | 'unhelpful') => void;
}

export const useTwinStore = create<TwinState>()(
  persist(
    (set) => ({
      messages: [],
      autonomyScore: 50,
      patterns: {},
      feedbackCount: { helpful: 0, meh: 0, unhelpful: 0 },

      addMessage: (message: ConversationMessage) =>
        set((state) => ({
          messages: [...state.messages.slice(-9), message], // Keep last 10
        })),

      clearMessages: () => set({ messages: [] }),

      updateAutonomy: (delta: number) =>
        set((state) => ({
          autonomyScore: Math.max(0, Math.min(100, state.autonomyScore + delta)),
        })),

      recordPattern: (key: string, value: number) =>
        set((state) => ({
          patterns: { ...state.patterns, [key]: value },
        })),

      recordFeedback: (type: 'helpful' | 'meh' | 'unhelpful') =>
        set((state) => ({
          feedbackCount: {
            ...state.feedbackCount,
            [type]: state.feedbackCount[type] + 1,
          },
        })),
    }),
    {
      name: 'selfprint-twin-storage',
    }
  )
);
