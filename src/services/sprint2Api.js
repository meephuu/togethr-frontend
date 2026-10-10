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
