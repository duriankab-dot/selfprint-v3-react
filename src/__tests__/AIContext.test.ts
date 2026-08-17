/**
 * AIContext.test.ts
 * Unit tests for AI Context and useAIContext hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AIProvider, useAIContext } from '../context/AIContext';

describe('AIContext', () => {
  it('should provide default values', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );

    const { result } = renderHook(() => useAIContext(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.activeAI).toBe('nova');
    expect(result.current.isTwinAwakened).toBe(false);
    expect(result.current.isNovaActive).toBe(true);
    expect(result.current.isTwinActive).toBe(false);
  });

  it('should switch to Nova', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );

    const { result } = renderHook(() => useAIContext(), { wrapper });

    act(() => {
      result.current.switchToNova();
    });

    expect(result.current.activeAI).toBe('nova');
    expect(result.current.isNovaActive).toBe(true);
  });

  it('should prevent switching to Twin before awakening', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );

    const { result } = renderHook(() => useAIContext(), { wrapper });

    act(() => {
      result.current.switchToTwin();
    });

    // Should stay on Nova
    expect(result.current.activeAI).toBe('nova');
    expect(result.current.isTwinAwakened).toBe(false);
  });

  it('should awaken Twin and switch to it', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );

    const { result } = renderHook(() => useAIContext(), { wrapper });

    act(() => {
      result.current.setTwinAwakened(true, 'Aria');
    });

    expect(result.current.isTwinAwakened).toBe(true);
    expect(result.current.twinName).toBe('Aria');
    expect(result.current.activeAI).toBe('twin');
    expect(result.current.isTwinActive).toBe(true);
    expect(result.current.isNovaActive).toBe(false);
  });

  it('should allow switching to Twin after awakening', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );

    const { result } = renderHook(() => useAIContext(), { wrapper });

    act(() => {
      result.current.setTwinAwakened(true, 'Aria');
      result.current.switchToNova();
    });

    expect(result.current.activeAI).toBe('nova');

    act(() => {
      result.current.switchToTwin();
    });

    expect(result.current.activeAI).toBe('twin');
  });

  it('should deawaken Twin and reset to Nova', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );

    const { result } = renderHook(() => useAIContext(), { wrapper });

    act(() => {
      result.current.setTwinAwakened(true, 'Aria');
    });

    expect(result.current.isTwinAwakened).toBe(true);

    act(() => {
      result.current.setTwinAwakened(false);
    });

    expect(result.current.isTwinAwakened).toBe(false);
    expect(result.current.twinName).toBeUndefined();
    expect(result.current.activeAI).toBe('nova');
  });

  it('should throw error if used outside provider', () => {
    expect(() => {
      renderHook(() => useAIContext());
    }).toThrow('useAIContext must be used within AIProvider');
  });
});
