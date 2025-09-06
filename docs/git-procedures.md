# Git Procedures Guide

This guide covers the complete workflow for creating branches, adding features, and merging with main.

## 1. Creating a New Feature Branch

### Check Current Status
```bash
git status                    # Check current branch and uncommitted changes
git branch                    # List all local branches
git pull origin main          # Ensure main is up-to-date
```

### Create and Switch to New Branch
```bash
# Method 1: Create and switch in one command (recommended)
git checkout -b feature/your-feature-name

# Method 2: Create then switch separately
git branch feature/your-feature-name
git checkout feature/your-feature-name

# Verify you're on the new branch
git branch
```

### Branch Naming Convention
- `feature/feature-name` - New features (e.g., `feature/user-auth`, `feature/file-upload`)
- `fix/bug-name` - Bug fixes
- `docs/update-name` - Documentation updates
- `refactor/component-name` - Code refactoring

## 2. Working on Your Feature

### Make Changes and Commit
```bash
# Check what files changed
git status

# Stage specific files
git add filename.js
git add folder/

# Stage all changes
git add .

# Commit with best practice messages
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve CSV file validation error"
git commit -m "docs: update installation instructions"
git commit -m "refactor: extract file upload logic to separate component"
git commit -m "style: improve button hover animations"
git commit -m "test: add unit tests for upload component"

# Check commit history
git log --oneline -5
```

### Commit Message Best Practices
**Format:** `type: brief description`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `test:` - Adding or updating tests
- `chore:` - Build process, dependency updates

**Examples:**
```bash
git commit -m "feat: implement CSV file drag and drop upload"
git commit -m "fix: prevent duplicate file uploads"
git commit -m "refactor: split upload component into smaller modules"
git commit -m "docs: add API documentation for file endpoints"
```

### Push Branch to Remote
```bash
# First push (creates remote branch)
git push -u origin feature/your-feature-name

# Subsequent pushes
git push origin feature/your-feature-name
```

### Continue Development Cycle
```bash
# Make more changes, then commit and push
git add .
git commit -m "feat: add file size validation"
git push origin feature/your-feature-name
```

## 3. Merging with Main Branch

### Option A: Pull Request Method (Recommended)

**Step 1: Push Final Changes**
```bash
git add .
git commit -m "feat: complete file upload feature with validation"
git push origin feature/your-feature-name
```

**Step 2: Create Pull Request on GitHub**
1. Go to your GitHub repository
2. Click "Compare & pull request" or "New pull request"
3. Select: `feature/your-feature-name` → `main`
4. Add descriptive title and description
5. Click "Create pull request"
6. Review, test, and click "Merge pull request"

**Step 3: Clean Up Locally**
```bash
git checkout main
git pull origin main                           # Get the merged changes
git branch -d feature/your-feature-name       # Delete local branch
```

### Option B: Direct Local Merge

**Step 1: Prepare for Merge**
```bash
# Switch to main and update
git checkout main
git pull origin main

# Optional: Check what will be merged
git log --oneline main..feature/your-feature-name
```

**Step 2: Merge Feature Branch**
```bash
# Merge your feature branch
git merge feature/your-feature-name

# Push merged changes to main
git push origin main
```

**Step 3: Clean Up Branches**
```bash
# Delete local feature branch
git branch -d feature/your-feature-name

# Delete remote feature branch
git push origin -d feature/your-feature-name
```

## 4. Common Git Commands Reference

### Branch Management
```bash
git branch                           # List local branches
git branch -r                        # List remote branches
git branch -a                        # List all branches
git branch -d branch-name            # Delete local branch (safe)
git branch -D branch-name            # Force delete local branch
git push origin -d branch-name       # Delete remote branch
```

### Checking Status and History
```bash
git status                           # Check working directory status
git log --oneline -10                # Show last 10 commits
git log --graph --oneline            # Visual commit history
git diff                             # Show unstaged changes
git diff --staged                    # Show staged changes
git diff main..feature/branch        # Compare branch with main
```

### Undoing Changes
```bash
git restore filename.js              # Discard unstaged changes
git restore --staged filename.js     # Unstage file
git reset HEAD~1                     # Undo last commit (keep changes)
git reset --hard HEAD~1              # Undo last commit (discard changes)
```

### Remote Management
```bash
git remote -v                        # Show remote URLs
git pull origin main                 # Pull latest from main
git fetch origin                     # Fetch all branches without merging
```

## 5. Complete Workflow Example

```bash
# 1. Start new feature
git checkout main
git pull origin main
git checkout -b feature/user-dashboard

# 2. Work on feature
# ... make code changes ...
git add .
git commit -m "feat: add user dashboard layout"

# ... make more changes ...
git add .
git commit -m "feat: implement dashboard data fetching"

# 3. Push to remote
git push -u origin feature/user-dashboard

# ... continue development ...
git add .
git commit -m "fix: resolve dashboard loading state"
git push origin feature/user-dashboard

# 4. Create pull request on GitHub
# (follow GitHub UI steps)

# 5. After merge, clean up
git checkout main
git pull origin main
git branch -d feature/user-dashboard
```

## 6. Best Practices

### Before Starting Work
- ✅ Always pull latest main before creating new branch
- ✅ Use descriptive branch names with `feature/` prefix
- ✅ Create small, focused branches for single features

### During Development
- ✅ Commit frequently with clear, conventional messages
- ✅ Push regularly to backup your work
- ✅ Keep commits atomic (one logical change per commit)
- ✅ Use proper commit message format: `type: description`

### Before Merging
- ✅ Test your feature thoroughly
- ✅ Run code quality checks: `npm run lint`
- ✅ Ensure build works: `npm run build`
- ✅ Write descriptive pull request descriptions
- ✅ Review your own code before requesting merge

### After Merging
- ✅ Delete feature branches to keep repo clean
- ✅ Pull latest main before starting next feature
- ✅ Create new branch for next feature

## 7. Troubleshooting Common Issues

### Merge Conflicts
```bash
# When merge conflicts occur during merge/pull
git status                           # See conflicted files
# Edit files to resolve conflicts (look for <<<< ==== >>>> markers)
git add .                            # Stage resolved files
git commit                           # Complete the merge
```

### Accidentally Committed to Main
```bash
git checkout -b feature/rescue-commits    # Create new branch with commits
git checkout main
git reset --hard HEAD~X               # Reset main (X = number of commits to undo)
git checkout feature/rescue-commits    # Continue work on feature branch
```

### Need to Update Branch with Latest Main
```bash
git checkout main
git pull origin main
git checkout feature/your-branch
git merge main                       # Merge main into feature branch
# Or alternatively: git rebase main
```

### Forgot to Create Branch (Working on Main)
```bash
git stash                            # Save current changes
git checkout -b feature/new-feature  # Create proper branch
git stash pop                        # Restore changes to new branch
```

### Want to See What Changed
```bash
git diff main                        # Compare current branch with main
git log --oneline main..HEAD         # See commits not in main
git show commit-hash                 # See specific commit changes
```

---

**Remember**: 
- Use pull requests for better code review and collaboration
- Follow conventional commit message format
- Always delete branches after merging to keep repository clean
- Test thoroughly before merging to main