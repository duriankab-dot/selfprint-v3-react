/**
 * 📝 DecisionList Component — รายการการตัดสินใจ
 */

import React, { useState } from 'react';
import './decision-list.css';

interface Decision {
  id: string;
  title: string;
  context: string;
  expectedOutcome: string;
  createdAt: Date;
  confidence?: number;
  actualOutcome?: string;
}

interface DecisionListProps {
  userId: string;
  decisions: Decision[];
}

const DecisionList: React.FC<DecisionListProps> = ({ decisions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="decision-list">
      <div className="decision-list__items">
        {decisions.map((decision) => (
          <div key={decision.id} className="decision-item">
            <div
              className="decision-item__header"
              onClick={() =>
                setExpandedId(expandedId === decision.id ? null : decision.id)
              }
            >
              <h3 className="decision-item__title">{decision.title}</h3>
              <span className="decision-item__date">
                {new Date(decision.createdAt).toLocaleDateString('th-TH')}
              </span>
              <span className="decision-item__confidence">
                ความมั่นใจ: {decision.confidence ?? 50}%
              </span>
            </div>

            {expandedId === decision.id && (
              <div className="decision-item__expanded">
                <div className="decision-item__section">
                  <h4>บริบท</h4>
                  <p>{decision.context}</p>
                </div>
                <div className="decision-item__section">
                  <h4>ผลลัพธ์ที่คาดหวัง</h4>
                  <p>{decision.expectedOutcome}</p>
                </div>
                {decision.actualOutcome && (
                  <div className="decision-item__section">
                    <h4>ผลลัพธ์ที่เกิดขึ้น</h4>
                    <p>{decision.actualOutcome}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionList;
