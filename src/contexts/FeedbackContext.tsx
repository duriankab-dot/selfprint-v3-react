/**
 * FeedbackContext.tsx
 * Phase F: Global Feedback State Management
 */

import React, { createContext, useContext, useState } from 'react';
import type { UserFeedback, FeedbackStats } from '../types/feedback';

interface FeedbackContextType {
  pendingFeedback: UserFeedback | null;
  setPendingFeedback: (feedback: UserFeedback | null) => void;
  stats: FeedbackStats | null;
  setStats: (stats: FeedbackStats | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [pendingFeedback, setPendingFeedback] = useState<UserFeedback | null>(null);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const value: FeedbackContextType = {
    pendingFeedback,
    setPendingFeedback,
    stats,
    setStats,
    isLoading,
    setIsLoading,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextType {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}
