// A7-TS-strict (5 ก.ย. 2026): ambient declarations for non-standard /
// vendor-prefixed Web APIs. These are not in lib.dom.d.ts by default but
// are supported by some browsers. Declaring them globally lets us drop
// `as any` casts from call sites.

export {};

declare global {
  interface Window {
    /**
     * Debug flag for Nova prompt logging. Set in browser console to enable.
     */
    __DEBUG_NOVA?: boolean;
    /**
     * WebKit-prefixed AudioContext constructor (older Safari).
     * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
     */
    webkitAudioContext?: typeof AudioContext;
    /**
     * WebKit-prefixed OfflineAudioContext constructor (older Safari).
     */
    webkitOfflineAudioContext?: typeof OfflineAudioContext;
    /**
     * Web Speech API entry points (Chrome, Edge, Safari).
     * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
     */
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    /**
     * Feature-detect Background Sync support (used by useJournalQueue).
     */
    SyncManager?: typeof SyncManagerImpl;
  }

  interface ServiceWorkerRegistration {
    /** Background Sync API — Chrome only; feature-detect via `'SyncManager' in window`. */
    sync?: SyncManagerImpl;
  }

  interface Navigator {
    /** Network Information API — vendor-prefixed in some browsers. */
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
    /** Battery Status API (deprecated in most browsers; here for completeness). */
    getBattery?: () => Promise<BatteryManager>;
  }

// A7-TS-strict: declare support types globally so call sites can reference them.
  interface Performance {
    /** Chrome-only: jsHeapSizeLimit / usedJSHeapSize / totalJSHeapSize (bytes). */
    memory?: {
      jsHeapSizeLimit: number;
      usedJSHeapSize: number;
      totalJSHeapSize: number;
    };
  }

  interface NetworkInformation {
    type?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    effectiveType?: string;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }

  // A7-TS-strict: minimal Background Sync API shape (Chrome only).
  interface SyncManagerImpl {
    register(tag: string): Promise<void>;
  }

  interface BatteryManager {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }

  // A7-TS-strict: minimal SpeechRecognition shape covering the fields used by
  // the codebase. The full Web Speech API surface is much larger; extend here
  // as needed.
  interface SpeechRecognitionInstance {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    onstart: (() => void) | null;
    onresult: ((event: { results: { transcript: string }[][] }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }
}
