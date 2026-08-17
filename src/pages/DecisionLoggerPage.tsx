/**
 * 📋 DecisionLoggerPage.tsx — หน้าบันทึกการตัดสินใจ
 *
 * **ทำหน้าที่:**
 * - แสดง Decision Logger dashboard
 * - ฟอร์มเพิ่มการตัดสินใจใหม่
 * - รายการการตัดสินใจที่ผ่านมา
 * - สถิติการตัดสินใจ
 *
 * Route: `/decisions`
 */

import React from 'react';
import DecisionLogger from '@/components/features/DecisionLogger';
import './decision-logger-page.css';

export const DecisionLoggerPage: React.FC = () => {
  return (
    <main className="decision-logger-page">
      <DecisionLogger />
    </main>
  );
};

export default DecisionLoggerPage;
