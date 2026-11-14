import { expect, test, type Page, type Response } from '@playwright/test';
import { MSG, SOMCHAI, WRONG_PASSWORD } from '../helpers/test-data';

// US1-3 Login, through the UI. Each test gets a fresh browser context (no cookies).

async function submitLogin(page: Page, email: string, password: string): Promise<Response> {
  await page.goto('/login');
  await page.getByLabel('Username or Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);

  const [response] = await Promise.all([
    page.waitForResponse(
      (r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/auth/login'),
    ),
    page.getByRole('button', { name: 'Log In' }).click(),
  ]);
  return response;
}

test('TC17 - log in with email and correct password lands on /customer/dashboard', async ({
  page,
  context,
}) => {
  const response = await submitLogin(page, SOMCHAI.email, SOMCHAI.password);

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.user.email).toBe(SOMCHAI.email);
  expect(body.user.roles).toEqual(['CUSTOMER']);

  // Set-Cookie: token=...; Max-Age=1800; ...; HttpOnly
  const setCookie = (await response.headerValue('set-cookie')) ?? '';
  expect(setCookie).toMatch(/(^|\n)token=[^;\s]+/);
  expect(setCookie).toMatch(/;\s*HttpOnly/i);
  expect(setCookie).toMatch(/;\s*Max-Age=1800/i);

  const token = (await context.cookies()).find((c) => c.name === 'token');
  expect(token, 'browser should hold a "token" cookie').toBeDefined();
  expect(token!.httpOnly).toBe(true);

  await expect(page).toHaveURL(/\/customer\/dashboard$/);
});

test('TC20 - log in with wrong password shows "invalid email or password" and sets no cookie', async ({
  page,
  context,
}) => {
  const response = await submitLogin(page, SOMCHAI.email, WRONG_PASSWORD);

  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: MSG.invalidCredentials });

  await expect(page.getByRole('alert')).toHaveText(MSG.invalidCredentials);
  await expect(page).toHaveURL(/\/login$/);

  const setCookie = (await response.headerValue('set-cookie')) ?? '';
  expect(setCookie).not.toMatch(/(^|\n)token=/);
  const token = (await context.cookies()).find((c) => c.name === 'token');
  expect(token, 'browser should not hold a "token" cookie').toBeUndefined();
});
