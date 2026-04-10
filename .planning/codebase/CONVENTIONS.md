# Coding Conventions

**Analysis Date:** 2026-04-10

## Naming Patterns

**Files:**
- Use SvelteKit route naming for pages and route modules: `+page.svelte`, `+layout.svelte`, `+page.ts` in `apps/svelte-kit/src/routes/`.
- Use PascalCase for reusable Svelte component files: `components/svelte/src/lib/Particles.svelte`, `apps/svelte-kit/src/routes/Counter.svelte`, `apps/svelte-kit/src/routes/Header.svelte`, `apps/svelte/src/App.svelte`.
- Use camelCase for TypeScript helper/module files: `components/svelte/src/lib/particlesStore.ts`, `components/svelte/src/lib/utils.ts`.
- Use `index.ts` as barrel/entry export filenames in package libraries: `components/svelte/src/lib/index.ts`.

**Functions:**
- Use camelCase for function names (`loadParticles`, `destroyOldContainer`, `particlesInit`, `createParticlesStore`, `modulo`) in `components/svelte/src/lib/Particles.svelte`, `components/svelte/src/lib/index.ts`, `components/svelte/src/lib/particlesStore.ts`, and `apps/svelte-kit/src/routes/Counter.svelte`.
- Use verb-based names for handlers and lifecycle actions (`handleParticlesLoaded`, `loadParticles`, `destroyOldContainer`) in `apps/svelte/src/App.svelte` and `components/svelte/src/lib/Particles.svelte`.

**Variables:**
- Use camelCase for local variables and state (`particlesConfig`, `displayed_count`, `oldId`, `canStart`, `mounted`) in `apps/svelte-kit/src/routes/+page.svelte`, `apps/svelte/src/App.svelte`, and `components/svelte/src/lib/Particles.svelte`.
- Use `const` by default; use `let` only for mutable reactive state in Svelte scripts (seen across `*.svelte` files under `apps/svelte-kit/src/routes/` and `components/svelte/src/lib/`).

**Types:**
- Use PascalCase for interfaces/types (`ParticlesStoreState`, `Container`, `Engine`, `ISourceOptions`) in `components/svelte/src/lib/particlesStore.ts` and `components/svelte/src/lib/Particles.svelte`.
- Use `type` imports for type-only dependencies (e.g., `import type { Container, ISourceOptions } ...`) in `components/svelte/src/lib/Particles.svelte` and `apps/svelte/src/App.svelte`.

## Code Style

**Formatting:**
- Tool used: Prettier in `components/svelte/.prettierrc` and `apps/svelte-kit/.prettierrc`.
- Key settings:
  - Tabs (`"useTabs": true`)
  - Single quotes (`"singleQuote": true`)
  - No trailing commas (`"trailingComma": "none"`)
  - `printWidth: 100`
  - `prettier-plugin-svelte` for `.svelte` parsing via `overrides`
- Apply formatting with project scripts:
  - `components/svelte/package.json` → `pnpm run format`
  - `apps/svelte-kit/package.json` → `pnpm run format`

**Linting:**
- Tool used: ESLint with TypeScript + Svelte plugins in `components/svelte/.eslintrc.cjs` and `apps/svelte-kit/.eslintrc.cjs`.
- Base extends:
  - `eslint:recommended`
  - `plugin:@typescript-eslint/recommended`
  - `plugin:svelte/recommended`
  - `prettier`
- Use `svelte-eslint-parser` override for `*.svelte` files.
- Environments are browser + node + ES2017.

## Import Organization

**Order:**
1. Framework/runtime imports (`svelte`, `svelte/store`, `svelte/motion`) — e.g., `components/svelte/src/lib/Particles.svelte`, `components/svelte/src/lib/particlesStore.ts`, `apps/svelte-kit/src/routes/Counter.svelte`.
2. External packages (`@tsparticles/*`, `tsparticles`) — e.g., `components/svelte/src/lib/index.ts`, `apps/svelte/src/App.svelte`, `apps/svelte-kit/src/routes/+page.svelte`.
3. Local relative modules (`./utils.js`, `./Header.svelte`, `./styles.css`) — e.g., `components/svelte/src/lib/Particles.svelte`, `apps/svelte-kit/src/routes/+layout.svelte`.

**Path Aliases:**
- Use SvelteKit aliases where available:
  - `$app/*` in `apps/svelte-kit/src/routes/+page.svelte` and `apps/svelte-kit/src/routes/about/+page.ts`
  - `$lib/*` in `apps/svelte-kit/src/routes/+page.svelte` and `apps/svelte-kit/src/routes/Header.svelte`
- Use relative imports inside package library code in `components/svelte/src/lib/*.ts` and `components/svelte/src/lib/*.svelte`.

## Error Handling

**Patterns:**
- Wrap async initialization in `try/catch`, normalize unknown errors to `Error`, persist error in state, then rethrow in `components/svelte/src/lib/particlesStore.ts`.
- Guard early-return conditions for invalid runtime state (`!canStart`, `!mounted`) in `components/svelte/src/lib/Particles.svelte`.
- SSR/client gating via `browser` checks and async component import in `apps/svelte-kit/src/routes/+page.svelte`.
- For UI async blocks, surface promise failures in `{#await ...}{:catch error}` blocks in `apps/svelte-kit/src/routes/+page.svelte`.

## Logging

**Framework:** console

**Patterns:**
- Use `console.error` for operational failures in library/store init flow (`components/svelte/src/lib/particlesStore.ts`).
- Use `console.log` in demo applications for container inspection (`apps/svelte/src/App.svelte`).
- Keep production-facing library API behavior independent from logging side effects (library logic still throws after logging in `components/svelte/src/lib/particlesStore.ts`).

## Comments

**When to Comment:**
- Use concise intent comments for non-obvious behavior, mostly in setup/config files and route flags:
  - `apps/svelte-kit/src/routes/+page.ts`
  - `apps/svelte-kit/src/routes/about/+page.ts`
  - `apps/svelte/rollup.config.mjs`
  - `components/svelte/svelte.config.js`

**JSDoc/TSDoc:**
- Use multi-line JSDoc blocks for exported library/store APIs and usage examples in `components/svelte/src/lib/particlesStore.ts`.
- Prefer type annotations over verbose comments for straightforward logic in route and component files.

## Function Design

**Size:**
- Keep most component helper functions short and single-purpose (e.g., `modulo` in `apps/svelte-kit/src/routes/Counter.svelte`, `destroyOldContainer` in `components/svelte/src/lib/Particles.svelte`).
- Allow moderate-size orchestrator functions when coordinating async state transitions (`loadParticles` in `components/svelte/src/lib/Particles.svelte`).

**Parameters:**
- Use typed callback parameters for extension points (`particlesInit(init: (engine: Engine) => Promise<void>)`) in `components/svelte/src/lib/index.ts`.
- Use explicit event/detail typing for component events where possible (`createEventDispatcher<{ particlesLoaded: ... }>()`) in `components/svelte/src/lib/Particles.svelte`.

**Return Values:**
- Use explicit `Promise<void>` return types for async initialization paths in `components/svelte/src/lib/index.ts` and `components/svelte/src/lib/Particles.svelte`.
- Return structured state object from store getters (`getState`) in `components/svelte/src/lib/particlesStore.ts`.

## Module Design

**Exports:**
- Use a package entry file to export default component plus named utilities from `components/svelte/src/lib/index.ts`.
- Expose both singleton store and factory creator for flexible usage in `components/svelte/src/lib/particlesStore.ts`.

**Barrel Files:**
- Use `components/svelte/src/lib/index.ts` as the single public entrypoint.
- Keep internal helpers non-exported unless part of public API (`initialized` is exported from `components/svelte/src/lib/utils.ts` and consumed internally).

---

*Convention analysis: 2026-04-10*
