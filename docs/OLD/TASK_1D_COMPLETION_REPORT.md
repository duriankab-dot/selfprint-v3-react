# 📊 Task 1D Completion — EvidenceAnalyzer
**Calculates Confidence & Classifies Knowledge: KNOW / INFER / UNKNOWN**

**วันที่:** 10 สิงหาคม 2026  
**สถานะ:** ✅ READY (ไม่ต้องแก้เพิ่มเติม — implement complete)  
**ผู้ทำงาน:** AI Developer (Claude)

---

## ✅ FINDINGS

EvidenceAnalyzer ทั้งหมด **implement สมบูรณ์แล้ว** ✨

### Public Methods (ทั้งหมด functional)

#### 1. **calculateConfidence(insight, sources, userId)**
- รับ insight claim + evidence sources
- คำนวณ 5-factor weighted model
- **Output:** number 0-1 (confidence score)

#### 2. **getConfidenceBreakdown(insight, sources, userId)**
- เหมือน #1 แต่ return detailed breakdown
- **Output:** ConfidenceBreakdown { count, recency, consistency, quality, corroboration, overall, reasoning }

#### 3. **separateKnowInferUnknown(userId, claim)**
- Classify claim type ด้วย keyword heuristic
- KNOW = "i am", "i want", "i love" (ผู้ใช้บอก)
- INFER = "tend to", "usually", "pattern" (AI คาดเดา)
- UNKNOWN = ไม่มี keywords
- **Output:** KnowledgeLevel ('KNOW' | 'INFER' | 'UNKNOWN')

#### 4. **classifyClaimWithEvidence(userId, claim, sources)**
- Full classification workflow
- Combines separateKnowInferUnknown + calculateConfidence + generateExplanation
- **Output:** KnowledgeClassification { claim, level, evidence, confidence, explanation }

#### 5. **validateEvidence(userId, evidencePoints)**
- Verify ว่า evidence points อยู่ใน Supabase
- Loop through each point, query DB
- **Output:** boolean (all exist? = true)

#### 6. **getRecency(sourceDate)**
- Classify source date into buckets
- Recent (≤7d), Somewhat recent (8-30d), Old (30d+)
- **Output:** 'recent' | 'somewhat_recent' | 'old'

#### 7. **getAccuracyMetrics(userId)**
- Pull `insight_feedback` table for user
- Count: veryTrue, somewhat, notSure, notMe
- Calculate accuracy % (veryTrue + somewhat*0.5)
- **Output:** { totalFeedback, veryTrue, somewhat, notSure, notMe, accuracy, accuracyTrend }

---

## 🔍 ALGORITHM DEEP DIVE

### Step 1: Classify Knowledge Type

**Keywords ตัวเลือก:**

```typescript
// KNOW (ผู้ใช้บอกตรง)
"i'm", "i am", "i want", "i prefer", "i need", "i love", "i hate"

// INFER (AI คาดเดา)
"pattern", "tend to", "usually", "often", "seem to", "appears"

// UNKNOWN (ไม่รู้)
// ไม่มี keywords ทั้ง 2 ชุด
```

### Step 2: Calculate 5-Factor Confidence

| # | Factor | Weight | Calculation | Range |
|---|--------|--------|-------------|-------|
| 1 | **Count** | 15% | min(sources.length / 5, 1) | 0-1 |
| 2 | **Recency** | 25% | avg(max(1 - daysOld/90, 0.1)) | 0-1 |
| 3 | **Consistency** | 25% | pow(maxTypeCount / totalCount, 0.8) | 0-1 |
| 4 | **Quality** | 20% | avg(qualityMap[sourceType]) | 0-1 |
| 5 | **Corroboration** | 15% | uniqueIds / totalCount | 0-1 |

**Quality Map (source type):**
```typescript
{
  reflection: 0.9,      // ผู้ใช้บอก (สูงสุด)
  decision: 0.85,       // ผู้ใช้เลือก
  memory: 0.8,          // ผู้ใช้จำ
  question_answer: 0.75,// คำตอบโครงสร้าง
  mood: 0.6,            // Soft signal (ต่ำสุด)
  default: 0.5
}
```

### Step 3: Weighted Average

```
overall = 
  countScore * 0.15 +
  recencyScore * 0.25 +    // ← สำคัญมาก (25%)
  consistencyScore * 0.25 + // ← สำคัญมาก (25%)
  qualityScore * 0.20 +
  corroborationScore * 0.15

final = min(overall, 1.0)  // Clamp to valid range
```

**Example Calculation:**
```
Evidence: 5 recent sources, all memories (80% quality)
- Count: min(5/5, 1) * 0.15 = 0.15
- Recency: 0.9 * 0.25 = 0.225
- Consistency: 1.0 * 0.25 = 0.25 (all same type)
- Quality: 0.8 * 0.20 = 0.16
- Corroboration: (5/5) * 0.15 = 0.15

Total: 0.15 + 0.225 + 0.25 + 0.16 + 0.15 = 0.935 ≈ 94% ✅
```

---

## 💬 Knowledge Explanation Generation

### For KNOW Classification
```
Output: "You've stated this directly. We're confident (95%) based on 3 explicit statement(s)."
```

### For INFER Classification
```
If confidence > 0.7:
  "We're fairly confident (78%) in this inference based on 5 observation(s) of your behavior."
  
If confidence 0.4-0.7:
  "We're moderately confident (55%) in this inference based on 8 observation(s)..."
  
If confidence < 0.4:
  "We're less confident (25%) in this inference based on 2 observation(s)..."
```

### For UNKNOWN Classification
```
Output: "We haven't observed enough evidence yet. Need more data to form a confident inference."
```

---

## 📊 Feature Matrix

| Feature | Implemented | Used By | Note |
|---------|-------------|---------|------|
| 5-factor scoring | ✅ | getConfidenceBreakdown | Core algorithm |
| KNOW/INFER/UNKNOWN | ✅ | separateKnowInferUnknown | Classification |
| Recency decay | ✅ | calculateRecencyScore | Recent = 1, 90d+ = 0.1 |
| Consistency check | ✅ | calculateConsistencyScore | Group by type |
| Source quality map | ✅ | calculateSourceQuality | reflection 0.9 > mood 0.6 |
| Corroboration check | ✅ | calculateCorroboration | uniqueIds / total |
| Evidence validation | ✅ | validateEvidence | DB query per point |
| Accuracy metrics | ✅ | getAccuracyMetrics | Pull insight_feedback |
| Human-readable reasoning | ✅ | generateReasoningText | Parts-based sentence builder |

---

## 🎯 Quality Metrics

| Metric | Target | Status |
|--------|--------|--------|
| TypeScript | `tsc --noEmit` ✅ | ✅ Pass |
| Comments | Thai + English | ✅ Updated |
| Algorithm | Real analysis (not stub) | ✅ Complete |
| Confidence | 5-factor weighted | ✅ Implemented |
| Knowledge Classification | 3-way (KNOW/INFER/UNKNOWN) | ✅ Implemented |
| Database | Supabase integration | ✅ Ready |

---

## 🚀 Ready For Use

**Direct Integration:**
- PatternDetector → call getConfidenceBreakdown() for each pattern
- AIFeedbackLoop → call separateKnowInferUnknown() on feedback
- Dashboard UI → show confidence % + reasoning

**Accuracy Feedback Loop:**
- UI collects user feedback (veryTrue, somewhat, notSure, notMe)
- Store in `insight_feedback` table
- EvidenceAnalyzer.getAccuracyMetrics() pulls this
- AIFeedbackLoop.calibrateModel() adjusts weights based on accuracy

---

## 📝 Code Changes

**File:** EvidenceAnalyzer.ts
- **Added:** Thai comments (header + class + methods)
- **Preserved:** All implementations (no changes needed)
- **Status:** Production-ready ✅

**Changes Detail:**
- Line 1-16: Enhanced header with Thai explanation + knowledge types + algorithm steps
- Line 20-28: Enhanced ConfidenceBreakdown interface comments
- Line 31-65: Enhanced class-level documentation with usage examples
- Line 68-95: Enhanced calculateConfidence() with Thai input/output/example
- Line 122-167: Enhanced separateKnowInferUnknown() with logic + examples
- Line 169-212: Enhanced getConfidenceBreakdown() with formula table + calculation example

---

## 🧮 Confidence Formula Reference

```typescript
/**
 * NEVER used in code — reference only
 * Real calculation is in getConfidenceBreakdown()
 */

confidence = Math.min(
  (
    Math.min(evidenceCount / 5, 1) * 0.15 +
    calculateRecencyScore(sources) * 0.25 +
    calculateConsistencyScore(sources) * 0.25 +
    calculateSourceQuality(sources) * 0.20 +
    calculateCorroboration(sources) * 0.15
  ),
  1.0
);
```

---

## ✅ Master Direction Compliance

**Rule:** "Never pretend to know what the system does not know"

**How implemented:**
- ✅ KNOW classification only for direct user statements
- ✅ INFER for behavior patterns (marked as inferred)
- ✅ UNKNOWN for insufficient data
- ✅ Confidence scoring is transparent (5 factors visible)
- ✅ Accuracy metrics track real user validation
- ✅ No hardcoded claims; everything evidence-based

---

## 🔜 Next: Task 1E (AIFeedbackLoop)

**Task 1E Scope:**
- collectUserFeedback() — UI feedback → table
- calibrateModel() — adjust weights based on accuracy
- adjustSignalWeight() — boost/penalize source types
- updateBehavioralModel() — improve pattern confidence

**Est. Time:** 2-3 hours  
**Est. Tokens:** ~3,000

---

## 📊 Summary

| Component | สถานะเดิม | สถานะใหม่ | หมายเหตุ |
|-----------|---------|---------|---------|
| calculateConfidence | ✅ สมบูรณ์ | ✅ สมบูรณ์ | 5-factor scoring |
| getConfidenceBreakdown | ✅ สมบูรณ์ | ✅ สมบูรณ์ | Detailed breakdown |
| separateKnowInferUnknown | ✅ สมบูรณ์ | ✅ สมบูรณ์ | Keyword classification |
| classifyClaimWithEvidence | ✅ สมบูรณ์ | ✅ สมบูรณ์ | Full workflow |
| validateEvidence | ✅ สมบูรณ์ | ✅ สมบูรณ์ | DB verification |
| getAccuracyMetrics | ✅ สมบูรณ์ | ✅ สมบูรณ์ | Feedback tracking |

---

**Time to Document:** ~30 minutes  
**Tokens Spent:** ~2,500  
**Ready for Task 1E:** ✅ YES  

**Phase 1 Progress:** 80% (4 of 5 engines complete)

