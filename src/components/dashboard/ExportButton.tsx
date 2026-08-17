import React from 'react';
import './ExportButton.css';

interface ExportButtonProps {
  format: 'csv' | 'json';
  onExport: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ format, onExport }) => {
  const icon = format === 'csv' ? '📥' : '📋';
  const label = format === 'csv' ? 'ส่งออก CSV' : 'ส่งออก JSON';

  return (
    <button className={`export-button export-${format}`} onClick={onExport}>
      <span className="icon">{icon}</span>
      <span className="label">{label}</span>
    </button>
  );
};

export default ExportButton;
