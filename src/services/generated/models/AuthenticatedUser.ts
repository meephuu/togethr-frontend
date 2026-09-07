/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthUser } from './AuthUser';
import type { UserRole } from './UserRole';
export type AuthenticatedUser = (AuthUser & {
    role: UserRole;
});

