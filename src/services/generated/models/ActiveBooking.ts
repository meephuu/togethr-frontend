/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ActiveBooking = {
    id: string;
    /**
     * WAITING_FOR_CONFIRMATION or CONFIRMED (IN_PROGRESS once US6-5 adds it)
     */
    bookingStatus: string;
    appointmentDate: string;
    service: {
        title: string;
    };
};

