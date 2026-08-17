# 📄 Onboarding Flow MEMO V4 Implementation Specification

**Date:** 2026-08-07  
**Language:** ไทย  
**Phase:** Phase 3 Frontend  
**Component:** Onboarding (src/pages/Onboarding.tsx)  
**Duration:** 4 days (Aug 11-14)  
**Owner:** Frontend + AI/ML Team  

---

## 🎯 OBJECTIVE

Build onboarding flow ที่ให้ user experience "AI Twin Birth" แทนที่จะเป็น "Survey Form"

**3 Aha Moments:**
1. Twin born (40 sec)
2. Twin understands me (60-70%)
3. Twin will grow with me

---

## ❌ CURRENT STATE (What's Wrong)

```
Current:
  Form: Date Input
    ↓
  Form: Time Input
    ↓
  Form: Place Input
    ↓
  Submit Button
    ↓
  Loading... (spinner)
    ↓
  Results page
```

**Problems:**
- Feels like survey, not conversation
- No AI involvement visible
- Loading spinner feels dead
- Results show up suddenly
- No animation, no "birth" feeling
- Naming happens after (lost ownership moment)

---

## ✅ TARGET STATE (MEMO V4)

```
Onboarding:
  Step 1: Emotion Selector (from Landing)
    ↓
  Step 2: Birth Data via Nova Conversation
    Nova: "Tell me, when were you born?"
    User: Date + Time + Place (natural input)
    ↓
  Step 3: AI Creation Sequence (Animation)
    "Analyzing your birth... Creating AI Twin... Connecting personality..."
    ↓
  Step 4: Initial Blueprint (60-70%)
    Show: Decision Style, Strengths, Blind Spot
    Meter: 60% (amber)
    Nova: "I'm 60% clear about who you are. Help me know you better?"
    ↓
  Step 5: Fine-tuning (4 Questions)
    Nova: "I found some patterns, help with 4 questions?"
    User: 4 cards × 1 question × 4 options each
    Meter: 60% → 85% (animation)
    ↓
  Step 6: Full Analysis
    Show: Complete blueprint
    Meter: 85% → 95%
    Nova: "From today I learn from every decision"
    ↓
  Step 7: Home
    Complete, Twin ready to use
```

**Benefits:**
- Nova guides (not form submission)
- Animation (not spinner)
- Progressive reveals (not all at once)
- Ownership moment (birth feeling)
- Accuracy visible (meter)

---

## 📋 DETAILED FLOW

### STEP 1: Emotion Selector (Continuation from Landing)

**Reuse:** MoodSelector from Landing  
**Input:** user mood (from localStorage or landing)  
**Purpose:** Set Nova's personality from start

```typescript
// Onboarding.tsx
const OnboardingFlow = () => {
  const [mood, setMood] = useState(localStorage.getItem('mood') || 'ready');
  const [currentStep, setCurrentStep] = useState(1);
  
  return (
    <div className="onboarding">
      {currentStep === 1 && (
        <MoodSelector 
          defaultMood={mood}
          onMoodSelect={(newMood) => {
            setMood(newMood);
            setCurrentStep(2);
          }}
        />
      )}
      {/* Other steps... */}
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] Mood pre-filled from localStorage
- [ ] Can change mood
- [ ] Proceeding to Step 2

---

### STEP 2: Birth Data via Nova Conversation

**NOT a Form** → Conversational guide

**Nova Flow:**
```
Nova: "Let me ask you something important to know you deeply."
Nova: "When were you born? (Just the date, like January 15, 1990)"

[User types date]

Nova: "What time? (optional - if you know)"
[User types or skips]

Nova: "And where? (City is enough, optional)"
[User types or skips]

Nova: "Got it! [Date], [Time if given], [Place if given]. That's the foundation."
```

**Implementation:**
```typescript
// src/components/NovaConversation.tsx
const NovaConversation = ({ onComplete }) => {
  const [messages, setMessages] = useState([
    { role: 'nova', text: 'Let me ask you something important...' }
  ]);
  const [birthData, setBirthData] = useState({});
  const [stage, setStage] = useState('dob'); // dob → time → place → confirm
  
  const handleUserInput = async (input) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    
    // Validate & store
    if (stage === 'dob') {
      const isValid = validateDate(input);
      if (isValid) {
        setBirthData(prev => ({ ...prev, dob: input }));
        setStage('time');
        setMessages(prev => [...prev, { 
          role: 'nova', 
          text: "What time were you born? (optional)" 
        }]);
      }
    }
    // ... handle other stages
  };
  
  return (
    <div className="nova-conversation">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <input 
        type="text"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleUserInput(e.target.value);
            e.target.value = '';
          }
        }}
        placeholder="Your answer..."
      />
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] Nova guides through date → time → place
- [ ] Date validation
- [ ] Time + place optional
- [ ] Data stored in state
- [ ] Feels conversational
- [ ] Mobile: fullwidth input

---

### STEP 3: AI Creation Sequence (Animation)

**Purpose:** Replace loading spinner with "birth" animation

**Duration:** 2-3 seconds  
**Stages:**
1. "Analyzing your birth data..." (0-1 sec)
2. "Creating AI Twin..." (1-2 sec)
3. "Connecting personality..." (2-3 sec)

**Visual:**
```
[Particle animation + text]
"Analyzing..."
  ↓
[Pulse effect]
"Creating your AI Twin..."
  ↓
[Connect animation]
"Connecting..."
  ↓
Nova: "I've created your AI Twin. 
      Let me show you what I understand so far..."
  ↓
[Transition to Step 4]
```

**Implementation:**
```typescript
// src/components/AICreationSequence.tsx
const AICreationSequence = ({ onComplete }) => {
  const [stage, setStage] = useState(0); // 0=analyze, 1=create, 2=connect
  
  useEffect(() => {
    const timings = [1000, 2000, 3000]; // ms per stage
    
    const intervals = timings.map((timing, i) => 
      setTimeout(() => {
        if (i < timings.length - 1) {
          setStage(i + 1);
        } else {
          onComplete(); // Move to Step 4
        }
      }, timing)
    );
    
    return () => intervals.forEach(clearTimeout);
  }, [onComplete]);
  
  const stageTexts = [
    "Analyzing your birth data...",
    "Creating your AI Twin...",
    "Connecting personality..."
  ];
  
  return (
    <div className="creation-sequence">
      <div className={`animation stage-${stage}`}>
        <div className="particles"></div>
        <p>{stageTexts[stage]}</p>
      </div>
    </div>
  );
};
```

**CSS Animations:**
```css
.creation-sequence {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.animation {
  position: relative;
  width: 200px;
  height: 200px;
}

.stage-0 .particles {
  animation: analyze 1s ease-in-out;
}

.stage-1 .particles {
  animation: create 1s ease-in-out;
}

.stage-2 .particles {
  animation: connect 1s ease-in-out;
}

@keyframes analyze {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

@keyframes create {
  0% { opacity: 0; transform: rotate(0deg); }
  100% { opacity: 1; transform: rotate(360deg); }
}

@keyframes connect {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.2); }
}
```

**Acceptance Criteria:**
- [ ] 3-stage animation plays
- [ ] Smooth transitions
- [ ] No jank/flicker
- [ ] Text updates with stage
- [ ] Auto-advance after 3 sec
- [ ] Mobile: responsive size

---

### STEP 4: Initial Blueprint (60-70%)

**Display:**
```
┌─────────────────────────────────────────┐
│ Your AI Twin (60% Clear)                │
├─────────────────────────────────────────┤
│                                         │
│ 🎯 Decision Style: Strategic Planner    │
│                                         │
│ 💪 Strengths:                           │
│    • Forward-thinking                   │
│    • Detail-oriented                    │
│                                         │
│ ⚠️  Blind Spot:                         │
│    • Difficulty letting go              │
│                                         │
│ [60%████░░░░░░░░░░░░] (amber meter)    │
│                                         │
│ Nova: "I'm 60% clear. Help me know you │
│        better? 4 quick questions?"      │
│                                         │
│        [Yes] [Skip for Now]             │
└─────────────────────────────────────────┘
```

**Implementation:**
```typescript
// src/components/InitialBlueprint.tsx
const InitialBlueprint = ({ profile, mood, onContinue, onSkip }) => {
  return (
    <div className={`blueprint blueprint-${mood}`}>
      <h2>Your AI Twin ({profile.clarity}% Clear)</h2>
      
      <div className="section">
        <h3>🎯 Decision Style</h3>
        <p>{profile.decisionStyle}</p>
      </div>
      
      <div className="section">
        <h3>💪 Strengths</h3>
        <ul>
          {profile.strengths.slice(0, 2).map(s => <li key={s}>{s}</li>)}
        </ul>
      </div>
      
      <div className="section">
        <h3>⚠️ Blind Spot</h3>
        <p>{profile.blindSpot}</p>
      </div>
      
      <ProgressMeter value={profile.clarity} />
      
      <div className="nova-prompt">
        <p>Nova: "I'm {profile.clarity}% clear. Help me know you better? 4 quick questions?"</p>
      </div>
      
      <div className="actions">
        <button onClick={onContinue} className="primary">Yes, Help Me</button>
        <button onClick={onSkip} className="secondary">Skip for Now</button>
      </div>
    </div>
  );
};

// src/components/ProgressMeter.tsx
const ProgressMeter = ({ value }) => {
  const color = value < 70 ? '#FFA726' : value < 90 ? '#FFD54F' : '#66BB6A';
  
  return (
    <div className="meter">
      <div className="bar" style={{ width: `${value}%`, backgroundColor: color }} />
      <span>{value}%</span>
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] Blueprint displays correctly
- [ ] Meter shows correct color (60%=amber)
- [ ] Decision Style + 2 Strengths + 1 Blind Spot
- [ ] Nova message friendly
- [ ] Yes/Skip buttons functional
- [ ] Mobile: responsive card

---

### STEP 5: Fine-tuning (4 Questions, 60%→85%)

**Flow:**
```
Nova: "Great! These 4 questions will help me understand you better."

Question 1: "When making decisions, do you prefer to:"
  ○ Analyze data deeply first
  ○ Trust your gut instinct  
  ○ Ask others for input
  ○ Sleep on it (let ideas brew)

Question 2-4: (Similar pattern)

[After all 4 answered]
Meter: 60% → 85% (animation)
Nova: "Thanks! I'm 85% clear now. Let's see what else..."
```

**Implementation:**
```typescript
// src/components/FineTuningFlow.tsx
const FineTuningFlow = ({ profile, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  
  const questions = [
    {
      text: "When making decisions, you prefer to:",
      options: [
        "Analyze data deeply first",
        "Trust your gut instinct",
        "Ask others for input",
        "Sleep on it (let ideas brew)"
      ]
    },
    // 3 more questions...
  ];
  
  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);
    
    if (newAnswers.length < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Animate meter 60% → 85%
      onComplete(newAnswers);
    }
  };
  
  return (
    <div className="fine-tuning">
      <p className="nova-intro">Nova: "These 4 questions help me know you better."</p>
      
      <div className="question-container">
        <h3>{questions[currentQuestion].text}</h3>
        <div className="options">
          {questions[currentQuestion].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="option-btn"
            >
              ◯ {opt}
            </button>
          ))}
        </div>
      </div>
      
      <ProgressMeter value={60} />
      <p className="progress-text">Question {currentQuestion + 1} of {questions.length}</p>
    </div>
  );
};
```

**Meter Animation (60% → 85%):**
```css
.meter-animate {
  animation: fillMeter 1s ease-out;
}

@keyframes fillMeter {
  from { width: 60%; }
  to { width: 85%; }
}
```

**Acceptance Criteria:**
- [ ] All 4 questions display
- [ ] Options are radio-buttons (single choice)
- [ ] Meter animates 60% → 85%
- [ ] Nova contextual ("85% clear now")
- [ ] Mobile: fullwidth, touch-friendly
- [ ] Keyboard accessible (Tab + Enter)

---

### STEP 6: Full Analysis

**Display:**
```
Nova: "From today, I learn from every decision. 
      Here's your complete Twin:"

[Full Blueprint - all sections]
  • Decision Style
  • All Strengths (3-4)
  • Blind Spots (2-3)
  • Growth areas
  
Meter: 85% → 95%

[Button: "Go to Home"]
```

**Acceptance Criteria:**
- [ ] Full blueprint displays
- [ ] Meter animates 85% → 95%
- [ ] All data visible
- [ ] Button navigates to Home

---

### STEP 7: Home (Complete)

**After fine-tuning:**
- Redirect to /home
- Twin ready to chat
- User can start using AI Twin

---

## 🎨 DESIGN SYSTEM

### Colors by Mood

| Mood | Primary | Accent | Secondary |
|------|---------|--------|-----------|
| ready | #00C853 | #4CAF50 | #C8E6C9 |
| calm | #1E88E5 | #2196F3 | #BBDEFB |
| focused | #6F42C1 | #7E57C2 | #E1BEE7 |
| energetic | #FF6D00 | #FF9100 | #FFE0B2 |
| curious | #00BCD4 | #00ACC1 | #B2EBF2 |
| reflective | #5E35B1 | #673AB7 | #EDE7F6 |

### Typography

- **Heading:** 24px, Bold
- **Body:** 16px, Regular
- **Nova Prompt:** 14px, Italic, secondary color
- **Button:** 16px, Semi-bold

### Spacing

- Cards: 24px padding
- Sections: 16px gap
- Mobile: 16px padding, 12px gap

---

## 📅 IMPLEMENTATION TIMELINE

| Day | Task | Deliverable |
|-----|------|-------------|
| 11 | Emotion + Nova Conversation | Step 2 complete |
| 12 | AI Creation animation | Step 3 complete |
| 13 | Blueprint + Fine-tuning | Steps 4-5 complete |
| 14 | Polish + Testing | Full flow tested, launch ready |

---

## 🧪 TESTING CHECKLIST

**Functional:**
- [ ] All 7 steps execute
- [ ] Data flows through steps
- [ ] Meter animates correctly
- [ ] Nova messages contextual
- [ ] Buttons navigate
- [ ] Mobile responsive

**Accessibility:**
- [ ] Color contrast WCAG AA
- [ ] Keyboard navigation (Tab)
- [ ] Screen reader compatible
- [ ] Focus visible

**Performance:**
- [ ] No lag on animations
- [ ] FCP < 2s
- [ ] LCP < 4s

---

## ✅ SUCCESS CRITERIA

**User Experience:**
- User feels "Twin being born" (not form submission)
- 3 clear "Aha" moments
- Nova conversational (not robotic)
- Animations smooth + delightful
- Total flow: < 2 minutes
- User feels ownership ("My Twin")

**Technical:**
- All 7 steps working end-to-end
- Context preserved from Landing
- Mobile responsive
- WCAG AA accessible
- Zero console errors

---

## 📝 FILES

**Create:**
- `src/components/NovaConversation.tsx`
- `src/components/AICreationSequence.tsx`
- `src/components/InitialBlueprint.tsx`
- `src/components/ProgressMeter.tsx`
- `src/components/FineTuningFlow.tsx`
- `src/styles/onboarding.module.css`

**Update:**
- `src/pages/Onboarding.tsx`
- `src/utils/context.ts`

---

**Prepared by:** jb_DEV  
**Status:** 📋 Ready for Frontend Implementation  
**Timeline:** Aug 11-14
