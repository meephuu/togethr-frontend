import crypto from 'node:crypto';
import { test } from '@playwright/test';
import { BASE_URL } from '../../helpers/env';
import { listMessageIds, newMessagesTo, type MailpitMessage } from '../../helpers/mailpit';
import { call, pause, type Sessions } from '../../helpers/plan/api';
import { MSG, NO_EMAIL_WAIT_MS, RESET_EMAIL_SUBJECT } from '../../helpers/plan/data';
import { dbQuery } from '../../helpers/plan/db';
import type { Outcome } from '../../helpers/plan/outcome';
import { apiCase } from '../../helpers/plan/plan-test';
import { getState, setState } from '../../helpers/plan/state';

// US1-5 Forgot / reset password (TC27–TC35)
test.describe.configure({ mode: 'serial' });

const SOMCHAI = 'somchai@gmail.com';
const NEW_PASSWORD = 'NewTravel@2026';

const tokenFromLink = (text: string) => text.match(/\/reset-password\?token=([A-Za-z0-9]+)/)?.[1];

/**
 * The reset email that arrived for `address` after `before` was taken, waiting up to 15 s.
 * Prefers a link to this run's frontend (BASE_URL), in case another run shares the inbox.
 */
async function waitForResetEmail(address: string, before: string[]): Promise<MailpitMessage | undefined> {
  for (let waited = 0; waited <= 15_000; waited += 500) {
    const fresh = (await newMessagesTo(address, before)).filter(
      (m) => m.Subject === RESET_EMAIL_SUBJECT && tokenFromLink(m.Text),
    );
    const ours = fresh.find((m) => m.Text.includes(`${BASE_URL}/reset-password?token=`));
    if (ours ?? fresh[0]) return ours ?? fresh[0];
    await pause(500);
  }
  return undefined;
}

async function forgotPassword(o: Outcome, s: Sessions, email: string) {
  const res = await call(await s.anon(), 'POST', '/auth/forgot-password', { email });
  o.statusMessage(res, 200, MSG.resetLinkSent);
}

const tokenRow = async (token: string) =>
  (
    await dbQuery<{ createdAt: Date; expiresAt: Date; usedAt: Date | null }>(
      `select "createdAt", "expiresAt", "usedAt" from password_reset_tokens where "tokenHash" = $1`,
      [crypto.createHash('sha256').update(token).digest('hex')],
    )
  )[0];

const tokenCount = async () => (await dbQuery<{ n: number }>('select count(*)::int as n from password_reset_tokens'))[0].n;

test('TC27 - forgot-password for somchai sends a reset link', apiCase('TC27', async (o, s) => {
  const before = await listMessageIds(SOMCHAI);
  await forgotPassword(o, s, SOMCHAI);

  const email = await waitForResetEmail(SOMCHAI, before);
  const t1 = email && tokenFromLink(email.Text);
  o.add(t1 ? 'email with reset link delivered' : 'no reset email delivered', Boolean(t1));
  if (!t1) return;
  setState({ tokens: { ...getState().tokens, T1: t1 } });

  const row = await tokenRow(t1);
  const minutes = row ? (row.expiresAt.getTime() - row.createdAt.getTime()) / 60_000 : NaN;
  const ok = Math.abs(minutes - 15) < 0.05;
  o.add(row ? `token row expires ${ok ? '15' : minutes.toFixed(2)} min later` : 'no token row for the emailed link', ok);
}));

test('TC28 - forgot-password for an unknown email answers the same and sends nothing', apiCase('TC28', async (o, s) => {
  const address = 'unknown@gmail.com';
  const before = await listMessageIds(address);
  const tokensBefore = await tokenCount();
  await forgotPassword(o, s, address);
  await pause(NO_EMAIL_WAIT_MS);

  const fresh = await newMessagesTo(address, before);
  o.add(fresh.length ? `${fresh.length} email sent` : 'no email sent', fresh.length === 0);
  const added = (await tokenCount()) - tokensBefore;
  o.add(added ? `${added} token row added` : 'no token row', added === 0);
}));

test('TC29 - forgot-password with body {} is rejected', apiCase('TC29', async (o, s) => {
  o.statusMessage(await call(await s.anon(), 'POST', '/auth/forgot-password', {}), 400, MSG.emailRequired);
}));

test('TC30 - forgot-password with a malformed email is rejected', apiCase('TC30', async (o, s) => {
  o.statusMessage(await call(await s.anon(), 'POST', '/auth/forgot-password', { email: 'somchai.gmail.com' }), 400, MSG.emailInvalid);
}));

test('TC31 - reset-password with T1 sets the new password', apiCase('TC31', async (o, s) => {
  const t1 = getState().tokens.T1;
  if (!t1) throw new Error('no token T1: TC27 did not deliver a reset link');
  const res = await call(await s.anon(), 'POST', '/auth/reset-password', { token: t1, password: NEW_PASSWORD });
  o.statusMessage(res, 200, MSG.passwordUpdated);

  const withNew = await call(await s.anon(), 'POST', '/auth/login', { email: SOMCHAI, password: NEW_PASSWORD });
  const withOld = await call(await s.anon(), 'POST', '/auth/login', { email: SOMCHAI, password: 'Travel@2026' });
  o.add(`login with "${NEW_PASSWORD}" → ${withNew.status}, with "Travel@2026" → ${withOld.status}`,
    withNew.status === 200 && withOld.status === 401);
  if (withNew.status === 200) setState({ somchaiPassword: NEW_PASSWORD });
}));

test("TC32 - reset-password with nida's expired token T2 is rejected", apiCase('TC32', async (o, s) => {
  const t2 = getState().tokens.T2;
  if (!t2) throw new Error('no token T2: the seed after TC16 did not run');
  o.statusMessage(await call(await s.anon(), 'POST', '/auth/reset-password', { token: t2, password: NEW_PASSWORD }), 400, MSG.resetLinkInvalid);

  const nida = await call(await s.anon(), 'POST', '/auth/login', { email: 'nida@gmail.com', password: 'Nida@2026' });
  o.add(nida.status === 200 ? 'nida can still log in with "Nida@2026"' : `nida's login with "Nida@2026" → ${nida.status}`, nida.status === 200);
}));

test('TC33 - reset-password with the used token T1 is rejected', apiCase('TC33', async (o, s) => {
  const t1 = getState().tokens.T1;
  if (!t1) throw new Error('no token T1: TC27 did not deliver a reset link');
  o.statusMessage(await call(await s.anon(), 'POST', '/auth/reset-password', { token: t1, password: 'Another@2026' }), 400, MSG.resetLinkInvalid);
}));

test('TC34 - reset-password with an unknown token is rejected', apiCase('TC34', async (o, s) => {
  o.statusMessage(await call(await s.anon(), 'POST', '/auth/reset-password', { token: 'abc123', password: NEW_PASSWORD }), 400, MSG.resetLinkInvalid);
}));

test('TC35 - reset-password with a short password keeps token T3 usable', apiCase('TC35', async (o, s) => {
  const before = await listMessageIds(SOMCHAI);
  const forgot = await call(await s.anon(), 'POST', '/auth/forgot-password', { email: SOMCHAI });
  const email = await waitForResetEmail(SOMCHAI, before);
  const t3 = email && tokenFromLink(email.Text);
  if (!t3) throw new Error(`no reset email with token T3 arrived (forgot-password → ${forgot.status})`);
  setState({ tokens: { ...getState().tokens, T3: t3 } });

  o.statusMessage(await call(await s.anon(), 'POST', '/auth/reset-password', { token: t3, password: 'short1' }), 400, MSG.passwordShort);

  // "Usable" as the server defines it: unused and not expired (checked without using it up)
  const row = await tokenRow(t3);
  const usable = Boolean(row) && !row.usedAt && row.expiresAt.getTime() > Date.now();
  o.add(usable ? 'T3 still usable' : `T3 not usable (${row ? (row.usedAt ? 'used' : 'expired') : 'no token row'})`, usable);
}));
