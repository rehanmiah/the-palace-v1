
# GitHub Synchronization Guide

This guide will help you synchronize your React Native + Expo app with GitHub.

## Prerequisites

- Git installed on your machine
- A GitHub account
- GitHub CLI (optional but recommended)

## Initial Setup

### 1. Initialize Git Repository (if not already done)

```bash
git init
```

### 2. Configure Git (if not already done)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Add All Files to Git

```bash
git add .
```

### 4. Create Initial Commit

```bash
git commit -m "Initial commit: The Palace - Indian Restaurant Delivery App"
```

## Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if you haven't already
# macOS: brew install gh
# Windows: winget install --id GitHub.cli
# Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Login to GitHub
gh auth login

# Create a new repository
gh repo create the-palace-app --private --source=. --remote=origin --push
```

### Option B: Using GitHub Website

1. Go to https://github.com/new
2. Create a new repository named "the-palace-app" (or your preferred name)
3. Choose Private or Public
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### 5. Link Your Local Repository to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/the-palace-app.git

# Or use SSH (recommended for security)
git remote add origin git@github.com:YOUR_USERNAME/the-palace-app.git
```

### 6. Push Your Code to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

## Environment Variables Setup

⚠️ **IMPORTANT**: Never commit sensitive information to GitHub!

Your Supabase credentials should be stored in environment variables. Create a `.env` file locally (already in .gitignore):

```bash
# Create .env file
touch .env
```

Add your Supabase credentials to `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### For Team Members

Share environment variables securely:
- Use a password manager (1Password, LastPass, etc.)
- Use GitHub Secrets for CI/CD
- Use a secure note-sharing service
- **NEVER** commit the `.env` file to GitHub

## Daily Workflow

### Check Status

```bash
git status
```

### Stage Changes

```bash
# Stage all changes
git add .

# Or stage specific files
git add path/to/file.tsx
```

### Commit Changes

```bash
git commit -m "Add: Description of what you added"
git commit -m "Fix: Description of what you fixed"
git commit -m "Update: Description of what you updated"
```

### Push to GitHub

```bash
git push
```

### Pull Latest Changes

```bash
git pull
```

## Branching Strategy

### Create a New Branch

```bash
# Create and switch to a new branch
git checkout -b feature/new-feature-name

# Or
git checkout -b fix/bug-description
```

### Switch Between Branches

```bash
git checkout main
git checkout feature/new-feature-name
```

### Merge Branch to Main

```bash
# Switch to main
git checkout main

# Merge your feature branch
git merge feature/new-feature-name

# Push to GitHub
git push
```

### Delete Branch

```bash
# Delete local branch
git branch -d feature/new-feature-name

# Delete remote branch
git push origin --delete feature/new-feature-name
```

## Useful Git Commands

### View Commit History

```bash
git log
git log --oneline
git log --graph --oneline --all
```

### Undo Changes

```bash
# Discard changes in working directory
git checkout -- path/to/file.tsx

# Unstage files
git reset HEAD path/to/file.tsx

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### View Differences

```bash
# See unstaged changes
git diff

# See staged changes
git diff --staged
```

## GitHub Actions (CI/CD)

You can set up automated builds and tests using GitHub Actions. Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run linter
      run: npm run lint
      
    - name: Type check
      run: npx tsc --noEmit
```

## Collaboration Tips

### Pull Requests

1. Create a feature branch
2. Make your changes
3. Push to GitHub
4. Create a Pull Request on GitHub
5. Request review from team members
6. Merge after approval

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] No sensitive data committed
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] No console.errors in production code

## Troubleshooting

### Authentication Issues

```bash
# Use GitHub CLI for easier authentication
gh auth login

# Or set up SSH keys
ssh-keygen -t ed25519 -C "your.email@example.com"
# Add the key to GitHub: Settings > SSH and GPG keys
```

### Merge Conflicts

```bash
# Pull latest changes
git pull

# Resolve conflicts in your editor
# Look for <<<<<<< HEAD markers

# After resolving
git add .
git commit -m "Resolve merge conflicts"
git push
```

### Large Files

If you accidentally committed large files:

```bash
# Remove from Git but keep locally
git rm --cached path/to/large/file

# Add to .gitignore
echo "path/to/large/file" >> .gitignore

# Commit
git commit -m "Remove large file from Git"
git push
```

## Best Practices

1. **Commit Often**: Make small, focused commits
2. **Write Clear Messages**: Use descriptive commit messages
3. **Pull Before Push**: Always pull latest changes before pushing
4. **Use Branches**: Create branches for new features
5. **Review Code**: Use pull requests for code review
6. **Protect Main**: Set up branch protection rules on GitHub
7. **Document Changes**: Update documentation with code changes
8. **Test Before Commit**: Ensure code works before committing

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [GitHub CLI](https://cli.github.com/)
- [Expo GitHub Integration](https://docs.expo.dev/guides/using-github/)

## Quick Reference

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/the-palace-app.git

# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# Push
git push

# Pull
git pull

# Create branch
git checkout -b branch-name

# Switch branch
git checkout branch-name

# Merge branch
git merge branch-name

# View history
git log --oneline
```

---

**Need Help?** Check the [Git documentation](https://git-scm.com/doc) or run `git help <command>` for detailed information about any Git command.
