import { test } from '@playwright/test';
import { call, tokenCookie, uiLogin } from '../../helpers/plan/api';
import { MSG } from '../../helpers/plan/data';
import { statusMessageText, type Outcome } from '../../helpers/plan/outcome';
import { apiCase, uiCase } from '../../helpers/plan/plan-test';
import { getState, setState } from '../../helpers/plan/state';

// US1-3 Login (TC17–TC26)
test.describe.configure({ mode: 'serial' });

function noCookie(o: Outcome, setCookie: string) {
  const cookie = tokenCookie(setCookie);
  o.add(cookie ? `cookie set (${cookie.split(';')[0]})` : 'no cookie set', !cookie);
}

test('TC17 - log in as somchai through the login page', uiCase('TC17', async (o, _s, page) => {
  const response = await uiLogin(page, 'somchai@gmail.com', getState().somchaiPassword);
  o.add(String(response.status()), response.status() === 200);

  const cookie = ((await response.headerValue('set-cookie')) ?? '').split('\n').find((c) => /^token=/.test(c)) ?? '';
  const httpOnly = /;\s*HttpOnly/i.test(cookie);
  const maxAge = cookie.match(/;\s*Max-Age=(\d+)/i)?.[1];
  o.add(
    cookie ? `Set-Cookie token (${httpOnly ? 'HttpOnly' : 'not HttpOnly'}, Max-Age ${maxAge ?? 'missing'})` : 'no Set-Cookie token',
    httpOnly && maxAge === '1800',
  );

  const body = await response.json().catch(() => null);
  const roles = JSON.stringify(body?.user?.roles);
  o.add(`body.user.roles ${roles?.replace(/,/g, ', ')}`, roles === '["CUSTOMER"]');
  if (body?.user?.id && !getState().somchaiId) setState({ somchaiId: body.user.id });

  const redirected = await page.waitForURL(/\/customer\/dashboard$/, { timeout: 10_000 }).then(() => true, () => false);
  o.add(redirected ? 'UI redirects to /customer/dashboard' : `UI stays on ${new URL(page.url()).pathname}`, redirected);
}));

test('TC18 - log in as somsri by username', apiCase('TC18', async (o, s) => {
  const res = await call(await s.anon(), 'POST', '/auth/login', { username: 'somsri', password: 'Guide@2026' });
  o.status(res, 200);
  const roles = JSON.stringify(res.body?.user?.roles);
  o.add(`body.user.roles ${roles?.replace(/,/g, ', ')}`, roles === '["CUSTOMER","PROVIDER"]');
}));

test('TC19 - log in with the email in capitals', apiCase('TC19', async (o, s) => {
  const res = await call(await s.anon(), 'POST', '/auth/login', { email: 'SOMCHAI@GMAIL.COM', password: getState().somchaiPassword });
  o.status(res, 200);
  const expectedId = getState().somchaiId;
  const sameUser = Boolean(expectedId) && res.body?.user?.id === expectedId;
  o.add(sameUser ? 'same user as TC17 (email normalised)' : `user ${res.body?.user?.id} (TC17: ${expectedId})`, sameUser);
}));

test('TC20 - log in with a wrong password', apiCase('TC20', async (o, s) => {
  const res = await call(await s.anon(), 'POST', '/auth/login', { email: 'somchai@gmail.com', password: 'Travel@2025' });
  o.statusMessage(res, 401, MSG.invalidLogin);
  noCookie(o, res.setCookie);
}));

const rejected: [string, string, Record<string, string>, number, string][] = [
  ['TC21', 'an unregistered email', { email: 'unknown@gmail.com', password: 'Travel@2026' }, 401, MSG.invalidLogin],
  ['TC22', 'only a password', { password: 'Travel@2026' }, 400, MSG.loginRequired],
  ['TC23', 'no password', { email: 'somchai@gmail.com' }, 400, MSG.loginRequired],
  ['TC24', 'a malformed email', { email: 'somchai.gmail.com', password: 'Travel@2026' }, 400, MSG.emailInvalid],
  ['TC25', 'a deleted account', { email: 'deleted.user@gmail.com', password: 'Deleted@2026' }, 401, MSG.invalidLogin],
];

for (const [tc, what, data, status, message] of rejected) {
  test(`${tc} - log in with ${what} is rejected`, apiCase(tc, async (o, s) => {
    o.statusMessage(await call(await s.anon(), 'POST', '/auth/login', data), status, message);
  }));
}

test('TC26 - five wrong passwords lock kanya for 15 minutes', apiCase('TC26', async (o, s) => {
  const ctx = await s.anon();
  const login = (password: string) => call(ctx, 'POST', '/auth/login', { email: 'kanya@gmail.com', password });

  const first = [];
  for (let i = 0; i < 4; i++) first.push(await login('Wrong@2026'));
  const fifth = await login('Wrong@2026');
  const sixth = await login('Kanya@2026');

  const texts = first.map(statusMessageText);
  const firstOk = first.every((r) => r.status === 401 && r.body?.error === MSG.invalidLogin);
  o.add(
    texts.every((t) => t === texts[0]) ? `Attempts 1–4: ${texts[0]}` : texts.map((t, i) => `Attempt ${i + 1}: ${t}`).join('. '),
    firstOk,
  );
  o.add(`Attempt 5: ${statusMessageText(fifth)}`, fifth.status === 423 && fifth.body?.error === MSG.lockedNow);
  o.add(
    `Attempt 6 (correct password): ${statusMessageText(sixth)}`,
    sixth.status === 423 && sixth.body?.error === MSG.stillLocked,
  );
  noCookie(o, sixth.setCookie);
}));
