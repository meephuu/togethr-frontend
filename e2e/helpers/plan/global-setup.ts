import fs from 'node:fs';
import path from 'node:path';
import { request } from '@playwright/test';
import { API_URL, BASE_URL, MAILPIT_URL } from '../env';
import { BACKEND_DIR, testDatabaseName, testDatabaseUrl } from './config';
import { dbQuery } from './db';
import { resetResults } from './results';
import { resetState } from './state';

// Before the test-plan run: check everything it needs, then clear the previous
// run's results and shared state.
export default async function globalSetup(): Promise<void> {
  testDatabaseUrl(); // throws for a missing URL or the dev database

  const pkg = path.join(BACKEND_DIR, 'package.json');
  if (!fs.existsSync(pkg) || !fs.readFileSync(pkg, 'utf8').includes('"seed:test"')) {
    throw new Error(`No "seed:test" script in ${pkg}. Set BACKEND_DIR to the backend checkout.`);
  }

  // TC01 registers somchai, so the database must not have the plan's accounts yet
  const existing = await dbQuery<{ email: string }>(
    `select email from users where email in ('somchai@gmail.com', 'somsri@gmail.com')`,
  );
  if (existing.length) {
    throw new Error(
      `Database "${testDatabaseName()}" already has ${existing.map((u) => u.email).join(', ')}. ` +
        'The test plan starts from an empty database: recreate it and run the migrations (see README).',
    );
  }

  const api = await request.newContext();
  try {
    const checks: [string, string][] = [
      ['backend', `${new URL(API_URL).origin}/health`],
      ['frontend', BASE_URL],
      ['Mailpit', `${MAILPIT_URL}/api/v1/info`],
    ];
    for (const [name, url] of checks) {
      const res = await api.get(url).catch(() => null);
      if (!res?.ok()) throw new Error(`The ${name} is not reachable at ${url} (see README).`);
    }
  } finally {
    await api.dispose();
  }

  resetResults();
  resetState();
}
