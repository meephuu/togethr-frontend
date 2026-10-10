// Every Sprint 2 call the provider pages make, in one place. The endpoints aren't
// built yet and the contracts below are proposals to confirm with the team.
// Set VITE_USE_MOCKS=true to use sprint2Mocks.js instead of the backend.
//
// Errors: an HTTP error rejects with ApiError (check `.status` and `.body`);
// a network failure rejects with a plain Error. Same as the generated client.

import { ApiError, OpenAPI, UsersService } from "./generated";
import { request } from "./generated/core/request";
import * as mocks from "./sprint2Mocks";

export { ApiError };

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// Provider.status defaults to "PENDING" and no approved value exists anywhere
// yet. "APPROVED" is a guess: confirm the exact string with the team.
export const APPROVED_PROVIDER_STATUS = "APPROVED";

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
 * Service categories for the create-service chips.
 * Proposed: GET /api/categories → [{ id, category }] (the Prisma column name).
 * @returns {Promise<Category[]>}
 */
export async function getCategories() {
    if (USE_MOCKS) return mocks.getCategories();
    const res = await request(OpenAPI, { method: "GET", url: "/categories" });
    const rows = res.categories || res;
    return rows.map((row) => ({ id: row.id, name: row.category ?? row.name }));
}

/**
 * The signed-in provider's approval status, e.g. "PENDING" or "APPROVED".
 * The login user has no status field, so this reads GET /api/users/me and
 * expects `user.provider.status`, which the backend doesn't return yet.
 * @returns {Promise<string|null>} null when the backend sends no status
 */
export async function getMyProviderStatus() {
    if (USE_MOCKS) return mocks.getMyProviderStatus();
    const { user } = await UsersService.getMyProfile();
    return user.provider?.status ?? null;
}

/**
 * The signed-in provider's services, published and unpublished, for My services
 * (US4-4). No pagination: a provider rarely has more than a handful.
 * Proposed: GET /api/providers/me/services → Service[] (an empty array, not an
 * error, when the provider has none). Field names to confirm with Mee.
 * @returns {Promise<Service[]>}
 */
export async function getMyServices() {
    if (USE_MOCKS) return mocks.getMyServices();
    return request(OpenAPI, { method: "GET", url: "/providers/me/services" });
}

/**
 * Publishes a service.
 * Proposed: POST /api/services as multipart/form-data. categoryIds is sent as a
 * repeated `categoryIds` field.
 * - 201 { service }
 * - 400 { errors: { field: message } }
 * - 403 when the provider isn't approved
 * @param {NewService} values
 * @returns {Promise<{ service: Service }>}
 */
export async function createService(values) {
    if (USE_MOCKS) return mocks.createService(values);
    return request(OpenAPI, {
        method: "POST",
        url: "/services",
        formData: {
            title: values.title,
            description: values.description,
            location: values.location,
            rate: String(values.rate),
            rateUnit: values.rateUnit,
            startTime: values.startTime,
            endTime: values.endTime,
            categoryIds: values.categoryIds,
            coverPhoto: values.coverPhoto,
        },
    });
}

/**
 * Searches for services.
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
