/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthUser } from './AuthUser';
import type { Gender } from './Gender';
import type { ProviderProfile } from './ProviderProfile';
export type UserProfile = (AuthUser & {
    gender?: Gender | null;
    bdate?: string | null;
    bankAccount?: string | null;
    phoneNumber?: string | null;
    instagram?: string | null;
    line?: string | null;
    facebook?: string | null;
    provider?: ProviderProfile | null;
});

