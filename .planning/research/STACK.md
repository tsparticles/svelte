# Stack Research

**Domain:** Svelte wrapper library for a browser rendering engine (tsParticles) with demo apps
**Researched:** 2026-04-10
**Confidence:** MEDIUM-HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 22.12+ LTS (or 24.x) | Runtime for tooling, CI, local dev | Vite 8 and modern Svelte tooling require modern Node; Node 22+ avoids edge-case engine mismatches (HIGH) |
| Svelte | 5.55.x | Component runtime/compiler for wrapper + demos | Svelte 5 is the current mainstream baseline; staying on Svelte 4 increases migration debt and slows ecosystem compatibility (HIGH) |
| SvelteKit | 2.57.x | Demo app framework + package scaffolding compatibility | Official Svelte app framework, actively maintained, first-class packaging/testing guidance for libraries (HIGH) |
| Vite | 8.0.x | Dev/build pipeline for demos and test integration | Current Vite baseline; best DX/perf for Svelte and aligned with Vitest 4 + plugin ecosystem (HIGH) |
| @sveltejs/vite-plugin-svelte | 7.0.x | Svelte compiler integration in Vite | Official plugin for Svelte 5 + Vite 8; this is the canonical integration path now (HIGH) |
| TypeScript | 5.9.x (safe default) or 6.0.x (early adoption) | Public API typing and internal safety | TS 6 is available and supported by SvelteKit peer range, but TS 5.9 is lower-risk for broader downstream tool compatibility today (MEDIUM) |
| @tsparticles/engine | 3.9.1 (stable) | Underlying rendering engine peer/runtime | Latest stable on npm is 3.9.1; do not pin wrapper to beta engine builds for production releases (HIGH) |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sveltejs/package | 2.5.x | Build/package `src/lib` for npm | Always for Svelte component libraries; this is the official packaging path (HIGH) |
| publint | 0.3.x | Package export/entry validation | Always in CI pre-publish to catch broken exports/conditions quickly (HIGH) |
| svelte-check | 4.x (or latest compatible) | Svelte + TS static validation | Always in CI for wrapper + demos; catches typing/runtime integration mistakes early (MEDIUM) |
| vitest | 4.1.x | Unit/integration tests | Default test runner for Vite/Svelte projects; fast and standard in this stack (HIGH) |
| @testing-library/svelte | 5.3.x | Component behavior tests | Use for public wrapper component API tests (props/events/SSR guards), not pixel rendering assertions (HIGH) |
| @playwright/test | 1.59.x | E2E tests for demo apps | Use for smoke/regression of demo behavior in real browsers (SSR-safe load, init lifecycle) (HIGH) |
| eslint + eslint-plugin-svelte | eslint 10.x + plugin 3.17.x | Linting JS/TS/Svelte files | Use flat-config migration path and keep rules minimal but strict on correctness (MEDIUM) |
| prettier + prettier-plugin-svelte | prettier 3.8.x | Formatting | Always; reduces PR noise in multi-package repos (HIGH) |
| @changesets/cli | 2.30.x | Versioning/changelog/publish flow | Use for coordinated versioning and release notes in workspace packages (MEDIUM) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm workspaces (10.x) | Monorepo dependency management | Keep one lockfile and use `workspace:` protocol explicitly for local links (HIGH) |
| GitHub Actions | CI for lint/check/test/build/publish | Add matrix for Node 22 + 24; publish only after package + tests + publint pass (MEDIUM) |
| Nx **or** pnpm recursive scripts (pick one orchestrator) | Task orchestration/caching | Reduce tool overlap: keep Nx if cache value is real; otherwise remove Nx/Lerna complexity (LOW-MEDIUM) |

## Installation

```bash
# Core (library + demos)
pnpm add svelte@^5.55.0 @sveltejs/kit@^2.57.0 vite@^8.0.0 @sveltejs/vite-plugin-svelte@^7.0.0 @tsparticles/engine@^3.9.1

# Supporting (runtime/lib tooling)
pnpm add -D @sveltejs/package@^2.5.7 publint@^0.3.18 svelte-check vitest@^4.1.4 @testing-library/svelte@^5.3.1 @playwright/test@^1.59.1

# Lint/format/release
pnpm add -D eslint@^10.2.0 eslint-plugin-svelte@^3.17.0 prettier@^3.8.2 prettier-plugin-svelte @changesets/cli@^2.30.0
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Svelte 5 + plugin-svelte 7 | Stay on Svelte 4 + plugin-svelte 3 | Only for short-term hotfix branch support; not for active evolution work |
| Vite 8 | Vite 6/7 | Use only if you are blocked by specific plugin incompatibility in CI |
| Vitest + Testing Library + Playwright | Vitest only | Acceptable for very small wrappers, but weak for demo app regression coverage |
| @changesets/cli | Manual npm versioning/changelog | Only if releases are infrequent and single-package; otherwise error-prone |
| Single SvelteKit demo app (+ optional docs site) | Keep legacy Rollup Svelte demo | Only temporarily while migrating; long-term maintenance cost is not worth it |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@tsparticles/engine` beta as wrapper baseline | Beta dependency in wrapper increases consumer risk and churn | Stable `@tsparticles/engine@^3.9.1` until v4 is GA |
| Dual demo stacks (Vite + legacy Rollup) | Duplicate maintenance surface for no product value | Standardize demos on SvelteKit/Vite |
| Lerna + Nx + pnpm overlap without clear ownership | Tooling redundancy makes releases and CI harder to reason about | Keep pnpm + Changesets, add Nx only if cache/distribution is demonstrably valuable |
| SvelteKit-only imports inside published library internals (`$app/*`) | Makes package less portable and harder to test outside Kit | Prefer runtime-agnostic imports (e.g., `esm-env`) and explicit props |

## Stack Patterns by Variant

**If your priority is package stability for broad consumers:**
- Use Svelte 5 + Kit 2 + Vite 8 + TS 5.9 + stable tsParticles engine
- Because this minimizes ecosystem mismatch while keeping modern tooling

**If your priority is fastest internal iteration and early adoption:**
- Use TS 6.0 and latest patch lines across Svelte/Kit/Vite
- Because SvelteKit peers already allow TS 6; validate via CI matrix before release

**If you must support a temporary legacy branch:**
- Keep Svelte 4 branch in maintenance mode only (security/critical fixes)
- Because active feature development on both Svelte 4 and 5 doubles cost quickly

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@sveltejs/vite-plugin-svelte@7` | `svelte@^5.46.4`, `vite@^8` | Hard compatibility gate; requires modern Node engines |
| `@sveltejs/kit@2.57` | `svelte@^4 || ^5`, `vite@^5 || ^6 || ^7 || ^8`, `typescript@^5.3.3 || ^6` | Broad peer range enables staged migration |
| `vitest@4.1` | `vite@^6 || ^7 || ^8`, Node >=20 | Works best when aligned with current Vite major |
| `@tsparticles/engine@3.9.1` | wrapper peer range should include `^3.9.1` | Avoid beta-only peer ranges in published wrapper |

## Sources

- https://registry.npmjs.org/svelte/latest — current Svelte version and engine requirements (HIGH)
- https://registry.npmjs.org/@sveltejs/kit/latest — Kit version + peer dependency matrix (HIGH)
- https://registry.npmjs.org/@sveltejs/vite-plugin-svelte/latest — plugin v7 requirements (HIGH)
- https://registry.npmjs.org/vite/latest — Vite 8 baseline and Node engines (HIGH)
- https://registry.npmjs.org/typescript/latest — TS 6 availability (HIGH)
- https://registry.npmjs.org/@tsparticles/engine/latest — stable tsParticles engine version (HIGH)
- https://svelte.dev/docs/kit/packaging — official Svelte package guidance (`@sveltejs/package`, exports, sideEffects) (HIGH)
- https://svelte.dev/docs/svelte/testing — official Svelte testing recommendations (Vitest/Playwright/Testing Library) (HIGH)
- https://vitest.dev/guide/ — Vitest runtime requirements and usage (HIGH)
- https://playwright.dev/docs/intro — Playwright install/system requirements (HIGH)
- https://pnpm.io/workspaces — workspace protocol + monorepo workflow guidance (HIGH)

---
*Stack research for: Svelte wrapper library maintenance/evolution (subsequent milestone)*
*Researched: 2026-04-10*
