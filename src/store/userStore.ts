import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mood } from '@/context/EmotionContext';

export type CTASource = 'why' | 'how' | 'who' | 'next' | undefined;

export interface LandingContext {
  mood?: Mood;
  ctaSource?: CTASource;
  timestamp?: number;
}

export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
}

export interface UserState {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Landing context tracking
  landingContext?: LandingContext;
  setLandingContext: (context: Partial<LandingContext>) => void;

  // SICE baseline
  scienceScore?: number;
  intuitionScore?: number;
  creativeScore?: number;
  experienceScore?: number;
  recordSICEBaseline: (s: number, i: number, c: number, e: number) => void;

  // Preferences
  theme?: 'light' | 'dark';
  updatePreferences: (prefs: Record<string, any>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {},
      landingContext: undefined,
      scienceScore: undefined,
      intuitionScore: undefined,
      creativeScore: undefined,
      experienceScore: undefined,
      theme: 'light',

      updateProfile: (profile: Partial<UserProfile>) =>
        set((state) => ({
          profile: { ...state.profile, ...profile },
        })),

      setLandingContext: (context: Partial<LandingContext>) =>
        set((state) => ({
          landingContext: {
            ...state.landingContext,
            ...context,
            timestamp: Date.now(),
          },
        })),

      recordSICEBaseline: (s: number, i: number, c: number, e: number) =>
        set({
          scienceScore: s,
          intuitionScore: i,
          creativeScore: c,
          experienceScore: e,
        }),

      updatePreferences: (prefs: Record<string, any>) =>
        set((state) => ({
          ...state,
          ...prefs,
        })),
    }),
    {
      name: 'selfprint-user-storage',
    }
  )
);
