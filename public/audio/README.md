# public/audio — Soundscape Audio Files

**Status (5 ก.ย. 2026): PLACEHOLDER ONLY**

This directory exists so that `adaptive-audio-engine.ts` and the soundscape
player do not 404 on `/audio/*.mp3` URLs. No real audio assets are committed.

## Why placeholder?
- FORENSIC_AUDIT identified 23 `CLOUDINARY_URL` references in
  `public/soundscape-manifest.json` pointing at a non-existent Cloudinary account.
- The original soundscape engine (`src/services/adaptive-audio-engine.ts`) has
  built-in `oscillator-full` / `oscillator-simple` / `silence` fallback paths,
  so missing MP3s degrade to Web Audio API synthesis — no crash.
- Real MP3 assets were never uploaded (Cloudinary account was a placeholder).

## Migration plan (future)
1. Pick a free CC0 source: https://mixkit.co / https://pixabay.com / https://freesound.org
2. Download ~10 MB MP3 files matching the 20 soundscapes in `public/soundscape-manifest.json`.
3. Commit them under `public/audio/<id>.mp3`.
4. Update `public/soundscape-manifest.json` URLs from the mixkit/pixabay URLs
   (already done in ASSET404-001) to `/audio/<id>.mp3` so they are served
   from the same origin (better caching, no CORS).

Until then: `soundscape-manifest.json` already references the free mixkit CC0 URLs
(verified 5 ก.ย. 2026) — they are reachable but optional; the app falls back
to silence gracefully if a fetch fails.
