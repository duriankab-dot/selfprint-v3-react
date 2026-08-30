import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShareButton } from '@/components/viral/ShareButton';
import './AITwinSection.css';

type LoadState = 'loading' | 'no-session' | 'empty' | 'error' | 'ready';

const AITwinSection: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const userId = session?.user?.id ?? '';

  // P2-HOTFIX: Use React Query for automatic deduplication & caching
  // Prevents duplicate fetch calls when component remounts
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!session?.access_token) return null;
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return null;
      // CF Pages SPA fallback returns HTML with 200 — detect and skip
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('application/json')) return null;
      return res.json().then((d: any) => d.profile ?? null).catch(() => null);
    },
    enabled: !!session?.access_token && !!userId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: blueprintData, isLoading: blueprintLoading } = useQuery({
    queryKey: ['userBlueprint', userId],
    queryFn: async () => {
      if (!session?.access_token) return null;
      const res = await fetch('/api/blueprint', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return null;
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('application/json')) return null;
      return res.json().then((d: any) => d.blueprint ?? null).catch(() => null);
    },
    enabled: !!session?.access_token && !!userId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Determine state based on query status
  const getState = (): LoadState => {
    if (authLoading || profileLoading || blueprintLoading) return 'loading';
    if (!session?.access_token) return 'no-session';
    if (!blueprintData) return 'empty';
    return 'ready';
  };

  const state = getState();
  const profile = profileData;
  const blueprint = blueprintData;

  const unknownLabel = isTh ? 'ไม่ทราบ' : 'Unknown';

  if (state === 'loading') {
    return (
      <div className="twin-section">
        <h2>{isTh ? 'AI Twin ของคุณ' : 'Your AI Twin'}</h2>
        <div className="loading">{isTh ? 'กำลังโหลด...' : 'Loading...'}</div>
      </div>
    );
  }

  if (state === 'no-session') {
    return (
      <div className="twin-section">
        <h2>{isTh ? 'AI Twin ของคุณ' : 'Your AI Twin'}</h2>
        <div className="twin-empty">
          <p>
            {isTh
              ? 'ยังไม่ได้เข้าสู่ระบบ ทำ onboarding หรือ login ก่อนเพื่อดู AI Twin ของคุณ'
              : 'Not logged in yet. Complete onboarding or log in to see your AI Twin.'}
          </p>
          <a href="/onboarding" className="twin-cta">{isTh ? 'เริ่ม Onboarding' : 'Start Onboarding'}</a>
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="twin-section">
        <h2>{isTh ? 'AI Twin ของคุณ' : 'Your AI Twin'}</h2>
        <div className="twin-empty">
          <p>
            {isTh
              ? 'ยังไม่มีข้อมูล AI Twin — ทำ onboarding ให้ครบก่อนเพื่อสร้าง blueprint ของคุณ'
              : 'No AI Twin data yet — complete onboarding first to build your blueprint.'}
          </p>
          <a href="/onboarding" className="twin-cta">{isTh ? 'เริ่ม Onboarding' : 'Start Onboarding'}</a>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="twin-section">
        <h2>{isTh ? 'AI Twin ของคุณ' : 'Your AI Twin'}</h2>
        <div className="twin-empty">
          <p>{isTh ? 'โหลดข้อมูล AI Twin ไม่สำเร็จ ลองรีเฟรชหน้าใหม่' : 'Failed to load AI Twin data. Try refreshing the page.'}</p>
        </div>
      </div>
    );
  }

  const handleExportBlueprint = () => {
    if (!blueprint) return;

    const lines: string[] = [
      'AI Twin Blueprint',
      '=================',
      '',
      isTh
        ? `รูปแบบการตัดสินใจ: ${blueprint.decision_style || unknownLabel}`
        : `Decision style: ${blueprint.decision_style || unknownLabel}`,
      ...(blueprint.prototype_core ? [`Prototype Core: ${blueprint.prototype_core}`] : []),
      isTh ? `ความแม่นยำ: ${blueprint.accuracy_level}%` : `Accuracy: ${blueprint.accuracy_level}%`,
      isTh ? `ที่มา: ${blueprint.source}` : `Source: ${blueprint.source}`,
      isTh ? `สร้างเมื่อ: ${blueprint.created_at}` : `Created: ${blueprint.created_at}`,
      '',
    ];

    if (profile?.date_of_birth) {
      lines.push(
        isTh
          ? `วันเกิด: ${profile.date_of_birth}${profile.place_of_birth ? ` (${profile.place_of_birth})` : ''}`
          : `Birth date: ${profile.date_of_birth}${profile.place_of_birth ? ` (${profile.place_of_birth})` : ''}`,
        ''
      );
    }

    if (blueprint.strengths?.length > 0) {
      lines.push(isTh ? 'จุดแข็ง:' : 'Strengths:', ...blueprint.strengths.map((s: string) => `- ${s}`), '');
    }
    if (blueprint.insights?.length > 0) {
      lines.push(isTh ? 'ข้อมูลเชิงลึก:' : 'Insights:', ...blueprint.insights.map((s: string) => `- ${s}`), '');
    }
    if (blueprint.opportunities?.length > 0) {
      lines.push(isTh ? 'โอกาส:' : 'Opportunities:', ...blueprint.opportunities.map((s: string) => `- ${s}`), '');
    }
    if (blueprint.blind_spots?.length > 0) {
      lines.push(isTh ? 'จุดบอด:' : 'Blind spots:', ...blueprint.blind_spots.map((s: string) => `- ${s}`), '');
    }

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = `ai-twin-blueprint-${today}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!blueprint) return null;

  return (
    <div className="twin-section">
      <h2>{isTh ? 'AI Twin ของคุณ' : 'Your AI Twin'}</h2>
      <div className="twin-card">
        <div className="twin-header">
          <div>
            <div className="twin-decision-style">{blueprint.decision_style || unknownLabel}</div>
            {blueprint.prototype_core && (
              <span className="twin-prototype-core">Prototype Core: {blueprint.prototype_core}</span>
            )}
            {profile?.date_of_birth && (
              <div className="twin-birth">
                {isTh ? 'เกิด' : 'Born'} {profile.date_of_birth}
                {profile.place_of_birth ? ` · ${profile.place_of_birth}` : ''}
              </div>
            )}
          </div>
          <div className="twin-accuracy">
            <div className="twin-accuracy-value">{blueprint.accuracy_level}%</div>
            <div className="twin-accuracy-label">{isTh ? 'ความแม่นยำ' : 'Accuracy'}</div>
          </div>
        </div>

        {blueprint.strengths?.length > 0 && (
          <div className="twin-block">
            <h3>{isTh ? 'จุดแข็ง' : 'Strengths'}</h3>
            <ul>
              {blueprint.strengths.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.insights?.length > 0 && (
          <div className="twin-block">
            <h3>{isTh ? 'ข้อมูลเชิงลึก' : 'Insights'}</h3>
            <ul>
              {blueprint.insights.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.opportunities?.length > 0 && (
          <div className="twin-block">
            <h3>{isTh ? 'โอกาส' : 'Opportunities'}</h3>
            <ul>
              {blueprint.opportunities.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.blind_spots?.length > 0 && (
          <div className="twin-block">
            <h3>{isTh ? 'จุดบอด' : 'Blind spots'}</h3>
            <ul>
              {blueprint.blind_spots.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="twin-footer">
          <span>{isTh ? 'ที่มา' : 'Source'}: {blueprint.source}</span>
          <a href="/onboarding" className="twin-refine-link">{isTh ? 'ปรับแต่งอีกครั้ง →' : 'Refine again →'}</a>
        </div>

        <div className="twin-actions">
          <ShareButton />
          <button type="button" className="twin-export-btn" onClick={handleExportBlueprint}>
            📄 {isTh ? 'ส่งออก Blueprint' : 'Export Blueprint'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITwinSection;
