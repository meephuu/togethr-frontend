// Multi-select chips. `options` may be strings or { value, label } objects;
// `value` is the array of selected values.
export default function ChipSelect({ label, hint, required = false, options, value, onChange, error, disabled }) {
    const toggle = (optionValue) =>
        onChange(value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue]);

    return (
        <fieldset className="min-w-0 border-0 p-0">
            <legend className="block text-sm font-medium text-text-main mb-1.5">
                {label}
                {required && <span className="text-red-600"> *</span>}
            </legend>
            {hint && <p className="text-xs text-text-muted mb-3">{hint}</p>}
            <div className={`flex flex-wrap gap-2.5 ${hint ? "" : "mt-3"}`}>
                {options.map((raw) => {
                    const option = typeof raw === "string" ? { value: raw, label: raw } : raw;
                    const selected = value.includes(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            disabled={disabled}
                            onClick={() => toggle(option.value)}
                            className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                selected
                                    ? "border-primary bg-primary text-white hover:bg-primary-hover"
                                    : error
                                      ? "border-red-600 bg-white text-text-main hover:bg-gray-50"
                                      : "border-gray-200 bg-white text-text-main hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
            {error && (
                <p className="text-xs text-red-600 mt-2" role="alert">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
