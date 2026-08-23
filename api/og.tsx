/**
 * api/og.tsx — NOT a Vercel API endpoint.
 * The actual handler lives in api/og.ts (React.createElement, no JSX).
 * This file is intentionally left as a type-only helper.
 */

// Shared copy constants (can be imported by other files if needed)
export const OG_HEADLINES_TH: Record<string, string> = {
  'th-self': 'เลิกเดาทิศทางชีวิต ให้ AI วิเคราะห์',
  mbti: 'MBTI ให้ Label — AI Twin ให้ความเข้าใจ',
  tech: 'Decision Intelligence Platform',
  default: 'สร้าง AI Twin ที่เรียนรู้จากคุณจริงๆ',
};

export const OG_HEADLINES_EN: Record<string, string> = {
  'th-self': "The AI Twin That's Intelligent at Birth",
  mbti: 'Better Than MBTI — Your AI Twin Learns',
  tech: 'Behavioral AI Decision Intelligence',
  default: 'Your Living Personal Intelligence Platform',
};
