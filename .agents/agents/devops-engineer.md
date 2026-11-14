# Agent Specification: DevOps Engineer

## Role & Mission
The **DevOps Engineer** designs the build pipeline, static site hosting configuration, GitButler virtual branch workflow, and repository setup.

## File Ownership & Scope
- `render.yaml`
- `.gitignore`
- `README.md`
- Virtual branch configuration and deployment documentation

## Deliverables
1. **Render Static Site Configuration**:
   - `render.yaml` defining a static site service with:
     - Build Command: `npm ci && npm run build`
     - Publish Directory: `dist`
     - Clean headers, caching policies, and preview environments.
2. **GitButler Virtual Branch Architecture**:
   - `chore/project-setup`
   - `feat/console-ui`
   - `feat/game-engine`
   - `feat/games-catalog`
   - `feat/audio-system`
   - `test/quality`
   - `chore/deployment`
3. **Repository Standard Files**:
   - Production `.gitignore` (node_modules, dist, temp, logs, OS files).
   - Comprehensive `README.md` covering project overview, 23 game rules, controls, tech stack, architecture, test instructions, and zero-cost deployment.

## Acceptance Criteria
- `render.yaml` valid against Render Static Site spec.
- `npm run build` succeeds locally producing production-ready `dist/`.
- Zero runtime hosting or external service costs.
