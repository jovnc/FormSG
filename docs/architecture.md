# FormSG Architecture

This document describes how FormSG is structured as a monorepo, how its runtime components interact, and how data flows through form creation and submission. It complements the self-hosting guides under [`docs/`](./README.md) and the [GitBook self-hosting guide](https://ogp-international.gitbook.io/ogp-international-hub/self-hosting/formsg).

**Current application version:** see root `package.json` (independently versioned SDK lives in `packages/sdk`).

---

## High-level overview

FormSG is a government form builder. Public officers create and manage forms in an admin SPA; respondents fill public forms in a separate public-form experience. Both talk to a single Express backend over `/api/v3` (and a smaller `/api/public/v1` surface).

```text
Browser (admin / respondent)
  └─ React SPA (Vite)
       └─ /api/v3  (+ /api/public/v1, auth callbacks)
            └─ Express backend
                 ├─ MongoDB (Mongoose)
                 ├─ S3-compatible object storage
                 ├─ GuardDuty virus-scanner Lambda
                 ├─ PDF generator Lambda
                 ├─ SQS webhook queue (+ DLQ)
                 ├─ SMTP / SES mail
                 ├─ Stripe (payments)
                 └─ Singpass / Corppass / sgID / MyInfo (identity)
```

There is **no Redis** in the current architecture. Admin sessions are stored with `connect-mongo`.

---

## Monorepo layout

Workspace members are defined in `pnpm-workspace.yaml` (`apps/*`, `packages/*`, `services/*`). Tooling requires **Node ≥ 22.22** and **pnpm ≥ 10.30.3**.

| Path | Package | Role |
|------|---------|------|
| `apps/frontend` | `formsg-frontend` | React 18 + Vite + Chakra UI admin and public-form SPA |
| `apps/backend` | `formsg-backend` | Express API, session auth, submission pipelines, SPA static serving in production |
| `packages/shared` | `formsg-shared` | Shared types, constants, validation, crypto helpers, form/payment/workflow logic |
| `packages/sdk` | `@opengovsg/formsg-sdk` | Published SDK for webhook signature verification and submission/attachment decryption |
| `packages/react-email-preview` | `formsg-react-email-preview` | Local/Storybook preview of React Email templates |
| `services/pdf-gen-sparticuz` | `formsg-pdf-gen-sparticuz` | Lambda: HTML → A4 PDF (Puppeteer + `@sparticuz/chromium`) |
| `services/virus-scanner-guardduty` | `formsg-virus-scanner-guardduty` | Lambda: S3 quarantine → GuardDuty scan → clean bucket |
| `services/form-payment-reconciliation` | `formsg-payment-reconciliation` | Scheduled Lambda: Stripe ↔ payment record reconciliation |
| `deploy/` | — | ECS task definition and CodeDeploy `appspec.yml` |
| `scripts/` | — | One-off MongoDB maintenance / migration scripts (historical ops, not app modules) |
| `__tests__/e2e/` | — | Playwright end-to-end suites |

Root build order (`pnpm build`): **SDK → shared → frontend → backend**.

---

## Frontend

Key entry points:

- `apps/frontend/src/app/AppRouter.tsx` — routing
- `apps/frontend/src/features/` — feature modules (admin form, public form, workspace, login, payments UI, etc.)
- `apps/frontend/src/templates/Field/` — public field renderers
- `apps/frontend/src/services/ApiService.ts` — credentialed Axios client
- `apps/frontend/src/i18n/` — i18next locales
- `apps/frontend/vite.config.ts` — build; proxies `/api/v3` to `http://127.0.0.1:5001` in development

Notable stack: React 18, Chakra UI 2, React Router 6, React Hook Form, React Query, Zustand, Stripe Elements, GrowthBook, Datadog RUM, TweetNaCl (via SDK), Cloudflare Turnstile.

Dev server: **http://localhost:5173**. Production build output (`apps/frontend/dist`) is served by Express.

---

## Backend

Key entry points:

- `apps/backend/src/app/server.ts` — process entry
- `apps/backend/src/app/loaders/` — MongoDB, Express, Stripe, sessions, security headers, logging, Datadog
- `apps/backend/src/app/routes/` — HTTP composition
- `apps/backend/src/app/modules/` — domain controllers/services
- `apps/backend/src/app/models/` — Mongoose models
- `apps/backend/src/app/config/` — Convict config schemas and feature configs

### API surface

| Prefix | Purpose |
|--------|---------|
| `/api/v3` | Primary application API (`admin`, `user`, `auth`, `forms`, `payments`, `singpass`, `corppass`, `feature-flags`, …) |
| `/api/public/v1` | External/public administration API |
| `/sp/.well-known/jwks.json` (and legacy Singpass JWKS paths) | Relying-party JWKS |
| `/sgid` | Public-form sgID callbacks |
| MyInfo callback paths | MyInfo OAuth return |
| `/` | SPA HTML + static assets (production) |

Route composition starts at `apps/backend/src/app/routes/api/api.routes.ts` and `.../v3/v3.routes.ts`.

### Domain modules (selected)

| Module | Responsibility |
|--------|----------------|
| `auth` | Admin OTP, sgID admin login, SSO, WOG AD |
| `spcp` / `sgid` / `myinfo` | Respondent identity and MyInfo prefill |
| `form` | Public and admin form CRUD / settings |
| `submission` | Email / Storage / Multi-respondent pipelines, attachments, encryption, downloads |
| `payments` | Stripe Connect, intents, webhooks, invoices |
| `webhook` | Signed delivery + SQS retries |
| `verification` / `verified-content` | Verified email/mobile and signed identity content |
| `workspace` / `user` | Workspaces, collaborators, ownership |
| `billing`, `analytics`, `feedback`, `bounce`, `feature-flags`, `intranet` | Supporting product surfaces |

Production container (`Dockerfile.production`) runs as non-root `formsguser`, exposes **port 4545**, and starts via `pnpm start`.

---

## Shared packages and cryptography

Both apps depend on `formsg-shared` for DTOs, field definitions, enums (`FormResponseMode`, `FormAuthType`, `BasicField`, …), validation, form logic, and shared crypto helpers.

Both apps use `@opengovsg/formsg-sdk`:

- **Backend** — encrypt submissions/attachments, sign webhooks and verified content
- **Frontend** — generate form keypairs; decrypt responses in the browser for Storage / MRF modes
- **Integrators** — verify `X-FormSG-Signature` and decrypt webhook payloads

Encryption uses `x25519-xsalsa20-poly1305` (TweetNaCl). The form **public key** lives with FormSG; the **secret key** stays with the form administrator (downloaded at creation).

---

## Data and storage

### MongoDB

Primary application database via Mongoose. Models cover forms, users, workspaces, submissions, pending submissions, payments, agencies, feedback, feature flags, verification records, and related entities under `apps/backend/src/app/models/`.

Local Compose uses Bitnami MongoDB 4.4 (`database` service), initialized by `init-mongo.js`.

### Object storage (S3-compatible)

Configured buckets (see `.env.example` and Convict schemas) typically include:

| Concern | Example env vars |
|---------|------------------|
| Encrypted attachments | `ATTACHMENT_S3_BUCKET` |
| Images / logos | `IMAGE_S3_BUCKET`, `LOGO_S3_BUCKET` |
| Static frontend assets | `STATIC_ASSETS_S3_BUCKET` |
| Payment proofs | `PAYMENT_PROOF_S3_BUCKET` |
| Virus-scan quarantine / clean | `GUARDDUTY_QUARANTINE_S3_BUCKET`, `GUARDDUTY_CLEAN_S3_BUCKET` |

Local development uses LocalStack (`init-localstack.sh` creates buckets, versioning, and the webhook SQS queue + DLQ). Production uses regional S3; code also recognizes Cloudflare R2-style endpoints.

---

## Submission pipelines

### Storage mode (`FormResponseMode.Encrypt`)

Canonical public endpoint: `POST /api/v3/forms/:formId/submissions/storage`.

Typical flow:

1. Client may request presigned POST data and upload attachments to the **quarantine** bucket.
2. Backend invokes the GuardDuty scanner Lambda; clean files move to the **clean** bucket.
3. Backend validates fields, auth, CAPTCHA/Turnstile, limits, MyInfo hashes, payment metadata, whitelist / single-submission rules.
4. Responses and attachments are encrypted with the form public key and persisted.
5. Optional notification emails and signed webhooks fire (webhooks also enqueue SQS retries).

Admins stream encrypted NDJSON and decrypt in-browser (`apps/frontend/src/features/admin-form/responses/.../storage/`).

### Multi-respondent forms (MRF)

Extends Storage mode with ordered workflows, step notifications, field locking, status tracker, reminders, and per-submission keys. See `packages/shared/types/form/workflow.ts` and `apps/backend/src/app/modules/submission/multirespondent-submission/`.

### Email mode (legacy)

`FormResponseMode.Email` remains in types and migration tooling, but Email Mode is being retired (`isForceConvertToStorageMode`, email→storage migration UI, `KILL_EMAIL_MODE_*` config). New work should assume Storage or MRF.

---

## Sidecar services

### Virus scanning (GuardDuty)

`services/virus-scanner-guardduty` — container-image Lambda that polls `GuardDutyMalwareScanStatus` on quarantine objects, rejects threats, and copies clean objects. Locally, GuardDuty itself is skipped and uploads are treated as clean (`pnpm dev:virus-scanner-guardduty`).

> The root README previously mentioned a ClamAV scanner; that path has been removed. Use GuardDuty only.

### PDF generation

`services/pdf-gen-sparticuz` — SAM/Lambda function accepting `{ html }`, rendering A4 PDF with backgrounds (invoices, auto-reply / response PDFs). Local SAM endpoint commonly on port **9997**.

### Payment reconciliation

`services/form-payment-reconciliation` — scheduled job to align Stripe events with FormSG payment documents, retry missed deliveries, and cancel stale intents.

### Mail

Nodemailer over SES SMTP in production; MailDev in local Compose (UI **http://localhost:1080**, SMTP **1025**). React Email templates live under `apps/backend/src/app/views/templates/`.

---

## Local infrastructure map

`docker-compose.yml` (development only):

| Service | Role | Host access |
|---------|------|-------------|
| `backend` | API container | `localhost:5001` |
| `database` | MongoDB 4.4 | internal |
| `mockpass` | Singpass / Corppass / MyInfo emulator | via backend network (`5156`) |
| `localstack` | S3 + SQS | `4566` |
| `maildev` | Dev mail | UI `1080`, SMTP `1025` |
| `stripe-cli` | Forwards Stripe webhooks to `/api/v3/notifications/stripe` | — |

`pnpm dev` runs Compose + Vite frontend + GuardDuty scanner + PDF gen concurrently. Frontend is **not** containerized in local dev.

---

## Production infrastructure (AWS)

FormSG production experience is AWS-centric (see also [`aws-production-deployment.md`](./aws-production-deployment.md) and [`infrastructure-guidance.md`](./infrastructure-guidance.md)).

| Piece | Mechanism |
|-------|-----------|
| App runtime | ECS Fargate (`deploy/ecs-task-definition.json`), container port **4545**, Datadog agent sidecar |
| Deploy | CodeDeploy ECS blue/green (`deploy/appspec.yml`), GitHub Actions OIDC → ECR → ECS |
| Config / secrets | SSM Parameter Store injected into the task definition |
| Static assets | Synced from the release image to S3 during deploy |
| Lambdas | PDF gen (SAM) and GuardDuty scanner (Serverless Framework + container image) |
| Region | `ap-southeast-1` in the checked-in task definition |

Environment wrappers in `.github/workflows/` cover production, staging, UAT, and alternate staging targets (`stg-alt`, `stg-alt2`, `stg-alt3`).

---

## Observability and feature flags

- **Logging / APM** — Winston + Datadog (backend APM; frontend RUM)
- **Feature flags** — GrowthBook (`GROWTHBOOK_CLIENT_KEY`); shared flag names in `packages/shared/constants/feature-flags.ts`
- **Analytics** — product analytics modules + optional Google Analytics / WOGAA hooks

---

## Related documents

| Document | When to use it |
|----------|----------------|
| [`features.md`](./features.md) | Product capability inventory |
| [`development.md`](./development.md) | Local setup, tests, CI/CD |
| [`configuration-reference.md`](./configuration-reference.md) | Environment variables (also check Convict schemas — `.env.example` is not exhaustive) |
| [`security.md`](./security.md) | Deployment security patterns |
| [`component-customization.md`](./component-customization.md) | Swapping email, storage, IdP, etc. |
| User guide [guide.form.gov.sg](https://guide.form.gov.sg/) | End-user form creation (not this repo) |
