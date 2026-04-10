# Technology Stack

**Analysis Date:** 2026-04-10

## Languages

**Primary:**
- TypeScript 5.4.x - Core library source and demo app logic in `components/svelte/src/lib/*.ts`, `apps/svelte/src/main.ts`, `apps/svelte-kit/src/routes/+page.ts`, with compiler versions pinned in `components/svelte/package.json`, `apps/svelte/package.json`, and `apps/svelte-kit/package.json`.
- Svelte (component syntax) 4.x - UI/component implementation in `components/svelte/src/lib/Particles.svelte`, `apps/svelte/src/App.svelte`, and `apps/svelte-kit/src/routes/+page.svelte`.

**Secondary:**
- JavaScript (ESM/CommonJS config scripts) - Tooling and build configuration in `components/svelte/svelte.config.js`, `apps/svelte-kit/svelte.config.js`, and `apps/svelte/rollup.config.mjs`.
- YAML - Workspace/dependency and CI configuration in `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and `.github/workflows/nodejs.yml`.

## Runtime

**Environment:**
- Node.js 20 (CI baseline) configured in `.github/workflows/nodejs.yml`.

**Package Manager:**
- pnpm (workspace manager) declared as `pnpm@10.33.0` in root `package.json`.
- CI installs pnpm 9 in `.github/workflows/nodejs.yml`; keep local and CI versions aligned before changing lockfile-sensitive tooling.
- Lockfile: present (`pnpm-lock.yaml`, lockfileVersion `9.0`).

## Frameworks

**Core:**
- Svelte 4 (`svelte`) - Component runtime for package and demos (`components/svelte/package.json`, `apps/svelte/package.json`, `apps/svelte-kit/package.json`).
- SvelteKit 2 (`@sveltejs/kit`) - Library packaging/dev shell and SvelteKit demo app (`components/svelte/svelte.config.js`, `apps/svelte-kit/svelte.config.js`).
- tsParticles engine (`@tsparticles/engine`) - Rendering/particle engine consumed by the Svelte wrapper (`components/svelte/src/lib/index.ts`, `components/svelte/src/lib/Particles.svelte`).

**Testing:**
- Not detected (no Jest/Vitest/Playwright config files found in repository root/workspace packages).
- Type/lint quality gates are used instead via `svelte-check`, `eslint`, and `prettier` scripts in `components/svelte/package.json` and `apps/svelte-kit/package.json`.

**Build/Dev:**
- Vite 5 - Dev/build for `components/svelte` and `apps/svelte-kit` (`components/svelte/vite.config.ts`, `apps/svelte-kit/vite.config.ts`).
- Rollup 4 - Dev/build pipeline for legacy Svelte demo app (`apps/svelte/rollup.config.mjs`).
- Lerna 8 - Monorepo orchestration (`package.json` scripts and `lerna.json`).
- Nx 20 - Task caching/orchestration defaults (`nx.json`, root `package.json`).
- Svelte package tooling - Library packaging via `svelte-package` + `publint` in `components/svelte/package.json`.

## Key Dependencies

**Critical:**
- `@tsparticles/engine` - Core runtime used to initialize and load particle containers in `components/svelte/src/lib/index.ts` and `components/svelte/src/lib/Particles.svelte`.
- `@tsparticles/svelte` (workspace package) - Published wrapper package and cross-package dependency used by demos (`components/svelte/package.json`, `apps/svelte/package.json`, `apps/svelte-kit/package.json`).
- `tsparticles` - Full feature bundle loaded in demos (`apps/svelte/src/App.svelte`, `apps/svelte-kit/src/routes/+page.svelte`).

**Infrastructure:**
- `@sveltejs/adapter-auto` - Default deployment adapter in `components/svelte/svelte.config.js` and `apps/svelte-kit/svelte.config.js`.
- `@sveltejs/vite-plugin-svelte` - Svelte/Vite integration in `components/svelte/vite.config.ts` and `apps/svelte-kit/vite.config.ts`.
- `eslint`, `@typescript-eslint/*`, `prettier`, `prettier-plugin-svelte` - Code quality and formatting setup in `components/svelte/package.json` and `apps/svelte-kit/package.json`.

## Configuration

**Environment:**
- No `.env` files detected in repository root/workspaces during scan.
- Build mode in `apps/svelte/rollup.config.mjs` depends on `process.env.ROLLUP_WATCH`.
- CI optional cloud execution token is referenced as commented configuration (`NX_CLOUD_ACCESS_TOKEN`) in `.github/workflows/nodejs.yml`.

**Build:**
- Root orchestration: `package.json`, `lerna.json`, `nx.json`, `pnpm-workspace.yaml`.
- Library package build: `components/svelte/vite.config.ts`, `components/svelte/svelte.config.js`, `components/svelte/tsconfig.json`.
- SvelteKit app build: `apps/svelte-kit/vite.config.ts`, `apps/svelte-kit/svelte.config.js`, `apps/svelte-kit/tsconfig.json`.
- Svelte Rollup app build: `apps/svelte/rollup.config.mjs`, `apps/svelte/tsconfig.json`.

## Platform Requirements

**Development:**
- Node.js + pnpm workspace tooling required (`package.json`, `pnpm-workspace.yaml`).
- Svelte/SvelteKit-compatible toolchain required for package/app builds (`components/svelte/package.json`, `apps/svelte-kit/package.json`).

**Production:**
- Package distribution target is npm (public) via `publishConfig.access` in `components/svelte/package.json`.
- SvelteKit demo routes are configured for prerendered static output in `apps/svelte-kit/src/routes/+page.ts` and `apps/svelte-kit/src/routes/about/+page.ts`.

---

*Stack analysis: 2026-04-10*
