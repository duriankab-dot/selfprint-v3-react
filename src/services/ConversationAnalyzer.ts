/**
 * ConversationAnalyzer Service (Phase 5A)
 *
 * Extracts patterns from Twin-user conversations:
 * - Themes (recurring topics)
 * - Emotional tone (mood shifts, predominant emotions)
 * - Decision-making style (analytical, intuitive, seeking advice, independent)
 * - Pain points (what user struggles with)
 * - Aspirations (what user wants to achieve)
 *
 * Used by SICE Engines for pattern discovery + insight generation
 */

import { supabase } from '../lib/supabase/client';

export interface Theme {
  theme: string;
  frequency: number;
  confidence: number; // 0-1
  examples: string[]; // quote snippets
}

export interface EmotionalTone {
  predominant: string; // 'anxious', 'confident', 'reflective', 'uncertain', 'hopeful'
  intensity: number; // 0-1
  shifts: Array<{ timestamp?: string; from: string; to: string }>;
  variance: number; // emotional stability (0=volatile, 1=stable)
}

export interface DecisionStyle {
  style: 'analytical' | 'intuitive' | 'seeking_advice' | 'independent' | 'mixed';
  confidence: number; // 0-1
  patterns: Array<{ pattern: string; frequency: number }>;
  description: string;
}

export interface PainPoint {
  point: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high'; // inferred from context
  relatedThemes: string[];
  examples: string[];
}

export interface Aspiration {
  aspiration: string;
  frequency: number;
  urgency: 'low' | 'medium' | 'high'; // inferred
  relatedThemes: string[];
  examples: string[];
}

export interface ConversationAnalysis {
  userId: string;
  twinId: string;
  themes: Theme[];
  emotionalTone: EmotionalTone;
  decisionStyle: DecisionStyle;
  painPoints: PainPoint[];
  aspirations: Aspiration[];
  messageCount: number;
  analysisDate: string;
}

// NLP keyword mappings (simple, rule-based for MVP)
const EMOTION_KEYWORDS: Record<string, string[]> = {
  anxious: ['worried', 'nervous', 'scared', 'afraid', 'stressed', 'panic', 'anxiety', 'dread', 'uncertain'],
  confident: ['sure', 'confident', 'capable', 'ready', 'strong', 'able', 'assured', 'determined'],
  reflective: ['think', 'wonder', 'consider', 'realize', 'understand', 'found', 'learned', 'discovered'],
  uncertain: ['maybe', 'possibly', 'might', 'unsure', 'doubt', 'confused', 'unclear', 'not sure'],
  hopeful: ['hope', 'hopeful', 'excited', 'looking forward', 'optimistic', 'believe', 'possible', 'can'],
  sad: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'disappointed', 'lost', 'empty'],
  angry: ['angry', 'frustrated', 'mad', 'furious', 'irritated', 'annoyed', 'resentful'],
  grateful: ['grateful', 'thankful', 'appreciate', 'thanks', 'blessed', 'fortunate', 'lucky'],
};

const DECISION_KEYWORDS: Record<string, string[]> = {
  analytical: ['analysis', 'data', 'logical', 'think', 'reason', 'evaluate', 'pros and cons', 'calculate', 'research'],
  intuitive: ['feel', 'gut', 'instinct', 'sense', 'vibe', 'intuition', 'heart says', 'just know'],
  seeking_advice: ['what do you think', 'should i', 'advice', 'help me', 'opinion', 'suggest', 'recommend', 'guidance'],
  independent: ['i decided', 'i chose', 'i will', 'i want', 'my choice', 'on my own', 'i know'],
};

const PAIN_POINT_KEYWORDS: Record<string, string[]> = {
  'career uncertainty': ['job', 'career', 'work', 'industry', 'skills', 'promotion', 'stuck', 'burned out'],
  'relationship issues': ['relationship', 'partner', 'family', 'friends', 'conflict', 'communication', 'lonely'],
  'health concerns': ['health', 'sick', 'exercise', 'sleep', 'energy', 'body', 'mental health', 'tired'],
  'financial stress': ['money', 'finance', 'debt', 'salary', 'afford', 'save', 'budget', 'broke'],
  'self doubt': ['not good enough', 'imposter', 'failure', 'stupid', 'incompetent', 'doubt', 'unworthy'],
  'overwhelmed': ['overwhelmed', 'too much', 'stressed', 'pressure', 'busy', 'exhausted', 'overloaded'],
};

const ASPIRATION_KEYWORDS: Record<string, string[]> = {
  'career growth': ['want to', 'dream of', 'aspire', 'become', 'achieve', 'lead', 'innovate', 'impact'],
  'better relationships': ['closer to', 'understand', 'connect', 'improve', 'heal', 'support', 'love'],
  'personal growth': ['grow', 'develop', 'learn', 'improve', 'better version', 'evolve', 'transform'],
  'peace and balance': ['balance', 'peace', 'calm', 'harmony', 'relax', 'rest', 'fulfillment'],
  'financial security': ['secure', 'independent', 'provide', 'comfortable', 'build wealth', 'invest'],
};

/**
 * Main analysis function: analyze all user conversations
 */
export async function analyzeConversation(
  userId: string,
  twinId: string
): Promise<{ success: boolean; analysis?: ConversationAnalysis; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    // Fetch all messages for this Twin
    const { data: messages, error: fetchError } = await supabase
      .from('conversations_messages')
      .select('id, content, sender, created_at')
      .eq('twin_id', twinId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!messages || messages.length === 0) {
      return {
        success: true,
        analysis: {
          userId,
          twinId,
          themes: [],
          emotionalTone: {
            predominant: 'neutral',
            intensity: 0,
            shifts: [],
            variance: 0,
          },
          decisionStyle: {
            style: 'mixed',
            confidence: 0,
            patterns: [],
            description: 'Not enough data',
          },
          painPoints: [],
          aspirations: [],
          messageCount: 0,
          analysisDate: new Date().toISOString(),
        },
      };
    }

    // Extract user messages only (not Twin responses)
    const userMessages = messages.filter((m) => m.sender === 'user').map((m) => m.content);

    // Run analysis functions
    const themes = extractThemes(userMessages);
    const emotionalTone = classifyEmotionalTone(userMessages);
    const decisionStyle = detectDecisionStyle(userMessages);
    const painPoints = findPainPoints(userMessages);
    const aspirations = findAspirations(userMessages);

    const analysis: ConversationAnalysis = {
      userId,
      twinId,
      themes,
      emotionalTone,
      decisionStyle,
      painPoints,
      aspirations,
      messageCount: userMessages.length,
      analysisDate: new Date().toISOString(),
    };

    return { success: true, analysis };
  } catch (error) {
    console.error('Error in analyzeConversation:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Extract recurring themes from messages
 */
export function extractThemes(messages: string[]): Theme[] {
  const themeFreq: Record<string, { freq: number; examples: string[] }> = {};

  const possibleThemes = [
    'career', 'relationships', 'health', 'finance', 'personal growth',
    'family', 'friendship', 'love', 'work', 'purpose', 'identity',
    'change', 'decision', 'fear', 'hope', 'balance', 'authenticity',
  ];

  messages.forEach((msg) => {
    const lowerMsg = msg.toLowerCase();
    possibleThemes.forEach((theme) => {
      if (lowerMsg.includes(theme)) {
        if (!themeFreq[theme]) {
          themeFreq[theme] = { freq: 0, examples: [] };
        }
        themeFreq[theme].freq++;
        if (themeFreq[theme].examples.length < 2) {
          themeFreq[theme].examples.push(msg.substring(0, 100));
        }
      }
    });
  });

  // Convert to Theme array, sorted by frequency
  const themes: Theme[] = Object.entries(themeFreq)
    .map(([theme, data]) => ({
      theme,
      frequency: data.freq,
      confidence: Math.min(data.freq / messages.length * 2, 1), // normalize
      examples: data.examples,
    }))
    .filter((t) => t.frequency >= 2) // only themes mentioned 2+ times
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8); // top 8 themes

  return themes;
}

/**
 * Classify emotional tone of conversation
 */
export function classifyEmotionalTone(messages: string[]): EmotionalTone {
  const emotionScores: Record<string, number> = {};

  // Initialize all emotions
  Object.keys(EMOTION_KEYWORDS).forEach((emotion) => {
    emotionScores[emotion] = 0;
  });

  // Score each message
  messages.forEach((msg) => {
    const lowerMsg = msg.toLowerCase();
    Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
      keywords.forEach((keyword) => {
        if (lowerMsg.includes(keyword)) {
          emotionScores[emotion]++;
        }
      });
    });
  });

  // Find predominant emotion
  const sorted = Object.entries(emotionScores).sort((a, b) => b[1] - a[1]);
  const predominant = sorted[0]?.[0] || 'neutral';
  const intensity = Math.min((sorted[0]?.[1] || 0) / messages.length, 1);

  // Detect shifts (simplified)
  const shifts: Array<{ from: string; to: string }> = [];
  let prevEmotion = predominant;
  for (let i = Math.floor(messages.length / 3); i < messages.length; i += Math.floor(messages.length / 5)) {
    if (i < messages.length) {
      const segmentEmotions: Record<string, number> = {};
      Object.keys(EMOTION_KEYWORDS).forEach((e) => (segmentEmotions[e] = 0));
      EMOTION_KEYWORDS[prevEmotion]?.forEach((kw) => {
        if (messages[i].toLowerCase().includes(kw)) segmentEmotions[prevEmotion]++;
      });
      const currEmotion = Object.entries(segmentEmotions).sort((a, b) => b[1] - a[1])[0]?.[0] || prevEmotion;
      if (currEmotion !== prevEmotion) {
        shifts.push({ from: prevEmotion, to: currEmotion });
        prevEmotion = currEmotion;
      }
    }
  }

  // Variance (emotional stability)
  const variance = shifts.length === 0 ? 1 : Math.max(0, 1 - shifts.length / 5);

  return {
    predominant,
    intensity,
    shifts,
    variance,
  };
}

/**
 * Detect user's decision-making style
 */
export function detectDecisionStyle(messages: string[]): DecisionStyle {
  const styleScores: Record<string, number> = {};

  Object.keys(DECISION_KEYWORDS).forEach((style) => {
    styleScores[style] = 0;
  });

  messages.forEach((msg) => {
    const lowerMsg = msg.toLowerCase();
    Object.entries(DECISION_KEYWORDS).forEach(([style, keywords]) => {
      keywords.forEach((keyword) => {
        if (lowerMsg.includes(keyword)) {
          styleScores[style]++;
        }
      });
    });
  });

  const sorted = Object.entries(styleScores).sort((a, b) => b[1] - a[1]);
  const topStyle = sorted[0]?.[0] as DecisionStyle['style'] || 'mixed';
  const topScore = sorted[0]?.[1] || 0;
  const secondScore = sorted[1]?.[1] || 0;

  // If close between top 2, it's mixed
  const style = topScore > secondScore * 1.5 ? topStyle : 'mixed';
  const confidence = Math.min(topScore / messages.length, 1);

  // Build patterns description
  const patterns = sorted
    .slice(0, 3)
    .map(([s, score]) => ({
      pattern: s.replace(/_/g, ' '),
      frequency: score,
    }));

  const descriptions: Record<string, string> = {
    analytical: 'You tend to analyze situations deeply before deciding',
    intuitive: 'You rely on your gut feeling and intuition',
    seeking_advice: 'You often seek advice and guidance from others',
    independent: 'You prefer to make decisions on your own',
    mixed: 'You use a mix of different decision-making approaches',
  };

  return {
    style,
    confidence,
    patterns,
    description: descriptions[style] || descriptions['mixed'],
  };
}

/**
 * Find pain points (what user struggles with)
 */
export function findPainPoints(messages: string[]): PainPoint[] {
  const pointFreq: Record<string, { freq: number; examples: string[]; severity: string }> = {};

  Object.entries(PAIN_POINT_KEYWORDS).forEach(([point, keywords]) => {
    pointFreq[point] = { freq: 0, examples: [], severity: 'low' };
    messages.forEach((msg) => {
      const lowerMsg = msg.toLowerCase();
      keywords.forEach((keyword) => {
        if (lowerMsg.includes(keyword)) {
          pointFreq[point].freq++;
          if (pointFreq[point].examples.length < 2) {
            pointFreq[point].examples.push(msg.substring(0, 100));
          }
        }
      });
    });
  });

  // Infer severity from frequency
  const points = Object.entries(pointFreq)
    .filter(([_, data]) => data.freq > 0)
    .map(([point, data]) => {
      const severity: 'low' | 'medium' | 'high' =
        data.freq >= messages.length * 0.15 ? 'high' : data.freq >= 3 ? 'medium' : 'low';
      return {
        point,
        frequency: data.freq,
        severity,
        relatedThemes: [], // will be populated by caller if needed
        examples: data.examples,
      };
    })
    .sort((a, b) => b.frequency - a.frequency);

  return points;
}

/**
 * Find aspirations (what user wants to achieve)
 */
export function findAspirations(messages: string[]): Aspiration[] {
  const aspirationFreq: Record<string, { freq: number; examples: string[] }> = {};

  Object.entries(ASPIRATION_KEYWORDS).forEach(([aspiration, keywords]) => {
    aspirationFreq[aspiration] = { freq: 0, examples: [] };
    messages.forEach((msg) => {
      const lowerMsg = msg.toLowerCase();
      keywords.forEach((keyword) => {
        if (lowerMsg.includes(keyword)) {
          aspirationFreq[aspiration].freq++;
          if (aspirationFreq[aspiration].examples.length < 2) {
            aspirationFreq[aspiration].examples.push(msg.substring(0, 100));
          }
        }
      });
    });
  });

  // Infer urgency from frequency
  const aspirations = Object.entries(aspirationFreq)
    .filter(([_, data]) => data.freq > 0)
    .map(([aspiration, data]) => {
      const urgency: 'low' | 'medium' | 'high' =
        data.freq >= messages.length * 0.1 ? 'high' : data.freq >= 2 ? 'medium' : 'low';
      return {
        aspiration,
        frequency: data.freq,
        urgency,
        relatedThemes: [],
        examples: data.examples,
      };
    })
    .sort((a, b) => b.frequency - a.frequency);

  return aspirations;
}

/**
 * Cache analysis in pattern_analysis table
 */
export async function cacheAnalysis(analysis: ConversationAnalysis): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    // Store aggregated analysis
    const { error } = await supabase.from('pattern_analysis').insert({
      user_id: analysis.userId,
      analysis_type: 'conversation',
      pattern_name: 'full_analysis',
      confidence: 0.8,
      frequency: analysis.messageCount,
      metadata: {
        themes: analysis.themes,
        emotionalTone: analysis.emotionalTone,
        decisionStyle: analysis.decisionStyle,
        painPoints: analysis.painPoints,
        aspirations: analysis.aspirations,
      },
    });

    if (error) {
      console.error('Error caching analysis:', error);
      return { success: false, error: error.message };
    }

    // Also cache individual patterns
    for (const theme of analysis.themes) {
      await supabase.from('pattern_analysis').insert({
        user_id: analysis.userId,
        analysis_type: 'theme',
        pattern_name: theme.theme,
        confidence: theme.confidence,
        frequency: theme.frequency,
        metadata: { examples: theme.examples },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error in cacheAnalysis:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get cached analysis for user
 */
export async function getCachedAnalysis(
  userId: string,
  type?: string
): Promise<{ success: boolean; patterns?: any[]; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    let query = supabase.from('pattern_analysis').select('*').eq('user_id', userId);

    if (type) {
      query = query.eq('analysis_type', type);
    }

    const { data, error } = await query.order('updated_at', { ascending: false }).limit(100);

    if (error) {
      console.error('Error fetching cached analysis:', error);
      return { success: false, error: error.message };
    }

    return { success: true, patterns: data || [] };
  } catch (error) {
    console.error('Error in getCachedAnalysis:', error);
    return { success: false, error: String(error) };
  }
}

export default {
  analyzeConversation,
  extractThemes,
  classifyEmotionalTone,
  detectDecisionStyle,
  findPainPoints,
  findAspirations,
  cacheAnalysis,
  getCachedAnalysis,
};
