/**
 * useChat.ts
 *
 * Hook สำหรับจัดการ chat กับ Nova
 * - ใช้ selfprintChat API wrapper
 * - รองรับ 1,296 personality combos (18 archetypes × 12 hubs × 6 moods)
 * - จำ conversation history
 * - จัดการ loading/error
 */

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useHub } from '@/context/HubContext';
import { useEmotion } from '@/context/EmotionContext';
import { useTwin } from '@/context/TwinContext';
import { useAuth } from '@/context/AuthContext';
import { selfprintChat, type SelfprintChatResponse } from '@/lib/api/selfprintChat';
import { saveMessage, getChatHistory } from '@/services/supabase-service';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (userMessage: string) => Promise<void>;
  clearChat: () => void;
  autonomyLevel?: number;
}

export function useChat(autonomyLevel: number = 50): UseChatReturn {
  const { currentHub: hub } = useHub();
  const { mood } = useEmotion();
  const { twin } = useTwin();
  const { session } = useAuth();

  // Alias สำหรับให้ readable
  const currentHub = hub;
  const currentMood = mood;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * โหลด chat history จาก Supabase เมื่อ component mount
   */
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const loadChatHistory = async () => {
      try {
        const history = await getChatHistory(userId, undefined, 100);
        if (history && history.length > 0) {
          setMessages(history as Message[]);
          console.log('📚 Loaded', history.length, 'messages from Supabase');
        }
      } catch (err) {
        console.warn('⚠️ Failed to load chat history:', err);
        // Don't block chat if history load fails
      }
    };

    loadChatHistory();
  }, [session]);

  /**
   * ส่งข้อความไป Nova via selfprintChat
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;
      if (!currentHub || !currentMood) {
        setError('ต้องเลือก hub และ mood ก่อน');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Record start time for response time tracking
        const startTime = Date.now();

        // เพิ่มข้อความผู้ใช้เข้า state
        const userMsg: Message = {
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);

        // เรียก selfprintChat API — ต้องมี userId เสมอ (แม้ยังไม่ login ก็ใช้
        // 'anonymous' เป็น placeholder ได้ เพราะ API นี้แค่ต้องการ string ไม่ได้
        // เอาไปเขียน Supabase ตรงๆ) ส่วนการบันทึกลง Supabase จริงด้านล่าง ใช้
        // realUserId (จาก Supabase Auth session) เท่านั้น ไม่ใช้ค่านี้
        const chatApiUserId = session?.user?.id || 'anonymous';
        const realUserId = session?.user?.id;
        const sessionId = localStorage.getItem('sessionId') || `session-${Date.now()}`;

        const chatResponse: SelfprintChatResponse = await selfprintChat({
          userId: chatApiUserId,
          sessionId,
          hub: currentHub as any,
          mood: currentMood as any,
          archetype: twin?.primaryArchetype,
          question: userMessage,
          history: messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          twinProfile: twin ? {
            id: twin.id,
            userId: twin.userId,
            name: twin.name,
            primaryArchetype: twin.primaryArchetype,
            secondaryArchetype: twin.secondaryArchetype,
            maturityScore: twin.maturityScore,
            createdAt: new Date(twin.createdAt).toISOString(),
          } : undefined,
          birthData: twin?.birthData,
          plan: 'starter',
        });

        // Calculate response time
        const responseTime = Date.now() - startTime;

        // เพิ่มข้อความ Nova เข้า state
        const assistantMsg: Message = {
          role: 'assistant',
          content: chatResponse.response.text,
          timestamp: chatResponse.metadata.timestamp,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // บันทึกลงไป Supabase (optional — ต้อง login จริงเท่านั้น ใช้ realUserId
        // จาก Supabase Auth session ไม่ใช่ localStorage 'userId' ที่ไม่เคยถูก
        // set จริงที่ไหนเลย — เดิมเป็น bug ที่ทำให้ path นี้ไม่เคยรันเลยใน
        // production ดู docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md หัวข้อ 5.4)
        if (realUserId) {
          try {
            await saveMessage(realUserId, currentHub, currentMood, 'user', userMessage, autonomyLevel);
            await saveMessage(realUserId, currentHub, currentMood, 'assistant', chatResponse.response.text, autonomyLevel);

            // เขียนลง decision_log ผ่าน /api/autonomy-log (server-side, JWT
            // verify แล้วเอา user_id จาก token เสมอ — ดู comment หัวไฟล์
            // api/autonomy-log.ts) แทนการเขียนตรงจาก client เหมือนเดิม —
            // endpoint นี้เคย deploy อยู่เฉยๆ ไม่มีใครเรียก ตอนนี้ต่อเข้าจริง
            // และปิดช่องโหว่ trust-client-user_id ไปพร้อมกัน
            //
            // ค่าที่ใช้เป็นสัญญาณจริงเท่าที่มี ไม่เดามั่ว:
            // - autonomy_level: ค่าจาก slider ที่ user ตั้งเอง (ของจริง)
            // - confidence: autonomy_level/100 — ใช้สัญญาณเดียวกับ autonomy
            //   เพราะยังไม่มีการวัด "ความมั่นใจ" แยกต่างหากจริงๆ
            // - hesitation: ยังไม่มีสัญญาณจริงมาคำนวณ (ไม่มี NLP วัดจากข้อความ)
            //   ปล่อยเป็น 0.5 กลางๆ ตรงๆ แทนการเดาตัวเลข
            // - response_time_ms: เวลาที่ Claude API ตอบกลับ (responseTime ด้านบน)
            //   — นี่คือ API latency ไม่ใช่เวลาที่ user ใช้คิดตัดสินใจ (ยังไม่มีทาง
            //   วัดอย่างหลังได้จริงตอนนี้) ตั้งชื่อ comment ไว้ให้ชัดกันสับสนทีหลัง
            if (session?.access_token) {
              await fetch('/api/autonomy-log', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  hub: currentHub,
                  mood: currentMood,
                  autonomy_level: autonomyLevel,
                  confidence: autonomyLevel / 100,
                  hesitation: 0.5,
                  response_time_ms: responseTime,
                  message_length: userMessage.length,
                  response_length: chatResponse.response.text.length,
                }),
              });
            }
          } catch (dbErr) {
            console.warn('⚠️ Failed to save to Supabase:', dbErr);
          }
        }

        console.log('✅ Chat response:', {
          responseTime,
          tokens: `${chatResponse.metadata.inputTokens} → ${chatResponse.metadata.outputTokens}`,
          maturity: chatResponse.persona.maturityLevel,
        });
      } catch (err) {
        const errorMsg = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
        setError(errorMsg);
        console.error('Chat error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentHub, currentMood, messages, autonomyLevel, twin, session]
  );

  /**
   * ล้าง chat history
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}