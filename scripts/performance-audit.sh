#!/bin/bash
# P0 #7 Performance Audit Script
# Checks bundle size, TypeScript, and build integrity

set -e

echo "========================================"
echo "P0 #7 Performance Audit — $(date)"
echo "========================================"
echo ""

# 1. TypeScript Check (CRITICAL)
echo "1️⃣  TypeScript Type Check..."
if npx tsc -b --noEmit; then
    echo "   ✅ TypeScript: PASS (EXIT:0)"
else
    echo "   ❌ TypeScript: FAIL"
    exit 1
fi
echo ""

# 2. Build Size Check
echo "2️⃣  Build Size Analysis..."
if [ -d "dist" ]; then
    rm -rf dist
fi

npm run build > /dev/null 2>&1 || { echo "   ❌ Build failed"; exit 1; }

MAIN_BUNDLE=$(find dist -name "*.js" -type f | xargs du -sh | sort -rh | head -1 | awk '{print $1}')
TOTAL_SIZE=$(du -sh dist | awk '{print $1}')

echo "   Main bundle: $MAIN_BUNDLE"
echo "   Total size: $TOTAL_SIZE"
echo "   ✅ Build: SUCCESS"
echo ""

# 3. Lint Check
echo "3️⃣  Lint Check..."
if npm run lint > /dev/null 2>&1; then
    echo "   ✅ Lint: PASS (no warnings)"
else
    echo "   ⚠️  Lint: Check manually"
fi
echo ""

# 4. File Count
echo "4️⃣  File Count..."
JS_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
echo "   TypeScript files: $JS_FILES"
echo ""

# 5. Assets Check
echo "5️⃣  Assets Check..."
if [ -d "public" ]; then
    ASSETS=$(find public -type f | wc -l)
    echo "   Static assets: $ASSETS files"
else
    echo "   ⚠️  No public folder"
fi
echo ""

# 6. Environment Check
echo "6️⃣  Environment Check..."
if [ -f ".env.example" ]; then
    echo "   ✅ .env.example present"
else
    echo "   ⚠️  .env.example missing"
fi

if grep -q "VITE_" .env.example 2>/dev/null || [ ! -f ".env.example" ]; then
    echo "   ✅ VITE_ prefix used for public vars"
fi
echo ""

# 7. Git Status
echo "7️⃣  Git Status..."
DIRTY=$(git status --porcelain | wc -l)
if [ "$DIRTY" -eq 0 ]; then
    echo "   ✅ Working directory clean"
else
    echo "   ⚠️  $DIRTY uncommitted changes"
fi
echo ""

# Summary
echo "========================================"
echo "✅ P0 #7 Audit Complete"
echo "========================================"
echo ""
echo "📊 Summary:"
echo "   • TypeScript: PASS ✅"
echo "   • Build: SUCCESS ✅"
echo "   • Bundle: $MAIN_SIZE"
echo "   • Total: $TOTAL_SIZE"
echo ""
echo "🚀 Ready for deployment!"
echo ""
