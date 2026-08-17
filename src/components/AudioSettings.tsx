import React, { useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
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
        <h2>Immersive Experience</h2>

        {/* Permission Gate */}
        {showPermissionPrompt && (
          <div className="audio-permission-prompt">
            <p>🎵 Enable background music to enhance your experience?</p>
            <p className="permission-description">
              Music adapts to your journey (reflection, focus, discovery, celebration) and automatically reduces when
              your Twin speaks.
            </p>
            <div className="permission-actions">
              <button className="permission-enable" onClick={handleEnableImmersive}>
                ✨ Enable Immersive
              </button>
              <button className="permission-skip" onClick={() => setShowPermissionPrompt(false)}>
                Maybe Later
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
                <span>🎵 Background Music</span>
              </label>
              <p className="audio-setting-desc">Ambient music adapts to your current hub (reflection, focus, discovery)</p>
            </div>

            {/* Volume Slider (only when music enabled) */}
            {state.musicEnabled && (
              <div className="audio-setting-item">
                <label htmlFor="music-volume" className="audio-setting-label">
                  Volume
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
                <span>🔔 Sound Effects</span>
              </label>
              <p className="audio-setting-desc">Feedback sounds for interactions and milestones</p>
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
                <span>🎤 Voice</span>
              </label>
              <p className="audio-setting-desc">Your Twin can speak insights aloud</p>
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
                <span>⏸️ Reduce Motion</span>
              </label>
              <p className="audio-setting-desc">Minimize animations and transitions</p>
            </div>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <button className="audio-settings-close" onClick={onClose}>
            ✕ Close
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioSettings;
