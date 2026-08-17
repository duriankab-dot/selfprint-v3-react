import React, { useState } from 'react';
import './FilterBar.css';

interface FilterBarProps {
  onFilterChange: (filters: {
    hub?: string;
    mood?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

const HUBS: Array<{ value: string; label: string }> = [
  { value: 'identity', label: 'ตัวตน' },
  { value: 'relationships', label: 'ความสัมพันธ์' },
  { value: 'work', label: 'การงาน' },
  { value: 'health', label: 'สุขภาพ' },
  { value: 'growth', label: 'การเติบโต' },
  { value: 'creativity', label: 'ความสร้างสรรค์' },
  { value: 'spirituality', label: 'จิตวิญญาณ' },
  { value: 'finance', label: 'การเงิน' },
  { value: 'lifestyle', label: 'ไลฟ์สไตล์' },
  { value: 'community', label: 'ชุมชน' },
  { value: 'environment', label: 'สิ่งแวดล้อม' },
];

const MOODS: Array<{ value: string; label: string }> = [
  { value: 'confident', label: 'มั่นใจ' },
  { value: 'uncertain', label: 'ไม่แน่ใจ' },
  { value: 'curious', label: 'อยากรู้อยากเห็น' },
  { value: 'anxious', label: 'กังวล' },
  { value: 'calm', label: 'สงบ' },
  { value: 'energetic', label: 'มีพลัง' },
];

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const [hub, setHub] = useState<string>('');
  const [mood, setMood] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleApply = () => {
    onFilterChange({
      hub: hub || undefined,
      mood: mood || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClear = () => {
    setHub('');
    setMood('');
    setStartDate('');
    setEndDate('');
    onFilterChange({});
  };

  return (
    <div className="filter-bar">
      <div className="filter-row">
        <div className="filter-group">
          <label htmlFor="hub-select">Hub:</label>
          <select
            id="hub-select"
            value={hub}
            onChange={(e) => setHub(e.target.value)}
          >
            <option value="">ทุก Hub</option>
            {HUBS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="mood-select">Mood:</label>
          <select
            id="mood-select"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            <option value="">ทุก Mood</option>
            {MOODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label htmlFor="start-date">จาก:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date">ถึง:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-actions">
        <button className="btn-apply" onClick={handleApply}>
          กรองข้อมูล
        </button>
        <button className="btn-clear" onClick={handleClear}>
          ล้างตัวกรอง
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
