import React, { useEffect, useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import './TwinEvolutionScene.css';

/**
 * § 30: Twin Evolution Scene
 *
 * Celebratory animation shown when user unlocks Twin Evolution
 * (typically at 30 reflections milestone)
 *
 * Visual elements:
 * - Twin silhouette transformation
 * - Particle burst effect
 * - Glow + light rays
 * - Celebratory audio (optional)
 * - Confetti-like particles
 */

interface TwinEvolutionSceneProps {
  /** Trigger animation (pass any value to restart) */
  trigger?: number | string;

  /** Called when animation completes */
  onComplete?: () => void;

  /** Custom message (default: "Twin Evolution Unlocked!") */
  message?: string;

  /** Show close button (default: true) */
  showClose?: boolean;

  /** Auto-close after ms (default: 5000) */
  autoDismiss?: number;
}

const TwinEvolutionScene: React.FC<TwinEvolutionSceneProps> = ({
  trigger,
  onComplete,
  message = '✨ Twin Evolution Unlocked! ✨',
  showClose = true,
  autoDismiss = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { state: audioState } = useAudio();

  useEffect(() => {
    if (!trigger) return;

    setIsVisible(true);
    setIsAnimating(true);

    // Play celebration sound
    if (audioState.soundEnabled) {
      playCelebrationSound();
    }

    // Auto-dismiss
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [trigger, audioState.soundEnabled, autoDismiss]);

  const handleClose = () => {
    setIsAnimating(false);

    // Wait for animation to finish
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 500);
  };

  const playCelebrationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Ascending notes: C5, E5, G5, C6 (celebratory chord progression)
      const frequencies = [523, 659, 784, 1046];
      const startTime = audioContext.currentTime;

      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = freq;
        osc.type = 'sine';

        const noteStart = startTime + index * 0.15;
        gain.gain.setValueAtTime(0.2, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.05, noteStart + 0.3);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch (error) {
      // Failed to play sound
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`twin-evolution-overlay ${isAnimating ? 'active' : 'closing'}`}>
      {/* Background fade */}
      <div className="twin-evolution-bg" />

      {/* Main scene container */}
      <div className="twin-evolution-container">
        {/* Light rays background */}
        <div className="twin-evolution-rays">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="ray"
              style={{
                transform: `rotate(${(i / 8) * 360}deg)`,
              }}
            />
          ))}
        </div>

        {/* Twin silhouette with transformation */}
        <div className="twin-evolution-body">
          {/* Before state (fading out) */}
          <div className="twin-before">
            <div className="twin-silhouette initial" />
          </div>

          {/* Transformation middle (glow effect) */}
          <div className="twin-transform">
            <div className="twin-glow" />
            <div className="twin-particles">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="particle" style={{
                  '--delay': `${i * 0.1}s`,
                  '--angle': `${(i / 20) * 360}deg`,
                } as any} />
              ))}
            </div>
          </div>

          {/* After state (fading in) */}
          <div className="twin-after">
            <div className="twin-silhouette evolved" />
            <div className="twin-aura" />
          </div>
        </div>

        {/* Message */}
        <div className="twin-evolution-message">
          <h2 className="twin-evolution-title">{message}</h2>
          <p className="twin-evolution-subtitle">Your Twin is now more evolved and insightful.</p>
        </div>

        {/* Close button */}
        {showClose && (
          <button
            className="twin-evolution-close"
            onClick={handleClose}
            aria-label="Close evolution scene"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default TwinEvolutionScene;
