/**
 * usePushSubscription.ts
 *
 * Master Direction §26-27 — Smart Push Notifications
 *
 * Handles:
 *  1. Requesting browser notification permission
 *  2. Subscribing to push via PushManager (VAPID)
 *  3. Persisting subscription to Supabase push_subscriptions table
 *  4. Unsubscribing + cleaning up
 *
 * Rules:
 *  - Never autosubscribe — always require explicit user action (§24)
 *  - userId from useAuth() only — never localStorage
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/services/supabase-service';
import { useAuth } from '@/context/AuthContext';

// ─── VAPID Public Key ─────────────────────────────────────────────────────────
// Set VITE_VAPID_PUBLIC_KEY in .env (generate with: npx web-push generate-vapid-keys)
const VAPID_PUBLIC_KEY = import.meta.env['VITE_VAPID_PUBLIC_KEY'] as string | undefined;

// ─── Types ────────────────────────────────────────────────────────────────────
export type PushPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export interface UsePushSubscriptionReturn {
  /** Current browser permission state */
  permissionStatus: PushPermissionStatus;
  /** Whether user is currently subscribed and stored in Supabase */
  isSubscribed: boolean;
  /** Whether an async operation is in progress */
  loading: boolean;
  /** Last error message, if any */
  error: string | null;
  /** Subscribe the user — asks for permission if not yet granted */
  subscribe: () => Promise<void>;
  /** Unsubscribe from push */
  unsubscribe: () => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePushSubscription(): UsePushSubscriptionReturn {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [permissionStatus, setPermissionStatus] = useState<PushPermissionStatus>(() => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission as PushPermissionStatus;
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Check existing subscription on mount ─────────────────────────────────
  useEffect(() => {
    if (!userId || !supabase) return;

    let cancelled = false;

    (async () => {
      const reg = await getServiceWorkerRegistration();
      if (!reg || cancelled) return;

      const existing = await reg.pushManager.getSubscription();
      if (!existing || cancelled) return;

      // verify it's saved in Supabase
      const { data } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('endpoint', existing.endpoint)
        .maybeSingle();

      if (!cancelled) {
        setIsSubscribed(!!data);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  // ── Subscribe ─────────────────────────────────────────────────────────────
  const subscribe = useCallback(async () => {
    setError(null);

    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermissionStatus('unsupported');
      setError('Browser นี้ไม่รองรับ Push Notifications');
      return;
    }

    if (!userId || !supabase) {
      setError('กรุณาเข้าสู่ระบบก่อนเปิดการแจ้งเตือน');
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      setError('Push ยังไม่ได้ตั้งค่า VAPID key — กรุณาแจ้งผู้ดูแลระบบ');
      return;
    }

    setLoading(true);

    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission as PushPermissionStatus);

      if (permission !== 'granted') {
        setError('ไม่ได้รับอนุญาตให้ส่ง Notification');
        return;
      }

      // 2. Get SW registration
      const reg = await getServiceWorkerRegistration();
      if (!reg) {
        setError('Service Worker ยังไม่พร้อม — ลองใหม่ในอีกสักครู่');
        return;
      }

      // 3. Subscribe to push
      const vapidKeyBytes = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyBytes.buffer.slice(
          vapidKeyBytes.byteOffset,
          vapidKeyBytes.byteOffset + vapidKeyBytes.byteLength
        ) as ArrayBuffer,
      });

      const json = subscription.toJSON();
      const keys = json.keys as { p256dh: string; auth: string };

      // 4. Persist to Supabase (upsert by user_id + endpoint)
      const { error: dbError } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: json.endpoint!,
          keys_p256dh: keys.p256dh,
          keys_auth: keys.auth,
        },
        { onConflict: 'user_id, endpoint' }
      );

      if (dbError) throw new Error(dbError.message);

      setIsSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ── Unsubscribe ───────────────────────────────────────────────────────────
  const unsubscribe = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const reg = await getServiceWorkerRegistration();
      const existing = await reg?.pushManager.getSubscription();

      if (existing) {
        const endpoint = existing.endpoint;
        await existing.unsubscribe();

        // Remove from Supabase
        if (userId && supabase) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', userId)
            .eq('endpoint', endpoint);
        }
      }

      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยกเลิก');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { permissionStatus, isSubscribed, loading, error, subscribe, unsubscribe };
}

export default usePushSubscription;
