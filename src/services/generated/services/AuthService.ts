/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ForgotPasswordRequest } from '../models/ForgotPasswordRequest';
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { LogoutResponse } from '../models/LogoutResponse';
import type { MessageResponse } from '../models/MessageResponse';
import type { RegisterProviderRequest } from '../models/RegisterProviderRequest';
import type { RegisterProviderResponse } from '../models/RegisterProviderResponse';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { RegisterResponse } from '../models/RegisterResponse';
import type { ResetPasswordRequest } from '../models/ResetPasswordRequest';
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
    /**
     * Email a password reset link
     * Emails a one-time reset link (valid for 15 minutes) to a registered
     * account. Always answers 200 with the same message, whether or not the
     * email is registered.
     *
     * @returns MessageResponse Request accepted
     * @throws ApiError
     */
    public static forgotPassword({
        requestBody,
    }: {
        requestBody: ForgotPasswordRequest,
    }): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                500: `Unexpected server error`,
            },
        });
    }
    /**
     * Set a new password with a reset token
     * The token comes from the emailed link and works once. An unknown,
     * expired or used token returns 400 and the password is not changed.
     *
     * @returns MessageResponse Password updated
     * @throws ApiError
     */
    public static resetPassword({
        requestBody,
    }: {
        requestBody: ResetPasswordRequest,
    }): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                500: `Unexpected server error`,
            },
        });
    }
}
