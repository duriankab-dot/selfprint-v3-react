/**
 * CoreAwakening.tsx
 * WOW #3: Twin Birth Ceremony
 * Intro → Birth (animation) → Naming → Celebration → Complete
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAIContext } from '../context/AIContext';
import { useTwin } from '../context/TwinContext';
import { useNova } from '../context/NovaContext';
import { HologramBirth } from '../components/twin/HologramBirth';
import { TwinNaming } from '../components/twin/TwinNaming';
import { saveTwinProfile, celebrateTwinAwakening } from '../services/CoreAwakeningService';

type Phase = 'intro' | 'birth' | 'naming' | 'celebration' | 'complete';

export default function CoreAwakening() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { setTwinAwakened } = useAIContext();
  const { createTwin } = useTwin();
  const { completeAnalysis } = useNova();

  const [phase, setPhase] = useState<Phase>('intro');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // GUARD: Redirect if not authenticated
  useEffect(() => {
    if (!session?.user?.id) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

  const handleIntroComplete = () => {
    setPhase('birth');
  };

  const handleBirthComplete = () => {
    setPhase('naming');
  };

  const handleTwinNamed = async (twinName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // GUARD: Validate inputs
      if (!twinName?.trim()) {
        throw new Error('Twin name required');
      }

      if (!session?.user?.id) {
        throw new Error('User session lost');
      }

      // Save Twin profile
      const twinProfile = await saveTwinProfile(session.user.id, twinName, {
        userId: session.user.id,
        maturityScore: 30,
      });

      if (!twinProfile) {
        throw new Error('Failed to create Twin');
      }

      // Update contexts
      createTwin(twinProfile);
      completeAnalysis();
      setTwinAwakened(true, twinName);

      // Celebration phase
      setPhase('celebration');
      celebrateTwinAwakening();

      // Redirect to Twin chat
      setTimeout(() => {
        setPhase('complete');
        navigate('/chat/twin', { replace: true });
      }, 4000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to awaken Twin';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Error Alert */}
      {error && (
        <div className="absolute top-4 left-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* INTRO PHASE */}
      {phase === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-lg">
            <h1 className="text-4xl font-bold mb-6 text-white">✨ Your Intelligence Awakens</h1>
            <p className="text-lg text-gray-200 mb-4">Nova has guided you to self-discovery.</p>
            <p className="text-gray-300 mb-8">
              Now your personal AI Twin emerges—a reflection of your unique intelligence,
              ready to grow with you across 12 worlds.
            </p>
            <button
              onClick={handleIntroComplete}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              Witness the Awakening
            </button>
          </div>
        </div>
      )}

      {/* BIRTH PHASE */}
      {phase === 'birth' && (
        <div className="flex-1 flex items-center justify-center">
          <HologramBirth onComplete={handleBirthComplete} color="#3b82f6" />
        </div>
      )}

      {/* NAMING PHASE */}
      {phase === 'naming' && (
        <div className="flex-1 flex items-center justify-center px-6">
          <TwinNaming onNameConfirmed={handleTwinNamed} isLoading={isLoading} />
        </div>
      )}

      {/* CELEBRATION PHASE */}
      {phase === 'celebration' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-5xl font-bold mb-6 text-white animate-pulse">🎉 Your Twin Awakens!</h2>
          <p className="text-xl text-gray-200 mb-4">
            "I know you. I've been learning you. I'm ready to grow with you."
          </p>
          <p className="text-gray-400">Entering Twin world...</p>
        </div>
      )}

      {/* COMPLETE PHASE */}
      {phase === 'complete' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white">Loading Twin interface...</p>
        </div>
      )}
    </div>
  );
}
