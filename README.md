# Karsenz Pickup & Logistics Management System

Locally runnable MVP for pickup booking, dispatcher assignment, driver mobile workflow, inspection proof, workshop handover, dashboards and reports.

## Stack

- Monorepo: pnpm workspaces and Turborepo
- Web: Next.js App Router, TypeScript, Tailwind, TanStack Query, React Hook Form, Zod
- API: NestJS, Prisma, PostgreSQL, JWT auth, Swagger
- Jobs/cache: Redis and BullMQ-ready Nest integration point
- Storage: local upload abstraction
- Tests: Jest, Supertest and Playwright

## Quick Start

```bash
pnpm install
docker compose up -d postgres redis
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Docker-only:

```bash
docker compose up --build
```

## Local URLs

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- Health: http://localhost:4000/api/v1/health
- Swagger: http://localhost:4000/api/docs
- PostgreSQL: localhost:5432, database `karsenz`
- Redis: localhost:6379

## Development Demo Credentials

All seeded accounts use development-only password:

```text
Karsenz@123
```

- superadmin@karsenz.local
- admin@karsenz.local
- customer.service@karsenz.local
- dispatcher@karsenz.local
- driver1@karsenz.local
- driver2@karsenz.local
- driver3@karsenz.local
- driver4@karsenz.local
- driver5@karsenz.local
- driver6@karsenz.local
- workshop@karsenz.local
- manager@karsenz.local

Never use these credentials in production.

## Verification Commands

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm test:e2e
```

## MVP Journey

1. Customer service logs in and creates a future pickup at `/bookings/new`.
2. Dispatcher opens `/dispatch` and assigns an available driver.
3. Driver opens `/driver/jobs`, accepts the job and progresses through each pickup step.
4. Driver completes `/driver/jobs/:id/inspection`, which records proof and customer acknowledgement.
5. Driver marks branch arrival and handover pending.
6. Workshop accepts the handover at `/handovers`.
7. Dashboard and reports update from live database aggregates.

## Known MVP Limits

- WhatsApp Business API is a placeholder; MVP uses click-to-call and prefilled WhatsApp links.
- Route optimization is intentionally excluded.
- Uploads are stored locally through an abstraction layer.
- CSV export is API-backed; browser download with auth headers is best handled by a future frontend download helper.
