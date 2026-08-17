import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShareButton } from '@/components/viral/ShareButton';
import './AITwinSection.css';

interface Profile {
  date_of_birth: string | null;
  time_of_birth: string | null;
  place_of_birth: string | null;
  initial_mood: string | null;
}

interface Blueprint {
  accuracy_level: number;
  decision_style: string | null;
  strengths: string[];
  insights: string[];
  opportunities: string[];
  blind_spots: string[];
  prototype_core: string | null;
  source: string;
  created_at: string;
}

type LoadState = 'loading' | 'no-session' | 'empty' | 'error' | 'ready';

const AITwinSection: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const [state, setState] = useState<LoadState>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!session?.access_token) {
      setState('no-session');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const [profileRes, blueprintRes] = await Promise.all([
          fetch('/api/profile', { headers }),
          fetch('/api/blueprint', { headers }),
        ]);

        if (!profileRes.ok || !blueprintRes.ok) {
          if (!cancelled) setState('error');
          return;
        }

        const profileJson = await profileRes.json();
        const blueprintJson = await blueprintRes.json();

        if (cancelled) return;

        if (!blueprintJson.blueprint) {
          setState('empty');
          return;
        }

        setProfile(profileJson.profile);
        setBlueprint(blueprintJson.blueprint);
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, authLoading]);

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
      lines.push('จุดแข็ง:', ...blueprint.strengths.map((s) => `- ${s}`), '');
    }
    if (blueprint.insights?.length > 0) {
      lines.push('ข้อมูลเชิงลึก:', ...blueprint.insights.map((s) => `- ${s}`), '');
    }
    if (blueprint.opportunities?.length > 0) {
      lines.push('โอกาส:', ...blueprint.opportunities.map((s) => `- ${s}`), '');
    }
    if (blueprint.blind_spots?.length > 0) {
      lines.push('จุดบอด:', ...blueprint.blind_spots.map((s) => `- ${s}`), '');
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
              {blueprint.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.insights?.length > 0 && (
          <div className="twin-block">
            <h3>ข้อมูลเชิงลึก</h3>
            <ul>
              {blueprint.insights.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.opportunities?.length > 0 && (
          <div className="twin-block">
            <h3>โอกาส</h3>
            <ul>
              {blueprint.opportunities.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.blind_spots?.length > 0 && (
          <div className="twin-block">
            <h3>จุดบอด</h3>
            <ul>
              {blueprint.blind_spots.map((s, i) => (
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
