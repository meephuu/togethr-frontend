import { useCallback, useState } from "react";
import PrivacyPolicyContent from "../PrivacyPolicyContent";

// Treat "within a few pixels of the end" as the bottom — sub-pixel layout
// rounding means scrollTop + clientHeight rarely equals scrollHeight exactly.
const SCROLL_BOTTOM_TOLERANCE_PX = 8;

export default function PrivacyPolicyModal({ open, onAccept, onClose }) {
    const [checked, setChecked] = useState(false);
    const [hasReadToBottom, setHasReadToBottom] = useState(false);

    // Runs when the scroll container mounts (i.e. each time the modal opens).
    // Resets the gate, and lifts it immediately when the policy is short
    // enough not to scroll — otherwise the checkbox could never be enabled.
    const scrollRef = useCallback((node) => {
        if (node) {
            setHasReadToBottom(node.scrollHeight - node.clientHeight <= SCROLL_BOTTOM_TOLERANCE_PX);
        }
    }, []);

    const handleScroll = (e) => {
        const el = e.currentTarget;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        // Latch on: scrolling back up must not re-lock the checkbox
        if (distanceFromBottom <= SCROLL_BOTTOM_TOLERANCE_PX) {
            setHasReadToBottom(true);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-xl flex flex-col">
                {/* Scrollable content */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto px-6 py-4 text-sm"
                >
                    <PrivacyPolicyContent />
                </div>

                {/* Footer: checkbox + actions */}
                <div className="px-6 py-4 border-t border-gray-100 space-y-3">
                    <label
                        className={`flex items-start gap-2 text-sm ${
                            hasReadToBottom
                                ? "text-text-main cursor-pointer"
                                : "text-text-muted cursor-not-allowed"
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            disabled={!hasReadToBottom}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed"
                        />
                        <span>
                            I have read and agree to the Privacy Policy
                            {!hasReadToBottom && (
                                <span className="block text-xs text-text-muted mt-0.5">
                                    Please scroll to the bottom of the policy first.
                                </span>
                            )}
                        </span>
                    </label>

                    <div className="flex gap-2 mb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-text-muted hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={!checked}
                            onClick={onAccept}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                                checked
                                    ? "bg-primary hover:opacity-90"
                                    : "bg-gray-300 cursor-not-allowed"
                            }`}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
