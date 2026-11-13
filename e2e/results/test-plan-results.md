# Test plan results

Run 2026-11-13T06:32:55.210Z against http://localhost:5183 (frontend), http://localhost:8091/api (API), database `deawkoykid_tmp_20261113133214`.

**70 of 71 passed.**

P = the actual output matches the expected output exactly; F = it does not.

| TC ID | Actual output | P/F |
|---|---|---|
| TC01 | 201; body.user has id, username "somchai", email "somchai@gmail.com" (no password); users.consentAt set; customer row created; UI shows “Registration successful” | P |
| TC02 | 400 “username, email, password, firstname, and lastname are required”; no user created | P |
| TC03 | 400 “consent to the privacy policy is required to register”; no user created | P |
| TC04 | 400 “email must be a valid email address” | P |
| TC05 | 400 “password must be at least 8 characters” | P |
| TC06 | 400 “phoneNumber must be 10 digits starting with 0” | P |
| TC07 | 400 “gender must be M, F, or O” | P |
| TC08 | 409 “username already taken” | P |
| TC09 | 409 “email already taken” | P |
| TC10 | 201; body.user.provider includes idCard "1103700123456" and languages "Thai, English"; provider and customer rows created (login returns roles CUSTOMER, PROVIDER) | P |
| TC11 | 400 “idCard is required for provider registration” | P |
| TC12 | 400 “idCard must be exactly 13 digits” | P |
| TC13 | 400 “idCard must be exactly 13 digits” | P |
| TC14 | 400 “emergencyContactPhone must be 10 digits starting with 0” | P |
| TC15 | 400 “consent to the privacy policy is required to register” | P |
| TC16 | 409 “email already taken” | P |
| TC17 | 200; Set-Cookie token (HttpOnly, Max-Age 1800); body.user.roles ["CUSTOMER"]; UI redirects to /customer/dashboard | P |
| TC18 | 200; body.user.roles ["CUSTOMER", "PROVIDER"] | P |
| TC19 | 200; same user as TC17 (email normalised) | P |
| TC20 | 401 “invalid email or password”; no cookie set | P |
| TC21 | 401 “invalid email or password” | P |
| TC22 | 400 “a username or email, and a password, are required” | P |
| TC23 | 400 “a username or email, and a password, are required” | P |
| TC24 | 400 “email must be a valid email address” | P |
| TC25 | 401 “invalid email or password” | P |
| TC26 | Attempts 1–4: 401 “invalid email or password”; Attempt 5: 423 “invalid email or password; the account is locked for 15 minutes”; Attempt 6 (correct password): 423 “this account is temporarily locked; try again later”; no cookie set | P |
| TC27 | 200 “if that email is registered, a reset link has been sent”; email with reset link delivered; token row expires 15 min later | P |
| TC28 | 200 “if that email is registered, a reset link has been sent”; no email sent; no token row | P |
| TC29 | 400 “email is required” | P |
| TC30 | 400 “email must be a valid email address” | P |
| TC31 | 200 “password updated”; login with "NewTravel@2026" → 200, with "Travel@2026" → 401 | P |
| TC32 | 400 “this reset link is invalid or has expired”; nida can still log in with "Nida@2026" | P |
| TC33 | 400 “this reset link is invalid or has expired” | P |
| TC34 | 400 “this reset link is invalid or has expired” | P |
| TC35 | 400 “password must be at least 8 characters”; T3 still usable | P |
| TC36 | 201; booking.bookingStatus "WAITING_FOR_CONFIRMATION", appointmentDate "2026-11-20", startTime "09:00", endTime "12:00", totalPrice 1500 (3 h × 500 THB); somsri gets NEW_BOOKING_REQUEST notification | P |
| TC37 | 201; status "WAITING_FOR_CONFIRMATION", duration 3 | P |
| TC38 | 401 “Access denied. No token provided.” | P |
| TC39 | 401 “Invalid or expired token” | P |
| TC40 | 400 “serviceId is required” | P |
| TC41 | 404 “Service not found.” | P |
| TC42 | 410 “This service is no longer available.” | P |
| TC43 | 400 “You cannot book your own service.” | P |
| TC44 | 409 “This time slot is not available”; no booking and no notification created | P |
| TC45 | 409 “This time slot is not available”; no booking created | P |
| TC46 | 400 “This time slot is not available” | P |
| TC47 | 400 “appointmentDate must be a date in YYYY-MM-DD format” (both) | P |
| TC48 | 400 “duration must be a positive integer” | P |
| TC49 | 200; booking.bookingStatus "CONFIRMED" | P |
| TC50 | 200; booking.bookingStatus "REJECTED" | P |
| TC51 | 400 “status must be CONFIRMED or REJECTED” | P |
| TC52 | 403 “Only the service provider can change the booking status.” | P |
| TC53 | 404 “Booking not found.” | P |
| TC54 | 409 “This request has expired”; status saved as "EXPIRED" | P |
| TC55 | 409 “Only a booking waiting for confirmation can be confirmed or rejected.” | P |
| TC56 | 200; newest item type "BOOKING_EXPIRED", message “Your booking for "Chiang Mai Old Town Walk" on 2026-12-02 expired without a response.”, isRead false; somchai@gmail.com receives an email “Your booking status has changed” containing the same message; somsri (the actor) gets no BOOKING_CONFIRMED | F |
| TC57 | 200; contains type "BOOKING_REJECTED" with “Your booking for "Chiang Mai Old Town Walk" on 2026-12-04 was rejected.” | P |
| TC58 | somchai gets type "BOOKING_EXPIRED" “Your booking for "Chiang Mai Old Town Walk" on 2026-12-02 expired without a response.”; somsri gets type "BOOKING_EXPIRED" “The booking for "Chiang Mai Old Town Walk" on 2026-12-02 expired without a response.” | P |
| TC59 | somsri receives "BOOKING_CANCELLED" “The booking for "Chiang Mai Old Town Walk" on 2026-11-25 was cancelled.”; somchai (the actor) receives none | P |
| TC60 | 200 on the PATCH; notification count unchanged (no duplicate) | P |
| TC61 | 401 “Access denied. No token provided.” | P |
| TC62 | 200 { notification: { isRead: true } }; unread badge decreases by 1 | P |
| TC63 | 404 “Notification not found.” | P |
| TC64 | 200 { emailNotificationsEnabled: false } on the settings update and 200 on the status update; somchai has a new BOOKING_CONFIRMED item “Your booking for "Chiang Mai Old Town Walk" on 2026-12-05 was confirmed.”; no email is sent to somchai@gmail.com | P |
| TC65 | 200; booking.bookingStatus "CANCELLED"; slot SL-02 bookable again; GET /api/bookings/me lists BK-1003 under past | P |
| TC66 | 403 “Only the customer who made the booking can cancel it.” | P |
| TC67 | 401 “Access denied. No token provided.” | P |
| TC68 | 409 “Only a confirmed booking can be cancelled.” | P |
| TC69 | 200; status "CANCELLED"; no extra notification | P |
| TC70 | 404 “Booking not found.” | P |
| TC71 | 409 “This booking has already started and can no longer be cancelled.”; status stays "CONFIRMED" | P |

## Coverage matrix

- US1-1 (TC01–TC09): P, P, P, P, P, P, P, P, P
- US1-2 (TC10–TC16): P, P, P, P, P, P, P
- US1-3 (TC17–TC26): P, P, P, P, P, P, P, P, P, P
- US1-5 (TC27–TC35): P, P, P, P, P, P, P, P, P
- US6-1 (TC36–TC48): P, P, P, P, P, P, P, P, P, P, P, P, P
- US6-2 (TC49–TC55): P, P, P, P, P, P, P
- US6-3 (TC56–TC64): F, P, P, P, P, P, P, P, P
- US6-4 (TC65–TC71): P, P, P, P, P, P, P
