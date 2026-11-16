import { io } from "socket.io-client";
import { OpenAPI } from "./generated";

// In production the REST API is reached through this site's own /api (a Vercel
// rewrite), so the login cookie is first-party. Vercel can't proxy WebSockets,
// so the socket goes straight to the API host (VITE_SOCKET_URL) and proves who
// the user is with a short-lived token fetched through /api.
function socketUrl() {
    if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
    return new URL(OpenAPI.BASE, window.location.origin).href.replace(/\/api\/?$/, "");
}

function fetchSocketAuth(cb) {
    fetch(`${OpenAPI.BASE.replace(/\/$/, "")}/auth/socket-token`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : {}))
        .then(({ token }) => cb(token ? { token } : {}))
        .catch(() => cb({}));
}

// Read the URL at connect time, after api.js configures OpenAPI.BASE.
export function connectSocket() {
    return io(socketUrl(), {
        withCredentials: true,
        // Called again on every reconnect, so an expired token is replaced.
        auth: fetchSocketAuth,
        transports: ["websocket", "polling"],
    });
}
