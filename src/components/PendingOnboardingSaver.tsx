/**
 * PendingOnboardingSaver.tsx
 *
 * Mount ครั้งเดียวใน App.tsx (ที่ไหนก็ได้ใต้ AuthProvider)
 * คอยเช็คว่ามีข้อมูล onboarding ค้างบันทึก (`pending_onboarding_save`
 * ใน localStorage — เขียนโดย ClaimAccount.tsx) หรือไม่
 *
 * เมื่อ session login สำเร็จ (ไม่ว่าจะมาจากหน้าไหนก็ตาม เพราะ magic link
 * redirect กลับมาที่ origin เสมอ) จะยิง POST ไปที่ /api/profile แล้ว
 * /api/blueprint ให้อัตโนมัติ แล้วเคลียร์ localStorage ทิ้ง
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { PendingOnboardingData } from '@/components/onboarding/ClaimAccount';

const STORAGE_KEY = 'pending_onboarding_save';

export function PendingOnboardingSaver() {
  const { session } = useAuth();
  const savingRef = useRef(false);

  useEffect(() => {
    if (!session?.access_token || savingRef.current) return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    savingRef.current = true;

    (async () => {
      try {
        const data: PendingOnboardingData = JSON.parse(raw);
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        };

        const profileRes = await fetch('/api/profile', {
          method: 'POST',
          headers,
          body: JSON.stringify(data.profile),
        });
        const profileJson = await profileRes.json().catch(() => null);

        await fetch('/api/blueprint', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...data.blueprint,
            profileId: profileJson?.profileId,
          }),
        });

        localStorage.removeItem(STORAGE_KEY);
        console.log('✅ Onboarding data saved to Supabase');
      } catch (err) {
        console.error('❌ Failed to save pending onboarding data:', err);
        // เก็บ localStorage ไว้ ลองใหม่รอบหน้าที่ session พร้อม
      } finally {
        savingRef.current = false;
      }
    })();
  }, [session]);

  return null;
}

export default PendingOnboardingSaver;
