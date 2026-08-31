/**
 * ActivitiesPage.tsx
 *
 * APPSHELL-001 FIX: Activities is no longer its own bottom-nav destination —
 * its activity catalog was merged into ExplorePage.tsx (see that file) per
 * the app-shell redesign ("รวมกิจกรรมเข้ากับสำรวจ"). This route is kept as a
 * redirect so existing deep links (TodaySection.tsx, PalmistryPage.tsx,
 * TarotPage.tsx, and any bookmarked /activities URL) keep working.
 */

import { Navigate, useLocation } from 'react-router-dom';

export default function ActivitiesPage() {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith('/th') ? '/th' : '/en';
  return <Navigate to={`${prefix}/explore`} replace />;
}
