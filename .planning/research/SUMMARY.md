# Project Research Summary

**Project:** tsParticles Svelte
**Domain:** Svelte wrapper library for a browser-only rendering engine (`@tsparticles/engine`) with Svelte/SvelteKit demos
**Researched:** 2026-04-10
**Confidence:** MEDIUM-HIGH

## Executive Summary

This project is a wrapper-library product, not a greenfield app: success depends less on feature breadth and more on API stability, SSR safety, and release reliability. The research is consistent across all streams: expert teams build this kind of package around a small, typed public facade, an idempotent engine-initialization layer, and explicit client-only integration guidance for SSR frameworks (especially SvelteKit).

The recommended approach is to standardize on the modern Svelte toolchain (Svelte 5 + SvelteKit 2 + Vite 8 + Node 22/24), preserve a minimal wrapper API (`Particles` + explicit init path), and make CI/package verification non-negotiable (type/lint/build + SSR smoke + packed-tarball consumer tests). Feature work should prioritize table stakes first (SSR-safe quickstart, compatibility contract, quality gates), then add differentiators (shared store pattern docs, bundle-size recipes, Svelte 5 event-model migration path).

The largest risks are contract drift (docs vs real exports/events), SSR boundary leaks, and lifecycle thrash from over-broad reload logic. Mitigation is clear: freeze a stable facade, isolate volatile runtime orchestration internals, add contract/integration tests that run against packed artifacts, and sequence roadmap phases to harden fundamentals before adding API evolution work.

## Key Findings

### Recommended Stack

Research strongly supports a modern, conservative-by-default baseline: Node 22.12+ (or 24), Svelte 5.55.x, SvelteKit 2.57.x, Vite 8, `@sveltejs/vite-plugin-svelte` 7, TypeScript 5.9 (with optional TS 6 track), and stable `@tsparticles/engine@^3.9.1`. For package quality and release safety, the core supporting set is `@sveltejs/package`, `publint`, `svelte-check`, Vitest, Testing Library, Playwright, and Changesets.

**Core technologies:**
- **Node.js 22.12+/24**: tooling runtime — aligns with current Vite/Svelte ecosystem requirements.
- **Svelte 5 + SvelteKit 2**: wrapper + demos — mainstream and actively maintained compatibility path.
- **Vite 8 + plugin-svelte 7**: build/dev integration — canonical Svelte compiler pipeline.
- **TypeScript 5.9 (default)**: API typing stability — lower-risk compatibility for consumers.
- **`@tsparticles/engine@^3.9.1`**: engine runtime — stable baseline; avoid beta dependency as default.

### Expected Features

**Must have (table stakes):**
- SSR-safe SvelteKit usage pattern as first-class docs/demo behavior.
- Stable typed public API with explicit compatibility contract.
- Deterministic, explicit engine init lifecycle (no hidden auto-init side effects).
- Support both inline options and remote URL config modes.
- CI quality baseline (type/lint/build + smoke, including SSR scenario).

**Should have (competitive):**
- Canonical shared-engine store pattern for multi-instance/perf clarity.
- Clearly separated demo paths: quickstart vs advanced recipes.
- Bundle-size-aware guidance (`loadSlim` vs `loadFull`).
- Regression harness for SSR + mount/unmount/init-once behavior.
- Svelte 5-ready callback-prop event migration path with compatibility window.

**Defer (v2+):**
- Svelte 5-first event API as default (after deprecation window).
- Visual regression infrastructure for demos.

### Architecture Approach

The architecture recommendation is to keep a **stable public facade** while isolating volatility in internal runtime modules: an **engine orchestrator** (single init promise + ready/error state), a **renderer boundary** (`Particles.svelte`) for mount/load/destroy only, and **SSR adapters in demos** (not package runtime). This enforces portability and protects consumers from internal refactors.

**Major components:**
1. **Public API facade (`src/lib/index.ts`)** — stable exports and semver contract.
2. **Runtime orchestrator/store** — idempotent init sequencing and readiness/error state.
3. **Renderer (`Particles.svelte`)** — container lifecycle and event emission.
4. **Config/event runtime modules** — normalization and typed payload adapters.
5. **SvelteKit demo adapter layer** — client-only boundary (browser guard + dynamic import).

### Critical Pitfalls

1. **API/docs drift** — prevent with export/event contract tests and README-vs-dist validation.
2. **SSR boundary leaks** — prevent with framework-agnostic library internals and SSR fixture smoke tests.
3. **Lifecycle container thrash** — prevent with guarded diff-based reloads (`id/options/url`) and owned-instance tracking.
4. **Dependency/version skew across workspace vs published package** — prevent with compatibility matrix governance and tarball install verification.
5. **False-green release pipeline** — prevent with publish-like pack/install/smoke workflow and semver/changeset enforcement.

## Implications for Roadmap

Based on combined research, use a dependency-first roadmap with five phases.

### Phase 1: Public Contract Stabilization
**Rationale:** Every later phase depends on a trusted API/typing baseline.
**Delivers:** Frozen facade exports, typed event contract, compatibility matrix, README/API alignment checks.
**Addresses:** P1 features (stable typed API, compatibility contract).
**Avoids:** Pitfall 1 (API/docs drift).

### Phase 2: SSR Compatibility Hardening
**Rationale:** Browser-only runtime safety in SvelteKit is the top integration risk for consumers.
**Delivers:** Canonical SSR-safe quickstart/demo path, external SvelteKit fixture smoke tests against packed artifact.
**Addresses:** P1 feature (SSR-safe docs + demo path).
**Avoids:** Pitfall 2 (SSR boundary leaks).

### Phase 3: Runtime Lifecycle & Multi-Instance Correctness
**Rationale:** Once contract + SSR are stable, runtime behavior must become deterministic under real reactivity.
**Delivers:** Unified idempotent orchestrator, guarded reload logic, multi-instance/route-transition regression tests.
**Addresses:** Deterministic init lifecycle + regression harness groundwork.
**Avoids:** Pitfall 3 (container thrash, ID collisions, duplicate init behavior).

### Phase 4: Differentiator Docs + Dependency Governance
**Rationale:** With reliability baseline in place, improve developer experience and prevent ecosystem drift.
**Delivers:** Shared-store canonical guide, quickstart/advanced demo split, slim/full bundle recipes, dependency drift checks.
**Addresses:** P2 differentiators (store pattern, bundle-size guidance).
**Avoids:** Pitfall 4 (version skew).

### Phase 5: Release Pipeline & Forward-Compatibility Governance
**Rationale:** Sustainable evolution requires release gates matching real consumer install behavior.
**Delivers:** Release-candidate workflow (`svelte-package` + `publint` + `pnpm pack` + fixture install/build/SSR smoke), changeset/semver enforcement, Svelte 5 event-migration plan.
**Addresses:** P2/P3 hardening and migration safety.
**Avoids:** Pitfall 5 (false-green releases, semver mistakes).

### Phase Ordering Rationale

- Contract first because architecture and test strategy both assume a fixed public boundary.
- SSR second because this is the highest-impact integration failure mode for SvelteKit users.
- Lifecycle third because performance/correctness tuning is safer after contract and SSR guardrails are in place.
- Differentiators fourth to avoid polishing DX before baseline reliability is proven.
- Release governance last (but prepared early) to lock in quality before broader iteration.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** lifecycle delta detection strategy and event-payload stability under rapid updates.
- **Phase 4:** bundle-size recipe thresholds and “slim vs full” guidance backed by representative measurements.
- **Phase 5:** Svelte 5 callback-prop migration sequencing and deprecation-window policy.

Phases with standard patterns (can likely skip extra research-phase):
- **Phase 1:** package exports/types + contract testing pattern is well documented.
- **Phase 2:** SvelteKit client-only boundary pattern is mature and well documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Strong official-source backing; minor uncertainty around TS 6 timing for broad downstream compatibility. |
| Features | HIGH | Clear prioritization and good alignment with existing repo state + official Svelte guidance. |
| Architecture | MEDIUM | Direction is strong, but some module boundaries are target-state recommendations requiring implementation validation. |
| Pitfalls | HIGH | Concrete failure modes, phase mapping, and prevention tactics are specific and actionable. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Svelte 4/5 support window detail:** define exact deprecation cadence and communication plan before defaulting to Svelte 5-first event semantics.
- **Performance baselines for bundle recipes:** collect real startup/render measurements before hard recommendations.
- **Cross-version CI scope:** finalize minimum/maximum version matrix (Node, Svelte, SvelteKit, engine) to balance confidence vs CI cost.
- **Remote URL config trust model:** codify expected security/reliability behavior for malformed/offline/untrusted config sources.

## Sources

### Primary (HIGH confidence)
- Svelte official docs (packaging, testing, lifecycle, migration): https://svelte.dev/docs/kit/packaging, https://svelte.dev/docs/svelte/testing, https://svelte.dev/docs/svelte/lifecycle-hooks, https://svelte.dev/docs/svelte/v5-migration-guide
- SvelteKit official docs (`$app/environment`, FAQ, page options): https://svelte.dev/docs/kit/$app-environment, https://svelte.dev/docs/kit/faq, https://svelte.dev/docs/kit/page-options
- npm registry metadata for current versions/peers: svelte, `@sveltejs/kit`, `@sveltejs/vite-plugin-svelte`, vite, typescript, `@tsparticles/engine`
- pnpm and GitHub Actions official docs: https://pnpm.io/workspaces, https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#environment-files

### Secondary (MEDIUM confidence)
- Vite SSR/library guidance: https://vite.dev/config/ssr-options, https://vite.dev/guide/build.html#library-mode
- Playwright and Vitest docs for testing/runtime requirements: https://playwright.dev/docs/intro, https://vitest.dev/guide/

### Tertiary (LOW confidence)
- Internal orchestration choice (Nx vs pnpm recursive scripts) remains context-dependent; validate against actual CI/runtime cache benefits in this repo.

---
*Research completed: 2026-04-10*
*Ready for roadmap: yes*
