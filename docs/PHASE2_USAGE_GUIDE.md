# Phase 2 Nova AI Twin - Usage Guide

**Quick Start** | **API Reference** | **Troubleshooting**

---

## 🚀 Quick Start (5 minutes)

### Step 1: Import the Chat Hook

```tsx
import { useChat } from '@/features/chat/hooks/useChat';
import { useTwin } from '@/context/TwinContext';
```

### Step 2: Use in Component

```tsx
function ChatComponent() {
  const { messages, sendMessage, isLoading } = useChat();
  const { twin } = useTwin();

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.timestamp} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <input
        type="text"
        placeholder="Ask Nova..."
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
      />
      
      {isLoading && <div>Nova is thinking...</div>}
      {twin && <div>Current Twin: {twin.name} ({twin.primaryArchetype})</div>}
    </div>
  );
}
```

---

## 📖 API Reference

### useChat Hook

```typescript
const {
  messages,           // Message[] - conversation history
  isLoading,          // boolean - API call in progress
  error,              // Error? - if any
  sendMessage,        // (q: string) => Promise<void>
  clearHistory,       // () => void
  twin,               // TwinProfile? - current Nova
  hub,                // string - current hub
  mood,               // string - current mood
} = useChat();
```

#### Message Type

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens?: {
    input: number;
    output: number;
  };
}
```

---

### useTwin Hook

```typescript
const {
  twin,                               // TwinProfile
  createTwin,                         // (name, archetype, maturity) => void
  updateTwin,                         // (partial) => void
  setMaturityScore,                   // (score: 0-100) => void
  loading,                            // boolean
  error,                              // Error?
} = useTwin();
```

#### TwinProfile Type

```typescript
interface TwinProfile {
  id: string;
  userId: string;
  name?: string;
  primaryArchetype?: string;          // e.g., 'guide'
  secondaryArchetype?: string;        // e.g., 'healer'
  maturityScore?: number;             // 0-100
  createdAt?: string;
}
```

---

### getNovaPrompt Function

**Direct usage** (if you need the system prompt):

```typescript
import { getNovaPrompt } from '@/lib/nova-prompts/getNovaPrompt';

const systemPrompt = getNovaPrompt({
  hub: 'decision',                    // Required
  mood: 'ready',                      // Required
  archetype: 'strategist',            // Required
  maturityScore: 75,                  // Optional (0-100, default 50)
  userProfile: {                      // Optional
    decisionStyle: 'analytical',
    primaryArchetype: 'strategist',
    strengths: ['leadership'],
    blindSpots: ['delegation'],
  },
});

console.log(systemPrompt); // Full Nova system prompt (~1,200 tokens)
```

---

### selfprintChat Function

**Direct usage** (for custom integrations):

```typescript
import { selfprintChat } from '@/lib/api/selfprintChat';

const response = await selfprintChat({
  userId: 'user123',
  sessionId: 'session456',
  hub: 'decision',
  mood: 'ready',
  archetype: 'strategist',            // Optional
  question: 'How should I decide?',
  
  // Optional
  birthData: {
    date: '1990-05-15',               // YYYY-MM-DD
    time: '14:30',                    // HH:MM
    latitude: 13.7563,
    longitude: 100.5018,
    timezone: 'Asia/Bangkok',
  },
  
  twinProfile: {
    id: 'twin1',
    userId: 'user123',
    primaryArchetype: 'guide',
    maturityScore: 75,
  },
  
  history: [
    { role: 'user', content: 'I have a decision' },
    { role: 'assistant', content: 'Tell me more...' },
  ],
});

// Response structure
console.log(response.response.text);           // Nova's answer
console.log(response.persona.archetype);      // Active archetype
console.log(response.metadata.outputTokens);  // Tokens used
console.log(response.learning?.discovered);   // What Nova learned
```

#### Response Type

```typescript
interface SelfprintChatResponse {
  response: {
    text: string;
    thinking?: string;
  };
  
  persona: {
    archetype?: string;
    hub: string;
    mood: string;
    maturityLevel?: number;
  };
  
  metadata: {
    inputTokens: number;
    outputTokens: number;
    processingTimeMs: number;
    timestamp: string;
  };
  
  learning?: {
    discovered?: string[];              // New archetypes noticed
    blindSpotsAffirmed?: boolean;
    growthOpportunitiesIdentified?: string[];
  };
}
```

---

## 🎯 Hub Reference

| Hub | Use When | Nova's Role |
|-----|----------|------------|
| **identity** | Exploring who you are | The Mirror |
| **decision** | Making a choice | The Navigator |
| **relationship** | Connection issues | The Connector |
| **career** | Work/growth questions | The Catalyst |
| **health** | Wellness concerns | The Protector |
| **money** | Financial decisions | The Steward |
| **ai-twin** | Understanding Nova itself | The Companion |
| **learning** | Learning/skill goals | The Teacher |
| **creativity** | Creative blocks | The Muse |
| **spirituality** | Meaning/purpose | The Guide |
| **impact** | Legacy/influence | The Amplifier |
| **activities** | Action planning | The Facilitator |

**Switch Hub**:
```typescript
// Your app should have hub selector
const [selectedHub, setSelectedHub] = useState('decision');

// Pass to Chat component
<Chat hub={selectedHub} />
```

---

## 😊 Mood Reference

| Mood | When User Is | Nova's Tone |
|------|-------------|-----------|
| **stressed** | Overwhelmed, anxious | Grounding, calm, step-by-step |
| **confused** | Lost, unclear | Clarifying, structured, options |
| **confident** | Empowered, ready | Ambitious, realistic, forward |
| **drained** | Tired, depleted | Gentle, restorative, nourishing |
| **ready** | Energized, prepared | Decisive, momentum, action |
| **reflective** | Thoughtful, introspective | Deep, philosophical, meaningful |

**Switch Mood**:
```typescript
const [selectedMood, setSelectedMood] = useState('ready');

// Pass to Chat component
<Chat mood={selectedMood} />
```

---

## 🧠 Archetype Reference (18)

### Personal Archetypes
- **Sage**: Wise, analytical, seeks truth
- **Strategist**: Strategic, systems-oriented, ambitious
- **Creator**: Innovative, expressive, transformative
- **Explorer**: Adventurous, expansive, curious
- **Lover**: Passionate, connected, empathetic
- **Caregiver**: Compassionate, nurturing, service-oriented

### Empowerment Archetypes
- **Hero/Warrior**: Courageous, determined, fighting spirit
- **Magician**: Transformative, knowledgeable, powerful
- **Sage**: Wise, observant, seeks understanding
- **Mentor/Guide**: Supportive, wise, facilitating

### Shadow Archetypes  
- **Shadow**: Dark aspects, hidden potential
- **Rebel**: Disruptive, transforming systems
- **Jester**: Humor, lightness, irreverence
- **Innocent**: Hopeful, optimistic, trust

### Others
- **Everyman**: Grounded, relatable, connected
- **Master**: Excellent, skilled, accomplished
- **Sovereign**: Authoritative, commanding, responsible

**More about archetypes**:
See `NOVA_ARCHITECTURE.md` → Archetype Personalities table

---

## 🔧 Advanced Usage

### Custom System Prompt (for testing)

```typescript
import { getNovaPrompt } from '@/lib/nova-prompts/getNovaPrompt';

// Generate custom prompt
const customPrompt = getNovaPrompt({
  hub: 'identity',
  mood: 'reflective',
  archetype: 'sage',
  maturityScore: 100,  // Max sophistication
  userProfile: {
    primaryArchetype: 'strategist',
    strengths: ['leadership', 'vision'],
    blindSpots: ['patience', 'detail'],
  },
});

// Use with custom fetch
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Your question' }],
    system: customPrompt,  // Pass custom system prompt
  }),
});
```

### Track Learning Over Time

```typescript
import { useTwin } from '@/context/TwinContext';

const { twin, setMaturityScore } = useTwin();

// After each meaningful conversation
function onConversationEnd(response: SelfprintChatResponse) {
  // Increase maturity on engagement
  setMaturityScore((twin.maturityScore || 50) + 5);
  
  // Log learning signals
  if (response.learning?.discovered) {
    console.log('Nova learned:', response.learning.discovered);
  }
}
```

### Multi-Hub Conversation

```tsx
// Switch context mid-conversation
const hubs = ['identity', 'decision', 'career'];
const [currentHubIndex, setCurrentHubIndex] = useState(0);

function nextHub() {
  setCurrentHubIndex((i) => (i + 1) % hubs.length);
}

<Chat
  hub={hubs[currentHubIndex]}
  onSwitchHub={nextHub}
/>
```

---

## ⚠️ Troubleshooting

### Brain Gateway Not Responding

```
Error: SelfprintChatError: GATEWAY_TIMEOUT
```

**Fix**:
1. Check `.env.local` has correct `REACT_APP_BRAIN_GATEWAY_URL`
2. Verify Brain Gateway is running on that URL
3. Check network connectivity
4. Increase timeout in `.env.local`:
   ```
   REACT_APP_BRAIN_GATEWAY_TIMEOUT_MS=60000
   ```

### Prompt Generation Too Slow

```
getNovaPrompt() taking >1000ms
```

**Fix**:
- This shouldn't happen (should be <100ms)
- If it does, check system CPU usage
- Consider memoizing results:
  ```typescript
  const memoizedPrompt = useMemo(() => 
    getNovaPrompt({...params}),
    [hub, mood, archetype, maturityScore]
  );
  ```

### Twin Profile Not Persisting

```
Twin resets on page refresh
```

**Fix**:
1. Check localStorage is enabled (not private browsing)
2. Verify TwinProvider wraps your app in `App.tsx`
3. Check browser dev tools → Application → LocalStorage

### Empty Learning Signals

```
response.learning is undefined
```

**Fix**:
- This is normal - not every response has learning signals
- Check if Brain Gateway is configured to extract them
- Learning signals depend on Claude's analysis of conversation

---

## 📊 Token Usage

Monitor token consumption to optimize costs:

```typescript
const { messages } = useChat();

const totalTokens = messages.reduce((sum, msg) => {
  return sum + (msg.tokens?.input || 0) + (msg.tokens?.output || 0);
}, 0);

console.log(`Total tokens this session: ${totalTokens}`);
```

**Rough Estimates**:
- System Prompt: 1,000-1,500 tokens
- User Question: 50-200 tokens
- Nova Response: 100-500 tokens
- **Per Turn Total**: 1,150-2,200 tokens

---

## 🧪 Testing Your Integration

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatComponent from './ChatComponent';

describe('Chat with Nova', () => {
  it('should send message and receive response', async () => {
    render(<ChatComponent />);
    
    const input = screen.getByPlaceholderText('Ask Nova...');
    input.value = 'Who am I?';
    input.dispatchEvent(new Event('keypress', { bubbles: true }));
    
    // Wait for response
    const response = await screen.findByText(/Nova responds/);
    expect(response).toBeInTheDocument();
  });
});
```

---

## 📞 Support

- **Documentation**: See `NOVA_ARCHITECTURE.md`
- **Tests**: `src/__tests__/{nova-prompts,selfprint-chat,integration}.test.ts`
- **API**: `src/lib/api/selfprintChat.ts`
- **Context**: `src/context/TwinContext.tsx`

---

**Version**: Phase 2  
**Last Updated**: 2026-08-10  
**Status**: Production Ready
