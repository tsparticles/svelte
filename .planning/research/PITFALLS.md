# Pitfalls Research

**Domain:** Svelte wrapper library maintenance (package API, demos, and release pipeline)
**Researched:** 2026-04-10
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: API/docs drift between exported surface and implementation

**What goes wrong:**
Wrapper docs promise APIs that are not exported (or events typed one way but emitted another), so consumers build against contracts that do not exist.

**Why it happens:**
Wrapper packages evolve quickly and keep “experimental” paths (like alternate store patterns) without a single contract test for exports + event payload schema.

**How to avoid:**
- Define one canonical public API list in `components/svelte/src/lib/index.ts` and treat it as the only supported surface.
- Add contract tests that assert:
  - expected named exports exist,
  - `particlesLoaded` event detail shape matches declared types,
  - removed exports fail loudly in semver-major only.
- Add a release gate: fail CI if README API examples import symbols not present in built `dist` typings.

**Warning signs:**
- README examples compile-fail in a clean consumer project.
- Support issues saying “documented API is undefined/not exported”.
- Type declarations mention fields that runtime events do not provide.

**Phase to address:**
**Phase 1 — API contract stabilization + type/runtime alignment**

---

### Pitfall 2: SSR boundary leaks from wrapper into SvelteKit consumers

**What goes wrong:**
Client-only particle code executes in server contexts, causing SSR runtime failures or forcing every consumer to invent custom guards.

**Why it happens:**
Wrappers accidentally depend on SvelteKit-only modules or browser globals at import-time; demos hide this by using local workarounds not encoded in the library contract.

**How to avoid:**
- Keep library runtime framework-agnostic per Svelte packaging guidance (avoid `$app/*` in library code).
- Ensure browser-only behavior happens inside `onMount` (server-safe lifecycle boundary).
- Add SSR smoke tests in a minimal SvelteKit fixture that imports the published package and renders route build/prerender.
- In docs, provide one canonical SSR-safe pattern and mark it as required for SvelteKit usage.

**Warning signs:**
- `ReferenceError: window/document is not defined` during build/prerender.
- SSR works in demo app but fails in external consumer repos.
- Library source imports `$app/environment` or other kit-only modules.

**Phase to address:**
**Phase 2 — SSR compatibility hardening + integration test fixtures**

---

### Pitfall 3: Lifecycle-triggered container thrash (destroy/reload on unrelated updates)

**What goes wrong:**
Particle containers are torn down and recreated on normal component updates, causing jank, event duplication, and unnecessary CPU/GPU churn.

**Why it happens:**
Using broad update hooks without precise dependency guards; id-based teardown not tied to ownership of the specific instance.

**How to avoid:**
- Replace unconditional update-driven reloads with explicit diffing on `id/options/url` only.
- Track and destroy only owned container references, not global-by-id lookups.
- Enforce unique ID strategy (generated default or required unique input).
- Add multi-instance regression tests (same page, rapid prop updates, route transitions).

**Warning signs:**
- FPS drops when unrelated parent state changes.
- Multiple wrapper instances interfere when default id is reused.
- Frequent `load/destroy` logs in normal interaction.

**Phase to address:**
**Phase 3 — lifecycle refactor + multi-instance correctness/performance tests**

---

### Pitfall 4: Version skew across monorepo package, demos, and engine dependencies

**What goes wrong:**
Demos validate one dependency matrix while published package ships against another; bugs reproduce only in consumers, not in-repo.

**Why it happens:**
Workspace allows mixed ranges, and release checks only build local packages without matrix validation against real install boundaries.

**How to avoid:**
- Align `@tsparticles/*` major/minor ranges across wrapper + demo packages.
- Use `workspace:` protocol intentionally and keep a single compatibility matrix documented.
- Add CI jobs that install the packed artifact (`pnpm pack`) into fresh sample apps (Svelte + SvelteKit) before release.
- Add policy check: fail CI on dependency matrix drift for critical packages.

**Warning signs:**
- Demo works with workspace link, fails when package is installed from tarball/npm.
- Different `@tsparticles/engine` major/minor versions across workspace packages.
- “Cannot reproduce” issues tied to external installations only.

**Phase to address:**
**Phase 4 — dependency matrix governance + package-consumer verification**

---

### Pitfall 5: Release pipeline validates build output but not published package behavior

**What goes wrong:**
CI is green, but released package has broken exports/types/SSR behavior because pipeline only runs build commands inside monorepo context.

**Why it happens:**
No publish-like verification stage (pack/install/smoke) and no automated semantic versioning discipline tied to API changes.

**How to avoid:**
- Add release-candidate workflow:
  1. `svelte-package` + `publint`
  2. `pnpm pack`
  3. install tarball in external fixture projects
  4. run typecheck + build + SSR prerender smoke.
- Add changeset/release note enforcement to map API changes to semver.
- Migrate deprecated GitHub Actions output patterns (`::set-output`) to environment files for future-proof CI maintenance.

**Warning signs:**
- Post-release hotfixes for missing types/exports.
- Breaking changes shipped as patch/minor.
- CI uses legacy GH Actions command patterns flagged by platform docs.

**Phase to address:**
**Phase 5 — release pipeline hardening + semver governance**

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep dual init paths (boolean + store) | Avoids near-term refactor | Behavioral drift, duplicated fixes, confusing docs | Only during Phase 1 migration window |
| Use demo app as “test coverage” | Fast feedback for maintainers | Misses contract regressions and consumer install failures | Never as sole validation |
| Rely on default `id="tsparticles"` everywhere | Easy copy-paste examples | Cross-instance conflicts and nondeterministic lifecycle bugs | Only in single-instance quickstart snippets, never in internals |
| Workspace-link-only verification | Fast CI | Hides packed/published package defects | Never for release gates |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SvelteKit SSR | Access browser APIs during module evaluation | Gate browser behavior in `onMount` and provide SSR-safe import pattern in docs/examples |
| `@sveltejs/package` exports | Changing/removing export paths without semver-major | Treat export map removals/condition changes as breaking changes |
| tsParticles engine loader | Loading full bundle by default in docs/demos | Default docs to slim/targeted loaders, keep full bundle as advanced option |
| Monorepo dependencies (pnpm) | Allowing critical deps to drift across packages | Enforce aligned ranges + CI drift checks + tarball install tests |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Reload-on-every-update lifecycle | Stutter and unnecessary canvas re-creation | Reload only on `id/options/url` deltas and keep owned container references | Breaks quickly in reactive UIs with frequent state updates |
| Full feature bundle in starter examples | Slower startup and larger demos than needed | Publish slim-first examples and benchmark docs | Breaks perceived UX immediately on lower-end devices |
| Shared global readiness flag without error state | Components stuck/unrecoverable after failed init | Use typed state (`loading/ready/error`) with retry semantics | Breaks under transient loader/init failures |

## Security / Reliability Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Treating arbitrary remote `url` configs as always trusted | Unexpected runtime behavior, hard-to-debug failures from malformed/offline configs | Document trust assumptions, add error handling/events for fetch/parse failure, provide local-options fallback |
| Assuming workspace install == production install | Shipping broken package metadata unnoticed | Verify tarball install in clean fixtures before release |
| Using deprecated CI command patterns | Future pipeline breakage as platform support evolves | Use `GITHUB_OUTPUT`/`GITHUB_ENV` environment files |

## "Looks Done But Isn't" Checklist

- [ ] **Public API:** All documented exports resolve from built package (`dist`) and type declarations.
- [ ] **Event contracts:** Emitted runtime event detail keys match declared TypeScript event types.
- [ ] **SSR safety:** SvelteKit prerender/build passes in an external fixture using packed tarball.
- [ ] **Multi-instance behavior:** Two+ particle components can coexist without ID collision or cross-destroy.
- [ ] **Release readiness:** CI includes pack/install/smoke, not only in-repo build commands.
- [ ] **Semver discipline:** Any export-path removal/condition change is marked as breaking.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| API/docs drift shipped | MEDIUM | Patch release restoring compatibility or docs correction; add export contract test to prevent recurrence |
| SSR boundary leak shipped | HIGH | Hotfix with server-safe guards; publish migration note; add SvelteKit fixture test in CI |
| Lifecycle thrash shipped | MEDIUM | Add guarded reload logic and ownership tracking; publish perf-focused patch and changelog guidance |
| Dependency skew shipped | HIGH | Align versions across workspace, cut coordinated release, validate with tarball consumer tests |
| Release pipeline false green | HIGH | Introduce release-candidate workflow and backfill checks before next publish |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| API/docs drift and contract mismatch | Phase 1 | Contract tests pass; README snippets compile against packed package |
| SSR boundary leaks | Phase 2 | SvelteKit fixture build/prerender passes with tarball install |
| Lifecycle thrash + ID collision | Phase 3 | Multi-instance + reactive-update tests show no cross-destroy/unneeded reload |
| Dependency/version skew | Phase 4 | CI drift check clean; wrapper/demos share approved compatibility matrix |
| Release pipeline false confidence | Phase 5 | Release workflow performs pack/install/smoke + semver gate before publish |

## Sources

- Project baseline and active concerns:
  - `/Users/matteo/Projects/GitHub/tsparticles/svelte/.planning/PROJECT.md` (HIGH)
  - `/Users/matteo/Projects/GitHub/tsparticles/svelte/.planning/codebase/CONCERNS.md` (HIGH)
  - `/Users/matteo/Projects/GitHub/tsparticles/svelte/.github/workflows/nodejs.yml` (HIGH)
  - `/Users/matteo/Projects/GitHub/tsparticles/svelte/components/svelte/package.json` (HIGH)
- Svelte/SvelteKit official guidance:
  - https://svelte.dev/docs/kit/packaging (HIGH)
  - https://svelte.dev/docs/kit/$app-environment (HIGH)
  - https://svelte.dev/docs/svelte/lifecycle-hooks (HIGH)
- Packaging/runtime references:
  - https://nodejs.org/api/packages.html#exports (HIGH)
  - https://vite.dev/guide/build.html#library-mode (MEDIUM)
  - https://pnpm.io/workspaces (HIGH)
  - https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#environment-files (HIGH)

---
*Pitfalls research for: tsParticles Svelte wrapper ecosystem*
*Researched: 2026-04-10*
