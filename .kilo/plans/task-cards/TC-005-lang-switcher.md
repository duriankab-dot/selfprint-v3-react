# TC-005: Language switcher relocation
**Phase**: 0 | **Priority**: P1 | **Estimate**: 1 ชม.
**Assignee**: AI-Frontend | **Depends On**: TC-001
**Feature Flag**: N/A (UI fix)

## 🎯 OBJECTIVE
ย้าย Language Switcher จาก hamburger menu ไปไว้ข้าง Audio Button ใน NavBar (desktop + mobile) เพื่อเข้าถึงง่ายขึ้น

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `src/components/layout/NavBar.tsx` — ย้าย LanguageSwitcher ไป `.sp-navbar-always-action`
- [ ] `src/components/LanguageSwitcher.tsx` — เพิ่ม `variant="compact"` (TH/EN only, no label)
- [ ] ทำงานบน desktop และ mobile (hamburger ไม่ต้องมี language switcher ซ้ำ)
- [ ] **Docs updated**: MASTER_PLAN.md
- [ ] **All tests pass**: `npm test -- NavBar`
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
```tsx
// NavBar.tsx — ใน .sp-navbar-always-action (ข้าง AudioSettingsButton)
<div className="sp-navbar-always-action" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
  <button className="sp-theme-toggle" onClick={toggleTheme} ...>...</button>
  <AudioSettingsButton />
  {/* NEW */}
  <LanguageSwitcher variant="compact" style={{ marginLeft: '4px' }} />
</div>

// LanguageSwitcher.tsx — เพิ่ม variant compact
if (variant === 'compact') {
  return (
    <div style={{ display: 'flex', gap: '2px', background: 'var(--color-bg-secondary)', borderRadius: '6px', padding: '2px', border: '1px solid var(--color-border)' }}>
      {['th', 'en'].map(lang => (
        <button key={lang} onClick={() => setLanguage(lang)} style={{
          padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
          background: language === lang ? 'var(--color-accent-primary)' : 'transparent',
          color: language === lang ? 'white' : 'var(--color-text-secondary)', border: 'none', cursor: 'pointer'
        }}>
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- .ai/context-pack/session-XXX-context.json