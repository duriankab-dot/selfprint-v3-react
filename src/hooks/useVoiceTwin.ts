/**
 * useVoiceTwin.ts
 *
 * Master Direction §21-22 — Voice Twin
 *
 * Provides:
 *   - STT  (SpeechRecognition  — Web Speech API)
 *   - TTS  (SpeechSynthesis    — Web Speech API)
 *   - Adaptive voice per Experience mood (§22)
 *   - Audio ducking when Twin speaks (§23 principle)
 *
 * Rules:
 *   - User must explicitly start voice (§24 — no autoplay)
 *   - No audio libraries — Web Speech API only
 *   - Reduced-motion: TTS still works, animations are separate concern
 *   - Fallback: if browser lacks API, returns { supported: false }
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export type VoiceMode = 'idle' | 'listening' | 'processing' | 'speaking';

export interface VoiceTwinState {
  mode: VoiceMode;
  transcript: string;       // Live interim + final STT result
  isFinalTranscript: boolean;
  supported: boolean;       // Browser capability check
  sttError: string | null;
  ttsError: string | null;
}

export interface VoiceTwinActions {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, mood?: string) => void;
  stopSpeaking: () => void;
  reset: () => void;
}

// ============================================================================
// Voice params per mood (§22 — Adaptive Voice)
// ============================================================================

interface VoiceParams {
  rate: number;
  pitch: number;
  volume: number;
}

const MOOD_VOICE: Record<string, VoiceParams> = {
  calm:       { rate: 0.88, pitch: 1.0,  volume: 0.9 },
  reflective: { rate: 0.85, pitch: 0.97, volume: 0.85 },
  focus:      { rate: 1.05, pitch: 1.02, volume: 1.0 },
  stressed:   { rate: 0.90, pitch: 1.0,  volume: 0.9 },
  confident:  { rate: 1.0,  pitch: 1.0,  volume: 1.0 },
  ready:      { rate: 1.0,  pitch: 1.02, volume: 1.0 },
  drained:    { rate: 0.82, pitch: 0.95, volume: 0.8 },
  confused:   { rate: 0.90, pitch: 1.0,  volume: 0.9 },
  default:    { rate: 0.95, pitch: 1.0,  volume: 0.95 },
};

function voiceParams(mood?: string): VoiceParams {
  return MOOD_VOICE[mood ?? 'default'] ?? MOOD_VOICE.default;
}

// ============================================================================
// Feature detection
// ============================================================================

const STT_SUPPORTED =
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

const TTS_SUPPORTED =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

const SUPPORTED = STT_SUPPORTED || TTS_SUPPORTED;

// ============================================================================
// Hook
// ============================================================================

export function useVoiceTwin(options?: {
  language?: string;   // defaults 'th-TH'
  onTranscript?: (text: string) => void;
  onSpeakEnd?: () => void;
}) {
  const { language = 'th-TH', onTranscript, onSpeakEnd } = options ?? {};

  const [state, setState] = useState<VoiceTwinState>({
    mode: 'idle',
    transcript: '',
    isFinalTranscript: false,
    supported: SUPPORTED,
    sttError: null,
    ttsError: null,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ── Clean up on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (TTS_SUPPORTED) window.speechSynthesis.cancel();
    };
  }, []);

  // ── STT — start listening ────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!STT_SUPPORTED) return;

    // Stop TTS if speaking
    if (TTS_SUPPORTED) window.speechSynthesis.cancel();

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionCtor();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setState((s) => ({ ...s, mode: 'listening', transcript: '', isFinalTranscript: false, sttError: null }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      const transcript = (final || interim).trim();
      const isFinal = !!final;
      setState((s) => ({ ...s, transcript, isFinalTranscript: isFinal }));
      if (isFinal && onTranscript) onTranscript(transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setState((s) => ({
        ...s,
        mode: 'idle',
        sttError: event.error === 'no-speech'
          ? 'ไม่ได้ยินเสียง กรุณาลองอีกครั้ง'
          : `เกิดข้อผิดพลาด: ${event.error}`,
      }));
    };

    recognition.onend = () => {
      setState((s) => ({
        ...s,
        mode: s.mode === 'listening' ? 'idle' : s.mode,
      }));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, onTranscript]);

  // ── STT — stop ───────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState((s) => ({ ...s, mode: 'idle' }));
  }, []);

  // ── TTS — speak ──────────────────────────────────────────────────────────
  const speak = useCallback((text: string, mood?: string) => {
    if (!TTS_SUPPORTED) {
      setState((s) => ({ ...s, ttsError: 'เบราว์เซอร์นี้ไม่รองรับการพูด' }));
      return;
    }

    // Stop listening while speaking (interrupt)
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = language;

    const params = voiceParams(mood);
    utt.rate = params.rate;
    utt.pitch = params.pitch;
    utt.volume = params.volume;

    utt.onstart = () => {
      setState((s) => ({ ...s, mode: 'speaking', ttsError: null }));
    };

    utt.onend = () => {
      setState((s) => ({ ...s, mode: 'idle' }));
      onSpeakEnd?.();
    };

    utt.onerror = (e) => {
      setState((s) => ({
        ...s,
        mode: 'idle',
        ttsError: `เกิดข้อผิดพลาดในการพูด: ${e.error}`,
      }));
    };

    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [language, onSpeakEnd]);

  // ── TTS — stop ───────────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (TTS_SUPPORTED) window.speechSynthesis.cancel();
    setState((s) => ({ ...s, mode: 'idle' }));
  }, []);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    recognitionRef.current?.stop();
    if (TTS_SUPPORTED) window.speechSynthesis.cancel();
    setState({
      mode: 'idle',
      transcript: '',
      isFinalTranscript: false,
      supported: SUPPORTED,
      sttError: null,
      ttsError: null,
    });
  }, []);

  return { state, startListening, stopListening, speak, stopSpeaking, reset };
}
