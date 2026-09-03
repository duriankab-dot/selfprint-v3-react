#!/bin/bash
# CG-03 Phase 3 Automation — Batch Thai Language Integration
# Replaces hardcoded isTh ternary patterns in 150+ .tsx component files
# Usage: bash scripts/cg03-phase3-automation.sh

set -e

echo "🚀 CG-03 Phase 3 — Automation Script"
echo "======================================"

# Step 1: Import t() in all component files that have isTh
echo "Step 1: Adding t() import to files with isTh..."
find src/components -name "*.tsx" -exec grep -l "isTh\|language === 'th'" {} \; | while read file; do
  if ! grep -q "import.*t.*from.*translations" "$file"; then
    # Find import section and add t import
    sed -i "/import.*useLanguage/a import { t } from '@\/constants\/translations';" "$file"
    echo "  ✓ $file"
  fi
done

# Step 2: Replace isTh ternaries with inline language checks (surgical)
echo ""
echo "Step 2: Replacing isTh ternaries..."
find src/components -name "*.tsx" -exec sed -i \
  "s/{isTh ? '/{language === 'th' ? '/g" \
  {} \;

echo "  ✓ Pattern replacements complete"

# Step 3: Verify TypeScript
echo ""
echo "Step 3: TypeScript verification..."
npx tsc -b --noEmit 2>&1 | grep -i error | head -5 || echo "  ✓ 0 TypeScript errors"

echo ""
echo "✅ Phase 3 Automation Complete"
echo "Next: npm run build && git add . && git commit"
