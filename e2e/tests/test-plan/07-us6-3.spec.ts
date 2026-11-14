import { test, type Page } from '@playwright/test';
import { apiUrl } from '../../helpers/env';
import { listMessageIds, newMessagesTo } from '../../helpers/mailpit';
import { call, notificationsOf, pause, uiLogin } from '../../helpers/plan/api';
import { BOOKING_EMAIL_SUBJECT, MSG, NO_EMAIL_WAIT_MS, statusMessage } from '../../helpers/plan/data';
import { quote } from '../../helpers/plan/outcome';
import { apiCase, uiCase } from '../../helpers/plan/plan-test';
import { getState, seedId } from '../../helpers/plan/state';

// US6-3 Booking status notifications (TC56–TC64; TC59 runs after TC65, in 08-us6-4)
test.describe.configure({ mode: 'serial' });

const SOMCHAI = 'somchai@gmail.com';
const confirmedBK1001 = statusMessage.customer('2026-12-01', 'was confirmed');

test('TC56 - somchai is notified that BK-1001 was confirmed', apiCase('TC56', async (o, s) => {
  const somchai = await s.as('somchai');
  const res = await call(somchai, 'GET', '/notifications');
  o.status(res, 200);

  // Contains (not "is the newest"): TC50 and TC54 notify somchai after TC49
  const items: any[] = res.body?.notifications ?? [];
  const item =
    items.find((n) => n.type === 'BOOKING_CONFIRMED' && n.message === confirmedBK1001) ??
    items.find((n) => n.type === 'BOOKING_CONFIRMED');
  o.add(
    item
      ? `contains type "BOOKING_CONFIRMED", message ${quote(item.message)}, isRead ${item.isRead}`
      : 'contains no type "BOOKING_CONFIRMED"',
    item?.message === confirmedBK1001 && item?.isRead === false,
  );

  const before = getState().somchaiMailBeforeTC49;
  if (!before) throw new Error("somchai's inbox was not recorded before TC49");
  const fresh = await newMessagesTo(SOMCHAI, before);
  const email = fresh.find((m) => m.Subject === BOOKING_EMAIL_SUBJECT && m.Text.includes(confirmedBK1001));
  o.add(
    email
      ? `${SOMCHAI} receives an email ${quote(BOOKING_EMAIL_SUBJECT)} containing the same message`
      : `no email ${quote(BOOKING_EMAIL_SUBJECT)} with that message reached ${SOMCHAI} (${fresh.length} new emails)`,
    Boolean(email),
  );

  const somsriConfirmed = (await notificationsOf(await s.as('somsri'))).filter(
    (n) => n.type === 'BOOKING_CONFIRMED' && n.bookingId === seedId('BK-1001'),
  );
  o.add(
    somsriConfirmed.length ? `somsri (the actor) gets ${somsriConfirmed.length} BOOKING_CONFIRMED` : 'somsri (the actor) gets no BOOKING_CONFIRMED',
    somsriConfirmed.length === 0,
  );
}));

test('TC57 - somchai is notified that BK-1007 was rejected', apiCase('TC57', async (o, s) => {
  const res = await call(await s.as('somchai'), 'GET', '/notifications');
  o.status(res, 200);
  const message = statusMessage.customer('2026-12-04', 'was rejected');
  const item = (res.body?.notifications ?? []).find((n: any) => n.type === 'BOOKING_REJECTED');
  o.add(
    item ? `contains type "BOOKING_REJECTED" with ${quote(item.message)}` : 'no item of type "BOOKING_REJECTED"',
    item?.message === message,
  );
}));

test('TC58 - somchai and somsri are both notified that BK-1002 expired', apiCase('TC58', async (o, s) => {
  const checks: [string, any[], string][] = [
    ['somchai', await notificationsOf(await s.as('somchai')), statusMessage.customer('2026-12-02', 'expired without a response')],
    ['somsri', await notificationsOf(await s.as('somsri')), statusMessage.provider('2026-12-02', 'expired without a response')],
  ];
  for (const [who, list, message] of checks) {
    const item = list.find((n) => n.type === 'BOOKING_EXPIRED' && n.bookingId === seedId('BK-1002'));
    o.add(item ? `${who} gets type "BOOKING_EXPIRED" ${quote(item.message)}` : `${who} gets no "BOOKING_EXPIRED"`, item?.message === message);
  }
}));

test('TC60 - confirming BK-1001 again creates no duplicate notification', apiCase('TC60', async (o, s) => {
  const somchai = await s.as('somchai');
  const before = (await notificationsOf(somchai)).length;
  const res = await call(await s.as('somsri'), 'PATCH', `/bookings/${seedId('BK-1001')}/status`, { status: 'CONFIRMED' });
  o.add(`${res.status} on the PATCH`, res.status === 200);
  const added = (await notificationsOf(somchai)).length - before;
  o.add(added ? `notification count +${added}` : 'notification count unchanged (no duplicate)', added === 0);
}));

test('TC61 - notifications without a cookie are rejected', apiCase('TC61', async (o, s) => {
  o.statusMessage(await call(await s.anon(), 'GET', '/notifications'), 401, MSG.noToken);
}));

/** The unread count on the navbar's notification bell (0 when it shows no badge). */
async function unreadBadge(page: Page): Promise<number> {
  const bell = page.getByRole('button', { name: /^Notifications/ }).first();
  await bell.waitFor();
  await pause(500); // let React render the list it just fetched
  const badge = bell.locator('span.bg-red-500');
  return (await badge.count()) ? Number(await badge.innerText()) : 0;
}

const notificationsLoaded = (page: Page) =>
  page.waitForResponse((r) => r.request().method() === 'GET' && new URL(r.url()).pathname.endsWith('/notifications'));

test("TC62 - somchai marks the TC56 notification read; the unread badge drops by 1", uiCase('TC62', async (o, s, page) => {
  const tc56 = (await notificationsOf(await s.as('somchai'))).find(
    (n) => n.type === 'BOOKING_CONFIRMED' && n.bookingId === seedId('BK-1001'),
  );
  if (!tc56) throw new Error('somchai has no BOOKING_CONFIRMED notification for BK-1001 (TC56)');

  const firstLoad = notificationsLoaded(page);
  await uiLogin(page, SOMCHAI, getState().somchaiPassword);
  await firstLoad;
  const before = await unreadBadge(page);

  // Same browser session (its cookie), straight to the API
  const res = await page.request.patch(apiUrl(`/notifications/${tc56.id}/read`));
  const body = await res.json().catch(() => null);
  const readOk = res.status() === 200 && body?.notification?.isRead === true;
  o.add(readOk ? '200 { notification: { isRead: true } }' : `${res.status()} ${JSON.stringify(body)}`, readOk);

  const reload = notificationsLoaded(page);
  await page.reload();
  await reload;
  const after = await unreadBadge(page);
  o.add(after === before - 1 ? 'unread badge decreases by 1' : `unread badge ${before} → ${after}`, after === before - 1);
}));

test("TC63 - somchai cannot mark somsri's notification read", apiCase('TC63', async (o, s) => {
  const [somsriItem] = await notificationsOf(await s.as('somsri'));
  if (!somsriItem) throw new Error('somsri has no notifications to use');
  const res = await call(await s.as('somchai'), 'PATCH', `/notifications/${somsriItem.id}/read`);
  o.statusMessage(res, 404, MSG.notificationNotFound);
}));

test('TC64 - with booking emails off, somchai gets the notification but no email', apiCase('TC64', async (o, s) => {
  const somchai = await s.as('somchai');
  const settings = await call(somchai, 'PATCH', '/notifications/settings', { emailNotificationsEnabled: false });
  const mailBefore = await listMessageIds(SOMCHAI);
  const itemsBefore = new Set((await notificationsOf(somchai)).map((n) => n.id));

  const update = await call(await s.as('somsri'), 'PATCH', `/bookings/${seedId('BK-1008')}/status`, { status: 'CONFIRMED' });
  const settingsOk = settings.status === 200 && JSON.stringify(settings.body) === '{"emailNotificationsEnabled":false}';
  o.add(
    `${settings.status} ${settingsOk ? '{ emailNotificationsEnabled: false }' : JSON.stringify(settings.body)} on the settings update ` +
      `and ${update.status} on the status update`,
    settingsOk && update.status === 200,
  );

  const message = statusMessage.customer('2026-12-05', 'was confirmed');
  const fresh = (await notificationsOf(somchai)).filter((n) => !itemsBefore.has(n.id));
  const item = fresh.find((n) => n.type === 'BOOKING_CONFIRMED');
  o.add(
    item ? `somchai has a new BOOKING_CONFIRMED item ${quote(item.message)}` : `somchai has no new BOOKING_CONFIRMED item (${fresh.length} new items)`,
    item?.message === message,
  );

  await pause(NO_EMAIL_WAIT_MS);
  const emails = await newMessagesTo(SOMCHAI, mailBefore);
  o.add(emails.length ? `${emails.length} email sent to ${SOMCHAI}` : `no email is sent to ${SOMCHAI}`, emails.length === 0);
}));
