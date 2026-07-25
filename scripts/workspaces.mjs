import { spawnSync } from 'node:child_process';

const task = process.argv[2];
if (!task) {
  console.error('Usage: node scripts/workspaces.mjs <task>');
  process.exit(1);
}

const pnpm = process.env.npm_execpath || 'pnpm';
const parallel = task === 'dev' ? ['--parallel'] : [];
const result = spawnSync(process.execPath, [pnpm, '-r', ...parallel, task], {
  stdio: 'inherit',
  shell: false,
});
process.exit(result.status ?? 1);
