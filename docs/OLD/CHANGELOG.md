# Changelog

บันทึกการเปลี่ยนแปลงของ Selfprint

---

## [Unreleased]

### Added
- Decision APIs (CRUD) with Supabase integration
- WebAuthn crypto verification with @simplewebauthn/server
- TWIN navigation replacing Chat (center position)
- 12 Worlds immersive environments (replacing Hubs)
- Gamification as Growth Layer (separated from Core)
- Micro-Evolution visibility for Twin progression
- Voice personality separation (Nova vs Twin)
- Landing page simplification (Meet Nova CTA)
- 6 new documentation files (Worlds, UX, Gamification, Assets, Voice, Landing)

### Changed
- Navigation: Home | Explore | TWIN | Activities | Me
- HubContext → WorldContext
- EvolutionContext with micro-evolution tracking
- Chat route redirects to /twin

### Fixed
- Foreign key constraint (user_id text → uuid)
- DecisionForm and DecisionLogger API integration
- WebAuthn signature verification (removed hardcoded)
- PHASE2_TEST_CONSOLE removed from production
- console.log removed from production (51 occurrences)

---

## [Version 3.0] — 2026-08-12

### Added
- Onboarding 7 Steps
- Nova AI Twin (18 Archetypes × 12 Hubs × 6 Moods)
- Dashboard, Analysis Page, Chat, Voice Chat
- Memory System (4 types)
- Badge System (8 badges)
- Twin Evolution Scene (30 reflections milestone)
- Daily Brief Page
- Pricing Page (4 tiers)
- Authentication (Passkey + OAuth + Magic Link)
- Adaptive Theme + Audio
- Pattern Detection
- PWA Support

---

*อัปเดตล่าสุด: 12 สิงหาคม 2569*