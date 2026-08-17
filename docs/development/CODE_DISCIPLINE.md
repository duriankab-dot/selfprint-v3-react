# 💻 CODE DISCIPLINE — SELFPRINT STANDARDS

**This document defines how we write code at Selfprint.**

**Status:** Enforced for all pull requests  
**Last Updated:** 16 August 2026  
**Audience:** All developers

---

## 🔴 Non-Negotiable Rules

These rules are ENFORCED in code review. If your PR violates them, it will be rejected.

### §1: No Hardcoded Colors
**NEVER** hardcode colors in CSS or components.

❌ **BAD:**
```css
.button {
  color: #FFFFFF;
  background: #007AFF;
}
```

❌ **BAD:**
```tsx
<div style={{ color: "#007AFF" }}>Text</div>
```

✅ **GOOD:**
```css
.button {
  color: var(--exp-surface);
  background: var(--exp-primary);
}
```

✅ **GOOD:**
```tsx
<div className="text-exp-primary">Text</div>
```

**Why?** Design tokens are managed centrally. Changes to theme (light/dark mode, brand updates) require only one source change.

**Available Variables:** See `src/styles/design-tokens.css` or `tailwind.config.js`

---

### §2: TypeScript Strictness
**ALWAYS** use strict TypeScript. No implicit `any`.

❌ **BAD:**
```tsx
const handleClick = (event) => { // event: any (implicit)
  console.log(event);
}
```

❌ **BAD:**
```tsx
function processData(data: any) { // explicit any
  return data.result;
}
```

✅ **GOOD:**
```tsx
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget.value);
}
```

✅ **GOOD:**
```tsx
interface DataResult {
  result: string;
}

function processData(data: DataResult): string {
  return data.result;
}
```

**Why?** Type safety catches bugs at compile time, not runtime. Self Print has sensitive user data.

**Config:** See `tsconfig.json` — `noImplicitAny: true` is enforced.

---

### §3: Component File Structure
**Every component must follow this structure:**

```
src/components/
├── common/
│   ├── Button.tsx       (single component)
│   ├── Card.tsx
│   └── index.ts         (export all)
├── chat/
│   ├── NovaChat/
│   │   ├── NovaChat.tsx       (main component)
│   │   ├── NovaChat.module.css (or .scss)
│   │   ├── types.ts            (interfaces)
│   │   └── utils.ts            (helper functions)
│   ├── TwinChat/
│   │   └── [similar structure]
│   └── index.ts         (export all)
└── index.ts             (main export)
```

**File naming conventions:**
- **Components:** PascalCase (`NovaChat.tsx`, `Button.tsx`)
- **Utilities:** camelCase (`useChat.ts`, `formatText.ts`)
- **Styles:** Match component name (`NovaChat.module.css`)
- **Types:** Describe content (`types.ts`, `interfaces.ts`)

✅ **GOOD:**
```
src/components/chat/NovaChat/
├── NovaChat.tsx                 # Main component with default export
├── NovaChat.module.css          # Component styles
├── types.ts                      # TypeScript interfaces for Nova
├── useNovaBehavior.ts           # Custom hook for Nova logic
└── utils.ts                      # Utility functions (formatMessage, etc.)
```

**Why?** Consistent structure makes code navigation predictable. Each component is self-contained.

---

### §4: Props Interface Definition
**Every component must have a well-defined props interface.**

❌ **BAD:**
```tsx
export const Button = ({ label, onClick, disabled }) => {
  return <button onClick={onClick} disabled={disabled}>{label}</button>
}
```

✅ **GOOD:**
```tsx
interface ButtonProps {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md"
}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {label}
    </button>
  )
}
```

**Why?** Clear props interface = easier to use, better IDE autocomplete, self-documenting code.

---

### §5: No Magic Numbers or Strings
**Extract constants to the top of the file or to a constants file.**

❌ **BAD:**
```tsx
if (message.length > 500) {
  truncate(message);
}

setTimeout(() => refetch(), 5000);
```

✅ **GOOD:**
```tsx
const MAX_MESSAGE_LENGTH = 500;
const REFETCH_DELAY_MS = 5000;

if (message.length > MAX_MESSAGE_LENGTH) {
  truncate(message);
}

setTimeout(() => refetch(), REFETCH_DELAY_MS);
```

**Why?** Makes code self-explanatory. If you need to change the value, you only change it once.

---

### §6: Error Handling & Logging
**ALWAYS handle errors gracefully. Use logging strategically.**

❌ **BAD:**
```tsx
try {
  await fetchUserData();
} catch (e) {
  console.log("error");
}
```

✅ **GOOD:**
```tsx
try {
  const data = await fetchUserData();
  setUserData(data);
} catch (error) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : "Failed to fetch user data";
  
  logger.error("fetchUserData failed", {
    error: errorMessage,
    timestamp: new Date().toISOString(),
    userId: currentUser?.id
  });
  
  setError(new UserFacingError("Unable to load your data. Please try again."));
}
```

**Logging Levels:**
- **`logger.info()`** — User actions, lifecycle events
- **`logger.warn()`** — Unexpected but recoverable situations
- **`logger.error()`** — Errors affecting user experience
- **`logger.debug()`** — Only in development (not production)

**Why?** Production debugging requires proper logs. Generic errors frustrate users.

---

### §7: State Management Consistency
**Use Zustand for global state, React Query for async data, local state for UI.**

✅ **Good pattern:**
```tsx
// Global app state (Zustand)
const useAppStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Server state (React Query)
const { data: twinData } = useQuery({
  queryKey: ["twin", userId],
  queryFn: () => fetchTwins(userId),
});

// Component local state (React.useState)
const [isExpanded, setIsExpanded] = useState(false);
```

❌ **Avoid:**
- Multiple sources of truth for same data
- Prop drilling beyond 2–3 levels (use Context or Zustand instead)
- Redux (we use Zustand)

**Why?** Single source of truth prevents bugs. Clear separation of concerns.

---

### §8: Conditional Rendering
**Use explicit patterns, avoid ternary chains.**

❌ **BAD:**
```tsx
{isLoading ? <Spinner /> : error ? <Error message={error} /> : data ? <Content data={data} /> : <Empty />}
```

✅ **GOOD:**
```tsx
if (isLoading) return <Spinner />;
if (error) return <Error message={error} />;
if (!data) return <Empty />;

return <Content data={data} />;
```

**For simple cases, ternary is fine:**
```tsx
{isActive && <Badge>Active</Badge>}
{isFeatured ? <Star /> : null}
```

**Why?** Readable code is maintainable code. Early returns prevent cognitive load.

---

### §9: Async/Await over Promises
**Prefer async/await for readability.**

❌ **BAD:**
```tsx
fetchData()
  .then(data => setData(data))
  .then(() => setLoading(false))
  .catch(error => setError(error));
```

✅ **GOOD:**
```tsx
const loadData = async () => {
  try {
    const data = await fetchData();
    setData(data);
  } catch (error) {
    setError(error);
  }
};

useEffect(() => {
  loadData();
}, []);
```

**Why?** Async/await reads like synchronous code, easier to understand and debug.

---

### §10: Naming Conventions
**Names should be clear and descriptive.**

✅ **GOOD:**
```tsx
// Hooks
useUserProfile()
useNovaChatMessages()
useTwinAwarenessLevel()

// Event handlers
handleSubmit
onMessageSend
onTwinNameChange

// State setters
setIsLoading
setTwinData
setSelectedWorld

// Booleans (prefix with is/has/should/can)
isLoading
hasError
shouldShowModal
canUserAccess
```

❌ **BAD:**
```tsx
getData() // What data?
handle() // Handle what?
render() // Too vague
x, y, temp // No meaning
```

**Why?** Code is read more often than written. Clear names reduce cognitive load.

---

### §11: Comments & Documentation
**Write comments for WHY, not WHAT.**

❌ **BAD:**
```tsx
// Check if message is empty
if (message.trim() === "") {
  return null;
}

// Increment counter
count++;
```

✅ **GOOD:**
```tsx
// Empty messages create confusion in the Twin chat history
// Skip them to maintain clarity
if (message.trim() === "") {
  return null;
}

// Increment to track how many insights user has generated
// (used for gamification milestones)
count++;
```

**JSDoc for public functions:**
```tsx
/**
 * Analyzes user journal entries and generates initial insights.
 * 
 * @param entries - Array of journal entries from the past 7 days
 * @param userProfile - User's personal data collected during onboarding
 * @returns Promise<Insight[]> - Array of generated insights
 * 
 * @example
 * const insights = await generateInitialInsights(entries, profile);
 */
export async function generateInitialInsights(
  entries: JournalEntry[],
  userProfile: UserProfile
): Promise<Insight[]> {
  // Implementation
}
```

**Why?** Comments explain design decisions. Code changes, but WHY rarely does.

---

### §12: Import Organization
**Group imports logically: React → External → Internal.**

✅ **GOOD:**
```tsx
import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/common/Button";
import { useAppStore } from "@/store/appStore";
import { fetchUserData } from "@/api/users";

import styles from "./MyComponent.module.css";
```

❌ **BAD:**
```tsx
import styles from "./MyComponent.module.css";
import React from "react";
import { fetchUserData } from "@/api/users";
import { Button } from "@/components/common/Button";
```

**Alias paths:**
- `@/components` — Components directory
- `@/api` — API calls
- `@/store` — State management
- `@/utils` — Utilities
- `@/types` — TypeScript types
- `@/hooks` — Custom hooks
- `@/styles` — Global styles

**Why?** Organized imports are easier to scan. Consistency across team.

---

### §13: No Console Statements
**Use proper logging instead of `console.log()`.**

❌ **BAD:**
```tsx
console.log("fetching data...");
console.log(userData);
console.error("error:", error);
```

✅ **GOOD:**
```tsx
logger.info("Fetching user data", { userId });
logger.debug("userData", userData); // Only in dev mode
logger.error("Failed to fetch user data", { error, userId });
```

**Exception:** `console.warn()` for deprecation warnings in development.

**Why?** Production logs must be structured and searchable. `console.log` is lost in production.

---

### §14: Testing Requirements
**Every component/function must have tests.**

**Minimum coverage:**
- ✅ Component renders without errors
- ✅ Props are handled correctly
- ✅ User interactions work (clicks, inputs)
- ✅ Error states are displayed
- ✅ Edge cases (empty data, loading, errors)

**Testing framework:** Vitest + React Testing Library

```tsx
// MyComponent.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("calls handler on button click", () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

**Run tests:**
```bash
npm run test
npm run test:watch
npm run test:coverage
```

**Why?** Bugs in Twin interactions cause real user problems. Tests catch them early.

---

### §15: Performance Considerations
**Be mindful of performance, especially for AI chat.**

✅ **Good practices:**
```tsx
// Memoize expensive components
export const TwinChat = React.memo(({ messages }: Props) => {
  return <div>{/* render */}</div>;
});

// Use useCallback for event handlers
const handleMessage = useCallback((msg: string) => {
  // Implementation
}, [dependencies]);

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Virtualize long lists
import { FixedSizeList } from "react-window";
```

❌ **Avoid:**
- Creating inline functions in render (causes unnecessary re-renders)
- Fetching same data multiple times
- Passing large objects as props
- Unoptimized images

**Why?** Chat responsiveness is critical. Laggy UI breaks the experience.

---

## 📋 Code Review Checklist

**Before submitting a PR, verify:**

- [ ] ✅ No hardcoded colors (using var(--exp-*))
- [ ] ✅ TypeScript strict mode passes (no implicit any)
- [ ] ✅ Component structure follows §3 pattern
- [ ] ✅ Props have TypeScript interface
- [ ] ✅ No magic numbers/strings (extracted as constants)
- [ ] ✅ Errors handled gracefully with logging
- [ ] ✅ State management follows §7 pattern
- [ ] ✅ Conditional rendering is readable
- [ ] ✅ Using async/await, not then() chains
- [ ] ✅ Naming conventions followed
- [ ] ✅ Comments explain WHY, not WHAT
- [ ] ✅ Imports organized (React → External → Internal)
- [ ] ✅ No console.log() (using logger instead)
- [ ] ✅ Tests written and passing
- [ ] ✅ No console errors/warnings
- [ ] ✅ Bundle size not significantly increased
- [ ] ✅ PR description references EXECUTION_CHECKLIST task

---

## 🚨 Code Review Will Reject PRs With

1. **Hardcoded colors** — Auto-reject
2. **Implicit `any` in TypeScript** — Auto-reject
3. **No tests** — Reject unless trivial (config only)
4. **Breaking CONTRIBUTING.md rules (§1–§19)** — Auto-reject
5. **Console.log() in component code** — Request changes
6. **Ternary chains longer than 2 levels** — Request changes
7. **Magic numbers without explanation** — Request changes
8. **Missing error handling** — Request changes

---

## 📚 References

- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **React Documentation:** https://react.dev
- **Vitest:** https://vitest.dev
- **React Testing Library:** https://testing-library.com/react
- **Tailwind CSS:** https://tailwindcss.com

---

**Last Updated:** 16 August 2026  
**Enforced Version:** v2.0  
**Violations?** Open issue or discuss in PR review.
