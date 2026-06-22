# Deploying to GitHub — Step by Step

The contest checklist specifically asks for "a well-organized GitHub
repository," not a zip file. This takes about 10 minutes.

## 1. Create the repository on GitHub

Go to github.com → click the "+" icon top-right → "New repository".
- Name: `contextrank` (or whatever you prefer)
- Visibility: Public (so judges can access it without needing an invite)
- Do NOT initialize with a README, .gitignore, or license — we already have those locally
- Click "Create repository"

GitHub will show you a page with a URL like:
```
https://github.com/YOUR_USERNAME/contextrank.git
```
Copy that URL.

## 2. Initialize git locally (run from the contextrank folder root)

```bash
cd contextrank
git init
git add .
git status
```

Check the `git status` output — confirm `node_modules/`, `__pycache__/`, and
`.env` are NOT listed (the included `.gitignore` should already exclude
them). If you see them, something's wrong with `.gitignore` — stop and
check before committing.

## 3. Make clean, logical commits (not one giant dump)

A judge skimming your commit history forms an impression in seconds.
Several small, well-labeled commits read as "this person built this
carefully" — one commit called "added files" reads as a last-minute zip
upload. Suggested structure:

```bash
git add backend/ scripts/generate_dataset.py scripts/export_ranked.py
git commit -m "Add core ranking engine: CapabilityDNA, requirement decoder, semantic embeddings"

git add backend/core/semantic_engine.py
git commit -m "Add real sentence-transformer embeddings for semantic skill matching"

git add scripts/dataset_adapter.py
git commit -m "Add dataset adapter to map external schemas onto the engine's candidate format"

git add frontend/
git commit -m "Add React dashboard: ranked results, hidden gems, compare, stats"

git add frontend/src/components/LiveRankAnimation.jsx frontend/src/components/CustomJDPanel.jsx frontend/src/components/SystemStatusBadge.jsx
git commit -m "Add live ranking animation, custom JD input, and embedding-mode transparency badge"

git add data/processed/
git commit -m "Add ranked output CSVs for all job descriptions"

git add README.md docs/ setup.sh setup.bat .gitignore
git commit -m "Add documentation, setup scripts, and demo script"
```

If you've already run `git add .` from step 2, just do one commit instead —
that's fine too, logical history is a nice-to-have, not a blocker:
```bash
git commit -m "Initial commit: ContextRank — intelligent candidate discovery engine"
```

## 4. Connect and push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/contextrank.git
git push -u origin main
```

If prompted for credentials and you haven't set up a personal access token,
GitHub will show you a link to create one — follow it, generate a token
with "repo" scope, and use that as your password when prompted.

## 5. Verify it looks right

Open `https://github.com/YOUR_USERNAME/contextrank` in your browser. Check:
- The README renders properly on the repo's main page (GitHub auto-displays it)
- `data/processed/*.csv` files are visible and openable
- `node_modules/` is NOT in the file tree (confirms .gitignore worked)
- The commit history (small "X commits" link near the top) shows multiple commits, not one

## 6. Add the link to your submission

Use the exact URL `https://github.com/YOUR_USERNAME/contextrank` as your
submission's "Code" link.

## If something goes wrong

**"fatal: not a git repository"** — you're not in the contextrank folder. `cd` into it first.

**node_modules accidentally got committed** — run:
```bash
git rm -r --cached frontend/node_modules
git commit -m "Remove node_modules from tracking"
git push
```

**Push rejected / asks to pull first** — only happens if the GitHub repo
already has commits (e.g. you accidentally initialized with a README).
Run `git pull origin main --allow-unrelated-histories`, resolve any
conflict, then push again.
