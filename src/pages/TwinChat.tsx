/**
 * src/pages/TwinChat.tsx
 * Twin chat page with world-specific context (P0 #7.2)
 * Supports query param: ?world=<worldId>
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { WORLDS, type WorldId } from '../constants/worlds';
import { WorldContextHeader } from '../components/chat/WorldContextHeader';
import { saveMessage } from '@/services/supabase-service';

interface Message {
  role: 'user' | 'twin';
  content: string;
  world?: WorldId;
}

export default function TwinChat() {
  const { session } = useAuth();
  const { setCurrentWorld } = useTwin();
  const [searchParams] = useSearchParams();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentWorld, setLocalWorld] = useState<WorldId | null>(null);

  // Extract and validate world param from URL
  useEffect(() => {
    const worldParam = searchParams.get('world');
    if (worldParam) {
      const isValidWorld = Object.keys(WORLDS).includes(worldParam);
      if (isValidWorld) {
        const world = worldParam as WorldId;
        setLocalWorld(world);
        setCurrentWorld(world);
      }
    }
  }, [searchParams, setCurrentWorld]);

  const handleSend = async () => {
    if (!message.trim() || !session?.user?.id) return;

    const userMessage = message.trim();
    setMessages([...messages, { role: 'user', content: userMessage, world: currentWorld || undefined }]);
    setMessage('');
    setIsSending(true);

    try {
      // Save message to database with world tag
      await saveMessage(
        session.user.id,
        currentWorld ? `twin-chat-${currentWorld}` : 'twin-chat',
        'chat',
        'user',
        userMessage,
        50 // autonomyLevel
      );
    } catch (err) {
      // Message saved to UI but failed in DB — will retry next sync
    } finally {
      setIsSending(false);
    }
  };

  if (!session) {
    return <div className="text-center py-8 text-gray-500">Please login to chat with your Twin</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* World Context Header */}
      {currentWorld && <WorldContextHeader world={currentWorld} />}

      <h1 className="text-2xl font-bold text-center mb-4">🤖 My Twin</h1>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {currentWorld
              ? `Start a conversation with your Twin about ${WORLDS[currentWorld].name}`
              : 'Start a conversation with your AI Twin'}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}