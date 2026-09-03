/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Gender } from './Gender';
export type BaseRegistrationFields = {
    /**
     * Must be true — confirms the user has read and agreed to the Privacy Policy.
     */
    consent: boolean;
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    gender?: Gender;
    bdate?: string;
    bankAccount?: string;
    phoneNumber?: string;
    instagram?: string;
    line?: string;
    facebook?: string;
};

