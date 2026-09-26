/**
 * MemoryPanel.tsx — TC-501: Memory panel in LivingTwin
 *
 * Shows recently learned memories with relevance scoring and context preview.
 * Integrates with getTwinKnowledge.ts for real data.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTwin } from '@/context/TwinContext';
import { useLanguage } from '@/context/LanguageContext';
import { getRecentlyLearned, forgetMemory, type LearnedMemory } from '@/lib/memory/getTwinKnowledge';
import { WORLDS } from '@/constants/worlds';

interface MemoryPanelProps {
  twinId: string;
  maxItems?: number;
  showForget?: boolean;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  twinId,
  maxItems = 5,
  showForget = true,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { currentWorld } = useTwin();

  const [memories, setMemories] = useState<LearnedMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [forgetting, setForgetting] = useState<string | null>(null);

  useEffect(() => {
    if (!twinId) return;
    loadMemories();
  }, [twinId]);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const data = await getRecentlyLearned(twinId, maxItems * 2);
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Score memories by recency + relevance (simple heuristic)
  const scoredMemories = useMemo(() => {
    const now = Date.now();
    return memories.map((m) => {
      const age = m.createdAt ? now - new Date(m.createdAt).getTime() : Infinity;
      const recencyScore = Math.max(0, 1 - age / (30 * 24 * 60 * 60 * 1000));
      const worldBoost = m.worldId && currentWorld === m.worldId ? 0.3 : 0;
      return { ...m, relevanceScore: Math.min(1, recencyScore + worldBoost) };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [memories, currentWorld]);

  const handleForget = async (memoryId: string) => {
    if (!twinId) return;
    setForgetting(memoryId);
    const ok = await forgetMemory(memoryId, twinId);
    if (ok) {
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    }
    setForgetting(null);
  };

  const getWorldLabel = (worldId: string | null): string => {
    if (!worldId) return isTh ? 'ทั่วไป' : 'General';
    const w = WORLDS[worldId as keyof typeof WORLDS];
    return isTh ? (w?.nameTh ?? worldId) : (w?.name ?? worldId);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (!twinId) return null;

  return (
    <div className="memory-panel">
      <div className="memory-panel__header">
        <h3>
          <span className="memory-panel__icon">🧠</span>
          {isTh ? 'ความทรงจำล่าสุด' : 'Recent Memories'}
          <span className="memory-panel__count">({scoredMemories.length})</span>
        </h3>
        {scoredMemories.length > 0 && (
          <span className="memory-panel__legend">
            {isTh ? 'คะแนน = ความเกี่ยวข้อง + ความใหม่' : 'Score = Relevance + Recency'}
          </span>
        )}
      </div>

      {loading && (
        <div className="memory-panel__loading">
          <span className="spinner" />
          {isTh ? 'กำลังโหลดความทรงจำ...' : 'Loading memories...'}
        </div>
      )}

      {!loading && scoredMemories.length === 0 && (
        <div className="memory-panel__empty">
          {isTh
            ? 'ยังไม่มีความทรงจำ — เริ่มคุยกับ Twin หรือบันทึก Memory'
            : 'No memories yet — chat with Twin or record memories'}
        </div>
      )}

      {!loading && scoredMemories.length > 0 && (
        <div className="memory-panel__list" data-testid="memory-list">
          {scoredMemories.slice(0, maxItems).map((memory) => (
            <MemoryItem
              key={memory.id}
              memory={memory}
              worldLabel={getWorldLabel(memory.worldId)}
              formattedDate={formatDate(memory.createdAt)}
              onForget={showForget ? () => handleForget(memory.id) : undefined}
              isForgetting={forgetting === memory.id}
              relevanceScore={memory.relevanceScore}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface MemoryItemProps {
  memory: LearnedMemory;
  worldLabel: string;
  formattedDate: string;
  onForget?: () => void;
  isForgetting: boolean;
  relevanceScore: number;
}

function MemoryItem({
  memory,
  worldLabel,
  formattedDate,
  onForget,
  isForgetting,
  relevanceScore,
}: MemoryItemProps) {
  const relevancePct = Math.round(relevanceScore * 100);
  const color = relevanceScore > 0.7 ? 'var(--color-success)' : relevanceScore > 0.4 ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div className="memory-panel__item" data-testid={`memory-${memory.id}`}>
      <div className="memory-panel__content">
        <p className="memory-panel__text">{memory.content}</p>
        <div className="memory-panel__meta">
          <span className="memory-panel__world">{worldLabel}</span>
          <span className="memory-panel__date">{formattedDate}</span>
          <span
            className="memory-panel__relevance"
            style={{ color }}
            title={`${relevancePct}% relevant`}
          >
            {relevancePct}%
          </span>
        </div>
      </div>
      {onForget && (
        <button
          className="memory-panel__forget"
          onClick={onForget}
          disabled={isForgetting}
          aria-label="Forget this memory"
        >
          {isForgetting ? '⏳' : '🗑️'}
        </button>
      )}
    </div>
  );
}

export default MemoryPanel;