import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/ui/Navbar";
import FilterPanel from "../../components/search/FilterPanel";
import ActiveFilterChips from "../../components/search/ActiveFilterChips";
import { useSearchFilters } from "../../hooks/useSearchFilters";

// TEMPORARY (dev builds only): a stand-in results page for testing the filter
// panel (US5-2) until Mee's search page (US5-1) exists. The search bar, result
// cards, empty state and paging here are throwaway; mount FilterPanel and
// ActiveFilterChips on the real page and delete this file.

const PAGE_SIZE = 4;

// Sample results, from the filter-panel mockup plus a few more for variety.
const MOCK_SERVICES = [
    { id: 1, title: "Old Town street food walk", area: "Bangkok – Yaowarat", provider: "Nina P.", gender: "F", age: 24, interests: ["food"], rate: 450, rating: 4.8, reviews: 32 },
    { id: 2, title: "Temple morning photo walk", area: "Bangkok – Rattanakosin", provider: "Nina P.", gender: "F", age: 24, interests: ["photography", "temples-culture"], rate: 600, rating: 4.8, reviews: 21 },
    { id: 3, title: "Bang Rak night food crawl", area: "Bangkok – Bang Rak", provider: "Ploy S.", gender: "F", age: 27, interests: ["food", "nightlife"], rate: 500, rating: 4.7, reviews: 18 },
    { id: 4, title: "Chinatown street photography", area: "Bangkok – Yaowarat", provider: "Fah K.", gender: "F", age: 31, interests: ["photography", "food"], rate: 550, rating: 4.6, reviews: 40 },
    { id: 5, title: "Floating market breakfast trip", area: "Ratchaburi – Damnoen Saduak", provider: "Mint J.", gender: "F", age: 29, interests: ["food", "shopping"], rate: 700, rating: 4.5, reviews: 12 },
    { id: 6, title: "Ari café and brunch hop", area: "Bangkok – Ari", provider: "Ploy S.", gender: "F", age: 27, interests: ["food"], rate: 350, rating: 4.4, reviews: 9 },
    { id: 7, title: "Khao San after-dark tour", area: "Bangkok – Banglamphu", provider: "Tom W.", gender: "M", age: 26, interests: ["nightlife"], rate: 400, rating: 4.2, reviews: 15 },
    { id: 8, title: "Chatuchak market shopping day", area: "Bangkok – Chatuchak", provider: "Ben C.", gender: "M", age: 34, interests: ["shopping", "food"], rate: 380, rating: 3.9, reviews: 22 },
    { id: 9, title: "Khao Yai nature hike", area: "Nakhon Ratchasima – Khao Yai", provider: "Sam R.", gender: "O", age: 38, interests: ["nature", "photography"], rate: 900, rating: 4.9, reviews: 7 },
    { id: 10, title: "Wat Pho and Grand Palace guide", area: "Bangkok – Rattanakosin", provider: "Anan T.", gender: "M", age: 45, interests: ["temples-culture"], rate: 650, rating: 3.4, reviews: 11 },
];

// Every filter must match. Within interests, a service matches if it has
// any of the selected ones (to confirm with Mee/Tong).
function matches(service, filters, keyword) {
    const inRange = (value, min, max) => (min === "" || value >= Number(min)) && (max === "" || value <= Number(max));
    return (
        (!keyword || `${service.title} ${service.area}`.toLowerCase().includes(keyword.toLowerCase())) &&
        (!filters.gender || service.gender === filters.gender) &&
        inRange(service.age, filters.minAge, filters.maxAge) &&
        (filters.interests.length === 0 || filters.interests.some((i) => service.interests.includes(i))) &&
        inRange(service.rate, filters.minPrice, filters.maxPrice) &&
        (!filters.minRating || service.rating >= Number(filters.minRating))
    );
}

function ResultCard({ service }) {
    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-40 bg-gray-200" />
            <div className="flex flex-col gap-1.5 p-4">
                <p className="font-semibold text-text-main">{service.title}</p>
                <p className="text-[13px] text-text-muted">{service.area}</p>
                <p className="text-[13px] text-text-muted">
                    with {service.provider}, {service.age}
                </p>
                <div className="mt-1.5 flex items-center justify-between border-t border-gray-100 pt-2.5">
                    <span className="text-sm font-semibold text-text-main">
                        ★ {service.rating} <span className="font-normal text-text-muted">({service.reviews})</span>
                    </span>
                    <span className="font-bold text-primary">
                        ฿{service.rate} <span className="text-[13px] font-normal text-text-muted">/ hour</span>
                    </span>
                </div>
            </div>
        </article>
    );
}

export default function DevFiltersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { filters, key, chips, rangeErrors, isValid, applyFilters, removeChip, clearAll } = useSearchFilters();
    const keyword = searchParams.get("q") ?? "";

    // The "search": runs from the URL only, and not at all while a range is invalid.
    const results = useMemo(
        () => (isValid ? MOCK_SERVICES.filter((service) => matches(service, filters, keyword)) : []),
        [filters, isValid, keyword],
    );

    const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
    const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), pageCount);
    const pageResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const goToPage = (next) =>
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (next === 1) params.delete("page");
            else params.set("page", String(next));
            return params;
        });

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar />
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-8">
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Temporary dev page for the filter panel (US5-2) with mock results. The real search page is Mee's
                    (US5-1). Keyword: {keyword ? <strong>“{keyword}”</strong> : <em>none</em>} (add <code>?q=…</code>{" "}
                    to the URL to test that Clear all keeps it).
                </p>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <FilterPanel key={key} filters={filters} onApply={applyFilters} onClearAll={clearAll} />

                    <section className="flex min-w-0 flex-1 flex-col gap-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h1 className="text-[22px] text-text-main">
                                {isValid
                                    ? `${results.length} ${results.length === 1 ? "service matches" : "services match"}`
                                    : "Check your filters"}
                            </h1>
                            {isValid && results.length > 0 && (
                                <span className="text-sm text-text-muted">
                                    Showing {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + pageResults.length}
                                </span>
                            )}
                        </div>

                        <ActiveFilterChips chips={chips} onRemove={removeChip} onClearAll={clearAll} />

                        {!isValid ? (
                            <p className="text-sm text-red-600">{Object.values(rangeErrors).join(". ")}</p>
                        ) : results.length === 0 ? (
                            <p className="text-text-muted">No services match these filters.</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {pageResults.map((service) => (
                                        <ResultCard key={service.id} service={service} />
                                    ))}
                                </div>
                                {pageCount > 1 && (
                                    <nav aria-label="Pages" className="flex items-center justify-center gap-3 pt-2 text-sm">
                                        <button
                                            type="button"
                                            disabled={page === 1}
                                            onClick={() => goToPage(page - 1)}
                                            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 disabled:text-gray-400"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-text-muted">
                                            Page {page} of {pageCount}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={page === pageCount}
                                            onClick={() => goToPage(page + 1)}
                                            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 disabled:text-gray-400"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
