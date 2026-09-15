/**
 * DecisionDashboard.tsx
 * Central hub for decision tracking and 30/90/180/365 follow-ups
 * Main USP of Selfprint
 */

import { useEffect, useState, useCallback } from 'react';
import type { Decision, DecisionInsights, DecisionOutcome } from '../types/decision';
import type { WorldId } from '../constants/worlds';
import { WORLDS } from '../constants/worlds';
import { useAuth } from '../context/AuthContext';
import { useDecisionStore } from '../store/decisionStore';
import { useTwin } from '../context/TwinContext';
import * as DecisionLearningService from '../services/DecisionLearningService';
import DecisionForm from '../components/features/DecisionForm';
import { DecisionCompare } from '../components/features/DecisionCompare';
import { AppShell } from '../components/layout/AppShell';
import { exportDecisionLogs } from '../services/supabase-service';
import '../styles/decision-dashboard.css';

export default function DecisionDashboard() {
  const { session } = useAuth();
  const { currentWorld } = useTwin();
  const { decisions, loadDecisions, getFilteredDecisions } = useDecisionStore();

  const [insights, setInsights] = useState<DecisionInsights | null>(null);
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<WorldId | 'all'>(currentWorld || 'all');
  const [outcomesMap, setOutcomesMap] = useState<Map<string, DecisionOutcome[]>>(new Map());
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);

  const handleExport = useCallback(async (format: 'csv' | 'json') => {
    if (!session?.user?.id) return;
    setExporting(format);
    try {
      const content = await exportDecisionLogs(session.user.id, format);
      if (!content) {
        alert(isTh ? 'ไม่มีข้อมูลสำหรับการส่งออก' : 'No data to export');
        return;
      }
      const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `decisions_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(null);
    }
  }, [session, isTh]);

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

  // Load outcomes for comparison
  useEffect(() => {
    async function loadOutcomes() {
      const map = new Map<string, DecisionOutcome[]>();
      for (const decision of filteredDecisions.slice(0, 10)) {
        try {
          const { data } = await (await import('../services/DecisionService')).getDecisionOutcomes(decision.id);
          if (data) {
            map.set(decision.id, data);
          }
        } catch {
          // Skip if table doesn't exist
        }
      }
      setOutcomesMap(map);
    }
    loadOutcomes();
  }, [filteredDecisions]);

  const filteredDecisions = getFilteredDecisions();

  const handleNewDecision = useCallback(() => {
    setShowNewDecision(false);
    if (session?.user?.id) {
      loadDecisions(session.user.id);
    }
  }, [session?.user?.id, loadDecisions]);

  if (!session?.user?.id) {
    return (
      <AppShell>
        <div className="page-content decision-dashboard-error">
          <p>Please login to track decisions</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="decision-dashboard page-content">
      {/* Header */}
      <div className="dd-header">
        <h1>📊 Decision Tracker</h1>
        <p className="dd-subtitle">Track decisions and learn from 30/90/180/365 follow-ups</p>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting !== null || filteredDecisions.length === 0}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              background: exporting ? 'var(--border-color)' : 'var(--card-bg)',
              color: exporting ? 'var(--text-secondary)' : 'var(--text-primary)',
              cursor: exporting || filteredDecisions.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {exporting === 'csv' ? (isTh ? 'กำลังส่งออก...' : 'Exporting...') : `📥 ${isTh ? 'CSV' : 'CSV'}`}
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting !== null || filteredDecisions.length === 0}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              background: exporting ? 'var(--border-color)' : 'var(--card-bg)',
              color: exporting ? 'var(--text-secondary)' : 'var(--text-primary)',
              cursor: exporting || filteredDecisions.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {exporting === 'json' ? (isTh ? 'กำลังส่งออก...' : 'Exporting...') : `📥 ${isTh ? 'JSON' : 'JSON'}`}
          </button>
        </div>

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
        {filteredDecisions.length >= 2 && (
          <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Select decisions below to compare
          </span>
        )}
      </div>

      {/* Compare Feature */}
      <div style={{ margin: '1rem 0' }}>
        <DecisionCompare decisions={filteredDecisions.slice(0, 10)} outcomesMap={outcomesMap} />
      </div>

      {/* New Decision Form (collapsible) */}
      {showNewDecision && (
        <div className="dd-new-decision-form">
          <h3>Log a Decision</h3>
          <p className="form-note">
            Your decision will be tracked with auto-scheduled follow-ups at 30, 90, 180, and 365 days
          </p>
          <DecisionForm
            userId={session.user.id}
            onDecisionCreated={handleNewDecision}
          />
        </div>
      )}

      {/* Decisions List */}
      <div className="dd-decisions-section" data-testid="decision-history-list">
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
    </AppShell>
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
    <div className="decision-card" data-testid="decision-item">
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
