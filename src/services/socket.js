import { io } from "socket.io-client";
import { OpenAPI } from "./generated";

// Read the URL at connect time, after api.js configures OpenAPI.BASE.
export function connectSocket() {
    return io(OpenAPI.BASE.replace(/\/api\/?$/, ""), {
        withCredentials: true,
        transports: ["websocket", "polling"],
    });
}
