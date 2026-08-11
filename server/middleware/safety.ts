/**
 * Safety checks for backend requests
 */

export const SAFETY_SYSTEM_DIRECTIVE = `
You are analyzing a user's personality and decision-making style based on their birth date and responses to personality questions.
Provide balanced, constructive insights that are encouraging and grounded in psychology principles.
Never make negative generalizations or dismissive statements.
Focus on understanding strengths, growth opportunities, and individual uniqueness.
`;

interface SafetyCheckResult {
  safe: boolean;
  category?: string;
}

export function safetyCheck(input: string | null | undefined): SafetyCheckResult {
  if (!input) return { safe: true };

  // Basic length check
  if (input.length > 5000) {
    return { safe: false, category: 'too_long' };
  }

  // Check for obvious harmful content
  const harmful = [
    'kill',
    'bomb',
    'weapon',
    'illegal',
    'harmful',
    'violence',
    'abuse',
    'hate',
  ];

  const lower = input.toLowerCase();
  for (const word of harmful) {
    if (lower.includes(word)) {
      return { safe: false, category: 'harmful_content' };
    }
  }

  return { safe: true };
}
