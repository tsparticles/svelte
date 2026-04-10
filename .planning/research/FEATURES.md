# Feature Research

**Domain:** Svelte wrapper library for a browser-only rendering engine (tsParticles) + demo applications
**Researched:** 2026-04-10
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = package feels unreliable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| SSR-safe usage pattern for SvelteKit | SvelteKit docs explicitly require client-only patterns for browser-only libs (`browser`, `onMount`, dynamic import, `{#await}`) | MEDIUM | Must be first-class in docs + demo, not an afterthought; current repo already has this pattern in `apps/svelte-kit/src/routes/+page.svelte` |
| Stable, typed public API surface | Svelte packaging guidance expects `exports` + generated types + predictable import path | MEDIUM | Keep `Particles` + init API small and explicit; avoid deep-import requirements |
| Deterministic initialization lifecycle | Wrappers around imperative engines are expected to prevent race conditions and duplicate init work | MEDIUM | `particlesInit` gate and/or store-based singleton must be documented and tested |
| Core config ergonomics: inline options and remote URL | Users expect both “quick inline config” and “shared JSON config” modes for visual engines | LOW | Already present; table-stakes means preserve and test both paths |
| Error/Loading UX in demos | Modern demo apps are expected to show failure and loading states for async imports | LOW | Keep `{#await ...}{:catch ...}` demo behavior and include troubleshooting docs |
| Automated quality gates (typecheck/lint/build + smoke tests) | Svelte docs emphasize testing to prevent regressions; wrapper packages are judged on upgrade safety | MEDIUM | Minimum: CI smoke for package build + both demos + one SSR smoke scenario |
| Explicit compatibility contract | Consumers expect clear support ranges (Svelte 4/5, SvelteKit, `@tsparticles/engine`) | LOW | Encode in peer deps + docs matrix + changelog notes for breaking changes |

### Differentiators (Competitive Advantage)

Features that are not required to exist, but make this wrapper clearly better.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Documented shared-engine store pattern as “recommended default” | Makes multi-instance apps faster/cleaner than copy-paste init snippets | MEDIUM | Build around `particlesStore.ts` and `STORE_PATTERN.md`; add one canonical SvelteKit layout example |
| Svelte 5-ready API track (callback-prop events) while preserving Svelte 4 compatibility | Future-proofs wrapper and lowers migration cost for adopters | HIGH | Svelte docs deprecate `createEventDispatcher`; add gradual migration path rather than hard break |
| Demo split by intent: “table-stakes quickstart” vs “advanced recipes” | Improves DX and reduces confusion for first-time adopters | MEDIUM | Keep one minimal demo path (install → init → render) and separate advanced patterns (presets, shared store, remote config) |
| Bundle-size-aware recipes (slim/full/presets) with guidance | Helps adopters make better perf decisions quickly | MEDIUM | Provide side-by-side docs snippets for `loadSlim` vs `loadFull` and when each is worth it |
| Regression harness for SSR + rendering behavior | Raises trust during Svelte/SvelteKit upgrades | HIGH | Add focused integration tests (mount/unmount, init once, client-only import safety) |

### Anti-Features (Commonly Requested, Often Problematic)

Features that look attractive but create long-term maintenance cost.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Implicit auto-init inside `<Particles>` mount | “Less code for users” | Hidden side effects, duplicate init attempts, hard-to-debug order issues | Keep explicit app-level init (`particlesInit` or `particles.init`) and document one canonical pattern |
| Framework-specific internals in library core (`$app/*` in package runtime) | “Convenient for SvelteKit” | Violates reusable package best practices; hurts non-Kit Svelte consumers | Keep package framework-agnostic; put SvelteKit-specific logic in demo/docs only |
| Giant prop surface mirroring every tsParticles option | “Autocomplete for everything” | Bloats API, increases breaking-change risk, duplicates upstream schema | Keep `options` object + typed engine options; expose only wrapper-level props (`id`, `class`, `style`, `url`) |
| SSR emulation/polyfill mode to run particles server-side | “One code path everywhere” | Browser rendering engine is client-only; fake SSR adds fragility with little value | Document strict client-only boundaries and strong SSR guards |

## Feature Dependencies

```text
Stable typed public API
    └──requires──> Correct package exports + generated d.ts

SSR-safe usage pattern
    └──requires──> Client-only import strategy in demos/docs
    └──requires──> Explicit initialization lifecycle

Regression harness for SSR + rendering behavior
    └──requires──> Automated quality gates
    └──requires──> Demo scenarios that reflect real usage

Svelte 5-ready API track
    └──requires──> Compatibility contract + migration docs
    └──conflicts (if rushed)──> Legacy event API stability

Shared-engine store pattern
    └──enhances──> Deterministic initialization lifecycle
    └──enhances──> Multi-instance performance in demos
```

### Dependency Notes

- **SSR-safe pattern requires explicit init lifecycle:** without init ordering, client-only import still leads to race conditions.
- **Svelte 5-ready API requires migration docs:** event API changes are behavioral, not just syntactic.
- **Regression harness depends on quality gates:** tests without CI enforcement do not protect upgrades.
- **Shared store pattern should come after table-stakes docs:** advanced pattern only helps once baseline usage is clear.

## MVP Definition

### Launch With (v1 for this milestone)

- [ ] **Canonical quickstart docs + demo parity** — one minimal Svelte example and one minimal SvelteKit SSR-safe example
- [ ] **Compatibility matrix + API contract** — explicit supported ranges and migration notes
- [ ] **Quality baseline in CI** — typecheck/lint/build + SSR-safe smoke scenario

### Add After Validation (v1.x)

- [ ] **Advanced store-pattern guide** — publish as recommended scaling path once quickstart friction is low
- [ ] **Bundle-size recipe docs** — add measured guidance after collecting real usage feedback

### Future Consideration (v2+)

- [ ] **Svelte 5-first callback-prop event API as default** — do after a deprecation window for current consumers
- [ ] **Visual regression coverage for particle demos** — valuable but heavier infra, defer until core reliability is stable

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| SSR-safe docs + demo path | HIGH | MEDIUM | P1 |
| Compatibility matrix and contract | HIGH | LOW | P1 |
| CI quality baseline with smoke tests | HIGH | MEDIUM | P1 |
| Shared-engine store pattern docs | MEDIUM | MEDIUM | P2 |
| Bundle-size recipe guidance | MEDIUM | MEDIUM | P2 |
| Svelte 5-ready API migration path | HIGH | HIGH | P2 |
| Visual regression testing | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for this milestone
- P2: Should have after baseline quality/DX is stable
- P3: Nice to have, future hardening

## Competitor Feature Analysis

| Feature | Typical Svelte wrapper ecosystem pattern | In this repo today | Recommended approach |
|---------|------------------------------------------|--------------------|----------------------|
| Client-only integration for browser libs | `browser`/`onMount`/dynamic import patterns in docs and examples | Present in SvelteKit demo | Keep and elevate as primary documented path |
| Packaging correctness for Svelte libs | `svelte-package`, `exports`, generated types, publint validation | Mostly present | Preserve and treat as non-negotiable table-stakes |
| Testing posture for wrappers | Vitest component/integration + E2E smoke increasingly common | Partial (scripts exist, limited explicit test coverage) | Add targeted smoke/integration tests before adding new API surface |

## Sources

- SvelteKit Packaging docs (library packaging expectations): https://svelte.dev/docs/kit/packaging
- SvelteKit FAQ (client-only library patterns + packaging troubleshooting): https://svelte.dev/docs/kit/faq
- Svelte reference (`createEventDispatcher` deprecation, modern API direction): https://svelte.dev/docs/svelte/svelte
- Svelte 5 migration guide (event/callback migration implications): https://svelte.dev/docs/svelte/v5-migration-guide
- Svelte Testing docs (Vitest/component/E2E recommendations): https://svelte.dev/docs/svelte/testing
- Project context and current implementation:
  - `.planning/PROJECT.md`
  - `.planning/codebase/ARCHITECTURE.md`
  - `components/svelte/src/lib/*`
  - `components/svelte/STORE_PATTERN.md`
  - `README.md`

---
*Feature research for: tsParticles Svelte wrapper package + demos*
*Researched: 2026-04-10*
