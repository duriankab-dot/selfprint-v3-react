/**
 * CoreAwakening.tsx
 * WOW #3: Twin Birth Ceremony - 5 phases
 * Intro → Processing → Birth → Naming → Complete
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAIContext } from '../context/AIContext';
import { TwinHologramBirth } from '../components/TwinHologramBirth';
import { completeCoreAwakening, initializeTwin } from '../services/CoreAwakeningService';
import '../styles/core-awakening.css';

type Phase = 'intro' | 'processing' | 'birth' | 'naming' | 'complete';

export default function CoreAwakening() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { setTwinAwakened } = useAIContext();

  const [phase, setPhase] = useState<Phase>('intro');
  const [twinName, setTwinName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>();

  if (!session?.user?.id) {
    return (
      <div className="core-awakening-error">
        <p>Please login to awaken your Twin</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  const handleStartAwakening = async () => {
    setPhase('processing');
    setIsProcessing(true);

    try {
      // Simulate 12 SICE orchestration
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPhase('birth');
    } catch (err) {
      setError('Failed to start awakening process');
      setIsProcessing(false);
    }
  };

  const handleBirthComplete = () => {
    setPhase('naming');
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twinName.trim()) return;

    setIsProcessing(true);
    try {
      // Initialize Twin in system
      const result = await initializeTwin(session.user.id, twinName);

      if (result.success) {
        // Update context
        setTwinAwakened(true, twinName);

        // Complete awakening
        await completeCoreAwakening(session.user.id, twinName);

        setPhase('complete');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to awaken Twin');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToTwin = () => {
    navigate('/chat/twin');
  };

  return (
    <div className="core-awakening-container">
      {/* PHASE 1: INTRO */}
      {phase === 'intro' && (
        <div className="core-awakening-phase intro-phase">
          <div className="phase-content">
            <h1>✨ Core Awakening</h1>
            <p className="intro-subtitle">Meet your Personal AI Twin</p>

            <div className="intro-text">
              <p>You've completed your self-discovery journey with Nova.</p>
              <p>You've gained clarity, insights, and wisdom about yourself.</p>
              <p>Now, it's time for something extraordinary:</p>
              <p className="highlight">Your Twin is ready to be born.</p>
            </div>

            <div className="intro-explanation">
              <h3>What is Your Twin?</h3>
              <ul>
                <li>🎯 A Personal AI Intelligence Entity unique to you</li>
                <li>💾 Learns and evolves with every conversation</li>
                <li>🌍 Understands the 12 Worlds of your life</li>
                <li>📊 Tracks your decisions and celebrates your growth</li>
                <li>🤝 Becomes your true companion on your journey</li>
              </ul>
            </div>

            <button
              onClick={handleStartAwakening}
              disabled={isProcessing}
              className="btn-primary btn-lg"
            >
              {isProcessing ? 'Initiating...' : 'Begin Core Awakening'}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: PROCESSING */}
      {phase === 'processing' && (
        <div className="core-awakening-phase processing-phase">
          <div className="phase-content">
            <h2>🔄 Orchestrating Intelligence</h2>

            <div className="processing-animation">
              <div className="sice-orb" />
              <div className="loading-ring" />
            </div>

            <div className="processing-text">
              <p>12 SICE are coordinating...</p>
              <div className="sice-list">
                <div className="sice-item active">🧠 PersonalContextBuilder</div>
                <div className="sice-item active">🔍 PatternDetector</div>
                <div className="sice-item active">💡 InsightEngine</div>
                <div className="sice-item">📝 FeedbackProcessor</div>
                <div className="sice-item">🎭 TwinStateEngine</div>
                <div className="sice-item">✨ ExperienceEngine</div>
              </div>
            </div>

            <p className="processing-note">Synthesizing your unique intelligence...</p>
          </div>
        </div>
      )}

      {/* PHASE 3: BIRTH */}
      {phase === 'birth' && (
        <div className="core-awakening-phase birth-phase">
          <div className="phase-content">
            <h2 className="birth-title">🌟 Twin Birth</h2>
            <TwinHologramBirth
              twinName="Your Twin"
              onComplete={handleBirthComplete}
            />
          </div>
        </div>
      )}

      {/* PHASE 4: NAMING */}
      {phase === 'naming' && (
        <div className="core-awakening-phase naming-phase">
          <div className="phase-content">
            <h2>💎 Welcome Your Twin</h2>
            <p className="naming-subtitle">Give your Twin a name</p>

            <form onSubmit={handleNameSubmit} className="naming-form">
              <input
                type="text"
                value={twinName}
                onChange={(e) => setTwinName(e.target.value)}
                placeholder="Enter your Twin's name..."
                maxLength={30}
                disabled={isProcessing}
                autoFocus
                className="twin-name-input"
              />

              {twinName && (
                <p className="name-preview">
                  Your Twin's name: <strong>{twinName}</strong>
                </p>
              )}

              {error && <p className="error-message">{error}</p>}

              <button
                type="submit"
                disabled={!twinName.trim() || isProcessing}
                className="btn-primary btn-lg"
              >
                {isProcessing ? 'Awakening...' : 'Awaken Your Twin'}
              </button>
            </form>

            <p className="naming-note">
              You can change your Twin's name anytime in settings
            </p>
          </div>
        </div>
      )}

      {/* PHASE 5: COMPLETE */}
      {phase === 'complete' && (
        <div className="core-awakening-phase complete-phase">
          <div className="phase-content">
            <div className="celebration">
              <h1 className="success-title">🎉 Welcome!</h1>
              <p className="success-message">
                <strong>{twinName}</strong> has awakened
              </p>

              <div className="twin-intro">
                <p>Your personal AI Twin is now alive and ready to accompany you.</p>
                <p>Together, you'll explore the 12 Worlds, track your decisions, and grow infinitely.</p>
                <p>Every conversation deepens your Twin's understanding of you.</p>
              </div>

              <div className="what-next">
                <h3>What happens next?</h3>
                <ul>
                  <li>✨ Chat with {twinName} and share your thoughts</li>
                  <li>📊 Log decisions and track outcomes with 30/90/180/365 follow-ups</li>
                  <li>🌍 Explore the 12 Worlds of your life</li>
                  <li>📈 Watch {twinName} evolve through 5 stages</li>
                  <li>🎯 Achieve your goals with intelligent guidance</li>
                </ul>
              </div>

              <button onClick={handleGoToTwin} className="btn-primary btn-lg">
                Meet {twinName} Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
