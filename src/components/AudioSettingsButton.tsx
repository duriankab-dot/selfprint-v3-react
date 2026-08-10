import React, { useState } from 'react';
import AudioSettings from './AudioSettings';

/**
 * § 24: Audio Permission + Settings Button
 * Quick access to audio preferences from NavBar/Header
 */

export const AudioSettingsButton: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        title="Audio Settings"
        aria-label="Open audio settings"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          padding: '8px',
        }}
      >
        🎵
      </button>

      {showSettings && (
        <AudioSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

export default AudioSettingsButton;
