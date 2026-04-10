# External Integrations

**Analysis Date:** 2026-04-10

## APIs & External Services

**Package Registry & Source Hosting:**
- npm Registry - Package publication target for the Svelte wrapper.
  - SDK/Client: npm CLI via package scripts in `components/svelte/package.json` (`prepublishOnly`, `package`).
  - Auth: Not declared in repository files (expected through local/CI npm credentials outside repo).
- GitHub (repository + CI runtime) - Source hosting and CI execution.
  - SDK/Client: GitHub Actions workflow in `.github/workflows/nodejs.yml`.
  - Auth: GitHub-provided workflow token context (implicit), no custom token wiring detected in tracked source.

**Runtime Content Loading:**
- tsParticles JSON configuration URL input - Optional runtime loading of particle config through the `url` prop consumed by `tsParticles.load`.
  - SDK/Client: `@tsparticles/engine` in `components/svelte/src/lib/Particles.svelte`.
  - Auth: Not applicable (URL-based fetch behavior is delegated to tsParticles; no auth env vars implemented in this repo).

## Data Storage

**Databases:**
- Not detected (no ORM/database client imports and no DB connection config files found).
  - Connection: Not applicable.
  - Client: Not applicable.

**File Storage:**
- Local filesystem only for source/assets/build artifacts (`apps/svelte/public`, `apps/svelte-kit/src/lib/images`, workspace package outputs under `components/svelte/dist`).

**Caching:**
- CI dependency cache via GitHub Actions cache for pnpm store in `.github/workflows/nodejs.yml`.
- No runtime application cache service (Redis/Memcached/CDN API client) detected.

## Authentication & Identity

**Auth Provider:**
- None for application runtime (no login/auth library or identity provider integration found in `components/svelte/src`, `apps/svelte/src`, `apps/svelte-kit/src`).
  - Implementation: Not applicable.

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Bugsnag/Datadog SDK imports).

**Logs:**
- Console logging only in app/library code (`console.log` in `apps/svelte/src/App.svelte`, `console.error` in `components/svelte/src/lib/particlesStore.ts`).
- CI logs through GitHub Actions job output in `.github/workflows/nodejs.yml`.

## CI/CD & Deployment

**Hosting:**
- Library distribution through npm (`components/svelte/package.json`).
- Demo app hosting target not explicitly pinned; `@sveltejs/adapter-auto` is configured in `components/svelte/svelte.config.js` and `apps/svelte-kit/svelte.config.js`.

**CI Pipeline:**
- GitHub Actions workflow (`.github/workflows/nodejs.yml`) for push/PR on `main`, `legacy`, `dev`.
- Pipeline installs dependencies with pnpm and runs monorepo build via `npx lerna run build:ci`.

## Environment Configuration

**Required env vars:**
- `ROLLUP_WATCH` (build mode toggle in `apps/svelte/rollup.config.mjs`).
- No required runtime API credential variables detected in tracked source.

**Secrets location:**
- GitHub Actions secrets/context for CI (example commented variable reference in `.github/workflows/nodejs.yml`).
- Local developer secret files are not detected in repository scan; none are required by current code paths.

## Webhooks & Callbacks

**Incoming:**
- None detected (no API route handlers or webhook endpoints in `apps/svelte-kit/src/routes` or other workspace code).

**Outgoing:**
- Component-level callback event dispatch for particles lifecycle, exposed as `particlesLoaded` event from `components/svelte/src/lib/Particles.svelte`.
- No HTTP webhook emission/integration detected.

---

*Integration audit: 2026-04-10*
