import { useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "cookieConsent";
const CONSENT_DURATION_MS = 180 * 24 * 60 * 60 * 1000; // 180 days

function readStoredChoice() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) return null;

        return parsed;
    } catch {
        return null;
    }
}

export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(() => !readStoredChoice());

    const storeChoice = (accepted) => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ accepted, expiresAt: Date.now() + CONSENT_DURATION_MS })
            );
        } catch {
            // localStorage unavailable — banner will just reappear next visit
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-gray-900 text-white px-4 py-4">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                <p className="text-sm text-gray-200 flex-1">
                    We use cookies to keep you signed in and improve your experience. See our{" "}
                    <Link to="/privacy-policy" className="underline hover:text-white">
                        Privacy Policy
                    </Link>{" "}
                    for details.
                </p>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={() => storeChoice(false)}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-600 hover:bg-gray-800 transition"
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => storeChoice(true)}
                        className="px-4 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover transition"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
