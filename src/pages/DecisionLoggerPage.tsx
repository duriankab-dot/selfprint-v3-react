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
import { AppShell } from '@/components/layout/AppShell';
import './decision-logger-page.css';

export const DecisionLoggerPage: React.FC = () => {
  return (
    <AppShell>
      <main className="decision-logger-page page-content">
        <DecisionLogger />
      </main>
    </AppShell>
  );
};

export default DecisionLoggerPage;
