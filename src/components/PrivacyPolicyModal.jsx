import { useEffect } from "react";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

export default function PrivacyPolicyModal({ open, onClose }) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        // Prevent the page behind the modal from scrolling with it
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4 py-8"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="bg-background rounded-2xl shadow-lg w-full max-w-2xl max-h-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Privacy Policy"
            >
                <div className="flex justify-end p-4 pb-0 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-400 hover:text-text-main transition-colors rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto px-8 pb-8">
                    <PrivacyPolicyContent />
                </div>
            </div>
        </div>
    );
}
