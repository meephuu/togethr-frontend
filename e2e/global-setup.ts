import { request } from '@playwright/test';
import { API_URL, apiUrl } from './helpers/env';
import { SOMCHAI } from './helpers/test-data';

// The specs assume customer somchai@gmail.com exists with password Travel@2026
// (registered by TC01). If that login fails, register the account the way TC01 does.
//
// TC31 changes the password to NewTravel@2026, so a second run against the same
// database stops here: run against a fresh database (see README).
export default async function globalSetup(): Promise<void> {
  const api = await request.newContext();
  try {
    const login = await api
      .post(apiUrl('/auth/login'), { data: { email: SOMCHAI.email, password: SOMCHAI.password } })
      .catch((err: Error) => {
        throw new Error(
          `Cannot reach the backend at ${API_URL}. Start it, or set API_URL (see README). (${err.message})`,
        );
      });
    if (login.status() === 200) return;

    const register = await api.post(apiUrl('/auth/register'), {
      data: { ...SOMCHAI, consent: true },
    });
    if (register.status() === 201) {
      console.log(`[global-setup] Registered ${SOMCHAI.email} for the test run.`);
      return;
    }

    const body = await register.text();
    if (register.status() === 409) {
      throw new Error(
        `${SOMCHAI.email} (or username "${SOMCHAI.username}") already exists, but logging in with ` +
          `"${SOMCHAI.password}" returned ${login.status()}. TC31 probably changed the password on an ` +
          `earlier run. Recreate the test database before running the suite again (see README). ` +
          `Register response: ${body}`,
      );
    }
    throw new Error(`Could not register ${SOMCHAI.email}: ${register.status()} ${body}`);
  } finally {
    await api.dispose();
  }
}
