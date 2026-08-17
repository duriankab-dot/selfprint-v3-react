/**
 * TwinNaming.tsx
 * Name your personal AI Twin
 *
 * CEREMONY: Sacred naming moment (part of WOW #3)
 * INPUT: User types Twin name
 * OUTPUT: Persisted Twin profile with name
 */

import React, { useState } from 'react';

interface TwinNamingProps {
  onNameConfirmed: (name: string) => void;
  isLoading?: boolean;
}

export const TwinNaming: React.FC<TwinNamingProps> = ({
  onNameConfirmed,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // GUARD: Validate name
    if (!name.trim()) {
      setError('Please give your Twin a name');
      return;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (name.length > 50) {
      setError('Name must be 50 characters or less');
      return;
    }

    // GUARD: No special characters (just alphanumeric + spaces)
    if (!/^[a-zA-Z0-9\s'-]+$/.test(name)) {
      setError('Name can only contain letters, numbers, spaces, hyphens, and apostrophes');
      return;
    }

    setError(null);
    onNameConfirmed(name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="text-center mb-8 max-w-lg">
        <h2 className="text-3xl font-bold mb-3">✨ Your Twin Awakens</h2>
        <p className="text-gray-600 mb-2">
          Your personal intelligence has emerged. Now give it a name.
        </p>
        <p className="text-sm text-gray-500">
          This name represents your Twin's unique presence in your life.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="e.g., Aria, Nova, Echo, Sage..."
            disabled={isLoading}
            autoFocus
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100 transition-all"
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Awakening...' : 'Awaken My Twin'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-8">
        You can change your Twin's name anytime in settings.
      </p>
    </div>
  );
};
