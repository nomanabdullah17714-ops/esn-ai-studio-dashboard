# Codex Multi-Device Master Setup (Living Navigation)

This guide lets you run the **same project** from **two devices** with a single Git remote and consistent automations.

## 1) Core model (what to sync)

- **Source of truth:** your Git remote (GitHub/GitLab/Bitbucket).
- **Identity consistency:** use the same Git identity (`user.name`, `user.email`) on both devices.
- **Environment consistency:** keep Node/Python/tool versions pinned and share `.env.example`.
- **Automation consistency:** commit scripts/workflows so both devices run identical commands.

> Important: Codex itself does not maintain a magical "same live session ID" across devices. The practical equivalent is a shared repo + same account + synchronized branch/workflow.

## 2) One-time prep on Device A (current machine)

### 2.1 Verify repo and remote

```bash
git rev-parse --is-inside-work-tree
git remote -v
```

If no remote:

```bash
git remote add origin <YOUR_REMOTE_URL>
```

### 2.2 Standardize Git identity

```bash
git config --global user.name "<Your Name>"
git config --global user.email "<you@example.com>"
```

### 2.3 Add a bootstrap script for reproducible setup

Create `scripts/bootstrap.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# 1) Install deps (choose your stack)
if [ -f package-lock.json ]; then
  npm ci
elif [ -f yarn.lock ]; then
  yarn install --frozen-lockfile
elif [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
fi

# 2) Local env template
if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example (edit secrets manually)."
fi

# 3) Optional local hooks (if husky exists)
if [ -f .husky/pre-commit ]; then
  chmod +x .husky/pre-commit || true
fi

echo "Bootstrap complete."
```

Then:

```bash
chmod +x scripts/bootstrap.sh
```

### 2.4 Add automation entrypoints

In `package.json`, keep standard scripts like:

- `dev`
- `build`
- `test`
- `lint`
- `format`

So both devices run the same commands.

## 3) One-time prep on Device B (other machine)

### 3.1 Install required base tools

Install:
- Git
- Node/npm (or your project runtime)
- Codex CLI / Codex environment you use

### 3.2 Clone and bootstrap

```bash
git clone <YOUR_REMOTE_URL>
cd <PROJECT_FOLDER>
./scripts/bootstrap.sh
```

### 3.3 Match Git identity

```bash
git config --global user.name "<Your Name>"
git config --global user.email "<you@example.com>"
```

## 4) Daily dual-device workflow (safe and fast)

Use this loop on **both devices** before coding:

```bash
git checkout main
git pull --rebase origin main
```

For each task:

```bash
git checkout -b feat/<short-task-name>
# code changes
npm test || true
npm run lint || true
git add -A
git commit -m "feat: <what changed>"
git push -u origin feat/<short-task-name>
```

Open PR, merge, then on other device:

```bash
git checkout main
git pull --rebase origin main
```

## 5) Keep automations identical on both devices

Commit these to repo (if not already):

- `scripts/bootstrap.sh`
- CI workflow files (e.g., `.github/workflows/*.yml`)
- lint/format configs
- test configs
- lockfile (`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`)

Never commit secrets; keep `.env` ignored and maintain `.env.example`.

## 6) “Living navigation” map

Use this as your master map:

1. **Start Here:** pull latest (`git pull --rebase`).
2. **Sync Check:** `git status` must be clean.
3. **Bootstrap:** `./scripts/bootstrap.sh` after dependency/config changes.
4. **Develop:** run `dev`, `test`, `lint` scripts.
5. **Ship:** commit → push → PR → merge.
6. **Mirror Device:** pull on second device immediately after merge.
7. **Recovery:** if divergence, stash/reset/rebase intentionally (never random force-push).

## 7) Fast recovery playbook

### If Device B is behind

```bash
git fetch origin
git checkout main
git pull --rebase origin main
```

### If you accidentally edited same file on both devices

```bash
git fetch origin
git rebase origin/main
# resolve conflicts
```

### If local state is messy but you only need remote truth

```bash
git fetch origin
git reset --hard origin/main
```

## 8) Optional: real-time coordination discipline

For near-simultaneous work:

- Reserve file ownership per task (who edits what).
- Keep branches short-lived.
- Merge small PRs frequently.
- Pull/rebase before every new coding block.

---

If you want, extend this file with your exact stack commands (Node/Python/Docker) so it becomes your permanent operating manual.
