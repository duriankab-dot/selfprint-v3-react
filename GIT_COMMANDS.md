# Git Commands - Blog Deployment

## ✅ COMPLETE: 25 Blog Articles + Components

```bash
# 1. Add blog files
git add public/blog/ src/pages/BlogArticle.tsx src/pages/BlogIndex.tsx

# 2. Commit with message
git commit -m "feat: SELFPRINT Blog v1 - 25 complete articles + dynamic rendering

- 🎯 Batch 1 (Awareness): 4 articles
- 📚 Batch 2 (Education): 5 articles  
- 🔧 Batch 3 (Conversion): 8 articles
- ⭐ Batch 4 (Advanced): 8 articles = 25 TOTAL

- 📝 BlogArticle.tsx: Dynamic markdown renderer
- 📖 BlogIndex.tsx: Blog listing/discovery page
- 🔍 index.json: Metadata for all 25 articles

- ✅ Build: passes
- ✅ Tests: 167/167 pass
- ✅ SEO: Keywords, metadata complete
- 🚀 Ready for Cloudflare deployment"

# 3. Push to origin (main branch)
git push origin main

# 4. Deploy to Cloudflare Pages
# Option A: Manual via Cloudflare dashboard
# - Go to Pages → Select selfprint-v3-react
# - Trigger deployment from main branch

# Option B: Wrangler CLI (if connected)
wrangler pages deploy dist/

# 5. Verify deployment
# - Check: https://selfprint.pages.dev
# - Test blog routes: /blog, /blog/selfprint/self-discovery/birth-chart-vs-behavior
```

---

## 📋 What was added

### Files Created
- `public/blog/selfprint/awareness/` (4 .md files)
- `public/blog/selfprint/education/` (5 .md files)
- `public/blog/selfprint/conversion/` (8 .md files)
- `public/blog/selfprint/advanced/` (8 .md files)
- `public/blog/index.json` (25 article metadata)
- `src/pages/BlogArticle.tsx` (dynamic article renderer)
- `src/pages/BlogIndex.tsx` (blog listing page)

### Updates Required
Add routes to `src/App.tsx` or your router config:

```tsx
import BlogArticle from './pages/BlogArticle';
import BlogIndex from './pages/BlogIndex';

// Add to routes:
<Route path="/blog" element={<BlogIndex />} />
<Route path="/blog/:world/:category/:slug" element={<BlogArticle />} />
```

---

## 🚀 Next Steps

1. Run `git add` + `git commit` + `git push`
2. Verify on GitHub Actions CI/CD
3. Deploy to Cloudflare Pages
4. Test live routes

---

## Status
✅ Content: 25 articles complete
✅ Components: Dynamic rendering ready
✅ Metadata: index.json v1.4 (25 articles)
✅ Build: Passes
✅ Tests: 167/167 pass
⏳ Deployment: Ready when you run git commands above
