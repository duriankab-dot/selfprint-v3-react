/**
 * 💾 MemoryList Component — Display list of user memories
 *
 * **ทำหน้าที่:**
 * - Display list of PersonalMemory items
 * - Filter by memory type (all / small_win / important_moment / discovery / personal)
 * - Show tags + confidence
 * - Delete memory option
 * - Empty state
 * - Loading state
 *
 * **Input Props:**
 * - userId: string
 * - memories: PersonalMemory[]
 * - isLoading?: boolean
 * - onMemoryDeleted?: (id: string) => void
 * - onFilterChange?: (type: MemoryType | 'all') => void
 *
 * @module intelligence/MemoryList
 */

import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { MemoryManager } from '@/lib/intelligence/MemoryManager';
import type { PersonalMemory, MemoryType } from '@/lib/intelligence/types';
import './MemoryList.css';

// ============================================================================
// Types
// ============================================================================

type FilterType = 'all' | MemoryType;

interface MemoryListProps {
  userId: string;
  memories: PersonalMemory[];
  isLoading?: boolean;
  onMemoryDeleted?: (id: string) => void;
  onFilterChange?: (type: FilterType) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ✅ MemoryList — Display list of memories with filter + delete
 */
export const MemoryList: React.FC<MemoryListProps> = ({
  userId,
  memories,
  isLoading = false,
  onMemoryDeleted,
  onFilterChange,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const memoryManager = new MemoryManager();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (memoryId: string) => memoryManager.deleteMemory(memoryId),
    onSuccess: (_, memoryId) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['userMemories', userId] });
      onMemoryDeleted?.(memoryId);
    },
    onError: () => {
      // Failed to delete memory
    },
  });

  // Filter memories
  const filteredMemories = useMemo(() => {
    if (filterType === 'all') return memories;
    return memories.filter((m) => m.memoryType === filterType);
  }, [memories, filterType]);

  // Handle filter change
  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
    onFilterChange?.(type);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm(isTh ? 'คุณแน่ใจหรือว่าต้องการลบ memory นี้?' : 'Are you sure you want to delete this memory?')) {
      deleteMutation.mutate(id);
    }
  };

  const stats = useMemo(() => {
    return {
      total: memories.length,
      small_win: memories.filter((m) => m.memoryType === 'small_win').length,
      important_moment: memories.filter((m) => m.memoryType === 'important_moment').length,
      discovery: memories.filter((m) => m.memoryType === 'discovery').length,
      personal: memories.filter((m) => m.memoryType === 'personal').length,
    };
  }, [memories]);

  if (isLoading) {
    return (
      <div className="memory-list memory-list--loading">
        <div className="memory-list__spinner" />
        <p>{isTh ? 'กำลังโหลด memories...' : 'Loading memories...'}</p>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="memory-list memory-list--empty">
        <p className="memory-list__empty-icon">💾</p>
        <h3>{isTh ? 'ยังไม่มี Memories' : 'No memories yet'}</h3>
        <p>{isTh ? 'บันทึก memory แรกของคุณเพื่อเริ่มต้น' : 'Log your first memory to get started'}</p>
      </div>
    );
  }

  return (
    <div className="memory-list">
      {/* Header + Filter */}
      <div className="memory-list__header">
        <div className="memory-list__stats">
          <span className="memory-stat memory-stat--total">📌 {isTh ? 'รวม' : 'Total'}: {stats.total}</span>
          <span className="memory-stat memory-stat--win">🎉 Wins: {stats.small_win}</span>
          <span className="memory-stat memory-stat--moment">⭐ Moments: {stats.important_moment}</span>
          <span className="memory-stat memory-stat--discovery">💡 Discoveries: {stats.discovery}</span>
          <span className="memory-stat memory-stat--personal">📝 Personal: {stats.personal}</span>
        </div>

        <div className="memory-list__filters">
          {(['all', 'small_win', 'important_moment', 'discovery', 'personal'] as FilterType[]).map(
            (type) => (
              <button
                key={type}
                className={`memory-filter-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => handleFilterChange(type)}
              >
                {type === 'all' && (isTh ? 'ทั้งหมด' : 'All')}
                {type === 'small_win' && '🎉 Wins'}
                {type === 'important_moment' && '⭐ Moments'}
                {type === 'discovery' && '💡 Discoveries'}
                {type === 'personal' && '📝 Personal'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Memory list */}
      <div className="memory-list__items">
        {filteredMemories.map((memory) => (
          <div key={memory.id} className="memory-item">
            {/* Header */}
            <div
              className="memory-item__header"
              onClick={() => setExpandedId(expandedId === memory.id ? null : memory.id)}
            >
              <div className="memory-item__title-section">
                <span className="memory-item__icon">{getMemoryIcon(memory.memoryType)}</span>
                <h4 className="memory-item__title">{memory.title}</h4>
              </div>

              <div className="memory-item__meta">
                <span className="memory-item__date">{formatDate(memory.createdAt, isTh)}</span>
                <span className={`memory-item__badge ${memory.memoryType}`}>
                  {memory.memoryType.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Expanded content */}
            {expandedId === memory.id && (
              <div className="memory-item__expanded">
                <p className="memory-item__content">{memory.content}</p>

                {/* Tags */}
                {memory.tags && memory.tags.length > 0 && (
                  <div className="memory-item__tags">
                    {memory.tags.map((tag, idx) => (
                      <span key={idx} className="memory-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Confidence */}
                {memory.confidence > 0 && (
                  <div className="memory-item__confidence">
                    <span>{isTh ? 'ความมั่นใจ' : 'Confidence'}: {Math.round(memory.confidence * 100)}%</span>
                  </div>
                )}

                {/* Actions */}
                <div className="memory-item__actions">
                  <button
                    className="memory-delete-btn"
                    onClick={() => handleDelete(memory.id)}
                    disabled={deleteMutation.isPending}
                  >
                    🗑️ {isTh ? 'ลบ' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Showing N of M */}
      <div className="memory-list__footer">
        <p>
          {isTh
            ? `แสดง ${filteredMemories.length} จาก ${memories.length} memories`
            : `Showing ${filteredMemories.length} of ${memories.length} memories`}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

function getMemoryIcon(type: MemoryType): string {
  switch (type) {
    case 'small_win':
      return '🎉';
    case 'important_moment':
      return '⭐';
    case 'discovery':
      return '💡';
    case 'personal':
      return '📝';
    default:
      return '💾';
  }
}

function formatDate(date: Date, isTh: boolean): string {
  const d = new Date(date);
  return d.toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default MemoryList;
