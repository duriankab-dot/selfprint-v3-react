/**
 * Adaptive Audio Engine
 * § P3.1 - Network & Device Aware Audio Optimization
 *
 * Dynamically adjusts audio quality based on:
 * - Network speed (4G, 3G, 2G, offline)
 * - Device capabilities (memory, CPU, battery)
 * - User preferences (save data, low power mode)
 */

import type { MusicExperience } from '@/context/AudioContext';

/**
 * Network detection via Connection API
 */
export interface NetworkProfile {
  type: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'ethernet' | 'wifi' | 'unknown';
  downlink: number; // Mbps estimate
  rtt: number; // milliseconds
  saveData: boolean;
  effectiveType: string;
}

/**
 * Device capability detection
 */
export interface DeviceProfile {
  memory: number; // MB available
  cpuCapability: 'low' | 'medium' | 'high';
  batteryPercent: number; // 0-100
  isLowPowerMode: boolean;
  isThrottled: boolean;
}

/**
 * Computed audio strategy
 */
export interface AudioProfile {
  quality: 'silence' | 'oscillator-simple' | 'oscillator-full' | 'mp3-low' | 'mp3-high';
  preloadStrategy: 'none' | 'lazy' | 'prefetch' | 'preload';
  cacheStrategy: 'none' | 'memory' | 'indexeddb';
  shouldStream: boolean;
  maxConcurrentOscillators: number;
}

/**
 * Adaptive Audio Engine
 */
export class AdaptiveAudioEngine {
  private networkProfile: NetworkProfile | null = null;
  private deviceProfile: DeviceProfile | null = null;
  private cachedAudioResources = new Map<string, AudioBuffer>();
  private connectionChangeListener: ((profile: NetworkProfile) => void) | null = null;
  private _networkChangeHandler: (() => void) | null = null;

  /**
   * Detect network profile using Connection API
   */
  getNetworkProfile(): NetworkProfile {
    if (this.networkProfile) {
      return this.networkProfile;
    }

    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (!connection) {
      return {
        type: 'unknown',
        downlink: 1,
        rtt: 100,
        saveData: false,
        effectiveType: 'unknown',
      };
    }

    const profile: NetworkProfile = {
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 1,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false,
    };

    this.networkProfile = profile;

    // Listen for network changes — store handler reference so it can be removed in destroy()
    if (connection.addEventListener && !this._networkChangeHandler) {
      this._networkChangeHandler = () => {
        this.networkProfile = null; // Invalidate cache
        const updatedProfile = this.getNetworkProfile();
        this.connectionChangeListener?.(updatedProfile);
      };
      connection.addEventListener('change', this._networkChangeHandler);
    }

    return profile;
  }

  /**
   * Detect device capabilities
   */
  getDeviceProfile(): DeviceProfile {
    if (this.deviceProfile) {
      return this.deviceProfile;
    }

    const profile: DeviceProfile = {
      memory: this.getAvailableMemory(),
      cpuCapability: this.getCPUCapability(),
      batteryPercent: this.getBatteryPercent(),
      isLowPowerMode: this.isLowPowerMode(),
      isThrottled: this.isThrottled(),
    };

    this.deviceProfile = profile;
    return profile;
  }

  /**
   * Get available device memory (MB)
   */
  private getAvailableMemory(): number {
    const perf = (performance as any);
    if (perf.memory) {
      return perf.memory.jsHeapSizeLimit / (1024 * 1024);
    }
    // Fallback: assume medium device (512MB)
    return 512;
  }

  /**
   * Estimate CPU capability from device info
   */
  private getCPUCapability(): 'low' | 'medium' | 'high' {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = this.getAvailableMemory();

    if (cores <= 2 && memory < 512) return 'low';
    if (cores >= 8 && memory >= 1024) return 'high';
    return 'medium';
  }

  /**
   * Get battery level (%)
   */
  private getBatteryPercent(): number {
    const battery = (navigator as any).getBattery?.() || null;
    if (battery && battery.level !== undefined) {
      return Math.round(battery.level * 100);
    }
    return 100; // Assume full if unknown
  }

  /**
   * Check if device is in low power mode
   */
  private isLowPowerMode(): boolean {
    const battery = (navigator as any).getBattery?.() || null;
    return battery?.level !== undefined && battery.level < 0.2;
  }

  /**
   * Check if page is being throttled
   */
  private isThrottled(): boolean {
    // RequestIdleCallback + performance.now() can detect CPU throttling
    let throttled = false;
    const startTime = performance.now();

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const elapsed = performance.now() - startTime;
        throttled = elapsed > 100; // Significant delay = throttled
      });
    }

    return throttled;
  }

  /**
   * Compute optimal audio profile based on network & device
   */
  computeAudioProfile(network: NetworkProfile, device: DeviceProfile): AudioProfile {
    const isSlowNetwork = ['slow-2g', '2g', '3g'].includes(network.type);
    const isLowMemory = device.memory < 256;
    const isLowBattery = device.batteryPercent < 20 || device.isLowPowerMode;
    const isCPULow = device.cpuCapability === 'low' || device.isThrottled;

    // Priority: Battery > Network > Memory > CPU

    if (isLowBattery) {
      return {
        quality: 'silence', // Silent mode on low battery
        preloadStrategy: 'none',
        cacheStrategy: 'none',
        shouldStream: false,
        maxConcurrentOscillators: 0,
      };
    }

    if (isSlowNetwork && network.saveData) {
      return {
        quality: 'oscillator-simple',
        preloadStrategy: 'none',
        cacheStrategy: 'none',
        shouldStream: false,
        maxConcurrentOscillators: 1, // Single frequency only
      };
    }

    if (isLowMemory) {
      return {
        quality: 'oscillator-simple',
        preloadStrategy: 'lazy',
        cacheStrategy: 'memory', // Limited cache
        shouldStream: false,
        maxConcurrentOscillators: 2,
      };
    }

    if (isSlowNetwork || isCPULow) {
      return {
        quality: 'oscillator-full',
        preloadStrategy: 'lazy',
        cacheStrategy: 'memory',
        shouldStream: false,
        maxConcurrentOscillators: 3,
      };
    }

    // Good network & device
    return {
      quality: 'mp3-high',
      preloadStrategy: 'prefetch',
      cacheStrategy: 'indexeddb',
      shouldStream: true,
      maxConcurrentOscillators: 4,
    };
  }

  /**
   * Get current recommended audio profile
   */
  getRecommendedProfile(): AudioProfile {
    const network = this.getNetworkProfile();
    const device = this.getDeviceProfile();
    return this.computeAudioProfile(network, device);
  }

  /**
   * Destroy: remove event listeners and clear state to prevent memory leaks
   */
  destroy(): void {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;
    if (connection && this._networkChangeHandler) {
      connection.removeEventListener('change', this._networkChangeHandler);
      this._networkChangeHandler = null;
    }
    this.cachedAudioResources.clear();
    this.networkProfile = null;
    this.deviceProfile = null;
    this.connectionChangeListener = null;
  }

  /**
   * Register callback for network changes
   */
  onNetworkChange(callback: (profile: NetworkProfile) => void): void {
    this.connectionChangeListener = callback;
  }

  /**
   * Get audio source URL based on profile
   */
  getAudioUrl(experience: MusicExperience, profile: AudioProfile): string | null {
    if (profile.quality === 'silence') return null;

    // Map experience to CDN URLs (production would use real CDN)
    const audioMap: Record<MusicExperience, Record<string, string>> = {
      reflection: {
        'mp3-high': '/audio/reflection-high.mp3',
        'mp3-low': '/audio/reflection-low.mp3',
        'oscillator-full': '', // Will use oscillators
        'oscillator-simple': '',
        'silence': '',
      },
      focus: {
        'mp3-high': '/audio/focus-high.mp3',
        'mp3-low': '/audio/focus-low.mp3',
        'oscillator-full': '',
        'oscillator-simple': '',
        'silence': '',
      },
      discovery: {
        'mp3-high': '/audio/discovery-high.mp3',
        'mp3-low': '/audio/discovery-low.mp3',
        'oscillator-full': '',
        'oscillator-simple': '',
        'silence': '',
      },
      deep_reflection: {
        'mp3-high': '/audio/deep-reflection-high.mp3',
        'mp3-low': '/audio/deep-reflection-low.mp3',
        'oscillator-full': '',
        'oscillator-simple': '',
        'silence': '',
      },
      celebration: {
        'mp3-high': '/audio/celebration-high.mp3',
        'mp3-low': '/audio/celebration-low.mp3',
        'oscillator-full': '',
        'oscillator-simple': '',
        'silence': '',
      },
      idle: {
        'mp3-high': '',
        'mp3-low': '',
        'oscillator-full': '',
        'oscillator-simple': '',
        'silence': '',
      },
    };

    return audioMap[experience]?.[profile.quality] || null;
  }

  /**
   * Load audio with caching strategy
   */
  async loadAudio(url: string, profile: AudioProfile): Promise<AudioBuffer | null> {
    if (!url) return null;

    // Check memory cache first
    if (this.cachedAudioResources.has(url)) {
      return this.cachedAudioResources.get(url)!;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Store in appropriate cache
      if (profile.cacheStrategy === 'memory') {
        this.cachedAudioResources.set(url, audioBuffer);
      } else if (profile.cacheStrategy === 'indexeddb') {
        await this.cacheInIndexedDB(url, arrayBuffer);
      }

      return audioBuffer;
    } catch (error) {
      console.error(`[AdaptiveAudio] Failed to load ${url}:`, error);
      return null;
    }
  }

  /**
   * Cache audio in IndexedDB for large files
   */
  private async cacheInIndexedDB(url: string, arrayBuffer: ArrayBuffer): Promise<void> {
    if (!('indexedDB' in window)) return;

    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('selfprint-audio', 1);
        request.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('audio')) {
            db.createObjectStore('audio');
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const tx = db.transaction('audio', 'readwrite');
      const store = tx.objectStore('audio');
      store.put(arrayBuffer, url);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(undefined);
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.warn('[AdaptiveAudio] IndexedDB cache failed:', error);
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    this.cachedAudioResources.clear();

    if ('indexedDB' in window) {
      try {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('selfprint-audio', 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        const tx = db.transaction('audio', 'readwrite');
        const store = tx.objectStore('audio');
        store.clear();

        await new Promise((resolve, reject) => {
          tx.oncomplete = () => resolve(undefined);
          tx.onerror = () => reject(tx.error);
        });
      } catch (error) {
        console.warn('[AdaptiveAudio] Cache clear failed:', error);
      }
    }
  }
}

/**
 * Singleton instance
 */
export const adaptiveAudioEngine = new AdaptiveAudioEngine();
