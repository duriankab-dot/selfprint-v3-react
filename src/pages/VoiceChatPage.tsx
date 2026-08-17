/**
 * 🎤 VoiceChatPage.tsx — หน้าคุยกับ AI Twin ด้วยเสียง
 *
 * **Features:**
 * - Speech-to-text (input)
 * - Text-to-speech (output)
 * - Conversation history
 * - Voice settings
 * - Adaptive personality
 *
 * Route: `/voice`
 */

import React from 'react';
import VoiceChat from '@/components/features/VoiceChat';
import './voice-chat-page.css';

export const VoiceChatPage: React.FC = () => {
  return (
    <main className="voice-chat-page">
      <VoiceChat />
    </main>
  );
};

export default VoiceChatPage;
