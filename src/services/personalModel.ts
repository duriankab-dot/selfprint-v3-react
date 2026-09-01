/**
 * Personal Model Service
 * Handles feedback submission and personal model updates
 * Part of §15 Feedback Loop
 */

interface FeedbackSubmissionPayload {
  insightId: string;
  sentiment: 'very_true' | 'somewhat' | 'not_sure' | 'not_me';
  comment?: string;
  userId: string;
}

interface FeedbackResponse {
  success: boolean;
  message: string;
  calibration: {
    status: 'scheduled' | 'in_progress' | 'complete';
    description: string;
  };
}

/**
 * Submit user feedback on an insight
 * Sends feedback to backend for Personal Model calibration
 *
 * @param payload - Feedback data (insightId, sentiment, comment, userId)
 * @returns Promise<FeedbackResponse>
 *
 * Flow:
 * 1. User selects sentiment + optional comment
 * 2. Submit to /api/personal-model
 * 3. Feedback saved to Supabase
 * 4. Personal Model scheduled for recalibration
 * 5. Next Twin response reflects updated understanding
 */
export async function submitPersonalModelFeedback(
  payload: FeedbackSubmissionPayload
): Promise<FeedbackResponse> {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    if (!apiBaseUrl) {
      console.warn('[PersonalModel] VITE_API_BASE_URL not set — feedback submission disabled');
      return { success: false, message: 'API not configured', calibration: { status: 'scheduled', description: 'API not configured' } };
    }
    const endpoint = `${apiBaseUrl}/api/personal-model`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        insightId: payload.insightId,
        sentiment: payload.sentiment,
        comment: payload.comment,
        userId: payload.userId,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as FeedbackResponse;

    // Log for analytics/debugging
    console.log(`[§15 Feedback] ${payload.sentiment} on insight ${payload.insightId}`, {
      timestamp: new Date().toISOString(),
      userId: payload.userId,
      hasComment: !!payload.comment,
    });

    return data;
  } catch (error) {
    console.error('[PersonalModel] Feedback submission failed:', error);
    throw new Error(
      `Failed to submit feedback: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get personal model calibration status
 * Checks if model is ready after feedback
 */
export async function getPersonalModelStatus(userId: string) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    if (!apiBaseUrl) {
      console.warn('[PersonalModel] VITE_API_BASE_URL not set — status check disabled');
      return null;
    }
    const endpoint = `${apiBaseUrl}/api/personal-model/status?userId=${userId}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[PersonalModel] Failed to get status:', error);
    throw error;
  }
}

/**
 * Types of feedback sentiments and their meanings
 */
export const SENTIMENT_LABELS = {
  very_true: {
    label: 'Very true',
    emoji: '✅',
    description: 'This insight is accurate and resonates strongly',
  },
  somewhat: {
    label: 'Somewhat',
    emoji: '🤔',
    description: 'This insight is partially accurate or partially relevant',
  },
  not_sure: {
    label: 'Not sure',
    emoji: '❓',
    description: 'You are uncertain about this insight',
  },
  not_me: {
    label: 'Not me',
    emoji: '❌',
    description: 'This insight does not apply to you',
  },
} as const;

/**
 * Map sentiment to impact on Personal Model
 * Used for weighted calibration
 */
export const SENTIMENT_WEIGHTS = {
  very_true: 1.0,      // Strong positive signal
  somewhat: 0.5,        // Weak positive signal
  not_sure: 0.0,        // Neutral signal
  not_me: -1.0,         // Strong negative signal
} as const;

/**
 * Core Learning Loop (§15):
 *
 * AI Insight
 *   ↓
 * User Feedback (very_true | somewhat | not_sure | not_me)
 *   ↓
 * Model Calibration (weight adjustment)
 *   ↓
 * Better Personal Context
 *   ↓
 * Better Twin
 *
 * This creates a virtuous cycle where the Twin learns with each feedback interaction.
 */
