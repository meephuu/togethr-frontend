/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { LogoutResponse } from '../models/LogoutResponse';
import type { RegisterProviderRequest } from '../models/RegisterProviderRequest';
import type { RegisterProviderResponse } from '../models/RegisterProviderResponse';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { RegisterResponse } from '../models/RegisterResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a customer account
     * @returns RegisterResponse Customer account created
     * @throws ApiError
     */
    public static register({
        requestBody,
    }: {
        requestBody: RegisterRequest,
    }): CancelablePromise<RegisterResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                409: `Resource already exists`,
                500: `Unexpected server error`,
            },
        });
    }
    /**
     * Register a provider account
     * @returns RegisterProviderResponse Provider account created
     * @throws ApiError
     */
    public static registerProvider({
        requestBody,
    }: {
        requestBody: RegisterProviderRequest,
    }): CancelablePromise<RegisterProviderResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register/provider',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                409: `Resource already exists`,
                500: `Unexpected server error`,
            },
        });
    }
    /**
     * Log in with an email and password
     * Sets an HttpOnly `token` cookie when authentication succeeds.
     * @returns LoginResponse Login successful
     * @throws ApiError
     */
    public static login({
        requestBody,
    }: {
        requestBody: LoginRequest,
    }): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Authentication failed or is required`,
                500: `Unexpected server error`,
            },
        });
    }
    /**
     * Log out and clear the session cookie
     * @returns LogoutResponse Logged out
     * @throws ApiError
     */
    public static logout(): CancelablePromise<LogoutResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
            errors: {
                500: `Unexpected server error`,
            },
        });
    }
}
