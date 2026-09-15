/**
 * TwinDetailPage.tsx — /twin/:id
 * 
 * Deep-linkable twin profile/detail page
 * Shows full twin information, evolution, stats, and memory for a specific twin
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase-service';
import { AppShell } from '@/components/layout/AppShell';
import { Twin } from '@/components/twin/Twin';
import { TwinEvolutionChart } from '@/components/features/TwinEvolutionChart';
import { TwinStatsCard } from '@/components/features/TwinStatsCard';
import { AccuracyBadgeFromMetrics } from '@/components/features/AccuracyBadgeFromMetrics';
import { MemoryList } from '@/components/memory/MemoryList';
import { ProvenanceStrip } from '@/components/story/ProvenanceStrip';
import '../styles/twin-profile.css';

interface TwinRecord {
  id: string;
  user_id: string;
  name?: string;
  archetype?: string;
  maturity_score?: number;
  visual_dna?: string;
  accuracy?: number;
  trajectory?: string;
  created_at: string;
  updated_at: string;
  full_analysis?: any;
}

export default function TwinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const [twin, setTwin] = useState<TwinRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memoryCount, setMemoryCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [patternCount, setPatternCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) {
      navigate('/login');
      return;
    }

    async function loadTwin() {
      setLoading(true);
      setError(null);

      try {
        // If no ID provided, get user's latest twin
        let query = supabase
          .from('twins')
          .select('*')
          .eq('user_id', session.user.id);

        if (id) {
          query = query.eq('id', id);
        }

        const { data, error: fetchError } = await query
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        if (!data) {
          setError('No twin found');
          return;
        }

        setTwin(data);

        // Load counts
        const [{ count: memCount }, { count: fbCount }, { count: patCount }] = await Promise.all([
          supabase.from('twin_memories').select('*', { count: 'exact', head: true }).eq('twin_id', data.id),
          supabase.from('sice_feedback').select('*', { count: 'exact', head: true }).eq('twin_id', data.id),
          supabase.from('behavioral_patterns').select('*', { count: 'exact', head: true }).eq('twin_id', data.id),
        ]);

        setMemoryCount(memCount || 0);
        setFeedbackCount(fbCount || 0);
        setPatternCount(patCount || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load twin');
      } finally {
        setLoading(false);
      }
    }

    loadTwin();
  }, [id, session, navigate]);

  if (!session?.user?.id) {
    return null;
  }

  if (loading) {
    return (
      <AppShell>
        <div className="page-content" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading Twin...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !twin) {
    return (
      <AppShell>
        <div className="page-content" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Twin Not Found</h2>
          <p>{error || 'This twin profile does not exist.'}</p>
          <button onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>
            Go to Dashboard
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="twin-detail-page">
        {/* Header */}
        <div className="td-header" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <Twin variant="alive" size={180} />
          <h1 style={{ margin: '1rem 0 0.5rem' }}>
            {twin.name || 'Your Twin'}
          </h1>
          {twin.archetype && (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Archetype: {twin.archetype}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            {twin.accuracy != null && <AccuracyBadgeFromMetrics accuracy={twin.accuracy} />}
          </div>
        </div>

        {/* Stats */}
        <div className="td-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '0 1rem', maxWidth: '800px', margin: '0 auto' }}>
          <TwinStatsCard label="Memories" value={memoryCount} icon="🧠" />
          <TwinStatsCard label="Feedback" value={feedbackCount} icon="💬" />
          <TwinStatsCard label="Patterns" value={patternCount} icon="📊" />
          <TwinStatsCard label="Maturity" value={`${Math.round((twin.maturity_score || 0) * 100)}%`} icon="🌱" />
        </div>

        {/* Evolution Chart */}
        <div className="td-evolution" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
          <h2>Evolution</h2>
          <TwinEvolutionChart twinId={twin.id} />
        </div>

        {/* Analysis */}
        {twin.full_analysis && (
          <div className="td-analysis" style={{ padding: '0 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <ProvenanceStrip
              title="Full Analysis"
              source="SICE Intelligence"
              confidence={twin.accuracy || 0.7}
            />
          </div>
        )}

        {/* Memories */}
        <div className="td-memory" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
          <h2>What Twin Knows</h2>
          <MemoryList twinId={twin.id} />
        </div>
      </div>
    </AppShell>
  );
}

// Reusable TwinStatsCard component (inline since it's simple)
function TwinStatsCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: '1rem',
      padding: '1.5rem',
      textAlign: 'center',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</div>
    </div>
  );
}
