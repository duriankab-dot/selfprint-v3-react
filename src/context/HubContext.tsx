import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { logEvent } from '../services/analytics';

export const HUBS = [
  'identity',
  'decision',
  'relationship',
  'career',
  'health',
  'money',
  'ai-twin',
  'learning',
  'creativity',
  'spirituality',
  'impact',
  'activities', // NEW: Activities hub (engagement + habit-building)
] as const;

export type Hub = typeof HUBS[number];

interface HubLog {
  hub: Hub;
  timestamp: number;
}

interface HubContextType {
  currentHub: Hub;
  hubHistory: HubLog[];
  switchHub: (newHub: Hub) => void;
}

const HUB_STORAGE_KEY = 'selfprint_hub';

function getStoredHub(): Hub | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(HUB_STORAGE_KEY);
  return stored && (HUBS as readonly string[]).includes(stored) ? (stored as Hub) : null;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export function HubProvider({ children }: { children: ReactNode }) {
  const storedHub = getStoredHub();
  const [currentHub, setCurrentHub] = useState<Hub>(storedHub ?? 'identity');
  const [hubHistory, setHubHistory] = useState<HubLog[]>([]);
  // Phase 5.7: analytics event ต้องรู้ userId จริง — อ่านผ่าน useContext ตรงๆ
  // (ไม่ใช้ useAuth() ที่ throw ถ้าไม่มี AuthProvider) เพราะ HubProvider มีเทส
  // ที่ render แบบยืนอิสระไม่มี AuthProvider ห่ออยู่ — ไม่มี provider ก็แค่ไม่มี
  // userId (analytics ไม่ log) ไม่ throw
  const authCtx = useContext(AuthContext);
  const userId = authCtx?.session?.user?.id;

  // ธีม (data-hub) ต้องตามทุกครั้งที่ hub เปลี่ยน ไม่ว่าจะเปลี่ยนจากจุดไหนของเว็บ
  // และต้องถูก apply ทันทีตั้งแต่ mount แรก (รวมกรณี hub มาจาก localStorage เดิม)
  useEffect(() => {
    document.documentElement.setAttribute('data-hub', currentHub);
  }, [currentHub]);

  const switchHub = useCallback(
    (newHub: Hub) => {
      if (!HUBS.includes(newHub)) return;

      setCurrentHub((prevHub) => {
        if (prevHub !== newHub) {
          logEvent(userId, 'hub_transition', { from: prevHub, to: newHub });
        }
        return newHub;
      });
      setHubHistory((prev) => [...prev, { hub: newHub, timestamp: Date.now() }]);
      localStorage.setItem(HUB_STORAGE_KEY, newHub);
    },
    [userId]
  );

  const value: HubContextType = {
    currentHub,
    hubHistory,
    switchHub,
  };

  return (
    <HubContext.Provider value={value}>
      {children}
    </HubContext.Provider>
  );
}

export function useHub() {
  const context = React.useContext(HubContext);
  if (!context) {
    throw new Error('useHub must be used within HubProvider');
  }
  return context;
}
