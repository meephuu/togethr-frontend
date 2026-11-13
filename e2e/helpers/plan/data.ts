// Test data from the test plan (section 1.3 and the test case inputs).

export const SOMCHAI_REGISTRATION = {
  username: 'somchai',
  email: 'somchai@gmail.com',
  password: 'Travel@2026',
  firstname: 'Somchai',
  lastname: 'Jaidee',
  phoneNumber: '0812345678',
  gender: 'M',
  consent: true,
};

export const SOMSRI_REGISTRATION = {
  username: 'somsri',
  email: 'somsri@gmail.com',
  password: 'Guide@2026',
  firstname: 'Somsri',
  lastname: 'Rakthai',
  idCard: '1103700123456',
  languages: 'Thai, English',
  emergencyContactName: 'Mana Rakthai',
  emergencyContactPhone: '0898765432',
  consent: true,
};

export const SERVICE_TITLE = 'Chiang Mai Old Town Walk';

/** In-app notification / email text for a status change of a booking on `date`. */
export const statusMessage = {
  customer: (date: string, wording: string) => `Your booking for "${SERVICE_TITLE}" on ${date} ${wording}.`,
  provider: (date: string, wording: string) => `The booking for "${SERVICE_TITLE}" on ${date} ${wording}.`,
};

export const MSG = {
  requiredFields: 'username, email, password, firstname, and lastname are required',
  consentRequired: 'consent to the privacy policy is required to register',
  emailInvalid: 'email must be a valid email address',
  passwordShort: 'password must be at least 8 characters',
  phoneInvalid: 'phoneNumber must be 10 digits starting with 0',
  genderInvalid: 'gender must be M, F, or O',
  usernameTaken: 'username already taken',
  emailTaken: 'email already taken',
  idCardRequired: 'idCard is required for provider registration',
  idCardInvalid: 'idCard must be exactly 13 digits',
  emergencyPhoneInvalid: 'emergencyContactPhone must be 10 digits starting with 0',
  invalidLogin: 'invalid email or password',
  loginRequired: 'a username or email, and a password, are required',
  lockedNow: 'invalid email or password; the account is locked for 15 minutes',
  stillLocked: 'this account is temporarily locked; try again later',
  resetLinkSent: 'if that email is registered, a reset link has been sent',
  emailRequired: 'email is required',
  passwordUpdated: 'password updated',
  resetLinkInvalid: 'this reset link is invalid or has expired',
  noToken: 'Access denied. No token provided.',
  badToken: 'Invalid or expired token',
  serviceIdRequired: 'serviceId is required',
  serviceNotFound: 'Service not found.',
  serviceUnavailable: 'This service is no longer available.',
  ownService: 'You cannot book your own service.',
  slotUnavailable: 'This time slot is not available',
  dateFormat: 'appointmentDate must be a date in YYYY-MM-DD format',
  durationInvalid: 'duration must be a positive integer',
  statusInvalid: 'status must be CONFIRMED or REJECTED',
  providerOnly: 'Only the service provider can change the booking status.',
  bookingNotFound: 'Booking not found.',
  requestExpired: 'This request has expired',
  notWaiting: 'Only a booking waiting for confirmation can be confirmed or rejected.',
  notificationNotFound: 'Notification not found.',
  customerOnlyCancel: 'Only the customer who made the booking can cancel it.',
  onlyConfirmedCancel: 'Only a confirmed booking can be cancelled.',
  alreadyStarted: 'This booking has already started and can no longer be cancelled.',
};

/** Ids the plan says do not exist (ids are plain text, so these never match a row). */
export const MISSING = { service: 'SV-999', slot: 'SL-999', booking: 'BK-9999' };

export const BOOKING_EMAIL_SUBJECT = 'Your booking status has changed';
export const RESET_EMAIL_SUBJECT = 'Reset your Togethr password';

/** How long to wait before concluding that no email was sent. */
export const NO_EMAIL_WAIT_MS = 3_000;
