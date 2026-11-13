import { expect, test } from '@playwright/test';
import { apiUrl } from '../helpers/env';
import { extractResetLink, getLatestMessage, waitForNewMessage } from '../helpers/mailpit';
import {
  INVALID_EMAIL,
  MSG,
  NEW_PASSWORD,
  SOMCHAI,
  UNKNOWN_EMAIL,
} from '../helpers/test-data';

// US1-5 Forgot / reset password. TC27-TC30 call the API directly: the forgot-password
// page checks the email in the browser first, so the server's 400 messages are only
// reachable through the API. TC31 opens the emailed link in the browser.
//
// NOTE: TC31 changes somchai's password to NewTravel@2026 and leaves it changed (later
// test-plan cases log in with it). Run the suite against a fresh database each time.

const RESET_EMAIL_SUBJECT = 'Reset your Togethr password';

// The server sends the email before it answers, so a missing email after this long is missing.
const NO_EMAIL_WAIT_MS = 3_000;

test('TC27 - forgot-password for a registered email answers 200 and sends a reset link', async ({
  request,
}) => {
  const before = await getLatestMessage(SOMCHAI.email);

  const response = await request.post(apiUrl('/auth/forgot-password'), {
    data: { email: SOMCHAI.email },
  });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ message: MSG.resetLinkSent });

  const email = await waitForNewMessage(SOMCHAI.email, before?.ID ?? null);
  expect(email.Subject).toBe(RESET_EMAIL_SUBJECT);
  expect(extractResetLink(email)).toContain('/reset-password?token=');
});

test('TC28 - forgot-password for an unknown email answers the same 200 and sends nothing', async ({
  request,
}) => {
  const before = await getLatestMessage(UNKNOWN_EMAIL);

  const response = await request.post(apiUrl('/auth/forgot-password'), {
    data: { email: UNKNOWN_EMAIL },
  });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ message: MSG.resetLinkSent });

  await new Promise((resolve) => setTimeout(resolve, NO_EMAIL_WAIT_MS));
  const after = await getLatestMessage(UNKNOWN_EMAIL);
  expect(after?.ID ?? null, `no email should be sent to ${UNKNOWN_EMAIL}`).toBe(before?.ID ?? null);
});

test('TC29 - forgot-password without an email answers 400 "email is required"', async ({
  request,
}) => {
  // Test plan input: body {}. An empty string must get the same answer.
  for (const data of [{}, { email: '' }]) {
    const response = await request.post(apiUrl('/auth/forgot-password'), { data });
    expect(response.status(), `body ${JSON.stringify(data)}`).toBe(400);
    expect(await response.json(), `body ${JSON.stringify(data)}`).toEqual({
      error: MSG.emailRequired,
    });
  }
});

test('TC30 - forgot-password with a malformed email answers 400 "email must be a valid email address"', async ({
  request,
}) => {
  const response = await request.post(apiUrl('/auth/forgot-password'), {
    data: { email: INVALID_EMAIL },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: MSG.emailInvalid });
});

test('TC31 - reset link from the email sets a new password; new one logs in, old one does not', async ({
  page,
  request,
}) => {
  // Token T1: the newest email to somchai, sent by TC27.
  const email = await getLatestMessage(SOMCHAI.email);
  expect(email, `TC27 should have delivered a reset email to ${SOMCHAI.email}`).not.toBeNull();
  const resetLink = extractResetLink(email!);

  await page.goto(resetLink);
  await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel('Confirm new password', { exact: true }).fill(NEW_PASSWORD);

  const [response] = await Promise.all([
    page.waitForResponse(
      (r) =>
        r.request().method() === 'POST' &&
        new URL(r.url()).pathname.endsWith('/auth/reset-password'),
    ),
    page.getByRole('button', { name: 'Reset password' }).click(),
  ]);

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ message: MSG.passwordUpdated });
  await expect(page).toHaveURL(/\/login$/);

  const withNew = await request.post(apiUrl('/auth/login'), {
    data: { email: SOMCHAI.email, password: NEW_PASSWORD },
  });
  expect(withNew.status(), 'login with the new password').toBe(200);

  const withOld = await request.post(apiUrl('/auth/login'), {
    data: { email: SOMCHAI.email, password: SOMCHAI.password },
  });
  expect(withOld.status(), 'login with the old password').toBe(401);
  expect(await withOld.json()).toEqual({ error: MSG.invalidCredentials });
});
