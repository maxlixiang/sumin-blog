# Career OS Technical Plan

> Status: Phase 2 implementation in progress
>
> Date: 2026-09-22
>
> Decision status: architecture approved; Phase 1 completed; Phase 2 scope adjusted on 2026-09-23

> Phase 2 scope note: V1 uses a direct Simplified Chinese UI without an i18n framework. Minimum Necessary Information product design, sensitive-data classification, masking prompts, field-level encryption, and extra privacy workflows are deferred. Baseline controls remain mandatory: secrets stay out of Git, real private data is not committed, all user tables use RLS, and the application requires authentication.
>
> Working method: **Why → What → Success → How → Verify**

## Executive Decision

Career OS should be added to the current public Git repository as a **separately built application**, but it should not be inserted into the existing Vite blog runtime.

Recommended shape:

- Keep the current personal site at the repository root and keep its existing Vercel project and domains unchanged.
- Add a new Next.js application under `apps/career/` in Phase 1.
- Connect the same Git repository to a second Vercel project whose Root Directory is `apps/career`.
- Point `career.sumin.best` only to that second Vercel project.
- Use Supabase Postgres + Supabase Auth for the private application, with Row Level Security on every user-owned table.
- Do not put real Career OS records, database credentials, service-role keys, exports, or attachments in this public repository.

This is intentionally an additive, low-coupling structure rather than a full repository migration. A conventional workspace monorepo can be introduced later if genuine shared packages appear; it is not needed for V1.

---

## 1. Existing Project Assessment

### 1.1 Current stack

The existing personal website is:

- React `19.2.8`
- React DOM `19.2.8`
- Vite `8.2.2`
- `@vitejs/plugin-react` `6.1.1`
- `react-markdown` `10.1.0`
- JavaScript/JSX, not TypeScript
- npm with `package-lock.json`
- Plain CSS in `src/styles.css` and `src/footer.css`

It is **not a Next.js project**. Therefore:

- Current Next.js version: **not applicable**
- App Router vs Pages Router: **neither**
- Current routing: a small custom client-side router based on `window.history`, `popstate`, and pathname matching in `src/main.jsx`

### 1.2 Current directory structure

```text
sumin_website/
├── .gitignore
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
├── src/
│   ├── main.jsx             # Most UI, routing, and page logic
│   ├── styles.css           # Main visual system and responsive rules
│   └── footer.css
├── public/
│   ├── favicon.svg
│   ├── assets/
│   └── articles/
│       ├── index.json       # Article metadata
│       └── *.md / *.docx
├── scripts/                 # Currently empty
└── dist/                    # Local build output; gitignored
```

The current site is compact and intentionally simple. Most runtime behavior is concentrated in one large `src/main.jsx`; there is no component library, server runtime, API layer, or application-level data model.

### 1.3 Current deployment

Evidence available from the repository and production checks:

- `README.md` says Git pushes trigger Vercel builds and Vercel auto-detects Vite.
- The root build command is `npm run build`, producing `dist/`.
- `vercel.json` only rewrites `/articles/:path*` to `/index.html` for client-side article routing.
- `https://sumin.best` currently returns a Vercel `308` redirect to `https://www.sumin.best/`.
- `https://www.sumin.best/` currently returns `200 OK` from Vercel.
- The Git remote is `https://github.com/maxlixiang/sumin-blog.git`, branch `main`.
- The GitHub repository is **PUBLIC**.
- There is no checked-in `.vercel/` link metadata, so the Vercel project name, team, dashboard settings, and exact Git integration settings cannot be proven from the repository alone.

Baseline verification on 2026-09-22:

```text
npm run build
✓ vite v8.2.2
✓ 174 modules transformed
✓ build completed successfully
```

### 1.4 Data, authentication, and UI facilities

Current state:

| Question | Finding |
|---|---|
| Database | None |
| Authentication | None |
| Server/API | None |
| Tailwind CSS | None |
| UI component library | None |
| Form framework/validation | None |
| Test framework | None found |
| Existing persistent content | Markdown, JSON, and image files under `public/` |
| Environment files | `.env` and `.env.local` are gitignored |

### 1.5 What can be reused

Reuse should be visual and conceptual, not runtime-coupled.

Safe to reuse:

- Brand sensibility: restrained typography, neutral surfaces, violet accent, spacing rhythm.
- Existing favicon or rice-bowl brand mark, if Career OS should visibly belong to the same personal ecosystem.
- Mobile breakpoints and accessibility ideas such as `prefers-reduced-motion` and visible focus states.
- The current npm/Git/Vercel workflow at a process level.

Do not directly reuse:

- The handwritten router.
- The single-file `main.jsx` architecture.
- Blog CSS classes as Career OS global styles.
- The public `public/articles` content mechanism for private data.
- The root Vercel project as the Career OS data/application boundary.

---

## 2. Recommended Architecture

### 2.1 Why this architecture

Career OS is materially different from the current site:

- The blog is public, mostly static, and content comes from Git.
- Career OS is private, transactional, authenticated, and database-backed.
- The blog can tolerate a client-only Vite runtime; Career OS needs trusted server-side operations and secure session handling.
- The blog should not be redeployed or structurally migrated merely to make room for a private app.

The recommended boundary is therefore:

```text
One public Git repository
├── Existing Vite blog (root) ── Existing Vercel project ── www.sumin.best
└── Next.js Career OS (apps/career) ── New Vercel project ── career.sumin.best
                                          │
                                          └── Supabase Auth + Postgres
```

### 2.2 Recommended application stack

For the new app:

- Next.js 16, pinned through `package-lock.json` rather than an unbounded `latest` dependency
- App Router
- TypeScript with strict mode
- React Server Components for authenticated reads
- Server Actions for internal form mutations
- Route Handlers only when an actual HTTP endpoint is needed later
- Default Node.js runtime; no Edge runtime without a measured requirement
- Tailwind CSS for a mobile-first design system
- Selective shadcn/ui components for accessible primitives such as Dialog, Sheet, Select, Tabs, and form controls; no wholesale theme dependency
- Zod for server-side input validation
- Supabase JavaScript/SSR clients for authentication and data access
- SQL migrations stored in the app, plus generated TypeScript database types
- Native CSS/SVG for small progress displays; no chart library in the first dashboard

Next.js App Router is the better fit because the app needs server-side session checks, protected layouts, database reads, and mutations. Reads should generally happen directly in Server Components; writes should generally use Server Actions. This avoids creating an unnecessary internal REST layer.

### 2.3 Options considered

#### Option A — Put Career OS inside the current Vite application

Not recommended.

It would require adding routing, authentication, API/server behavior, and data handling to a public static app. It would also couple blog releases to a sensitive private system and make `career.sumin.best` routing less clean.

#### Option B — Immediately convert everything into a conventional monorepo

Example: move the blog into `apps/web`, add `apps/career`, and add root workspaces/Turborepo.

Architecturally clean, but not recommended for V1 because it forces changes to the already-working blog and its Vercel root directory before Career OS provides any value. There are not yet shared packages that justify monorepo orchestration.

#### Option C — Add an independently built app without moving the blog

Recommended.

This preserves the existing deployment while creating a strong application and deployment boundary. It can evolve into a formal monorepo later without changing Career OS URLs or data.

### 2.4 Coupling rules

The following rules should be treated as architectural constraints:

1. No imports from root `src/` into `apps/career/`.
2. No Career OS environment variables in the blog Vercel project.
3. No Career OS database calls from the blog.
4. No shared authentication cookie across `.sumin.best`; use host-only cookies for `career.sumin.best`.
5. No real user records or uploaded work material in Git.
6. Shared code should not be extracted until at least two apps genuinely need it.
7. Career OS must build from its own directory and lockfile.

---

## 3. Directory Structure

Recommended target after Phase 1:

```text
sumin_website/
├── index.html                   # Existing blog remains unchanged
├── package.json                 # Existing blog package remains unchanged
├── package-lock.json
├── vercel.json
├── src/                         # Existing blog
├── public/                      # Existing blog assets/articles
│
├── apps/
│   └── career/
│       ├── package.json
│       ├── package-lock.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── proxy.ts             # Session refresh / optimistic route gate
│       ├── .env.example         # Names only; never real values
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   └── login/page.tsx
│       │   │   ├── (app)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx                  # Dashboard
│       │   │   │   ├── daily/page.tsx
│       │   │   │   ├── weekly/page.tsx
│       │   │   │   ├── evidence/page.tsx
│       │   │   │   ├── evidence/new/page.tsx
│       │   │   │   ├── assets/page.tsx
│       │   │   │   └── quarterly/page.tsx
│       │   │   ├── error.tsx
│       │   │   ├── global-error.tsx
│       │   │   ├── not-found.tsx
│       │   │   ├── layout.tsx
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── ui/                       # Selected UI primitives
│       │   │   ├── navigation/
│       │   │   ├── dashboard/
│       │   │   └── forms/
│       │   ├── features/
│       │   │   ├── check-ins/
│       │   │   ├── evidence/
│       │   │   ├── reviews/
│       │   │   ├── assets/
│       │   │   └── growth/
│       │   └── lib/
│       │       ├── auth/
│       │       ├── supabase/
│       │       ├── validation/
│       │       └── constants/
│       ├── supabase/
│       │   ├── migrations/
│       │   └── seed.sql                     # Definitions only; no private data
│       └── tests/
│           └── e2e/
│
└── CAREER_OS_TECHNICAL_PLAN.md
```

Route groups `(auth)` and `(app)` organize layouts without appearing in URLs. Feature folders hold domain-specific validation, queries, and actions so page files remain small.

Do not add a shared `packages/ui` in V1. That would create coupling before there is a proven shared design system.

---

## 4. Database Strategy

### 4.1 Recommendation

Use one Supabase project for Career OS production:

- Managed Postgres for durable relational data
- Supabase Auth for the sole V1 user
- Row Level Security for database-enforced ownership
- Supabase Storage later, only when real file upload is introduced

For development, use synthetic data. Before production data exists, a separate development Supabase project or Supabase local stack is preferred so preview deployments cannot accidentally expose or mutate production records.

### 4.2 Why Supabase

- Authentication and Postgres share the same identity (`auth.uid()`).
- RLS creates a second security boundary beneath the Next.js application.
- The data model is relational: Evidence ↔ Capabilities, Assets ↔ Evidence, and quarterly capability assessments are natural joins.
- It works cleanly with Vercel and supports future private file storage.
- It avoids running a separate database server or authentication service for one user.

### 4.3 ORM decision

Do not add Prisma or Drizzle in V1 unless implementation reveals a concrete need.

Use:

- Versioned SQL migrations for schema, constraints, indexes, and RLS policies.
- Supabase generated TypeScript types.
- A thin repository/query layer inside each feature.

This keeps the deployment smaller and makes the security model visible in SQL. Reassess an ORM only if query complexity or portability becomes a real maintenance issue.

### 4.4 Data rules

- Every user-owned row includes `user_id uuid not null` referencing `auth.users(id)`.
- Every user-owned table has RLS enabled and an `auth.uid() = user_id` policy.
- Timestamps use `timestamptz`; business dates use `date`.
- Levels are numeric with check constraints: capability `1..5`, Evidence `0..5`, responsibility `1..6`.
- Foreign-key columns are indexed.
- User/day, user/week, and user/quarter records have unique constraints.
- Use `created_at` and `updated_at` consistently.
- Use links before files in V1. Never store binary attachments in Postgres.
- The browser receives only the Supabase public/anon key. A service-role key, if ever needed for administration, remains server-only and should not be required for normal CRUD.

---

## 5. Data Model

The initial entity list should be simplified and normalized rather than copied mechanically.

### 5.1 Identity

#### `auth.users` (managed by Supabase)

No custom `users` table is required in V1. Add a `profiles` table only when the application needs editable user profile fields. The auth user ID is the ownership key everywhere else.

### 5.2 Capability definitions and state

#### `capabilities`

Static definitions seeded by migration:

```text
id
slug             business | finance | strategy | execution | leadership | influence
name
core_question
display_order
```

The universal L1-L5 definitions can live as typed application constants initially. They do not need a database table unless admins must edit them later.

#### `capability_level_history`

Append-only history of assessed levels:

```text
id
user_id
capability_id
level             1..5
effective_on
reason
source_quarterly_review_id nullable
created_at
```

The Dashboard displays the latest row per capability. This avoids maintaining both a mutable “current level” record and a separate history.

### 5.3 Responsibility

#### `responsibility_level_history`

```text
id
user_id
level             1..6
effective_on
evidence_summary
created_at
```

The latest row is the current Responsibility Level. Levels R1-R6 and their labels are static application definitions. Responsibility should be changed by an explicit review, never by automatic points.

The typed product constants use these approved definitions:

```text
R1 Professional Task
Accountable for your own professional tasks.

R2 Complete Problem
Accountable for a complete problem from analysis through resolution.

R3 Cross-functional Project
Accountable for the final outcome of a cross-functional project.

R4 Team Ownership
Accountable for the overall result of a sustained team or cross-functional work unit,
using delegation, coordination, feedback, conflict handling, and capability building
so the team — rather than only the individual — produces outcomes.

R5 Business Outcome
Accountable for a measurable result across revenue, cost, market, or operations.

R6 P&L
Accountable for complete revenue, cost, and profit performance.
```

R4 is determined by sustained coordination, ownership of the whole result, and producing outcomes through others. Formal direct reports are supporting Evidence, but they are not a prerequisite.

### 5.4 Daily Check-in

#### `daily_check_ins`

```text
id
user_id
check_in_date
business_learning
judgment_made
crossed_legal_boundary boolean
boundary_note nullable
has_evidence boolean
created_at
updated_at
```

Constraint: one record per user per date.

If Evidence is created from a check-in, the Evidence row can hold an optional `daily_check_in_id`. This avoids a cyclic relationship.

### 5.5 Evidence Library

#### `evidence`

```text
id
user_id
title
occurred_on
event
action
judgment
result
reflection
evidence_level     0..5
external_url nullable
daily_check_in_id nullable
created_at
updated_at
```

#### `evidence_capabilities`

```text
evidence_id
capability_id
```

Composite primary key: `(evidence_id, capability_id)`.

Evidence can relate to multiple capabilities without storing fragile comma-separated values or arrays.

### 5.6 Weekly Review

#### `weekly_reviews`

```text
id
user_id
week_start
business_deep_dive
business_case
management_review
industry_input
industry_relevance
evidence_capability_id nullable
evidence_summary
next_focus_capability_id nullable
next_focus_plan
created_at
updated_at
```

Constraint: one record per user and ISO week start. Separate “done” booleans are unnecessary when a meaningful note is required; completion can be derived from validated content. If drafts are needed, use a single `status` (`draft` / `complete`) rather than five workflow systems.

### 5.7 Career Assets

#### `career_assets`

```text
id
user_id
title
asset_type
asset_date
description
external_url nullable
created_at
updated_at
```

#### `career_asset_capabilities`

```text
career_asset_id
capability_id
```

#### `career_asset_evidence`

```text
career_asset_id
evidence_id
```

For V1, `asset_type` can be constrained text populated from a fixed application list. A user-editable asset taxonomy is unnecessary.

### 5.8 Quarterly Review

#### `quarterly_reviews`

```text
id
user_id
quarter_start
status             draft | complete
overall_reflection nullable
created_at
updated_at
completed_at nullable
```

#### `quarterly_capability_reviews`

```text
id
quarterly_review_id
capability_id
current_level       1..5
target_level        1..5
promotion_evidence
approved_level nullable 1..5
```

Constraint: one row per capability per quarterly review.

Completing a quarterly review does not automatically promote a capability. An explicit `approved_level` decision supported by `promotion_evidence` appends a row to `capability_level_history` in the same database transaction.

### 5.9 Deliberately omitted from V1

- Points, streaks, badges, leaderboards
- Generic event-sourcing framework
- Editable capability/level builder
- Organization/team/role/permission tables
- AI embeddings or vector database
- Notification tables
- General attachment polymorphism
- A separate analytics warehouse

---

## 6. Authentication Strategy

### 6.1 Recommendation

Use Supabase Auth with email + password for one manually provisioned account.

Configuration:

1. Disable public sign-up.
2. Create the sole user through the Supabase dashboard or a one-time administrative process.
3. Use `@supabase/ssr` with secure, cookie-based sessions and follow its token-refresh cookie settings. Do not force `HttpOnly`: the Supabase browser client needs cookie access to maintain the session.
4. Protect the `(app)` layout with a server-side verified-claims check (`getClaims()` under the current Supabase SSR guidance); never authorize from an unverified cookie/session payload.
5. Use `proxy.ts` for session refresh and early redirect behavior, but do not treat proxy checks as the only authorization layer.
6. Enforce ownership again with Postgres RLS.
7. Optionally enforce `CAREER_OS_ALLOWED_EMAIL` in the server-side app guard as defense in depth.
8. Configure password reset only after production email delivery and redirect URLs are verified.

Email/password is preferable to magic-link-only login in V1 because it does not make routine access depend on email delivery. OAuth adds provider configuration and another identity surface without helping a one-user app.

### 6.2 Secrets and repository safety

Expected environment variables should be documented in `.env.example` without values. Likely variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
CAREER_OS_ALLOWED_EMAIL
```

If a service-role key is ever introduced, it must be server-only, configured only in the Career OS Vercel project, and never prefixed with `NEXT_PUBLIC_`. Normal user actions should rely on the signed-in user and RLS rather than service-role access.

### 6.3 Phase 2 baseline security boundary

Phase 2 deliberately avoids extra privacy product workflows. Its required controls are limited to:

- `.env.local` remains outside Git.
- Supabase credentials are supplied through environment variables, never source code.
- Real private Career OS records are not stored in the public GitHub repository.
- Every user-owned table has RLS enabled and ownership policies based on `auth.uid()`.
- Career OS application routes require a verified login.

Sensitive-data classification, masking reminders, confidential-information prompts, data grading, field-level encryption, content restrictions, and additional privacy workflows are deferred until a concrete need is identified.

---

## 7. UI Structure

### 7.1 Product navigation

Mobile-first primary destinations:

```text
Dashboard
Daily
Evidence
Reviews
Assets
```

On mobile, use a compact bottom navigation for the highest-frequency destinations and place less frequent actions in a “More” sheet if needed. On desktop, use a restrained side rail. Daily check-in and “Add Evidence” should always be reachable in one tap/click.

### 7.2 Dashboard hierarchy

The Dashboard should follow the requested information order:

1. Current Responsibility Level — dominant status, current definition, next-level requirement
2. Six capability cards — current level, quarter Evidence count, last level change, next-level meaning
3. This Quarter — Evidence, Business Cases, Career Assets, completed Weekly Reviews
4. Recent Evidence — concise, outcome-oriented list
5. Current Focus — one or two explicitly selected capability targets

Avoid a radar chart in V1. Six comparable cards are easier to read on an iPhone, expose the actual levels, and do not imply false mathematical precision.

### 7.3 Interaction principles

- Minimum 44px touch targets.
- Single-column forms on mobile.
- Autosave drafts only if it can be implemented reliably; otherwise provide clear Save Draft / Complete actions.
- Conditional fields appear only after YES answers.
- Evidence creation from Daily Check-in pre-fills date and source check-in.
- Use structured text areas with short prompts, not large blank documents.
- Preserve user input when server validation fails.
- Use calm status colors and typography; no streak fireworks or score animations.
- Support keyboard use, visible focus, semantic labels, reduced motion, and sufficient contrast.

### 7.4 Visual direction

“Professional personal operating system” should translate to:

- Warm neutral background, ink text, restrained violet accent
- Clear typographic hierarchy and compact metadata
- Fine borders and subtle elevation
- Small, meaningful status chips
- Dense enough for review, spacious enough for quick mobile entry
- Motion used only for navigation/context, not reward mechanics

---

## 8. Deployment Strategy

### 8.1 Two Vercel projects

#### Existing project — personal site

```text
Repository: maxlixiang/sumin-blog
Root Directory: repository root
Framework: Vite
Build: npm run build
Output: dist
Domains: sumin.best → www.sumin.best; www.sumin.best
```

No changes should be required for Phase 1.

#### New project — Career OS

```text
Repository: same repository
Root Directory: apps/career
Framework: Next.js
Build: npm run build
Domain: career.sumin.best
Environment variables: Career OS project only
```

Vercel supports connecting multiple projects to different directories in one repository. Git pushes may initially trigger both projects; configure Vercel's “skip unaffected projects” behavior once both roots are present. Do not introduce Turborepo merely to optimize two small builds.

### 8.2 Environments

- Local: synthetic development data.
- Preview: no production private database access; use a development Supabase project or do not enable data writes.
- Production: production Supabase project and the sole real account.

Environment variables must be set separately for Development, Preview, and Production as appropriate.

### 8.3 Rollout

Deploy a protected preview first. Attach `career.sumin.best` only after authentication, RLS, persistence, mobile checks, and both application builds pass.

---

## 9. Subdomain Strategy

Recommended steps during Phase 9:

1. Create the second Vercel project with Root Directory `apps/career`.
2. Deploy and verify its generated `*.vercel.app` URL.
3. Add `career.sumin.best` to that Career OS project in Vercel.
4. If DNS is managed by Vercel, let Vercel create/validate the record. If DNS is external, add the exact CNAME target Vercel shows for the project; do not guess or hardcode it in application code.
5. Verify DNS, TLS certificate issuance, redirect behavior, and the Supabase allowed redirect/site URLs.
6. Confirm `www.sumin.best` and article routes still serve the existing Vite project.

No rewrite in the blog's root `vercel.json` is needed. DNS/Vercel project assignment routes the subdomain before either application runs.

The Career OS auth cookie should remain scoped to `career.sumin.best`, which prevents the private app session from becoming an implicit dependency of the public blog.

---

## 10. MVP Development Phases

The proposed order is close to the original, with security and data foundations moved earlier and an explicit minimal Evidence handoff added to Daily Check-in.

### Phase 0 — Assessment and plan (this document)

**Why:** avoid choosing architecture before understanding the existing site.

**What:** repository, stack, deployment, security boundary, architecture, data model, rollout plan.

**Success:** approved technical plan with no impact on current site.

**Verify:** baseline blog build; UTF-8 review; Career OS task changes limited to this document; unrelated user changes left untouched.

### Phase 1 — Independent app shell + static Dashboard

- Scaffold `apps/career` with Next.js App Router, TypeScript, Tailwind, linting, and isolated design tokens.
- Add protected-app layout shape, navigation, static Dashboard, responsive states, loading/error/not-found foundations.
- Do not connect real private data yet.

Exit gate: Career app build passes; root blog build still passes; iPhone and desktop static UI verified; no console errors.

### Phase 2 — Supabase foundation + authentication + Daily Check-in

- Create migrations, capability seed definitions, RLS policies, generated types, Supabase clients, login/logout, and protected layout.
- Implement Daily Check-in persistence.
- When Q4 is YES, provide a minimal “Create Evidence” continuation carrying the check-in context, even if the full library arrives in Phase 3.

Exit gate: anonymous access blocked; sole account can log in; refresh/logout/login preserves saved check-in; another user cannot read rows under RLS tests.

### Phase 3 — Evidence Library

- Evidence CRUD, multi-capability tagging, E0-E5, filtering, recent evidence, and Daily-to-Evidence flow.
- No automatic capability promotion.

Exit gate: create/edit/view/delete-confirm flow works; quarter counts are accurate; persisted after re-login.

### Phase 4 — Weekly Review

- Weekly review form, draft/complete status, week navigation, evidence capability and next-focus selection.

Exit gate: one review per ISO week; validation preserves input; completed reviews count correctly.

### Phase 5 — Career Assets

- Asset CRUD, type, capability links, Evidence links, and external URL.
- Keep uploads out unless links prove insufficient.

Exit gate: related records render correctly; broken/invalid URL validation is handled.

### Phase 6 — Quarterly Review + Capability Levels

- Quarterly review and six capability assessment rows.
- Explicit promotion decision with supporting evidence.
- Append capability level history transactionally on completion.

Exit gate: no level changes without explicit decision; historical levels remain auditable; Dashboard reads the latest level.

### Phase 7 — Responsibility Growth + live Dashboard

- Responsibility history and explicit level review.
- Replace remaining Dashboard fixtures with real aggregates and Current Focus.

Exit gate: responsibility history is retained; current level is the latest assessment; all dashboard metrics reconcile with source lists.

### Phase 8 — Mobile, accessibility, security, and end-to-end verification

- iPhone viewport refinement, touch/keyboard accessibility, empty/loading/error states, security headers, performance review.
- End-to-end tests for login, daily entry, Evidence, review, persistence, and logout.

Exit gate: verification matrix below passes with no significant console or accessibility errors.

### Phase 9 — Production deployment + subdomain

- Production Supabase configuration, second Vercel project, environment variables, protected deployment, DNS, TLS, and domain verification.

Exit gate: `career.sumin.best` works for the sole account; anonymous user is redirected; production persistence works; existing site remains unchanged.

### Phase reporting contract

At the end of every phase, report:

1. What was done
2. Why it was done that way
3. Files changed
4. How to verify
5. Verification results
6. Next step

Each report must map back to **Why → What → Success → How → Verify**.

---

## 11. Risks and Scope Corrections

### 11.1 Highest risks

#### Sensitive data in a public repository

The repository is public. Fixtures, screenshots, SQL seeds, logs, exports, and test recordings can leak information even when credentials are safe. Use synthetic content in source control and manually inspect staged changes before every push.

#### Authentication without authorization

A login page alone is not adequate. A bug in a server query could expose all rows. RLS on every owned table is mandatory even for one user.

#### Premature monorepo migration

Moving the blog into `apps/web` now would create deployment risk without user value. Keep the additive structure until shared code or build orchestration justifies migration.

#### Capability levels becoming disguised points

Evidence counts are context, not promotion math. The UI must not imply that “N items = next level.” Level changes require review and a documented promotion case.

#### Inconsistent definitions

If Evidence level, capability level, and responsibility level are visually blended, the product becomes confusing. They need separate labels, colors, and explanations:

- Evidence E0-E5 = strength/type of proof
- Capability L1-L5 = demonstrated operating ability
- Responsibility R1-R6 = scope of entrusted ownership

#### Attachment security

Work documents may be more sensitive than the structured records. File upload should not ship until private buckets, signed URLs, size/type limits, deletion behavior, and preview safety are designed and tested.

#### “Current level” without history

Overwriting a single level destroys the growth story. Append-only level history avoids this while remaining simple.

### 11.2 Current requirements that are slightly overdesigned for V1

- A general attachment system: use a link field first.
- Fully editable capability and responsibility taxonomies: keep definitions in code/seed data.
- A reusable shared design-system package: keep Career OS isolated until reuse is real.
- PWA/offline support: postpone until 30-day usage proves mobile-web friction.
- Rich analytics/charts: counts and well-designed lists are enough to validate the product.
- Multiple auth providers: one email/password account is sufficient.
- A public API or mobile-ready REST layer: Server Components and Server Actions meet current needs.

### 11.3 Product risks to watch during the first 30 days

- Four Daily questions may still feel heavy if every answer expects an essay. Use concise prompts and examples.
- Weekly Review has five substantial sections and could become a long form. Draft support and clear completion state matter.
- Evidence requires seven narrative fields. Some should allow concise answers, and context should be prefilled from Daily Check-in where possible.
- The six capability levels are intentionally universal, but promotion criteria may still feel subjective. After 30 days, add capability-specific examples only where ambiguity actually appears.
- Responsibility R4 “Team Ownership” is explicitly based on sustained accountable leadership and producing outcomes through others, not merely formal headcount or direct-report status.

### 11.4 What should not be built now

- AI summaries, recommendations, or auto-scoring
- Public registration or multi-user administration
- Social, sharing, payment, gamification, streaks
- Native app, mini program, or PWA
- Automated performance-review exports
- Calendar/email integrations
- Organization dashboards
- File uploads before storage security is complete
- Automatic capability or responsibility promotions

---

## 12. Future Extension

Only after the 30-day V1 succeeds:

- Private Supabase Storage attachments with signed URLs
- PWA installability and carefully scoped offline drafts
- Search across Evidence and Assets
- Capability-specific promotion rubrics and examples
- Quarterly export to a private PDF or document
- Evidence-to-asset conversion workflow
- Reminder automation for Daily/Weekly/Quarterly routines
- Calendar integration
- Encrypted export/backup and restore verification
- AI-assisted reflection or synthesis, opt-in and designed around confidentiality
- Formal workspace monorepo and shared brand package if the blog and Career OS truly converge
- Separate repository extraction if access control, team ownership, or deployment cadence later requires it

The proposed directory and deployment boundary allow `apps/career` to be moved into its own repository later without changing its database model or `career.sumin.best` identity.

---

## 13. Verification Strategy

### 13.1 Verification matrix for every implementation phase

| Area | Required check |
|---|---|
| Functional | Complete the phase's main flow from the UI, including validation and error states |
| Mobile | Verify at least iPhone SE-size and a modern iPhone-size viewport; check touch targets and keyboard behavior |
| Persistence | Save, refresh, log out, log back in, and confirm data remains correct |
| Existing Site | Build and smoke-test root homepage, `/articles`, and one article page |
| Build | Run root `npm run build` and `apps/career` build once it exists |
| Deployment | Check Vercel build logs and production/preview URL for the relevant phase |
| Error | Check browser console, failed network requests, server logs, and visible fallback states |
| Security | Test anonymous access, user ownership/RLS, secret exposure, and sensitive logging |
| Accessibility | Keyboard path, focus visibility, labels, contrast, reduced motion, and basic automated scan |

### 13.2 Suggested automated coverage

- Unit tests for Zod schemas, level constraints, quarter/week helpers, and metric aggregation.
- Integration tests for Server Actions and database ownership behavior.
- Playwright end-to-end tests for the critical user journeys using mobile and desktop projects.
- Build checks for both independent applications.

Automation should follow the risk: persistence, RLS, level promotion, and dashboard reconciliation deserve tests before decorative UI details.

### 13.3 Phase 0 verification result

Completed:

- Repository structure inspected.
- Installed dependency versions inspected from `package-lock.json`.
- Git remote, branch, initial working state, and public repository visibility checked.
- Current domain behavior and Vercel response verified.
- Current blog production build completed successfully.
- No Career OS application code, dependency, database, or deployment change made.
- Concurrent article changes visible in the working tree were not modified as part of this task.

Remaining after this document is approved:

- Confirm Vercel dashboard project settings and DNS ownership during deployment work.
- Confirm Supabase region and production project policy before creating real data.
- Validate the approved R4 “Team Ownership” fixture language with the Phase 1 Dashboard before implementing its Phase 7 assessment logic.

---

## 14. Decision Checklist Before Phase 1

Approval of the plan should confirm these decisions:

- [ ] Keep the blog at the repository root.
- [ ] Add Career OS under `apps/career`.
- [ ] Use a second Vercel project and `career.sumin.best`.
- [ ] Use Next.js 16 App Router + TypeScript + Tailwind.
- [ ] Use Supabase Postgres + Supabase Auth + RLS.
- [ ] Use one manually provisioned email/password account; disable sign-up.
- [ ] Use links, not file uploads, in the initial V1.
- [ ] Keep levels human-reviewed; no automatic point-based promotion.
- [ ] Keep real/private content out of Git and preview environments.
- [ ] Build Phase 1 only after explicit approval.

---

## References

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Next.js 16 upgrade and runtime requirements](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Vercel monorepo documentation](https://vercel.com/docs/monorepos)
- [Vercel custom domain setup](https://vercel.com/docs/domains/set-up-custom-domain)
- [Supabase Auth documentation](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
