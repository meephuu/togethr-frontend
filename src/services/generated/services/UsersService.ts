/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileResponse } from '../models/ProfileResponse';
import type { PublicProfileResponse } from '../models/PublicProfileResponse';
import type { UpdateProfileRequest } from '../models/UpdateProfileRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get the authenticated user's full profile
     * @returns ProfileResponse Profile
     * @throws ApiError
     */
    public static getMyProfile(): CancelablePromise<ProfileResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me',
            errors: {
                401: `Authentication failed or is required`,
                404: `Resource not found`,
                500: `Unexpected server error`,
            },
        });
    }
    /**
     * Update the authenticated user's profile
     * @returns ProfileResponse Profile updated
     * @throws ApiError
     */
    public static updateMyProfile({
        requestBody,
    }: {
        requestBody: UpdateProfileRequest,
    }): CancelablePromise<ProfileResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Authentication failed or is required`,
                404: `Resource not found`,
                409: `Resource already exists`,
                500: `Unexpected server error`,
            },
        });
    }
    /**
     * Get a user's public profile
     * @returns PublicProfileResponse Public profile
     * @throws ApiError
     */
    public static getPublicProfile({
        id,
    }: {
        id: string,
    }): CancelablePromise<PublicProfileResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Resource not found`,
                500: `Unexpected server error`,
            },
        });
    }
}
