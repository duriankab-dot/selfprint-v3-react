# 🔄 GIT WORKFLOW — SELFPRINT

**How we commit, branch, and review code.**

**Status:** Enforced for all contributions  
**Last Updated:** 16 August 2026  
**Audience:** All developers

---

## 🌳 Branching Strategy

We use **trunk-based development** with feature branches:

### Branch Naming Conventions

**Format:** `{type}/{short-description}`

**Types:**
- `feature/` — New feature or capability
- `fix/` — Bug fix
- `refactor/` — Code refactor (no feature/behavior change)
- `docs/` — Documentation only
- `chore/` — Dependencies, config, etc.
- `test/` — Test improvements

**Examples:**
```bash
feature/twin-birth-animation
feature/12-sice-emotion-engine
fix/nova-chat-message-overflow
fix/auth-token-refresh-bug
refactor/extract-chat-logic
docs/update-architecture-guide
chore/upgrade-react-to-18.3
test/add-twin-chat-coverage
```

### Main Branch Protection

**`main` branch rules:**
- ✅ Requires at least 1 code review approval
- ✅ All CI checks must pass (tests, linting, build)
- ✅ No direct commits (always use PRs)
- ✅ PR must be squashed & merged (keeps history clean)

---

## 📝 Commit Message Standards

### Format
```
<type>: <subject>

<body>

<footer>
```

### Subject Line (50 characters max)
- Use imperative mood ("add" not "added" or "adds")
- Capitalize first letter
- No period at end
- Reference task ID if applicable

### Body (72 characters per line)
- Explain WHAT and WHY, not HOW (HOW is in the code)
- Separate from subject with blank line
- Wrap at 72 characters
- Optional but recommended for non-trivial changes

### Footer
- Reference issues: `Fixes #123` or `Closes #456`
- Reference EXECUTION_CHECKLIST: `Related to SELFPRINT_EXECUTION_CHECKLIST Week 1`

### Examples

❌ **BAD:**
```
fixed bug
```

❌ **BAD:**
```
Add twin chat message rendering optimization
- Updated useMessageHistory hook
- Modified TwinChat component
- Added memoization to prevent re-renders
```

✅ **GOOD:**
```
feat: add twin message batching for performance

Batch incoming Twin messages to prevent excessive re-renders.
This improves chat responsiveness when Twin is generating
long responses with streaming.

Implements: React.memo + useMemo
Impact: 40% reduction in render calls during typing

Fixes #142
Related to SELFPRINT_EXECUTION_CHECKLIST Week 2
```

✅ **GOOD (simple fix):**
```
fix: correct nova greeting timeout

Nova's initial greeting wasn't displaying due to race condition
in useEffect. Added proper cleanup function to prevent stale
closure.

Closes #89
```

### Commit Types

**feat:** New feature  
**fix:** Bug fix  
**refactor:** Code reorganization (no behavior change)  
**perf:** Performance improvement  
**style:** Code style (formatting, missing semicolons, etc.)  
**test:** Test additions or updates  
**docs:** Documentation changes  
**chore:** Build/config/deps, not code changes  
**ci:** CI configuration changes  

---

## 🔀 Pull Request Workflow

### 1. Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Follow CODE_DISCIPLINE.md
- Write tests as you code
- Commit frequently with clear messages
- Push regularly (backup to remote)

### 3. Before Opening PR

**Verify locally:**
```bash
# Run tests
npm run test

# Check linting
npm run lint

# Check TypeScript
npm run type-check

# Build
npm run build

# No errors? Good to go!
```

**Update main if needed:**
```bash
git fetch origin
git rebase origin/main
# (Fix any conflicts)
git push -f  # Force push is OK for feature branches
```

### 4. Open Pull Request

**Template:**
```markdown
## What does this PR do?
Brief description of the change.

## Why?
Motivation and context. What problem does this solve?

## How was this tested?
List of test scenarios:
- [ ] Unit tests pass
- [ ] Manual testing: [describe what you tested]
- [ ] Edge cases tested: [list any edge cases]

## Screenshots (if UI change)
Add before/after if visual changes.

## EXECUTION_CHECKLIST Reference
Related task: [Week X - Task Name]
Gap being filled: [Which gap from COMPLETE_GAP_MAP]

## Checklist
- [ ] Code follows CODE_DISCIPLINE.md
- [ ] Tests added/updated
- [ ] No console errors
- [ ] TypeScript strict mode passes
- [ ] No hardcoded colors (var(--exp-*) only)
- [ ] Commit messages are clear
- [ ] PR description is complete
```

### 5. Code Review

**As Author:**
- Respond to feedback respectfully
- Push new commits if changes needed
- Don't force-push (keep review history)
- Mark conversations as resolved when addressed

**As Reviewer:**
- Check CODE_DISCIPLINE.md compliance (§1–§15)
- Check CONTRIBUTING.md rules (§1–§19)
- Look for logical errors, not just style
- Run tests locally if complex
- Approve only when confident
- Use "Request Changes" if major issues
- Use "Comment" for suggestions/questions

### 6. Merge to Main

**Requirements before merge:**
- ✅ At least 1 approval
- ✅ All CI checks passing
- ✅ 0 merge conflicts
- ✅ Commit history is clean

**Merge process:**
```bash
# Squash & merge (keep main history clean)
# OR if multiple logical commits:
# Use "Create a merge commit"

# After merge, local cleanup:
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

---

## 🧪 CI/CD Pipeline

### GitHub Actions (Automated Checks)

Every PR automatically runs:

1. **Linting**
   - ESLint for code style
   - Prettier for formatting
   ```bash
   npm run lint
   ```

2. **Type Checking**
   - TypeScript compiler
   ```bash
   npm run type-check
   ```

3. **Tests**
   - Unit tests with Vitest
   - Coverage report
   ```bash
   npm run test:ci
   ```

4. **Build Verification**
   - Full production build
   - Bundle size check
   ```bash
   npm run build
   ```

**If CI fails:**
- Fix locally
- Push new commit (don't force-push main)
- CI will re-run automatically

---

## 📊 Commit History Example

```
* commit abc123 (HEAD -> main)
| Author: Developer <dev@example.com>
| Date:   Fri Aug 16 10:30:00 2026
|
|     feat: implement twin core awakening animation
|     
|     Add hologram birth animation sequence:
|     - Particle formation (0-500ms)
|     - Shape emergence (500-1000ms)
|     - Light pulsing (1000-1500ms)
|     - Full reveal with name prompt
|     
|     Closes #267
|
* commit def456
| Author: Developer <dev@example.com>
| Date:   Fri Aug 16 09:45:00 2026
|
|     fix: prevent nova chat duplicate messages
|     
|     Race condition in useNovaBehavior hook was causing messages
|     to appear twice when user submitted quickly. Added message
|     deduplication by ID.
|     
|     Fixes #254
|
* commit ghi789
  Author: Developer <dev@example.com>
  Date:   Fri Aug 16 08:20:00 2026
  
      test: add twin message history tests
      
      Coverage: 92% → 96% for TwinChat component
      
      Related to Week 2 testing goals
```

---

## 🚫 What NOT to Do

### Never do this:
```bash
# ❌ Committing to main directly
git commit -m "quick fix" && git push origin main

# ❌ Force-pushing to main
git push -f origin main

# ❌ Committing secrets
git add .env.local && git push

# ❌ Rewriting history on main
git rebase origin/main && git push -f origin main

# ❌ Committing large files (>10MB)
git add node_modules/ && git push

# ❌ Generic commit messages
git commit -m "update" && git push

# ❌ Multiple unrelated changes in one commit
# (fix + feature + docs in same commit)
```

---

## 🔍 Useful Git Commands

### View your work
```bash
# See current branch
git branch

# See commit history
git log --oneline -10

# See what changed
git diff
git diff feature/other-branch

# See unpushed commits
git log origin/main..HEAD

# See untracked files
git status
```

### Undo changes
```bash
# Unstage a file
git reset HEAD filename

# Discard changes to a file
git checkout filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Cherry-pick a specific commit
git cherry-pick abc123
```

### Update your branch
```bash
# Fetch latest from remote
git fetch origin

# Rebase on main (keep history linear)
git rebase origin/main

# Merge main (creates merge commit)
git merge origin/main
```

### Interactive rebase (clean up commits)
```bash
# Edit last 3 commits
git rebase -i HEAD~3

# Options in editor:
# pick = keep commit
# reword = change message
# squash = combine with previous
# fixup = combine, discard message
# drop = remove commit
```

---

## 📋 Code Review Checklist

**As Reviewer, check:**

- [ ] PR title matches branch name
- [ ] PR description is complete
- [ ] Commits have clear messages
- [ ] Code follows CODE_DISCIPLINE.md (§1–§15)
- [ ] Follows CONTRIBUTING.md rules (§1–§19)
- [ ] Tests added/updated
- [ ] No console.log() in components
- [ ] No hardcoded colors
- [ ] No implicit any in TypeScript
- [ ] Error handling included
- [ ] No breaking changes
- [ ] EXECUTION_CHECKLIST task referenced
- [ ] UI changes have screenshots (if applicable)
- [ ] Performance considered (no unnecessary renders)
- [ ] Accessibility considered (semantic HTML, ARIA labels)

---

## 🎯 Best Practices

### Commit Frequently
```bash
# Good: Small, logical commits
commit 1: "feat: add twin birth animation"
commit 2: "test: add birth animation tests"
commit 3: "fix: correct animation timing"

# Bad: One giant commit
commit 1: "implement entire core awakening feature"
```

### Keep Branches Short-lived
- Aim to merge within 1-2 days
- Large changes → break into smaller PRs
- Long-running branches → risk of conflicts

### Keep PR Scope Focused
```
Good PR:
- Title: "feat: add twin message deletion"
- Changes: Delete logic + tests + UI

Bad PR:
- Title: "misc updates"
- Changes: Delete feature + refactor hook + update docs + fix lint
```

### Rebase Before Merge
```bash
git fetch origin
git rebase origin/main
# Resolve conflicts if any
git push
# Then merge via GitHub UI
```

### Use Draft PRs
If you want to discuss before finishing:
```bash
# Open PR with "Draft" status in GitHub UI
# Team can review and comment
# When ready, mark as "Ready for Review"
```

---

## 🚨 Merge Conflicts

### Resolve conflicts
```bash
# After git rebase or git merge, conflicts appear
git status  # See conflicted files

# Edit files marked "<<<<<<" and ">>>>>>>"
# Keep what you want, remove conflict markers

git add filename  # Mark as resolved
git rebase --continue  # (if using rebase)
# OR
git commit  # (if using merge)
```

### Prevent conflicts
- Pull latest main frequently
- Rebase before opening PR
- Avoid modifying same files simultaneously with teammates

---

## 📞 When Stuck

**My branch is out of sync:**
```bash
git fetch origin
git rebase origin/main
```

**I committed to wrong branch:**
```bash
git reset HEAD~1  # Undo commit, keep changes
git stash         # Save changes
git checkout correct-branch
git stash pop     # Restore changes
git commit        # Recommit
```

**I need to see what was in deleted file:**
```bash
git log --all -- filename  # Find commit
git show commit:filename   # View file at that commit
```

**I need to revert a merged PR:**
```bash
git revert commit-hash  # Creates new commit that undoes changes
git push
```

---

**Last Updated:** 16 August 2026  
**Enforced Version:** CODEX v2.0  
**Questions?** See CODE_DISCIPLINE.md or CONTRIBUTING.md
