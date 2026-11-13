import { test, type Page } from '@playwright/test';
import { Sessions } from './api';
import { Outcome } from './outcome';
import { recordResult } from './results';

// Test bodies for the test-plan specs: test('TC05 - ...', apiCase('TC05', async (o, s) => { ... })).
// The body adds its checks to `o`; the case then records the actual output and P/F and
// never fails the Playwright test itself, so a mismatch (or a harness error) doesn't stop
// the serial run. P/F is in results/test-plan-results.md and the HTML report annotations.

type ApiBody = (o: Outcome, s: Sessions) => Promise<void>;
type UiBody = (o: Outcome, s: Sessions, page: Page) => Promise<void>;

async function runCase(tc: string, body: (o: Outcome, s: Sessions) => Promise<void>) {
  const o = new Outcome();
  const sessions = new Sessions();
  try {
    await body(o, sessions);
  } catch (err) {
    o.error(err);
  } finally {
    await sessions.dispose();
  }
  recordResult({ tc, actual: o.text, pass: o.pass });
  test.info().annotations.push({ type: o.pass ? 'P' : 'F', description: o.text });
  console.log(`${tc} ${o.pass ? 'P' : 'F'}: ${o.text}`);
}

/** An API-level test case. */
export function apiCase(tc: string, body: ApiBody) {
  return async () => runCase(tc, (o, s) => body(o, s));
}

/** A test case with something visible to check in the browser. */
export function uiCase(tc: string, body: UiBody) {
  return async ({ page }: { page: Page }) => runCase(tc, (o, s) => body(o, s, page));
}
