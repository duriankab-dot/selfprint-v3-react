import { useEffect, useState } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllWorlds } from '../constants/worlds';
import { supabase } from '../services/supabase-service';
import { ProvenanceStrip } from '../components/story/ProvenanceStrip';

interface WorldPattern {
  worldId: string;
  worldName: string;
  icon: string;
  insights: string[];
  patternCount: number;
  confidence: number;
  lastUpdated: string | null;
}

export default function TwinPatternsPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { twin, loading: twinLoading } = useTwin();
  const { language } = useLanguage();
  const isTh = language === 'th';

  const [patterns, setPatterns] = useState<WorldPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!session?.user?.id || !twin) return;

    const fetchPatterns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error: fetchError } = await supabase
          .schema('selfprint')
          .from('twin_insights')
          .select('world_id, insight_text, confidence, created_at, pattern_count')
          .eq('twin_id', twin.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const worldPatterns: WorldPattern[] = getAllWorlds().map((world) => {
          const worldInsights = data?.filter((i) => i.world_id === world.id) || [];
          return {
            worldId: world.id,
            worldName: isTh ? world.nameTh : world.name,
            icon: world.emoji,
            insights: worldInsights.map((i) => i.insight_text),
            patternCount: worldInsights.reduce((sum, i) => sum + (i.pattern_count || 1), 0),
            confidence: worldInsights.length > 0
              ? worldInsights.reduce((sum, i) => sum + (i.confidence || 0), 0) / worldInsights.length
              : 0,
            lastUpdated: worldInsights.length > 0 ? worldInsights[0].created_at : null,
          };
        });

        setPatterns(worldPatterns);
      } catch (err) {
        console.error('Failed to fetch patterns:', err);
        setError(err instanceof Error ? err.message : 'Failed to load patterns');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatterns();
  }, [session?.user?.id, twin?.id, isTh]);

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <p className="text-gray-500">{isTh ? 'กำลังนำไปยังหน้าเข้าสู่ระบบ...' : 'Redirecting to sign in...'}</p>
      </div>
    );
  }

  if (twinLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">{isTh ? 'กำลังโหลดข้อมูล Twin...' : 'Loading Twin data...'}</p>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-white">{isTh ? 'ยังไม่มี Twin' : 'No Twin Yet'}</h1>
          <p className="text-gray-400 mb-6">
            {isTh
              ? 'คุณยังไม่ได้สร้าง AI Twin เริ่มต้นที่พิธีการปลุกตื่นได้เลย'
              : 'You haven\'t created your AI Twin yet. Start at the Awakening Ceremony.'}
          </p>
          <button
            onClick={() => navigate('/twin-birth', { replace: true })}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            {isTh ? 'ไปที่พิธีการปลุกตื่น' : 'Go to Awakening Ceremony'}
          </button>
        </div>
      </div>
    );
  }

  const totalPatterns = patterns.reduce((sum, p) => sum + p.patternCount, 0);
  const avgConfidence = patterns.length > 0
    ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
    : 0;
  const worldsWithPatterns = patterns.filter((p) => p.patternCount > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {isTh ? 'Behavioral Patterns' : 'Behavioral Patterns'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isTh
                ? `รูปแบบพฤติกรรม ${totalPatterns} patterns จาก 12 โลกแห่งชีวิต`
                : `${totalPatterns} patterns across 12 Worlds of Life`}
            </p>
          </div>
          <button
            onClick={() => navigate('/twin-profile', { replace: true })}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            {isTh ? '← กลับโปรไฟล์' : '← Back to Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{isTh ? 'Total Patterns' : 'Total Patterns'}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalPatterns}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{isTh ? 'โลกที่มีข้อมูล' : 'Worlds with Data'}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{worldsWithPatterns} / 12</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{isTh ? 'ความมั่นใจเฉลี่ย' : 'Avg Confidence'}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{Math.round(avgConfidence * 100)}%</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full mb-4"></div>
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <div
                key={pattern.worldId}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer"
                onClick={() => navigate(`/worlds/${pattern.worldId}`, { replace: true })}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pattern.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{pattern.worldName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{pattern.worldId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-500">{pattern.patternCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'patterns' : 'patterns'}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">{isTh ? 'ความมั่นใจ' : 'Confidence'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{Math.round(pattern.confidence * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${pattern.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>

                {pattern.insights.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isTh ? 'Insights ล่าสุด:' : 'Latest Insights:'}
                    </p>
                    {pattern.insights.slice(0, 2).map((insight, idx) => (
                      <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">"{insight}"</p>
                    ))}
                    {pattern.insights.length > 2 && (
                      <p className="text-xs text-blue-500 hover:underline cursor-pointer">
                        {isTh ? `ดูเพิ่มอีก ${pattern.insights.length - 2} รายการ...` : `View ${pattern.insights.length - 2} more...`}
                      </p>
                    )}
                  </div>
                )}

                {pattern.lastUpdated && (
                  <ProvenanceStrip patternCount={pattern.patternCount} className="text-right" />
                )}

                {!pattern.lastUpdated && pattern.patternCount === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
                    {isTh ? 'ยังไม่มีข้อมูล โลกนี้จะสร้าง patterns เมื่อคุณมีการตัดสินใจหรือกิจกรรมที่เกี่ยวข้อง' : 'No data yet. This world will generate patterns as you make decisions or activities related to it.'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isTh ? 'เกี่ยวกับ Behavioral Patterns' : 'About Behavioral Patterns'}
          </h3>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
            <p>
              {isTh
                ? 'Behavioral Patterns คือรูปแบบพฤติกรรมที่ Twin เรียนรู้จากข้อมูลจริงของคุณ — ไม่ใช่การทำนายหรือดูดวง แต่เป็นการวิเคราะห์จากการตัดสินใจ การกระทำ และผลลัพธ์จริงในแต่ละโลกแห่งชีวิต 12 มิติ'
                : 'Behavioral Patterns are patterns Twin learns from your real data — not predictions or astrology, but analysis from your actual decisions, actions, and outcomes across 12 Worlds of Life.'}
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>{isTh ? 'แต่ละโลกสะสม patterns จากการตัดสินใจและกิจกรรมที่เกี่ยวข้อง' : 'Each world accumulates patterns from related decisions and activities'}</li>
              <li>{isTh ? 'Confidence เพิ่มขึ้นเมื่อมีข้อมูลมากขึ้น (learning loop)' : 'Confidence increases with more data (learning loop)'}</li>
              <li>{isTh ? 'Patterns ใช้ช่วย Decision Intelligence ให้แม่นยำขึ้น' : 'Patterns improve Decision Intelligence accuracy'}</li>
              <li>{isTh ? 'ข้อมูลเป็นของคุณ ทั้งหมดคุณควบคุมสิทธิ์การเข้าถึง' : 'Your data, you control all access rights'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}