/**
 * FeedbackModal.tsx
 * Phase F: Modal wrapper for feedback form
 */

import { FeedbackCollector } from './FeedbackCollector';

interface FeedbackModalProps {
  isOpen: boolean;
  userId: string;
  twinId: string;
  responseId: string;
  onClose: () => void;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackModal({
  isOpen,
  userId,
  twinId,
  responseId,
  onClose,
  onFeedbackSubmitted,
}: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <FeedbackCollector
            userId={userId}
            twinId={twinId}
            responseId={responseId}
            onFeedbackSubmitted={() => {
              onFeedbackSubmitted?.();
              setTimeout(onClose, 1500);
            }}
          />
        </div>

        <div className="border-t p-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
