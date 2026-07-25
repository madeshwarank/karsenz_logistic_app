# Karsenz Pickup & Logistics Management System

## Purpose
Build and maintain a locally runnable MVP for future pickup scheduling, dispatcher assignment, driver proof-of-pickup workflows, workshop handover, dashboarding and reports.

## Architecture Boundaries
- `apps/api`: NestJS REST API, RBAC, workflow rules, Prisma access, background jobs and local file storage.
- `apps/web`: Next.js App Router UI for operations portal and responsive driver screens.
- `packages/shared-types`: cross-application enums and DTO-facing types.
- `packages/validation`: Zod schemas shared by frontend forms.
- `packages/ui`: reusable accessible UI primitives.
- `docs`: product, architecture, API and database documentation.

## Commands
- Install: `pnpm install`
- Infrastructure: `docker compose up -d postgres redis`
- Migrate: `pnpm db:migrate`
- Seed: `pnpm db:seed`
- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Type check: `pnpm type-check`
- Tests: `pnpm test`
- E2E: `pnpm test:e2e`
- Build: `pnpm build`

## Coding Standards
- TypeScript strict mode stays enabled.
- Prefer service-layer business rules over controller logic.
- All protected endpoints require JWT authentication and role checks.
- Validate API input with DTOs and `class-validator`; validate frontend forms with Zod.
- Use Prisma transactions for assignment, status changes, cancellation, rescheduling and handover.

## Database Migration Rules
- Schema changes go through Prisma migrations.
- Use UUID primary keys and explicit indexes for filtered/searchable fields.
- Seed data is development-only and must not contain real customer personal data.

## Security Rules
- Never commit real secrets or production credentials.
- Never log passwords, access tokens, refresh tokens or uploaded file contents.
- File uploads must be type and size validated.
- Enforce driver data scoping in the API, not only in the UI.

## Test Expectations
- Workflow status transitions, booking date validation, driver conflicts and authorization require automated tests.
- The Playwright MVP scenario should cover booking creation through workshop completion.

## Definition of Done
- API and web start locally.
- Migrations and seed complete successfully.
- Demo users can log in.
- Future bookings, assignment, driver workflow, inspection, handover, dashboard and reports use real API/database data.
- Lint, type-check, unit/integration tests and builds pass, or any environmental blocker is documented.

## Do Not Modify Without Explanation
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seed.ts`
- status transition rules
- RBAC guard rules
- Docker and CI files
