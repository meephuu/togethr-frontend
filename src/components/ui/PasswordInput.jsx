import { useState } from "react";

function EyeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
    );
}

// Reusable password field with show/hide toggle.
// `label` and `labelAction` (e.g. a "Forgot password?" link) are optional,
// so this can be used with or without a heading row above the input.
export default function PasswordInput({
    label,
    labelAction,
    name,
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    autoComplete = "current-password",
    className = "",
}) {
    const [show, setShow] = useState(false);

    return (
        <div className={className}>
            {(label || labelAction) && (
                <div className="flex items-center justify-between mb-2">
                    {label && (
                        <label htmlFor={name} className="text-sm font-medium text-text-main">
                            {label}
                        </label>
                    )}
                    {labelAction}
                </div>
            )}
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={show ? "text" : "password"}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        error ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                    }`}
                />
                <button
                    type="button"
                    onClick={() => setShow((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                >
                    {show ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 leading-tight">{error}</p>}
        </div>
    );
}