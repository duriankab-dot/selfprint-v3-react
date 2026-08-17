import React, { useEffect } from 'react';
import { usePopup } from '@/context/PopupContext';
import { useAudio } from '@/context/AudioContext';
import './ContextualPopup.css';

/**
 * Contextual Popup Component
 * § 28: Non-intrusive popups for discovery, patterns, milestones, re-engagement
 *
 * Features:
 * - Smooth fade in/out animations
 * - Auto-dismiss after duration
 * - User can close manually
 * - Respects accessibility (reduce-motion)
 * - Only shows one at a time (queues others)
 */

interface ContextualPopupProps {
  /**
   * Optional: Override auto-dismiss duration
   * If popup.duration is set, that takes precedence
   */
  defaultDuration?: number;
}

const ContextualPopup: React.FC<ContextualPopupProps> = ({ defaultDuration = 5000 }) => {
  const { currentPopup, dismissPopup } = usePopup();
  const { state: audioState } = useAudio();

  useEffect(() => {
    if (!currentPopup) return;

    const duration = currentPopup.duration || defaultDuration;

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      dismissPopup();
    }, duration);

    return () => clearTimeout(timer);
  }, [currentPopup, defaultDuration, dismissPopup]);

  if (!currentPopup) return null;

  const handleActionClick = () => {
    if (currentPopup.action?.onClick) {
      currentPopup.action.onClick();
    }
    dismissPopup();
  };

  const handleDismiss = () => {
    dismissPopup();
  };

  return (
    <div className={`contextual-popup contextual-popup-${currentPopup.type}`}>
      <div className="contextual-popup-content">
        {/* Icon + Title */}
        <div className="contextual-popup-header">
          {currentPopup.icon && <span className="contextual-popup-icon">{currentPopup.icon}</span>}
          <h3 className="contextual-popup-title">{currentPopup.title}</h3>
        </div>

        {/* Description */}
        <p className="contextual-popup-description">{currentPopup.description}</p>

        {/* Action Buttons */}
        <div className="contextual-popup-actions">
          {currentPopup.action && (
            <button
              className="contextual-popup-action-btn contextual-popup-primary"
              onClick={handleActionClick}
            >
              {currentPopup.action.label} →
            </button>
          )}

          {currentPopup.dismissible !== false && (
            <button
              className="contextual-popup-dismiss-btn"
              onClick={handleDismiss}
              aria-label="Close popup"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Progress bar (optional visual feedback) */}
        {currentPopup.duration && (
          <div
            className="contextual-popup-progress"
            style={{
              animationDuration: `${currentPopup.duration}ms`,
            }}
          />
        )}
      </div>

      {/* Sound effect on show (if enabled) */}
      {audioState.soundEnabled && <PopupSound popupType={currentPopup.type} />}
    </div>
  );
};

/**
 * Optional: Play sound effect on popup
 * Uses Web Audio API (no external files needed)
 */
const PopupSound: React.FC<{ popupType: string }> = ({ popupType }) => {
  React.useEffect(() => {
    // Create simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Different sound patterns for different popup types
    const frequencies: Record<string, number[]> = {
      discovery: [440, 550], // A4 → C#5
      pattern: [523, 587, 659], // C5 → D5 → E5 (ascending)
      milestone: [784, 784, 784], // G5 (strong beat)
      're-engagement': [440, 440, 550], // A4 → A4 → C#5
    };

    const freq = frequencies[popupType] || [440];

    freq.forEach((f, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.value = f;
      osc.type = 'sine';

      const startTime = audioContext.currentTime + index * 0.1;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }, [popupType]);

  return null;
};

export default ContextualPopup;
