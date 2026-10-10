/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuthUser = {
    id: string;
    username: string;
    email: string | null;
    firstname: string;
    lastname: string;
    /**
     * Path on the API server, e.g. /uploads/profile-photos/abc.jpg (null when none).
     */
    profilePhotoUrl?: string | null;
};

