import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Core Awakening Ceremony API
 * Endpoints for triggering and managing Twin awakening ceremony
 */
export async function POST(req: Request) {
  try {
    const { action, blueprintId, userId, wow2Insight } = await req.json();

    switch (action) {
      case 'initiate-ceremony': {
        // Verify blueprint exists and is ready for Twin birth
        const { data: blueprint, error: blueprintError } = await supabase
          .from('profiles_blueprints')
          .select('id, status, user_id')
          .eq('id', blueprintId)
          .eq('user_id', userId)
          .eq('status', 'twin-birth-ready')
          .single();

        if (blueprintError || !blueprint) {
          return Response.json(
            { error: 'Blueprint not ready for Twin birth' },
            { status: 400 }
          );
        }

        // Check if Twin already exists for this blueprint
        // TWINS406-001 FIX: .single() throws PostgREST 406 when 0 rows match
        // (very common here — most blueprints have no Twin yet). .maybeSingle()
        // returns { data: null } instead, which the `if (existingTwin)` check
        // below already handles correctly.
        const { data: existingTwin } = await supabase
          .from('twins')
          .select('id')
          .eq('blueprint_id', blueprintId)
          .maybeSingle();

        if (existingTwin) {
          return Response.json(
            {
              error: 'Twin already exists for this blueprint',
              twinId: existingTwin.id,
            },
            { status: 409 }
          );
        }

        return Response.json({
          status: 'ready',
          blueprintId,
          wow2Insight,
          ceremony: 'core-awakening',
          phases: ['intro', 'birth-animation', 'naming', 'celebration', 'complete'],
          estimated_duration_seconds: 35,
        });
      }

      case 'twin-named': {
        // Twin has been named. Verify all ceremonial data is created.
        const { twinId, twinName } = await req.json();

        // Verify Twin exists
        // TWINS406-001 FIX: see note above — a wrong/stale twinId should
        // read as "not found", not throw a 406.
        const { data: twin, error: twinError } = await supabase
          .from('twins')
          .select('id, user_id')
          .eq('id', twinId)
          .eq('user_id', userId)
          .maybeSingle();

        if (twinError || !twin) {
          return Response.json(
            { error: 'Twin not found' },
            { status: 404 }
          );
        }

        // Verify Twin context is initialized
        const { data: twinState, error: stateError } = await supabase
          .from('twin_state')
          .select('id')
          .eq('twin_id', twinId)
          .single();

        if (stateError || !twinState) {
          return Response.json(
            { error: 'Twin context not initialized' },
            { status: 400 }
          );
        }

        return Response.json({
          status: 'success',
          twinId,
          twinName,
          message: 'Twin named successfully. Ready for first conversation.',
        });
      }

      case 'get-ceremony-status': {
        // Get current ceremony status for a blueprint
        const { data: blueprint } = await supabase
          .from('profiles_blueprints')
          .select('id, status, twin_id')
          .eq('id', blueprintId)
          .eq('user_id', userId)
          .single();

        if (!blueprint) {
          return Response.json(
            { error: 'Blueprint not found' },
            { status: 404 }
          );
        }

        return Response.json({
          status: blueprint.status,
          hasTwin: !!blueprint.twin_id,
          twinId: blueprint.twin_id,
        });
      }

      default:
        return Response.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Core Awakening API error:', error);
    return Response.json(
      {
        error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
