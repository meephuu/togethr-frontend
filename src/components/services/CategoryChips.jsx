// Multi-select chips; a selected chip is filled navy.
export default function CategoryChips({ categories, selectedIds, onToggle, error }) {
    return (
        <div role="group" aria-labelledby="category-label">
            <p id="category-label" className="mb-2 text-sm font-medium text-text-main">
                Category <span className="font-normal text-text-muted">(choose one or more)</span>
            </p>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                    const selected = selectedIds.includes(category.id);
                    return (
                        <button
                            key={category.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onToggle(category.id)}
                            className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                selected
                                    ? "border-primary bg-primary text-white hover:bg-primary-hover"
                                    : "border-gray-200 bg-white text-text-main hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            {category.name}
                        </button>
                    );
                })}
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
