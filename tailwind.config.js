/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Use CSS variables for all colors
        primary: 'var(--color-accent-primary)',
        secondary: 'var(--color-accent-secondary)',
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        border: 'var(--color-border)',
      },
      // MAXWIDTH-COLLISION-001 (7 ก.ย. 2026): this custom named spacing
      // scale (sm/md/lg/xl/2xl/3xl) was never actually used anywhere in
      // the codebase (verified: zero p-lg/gap-xl/etc. usages, repo-wide
      // grep) — but Tailwind v4's default max-width/width/height scales
      // share the SAME key names as the spacing scale internally, so
      // extending spacing.lg overwrote Tailwind's own max-w-lg default
      // too. Proven in the shipped production CSS:
      // `.max-w-lg{max-width:var(--space-lg)}` → 24px (tokens.css's
      // --space-lg), and `.max-w-2xl{max-width:var(--space-2xl)}` → 48px
      // — every max-w-* utility across the whole site (including
      // TwinChat's own `max-w-2xl` main column) was capped at a few tens
      // of pixels instead of Tailwind's real ~448-672px scale. This is
      // the actual root cause of "เฟรมบีบจนทำอะไรไม่ได้" — not a
      // font-size issue, a width issue. Removed entirely (dead config,
      // safe to delete) so max-w-* falls back to Tailwind's own defaults.
      fontSize: {
        h1: 'var(--font-size-h1)',
        h2: 'var(--font-size-h2)',
        h3: 'var(--font-size-h3)',
        h4: 'var(--font-size-h4)',
        h5: 'var(--font-size-h5)',
        body: 'var(--font-size-body-base)',
        sm: 'var(--font-size-body-small)',
      },
    },
  },
  darkMode: ['selector', '[data-mode="dark"]'],
  plugins: [],
};
