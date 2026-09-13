/**
 * useScrollLock.ts
 *
 * Locks body scroll when chat is open — prevents background page scrolling
 * while allowing internal message area to scroll independently.
 *
 * Usage:
 *   const { isLocked, lock, unlock } = useScrollLock();
 *   // When chat mounts: lock()
 *   // When chat unmounts: unlock()
 */

import { useCallback, useState } from 'react';

export function useScrollLock() {
  const [isLocked, setIsLocked] = useState(false);

  const lock = useCallback(() => {
    setIsLocked(true);
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    const scrollY = document.body.style.top;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
  }, []);

  return { isLocked, lock, unlock };
}
