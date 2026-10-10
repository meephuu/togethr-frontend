// Client-side rules for the create-service form (US4-1). The server repeats
// them, so 400 responses are mapped back onto the same messages.

import { IMAGE_ACCEPT, checkImageFile } from "./imageFile";

export const TITLE_MAX_LENGTH = 150;
export const LOCATION_MAX_LENGTH = 200;
export const COVER_PHOTO_ACCEPT = IMAGE_ACCEPT;

export const SERVICE_ERRORS = {
    coverPhoto: "Add a cover photo",
    title: "Service title is required",
    location: "Meeting area is required",
    rate: "Rate must be more than 0",
    startTime: "Add a start time",
    endTime: "Add an end time",
    timeOrder: "End time must be after the start time",
};

// Fields the form can highlight. Errors for anything else can't be shown next
// to a field, so they aren't counted as "highlighted fields".
export const SERVICE_FORM_FIELDS = [
    "coverPhoto",
    "title",
    "categoryIds",
    "description",
    "location",
    "rate",
    "rateUnit",
    "startTime",
    "endTime",
];

/** Returns an error message for a picked cover photo, or null if it's usable. */
export const checkCoverPhotoFile = checkImageFile;

// "HH:MM" strings compare correctly as text.
function isEndAfterStart(startTime, endTime) {
    return Boolean(startTime && endTime && endTime > startTime);
}

function isRatePositive(rate) {
    return Number(rate) > 0;
}

/** Returns { field: message } for every field that fails; empty when valid. */
export function validateService(values) {
    const errors = {};

    if (!values.coverPhoto) errors.coverPhoto = SERVICE_ERRORS.coverPhoto;
    if (!values.title.trim()) errors.title = SERVICE_ERRORS.title;
    if (!values.location.trim()) errors.location = SERVICE_ERRORS.location;
    if (!isRatePositive(values.rate)) errors.rate = SERVICE_ERRORS.rate;
    if (!values.startTime) errors.startTime = SERVICE_ERRORS.startTime;

    if (!values.endTime) {
        errors.endTime = SERVICE_ERRORS.endTime;
    } else if (values.startTime && !isEndAfterStart(values.startTime, values.endTime)) {
        errors.endTime = SERVICE_ERRORS.timeOrder;
    }

    return errors;
}

/** The "Ready to publish" checklist, in the order the design shows it. */
export function getPublishChecklist(values) {
    return [
        { key: "coverPhoto", label: "Cover photo added", done: Boolean(values.coverPhoto) },
        { key: "title", label: "Title and description", done: values.title.trim() !== "" },
        { key: "rate", label: "Rate is more than 0", done: isRatePositive(values.rate) },
        {
            key: "time",
            label: "End time is after start time",
            done: isEndAfterStart(values.startTime, values.endTime),
        },
    ];
}

const SERVER_MESSAGE_OVERRIDES = {
    coverPhoto: SERVICE_ERRORS.coverPhoto,
    title: SERVICE_ERRORS.title,
    location: SERVICE_ERRORS.location,
    rate: SERVICE_ERRORS.rate,
    endTime: SERVICE_ERRORS.timeOrder,
};

/**
 * Maps a 400 body's `errors` ({ field: message }) onto the form's own messages,
 * keeping only fields the form can highlight. Fields without a client-side
 * message keep the server's wording.
 */
export function mapServerErrors(apiErrors) {
    const mapped = {};
    for (const [apiField, message] of Object.entries(apiErrors ?? {})) {
        // The API names the photo by its stored URL; the form by the file.
        const field = apiField === "coverPhotoUrl" ? "coverPhoto" : apiField;
        if (!SERVICE_FORM_FIELDS.includes(field)) continue;
        mapped[field] = SERVER_MESSAGE_OVERRIDES[field] ?? String(message);
    }
    return mapped;
}
