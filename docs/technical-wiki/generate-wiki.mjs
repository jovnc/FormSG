import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const assetsDir = join(root, 'assets')

const nav = [
  {
    group: 'Start here',
    items: [
      ['index.html', 'Overview'],
      ['repository-map.html', 'Repository map'],
      ['architecture.html', 'Architecture'],
    ],
  },
  {
    group: 'Applications',
    items: [
      ['frontend.html', 'Frontend'],
      ['backend.html', 'Backend'],
      ['shared-sdk.html', 'Shared packages and SDK'],
      ['services.html', 'Services and jobs'],
    ],
  },
  {
    group: 'Product domains',
    items: [
      ['forms-submissions.html', 'Forms and submissions'],
      ['auth-access.html', 'Auth and access'],
      ['payments.html', 'Payments'],
      ['integrations.html', 'Integrations'],
      ['data-flows.html', 'Data flows'],
    ],
  },
  {
    group: 'Build and operate',
    items: [
      ['local-development.html', 'Local development'],
      ['testing.html', 'Testing'],
      ['ci-cd-deployment.html', 'CI/CD and deployment'],
      ['configuration.html', 'Configuration'],
      ['operations-migrations.html', 'Operations and migrations'],
    ],
  },
  {
    group: 'Reference',
    items: [
      ['extension-guides.html', 'Extension guides'],
      ['key-file-index.html', 'Key file index'],
      ['glossary-gotchas.html', 'Glossary and gotchas'],
    ],
  },
]

const pages = [
  {
    file: 'index.html',
    title: 'Overview',
    description:
      'A comprehensive engineering-oriented static wiki for the FormSG monorepo.',
    body: `
      <section class="hero">
        <p class="eyebrow">FormSG technical wiki</p>
        <h1>Repository guide for engineers building, extending, and operating FormSG.</h1>
        <p class="lede">This wiki maps the FormSG v7.34.3 pnpm monorepo from runtime entry points to domain workflows, deployment pipelines, local commands, extension points, and operational gotchas. It is static HTML checked into the repository and does not require a build step to view.</p>
        <div class="actions">
          <a class="button primary" href="architecture.html">Understand architecture</a>
          <a class="button" href="local-development.html">Run locally</a>
          <a class="button" href="extension-guides.html">Extend safely</a>
        </div>
      </section>

      <section class="section-card">
        <h2>System at a glance</h2>
        <div class="grid four">
          <article class="stat"><strong>Workspace</strong><span><code>apps/*</code>, <code>packages/*</code>, <code>services/*</code> through pnpm workspaces</span></article>
          <article class="stat"><strong>Runtime</strong><span>Node <code>&gt;=22.22</code>, pnpm <code>10.30.3</code>, MongoDB, AWS services</span></article>
          <article class="stat"><strong>Frontend</strong><span>React 18, Vite, Chakra UI, React Router v6, React Query v3, Zustand</span></article>
          <article class="stat"><strong>Backend</strong><span>Express 4, TypeScript, Mongoose, sessions, neverthrow, Datadog</span></article>
        </div>
      </section>

      <section class="section-card">
        <h2>Primary mental model</h2>
        <div class="flow">
          <div><strong>1. Shared contract</strong><span><code>packages/shared</code> defines fields, forms, payments, logic, validation, and constants used by both applications.</span></div>
          <div><strong>2. Frontend experience</strong><span><code>apps/frontend</code> renders public forms, admin builder, response decryption, settings, auth pages, and payments.</span></div>
          <div><strong>3. Backend authority</strong><span><code>apps/backend</code> validates writes, owns sessions, talks to MongoDB/AWS/identity/payment providers, and serves the SPA in production.</span></div>
          <div><strong>4. Sidecar services</strong><span><code>services/*</code> handles file scanning, PDF generation, and payment reconciliation outside the main request path.</span></div>
        </div>
        <p>The safest way to change behavior is to trace the feature across those layers. Field and submission behavior almost always crosses shared types, frontend templates, backend validators, and persisted schemas.</p>
      </section>

      <section class="section-card">
        <h2>Request lifecycle diagram</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">flowchart TD
  browser["Browser"] -- loads Vite-built SPA and runtime env --&gt; entry["apps/frontend/src/index.tsx"]
  entry --&gt; app["App.tsx providers"]
  app --&gt; router["AppRouter.tsx routes"]
  router -- axios/fetch via ApiService --&gt; server["apps/backend/src/app/server.ts"]
  server --&gt; loaders["loaders/index.ts and loaders/express/index.ts"]
  loaders --&gt; routeChoice{"Route surface"}
  routeChoice --&gt; v3["/api/v3 route modules"]
  routeChoice --&gt; publicApi["/api/public/v1 public API"]
  routeChoice --&gt; static["static assets and SPA fallback"]
  v3 --&gt; effects["Mongoose, AWS, Stripe, identity providers, mail/SMS"]
  publicApi --&gt; effects
  static --&gt; browser</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Recommended reading paths</h2>
        <div class="grid three">
          <article class="mini-card"><h3>New contributor</h3><ol><li><a href="repository-map.html">Repository map</a></li><li><a href="architecture.html">Architecture</a></li><li><a href="local-development.html">Local development</a></li><li><a href="testing.html">Testing</a></li></ol></article>
          <article class="mini-card"><h3>Feature engineer</h3><ol><li><a href="shared-sdk.html">Shared packages</a></li><li><a href="frontend.html">Frontend</a></li><li><a href="backend.html">Backend</a></li><li><a href="extension-guides.html">Extension guides</a></li></ol></article>
          <article class="mini-card"><h3>Operator</h3><ol><li><a href="configuration.html">Configuration</a></li><li><a href="ci-cd-deployment.html">CI/CD and deployment</a></li><li><a href="operations-migrations.html">Operations</a></li><li><a href="glossary-gotchas.html">Gotchas</a></li></ol></article>
        </div>
      </section>
    `,
  },
  {
    file: 'repository-map.html',
    title: 'Repository map',
    description: 'Directory, workspace, and ownership map for the FormSG monorepo.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Start here</p>
        <h1>Repository map</h1>
        <p class="lede">The repo is a pnpm workspace with independently buildable applications, shared packages, Lambda-style services, operational scripts, and repository-hosted docs.</p>
      </section>

      <section class="section-card">
        <h2>Top-level map</h2>
        <table>
          <thead><tr><th>Path</th><th>Role</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td><code>apps/frontend</code></td><td>React SPA</td><td>Public respondent flows, admin workspace, form builder, response viewing/decryption, payments UI, login, billing, status tracker.</td></tr>
            <tr><td><code>apps/backend</code></td><td>Express API and production host</td><td>API routes, controllers, services, Mongoose models, integrations, sessions, static asset serving, SPA fallback.</td></tr>
            <tr><td><code>packages/shared</code></td><td>Shared domain contract</td><td>Types, constants, validation utilities, logic helpers, route constants, payment helpers.</td></tr>
            <tr><td><code>packages/sdk</code></td><td><code>@opengovsg/formsg-sdk</code></td><td>Crypto, cryptoV3, webhook helpers, verified content signatures, adapters, resource keys.</td></tr>
            <tr><td><code>packages/react-email-preview</code></td><td>Email preview package</td><td>Previews backend React Email templates during email template development.</td></tr>
            <tr><td><code>services/virus-scanner-guardduty</code></td><td>GuardDuty scan processor</td><td>Lambda container for moving scanned uploads between quarantine and clean buckets.</td></tr>
            <tr><td><code>services/pdf-gen-sparticuz</code></td><td>PDF generator Lambda</td><td>Chromium-based PDF generation with packaged Noto fonts.</td></tr>
            <tr><td><code>services/form-payment-reconciliation</code></td><td>Payment reconciliation job</td><td>Cron-style Node job for reconciling Stripe/payment state with FormSG records.</td></tr>
            <tr><td><code>scripts</code></td><td>Data migrations and one-off operations</td><td>Dated Mongo migration scripts. Treat every script as production data tooling.</td></tr>
            <tr><td><code>.github/workflows</code></td><td>Automation</td><td>CI, Playwright, Chromatic, CodeQL, release, image build, ECS, Lambda, and scanner deployment workflows.</td></tr>
            <tr><td><code>docs</code></td><td>Repository docs</td><td>Self-hosting snapshots, agent docs, and this technical wiki. GitBook remains canonical for self-hosting guidance.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Workspace commands and package names</h2>
        <pre><code>pnpm-workspace.yaml
  apps/*
  packages/*
  services/*

Root scripts
  pnpm dev                 # docker-compose + frontend + service dev loops
  pnpm build               # clean, shared, sdk, frontend, backend
  pnpm test                # backend + shared + frontend
  pnpm lint                # backend + shared + frontend
  pnpm storybook           # frontend Storybook
  pnpm test:e2e-v2         # build and run Playwright

Common filters
  pnpm --filter formsg-frontend ...
  pnpm --filter formsg-backend ...
  pnpm --filter formsg-shared ...
  pnpm --filter @opengovsg/formsg-sdk ...</code></pre>
      </section>

      <section class="section-card">
        <h2>Backend module map</h2>
        <div class="grid three">
          <article class="mini-card"><h3>Forms</h3><p><code>modules/form</code>, <code>routes/api/v3/forms</code>, <code>routes/api/v3/admin/forms</code>, field validators, public/admin controllers.</p></article>
          <article class="mini-card"><h3>Submissions</h3><p><code>modules/submission</code> includes encrypt, email, multirespondent, receiver, webhooks, attachments, feedback, and storage behavior.</p></article>
          <article class="mini-card"><h3>Identity</h3><p><code>modules/auth</code>, <code>routes/api/v3/auth</code>, SingPass/CorpPass route groups, MyInfo, sgID, SSO, WOG AD.</p></article>
          <article class="mini-card"><h3>Payments and billing</h3><p><code>modules/payments</code>, <code>modules/billing</code>, payment route groups, Stripe webhooks, reconciliation job integration.</p></article>
          <article class="mini-card"><h3>Platform</h3><p><code>modules/frontend</code>, <code>feature-flags</code>, <code>analytics</code>, <code>datadog</code>, <code>workspace</code>, <code>intranet</code>.</p></article>
          <article class="mini-card"><h3>External effects</h3><p><code>services/mail</code>, <code>services/sms</code>, Postman SMS, captcha/Turnstile, webhook producers, AWS clients.</p></article>
        </div>
      </section>

      <section class="section-card">
        <h2>Frontend feature map</h2>
        <table>
          <thead><tr><th>Path</th><th>Feature surface</th></tr></thead>
          <tbody>
            <tr><td><code>src/app</code></td><td>Application bootstrap, providers, routing, route guards, hash route compatibility.</td></tr>
            <tr><td><code>src/features/public-form</code></td><td>Respondent form loading, public form context, public submission service, draft/payment wrappers.</td></tr>
            <tr><td><code>src/templates/Field</code></td><td>Field rendering templates used by public forms and previews.</td></tr>
            <tr><td><code>src/features/admin-form/create</code></td><td>Builder canvas, drag and drop, drawers, logic/workflow/end page tabs, Zustand stores.</td></tr>
            <tr><td><code>src/features/admin-form/responses</code></td><td>Response table, individual responses, decryption key handling, Comlink worker, exports.</td></tr>
            <tr><td><code>src/features/admin-form/settings</code></td><td>General settings, webhooks, translations, secret key modal, toggles.</td></tr>
            <tr><td><code>src/features/login</code></td><td>OTP login, sgID login, SSO, WOG AD holding pages, profile selection.</td></tr>
            <tr><td><code>src/features/myinfo</code>, <code>src/features/logic</code></td><td>Feature-specific augmentation and client-side logic helpers.</td></tr>
            <tr><td><code>src/services</code></td><td>API abstraction, auth service, file handling, OneMap, intranet, landing payment stats.</td></tr>
          </tbody>
        </table>
      </section>
    `,
  },
  {
    file: 'architecture.html',
    title: 'Architecture',
    description: 'Runtime architecture, process boundaries, middleware, data ownership, and error patterns.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Architecture</p>
        <h1>Runtime architecture</h1>
        <p class="lede">FormSG is a classic SPA plus API system with shared domain packages and AWS-backed side effects. Production serves the frontend through the backend host, while local development runs Vite and Express separately.</p>
      </section>

      <section class="section-card">
        <h2>Major components</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">flowchart LR
  shared["packages/shared&lt;br/&gt;types, constants, utils"]:::shared
  sdk["@opengovsg/formsg-sdk&lt;br/&gt;crypto, webhooks, verification"]:::shared
  frontend["apps/frontend&lt;br/&gt;React/Vite SPA"]:::app
  backend["apps/backend&lt;br/&gt;Express/Mongoose API"]:::app
  mongo[("MongoDB&lt;br/&gt;forms, submissions, users, payments")]:::data
  aws["AWS S3/SQS/Lambda"]:::external
  stripe["Stripe"]:::external
  identity["SingPass, CorpPass, MyInfo, sgID, SSO, WOG AD"]:::external
  comms["Mail, SMS, Postman"]:::external

  shared -- domain contracts --&gt; frontend
  shared -- domain contracts --&gt; backend
  sdk -- browser decryption --&gt; frontend
  sdk -- webhook signing and verification --&gt; backend
  frontend -- ApiService axios/fetch --&gt; backend
  backend -- Mongoose --&gt; mongo
  backend -- storage, queues, Lambdas --&gt; aws
  backend -- payments --&gt; stripe
  backend -- identity/auth --&gt; identity
  backend -- notifications --&gt; comms

  classDef app fill:#dbeafe,stroke:#2563eb,color:#0f172a
  classDef shared fill:#ede9fe,stroke:#6d28d9,color:#0f172a
  classDef data fill:#d1fae5,stroke:#047857,color:#0f172a
  classDef external fill:#ffedd5,stroke:#b45309,color:#0f172a</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Backend boot sequence</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">sequenceDiagram
  participant Server as server.ts
  participant Loader as loaders/index.ts
  participant Mongo as mongoose.ts
  participant Express as express/index.ts
  participant Routes as route modules
  participant AWS as AWS config

  Server-&gt;&gt;Server: import datadog-tracer
  Server-&gt;&gt;Loader: loadApp()
  Loader-&gt;&gt;Mongo: connect MongoDB
  Loader-&gt;&gt;Express: build middleware and routes
  Express-&gt;&gt;Routes: mount /api, identity callbacks, frontend fallback
  Server-&gt;&gt;AWS: configureAws()
  Server-&gt;&gt;Server: listen(config.port)</pre>
        </div>
        <ol>
          <li><code>apps/backend/src/app/server.ts</code> imports Datadog tracing, creates the app through loaders, initializes AWS config, and listens.</li>
          <li><code>apps/backend/src/app/loaders/index.ts</code> connects Mongoose and builds the Express server.</li>
          <li><code>apps/backend/src/app/loaders/express/index.ts</code> applies middleware in order: parsers, cookies, compression, helmet, request IDs, sessions, logging, rate limits, GrowthBook, route mounts, static assets, frontend fallback, not-found, error handlers.</li>
          <li>Route groups under <code>apps/backend/src/app/routes</code> dispatch into module controllers and services.</li>
          <li>Services persist with Mongoose models in <code>apps/backend/src/app/models</code> and call AWS, Stripe, identity providers, mail/SMS, or queue producers where needed.</li>
        </ol>
      </section>

      <section class="section-card">
        <h2>Frontend boot sequence</h2>
        <ol>
          <li><code>apps/frontend/index.html</code> provides the root node and static HTML shell.</li>
          <li><code>apps/frontend/src/index.tsx</code> imports Inter, i18n, polyfills, optional MSW, analytics setup, dayjs configuration, and renders <code>&lt;App /&gt;</code>.</li>
          <li><code>apps/frontend/src/app/App.tsx</code> wires global providers: React Query, Chakra theme, Helmet, Turnstile, Auth, and GrowthBook.</li>
          <li><code>apps/frontend/src/app/AppRouter.tsx</code> declares public, private, admin, public-form, payment, status tracker, compatibility, and not-found routes.</li>
          <li>Feature pages use services under <code>apps/frontend/src/services</code> and feature-specific queries/mutations to call the backend.</li>
        </ol>
      </section>

      <section class="section-card">
        <h2>API surfaces</h2>
        <table>
          <thead><tr><th>Mount</th><th>Purpose</th><th>Representative route groups</th></tr></thead>
          <tbody>
            <tr><td><code>/api/v3</code></td><td>Main product API</td><td><code>/admin</code>, <code>/user</code>, <code>/auth</code>, <code>/client</code>, <code>/notifications</code>, <code>/billings</code>, <code>/analytics</code>, <code>/forms</code>, <code>/singpass</code>, <code>/corppass</code>, <code>/payments</code>, <code>/feature-flags</code>, <code>/intranet</code>, <code>/status</code>.</td></tr>
            <tr><td><code>/api/public/v1</code></td><td>Public bearer-token API</td><td>Public admin forms endpoints used by external integrations.</td></tr>
            <tr><td>Identity callbacks</td><td>OIDC and provider callbacks</td><td>SingPass, CorpPass, sgID, SSO, WOG AD, MyInfo endpoints.</td></tr>
            <tr><td>Static and fallback</td><td>Frontend hosting</td><td>Static assets, runtime env injection, SPA fallback for browser routes.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Error, result, and validation conventions</h2>
        <ul>
          <li>Domain errors use <code>ApplicationError</code> and shared <code>ErrorCodes</code> from backend core/shared types.</li>
          <li>Many services return <code>neverthrow</code> results, keeping controller code explicit about success/error branches.</li>
          <li>Route validators live near route/controller surfaces; field validators also exist in <code>apps/backend/src/app/utils/field-validation/validators</code>.</li>
          <li>Frontend query/mutation errors flow through React Query, feature toasts, and page-level error components.</li>
          <li>Do not rely on frontend validation alone. Backend modules are the enforcement boundary for persisted changes.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'frontend.html',
    title: 'Frontend',
    description: 'React application architecture, routes, feature modules, form rendering, and response decryption.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Applications</p>
        <h1>Frontend deep dive</h1>
        <p class="lede"><code>apps/frontend</code> is a Vite React 18 SPA using Chakra UI, React Router v6, React Query v3, Zustand, react-hook-form, i18next, GrowthBook, Datadog browser telemetry, and Comlink workers for expensive client-side work.</p>
      </section>

      <section class="section-card">
        <h2>Entrypoints and providers</h2>
        <table>
          <thead><tr><th>File</th><th>Responsibility</th></tr></thead>
          <tbody>
            <tr><td><code>apps/frontend/index.html</code></td><td>Static shell loaded by Vite and production asset hosting.</td></tr>
            <tr><td><code>apps/frontend/src/index.tsx</code></td><td>Imports global CSS/fonts/polyfills/i18n, initializes optional dev tooling and analytics, renders React.</td></tr>
            <tr><td><code>apps/frontend/src/app/App.tsx</code></td><td>Application providers: Chakra, React Query, Helmet, Turnstile, Auth, GrowthBook.</td></tr>
            <tr><td><code>apps/frontend/src/app/AppRouter.tsx</code></td><td>Route tree with public/private guards and compatibility wrappers.</td></tr>
            <tr><td><code>apps/frontend/src/services/ApiService.ts</code></td><td>Axios client abstraction used across features.</td></tr>
            <tr><td><code>apps/frontend/src/features/env/EnvService.ts</code></td><td>Reads runtime env from <code>window.__ENV__</code> or <code>/client/env</code>.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Route map</h2>
        <pre><code>/                         LandingPage
/payments                 LandingPaymentsPage
/dashboard                Private WorkspacePage
/login                    Public LoginPage
/login/sso                SsoHoldingPage
/login/wogad              WogadHoldingPage
/login-temp               TempLoginPage
/login/select-profile     SelectProfilePage
/login/forward            RbiProxyForwardingPage
/billing                  Private BillingPage
/:formId                  PublicFormPage through PUBLICFORM_ROUTE
/:formId/use-template     UseTemplateRedirectPage
/:formId/payment/:paymentId FormPaymentPage
/:formId/edit/:submissionId PublicFormPage edit mode
/:formId/status/:submissionId StatusTrackerPage
/admin/form/:formId       AdminFormLayout
  index                   CreatePage builder
  settings/:settingsTab?  SettingsPage
  results                 ResponsesPage / IndividualResponsePage
  results/feedback        FeedbackPage
  results/charts          ChartsPage
/admin/form/:formId/preview   PreviewFormPage
/admin/form/:formId/template  TemplateFormPage
*                         NotFoundErrorPage</code></pre>
        <p>Route constants are shared through frontend constants and <code>formsg-shared/constants/routes</code> where cross-package alignment is required.</p>
      </section>

      <section class="section-card">
        <h2>Public form rendering pipeline</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">flowchart TD
  page["PublicFormPage"] --&gt; provider["PublicFormProvider&lt;br/&gt;react-hook-form, auth, captcha, submit state"]
  provider --&gt; sections["FormSectionsProvider&lt;br/&gt;section navigation and visibility context"]
  sections --&gt; container["FormFieldsContainer&lt;br/&gt;logic-aware field list"]
  container --&gt; visible["VisibleFormFields&lt;br/&gt;maps visible schemas"]
  visible --&gt; factory["FieldFactory&lt;br/&gt;switches on BasicField"]
  factory --&gt; templates["apps/frontend/src/templates/Field/*&lt;br/&gt;field components"]
  provider --&gt; service["PublicFormService.ts&lt;br/&gt;public form APIs"]
  provider --&gt; sdk["formsg SDK&lt;br/&gt;encryption/decryption helpers"]</pre>
        </div>
        <ul>
          <li><code>PublicFormService.ts</code> owns public form API calls and submission calls.</li>
          <li><code>features/form/utils</code> contains question numbering, MRF value extraction, workflow disabling, and related helpers.</li>
          <li>Logic evaluation uses <code>features/logic</code> and shared logic helpers.</li>
          <li>MyInfo display augmentation lives in <code>features/myinfo</code>.</li>
          <li>Draft and payment behavior wrap the form through feature-specific components such as <code>SaveDraftSetupWrapper</code> and payment modals.</li>
        </ul>
      </section>

      <section class="section-card">
        <h2>Admin builder map</h2>
        <div class="grid two">
          <article class="mini-card"><h3>Create surface</h3><p><code>features/admin-form/create</code> contains the builder canvas, drag-and-drop via <code>@hello-pangea/dnd</code>, field drawer flows, end page editing, logic editing, workflow tabs, and Zustand-backed local editor state.</p></article>
          <article class="mini-card"><h3>Settings surface</h3><p><code>features/admin-form/settings</code> manages form settings, translations, webhooks, secret key modals, issue notification toggles, save draft toggles, and other per-form configuration.</p></article>
          <article class="mini-card"><h3>Templates</h3><p><code>features/admin-form/template</code> powers template preview/use flows and nudge UI.</p></article>
          <article class="mini-card"><h3>Share</h3><p><code>features/admin-form/share</code> owns share modals and public link related UI.</p></article>
        </div>
      </section>

      <section class="section-card">
        <h2>Responses and client-side decryption</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">flowchart LR
  admin["Admin browser"] --&gt; responses["features/admin-form/responses"]
  responses --&gt; key["useSecretKey&lt;br/&gt;local secret key capture"]
  responses --&gt; api["AdminSubmissionsService&lt;br/&gt;encrypted response APIs"]
  key --&gt; worker["Comlink decryption worker"]
  api --&gt; worker
  worker --&gt; sdk["formsgSdk.cryptoV3"]
  worker --&gt; table["responses table"]
  worker --&gt; exports["CSV/PDF/attachment exports"]</pre>
        </div>
        <ol>
          <li>Response pages under <code>features/admin-form/responses</code> fetch encrypted submission metadata and blobs from backend endpoints.</li>
          <li><code>StorageResponsesProvider</code> coordinates data fetching, pagination, selected responses, and export state.</li>
          <li><code>useSecretKey</code> captures and validates the form secret key locally.</li>
          <li>A decryption worker exposed with Comlink performs expensive crypto away from the UI thread.</li>
          <li>Crypto primitives come from <code>@opengovsg/formsg-sdk</code>, keeping browser and webhook consumers aligned.</li>
        </ol>
      </section>

      <section class="section-card">
        <h2>Frontend extension checklist</h2>
        <ul class="checklist">
          <li>Check shared types before inventing frontend-only shapes.</li>
          <li>Add or update API methods in <code>services/*Service.ts</code> and feature queries/mutations.</li>
          <li>Keep route changes in <code>AppRouter.tsx</code> and route constants synchronized.</li>
          <li>For form fields, update templates, builder drawer controls, validation text, storybook stories, and backend validators.</li>
          <li>Add Vitest tests near utilities and Storybook stories for visual states.</li>
          <li>Verify runtime env usage works both from injected <code>window.__ENV__</code> and local dev.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'backend.html',
    title: 'Backend',
    description: 'Express application, route modules, Mongoose models, services, and backend conventions.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Applications</p>
        <h1>Backend deep dive</h1>
        <p class="lede"><code>apps/backend</code> is a TypeScript Express 4 application with Mongoose models, session-backed admin auth, public API routes, AWS integrations, Stripe webhooks, identity provider callbacks, and production static frontend hosting.</p>
      </section>

      <section class="section-card">
        <h2>Entrypoints and loaders</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">flowchart TD
  request["HTTP request"] --&gt; parser["parsers and raw body handling"]
  parser --&gt; helmet["helmet and CSP nonce"]
  helmet --&gt; session["session and cookies"]
  session --&gt; logging["request id, winston, intranet logging"]
  logging --&gt; growthbook["GrowthBook request context"]
  growthbook --&gt; routes{"Route match"}
  routes --&gt; api["/api/v3 and /api/public/v1"]
  routes --&gt; identity["/sgid, /myinfo, OIDC JWKS"]
  routes --&gt; static["static assets and SPA fallback"]
  api --&gt; controllers["controllers"]
  controllers --&gt; services["domain services"]
  services --&gt; models["Mongoose models"]
  services --&gt; integrations["AWS, Stripe, mail, SMS, identity providers"]
  controllers --&gt; errors["module mapRouteError and global error handler"]</pre>
        </div>
        <table>
          <thead><tr><th>File</th><th>Role</th></tr></thead>
          <tbody>
            <tr><td><code>apps/backend/src/app/server.ts</code></td><td>Runtime entry, Datadog import, app load, AWS config, listener.</td></tr>
            <tr><td><code>apps/backend/src/app/loaders/index.ts</code></td><td>Application loader that connects MongoDB and Express.</td></tr>
            <tr><td><code>apps/backend/src/app/loaders/express/index.ts</code></td><td>Middleware stack, route mounting, static assets, frontend fallback, error handlers.</td></tr>
            <tr><td><code>apps/backend/src/app/config</code></td><td>Convict-backed configuration and environment parsing.</td></tr>
            <tr><td><code>apps/backend/src/app/loaders/express/error-handler.ts</code></td><td>Central error response logic.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>V3 route map</h2>
        <table>
          <thead><tr><th>Route group</th><th>Typical backing modules</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>/api/v3/admin</code></td><td><code>modules/form/admin-form</code>, <code>workspace</code></td><td>Authenticated admin form CRUD, settings, logic, payments setup, previews, submissions, feedback, workspaces.</td></tr>
            <tr><td><code>/api/v3/forms</code></td><td><code>modules/form/public-form</code>, <code>modules/submission</code></td><td>Public form reads, auth, feedback, issues, verification, submissions.</td></tr>
            <tr><td><code>/api/v3/auth</code></td><td><code>modules/auth</code></td><td>OTP, session, sgID admin login, SSO, WOG AD.</td></tr>
            <tr><td><code>/api/v3/singpass</code>, <code>/api/v3/corppass</code></td><td><code>modules/spcp</code> and routes</td><td>Respondent identity login and callbacks.</td></tr>
            <tr><td><code>/api/v3/payments</code></td><td><code>modules/payments</code></td><td>Stripe checkout/session/webhook-adjacent payment operations and cron-protected reconciliation hooks.</td></tr>
            <tr><td><code>/api/v3/notifications</code></td><td><code>modules/bounce</code>, webhook handlers</td><td>Email bounces and Stripe notification endpoints.</td></tr>
            <tr><td><code>/api/v3/billings</code></td><td><code>modules/billing</code></td><td>Billing page and billing-related admin data.</td></tr>
            <tr><td><code>/api/v3/client</code></td><td><code>modules/frontend</code></td><td>Runtime client environment for frontend.</td></tr>
            <tr><td><code>/api/v3/analytics</code>, <code>/feature-flags</code>, <code>/intranet</code>, <code>/status</code></td><td>Named modules</td><td>Telemetry, GrowthBook data, intranet checks, status tracker.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Model map</h2>
        <div class="grid three">
          <article class="mini-card"><h3>Forms</h3><p><code>form.server.model.ts</code>, <code>form_logic.server.schema.ts</code>, <code>form_workflow_step.server.schema.ts</code>, <code>form_logo.server.schema.ts</code>, field schemas under <code>models/field</code>.</p></article>
          <article class="mini-card"><h3>Responses</h3><p><code>submission.server.model.ts</code>, <code>pending_submission.server.model.ts</code>, <code>form_feedback.server.model.ts</code>, <code>form_issue.server.model.ts</code>, <code>form_statistics_total.server.model.ts</code>.</p></article>
          <article class="mini-card"><h3>People and access</h3><p><code>user.server.model.ts</code>, <code>login.server.model.ts</code>, <code>token.server.model.ts</code>, <code>agency.server.model.ts</code>, <code>workspace.server.model.ts</code>, <code>admin_verification.server.model.ts</code>.</p></article>
          <article class="mini-card"><h3>Payments</h3><p><code>payment.server.model.ts</code>, <code>models/payments/productSchema.ts</code>, pending submissions and payment metadata on form/submission models.</p></article>
          <article class="mini-card"><h3>Feature flags</h3><p><code>feature_flag.server.model.ts</code> plus GrowthBook modules and frontend flag queries.</p></article>
          <article class="mini-card"><h3>Feedback</h3><p><code>admin_feedback.server.model.ts</code> and form feedback/issue models support admin and respondent issue reporting.</p></article>
        </div>
      </section>

      <section class="section-card">
        <h2>Service map</h2>
        <ul>
          <li><code>apps/backend/src/app/modules/submission</code>: encrypted storage, email submissions, MRF, receiver handling, webhook production, attachment work.</li>
          <li><code>apps/backend/src/app/modules/webhook</code>: validation, queue production, retry/stats clients, webhook errors.</li>
          <li><code>apps/backend/src/app/services/mail</code>: Nodemailer/SES abstraction, React Email rendering, bounce integration.</li>
          <li><code>apps/backend/src/app/services/sms</code> and <code>postman-sms</code>: SMS counting and Postman campaign delivery.</li>
          <li><code>apps/backend/src/app/services/captcha</code> and <code>turnstile</code>: bot protection middleware.</li>
          <li><code>modules/myinfo</code>, <code>spcp</code>, <code>sgid</code>, <code>verification</code>: identity and verified field surfaces.</li>
        </ul>
      </section>

      <section class="section-card">
        <h2>Backend extension checklist</h2>
        <ul class="checklist">
          <li>Add route validation and controller tests before wiring new service behavior.</li>
          <li>Keep shared response/request types in <code>packages/shared</code> if the frontend or SDK consumes them.</li>
          <li>Update Mongoose schemas and data migrations together for persisted shape changes.</li>
          <li>Use <code>ApplicationError</code>, <code>ErrorCodes</code>, and <code>neverthrow</code> conventions already used by neighboring modules.</li>
          <li>Consider rate limits, auth middleware, intranet restrictions, audit/logging, and idempotency for every write endpoint.</li>
          <li>Add tests under the owning module's <code>__tests__</code> directory and include route-level coverage for new API behavior.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'shared-sdk.html',
    title: 'Shared packages and SDK',
    description: 'Shared domain contracts, validation utilities, SDK crypto, webhooks, and email preview package.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Applications</p>
        <h1>Shared packages and SDK</h1>
        <p class="lede">The shared packages are the compatibility layer between frontend, backend, external consumers, and operational services. Start here for domain model changes.</p>
      </section>

      <section class="section-card">
        <h2><code>packages/shared</code>: formsg-shared</h2>
        <table>
          <thead><tr><th>Path</th><th>Contents</th><th>Used by</th></tr></thead>
          <tbody>
            <tr><td><code>types/field</code></td><td>Field shapes for text, number, email, mobile, NRIC, UEN, date, address, attachment, table, section, children compound, signature, rating, image, statement, yes/no, checkbox, dropdown, radio.</td><td>Frontend field rendering, backend schemas/controllers, tests.</td></tr>
            <tr><td><code>types/form</code></td><td>Form, auth, logic, workflow, product, logo, issue, feedback types.</td><td>Admin builder, public forms, backend form modules.</td></tr>
            <tr><td><code>types/submission.ts</code>, <code>response*.ts</code></td><td>Submission and response data transfer shapes.</td><td>Submission modules and response UI.</td></tr>
            <tr><td><code>types/payment.ts</code>, <code>utils/payments.ts</code>, <code>utils/paymentProductPrice.ts</code></td><td>Payment contracts and helpers.</td><td>Payment modules, admin payment settings, reconciliation.</td></tr>
            <tr><td><code>constants</code></td><td>Routes, links, mail, form constants, workspace constants, file limits, form origin.</td><td>Both apps and services.</td></tr>
            <tr><td><code>utils</code></td><td>Validation and helper utilities for fields, URLs, files, dates, UEN/NRIC, options maps, logic, crypto, signatures.</td><td>Frontend validation, backend validation, tests.</td></tr>
            <tr><td><code>modules/logic</code></td><td>Shared logic constants and evaluation helpers.</td><td>Public form visibility, builder logic UI, backend validation.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2><code>packages/sdk</code>: <code>@opengovsg/formsg-sdk</code></h2>
        <div class="grid two">
          <article class="mini-card"><h3>Webhooks</h3><p><code>src/webhooks.ts</code> and <code>src/util/webhooks.ts</code> provide signature validation and payload helpers for consumers receiving FormSG webhooks.</p></article>
          <article class="mini-card"><h3>Crypto</h3><p><code>src/crypto</code> and <code>src/crypto-v3</code> support encrypted storage submissions and client-side/admin-side decryption paths.</p></article>
          <article class="mini-card"><h3>Verification</h3><p><code>src/verification</code> and resource keys support verified content signatures and checked respondent data.</p></article>
          <article class="mini-card"><h3>Adapters and stage</h3><p><code>src/adapters</code> and <code>src/util/stage.ts</code> help SDK consumers target the correct environment and payload format.</p></article>
        </div>
      </section>

      <section class="section-card">
        <h2>Shared-change workflow</h2>
        <ol>
          <li>Update <code>packages/shared</code> types/constants/utils first.</li>
          <li>Run <code>pnpm --filter formsg-shared test</code> and update tests beside changed utilities.</li>
          <li>Update backend Mongoose schemas and validators where persisted data changes.</li>
          <li>Update frontend templates, form builder drawers, queries/mutations, and story states.</li>
          <li>Update SDK only when external consumers, crypto, webhooks, or verified content contracts change.</li>
          <li>Run affected package tests plus root <code>pnpm build</code> for cross-package type safety.</li>
        </ol>
      </section>

      <section class="section-card">
        <h2>Email preview package</h2>
        <p><code>packages/react-email-preview</code> supports previewing backend React Email templates. Use it when changing email layout, submission receipts, OTP messages, bounce notifications, workflow emails, or payment-related email content.</p>
      </section>
    `,
  },
  {
    file: 'services.html',
    title: 'Services and jobs',
    description: 'Auxiliary services, Lambdas, cron jobs, queues, and side effects.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Applications</p>
        <h1>Services and background jobs</h1>
        <p class="lede">Sidecar services keep slow, privileged, or scheduled work outside the main request path while sharing repository tooling and deployment pipelines.</p>
      </section>

      <section class="section-card">
        <h2>Service inventory</h2>
        <table>
          <thead><tr><th>Path</th><th>Runtime</th><th>Responsibility</th><th>Local command</th></tr></thead>
          <tbody>
            <tr><td><code>services/virus-scanner-guardduty</code></td><td>Lambda container</td><td>Receives GuardDuty scan findings/events, validates S3 object state, moves uploads from quarantine to clean buckets, logs scan outcomes.</td><td><code>pnpm dev:virus-scanner-guardduty</code></td></tr>
            <tr><td><code>services/pdf-gen-sparticuz</code></td><td>AWS SAM/Lambda</td><td>Generates PDFs with headless Chromium and bundled Noto fonts for multilingual output.</td><td><code>pnpm dev:pdf-gen</code></td></tr>
            <tr><td><code>services/form-payment-reconciliation</code></td><td>Node cron job</td><td>Reconciles FormSG payment records with Stripe/payment state and backend cron-protected APIs.</td><td>Package-specific scripts in the service.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Backend-adjacent background work</h2>
        <ul>
          <li><code>modules/webhook</code> produces webhook jobs to SQS through configured <code>WEBHOOK_SQS_URL</code>.</li>
          <li><code>modules/submission</code> coordinates attachment upload state, encrypted storage submission writes, email-mode delivery, and MRF follow-ups.</li>
          <li><code>services/mail</code> and <code>services/sms</code> isolate external communication providers.</li>
          <li><code>modules/bounce</code> handles email bounce notifications and bounce persistence.</li>
          <li>Payment notifications are received through the backend and reconciled through the separate payment reconciliation service.</li>
        </ul>
      </section>

      <section class="section-card">
        <h2>Queue and storage ownership</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">flowchart TD
  upload["Respondent uploads attachment"] --&gt; presign["Backend presigns quarantine S3 upload"]
  presign --&gt; quarantine[("GuardDuty quarantine bucket")]
  quarantine --&gt; gd["GuardDuty malware scan tags"]
  gd --&gt; scanner["services/virus-scanner-guardduty"]
  scanner -- clean --&gt; clean[("Clean attachment bucket")]
  scanner -- malicious --&gt; reject["Reject submission attachment"]
  clean --&gt; submission["Submission stores clean object reference"]

  saved["Submission saved"] --&gt; webhook["modules/webhook validates destination and signs payload"]
  webhook --&gt; sqs[("SQS retry queue")]
  sqs --&gt; consumer["webhook consumer retries delivery"]
  consumer --&gt; record["submission webhook record and stats"]</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Service extension checklist</h2>
        <ul class="checklist">
          <li>Keep service environment variables documented in service README or configuration docs.</li>
          <li>Add package-level tests and a local dev command where practical.</li>
          <li>Validate event schemas at the service boundary; do not assume queue or S3 events are trustworthy.</li>
          <li>Make idempotency explicit for S3 object moves, Stripe/payment reconciliation, and retryable queue handlers.</li>
          <li>Update deployment workflows under <code>.github/workflows</code> for new service artifacts.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'forms-submissions.html',
    title: 'Forms and submissions',
    description: 'Form builder, public forms, submissions, encrypted storage, email mode, MRF, and validation.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Product domains</p>
        <h1>Forms and submissions</h1>
        <p class="lede">Forms are the central aggregate. Submission behavior branches by mode: encrypted storage, email mode, multirespondent workflow, payment-enabled submissions, and verified fields.</p>
      </section>

      <section class="section-card">
        <h2>Form lifecycle</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">flowchart LR
  admin["Admin creates form"] --&gt; builder["Frontend builder&lt;br/&gt;shared field definitions"]
  builder --&gt; adminApi["Backend admin-form routes&lt;br/&gt;validate and persist"]
  adminApi --&gt; formModel[("Form model")]
  formModel --&gt; publicView["Public form route&lt;br/&gt;respondent DTO"]
  publicView --&gt; respondent["Respondent submits answers"]
  respondent --&gt; validation["Backend validates fields, auth, captcha, payments"]
  validation --&gt; mode{"Submission mode"}
  mode -- storage --&gt; encrypted[("Encrypted submission")]
  mode -- email --&gt; mail["Email delivery"]
  mode -- MRF --&gt; workflow["Workflow step advancement"]
  encrypted --&gt; responses["Admin responses UI&lt;br/&gt;decrypt, export, charts"]
  mail --&gt; feedback["Feedback and bounce handling"]
  workflow --&gt; status["Status tracker and next respondent"]</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Key files by layer</h2>
        <table>
          <thead><tr><th>Layer</th><th>Paths</th><th>Responsibilities</th></tr></thead>
          <tbody>
            <tr><td>Shared</td><td><code>packages/shared/types/field</code>, <code>types/form</code>, <code>modules/logic</code></td><td>Field/form contracts, workflow/logic types, validation helpers.</td></tr>
            <tr><td>Frontend public</td><td><code>features/public-form</code>, <code>templates/Field</code>, <code>features/form/utils</code></td><td>Load forms, render fields, apply visibility logic, submit responses.</td></tr>
            <tr><td>Frontend admin</td><td><code>features/admin-form/create</code>, <code>settings</code>, <code>responses</code></td><td>Builder, settings, response viewing, decryption, export, charts, feedback.</td></tr>
            <tr><td>Backend routes</td><td><code>routes/api/v3/admin/forms</code>, <code>routes/api/v3/forms</code></td><td>Admin and public route dispatch.</td></tr>
            <tr><td>Backend modules</td><td><code>modules/form</code>, <code>modules/submission</code></td><td>Business logic, validation, submission mode branching, webhooks.</td></tr>
            <tr><td>Persistence</td><td><code>models/form.server.model.ts</code>, <code>models/submission.server.model.ts</code>, <code>models/field/*</code></td><td>Mongoose schemas and indexes.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Submission modes</h2>
        <div class="grid two">
          <article class="mini-card"><h3>Encrypted storage mode</h3><p>Answers are encrypted for admin-side decryption. The frontend uses the form secret key and SDK crypto to decrypt responses. Backend stores encrypted payloads and metadata but should not need plaintext answers.</p></article>
          <article class="mini-card"><h3>Email mode</h3><p>Submissions are rendered and delivered through backend mail services. Email-mode changes must consider bounce handling, templates, and recipient mapping.</p></article>
          <article class="mini-card"><h3>Multirespondent forms (MRF)</h3><p>Workflow step state determines which respondent can edit which fields. Shared workflow types, frontend disabling helpers, backend MRF services, and migration scripts must stay aligned.</p></article>
          <article class="mini-card"><h3>Payment-enabled forms</h3><p>Submission completion can depend on Stripe/payment state. Pending submissions and payment records bridge payment confirmation and final response state.</p></article>
        </div>
      </section>

      <section class="section-card">
        <h2>Field addition checklist</h2>
        <ul class="checklist">
          <li>Add shared field type in <code>packages/shared/types/field</code> and export it.</li>
          <li>Add backend Mongoose field schema in <code>apps/backend/src/app/models/field</code>.</li>
          <li>Add backend field validation in <code>apps/backend/src/app/utils/field-validation/validators</code> and tests.</li>
          <li>Add public field template in <code>apps/frontend/src/templates/Field</code>.</li>
          <li>Add builder drawer controls and create-page behavior under <code>features/admin-form/create</code>.</li>
          <li>Update logic/workflow compatibility if the field can drive visibility or MRF assignment.</li>
          <li>Update response rendering/export/decryption display if the answer shape is new.</li>
          <li>Add Storybook stories and unit tests covering empty, valid, invalid, readonly, disabled, and MRF states.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'auth-access.html',
    title: 'Auth and access',
    description: 'Admin authentication, respondent authentication, sessions, identity integrations, public API keys, and access controls.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Product domains</p>
        <h1>Auth and access</h1>
        <p class="lede">Authentication spans admin sessions, respondent identity providers, form-level restrictions, intranet checks, verified fields, and public API bearer keys.</p>
      </section>

      <section class="section-card">
        <h2>Admin authentication</h2>
        <table>
          <thead><tr><th>Mechanism</th><th>Frontend</th><th>Backend</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>OTP login</td><td><code>features/login/LoginPage.tsx</code>, <code>OtpForm.tsx</code></td><td><code>modules/auth</code>, <code>routes/api/v3/auth</code></td><td>Session-backed login with OTP lifecycle and rate limits.</td></tr>
            <tr><td>sgID admin login</td><td><code>SgidLoginButton.tsx</code></td><td><code>modules/auth/sgid</code></td><td>OIDC-style callback for admin identity.</td></tr>
            <tr><td>SSO</td><td><code>SsoHoldingPage.tsx</code></td><td><code>modules/auth/sso</code></td><td>Discovery URL, client ID/secret, and callback config come from env.</td></tr>
            <tr><td>WOG AD</td><td><code>WogadHoldingPage.tsx</code></td><td><code>modules/auth/wogad</code></td><td>Government AD flow that ends in FormSG session establishment.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Respondent authentication and verified fields</h2>
        <ul>
          <li><strong>SingPass/CorpPass:</strong> route groups under <code>routes/api/v3/singpass</code> and <code>routes/api/v3/corppass</code> use configured NDI endpoints and key material.</li>
          <li><strong>MyInfo:</strong> <code>modules/myinfo</code> adapts MockPass/local and production MyInfo flows, with frontend augmentation in <code>features/myinfo</code>.</li>
          <li><strong>sgID respondent login:</strong> configured through <code>SGID_FORM_LOGIN_REDIRECT_URI</code> and frontend public form auth flows.</li>
          <li><strong>Verified fields:</strong> <code>modules/verification</code>, <code>packages/sdk/src/verification</code>, and shared verified content helpers sign and verify trusted respondent values.</li>
          <li><strong>Form-level controls:</strong> whitelist, allowed domains, intranet-only access, captcha/Turnstile, and respondent auth settings combine before submission acceptance.</li>
        </ul>
      </section>

      <section class="section-card">
        <h2>Access control boundaries</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">flowchart TD
  subgraph Admin
    adminBrowser["Admin browser"] --&gt; private["PrivateElement UX guard"]
    private --&gt; session["Express session middleware"]
    session --&gt; authMw["withUserAuthentication"]
    authMw --&gt; adminRoutes["Admin routes"]
    adminRoutes --&gt; permissions["form/workspace permission checks"]
  end

  subgraph Respondent
    respondent["Respondent"] --&gt; captcha["captcha or Turnstile"]
    captcha --&gt; identity["optional SingPass, CorpPass, MyInfo, sgID"]
    identity --&gt; restrictions["intranet, whitelist, domain restrictions"]
    restrictions --&gt; publicRoutes["public form routes and validators"]
  end

  subgraph Machine
    apiClient["Public API client"] --&gt; bearer["Bearer API key middleware"]
    cron["Payment cron"] --&gt; cronSecret["cron secret header middleware"]
  end</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Public API keys</h2>
        <p><code>/api/public/v1</code> exposes public API behavior protected by bearer-token API keys. The local Docker configuration includes <code>API_KEY_VERSION=v1</code>. Changes here must preserve token parsing, auth middleware, rate limiting, and external compatibility.</p>
      </section>

      <section class="section-card">
        <h2>Auth change checklist</h2>
        <ul class="checklist">
          <li>Identify whether the actor is an admin, respondent, public API client, cron job, or trusted service.</li>
          <li>Update route guards on both frontend and backend; frontend guards are UX, backend guards are authority.</li>
          <li>Check session serialization, cookie settings, CSRF-like assumptions, and redirect allowlists.</li>
          <li>Update local MockPass/identity env defaults if the flow must work in Docker.</li>
          <li>Add route tests for unauthenticated, unauthorized, wrong-form, and happy-path cases.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'payments.html',
    title: 'Payments',
    description: 'Stripe integration, payment-enabled forms, pending submissions, reconciliation, and billing.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Product domains</p>
        <h1>Payments</h1>
        <p class="lede">Payments connect form configuration, respondent checkout, pending submissions, Stripe notifications, reconciliation, billing, and product pricing helpers.</p>
      </section>

      <section class="section-card">
        <h2>Payment architecture</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">sequenceDiagram
  participant Admin
  participant AdminUI as Admin frontend
  participant Backend as Backend payments/admin-form
  participant Mongo as MongoDB
  participant User as Respondent
  participant Stripe
  participant Cron as Reconciliation cron

  Admin-&gt;&gt;AdminUI: Configure payment settings
  AdminUI-&gt;&gt;Backend: Save payment field/product/channel settings
  Backend-&gt;&gt;Mongo: Persist Form payment config
  User-&gt;&gt;Backend: Submit payment-enabled form
  Backend-&gt;&gt;Mongo: Create pending submission and payment record
  Backend-&gt;&gt;Stripe: Create/confirm payment intent
  Stripe--&gt;&gt;Backend: Webhook notification
  Backend-&gt;&gt;Mongo: Idempotently update payment and submission state
  Cron-&gt;&gt;Backend: Reconcile incomplete payments
  Backend-&gt;&gt;Stripe: Replay/check provider state
  Backend-&gt;&gt;Mongo: Repair or cancel stale records</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Key files</h2>
        <table>
          <thead><tr><th>Path</th><th>Role</th></tr></thead>
          <tbody>
            <tr><td><code>packages/shared/types/payment.ts</code></td><td>Payment type contracts.</td></tr>
            <tr><td><code>packages/shared/types/form/product.ts</code></td><td>Product pricing/config types used by payment-enabled forms.</td></tr>
            <tr><td><code>packages/shared/utils/payments.ts</code>, <code>paymentProductPrice.ts</code></td><td>Shared payment helpers.</td></tr>
            <tr><td><code>apps/backend/src/app/modules/form/admin-form/admin-form.payments.*</code></td><td>Admin payment settings controller/service/constants.</td></tr>
            <tr><td><code>apps/backend/src/app/modules/payments</code></td><td>Payment module business logic and route backing services.</td></tr>
            <tr><td><code>apps/backend/src/app/models/payment.server.model.ts</code></td><td>Payment persistence.</td></tr>
            <tr><td><code>apps/backend/src/app/models/pending_submission.server.model.ts</code></td><td>Pending response state while payment is in progress.</td></tr>
            <tr><td><code>apps/frontend/src/features/public-form/components/DuplicatePaymentModal</code></td><td>Respondent duplicate payment UX.</td></tr>
            <tr><td><code>apps/frontend/src/services/LandingPaymentService.ts</code></td><td>Landing payment statistics/service calls.</td></tr>
            <tr><td><code>services/form-payment-reconciliation</code></td><td>Cron reconciliation between FormSG and payment provider state.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Local payment setup touchpoints</h2>
        <ul>
          <li>Docker compose includes <code>stripe-cli</code> forwarding to <code>host.docker.internal:5001/api/v3/notifications/stripe</code>.</li>
          <li>Relevant env vars include <code>PAYMENT_STRIPE_PUBLISHABLE_KEY</code>, <code>PAYMENT_STRIPE_SECRET_KEY</code>, <code>PAYMENT_STRIPE_CLIENT_ID</code>, <code>PAYMENT_STRIPE_WEBHOOK_SECRET</code>, <code>PAYMENT_MAX_PAYMENT_AMOUNT_CENTS</code>, <code>PAYMENT_MIN_PAYMENT_AMOUNT_CENTS</code>, <code>CRON_PAYMENT_API_SECRET</code>, <code>PAYMENT_GUIDE_LINK</code>, and <code>PAYMENT_LANDING_GUIDE_LINK</code>.</li>
          <li>Historical payment migrations in <code>scripts</code> include payment flags, GST flags, payment field snapshot changes, and field/channel separation.</li>
        </ul>
      </section>

      <section class="section-card">
        <h2>Payment change checklist</h2>
        <ul class="checklist">
          <li>Make all payment state transitions idempotent; webhooks and reconciliation can repeat.</li>
          <li>Keep Stripe webhook verification and route auth separate from respondent/admin auth.</li>
          <li>Update shared payment types before frontend/backend behavior.</li>
          <li>Test abandoned payment, duplicate payment, successful payment, failed payment, and reconciliation repair paths.</li>
          <li>Check migrations for existing forms when changing product shape or payment flags.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'integrations.html',
    title: 'Integrations',
    description: 'External integration ownership map for identity, payments, storage, telemetry, mail, SMS, and APIs.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Product domains</p>
        <h1>Integrations matrix</h1>
        <p class="lede">Integrations are owned at specific module boundaries. Keep provider details isolated and expose stable FormSG contracts to the rest of the application.</p>
      </section>

      <section class="section-card">
        <h2>Integration ownership</h2>
        <table>
          <thead><tr><th>Integration</th><th>Owner paths</th><th>Purpose</th><th>Local support</th></tr></thead>
          <tbody>
            <tr><td>AWS S3</td><td>Backend modules, services, Docker localstack</td><td>Attachments, images, logos, static assets, payment proof, scanned clean/quarantine buckets.</td><td>Localstack in <code>docker-compose.yml</code>.</td></tr>
            <tr><td>AWS SQS</td><td><code>modules/webhook</code></td><td>Webhook delivery queue.</td><td>Localstack with <code>WEBHOOK_SQS_URL</code>.</td></tr>
            <tr><td>AWS Lambda</td><td>Backend AWS clients, <code>services/*</code></td><td>Virus scanning and PDF generation.</td><td>Service dev scripts.</td></tr>
            <tr><td>Stripe</td><td><code>modules/payments</code>, notifications routes, reconciliation service</td><td>Payment checkout, webhooks, reconciliation, Connect onboarding.</td><td><code>stripe-cli</code> service in Docker compose.</td></tr>
            <tr><td>SingPass/CorpPass</td><td><code>routes/api/v3/singpass</code>, <code>corppass</code>, <code>modules/spcp</code></td><td>Respondent national/business identity.</td><td>MockPass container.</td></tr>
            <tr><td>MyInfo</td><td><code>modules/myinfo</code>, <code>features/myinfo</code></td><td>Verified profile data population.</td><td>MockPass certificates and endpoints.</td></tr>
            <tr><td>sgID</td><td><code>modules/auth/sgid</code>, respondent sgID config</td><td>Admin and respondent sgID login.</td><td>MockPass/localhost config.</td></tr>
            <tr><td>SSO and WOG AD</td><td><code>modules/auth/sso</code>, <code>modules/auth/wogad</code></td><td>Admin enterprise identity.</td><td>Env-driven.</td></tr>
            <tr><td>Mail/SES</td><td><code>services/mail</code>, React Email templates</td><td>OTP, receipts, email-mode submissions, notifications.</td><td>Maildev on port 1080.</td></tr>
            <tr><td>Postman SMS</td><td><code>services/postman-sms</code></td><td>SMS delivery through Postman campaigns.</td><td>Env-driven test campaign values.</td></tr>
            <tr><td>GrowthBook</td><td>Backend feature flags, frontend provider</td><td>Feature flag evaluation.</td><td>Development client key in Docker compose.</td></tr>
            <tr><td>Datadog</td><td>Backend tracing/logs, frontend browser logs/RUM</td><td>Observability, source maps, runtime tracing.</td><td>Env-driven.</td></tr>
            <tr><td>Go.gov.sg</td><td><code>features/link-shortener</code>, backend GoGov routes/services</td><td>Link shortening.</td><td><code>GOGOV_API_KEY</code>.</td></tr>
            <tr><td>OneMap</td><td><code>apps/frontend/src/services/OneMapService.ts</code></td><td>Address lookup/map support.</td><td>Env/provider dependent.</td></tr>
            <tr><td>Captcha/Turnstile</td><td><code>services/captcha</code>, <code>services/turnstile</code>, frontend Turnstile provider</td><td>Bot protection.</td><td>Google test captcha keys in Docker compose.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Integration principles</h2>
        <ul>
          <li>Provider-specific request/response details should stay inside the owning module or service.</li>
          <li>External callbacks must verify signatures/tokens before mutating FormSG state.</li>
          <li>Every retryable provider event should be idempotent by FormSG identifier and provider identifier.</li>
          <li>Local development should use MockPass, Localstack, Maildev, and Stripe CLI where possible.</li>
          <li>Configuration belongs in env/convict schemas, not hardcoded inside feature modules.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'data-flows.html',
    title: 'Data flows',
    description: 'Concrete data-flow diagrams for encrypted storage, MRF, email mode, payments, and verified fields.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Product domains</p>
        <h1>Data flows</h1>
        <p class="lede">These diagrams show how high-risk product flows cross frontend, backend, shared packages, persistence, and integrations.</p>
      </section>

      <section class="section-card">
        <h2>Encrypted storage submission</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">sequenceDiagram
  participant Respondent
  participant Frontend as Public form frontend
  participant Backend as Backend public form routes
  participant Mongo as MongoDB
  participant Webhook as Webhook delivery
  participant Admin as Admin responses UI
  participant Worker as Decryption worker

  Respondent-&gt;&gt;Frontend: Load public form
  Frontend-&gt;&gt;Backend: GET /api/v3/forms/:formId
  Backend--&gt;&gt;Frontend: Public form DTO and public key
  Respondent-&gt;&gt;Frontend: Submit answers and attachments
  Frontend-&gt;&gt;Backend: Encrypted payload and metadata
  Backend-&gt;&gt;Backend: Validate captcha, auth, fields, attachments, payment rules
  Backend-&gt;&gt;Mongo: Persist encrypted submission
  Backend--&gt;&gt;Webhook: Emit signed webhook if configured
  Admin-&gt;&gt;Backend: Request encrypted responses
  Backend--&gt;&gt;Admin: Encrypted response stream
  Admin-&gt;&gt;Worker: Secret key and encrypted payloads
  Worker-&gt;&gt;Worker: Decrypt with FormSG SDK
  Worker--&gt;&gt;Admin: Rows, details, exports</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Multirespondent workflow (MRF)</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">sequenceDiagram
  participant Admin
  participant Builder as Admin builder
  participant Backend
  participant Mongo as MongoDB
  participant R1 as Respondent step 1
  participant RN as Later respondent
  participant Mail as Notification service

  Admin-&gt;&gt;Builder: Define workflow steps and assignees
  Builder-&gt;&gt;Backend: Save workflow configuration
  Backend-&gt;&gt;Mongo: Persist form workflow
  R1-&gt;&gt;Backend: Submit first workflow step
  Backend-&gt;&gt;Mongo: Create submission with workflow state
  Backend-&gt;&gt;Mail: Notify next respondent
  RN-&gt;&gt;Backend: Open edit/status link
  Backend--&gt;&gt;RN: Prior values and editable step data
  RN-&gt;&gt;Backend: Submit allowed step changes
  Backend-&gt;&gt;Backend: Validate workflow permissions and locked fields
  Backend-&gt;&gt;Mongo: Advance workflow state
  Backend--&gt;&gt;Admin: Final response available when workflow completes</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Email-mode submission</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">sequenceDiagram
  participant Respondent
  participant Backend as Public submission route
  participant EmailService as Email submission service
  participant Mail as services/mail
  participant SES as SES or Maildev
  participant Bounce as Bounce module
  participant Admin

  Respondent-&gt;&gt;Backend: Submit email-mode form
  Backend-&gt;&gt;Backend: Validate payload and form rules
  Backend-&gt;&gt;EmailService: Render response email and autoreply
  EmailService-&gt;&gt;Mail: Send messages
  Mail-&gt;&gt;SES: Deliver through SMTP/SES or Maildev
  SES--&gt;&gt;Bounce: Bounce/complaint notification if delivery fails
  Bounce-&gt;&gt;Admin: Surface delivery-related state and warnings</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Payment flow</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">sequenceDiagram
  participant User as Respondent
  participant Backend
  participant Mongo as MongoDB
  participant Stripe
  participant Cron as Payment reconciliation service

  User-&gt;&gt;Backend: Submit payment form
  Backend-&gt;&gt;Mongo: Create pending submission and payment record
  Backend-&gt;&gt;Stripe: Start payment intent
  Stripe--&gt;&gt;Backend: POST /api/v3/notifications/stripe
  Backend-&gt;&gt;Backend: Verify signature and event type
  Backend-&gt;&gt;Mongo: Idempotently update payment/submission state
  Cron-&gt;&gt;Backend: Call cron-protected reconcile routes
  Backend-&gt;&gt;Stripe: Compare provider state
  Backend-&gt;&gt;Mongo: Repair missed/inconsistent records</pre>
        </div>
      </section>

      <section class="section-card">
        <h2>Verified fields</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">sequenceDiagram
  participant Respondent
  participant Provider as Trusted identity provider
  participant Backend
  participant Verification as verification module and SDK
  participant Form as Public form submission

  Respondent-&gt;&gt;Provider: Authenticate or verify field
  Provider--&gt;&gt;Backend: Trusted attributes or OTP result
  Backend-&gt;&gt;Verification: Sign verified content
  Verification--&gt;&gt;Form: Verified value with signature material
  Form-&gt;&gt;Verification: Verify signature before trusting value</pre>
        </div>
      </section>
    `,
  },
  {
    file: 'local-development.html',
    title: 'Local development',
    description: 'Local setup, Docker Compose services, ports, commands, and troubleshooting.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Build and operate</p>
        <h1>Local development</h1>
        <p class="lede">Local development combines Docker Compose for backing services/backend and Vite for the frontend. The root <code>pnpm dev</code> command orchestrates the common stack.</p>
      </section>

      <section class="section-card">
        <h2>Prerequisites</h2>
        <ul>
          <li>Node <code>&gt;=22.22</code> and pnpm <code>&gt;=10.30.3</code>.</li>
          <li>Docker and Docker Compose for MongoDB, backend container, Localstack, Maildev, MockPass, Stripe CLI.</li>
          <li>Install dependencies with <code>pnpm install</code>.</li>
        </ul>
      </section>

      <section class="section-card">
        <h2>Core commands</h2>
        <table>
          <thead><tr><th>Command</th><th>What it does</th></tr></thead>
          <tbody>
            <tr><td><code>pnpm dev</code></td><td>Runs <code>docker-compose up</code>, Vite frontend, GuardDuty scanner dev, and PDF generator dev concurrently.</td></tr>
            <tr><td><code>pnpm dev:frontend</code></td><td>Runs <code>formsg-frontend</code> Vite dev server.</td></tr>
            <tr><td><code>pnpm dev:backend</code></td><td>Runs backend with <code>ts-node-dev</code>, dotenv, polling, and inspector.</td></tr>
            <tr><td><code>pnpm build</code></td><td>Cleans and builds shared, SDK, frontend, and backend.</td></tr>
            <tr><td><code>pnpm test</code></td><td>Runs backend, shared, and frontend tests.</td></tr>
            <tr><td><code>pnpm lint</code></td><td>Runs lint for backend, shared, and frontend.</td></tr>
            <tr><td><code>pnpm storybook</code></td><td>Runs frontend Storybook.</td></tr>
            <tr><td><code>pnpm test:e2e-v2</code></td><td>Builds and runs Playwright tests.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Docker Compose services</h2>
        <table>
          <thead><tr><th>Service</th><th>Purpose</th><th>Ports/details</th></tr></thead>
          <tbody>
            <tr><td><code>backend</code></td><td>Development backend container with repo mounted into <code>/opt/formsg</code>.</td><td><code>5001:5000</code>, <code>4566</code> Localstack via shared network, <code>5156</code> MockPass via shared network, <code>9229</code> inspector.</td></tr>
            <tr><td><code>database</code></td><td>MongoDB 4.4 replica-set-style local database.</td><td><code>27017</code>, initialized by <code>init-mongo.js</code>.</td></tr>
            <tr><td><code>localstack</code></td><td>Local S3/SQS.</td><td>Uses backend network; CORS allows Vite origin.</td></tr>
            <tr><td><code>maildev</code></td><td>Local mail viewer.</td><td>Web UI on <code>1080</code>.</td></tr>
            <tr><td><code>mockpass</code></td><td>Mock SingPass/CorpPass/MyInfo/sgID support.</td><td>Shares backend network at port <code>5156</code>.</td></tr>
            <tr><td><code>stripe-cli</code></td><td>Stripe webhook forwarding.</td><td>Forwards to <code>host.docker.internal:5001/api/v3/notifications/stripe</code>.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Runtime env in frontend</h2>
        <p>The backend injects runtime environment into <code>window.__ENV__</code> for the browser and also exposes <code>/client/env</code>. This allows the same frontend build to run against different backend environments. Local frontend code reads the values through <code>apps/frontend/src/features/env/EnvService.ts</code>.</p>
      </section>

      <section class="section-card">
        <h2>Troubleshooting</h2>
        <ul>
          <li>If the frontend cannot call APIs, confirm Vite proxy and backend port <code>5001</code>.</li>
          <li>If identity flows fail locally, confirm MockPass is reachable at the backend shared network port and redirect URLs use <code>localhost:5001</code>.</li>
          <li>If uploads/webhooks fail, confirm Localstack S3/SQS buckets/queues and <code>AWS_ENDPOINT</code>.</li>
          <li>If emails do not appear, check Maildev at <code>localhost:1080</code> and backend SES host/port env.</li>
          <li>If Stripe webhooks do not fire, check <code>STRIPE_API_KEY</code>, <code>STRIPE_DEVICE_NAME</code>, and the stripe-cli container logs.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'testing.html',
    title: 'Testing',
    description: 'Test layers, commands, package-specific test runners, Storybook, Playwright, and coverage strategy.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Build and operate</p>
        <h1>Testing strategy</h1>
        <p class="lede">Testing is package-oriented: backend uses Jest, frontend uses Vitest and Storybook, shared and SDK packages have focused unit tests, and Playwright covers end-to-end browser flows.</p>
      </section>

      <section class="section-card">
        <h2>Command reference</h2>
        <table>
          <thead><tr><th>Command</th><th>Runner</th><th>Scope</th></tr></thead>
          <tbody>
            <tr><td><code>pnpm test</code></td><td>Composite</td><td>Backend, shared, frontend.</td></tr>
            <tr><td><code>pnpm test:backend</code></td><td>Jest</td><td><code>apps/backend/src</code> with test env.</td></tr>
            <tr><td><code>pnpm test:backend:ci</code></td><td>Jest</td><td>Backend CI mode with constrained workers and memory logging.</td></tr>
            <tr><td><code>pnpm test:frontend</code></td><td>Vitest</td><td><code>apps/frontend</code>.</td></tr>
            <tr><td><code>pnpm test:shared</code></td><td>Package test</td><td><code>packages/shared</code>.</td></tr>
            <tr><td><code>pnpm test:sdk</code></td><td>Package test</td><td><code>packages/sdk</code>.</td></tr>
            <tr><td><code>pnpm test:e2e-v2</code></td><td>Playwright</td><td>Full build and browser tests.</td></tr>
            <tr><td><code>pnpm storybook</code></td><td>Storybook</td><td>Frontend component states.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Where tests live</h2>
        <ul>
          <li>Backend tests sit beside modules in <code>__tests__</code> directories, for example <code>modules/myinfo/__tests__</code>, <code>routes/api/v3/forms/__tests__</code>, and <code>models/__tests__</code>.</li>
          <li>Backend test env is loaded from <code>apps/backend/__tests__/setup/.test-env</code>.</li>
          <li>Frontend utility tests use <code>*.test.ts</code> near feature utilities and Storybook stories use <code>*.stories.tsx</code>.</li>
          <li>Shared package tests live under <code>packages/shared/**/__tests__</code>.</li>
          <li>Service tests live in each service package, for example <code>services/virus-scanner-guardduty/src/__tests__</code> and <code>services/pdf-gen-sparticuz/src/__tests__</code>.</li>
        </ul>
      </section>

      <section class="section-card">
        <h2>Risk-based coverage guide</h2>
        <table>
          <thead><tr><th>Change</th><th>Minimum tests</th><th>Extra checks</th></tr></thead>
          <tbody>
            <tr><td>Shared type/validator</td><td>Shared unit tests</td><td>Frontend/backend affected tests and build.</td></tr>
            <tr><td>Backend route</td><td>Route tests plus controller/service tests</td><td>Unauthorized, validation failure, not found, happy path.</td></tr>
            <tr><td>Field type</td><td>Shared, backend validator/model, frontend render tests/stories</td><td>Response export/decryption and MRF/logic behavior.</td></tr>
            <tr><td>Payment/auth/integration</td><td>Unit tests with provider mocks and route tests</td><td>Idempotency, callback verification, failure modes.</td></tr>
            <tr><td>Visual UI state</td><td>Storybook story and Vitest where logic exists</td><td>Chromatic if changed component is covered.</td></tr>
            <tr><td>End-to-end workflow</td><td>Playwright when behavior spans browser, API, and persistence</td><td>Seed data and teardown stability.</td></tr>
          </tbody>
        </table>
      </section>
    `,
  },
  {
    file: 'ci-cd-deployment.html',
    title: 'CI/CD and deployment',
    description: 'GitHub workflows, image builds, release flow, ECS/CodeDeploy deployment, Lambda deployment, and observability.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Build and operate</p>
        <h1>CI/CD and deployment</h1>
        <p class="lede">Automation is GitHub Actions based. Workflows cover CI, browser tests, visual tests, code scanning, release images, ECS deployments, Lambda deployments, SDK publishing, and base image builds.</p>
      </section>

      <section class="section-card">
        <h2>Workflow inventory</h2>
        <div class="mermaid-wrap">
          <pre class="mermaid">flowchart LR
  pr["Pull request or push"] --&gt; filters["Path filters"]
  filters --&gt; ci["ci.yml&lt;br/&gt;install, build, lint, tests"]
  filters --&gt; pw["playwright.yml&lt;br/&gt;browser E2E"]
  filters --&gt; chromatic["chromatic.yml&lt;br/&gt;visual regression"]
  ci --&gt; review["Review and merge"]
  pw --&gt; review
  chromatic --&gt; review
  release["Manual release.yml"] --&gt; version["commit-and-tag-version"]
  version --&gt; image["build-release-image.yml"]
  image --&gt; ecs["deploy-ecs*.yml"]
  version --&gt; pdf["deploy-pdf-gen*.yml"]
  version --&gt; scanner["deploy-virus-scanner-guardduty*.yml"]
  version --&gt; sdk["publish-sdk.yml if SDK changed"]
  ecs --&gt; runtime["ECS/CodeDeploy, S3 static assets, Datadog sourcemaps"]</pre>
        </div>
        <table>
          <thead><tr><th>Workflow</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>.github/workflows/ci.yml</code></td><td>Main CI for build/test/lint style checks.</td></tr>
            <tr><td><code>playwright.yml</code></td><td>End-to-end browser tests.</td></tr>
            <tr><td><code>chromatic.yml</code></td><td>Storybook visual regression publishing/checks.</td></tr>
            <tr><td><code>codeql-analysis.yml</code></td><td>CodeQL security scanning.</td></tr>
            <tr><td><code>lint-pr.yml</code></td><td>Pull request metadata/title linting.</td></tr>
            <tr><td><code>release.yml</code></td><td>Release orchestration.</td></tr>
            <tr><td><code>build-release-image.yml</code></td><td>Builds release container images.</td></tr>
            <tr><td><code>deploy-ecs*.yml</code></td><td>ECS deployments across staging, UAT, production, and alternate staging environments.</td></tr>
            <tr><td><code>deploy-pdf-gen*.yml</code></td><td>PDF generator Lambda deployments.</td></tr>
            <tr><td><code>deploy-virus-scanner-guardduty*.yml</code></td><td>Virus scanner GuardDuty service deployments.</td></tr>
            <tr><td><code>aws-deploy-scanner-guardduty-iac.yml</code></td><td>Scanner/GuardDuty infrastructure deployment.</td></tr>
            <tr><td><code>publish-sdk.yml</code></td><td>SDK publishing.</td></tr>
            <tr><td><code>build-base-images.yml</code></td><td>Base image maintenance.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Deployment model</h2>
        <ul>
          <li>Main application deploys as container images to ECS, with CodeDeploy-style rollout workflows.</li>
          <li>Images are built and pushed through GitHub workflows to GHCR/ECR-style registries depending on environment.</li>
          <li>Frontend static assets are built by Vite and served by the backend/static asset infrastructure, with runtime env injected by backend.</li>
          <li>Static assets and uploads use S3 buckets; production config defines bucket names for attachments, images, logos, payment proof, static assets, and scanner clean/quarantine buckets.</li>
          <li>Datadog source maps and telemetry are part of release/deployment observability.</li>
          <li>PDF generator and virus scanner deploy through separate Lambda workflows, not the main ECS app deploy.</li>
        </ul>
      </section>

      <section class="section-card">
        <h2>Release safety checklist</h2>
        <ul class="checklist">
          <li>Run affected tests locally before relying on CI.</li>
          <li>For schema changes, prepare forward-compatible code and a migration/rollback plan.</li>
          <li>For env changes, update config docs and deployment secrets before shipping code that requires them.</li>
          <li>For frontend runtime env changes, verify backend <code>/client/env</code> and injected <code>window.__ENV__</code>.</li>
          <li>For integrations, verify staging callbacks, webhook secrets, and idempotency before production.</li>
          <li>Monitor Datadog logs/traces/RUM after deploy for route error rates and browser exceptions.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'configuration.html',
    title: 'Configuration',
    description: 'Environment variables, runtime env injection, Docker Compose settings, and configuration ownership.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Build and operate</p>
        <h1>Configuration</h1>
        <p class="lede">Configuration is split between backend env/convict settings, Docker Compose local defaults, frontend runtime env, service-specific env files, and deployment secrets.</p>
      </section>

      <section class="section-card">
        <h2>Configuration ownership</h2>
        <table>
          <thead><tr><th>Area</th><th>Where to look</th><th>Examples</th></tr></thead>
          <tbody>
            <tr><td>Backend app config</td><td><code>apps/backend/src/app/config</code> and env</td><td><code>DB_HOST</code>, <code>SESSION_SECRET</code>, <code>APP_URL</code>, AWS settings, rate limits.</td></tr>
            <tr><td>Frontend runtime config</td><td>Backend injection and <code>/client/env</code>, read by <code>features/env</code></td><td>Client-visible flags, public keys, environment-specific URLs.</td></tr>
            <tr><td>Local defaults</td><td><code>docker-compose.yml</code></td><td>Mongo URL, Localstack endpoint, MockPass URLs, Maildev, Stripe CLI forwarding.</td></tr>
            <tr><td>Service config</td><td><code>services/*/.env*</code>, serverless/SAM files</td><td>GuardDuty buckets, PDF Lambda settings, reconciliation secrets.</td></tr>
            <tr><td>CI/CD secrets</td><td>GitHub Actions environments/secrets</td><td>AWS credentials, deployment roles, Datadog, registry credentials, provider secrets.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>High-signal local env groups</h2>
        <div class="grid two">
          <article class="mini-card"><h3>Core app</h3><p><code>NODE_ENV</code>, <code>DB_HOST</code>, <code>APP_NAME</code>, <code>APP_URL</code>, <code>FE_APP_URL</code>, <code>SESSION_SECRET</code>, <code>SECRET_ENV</code>.</p></article>
          <article class="mini-card"><h3>AWS/localstack</h3><p><code>AWS_ENDPOINT</code>, <code>AWS_REGION</code>, bucket env vars for attachments, images, logos, static assets, payment proof, GuardDuty clean/quarantine.</p></article>
          <article class="mini-card"><h3>Identity</h3><p>SingPass/CorpPass OIDC discovery/JWKS/client/redirect/key paths, MyInfo config and cert paths, sgID host/client/redirect/private/public key paths, SSO env.</p></article>
          <article class="mini-card"><h3>Payments</h3><p><code>PAYMENT_STRIPE_PUBLISHABLE_KEY</code>, <code>PAYMENT_STRIPE_SECRET_KEY</code>, <code>PAYMENT_STRIPE_CLIENT_ID</code>, <code>PAYMENT_STRIPE_WEBHOOK_SECRET</code>, min/max amounts, cron secret.</p></article>
          <article class="mini-card"><h3>Feature flags and analytics</h3><p><code>GROWTHBOOK_CLIENT_KEY</code>, migration rollout env vars, WOGAA env vars, Datadog deployment settings.</p></article>
          <article class="mini-card"><h3>Communications</h3><p>SES host/port/user/pass, Postman campaign IDs/API keys, SMS limits, feedback form IDs.</p></article>
        </div>
      </section>

      <section class="section-card">
        <h2>Configuration change checklist</h2>
        <ul class="checklist">
          <li>Decide whether a value is server-secret, server-only, client-visible, or local-only.</li>
          <li>Do not expose secrets through <code>window.__ENV__</code> or <code>/client/env</code>.</li>
          <li>Add validation/defaults in backend config where appropriate.</li>
          <li>Update Docker Compose if local development should work without extra setup.</li>
          <li>Update deployment secrets before deploying code that requires new env vars.</li>
          <li>Document service-specific env in that service's README or this wiki.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'operations-migrations.html',
    title: 'Operations and migrations',
    description: 'Mongo migration scripts, operational jobs, data safety, rollout, and rollback guidance.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Build and operate</p>
        <h1>Operations and migrations</h1>
        <p class="lede">The <code>scripts</code> directory contains dated Mongo/data migrations and cleanup utilities. Treat them as production data tools with explicit review, dry runs, backups, and rollback decisions.</p>
      </section>

      <section class="section-card">
        <h2>Migration script inventory themes</h2>
        <table>
          <thead><tr><th>Theme</th><th>Representative scripts</th><th>Risk</th></tr></thead>
          <tbody>
            <tr><td>MRF/workflow</td><td><code>20240214_mrf-workflow-field-locking</code>, <code>20240215_mrf-retain-workflow-in-submissions</code>, <code>20241029_copy-workflow-step1-email-field-to-settings</code></td><td>Submission workflow behavior and respondent access.</td></tr>
            <tr><td>Payments</td><td><code>20230222_add-payments-flag</code>, <code>20230315_separate-payments-to-field-and-channel</code>, <code>20230718_set-gst-enabled-flag</code>, <code>20230803_set-payment-fields-snapshot</code>, <code>20230816_convert-payment-fields-snapshot-to-object</code></td><td>Revenue collection and historical payment records.</td></tr>
            <tr><td>Identity/MyInfo</td><td><code>20210224_myinfo-authtype</code>, <code>20210202_deprecate-myinfo-v2</code>, <code>20200611_myinfo-phonefields-migration</code></td><td>Verified fields and respondent identity data.</td></tr>
            <tr><td>Field/schema cleanup</td><td><code>20210517_validation-object</code>, <code>20230817_migrate-number-field-schema</code>, <code>20200618_remove-fieldvalue</code></td><td>Form rendering and submission validation.</td></tr>
            <tr><td>Feature flags/settings</td><td><code>20230508_add-feature-flag</code>, <code>20221201_remove-sgid-flag</code>, <code>20240821_set_isSubmitterIdCollectionEnabled_true_for_all_existing_forms</code></td><td>Global product behavior and rollout flags.</td></tr>
            <tr><td>Legacy cleanup</td><td><code>20191212_dangling-key-cleanup</code>, <code>20200923_unused-key-cleanup</code>, <code>20210706_remove-endpage-buttons</code></td><td>Historical data assumptions.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Migration playbook</h2>
        <ol>
          <li>Read the current Mongoose schema and any existing migrations for the same fields.</li>
          <li>Write the migration to be idempotent and resumable. Store progress markers or query by precise criteria.</li>
          <li>Include a dry-run mode or count-only query when practical.</li>
          <li>Estimate matched/modified document counts before writing.</li>
          <li>Coordinate backup/snapshot timing with operators.</li>
          <li>Run in staging with production-like data shape.</li>
          <li>Deploy compatible code before destructive migrations.</li>
          <li>Capture logs, changed counts, and any failed IDs.</li>
          <li>Document rollback: script, manual procedure, or explicit no-rollback rationale.</li>
        </ol>
      </section>

      <section class="section-card">
        <h2>Operational hotspots</h2>
        <ul>
          <li><strong>Submission encryption:</strong> avoid server-side plaintext assumptions for encrypted storage mode.</li>
          <li><strong>Payment state:</strong> expect delayed or repeated provider events; reconciliation must be safe to rerun.</li>
          <li><strong>Attachment scanning:</strong> quarantine/clean bucket transitions should be auditable and idempotent.</li>
          <li><strong>Identity callbacks:</strong> time windows, redirect URLs, and key rotation can break login flows.</li>
          <li><strong>Runtime env:</strong> frontend behavior can change without rebuilding if backend-injected env changes.</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'extension-guides.html',
    title: 'Extension guides',
    description: 'Practical checklists for adding fields, routes, integrations, settings, migrations, and services.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Reference</p>
        <h1>Extension guides</h1>
        <p class="lede">Use these playbooks to keep changes aligned across shared contracts, frontend UX, backend authority, persistence, tests, and operations.</p>
      </section>

      <section class="section-card">
        <h2>Add a new form field</h2>
        <ol>
          <li>Define the type in <code>packages/shared/types/field</code> and update exports.</li>
          <li>Add any validation helpers in <code>packages/shared/utils</code>.</li>
          <li>Add backend schema under <code>apps/backend/src/app/models/field</code>.</li>
          <li>Add backend field validator under <code>apps/backend/src/app/utils/field-validation/validators</code>.</li>
          <li>Update public rendering in <code>apps/frontend/src/templates/Field</code>.</li>
          <li>Update admin builder drawer, field list, default values, drag/drop behavior, and previews in <code>features/admin-form/create</code>.</li>
          <li>Update response rendering, CSV/export, encrypted decryption display, and charts if applicable.</li>
          <li>Add tests at shared/backend/frontend layers and stories for key states.</li>
        </ol>
      </section>

      <section class="section-card">
        <h2>Add a backend API endpoint</h2>
        <ol>
          <li>Select the route group under <code>apps/backend/src/app/routes/api/v3</code> or <code>api/public/v1</code>.</li>
          <li>Add request validation close to the route/controller.</li>
          <li>Use existing auth middleware for admin, public respondent, intranet, cron, or bearer-token access.</li>
          <li>Implement domain behavior in a module service, not directly in the route.</li>
          <li>Return typed DTOs aligned with <code>packages/shared</code> when frontend or external users consume them.</li>
          <li>Add route tests for auth failures, validation failures, service errors, and success.</li>
          <li>Add frontend service/query/mutation wrappers if used by the SPA.</li>
        </ol>
      </section>

      <section class="section-card">
        <h2>Add an external integration</h2>
        <ol>
          <li>Identify ownership: backend module, frontend-only service, sidecar service, or SDK.</li>
          <li>Add config with validation and clear secret/client-visible separation.</li>
          <li>Create an adapter layer that normalizes provider responses into FormSG domain types.</li>
          <li>Verify callback signatures/tokens and design idempotency before state changes.</li>
          <li>Add local development support with MockPass/Localstack/Maildev equivalents if feasible.</li>
          <li>Add integration tests with provider mocks and document operational dashboards/alerts.</li>
        </ol>
      </section>

      <section class="section-card">
        <h2>Add a new service or job</h2>
        <ol>
          <li>Create under <code>services/&lt;name&gt;</code> only if it truly needs a separate runtime.</li>
          <li>Add package scripts, TypeScript/Jest config, README, and env examples.</li>
          <li>Define event input/output contracts and validate at boundaries.</li>
          <li>Make retry behavior and idempotency explicit.</li>
          <li>Add deployment workflow or extend existing service deployment workflows.</li>
          <li>Wire local dev into root scripts only if most contributors need it.</li>
        </ol>
      </section>

      <section class="section-card">
        <h2>Review checklist for broad changes</h2>
        <ul class="checklist">
          <li>Have shared types, frontend behavior, backend validation, and Mongoose schemas changed together?</li>
          <li>Are persisted data migrations needed for existing forms/submissions/users/payments?</li>
          <li>Are runtime env and deployment secrets documented?</li>
          <li>Are identity/payment/webhook callbacks verified and idempotent?</li>
          <li>Are new public routes covered by auth/rate limits?</li>
          <li>Are Storybook, unit, integration, and E2E tests scoped to the change risk?</li>
          <li>Will the change preserve existing encrypted submission readability?</li>
        </ul>
      </section>
    `,
  },
  {
    file: 'key-file-index.html',
    title: 'Key file index',
    description: 'Concrete file path index grouped by feature and runtime surface.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Reference</p>
        <h1>Key file index</h1>
        <p class="lede">A practical lookup table for the files engineers most often need when tracing behavior.</p>
      </section>

      <section class="section-card">
        <h2>Boot and routing</h2>
        <table>
          <thead><tr><th>Path</th><th>Why it matters</th></tr></thead>
          <tbody>
            <tr><td><code>apps/frontend/src/index.tsx</code></td><td>Frontend bootstrap.</td></tr>
            <tr><td><code>apps/frontend/src/app/App.tsx</code></td><td>Global providers.</td></tr>
            <tr><td><code>apps/frontend/src/app/AppRouter.tsx</code></td><td>Browser route tree.</td></tr>
            <tr><td><code>apps/backend/src/app/server.ts</code></td><td>Backend runtime entry.</td></tr>
            <tr><td><code>apps/backend/src/app/loaders/index.ts</code></td><td>Backend loader composition.</td></tr>
            <tr><td><code>apps/backend/src/app/loaders/express/index.ts</code></td><td>Middleware and route mounts.</td></tr>
            <tr><td><code>apps/backend/src/app/routes/api/v3/v3.routes.ts</code></td><td>Main V3 route composition.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Forms, fields, and submissions</h2>
        <table>
          <thead><tr><th>Path</th><th>Why it matters</th></tr></thead>
          <tbody>
            <tr><td><code>packages/shared/types/field</code></td><td>Canonical field contracts.</td></tr>
            <tr><td><code>packages/shared/types/form</code></td><td>Canonical form contracts.</td></tr>
            <tr><td><code>apps/frontend/src/features/public-form/PublicFormPage.tsx</code></td><td>Public form page entry.</td></tr>
            <tr><td><code>apps/frontend/src/features/public-form/PublicFormProvider.tsx</code></td><td>Public form state provider.</td></tr>
            <tr><td><code>apps/frontend/src/templates/Field</code></td><td>Field rendering templates.</td></tr>
            <tr><td><code>apps/frontend/src/features/admin-form/create</code></td><td>Admin builder.</td></tr>
            <tr><td><code>apps/frontend/src/features/admin-form/responses</code></td><td>Responses, decryption, exports.</td></tr>
            <tr><td><code>apps/backend/src/app/modules/form</code></td><td>Form services/controllers.</td></tr>
            <tr><td><code>apps/backend/src/app/modules/submission</code></td><td>Submission services/controllers.</td></tr>
            <tr><td><code>apps/backend/src/app/models/form.server.model.ts</code></td><td>Form persistence.</td></tr>
            <tr><td><code>apps/backend/src/app/models/submission.server.model.ts</code></td><td>Submission persistence.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Auth, payments, integrations, and services</h2>
        <table>
          <thead><tr><th>Path</th><th>Why it matters</th></tr></thead>
          <tbody>
            <tr><td><code>apps/backend/src/app/modules/auth</code></td><td>Admin auth services, middlewares, sgID/SSO/WOG AD.</td></tr>
            <tr><td><code>apps/backend/src/app/modules/myinfo</code></td><td>MyInfo adapter/controller/service.</td></tr>
            <tr><td><code>apps/backend/src/app/modules/payments</code></td><td>Payment domain logic.</td></tr>
            <tr><td><code>apps/backend/src/app/modules/webhook</code></td><td>Webhook validation/queue production.</td></tr>
            <tr><td><code>apps/backend/src/app/services/mail</code></td><td>Email delivery abstraction.</td></tr>
            <tr><td><code>services/virus-scanner-guardduty</code></td><td>Upload scan service.</td></tr>
            <tr><td><code>services/pdf-gen-sparticuz</code></td><td>PDF generation Lambda.</td></tr>
            <tr><td><code>services/form-payment-reconciliation</code></td><td>Payment reconciliation cron.</td></tr>
            <tr><td><code>packages/sdk/src</code></td><td>SDK crypto/webhook/verification helpers.</td></tr>
          </tbody>
        </table>
      </section>
    `,
  },
  {
    file: 'glossary-gotchas.html',
    title: 'Glossary and gotchas',
    description: 'Vocabulary, caveats, recurring pitfalls, and reviewer reminders.',
    body: `
      <section class="hero compact">
        <p class="eyebrow">Reference</p>
        <h1>Glossary and gotchas</h1>
        <p class="lede">Common vocabulary and sharp edges that matter when changing FormSG.</p>
      </section>

      <section class="section-card">
        <h2>Glossary</h2>
        <table>
          <thead><tr><th>Term</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td>Admin</td><td>Authenticated form owner/editor using the admin workspace and form builder.</td></tr>
            <tr><td>Respondent</td><td>Public user completing a form.</td></tr>
            <tr><td>Storage mode</td><td>Encrypted submission storage where admins decrypt responses with a secret key.</td></tr>
            <tr><td>Email mode</td><td>Submission mode that sends responses by email instead of encrypted response storage.</td></tr>
            <tr><td>MRF</td><td>Multirespondent form workflow where multiple respondents complete assigned steps.</td></tr>
            <tr><td>Verified field</td><td>Field value tied to trusted identity/provider data and signature verification.</td></tr>
            <tr><td>Runtime env</td><td>Client-visible configuration injected by backend into the built frontend at runtime.</td></tr>
            <tr><td>Localstack</td><td>Local AWS emulator used for S3/SQS during development.</td></tr>
            <tr><td>MockPass</td><td>Local mock for SingPass/CorpPass/MyInfo/sgID flows.</td></tr>
            <tr><td>Pending submission</td><td>Intermediate record often used while payment or finalization is incomplete.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section-card">
        <h2>Gotchas</h2>
        <ul>
          <li><strong>Frontend validation is not authority.</strong> Backend validators and services must enforce persisted behavior.</li>
          <li><strong>Encrypted storage means server plaintext is not always available.</strong> Do not add backend features that assume decrypted answers exist for storage-mode submissions.</li>
          <li><strong>Runtime env can differ from build env.</strong> Client-visible values come from backend injection and <code>/client/env</code>.</li>
          <li><strong>Field changes are cross-cutting.</strong> Shared types, backend schemas/validators, frontend templates, builder drawers, response display, logic, MRF, and exports can all be affected.</li>
          <li><strong>MRF locks are both UI and backend concerns.</strong> Frontend disables fields for UX; backend must validate allowed step writes.</li>
          <li><strong>Payment events repeat and arrive late.</strong> Webhooks and reconciliation must be idempotent.</li>
          <li><strong>Identity redirects are environment-sensitive.</strong> Localhost, staging, and production callback URLs must match provider configuration.</li>
          <li><strong>Migrations should be resumable.</strong> Dated scripts often touch production data; write precise queries and preserve logs.</li>
          <li><strong>GitBook is canonical for self-hosting.</strong> Repository docs are useful snapshots and engineering references, but self-hosting guidance points to GitBook.</li>
        </ul>
      </section>

      <section class="section-card">
        <h2>Reviewer prompts</h2>
        <ul class="checklist">
          <li>Does this change need a migration for existing data?</li>
          <li>Does this expose a secret through frontend runtime env?</li>
          <li>Are public routes protected by the correct actor model?</li>
          <li>Are callbacks/webhooks signature-verified and idempotent?</li>
          <li>Can encrypted historical submissions still be read/exported?</li>
          <li>Are route maps, docs, and tests updated where contracts changed?</li>
        </ul>
      </section>
    `,
  },
]

const aliases = [
  ['domain-flows.html', 'data-flows.html'],
  ['data-persistence.html', 'forms-submissions.html'],
  ['services-jobs.html', 'services.html'],
  ['ci-cd.html', 'ci-cd-deployment.html'],
  ['scripts-migrations.html', 'operations-migrations.html'],
  ['extension-playbooks.html', 'extension-guides.html'],
  ['file-index-glossary.html', 'key-file-index.html'],
  ['caveats.html', 'glossary-gotchas.html'],
]

const css = `
:root {
  color-scheme: light;
  --bg: #f6f8fb;
  --surface: #ffffff;
  --surface-alt: #f1f5f9;
  --surface-code: #0f172a;
  --border: #d8e0ed;
  --border-strong: #aab8cc;
  --text: #102033;
  --muted: #5e6b7a;
  --muted-strong: #334155;
  --brand: #2563eb;
  --brand-dark: #1d4ed8;
  --brand-soft: #dbeafe;
  --green: #047857;
  --green-soft: #d1fae5;
  --orange: #b45309;
  --orange-soft: #ffedd5;
  --purple: #6d28d9;
  --purple-soft: #ede9fe;
  --red: #b91c1c;
  --red-soft: #fee2e2;
  --shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
  --radius: 16px;
  --mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  --sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  line-height: 1.62;
}
a { color: var(--brand); text-decoration: none; }
a:hover { color: var(--brand-dark); text-decoration: underline; }
code, kbd, pre { font-family: var(--mono); }
code {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-alt);
  color: #0f172a;
  padding: 0.08rem 0.3rem;
  font-size: 0.88em;
}
pre {
  overflow-x: auto;
  margin: 1rem 0 0;
  border-radius: 14px;
  background: var(--surface-code);
  color: #e5e7eb;
  padding: 1rem;
  font-size: 0.86rem;
}
pre code { border: 0; background: transparent; color: inherit; padding: 0; }
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  font-size: 0.94rem;
}
th, td { border-bottom: 1px solid var(--border); padding: 0.8rem 0.9rem; text-align: left; vertical-align: top; }
th { background: #eef4ff; color: var(--muted-strong); font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; }
tr:last-child td { border-bottom: 0; }
ul, ol { padding-left: 1.35rem; }
li + li { margin-top: 0.3rem; }

.app-shell { display: grid; grid-template-columns: 320px minmax(0, 1fr); min-height: 100vh; }
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid rgba(148, 163, 184, 0.22);
  background: #0f172a;
  color: #dbeafe;
  padding: 1.1rem 1rem 2rem;
}
.brand-block { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding: 0.45rem; }
.logo-mark {
  display: inline-grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6);
  color: #fff;
  font-weight: 800;
}
.brand-block strong { display: block; color: #fff; font-size: 1.05rem; }
.brand-block span { display: block; color: #93a4bd; font-size: 0.82rem; }
.nav-search {
  width: 100%;
  border: 1px solid rgba(199, 210, 254, 0.24);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.7);
  color: #fff;
  padding: 0.55rem 0.65rem;
  margin: 0.25rem 0 0.75rem;
}
.nav-search::placeholder { color: #93a4bd; }
.nav-group { margin: 0.95rem 0; }
.nav-group h2 { margin: 1.2rem 0 0.45rem; color: #93a4bd; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; }
.nav-group ul { list-style: none; margin: 0; padding: 0; }
.nav-group li { margin: 0.1rem 0; }
.nav-group a { display: block; border-radius: 9px; color: #c7d2fe; padding: 0.42rem 0.58rem; font-size: 0.9rem; }
.nav-group a:hover, .nav-group a.active { background: rgba(96, 165, 250, 0.16); color: #fff; text-decoration: none; }
.mobile-bar { display: none; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.85rem 1rem; background: #0f172a; color: #fff; }
.mobile-bar button { border: 1px solid rgba(255,255,255,0.2); border-radius: 9px; background: transparent; color: #fff; padding: 0.45rem 0.7rem; }
.content { min-width: 0; }
.topline { display: flex; justify-content: space-between; gap: 1rem; padding: 0.7rem min(7vw, 5.5rem); border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.78); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 3; }
.breadcrumbs, .updated { color: var(--muted); font-size: 0.86rem; }
.page { padding: 0 min(7vw, 5.5rem) 4rem; }
.hero {
  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * min(7vw, 5.5rem)) 1.5rem;
  border-bottom: 1px solid var(--border);
  background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.18), transparent 32rem), linear-gradient(180deg, #fff 0%, #f7f9fc 100%);
  padding: 4rem min(7vw, 5.5rem) 3rem;
}
.hero.compact { padding-top: 3rem; padding-bottom: 2.4rem; }
.eyebrow {
  display: inline-flex;
  margin: 0 0 1rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #fff;
  color: var(--muted-strong);
  padding: 0.3rem 0.75rem;
  font-size: 0.86rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}
h1 { max-width: 1050px; margin: 0; color: #0f172a; font-size: clamp(2.25rem, 4.2vw, 4.7rem); line-height: 0.98; letter-spacing: -0.055em; }
h2 { margin-top: 0; color: #0f172a; font-size: 1.65rem; letter-spacing: -0.025em; }
h3 { margin-top: 0; color: #172033; }
.lede { max-width: 900px; margin: 1.2rem 0 0; color: var(--muted); font-size: 1.12rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.4rem; }
.button { display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border-strong); border-radius: 999px; background: #fff; color: var(--brand); padding: 0.65rem 1rem; font-weight: 700; }
.button.primary { border-color: var(--brand); background: var(--brand); color: #fff; }
.button:hover { text-decoration: none; transform: translateY(-1px); box-shadow: var(--shadow); }
.section-card {
  margin: 1.25rem 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 1.35rem;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
}
.grid { display: grid; gap: 1rem; margin-top: 1rem; }
.grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.mini-card, .stat {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  padding: 1rem;
}
.stat strong { display: block; color: #0f172a; font-size: 1rem; }
.stat span { display: block; margin-top: 0.3rem; color: var(--muted); font-size: 0.9rem; }
.flow { display: grid; gap: 0.8rem; margin-top: 1rem; }
.flow div { border-left: 4px solid var(--brand); border-radius: 12px; background: #f8fbff; padding: 0.85rem 1rem; }
.flow strong, .flow span { display: block; }
.flow span { color: var(--muted); }
.diagram { border: 1px solid #22304a; }
.mermaid-wrap {
  overflow-x: auto;
  margin-top: 1rem;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 1rem;
}
.mermaid {
  min-width: 680px;
  margin: 0;
  background: transparent;
  color: var(--text);
  text-align: center;
}
.checklist { list-style: none; padding-left: 0; }
.checklist li { position: relative; padding-left: 1.7rem; }
.checklist li::before { content: "OK"; position: absolute; left: 0; top: 0.1rem; border-radius: 5px; background: var(--green-soft); color: var(--green); padding: 0 0.25rem; font-size: 0.68rem; font-weight: 800; }
.toc {
  margin: 1rem 0;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fbfdff;
  padding: 1rem;
}
.toc strong { display: block; margin-bottom: 0.35rem; }
.toc a { display: inline-block; margin: 0.2rem 0.75rem 0.2rem 0; font-size: 0.9rem; }
.footer { margin-top: 2rem; color: var(--muted); font-size: 0.9rem; }

@media (max-width: 1050px) {
  .app-shell { grid-template-columns: 1fr; }
  .mobile-bar { display: flex; position: sticky; top: 0; z-index: 10; }
  .sidebar { position: fixed; inset: 0 auto 0 0; width: min(86vw, 320px); transform: translateX(-100%); transition: transform 0.2s ease; z-index: 20; }
  body.nav-open .sidebar { transform: translateX(0); }
  .topline { position: static; }
  .grid.three, .grid.four, .grid.two { grid-template-columns: 1fr; }
}

@media print {
  .sidebar, .mobile-bar, .topline { display: none; }
  .app-shell { display: block; }
  .page { padding: 0; }
  .section-card { box-shadow: none; break-inside: avoid; }
}
`

const js = `
(function () {
  const nav = ${JSON.stringify(nav)}
  const active = document.body.dataset.page || 'index.html'
  const sidebar = document.getElementById('wiki-sidebar')

  function renderNav(filter) {
    const term = (filter || '').trim().toLowerCase()
    const groups = nav.map((group) => {
      const items = group.items.filter((item) => !term || item[1].toLowerCase().includes(term) || item[0].toLowerCase().includes(term))
      if (!items.length) return ''
      const links = items.map((item) => '<li><a class="' + (item[0] === active ? 'active' : '') + '" href="' + item[0] + '">' + item[1] + '</a></li>').join('')
      return '<div class="nav-group"><h2>' + group.group + '</h2><ul>' + links + '</ul></div>'
    }).join('')
    sidebar.innerHTML = '<div class="brand-block"><span class="logo-mark">FS</span><div><strong>FormSG Wiki</strong><span>Technical documentation</span></div></div><input class="nav-search" type="search" placeholder="Filter pages" aria-label="Filter wiki pages" />' + groups
    const input = sidebar.querySelector('.nav-search')
    input.value = filter || ''
    input.addEventListener('input', function (event) { renderNav(event.target.value) })
  }

  function renderToc() {
    const headings = Array.from(document.querySelectorAll('main h2'))
    if (headings.length < 2) return
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }
    })
    const toc = document.createElement('nav')
    toc.className = 'toc'
    toc.setAttribute('aria-label', 'On this page')
    toc.innerHTML = '<strong>On this page</strong>' + headings.map((heading) => '<a href="#' + heading.id + '">' + heading.textContent + '</a>').join('')
    const firstCard = document.querySelector('.section-card')
    if (firstCard) firstCard.parentNode.insertBefore(toc, firstCard)
  }

  function bindMobileNav() {
    const button = document.querySelector('[data-nav-toggle]')
    if (!button) return
    button.addEventListener('click', function () {
      document.body.classList.toggle('nav-open')
    })
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') document.body.classList.remove('nav-open')
    })
  }

  if (sidebar) renderNav('')
  renderToc()
  bindMobileNav()
})()
`

function html(page) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttr(page.description)}" />
    <title>FormSG Technical Wiki - ${escapeHtml(page.title)}</title>
    <link rel="stylesheet" href="assets/wiki.css" />
  </head>
  <body data-page="${page.file}">
    <div class="mobile-bar">
      <strong>FormSG Technical Wiki</strong>
      <button type="button" data-nav-toggle>Menu</button>
    </div>
    <div class="app-shell">
      <aside id="wiki-sidebar" class="sidebar" aria-label="Technical wiki navigation"></aside>
      <div class="content">
        <div class="topline">
          <span class="breadcrumbs"><a href="index.html">Technical wiki</a> / ${escapeHtml(page.title)}</span>
          <span class="updated">Static snapshot: June 30, 2026</span>
        </div>
        <main class="page">
${page.body}
          <p class="footer">This page is generated by <code>docs/technical-wiki/generate-wiki.mjs</code>. The checked-in HTML is the reviewable artifact.</p>
        </main>
      </div>
    </div>
    <script src="assets/wiki.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: true,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            primaryColor: '#dbeafe',
            primaryBorderColor: '#2563eb',
            primaryTextColor: '#0f172a',
            lineColor: '#64748b',
            secondaryColor: '#ede9fe',
            tertiaryColor: '#f8fafc',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
          }
        })
      }
    </script>
  </body>
</html>
`
}

function redirectHtml(target, title = 'FormSG Technical Wiki') {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <link rel="canonical" href="${target}" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f6f8fb; color: #102033; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { max-width: 620px; margin: 2rem; border: 1px solid #d8e0ed; border-radius: 16px; background: #fff; padding: 2rem; box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08); }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>This documentation has moved to <a href="${target}">${target}</a>.</p>
    </main>
  </body>
</html>
`
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]))
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;')
}

mkdirSync(assetsDir, { recursive: true })
writeFileSync(join(assetsDir, 'wiki.css'), css.trimStart())
writeFileSync(join(assetsDir, 'wiki.js'), js.trimStart())

for (const page of pages) {
  writeFileSync(join(root, page.file), html(page))
}

for (const [from, to] of aliases) {
  writeFileSync(join(root, from), redirectHtml(to, 'FormSG Technical Wiki redirect'))
}

writeFileSync(join(root, '..', 'technical-wiki.html'), redirectHtml('technical-wiki/index.html'))

console.log(`Generated ${pages.length} pages, ${aliases.length} redirects, and shared assets.`)
