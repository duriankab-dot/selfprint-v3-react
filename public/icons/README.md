# PWA Icon Assets

Place PNG icon files in this directory. All icons must be square with transparent or white background.

## Required Sizes

| File | Size | Purpose |
|------|------|---------|
| `icon-72x72.png` | 72×72 px | Android / Legacy |
| `icon-96x96.png` | 96×96 px | Android / Shortcuts |
| `icon-128x128.png` | 128×128 px | Android |
| `icon-144x144.png` | 144×144 px | Android / Windows |
| `icon-152x152.png` | 152×152 px | iOS (iPad) |
| `icon-192x192.png` | 192×192 px | Android (maskable) |
| `icon-384x384.png` | 384×384 px | Android |
| `icon-512x512.png` | 512×512 px | Android (maskable) / Splash |

## Apple Splash Screens (Optional)

| File | Device |
|------|--------|
| `splash-1290x2796.png` | iPhone 14 Pro Max |
| `splash-1170x2532.png` | iPhone 14 / 13 / 12 |
| `splash-750x1334.png` | iPhone SE / 8 |

## Design Specs

- Background color: `#0f0f1a`
- Primary color: `#4f46e5` (indigo)
- Safe zone for maskable icons: center 80% of canvas (keep logo inside)
- Format: PNG-24 with transparency (or solid `#0f0f1a` background)

## Tools

- **Figma / Illustrator** — design at 512×512, export all sizes
- **[realfavicongenerator.net](https://realfavicongenerator.net)** — upload 512px PNG, download all sizes
- **[maskable.app](https://maskable.app/editor)** — preview maskable icon safe zone

## Quick Test

After adding icons, open DevTools → Application → Manifest to verify all icons load without errors.
