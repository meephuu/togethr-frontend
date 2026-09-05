import { Link } from "react-router-dom";

export default function ConsentCheckbox({ checked, onChange, error }) {
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
                    <Link
                        to="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary-hover"
                    >
                        Privacy Policy
                    </Link>
                </span>
            </label>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
