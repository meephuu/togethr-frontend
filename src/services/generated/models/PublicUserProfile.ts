/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthUser } from './AuthUser';
import type { Gender } from './Gender';
import type { PublicProviderProfile } from './PublicProviderProfile';
export type PublicUserProfile = (AuthUser & {
    gender?: Gender | null;
    instagram?: string | null;
    line?: string | null;
    facebook?: string | null;
    provider?: PublicProviderProfile | null;
});

