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

export async function getCategories() {
    await wait();
    if (getMockScenario("providerStatus") === "network") throw networkError();
    return CATEGORIES;
}

export async function getMyProviderStatus() {
    await wait();
    const scenario = getMockScenario("providerStatus");
    if (scenario === "network") throw networkError();
    return scenario === "approved" ? "APPROVED" : "PENDING";
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
        case "notApproved":
            throw httpError("POST", url, 403, "Forbidden", {
                error: "Only approved providers can create services",
            });
        case "network":
            throw networkError();
        default:
            return {
                service: {
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
                },
            };
    }
}
