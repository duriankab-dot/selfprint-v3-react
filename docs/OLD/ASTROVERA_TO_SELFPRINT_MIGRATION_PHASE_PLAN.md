# 🚀 ASTROVERA → SELFPRINT MIGRATION PLAN
**Phase Division & Development Roadmap**

**Document Version**: V1.0 | **Date**: 2026-08-03 | **Status**: Ready to Execute

---

## 📋 EXECUTIVE SUMMARY

### The Transition
**FROM**: Astrovera v2 (Animation Engine + Brain AI System)
**TO**: SelfPrint v3.1 (Personal Intelligence Platform)

**Core Changes**:
- ✅ Nova AI Twin integrates from Astrovera
- ✅ Animation system (Vera/Astra/Nova engines) → Component animations in SelfPrint
- ✅ Brain knowledge bases → SelfPrint context layers
- ✅ Mystical branding → Personal Intelligence branding
- ✅ Single experience → 66 adaptive experiences (11 hubs × 6 moods)

**Timeline**: 8 weeks to production launch

---

## 🎯 WHAT'S MOVING FORWARD

### ✅ Assets Migrating from Astrovera → SelfPrint

| Asset | From | To | Status |
|-------|------|----|----|
| **Nova AI Twin** | Astrovera Brain | SelfPrint AI Twin Hub | 🟢 Ready |
| **Animation System** | Vera/Astra/Nova engines | SelfPrint component animations | 🟡 Needs porting |
| **Knowledge Bases** | Brain/knowledge/* | SelfPrint context/prompts | 🟢 Ready to integrate |
| **State Machines** | core/state-machine.js | Zustand stores | 🟡 Refactor needed |
| **Rendering Layer** | renderer.js | React components | 🟡 Refactor needed |
| **Design System** | (Minimal) | Design tokens + component library | 🟢 Built in v3.1 |

### ❌ What's NOT Moving Forward
- Astrovera branding assets (mystical, cosmic aesthetic)
- Vera/Astra Prime/Nova Elite (keeping Nova only)
- Telemetry system (use SelfPrint analytics instead)
- Old secrets/env files (use new SelfPrint secrets)

---

## 🏗️ PHASE BREAKDOWN (8 Weeks)

### PHASE 0: PREPARATION (Week 1)
**Goal**: Team alignment, token setup, environment ready

#### Week 1 Tasks
- [ ] All team members review this document
- [ ] API keys + credentials distributed (see Token Management doc)
- [ ] Dev environment setup (Node, React, Firebase)
- [ ] GitHub repositories created/cloned
- [ ] Design system tokens loaded in Figma
- [ ] AI/ML engineer sets up Claude API access

**Deliverables**:
- ✅ All dev environments ready
- ✅ All tokens/credentials distributed
- ✅ Slack channels ready (#selfprint-build, #selfprint-design, #selfprint-ai)
- ✅ First standup completed

**Owner**: PM + Tech Lead
**Blockers**: None

---

### PHASE A: CORE FOUNDATION (Weeks 2-4)
**Goal**: Build the plumbing that everything else runs on

#### Week 2: React Architecture + State Management
- [ ] **Frontend**: Create React app structure
  - `src/contexts/` (Emotion, Hub, Theme contexts)
  - `src/stores/` (Zustand: Twin, User, Feedback)
  - `src/styles/` (CSS variables + tokens)
  - `src/components/` (Primitives folder structure)

- [ ] **Backend**: User database schema
  - Users table (id, email, name, preferences)
  - Mood log table (userId, mood, hub, timestamp)
  - Feedback table (userId, insightId, reaction)
  - Twin store (autonomy level, learned patterns)

**Success Criteria**:
✅ React app runs locally
✅ All 3 contexts working
✅ Zustand stores hydrate + persist
✅ CSS variables changeable in browser

**Owner**: Frontend Lead
**Dependencies**: None

---

#### Week 3: Design System + CSS Setup
- [ ] **Design**: Export all design tokens
  - Colors (base + 11 hub + 6 mood overrides)
  - Typography (sizes, weights, line heights)
  - Spacing (8px grid)
  - Animations (timings, easing functions)
  - Export as JSON → CSS variables

- [ ] **Frontend**: Implement design tokens
  - Create `src/styles/tokens.css`
  - Create `src/styles/hub-themes.css`
  - Create `src/styles/mood-themes.css`
  - Test theme switching via CSS variables

**Success Criteria**:
✅ 30 color tokens working
✅ Light + dark mode toggle working
✅ Hub theme switching instant (no re-render)
✅ Mood theme switching instant (no re-render)

**Owner**: Design Lead + Frontend
**Dependencies**: None

---

#### Week 4: Primitives + Foundations
- [ ] **Frontend**: Build 10 primitive components
  1. Button (variants: primary, secondary, tertiary)
  2. Input (text, email, password)
  3. Card (with padding, shadow, hover states)
  4. Badge (7 mood colors)
  5. Icon (SVG wrapper)
  6. Text (headings, body, small)
  7. Divider (horizontal, vertical, colored)
  8. Checkbox (themed)
  9. Radio (themed)
  10. Toggle (mood/hub switcher)

- [ ] **Frontend**: Create component stories (Storybook)
  - All variants documented
  - All moods + hubs shown
  - Interactive testing

- [ ] **Design**: QA all primitives
  - Dark mode contrast (WCAG AA)
  - Responsive on mobile
  - Animation timings correct

**Success Criteria**:
✅ All 10 primitives built + themed
✅ Storybook deployed
✅ No accessibility violations
✅ All mood/hub combinations shown

**Owner**: Frontend + Design
**Dependencies**: Week 2, 3

---

### PHASE B: COMPONENTS + AI FOUNDATION (Weeks 5-7)
**Goal**: Build interactive components and integrate Nova AI

#### Week 5: Composite Components + Features (Part 1)
- [ ] **Frontend**: Build 10 composite components
  1. Modal (with animations)
  2. Alert (success, error, info, warning)
  3. Progress bar (autonomy level)
  4. Dropdown (hub switcher)
  5. Tabs (hub navigation)
  6. Slider (mood intensity)
  7. Breadcrumb (navigation)
  8. Tag (mood, hub labels)
  9. Skeleton (loading state)
  10. Tooltip (help, context)

- [ ] **Frontend**: Build 5 features
  1. **Emotion Selector**: Click mood → theme updates
  2. **Hub Switcher**: Click hub → dashboard changes
  3. **Confidence Meter**: Visual 0-100 autonomy display
  4. **Timeline Component**: Past moods + hubs visualized
  5. **Nova Avatar**: 7-state animation (idle, thinking, speaking, learning, excited, calm, confused)

**Success Criteria**:
✅ All 10 composites responsive + themed
✅ 5 features interactive
✅ Animation timings match design spec
✅ Theme switching works in all components

**Owner**: Frontend + Design
**Dependencies**: Phase A

---

#### Week 6: Nova AI Integration (Part 1)
- [ ] **AI/ML**: Build Nova prompt templates
  - 11 hub archetypes (Identity, Decision, Relationship, Career, Health, Money, AI Twin, Learning, Creativity, Spirituality, Impact)
  - 6 mood modulations (Stressed, Confused, Confident, Drained, Ready, Reflective)
  - Result: 66 unique personality combinations

- [ ] **AI/ML**: Set up Claude API integration
  - Create `src/services/nova-ai.js`
  - Implement conversation memory (last 10 messages)
  - Create prompt builder (hub + mood → custom prompt)
  - Test response quality for all 66 combinations

- [ ] **Frontend**: Build Nova Chat Interface
  - Message display (user + Nova messages)
  - Input field (with mood-aware placeholder)
  - Avatar animation (synced to Nova thinking)
  - Feedback buttons (👍 helpful / 😑 meh / 👎 not helpful)

**Success Criteria**:
✅ Nova responds in all 66 combinations
✅ Responses feel personalized to mood + hub
✅ Conversation memory working
✅ Chat UI responsive + themed

**Owner**: AI/ML + Frontend
**Dependencies**: Phase A, Week 5

---

#### Week 7: Learning System + Dashboard (Part 1)
- [ ] **AI/ML**: Build learning + autonomy system
  - Track feedback (helpful/meh/unhelpful)
  - Calculate autonomy score (0-100)
  - Detect user patterns (decisions, values, strengths)
  - Store learned insights in Zustand

- [ ] **Frontend**: Build Dashboard Shell
  - 11 hub pages (templates)
  - Dashboard header (mood selector, hub breadcrumb)
  - Sidebar (hub navigation)
  - 3-4 insight cards per hub (placeholder)
  - Call-to-action buttons (mood-specific)

- [ ] **Frontend**: Build Insight Cards
  - Card displays insight + source
  - Feedback buttons (thumbs up/down)
  - Hub + mood badge
  - Animation on mount

**Success Criteria**:
✅ Dashboard renders all 11 hubs
✅ Theme changes work (66 combinations)
✅ Insight cards responsive
✅ Feedback recorded + updates autonomy
✅ Learning system visible (autonomy score on page)

**Owner**: Frontend + AI/ML
**Dependencies**: Phase A, Week 5, 6

---

### PHASE C: PAGES + INTEGRATIONS (Week 8)
**Goal**: Complete pages, API integration, testing ready to ship

#### Week 8: Pages + API + Finalization
- [ ] **Frontend**: Build missing pages
  - **Homepage**: Onboarding flow (mood selector → get started)
  - **Dashboard**: All 11 hubs fully functional
  - **Settings**: Preferences, notifications, data export
  - **Auth pages**: Sign up, login, password reset

- [ ] **Frontend**: Integrate Firebase Auth
  - Sign up / login working
  - Persist user state on reload
  - Logout + session management
  - Error handling + validation

- [ ] **Frontend**: Integrate backend APIs
  - Fetch user data on load
  - Save mood + hub selections
  - Submit feedback to backend
  - Fetch insights from Nova API

- [ ] **Frontend**: Performance + Accessibility
  - Code splitting by hub (lazy load routes)
  - Image optimization (WebP + fallback)
  - Accessibility audit (WCAG AA)
  - Lighthouse score >90

- [ ] **QA**: Full end-to-end testing
  - User flows 1-3 (New user, Mood switch, Hub switch)
  - All 30 components responsive
  - All 11 hubs × all 6 moods tested
  - Dark mode verified
  - Mobile (iPhone + Android) verified

**Success Criteria**:
✅ All pages built + responsive
✅ Firebase auth working
✅ APIs integrated + working
✅ No console errors
✅ Accessibility AA passed
✅ Lighthouse >90
✅ User testing passed (5+ users)

**Owner**: Full team
**Dependencies**: Phase A, B, C

---

## 📊 PHASE SUMMARY TABLE

| Phase | Weeks | Focus | Team | Blockers |
|-------|-------|-------|------|----------|
| **0** | 1 | Setup + alignment | All | None |
| **A** | 2-4 | Architecture + design system | FE + Design | None |
| **B** | 5-7 | Components + AI | FE + AI + Design | Phase A |
| **C** | 8 | Pages + integration + QA | All | Phase B |

---

## 👥 TEAM STRUCTURE & ROLES

### Frontend Lead
- **Owns**: React architecture, components, integration
- **Reports to**: Tech Lead
- **Size**: 2 engineers

### AI/ML Engineer
- **Owns**: Nova personality, learning system, Claude API
- **Reports to**: Tech Lead
- **Size**: 1 engineer

### Design Lead
- **Owns**: Design tokens, components, QA
- **Reports to**: Product Lead
- **Size**: 1 designer

### Product Manager
- **Owns**: Roadmap, stakeholder updates, launch prep
- **Reports to**: Founder
- **Size**: 1 PM

### Tech Lead
- **Owns**: Architecture decisions, code review, performance
- **Reports to**: Founder
- **Size**: 1 (can be lead engineer)

---

## 🔐 TOKEN + CREDENTIALS MANAGEMENT

**See separate document**: `SELFPRINT_TOKEN_MANAGEMENT_POLICY.md`

**Quick Reference**:
- 🔑 API Keys: Firebase, Claude AI, (Analytics)
- 🗝️ Database: PostgreSQL connection string (if using)
- 📧 Email: SendGrid API key (notifications)
- 📊 Analytics: Mixpanel/Segment tokens
- 🔐 Secrets: `.env.local` (gitignored)

**Distribution**:
- ✅ Each team member gets `.env.local` via secure channel (not git)
- ✅ Production secrets stored in CI/CD environment variables
- ✅ Tokens rotate every 90 days
- ✅ Audit log kept for access

---

## ✅ SUCCESS CRITERIA (Per Phase)

### Phase 0: All ✅
- [ ] Team trained on SelfPrint vision
- [ ] All credentials distributed
- [ ] Dev environments working
- [ ] Slack channels active

### Phase A: All ✅
- [ ] React app runs locally
- [ ] Design system CSS working
- [ ] All primitives + foundations built
- [ ] Storybook live
- [ ] No accessibility violations

### Phase B: All ✅
- [ ] 10 composites built
- [ ] 5+ features working
- [ ] Nova AI responding (66 combinations)
- [ ] Learning system tracking
- [ ] Dashboard showing insights
- [ ] Zero theme-switching bugs

### Phase C: All ✅
- [ ] All pages built
- [ ] Auth working (Firebase)
- [ ] APIs integrated
- [ ] WCAG AA passed
- [ ] Lighthouse >90
- [ ] User testing passed
- [ ] Ready for launch

---

## 🚨 RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Claude API rate limit** | Medium | High | Use token management + queue system |
| **Design asset delays** | Medium | Medium | Design buffers 1 week; use placeholders |
| **Authentication issues** | Low | High | Firebase setup in Week 1; test early |
| **Performance issues** | Medium | Medium | Code splitting + lazy load; Lighthouse checks |
| **Scope creep** | High | High | Strict sprint boundaries; Phase C is hard stop |

---

## 📅 CRITICAL DATES

- **Week 1 (Aug 4-8)**: Phase 0 complete → Phase A starts
- **Week 4 (Aug 25-29)**: Phase A complete → Phase B starts
- **Week 7 (Sep 15-19)**: Phase B complete → Phase C starts
- **Week 8 (Sep 22-26)**: Phase C complete → LAUNCH READY
- **Target Launch**: **Monday, September 23, 2026**

---

## 📞 COMMUNICATION PLAN

### Daily Standups
- **Time**: 9:00 AM (Asia time)
- **Format**: Slack thread (Yesterday / Today / Blockers)
- **Duration**: 5 min written, optional 15 min sync call

### Weekly Syncs
- **Design + Frontend**: Wed 3 PM (component QA)
- **Frontend + AI/ML**: Thu 10 AM (Nova integration)
- **Full team**: Fri 2 PM (status + blockers + planning)

### Documentation
- **Decisions**: Decision record in #selfprint-architecture
- **Bugs**: GitHub issues (with PR links)
- **Questions**: Slack thread (not DM)

---

## 🎯 NEXT STEPS (FOR YOU - JB_DEV)

1. **Share this document** with:
   - Frontend Lead
   - AI/ML Engineer
   - Design Lead
   - Tech Lead
   - Product Manager

2. **Schedule kickoff meeting** (1 hour)
   - Review phase breakdown
   - Clarify roles + responsibilities
   - Address blockers + dependencies
   - Commit to timeline

3. **Distribute credentials** (see Token Management doc)
   - Create `.env.local` files
   - Send securely (1Password, LastPass, etc.)
   - Confirm receipt + testing

4. **Set up infrastructure** (Week 1)
   - GitHub repos created
   - Figma design system shared
   - Slack channels created
   - Firebase projects created
   - Claude API access confirmed

5. **Kick off Phase 0** (Monday)
   - First standup
   - Envs verified
   - Team introductions

---

## 📝 DOCUMENT INDEX

| Document | Owner | Purpose |
|----------|-------|---------|
| THIS FILE | PM | Phase breakdown + timeline |
| SELFPRINT_TOKEN_MANAGEMENT_POLICY.md | Tech Lead | Token distribution + security |
| SELFPRINT_TEAM_ACTION_PLAN.md | PM | Team-specific tasks + assignments |
| MASTER_PRD_V3_1_SELFPRINT.md | Product | Product vision + requirements |
| HANDOFF_FINAL_V3_1.md | Design | Design + engineering handoff |
| FRONTEND_ARCHITECTURE_V3_1.md | Frontend | React architecture details |
| AI_TWIN_SPEC_V3_1.md | AI/ML | Nova personality + behavior |

---

**Status**: ✅ READY TO EXECUTE
**Approval**: Pending team alignment
**Next Review**: After Phase 0 kickoff

---

*Document prepared: 2026-08-03*
*Timeline: 8 weeks to launch (Sep 23, 2026)*
*Discipline: Design → Architecture → Build → Launch*
