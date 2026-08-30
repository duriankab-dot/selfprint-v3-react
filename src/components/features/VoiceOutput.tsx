/**
 * 🔊 VoiceOutput Component — Text-to-speech output
 */

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import './voice-output.css';

interface VoiceOutputProps {
  isSpeaking: boolean;
  message: string;
  settings: {
    tone: string;
    pace: string;
    language: string;
    volume: number;
  };
}

const VoiceOutput: React.FC<VoiceOutputProps> = ({
  isSpeaking,
  message,
  settings,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const handleSpeak = () => {
    if (!message) {
      alert(isTh ? 'ไม่มีข้อความให้อ่าน' : 'No message to read');
      return;
    }

    // Mock text-to-speech
    alert(
      isTh
        ? `กำลังอ่าน (Tone: ${settings.tone}, Pace: ${settings.pace}, Volume: ${settings.volume}%)`
        : `Speaking (Tone: ${settings.tone}, Pace: ${settings.pace}, Volume: ${settings.volume}%)`
    );
  };

  return (
    <div className="voice-output">
      <button
        className={`voice-output__btn${isSpeaking ? ' speaking' : ''}`}
        onClick={handleSpeak}
        disabled={!message}
        title={isTh ? 'อ่านคำตอบ' : 'Read the answer'}
      >
        🔊
      </button>
      <span className="voice-output__status">
        {isSpeaking ? (isTh ? 'กำลังอ่าน...' : 'Speaking...') : (isTh ? 'พร้อมอ่าน' : 'Ready to speak')}
      </span>
    </div>
  );
};

export default VoiceOutput;
