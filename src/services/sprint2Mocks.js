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
    { id: "mock-9", title: "Khao Yai nature hike", location: "Nakhon Ratchasima – Khao Yai", rate: 900, provider: ["Sam", "R.", 4.9], gender: "O", age: 38, categories: ["Nature & hiking", "Photography"], reviewCount: 7 },
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
