/**
 * DecisionDashboard.tsx
 * Central hub for decision tracking and 30/90/180/365 follow-ups
 * Main USP of Selfprint
 */

import { useEffect, useState, useCallback } from 'react';
import type { DecisionInsights } from '../types/decision';
import type { WorldId } from '../constants/worlds';
import { WORLDS } from '../constants/worlds';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDecisionStore } from '../store/decisionStore';
import { useTwin } from '../context/TwinContext';
import * as DecisionLearningService from '../services/DecisionLearningService';
import DecisionForm from '../components/features/DecisionForm';
import { AppShell } from '@/components/layout/AppShell';
import { exportDecisionLogs } from '../services/supabase-service';
import '../styles/decision-dashboard.css';

export default function DecisionDashboard() {
  const { session } = useAuth();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { currentWorld } = useTwin();
  const { decisions, loadDecisions, getFilteredDecisions } = useDecisionStore();

  const [insights, setInsights] = useState<DecisionInsights | null>(null);
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<WorldId | 'all'>(currentWorld || 'all');
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

  const filteredDecisions = getFilteredDecisions();

  if (!session?.user?.id) {
    return (
      <AppShell>
        <div className="page-content" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Not authenticated</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="decision-dashboard">
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
              {exporting === 'csv' ? (isTh ? 'กำลังส่งออก...' : 'Exporting...') : '📥 CSV'}
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
              {exporting === 'json' ? (isTh ? 'กำลังส่งออก...' : 'Exporting...') : '📥 JSON'}
            </button>
          </div>
        </div>

        {/* New Decision Button */}
        <div className="dd-controls">
          <button
            onClick={() => setShowNewDecision(!showNewDecision)}
            className="btn-primary"
          >
            {showNewDecision ? (isTh ? '✕ ยกเลิก' : '✕ Cancel') : '➕ ' + (isTh ? 'ตัดสินใจใหม่' : 'New Decision')}
          </button>
        </div>

        {/* New Decision Form */}
        {showNewDecision && (
          <div className="dd-new-decision">
            <DecisionForm userId={session!.user.id} onDecisionCreated={() => setShowNewDecision(false)} />
          </div>
        )}

        {/* World Filter */}
        <div className="dd-filters">
          <button
            onClick={() => setSelectedWorld('all')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              background: selectedWorld === 'all' ? 'var(--primary-color)' : 'transparent',
              color: selectedWorld === 'all' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {isTh ? 'ทั้งหมด' : 'All'}
          </button>
          {Object.entries(WORLDS).map(([id, world]) => (
            <button
              key={id}
              onClick={() => setSelectedWorld(id as WorldId)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                background: selectedWorld === id ? 'var(--primary-color)' : 'transparent',
                color: selectedWorld === id ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              {isTh ? world.nameTh : world.name}
            </button>
          ))}
        </div>

        {/* Insights */}
        {insights && (
          <div className="dd-insights">
            <h2>{isTh ? 'บทวิเคราะห์' : 'Insights'}</h2>
            <p><strong>{isTh ? 'อัตราการสำเร็จ:' : 'Success rate:'}</strong> {insights.successRate}%</p>
            {insights.improvementAreas && insights.improvementAreas.length > 0 && (
              <ul>
                {insights.improvementAreas.slice(0, 5).map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Decisions List */}
        <div className="dd-decisions">
          <h2>{isTh ? 'การตัดสินใจ' : 'Decisions'} ({filteredDecisions.length})</h2>
          {filteredDecisions.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              {isTh ? 'ยังไม่มีตัดสินใจ — คลิก "ตัดสินใจใหม่" เพื่อเริ่ม' : 'No decisions yet — click "New Decision" to start'}
            </p>
          ) : (
            <div className="dd-decision-list">
              {filteredDecisions.map((decision) => (
                <div key={decision.id} className="dd-decision-card">
                  <div className="dd-decision-header">
                    <h3>{decision.question}</h3>
                    <span className="dd-world-badge">{WORLDS[decision.world]?.name || decision.world}</span>
                  </div>
                  <div className="dd-decision-body">
                    <p><strong>{isTh ? 'คำแนะนำจาก Twin:' : 'Twin recommendation:'}</strong> {decision.twinRecommendation}</p>
                    <p><strong>{isTh ? 'คุณเลือก:' : 'Your choice:'}</strong> {decision.userChoice}</p>
                    <p><strong>{isTh ? 'วันที่:' : 'Date:'}</strong> {new Date(decision.chosenAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
