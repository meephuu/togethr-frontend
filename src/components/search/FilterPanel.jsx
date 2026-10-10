import { useState } from "react";
import Button from "../ui/Button";
import {
    EMPTY_FILTERS,
    GENDER_OPTIONS,
    RATING_OPTIONS,
    validateRanges,
} from "../../lib/searchFilters";

// Same input styling as ProfileEditPage; errors use red-600 for contrast.
const numberInputClass = (hasError) =>
    `w-full min-w-0 rounded-lg border bg-white px-3 py-2.5 text-sm text-text-main transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
        hasError ? "border-red-600 focus:ring-red-600" : "border-gray-200 focus:ring-primary"
    }`;

const LEGEND_CLASS = "mb-2.5 p-0 text-sm font-semibold text-text-main";

// Number inputs accept whole, non-negative numbers only.
const BLOCKED_KEYS = ["-", "+", "e", "E", ".", ","];

function RangeInputs({ label, minName, maxName, minLabel, maxLabel, values, onChange, error, suffix }) {
    const errorId = `${minName}-error`;
    const input = (name, ariaLabel) => (
        <input
            name={name}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            aria-label={ariaLabel}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            value={values[name]}
            onKeyDown={(e) => BLOCKED_KEYS.includes(e.key) && e.preventDefault()}
            onChange={onChange}
            className={numberInputClass(error)}
        />
    );

    return (
        <fieldset className="m-0 border-0 p-0">
            <legend className={LEGEND_CLASS}>{label}</legend>
            <div className="flex items-center gap-2">
                {input(minName, minLabel)}
                <span className="text-text-muted">–</span>
                {input(maxName, maxLabel)}
                {suffix && <span className="text-[13px] text-text-muted">{suffix}</span>}
            </div>
            {error && (
                <p id={errorId} className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            )}
        </fieldset>
    );
}

/**
 * Edits a draft of the filters; nothing reaches the URL until Apply.
 * Give it key={key from useSearchFilters} so the draft resets whenever the
 * applied filters change (chip removed, back/forward, reload).
 */
export default function FilterPanel({ filters, categories = [], onApply, onClearAll }) {
    const [draft, setDraft] = useState(filters);
    const errors = validateRanges(draft);
    const hasErrors = Object.keys(errors).length > 0;

    const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        // Pasted negatives or decimals are refused rather than silently changed.
        if (value !== "" && !/^\d+$/.test(value)) return;
        update(name, value);
    };

    const toggleInterest = (value) =>
        update(
            "interests",
            draft.interests.includes(value)
                ? draft.interests.filter((interest) => interest !== value)
                : [...draft.interests, value],
        );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!hasErrors) onApply(draft);
    };

    const handleClearAll = () => {
        // Also resets unapplied edits when the URL already has no filters.
        setDraft(EMPTY_FILTERS);
        onClearAll();
    };

    return (
        <aside
            aria-label="Filters"
            className="w-full shrink-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:w-[296px]"
        >
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg text-text-main">Filters</h2>
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-sm font-semibold text-primary hover:text-primary-hover hover:underline"
                    >
                        Clear all
                    </button>
                </div>

                <fieldset className="m-0 border-0 p-0">
                    <legend className={LEGEND_CLASS}>Provider gender</legend>
                    <div className="flex gap-1 rounded-lg bg-secondary p-1">
                        {GENDER_OPTIONS.map((option) => {
                            const selected = draft.gender === option.value;
                            return (
                                <button
                                    key={option.label}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => update("gender", option.value)}
                                    className={`h-9 flex-1 rounded-md text-[13px] transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                                        selected
                                            ? "bg-white font-semibold text-primary shadow-sm"
                                            : "font-medium text-text-muted hover:text-text-main"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                <RangeInputs
                    label="Provider age"
                    minName="minAge"
                    minLabel="Minimum age"
                    maxLabel="Maximum age"
                    maxName="maxAge"
                    values={draft}
                    onChange={handleNumberChange}
                    error={errors.age}
                    suffix="years"
                />

                <fieldset className="m-0 border-0 p-0">
                    <legend className={LEGEND_CLASS}>Interests</legend>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const selected = draft.interests.includes(category);
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => toggleInterest(category)}
                                    className={`h-[34px] rounded-full border px-3.5 text-[13px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                        selected
                                            ? "border-primary bg-primary text-white hover:bg-primary-hover"
                                            : "border-gray-200 bg-white text-text-main hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                <RangeInputs
                    label="Price per hour (THB)"
                    minName="minPrice"
                    minLabel="Minimum price"
                    maxLabel="Maximum price"
                    maxName="maxPrice"
                    values={draft}
                    onChange={handleNumberChange}
                    error={errors.price}
                />

                <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
                    <legend className={LEGEND_CLASS}>Provider rating</legend>
                    {RATING_OPTIONS.map((option) => (
                        <label key={option.label} className="flex cursor-pointer items-center gap-2.5 text-sm text-text-main">
                            <input
                                type="radio"
                                name="minRating"
                                value={option.value}
                                checked={draft.minRating === option.value}
                                onChange={() => update("minRating", option.value)}
                                className="h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-gray-300 bg-white checked:border-[5px] checked:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            />
                            {option.label}
                        </label>
                    ))}
                </fieldset>

                <Button
                    type="submit"
                    disabled={hasErrors}
                    className="w-full disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-text-muted disabled:hover:bg-gray-200"
                >
                    Apply filters
                </Button>
            </form>
        </aside>
    );
}
