import React from 'react';
import './DecisionLogTable.css';

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

interface DecisionLogTableProps {
  logs: DecisionLog[];
}

const DecisionLogTable: React.FC<DecisionLogTableProps> = ({ logs }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="table-wrapper">
      <table className="decision-log-table">
        <thead>
          <tr>
            <th>เวลา</th>
            <th>Hub</th>
            <th>Mood</th>
            <th>ความเป็นอิสระ %</th>
            <th>ความมั่นใจ</th>
            <th>เวลาตอบสนอง (ms)</th>
            <th>ความยาว</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="date-cell">{formatDate(log.created_at)}</td>
              <td className="hub-cell">
                <span className="hub-badge">{log.hub}</span>
              </td>
              <td className="mood-cell">
                <span className="mood-badge">{log.mood}</span>
              </td>
              <td className="autonomy-cell">
                <div className="autonomy-bar">
                  <div
                    className="autonomy-fill"
                    style={{ width: `${log.autonomy_level}%` }}
                  />
                </div>
                <span>{log.autonomy_level}%</span>
              </td>
              <td className="confidence-cell">{log.confidence.toFixed(2)}</td>
              <td className="response-time-cell">{log.response_time_ms}ms</td>
              <td className="lengths-cell">
                {log.message_length} / {log.response_length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DecisionLogTable;
