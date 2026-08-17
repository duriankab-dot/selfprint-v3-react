# SelfPrint Backend Server

Production Express backend for SelfPrint V3.

## Setup

```bash
npm install
npm run dev:backend
```

Server starts on `http://localhost:3001`

## Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL_ID=claude-haiku-4-5-20251001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
PORT=3001
```

## Endpoints

### POST /api/intelligence
Astrovera Psychology analysis via Claude.

Request:
```json
{
  "mood": "ready",
  "birthDate": "1990-01-01",
  "finetuneAnswers": {
    "question1": "answer1"
  }
}
```

Response:
```json
{
  "decisionStyle": "Analytical",
  "strengths": ["Leadership"],
  "insights": ["You are a natural strategist"],
  "opportunities": ["Develop public speaking skills"],
  "blindSpots": ["May overlook emotional impact"],
  "confidence": 0.85
}
```

### POST /api/push
Subscribe to push notifications.

Request:
```json
{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

### DELETE /api/push
Unsubscribe from push notifications.

## Deployment

### Railway

1. Push to GitHub
2. Create new Railway project
3. Connect GitHub repo
4. Add environment variables
5. Deploy automatically on push

### Local

```bash
npm run start
```

## Development

Run both frontend + backend:

```bash
npm run dev:all
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
