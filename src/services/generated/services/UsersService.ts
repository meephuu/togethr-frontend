/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddProviderProfileRequest } from '../models/AddProviderProfileRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { ProfilePhotoResponse } from '../models/ProfilePhotoResponse';
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
     * Add a provider profile to the signed-in account
     * Lets an existing account also become a provider, instead of registering a second account.
     * @returns LoginResponse Provider profile added
     * @throws ApiError
     */
    public static addProviderProfile({
        requestBody,
    }: {
        requestBody: AddProviderProfileRequest,
    }): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/me/provider',
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
     * Set or replace the signed-in user's profile photo
     * Customers and providers alike. JPG or PNG, at most 5 MB. The previous photo is deleted.
     * @returns ProfilePhotoResponse Photo saved
     * @throws ApiError
     */
    public static uploadMyPhoto({
        formData,
    }: {
        formData: {
            photo: Blob;
        },
    }): CancelablePromise<ProfilePhotoResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/me/photo',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid request`,
                401: `Authentication failed or is required`,
                404: `Resource not found`,
                500: `Unexpected server error`,
            },
        });
    }
    /**
     * Remove the signed-in user's profile photo
     * @returns ProfilePhotoResponse Photo removed (profilePhotoUrl is null)
     * @throws ApiError
     */
    public static deleteMyPhoto(): CancelablePromise<ProfilePhotoResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/me/photo',
            errors: {
                401: `Authentication failed or is required`,
                404: `Resource not found`,
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
