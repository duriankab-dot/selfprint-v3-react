import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import './FilterBar.css';

interface FilterBarProps {
  onFilterChange: (filters: {
    hub?: string;
    mood?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

function getHubs(isTh: boolean): Array<{ value: string; label: string }> {
  return [
    { value: 'identity', label: isTh ? 'ตัวตน' : 'Identity' },
    { value: 'relationships', label: isTh ? 'ความสัมพันธ์' : 'Relationships' },
    { value: 'work', label: isTh ? 'การงาน' : 'Work' },
    { value: 'health', label: isTh ? 'สุขภาพ' : 'Health' },
    { value: 'growth', label: isTh ? 'การเติบโต' : 'Growth' },
    { value: 'creativity', label: isTh ? 'ความสร้างสรรค์' : 'Creativity' },
    { value: 'spirituality', label: isTh ? 'จิตวิญญาณ' : 'Spirituality' },
    { value: 'finance', label: isTh ? 'การเงิน' : 'Finance' },
    { value: 'lifestyle', label: isTh ? 'ไลฟ์สไตล์' : 'Lifestyle' },
    { value: 'community', label: isTh ? 'ชุมชน' : 'Community' },
    { value: 'environment', label: isTh ? 'สิ่งแวดล้อม' : 'Environment' },
  ];
}

function getMoods(isTh: boolean): Array<{ value: string; label: string }> {
  return [
    { value: 'confident', label: isTh ? 'มั่นใจ' : 'Confident' },
    { value: 'uncertain', label: isTh ? 'ไม่แน่ใจ' : 'Uncertain' },
    { value: 'curious', label: isTh ? 'อยากรู้อยากเห็น' : 'Curious' },
    { value: 'anxious', label: isTh ? 'กังวล' : 'Anxious' },
    { value: 'calm', label: isTh ? 'สงบ' : 'Calm' },
    { value: 'energetic', label: isTh ? 'มีพลัง' : 'Energetic' },
  ];
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const HUBS = getHubs(isTh);
  const MOODS = getMoods(isTh);
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
            <option value="">{isTh ? 'ทุก Hub' : 'All hubs'}</option>
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
            <option value="">{isTh ? 'ทุก Mood' : 'All moods'}</option>
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
          <label htmlFor="start-date">{isTh ? 'จาก:' : 'From:'}</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date">{isTh ? 'ถึง:' : 'To:'}</label>
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
          {isTh ? 'กรองข้อมูล' : 'Apply filters'}
        </button>
        <button className="btn-clear" onClick={handleClear}>
          {isTh ? 'ล้างตัวกรอง' : 'Clear filters'}
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
