import React, { useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
import { useLanguage } from '@/context/LanguageContext';
import './AudioSettings.css';

/**
 * Audio Settings Component
 * § 23 + § 24: Adaptive Background Music + Audio Permission
 *
 * Features:
 * - Enable/disable immersive experience (permission gate)
 * - Music ON/OFF toggle
 * - Sound ON/OFF toggle
 * - Voice ON/OFF toggle
 * - Volume slider
 * - Reduce Motion for accessibility
 */

interface AudioSettingsProps {
  compact?: boolean; // Minimal UI for inline settings
  onClose?: () => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({ compact = false, onClose }) => {
  const { state, toggleMusic, toggleSound, toggleVoice, setVolume, toggleReduceMotion } = useAudio();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Check if user has granted permission
  useEffect(() => {
    const permissionGranted = localStorage.getItem('selfprint-audio-permission-granted');
    if (!permissionGranted && !compact) {
      setShowPermissionPrompt(true);
    }
  }, [compact]);

  const handleEnableImmersive = () => {
    localStorage.setItem('selfprint-audio-permission-granted', 'true');
    toggleMusic();
    setShowPermissionPrompt(false);
  };

  if (compact) {
    return (
      <div className="audio-settings-compact">
        <div className="audio-control-row">
          <label className="audio-toggle">
            <input
              type="checkbox"
              checked={state.musicEnabled}
              onChange={toggleMusic}
              aria-label="Toggle background music"
            />
            <span>🎵 Music</span>
          </label>
          <label className="audio-toggle">
            <input
              type="checkbox"
              checked={state.soundEnabled}
              onChange={toggleSound}
              aria-label="Toggle sound effects"
            />
            <span>🔔 Effects</span>
          </label>
          <label className="audio-toggle">
            <input
              type="checkbox"
              checked={state.voiceEnabled}
              onChange={toggleVoice}
              aria-label="Toggle voice"
            />
            <span>🎤 Voice</span>
          </label>
        </div>

        {state.musicEnabled && (
          <div className="audio-volume-row">
            <label htmlFor="volume-slider">Volume:</label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="100"
              value={state.volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="audio-volume-slider"
            />
            <span className="audio-volume-display">{state.volume}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="audio-settings-modal">
      <div className="audio-settings-content">
        <h2>{isTh ? '🎵 ประสบการณ์อิมเมอร์ซีฟ' : '🎵 Immersive Experience'}</h2>

        {/* Permission Gate */}
        {showPermissionPrompt && (
          <div className="audio-permission-prompt">
            <p>{isTh ? '🎵 เปิดเพลงพื้นหลังเพื่อเพิ่มประสบการณ์?' : '🎵 Enable background music to enhance your experience?'}</p>
            <p className="permission-description">
              {isTh
                ? 'เพลงจะปรับตามช่วงเวลาของคุณ (ไตร่ตรอง, โฟกัส, ค้นพบ, เฉลิมฉลอง) และลดเสียงอัตโนมัติเมื่อ Twin พูด'
                : 'Music adapts to your journey (reflection, focus, discovery, celebration) and automatically reduces when your Twin speaks.'}
            </p>
            <div className="permission-actions">
              <button className="permission-enable" onClick={handleEnableImmersive}>
                {isTh ? '✨ เปิดใช้งาน' : '✨ Enable Immersive'}
              </button>
              <button className="permission-skip" onClick={() => setShowPermissionPrompt(false)}>
                {isTh ? 'ภายหลัง' : 'Maybe Later'}
              </button>
            </div>
          </div>
        )}

        {/* Controls (only show if permission granted or already enabled) */}
        {!showPermissionPrompt && (
          <div className="audio-settings-controls">
            {/* Music Toggle */}
            <div className="audio-setting-item">
              <label className="audio-setting-label">
                <input
                  type="checkbox"
                  checked={state.musicEnabled}
                  onChange={toggleMusic}
                  className="audio-setting-checkbox"
                />
                <span>{isTh ? '🎵 เพลงพื้นหลัง' : '🎵 Background Music'}</span>
              </label>
              <p className="audio-setting-desc">
                {isTh ? 'เพลง ambient ปรับตามโซนปัจจุบัน (ไตร่ตรอง, โฟกัส, ค้นพบ)' : 'Ambient music adapts to your current hub (reflection, focus, discovery)'}
              </p>
            </div>

            {/* Volume Slider (only when music enabled) */}
            {state.musicEnabled && (
              <div className="audio-setting-item">
                <label htmlFor="music-volume" className="audio-setting-label">
                  {isTh ? 'ระดับเสียง' : 'Volume'}
                </label>
                <div className="audio-volume-control">
                  <span className="volume-icon">🔇</span>
                  <input
                    id="music-volume"
                    type="range"
                    min="0"
                    max="100"
                    value={state.volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="audio-volume-slider"
                  />
                  <span className="volume-icon">🔊</span>
                  <span className="volume-percent">{state.volume}%</span>
                </div>
              </div>
            )}

            {/* Sound Effects Toggle */}
            <div className="audio-setting-item">
              <label className="audio-setting-label">
                <input
                  type="checkbox"
                  checked={state.soundEnabled}
                  onChange={toggleSound}
                  className="audio-setting-checkbox"
                />
                <span>{isTh ? '🔔 เสียงเอฟเฟกต์' : '🔔 Sound Effects'}</span>
              </label>
              <p className="audio-setting-desc">
                {isTh ? 'เสียงตอบสนองสำหรับการกระทำและ milestone' : 'Feedback sounds for interactions and milestones'}
              </p>
            </div>

            {/* Voice Toggle */}
            <div className="audio-setting-item">
              <label className="audio-setting-label">
                <input
                  type="checkbox"
                  checked={state.voiceEnabled}
                  onChange={toggleVoice}
                  className="audio-setting-checkbox"
                />
                <span>{isTh ? '🎤 เสียง Twin' : '🎤 Voice'}</span>
              </label>
              <p className="audio-setting-desc">
                {isTh ? 'Twin ของคุณจะพูด insight ออกเสียง' : 'Your Twin can speak insights aloud'}
              </p>
            </div>

            {/* Reduce Motion */}
            <div className="audio-setting-item">
              <label className="audio-setting-label">
                <input
                  type="checkbox"
                  checked={state.reduceMotion}
                  onChange={toggleReduceMotion}
                  className="audio-setting-checkbox"
                />
                <span>{isTh ? '⏸️ ลดการเคลื่อนไหว' : '⏸️ Reduce Motion'}</span>
              </label>
              <p className="audio-setting-desc">
                {isTh ? 'ลด animation และ transition' : 'Minimize animations and transitions'}
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <button className="audio-settings-close" onClick={onClose}>
            {isTh ? '✕ ปิด' : '✕ Close'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioSettings;
