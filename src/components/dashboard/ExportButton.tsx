import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import './ExportButton.css';

interface ExportButtonProps {
  format: 'csv' | 'json';
  onExport: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ format, onExport }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const icon = format === 'csv' ? '📥' : '📋';
  const label = isTh
    ? (format === 'csv' ? 'ส่งออก CSV' : 'ส่งออก JSON')
    : (format === 'csv' ? 'Export CSV' : 'Export JSON');

  return (
    <button className={`export-button export-${format}`} onClick={onExport}>
      <span className="icon">{icon}</span>
      <span className="label">{label}</span>
    </button>
  );
};

export default ExportButton;
