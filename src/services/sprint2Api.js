// Every Sprint 2 call the service, search and provider pages make, in one
// place (the endpoints are in the backend's integration/sprint2 branch).
// Set VITE_USE_MOCKS=true to use sprint2Mocks.js instead of the backend.
//
// Errors: an HTTP error rejects with ApiError (check `.status` and `.body`);
// a network failure rejects with a plain Error. Same as the generated client.

import { ApiError, OpenAPI } from "./generated";
import { request } from "./generated/core/request";
import * as mocks from "./sprint2Mocks";

export { ApiError };

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

/**
 * The signed-in user's notifications, newest first.
 * GET /api/notifications → { notifications: Notification[] }
 * @returns {Promise<Array<{ id: string, bookingId: string|null, type: string, message: string, isRead: boolean, createdAt: string }>>}
 */
export async function getMyNotifications() {
    if (USE_MOCKS) return mocks.getMyNotifications();
    const res = await request(OpenAPI, { method: "GET", url: "/notifications" });
    return res.notifications;
}

/**
 * Marks one of the signed-in user's notifications as read.
 * PATCH /api/notifications/:id/read
 * @param {string} id
 */
export async function markNotificationRead(id) {
    if (USE_MOCKS) return mocks.markNotificationRead(id);
    return request(OpenAPI, {
        method: "PATCH",
        url: "/notifications/{id}/read",
        path: { id },
    });
}

/**
 * Marks all of the signed-in user's unread notifications as read.
 * PATCH /api/notifications/read-all
 */
export async function markAllNotificationsRead() {
    if (USE_MOCKS) return mocks.markAllNotificationsRead();
    return request(OpenAPI, { method: "PATCH", url: "/notifications/read-all" });
}

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} NewService
 * @property {File} coverPhoto JPG or PNG, at most 5 MB
 * @property {string} title max 150 characters
 * @property {string} description may be empty
 * @property {string} location the meeting area, max 200 characters
 * @property {string|number} rate more than 0
 * @property {"hour"|"day"} rateUnit
 * @property {string} startTime "HH:MM"
 * @property {string} endTime "HH:MM", after startTime
 * @property {string[]} categoryIds
 */

/**
 * @typedef {Object} Service
 * @property {string} id
 * @property {string} title
 * @property {string} location
 * @property {number} rate
 * @property {"hour"|"day"} rateUnit
 * @property {string} startTime "HH:MM"
 * @property {string} endTime "HH:MM"
 * @property {string|null} coverPhotoUrl
 * @property {"PUBLISHED"|"UNPUBLISHED"} status
 * @property {number} bookingsThisMonth
 */

/**
 * Service categories for the create-service chips and the search filter.
 * GET /api/categories → { categories: [{ id, category }] }
 * @returns {Promise<Category[]>}
 */
export async function getCategories() {
    if (USE_MOCKS) return mocks.getCategories();
    const res = await request(OpenAPI, { method: "GET", url: "/categories" });
    const rows = res.categories || res;
    return rows.map((row) => ({ id: row.id, name: row.category ?? row.name }));
}

/**
 * The signed-in provider's services, published and unpublished, for My services
 * (US4-4). No pagination: a provider rarely has more than a handful.
 * GET /api/providers/me/services → Service[] (an empty array, not an
 * error, when the provider has none).
 * @returns {Promise<Service[]>}
 */
export async function getMyServices() {
    if (USE_MOCKS) return mocks.getMyServices();
    return request(OpenAPI, { method: "GET", url: "/providers/me/services" });
}

/**
 * Publishes a service, in two steps:
 * 1. POST /api/upload (multipart, field "image") stores the cover photo and
 *    returns { url }
 * 2. POST /api/services (JSON) with that url as coverPhotoUrl, plus title,
 *    description, location, rate, rateUnit, startTime, endTime, categoryIds
 * - 201 { service }
 * - 400 { error, errors: { field: message } }
 * - 403 when the account has no provider profile
 * If step 2 fails, the uploaded photo stays on the server unused.
 * @param {NewService} values
 * @returns {Promise<{ service: Service }>}
 */
export async function createService(values) {
    if (USE_MOCKS) return mocks.createService(values);

    let coverPhotoUrl = null;
    if (values.coverPhoto) {
        const upload = await request(OpenAPI, {
            method: "POST",
            url: "/upload",
            formData: { image: values.coverPhoto },
        });
        coverPhotoUrl = upload.url;
    }

    return request(OpenAPI, {
        method: "POST",
        url: "/services",
        mediaType: "application/json",
        body: {
            title: values.title,
            description: values.description,
            location: values.location,
            rate: Number(values.rate),
            rateUnit: values.rateUnit,
            startTime: values.startTime,
            endTime: values.endTime,
            categoryIds: values.categoryIds,
            coverPhotoUrl,
        },
    });
}

/**
 * Searches published services. Pass the page's URL query as is: q, gender
 * (M|F|O), minAge, maxAge, interests (comma-separated category names),
 * minPrice, maxPrice, minRating, sortBy, page, limit.
 * GET /api/services/search
 * @param {URLSearchParams} searchParams
 * @returns {Promise<{ data: Service[], meta: { totalCount, currentPage, totalPages, limit } }>}
 */
export async function searchServices(searchParams) {
    if (USE_MOCKS) return mocks.searchServices(searchParams);
    return request(OpenAPI, {
        method: "GET",
        url: "/services/search",
        query: Object.fromEntries(searchParams.entries())
    });
}

/**
 * A service's availability calendar (US4-2). Day-rate services (rateUnit
 * "day") toggle whole dates; hour-rate services set which hours are open per
 * date, since a booking only takes part of the day. Bookable hours are
 * generated from the service's startTime/endTime (see lib/availability.js),
 * not stored.
 * GET /api/providers/me/services/:id/availability
 *   → day-rate:  { openDates, bookedDates } (YYYY-MM-DD strings)
 *   → hour-rate: { openSlots, bookedSlots } (date -> ["HH:00", ...])
 * @param {string} serviceId
 * @returns {Promise<{ openDates: string[], bookedDates: string[] } | { openSlots: Record<string, string[]>, bookedSlots: Record<string, string[]> }>}
 */
export async function getAvailability(serviceId) {
    if (USE_MOCKS) return mocks.getAvailability(serviceId);
    return request(OpenAPI, {
        method: "GET",
        url: "/providers/me/services/{id}/availability",
        path: { id: serviceId },
    });
}

/**
 * Replaces open availability for a service. Already-booked dates/hours stay
 * open no matter what's submitted — the server re-adds them.
 * PUT /api/providers/me/services/:id/availability { openDates } or { openSlots }
 * @param {string} serviceId
 * @param {string[]|Record<string, string[]>} openAvailability Day-rate: array
 *   of open dates. Hour-rate: date -> array of open "HH:00" hours.
 * @returns {Promise<{ openDates: string[], bookedDates: string[] } | { openSlots: Record<string, string[]>, bookedSlots: Record<string, string[]> }>}
 */
export async function updateAvailability(serviceId, openAvailability) {
    if (USE_MOCKS) return mocks.updateAvailability(serviceId, openAvailability);
    return request(OpenAPI, {
        method: "PUT",
        url: "/providers/me/services/{id}/availability",
        path: { id: serviceId },
        mediaType: "application/json",
        body: Array.isArray(openAvailability) ? { openDates: openAvailability } : { openSlots: openAvailability },
    });
}

/**
 * One service for the detail page (US5-3), with categories, reviews and the
 * provider. GET /api/services/:id
 * - 404 when it doesn't exist; 410 when the provider unpublished it
 * @param {string} id
 * @returns {Promise<Object>} the service
 */
export async function getServiceById(id) {
    if (USE_MOCKS) return mocks.getServiceById(id);
    const { service } = await request(OpenAPI, { method: "GET", url: "/services/{id}", path: { id } });
    return service;
}
/**
 * ส่งคำขอจอง slot ของ service (US6-1)
 * slot มาจาก getServiceById(id).availableSlots
 * POST /api/bookings { serviceId, slotId }
 * - 201 { booking } สถานะ "WAITING_FOR_CONFIRMATION"
 * - 409 "This time slot is not available" ถ้ามีคนจองตัดหน้า หรือ provider ลบ slot ไปแล้ว
 * - 403 ถ้าบัญชีไม่มี customer profile; 410 ถ้า service ถูก unpublish
 * @param {{ serviceId: string, slotId: string }} values
 */
export async function createBooking({ serviceId, slotId }) {
    return request(OpenAPI, {
        method: "POST",
        url: "/bookings",
        mediaType: "application/json",
        body: { serviceId, slotId },
    });
}

/**
 * @typedef {Object} BookingRequest
 * @property {string} id
 * @property {"WAITING_FOR_CONFIRMATION"|"CONFIRMED"|"REJECTED"|"EXPIRED"|"CANCELLED"|"COMPLETED"} bookingStatus
 * @property {string} appointmentDate "YYYY-MM-DD"
 * @property {string|null} startTime "HH:MM", null for a whole-day booking
 * @property {string|null} endTime
 * @property {number|null} totalPrice
 * @property {string} createdAt ISO timestamp
 * @property {string|null} respondBy ISO timestamp the provider must answer by
 *   (createdAt + 24h); null once answered
 * @property {{ id: string, title: string, location: string }} service
 * @property {{ firstname: string, lastname: string, profilePhotoUrl: string|null }} customer
 */

/**
 * Booking requests for the signed-in provider's services, newest first (US6-2).
 * GET /api/providers/me/booking-requests → { bookingRequests }
 * - 403 when the account has no provider profile
 * @returns {Promise<BookingRequest[]>}
 */
export async function getBookingRequests() {
    if (USE_MOCKS) return mocks.getBookingRequests();
    const { bookingRequests } = await request(OpenAPI, { method: "GET", url: "/providers/me/booking-requests" });
    return bookingRequests;
}

/**
 * The provider accepts or rejects a request (US6-2).
 * PATCH /api/bookings/:id/status { status: "CONFIRMED" | "REJECTED" }
 * - 200 { booking } and the customer gets a notification
 * - 409 "This request has expired" after 24 hours unanswered (the booking
 *   becomes EXPIRED); 409 also when it was already answered or cancelled
 * - 403 for anyone but the service's provider; 404 when it doesn't exist
 * @param {string} bookingId
 * @param {"CONFIRMED"|"REJECTED"} status
 * @returns {Promise<{ booking: Object }>}
 */
export async function updateBookingStatus(bookingId, status) {
    if (USE_MOCKS) return mocks.updateBookingStatus(bookingId, status);
    return request(OpenAPI, {
        method: "PATCH",
        url: "/bookings/{id}/status",
        path: { id: bookingId },
        mediaType: "application/json",
        body: { status },
    });
}

/**
 * @typedef {Object} MyBooking
 * @property {string} id
 * @property {"WAITING_FOR_CONFIRMATION"|"CONFIRMED"|"REJECTED"|"EXPIRED"|"CANCELLED"|"COMPLETED"} bookingStatus
 * @property {string} appointmentDate "YYYY-MM-DD"
 * @property {string|null} startTime "HH:MM", null for a whole-day booking
 * @property {string|null} endTime
 * @property {number|null} totalPrice
 * @property {string} startsAt ISO time the booking begins
 * @property {boolean} canCancel confirmed and not started yet
 * @property {{ id: string, title: string, location: string, coverPhotoUrl: string|null }} service
 * @property {{ id: string, firstname: string, lastname: string, profilePhotoUrl: string|null }} provider
 */

/**
 * The signed-in customer's bookings for My bookings (US6-4). Upcoming are
 * waiting or confirmed and not started, soonest first; past is the rest,
 * most recent first.
 * GET /api/bookings/me → { upcoming: MyBooking[], past: MyBooking[] }
 * @returns {Promise<{ upcoming: MyBooking[], past: MyBooking[] }>}
 */
export async function getMyBookings() {
    if (USE_MOCKS) return mocks.getMyBookings();
    return request(OpenAPI, { method: "GET", url: "/bookings/me" });
}

/**
 * The customer cancels a confirmed booking that hasn't started (US6-4).
 * PATCH /api/bookings/:id/cancel
 * - 200 { booking } and the provider gets a notification
 * - 409 when it isn't confirmed or has already started
 * - 403 for anyone but the booking's customer; 404 when it doesn't exist
 * @param {string} bookingId
 * @returns {Promise<{ booking: Object }>}
 */
export async function cancelBooking(bookingId) {
    if (USE_MOCKS) return mocks.cancelBooking(bookingId);
    return request(OpenAPI, {
        method: "PATCH",
        url: "/bookings/{id}/cancel",
        path: { id: bookingId },
    });
}

// ---------------------------------------------------------------------------
// US4-3: edit or unpublish a service
// ---------------------------------------------------------------------------

/**
 * One of the signed-in provider's own services, for the edit page. Unlike
 * GET /api/services/:id it also returns unpublished services and the counts the
 * page needs. GET /api/providers/me/services/:id
 * → { service: Service & { description, categoryIds, pendingRequestCount, confirmedBookingCount } }
 * - 403 when it belongs to another provider; 404 when it doesn't exist
 * @param {string} id
 */
export async function getMyService(id) {
    if (USE_MOCKS) return mocks.getMyService(id);
    const { service } = await request(OpenAPI, {
        method: "GET",
        url: "/providers/me/services/{id}",
        path: { id },
    });
    return service;
}

/**
 * Saves the edit form. A new cover photo (a File) is uploaded first, the same
 * way createService does it; otherwise the current coverPhotoUrl is kept.
 * PUT /api/services/:id (JSON, same fields as POST /api/services)
 * - 200 { service }. The new rate is used for bookings made from now on;
 *   confirmed bookings keep the price they were booked at (US4-3).
 * - 400 { error, errors: { field: message } }; 403 not your service; 404
 * @param {string} id
 * @param {NewService & { coverPhotoUrl: string|null }} values
 * @returns {Promise<{ service: Service }>}
 */
export async function updateService(id, values) {
    if (USE_MOCKS) return mocks.updateService(id, values);

    let coverPhotoUrl = values.coverPhotoUrl ?? null;
    if (values.coverPhoto instanceof File) {
        const upload = await request(OpenAPI, {
            method: "POST",
            url: "/upload",
            formData: { image: values.coverPhoto },
        });
        coverPhotoUrl = upload.url;
    }

    return request(OpenAPI, {
        method: "PUT",
        url: "/services/{id}",
        path: { id },
        mediaType: "application/json",
        body: {
            title: values.title,
            description: values.description,
            location: values.location,
            rate: Number(values.rate),
            rateUnit: values.rateUnit,
            startTime: values.startTime,
            endTime: values.endTime,
            categoryIds: values.categoryIds,
            coverPhotoUrl,
        },
    });
}

/**
 * Publishes or unpublishes a service.
 * PATCH /api/services/:id/status { status: "PUBLISHED" | "UNPUBLISHED" }
 * - 200 { service: { id, status } }
 * - 409 { error: "Please respond to pending requests first", pendingRequests: [...] }
 *   when unpublishing a service that still has WAITING_FOR_CONFIRMATION bookings
 * @param {string} id
 * @param {"PUBLISHED"|"UNPUBLISHED"} status
 */
export async function setServiceStatus(id, status) {
    if (USE_MOCKS) return mocks.setServiceStatus(id, status);
    return request(OpenAPI, {
        method: "PATCH",
        url: "/services/{id}/status",
        path: { id },
        mediaType: "application/json",
        body: { status },
    });
}
