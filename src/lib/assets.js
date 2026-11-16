import { OpenAPI } from "../services/generated";

// Files the API serves (e.g. /uploads/profile-photos/abc.jpg) live on the API
// server, not on the frontend's origin, so resolve them against its base URL:
// "http://localhost:8081/api" + "/uploads/x.jpg" -> "http://localhost:8081/uploads/x.jpg".
// A relative base ("/api", production behind the Vercel rewrite) resolves
// against this site's origin.
export function assetUrl(path) {
    if (!path) return null;
    return new URL(path, new URL(OpenAPI.BASE, window.location.origin)).href;
}
