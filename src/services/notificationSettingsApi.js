import { OpenAPI } from "./generated";
import { request } from "./generated/core/request";

// Preferences always persist through the API, even when notification demo data is on.
export function getNotificationSettings() {
    return request(OpenAPI, { method: "GET", url: "/notifications/settings" });
}

export function updateNotificationSettings(emailNotificationsEnabled) {
    return request(OpenAPI, {
        method: "PATCH", url: "/notifications/settings",
        body: { emailNotificationsEnabled }, mediaType: "application/json",
    });
}
