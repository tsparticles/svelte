# Architecture

**Analysis Date:** 2026-04-10

## Pattern Overview

**Overall:** Monorepo with one reusable UI library package and two demo applications.

**Key Characteristics:**
- Workspace-level orchestration with `pnpm` workspaces, `lerna`, and `nx` defined in `package.json`, `pnpm-workspace.yaml`, `lerna.json`, and `nx.json`.
- Core behavior centralized in the library package at `components/svelte/src/lib/*`, while app packages consume it via workspace dependency `@tsparticles/svelte` in `apps/svelte/package.json` and `apps/svelte-kit/package.json`.
- SSR-aware client-only integration pattern for particles in SvelteKit using dynamic import in `apps/svelte-kit/src/routes/+page.svelte` and `ssr.noExternal` in `apps/svelte-kit/vite.config.ts`.

## Layers

**Workspace Orchestration Layer:**
- Purpose: Coordinates package builds, versioning, and workspace boundaries.
- Location: `package.json`, `pnpm-workspace.yaml`, `lerna.json`, `nx.json`.
- Contains: Workspace definitions, build scripts, cache settings.
- Depends on: `pnpm`, `lerna`, `nx`.
- Used by: `apps/svelte`, `apps/svelte-kit`, `components/svelte`.

**Library Runtime Layer (`@tsparticles/svelte`):**
- Purpose: Exposes public component API and engine initialization workflow.
- Location: `components/svelte/src/lib/`.
- Contains: `Particles.svelte`, `index.ts`, `utils.ts`, `particlesStore.ts`.
- Depends on: `@tsparticles/engine`, `svelte` lifecycle/store APIs.
- Used by: `apps/svelte/src/App.svelte`, `apps/svelte-kit/src/routes/+page.svelte`, external consumers via published package.

**Application Composition Layer (Demo Apps):**
- Purpose: Demonstrates and validates integration patterns in plain Svelte and SvelteKit.
- Location: `apps/svelte/src/*`, `apps/svelte-kit/src/routes/*`.
- Contains: App root components, route components, page-level config (`+page.ts`).
- Depends on: `@tsparticles/svelte`, app framework runtime.
- Used by: Local dev/preview and CI build flow in `.github/workflows/nodejs.yml`.

**Build/Packaging Layer:**
- Purpose: Produces runnable demo bundles and publishable library artifacts.
- Location: `apps/svelte/rollup.config.mjs`, `apps/svelte-kit/vite.config.ts`, `components/svelte/vite.config.ts`, `components/svelte/package.json` scripts.
- Contains: Rollup/Vite configs, SvelteKit packaging command (`svelte-package`).
- Depends on: `rollup` for `apps/svelte`, Vite/SvelteKit for `apps/svelte-kit` and `components/svelte`.
- Used by: Workspace build scripts (`lerna run build`, `lerna run build:ci`).

## Data Flow

**Particles Initialization and Render Flow:**

1. Consumer calls `particlesInit(...)` from `components/svelte/src/lib/index.ts` (used in `apps/svelte/src/App.svelte` and `apps/svelte-kit/src/routes/+page.svelte`).
2. `particlesInit` executes `tsParticles.init()`, runs consumer loader callback, then sets `initialized` store to `true` in `components/svelte/src/lib/utils.ts`.
3. `Particles.svelte` subscribes to `initialized` in `components/svelte/src/lib/Particles.svelte`; once `canStart` and `mounted` are true, it runs `tsParticles.load({ id, options, url })`.
4. Loaded container is emitted through `particlesLoaded` custom event from `components/svelte/src/lib/Particles.svelte` back to app handlers (example in `apps/svelte/src/App.svelte`).

**SvelteKit SSR-safe Component Flow:**

1. Route component defines particles options and initialization callback in `apps/svelte-kit/src/routes/+page.svelte`.
2. Component constructor is dynamically imported only when `browser` is true in `apps/svelte-kit/src/routes/+page.svelte`.
3. Await block renders `<svelte:component ...>` only after import resolution, preventing server-side execution of client-only particles code.

**State Management:**
- Immediate init gate: writable boolean `initialized` in `components/svelte/src/lib/utils.ts`.
- Advanced shared init state: store factory and singleton in `components/svelte/src/lib/particlesStore.ts` (`engine`, `isReady`, `error`, cached `initPromise`).

## Key Abstractions

**Public Library Entry API:**
- Purpose: Single import surface for library consumers.
- Examples: `components/svelte/src/lib/index.ts`.
- Pattern: Barrel-like export (`default` Particles component + named `particlesInit`).

**Particles Component Wrapper:**
- Purpose: Encapsulates tsParticles lifecycle and DOM container ownership.
- Examples: `components/svelte/src/lib/Particles.svelte`.
- Pattern: Svelte lifecycle orchestration (`onMount`, `afterUpdate`, `onDestroy`) + event dispatcher abstraction.

**Initialization Gate Store:**
- Purpose: Prevent engine load before explicit initialization callback runs.
- Examples: `components/svelte/src/lib/utils.ts`, consumed by `components/svelte/src/lib/Particles.svelte`.
- Pattern: Writable store as readiness flag shared across component instances.

**Centralized Store-based Engine Manager:**
- Purpose: Share one engine init promise/state across app scopes.
- Examples: `components/svelte/src/lib/particlesStore.ts`, usage guidelines in `components/svelte/STORE_PATTERN.md`.
- Pattern: Factory + singleton + derived stores for reactive sub-state.

## Entry Points

**Monorepo Build Entry Point:**
- Location: `package.json` scripts (`build`, `build:ci`, `build:lerna`, `build:nx`).
- Triggers: Local build commands and CI in `.github/workflows/nodejs.yml`.
- Responsibilities: Execute package-level build pipelines and aggregate outputs.

**Svelte Demo Runtime Entry:**
- Location: `apps/svelte/src/main.ts`.
- Triggers: Rollup bundle bootstrapping from `apps/svelte/rollup.config.mjs`.
- Responsibilities: Instantiates `App.svelte` and mounts to `document.body`.

**SvelteKit Demo Routing Entry:**
- Location: `apps/svelte-kit/src/routes/+layout.svelte` and `apps/svelte-kit/src/routes/+page.svelte`.
- Triggers: File-based routing in SvelteKit configured by `apps/svelte-kit/svelte.config.js`.
- Responsibilities: Global layout shell, route rendering, and SSR-safe particles demo.

**Library Publish Entry:**
- Location: `components/svelte/src/lib/index.ts` (packaged to `components/svelte/dist/index.js` via `components/svelte/package.json` scripts).
- Triggers: Package consumers importing `@tsparticles/svelte`.
- Responsibilities: Exposes stable API and forwards initialization/component primitives.

## Error Handling

**Strategy:** Localized, component/store-level defensive handling with minimal global policy.

**Patterns:**
- Recoverable state signaling via `error` field in `components/svelte/src/lib/particlesStore.ts` plus `console.error` logging on init failure.
- Async UI fallbacks with `{#await ...}{:catch ...}` in `apps/svelte-kit/src/routes/+page.svelte` for dynamic component import failures.

## Cross-Cutting Concerns

**Logging:** Console logging in demos (`apps/svelte/src/App.svelte`) and store error logging in `components/svelte/src/lib/particlesStore.ts`.
**Validation:** Type-level validation through strict TypeScript configs in `components/svelte/tsconfig.json`, `apps/svelte-kit/tsconfig.json`, and typed props/events in `components/svelte/src/lib/Particles.svelte`.
**Authentication:** Not applicable; no auth layer detected in `apps/*` or `components/svelte/src/lib/*`.

---

*Architecture analysis: 2026-04-10*
