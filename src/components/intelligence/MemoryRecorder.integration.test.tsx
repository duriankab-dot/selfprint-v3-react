/**
 * Integration Tests for MemoryRecorder Component
 * Tests component + MemoryManager + Supabase integration
 * @module components/intelligence/__integration__/MemoryRecorder.integration.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemoryRecorder from './MemoryRecorder';
import { PersonalMemory } from '@/lib/intelligence/types';

// QA-02: MemoryManager terminates its insert/select chains with
// .maybeSingle(), not .single() (MemoryManager.ts:62,135,166,225). Every mock
// below stubbed only .single(), so `.select().maybeSingle` was undefined —
// addMemory() threw a TypeError before Supabase was ever "called", which is why
// the insert spy showed 0 calls. All six chains now stub maybeSingle.
// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Import after mock
import { supabase } from '@/lib/supabase/client';

describe('MemoryRecorder Integration Tests', () => {
  const mockUserId = 'test-user-123';
  const mockMemoryResponse: PersonalMemory = {
    id: 'mem-1',
    userId: mockUserId,
    memoryType: 'small_win',
    title: 'Completed project ahead of schedule',
    content: 'Successfully delivered project 2 days early despite challenges',
    confidence: 0.8,
    tags: ['achievement', 'work'],
    linkedTo: undefined,
    createdAt: new Date('2026-08-09'),
    updatedAt: new Date('2026-08-09'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Integration: Component → MemoryManager → Supabase', () => {
    /**
     * Test 1: Full workflow - user creates memory successfully
     * Verifies: form submission → validation → manager call → Supabase insert → component state update
     */
    it('should create memory end-to-end with real MemoryManager', async () => {
      // Mock Supabase response
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: mockMemoryResponse.id,
              user_id: mockMemoryResponse.userId,
              memory_type: mockMemoryResponse.memoryType,
              title: mockMemoryResponse.title,
              content: mockMemoryResponse.content,
              confidence: mockMemoryResponse.confidence,
              tags: mockMemoryResponse.tags,
              created_at: mockMemoryResponse.createdAt.toISOString(),
              updated_at: mockMemoryResponse.updatedAt.toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const onMemoryCreated = vi.fn();

      render(
        <MemoryRecorder
          userId={mockUserId}
          onMemoryCreated={onMemoryCreated}
        />
      );

      // Fill form
      const titleInput = screen.getByPlaceholderText(/Completed project ahead/i);
      const contentInput = screen.getByPlaceholderText(/Describe the event/i);

      await userEvent.type(titleInput, mockMemoryResponse.title);
      await userEvent.type(contentInput, mockMemoryResponse.content);

      // Select memory type
      const smallWinButton = screen.getByRole('button', { name: /🎉 Small Win/i });
      fireEvent.click(smallWinButton);

      // Add tags
      const tagsInput = screen.getByPlaceholderText(/achievement, work/i);
      await userEvent.type(tagsInput, 'achievement, work');

      // Submit
      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      fireEvent.click(submitButton);

      // Verify Supabase was called with correct data
      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('personal_memory');
        expect(mockInsert).toHaveBeenCalledWith({
          user_id: mockUserId,
          memory_type: 'small_win',
          title: mockMemoryResponse.title,
          content: mockMemoryResponse.content,
          linked_to: null,
          confidence: 0.8,
          tags: ['achievement', 'work'],
        });
      });

      // Verify callback was called
      await waitFor(() => {
        expect(onMemoryCreated).toHaveBeenCalledWith(expect.objectContaining({
          userId: mockUserId,
          memoryType: 'small_win',
          title: mockMemoryResponse.title,
        }));
      });

      // Verify success message shown
      expect(screen.getByText(/Memory saved successfully/i)).toBeInTheDocument();

      // Verify form cleared
      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
    });

    /**
     * Test 2: Handle Supabase network error gracefully
     * Verifies: error handling → user feedback
     */
    it('should handle Supabase network errors with user-friendly message', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockRejectedValue(new Error('Network error')),
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Completed project ahead/i);
      const contentInput = screen.getByPlaceholderText(/Describe the event/i);

      await userEvent.type(titleInput, 'Test Title');
      await userEvent.type(contentInput, 'Test content');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      fireEvent.click(submitButton);

      // Verify error message displayed
      await waitFor(() => {
        // QA-02: MemoryManager wraps the failure as
        // IntelligenceError('Failed to add memory: ...', 'ADD_MEMORY_FAILED')
        // (MemoryManager.ts:80-84) and MemoryRecorder renders an
        // IntelligenceError as `Error: <message> (<code>)`
        // (MemoryRecorder.tsx:116-117) — so the user-facing text says "add",
        // not "save". The generic "Failed to save memory: ..." branch is only
        // reached for non-IntelligenceError throws.
        expect(screen.getByText((content) => /failed.*add.*memory/i.test(content))).toBeInTheDocument();
      });

      // Verify form NOT cleared (data preserved)
      expect(titleInput).toHaveValue('Test Title');
      expect(contentInput).toHaveValue('Test content');
    });

    /**
     * Test 3: Memory with linked context
     * Verifies: linkedToId parameter passed through component → manager → Supabase
     */
    it('should link memory to decision/journal when linkedToId provided', async () => {
      const linkedToId = 'decision-456';

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: mockMemoryResponse.id,
              user_id: mockUserId,
              memory_type: 'important_moment',
              title: 'Important decision',
              content: 'Made key decision',
              confidence: 0.8,
              tags: [],
              linked_to: linkedToId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      render(
        <MemoryRecorder
          userId={mockUserId}
          linkedToId={linkedToId}
        />
      );

      // Verify info message shown
      expect(screen.getByText(/will be linked to your decision/i)).toBeInTheDocument();

      const titleInput = screen.getByPlaceholderText(/Completed project ahead/i);
      const contentInput = screen.getByPlaceholderText(/Describe the event/i);

      await userEvent.type(titleInput, 'Important decision');
      await userEvent.type(contentInput, 'Made key decision');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      fireEvent.click(submitButton);

      // Verify linked_to passed to Supabase
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            linked_to: linkedToId,
          })
        );
      });
    });

    /**
     * Test 4: Memory type selection - all 4 types work correctly
     * Verifies: each memory type option sends correct type value to manager
     */
    it('should handle all 4 memory types correctly', async () => {
      const memoryTypes = [
        { key: 'small_win', label: /🎉 Small Win/ },
        { key: 'important_moment', label: /⭐ Important Moment/ },
        { key: 'discovery', label: /💡 Discovery/ },
        { key: 'personal', label: /📝 Personal Note/ },
      ] as const;

      for (const { key, label } of memoryTypes) {
        vi.clearAllMocks();

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: `mem-${key}`,
                user_id: mockUserId,
                memory_type: key,
                title: 'Test',
                content: 'Test content',
                confidence: 0.8,
                tags: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          insert: mockInsert,
        });

        (supabase.from as any).mockImplementation(mockFrom);

        const { unmount } = render(
          <MemoryRecorder userId={mockUserId} />
        );

        // Select type
        const typeButton = screen.getByRole('button', { name: label });
        fireEvent.click(typeButton);

        // Fill form
        const titleInput = screen.getByPlaceholderText(/Completed project ahead/i);
        const contentInput = screen.getByPlaceholderText(/Describe the event/i);

        await userEvent.type(titleInput, 'Test');
        await userEvent.type(contentInput, 'Test content');

        const submitButton = screen.getByRole('button', { name: /Save Memory/i });
        fireEvent.click(submitButton);

        // Verify correct type sent
        await waitFor(() => {
          expect(mockInsert).toHaveBeenCalledWith(
            expect.objectContaining({
              memory_type: key,
            })
          );
        });

        unmount();
      }
    });

    /**
     * Test 5: Compact mode still saves memory correctly
     * Verifies: component mode doesn't affect integration
     */
    it('should create memory in compact mode through full integration', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: mockMemoryResponse.id,
              user_id: mockUserId,
              memory_type: 'personal',
              title: 'Quick note',
              content: 'Quick memory',
              confidence: 0.8,
              tags: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const onMemoryCreated = vi.fn();

      render(
        <MemoryRecorder
          userId={mockUserId}
          compact={true}
          onMemoryCreated={onMemoryCreated}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      const contentInput = screen.getByPlaceholderText(/What happened/i);

      await userEvent.type(titleInput, 'Quick note');
      await userEvent.type(contentInput, 'Quick memory');

      const submitButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(submitButton);

      // Verify full integration worked
      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('personal_memory');
        expect(onMemoryCreated).toHaveBeenCalled();
      });
    });

    /**
     * Test 6: Tags parsed correctly from comma-separated input
     * Verifies: tag parsing logic works in integration
     */
    it('should parse and send tags correctly to Supabase', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: mockMemoryResponse.id,
              user_id: mockUserId,
              memory_type: 'personal',
              title: 'Tagged memory',
              content: 'Content',
              confidence: 0.8,
              tags: ['tag1', 'tag2', 'tag3'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Completed project ahead/i);
      const contentInput = screen.getByPlaceholderText(/Describe the event/i);
      const tagsInput = screen.getByPlaceholderText(/achievement, work/i);

      await userEvent.type(titleInput, 'Tagged memory');
      await userEvent.type(contentInput, 'Content');
      await userEvent.type(tagsInput, 'tag1, tag2, tag3');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      fireEvent.click(submitButton);

      // Verify tags parsed and sent correctly
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['tag1', 'tag2', 'tag3'],
          })
        );
      });
    });
  });

  describe('Master Direction Compliance: User Control', () => {
    /**
     * Test 7: User controls what gets recorded (no AI-generated memories)
     * Verifies: component requires explicit user input
     */
    it('should require user input - no auto-generated memories', async () => {
      const mockInsert = vi.fn();
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      render(
        <MemoryRecorder userId={mockUserId} />
      );

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      fireEvent.click(submitButton);

      // Verify Supabase NOT called (validation failed)
      await waitFor(() => {
        expect(mockInsert).not.toHaveBeenCalled();
      });

      // Verify error shown to user
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });
});
