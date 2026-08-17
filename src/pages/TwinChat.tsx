/**
 * TwinChat.tsx
 * Personal AI Twin chat interface with world-specific expertise
 *
 * IDENTITY: Twin = Personal expert (NOT Nova)
 * PHASE: Act III+ (Life, growth, expertise per world)
 * WORLD AWARENESS: Twin adapts expertise based on current world
 * QUERY PARAM: ?world=<worldId> (optional)
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { WORLDS, type WorldId } from '../constants/worlds';
import { WorldContextHeader } from '../components/chat/WorldContextHeader';
import { WorldTabs } from '../components/WorldTabs';
import { saveMessage } from '@/services/supabase-service';
import { callTwinAPI } from '../services/TwinAPIService';
import * as DecisionService from '../services/DecisionService';

interface Message {
  role: 'user' | 'twin';
  content: string;
  world?: WorldId;
  options?: string[]; // Extracted options from Twin response
  selectedChoice?: string; // User's selected option
}

export default function TwinChat() {
  const { session } = useAuth();
  const { twin, setCurrentWorld } = useTwin();
  const [searchParams] = useSearchParams();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWorld, setLocalWorld] = useState<WorldId | null>(null);
  const [savingDecisionIndex, setSavingDecisionIndex] = useState<number | null>(null);
  const [savedDecisionIds, setSavedDecisionIds] = useState<Set<number>>(new Set());

  // GUARD: Check if Twin exists
  if (!twin) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4">
        <p className="text-gray-500 mb-4">Your Twin hasn't awakened yet. Complete Core Awakening first.</p>
      </div>
    );
  }

  // GUARD: Check if user is logged in
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4">
        <p className="text-gray-500 mb-4">Please login to chat with your Twin</p>
      </div>
    );
  }

  // Extract and validate world param from URL
  useEffect(() => {
    const worldParam = searchParams.get('world');
    if (worldParam && typeof worldParam === 'string') {
      const isValidWorld = Object.keys(WORLDS).includes(worldParam);
      if (isValidWorld) {
        const world = worldParam as WorldId;
        setLocalWorld(world);
        setCurrentWorld(world);
      }
    }
  }, [searchParams, setCurrentWorld]);


  const handleSaveDecision = async (messageIndex: number) => {
    if (!session.user?.id || !currentWorld) return;

    setSavingDecisionIndex(messageIndex);

    try {
      // Find the user message and Twin response
      let userMessage = '';
      let twinMessage = '';

      for (let i = messageIndex; i >= 0; i--) {
        if (messages[i].role === 'user' && !userMessage) {
          userMessage = messages[i].content;
        }
        if (messages[i].role === 'twin' && !twinMessage) {
          twinMessage = messages[i].content;
        }
      }

      if (!userMessage || !twinMessage) {
        throw new Error('Could not find decision and response');
      }

      // Get message data
      const twinMsg = messages[messageIndex];
      const options = twinMsg.options && twinMsg.options.length > 0
        ? twinMsg.options
        : ['Accepted', 'Deferred', 'Rejected'];
      const choice = twinMsg.selectedChoice || 'Accepted';

      // Record decision with world context
      const decision = await DecisionService.recordDecision(
        session.user.id,
        currentWorld,
        userMessage,
        options,
        twinMessage,
        choice
      );

      if (decision) {
        // Mark this message index as having a saved decision
        setSavedDecisionIds(prev => new Set(prev).add(messageIndex));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save decision';
      console.error('Save decision error:', err);
      setError(errorMsg);
    } finally {
      setSavingDecisionIndex(null);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setIsSending(true);
    setError(null);

    try {
      // GUARD: Ensure userId exists
      if (!session.user?.id) {
        throw new Error('User session lost');
      }

      // Add user message to UI immediately
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        world: currentWorld || undefined
      }]);

      // Save message to database with world tag
      await saveMessage(
        session.user.id,
        currentWorld ? `twin-chat-${currentWorld}` : 'twin-chat',
        'chat',
        'user',
        userMessage,
        50 // autonomyLevel
      );

      // Convert messages to API format (role: 'user' | 'assistant')
      const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = messages
        .filter(m => m.role === 'user' || m.role === 'twin')
        .map(m => ({
          role: (m.role === 'twin' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content
        }))
        .concat([{ role: 'user' as const, content: userMessage }]);

      // Call Twin API with world-aware expertise
      const twinProfile = JSON.stringify({
        name: twin.name,
        maturityScore: twin.maturityScore || 30,
      });

      const twinResponse = await callTwinAPI(
        apiMessages,
        twin.name || 'Twin',
        twinProfile,
        currentWorld || undefined // World-aware system prompt (or undefined)
      );

      // Save Twin's response to database (role must be 'user' | 'assistant')
      await saveMessage(
        session.user.id,
        currentWorld ? `twin-chat-${currentWorld}` : 'twin-chat',
        'chat',
        'assistant',
        twinResponse,
        50 // autonomyLevel
      );

      // Extract options from Twin response
      const options = extractOptions(twinResponse);

      // Add Twin response to messages with extracted options
      setMessages(prev => [...prev, {
        role: 'twin',
        content: twinResponse,
        world: currentWorld || undefined,
        options: options.length > 0 ? options : undefined,
      }]);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMsg);
      console.error('Twin message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleWorldSelect = (world: WorldId) => {
    setLocalWorld(world);
    setCurrentWorld(world);
  };

  /**
   * Extract options from Twin response
   * Looks for numbered lists (1., 2., 3.) or bullet points
   */
  const extractOptions = (text: string): string[] => {
    const lines = text.split('\n');
    const options: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Match "1. Option text" or "- Option text"
      const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
      const bulletMatch = trimmed.match(/^[-•]\s+(.+)$/);

      if (numberedMatch) {
        options.push(numberedMatch[1]);
      } else if (bulletMatch) {
        options.push(bulletMatch[1]);
      }
    }

    // Return up to 5 options (reasonable limit)
    return options.slice(0, 5);
  };

  const handleSelectChoice = (messageIndex: number, choice: string) => {
    setMessages(prev =>
      prev.map((msg, idx) =>
        idx === messageIndex ? { ...msg, selectedChoice: choice } : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* World Context Header */}
      {currentWorld && <WorldContextHeader world={currentWorld} />}

      <h1 className="text-2xl font-bold text-center mb-4">
        💫 {twin.name || 'My Twin'}
      </h1>

      {/* World Selector Tabs */}
      <WorldTabs currentWorld={currentWorld} onWorldSelect={handleWorldSelect} className="mb-4" />

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {currentWorld
              ? `Start a conversation with your Twin about ${WORLDS[currentWorld]?.name || currentWorld}`
              : 'Start a conversation with your AI Twin'}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.content}
                </div>
              </div>
              {/* Options selector (if Twin response has options) */}
              {msg.role === 'twin' && msg.options && msg.options.length > 0 && !savedDecisionIds.has(idx) && (
                <div className="flex flex-wrap gap-2 justify-start mt-2 ml-0">
                  {msg.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectChoice(idx, option)}
                      className={`text-xs px-3 py-1 rounded border transition-colors ${
                        msg.selectedChoice === option
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              {/* Save Decision button for Twin messages */}
              {msg.role === 'twin' && currentWorld && !savedDecisionIds.has(idx) && (
                <div className="flex justify-start mt-2 ml-0">
                  <button
                    onClick={() => handleSaveDecision(idx)}
                    disabled={savingDecisionIndex === idx || (msg.options && msg.options.length > 0 && !msg.selectedChoice)}
                    className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={msg.options && msg.options.length > 0 && !msg.selectedChoice ? 'Select an option first' : 'Save as decision'}
                  >
                    {savingDecisionIndex === idx ? 'Saving...' : '💾 Save as Decision'}
                  </button>
                </div>
              )}
              {savedDecisionIds.has(idx) && (
                <div className="flex justify-start mt-1 ml-0">
                  <span className="text-xs text-green-600 font-semibold">✅ Decision saved</span>
                </div>
              )}
            </div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
          placeholder={currentWorld ? `Ask your Twin about ${WORLDS[currentWorld]?.name}...` : 'Message your Twin...'}
          disabled={isSending}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}