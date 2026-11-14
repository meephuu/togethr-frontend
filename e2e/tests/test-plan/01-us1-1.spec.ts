import { test } from '@playwright/test';
import { call } from '../../helpers/plan/api';
import { MSG, SOMCHAI_REGISTRATION as TC01 } from '../../helpers/plan/data';
import { countUsers, dbQuery } from '../../helpers/plan/db';
import { quote } from '../../helpers/plan/outcome';
import { apiCase, uiCase } from '../../helpers/plan/plan-test';
import { setState } from '../../helpers/plan/state';

// US1-1 Customer registration (TC01–TC09)
test.describe.configure({ mode: 'serial' });

test('TC01 - register somchai through the sign-up page', uiCase('TC01', async (o, _s, page) => {
  // The sign-up page has no phone or gender fields, so the plan's values for them are
  // added to the page's real register request on its way to the backend.
  await page.route('**/auth/register', async (route) => {
    const req = route.request();
    if (req.method() !== 'POST') return route.continue();
    const body = { ...req.postDataJSON(), phoneNumber: TC01.phoneNumber, gender: TC01.gender };
    return route.continue({ postData: JSON.stringify(body) });
  });

  await page.goto('/sign-up');
  // The privacy policy opens first; its checkbox unlocks once scrolled to the bottom
  await page.locator('.overflow-y-auto').first().evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Continue' }).click();

  for (const field of ['username', 'firstname', 'lastname', 'email', 'password'] as const) {
    await page.locator(`input[name="${field}"]`).fill(String(TC01[field]));
  }
  await page.locator('input[name="confirmPassword"]').fill(TC01.password);

  const [response] = await Promise.all([
    page.waitForResponse(
      (r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/auth/register'),
    ),
    page.locator('form button[type="submit"]').click(),
  ]);
  const body = await response.json().catch(() => null);
  o.add(String(response.status()), response.status() === 201);

  const user = body?.user ?? {};
  const userOk =
    typeof user.id === 'string' && user.username === 'somchai' && user.email === 'somchai@gmail.com' && !('password' in user);
  o.add(
    userOk
      ? 'body.user has id, username "somchai", email "somchai@gmail.com" (no password)'
      : `body.user ${JSON.stringify(user)}`,
    userOk,
  );
  if (user.id) setState({ somchaiId: user.id });

  const [row] = await dbQuery<{ consentAt: Date | null; customers: number; phoneNumber: string; gender: string }>(
    `select u."consentAt", u."phoneNumber", u.gender,
            (select count(*)::int from customers c where c."userId" = u.id) as customers
       from users u where u.email = $1`,
    [TC01.email],
  );
  o.add(row?.consentAt ? 'users.consentAt set' : 'users.consentAt not set', Boolean(row?.consentAt));
  o.add(row?.customers === 1 ? 'customer row created' : 'no customer row', row?.customers === 1);
  // Not in the expected output, but shows the plan's phone and gender reached the backend
  if (row && (row.phoneNumber !== TC01.phoneNumber || row.gender !== TC01.gender)) {
    o.add(`stored phoneNumber "${row.phoneNumber}", gender "${row.gender}"`, false);
  }

  const toast = page.getByRole('status').filter({ hasText: 'Registration successful' });
  const shown = await toast.waitFor({ timeout: 10_000 }).then(() => true, () => false);
  o.add(shown ? `UI shows ${quote('Registration successful')}` : `UI does not show ${quote('Registration successful')}`, shown);
}));

// TC02–TC07: as TC01 with one field changed; each expects 400 and (TC02, TC03) no user
const invalid: [string, string, Record<string, unknown>, string, boolean][] = [
  ['TC02', 'empty lastname', { username: 'somchai2', email: 'somchai2@gmail.com', lastname: '' }, MSG.requiredFields, true],
  ['TC03', 'consent false', { username: 'somchai3', email: 'somchai3@gmail.com', consent: false }, MSG.consentRequired, true],
  ['TC04', 'malformed email', { username: 'somchai4', email: 'somchai.gmail.com' }, MSG.emailInvalid, false],
  ['TC05', 'password "1234"', { username: 'somchai5', email: 'somchai5@gmail.com', password: '1234' }, MSG.passwordShort, false],
  ['TC06', 'phoneNumber "08123"', { username: 'somchai6', email: 'somchai6@gmail.com', phoneNumber: '08123' }, MSG.phoneInvalid, false],
  ['TC07', 'gender "X"', { username: 'somchai7', email: 'somchai7@gmail.com', gender: 'X' }, MSG.genderInvalid, false],
];

for (const [tc, what, change, message, checkNoUser] of invalid) {
  test(`${tc} - register with ${what} is rejected`, apiCase(tc, async (o, s) => {
    const data = { ...TC01, ...change };
    const res = await call(await s.anon(), 'POST', '/auth/register', data);
    o.statusMessage(res, 400, message);
    if (checkNoUser) {
      const users = await countUsers({ username: String(data.username), email: String(data.email) });
      o.add(users === 0 ? 'no user created' : `${users} user created`, users === 0);
    }
  }));
}

test('TC08 - register with a taken username is rejected', apiCase('TC08', async (o, s) => {
  const res = await call(await s.anon(), 'POST', '/auth/register', { ...TC01, username: 'somchai', email: 'somchai8@gmail.com' });
  o.statusMessage(res, 409, MSG.usernameTaken);
}));

test('TC09 - register with a taken email in another letter case is rejected', apiCase('TC09', async (o, s) => {
  const res = await call(await s.anon(), 'POST', '/auth/register', { ...TC01, username: 'somchai9', email: 'SOMCHAI@gmail.com' });
  o.statusMessage(res, 409, MSG.emailTaken);
}));
