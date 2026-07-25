import { spawnSync } from 'node:child_process';

const pnpm = process.env.npm_execpath || 'pnpm';
process.env.DATABASE_URL ??= 'postgresql://karsenz:karsenz_dev_password@localhost:5432/karsenz?schema=public';
const result = spawnSync(process.execPath, [pnpm, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: false,
});
process.exit(result.status ?? 1);
