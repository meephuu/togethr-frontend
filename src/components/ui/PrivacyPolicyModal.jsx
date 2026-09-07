import { useState } from "react";
import PrivacyPolicyContent from "../PrivacyPolicyContent";

export default function PrivacyPolicyModal({ open, onAccept, onClose }) {
    const [checked, setChecked] = useState(false);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-xs text-text-muted">
                        Please read the policy below before creating your account.
                    </p>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto px-6 py-4 text-sm">
                    <PrivacyPolicyContent />
                </div>

                {/* Footer: checkbox + actions */}
                <div className="px-6 py-4 border-t border-gray-100 space-y-3">
                    <label className="flex items-start gap-2 text-sm text-text-main cursor-pointer">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>I have read and agree to the Privacy Policy</span>
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
