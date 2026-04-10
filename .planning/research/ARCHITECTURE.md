# Architecture Research

**Domain:** Svelte wrapper library for tsParticles with SvelteKit-safe demos
**Researched:** 2026-04-10
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    Consumer-facing API Layer                       │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌───────────────────────┐                  │
│  │ index.ts facade │   │ public TS contracts   │                  │
│  │ (stable exports)│   │ (props/events/types)  │                  │
│  └────────┬────────┘   └──────────┬────────────┘                  │
├───────────┴───────────────────────┴────────────────────────────────┤
│                     Runtime Orchestration Layer                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Engine Orchestrator (single init promise, readiness, error) │   │
│  └───────────────┬──────────────────────────────────────────────┘   │
│                  │                                                  │
│  ┌───────────────▼──────────────────┐   ┌────────────────────────┐  │
│  │ Particles.svelte renderer         │   │ Config normalizer      │  │
│  │ (mount/load/destroy + events)     │   │ (options/url guards)   │  │
│  └───────────────┬──────────────────┘   └────────────────────────┘  │
├──────────────────┴───────────────────────────────────────────────────┤
│                    Demo/Integration Adapter Layer                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐   ┌──────────────────────────────────┐  │
│  │ Svelte demo app        │   │ SvelteKit client-only adapter    │  │
│  │ (direct component use) │   │ (browser guard + dynamic import) │  │
│  └────────────────────────┘   └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Public API Facade (`src/lib/index.ts`) | Preserve stable import surface and semantic compatibility | Re-export `default` component + named helpers, additive-only changes |
| Engine Orchestrator (`particlesStore` + init gate) | Guarantee one-time engine boot and expose readiness/error state | Cached promise + store-backed state machine (`idle`/`ready`/`error`) |
| Renderer (`Particles.svelte`) | Own DOM container lifecycle and event emission | `onMount`/`onDestroy` + guarded reload logic + typed `particlesLoaded` event |
| SSR Adapter (demo boundary) | Prevent server runtime from importing client-only particle runtime | `browser` guard + dynamic import + loading/failure fallback |
| Demo Composition | Show recommended usage patterns without leaking internal complexity | Route-level examples: basic setup, advanced store-based setup |

## Recommended Project Structure

```text
components/svelte/src/lib/
├── index.ts                    # stable public exports only
├── Particles.svelte            # rendering boundary for tsParticles container
├── runtime/
│   ├── engineOrchestrator.ts   # single-init state machine (new/target)
│   ├── config.ts               # options/url normalization + validation (new/target)
│   └── events.ts               # typed event payload adapters (new/target)
├── particlesStore.ts           # store API (can delegate to runtime/orchestrator)
└── compat/
    └── deprecations.ts         # backwards-compat warnings/helpers (new/target)

apps/svelte/
└── src/App.svelte              # baseline consumer example

apps/svelte-kit/
└── src/routes/
    ├── +page.svelte            # SSR-safe client-only usage
    └── examples/               # focused patterns (basic, store, url-config)
```

### Structure Rationale

- **`src/lib/index.ts` as hard boundary:** protects consumers from internal refactors; keeps long-lived compatibility.
- **`runtime/` split:** isolates volatile logic (init sequencing, config coercion, events) from component syntax changes across Svelte 4/5.
- **`compat/` folder:** makes deprecation policy explicit rather than hidden in implementation.
- **Demo apps as adapters, not core logic hosts:** docs/examples evolve without destabilizing package runtime.

## Architectural Patterns

### Pattern 1: Stable Facade + Internal Volatility

**What:** Keep one durable public module while moving change-prone logic behind internal modules.
**When to use:** Always, for wrapper libraries consumed by many external apps.
**Trade-offs:** Slight indirection cost, major gain in backward compatibility and release safety.

**Example:**
```typescript
// src/lib/index.ts
export { default as Particles } from './Particles.svelte';
export { particlesInit, particles } from './particlesStore.js';
// Avoid exporting internal runtime modules directly
```

### Pattern 2: Idempotent Engine Initialization State Machine

**What:** Initialization is cached and serialized; duplicate calls share one promise.
**When to use:** Any app can mount multiple `<Particles>` instances or route transitions.
**Trade-offs:** Must model error/reset semantics explicitly.

**Example:**
```typescript
// conceptual orchestration
if (state.ready) return;
if (state.initPromise) return state.initPromise;
state.initPromise = doInit().finally(() => {/* keep result in state */});
return state.initPromise;
```

### Pattern 3: SSR Adapter Boundary (Client-Only Island)

**What:** Keep SSR framework concerns in adapter/demo layer, not in core renderer implementation.
**When to use:** SvelteKit or any SSR context where `window`/canvas runtime is client-only.
**Trade-offs:** Slightly more boilerplate in demos, cleaner package portability.

**Example:**
```svelte
<script lang="ts">
  import { browser } from '$app/environment';
  const ParticlesCtor = browser
    ? import('@tsparticles/svelte').then((m) => m.default)
    : new Promise(() => {});
</script>

{#await ParticlesCtor}
  <p>Loading…</p>
{:then Ctor}
  <svelte:component this={Ctor} id="tsparticles" options={opts} />
{/await}
```

## Data Flow

### Request Flow

```text
[App start / route mount]
    ↓
[particlesInit or particles.init]
    ↓
[Engine Orchestrator] ──(ready/error state)──> [Store subscribers]
    ↓
[Particles.svelte mount]
    ↓
[tsParticles.load({ id, options|url })]
    ↓
[Container created]
    ↓
[particlesLoaded event to consumer]
```

### State Management

```text
[Orchestrator state]
    ↓ subscribe
[particlesStore derived state]
    ↓
[Particles components + demo pages]
    ↘ actions (init/load/reload) ↗
```

### Key Data Flows

1. **Initialization flow:** consumer callback extends engine (loadSlim/loadFull/etc) once, then all components read shared readiness.
2. **Render flow:** component accepts `id + options|url`, loads container, emits typed event payload.
3. **SSR flow:** route-level adapter blocks server execution and defers component import to browser runtime.

### Data Flow Implications for Upcoming Features

- New features should enter through **orchestrator or config normalization**, not directly inside `Particles.svelte` lifecycle blocks.
- Avoid implicit global toggles (`initialized` boolean only) when adding capabilities; prefer explicit state (`status`, `error`, `engine`).
- Keep `particlesLoaded` payload stable; additive event metadata is fine, breaking payload shape is not.

## Suggested Build Order (for roadmap phases)

1. **Harden public contract first**
   - Freeze/export API surface and event types.
   - Add compatibility tests for imports and event payload shape.
2. **Unify init logic into orchestrator**
   - Consolidate `particlesInit` and store-based init path behind one idempotent runtime.
   - Add error/reset behavior tests.
3. **Refactor renderer to consume orchestrator**
   - Minimize reload triggers; avoid broad `afterUpdate`-style full reload loops where possible.
   - Keep external props unchanged.
4. **Codify SSR-safe adapter pattern in demos**
   - Provide one canonical SvelteKit example (browser + dynamic import + fallback).
   - Keep SSR guidance in demo code, not library internals.
5. **Add forward-compat layer for Svelte evolution**
   - Isolate lifecycle-dependent behavior so migration from legacy hooks is internal-only.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k consumers | Current monorepo shape is enough; focus on API stability and docs clarity |
| 1k-100k consumers | Introduce strict contract tests (exports/events/SSR examples) and deprecation policy with minor-version grace periods |
| 100k+ consumers | Add compatibility matrix (Svelte 4/5, engine major versions), automated cross-version CI, and stricter semver gates |

### Scaling Priorities

1. **First bottleneck:** silent API drift (exports/events). Fix with contract tests + changelog discipline.
2. **Second bottleneck:** framework/runtime drift (SvelteKit SSR and Svelte lifecycle changes). Fix by isolating adapters and lifecycle internals.

## Anti-Patterns

### Anti-Pattern 1: Demo Logic as Runtime Dependency

**What people do:** put SSR hacks and framework-specific branches inside core library component.
**Why it's wrong:** couples package to SvelteKit specifics; hurts non-Kit consumers and future frameworks.
**Do this instead:** keep SSR handling in demo/adapters; keep library runtime framework-agnostic.

### Anti-Pattern 2: Breaking Changes via Internal Refactor Leakage

**What people do:** expose internal modules/types casually, then change them in minors.
**Why it's wrong:** consumers couple to internals; upgrades break unexpectedly.
**Do this instead:** export only documented facade, add new APIs additively, deprecate before removal.

### Anti-Pattern 3: Over-broad reactive reloads

**What people do:** reload particle container on every component update.
**Why it's wrong:** unnecessary destroy/recreate churn, event noise, hard-to-debug behavior.
**Do this instead:** reload only on meaningful prop deltas (`id`, `options`, `url`) with guarded diff logic.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| `@tsparticles/engine` | Core runtime dependency; initialized once and shared | Keep peer range broad enough for supported majors; test against min+max supported versions |
| Optional bundles (`tsparticles`, `@tsparticles/slim`, presets) | Consumer-supplied loader inside init callback | Maintains bundle-size choice in consumer control |
| SvelteKit/Vite SSR pipeline | Demo-level `browser` guard + `ssr.noExternal` where needed | Prevents server import/runtime failures for client-only code |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Facade ↔ Runtime Orchestrator | Direct function calls + typed return contracts | Keep runtime private; facade is only stable import target |
| Runtime Orchestrator ↔ Renderer | Store/state subscription + load calls | Renderer should not own init sequencing logic |
| Demo adapters ↔ Package | Public API usage only | Demos serve as compatibility tests for real consumers |

## Sources

- Svelte lifecycle hooks docs (onMount server behavior; `afterUpdate` deprecation context): https://svelte.dev/docs/svelte/lifecycle-hooks
- SvelteKit `$app/environment` (`browser` guard): https://svelte.dev/docs/kit/$app-environment
- SvelteKit page options (SSR/prerender behavior): https://svelte.dev/docs/kit/page-options
- SvelteKit packaging best practices (library boundaries, avoiding Kit-specific modules in packages): https://svelte.dev/docs/kit/packaging
- Vite SSR config (`ssr.noExternal`): https://vite.dev/config/ssr-options
- Repo baseline architecture and runtime files:
  - `.planning/codebase/ARCHITECTURE.md`
  - `components/svelte/src/lib/index.ts`
  - `components/svelte/src/lib/Particles.svelte`
  - `components/svelte/src/lib/particlesStore.ts`
  - `components/svelte/README.md`
  - `apps/svelte-kit/src/routes/+page.svelte`
  - `apps/svelte-kit/vite.config.ts`

---
*Architecture research for: tsParticles Svelte wrapper (subsequent milestone)*
*Researched: 2026-04-10*
