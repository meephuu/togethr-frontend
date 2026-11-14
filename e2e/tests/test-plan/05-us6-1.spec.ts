import { test } from '@playwright/test';
import { call, myBookingCount, notificationsOf } from '../../helpers/plan/api';
import { MISSING, MSG } from '../../helpers/plan/data';
import { statusMessageText } from '../../helpers/plan/outcome';
import { apiCase } from '../../helpers/plan/plan-test';
import { seedId, setState } from '../../helpers/plan/state';

// US6-1 Booking request (TC36–TC48). POST /api/bookings
test.describe.configure({ mode: 'serial' });

const book = (ctx: Parameters<typeof call>[0], data: unknown) => call(ctx, 'POST', '/bookings', data);

test('TC36 - somchai books slot SL-01 of SV-001', apiCase('TC36', async (o, s) => {
  const somchai = await s.as('somchai');
  const somsri = await s.as('somsri');
  const res = await book(somchai, { serviceId: seedId('SV-001'), slotId: seedId('SL-01') });
  o.status(res, 201);

  const b = res.body?.booking ?? {};
  const fieldsOk =
    b.bookingStatus === 'WAITING_FOR_CONFIRMATION' && b.appointmentDate === '2026-11-20' &&
    b.startTime === '09:00' && b.endTime === '12:00' && b.totalPrice === 1500;
  o.add(
    `booking.bookingStatus "${b.bookingStatus}", appointmentDate "${b.appointmentDate}", startTime "${b.startTime}", ` +
      `endTime "${b.endTime}", totalPrice ${b.totalPrice}${b.totalPrice === 1500 ? ' (3 h × 500 THB)' : ''}`,
    fieldsOk,
  );
  if (b.id) setState({ tc36BookingId: b.id });

  const request = (await notificationsOf(somsri)).find((n) => n.type === 'NEW_BOOKING_REQUEST' && n.bookingId === b.id);
  o.add(request ? 'somsri gets NEW_BOOKING_REQUEST notification' : 'somsri gets no NEW_BOOKING_REQUEST notification', Boolean(request && b.id));
}));

test('TC37 - somchai books a date without a slot', apiCase('TC37', async (o, s) => {
  const res = await book(await s.as('somchai'), { serviceId: seedId('SV-001'), appointmentDate: '2026-11-28', duration: 3 });
  o.status(res, 201);
  const b = res.body?.booking ?? {};
  o.add(`status "${b.bookingStatus}", duration ${b.duration}`, b.bookingStatus === 'WAITING_FOR_CONFIRMATION' && b.duration === 3);
}));

test('TC38 - booking without a cookie is rejected', apiCase('TC38', async (o, s) => {
  const res = await book(await s.anon(), { serviceId: seedId('SV-001'), slotId: seedId('SL-03') });
  o.statusMessage(res, 401, MSG.noToken);
}));

test('TC39 - booking with an invalid token cookie is rejected', apiCase('TC39', async (o, s) => {
  const res = await book(await s.anon('token=abc.def.ghi'), { serviceId: seedId('SV-001'), slotId: seedId('SL-03') });
  o.statusMessage(res, 401, MSG.badToken);
}));

test('TC40 - booking without serviceId is rejected', apiCase('TC40', async (o, s) => {
  o.statusMessage(await book(await s.as('somchai'), { slotId: seedId('SL-03') }), 400, MSG.serviceIdRequired);
}));

test('TC41 - booking a service that does not exist', apiCase('TC41', async (o, s) => {
  const res = await book(await s.as('somchai'), { serviceId: MISSING.service, appointmentDate: '2026-11-28' });
  o.statusMessage(res, 404, MSG.serviceNotFound);
}));

test('TC42 - booking the unpublished service SV-002', apiCase('TC42', async (o, s) => {
  const res = await book(await s.as('somchai'), { serviceId: seedId('SV-002'), appointmentDate: '2026-11-28' });
  o.statusMessage(res, 410, MSG.serviceUnavailable);
}));

test('TC43 - somsri books her own service', apiCase('TC43', async (o, s) => {
  const res = await book(await s.as('somsri'), { serviceId: seedId('SV-001'), slotId: seedId('SL-03') });
  o.statusMessage(res, 400, MSG.ownService);
}));

test('TC44 - booking slot SL-02, held by BK-1003', apiCase('TC44', async (o, s) => {
  const somchai = await s.as('somchai');
  const somsri = await s.as('somsri');
  const bookingsBefore = await myBookingCount(somchai);
  const notificationsBefore = (await notificationsOf(somsri)).length;

  o.statusMessage(await book(somchai, { serviceId: seedId('SV-001'), slotId: seedId('SL-02') }), 409, MSG.slotUnavailable);

  const newBookings = (await myBookingCount(somchai)) - bookingsBefore;
  const newNotifications = (await notificationsOf(somsri)).length - notificationsBefore;
  o.add(
    newBookings || newNotifications
      ? `${newBookings} booking and ${newNotifications} notification created`
      : 'no booking and no notification created',
    newBookings === 0 && newNotifications === 0,
  );
}));

test('TC45 - booking a slot that does not exist', apiCase('TC45', async (o, s) => {
  const somchai = await s.as('somchai');
  const before = await myBookingCount(somchai);
  o.statusMessage(await book(somchai, { serviceId: seedId('SV-001'), slotId: MISSING.slot }), 409, MSG.slotUnavailable);
  const created = (await myBookingCount(somchai)) - before;
  o.add(created ? `${created} booking created` : 'no booking created', created === 0);
}));

test('TC46 - booking a date in the past', apiCase('TC46', async (o, s) => {
  const res = await book(await s.as('somchai'), { serviceId: seedId('SV-001'), appointmentDate: '2026-08-01' });
  o.statusMessage(res, 400, MSG.slotUnavailable);
}));

test('TC47 - booking with a malformed or impossible date', apiCase('TC47', async (o, s) => {
  const somchai = await s.as('somchai');
  const results = [];
  for (const appointmentDate of ['20/11/2026', '2026-02-30']) {
    results.push(await book(somchai, { serviceId: seedId('SV-001'), appointmentDate }));
  }
  const texts = results.map(statusMessageText);
  const ok = results.every((r) => r.status === 400 && r.body?.error === MSG.dateFormat);
  o.add(texts[0] === texts[1] ? `${texts[0]} (both)` : `"20/11/2026": ${texts[0]}, "2026-02-30": ${texts[1]}`, ok);
}));

test('TC48 - booking with duration 0', apiCase('TC48', async (o, s) => {
  const res = await book(await s.as('somchai'), { serviceId: seedId('SV-001'), appointmentDate: '2026-11-29', duration: 0 });
  o.statusMessage(res, 400, MSG.durationInvalid);
}));
