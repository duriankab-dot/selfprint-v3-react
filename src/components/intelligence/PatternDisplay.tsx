/**
 * 📊 PatternDisplay Component — แสดงรูปแบบพฤติกรรม
 *
 * **ทำหน้าที่:**
 * - แสดง Behavioral Patterns ที่ PatternDetector ค้นหา
 * - ประเมินความเชื่อถือได้ (confidence) ของแต่ละ pattern
 * - แยก 3 ประเภท: repeating (เกิดซ้ำ) / emerging (ใหม่) / changing (เปลี่ยน)
 * - แสดง trend (↑ accelerating / → stable / ↓ declining)
 * - Filter + sort patterns ตามประเภทและความเชื่อถือได้
 *
 * **Input Props:**
 * - patterns: BehavioralPattern[] (from PatternDetector.detectPatterns)
 * - showConfidence?: boolean (default: true)
 * - onPatternClick?: (pattern: BehavioralPattern) => void
 *
 * **Output:**
 * - Organized pattern cards with confidence badges + type badges
 * - Trend indicators (↑/→/↓)
 * - Frequency summary
 *
 * @module intelligence/PatternDisplay
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { BehavioralPattern } from '@/lib/intelligence/types';
import './PatternDisplay.css';

// ============================================================================
// Types
// ============================================================================

type FilterType = 'all' | 'repeating' | 'emerging' | 'changing';
type SortBy = 'confidence' | 'recent' | 'type';

interface PatternDisplayProps {
  patterns: BehavioralPattern[];
  showConfidence?: boolean;
  onPatternClick?: (pattern: BehavioralPattern) => void;
}

// ============================================================================
// Component
// ============================================================================

export const PatternDisplay: React.FC<PatternDisplayProps> = ({
  patterns,
  showConfidence = true,
  onPatternClick,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('confidence');

  // Filter patterns ตามประเภท
  const filteredPatterns = useMemo(() => {
    if (filterType === 'all') return patterns;
    return patterns.filter((p) => p.patternType === filterType);
  }, [patterns, filterType]);

  // Sort patterns
  const sortedPatterns = useMemo(() => {
    const sorted = [...filteredPatterns];

    switch (sortBy) {
      case 'confidence':
        return sorted.sort((a, b) => b.confidence - a.confidence);
      case 'recent':
        return sorted.sort(
          (a, b) => new Date(b.lastDetected).getTime() - new Date(a.lastDetected).getTime()
        );
      case 'type':
        return sorted.sort((a, b) => a.patternType.localeCompare(b.patternType));
      default:
        return sorted;
    }
  }, [filteredPatterns, sortBy]);

  // Group by type for stats
  const stats = useMemo(() => {
    const counts = {
      repeating: 0,
      emerging: 0,
      changing: 0,
    };
    patterns.forEach((p) => {
      counts[p.patternType]++;
    });
    return counts;
  }, [patterns]);

  if (patterns.length === 0) {
    return (
      <div className="pattern-display pattern-display--empty">
        <p className="pattern-display__empty-message">
          {isTh ? 'ยังไม่มีรูปแบบที่ค้นหา (ทำให้พอใจก่อน 😊)' : 'No patterns found yet (keep going 😊)'}
        </p>
      </div>
    );
  }

  return (
    <div className="pattern-display">
      {/* Header: สถิติ + Filter */}
      <div className="pattern-display__header">
        <div className="pattern-display__stats">
          <span className="pattern-stats__item pattern-stats__repeating">
            🔄 {isTh ? 'เกิดซ้ำ' : 'Repeating'}: {stats.repeating}
          </span>
          <span className="pattern-stats__item pattern-stats__emerging">
            ✨ {isTh ? 'ใหม่' : 'Emerging'}: {stats.emerging}
          </span>
          <span className="pattern-stats__item pattern-stats__changing">
            📈 {isTh ? 'เปลี่ยน' : 'Changing'}: {stats.changing}
          </span>
        </div>

        <div className="pattern-display__controls">
          {/* Filter buttons */}
          <div className="pattern-display__filter">
            {(['all', 'repeating', 'emerging', 'changing'] as FilterType[]).map((type) => (
              <button
                key={type}
                className={`pattern-filter-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
                aria-label={`Filter by ${type}`}
              >
                {type === 'all' && (isTh ? 'ทั้งหมด' : 'All')}
                {type === 'repeating' && `🔄 ${isTh ? 'เกิดซ้ำ' : 'Repeating'}`}
                {type === 'emerging' && `✨ ${isTh ? 'ใหม่' : 'Emerging'}`}
                {type === 'changing' && `📈 ${isTh ? 'เปลี่ยน' : 'Changing'}`}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            className="pattern-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            aria-label="Sort patterns"
          >
            <option value="confidence">🎯 {isTh ? 'ความเชื่อถือได้สูง' : 'Highest confidence'}</option>
            <option value="recent">🕐 {isTh ? 'ล่าสุด' : 'Most recent'}</option>
            <option value="type">📂 {isTh ? 'ประเภท' : 'Type'}</option>
          </select>
        </div>
      </div>

      {/* Pattern cards */}
      <div className="pattern-display__list">
        {sortedPatterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            showConfidence={showConfidence}
            isTh={isTh}
            onClick={() => onPatternClick?.(pattern)}
          />
        ))}
      </div>

      {/* Showing N of M */}
      <div className="pattern-display__footer">
        <p className="pattern-display__count">
          {isTh
            ? `แสดง ${sortedPatterns.length} จาก ${patterns.length} รูปแบบ`
            : `Showing ${sortedPatterns.length} of ${patterns.length} patterns`}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// PatternCard Sub-Component
// ============================================================================

interface PatternCardProps {
  pattern: BehavioralPattern;
  showConfidence: boolean;
  isTh: boolean;
  onClick?: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, showConfidence, isTh, onClick }) => {
  const typeIcon = {
    repeating: '🔄',
    emerging: '✨',
    changing: '📈',
  }[pattern.patternType];

  const typeLabel = isTh
    ? {
        repeating: 'เกิดซ้ำ',
        emerging: 'ใหม่',
        changing: 'เปลี่ยน',
      }[pattern.patternType]
    : {
        repeating: 'Repeating',
        emerging: 'Emerging',
        changing: 'Changing',
      }[pattern.patternType];

  const confidenceColor = getConfidenceColor(pattern.confidence);
  const confidencePercent = Math.round(pattern.confidence * 100);

  return (
    <div className="pattern-card" onClick={onClick} role="button" tabIndex={0}>
      {/* Pattern name + type badge */}
      <div className="pattern-card__header">
        <h3 className="pattern-card__name">{pattern.patternName}</h3>
        <span className={`pattern-card__type-badge pattern-card__type-badge--${pattern.patternType}`}>
          {typeIcon} {typeLabel}
        </span>
      </div>

      {/* Description */}
      <p className="pattern-card__description">{pattern.description}</p>

      {/* Metadata: frequency + last detected */}
      <div className="pattern-card__metadata">
        <span className="pattern-metadata__item">📊 {pattern.frequency}</span>
        <span className="pattern-metadata__item">🕐 {formatLastDetected(pattern.lastDetected, isTh)}</span>
      </div>

      {/* Confidence bar */}
      {showConfidence && (
        <div className="pattern-card__confidence">
          <div className="confidence-label">
            <span>{isTh ? 'ความเชื่อถือได้' : 'Confidence'}</span>
            <span className="confidence-percent" style={{ color: confidenceColor }}>
              {confidencePercent}%
            </span>
          </div>
          <div className="confidence-bar">
            <div
              className="confidence-bar__fill"
              style={{
                width: `${confidencePercent}%`,
                backgroundColor: confidenceColor,
              }}
            />
          </div>
        </div>
      )}

      {/* AI insight */}
      {pattern.aiInsight && (
        <div className="pattern-card__insight">
          <p className="insight-label">💡 {isTh ? 'ความเห็นของ AI' : "AI's take"}</p>
          <p className="insight-text">{pattern.aiInsight}</p>
        </div>
      )}

      {/* Impact (if available) */}
      {pattern.impact && (
        <div className="pattern-card__impact">
          <p className="impact-label">⚡ {isTh ? 'ผลกระทบ' : 'Impact'}</p>
          <p className="impact-text">{pattern.impact}</p>
        </div>
      )}

      {/* Evidence count */}
      <div className="pattern-card__evidence">
        <span className="evidence-badge">📌 {pattern.evidencePoints.length} {isTh ? 'หลักฐาน' : 'evidence points'}</span>
      </div>
    </div>
  );
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * ✅ getConfidenceColor() — เลือกสีตามระดับความเชื่อถือได้
 *
 * **Logic:**
 * - 0.8+: สีเขียว (สูง มั่นใจ)
 * - 0.6-0.8: สีเหลือง (ปานกลาง)
 * - <0.6: สีส้ม (ต่ำ ต้องเก็บข้อมูลเพิ่ม)
 */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#10b981'; // green
  if (confidence >= 0.6) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

/**
 * ✅ formatLastDetected() — แปลง date เป็น "X days ago" / "Today" / "Yesterday"
 */
function formatLastDetected(date: Date, isTh: boolean): string {
  const now = new Date();
  const lastDate = new Date(date);
  const diffMs = now.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (isTh) {
    if (diffDays === 0) return 'วันนี้';
    if (diffDays === 1) return 'เมื่อวาน';
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
    return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`;
  }

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default PatternDisplay;
