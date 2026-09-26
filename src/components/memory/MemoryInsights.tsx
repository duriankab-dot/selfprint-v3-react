/**
 * MemoryInsights.tsx — TC-503: Memory retrieval UI with relevance scoring
 *
 * Standalone page/component for exploring all memories with search, filter,
 * and context injection preview.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTwin } from '@/context/TwinContext';
import { useLanguage } from '@/context/LanguageContext';
import { getRecentlyLearned, forgetMemory, type LearnedMemory } from '@/lib/memory/getTwinKnowledge';
import { WORLDS } from '@/constants/worlds';
import { BackButton } from '@/components/common/BackButton';
import { AppShell } from '@/components/layout/AppShell';

interface MemoryInsightsPageProps {}

export const MemoryInsightsPage: React.FC<MemoryInsightsPageProps> = () => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { twin } = useTwin();

  const [memories, setMemories] = useState<LearnedMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [worldFilter, setWorldFilter] = useState<string>('all');
  const [forgetting, setForgetting] = useState<string | null>(null);

  useEffect(() => {
    if (!twin?.id) return;
    loadMemories();
  }, [twin?.id]);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const data = await getRecentlyLearned(twin!.id, 200);
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForget = async (memoryId: string) => {
    if (!twin?.id) return;
    setForgetting(memoryId);
    const ok = await forgetMemory(memoryId, twin.id);
    if (ok) {
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    }
    setForgetting(null);
  };

  // Scoring
  const scoredMemories = useMemo(() => {
    const now = Date.now();
    return memories.map((m) => {
      const age = m.createdAt ? now - new Date(m.createdAt).getTime() : Infinity;
      const recencyScore = Math.max(0, 1 - age / (90 * 24 * 60 * 60 * 1000)); // 90 days
      const searchBoost = search && m.content.toLowerCase().includes(search.toLowerCase()) ? 0.5 : 0;
      const worldBoost = worldFilter !== 'all' && m.worldId === worldFilter ? 0.3 : 0;
      return { ...m, relevanceScore: Math.min(1, recencyScore + searchBoost + worldBoost) };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [memories, search, worldFilter]);

  const filteredMemories = scoredMemories.filter((m) =>
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  const getWorldLabel = (worldId: string | null): string => {
    if (!worldId) return isTh ? 'ทั่วไป' : 'General';
    const w = WORLDS[worldId as keyof typeof WORLDS];
    return isTh ? (w?.nameTh ?? worldId) : (w?.name ?? worldId);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const worldOptions = [
    { id: 'all', label: isTh ? 'ทั้งหมด' : 'All' },
    ...Object.entries(WORLDS).map(([id, w]) => ({
      id,
      label: isTh ? w.nameTh : w.name,
    })),
  ];

  return (
    <AppShell>
      <div className="page-content" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <BackButton fallbackTo="/dashboard" />
          <h1>{isTh ? '🧠 Memory Insights' : '🧠 Memory Insights'}</h1>
        </div>

        {/* Controls */}
        <div className="memory-insights__controls" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.7 }}>
              {isTh ? 'ค้นหาความทรงจำ' : 'Search memories'}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isTh ? 'พิมพ์คำค้น...' : 'Search...'}
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
          <div style={{ minWidth: 160 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.7 }}>
              {isTh ? 'กรองตามโลก' : 'Filter by World'}
            </label>
            <select
              value={worldFilter}
              onChange={(e) => setWorldFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontSize: 14,
              }}
            >
              {worldOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="memory-insights__stats" style={{ display: 'flex', alignItems: 'flex-end', gap: 16, opacity: 0.7, fontSize: 13 }}>
            <span>{filteredMemories.length} / {memories.length} {isTh ? 'รายการ' : 'items'}</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="spinner" style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 12, opacity: 0.7 }}>{isTh ? 'กำลังโหลด...' : 'Loading...'}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredMemories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>
              {search
                ? (isTh ? 'ไม่พบความทรงจำที่ตรงกับคำค้น' : 'No memories match your search')
                : (isTh ? 'ยังไม่มีความทรงจำ' : 'No memories yet')}
            </p>
            <p>{isTh ? 'เริ่มคุยกับ Twin หรือทำ Decision เพื่อสร้าง Memory' : 'Chat with Twin or make Decisions to create memories'}</p>
          </div>
        )}

        {/* List */}
        {!loading && filteredMemories.length > 0 && (
          <div className="memory-insights__list" data-testid="memory-insights-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredMemories.map((memory) => (
              <MemoryInsightCard
                key={memory.id}
                memory={memory}
                worldLabel={getWorldLabel(memory.worldId)}
                formattedDate={formatDate(memory.createdAt)}
                relevanceScore={memory.relevanceScore}
                onForget={() => handleForget(memory.id)}
                isForgetting={forgetting === memory.id}
              />
            ))}
          </div>
        )}

        {/* Context Injection Preview */}
        {!loading && filteredMemories.length > 0 && (
          <div className="memory-insights__preview" style={{ marginTop: 32, padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
            <h4 style={{ marginBottom: 12 }}>{isTh ? '📋 Context Injection Preview' : '📋 Context Injection Preview'}</h4>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
              {isTh
                ? 'ข้อมูลด้านล่างจะถูกส่งให้ Twin เป็น context เมื่อคุณคุยกับ Twin (สูงสุด 10 รายการล่าสุด)'
                : 'The data below will be sent to Twin as context when you chat (max 10 most recent)'}
            </p>
            <pre style={{
              fontSize: 11,
              overflow: 'auto',
              maxHeight: 200,
              padding: 12,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.2)',
              whiteSpace: 'pre-wrap',
            }}>
              {JSON.stringify(
                filteredMemories.slice(0, 10).map((m) => ({
                  content: m.content.substring(0, 100),
                  world: m.worldId,
                  relevance: Math.round(m.relevanceScore * 100),
                })),
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </AppShell>
  );
};

interface MemoryInsightCardProps {
  memory: LearnedMemory;
  worldLabel: string;
  formattedDate: string;
  relevanceScore: number;
  onForget: () => void;
  isForgetting: boolean;
}

function MemoryInsightCard({
  memory,
  worldLabel,
  formattedDate,
  relevanceScore,
  onForget,
  isForgetting,
}: MemoryInsightCardProps) {
  const relevancePct = Math.round(relevanceScore * 100);
  const color = relevanceScore > 0.7 ? 'var(--color-success)' : relevanceScore > 0.4 ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div className="memory-insights__card" style={{
      padding: '16px',
      borderRadius: 12,
      border: '1px solid var(--border-color)',
      background: 'var(--card-bg)',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
    }} data-testid={`memory-insight-${memory.id}`}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 8px', lineHeight: 1.5, wordBreak: 'break-word' }}>{memory.content}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, opacity: 0.7 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            🌍 {worldLabel}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            📅 {formattedDate}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color, fontWeight: 600,
          }}>
            🎯 {relevancePct}%
          </span>
        </div>
      </div>
      <button
        onClick={onForget}
        disabled={isForgetting}
        style={{
          padding: '8px',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          background: isForgetting ? 'var(--border-color)' : 'transparent',
          color: isForgetting ? 'var(--text-secondary)' : 'var(--text-primary)',
          cursor: isForgetting ? 'not-allowed' : 'pointer',
          opacity: isForgetting ? 0.6 : 1,
        }}
        aria-label="Forget"
      >
        {isForgetting ? '⏳' : '🗑️'}
      </button>
    </div>
  );
}

export default MemoryInsightsPage;