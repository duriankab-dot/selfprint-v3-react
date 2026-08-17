/**
 * MemoryRecorder Component
 * Allows users to record new memories linked to decisions/journals
 * @module components/intelligence/MemoryRecorder
 */

import React, { useState } from 'react';
import { MemoryManager } from '@/lib/intelligence/MemoryManager';
import type { PersonalMemory, MemoryType } from '@/lib/intelligence/types';
import { IntelligenceError } from '@/lib/intelligence/types';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Card } from '@/components/primitives/Card';
import { Alert } from '@/components/composites/Alert';

/**
 * Props for MemoryRecorder component
 */
export interface MemoryRecorderProps {
  /** Current user ID */
  userId: string;
  /** Called after memory is successfully created */
  onMemoryCreated?: (memory: PersonalMemory) => void;
  /** Optional initial context for memory */
  linkedToId?: string;
  /** Optional initial memory type */
  initialType?: MemoryType;
  /** Show compact or expanded view */
  compact?: boolean;
}

/**
 * MemoryRecorder Component
 * Provides form to record new memories with type selection and optional linking
 *
 * Master Direction compliance:
 * - Users control what gets recorded
 * - No AI-generated memories without user action
 * - Memory type is explicit choice by user
 */
export const MemoryRecorder: React.FC<MemoryRecorderProps> = ({
  userId,
  onMemoryCreated,
  linkedToId,
  initialType = 'personal',
  compact = false,
}) => {
  // State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [memoryType, setMemoryType] = useState<MemoryType>(initialType);
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Handle memory submission
   * Validates input, calls MemoryManager, handles errors
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!title.trim()) {
      setError('Memory title is required');
      return;
    }

    if (!content.trim()) {
      setError('Memory content is required');
      return;
    }

    if (title.trim().length > 200) {
      setError('Title must be less than 200 characters');
      return;
    }

    if (content.trim().length > 5000) {
      setError('Content must be less than 5000 characters');
      return;
    }

    setIsLoading(true);

    try {
      const manager = new MemoryManager();

      // Parse tags
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Create memory
      const memory = await manager.addMemory(
        userId,
        memoryType,
        title.trim(),
        content.trim(),
        linkedToId,
        tagsArray.length > 0 ? tagsArray : undefined
      );

      setSuccess(true);
      setTitle('');
      setContent('');
      setMemoryType(initialType);
      setTags('');

      onMemoryCreated?.(memory);
    } catch (err) {
      if (err instanceof IntelligenceError) {
        setError(`Error: ${err.message} (${err.code})`);
      } else {
        setError(`Failed to save memory: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get display label for memory type
   */
  const getMemoryTypeLabel = (type: MemoryType): string => {
    const labels: Record<MemoryType, string> = {
      small_win: '🎉 Small Win',
      important_moment: '⭐ Important Moment',
      discovery: '💡 Discovery',
      personal: '📝 Personal Note',
    };
    return labels[type];
  };

  if (compact) {
    return (
      <Card className="p-4 bg-slate-50 dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <Alert variant="error" message={error} />}
          {success && <Alert variant="success" message="Memory saved successfully!" />}

          <Input
            placeholder="Memory title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            maxLength={200}
          />

          <textarea
            placeholder="What happened? What did you learn?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
            maxLength={5000}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />

          <div className="flex gap-2">
            <select
              value={memoryType}
              onChange={(e) => setMemoryType(e.target.value as MemoryType)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small_win">{getMemoryTypeLabel('small_win')}</option>
              <option value="important_moment">{getMemoryTypeLabel('important_moment')}</option>
              <option value="discovery">{getMemoryTypeLabel('discovery')}</option>
              <option value="personal">{getMemoryTypeLabel('personal')}</option>
            </select>

            <Button variant="primary" size="sm" disabled={isLoading} type="submit">
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  // Full view
  return (
    <Card className="p-6 bg-white dark:bg-slate-950">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            Record a Memory
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Save something important to remember. Choose a type that fits best.
          </p>
        </div>

        {error && <Alert variant="error" message={error} />}
        {success && <Alert variant="success" message="Memory saved successfully!" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Memory Title *
            </label>
            <Input
              placeholder="e.g., Completed project ahead of schedule"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {title.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              What happened? *
            </label>
            <textarea
              placeholder="Describe the event, what you learned, or why it's important..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              maxLength={5000}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white"
              rows={5}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {content.length}/5000 characters
            </p>
          </div>

          {/* Memory Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Memory Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['small_win', 'important_moment', 'discovery', 'personal'] as MemoryType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMemoryType(type)}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      memoryType === type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {getMemoryTypeLabel(type)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags (optional)
            </label>
            <Input
              placeholder="e.g., achievement, work, personal growth (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Linked To Info */}
          {linkedToId && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-sm text-blue-700 dark:text-blue-200">
              ✓ This memory will be linked to your decision/reflection
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button variant="primary" size="lg" disabled={isLoading} type="submit">
              {isLoading ? 'Saving...' : 'Save Memory'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default MemoryRecorder;
