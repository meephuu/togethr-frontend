import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import CustomerTabs from "../../components/customer/CustomerTabs";
import FilterPanel from "../../components/search/FilterPanel";
import ActiveFilterChips from "../../components/search/ActiveFilterChips";
import ServiceCard from "../../components/search/ServiceCard";
import Button from "../../components/ui/Button";
import { useSearchFilters } from "../../hooks/useSearchFilters";
import { ApiError, getCategories, searchServices } from "../../services/sprint2Api";

export default function FindServicePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);

    // search result state
    const [results, setResults] = useState({ data: [], meta: null });
    const [status, setStatus] = useState("loading"); // loading, ready, error
    const [errorMessage, setErrorMessage] = useState("");

    // The URL is the source of truth for the filters (US5-2). `key` changes
    // whenever the applied filters do, which resets the panel's draft.
    const { filters, key: filtersKey, chips, rangeErrors, isValid, applyFilters, removeChip, clearAll } =
        useSearchFilters();

    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const sortBy = searchParams.get("sortBy") || "rating_desc";

    useEffect(() => {
        getCategories()
            .then((cats) => setCategories(cats.map(c => c.name)))
            .catch((err) => console.error("Failed to load categories", err));
    }, []);

    useEffect(() => {
        // A min > max range (e.g. typed into the URL) never reaches the API;
        // the panel shows the message instead (US5-2 acceptance criterion).
        if (!isValid) return undefined;

        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus("loading");

        const apiParams = new URLSearchParams(searchParams);
        if (!apiParams.has("limit")) {
            apiParams.set("limit", "6");
        }

        searchServices(apiParams)
            .then((res) => {
                if (!cancelled) {
                    setResults(res);
                    setStatus("ready");
                }
            })
            .catch((err) => {
                console.error("Search error:", err);
                if (cancelled) return;
                // The server repeats the min/max checks; show its message.
                setErrorMessage(
                    err instanceof ApiError && err.status === 400 && err.body?.error
                        ? err.body.error
                        : "Failed to load search results. Please try again.",
                );
                setStatus("error");
            });

        return () => { cancelled = true; };
    }, [searchParams, isValid]);

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newQ = formData.get("q").trim();
        const next = new URLSearchParams(searchParams);
        if (newQ) next.set("q", newQ);
        else next.delete("q");
        next.delete("page"); // reset page on search
        setSearchParams(next);
    };

    const handleSortChange = (e) => {
        const next = new URLSearchParams(searchParams);
        next.set("sortBy", e.target.value);
        next.delete("page"); // a new order starts from page 1
        setSearchParams(next);
    };

    const handlePageChange = (newPage) => {
        const next = new URLSearchParams(searchParams);
        if (newPage === 1) next.delete("page");
        else next.set("page", String(newPage));
        setSearchParams(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalCount = results.meta?.totalCount || 0;
    const totalPages = results.meta?.totalPages || 1;

    return (
        <PageShell subnav={<CustomerTabs />}>
            <div className="mx-auto w-full max-w-7xl">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8 flex w-full items-stretch gap-4">
                    <div className="flex flex-1 items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="search"
                            name="q"
                            defaultValue={query}
                            placeholder="food"
                            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-500"
                        />
                    </div>
                    <Button type="submit" className="px-8 py-3 font-semibold rounded-lg">Search</Button>
                </form>

                <div className="flex w-full flex-col items-start gap-8 lg:flex-row">
                    <FilterPanel
                        key={filtersKey}
                        filters={filters}
                        categories={categories}
                        onApply={applyFilters}
                        onClearAll={clearAll}
                    />

                    <div className="flex-1 min-w-0">
                        {/* Header for Results */}
                        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <h1 className="text-2xl font-bold text-text-main">
                                {isValid ? `${totalCount} ${totalCount === 1 ? "service" : "services"} match` : "Check your filters"}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                <span>Sorted by</span>
                                <select 
                                    value={sortBy} 
                                    onChange={handleSortChange}
                                    className="bg-transparent font-medium text-text-main focus:outline-none"
                                >
                                    <option value="rating_desc">rating</option>
                                    <option value="price_asc">price (low to high)</option>
                                    <option value="price_desc">price (high to low)</option>
                                </select>
                                <span>• Showing {results.data.length > 0 ? (page - 1) * results.meta.limit + 1 : 0}–{Math.min(page * (results.meta?.limit || 10), totalCount)}</span>
                            </div>
                        </div>

                        <ActiveFilterChips
                            chips={chips}
                            onRemove={removeChip}
                            onClearAll={clearAll}
                        />

                        {/* Grid */}
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {!isValid && (
                                <div role="alert" className="col-span-full py-12 text-center text-red-600">
                                    {Object.values(rangeErrors).join(" ")}
                                </div>
                            )}
                            {isValid && status === "loading" && Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="aspect-[3/2] animate-pulse rounded-2xl bg-gray-200" />
                            ))}
                            {isValid && status === "ready" && results.data.map(service => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                            {isValid && status === "error" && (
                                <div role="alert" className="col-span-full py-12 text-center text-red-600">
                                    {errorMessage}
                                </div>
                            )}
                            {isValid && status === "ready" && results.data.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500">
                                    No services found matching your criteria.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {isValid && totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-main disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const p = i + 1;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`rounded-lg px-4 py-2 text-sm font-medium ${
                                                page === p
                                                    ? "bg-[#1E293B] text-white"
                                                    : "border border-gray-200 text-text-main hover:bg-gray-50"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-main disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
