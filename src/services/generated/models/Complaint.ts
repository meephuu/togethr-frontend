/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComplaintCategory } from './ComplaintCategory';
import type { ComplaintStatus } from './ComplaintStatus';
export type Complaint = {
    id: string;
    bookingId: string;
    category: ComplaintCategory;
    subject: string;
    description: string;
    status: ComplaintStatus;
    createdAt: string;
    updatedAt: string;
    attachments: Array<{
        id: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
    }>;
};

