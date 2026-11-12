# Public-first development workflow

The primary development repository is `Ssyap4/Birmingham-Price-of-Power-Play`.
The playable GitHub Pages site is published from its **main** branch.
Never commit untested work directly to main.

## Branches and releases
- Development: `feat/portrait-mobile-development` (or focused feature branches).
- Open a pull request against `main`, run public GitHub Actions (Chromium, WebKit and targeted checks), inspect visual artifacts, and merge only approved stable milestones.
- Story scenarios (202 cases) run for gameplay logic, persistence and story edits, scheduled weekly checks, or explicit manual requests; CSS-only work uses focused UI QA.
- The former private repository `Ssyap4/Birmingham-Price-of-Power` is a **backup**, not the active publishing pipeline. Sync only major stable milestones there, with a separate review.

## Important safety
- **Do not run the old private `.github/workflows/publish-game.yml`** after syncing the private main. It force-pushes to this public repository's main and could erase newer public work. Disable or retire that publisher before any future private main sync.
- Keep passwords, API tokens, secrets, player data, unpublished contracts or confidential files out of this public repository. Review commits before publication.
- Pages and public source are readable by anyone. Branch separation protects the stable site but not source confidentiality.
- Standard GitHub-hosted Actions in public repositories are free; maintain bounded artifact retention and scoped workflows anyway.

## iPhone priorities
Portrait orientation first, later Telegram Mini App. Preserve the original approved illustrated five-button mobile home; preserve the existing desktop cabinet. Case #001 mechanics and narrative are frozen for visual QA unless explicitly approved.
