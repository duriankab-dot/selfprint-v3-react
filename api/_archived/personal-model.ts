import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface FeedbackRequest {
  insightId: string;
  sentiment: 'very_true' | 'somewhat' | 'not_sure' | 'not_me';
  comment?: string;
  userId: string;
}

interface PersonalModelUpdate {
  user_id: string;
  insight_id: string;
  feedback_sentiment: string;
  feedback_comment?: string;
  feedback_timestamp: string;
  calibration_needed: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { insightId, sentiment, comment, userId } = req.body as FeedbackRequest;

    // Validate required fields
    if (!insightId || !sentiment || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate sentiment value
    const validSentiments = ['very_true', 'somewhat', 'not_sure', 'not_me'];
    if (!validSentiments.includes(sentiment)) {
      return res.status(400).json({ error: 'Invalid sentiment value' });
    }

    // Save feedback to personal_model_feedback table
    const feedbackRecord: PersonalModelUpdate = {
      user_id: userId,
      insight_id: insightId,
      feedback_sentiment: sentiment,
      feedback_comment: comment,
      feedback_timestamp: new Date().toISOString(),
      calibration_needed: true, // Flag for model to recalibrate
    };

    const { data, error } = await supabase
      .from('personal_model_feedback')
      .insert([feedbackRecord])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save feedback' });
    }

    // Log success
    console.log(`[§15] Feedback saved for user ${userId}, insight ${insightId}, sentiment: ${sentiment}`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Feedback saved successfully',
      data: data,
      calibration: {
        status: 'scheduled',
        description: 'Personal Model will recalibrate on next interaction',
      },
    });
  } catch (error) {
    console.error('Error in personal-model feedback endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Schema for personal_model_feedback table (Supabase):
 *
 * CREATE TABLE personal_model_feedback (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *   insight_id VARCHAR NOT NULL,
 *   feedback_sentiment VARCHAR(20) NOT NULL CHECK (feedback_sentiment IN ('very_true', 'somewhat', 'not_sure', 'not_me')),
 *   feedback_comment TEXT,
 *   feedback_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
 *   calibration_needed BOOLEAN DEFAULT true,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 * );
 *
 * CREATE INDEX idx_personal_model_feedback_user ON personal_model_feedback(user_id);
 * CREATE INDEX idx_personal_model_feedback_timestamp ON personal_model_feedback(feedback_timestamp DESC);
 */
