# Database

The Prisma schema lives at `apps/api/prisma/schema.prisma`.

Local migration flow:

```bash
docker compose up -d postgres redis
pnpm db:migrate
pnpm db:seed
```

Seed credentials are development-only. Every seeded account uses:

```text
Karsenz@123
```
