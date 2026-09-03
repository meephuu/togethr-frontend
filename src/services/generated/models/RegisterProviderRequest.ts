/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseRegistrationFields } from './BaseRegistrationFields';
export type RegisterProviderRequest = (BaseRegistrationFields & {
    idCard: string;
    bio?: string;
    languages?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
});

