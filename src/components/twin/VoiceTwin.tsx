/**
 * VoiceTwin.tsx
 *
 * Master Direction §21-22 — Voice Twin
 *
 * UI for:
 *  - Talk to your Twin (STT → send to chat)
 *  - Twin speaks response (TTS)
 *  - Start / Stop / Interrupt controls
 *  - Text fallback if no mic/speaker
 *  - Accessibility controls
 *
 * §24: Voice requires user's explicit action — no autoplay.
 * §22: Voice params adapt per mood.
 */

import React, { useState, useCallback } from 'react';
import { useVoiceTwin } from '@/hooks/useVoiceTwin';
import type { VoiceMode } from '@/hooks/useVoiceTwin';
import { useLanguage } from '@/context/LanguageContext';

// ============================================================================
// Props
// ============================================================================

export interface VoiceTwinProps {
  /** Current experience mood — drives adaptive voice (§22) */
  mood?: string;
  /** When STT produces a final transcript, call this to send to chat */
  onUserSpeech: (transcript: string) => void;
  /** If parent wants Twin to say something (pass text here) */
  twinSpeechText?: string;
  /** Language override (default th-TH) */
  language?: string;
}

// ============================================================================
// Mode label helper
// ============================================================================

const MODE_LABEL_TH: Record<VoiceMode, string> = {
  idle:       'กดพูดคุยกับ Twin',
  listening:  '🎤 กำลังฟัง...',
  processing: '⏳ กำลังประมวลผล...',
  speaking:   '🔊 Twin กำลังพูด...',
};

const MODE_LABEL_EN: Record<VoiceMode, string> = {
  idle:       'Press to talk with Twin',
  listening:  '🎤 Listening...',
  processing: '⏳ Processing...',
  speaking:   '🔊 Twin is speaking...',
};

const MODE_ARIA_TH: Record<VoiceMode, string> = {
  idle:       'เริ่มพูดคุยกับ Twin',
  listening:  'Twin กำลังฟัง — กดเพื่อหยุด',
  processing: 'กำลังประมวลผล',
  speaking:   'Twin กำลังพูด — กดเพื่อหยุด',
};

const MODE_ARIA_EN: Record<VoiceMode, string> = {
  idle:       'Start talking with Twin',
  listening:  'Twin is listening — press to stop',
  processing: 'Processing',
  speaking:   'Twin is speaking — press to stop',
};

// ============================================================================
// Component
// ============================================================================

export function VoiceTwin({ mood, onUserSpeech, twinSpeechText, language = 'th-TH' }: VoiceTwinProps) {
  const { language: uiLanguage } = useLanguage();
  const isTh = uiLanguage === 'th';
  const MODE_LABEL = isTh ? MODE_LABEL_TH : MODE_LABEL_EN;
  const MODE_ARIA = isTh ? MODE_ARIA_TH : MODE_ARIA_EN;

  const [consentGiven, setConsentGiven] = useState(() =>
    localStorage.getItem('sp-voice-consent') === 'true'
  );

  const { state, startListening, stopListening, speak, stopSpeaking, reset } =
    useVoiceTwin({
      language,
      onTranscript: (text) => {
        if (text) onUserSpeech(text);
      },
    });

  // When parent supplies text for Twin to speak (e.g. AI response)
  React.useEffect(() => {
    if (twinSpeechText && consentGiven) {
      speak(twinSpeechText, mood);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twinSpeechText]);

  const handleMainButton = useCallback(() => {
    if (!consentGiven) {
      const ok = window.confirm(
        isTh
          ? 'เปิดโหมด Voice Twin?\n\nTwin จะฟังเสียงคุณและพูดตอบกลับ คุณสามารถปิดได้ตลอดเวลา'
          : 'Turn on Voice Twin mode?\n\nYour Twin will listen and speak back. You can turn it off anytime.'
      );
      if (!ok) return;
      localStorage.setItem('sp-voice-consent', 'true');
      setConsentGiven(true);
    }

    switch (state.mode) {
      case 'idle':
        startListening();
        break;
      case 'listening':
        stopListening();
        break;
      case 'speaking':
        stopSpeaking();
        break;
      default:
        break;
    }
  }, [consentGiven, state.mode, startListening, stopListening, stopSpeaking, isTh]);

  if (!state.supported) {
    return (
      <div className="voice-twin voice-twin--unsupported">
        <p className="voice-unsupported-msg">
          {isTh
            ? 'เบราว์เซอร์นี้ไม่รองรับ Voice Mode — ใช้ Text Mode แทนได้เลย'
            : "This browser doesn't support Voice Mode — use Text Mode instead"}
        </p>
      </div>
    );
  }

  const isActive = state.mode !== 'idle';
  const canInterrupt = state.mode === 'listening' || state.mode === 'speaking';

  return (
    <div className={`voice-twin voice-twin--${state.mode}`} aria-live="polite">
      {/* Main orb button */}
      <button
        className={`voice-orb voice-orb--${state.mode}`}
        onClick={handleMainButton}
        aria-label={MODE_ARIA[state.mode]}
        disabled={state.mode === 'processing'}
      >
        <span className="voice-orb-icon" aria-hidden="true">
          {state.mode === 'listening' ? '🎤'
            : state.mode === 'speaking' ? '🔊'
            : state.mode === 'processing' ? '⏳'
            : '💬'}
        </span>
        <span className="voice-orb-ripple" aria-hidden="true" />
      </button>

      {/* Status label */}
      <p className="voice-status" aria-live="polite">
        {MODE_LABEL[state.mode]}
      </p>

      {/* Live transcript */}
      {state.transcript && (
        <div className="voice-transcript" aria-label={isTh ? 'ข้อความที่ Twin ได้ยิน' : 'What Twin heard'}>
          <span className={state.isFinalTranscript ? 'voice-transcript--final' : 'voice-transcript--interim'}>
            {state.transcript}
          </span>
        </div>
      )}

      {/* Interrupt button */}
      {canInterrupt && (
        <button
          className="voice-interrupt-btn"
          onClick={() => {
            stopListening();
            stopSpeaking();
          }}
          aria-label={isTh ? 'หยุดทันที' : 'Stop now'}
        >
          ⏹ {isTh ? 'หยุด' : 'Stop'}
        </button>
      )}

      {/* Reset */}
      {isActive && (
        <button className="voice-reset-btn" onClick={reset} aria-label={isTh ? 'รีเซ็ต Voice Mode' : 'Reset Voice Mode'}>
          {isTh ? 'รีเซ็ต' : 'Reset'}
        </button>
      )}

      {/* Errors */}
      {(state.sttError || state.ttsError) && (
        <p className="voice-error" role="alert">
          {state.sttError ?? state.ttsError}
        </p>
      )}

      {/* Text fallback hint */}
      {!consentGiven && (
        <p className="voice-fallback-hint">
          {isTh
            ? 'กดปุ่มด้านบนเพื่อเริ่ม Voice Mode — หรือพิมพ์ใน Text Mode ด้านล่าง'
            : 'Press the button above to start Voice Mode — or type in Text Mode below'}
        </p>
      )}
    </div>
  );
}

export default VoiceTwin;
