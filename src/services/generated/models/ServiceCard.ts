/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One service as GET /api/services/search returns it.
 */
export type ServiceCard = {
    id: string;
    title: string;
    location: string;
    rate: number;
    rateUnit: string | null;
    coverPhotoUrl: string | null;
    provider: {
        id: string;
        firstname: string;
        lastname: string;
        profilePhotoUrl: string | null;
        avgRating: number | null;
    };
    reviewCount: number;
};

