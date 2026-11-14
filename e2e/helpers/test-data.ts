// Test data from the Togethr test plan.

/** Customer somchai, registered by TC01. TC31 changes the password to NEW_PASSWORD. */
export const SOMCHAI = {
  username: 'somchai',
  email: 'somchai@gmail.com',
  password: 'Travel@2026',
  firstname: 'Somchai',
  lastname: 'Jaidee',
  phoneNumber: '0812345678',
  gender: 'M',
} as const;

export const WRONG_PASSWORD = 'Travel@2025'; // TC20
export const NEW_PASSWORD = 'NewTravel@2026'; // TC31
export const UNKNOWN_EMAIL = 'unknown@gmail.com'; // TC28
export const INVALID_EMAIL = 'somchai.gmail.com'; // TC30

// Expected server messages, character for character.
export const MSG = {
  invalidCredentials: 'invalid email or password',
  resetLinkSent: 'if that email is registered, a reset link has been sent',
  emailRequired: 'email is required',
  emailInvalid: 'email must be a valid email address',
  passwordUpdated: 'password updated',
} as const;
