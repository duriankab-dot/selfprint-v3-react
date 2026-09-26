/**
 * MemoryRetrieval.tsx — TC-503: Memory retrieval UI component
 *
 * Reusable component for memory search with relevance preview.
 * Can be embedded in other pages.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTwin } from '@/context/TwinContext';
import { useLanguage } from '@/context/LanguageContext';
import { getRecentlyLearned, type LearnedMemory } from '@/lib/memory/getTwinKnowledge';
import { WORLDS } from '@/constants/worlds';

interface MemoryRetrievalProps {
  twinId?: string;
  onMemorySelect?: (memory: LearnedMemory) => void;
  maxResults?: number;
  showWorldFilter?: boolean;
  showRelevance?: boolean;
  placeholder?: string;
}

export const MemoryRetrieval: React.FC<MemoryRetrievalProps> = ({
  twinId: propTwinId,
  onMemorySelect,
  maxResults = 10,
  showWorldFilter = true,
  showRelevance = true,
  placeholder,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { twin } = useTwin();
  const twinId = propTwinId ?? twin?.id;

  const [memories, setMemories] = useState<LearnedMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [worldFilter, setWorldFilter] = useState<string>('all');

  useEffect(() => {
    if (!twinId) {
      setMemories([]);
      return;
    }
    loadMemories();
  }, [twinId]);

  const loadMemories = async () => {
    if (!twinId) return;
    setLoading(true);
    try {
      const data = await getRecentlyLearned(twinId, maxResults * 3);
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const scoredMemories = useMemo(() => {
    const now = Date.now();
    return memories.map((m) => {
      const age = m.createdAt ? now - new Date(m.createdAt).getTime() : Infinity;
      const recencyScore = Math.max(0, 1 - age / (60 * 24 * 60 * 60 * 1000));
      const searchBoost = search && m.content.toLowerCase().includes(search.toLowerCase()) ? 0.4 : 0;
      const worldBoost = worldFilter !== 'all' && m.worldId === worldFilter ? 0.2 : 0;
      return { ...m, relevanceScore: Math.min(1, recencyScore + searchBoost + worldBoost) };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [memories, search, worldFilter]);

  const filteredMemories = scoredMemories
    .filter((m) => m.content.toLowerCase().includes(search.toLowerCase()))
    .slice(0, maxResults);

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
      });
    } catch {
      return '';
    }
  };

  if (!twinId) return null;

  return (
    <div className="memory-retrieval">
      <div className="memory-retrieval__search" style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder ?? (isTh ? 'ค้นหาความทรงจำ...' : 'Search memories...')}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
          />
        </div>
        {showWorldFilter && (
          <select
            value={worldFilter}
            onChange={(e) => setWorldFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontSize: 14,
              minWidth: 140,
            }}
          >
            <option value="all">{isTh ? 'ทุกโลก' : 'All Worlds'}</option>
            {Object.entries(WORLDS).map(([id, w]) => (
              <option key={id} value={id}>{isTh ? w.nameTh : w.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <div className="memory-retrieval__loading" style={{ padding: '1rem', textAlign: 'center', opacity: 0.6 }}>
          {isTh ? 'กำลังค้นหา...' : 'Searching...'}
        </div>
      )}

      {!loading && filteredMemories.length === 0 && (
        <div className="memory-retrieval__empty" style={{ padding: '1rem', textAlign: 'center', opacity: 0.5 }}>
          {isTh ? 'ไม่พบความทรงจำ' : 'No memories found'}
        </div>
      )}

      {!loading && filteredMemories.length > 0 && (
        <div className="memory-retrieval__results" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredMemories.map((memory) => (
            <div
              key={memory.id}
              className="memory-retrieval__item"
              onClick={() => onMemorySelect?.(memory)}
              style={{
                padding: '12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                cursor: onMemorySelect ? 'pointer' : 'default',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 6px', lineHeight: 1.5, fontSize: 14 }}>{memory.content}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, opacity: 0.7 }}>
                  <span>🌍 {getWorldLabel(memory.worldId)}</span>
                  <span>📅 {formatDate(memory.createdAt)}</span>
                  {showRelevance && (
                    <span style={{ color: memory.relevanceScore > 0.6 ? 'var(--color-success)' : memory.relevanceScore > 0.3 ? 'var(--color-warning)' : 'var(--color-error)', fontWeight: 600 }}>
                      {Math.round(memory.relevanceScore * 100)}%
                    </span>
                  )}
                </div>
              </div>
              {onMemorySelect && (
                <span style={{ opacity: 0.5 }}>→</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryRetrieval;