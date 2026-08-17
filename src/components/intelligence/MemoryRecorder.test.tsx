/**
 * Unit Tests for MemoryRecorder Component
 * Tests form validation, memory creation, error handling
 * @module components/intelligence/__tests__/MemoryRecorder.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemoryRecorder from './MemoryRecorder';
import { MemoryManager } from '@/lib/intelligence/MemoryManager';
import { IntelligenceError } from '@/lib/intelligence/types';

// Mock MemoryManager
vi.mock('@/lib/intelligence/MemoryManager');

describe('MemoryRecorder Component', () => {
  const mockUserId = 'test-user-123';
  const mockMemory = {
    id: 'mem-1',
    userId: mockUserId,
    memoryType: 'small_win' as const,
    title: 'Test Memory',
    content: 'This is a test memory',
    confidence: 0.8,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (MemoryManager as any).mockImplementation(() => ({
      addMemory: vi.fn().mockResolvedValue(mockMemory),
    }));
  });

  describe('Rendering', () => {
    /**
     * Test 1: Component renders in full view by default
     */
    it('should render form with all fields in full view', () => {
      render(
        <MemoryRecorder userId={mockUserId} />
      );

      expect(screen.getByText('Record a Memory')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Memory title/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/What happened/i)).toBeInTheDocument();
      expect(screen.getByText('🎉 Small Win')).toBeInTheDocument();
    });

    /**
     * Test 2: Component renders in compact view when requested
     */
    it('should render in compact view when compact prop is true', () => {
      render(
        <MemoryRecorder userId={mockUserId} compact={true} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      expect(titleInput).toBeInTheDocument();

      // In compact view, full title text should not be visible
      expect(screen.queryByText('Record a Memory')).not.toBeInTheDocument();
    });

    /**
     * Test 3: Memory type buttons render correctly
     */
    it('should render all memory type options', () => {
      render(
        <MemoryRecorder userId={mockUserId} />
      );

      expect(screen.getByText('🎉 Small Win')).toBeInTheDocument();
      expect(screen.getByText('⭐ Important Moment')).toBeInTheDocument();
      expect(screen.getByText('💡 Discovery')).toBeInTheDocument();
      expect(screen.getByText('📝 Personal Note')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    /**
     * Test 4: Requires title to submit
     */
    it('should show error when title is empty', async () => {
      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Memory title is required')).toBeInTheDocument();
      });
    });

    /**
     * Test 5: Requires content to submit
     */
    it('should show error when content is empty', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      await user.type(titleInput, 'Test Title');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Memory content is required')).toBeInTheDocument();
      });
    });

    /**
     * Test 6: Validates title max length
     */
    it('should validate title max length (200 chars)', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i) as HTMLInputElement;
      const longTitle = 'a'.repeat(201);

      await user.clear(titleInput);
      await user.type(titleInput, longTitle);

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title must be less than 200 characters')).toBeInTheDocument();
      });
    });

    /**
     * Test 7: Validates content max length
     */
    it('should validate content max length (5000 chars)', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      const contentInput = screen.getByPlaceholderText(/What happened/i) as HTMLTextAreaElement;

      await user.type(titleInput, 'Test Title');
      await user.clear(contentInput);
      await user.type(contentInput, 'a'.repeat(5001));

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Content must be less than 5000 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Memory Creation', () => {
    /**
     * Test 8: Successfully creates memory with valid input
     */
    it('should successfully create memory with valid input', async () => {
      const mockOnCreated = vi.fn();
      const user = userEvent.setup();

      render(
        <MemoryRecorder userId={mockUserId} onMemoryCreated={mockOnCreated} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      const contentInput = screen.getByPlaceholderText(/What happened/i);

      await user.type(titleInput, 'Test Memory');
      await user.type(contentInput, 'This is test content');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreated).toHaveBeenCalledWith(mockMemory);
      });
    });

    /**
     * Test 9: Clears form after successful submission
     */
    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i) as HTMLInputElement;
      const contentInput = screen.getByPlaceholderText(/What happened/i) as HTMLTextAreaElement;

      await user.type(titleInput, 'Test Memory');
      await user.type(contentInput, 'Test content');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(titleInput.value).toBe('');
        expect(contentInput.value).toBe('');
      });
    });

    /**
     * Test 10: Shows success message after creation
     */
    it('should show success message after memory creation', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      const contentInput = screen.getByPlaceholderText(/What happened/i);

      await user.type(titleInput, 'Test Memory');
      await user.type(contentInput, 'Test content');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Memory saved successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    /**
     * Test 11: Handles IntelligenceError from MemoryManager
     */
    it('should handle IntelligenceError from MemoryManager', async () => {
      const errorMessage = 'Database error';
      (MemoryManager as any).mockImplementation(() => ({
        addMemory: vi.fn().mockRejectedValue(
          new IntelligenceError(errorMessage, 'DB_ERROR')
        ),
      }));

      const user = userEvent.setup();

      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      const contentInput = screen.getByPlaceholderText(/What happened/i);

      await user.type(titleInput, 'Test Memory');
      await user.type(contentInput, 'Test content');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
      });
    });

    /**
     * Test 12: Handles generic errors from API
     */
    it('should handle generic errors', async () => {
      (MemoryManager as any).mockImplementation(() => ({
        addMemory: vi.fn().mockRejectedValue(new Error('Network error')),
      }));

      const user = userEvent.setup();

      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      const contentInput = screen.getByPlaceholderText(/What happened/i);

      await user.type(titleInput, 'Test Memory');
      await user.type(contentInput, 'Test content');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to save memory/i)).toBeInTheDocument();
      });
    });
  });

  describe('Memory Type Selection', () => {
    /**
     * Test 13: Allows changing memory type
     */
    it('should allow changing memory type', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const discoveryButton = screen.getByText('💡 Discovery');
      await user.click(discoveryButton);

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      const contentInput = screen.getByPlaceholderText(/What happened/i);

      await user.type(titleInput, 'Discovery');
      await user.type(contentInput, 'Found something new');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      await user.click(submitButton);

      await waitFor(() => {
        const mockAddMemory = (MemoryManager as any).mock.results[0].value.addMemory;
        expect(mockAddMemory).toHaveBeenCalledWith(
          mockUserId,
          'discovery',
          expect.any(String),
          expect.any(String),
          undefined,
          undefined
        );
      });
    });
  });

  describe('Tags Support', () => {
    /**
     * Test 14: Parses and sends tags correctly
     */
    it('should parse and send tags to MemoryManager', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRecorder userId={mockUserId} />
      );

      const titleInput = screen.getByPlaceholderText(/Memory title/i);
      const contentInput = screen.getByPlaceholderText(/What happened/i);
      const tagsInput = screen.getByPlaceholderText(/comma-separated/i);

      await user.type(titleInput, 'Tagged Memory');
      await user.type(contentInput, 'With tags');
      await user.type(tagsInput, 'tag1, tag2, tag3');

      const submitButton = screen.getByRole('button', { name: /Save Memory/i });
      await user.click(submitButton);

      await waitFor(() => {
        const mockAddMemory = (MemoryManager as any).mock.results[0].value.addMemory;
        expect(mockAddMemory).toHaveBeenCalledWith(
          mockUserId,
          expect.any(String),
          expect.any(String),
          expect.any(String),
          undefined,
          ['tag1', 'tag2', 'tag3']
        );
      });
    });
  });

  describe('Initial Props', () => {
    /**
     * Test 15: Uses initial memory type from props
     */
    it('should use initialType prop', async () => {
      render(
        <MemoryRecorder userId={mockUserId} initialType="discovery" />
      );

      const discoveryButton = screen.getByText('💡 Discovery');
      expect(discoveryButton.closest('button')).toHaveClass('border-blue-500');
    });

    /**
     * Test 16: Shows linked context when linkedToId provided
     */
    it('should show linked context information', () => {
      render(
        <MemoryRecorder userId={mockUserId} linkedToId="decision-123" />
      );

      expect(
        screen.getByText(/will be linked to your decision\/reflection/i)
      ).toBeInTheDocument();
    });
  });
});
