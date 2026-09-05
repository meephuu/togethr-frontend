import { useState } from "react";
import PrivacyPolicyModal from "../PrivacyPolicyModal";

export default function ConsentCheckbox({ checked, onChange, error }) {
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);

    return (
        <div>
            <label className="flex items-start gap-2 text-sm text-text-muted">
                <input
                    type="checkbox"
                    name="consent"
                    checked={checked}
                    onChange={onChange}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>
                    I have read and agree to the{" "}
                    <button
                        type="button"
                        onClick={() => setIsPolicyOpen(true)}
                        className="text-primary underline hover:text-primary-hover"
                    >
                        Privacy Policy
                    </button>
                </span>
            </label>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            <PrivacyPolicyModal open={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} />
        </div>
    );
}
