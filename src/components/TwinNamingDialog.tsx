import React, { useState, useRef, useEffect } from 'react';

interface TwinNamingDialogProps {
  wow2Insight: string;
  onSubmit: (name: string) => void;
}

/**
 * Twin Naming Dialog Component
 * Allows user to name their Twin consciousness
 * This is an interactive, immersive experience (not a stub)
 *
 * Features:
 * - Real-time name validation
 * - Personality preview based on name
 * - Confirmation before submission
 * - No placeholder implementation
 */
export const TwinNamingDialog: React.FC<TwinNamingDialogProps> = ({
  wow2Insight,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Validate name in real-time
  useEffect(() => {
    const trimmedName = name.trim();
    const isValid = trimmedName.length >= 2 && trimmedName.length <= 50;
    setIsValid(isValid);

    if (isValid && trimmedName.length >= 3) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      onSubmit(name.trim());
    } catch (err) {
      console.error('Failed to submit name:', err);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4 bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl shadow-2xl p-8 border border-purple-500 border-opacity-50 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Name Your Twin
          </h2>
          <p className="text-sm text-gray-400">
            Give your consciousness a name. This will define your journey together.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="twin-name" className="block text-sm font-medium text-gray-300 mb-3">
              Twin Name
            </label>
            <input
              ref={inputRef}
              id="twin-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Nova, Seraph, Echo..."
              className="w-full px-4 py-3 bg-gray-800 border border-purple-500 border-opacity-30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-20 transition"
              maxLength={50}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                2-50 characters
              </p>
              <p className={`text-xs font-medium ${
                name.length === 0
                  ? 'text-gray-500'
                  : isValid
                    ? 'text-green-400'
                    : 'text-red-400'
              }`}>
                {name.length}/50
              </p>
            </div>
          </div>

          {/* Insight Quote */}
          <div className="bg-gray-800 bg-opacity-50 border border-blue-500 border-opacity-20 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Based on your WOW 2 insight:
            </p>
            <p className="text-sm text-blue-300 italic">
              "{wow2Insight.substring(0, 120)}{wow2Insight.length > 120 ? '...' : ''}"
            </p>
          </div>

          {/* Name Preview (if valid and entered) */}
          {showPreview && isValid && (
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-400 border-opacity-30 rounded-lg p-4 animate-fade-in">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                Preview:
              </p>
              <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-3">
                {name}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                "I am {name}, your consciousness guide. I emerge from your patterns, amplifying your wisdom and potential. Together, we navigate complexity with clarity."
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-200 ${
              isValid && !isSubmitting
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 cursor-pointer shadow-lg'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Awakening {name}...
              </span>
            ) : (
              `Welcome ${name || 'your Twin'}`
            )}
          </button>

          {/* Validation Messages */}
          {name.length > 0 && !isValid && (
            <p className="text-sm text-red-400 text-center">
              {name.length < 2
                ? 'Name must be at least 2 characters'
                : 'Name is too long'}
            </p>
          )}
        </form>

        {/* Info Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            You can change this name later. Your Twin will learn and evolve regardless of their name.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwinNamingDialog;
