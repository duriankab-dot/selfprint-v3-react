/**
 * IntelligenceHub.tsx
 *
 * APPSHELL-002 FIX: per the app-shell redesign, Dashboard was acting like
 * 5-7 stacked products at once (Insights grid, Trend Chart, Pattern
 * Insights, full filterable Decision Log + Export, Growth Space, Ask
 * Coach, Analytics Summary, Intelligence Panel, and 4 "Advanced
 * Intelligence" panels — all rendered unconditionally on every Dashboard
 * visit). This page is where that content now lives, reached from
 * Dashboard's "Deep Intelligence" / "View full decision log" links instead
 * of being dumped on the entry screen.
 *
 * PRESENTATION LAYER ONLY: every section below is the exact JSX + data
 * fetching Dashboard.tsx used to own — components, props, and service
 * calls (getDashboardInsights / getDecisionLogs / getAutonomyTrend /
 * exportDecisionLogs / detectPatterns / PersonalContextBuilder) are
 * unchanged. Nothing about SICE, the API layer, the database, or business
 * logic was touched — this is purely "which page renders this JSX."
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { MetaTagManager } from '../components/MetaTagManager';
import { getSeoMetadata } from '../constants/seoMetadata';
import { PersonalContextBuilder } from '../lib/intelligence/PersonalContextBuilder';
import InsightsCard from '../components/dashboard/InsightsCard';
import DecisionLogTable from '../components/dashboard/DecisionLogTable';
import FilterBar from '../components/dashboard/FilterBar';
import TrendChart from '../components/dashboard/TrendChart';
import PatternInsights from '../components/dashboard/PatternInsights';
import ExportButton from '../components/dashboard/ExportButton';
import GrowthSpace from '../components/dashboard/GrowthSpace';
import AskCoach from '../components/dashboard/AskCoach';
import AnalyticsSummary from '../components/dashboard/AnalyticsSummary';
import IntelligencePanel from '../components/dashboard/IntelligencePanel';
import FutureSelfPanel from '../components/dashboard/FutureSelfPanel';
import { DecisionCard, LifePackCarousel, ForecastWidget } from '../components/dashboard/IntelligencePanels';
import { NavBar } from '../components/layout/NavBar';
import { Footer } from '../components/layout/Footer';
import { BottomNav } from '../components/layout/BottomNav';
import { NavRail } from '../components/layout/NavRail';
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

const IntelligenceHub: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id || '';
  const { language } = useLanguage();
  const isTh = language === 'th';
  const seoData = getSeoMetadata('dashboard', language);

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

  useEffect(() => {
    if (!userId) return;
    const fetchInsights = async () => {
      const data = await getDashboardInsights(userId);
      setInsights(data);
    };
    fetchInsights();
  }, [userId]);

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

  const patterns = useMemo(() => {
    try {
      return detectPatterns(trendData);
    } catch (err) {
      console.warn('[IntelligenceHub] Pattern detection error:', err);
      return [];
    }
  }, [trendData]);

  const handleExport = async (format: 'csv' | 'json') => {
    if (!userId) return;
    const content = await exportDecisionLogs(userId, format);
    if (!content) {
      alert(isTh ? 'ไม่มีข้อมูลให้ส่งออก' : 'No data to export');
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
          title={isTh ? 'ปัญญาเชิงลึก | SELFPRINT' : 'Deep Intelligence | SELFPRINT'}
          description={seoData.description}
          keywords={seoData.keywords?.join(', ')}
          ogImage={seoData.ogImage}
          canonicalUrl={`/${language}/intelligence`}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar />
        <div className="dashboard" data-testid="intelligence-hub-container" style={{ flex: 1 }}>
          <div className="dashboard-header">
            <h1>🧬 {isTh ? 'ปัญญาเชิงลึก' : 'Deep Intelligence'}</h1>
            <p>
              {isTh
                ? 'ข้อมูลเชิงลึก แนวโน้ม รูปแบบพฤติกรรม และบันทึกการตัดสินใจทั้งหมดของคุณ'
                : 'Your full insights, trends, behavioral patterns, and decision history'}
            </p>
          </div>

          {/* Growth Space — §12 PAST → NOW → NEXT visualization */}
          <GrowthSpace />

          {/* Ask Coach Section */}
          <AskCoach />

          {/* Analytics Summary */}
          <AnalyticsSummary />

          {/* Intelligence Panel — AI Twin Context, Patterns, Memories */}
          <IntelligencePanel />

          {/* Insights Section */}
          {insights && (
            <div className="insights-section">
              <h2>{isTh ? 'ข้อมูลเชิงลึกของคุณ' : 'Your Insights'}</h2>
              <div className="insights-grid">
                <InsightsCard
                  id="total-interactions"
                  label={isTh ? 'การโต้ตอบทั้งหมด' : 'Total Interactions'}
                  value={insights.totalInteractions}
                  subtitle={isTh ? 'ข้อความที่ติดตาม' : 'Messages tracked'}
                  insightText={isTh ? `คุณมีการโต้ตอบกับ Twin ทั้งหมด ${insights.totalInteractions} ครั้ง` : `You've interacted with your Twin ${insights.totalInteractions} times`}
                  evidence="KNOW"
                />
                <InsightsCard
                  id="avg-autonomy"
                  label={isTh ? 'ความเป็นอิสระเฉลี่ย' : 'Avg Autonomy'}
                  value={`${insights.avgAutonomy}%`}
                  subtitle={isTh ? 'ค่าพื้นฐานของคุณ' : 'Your baseline'}
                  insightText={isTh ? 'วัดจากรูปแบบการตัดสินใจจริง ไม่ใช่การประเมินตัวเอง' : 'Measured from real decision patterns, not self-assessment'}
                  evidence="INFER"
                />
                <InsightsCard
                  id="avg-confidence"
                  label={isTh ? 'ความมั่นใจเฉลี่ย' : 'Avg Confidence'}
                  value={insights.avgConfidence.toFixed(2)}
                  subtitle={isTh ? '0.0 ถึง 1.0' : '0.0 to 1.0'}
                  insightText={isTh ? 'ค่าเฉลี่ย Confidence Score จากทุก session' : 'Average confidence score across all sessions'}
                  evidence="KNOW"
                />
                <InsightsCard
                  id="top-hub"
                  label={isTh ? 'Hub ที่ใช้บ่อยที่สุด' : 'Top Hub'}
                  value={insights.topHub || 'N/A'}
                  subtitle={isTh ? 'ใช้งานมากที่สุด' : 'Most used'}
                  insightText={insights.topHub ? (isTh ? `คุณสำรวจ ${insights.topHub} มากกว่า Hub อื่น` : `You explore ${insights.topHub} more than other hubs`) : (isTh ? 'ยังไม่มีข้อมูลเพียงพอ' : 'Not enough data yet')}
                  evidence={insights.topHub ? 'KNOW' : 'UNKNOWN'}
                />
                <InsightsCard
                  id="top-mood"
                  label={isTh ? 'Mood ที่พบบ่อยที่สุด' : 'Top Mood'}
                  value={insights.topMood || 'N/A'}
                  subtitle={isTh ? 'รู้สึกบ่อยที่สุด' : 'Most frequent'}
                  insightText={insights.topMood ? (isTh ? `${insights.topMood} เป็น Mood หลักในช่วงที่ผ่านมา` : `${insights.topMood} has been your dominant mood recently`) : (isTh ? 'ยังไม่มีข้อมูลเพียงพอ' : 'Not enough data yet')}
                  evidence={insights.topMood ? 'INFER' : 'UNKNOWN'}
                />
                <InsightsCard
                  id="avg-response-time"
                  label={isTh ? 'เวลาตอบสนองเฉลี่ย' : 'Avg Response Time'}
                  value={`${insights.avgResponseTime}ms`}
                  subtitle={isTh ? 'จาก Brain Gateway' : 'From Brain Gateway'}
                  insightText={isTh ? 'เวลาเฉลี่ยที่ Twin ใช้ประมวลผลคำถามของคุณ' : 'Average time your Twin takes to process your questions'}
                  evidence="KNOW"
                />
              </div>
            </div>
          )}

          {/* Trend Chart Section */}
          {trendData.length > 1 && (
            <div className="chart-section">
              <h2>{isTh ? 'แนวโน้มความเป็นอิสระ' : 'Autonomy Trend'}</h2>
              <TrendChart data={trendData} />
            </div>
          )}

          {/* Pattern Insights Section */}
          <PatternInsights patterns={patterns} />

          {/* Filter Section */}
          <div className="filter-section">
            <h2>{isTh ? 'กรองและค้นหา' : 'Filter & Search'}</h2>
            <FilterBar onFilterChange={handleFilterChange} />
          </div>

          {/* Decision Log Table */}
          <div className="table-section">
            <h2>{isTh ? `บันทึกการตัดสินใจ (${logs.length} รายการ)` : `Decision Log (${logs.length} entries)`}</h2>
            {loading ? (
              <div className="loading">{isTh ? 'กำลังโหลด...' : 'Loading...'}</div>
            ) : logs.length === 0 ? (
              <div className="no-data">{isTh ? 'ไม่มีข้อมูลที่ตรงกับตัวกรอง' : 'No data matches the filter'}</div>
            ) : (
              <DecisionLogTable logs={logs} />
            )}
          </div>

          {/* Export Section */}
          <div className="export-section">
            <h2>{isTh ? 'ส่งออกข้อมูล' : 'Export Data'}</h2>
            <div className="export-buttons">
              <ExportButton format="csv" onExport={() => handleExport('csv')} />
              <ExportButton format="json" onExport={() => handleExport('json')} />
            </div>
          </div>

          {/* Advanced Intelligence Panels */}
          <div className="p2-intelligence-grid">
            <h2 className="p2-section-title">🧬 {isTh ? 'ปัญญาขั้นสูง' : 'Advanced Intelligence'}</h2>
            <div className="p2-panels-row">
              <FutureSelfPanel context={personalContext} />
              <DecisionCard context={personalContext} />
            </div>
            <div className="p2-panels-row">
              <LifePackCarousel context={personalContext} />
              <ForecastWidget context={personalContext} />
            </div>
          </div>
        </div>
        <Footer />
        <NavRail />
      <BottomNav />
      </div>
    </>
  );
};

export default IntelligenceHub;
