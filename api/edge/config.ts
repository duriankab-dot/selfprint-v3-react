/**
 * Edge Function: Config
 * Returns public app configuration
 * No auth required, caches well
 */

export default function handler() {
  return Response.json(
    {
      success: true,
      config: {
        app: 'selfprint-v3-react',
        version: '1.0.0',
        features: ['animations', 'twin-evolution', 'notifications', 'sice-engines'],
        limits: {
          maxConversationLength: 50000,
          maxNotifications: 1000,
          maxPatterns: 100,
        },
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}

export const config = {
  runtime: 'edge',
};
