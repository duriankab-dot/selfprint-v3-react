# 🏗️ ARCHITECTURE — SELFPRINT CODEBASE

**How code is organized and why.**

**Last Updated:** 16 August 2026  
**Status:** Current for CODEX v2.0  
**Audience:** All developers

---

## 📦 Directory Structure

```
selfprint-v3-react/
├── public/                      # Static assets
│   ├── index.html              # Entry point
│   ├── favicon.ico
│   └── assets/                 # Images, icons
│
├── src/
│   ├── index.tsx               # React entry point
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Vite entry
│   │
│   ├── components/             # React components
│   │   ├── common/             # Reusable components (Button, Card, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts        # Export all
│   │   ├── chat/               # Chat-related components
│   │   │   ├── NovaChat/       # Self Print (guide) chat
│   │   │   │   ├── NovaChat.tsx
│   │   │   │   ├── NovaChat.module.css
│   │   │   │   ├── types.ts
│   │   │   │   └── utils.ts
│   │   │   ├── TwinChat/       # AI Twin chat
│   │   │   │   ├── TwinChat.tsx
│   │   │   │   ├── TwinChat.module.css
│   │   │   │   ├── types.ts
│   │   │   │   └── useMessageHistory.ts
│   │   │   └── index.ts
│   │   ├── layout/             # Layout components
│   │   │   ├── Navigation.tsx  # 5-Tab navigation
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── pages/              # Page-level components (Today, Explore, Twin, Activity, Me)
│   │   │   ├── TodayPage.tsx
│   │   │   ├── ExplorePage.tsx
│   │   │   ├── TwinPage.tsx
│   │   │   ├── ActivityPage.tsx
│   │   │   └── MePage.tsx
│   │   ├── onboarding/         # Onboarding flow (Self Print discovery)
│   │   │   ├── EmotionStep.tsx
│   │   │   ├── DataCollectionStep.tsx
│   │   │   ├── AnalysisStep.tsx
│   │   │   └── CoreAwakeningStep.tsx
│   │   └── index.ts            # Export all
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useChat.ts          # Chat-related logic
│   │   ├── useTwins.ts         # Twin data & operations
│   │   ├── useUser.ts          # Current user
│   │   ├── useInsights.ts      # Insights generation
│   │   └── index.ts
│   │
│   ├── store/                  # Zustand state management
│   │   ├── appStore.ts         # Global app state
│   │   ├── userStore.ts        # User & auth state
│   │   ├── chatStore.ts        # Chat state
│   │   ├── twinStore.ts        # Twin state & management
│   │   └── index.ts
│   │
│   ├── api/                    # API calls & data fetching
│   │   ├── users.ts            # User endpoints
│   │   ├── twins.ts            # Twin endpoints
│   │   ├── messages.ts         # Message endpoints
│   │   ├── insights.ts         # Insight generation
│   │   ├── analytics.ts        # Analytics
│   │   └── client.ts           # Axios/fetch client config
│   │
│   ├── services/               # Business logic & complex operations
│   │   ├── nova-ai.ts          # Self Print (Nova) AI logic & prompting
│   │   ├── twin-ai.ts          # AI Twin logic & personality
│   │   ├── sice/               # 12 SICE engines
│   │   │   ├── emotionEngine.ts
│   │   │   ├── memoryEngine.ts
│   │   │   ├── insightEngine.ts
│   │   │   ├── learningEngine.ts
│   │   │   ├── predictionEngine.ts
│   │   │   ├── reflectionEngine.ts
│   │   │   ├── growthEngine.ts
│   │   │   ├── decisionEngine.ts
│   │   │   ├── connectionEngine.ts
│   │   │   ├── expertEngine.ts
│   │   │   ├── gamificationEngine.ts
│   │   │   └── evolutionEngine.ts
│   │   ├── worldsService.ts    # 12 Worlds management
│   │   └── index.ts
│   │
│   ├── lib/                    # Utility functions & helpers
│   │   ├── logger.ts           # Logging utility
│   │   ├── api-client.ts       # API client setup
│   │   ├── formatters.ts       # String/date formatters
│   │   ├── validators.ts       # Input validation
│   │   ├── constants.ts        # App-wide constants
│   │   └── index.ts
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # Export all types
│   │   ├── user.ts             # User types
│   │   ├── twin.ts             # Twin types
│   │   ├── message.ts          # Message types
│   │   ├── insight.ts          # Insight types
│   │   ├── world.ts            # World/Domain types
│   │   ├── sice.ts             # SICE engine types
│   │   └── api.ts              # API response types
│   │
│   ├── styles/                 # Global styles
│   │   ├── globals.css         # Global resets
│   │   ├── design-tokens.css   # CSS variables (colors, spacing, etc.)
│   │   ├── animations.css      # Shared animations
│   │   └── responsive.css      # Responsive utilities
│   │
│   └── config/                 # Configuration files
│       ├── routes.ts           # Route definitions
│       └── env.ts              # Environment variable validation
│
├── tests/                      # Test files (mirror src/ structure)
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── lib/
│
├── docs/                       # Documentation (this folder)
│   ├── SELFPRINT_PROJECT_CODEX.md
│   ├── SELFPRINT_EXECUTION_CHECKLIST_v1.0.md
│   ├── SELFPRINT_COMPLETE_GAP_MAP_v1.0.md
│   ├── onboarding/
│   ├── development/
│   ├── reference/
│   └── archive/
│
├── .env.example                # Environment variables template
├── .env.local                  # Local environment (git ignored)
├── .env.production             # Production environment
├── .gitignore
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite build config
├── tailwind.config.js          # Tailwind CSS config
├── package.json
└── README.md
```

---

## 🧠 Data Flow Architecture

### User Journey Through Selfprint

```
Landing Page
    ↓
Authentication (Supabase)
    ↓
[ACT I: Self Print Discovery]
    ├→ Emotion Selection
    ├→ 6-Question Onboarding (Data Collection)
    ├→ Nova Analysis (First Insight = WOW 1)
    ├→ Fine-tuning & 12 SICE Processing
    ├→ Full Analysis (WOW 2)
    └→ Ready for Awakening
    ↓
[ACT II: Core Awakening]
    ├→ Hologram Birth Animation
    ├→ Twin Appears
    ├→ User Names Twin
    └→ Connection Established
    ↓
[ACT III: Living with Twin]
    ├→ Today Page (Personal Home)
    ├→ Explore Page (Discover Yourself)
    ├→ Twin Page (Chat & Evolve) ← CENTER OF EXPERIENCE
    ├→ Activity Page (Do/Reflect/Practice)
    └→ Me Page (Settings & Personal Data)
```

### Component Hierarchy

```
App.tsx
├── Router / Navigation.tsx
│   ├── TodayPage
│   │   └── Personal Dashboard Components
│   ├── ExplorePage
│   │   └── Worlds & Discovery Components
│   ├── TwinPage ← CENTER
│   │   ├── TwinChat Component
│   │   └── Twin Interaction UI
│   ├── ActivityPage
│   │   └── Actions, Reflections, Practices
│   └── MePage
│       └── User Settings & Profile
└── Modal/Toast Components (global)
```

### State Management Flow

```
User Action (click, type, etc.)
    ↓
Component Handler (onChange, onClick, etc.)
    ↓
Dispatch to Zustand Store (appStore, userStore, chatStore, twinStore)
    ↓
Store Action (async or sync)
    ├→ Fetch from API (React Query)
    ├→ Process with Service (nova-ai, twin-ai, SICE engines)
    └→ Update Store State
    ↓
Component Re-renders (from store subscription)
    ↓
Display to User
```

---

## 🔗 Data Models

### Key Entities

#### User
```tsx
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  profile: {
    emotionalState: string;    // Current mood
    basicInfo: string[];       // Answers to onboarding questions
  };
  twins: Twin[];               // User's AI Twins (can have multiple)
  insights: Insight[];         // Generated insights
  currentPhase: "onboarding" | "core-awakening" | "living-with-twin";
}
```

#### Twin
```tsx
interface Twin {
  id: string;
  userId: string;
  name: string;                // Named by user at Core Awakening
  personality: {
    traits: string[];
    style: string;             // Based on user data
  };
  intelligence: {
    level: 1 | 2 | 3 | 4 | 5;  // Growth stage
    siceScores: SICEScores;     // 12 SICE engine scores
  };
  memories: Message[];         // Conversation history
  worldKnowledge: WorldData[]; // Understanding of 12 Worlds
  createdAt: Date;
  lastInteractionAt: Date;
}
```

#### Message
```tsx
interface Message {
  id: string;
  conversationId: string;
  sender: "user" | "nova" | "twin";  // Who sent it
  content: string;
  metadata: {
    world?: string;             // Which World (if applicable)
    insight?: InsightId;        // Linked insight (if any)
    tone?: "supportive" | "analytical" | "questioning";
  };
  timestamp: Date;
  reactions?: Reaction[];       // User feedback on message
}
```

#### Insight
```tsx
interface Insight {
  id: string;
  userId: string;
  type: "pattern" | "strength" | "growth-area" | "recommendation";
  title: string;
  description: string;
  worlds: string[];             // Related Worlds
  generatedAt: Date;
  userFeedback: "helpful" | "not-helpful" | null;
}
```

#### World
```tsx
interface World {
  id: string;
  name: string;                 // e.g., "Career & Calling"
  description: string;
  icon: string;
  userExplorationLevel: 0 | 1 | 2 | 3 | 4 | 5;  // How much explored
  insights: Insight[];
  actions: Action[];
}
```

---

## 🚀 Component Patterns

### Page Component Pattern
Every page follows this structure:

```tsx
// src/components/pages/ExamplePage.tsx
import React, { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { useExampleData } from "@/hooks/useExampleData";
import { ExampleSection } from "@/components/common/ExampleSection";

interface ExamplePageProps {
  userId: string;
}

export const ExamplePage: React.FC<ExamplePageProps> = ({ userId }) => {
  // 1. Get global state
  const { theme } = useAppStore();
  
  // 2. Get page-specific data
  const { data, isLoading, error } = useExampleData(userId);
  
  // 3. Side effects
  useEffect(() => {
    // Track page view
    logger.info("ExamplePage loaded");
  }, []);
  
  // 4. Early returns for states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;
  
  // 5. Render content
  return (
    <div className="example-page">
      <h1>Example Page</h1>
      <ExampleSection data={data} />
    </div>
  );
};
```

### Container/Presenter Pattern
Complex features use container + presenter:

```tsx
// src/components/chat/TwinChat/TwinChatContainer.tsx (Logic)
export const TwinChatContainer: React.FC = () => {
  const { messages, sendMessage } = useChat();
  const twin = useTwin();
  
  return (
    <TwinChatPresenter 
      messages={messages} 
      onSendMessage={sendMessage}
      twin={twin}
    />
  );
};

// src/components/chat/TwinChat/TwinChatPresenter.tsx (UI)
interface TwinChatPresenterProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  twin: Twin;
}

export const TwinChatPresenter: React.FC<TwinChatPresenterProps> = ({
  messages,
  onSendMessage,
  twin,
}) => {
  return (
    <div className="twin-chat">
      {/* Render UI */}
    </div>
  );
};
```

---

## 🔌 Integration Points

### API Client
```tsx
// src/lib/api-client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach auth token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### React Query Setup
```tsx
// src/hooks/useChat.ts
import { useQuery, useMutation } from "@tanstack/react-query";

export const useChat = (conversationId: string) => {
  const { data: messages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const sendMutation = useMutation({
    mutationFn: (message: string) => sendMessage(conversationId, message),
    onSuccess: (newMessage) => {
      // Optimistic update
      queryClient.invalidateQueries(["messages", conversationId]);
    },
  });
  
  return {
    messages: messages || [],
    sendMessage: sendMutation.mutate,
    isLoading: sendMutation.isPending,
  };
};
```

### Supabase Auth
```tsx
// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sign up
export const signUp = (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // Update store
  useUserStore.setState({ user: session?.user, isAuthenticated: !!session });
});
```

---

## 🧠 Service Layer Pattern

### SICE Engine Example (Emotion Engine)
```tsx
// src/services/sice/emotionEngine.ts
export interface EmotionAnalysis {
  currentMood: string;
  triggers: string[];
  patterns: string[];
  recommendations: string[];
}

export const emotionEngine = {
  analyze: async (
    journalEntries: JournalEntry[],
    conversationHistory: Message[]
  ): Promise<EmotionAnalysis> => {
    // Combine data sources
    const allData = [...journalEntries, ...conversationHistory];
    
    // Use Claude API to analyze
    const analysis = await callClaudeAPI({
      model: "claude-3-opus",
      messages: [{
        role: "user",
        content: `Analyze emotional patterns: ${allData}`,
      }],
    });
    
    return parseAnalysis(analysis);
  },
};
```

---

## 📊 Routing

### Route Configuration
```tsx
// src/config/routes.ts
export const ROUTES = {
  // Public
  LANDING: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  
  // Protected (after auth)
  ONBOARDING: "/onboarding",
  
  // Main app (after onboarding)
  TODAY: "/app/today",
  EXPLORE: "/app/explore",
  TWIN: "/app/twin",
  ACTIVITY: "/app/activity",
  ME: "/app/me",
  
  // Sub-routes
  WORLD_DETAIL: "/app/explore/world/:worldId",
  TWIN_DETAIL: "/app/twin/:twinId",
};
```

### React Router Setup
```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path={ROUTES.ONBOARDING} element={<OnboardingFlow />} />
          <Route path={ROUTES.TODAY} element={<TodayPage />} />
          <Route path={ROUTES.EXPLORE} element={<ExplorePage />} />
          <Route path={ROUTES.TWIN} element={<TwinPage />} />
          <Route path={ROUTES.ACTIVITY} element={<ActivityPage />} />
          <Route path={ROUTES.ME} element={<MePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
```

---

## 🔐 Security Considerations

1. **Auth:** Supabase handles authentication
2. **API Calls:** All require JWT token (added by interceptor)
3. **Sensitive Data:** Never store in localStorage (use sessionStorage for temporary)
4. **Environment Variables:** Sensitive keys in `.env.local` (not committed)
5. **Rate Limiting:** API client should respect rate limits
6. **CORS:** Backend should whitelist frontend origin

---

## ⚡ Performance Optimization

1. **Code Splitting:** Lazy load pages with React.lazy()
2. **Image Optimization:** Use next-gen formats (WebP)
3. **State Optimization:** Use React.memo() for expensive components
4. **API Caching:** React Query handles cache invalidation
5. **Bundle Size:** Monitor with `npm run build -- --analyze`

---

## 🧪 Testing Architecture

Tests mirror `src/` structure:

```
tests/
├── components/
│   ├── chat/
│   │   └── TwinChat.test.tsx
│   └── common/
│       └── Button.test.tsx
├── hooks/
│   └── useChat.test.ts
├── services/
│   └── nova-ai.test.ts
└── lib/
    └── api-client.test.ts
```

Each test file:
- Tests the default export
- Mocks external dependencies
- Covers happy path + edge cases
- Uses descriptive test names

---

## 📚 Adding a New Feature

**Step-by-step guide:**

1. **Create component** in `src/components/`
2. **Add types** in `src/types/`
3. **Add API call** in `src/api/` (if needed)
4. **Add Zustand store** in `src/store/` (if needed)
5. **Create custom hook** in `src/hooks/` (if needed)
6. **Write tests** in `tests/`
7. **Add to page** or navigation
8. **Update types/index.ts** to export new types
9. **Update components/index.ts** to export new component
10. **Create PR** following GIT_WORKFLOW.md

---

## 📞 Architecture Decision Records (ADRs)

For major architectural decisions, create an ADR file:

```
docs/adr/
├── ADR-001-state-management.md
├── ADR-002-api-client-setup.md
└── ADR-003-sice-engine-orchestration.md
```

Format:
- Title
- Status (Proposed/Accepted/Deprecated)
- Context
- Decision
- Consequences
- Alternatives Considered

---

**Last Updated:** 16 August 2026  
**Version:** CODEX v2.0  
**Questions?** See CODE_DISCIPLINE.md or GIT_WORKFLOW.md
