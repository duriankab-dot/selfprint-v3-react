# Phase 3 Step 3: QA & Responsive Testing

## ✅ Build & Startup
- [ ] `npm run build` ผ่าน (TypeScript compilation)
- [ ] `npm run dev` ดำเนินการสำเร็จ (dev server ready)
- [ ] No console errors on startup

---

## 🎨 Landing Page Visual Check

### Hero Section
- [ ] Logo "SELFPRINT" แสดงถูกต้อง
- [ ] CTA "สร้าง AI Twin ฟรี" ปุ่มทำงาน
- [ ] Hero text: "เข้าใจตัวเองให้ลึกขึ้น..." แสดงชัดเจน
- [ ] Background gradient (F7F8FA → FFFFFF) แสดงถูกต้อง
- [ ] Robot emoji 🤖 ในกรอบสีม่วง

### Emotion Section
- [ ] Heading: "วันนี้ คุณรู้สึกยังไง?" แสดง
- [ ] 6 Mood buttons แสดงครบ:
  - [ ] 😰 เครียด
  - [ ] 🤔 สับสน
  - [ ] 💪 มั่นใจ
  - [ ] 😴 หมดแรง
  - [ ] 🚀 พร้อม
  - [ ] 🌙 สะท้อนใจ
- [ ] Selected mood highlight สีเข้ม

### Hub Section
- [ ] Heading: "เลือก Hub ของคุณ" แสดง
- [ ] 12 Hub buttons แสดงครบ (รวม Activity ⏰):
  - [ ] 🪞 ตัวตน
  - [ ] 🧭 การตัดสินใจ
  - [ ] 🌉 ความสัมพันธ์
  - [ ] 🎓 อาชีพ
  - [ ] 💚 สุขภาพ
  - [ ] 💰 เงินตรา
  - [ ] 🤖 AI Twin
  - [ ] 📚 การเรียนรู้
  - [ ] 🎨 ความสร้างสรรค์
  - [ ] ✨ ความเป็นอยู่
  - [ ] 🌍 ผลกระทบ
  - [ ] ⏰ กิจกรรม (NEW)
- [ ] Grid layout 4 columns (desktop) / responsive mobile
- [ ] Selected hub highlight

### Problem & CTA Sections
- [ ] Problem section: "ทำไมการตัดสินใจจึงยาก" แสดง
- [ ] Final CTA: "เริ่มต้นการเดินทางของคุณวันนี้" แสดง
- [ ] White button on gradient background

---

## 🔧 Component Interaction Testing

### Emotion Selector
- [ ] Click mood → state updates
- [ ] Selected mood shows highlight border
- [ ] Description text updates below buttons
- [ ] localStorage saves mood

### Hub Switcher
- [ ] Click hub → currentHub updates
- [ ] Selected hub shows highlight
- [ ] Description text displays for selected hub
- [ ] All 12 hubs clickable

### Navigation
- [ ] "SELFPRINT" logo visible in nav
- [ ] "สร้าง AI Twin ฟรี" button in nav works
- [ ] "ลองสัมผัสก่อน" scrolls to hub section

---

## 📱 Responsive Testing

### Mobile (320px - 480px)
- [ ] Hero section stacks vertically
- [ ] Buttons stack/wrap properly
- [ ] Emoji section hidden or scales down
- [ ] Mood buttons: 2-3 per row
- [ ] Hub buttons: 2-3 per row
- [ ] Text readable (no overflow)
- [ ] Touch targets > 44px

### Tablet (768px - 1024px)
- [ ] Hero: 2-column layout
- [ ] Mood buttons: 3-4 per row
- [ ] Hub buttons: 4 per row
- [ ] Padding/spacing appropriate

### Desktop (1200px - 1400px+)
- [ ] Full layout as designed
- [ ] Mood buttons: 6 in single row
- [ ] Hub buttons: 4x3 grid
- [ ] Max-width constraints applied
- [ ] Hover states work on buttons

---

## 🎯 Flow & Navigation Testing

### Landing Page → Onboarding Flow
- [ ] Click "สร้าง AI Twin ฟรี" (nav) → /onboarding
- [ ] Click "สร้าง AI Twin ของฉัน" (hero) → /onboarding
- [ ] Click "สร้าง AI Twin ของฉัน" (final CTA) → /onboarding
- [ ] Click "ลองสัมผัสก่อน" → scrolls to hub section

---

## 🎨 Design Tokens Check

### Colors
- [ ] Primary color (blue) applied correctly
- [ ] Text colors (primary/secondary) applied
- [ ] Background colors (white/gray) correct
- [ ] Border colors applied

### Typography
- [ ] Font family: Inter / Noto Sans Thai
- [ ] Heading sizes responsive (clamp)
- [ ] Body text readable contrast
- [ ] Font weights correct (600/700/800)

### Spacing
- [ ] Padding: 48px desktop / responsive mobile
- [ ] Section gaps: 64px/80px/100px
- [ ] Component gaps: 8px-16px

---

## 🔍 Browser DevTools Checks

### Console
- [ ] No errors
- [ ] No warnings (except expected)
- [ ] No 404s on assets

### Network
- [ ] All images load
- [ ] CSS loads correctly
- [ ] No CORS issues

### Lighthouse
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 85
- [ ] SEO > 85

---

## ✨ Final Checks

- [ ] Landing page loads < 3s
- [ ] Smooth scrolling to hub section
- [ ] No layout shifts
- [ ] Mood/hub persistence (localStorage)
- [ ] All CTAs functional

---

## 🚀 Sign-off

- [ ] All checks completed
- [ ] No blocking issues
- [ ] Ready for Phase 4 (API integration)
