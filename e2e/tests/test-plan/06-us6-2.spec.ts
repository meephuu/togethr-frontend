import { test } from '@playwright/test';
import { listMessageIds } from '../../helpers/mailpit';
import { call, myBooking } from '../../helpers/plan/api';
import { MISSING, MSG } from '../../helpers/plan/data';
import { apiCase } from '../../helpers/plan/plan-test';
import { seedId, setState } from '../../helpers/plan/state';

// US6-2 Provider confirms or rejects a request (TC49–TC55). PATCH /api/bookings/:id/status
test.describe.configure({ mode: 'serial' });

const setStatus = (ctx: Parameters<typeof call>[0], id: string, status: string) =>
  call(ctx, 'PATCH', `/bookings/${id}/status`, { status });

test('TC49 - somsri confirms BK-1001', apiCase('TC49', async (o, s) => {
  // TC56 later checks the email this sends; remember what somchai already had
  setState({ somchaiMailBeforeTC49: await listMessageIds('somchai@gmail.com') });
  const res = await setStatus(await s.as('somsri'), seedId('BK-1001'), 'CONFIRMED');
  o.status(res, 200);
  const status = res.body?.booking?.bookingStatus;
  o.add(`booking.bookingStatus "${status}"`, status === 'CONFIRMED');
}));

test('TC50 - somsri rejects BK-1007', apiCase('TC50', async (o, s) => {
  const res = await setStatus(await s.as('somsri'), seedId('BK-1007'), 'REJECTED');
  o.status(res, 200);
  const status = res.body?.booking?.bookingStatus;
  o.add(`booking.bookingStatus "${status}"`, status === 'REJECTED');
}));

test('TC51 - status "COMPLETED" is rejected', apiCase('TC51', async (o, s) => {
  o.statusMessage(await setStatus(await s.as('somsri'), seedId('BK-1008'), 'COMPLETED'), 400, MSG.statusInvalid);
}));

test('TC52 - somchai cannot confirm a booking', apiCase('TC52', async (o, s) => {
  o.statusMessage(await setStatus(await s.as('somchai'), seedId('BK-1008'), 'CONFIRMED'), 403, MSG.providerOnly);
}));

test('TC53 - confirming a booking that does not exist', apiCase('TC53', async (o, s) => {
  o.statusMessage(await setStatus(await s.as('somsri'), MISSING.booking, 'CONFIRMED'), 404, MSG.bookingNotFound);
}));

test('TC54 - confirming BK-1002, created 25 h ago', apiCase('TC54', async (o, s) => {
  o.statusMessage(await setStatus(await s.as('somsri'), seedId('BK-1002'), 'CONFIRMED'), 409, MSG.requestExpired);
  const found = await myBooking(await s.as('somchai'), seedId('BK-1002'));
  const status = found?.booking.bookingStatus;
  o.add(`status saved as "${status}"`, status === 'EXPIRED');
}));

test('TC55 - confirming the rejected BK-1006', apiCase('TC55', async (o, s) => {
  o.statusMessage(await setStatus(await s.as('somsri'), seedId('BK-1006'), 'CONFIRMED'), 409, MSG.notWaiting);
}));
