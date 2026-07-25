install:
	pnpm install

dev:
	pnpm dev

infra:
	docker compose up -d postgres redis

migrate:
	pnpm db:migrate

seed:
	pnpm db:seed

verify:
	pnpm lint && pnpm type-check && pnpm test && pnpm build
