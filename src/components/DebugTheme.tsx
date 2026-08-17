/**
 * Debug Component — Shows CSS variables in real-time
 * Remove this after testing
 */

import { useEmotion } from '../context/EmotionContext';
import { useHub } from '../context/HubContext';
import { useTheme } from '../context/ThemeContext';

export function DebugTheme() {
  const { mood } = useEmotion();
  const { currentHub } = useHub();
  const { theme } = useTheme();

  const accentPrimary = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-accent-primary')
    .trim();

  const accentSecondary = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-accent-secondary')
    .trim();

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>🎨 Theme Debug</div>
      <div>Hub: <strong>{currentHub}</strong></div>
      <div>Mood: <strong>{mood}</strong></div>
      <div>Mode: <strong>{theme}</strong></div>
      <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #666' }} />
      <div style={{ marginBottom: '4px' }}>
        Accent Primary:
        <div
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            backgroundColor: accentPrimary || '#ccc',
            marginLeft: '4px',
            border: '1px solid #fff',
            verticalAlign: 'middle',
          }}
        />
        <code style={{ marginLeft: '4px', fontSize: '10px' }}>{accentPrimary || 'NOT FOUND'}</code>
      </div>
      <div>
        Accent Secondary:
        <div
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            backgroundColor: accentSecondary || '#ccc',
            marginLeft: '4px',
            border: '1px solid #fff',
            verticalAlign: 'middle',
          }}
        />
        <code style={{ marginLeft: '4px', fontSize: '10px' }}>{accentSecondary || 'NOT FOUND'}</code>
      </div>
    </div>
  );
}
