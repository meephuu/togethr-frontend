/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Complaint } from '../models/Complaint';
import type { ComplaintCategory } from '../models/ComplaintCategory';
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
}
