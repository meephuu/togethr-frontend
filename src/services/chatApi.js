// Booking chat (US7-1): history over REST, live messages over Socket.IO.
// Always talks to the real backend, even with VITE_USE_MOCKS=true, because
// a chat needs a real booking id and a second person on the other end.

import { connectSocket } from "./socket";
import { OpenAPI } from "./generated";
import { request } from "./generated/core/request";

export { ApiError } from "./generated";

/**
 * Chat history for one booking, oldest first.
 * GET /api/bookings/:id/messages
 * - 200 { booking, role, otherParty, messages }
 * - 403 for anyone but the booking's customer and provider, or before it's confirmed
 * - 404 when the booking doesn't exist
 * @param {string} bookingId
 */
export function getBookingMessages(bookingId) {
    return request(OpenAPI, {
        method: "GET",
        url: "/bookings/{id}/messages",
        path: { id: bookingId },
    });
}

export function sendBookingPhoto(bookingId, image, content = "") {
    return request(OpenAPI, {
        method: "POST",
        url: "/bookings/{id}/messages/image",
        path: { id: bookingId },
        formData: { image, content },
    });
}

/**
 * Opens a socket authenticated by the login cookie. Call `.disconnect()` when done.
 * Events: emit "chat:join" { bookingId } and "chat:message" { bookingId, content },
 * both with an ack callback ({ ok, error?, message? }); listen to "chat:message".
 */
export function connectChat() {
    return connectSocket();
}

/** Emits and resolves with the server's ack, or a timeout error after 8 s. */
export function emitWithAck(socket, event, payload) {
    return socket
        .timeout(8000)
        .emitWithAck(event, payload)
        .catch(() => ({ ok: false, error: "The server didn't answer. Check your connection." }));
}
