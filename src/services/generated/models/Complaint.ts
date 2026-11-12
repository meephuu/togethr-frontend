/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComplaintCategory } from './ComplaintCategory';
export type Complaint = {
    id: string;
    bookingId: string;
    category: ComplaintCategory;
    subject: string;
    description: string;
    status: Complaint.status;
    createdAt: string;
    updatedAt: string;
    attachments: Array<{
        id: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
    }>;
};
export namespace Complaint {
    export enum status {
        PENDING = 'PENDING',
    }
}

