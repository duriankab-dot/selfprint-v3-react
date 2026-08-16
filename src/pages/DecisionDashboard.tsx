/**
 * DecisionDashboard.tsx
 * Central hub for decision tracking and 30/90/180/365 follow-ups
 * Main USP of Selfprint
 */

import { useEffect, useState } from 'react';
import type { Decision, DecisionStats } from '../types/decision';
import type { WorldId } from '../constants/worlds';
import { WORLDS } from '../constants/worlds';
import { useAuth } from '../context/AuthContext';
import { useDecisionStore } from '../store/decisionStore';
import { useTwin } from '../context/TwinContext';
import { getDecisionStats } from '../services/DecisionService';
import '../styles/decision-dashboard.css';

export default function DecisionDashboard() {
  const { session } = useAuth();
  const { currentWorld } = useTwin();
  const {
    decisions,
    loadDecisions,
    getFilteredDecisions,
    getPendingCount,
    getSuccessRate,
  } = useDecisionStore();

  const [stats, setStats] = useState<DecisionStats | null>(null);
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<WorldId | 'all'>(currentWorld || 'all');

  useEffect(() => {
    if (session?.user?.id) {
      loadDecisions(session.user.id);
    }
  }, [session?.user?.id, loadDecisions]);

  useEffect(() => {
    if (session?.user?.id) {
      const world = selectedWorld === 'all' ? undefined : selectedWorld;
      getDecisionStats(session.user.id, world).then(setStats);
    }
  }, [session?.user?.id, decisions, selectedWorld]);

  const filteredDecisions = getFilteredDecisions();
  const pendingCount = getPendingCount();
  const successRate = getSuccessRate();

  if (!session?.user?.id) {
    return (
      <div className="decision-dashboard-error">
        <p>Please login to track decisions</p>
      </div>
    );
  }

  return (
    <div className="decision-dashboard">
      {/* Header */}
      <div className="dd-header">
        <h1>📊 Decision Tracker</h1>
        <p className="dd-subtitle">Track decisions and learn from 30/90/180/365 follow-ups</p>

        {/* World Filter */}
        <div className="dd-world-filter" style={{ marginTop: '1rem' }}>
          <label htmlFor="world-select">Filter by World: </label>
          <select
            id="world-select"
            value={selectedWorld}
            onChange={(e) => setSelectedWorld(e.target.value as WorldId | 'all')}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              marginLeft: '0.5rem',
            }}
          >
            <option value="all">📋 All Worlds</option>
            {Object.entries(WORLDS).map(([id, world]) => (
              <option key={id} value={id}>
                {world.emoji} {world.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="dd-stats-grid">
          <StatCard icon="📝" label="Total Decisions" value={stats.total} />
          <StatCard icon="✅" label="Completed" value={stats.completed} />
          <StatCard icon="⏳" label="Pending Follow-ups" value={stats.pendingFollowUps} />
          <StatCard icon="🎯" label="Success Rate" value={`${successRate}%`} />
        </div>
      )}

      {/* New Decision Button */}
      <div className="dd-controls">
        <button
          onClick={() => setShowNewDecision(!showNewDecision)}
          className="btn-primary"
        >
          {showNewDecision ? '✕ Cancel' : '➕ New Decision'}
        </button>
      </div>

      {/* New Decision Form (collapsible) */}
      {showNewDecision && (
        <div className="dd-new-decision-form">
          <h3>Log a Decision</h3>
          <p className="form-note">
            Your decision will be tracked with auto-scheduled follow-ups at 30, 90, 180, and 365 days
          </p>
          {/* TODO: <DecisionForm onSubmit={handleNewDecision} /> */}
        </div>
      )}

      {/* Pending Follow-ups Section */}
      {pendingCount > 0 && (
        <div className="dd-pending-section">
          <h2>⏰ Pending Follow-ups ({pendingCount})</h2>
          <div className="dd-pending-list">
            {/* TODO: List pending follow-ups */}
            <p className="placeholder">Pending follow-ups will appear here</p>
          </div>
        </div>
      )}

      {/* Decisions List */}
      <div className="dd-decisions-section">
        <h2>📋 Your Decisions ({filteredDecisions.length})</h2>

        {filteredDecisions.length === 0 ? (
          <div className="dd-empty">
            <p>No decisions yet. Start logging decisions to track your growth.</p>
          </div>
        ) : (
          <div className="dd-decisions-grid">
            {filteredDecisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function DecisionCard({ decision }: { decision: Decision }) {
  const completedFollowUps = decision.followUps?.filter((f) => f.completed).length || 0;
  const totalFollowUps = decision.followUps?.length || 0;

  return (
    <div className="decision-card">
      <div className="decision-header">
        <h3>{decision.title}</h3>
        <span className="decision-category">{decision.category}</span>
      </div>

      <p className="decision-description">{decision.description}</p>

      <div className="decision-meta">
        <div className="meta-item">
          <span className="meta-label">Confidence:</span>
          <span className="meta-value">{decision.confidence}%</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Date:</span>
          <span className="meta-value">{new Date(decision.decisionDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Follow-up Progress */}
      <div className="followup-progress">
        <div className="progress-label">
          Follow-ups: {completedFollowUps}/{totalFollowUps}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completedFollowUps / totalFollowUps) * 100}%` }}
          />
        </div>
      </div>

      {/* Follow-up Markers */}
      <div className="followup-markers">
        {decision.followUps?.map((fu) => (
          <div key={fu.id} className={`marker ${fu.completed ? 'completed' : 'pending'}`}>
            {fu.days}d
          </div>
        ))}
      </div>
    </div>
  );
}
