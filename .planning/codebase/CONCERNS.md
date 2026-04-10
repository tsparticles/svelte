# Codebase Concerns

**Analysis Date:** 2026-04-10

## Tech Debt

**Dual initialization patterns with diverging behavior:**
- Issue: Engine initialization exists in two separate patterns (`initialized` boolean flow and store-based flow), but only one is wired into exports.
- Files: `components/svelte/src/lib/index.ts`, `components/svelte/src/lib/utils.ts`, `components/svelte/src/lib/Particles.svelte`, `components/svelte/src/lib/particlesStore.ts`, `components/svelte/STORE_PATTERN.md`
- Impact: API surface and behavior drift; maintenance changes must be duplicated and can silently diverge.
- Fix approach: Use one initialization model and export it from `components/svelte/src/lib/index.ts`; remove or integrate the unused path.

**Dead/undelivered public API documented but not exported:**
- Issue: `createParticlesStore` and `particles` are implemented but not exported from package entrypoint.
- Files: `components/svelte/src/lib/particlesStore.ts`, `components/svelte/src/lib/index.ts`, `components/svelte/STORE_PATTERN.md`
- Impact: Documentation references APIs that consumers cannot import, causing integration confusion and support overhead.
- Fix approach: Export store APIs from `components/svelte/src/lib/index.ts` (and ensure typings/package output include them) or remove store docs.

## Known Bugs

**`particlesLoaded` event payload/type mismatch:**
- Symptoms: Event typing declares `{ container: Container }`, while runtime payload uses `{ particles: container }`.
- Files: `components/svelte/src/lib/Particles.svelte`
- Trigger: Subscribe to `on:particlesLoaded` and rely on declared detail shape.
- Workaround: Read `event.detail.particles` only and avoid relying on the declared `container` type.

**Possible repeated expensive reloads on unrelated state updates:**
- Symptoms: Particle container teardown/reload can happen on every component update cycle.
- Files: `components/svelte/src/lib/Particles.svelte`
- Trigger: Any reactive update that reaches `afterUpdate` invokes `loadParticles()`, which calls `destroyOldContainer()` and `tsParticles.load(...)`.
- Workaround: Keep parent/component updates minimal and avoid changing bound props unless reload is intended.

## Security Considerations

**Client-side-only dependency used in mixed SSR environments:**
- Risk: Direct server-side execution of the component can fail or expose unstable runtime behavior if consumer SSR guards are omitted.
- Files: `components/svelte/README.md`, `apps/svelte-kit/src/routes/+page.svelte`, `apps/svelte-kit/vite.config.ts`
- Current mitigation: Demo uses browser-gated dynamic import in `apps/svelte-kit/src/routes/+page.svelte`; docs describe client-only usage.
- Recommendations: Enforce SSR-safe import guidance in exported docs and add a guard/failure message in `components/svelte/src/lib/Particles.svelte` for non-browser contexts.

## Performance Bottlenecks

**Full container recreation path on update:**
- Problem: `loadParticles()` always destroys existing container before deciding to reload.
- Files: `components/svelte/src/lib/Particles.svelte`
- Cause: `destroyOldContainer()` runs at function start, and `afterUpdate` always calls `loadParticles()`.
- Improvement path: Reload only when `id`, `options`, or `url` actually change; skip destroy/load on unrelated updates.

**Full engine bundle loading in demos by default:**
- Problem: `loadFull(engine)` is used in app examples, increasing startup and bundle cost.
- Files: `apps/svelte/src/App.svelte`, `apps/svelte-kit/src/routes/+page.svelte`
- Cause: Full preset imports all features regardless of usage.
- Improvement path: Prefer scoped loaders (`@tsparticles/slim` or targeted packages) in demos and docs.

## Fragile Areas

**Global mutable readiness flag controls component behavior:**
- Files: `components/svelte/src/lib/utils.ts`, `components/svelte/src/lib/index.ts`, `components/svelte/src/lib/Particles.svelte`
- Why fragile: A single global boolean gates all particle components and has no explicit error state; failed init leaves components blocked without typed recovery.
- Safe modification: Replace global boolean with exported typed store state (ready/loading/error) and explicit recovery path.
- Test coverage: No automated tests detected for this flow.

**ID-coupled container lifecycle can cause cross-instance interference:**
- Files: `components/svelte/src/lib/Particles.svelte`
- Why fragile: Default `id="tsparticles"` plus destroy-by-id behavior can remove a container owned by another instance when IDs collide.
- Safe modification: Require unique IDs per instance or generate instance-safe defaults; destroy only owned container references.
- Test coverage: No automated tests detected for multiple concurrent instances.

## Scaling Limits

**Multiple component instances share collision-prone defaults:**
- Current capacity: Reliable operation when IDs are unique and update churn is low.
- Limit: Concurrent instances using the default `id` risk lifecycle conflicts and redundant loads.
- Scaling path: Enforce unique IDs and add instance ownership checks around container destroy/load operations in `components/svelte/src/lib/Particles.svelte`.

## Dependencies at Risk

**Cross-workspace version skew in tsParticles packages:**
- Risk: Workspace packages pin different major/minor ranges (`@tsparticles/engine` 4 beta in library, 3.x in demo apps), increasing compatibility uncertainty.
- Impact: Demo behavior can diverge from published package behavior; upgrade friction and hard-to-reproduce bugs.
- Migration plan: Align `@tsparticles/*` versions across `components/svelte/package.json`, `apps/svelte/package.json`, and `apps/svelte-kit/package.json` to a single tested matrix.

## Missing Critical Features

**No automated validation for package runtime contracts:**
- Problem: Event detail schema, lifecycle guarantees, and SSR usage constraints are not validated by tests.
- Blocks: Safe refactoring of `components/svelte/src/lib/Particles.svelte` and `components/svelte/src/lib/index.ts` without regression risk.

## Test Coverage Gaps

**Core component behavior is untested:**
- What's not tested: `particlesInit` readiness flow, `particlesLoaded` event payload contract, id-change lifecycle, multi-instance interaction, and SSR usage boundaries.
- Files: `components/svelte/src/lib/index.ts`, `components/svelte/src/lib/Particles.svelte`, `components/svelte/src/lib/utils.ts`
- Risk: Regressions can ship in package builds undetected.
- Priority: High

**No test files detected in workspace packages:**
- What's not tested: Demo app integration behavior and package consumer-facing scenarios.
- Files: `apps/svelte/src/App.svelte`, `apps/svelte-kit/src/routes/+page.svelte`, `components/svelte/src/lib/Particles.svelte`
- Risk: Example apps can drift from real package contracts.
- Priority: Medium

---

*Concerns audit: 2026-04-10*
