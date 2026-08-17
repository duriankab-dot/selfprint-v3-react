# 🧪 TESTING STRATEGY — SELFPRINT

**How we test code and what we test.**

**Status:** Required for all PRs  
**Last Updated:** 16 August 2026  
**Audience:** All developers

---

## 🎯 Testing Philosophy

**We test to prevent bugs in production, not to achieve coverage numbers.**

- **Unit tests** catch logic errors early
- **Integration tests** verify feature workflows
- **Visual regression tests** catch UI breakage
- **E2E tests** verify critical user journeys

**Test Priority (Test These First):**
1. Chat interactions (Nova & Twin) — core to Selfprint
2. SICE engines — intelligence system
3. Authentication & user state
4. API integrations
5. Edge cases & error handling

---

## 📊 Coverage Targets

**Component:** ≥80% coverage  
**Hooks:** ≥85% coverage  
**Services:** ≥90% coverage  
**Overall:** ≥75% project coverage

**Why?** 75% coverage catches most bugs without being unmaintainable.

---

## 🛠️ Testing Tools

```bash
# Testing framework
npm run test              # Run tests in watch mode
npm run test:ci           # Run tests once (CI mode)
npm run test:coverage     # Run with coverage report
npm run test:debug        # Run with debugging

# Built-in:
# Vitest (test runner)
# @testing-library/react (component testing)
# @testing-library/user-event (user interactions)
# vitest-dom (custom matchers)
```

---

## 📁 Test File Structure

### Location
Test files mirror `src/` structure:

```
src/
├── components/
│   └── chat/
│       └── TwinChat.tsx

tests/
├── components/
│   └── chat/
│       └── TwinChat.test.tsx
```

### File Naming
- **Component tests:** `ComponentName.test.tsx`
- **Hook tests:** `useName.test.ts`
- **Service tests:** `serviceName.test.ts`
- **Utility tests:** `utilityName.test.ts`

---

## ✍️ Writing Tests

### Setup Template
```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { TwinChat } from "./TwinChat";

describe("TwinChat", () => {
  // Setup common test data
  const mockTwin = {
    id: "twin-123",
    name: "Echo",
    personality: { style: "thoughtful" },
  };

  const mockMessages = [
    { id: "1", sender: "user", content: "Hello" },
    { id: "2", sender: "twin", content: "Hi there!" },
  ];

  // Cleanup after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders twin chat interface", () => {
    render(<TwinChat twin={mockTwin} initialMessages={mockMessages} />);
    
    expect(screen.getByText("Echo")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });
});
```

### Pattern 1: Component Rendering

```tsx
describe("TwinChat", () => {
  it("renders without crashing", () => {
    render(<TwinChat twin={mockTwin} />);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("displays twin name and greeting", () => {
    render(<TwinChat twin={mockTwin} />);
    expect(screen.getByText(mockTwin.name)).toBeInTheDocument();
  });

  it("renders message list", () => {
    render(
      <TwinChat twin={mockTwin} initialMessages={mockMessages} />
    );
    
    mockMessages.forEach((msg) => {
      expect(screen.getByText(msg.content)).toBeInTheDocument();
    });
  });
});
```

### Pattern 2: User Interactions

```tsx
describe("TwinChat", () => {
  it("sends message on submit", async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    
    render(
      <TwinChat 
        twin={mockTwin} 
        onSendMessage={onSendMessage}
      />
    );

    const input = screen.getByRole("textbox");
    const sendButton = screen.getByRole("button", { name: /send/i });

    // Type message
    await user.type(input, "Hello Twin");
    
    // Click send
    await user.click(sendButton);

    // Verify handler called
    expect(onSendMessage).toHaveBeenCalledWith("Hello Twin");
    
    // Verify input cleared
    expect(input).toHaveValue("");
  });

  it("disables send button when input is empty", async () => {
    const user = userEvent.setup();
    render(<TwinChat twin={mockTwin} />);

    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).toBeDisabled();

    // Type something
    await user.type(screen.getByRole("textbox"), "Hello");
    expect(sendButton).not.toBeDisabled();

    // Clear input
    await user.clear(screen.getByRole("textbox"));
    expect(sendButton).toBeDisabled();
  });
});
```

### Pattern 3: Async Operations

```tsx
describe("TwinChat", () => {
  it("loads messages on mount", async () => {
    const fetchMessages = vi.fn().mockResolvedValue(mockMessages);

    render(<TwinChat twin={mockTwin} fetchMessages={fetchMessages} />);

    // Initially loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText(mockMessages[0].content)).toBeInTheDocument();
    });

    expect(fetchMessages).toHaveBeenCalled();
  });

  it("handles fetch error gracefully", async () => {
    const fetchMessages = vi.fn().mockRejectedValue(
      new Error("Network error")
    );

    render(<TwinChat twin={mockTwin} fetchMessages={fetchMessages} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
```

### Pattern 4: Mocking API Calls

```tsx
import { vi } from "vitest";
import * as api from "@/api/twins";

describe("TwinChat", () => {
  beforeEach(() => {
    vi.spyOn(api, "fetchTwinMessages").mockResolvedValue(mockMessages);
  });

  it("fetches twin messages using API", async () => {
    render(<TwinChat twin={mockTwin} />);

    await waitFor(() => {
      expect(api.fetchTwinMessages).toHaveBeenCalledWith(mockTwin.id);
    });
  });
});
```

### Pattern 5: Mocking React Query

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

describe("TwinChat with React Query", () => {
  it("displays cached messages", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Pre-populate cache
    queryClient.setQueryData(
      ["twin-messages", mockTwin.id],
      mockMessages
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TwinChat twin={mockTwin} />
      </QueryClientProvider>
    );

    mockMessages.forEach((msg) => {
      expect(screen.getByText(msg.content)).toBeInTheDocument();
    });
  });
});
```

### Pattern 6: Mocking Zustand Store

```tsx
import { useAppStore } from "@/store/appStore";

describe("TwinChat with Zustand", () => {
  it("uses user from store", () => {
    // Mock the store
    const mockUser = { id: "user-123", name: "Alex" };
    
    // Use actual store but override for test
    const { result } = renderHook(() => useAppStore());
    result.current.setUser(mockUser);

    render(<TwinChat twin={mockTwin} />);

    // Component uses mocked user from store
    expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
  });
});
```

### Pattern 7: Testing Hooks

```tsx
import { renderHook, act } from "@testing-library/react";
import { useChat } from "./useChat";

describe("useChat", () => {
  it("initializes with empty messages", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("adds message to history", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.addMessage({
        id: "1",
        sender: "user",
        content: "Hello",
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("Hello");
  });

  it("clears messages", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.addMessage({ id: "1", sender: "user", content: "Hi" });
      result.current.clear();
    });

    expect(result.current.messages).toHaveLength(0);
  });
});
```

### Pattern 8: Testing Services/Utilities

```tsx
import { emotionEngine } from "@/services/sice/emotionEngine";

describe("emotionEngine", () => {
  it("analyzes journal entries for emotional patterns", async () => {
    const mockEntries = [
      { date: "2026-08-15", mood: "anxious", text: "Worried about project" },
      { date: "2026-08-14", mood: "anxious", text: "Deadline stress" },
    ];

    const result = await emotionEngine.analyze(mockEntries, []);

    expect(result.currentMood).toBe("anxious");
    expect(result.patterns).toContain("deadline-related-anxiety");
    expect(result.recommendations).toBeDefined();
  });

  it("handles empty input gracefully", async () => {
    const result = await emotionEngine.analyze([], []);

    expect(result.currentMood).toBe("neutral");
    expect(result.patterns).toHaveLength(0);
  });
});
```

---

## 📋 Test Checklist

**Before committing, verify:**

- [ ] All tests pass (`npm run test`)
- [ ] Coverage targets met (≥75% overall)
- [ ] No skipped tests (`it.skip`, `describe.skip`)
- [ ] No focused tests (`it.only`, `describe.only`)
- [ ] Mocks are cleared after each test
- [ ] Async operations properly awaited
- [ ] Error cases tested
- [ ] Edge cases covered
- [ ] Tests are readable and maintainable
- [ ] Test names describe what they test
- [ ] No hardcoded wait times (use `waitFor`)

---

## 🚨 Testing Anti-Patterns

### ❌ Don't do this:

```tsx
// ❌ Snapshot testing without reason
it("matches snapshot", () => {
  const { container } = render(<TwinChat />);
  expect(container).toMatchSnapshot();
});

// ❌ Testing implementation details
it("calls useCallback with correct dependencies", () => {
  // Don't test hook internals, test behavior
});

// ❌ Hardcoded waits
it("loads data", async () => {
  render(<TwinChat />);
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(screen.getByText("Data")).toBeInTheDocument();
});

// ❌ Global test setup without cleanup
beforeAll(() => {
  vi.mock("@/api/twins"); // Mock exists for all tests, hard to debug
});

// ❌ Testing multiple things in one test
it("sends message, displays it, and updates store", async () => {
  // Break this into 3 tests
});

// ❌ No mock cleanup
it("test 1", () => {
  vi.mock("someModule");
  // Mock persists to other tests!
});
```

### ✅ Do this instead:

```tsx
// ✅ Behavior-focused testing
it("submits message and displays in chat", async () => {
  const user = userEvent.setup();
  render(<TwinChat />);
  
  await user.type(screen.getByRole("textbox"), "Hello");
  await user.click(screen.getByRole("button"));
  
  expect(screen.getByText("Hello")).toBeInTheDocument();
});

// ✅ Proper async handling
it("loads data from API", async () => {
  render(<TwinChat />);
  
  await waitFor(() => {
    expect(screen.getByText("Data")).toBeInTheDocument();
  });
});

// ✅ Proper mock cleanup
afterEach(() => {
  vi.clearAllMocks();
});

// ✅ One behavior per test
it("sends message", async () => { /* test send */ });
it("displays sent message in chat", async () => { /* test display */ });
it("updates store after send", async () => { /* test store */ });
```

---

## 🔍 Running Tests

### Common Commands

```bash
# Run all tests
npm run test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run specific test file
npm run test TwinChat.test.tsx

# Run tests matching pattern
npm run test -- --grep "should send message"

# Run with coverage report
npm run test:coverage

# Run in CI mode (no watch)
npm run test:ci

# Debug tests
npm run test:debug
# Open chrome://inspect to debug
```

### Coverage Report

After running `npm run test:coverage`:

```
File                    | Lines   | Statements | Functions | Branches
------------------------|---------|------------|-----------|----------
All files               | 82.3%   | 84.1%      | 78.9%     | 81.2%
 components/chat        | 85.0%   | 87.3%      | 82.0%     | 84.1%
  TwinChat.tsx          | 92.0%   | 94.5%      | 90.0%     | 91.2%
 services/sice          | 91.0%   | 92.8%      | 89.5%     | 90.1%
  emotionEngine.ts      | 95.0%   | 96.2%      | 94.0%     | 95.0%
```

---

## 🎯 What to Test First

**Priority testing order for Selfprint:**

1. **Nova Chat Component**
   - [ ] Renders questions
   - [ ] Collects user input
   - [ ] Displays insights
   - [ ] Error handling

2. **Twin Chat Component**
   - [ ] Sends messages
   - [ ] Displays responses
   - [ ] Shows loading state
   - [ ] Error recovery

3. **SICE Engines**
   - [ ] Emotion engine analysis
   - [ ] Memory recall
   - [ ] Insight generation
   - [ ] Learning from interactions

4. **Authentication**
   - [ ] User sign up
   - [ ] User login
   - [ ] Token refresh
   - [ ] Logout

5. **API Integrations**
   - [ ] Fetch Twin data
   - [ ] Send messages
   - [ ] Generate insights
   - [ ] Update user profile

6. **State Management (Zustand)**
   - [ ] User state updates
   - [ ] Twin state updates
   - [ ] Message history
   - [ ] Settings persistence

---

## 🧪 E2E Testing (Future)

When E2E testing is implemented:

```bash
npm run test:e2e
```

**Critical user journeys to test:**
1. Sign up → Onboarding → First insight
2. Core Awakening → Twin naming → First chat
3. Twin interaction → Insight generation → Decision tracking
4. World exploration → Activity completion → Gamification reward

---

## 📚 Testing Resources

- **Vitest:** https://vitest.dev
- **React Testing Library:** https://testing-library.com
- **Testing Best Practices:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Mocking Guide:** https://vitest.dev/guide/mocking.html

---

## 🚨 Common Test Issues & Solutions

### Issue: Tests fail randomly (flaky)

**Cause:** Race conditions, timing issues  
**Solution:**
```tsx
// ❌ Bad
setTimeout(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
}, 500);

// ✅ Good
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});
```

### Issue: Mock not working

**Cause:** Module not mocked before import  
**Solution:**
```tsx
// ✅ Correct order
import { vi } from "vitest";
vi.mock("@/api/twins"); // Mock FIRST
import { fetchTwins } from "@/api/twins"; // Import AFTER

describe("Test", () => {
  it("works", () => {
    expect(fetchTwins).toBeCalledTimes(1);
  });
});
```

### Issue: State not updating in test

**Cause:** State updates not wrapped in act()  
**Solution:**
```tsx
// ✅ Use act() for state changes
import { act } from "@testing-library/react";

act(() => {
  result.current.addMessage(newMessage);
});

expect(result.current.messages).toHaveLength(1);
```

---

## ✅ Before Merging PR

**All these must pass:**

```bash
npm run test          # All tests pass
npm run test:coverage # ≥75% coverage
npm run lint          # No linting errors
npm run type-check    # No TypeScript errors
npm run build         # Build succeeds
```

---

**Last Updated:** 16 August 2026  
**Enforced Version:** CODEX v2.0  
**Coverage Target:** ≥75% project coverage  
**Questions?** See CODE_DISCIPLINE.md or GIT_WORKFLOW.md
