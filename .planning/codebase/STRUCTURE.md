# Codebase Structure

**Analysis Date:** 2026-04-10

## Directory Layout

```
svelte/
├── apps/                    # Executable demo applications
│   ├── svelte/              # Legacy Svelte + Rollup demo app
│   └── svelte-kit/          # SvelteKit + Vite demo app
├── components/              # Reusable publishable packages
│   └── svelte/              # `@tsparticles/svelte` library package
├── .github/workflows/       # CI automation (build pipelines)
├── .planning/codebase/      # Generated architecture/quality/stack mapping docs
├── package.json             # Workspace root scripts and workspace metadata
├── pnpm-workspace.yaml      # Workspace package globs
├── lerna.json               # Multi-package release/build orchestration
└── nx.json                  # Task caching defaults for workspace targets
```

## Directory Purposes

**`apps/`:**
- Purpose: Holds runnable application examples that consume the local library package.
- Contains: Framework app projects (`svelte`, `svelte-kit`) with independent build configs.
- Key files: `apps/svelte/src/main.ts`, `apps/svelte/src/App.svelte`, `apps/svelte-kit/src/routes/+page.svelte`, `apps/svelte-kit/vite.config.ts`.

**`components/`:**
- Purpose: Holds reusable component libraries.
- Contains: One package `components/svelte` with source in `src/lib`, packaging config, and generated `dist/` artifacts.
- Key files: `components/svelte/src/lib/index.ts`, `components/svelte/src/lib/Particles.svelte`, `components/svelte/package.json`, `components/svelte/svelte.config.js`.

**`components/svelte/src/lib/`:**
- Purpose: Core runtime and public API for `@tsparticles/svelte`.
- Contains: Svelte component wrapper, initialization helpers, and store implementations.
- Key files: `components/svelte/src/lib/Particles.svelte`, `components/svelte/src/lib/index.ts`, `components/svelte/src/lib/utils.ts`, `components/svelte/src/lib/particlesStore.ts`.

**`apps/svelte/src/`:**
- Purpose: Plain Svelte demo app source.
- Contains: App entrypoint and top-level component.
- Key files: `apps/svelte/src/main.ts`, `apps/svelte/src/App.svelte`.

**`apps/svelte-kit/src/routes/`:**
- Purpose: SvelteKit route tree and route-local components.
- Contains: Route pages (`+page.svelte`), layout (`+layout.svelte`), route options (`+page.ts`), helper UI components.
- Key files: `apps/svelte-kit/src/routes/+page.svelte`, `apps/svelte-kit/src/routes/+layout.svelte`, `apps/svelte-kit/src/routes/about/+page.ts`, `apps/svelte-kit/src/routes/Header.svelte`.

## Key File Locations

**Entry Points:**
- `apps/svelte/src/main.ts`: Browser bootstrap for plain Svelte demo.
- `apps/svelte-kit/src/routes/+layout.svelte`: Root UI shell for SvelteKit routes.
- `components/svelte/src/lib/index.ts`: Public package entry used by consumers.

**Configuration:**
- `package.json`: Root workspace scripts and workspaces metadata.
- `pnpm-workspace.yaml`: Workspace package discovery (`apps/*`, `components/*`).
- `lerna.json`: Lerna package scope and versioning strategy.
- `nx.json`: Cached build target defaults.
- `apps/svelte/rollup.config.mjs`: Rollup pipeline for plain Svelte app.
- `apps/svelte-kit/svelte.config.js`: SvelteKit adapter and preprocess setup.
- `apps/svelte-kit/vite.config.ts`: Vite plugins and SSR `noExternal` rules.
- `components/svelte/svelte.config.js`: Library SvelteKit packaging config.
- `components/svelte/vite.config.ts`: Library local dev/build config.

**Core Logic:**
- `components/svelte/src/lib/Particles.svelte`: tsParticles container lifecycle wrapper.
- `components/svelte/src/lib/index.ts`: Initialization API and exports.
- `components/svelte/src/lib/particlesStore.ts`: Shared engine initialization store abstraction.

**Testing:**
- Not detected: no `*.test.*` or `*.spec.*` files in `apps/*` or `components/*`.

## Naming Conventions

**Files:**
- SvelteKit route convention: `+layout.svelte`, `+page.svelte`, `+page.ts` in `apps/svelte-kit/src/routes/`.
- Component files use PascalCase: `Particles.svelte`, `Header.svelte`, `Counter.svelte`.
- Utility/runtime modules use camelCase/lowercase TS names: `particlesStore.ts`, `utils.ts`, `index.ts`.

**Directories:**
- Workspace package directories are category-first then framework-specific: `apps/svelte`, `apps/svelte-kit`, `components/svelte`.
- SvelteKit app structure follows framework defaults: `src/routes`, `src/lib`, `static` in `apps/svelte-kit/` and `components/svelte/`.

## Where to Add New Code

**New Feature:**
- Primary code: add library behavior to `components/svelte/src/lib/`.
- Demo integration: add showcase usage in `apps/svelte/src/App.svelte` and/or route-level examples in `apps/svelte-kit/src/routes/`.
- Tests: Not applicable in current structure (no established test directory). Add new tests adjacent to source (for example `components/svelte/src/lib/*.spec.ts`) only after introducing a test runner config.

**New Component/Module:**
- Implementation: place exportable components in `components/svelte/src/lib/` and export from `components/svelte/src/lib/index.ts`.
- SvelteKit-only route component: place under `apps/svelte-kit/src/routes/` (or nested route directories).

**Utilities:**
- Shared helpers: `components/svelte/src/lib/utils.ts` or adjacent utility files in `components/svelte/src/lib/`.
- App-specific helpers: inside each app’s `src/` tree (`apps/svelte/src/` or `apps/svelte-kit/src/lib/`).

## Special Directories

**`components/svelte/dist/`:**
- Purpose: Packaged output consumed by npm exports (`types`/`svelte` entries in `components/svelte/package.json`).
- Generated: Yes.
- Committed: Yes (directory exists in repo).

**`apps/svelte/public/build/`:**
- Purpose: Rollup build output for plain Svelte demo.
- Generated: Yes.
- Committed: No (`/public/build/` ignored in `apps/svelte/.gitignore`).

**`apps/svelte-kit/.svelte-kit/` and `components/svelte/.svelte-kit/`:**
- Purpose: SvelteKit generated framework internals/types/output.
- Generated: Yes.
- Committed: No (`/.svelte-kit` ignored in `apps/svelte-kit/.gitignore` and `components/svelte/.gitignore`).

**`node_modules/` (root and package-level):**
- Purpose: Installed dependencies.
- Generated: Yes.
- Committed: No (`node_modules/` ignored in root and package `.gitignore` files).

**`.planning/codebase/`:**
- Purpose: Architecture/stack/quality/concerns mapping docs consumed by GSD planner/executor flows.
- Generated: Yes (by mapping commands).
- Committed: Yes (intended project documentation).

---

*Structure analysis: 2026-04-10*
