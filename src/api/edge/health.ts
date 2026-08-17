/**
 * Edge Function: Health Check
 * Ultra-lightweight, runs on Vercel Edge Network
 * No database access needed
 */

export default function handler() {
  return Response.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}

export const config = {
  runtime: 'edge',
};
