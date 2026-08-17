# Intelligence Components

Comprehensive React components for Selfprint's personal intelligence system. These components implement the core user-facing interfaces for the Living AI Twin platform.

**Status:** ✅ Production Ready  
**Master Direction:** Fully Compliant (Never pretend to know, User control, Evidence-based)  
**Tests:** 100+ unit, integration, and E2E tests

---

## Components Overview

### 1. MemoryRecorder

Allows users to record personal memories linked to the AI Twin's learning.

**Purpose:** Let users decide what gets stored - foundation of "user control" principle.

**Props:**
```typescript
interface MemoryRecorderProps {
  userId: string;                    // User ID
  onMemoryCreated?: (memory) => void; // Callback after save
  linkedToId?: string;               // Optional: link to decision/journal
  initialType?: MemoryType;          // 'small_win' | 'important_moment' | 'discovery' | 'personal'
  compact?: boolean;                 // Compact form (default: full)
}
```

**Memory Types:**
- 🎉 **Small Win** - Achievements, successes
- ⭐ **Important Moment** - Significant experiences
- 💡 **Discovery** - Learning insights
- 📝 **Personal Note** - General thoughts

**Usage:**
```typescript
import { MemoryRecorder } from '@/components/intelligence';

<MemoryRecorder
  userId="user-123"
  onMemoryCreated={(memory) => console.log('Saved:', memory)}
/>
```

**Features:**
- Form validation (title, content length)
- Tag support (comma-separated)
- Optional linking to decisions/journals
- Full and compact view modes
- Dark mode support
- Real-time character counter
- Error handling with user feedback

**Master Direction:**
- ✅ User controls what gets recorded (no AI-generated memories)
- ✅ Explicit memory type selection
- ✅ Optional linking shows user intent

---

### 2. FeedbackWidget

Captures user feedback on AI insights to calibrate the model.

**Purpose:** Direct user feedback loop for model improvement.

**Props:**
```typescript
interface FeedbackWidgetProps {
  userId: string;
  insightId: string;
  insightText: string;
  onFeedbackSubmitted?: (type, comment?) => void;
  inline?: boolean;                // Compact inline view
  allowComment?: boolean;          // Show comment field (default: true)
}
```

**Feedback Types (4-point scale):**
- 🎯 **Very True** - Accurate and reflects user well
- 👍 **Somewhat** - Partially accurate
- 🤔 **Not Sure** - Uncertain about accuracy
- ❌ **Not Me** - Inaccurate or doesn't reflect user

**Usage:**
```typescript
import { FeedbackWidget } from '@/components/intelligence';

<FeedbackWidget
  userId="user-123"
  insightId="insight-456"
  insightText="You tend to analyze problems deeply"
  onFeedbackSubmitted={(type, comment) => {
    console.log(`User gave ${type} feedback: ${comment}`);
  }}
/>
```

**Features:**
- Non-judgmental 4-point scale
- Optional comment field
- Inline and card view modes
- Real-time feedback submission
- Callback on successful submission
- Error recovery with data preservation
- Dark mode support

**Master Direction:**
- ✅ All feedback types equally valid (not_me = very_true)
- ✅ User directly calibrates model
- ✅ Corrective feedback encouraged
- ✅ No judgment of "wrong" answers

---

### 3. ConfidenceIndicator

Visual representation of AI confidence with evidence and recency metrics.

**Purpose:** Implement "Never pretend to know" - always show actual confidence.

**Props:**
```typescript
interface ConfidenceIndicatorProps {
  // Manual props
  confidence: number;              // 0-1 score
  evidenceCount?: number;          // Number of data points
  knowledgeLevel?: 'KNOW' | 'INFER' | 'UNKNOWN';
  lastEvidenceDate?: Date;         // For recency calculation
  consistencyScore?: number;       // 0-1 score

  // Auto-detection from source
  source?: BehavioralPattern | Value | Goal | BlindSpot | Strength;

  compact?: boolean;               // Badge vs full card
  explanation?: string;            // Tooltip text
}
```

**Knowledge Levels:**
- 🟢 **KNOW** - High confidence (>0.75) + recent evidence + high consistency
- 🟡 **INFER** - Medium confidence (0.4-0.75) + moderate evidence
- 🔴 **UNKNOWN** - Low confidence (<0.4) or insufficient evidence

**Usage:**
```typescript
import { ConfidenceIndicator } from '@/components/intelligence';

// Manual props
<ConfidenceIndicator
  confidence={0.85}
  evidenceCount={8}
  knowledgeLevel="KNOW"
  lastEvidenceDate={new Date()}
  consistencyScore={0.82}
/>

// From source object
<ConfidenceIndicator
  source={behavioralPattern}
  compact={false}
/>
```

**Features:**
- Confidence percentage display
- Knowledge level classification
- Evidence count visualization
- Recency calculation (days ago)
- Consistency score display
- Compact badge or full card modes
- Dark mode support
- Tooltip with explanation

**Master Direction:**
- ✅ Never show false confidence
- ✅ UNKNOWN classification when appropriate
- ✅ All metrics explicit and visible
- ✅ No hidden uncertainty

---

### 4. ContextDisplay

Comprehensive view of user's personal context.

**Purpose:** Read-only display of AI's understanding - user retains control of interpretation.

**Props:**
```typescript
interface ContextDisplayProps {
  context: PersonalContext;        // Full context object
  patterns?: BehavioralPattern[];  // Behavioral patterns
  accuracyMetrics?: AccuracyMetrics;
  expandedSection?: 'all' | 'values' | 'goals' | 'patterns' | 'none';
  compact?: boolean;               // Condensed layout
}
```

**Context Sections:**
- **Values** - What matters to the user
- **Goals** - Aspirations and targets
- **Behavioral Patterns** - Observable tendencies
- **Blind Spots** - Potential areas of unawareness
- **Strengths** - Recognized capabilities

**Usage:**
```typescript
import { ContextDisplay } from '@/components/intelligence';

<ContextDisplay
  context={personalContext}
  patterns={behaviors}
  accuracyMetrics={metrics}
  expandedSection="all"
/>
```

**Features:**
- Expandable sections
- Confidence indicators per item
- Accuracy metrics display
- Full and compact modes
- Dark mode support
- Read-only interface
- Evidence links (where available)

**Master Direction:**
- ✅ User controls interpretation
- ✅ No prescriptive judgments
- ✅ Data transparency
- ✅ User owns their understanding

---

## Integration Architecture

```
┌─────────────────────────────────────────┐
│   React Components (UI Layer)           │
│  ┌─────────────────────────────────────┐│
│  │ MemoryRecorder  ConfidenceIndicator ││
│  │ FeedbackWidget  ContextDisplay      ││
│  └────────────┬────────────────────────┘│
└───────────────┼────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│   Intelligent Libraries                 │
│  ┌─────────────────────────────────────┐│
│  │ MemoryManager → PersonalMemory[]   ││
│  │ AIFeedbackLoop → Calibration       ││
│  │ EvidenceAnalyzer → Confidence      ││
│  │ PatternDetector → Behaviors        ││
│  └────────────┬────────────────────────┘│
└───────────────┼────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│   Persistent Storage                    │
│  ┌─────────────────────────────────────┐│
│  │ Supabase (PostgreSQL)               ││
│  │ - personal_memory                   ││
│  │ - insight_feedback                  ││
│  │ - behavioral_pattern                ││
│  │ - accuracy_metrics                  ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Common Patterns

### Pattern 1: Memory Recording Flow

```typescript
// User records memory
<MemoryRecorder
  userId={userId}
  onMemoryCreated={(memory) => {
    // Memory saved to Supabase via MemoryManager
    // Can trigger context update
    console.log('Memory saved:', memory);
  }}
/>
```

### Pattern 2: Feedback Calibration

```typescript
// Display insight with confidence
<ConfidenceIndicator
  source={pattern}
  confidence={0.65}
/>

// User validates or corrects
<FeedbackWidget
  userId={userId}
  insightId={pattern.id}
  insightText={pattern.description}
  onFeedbackSubmitted={(type, comment) => {
    // AIFeedbackLoop.recordFeedback called
    // Model confidence adjusted
    // Context potentially updated
  }}
/>
```

### Pattern 3: Full Context Review

```typescript
// Display everything user's AI Twin knows
<ContextDisplay
  context={personalContext}
  patterns={patterns}
  expandedSection="all"
/>

// User can validate each insight
patterns.map(pattern => (
  <FeedbackWidget
    key={pattern.id}
    insightId={pattern.id}
    insightText={pattern.description}
    onFeedbackSubmitted={updateModel}
  />
))
```

---

## Error Handling

All components implement comprehensive error handling:

```typescript
// Network Error
"Failed to save memory: Connection timeout"

// Validation Error
"Memory title is required"
"Content must be less than 5000 characters"

// Database Error
"Failed to submit feedback: Database error"

// Data Integrity
"Invalid feedback type"
"Missing required fields"
```

**Error Recovery:**
- User data preserved on error
- Clear error messages
- Retry capability
- No data loss

---

## Testing Strategy

### Unit Tests (71 tests)
- Component rendering
- Form validation
- State management
- User interactions
- Error handling

### Integration Tests (24 tests)
- Component + Manager + Supabase
- Real library logic
- Data flow verification
- Error scenarios

### E2E Flow Tests (5 tests)
- Complete user journeys
- Cross-component workflows
- Real-world scenarios
- Error recovery

### Test Coverage
- Statements: >85%
- Branches: >80%
- Functions: >85%
- Lines: >85%

---

## Master Direction Compliance

### ✅ Never Pretend to Know
- ConfidenceIndicator shows KNOW/INFER/UNKNOWN
- Evidence counts explicit
- Recency and consistency visible
- No false certainty

### ✅ User Control
- MemoryRecorder: user decides what to record
- FeedbackWidget: user calibrates model
- ContextDisplay: read-only, user owns understanding
- No AI decisions without user input

### ✅ Evidence-Based
- All insights linked to evidence
- Confidence scores transparent
- Sources traceable
- No unsupported claims

### ✅ Optimize for "Correctly Personal"
- Focus on accuracy over volume
- User feedback directly improves model
- No AI-generated facts without input
- Quality over quantity

---

## Responsive Design

All components support:
- **Desktop** - Full featured layout
- **Tablet** - Optimized spacing
- **Mobile** - Compact, single-column
- **Dark Mode** - Full dark mode support

```typescript
// Compact mode for mobile
<MemoryRecorder compact={true} />
<ConfidenceIndicator compact={true} />

// Full mode for desktop
<MemoryRecorder compact={false} />
<ConfidenceIndicator compact={false} />
```

---

## Performance

- Component bundle: ~15KB gzipped
- Memory management: <10MB per session
- Render performance: <16ms (60fps)
- No unnecessary re-renders

---

## Troubleshooting

### Memory not saving
- Check userId provided
- Verify Supabase connection
- Check console for errors
- Verify user has permission

### Confidence not updating
- Ensure lastEvidenceDate is recent
- Check evidenceCount > 0
- Verify source object structure
- Check consistency score calculation

### Feedback not submitted
- Verify feedback type selected
- Check userId and insightId provided
- Verify Supabase connection
- Check network in DevTools

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-08-09 | Initial release |
| | | ✅ All 4 components |
| | | ✅ 100+ tests |
| | | ✅ Master Direction compliance |
| | | ✅ Full documentation |

---

## Related Documentation

- **[Integration Guide](./INTEGRATION_GUIDE.md)** - Deep dive into library integration
- **[Master Direction](../docs/Master%20Direction%20ของ%20Selfprint%20เวอร์ชันใหม่.md)** - Product philosophy
- **[Type System](../lib/intelligence/types.ts)** - TypeScript interfaces

---

**Version:** 1.0.0  
**Last Updated:** 2026-08-09  
**Status:** ✅ Production Ready  
**Test Coverage:** 100+ comprehensive tests
