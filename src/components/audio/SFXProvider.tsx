/**
 * SFXProvider.tsx
 *
 * Global audio SFX context for the entire app.
 * Provides useSFX() hook that plays UI/Twin/Transition sounds based on context.
 *
 * Usage:
 *   <SFXProvider>
 *     <App />
 *   </SFXProvider>
 *
 * Inside components:
 *   const { ui, twin, transition } = useSFX();
 *   ui.play('click'); // plays UI click sound
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTwinSFX } from '@/hooks/useTwinSFX';
import { useTransitionSFX } from '@/hooks/useTransitionSFX';
import { useUISFX } from '@/hooks/useUISFX';

interface SFXContextValue {
  /** Play UI sound (default for button clicks) */
  ui: ReturnType<typeof useUISFX>;
  /** Play Twin SFX (for awakening, interaction events) */
  twin: ReturnType<typeof useTwinSFX>;
  /** Play transition SFX (for page/world/mode transitions) */
  transition: ReturnType<typeof useTransitionSFX>;
  /** Global enable/disable */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const SFXContext = createContext<SFXContextValue | null>(null);

export function useSFX(): SFXContextValue {
  const ctx = useContext(SFXContext);
  if (!ctx) throw new Error('useSFX must be used within SFXProvider');
  return ctx;
}

interface SFXProviderProps {
  children: ReactNode;
  /** Enable all SFX (default: true) */
  enabled?: boolean;
  /** Master volume 0–100 (default: 50) */
  volume?: number;
}

export function SFXProvider({ children, enabled = true, volume = 50 }: SFXProviderProps) {
  const [masterEnabled, setMasterEnabled] = React.useState(enabled);

  const ui = useUISFX({ enabled: masterEnabled, volume });
  const twin = useTwinSFX({ enabled: masterEnabled, volume });
  const transition = useTransitionSFX({ enabled: masterEnabled, volume });

  // Preload all SFX on mount (non-blocking)
  useEffect(() => {
    const timer = setTimeout(() => {
      ui.preloadAll();
      twin.preloadAll();
      transition.preloadAll();
    }, 1000); // Delay to not block initial render
    return () => clearTimeout(timer);
  }, []);

  const value = useMemo(
    () => ({ ui, twin, transition, enabled: masterEnabled, setEnabled: setMasterEnabled }),
    [ui, twin, transition, masterEnabled],
  );

  return <SFXContext.Provider value={value}>{children}</SFXContext.Provider>;
}

export default SFXProvider;
