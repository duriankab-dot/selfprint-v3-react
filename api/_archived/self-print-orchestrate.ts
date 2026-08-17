import { createClient } from '@supabase/supabase-js';
import { SelfPrintOrchestrator } from '../src/services/SelfPrintOrchestrator';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const orchestrator = new SelfPrintOrchestrator();

export async function POST(req: Request) {
  try {
    const { action, userId, blueprintId, qnaResponses } = await req.json();

    switch (action) {
      case 'initiate':
        // Start Self Print process
        const newBlueprintId = await orchestrator.initiateSelfPrint(userId, qnaResponses);
        return Response.json({ blueprintId: newBlueprintId, phase: 'qa-collection' });

      case 'begin-pattern-detection':
        // After Q&A complete, detect patterns
        const patterns = await orchestrator.beginPatternDetection(blueprintId, userId, qnaResponses);
        return Response.json({ patterns, phase: 'pattern-detection' });

      case 'wow-1':
        // Generate WOW 1 moment
        const wow1 = await orchestrator.generateWOW1(blueprintId, userId, qnaResponses.patterns, qnaResponses);
        return Response.json({ insight: wow1, phase: 'wow-1-ceremony' });

      case 'check-status':
        // Check current phase for user
        const phase = await orchestrator.getCurrentPhase(userId);
        const isReady = await orchestrator.isUserReadyForTwinBirth(userId);
        return Response.json({ phase, isReady });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Self Print orchestration error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
