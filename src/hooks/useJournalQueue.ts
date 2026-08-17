/**
 * useJournalQueue — § 37 Offline Journal Queue
 *
 * ทำหน้าที่:
 * - Save message offline (IndexedDB) เมื่อ connection fail
 * - Track online/offline status
 * - Sync queue เมื่อ online
 * - Provide feedback: "saving locally...", "syncing..."
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  initJournalDB,
  addToQueue,
  getUnSyncedMessages,
  markSynced,
  markSyncFailed,
} from '@/lib/storage/journalQueueDB';

export type QueueStatus = 'online' | 'offline' | 'syncing';

interface UseJournalQueueReturn {
  status: QueueStatus;
  pendingCount: number;
  lastError: string | null;

  // Save message locally (when API fails)
  saveOffline: (content: string, hub?: string, mood?: string) => Promise<string>;

  // Sync queue (call API for each unsync message)
  syncQueue: () => Promise<void>;

  // Register for sync (browser will call when online)
  requestBackgroundSync: () => Promise<void>;
}

export function useJournalQueue(): UseJournalQueueReturn {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [status, setStatus] = useState<QueueStatus>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  // Initialize IndexedDB on mount
  useEffect(() => {
    initJournalDB().catch((err) => {
      console.error('[useJournalQueue] Failed to init DB:', err);
      setLastError('Failed to initialize offline storage');
    });
  }, []);

  // Track online/offline
  useEffect(() => {
    const handleOnline = () => {
      console.log('[useJournalQueue] Online');
      setStatus('online');
    };

    const handleOffline = () => {
      console.log('[useJournalQueue] Offline');
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending count on mount + after sync
  useEffect(() => {
    if (!userId) return;

    const updateCount = async () => {
      const messages = await getUnSyncedMessages(userId);
      setPendingCount(messages.length);
    };

    updateCount();
  }, [userId]);

  // Listen for sync messages from Service Worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_JOURNAL') {
        console.log('[useJournalQueue] SW triggered sync');
        syncQueue().catch((err) => {
          console.error('[useJournalQueue] Sync failed:', err);
        });
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [userId]);

  /**
   * Save message to IndexedDB (offline)
   */
  const saveOffline = useCallback(
    async (content: string, hub?: string, mood?: string): Promise<string> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const id = await addToQueue({
        userId,
        content,
        hub,
        mood,
        createdAt: new Date().toISOString(),
        syncAttempts: 0,
      });

      console.log('[useJournalQueue] Saved offline:', id);
      setPendingCount((prev) => prev + 1);
      return id;
    },
    [userId]
  );

  /**
   * Sync queue — call API for each unsync message
   */
  const syncQueue = useCallback(async () => {
    if (!userId || status === 'offline') {
      console.log('[useJournalQueue] Skip sync (offline or no user)');
      return;
    }

    if (status === 'syncing') {
      return; // Already syncing
    }

    setStatus('syncing');
    setLastError(null);

    try {
      const messages = await getUnSyncedMessages(userId);
      console.log(`[useJournalQueue] Syncing ${messages.length} messages`);

      let successCount = 0;
      let failCount = 0;

      for (const msg of messages) {
        try {
          // Call backend to sync
          const response = await fetch('/api/journal-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              queueId: msg.id,
              content: msg.content,
              hub: msg.hub,
              mood: msg.mood,
              createdAt: msg.createdAt,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          await markSynced(msg.id);
          successCount++;
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error';
          await markSyncFailed(msg.id, errMsg);
          failCount++;
          console.warn(`[useJournalQueue] Failed to sync ${msg.id}:`, errMsg);
        }
      }

      console.log(`[useJournalQueue] Sync complete: ${successCount} success, ${failCount} failed`);
      setPendingCount(failCount);

      if (failCount > 0) {
        setLastError(`${failCount} message(s) failed to sync`);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Sync failed';
      setLastError(errMsg);
      console.error('[useJournalQueue] Sync error:', err);
    } finally {
      setStatus(navigator.onLine ? 'online' : 'offline');
    }
  }, [userId, status, session?.access_token]);

  /**
   * Request browser background sync (when online)
   */
  const requestBackgroundSync = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.warn('[useJournalQueue] Background Sync not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('journal-sync');
      console.log('[useJournalQueue] Background sync registered');
    } catch (err) {
      console.warn('[useJournalQueue] Failed to register background sync:', err);
    }
  }, []);

  return {
    status,
    pendingCount,
    lastError,
    saveOffline,
    syncQueue,
    requestBackgroundSync,
  };
}
