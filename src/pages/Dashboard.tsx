import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getDashboardInsights,
  getDecisionLogs,
  getAutonomyTrend,
  exportDecisionLogs,
} from '../services/supabase-service';
import { detectPatterns, type TrendPoint } from '../lib/patternDetection';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
// TODO: P0 #6 — import { useWorld } from '../context/WorldContext';
import { MetaTagManager } from '../components/MetaTagManager';
import { getSeoMetadata } from '../constants/seoMetadata';
import { PersonalContextBuilder } from '../lib/intelligence/PersonalContextBuilder';
import InsightsCard from '../components/dashboard/InsightsCard';
import DecisionLogTable from '../components/dashboard/DecisionLogTable';
import FilterBar from '../components/dashboard/FilterBar';
import TrendChart from '../components/dashboard/TrendChart';
import PatternInsights from '../components/dashboard/PatternInsights';
import ExportButton from '../components/dashboard/ExportButton';
import LivingTwin from '../components/dashboard/LivingTwin';
import GrowthSpace from '../components/dashboard/GrowthSpace';
import AskCoach from '../components/dashboard/AskCoach';
import AnalyticsSummary from '../components/dashboard/AnalyticsSummary';
import IntelligencePanel from '../components/dashboard/IntelligencePanel';
import ExecutiveSummary from '../components/dashboard/ExecutiveSummary';
import FutureSelfPanel from '../components/dashboard/FutureSelfPanel';
import { DecisionCard, LifePackCarousel, ForecastWidget } from '../components/dashboard/IntelligencePanels';
import { ExplorWorldsCard } from '../components/dashboard/ExplorWorldsCard';
import { NavBar } from '../components/layout/NavBar';
import { Footer } from '../components/layout/Footer';
import { BottomNav } from '../components/layout/BottomNav';
import { AmbientBadge } from '../components/experience/AmbientBadge'; // §46
import { SoundscapePlayer } from '../components/audio'; // §46
import { TwinEvolution } from '../components/twin/TwinEvolution'; // §30
import { TodaySection } from '../components/today/TodaySection'; // §5.2 Dynamic Home
import '../styles/dashboard.css';

interface Insights {
  totalInteractions: number;
  avgAutonomy: number;
  avgConfidence: number;
  topHub: string | null;
  topMood: string | null;
  avgResponseTime: number;
}

interface DecisionLog {
  id: string;
  created_at: string;
  hub: string;
  mood: string;
  autonomy_level: number;
  confidence: number;
  response_time_ms: number;
  message_length: number;
  response_length: number;
}

interface Filters {
  hub?: string;
  mood?: string;
  startDate?: string;
  endDate?: string;
}

const contextBuilder = new PersonalContextBuilder();

const Dashboard: React.FC = () => {
  // userId มาจาก Supabase Auth session จริง (ไม่ใช่ localStorage 'userId' เดิม
  // ที่ไม่มีที่ไหนเคย set — เป็น bug เดิมที่ทำให้ insights/trend ว่างเปล่าตลอด
  // ดู docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md หัวข้อ 5.4)
  const { session } = useAuth();
  const userId = session?.user?.id || '';
  const navigate = useNavigate();
  const { language } = useLanguage();
  // TODO: P0 #6 — Use world context to display world-specific insights
  // const { currentWorld, worldStats } = useWorld();
  const seoData = getSeoMetadata('dashboard', language);

  // § P2 — PersonalContext สำหรับ intelligence panels (shared cache key กับ ExperienceContext)
  const { data: personalContext = null } = useQuery({
    queryKey: ['personalContext', userId],
    queryFn: () => contextBuilder.getContext(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });
  const [insights, setInsights] = useState<Insights | null>(null);
  const [logs, setLogs] = useState<DecisionLog[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  // Fetch insights
  useEffect(() => {
    if (!userId) return;

    const fetchInsights = async () => {
      const data = await getDashboardInsights(userId);
      setInsights(data);
    };

    fetchInsights();
  }, [userId]);

  // Fetch logs with filters
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const fetchLogs = async () => {
      const data = await getDecisionLogs(
        userId,
        filters.hub,
        filters.mood,
        filters.startDate,
        filters.endDate,
        50
      );
      setLogs(data);
      setLoading(false);
    };

    fetchLogs();
  }, [userId, filters]);

  // Fetch trend data
  useEffect(() => {
    if (!userId) return;

    const fetchTrend = async () => {
      const data = await getAutonomyTrend(userId);
      setTrendData(data);
    };

    fetchTrend();
  }, [userId]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  // Phase 5.4: Pattern Detection — pure, deterministic, computed client-side
  // from the same trendData already fetched for the chart above. No new
  // Supabase query needed.
  const patterns = useMemo(() => detectPatterns(trendData), [trendData]);

  const handleExport = async (format: 'csv' | 'json') => {
    if (!userId) return;

    const content = await exportDecisionLogs(userId, format);
    if (!content) {
      alert('ไม่มีข้อมูลให้ส่งออก');
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([content], {
      type: format === 'csv' ? 'text/csv' : 'application/json',
    });
    element.href = URL.createObjectURL(file);

    const today = new Date().toISOString().split('T')[0];
    element.download = `decision_log_${today}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      {seoData && (
        <MetaTagManager
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords?.join(', ')}
          ogImage={seoData.ogImage}
          canonicalUrl={`/${language}/dashboard`}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar />
      <TwinEvolution onEvolved={() => {
        // Twin evolved
      }} />
      <div className="dashboard" style={{ flex: 1 }}>

      {/* §5.2 Dynamic วันนี้ Home — AI Orchestrator เลือก sections ตามเวลาและบริบท */}
      <TodaySection hasHistory={logs.length > 0} />

      {/* §46 Ambient + Soundscape — compact strip */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '0 1rem 0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <AmbientBadge showSoundscape compact />
        <SoundscapePlayer compact />
      </div>

      {/* Executive Summary — Phase 3: human-language AI Twin overview (§8-9) */}
      <ExecutiveSummary />

      {/* Living AI Twin — §3 states, §4 cosmic visual, §5 processing states */}
      <LivingTwin />

      {/* P0 #7 — Explore Worlds quick action */}
      <ExplorWorldsCard />

      {/* Growth Space — §12 PAST → NOW → NEXT visualization */}
      <GrowthSpace />

      {/* Ask Coach Section (Phase 5.5 UI, staged rollout — Phase 5.6) */}
      <AskCoach />

      {/* Analytics Summary (5.7 follow-up — visualizes analytics_events) */}
      <AnalyticsSummary />

      {/* Intelligence Panel — Phase 2: AI Twin Context, Patterns, Memories */}
      <IntelligencePanel />

      {/* Insights Section */}
      {insights && (
        <div className="insights-section">
          <h2>ข้อมูลเชิงลึกของคุณ</h2>
          <div className="insights-grid">
            <InsightsCard
              id="total-interactions"
              label="การโต้ตอบทั้งหมด"
              value={insights.totalInteractions}
              subtitle="ข้อความที่ติดตาม"
              insightText={`คุณมีการโต้ตอบกับ Twin ทั้งหมด ${insights.totalInteractions} ครั้ง`}
              evidence="KNOW"
            />
            <InsightsCard
              id="avg-autonomy"
              label="ความเป็นอิสระเฉลี่ย"
              value={`${insights.avgAutonomy}%`}
              subtitle="ค่าพื้นฐานของคุณ"
              insightText="วัดจากรูปแบบการตัดสินใจจริง ไม่ใช่การประเมินตัวเอง"
              evidence="INFER"
            />
            <InsightsCard
              id="avg-confidence"
              label="ความมั่นใจเฉลี่ย"
              value={insights.avgConfidence.toFixed(2)}
              subtitle="0.0 ถึง 1.0"
              insightText="ค่าเฉลี่ย Confidence Score จากทุก session"
              evidence="KNOW"
            />
            <InsightsCard
              id="top-hub"
              label="Hub ที่ใช้บ่อยที่สุด"
              value={insights.topHub || 'N/A'}
              subtitle="ใช้งานมากที่สุด"
              insightText={insights.topHub ? `คุณสำรวจ ${insights.topHub} มากกว่า Hub อื่น` : 'ยังไม่มีข้อมูลเพียงพอ'}
              evidence={insights.topHub ? 'KNOW' : 'UNKNOWN'}
            />
            <InsightsCard
              id="top-mood"
              label="Mood ที่พบบ่อยที่สุด"
              value={insights.topMood || 'N/A'}
              subtitle="รู้สึกบ่อยที่สุด"
              insightText={insights.topMood ? `${insights.topMood} เป็น Mood หลักในช่วงที่ผ่านมา` : 'ยังไม่มีข้อมูลเพียงพอ'}
              evidence={insights.topMood ? 'INFER' : 'UNKNOWN'}
            />
            <InsightsCard
              id="avg-response-time"
              label="เวลาตอบสนองเฉลี่ย"
              value={`${insights.avgResponseTime}ms`}
              subtitle="จาก Brain Gateway"
              insightText="เวลาเฉลี่ยที่ Twin ใช้ประมวลผลคำถามของคุณ"
              evidence="KNOW"
            />
          </div>
        </div>
      )}

      {/* Trend Chart Section */}
      {trendData.length > 1 && (
        <div className="chart-section">
          <h2>แนวโน้มความเป็นอิสระ</h2>
          <TrendChart data={trendData} />
        </div>
      )}

      {/* Pattern Insights Section (Phase 5.4) */}
      <PatternInsights patterns={patterns} />

      {/* Filter Section */}
      <div className="filter-section">
        <h2>กรองและค้นหา</h2>
        <FilterBar onFilterChange={handleFilterChange} />
      </div>

      {/* Decision Log Table */}
      <div className="table-section">
        <h2>บันทึกการตัดสินใจ ({logs.length} รายการ)</h2>
        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : logs.length === 0 ? (
          <div className="no-data">ไม่มีข้อมูลที่ตรงกับตัวกรอง</div>
        ) : (
          <DecisionLogTable logs={logs} />
        )}
      </div>

      {/* Export Section */}
      <div className="export-section">
        <h2>ส่งออกข้อมูล</h2>
        <div className="export-buttons">
          <ExportButton format="csv" onExport={() => handleExport('csv')} />
          <ExportButton format="json" onExport={() => handleExport('json')} />
        </div>
      </div>
      </div>
      {/* §46 P2 — Advanced Intelligence Panels */}
      <div className="p2-intelligence-grid">
        <h2 className="p2-section-title">🧬 Advanced Intelligence</h2>
        <div className="p2-panels-row">
          <FutureSelfPanel context={personalContext} />
          <DecisionCard context={personalContext} />
        </div>
        <div className="p2-panels-row">
          <LifePackCarousel context={personalContext} />
          <ForecastWidget context={personalContext} />
        </div>
      </div>

      {/* Privacy Center link — Master Direction §38 */}
      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <button
          onClick={() => navigate('/privacy')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary, #6c757d)',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '4px 8px',
          }}
        >
          🔒 ความเป็นส่วนตัว / PDPA
        </button>
      </div>
      <Footer />
      <BottomNav />
      </div>
    </>
  );
};

export default Dashboard;
