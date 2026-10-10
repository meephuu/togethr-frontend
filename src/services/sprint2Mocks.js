// In-browser stand-ins for the Sprint 2 endpoints, used when VITE_USE_MOCKS=true.
// Sample data comes from the design mockups. Each call waits a little so loading
// states are visible, and returns whatever the "Mocks" switcher has selected.
// Errors are thrown in the same shape as the real client: ApiError for HTTP
// errors, a plain Error (no response) for network failures.

import { ApiError } from "./generated";
import { getMockScenario } from "./mockScenarios";

const DELAY_MS = 800;

const wait = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

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
    { id: "cat-nature-hiking", name: "Nature & hiking" },
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
        coverPhotoUrl: null,
        status: "UNPUBLISHED",
        bookingsThisMonth: 0,
    },
];

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
