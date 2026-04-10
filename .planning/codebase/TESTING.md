# Testing Patterns

**Analysis Date:** 2026-04-10

## Test Framework

**Runner:**
- Not detected (no Jest/Vitest/Mocha/Playwright/Cypress configuration files found in repository root, `apps/`, or `components/`).
- Config: Not applicable

**Assertion Library:**
- Not detected

**Run Commands:**
```bash
Not detected              # Run all tests
Not detected              # Watch mode
Not detected              # Coverage
```

## Test File Organization

**Location:**
- No `*.test.*` or `*.spec.*` files detected across `/Users/matteo/Projects/GitHub/tsparticles/svelte`.

**Naming:**
- Not applicable (no test files present).

**Structure:**
```
Not applicable - test directories/files not present.
```

## Test Structure

**Suite Organization:**
```typescript
Not applicable - no describe/it/test blocks detected in source tree.
```

**Patterns:**
- Setup pattern: Not applicable
- Teardown pattern: Not applicable
- Assertion pattern: Not applicable

## Mocking

**Framework:**
- Not detected

**Patterns:**
```typescript
Not applicable - no mocking utilities (vi/jest/sinon) detected.
```

**What to Mock:**
- No repository standard detected. When introducing tests, mock external engine-loading boundaries such as `@tsparticles/engine` calls used in `components/svelte/src/lib/index.ts` and `components/svelte/src/lib/Particles.svelte`.

**What NOT to Mock:**
- No repository standard detected. Prefer not mocking pure/local logic like `modulo()` in `apps/svelte-kit/src/routes/Counter.svelte` and store state transitions in `components/svelte/src/lib/particlesStore.ts`.

## Fixtures and Factories

**Test Data:**
```typescript
Not applicable - no fixtures/factories present.
```

**Location:**
- Not detected

## Coverage

**Requirements:**
- None enforced (no coverage tooling/configuration detected in `package.json` files or CI workflow).

**View Coverage:**
```bash
Not detected
```

## Test Types

**Unit Tests:**
- Not used (no unit test files or runner config detected).

**Integration Tests:**
- Not used (no integration test files or runner config detected).

**E2E Tests:**
- Not used (no Playwright/Cypress configuration detected).

## Common Patterns

**Async Testing:**
```typescript
Not applicable - no tests present.
```

**Error Testing:**
```typescript
Not applicable - no tests present.
```

## Quality Gates Currently Used (Non-test)

- Type checking is part of package scripts:
  - `components/svelte/package.json` → `check` / `check:watch`
  - `apps/svelte-kit/package.json` → `check` / `check:watch`
  - `apps/svelte/package.json` → `check`
- Lint/format checks are defined for active SvelteKit/library packages:
  - `components/svelte/package.json` → `lint`, `format`
  - `apps/svelte-kit/package.json` → `lint`, `format`
- CI runs build validation only via Lerna in `.github/workflows/nodejs.yml` (`npx lerna run build:ci`), without a dedicated test step.

---

*Testing analysis: 2026-04-10*
