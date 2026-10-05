// Chips for the applied filters (what's in the URL, not unapplied panel edits).
// Renders nothing when no filters are applied.
export default function ActiveFilterChips({ chips, onRemove, onClearAll }) {
    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="sr-only">Active filters:</span>
            {chips.map((chip) => (
                <span
                    key={chip.key}
                    className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-gray-200 bg-white pl-3 pr-1.5 text-[13px] text-text-main"
                >
                    {chip.label}
                    <button
                        type="button"
                        aria-label={`Remove ${chip.label}`}
                        onClick={() => onRemove(chip)}
                        className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </span>
            ))}
            <button
                type="button"
                onClick={onClearAll}
                className="ml-1 text-[13px] font-semibold text-primary hover:text-primary-hover hover:underline"
            >
                Clear all
            </button>
        </div>
    );
}
