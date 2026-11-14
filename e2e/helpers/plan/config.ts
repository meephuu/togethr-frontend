import path from 'node:path';

// Paths and settings for the test-plan runner (npm run test:plan).

export const E2E_DIR = path.resolve(__dirname, '..', '..');
export const RESULTS_DIR = path.join(E2E_DIR, 'results');
export const RESULTS_MD = path.join(RESULTS_DIR, 'test-plan-results.md');
export const RAW_RESULTS = path.join(RESULTS_DIR, '.raw-results.jsonl');
export const STATE_FILE = path.join(RESULTS_DIR, '.run-state.json');

/** The backend checkout, where `npm run seed:test` runs. Relative paths start at e2e/. */
export const BACKEND_DIR = path.resolve(E2E_DIR, process.env.BACKEND_DIR || '../../DeawKoyKid-Backend');

/** The dev database. The runner refuses to seed or query it. */
const DEV_DATABASE = 'deawkoykid';

/**
 * TEST_DATABASE_URL: the database the backend under test uses. The seed runs against it
 * and the database checks (e.g. "users.consentAt set") read it. Never the dev database.
 */
export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      'Set TEST_DATABASE_URL to the same database the backend under test uses ' +
        '(e.g. postgresql://deawkoykid:deawkoykid@localhost:5432/deawkoykid_test?schema=public).',
    );
  }
  const name = testDatabaseName(url);
  if (!name || name === DEV_DATABASE) {
    throw new Error(`Refusing to run the test plan against database "${name}". Use a fresh test database.`);
  }
  return url;
}

export function testDatabaseName(url = process.env.TEST_DATABASE_URL ?? ''): string {
  try {
    return decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
  } catch {
    return '';
  }
}
