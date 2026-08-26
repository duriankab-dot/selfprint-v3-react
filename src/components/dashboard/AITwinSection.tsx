import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { ShareButton } from '@/components/viral/ShareButton';
import './AITwinSection.css';

type LoadState = 'loading' | 'no-session' | 'empty' | 'error' | 'ready';

const AITwinSection: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
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
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json().then((d) => d.profile);
    },
    enabled: !!session?.access_token && !!userId,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const { data: blueprintData, isLoading: blueprintLoading } = useQuery({
    queryKey: ['userBlueprint', userId],
    queryFn: async () => {
      if (!session?.access_token) return null;
      const res = await fetch('/api/blueprint', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch blueprint');
      return res.json().then((d) => d.blueprint);
    },
    enabled: !!session?.access_token && !!userId,
    staleTime: 5 * 60 * 1000, // 5 min cache
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

  if (state === 'loading') {
    return (
      <div className="twin-section">
        <h2>AI Twin ของคุณ</h2>
        <div className="loading">กำลังโหลด...</div>
      </div>
    );
  }

  if (state === 'no-session') {
    return (
      <div className="twin-section">
        <h2>AI Twin ของคุณ</h2>
        <div className="twin-empty">
          <p>ยังไม่ได้เข้าสู่ระบบ ทำ onboarding หรือ login ก่อนเพื่อดู AI Twin ของคุณ</p>
          <a href="/onboarding" className="twin-cta">เริ่ม Onboarding</a>
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="twin-section">
        <h2>AI Twin ของคุณ</h2>
        <div className="twin-empty">
          <p>ยังไม่มีข้อมูล AI Twin — ทำ onboarding ให้ครบก่อนเพื่อสร้าง blueprint ของคุณ</p>
          <a href="/onboarding" className="twin-cta">เริ่ม Onboarding</a>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="twin-section">
        <h2>AI Twin ของคุณ</h2>
        <div className="twin-empty">
          <p>โหลดข้อมูล AI Twin ไม่สำเร็จ ลองรีเฟรชหน้าใหม่</p>
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
      `รูปแบบการตัดสินใจ: ${blueprint.decision_style || 'ไม่ทราบ'}`,
      ...(blueprint.prototype_core ? [`Prototype Core: ${blueprint.prototype_core}`] : []),
      `ความแม่นยำ: ${blueprint.accuracy_level}%`,
      `ที่มา: ${blueprint.source}`,
      `สร้างเมื่อ: ${blueprint.created_at}`,
      '',
    ];

    if (profile?.date_of_birth) {
      lines.push(
        `วันเกิด: ${profile.date_of_birth}${profile.place_of_birth ? ` (${profile.place_of_birth})` : ''}`,
        ''
      );
    }

    if (blueprint.strengths?.length > 0) {
      lines.push('จุดแข็ง:', ...blueprint.strengths.map((s: string) => `- ${s}`), '');
    }
    if (blueprint.insights?.length > 0) {
      lines.push('ข้อมูลเชิงลึก:', ...blueprint.insights.map((s: string) => `- ${s}`), '');
    }
    if (blueprint.opportunities?.length > 0) {
      lines.push('โอกาส:', ...blueprint.opportunities.map((s: string) => `- ${s}`), '');
    }
    if (blueprint.blind_spots?.length > 0) {
      lines.push('จุดบอด:', ...blueprint.blind_spots.map((s: string) => `- ${s}`), '');
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
      <h2>AI Twin ของคุณ</h2>
      <div className="twin-card">
        <div className="twin-header">
          <div>
            <div className="twin-decision-style">{blueprint.decision_style || 'ไม่ทราบ'}</div>
            {blueprint.prototype_core && (
              <span className="twin-prototype-core">Prototype Core: {blueprint.prototype_core}</span>
            )}
            {profile?.date_of_birth && (
              <div className="twin-birth">
                เกิด {profile.date_of_birth}
                {profile.place_of_birth ? ` · ${profile.place_of_birth}` : ''}
              </div>
            )}
          </div>
          <div className="twin-accuracy">
            <div className="twin-accuracy-value">{blueprint.accuracy_level}%</div>
            <div className="twin-accuracy-label">ความแม่นยำ</div>
          </div>
        </div>

        {blueprint.strengths?.length > 0 && (
          <div className="twin-block">
            <h3>จุดแข็ง</h3>
            <ul>
              {blueprint.strengths.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.insights?.length > 0 && (
          <div className="twin-block">
            <h3>ข้อมูลเชิงลึก</h3>
            <ul>
              {blueprint.insights.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.opportunities?.length > 0 && (
          <div className="twin-block">
            <h3>โอกาส</h3>
            <ul>
              {blueprint.opportunities.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.blind_spots?.length > 0 && (
          <div className="twin-block">
            <h3>จุดบอด</h3>
            <ul>
              {blueprint.blind_spots.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="twin-footer">
          <span>ที่มา: {blueprint.source}</span>
          <a href="/onboarding" className="twin-refine-link">ปรับแต่งอีกครั้ง →</a>
        </div>

        <div className="twin-actions">
          <ShareButton />
          <button type="button" className="twin-export-btn" onClick={handleExportBlueprint}>
            📄 ส่งออก Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITwinSection;
