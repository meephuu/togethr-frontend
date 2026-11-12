// Booking chat (US7-1): history over REST, live messages over Socket.IO.
// Always talks to the real backend, even with VITE_USE_MOCKS=true, because
// a chat needs a real booking id and a second person on the other end.

import { io } from "socket.io-client";
import { OpenAPI } from "./generated";
import { request } from "./generated/core/request";

export { ApiError } from "./generated";

// The socket lives on the API server's origin, without the /api prefix. Read
// at connect time: api.js sets OpenAPI.BASE after this module may have loaded.
const socketUrl = () => OpenAPI.BASE.replace(/\/api\/?$/, "");

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

/**
 * Opens a socket authenticated by the login cookie. Call `.disconnect()` when done.
 * Events: emit "chat:join" { bookingId } and "chat:message" { bookingId, content },
 * both with an ack callback ({ ok, error?, message? }); listen to "chat:message".
 */
export function connectChat() {
    return io(socketUrl(), { withCredentials: true, transports: ["websocket", "polling"] });
}

/** Emits and resolves with the server's ack, or a timeout error after 8 s. */
export function emitWithAck(socket, event, payload) {
    return socket
        .timeout(8000)
        .emitWithAck(event, payload)
        .catch(() => ({ ok: false, error: "The server didn't answer. Check your connection." }));
}

export const CHAT_PHOTO_TYPES = ["image/jpeg", "image/png"];
export const CHAT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Sends a photo, with an optional caption, to the booking chat (US7-2).
 * POST /api/bookings/:id/messages/photo (multipart: photo, content?)
 * - 201 { message }, also pushed live to both sides as "chat:message"
 * - 413 over 5 MB; 415 not a JPG/PNG; 403 not part of a confirmed booking
 * @param {string} bookingId
 * @param {File} photo
 * @param {string} [content]
 */
export function sendChatPhoto(bookingId, photo, content = "") {
    return request(OpenAPI, {
        method: "POST",
        url: "/bookings/{id}/messages/photo",
        path: { id: bookingId },
        formData: content ? { photo, content } : { photo },
    });
}
