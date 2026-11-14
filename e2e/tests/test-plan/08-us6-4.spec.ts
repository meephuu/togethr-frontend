import { test } from '@playwright/test';
import { call, myBooking, notificationsOf } from '../../helpers/plan/api';
import { MISSING, MSG, statusMessage } from '../../helpers/plan/data';
import { quote } from '../../helpers/plan/outcome';
import { apiCase } from '../../helpers/plan/plan-test';
import { seedId } from '../../helpers/plan/state';

// US6-4 Customer cancels a confirmed booking (TC65–TC71), plus TC59 (US6-3), whose input
// says "Run after TC65 (US6-4)". PATCH /api/bookings/:id/cancel
test.describe.configure({ mode: 'serial' });

const cancel = (ctx: Parameters<typeof call>[0], id: string) => call(ctx, 'PATCH', `/bookings/${id}/cancel`);

test('TC65 - somchai cancels the confirmed BK-1003', apiCase('TC65', async (o, s) => {
  const somchai = await s.as('somchai');
  const res = await cancel(somchai, seedId('BK-1003'));
  o.status(res, 200);
  const status = res.body?.booking?.bookingStatus;
  o.add(`booking.bookingStatus "${status}"`, status === 'CANCELLED');

  const service = await call(await s.anon(), 'GET', `/services/${seedId('SV-001')}`);
  const slot = service.body?.service?.availableSlots?.find((sl: any) => sl.id === seedId('SL-02'));
  o.add(slot?.available ? 'slot SL-02 bookable again' : `slot SL-02 ${slot ? 'still taken' : 'not listed'}`, slot?.available === true);

  const found = await myBooking(somchai, seedId('BK-1003'));
  o.add(
    found ? `GET /api/bookings/me lists BK-1003 under ${found.list}` : 'GET /api/bookings/me does not list BK-1003',
    found?.list === 'past',
  );
}));

test('TC59 - (US6-3, after TC65) somsri is notified of the cancellation, somchai is not', apiCase('TC59', async (o, s) => {
  const message = statusMessage.provider('2026-11-25', 'was cancelled');
  const somsriItem = (await notificationsOf(await s.as('somsri'))).find(
    (n) => n.type === 'BOOKING_CANCELLED' && n.bookingId === seedId('BK-1003'),
  );
  o.add(
    somsriItem ? `somsri receives "BOOKING_CANCELLED" ${quote(somsriItem.message)}` : 'somsri receives no "BOOKING_CANCELLED"',
    somsriItem?.message === message,
  );
  const somchaiItems = (await notificationsOf(await s.as('somchai'))).filter(
    (n) => n.type === 'BOOKING_CANCELLED' && n.bookingId === seedId('BK-1003'),
  );
  o.add(
    somchaiItems.length ? `somchai (the actor) receives ${somchaiItems.length}` : 'somchai (the actor) receives none',
    somchaiItems.length === 0,
  );
}));

test("TC66 - nida cannot cancel somchai's BK-1009", apiCase('TC66', async (o, s) => {
  o.statusMessage(await cancel(await s.as('nida'), seedId('BK-1009')), 403, MSG.customerOnlyCancel);
}));

test('TC67 - cancelling without a cookie is rejected', apiCase('TC67', async (o, s) => {
  o.statusMessage(await cancel(await s.anon(), seedId('BK-1009')), 401, MSG.noToken);
}));

test('TC68 - cancelling the waiting BK-1010 is rejected', apiCase('TC68', async (o, s) => {
  o.statusMessage(await cancel(await s.as('somchai'), seedId('BK-1010')), 409, MSG.onlyConfirmedCancel);
}));

test('TC69 - cancelling BK-1003 again', apiCase('TC69', async (o, s) => {
  const somchai = await s.as('somchai');
  const somsri = await s.as('somsri');
  const before = (await notificationsOf(somchai)).length + (await notificationsOf(somsri)).length;

  const res = await cancel(somchai, seedId('BK-1003'));
  o.status(res, 200);
  const status = res.body?.booking?.bookingStatus;
  o.add(`status "${status}"`, status === 'CANCELLED');

  const added = (await notificationsOf(somchai)).length + (await notificationsOf(somsri)).length - before;
  o.add(added ? `${added} extra notification` : 'no extra notification', added === 0);
}));

test('TC70 - cancelling a booking that does not exist', apiCase('TC70', async (o, s) => {
  o.statusMessage(await cancel(await s.as('somchai'), MISSING.booking), 404, MSG.bookingNotFound);
}));

test('TC71 - cancelling BK-1004, which has already started', apiCase('TC71', async (o, s) => {
  const somchai = await s.as('somchai');
  o.statusMessage(await cancel(somchai, seedId('BK-1004')), 409, MSG.alreadyStarted);
  const status = (await myBooking(somchai, seedId('BK-1004')))?.booking.bookingStatus;
  o.add(status === 'CONFIRMED' ? 'status stays "CONFIRMED"' : `status "${status}"`, status === 'CONFIRMED');
}));
