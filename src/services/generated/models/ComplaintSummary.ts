/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComplaintCategory } from './ComplaintCategory';
import type { ComplaintStatus } from './ComplaintStatus';
export type ComplaintSummary = {
    id: string;
    bookingId: string;
    category: ComplaintCategory;
    subject: string;
    status: ComplaintStatus;
    createdAt: string;
    booking: {
        service: {
            title: string;
        };
    };
};

