# FormSG Features

Product capability inventory aligned with the current codebase. For how these pieces connect at runtime, see [`architecture.md`](./architecture.md). For end-user how-tos, use [guide.form.gov.sg](https://guide.form.gov.sg/).

---

## Form builder and field types

FormSG provides a drag-and-drop style builder with design, logic, settings, preview, templates, and duplication. Field type enum: `BasicField` in `packages/shared/types/field/base.ts`.

| Field | `BasicField` value | Notes |
|-------|--------------------|-------|
| Section / header | `section` | Layout |
| Statement | `statement` | Static content |
| Email | `email` | Optionally verifiable |
| Mobile | `mobile` | Optionally verifiable (SMS) |
| Home number | `homeno` | |
| Number | `number` | |
| Decimal | `decimal` | |
| Image | `image` | Stored in image bucket |
| Short text | `textfield` | |
| Long text | `textarea` | |
| Dropdown | `dropdown` | |
| Country / region | `country_region` | |
| Yes / No | `yes_no` | |
| Checkbox | `checkbox` | |
| Radio | `radiobutton` | |
| Attachment | `attachment` | Virus-scanned, then encrypted in Storage/MRF |
| Date | `date` | |
| Rating | `rating` | |
| NRIC | `nric` | Singapore NRIC validation |
| Table | `table` | |
| UEN | `uen` | Singapore UEN validation |
| Children | `children` | MyInfo compound / child records |
| Address | `address` | |
| Signature | `signature` | |

Public renderers: `apps/frontend/src/templates/Field/`. Builder editors: `apps/frontend/src/features/admin-form/create/builder-and-design/.../edit-fieldtype/`.

### Conditional logic

Admins can show/hide or otherwise branch fields based on answers (`apps/frontend/src/features/logic/` and shared form-logic utilities in `packages/shared`).

---

## Response modes

Defined by `FormResponseMode` in `packages/shared/types/form/form.ts`:

| Mode | Value | Summary |
|------|-------|---------|
| **Storage (Encrypt)** | `encrypt` | End-to-end style public-key encryption; ciphertext stored in MongoDB/S3; admin decrypts with secret key |
| **Multi-respondent (MRF)** | `multirespondent` | Storage-backed multi-step workflows across respondents |
| **Email** | `email` | **Legacy / being retired** — cleartext emailed to recipients; migrate to Storage |

### Storage mode highlights

- Server-side encryption after validation and malware scanning
- Encrypted attachment objects in S3
- Admin browser decryption and CSV / attachment download
- Optional email notifications (without replacing encrypted storage)
- Webhooks with encrypted payloads

### Multi-respondent (MRF) highlights

- Ordered workflow steps and respondent assignment
- Step-level notifications and reminder emails
- Field locking after earlier steps complete
- Status tracker for respondents
- Per-submission secret keys / encrypted content

Relevant paths:

- Backend: `apps/backend/src/app/modules/submission/multirespondent-submission/`
- Frontend workflow builder: `apps/frontend/src/features/admin-form/create/workflow/`
- Status tracker: `apps/frontend/src/features/public-form/components/StatusTrackerPage/`
- Shared types: `packages/shared/types/form/workflow.ts`

### Email mode status

Migration tooling lives under `apps/frontend/src/features/admin-form/email-migration/`. Prefer documenting and operating Storage or MRF for new deployments.

---

## Authentication and identity

### Form administrators

| Mechanism | Typical use |
|-----------|-------------|
| Government email + OTP | Default when SSO is incomplete |
| sgID profile login | Admin login via sgID |
| Generic OIDC SSO | `SSO_DISCOVERY_URL` / client credentials |
| Whole-of-Government AD (Azure MSAL) | `WOGAD_*` configuration |

Routes: `apps/backend/src/app/routes/api/v3/auth/`; UI: `apps/frontend/src/features/login/`.

### Form respondents

`FormAuthType` supports:

| Type | Description |
|------|-------------|
| `NIL` | No respondent login |
| `SP` | Singpass |
| `CP` | Corppass |
| `MyInfo` | Singpass + MyInfo attribute prefill |
| `SGID` | sgID |
| `SGID_MyInfo` | sgID + MyInfo |

Additional respondent controls:

- Collect authenticated submitter ID
- Encrypted respondent whitelists
- Single submission per authenticated respondent
- Signed **verified content** for identity attributes (separate from ordinary unverified answers)

MyInfo attribute catalogue: `packages/shared/constants/field/myinfo/`. Local identity emulation: **MockPass** in Docker Compose.

---

## Verified fields

Email and mobile fields can require OTP verification (SES / Postman SMS). Verified values can be signed into submission payloads via verification / verified-content modules so recipients and webhook consumers can trust them independently of free-text answers.

---

## Payments

Storage-mode forms can collect payments via **Stripe / Stripe Connect**.

Capabilities:

- Fixed amount
- Variable amount (min / max)
- Product / itemised catalogue (optional multi-product)
- PayNow modeled as payment method
- GST and business metadata
- Receipts / invoices (PDF Lambda)
- Status tracking, refunds, disputes, cancellation, payouts
- Duplicate-payment checks
- Scheduled reconciliation Lambda

Paths:

- Backend: `apps/backend/src/app/modules/payments/`
- Public UI: `apps/frontend/src/features/public-form/components/FormPaymentPage/`
- Admin settings: `apps/frontend/src/features/admin-form/settings/components/PaymentSettingsSection/`
- Shared types: `packages/shared/types/payment.ts`
- Reconciliation: `services/form-payment-reconciliation/`

Flow sketch: create pending encrypted submission + Stripe PaymentIntent → Stripe webhook finalizes payment and submission processing → reconciliation repairs missed transitions.

---

## Webhooks

Storage / MRF forms can POST signed events to an admin-configured URL.

| Property | Detail |
|----------|--------|
| Signature header | `X-FormSG-Signature` |
| Algorithm | Ed25519 (SDK verification) |
| Bound fields | Destination URL, submission ID, form ID, timestamp |
| Replay window | ~5 minutes in SDK |
| Payload | Encrypted submission + pre-signed encrypted attachment URLs |
| Delivery | Immediate attempt + SQS delayed retries + DLQ |
| Client library | `@opengovsg/formsg-sdk` (`packages/sdk`) |

Also see contributor [FormSG Ruby SDK](https://github.com/opengovsg/formsg-ruby-sdk).

---

## Multi-language forms

Supported form languages (`Language` in shared form types):

- English — `en-SG`
- Chinese — `zh-SG`
- Malay — `ms-SG`
- Tamil — `ta-SG`

Translatable surfaces include start/end pages, field titles/descriptions/options, logic copy, tables, and other respondent-facing content. Selected language is sent as `X-Formsg-Selected-Form-Language`. Admin UI: `MultiLanguageSection` under form settings. App chrome i18n: `apps/frontend/src/i18n/`.

---

## Workspaces and collaboration

- Workspace-based form organization
- Collaborators / ownership transfer
- Form templates and duplication
- Billing surfaces for agency usage (where enabled)

Frontend: `apps/frontend/src/features/workspace/`. Backend: `workspace` and `user` modules.

---

## Public-form experience

Beyond field entry, public forms support:

- Save draft (including prefilled values)
- CAPTCHA (reCAPTCHA) and Cloudflare Turnstile
- Payment checkout pages
- Status tracking for MRF
- Respondent issue reporting
- Form-not-found / maintenance / banner messaging
- Optional AI-assisted form creation (Azure OpenAI — admin-side)

Feature modules under `apps/frontend/src/features/public-form/` and related admin settings.

---

## Notifications and bounce handling

- OTP and transactional mail via SES SMTP
- SMS via Postman campaign APIs (`POSTMAN_*` / mock flag)
- SES bounce handling and bounce records
- MRF step / reminder emails
- Payment receipt emails with PDF attachments

---

## Admin insights and feedback

- Response viewing / decryption (Storage)
- Charts and feedback collection
- Admin feedback schema (including rating scales)
- Feature announcements / what’s-new surfaces
- GrowthBook-gated rollouts (e.g. workflow builder redesign flags)

---

## Link shortening

Optional GoGov integration (`GOGOV_API_KEY`, `GOGOV_BASE_URL`) for shortened public form links (`apps/frontend/src/features/link-shortener/`).

---

## Security-related product features

| Feature | Intent |
|---------|--------|
| Public-key encryption (Storage / MRF) | Confidentiality of stored answers |
| Attachment malware scanning | Before encryption / persistence |
| Signed webhooks | Authenticity for integrators |
| Verified email/mobile & identity content | Integrity of high-trust attributes |
| Rate limits | Submissions, OTP, whitelist upload/download |
| Maintenance / site banners | Operational messaging without deploy |
| RUM privacy masking | Secret keys / decrypted responses masked in session replay |

See also [`security.md`](./security.md).

---

## SDK capabilities

Published package: [`@opengovsg/formsg-sdk`](https://www.npmjs.com/package/@opengovsg/formsg-sdk) from `packages/sdk`.

- Webhook signature verification
- Submission and attachment decryption
- Verification helpers
- Response-version adapters (including ongoing V4 response migration work)

Docs: `packages/sdk/README.md`.

---

## Feature flags

Runtime flags via GrowthBook; shared names in `packages/shared/constants/feature-flags.ts`. Flags gate gradual UI/backend rollouts without requiring a full cutover deploy.

---

## Singapore-specific vs portable features

| More Singapore-specific | Generally portable |
|-------------------------|--------------------|
| Singpass / Corppass / MyInfo / sgID | Form builder, fields, logic, Storage encryption |
| NRIC / UEN field types | Email OTP admin login (reconfigurable) |
| Postman SMS campaigns | S3-compatible storage, SMTP mail |
| WOG AD / agency billing patterns | Stripe payments, webhooks, MRF workflows |
| GoGov short links | Multi-language (customise locale set as needed) |

Self-hosters typically replace or disable Singapore IdPs and SMS while keeping Storage mode, builder, and webhooks. See [`component-customization.md`](./component-customization.md) and [`evaluation-guide.md`](./evaluation-guide.md).
