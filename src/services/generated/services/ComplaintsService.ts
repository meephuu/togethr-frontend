/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Complaint } from '../models/Complaint';
import type { ComplaintCategory } from '../models/ComplaintCategory';
import type { ComplaintDetails } from '../models/ComplaintDetails';
import type { ComplaintStatus } from '../models/ComplaintStatus';
import type { ComplaintSummary } from '../models/ComplaintSummary';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplaintsService {
    /**
     * Submit a complaint about the signed-in customer's booking
     * @returns any Complaint submitted
     * @throws ApiError
     */
    public static submitComplaint({
        formData,
    }: {
        formData: {
            bookingId: string;
            category: ComplaintCategory;
            subject: string;
            description: string;
            /**
             * Nonempty JPG, PNG, or PDF files, up to 10 MiB each.
             */
            attachments?: Array<Blob>;
        },
    }): CancelablePromise<{
        complaint: Complaint;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/complaints',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid request`,
                401: `Authentication failed or is required`,
                403: `The booking belongs to another customer`,
                404: `Resource not found`,
                413: `An attachment exceeds 10 MiB`,
                415: `Request content type must be multipart/form-data`,
                500: `Unexpected server error`,
            },
        });
    }
    /**
     * @returns any Complaint list
     * @throws ApiError
     */
    public static listMyComplaints(): CancelablePromise<{
        complaints: Array<ComplaintSummary>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/complaints/me',
        });
    }
    /**
     * @returns any Complaint list
     * @throws ApiError
     */
    public static listAdminComplaints(): CancelablePromise<{
        complaints: Array<ComplaintSummary>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/complaints/admin',
        });
    }
    /**
     * @returns any Complaint details
     * @throws ApiError
     */
    public static getMyComplaint({
        id,
    }: {
        id: string,
    }): CancelablePromise<{
        complaint: ComplaintDetails;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/complaints/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any Complaint details
     * @throws ApiError
     */
    public static getAdminComplaint({
        id,
    }: {
        id: string,
    }): CancelablePromise<{
        complaint: ComplaintDetails;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/complaints/admin/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any Complaint updated
     * @throws ApiError
     */
    public static updateAdminComplaint({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            expectedStatus: ComplaintStatus;
            expectedUpdatedAt: string;
            status: ComplaintStatus;
            adminReply: string;
        },
    }): CancelablePromise<{
        complaint: ComplaintDetails;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/complaints/admin/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Complaint was changed by another reviewer`,
            },
        });
    }
}
