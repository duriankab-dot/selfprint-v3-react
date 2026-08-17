/**
 * usePrivacy Hook
 * § P3.3 - User Privacy & Data Control
 */

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { privacyBoundary, type PrivacyMode, type PrivacySettings } from '@/services/privacy-boundary';

export const usePrivacy = () => {
  const { session } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize privacy settings on mount
  useEffect(() => {
    const initPrivacy = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        await privacyBoundary.initialize(session.user.id);
        const currentSettings = privacyBoundary.getSettings();
        setSettings(currentSettings);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load privacy settings';
        setError(errorMsg);
        console.error('[usePrivacy]', errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    initPrivacy();
  }, [session?.user?.id]);

  const setPrivacyMode = async (mode: PrivacyMode) => {
    try {
      setError(null);
      const updated = await privacyBoundary.setPrivacyMode(mode);
      setSettings(updated);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update privacy mode';
      setError(errorMsg);
      throw err;
    }
  };

  const allowAnalytics = async (allow: boolean) => {
    try {
      setError(null);
      const updated = await privacyBoundary.giveAnalyticsConsent(allow);
      setSettings(updated);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update analytics consent';
      setError(errorMsg);
      throw err;
    }
  };

  const setRetentionDays = async (days: number) => {
    try {
      setError(null);
      const updated = await privacyBoundary.setRetentionPolicy(days);
      setSettings(updated);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update retention policy';
      setError(errorMsg);
      throw err;
    }
  };

  const exportData = async () => {
    try {
      setError(null);
      const exported = await privacyBoundary.exportAllData();

      // Trigger download
      const blob = new Blob([JSON.stringify(exported, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selfprint-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return exported;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMsg);
      throw err;
    }
  };

  const deleteAllData = async (reason?: string) => {
    try {
      setError(null);
      if (!confirm('⚠️ This will permanently delete all your data. This cannot be undone. Continue?')) {
        return;
      }
      await privacyBoundary.deleteAllData(reason);
      setSettings(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete data';
      setError(errorMsg);
      throw err;
    }
  };

  return {
    settings,
    isLoading,
    error,
    setPrivacyMode,
    allowAnalytics,
    setRetentionDays,
    exportData,
    deleteAllData,
    shouldStoreJourney: privacyBoundary.shouldStoreJourney(),
    shouldTrackAnalytics: privacyBoundary.shouldTrackAnalytics(),
  };
};
