import { spawnSync } from 'node:child_process';
import { BACKEND_DIR, testDatabaseUrl } from './config';

const LABELS = [
  'SV-001', 'SV-002', 'SL-01', 'SL-02', 'SL-03',
  'BK-1001', 'BK-1002', 'BK-1003', 'BK-1004', 'BK-1006', 'BK-1007', 'BK-1008', 'BK-1009', 'BK-1010',
  'T2',
];

export interface SeedOutput {
  ids: Record<string, string>;
  t2: string;
}

/**
 * Runs `npm run seed:test` in the backend against TEST_DATABASE_URL and parses the table
 * it prints ("SV-001    <uuid>", ..., "T2        <raw token>").
 */
export function runTestSeed(): SeedOutput {
  const result = spawnSync('npm run seed:test', {
    cwd: BACKEND_DIR,
    // Shell variables win over the backend's .env (dotenv doesn't override them)
    env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
    encoding: 'utf8',
    shell: true,
    timeout: 120_000,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (result.error) throw new Error(`could not run npm run seed:test in ${BACKEND_DIR}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`npm run seed:test failed (exit ${result.status}):\n${output}`);

  const values: Record<string, string> = {};
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^(SV-\d{3}|SL-\d{2}|BK-\d{4}|T2)\s+(\S+)\s*$/);
    if (match) values[match[1]] = match[2];
  }
  const missing = LABELS.filter((label) => !values[label]);
  if (missing.length) throw new Error(`seed output has no value for ${missing.join(', ')}:\n${output}`);

  const { T2: t2, ...ids } = values;
  return { ids, t2 };
}
