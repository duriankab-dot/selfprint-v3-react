import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * § 28 Contextual Popup
 *
 * Non-intrusive popups for:
 * - Discovery: Suggest related features
 * - Pattern: New pattern found
 * - Milestone: Evolution/achievement
 * - Re-engagement: User returned after gap
 *
 * Principle: "Contextual, not interruptive"
 */

export type PopupType = 'discovery' | 'pattern' | 'milestone' | 're-engagement';

export interface PopupData {
  id: string; // Unique identifier (feature id, pattern id, achievement id, etc.)
  type: PopupType;
  title: string;
  description: string;
  icon?: string; // Emoji or icon
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  duration?: number; // Auto-dismiss after ms (default 5000)
  dismissible?: boolean; // Allow user to close (default true)
}

interface PopupContextType {
  // Current popup (only one at a time)
  currentPopup: PopupData | null;

  // Queue of pending popups
  popupQueue: PopupData[];

  // Show a popup (adds to queue)
  showPopup: (popup: PopupData) => void;

  // Dismiss current popup (shows next in queue)
  dismissPopup: () => void;

  // Clear all popups
  clearAll: () => void;

  // Check if popup has been shown before (for avoiding repeats)
  hasShownPopup: (popupId: string) => boolean;

  // Mark popup as shown
  markPopupShown: (popupId: string) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPopup, setCurrentPopup] = useState<PopupData | null>(null);
  const [popupQueue, setPopupQueue] = useState<PopupData[]>([]);
  const [shownPopups, setShownPopups] = useState<Set<string>>(() => {
    // Load from localStorage
    const stored = localStorage.getItem('selfprint-shown-popups');
    if (stored) {
      try {
        return new Set(JSON.parse(stored));
      } catch (error) {
        // Failed to load shown popups from storage
      }
    }
    return new Set();
  });

  // Show next popup from queue
  const showNextPopup = useCallback(() => {
    if (popupQueue.length > 0) {
      const next = popupQueue[0];
      setCurrentPopup(next);
      setPopupQueue(prev => prev.slice(1));
    } else {
      setCurrentPopup(null);
    }
  }, [popupQueue]);

  const showPopup = useCallback(
    (popup: PopupData) => {
      // Don't show if already shown (unless forced)
      if (shownPopups.has(popup.id)) {
        return;
      }

      if (currentPopup) {
        // Queue if something is already showing
        setPopupQueue(prev => [...prev, popup]);
      } else {
        // Show immediately
        setCurrentPopup(popup);
        markPopupShown(popup.id);
      }
    },
    [currentPopup, shownPopups]
  );

  const dismissPopup = useCallback(() => {
    showNextPopup();
  }, [showNextPopup]);

  const clearAll = useCallback(() => {
    setCurrentPopup(null);
    setPopupQueue([]);
  }, []);

  const hasShownPopup = useCallback(
    (popupId: string) => shownPopups.has(popupId),
    [shownPopups]
  );

  const markPopupShown = useCallback((popupId: string) => {
    setShownPopups(prev => {
      const updated = new Set(prev);
      updated.add(popupId);

      // Persist to localStorage
      localStorage.setItem('selfprint-shown-popups', JSON.stringify(Array.from(updated)));

      return updated;
    });
  }, []);

  return (
    <PopupContext.Provider
      value={{
        currentPopup,
        popupQueue,
        showPopup,
        dismissPopup,
        clearAll,
        hasShownPopup,
        markPopupShown,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within PopupProvider');
  }
  return context;
};
