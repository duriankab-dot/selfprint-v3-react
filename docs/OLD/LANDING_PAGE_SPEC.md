# 📄 Landing Page Architecture — Phase 3

## 🎯 Page Structure (5 Sections + Nav)

### 1️⃣ **Navigation** (Fixed Top)
- Position: `position: fixed; top: 0; z-index: 200`
- Content:
  - Left: SELFPRINT logo (text)
  - Right: "สร้าง AI Twin ฟรี" button
- Background: `rgba(255, 255, 255, 0.92)` + blur
- Border: bottom divider

---

### 2️⃣ **Hero Section** (Full Screen)
- Height: `minHeight: 100vh`
- Layout: 2-column grid (`gridTemplateColumns: '1fr 1fr'`)
- Padding: `140px 48px 80px`
- Background: `linear-gradient(135deg, #F7F8FA 0%, #FFFFFF 100%)`

**Left Column:**
- 💡 Badge: "💡 AI ที่เข้าใจตัวคุณ"
- H1: "เข้าใจตัวเองให้ลึกขึ้น\nตัดสินใจได้มั่นใจขึ้นทุกวัน"
  - fontSize: `clamp(36px, 5vw, 56px)`
  - fontWeight: 800
- P: "SELFPRINT สร้าง AI Twin..."
  - fontSize: 18px
- Buttons: 2 CTAs
  - Primary: "สร้าง AI Twin ของฉัน" (dark bg)
  - Secondary: "ลองสัมผัสก่อน" (border)
  - Action: scroll to #hub-section

**Right Column:**
- 🤖 Robot emoji (80px)
- Container: gradient purple bg

**Responsive:**
- Desktop (1200px+): 2 columns
- Tablet (768px): 1 column stack
- Mobile (320px): 1 column, full-width

---

### 3️⃣ **Emotion Selector Section**
- Background: `linear-gradient(135deg, #F7F8FA 0%, #EFF2FF 100%)`
- Padding: `80px 48px`
- Text-align: center

**Content:**
- H2: "วันนี้ คุณรู้สึกยังไง?"
  - fontSize: `clamp(28px, 4vw, 44px)`
- P: "อารมณ์ของคุณช่วยให้ AI Twin เข้าใจตัวคุณได้ดีขึ้น"

**Component: `<EmotionSelector />`**
- 6 mood buttons grid:
  - 😰 เครียด (stressed)
  - 😭 สับสน (confused)
  - 💪 มั่นใจ (confident)
  - 😴 หมดแรง (drained)
  - 🚀 พร้อม (ready)
  - 🌙 สะท้อนใจ (reflective)
- Grid: `repeat(auto-fit, minmax(100px, 1fr))`
- Gap: 8px
- Selected: highlight border + bg color

**State Management:**
- EmotionContext (mood state)
- localStorage: `selfprint_mood`

---

### 4️⃣ **Hub Selection Section**
- id: `hub-section` (scroll target)
- Background: white (`#FFFFFF`)
- Padding: `100px 48px`
- Text-align: center

**Content:**
- H2: "เลือก Hub ของคุณ"
  - fontSize: `clamp(28px, 4vw, 44px)`
- P: "SELFPRINT มี 12 บริบทของชีวิตที่ AI Twin ช่วยเข้าใจคุณ"

**Component: `<HubSwitcher />`**
- 12 hub buttons grid:
  1. 🪞 ตัวตน (identity)
  2. 🧭 การตัดสินใจ (decision)
  3. 🌉 ความสัมพันธ์ (relationship)
  4. 🎓 อาชีพ (career)
  5. 💚 สุขภาพ (health)
  6. 💰 เงินตรา (money)
  7. 🤖 AI Twin (ai-twin)
  8. 📚 การเรียนรู้ (learning)
  9. 🎨 ความสร้างสรรค์ (creativity)
  10. ✨ ความเป็นอยู่ (spirituality)
  11. 🌍 ผลกระทบ (impact)
  12. ⏰ กิจกรรม (activity) ← NEW

- Layout: `repeat(auto-fit, minmax(100px, 1fr))`
- Gap: 8px
- Selected: highlight border + bg

**State Management:**
- HubContext (hub state)
- localStorage: `selfprint_hub`

---

### 5️⃣ **Problem Section** (Why/Social Proof)
- Background: `var(--color-bg-secondary)` (light gray)
- Padding: `100px 48px`
- Text-align: center

**Content:**
- Badge: "⚡ ปัญหาจริง"
- H2: "ทำไมการตัดสินใจจึงยาก"
  - fontSize: `clamp(28px, 4vw, 44px)`
- P: "คุณไม่เคยเพราะคุณยังไม่มี AI ที่เข้าใจตัวเอง"

---

### 6️⃣ **Final CTA Section**
- Background: `linear-gradient(135deg, var(--color-accent-primary) 0%, #8B5CF6 100%)`
- Color: white
- Padding: `100px 48px`
- Text-align: center

**Content:**
- H2: "เริ่มต้นการเดินทางของคุณวันนี้"
  - fontSize: `clamp(28px, 4vw, 44px)`
- P: "สร้าง AI Twin ฟรี ไม่ต้องใส่บัตรเครดิต"
- Button: "สร้าง AI Twin ของฉัน"
  - bg: white
  - color: `var(--color-accent-primary)`
  - fontWeight: 700

---

## 🔄 Data Flow

```
User Action (Click CTA)
  ↓
handleStartOnboarding()
  ↓
window.location.href = '/onboarding'
  ↓
Router: <Route path="/onboarding" element={<Onboarding />} />
  ↓
Onboarding page loads
  ├─ Access EmotionContext (mood state)
  ├─ Access HubContext (hub state)
  └─ Connected to Brain/Nova AI
```

---

## 💾 State Persistence

**localStorage keys:**
- `selfprint_mood` → selected mood
- `selfprint_hub` → selected hub
- `selfprint_mode` → light/dark (from ThemeContext)

---

## 🎨 Design Tokens Used

**Colors:**
- Primary accent: `--color-accent-primary` (#0F1F3F)
- Secondary accent: `--color-accent-secondary` (#FFFFFF)
- Text primary: `--color-text-primary` (#0F172A)
- Text secondary: `--color-text-secondary` (#4B5563)
- Background primary: `--color-bg-primary` (#FFFFFF)
- Background secondary: `--color-bg-secondary` (#F9FAFB)
- Border: `--color-border` (#E5E7EB)

**Typography:**
- Font family: Inter, Noto Sans Thai
- H1: `clamp(36px, 5vw, 56px)` weight 800
- H2: `clamp(28px, 4vw, 44px)` weight 700
- Body: 16-18px, weight 400-600

**Spacing:**
- Section padding: 48px-100px
- Gap: 8px-64px
- Breakpoints: 320px (mobile), 768px (tablet), 1200px (desktop)

---

## ✅ Checklist

- [x] Navigation bar fixed top
- [x] Hero section (2-column, full viewport)
- [x] Emotion selector (6 moods)
- [x] Hub switcher (12 hubs)
- [x] Problem section
- [x] Final CTA section
- [x] All CTAs → /onboarding
- [x] Context state persisted (localStorage)
- [x] Responsive layout (320px → 1400px)
- [x] CSS variables correct (no --tx, --tx2)
- [x] Components render without errors

---

## 🚀 Next Steps

**Phase 4:** Integrate with Astrovera Brain
- Connect mood/hub selection to Brain API
- Load Nova AI Twin personalization
- Setup chat interface (ChatWindow)
- Build Onboarding flow
