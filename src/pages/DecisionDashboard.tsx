/**
 * DecisionDashboard.tsx
 * Central hub for decision tracking and 30/90/180/365 follow-ups
 * Main USP of Selfprint
 */

import { useEffect, useState } from 'react';
import type { Decision, DecisionInsights } from '../types/decision';
import type { WorldId } from '../constants/worlds';
import { WORLDS } from '../constants/worlds';
import { useAuth } from '../context/AuthContext';
import { useDecisionStore } from '../store/decisionStore';
import { useTwin } from '../context/TwinContext';
import * as DecisionLearningService from '../services/DecisionLearningService';
import '../styles/decision-dashboard.css';

export default function DecisionDashboard() {
  const { session } = useAuth();
  const { currentWorld } = useTwin();
  const { decisions, loadDecisions, getFilteredDecisions } = useDecisionStore();

  const [insights, setInsights] = useState<DecisionInsights | null>(null);
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<WorldId | 'all'>(currentWorld || 'all');

  useEffect(() => {
    if (session?.user?.id) {
      loadDecisions(session.user.id);
    }
  }, [session?.user?.id, loadDecisions]);

  useEffect(() => {
    if (session?.user?.id) {
      // Load insights from DecisionLearningService
      DecisionLearningService.getDecisionInsights(session.user.id).then(setInsights);
    }
  }, [session?.user?.id, decisions, selectedWorld]);

  const filteredDecisions = getFilteredDecisions();

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
      {insights && (
        <div className="dd-stats-grid">
          <StatCard icon="📝" label="Total Decisions" value={insights.totalDecisions} />
          <StatCard icon="✅" label="Success Rate" value={`${insights.successRate}%`} />
          <StatCard icon="🌍" label="Best Worlds" value={insights.bestWorlds.join(', ') || 'N/A'} />
          <StatCard icon="📈" label="Trends" value={insights.trends.substring(0, 20) + '...'} />
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
      {/* TODO: Integrated in Phase F Dashboard */}
      <div className="dd-pending-section">
        <h2>⏰ Pending Follow-ups</h2>
        <div className="dd-pending-list">
          <p className="placeholder">Follow-up tracking available in Phase F Dashboard</p>
        </div>
      </div>

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
  return (
    <div className="decision-card">
      <div className="decision-header">
        <h3>{decision.title || decision.question}</h3>
        <span className="decision-category">{decision.world}</span>
      </div>

      <p className="decision-description">
        {decision.description || `Chose: ${decision.userChoice}`}
      </p>

      <div className="decision-meta">
        <div className="meta-item">
          <span className="meta-label">Twin Recommendation:</span>
          <span className="meta-value">{decision.twinRecommendation}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Date:</span>
          <span className="meta-value">
            {new Date(decision.decisionDate || decision.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Phase E Integration Note */}
      <div className="decision-note">
        <small>Follow-ups managed in Phase F Dashboard</small>
      </div>
    </div>
  );
}
