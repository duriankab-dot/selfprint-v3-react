# 🏗️ P2 PHASE 1 — Environment Resolver Implementation
**Section:** § 46.1-46.2  
**Subsystems:** Advanced Adaptive Environments + Time-of-Day Themed Environments  
**Status:** Implementation Phase  
**Estimated Duration:** 8 hours

---

## 📋 Phase 1 Overview

This phase builds the **core environment system** that adapts experience based on:
- **Time of Day** (morning/afternoon/evening/night)
- **User Activity** (journaling, reflecting, analyzing, exploring)
- **Emotional State** (calm, reflective, excited, focused)
- **Journey Context** (current Hub + phase)
- **User Preferences** (dark mode, audio enabled, motion allowed)

Result: Dynamic environment that feels **alive** and **personally resonant**.

---

## 🎯 Core Concepts

### Time-of-Day Environments

Each time period has a distinct personality:

**Morning (5am-12pm)**
- Mood: Clarity, potential, awakening
- Colors: Soft blues, golds, pastels
- Motion: Gentle, flowing, building
- Audio: Light ambient, inspiring notes
- Twin State: Awakening → Aware
- Particles: Sparse, organized
- Use case: Setting intentions, fresh starts

**Afternoon (12pm-5pm)**
- Mood: Momentum, action, decision-making
- Colors: Warm oranges, vibrant purples
- Motion: Active, purposeful
- Audio: Focused, minimal pulse
- Twin State: Aware → Connected
- Particles: Moderate, purposeful
- Use case: Work, exploration, progress

**Evening (5pm-9pm)**
- Mood: Reflection, winding down, gratitude
- Colors: Deep purples, indigos, warm bronzes
- Motion: Slower, reflective
- Audio: Contemplative ambient
- Twin State: Connected → Reflective
- Particles: Dense, swirling
- Use case: Review, planning, reflection

**Night (9pm-5am)**
- Mood: Introspection, dreams, deep thinking
- Colors: Dark cosmic, midnight blue, silver
- Motion: Slow, dreamlike, hypnotic
- Audio: Sparse, ethereal, dreamy
- Twin State: Reflective → Insightful
- Particles: Minimal, scattered stars
- Use case: Deep journaling, future thinking

---

## 📂 Files to Create (Phase 1)

### 1. Type Definitions: `src/lib/contexts/EnvironmentContext.ts`

```typescript
// Complete type definitions for environment system
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type Activity = 'journaling' | 'reflecting' | 'analyzing' | 'exploring' | 'deciding' | 'idle';
export type TwinMode = 'awakening' | 'aware' | 'connected' | 'reflective' | 'insightful' | 'aligned' | 'mentor' | 'explorer';

export interface EnvironmentContext {
  time: TimeContext;
  activity: ActivityContext;
  emotional: EmotionalSignals;
  journey: JourneyContext;
  user: UserPreferences;
}

export interface AdaptiveEnvironmentState {
  id: string;
  environmentType: TimeOfDay | 'custom';
  visual: VisualConfig;
  audio: AudioConfig;
  motion: MotionConfig;
  twin: TwinConfig;
  interaction: InteractionConfig;
  timestamps: TimestampConfig;
}

// ... (rest of types from comprehensive design)
```

### 2. Environment Engine: `src/lib/intelligence/EnvironmentEngine.ts`

**Responsibility:** Core logic for generating environment state

```typescript
import { EnvironmentContext, AdaptiveEnvironmentState } from '../contexts/EnvironmentContext';

export class EnvironmentEngine {
  // Compute environment based on current context
  computeEnvironment(context: EnvironmentContext): AdaptiveEnvironmentState {
    // 1. Determine time-of-day base
    const timeOfDay = this.getTimeOfDay(context.time);
    
    // 2. Apply activity layer
    const withActivity = this.applyActivityLayer(timeOfDay, context.activity);
    
    // 3. Apply emotional layer
    const withEmotion = this.applyEmotionalLayer(withActivity, context.emotional);
    
    // 4. Apply journey context
    const withJourney = this.applyJourneyLayer(withEmotion, context.journey);
    
    // 5. Apply user preferences
    const final = this.applyUserPreferences(withJourney, context.user);
    
    return final;
  }
  
  // ... helper methods
}
```

### 3. Time Resolver: `src/lib/intelligence/TimeOfDayResolver.ts`

**Responsibility:** Map time → time-of-day + suggested themes

```typescript
export class TimeOfDayResolver {
  // Detect current time of day
  getCurrentTimeOfDay(timezone?: string): TimeOfDay {
    // Account for timezone
    // Return: 'morning' | 'afternoon' | 'evening' | 'night'
  }
  
  // Get theme suggestions for time of day
  getThemesForTimeOfDay(timeOfDay: TimeOfDay): ThemeSuggestion[] {
    // Query theme library (66-72 themes)
    // Filter by time-of-day compatibility
    // Rank by user preference history
  }
  
  // Check if should transition to next time period
  shouldTransitionToNext(currentHour: number): boolean {
    // Logic for smooth transitions at boundaries
  }
}
```

### 4. React Hook: `src/hooks/useAdaptiveEnvironment.ts`

**Responsibility:** Component-level state management + reactivity

```typescript
export function useAdaptiveEnvironment() {
  const [environment, setEnvironment] = useState<AdaptiveEnvironmentState | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Build context from various sources
  const context = useEnvironmentContext();
  
  // Compute environment whenever context changes
  useEffect(() => {
    const engine = new EnvironmentEngine();
    const newEnv = engine.computeEnvironment(context);
    
    // Check if significantly different from current
    if (hasSignificantChange(environment, newEnv)) {
      setIsTransitioning(true);
      // Trigger smooth transition animation
      setTimeout(() => setEnvironment(newEnv), 300);
    } else {
      setEnvironment(newEnv);
    }
  }, [context]);
  
  return { environment, isTransitioning };
}
```

### 5. Display Component: `src/components/features/EnvironmentDisplay.tsx`

**Responsibility:** Render environment to screen

```typescript
export function EnvironmentDisplay({ environment, isTransitioning }: Props) {
  return (
    <div 
      className={`environment ${isTransitioning ? 'transitioning' : ''}`}
      style={{
        '--env-bg-primary': environment.visual.colors.primary,
        '--env-bg-secondary': environment.visual.colors.secondary,
        '--env-particle-density': environment.visual.particleDensity,
        '--env-twin-glow': environment.visual.twinGlow.intensity,
      } as React.CSSProperties}
    >
      {/* Background with gradient + particles */}
      <EnvironmentBackground {...environment.visual} />
      
      {/* Twin with current state + glow */}
      <TwinDisplay state={environment.twin.state} />
      
      {/* Optional: Floating elements based on time/activity */}
      {environment.visual.backgroundPattern === 'cosmic' && <CosmicElements />}
      
      {/* Children rendered on top */}
    </div>
  );
}
```

### 6. Styles: `src/components/styles/environment.css`

**Responsibility:** CSS variables + animations

```css
:root {
  /* Theme base */
  --env-bg-primary: #1a1a2e;
  --env-bg-secondary: #16213e;
  --env-accent: #0f3460;
  
  /* Motion */
  --env-particle-speed: 1;
  --env-motion-enabled: 1;
  --env-transition-duration: 600ms;
  
  /* Audio */
  --env-audio-volume: 0.7;
  
  /* Accessibility */
  --env-reduce-motion: 0;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --env-reduce-motion: 1;
    --env-transition-duration: 0ms;
    --env-particle-speed: 0;
  }
}

.environment {
  position: relative;
  width: 100%;
  height: 100vh;
  
  background: linear-gradient(
    135deg,
    var(--env-bg-primary),
    var(--env-bg-secondary)
  );
  
  transition: background-color calc(var(--env-transition-duration) * 1) ease-in-out;
}

.environment.transitioning {
  opacity: 0.95;
}

/* Morning (5am-12pm) */
.environment.time-morning {
  --env-bg-primary: #fef3c7;
  --env-bg-secondary: #dbeafe;
  --env-accent: #fbbf24;
  --env-particle-density: 0.3;
}

/* Afternoon (12pm-5pm) */
.environment.time-afternoon {
  --env-bg-primary: #fed7aa;
  --env-bg-secondary: #c7d2fe;
  --env-accent: #f97316;
  --env-particle-density: 0.5;
}

/* Evening (5pm-9pm) */
.environment.time-evening {
  --env-bg-primary: #5b21b6;
  --env-bg-secondary: #1e3a8a;
  --env-accent: #d946ef;
  --env-particle-density: 0.7;
}

/* Night (9pm-5am) */
.environment.time-night {
  --env-bg-primary: #0c0c1d;
  --env-bg-secondary: #1a0033;
  --env-accent: #7c3aed;
  --env-particle-density: 0.2;
}

/* Activity layers */
.environment.activity-journaling {
  filter: brightness(0.95) saturate(1.1);
}

.environment.activity-reflecting {
  filter: brightness(0.85) saturate(0.9);
}

.environment.activity-exploring {
  filter: brightness(1.05) saturate(1.2);
}
```

---

## 🔄 Integration Checklist

### Dashboard Integration
- [ ] Add Environment Display as background of Dashboard
- [ ] Show current time-of-day indicator in top-right
- [ ] Add "Change Environment" quick action (optional override)
- [ ] Display next transition time

### Chat Page Integration
- [ ] Wrap ChatPage with EnvironmentDisplay
- [ ] Maintain environment during active conversation
- [ ] Don't distract with transitions during typing

### Twin Integration
- [ ] Update Twin appearance based on environment state
- [ ] Adjust Twin voice tone per environment (§22)
- [ ] Update Twin animation speed based on motion config

### Settings Integration
- [ ] Add "Environment Preferences" section
- [ ] Toggle: Auto time-based
- [ ] Toggle: Soundscape enabled
- [ ] Toggle: Reduce motion
- [ ] Manual time override (if auto disabled)

---

## 🧪 Testing Checklist

### Unit Tests (`src/lib/intelligence/__tests__/EnvironmentEngine.test.ts`)

```typescript
describe('EnvironmentEngine', () => {
  it('should compute morning environment for 8am', () => {
    const context = { time: { hour: 8, minute: 0, ... }, ... };
    const env = engine.computeEnvironment(context);
    expect(env.environmentType).toBe('morning');
    expect(env.visual.particleDensity).toBeLessThan(0.4);
  });
  
  it('should apply emotional layer correctly', () => {
    const context = { ... emotional: { calm: 0.9, excited: 0.1 }, ... };
    const env = engine.computeEnvironment(context);
    // Should have calming colors, slow motion
  });
  
  it('should respect user preferences', () => {
    const context = { ... user: { darkModeEnabled: true }, ... };
    const env = engine.computeEnvironment(context);
    // Should not increase brightness even if afternoon
  });
  
  it('should handle timezone correctly', () => {
    const context = { time: { timezone: 'Asia/Bangkok', ... }, ... };
    const env = engine.computeEnvironment(context);
    // Should use Bangkok time, not UTC
  });
});
```

### Integration Tests

- [ ] User logs in → appropriate environment for time appears
- [ ] User changes timezone → environment updates
- [ ] Time passes → automatic transition to next time period
- [ ] User prefers dark mode → respected across all times
- [ ] Accessibility: Reduced motion → no animations
- [ ] Mobile: Environment responsive on small screens

### Manual Testing

- [ ] Open at 8am (morning) → see morning environment
- [ ] Open at 2pm (afternoon) → see afternoon environment
- [ ] Open at 7pm (evening) → see evening environment
- [ ] Open at 11pm (night) → see night environment
- [ ] Change timezone in settings → environment updates
- [ ] Disable environment → use default theme instead
- [ ] Reduced motion enabled → no particle animations
- [ ] Screenshot each environment for documentation

---

## 💾 Database Setup (Phase 1)

### Create environments migration:
```sql
-- supabase/migrations/20260810_create_environments.sql

CREATE TABLE environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadata
  name text,
  environment_type text NOT NULL, -- 'morning', 'afternoon', 'evening', 'night', 'custom'
  is_auto_based boolean DEFAULT true,
  
  -- Visual config
  visual jsonb NOT NULL,
  -- {
  --   "theme": "...",
  --   "colors": { "primary": "#...", "secondary": "#...", "accent": "#..." },
  --   "particleDensity": 0.5,
  --   "twinGlow": { "intensity": 0.8, "color": "#..." },
  --   "brightness": 1.0,
  --   "saturation": 1.0
  -- }
  
  -- Audio config (populated in Phase 2)
  audio jsonb DEFAULT '{}'::jsonb,
  
  -- Motion config
  motion jsonb NOT NULL,
  -- {
  --   "particleSpeed": 1,
  --   "twinAnimation": "gentle",
  --   "transitionDuration": 600,
  --   "reduceMotion": false
  -- }
  
  -- Twin state
  twin_state text DEFAULT 'aware',
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  last_applied_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  
  -- Indexes
  CONSTRAINT user_envs_unique UNIQUE(user_id, environment_type)
);

CREATE INDEX idx_environments_user_id ON environments(user_id);
CREATE INDEX idx_environments_last_applied ON environments(user_id, last_applied_at DESC);

-- RLS Policy: Users can see/edit their own environments
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;

CREATE POLICY environments_select ON environments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY environments_update ON environments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY environments_delete ON environments
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 🎯 Success Criteria (Phase 1)

✅ Must achieve ALL:

1. **Functionality**
   - [ ] EnvironmentEngine.computeEnvironment() works correctly
   - [ ] TimeOfDayResolver maps time→environment accurately
   - [ ] useAdaptiveEnvironment hook reactive to context changes
   - [ ] EnvironmentDisplay renders without console errors

2. **Integration**
   - [ ] Dashboard shows adaptive environment as background
   - [ ] ChatPage environment persists during conversation
   - [ ] Twin appearance changes with environment
   - [ ] Settings panel allows environment customization

3. **Quality**
   - [ ] TypeScript strict mode: `npx tsc -b --noEmit` = Exit 0
   - [ ] All unit tests passing
   - [ ] No accessibility violations (prefers-reduced-motion respected)
   - [ ] Mobile responsive (works on 375px+ width)

4. **Performance**
   - [ ] No lag when transitioning between environments
   - [ ] Smooth 60fps animations (when motion enabled)
   - [ ] CSS transitions smooth, not janky

5. **Documentation**
   - [ ] Code comments explain complex logic
   - [ ] README updated with environment system overview
   - [ ] Storybook stories for EnvironmentDisplay variants

---

## 📝 Next Phase (Phase 2)

After Phase 1 complete, Phase 2 adds:
- **Soundscape Engine** (audio layers)
- **Audio ducking** (Twin voice interrupts music)
- **Soundscape UI controls** (enable/disable, volume)

Phase 2 depends on Phase 1 being complete + tested.

---

## 🚀 Deployment Notes

- **Vercel:** Auto-deploy on push to `master`
- **Supabase:** Run migration: `supabase db push`
- **Testing:** `npm run test:integration` before commit
- **Build:** `npm run build` must exit 0

---

**Phase 1 Status:** Ready for implementation  
**Estimated Completion:** ~8 hours  
**Next Review:** After all Phase 1 tests passing
