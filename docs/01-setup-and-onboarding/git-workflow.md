# Git Workflow & Command Guide

This document outlines the standard branching rules for the Aditya University Intranet Portal and provides a comprehensive guide to the Git commands you will use daily.

## 🌿 Branching Strategy

Our repository follows a strict branching model to ensure `main` is always stable and deployable.

1. **`main`**: The production-ready branch. **Never commit directly to `main`.**
2. **`intranet-v3`** (or `dev`): The active development branch where features are integrated before release.
3. **Feature Branches**: Created off of `intranet-v3` for specific tasks. Naming convention: `feat/feature-name` or `fix/bug-name`.

## 🛠️ Essential Git Commands

Here is a breakdown of all the possible commands you need, what they do, and how they work behind the scenes.

### 1. `git clone`
**What it does:** Downloads a complete copy of a remote repository (like GitHub) onto your local machine.
**How it works:** It pulls down the entire commit history, all branches, and sets up a connection (called `origin`) back to the remote server.
```bash
git clone https://github.com/ganesh714/aus_intranet.git
```

### 2. `git status`
**What it does:** Shows the current state of your working directory and staging area.
**How it works:** It tells you which branch you are on, which files are modified, which files are staged for commit, and if you are ahead or behind the remote branch. *Run this constantly to avoid mistakes.*
```bash
git status
```

### 3. `git branch` & `git checkout`
**What it does:** Manages and switches between different timelines (branches) of the codebase.
**How it works:** `git branch` lists your local branches. `git checkout` switches your working directory to match the state of that specific branch.
```bash
# List all local branches
git branch

# Create a new branch AND switch to it immediately
git checkout -b feat/my-new-component

# Switch back to an existing branch
git checkout intranet-v3
```

### 4. `git fetch`
**What it does:** Downloads the latest history and branches from the remote repository WITHOUT changing your actual files.
**How it works:** It updates your local Git's "knowledge" of what is on GitHub (updating `origin/main`, `origin/intranet-v3`), allowing you to compare before you merge.
```bash
git fetch origin
```

### 5. `git pull`
**What it does:** Downloads the latest changes from the remote repository AND immediately merges them into your current working files.
**How it works:** It is literally the equivalent of running `git fetch` followed by `git merge`. Use this to sync your local branch with what your teammates have pushed.
```bash
git pull origin intranet-v3
```

### 6. `git add`
**What it does:** Moves changes from your working directory into the "Staging Area".
**How it works:** Git doesn't automatically track every keystroke. You must explicitly tell Git which modified files you want to include in the next snapshot.
```bash
# Stage a specific file
git add login/src/App.jsx

# Stage ALL changed files in the directory (Use with caution)
git add .
```

### 7. `git commit`
**What it does:** Takes a snapshot of everything in the Staging Area and saves it permanently to your local repository history.
**How it works:** It packages your added changes along with a message, your username, and a timestamp, assigning it a unique SHA hash.
```bash
git commit -m "feat(frontend): added the new Annoucement card component"
```

### 8. `git push`
**What it does:** Uploads your local commits to the remote repository (GitHub).
**How it works:** It sends your local branch history up to the `origin` server so other developers can pull it or review it via a Pull Request.
```bash
# Push your current branch to the remote server
git push origin <your-branch-name>

# Example:
git push origin feat/my-new-component
```

---

## 🔄 Standard Lifecycle Example

Here is what a normal day of development looks like:

1. **Sync up:** `git checkout intranet-v3` -> `git pull origin intranet-v3`
2. **Start work:** `git checkout -b feat/add-dark-mode`
3. **Write code...**
4. **Check status:** `git status`
5. **Stage changes:** `git add login/src/index.css`
6. **Save changes:** `git commit -m "feat: implement dark mode variables"`
7. **Share work:** `git push origin feat/add-dark-mode`
8. **Go to GitHub and create a Pull Request.**
