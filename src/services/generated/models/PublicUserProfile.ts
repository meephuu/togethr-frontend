/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicProviderProfile } from './PublicProviderProfile';
import type { PublicReview } from './PublicReview';
import type { ServiceCard } from './ServiceCard';
/**
 * Public fields only. email, gender, bdate, phoneNumber, bankAccount and the provider's idCard and emergency contact are never returned. reviews and services are present only when the user is a provider.
 */
export type PublicUserProfile = {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    /**
     * Path on the API server, e.g. /uploads/profile-photos/abc.jpg (null when none).
     */
    profilePhotoUrl?: string | null;
    instagram?: string | null;
    line?: string | null;
    facebook?: string | null;
    provider?: PublicProviderProfile | null;
    /**
     * Reviews on all of the provider's services, newest first. Providers only.
     */
    reviews?: Array<PublicReview>;
    /**
     * The provider's published services, in the search result shape. Providers only.
     */
    services?: Array<ServiceCard>;
};

