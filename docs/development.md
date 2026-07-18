# FormSG Development Guide

Local development, testing, and CI/CD for contributors working in this monorepo. Product behaviour is covered in [`features.md`](./features.md); runtime design in [`architecture.md`](./architecture.md).

---

## Prerequisites

| Tool | Requirement |
|------|-------------|
| Node | `>=22.22` (see root `package.json` `engines`) |
| pnpm | `>=10.30.3` (repo pins `packageManager`) |
| Docker + Docker Compose | Backend and supporting services |
| Python 3.7+ | Optional; LocalStack host tooling if you install it outside Compose |
| nvm (recommended) | Match the Node version the project expects |

macOS is what the core team typically uses; Linux works for Docker-based workflows (this agent environment included).

---

## First-time setup

```bash
nvm install
nvm use
pnpm install
cp .env.example .env   # fill secrets as needed; Compose already injects many defaults
```

On Docker Desktop for Mac, allocate at least **4 GB** RAM to Docker.

Authoritative env documentation: [`configuration-reference.md`](./configuration-reference.md). Runtime schemas live in `apps/backend/src/app/config/` — **`.env.example` is not exhaustive**.

---

## Running locally

### All-in-one

Build frontend dependencies once, then:

```bash
pnpm -r --filter formsg-frontend... build
pnpm dev
```

`pnpm dev` starts concurrently:

1. `docker compose up` — backend, MongoDB, MockPass, LocalStack, MailDev, Stripe CLI
2. Vite frontend (`pnpm dev:frontend`)
3. GuardDuty virus-scanner emulator (`pnpm dev:virus-scanner-guardduty`)
4. PDF generator emulator (`pnpm dev:pdf-gen`)

### Typical split workflow

```bash
pnpm dev:frontend          # http://localhost:5173
docker compose up          # API http://localhost:5001
pnpm dev:pdf-gen           # only if you need invoices / PDF auto-replies
pnpm dev:virus-scanner-guardduty   # only if testing attachments
```

| Surface | URL |
|---------|-----|
| React app | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| MailDev UI | http://localhost:1080 |

### Adding dependencies

```bash
pnpm add <pkg>   # from the appropriate package directory / filter
```

After backend dependency changes:

```bash
docker compose up --build --renew-anon-volumes
```

Frontend is not Dockerised in local mode — install and restart Vite as usual.

### MockPass admin login (local)

1. Open the login page and choose Singpass login.
2. Select `S9812379B [MyInfo]`.
3. Use profile email `lim_yong_xiang@was.gov.sg`.

Renew the `formsg_mongodb_data` volume if mock identity state becomes stale.

### LocalStack

`init-localstack.sh` creates attachment/image/logo/static/payment/quarantine/clean buckets, enables scanner-bucket versioning, and creates the webhook SQS queue + DLQ. Compose wires `AWS_ENDPOINT=http://127.0.0.1:4566` into the backend.

---

## Useful root scripts

| Script | Purpose |
|--------|---------|
| `pnpm build` | Clean + build SDK, shared, frontend, backend |
| `pnpm start` | Start production-built backend |
| `pnpm lint` | Lint backend, shared, frontend |
| `pnpm test` | Backend + shared + frontend unit tests |
| `pnpm test:backend` / `test:frontend` / `test:shared` / `test:sdk` | Targeted suites |
| `pnpm test:e2e-v2` | Build then Playwright |
| `pnpm storybook` | Frontend Storybook |

Package-local scripts follow the same `pnpm --filter <name> …` pattern.

---

## Testing

Docker Compose is **not** the test runner. Stop conflicting local containers (especially ports used by Playwright) when running e2e.

### Unit / integration

| Area | Runner | Location |
|------|--------|----------|
| Backend | Jest + `ts-jest`, mongodb-memory-server | Colocated `*.spec.ts` / `*.test.ts` under `apps/backend/src/`; setup in `apps/backend/__tests__/` |
| Frontend | Vitest + jsdom + Testing Library | Colocated under `apps/frontend/src/` (`vitest.config.ts`) |
| Shared | Jest | `packages/shared/**/__tests__/` |
| SDK | Jest | `packages/sdk/spec/` |
| PDF Lambda | Jest | `services/pdf-gen-sparticuz/src/__tests__/` |
| GuardDuty Lambda | Jest present | `services/virus-scanner-guardduty/src/__tests__/` |

```bash
pnpm test
pnpm test:backend:ci    # CI-tuned backend Jest
pnpm test:frontend
pnpm test:sdk
```

### End-to-end (Playwright)

Config: `playwright.config.ts`. Suites: `__tests__/e2e/` (admin login, encrypted submission, and related flows). Chromium and Firefox projects are configured; one worker, HTML reports, traces on first retry.

```bash
pnpm test:e2e-v2
# or, if already built:
pnpm exec playwright test
```

E2e expects a built app plus MockPass, MailDev, and a mock webhook receiver (see test global setup). Broader cross-browser coverage may use BrowserStack; there is no BrowserStack workflow checked into `.github/workflows/` today.

---

## CI/CD overview

Workflows live under `.github/workflows/`.

### Continuous integration

| Workflow | Role |
|----------|------|
| `ci.yml` | Path-filtered build/test/lint for frontend, backend, shared, SDK; Node 22.22 + pnpm; Datadog Test Visibility |
| `playwright.yml` | Matrix of browser × suite; uploads reports |
| `chromatic.yml` | Storybook visual review (frontend + React Email preview); auto-accept on `develop` |
| `codeql-analysis.yml` | CodeQL on `develop`, PRs, weekly schedule |
| `lint-pr.yml` | Conventional Commit-compatible PR titles |

### Release and deploy

| Workflow | Role |
|----------|------|
| `release.yml` | Manual orchestrator: version bump, changelog, tags, GitHub releases, image build, staging/prod deploys, optional SDK publish |
| `build-base-images.yml` | GHCR `build-base` / `runtime-base` images |
| `build-release-image.yml` | Tagged application release images |
| `deploy-ecs.yml` (+ env wrappers) | OIDC → ECR → ECS/CodeDeploy; sync static assets to S3; Datadog source maps |
| `deploy-pdf-gen-lambda.yml` (+ env wrappers) | SAM deploy for PDF Lambda |
| `aws-deploy-scanner-guardduty-iac.yml` (+ env wrappers) | Serverless Framework deploy for GuardDuty scanner |
| `publish-sdk.yml` | npm trusted publishing via GitHub OIDC for `@opengovsg/formsg-sdk` |

ECS descriptors: `deploy/ecs-task-definition.json`, `deploy/appspec.yml`.

---

## Containers

| File | Use |
|------|-----|
| `Dockerfile.development` | Local backend image used by Compose |
| `Dockerfile.production` | Multi-stage release image (non-root, port 4545) |
| `Dockerfile.base` | Base image support for builds |

---

## MongoDB maintenance scripts

`scripts/` holds dated one-off migration and cleanup scripts (payments flags, MRF field locking, encryption boundary changes, multi-language stats, etc.). Treat them as **operational history**, not as a supported CLI. Prefer new migrations as carefully reviewed, dated scripts with clear runbooks.

---

## Contributing conventions

- Discuss material changes via GitHub Issues / maintainers before large PRs — see [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- Conventional Commits; review-by-commit narrative — see [`docs/agents/commit-style.md`](./agents/commit-style.md).
- Sign the CLA when required by the project.
- Agent triage / domain reading order — see [`CLAUDE.md`](../CLAUDE.md) and `docs/agents/`.

---

## Troubleshooting pointers

| Symptom | Things to check |
|---------|-----------------|
| Frontend API calls fail | Backend on `:5001`; Vite proxy to `/api/v3` |
| Attachments hang / fail | GuardDuty scanner process running; LocalStack buckets created |
| PDF / invoice missing | `pnpm dev:pdf-gen` and Lambda endpoint env vars |
| No mail | MailDev up; `SES_HOST=maildev`, `SES_PORT=1025` |
| Singpass / MyInfo broken locally | MockPass healthy; JWKS / cert paths from Compose |
| Stale Docker deps | `docker compose up --build --renew-anon-volumes` |

For self-hosting production issues, prefer the [GitBook guide](https://ogp-international.gitbook.io/ogp-international-hub/self-hosting/formsg) and [`aws-production-deployment.md`](./aws-production-deployment.md).
