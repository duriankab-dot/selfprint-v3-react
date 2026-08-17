/**
 * usePushSubscription.ts
 *
 * Master Direction §26-27: Push Infrastructure
 *
 * Hook to manage Web Push subscription lifecycle:
 * 1. Check browser support (service worker + push API)
 * 2. Request notification permission
 * 3. Subscribe to push notifications
 * 4. Send subscription to backend (POST /api/push/subscribe)
 * 5. Handle errors gracefully
 *
 * Usage:
 * ```typescript
 * const { isSupported, isSubscribed, subscribe, unsubscribe, error } = usePushSubscription();
 * ```
 */

import { useState, useCallback, useEffect } from 'react';

export interface PushSubscriptionResult {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

export function usePushSubscription(): PushSubscriptionResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check browser support on mount
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    ) {
      setIsSupported(true);
    }
  }, []);

  // Check if already subscribed
  useEffect(() => {
    if (!isSupported) return;

    const checkSubscription = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      } catch (err) {
        console.warn('Failed to check push subscription:', err);
      }
    };

    checkSubscription();
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications ไม่ได้รับการรองรับบนอุปกรณ์นี้');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('คุณปฏิเสธการอนุญาตแจ้งเตือน');
        setIsLoading(false);
        return false;
      }

      // Step 2: Get service worker registration
      const reg = await navigator.serviceWorker.ready;

      // Step 3: Subscribe to push
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setError('VAPID public key ไม่ได้ตั้งค่า');
        setIsLoading(false);
        return false;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      // Step 4: Send subscription to backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(sub.getKey('p256dh') as ArrayBuffer | null),
            auth: arrayBufferToBase64(sub.getKey('auth') as ArrayBuffer | null),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'การสมัครสมาชิก Push ล้มเหลว';
      setError(msg);
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (!sub) {
        setIsLoading(false);
        return true;
      }

      // Unsubscribe from browser
      await sub.unsubscribe();

      // Notify backend (optional — proceed even if fails)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      await fetch(`${backendUrl}/api/push`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
        }),
      }).catch(() => {
        // Backend deletion is optional — proceed even if it fails
      });

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ยกเลิกการสมัครสมาชิก Push ล้มเหลว';
      setError(msg);
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────

/**
 * Convert base64 VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
