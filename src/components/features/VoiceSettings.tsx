/**
 * ⚙️ VoiceSettings Component — Voice configuration
 */

import React from 'react';
import './voice-settings.css';

interface VoiceSettingsProps {
  settings: {
    tone: 'warm' | 'professional' | 'friendly' | 'analytical';
    pace: 'slow' | 'normal' | 'fast';
    language: 'th' | 'en';
    volume: number;
  };
  onChange: (settings: any) => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ settings, onChange }) => {
  const handleChange = (key: string, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="voice-settings">
      <h3>⚙️ ตั้งค่าเสียง</h3>

      <div className="settings-group">
        <label>💭 Tone (บุคลิกเสียง)</label>
        <select
          value={settings.tone}
          onChange={(e) => handleChange('tone', e.target.value)}
        >
          <option value="warm">🌟 Warm (อบอุ่น)</option>
          <option value="professional">💼 Professional (มืออาชีพ)</option>
          <option value="friendly">😊 Friendly (เป็นกันเอง)</option>
          <option value="analytical">🧠 Analytical (วิเคราะห์)</option>
        </select>
      </div>

      <div className="settings-group">
        <label>⏱️ Pace (ความเร็ว)</label>
        <select
          value={settings.pace}
          onChange={(e) => handleChange('pace', e.target.value)}
        >
          <option value="slow">🐢 Slow (ช้า)</option>
          <option value="normal">▶️ Normal (ปกติ)</option>
          <option value="fast">🚀 Fast (เร็ว)</option>
        </select>
      </div>

      <div className="settings-group">
        <label>🌐 Language (ภาษา)</label>
        <select
          value={settings.language}
          onChange={(e) => handleChange('language', e.target.value)}
        >
          <option value="th">🇹🇭 Thai (ไทย)</option>
          <option value="en">🇺🇸 English</option>
        </select>
      </div>

      <div className="settings-group">
        <label>🔊 Volume ({settings.volume}%)</label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.volume}
          onChange={(e) => handleChange('volume', parseInt(e.target.value))}
          className="volume-slider"
        />
      </div>
    </div>
  );
};

export default VoiceSettings;
