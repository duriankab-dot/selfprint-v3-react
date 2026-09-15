/**
 * PatternsPage.tsx — /twin/patterns
 * 
 * Behavioral patterns and decision insights page
 * Shows detected patterns, forecasts, and intelligence insights
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { supabase } from '../services/supabase-service';
import { AppShell } from '@/components/layout/AppShell';
import { Twin } from '@/components/twin/Twin';
import '../styles/decision-dashboard.css';

interface DetectedPattern {
  id: string;
  twin_id: string;
  pattern_type: string;
  pattern_name: string;
  description: string;
  confidence: number;
  first_detected: string;
  last_observed: string;
  occurrence_count: number;
}

interface ForecastData {
  short_term: string;
  medium_term: string;
  long_term: string;
  confidence: number;
}

export default function PatternsPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { currentTwin } = useTwin();

  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [forecasts, setForecasts] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'behavioral' | 'emotional' | 'social'>('all');

  useEffect(() => {
    if (!session?.user?.id) {
      navigate('/login');
      return;
    }

    async function loadPatterns() {
      setLoading(true);

      try {
        // Load behavioral patterns
        const { data: patternData, error: patternError } = await supabase
          .from('behavioral_patterns')
          .select('*')
          .eq('twin_id', currentTwin?.id || '')
          .order('occurrence_count', { ascending: false });

        if (patternError) {
          // Table may not exist yet, continue with empty patterns
          console.warn('behavioral_patterns table not available:', patternError);
          setPatterns([]);
        } else {
          setPatterns(patternData || []);
        }

        // Load forecast data from sice_feedback or a dedicated forecast table
        const { data: forecastData } = await supabase
          .from('sice_feedback')
          .select('insight, confidence')
          .eq('twin_id', currentTwin?.id || '')
          .order('created_at', { ascending: false })
          .limit(3);

        if (forecastData && forecastData.length > 0) {
          setForecasts({
            short_term: forecastData[0]?.insight || 'No forecast available',
            medium_term: forecastData[1]?.insight || 'Continue monitoring patterns',
            long_term: forecastData[2]?.insight || 'Long-term trends being analyzed',
            confidence: 0.75,
          });
        }
      } catch (err) {
        console.error('Failed to load patterns:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPatterns();
  }, [session, currentTwin, navigate]);

  const filteredPatterns = patterns.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.pattern_type === activeFilter || p.pattern_name.toLowerCase().includes(activeFilter);
  });

  if (!session?.user?.id) {
    return null;
  }

  return (
    <AppShell>
      <div className="patterns-page">
        {/* Header */}
        <div className="pp-header" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <Twin variant="alive" size={120} />
          <h1 style={{ margin: '1rem 0 0.5rem' }}>Behavioral Patterns</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Insights and patterns your Twin has detected about you
          </p>
        </div>

        {/* Filters */}
        <div className="pp-filters" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0 1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {(['all', 'behavioral', 'emotional', 'social'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                border: '1px solid var(--border-color)',
                background: activeFilter === filter ? 'var(--primary-color)' : 'transparent',
                color: activeFilter === filter ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Forecasts */}
        {forecasts && (
          <div className="pp-forecasts" style={{ maxWidth: '800px', margin: '0 auto 2rem', padding: '0 1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Forecasts</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { label: 'Short Term', value: forecasts.short_term },
                { label: 'Medium Term', value: forecasts.medium_term },
                { label: 'Long Term', value: forecasts.long_term },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{item.label}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns List */}
        <div className="pp-patterns" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>
            Detected Patterns ({filteredPatterns.length})
          </h2>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading patterns...</p>
          ) : filteredPatterns.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'var(--card-bg)',
              borderRadius: '1rem',
              border: '1px solid var(--border-color)',
            }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                No patterns detected yet. Keep chatting with your Twin to build more insights.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem' }}>{pattern.pattern_name}</h3>
                      <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {pattern.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>Type: {pattern.pattern_type}</span>
                        <span>Occurrences: {pattern.occurrence_count}</span>
                      </div>
                    </div>
                    <div style={{
                      background: pattern.confidence > 0.8 ? '#10b981' : pattern.confidence > 0.6 ? '#f59e0b' : '#ef4444',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}>
                      {Math.round(pattern.confidence * 100)}%
                    </div>
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
