// In-browser stand-ins for the Sprint 2 endpoints, used when VITE_USE_MOCKS=true.
// Sample data comes from the design mockups. Each call waits a little so loading
// states are visible, and returns whatever the "Mocks" switcher has selected.
// Errors are thrown in the same shape as the real client: ApiError for HTTP
// errors, a plain Error (no response) for network failures.

import { ApiError } from "./generated";
import { getMockScenario } from "./mockScenarios";
import { hourSlotsFor } from "../lib/availability";

const DELAY_MS = 800;

const wait = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

const mockNotifications = [
    {
        id: "mock-notification-1",
        bookingId: "mock-booking-1",
        type: "BOOKING_CONFIRMED",
        message: "Your booking for the city tour was confirmed.",
        isRead: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
        id: "mock-notification-2",
        bookingId: "mock-booking-2",
        type: "NEW_BOOKING_REQUEST",
        message: "A customer requested \"Old Town street food walk\".",
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
        id: "mock-notification-3",
        bookingId: "mock-booking-3",
        type: "BOOKING_CANCELLED",
        message: "Your booking for the temple tour was cancelled.",
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
];

export async function getMyNotifications() {
    await wait();
    return mockNotifications.map((notification) => ({ ...notification }));
}

export async function markNotificationRead(id) {
    await wait(200);
    const notification = mockNotifications.find((item) => item.id === id);
    if (notification) notification.isRead = true;
    return { notification: { id, isRead: true } };
}

export async function markAllNotificationsRead() {
    await wait(200);
    const unread = mockNotifications.filter((notification) => !notification.isRead);
    unread.forEach((notification) => { notification.isRead = true; });
    return { updatedCount: unread.length };
}

function httpError(method, url, status, statusText, body) {
    return new ApiError({ method, url }, { url, ok: false, status, statusText, body }, statusText);
}

function networkError() {
    const error = new Error("Network Error");
    error.code = "ERR_NETWORK";
    return error;
}

// Chip names in the mockup are placeholders; real categories come from the API.
const CATEGORIES = [
    { id: "cat-food-tour", name: "Food tour" },
    { id: "cat-sightseeing", name: "Sightseeing" },
    { id: "cat-photography", name: "Photography" },
    { id: "cat-shopping", name: "Shopping" },
    { id: "cat-nightlife", name: "Nightlife" },
    { id: "cat-nature-hiking", name: "Nature & Hiking" },
];

// The provider's services, as in the My services mockup. Services published
// through the mock are added to the top until the page reloads.
const myServices = [
    {
        id: "svc-old-town",
        title: "Old Town street food walk",
        location: "Bangkok – Yaowarat & Old Town",
        rate: 450,
        rateUnit: "hour",
        startTime: "17:00",
        endTime: "21:00",
        coverPhotoUrl: null,
        status: "PUBLISHED",
        bookingsThisMonth: 0,
    },
    {
        id: "svc-temple-photo",
        title: "Temple morning photo walk",
        location: "Bangkok – Rattanakosin",
        rate: 600,
        rateUnit: "hour",
        startTime: "06:00",
        endTime: "09:00",
        coverPhotoUrl: null,
        status: "PUBLISHED",
        bookingsThisMonth: 4,
    },
    {
        id: "svc-chatuchak",
        title: "Chatuchak weekend market day",
        location: "Bangkok – Chatuchak",
        rate: 2200,
        rateUnit: "day",
        startTime: "09:00",
        endTime: "17:00",
        coverPhotoUrl: null,
        status: "PUBLISHED",
        bookingsThisMonth: 3,
    },
    {
        id: "svc-ayutthaya",
        title: "Ayutthaya temples day trip",
        location: "Ayutthaya",
        rate: 2800,
        rateUnit: "day",
        startTime: "07:00",
        endTime: "18:00",
        coverPhotoUrl: null,
        status: "UNPUBLISHED",
        bookingsThisMonth: 0,
    },
];

// Availability (US4-2). Day-rate services toggle whole dates (openDates/
// bookedDates). Hour-rate services set which hours are open per date
// (openSlots/bookedSlots, date -> "HH:00" strings), since a booking on an
// hour-rate service only takes part of the day. Seeded relative to today so
// the mock still makes sense whenever this runs.
function isoDate(daysFromToday) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + daysFromToday);
    return date.toISOString().slice(0, 10);
}

const cloneSlotMap = (map) => Object.fromEntries(Object.entries(map).map(([date, hours]) => [date, [...hours]]));

const templePhotoHours = hourSlotsFor("06:00", "09:00"); // ["06:00", "07:00", "08:00"]

const AVAILABILITY = {
    "svc-old-town": { openSlots: {}, bookedSlots: {} },
    "svc-temple-photo": {
        openSlots: {
            [isoDate(2)]: [templePhotoHours[0]],
            [isoDate(3)]: [...templePhotoHours],
            [isoDate(4)]: [templePhotoHours[0], templePhotoHours[1]],
            [isoDate(10)]: [templePhotoHours[1], templePhotoHours[2]],
        },
        bookedSlots: {
            [isoDate(2)]: [templePhotoHours[1], templePhotoHours[2]],
            [isoDate(9)]: [...templePhotoHours],
            [isoDate(16)]: [templePhotoHours[0]],
            [isoDate(23)]: [templePhotoHours[2]],
        },
    },
    "svc-chatuchak": {
        openDates: [isoDate(5), isoDate(12), isoDate(19)],
        bookedDates: [isoDate(5), isoDate(12), isoDate(19)],
    },
    "svc-ayutthaya": { openDates: [], bookedDates: [] },
};

function isHourlyService(serviceId) {
    return myServices.find((service) => service.id === serviceId)?.rateUnit === "hour";
}

export async function getAvailability(serviceId) {
    await wait();
    const isHourly = isHourlyService(serviceId);
    switch (getMockScenario("availability")) {
        case "empty":
            return isHourly ? { openSlots: {}, bookedSlots: {} } : { openDates: [], bookedDates: [] };
        case "network":
            throw networkError();
        default: {
            const entry =
                AVAILABILITY[serviceId] ?? (isHourly ? { openSlots: {}, bookedSlots: {} } : { openDates: [], bookedDates: [] });
            return isHourly
                ? { openSlots: cloneSlotMap(entry.openSlots), bookedSlots: cloneSlotMap(entry.bookedSlots) }
                : { openDates: [...entry.openDates], bookedDates: [...entry.bookedDates] };
        }
    }
}

// openAvailability: day-rate = array of open dates; hour-rate = { [date]: openHours[] }.
export async function updateAvailability(serviceId, openAvailability) {
    await wait(600);
    if (getMockScenario("availability") === "network") throw networkError();
    const isHourly = isHourlyService(serviceId);

    if (isHourly) {
        const entry = AVAILABILITY[serviceId] ?? (AVAILABILITY[serviceId] = { openSlots: {}, bookedSlots: {} });
        const nextOpenSlots = {};
        // Booked hours stay open no matter what's submitted.
        new Set([...Object.keys(openAvailability), ...Object.keys(entry.bookedSlots)]).forEach((date) => {
            const merged = new Set([...(openAvailability[date] ?? []), ...(entry.bookedSlots[date] ?? [])]);
            if (merged.size > 0) nextOpenSlots[date] = Array.from(merged);
        });
        entry.openSlots = nextOpenSlots;
        return { openSlots: cloneSlotMap(entry.openSlots), bookedSlots: cloneSlotMap(entry.bookedSlots) };
    }

    const entry = AVAILABILITY[serviceId] ?? (AVAILABILITY[serviceId] = { openDates: [], bookedDates: [] });
    entry.openDates = Array.from(new Set([...openAvailability, ...entry.bookedDates]));
    return { openDates: [...entry.openDates], bookedDates: [...entry.bookedDates] };
}

export async function getMyServices() {
    await wait();
    switch (getMockScenario("myServices")) {
        case "empty":
            return [];
        case "network":
            throw networkError();
        default:
            return myServices.map((service) => ({ ...service }));
    }
}

export async function getCategories() {
    await wait();
    if (getMockScenario("categories") === "network") throw networkError();
    return CATEGORIES;
}

export async function createService(values) {
    await wait(1200);
    const url = "/api/services";

    switch (getMockScenario("createService")) {
        case "validation":
            // Deliberately not the client's wording, to show the mapping works.
            throw httpError("POST", url, 400, "Bad Request", {
                errors: {
                    rate: "rate must be greater than 0",
                    endTime: "endTime must be later than startTime",
                },
            });
        case "network":
            throw networkError();
        default: {
            const service = {
                id: `svc-${Date.now()}`,
                title: values.title,
                description: values.description,
                location: values.location,
                rate: Number(values.rate),
                rateUnit: values.rateUnit,
                startTime: values.startTime,
                endTime: values.endTime,
                categoryIds: values.categoryIds,
                coverPhotoUrl: URL.createObjectURL(values.coverPhoto),
                status: "PUBLISHED",
                bookingsThisMonth: 0,
            };
            myServices.unshift(service);
            return { service };
        }
    }
}

// Search results (US5-1/US5-2), in the shape of GET /api/services/search.
// gender, age and categories are only used to filter the mock; the real API
// does that on the server.
const SEARCH_SERVICES = [
    { id: "mock-1", title: "Old Town street food walk", location: "Bangkok – Yaowarat", rate: 450, provider: ["Nina", "P.", 4.8], gender: "F", age: 24, categories: ["Food tour"], reviewCount: 32 },
    { id: "mock-2", title: "Temple morning photo walk", location: "Bangkok – Rattanakosin", rate: 600, provider: ["Nina", "P.", 4.8], gender: "F", age: 24, categories: ["Photography", "Sightseeing"], reviewCount: 21 },
    { id: "mock-3", title: "Bang Rak night food crawl", location: "Bangkok – Bang Rak", rate: 500, provider: ["Ploy", "S.", 4.7], gender: "F", age: 27, categories: ["Food tour", "Nightlife"], reviewCount: 18 },
    { id: "mock-4", title: "Chinatown street photography", location: "Bangkok – Yaowarat", rate: 550, provider: ["Fah", "K.", 4.6], gender: "F", age: 31, categories: ["Photography", "Food tour"], reviewCount: 40 },
    { id: "mock-5", title: "Floating market breakfast trip", location: "Ratchaburi – Damnoen Saduak", rate: 700, provider: ["Mint", "J.", 4.5], gender: "F", age: 29, categories: ["Food tour", "Shopping"], reviewCount: 12 },
    { id: "mock-6", title: "Ari café and brunch hop", location: "Bangkok – Ari", rate: 350, provider: ["Ploy", "S.", 4.4], gender: "F", age: 27, categories: ["Food tour"], reviewCount: 9 },
    { id: "mock-7", title: "Khao San after-dark tour", location: "Bangkok – Banglamphu", rate: 400, provider: ["Tom", "W.", 4.2], gender: "M", age: 26, categories: ["Nightlife"], reviewCount: 15 },
    { id: "mock-8", title: "Chatuchak market shopping day", location: "Bangkok – Chatuchak", rate: 380, provider: ["Ben", "C.", 3.9], gender: "M", age: 34, categories: ["Shopping", "Food tour"], reviewCount: 22 },
    { id: "mock-9", title: "Khao Yai nature hike", location: "Nakhon Ratchasima – Khao Yai", rate: 900, provider: ["Sam", "R.", 4.9], gender: "O", age: 38, categories: ["Nature & Hiking", "Photography"], reviewCount: 7 },
    { id: "mock-10", title: "Wat Pho and Grand Palace guide", location: "Bangkok – Rattanakosin", rate: 650, provider: ["Anan", "T.", 3.4], gender: "M", age: 45, categories: ["Sightseeing"], reviewCount: 11 },
].map(({ provider: [firstname, lastname, avgRating], ...service }) => ({
    ...service,
    rateUnit: "hour",
    coverPhotoUrl: null,
    provider: { firstname, lastname, avgRating, profilePhotoUrl: null },
}));

const SORTERS = {
    rating_desc: (a, b) => b.provider.avgRating - a.provider.avgRating,
    price_asc: (a, b) => a.rate - b.rate,
    price_desc: (a, b) => b.rate - a.rate,
};

function matchesSearch(service, params) {
    const keyword = (params.get("q") ?? "").toLowerCase();
    const number = (name) => (params.has(name) ? Number(params.get(name)) : null);
    const inRange = (value, min, max) => (min === null || value >= min) && (max === null || value <= max);
    const gender = params.get("gender");
    const categories = (params.get("interests") ?? "").split(",").filter(Boolean);
    const minRating = number("minRating");

    return (
        (!keyword || `${service.title} ${service.location} ${service.provider.firstname}`.toLowerCase().includes(keyword)) &&
        (!gender || service.gender === gender) &&
        inRange(service.age, number("minAge"), number("maxAge")) &&
        (categories.length === 0 || categories.some((category) => service.categories.includes(category))) &&
        inRange(service.rate, number("minPrice"), number("maxPrice")) &&
        (minRating === null || service.provider.avgRating >= minRating)
    );
}

export async function searchServices(searchParams) {
    await wait();
    const scenario = getMockScenario("search");
    if (scenario === "network") throw networkError();

    const params = new URLSearchParams(searchParams);
    const matches =
        scenario === "empty"
            ? []
            : SEARCH_SERVICES.filter((service) => matchesSearch(service, params)).sort(
                  SORTERS[params.get("sortBy")] ?? SORTERS.rating_desc,
              );
    const limit = Math.max(1, Number(params.get("limit")) || 10);
    const totalPages = Math.max(1, Math.ceil(matches.length / limit));
    const currentPage = Math.min(Math.max(1, Number(params.get("page")) || 1), totalPages);

    return {
        data: matches
            .slice((currentPage - 1) * limit, currentPage * limit)
            .map(({ gender, age, categories, ...card }) => card), // eslint-disable-line no-unused-vars
        meta: { totalCount: matches.length, currentPage, totalPages, limit },
    };
}

// GET /api/services/:id for the mock search results above.
export async function getServiceById(id) {
    await wait();
    const service = SEARCH_SERVICES.find((candidate) => candidate.id === id);
    if (!service) throw httpError("GET", `/api/services/${id}`, 404, "Not Found", { error: "Service not found." });

    const { gender, age, ...rest } = service; // eslint-disable-line no-unused-vars
    return {
        ...rest,
        description: "A sample service from the mock data. Turn mocks off to see real services.",
        startTime: "09:00",
        endTime: "17:00",
        reviews: [],
    };
}

// ---------------------------------------------------------------------------
// Booking requests (US6-2). Decisions made through the mock stick until reload.
// ---------------------------------------------------------------------------

const HOUR_MS = 60 * 60 * 1000;

function mockDateFromToday(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function mockRequest(id, status, hoursAgo, fields) {
    const createdAt = new Date(Date.now() - hoursAgo * HOUR_MS);
    return {
        id,
        bookingStatus: status,
        createdAt: createdAt.toISOString(),
        respondBy:
            status === "WAITING_FOR_CONFIRMATION" ? new Date(createdAt.getTime() + 24 * HOUR_MS).toISOString() : null,
        ...fields,
    };
}

const OLD_TOWN = { id: "svc-old-town", title: "Old Town street food walk", location: "Bangkok – Yaowarat & Old Town" };
const TEMPLE = { id: "svc-temple", title: "Temple morning photo walk", location: "Bangkok – Rattanakosin" };

const bookingRequests = [
    mockRequest("req-1", "WAITING_FOR_CONFIRMATION", 2, {
        appointmentDate: mockDateFromToday(3), startTime: "09:00", endTime: "12:00", totalPrice: 1350,
        service: OLD_TOWN, customer: { firstname: "Nina", lastname: "Park", profilePhotoUrl: null },
    }),
    mockRequest("req-2", "WAITING_FOR_CONFIRMATION", 21, {
        appointmentDate: mockDateFromToday(2), startTime: "13:00", endTime: "16:00", totalPrice: 1800,
        service: TEMPLE, customer: { firstname: "Tom", lastname: "Wong", profilePhotoUrl: null },
    }),
    mockRequest("req-3", "CONFIRMED", 30, {
        appointmentDate: mockDateFromToday(5), startTime: "09:00", endTime: "11:00", totalPrice: 900,
        service: OLD_TOWN, customer: { firstname: "Ploy", lastname: "Srisuk", profilePhotoUrl: null },
    }),
    mockRequest("req-4", "REJECTED", 50, {
        appointmentDate: mockDateFromToday(1), startTime: "15:00", endTime: "17:00", totalPrice: 1200,
        service: TEMPLE, customer: { firstname: "Ben", lastname: "Chan", profilePhotoUrl: null },
    }),
    mockRequest("req-5", "EXPIRED", 80, {
        appointmentDate: mockDateFromToday(-1), startTime: null, endTime: null, totalPrice: null,
        service: OLD_TOWN, customer: { firstname: "Mint", lastname: "J.", profilePhotoUrl: null },
    }),
];

export async function getBookingRequests() {
    await wait();
    switch (getMockScenario("bookingRequests")) {
        case "empty":
            return [];
        case "network":
            throw networkError();
        default:
            return bookingRequests.map((item) => ({ ...item }));
    }
}

export async function updateBookingStatus(bookingId, status) {
    await wait(500);
    const url = `/api/bookings/${bookingId}/status`;
    const item = bookingRequests.find((candidate) => candidate.id === bookingId);
    if (!item) throw httpError("PATCH", url, 404, "Not Found", { error: "Booking not found." });

    switch (getMockScenario("bookingDecision")) {
        case "expired":
            item.bookingStatus = "EXPIRED";
            item.respondBy = null;
            throw httpError("PATCH", url, 409, "Conflict", { error: "This request has expired" });
        case "network":
            throw networkError();
        default:
    }
    if (item.bookingStatus !== "WAITING_FOR_CONFIRMATION") {
        throw httpError("PATCH", url, 409, "Conflict", {
            error: "Only a booking waiting for confirmation can be confirmed or rejected.",
        });
    }
    item.bookingStatus = status;
    item.respondBy = null;
    return { booking: { id: item.id, bookingStatus: status } };
}

// ---------------------------------------------------------------------------
// My bookings (US6-4). Cancels made through the mock stick until reload.
// ---------------------------------------------------------------------------

function mockBooking(id, status, daysFromToday, startTime, endTime, fields) {
    const appointmentDate = mockDateFromToday(daysFromToday);
    const [y, m, d] = appointmentDate.split("-").map(Number);
    const [hh, mm] = (startTime || "00:00").split(":").map(Number);
    const startsAt = new Date(y, m - 1, d, hh, mm).toISOString();
    return { id, bookingStatus: status, appointmentDate, startTime, endTime, startsAt, ...fields };
}

const MALI = { id: "provider-mali", firstname: "Mali", lastname: "S.", profilePhotoUrl: null };
const ARTHIT = { id: "provider-arthit", firstname: "Arthit", lastname: "K.", profilePhotoUrl: null };
const COVERLESS = (service) => ({ ...service, coverPhotoUrl: null });

const myBookings = [
    mockBooking("bk-1", "CONFIRMED", 4, "09:00", "12:00", { totalPrice: 1350, service: COVERLESS(OLD_TOWN), provider: MALI }),
    mockBooking("bk-2", "WAITING_FOR_CONFIRMATION", 6, "06:00", "08:00", { totalPrice: 1200, service: COVERLESS(TEMPLE), provider: ARTHIT }),
    mockBooking("bk-3", "CONFIRMED", 12, null, null, { totalPrice: 2200, service: COVERLESS(TEMPLE), provider: ARTHIT }),
    mockBooking("bk-4", "COMPLETED", -9, "09:00", "11:00", { totalPrice: 900, service: COVERLESS(OLD_TOWN), provider: MALI }),
    mockBooking("bk-5", "REJECTED", -2, "15:00", "17:00", { totalPrice: 1200, service: COVERLESS(TEMPLE), provider: ARTHIT }),
];

const isUpcoming = (item) =>
    ["WAITING_FOR_CONFIRMATION", "CONFIRMED"].includes(item.bookingStatus) && new Date(item.startsAt).getTime() > Date.now();

export async function getMyBookings() {
    await wait();
    switch (getMockScenario("myBookings")) {
        case "empty":
            return { upcoming: [], past: [] };
        case "network":
            throw networkError();
        default: {
            const items = myBookings.map((item) => ({
                ...item,
                canCancel: item.bookingStatus === "CONFIRMED" && isUpcoming(item),
            }));
            return {
                upcoming: items.filter(isUpcoming).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
                past: items.filter((item) => !isUpcoming(item)).sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
            };
        }
    }
}

export async function cancelBooking(bookingId) {
    await wait(500);
    const url = `/api/bookings/${bookingId}/cancel`;
    const item = myBookings.find((candidate) => candidate.id === bookingId);
    if (!item) throw httpError("PATCH", url, 404, "Not Found", { error: "Booking not found." });

    switch (getMockScenario("cancelBooking")) {
        case "started":
            throw httpError("PATCH", url, 409, "Conflict", {
                error: "This booking has already started and can no longer be cancelled.",
            });
        case "network":
            throw networkError();
        default:
    }
    if (item.bookingStatus !== "CONFIRMED") {
        throw httpError("PATCH", url, 409, "Conflict", { error: "Only a confirmed booking can be cancelled." });
    }
    item.bookingStatus = "CANCELLED";
    return { booking: { id: item.id, bookingStatus: "CANCELLED" } };
}

// ---------------------------------------------------------------------------
// Edit / unpublish a service (US4-3). Changes stick until reload.
// ---------------------------------------------------------------------------

const MOCK_PENDING_REQUEST = {
    id: "BK-1003",
    customerName: "Nok P.",
    appointmentDate: mockDateFromToday(8),
    startTime: "09:00",
    endTime: "12:00",
};

export async function getMyService(id) {
    await wait();
    const service = myServices.find((candidate) => candidate.id === id);
    if (!service) throw httpError("GET", `/api/providers/me/services/${id}`, 404, "Not Found", { error: "Service not found." });

    const pending = getMockScenario("unpublishService") === "pending";
    return {
        description: "We'll walk Yaowarat together and try 5 local stalls.",
        categoryIds: [CATEGORIES[0].id],
        ...service,
        pendingRequestCount: pending ? 1 : 0,
        confirmedBookingCount: 2,
    };
}

export async function updateService(id, values) {
    await wait(1000);
    const url = `/api/services/${id}`;

    switch (getMockScenario("editService")) {
        case "validation":
            throw httpError("PUT", url, 400, "Bad Request", {
                errors: { rate: "rate must be greater than 0" },
            });
        case "network":
            throw networkError();
        default: {
            const service = myServices.find((candidate) => candidate.id === id);
            if (!service) throw httpError("PUT", url, 404, "Not Found", { error: "Service not found." });
            Object.assign(service, {
                title: values.title,
                description: values.description,
                location: values.location,
                rate: Number(values.rate),
                rateUnit: values.rateUnit,
                startTime: values.startTime,
                endTime: values.endTime,
                categoryIds: values.categoryIds,
                coverPhotoUrl: values.coverPhoto instanceof File ? URL.createObjectURL(values.coverPhoto) : values.coverPhotoUrl,
            });
            return { service: { ...service } };
        }
    }
}

export async function setServiceStatus(id, status) {
    await wait();
    const url = `/api/services/${id}/status`;

    if (status === "UNPUBLISHED") {
        switch (getMockScenario("unpublishService")) {
            case "pending":
                throw httpError("PATCH", url, 409, "Conflict", {
                    error: "Please respond to pending requests first",
                    pendingRequests: [MOCK_PENDING_REQUEST],
                });
            case "network":
                throw networkError();
            default:
                break;
        }
    }

    const service = myServices.find((candidate) => candidate.id === id);
    if (!service) throw httpError("PATCH", url, 404, "Not Found", { error: "Service not found." });
    service.status = status;
    return { service: { id, status } };
}
