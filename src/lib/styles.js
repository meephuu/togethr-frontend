// Shared class strings so new pages match ProfileEditPage. Errors use red-600
// rather than red-500: red-500 on white is below the 4.5:1 contrast minimum.

export const CARD_CLASS = "rounded-2xl border border-gray-100 bg-white shadow-sm";

export const LABEL_CLASS = "block text-sm font-medium text-text-main mb-2";

export const ERROR_TEXT_CLASS = "mt-1 text-xs text-red-600";

export const HELPER_TEXT_CLASS = "mt-1.5 text-xs text-text-muted";

export function inputClass(hasError, padding = "px-4") {
    return `w-full ${padding} py-2.5 rounded-lg border bg-white text-sm text-text-main focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
        hasError ? "border-red-600 focus:ring-red-600" : "border-gray-200 focus:ring-primary"
    }`;
}
