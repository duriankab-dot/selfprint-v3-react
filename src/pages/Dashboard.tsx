import React, { useState, useEffect, useMemo } from 'react';
import {
  getDashboardInsights,
  getDecisionLogs,
  getAutonomyTrend,
  exportDecisionLogs,
} from '../services/supabase-service';
import { detectPatterns } from '../lib/patternDetection';
import { useAuth } from '../context/AuthContext';
import InsightsCard from '../components/dashboard/InsightsCard';
import DecisionLogTable from '../components/dashboard/DecisionLogTable';
import FilterBar from '../components/dashboard/FilterBar';
import TrendChart from '../components/dashboard/TrendChart';
import PatternInsights from '../components/dashboard/PatternInsights';
import ExportButton from '../components/dashboard/ExportButton';
import AITwinSection from '../components/dashboard/AITwinSection';
import AskCoach from '../components/dashboard/AskCoach';
import AnalyticsSummary from '../components/dashboard/AnalyticsSummary';
import { NavBar } from '../components/layout/NavBar';
import { Footer } from '../components/layout/Footer';
import { BottomNav } from '../components/layout/BottomNav';
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

interface TrendPoint {
  created_at: string;
  autonomy_level: number;
  confidence: number;
}

interface Filters {
  hub?: string;
  mood?: string;
  startDate?: string;
  endDate?: string;
}

const Dashboard: React.FC = () => {
  // userId มาจาก Supabase Auth session จริง (ไม่ใช่ localStorage 'userId' เดิม
  // ที่ไม่มีที่ไหนเคย set — เป็น bug เดิมที่ทำให้ insights/trend ว่างเปล่าตลอด
  // ดู docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md หัวข้อ 5.4)
  const { session } = useAuth();
  const userId = session?.user?.id || '';
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <div className="dashboard" style={{ flex: 1 }}>
      <div className="dashboard-header">
        <h1>📊 แดชบอร์ดความเป็นอิสระ</h1>
        <p>ติดตามรูปแบบความเป็นอิสระและข้อมูลเชิงลึกของคุณ</p>
      </div>

      {/* AI Twin Blueprint Section */}
      <AITwinSection />

      {/* Ask Coach Section (Phase 5.5 UI, staged rollout — Phase 5.6) */}
      <AskCoach />

      {/* Analytics Summary (5.7 follow-up — visualizes analytics_events) */}
      <AnalyticsSummary />

      {/* Insights Section */}
      {insights && (
        <div className="insights-section">
          <h2>ข้อมูลเชิงลึกของคุณ</h2>
          <div className="insights-grid">
            <InsightsCard
              label="การโต้ตอบทั้งหมด"
              value={insights.totalInteractions}
              subtitle="ข้อความที่ติดตาม"
            />
            <InsightsCard
              label="ความเป็นอิสระเฉลี่ย"
              value={`${insights.avgAutonomy}%`}
              subtitle="ค่าพื้นฐานของคุณ"
            />
            <InsightsCard
              label="ความมั่นใจเฉลี่ย"
              value={insights.avgConfidence.toFixed(2)}
              subtitle="0.0 ถึง 1.0"
            />
            <InsightsCard
              label="Hub ที่ใช้บ่อยที่สุด"
              value={insights.topHub || 'N/A'}
              subtitle="ใช้งานมากที่สุด"
            />
            <InsightsCard
              label="Mood ที่พบบ่อยที่สุด"
              value={insights.topMood || 'N/A'}
              subtitle="รู้สึกบ่อยที่สุด"
            />
            <InsightsCard
              label="เวลาตอบสนองเฉลี่ย"
              value={`${insights.avgResponseTime}ms`}
              subtitle="จาก nova"
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
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
