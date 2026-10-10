// JPG or PNG, at most 5 MB: the rule for cover photos and profile photos alike
// (the backend checks the same).

export const IMAGE_ACCEPT = "image/jpeg,image/png";
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_ERRORS = {
    type: "Use a JPG or PNG file",
    size: "Photo must be 5 MB or smaller",
};

const ALLOWED_TYPES = ["image/jpeg", "image/png"];

// Some systems report an empty MIME type, so fall back to the extension.
function isJpegOrPng(file) {
    if (file.type) return ALLOWED_TYPES.includes(file.type);
    return /\.(jpe?g|png)$/i.test(file.name);
}

/** Returns an error message for a picked image, or null if it's usable. */
export function checkImageFile(file) {
    if (!isJpegOrPng(file)) return IMAGE_ERRORS.type;
    if (file.size > IMAGE_MAX_BYTES) return IMAGE_ERRORS.size;
    return null;
}
