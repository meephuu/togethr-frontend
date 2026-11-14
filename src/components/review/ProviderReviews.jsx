import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { AlertCircleIcon, StarFilledIcon } from "../ui/Icons";
import { StarRatingDisplay } from "./StarRatingInput";
import { getProviderReviews } from "../../services/sprint2Api";

// US8-2: the reviews section on a provider's public profile. Shows the average
// rating and review count over all reviews, and the reviews themselves one
// page at a time, newest first.

// Two rows of the 3-column grid
const REVIEWS_PER_PAGE = 6;

// Same grid as the services below it: 1 column on mobile, 2 on tablet, 3 on desktop
const GRID_CLASS = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";
const CARD_CLASS = "flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-gray-100";

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Page numbers to show: all of them when there are few, otherwise the first,
// the last and the ones around the current page, with "…" for the gaps
function pageItems(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const items = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) items.push(`gap-${p}`);
        items.push(p);
    });
    return items;
}

function ReviewCard({ review }) {
    return (
        // Grid items stretch, so the cards in a row share the tallest one's height
        <li className={CARD_CLASS}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="font-medium text-text-main text-sm">{review.author}</p>
                    <p className="truncate text-xs text-text-muted">for {review.serviceTitle}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <StarFilledIcon size={16} className="text-[#E7711B]" />
                    <span className="font-bold text-sm text-text-main">{Number(review.rating).toFixed(1)}</span>
                </div>
            </div>
            {review.comment && (
                <p className="mt-3 line-clamp-4 text-text-muted text-sm leading-relaxed whitespace-pre-wrap">
                    {review.comment}
                </p>
            )}
            <p className="mt-auto pt-3 text-xs text-gray-400">Posted {formatDate(review.date)}</p>
        </li>
    );
}

function Summary({ summary }) {
    const { avgRating, reviewCount } = summary;
    return (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-3xl font-bold text-text-main">{Number(avgRating).toFixed(1)}</span>
            <div className="flex flex-col gap-0.5">
                <StarRatingDisplay value={Math.round(avgRating)} size={18} />
                <span className="text-sm text-text-muted">
                    Average from {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </span>
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, onChange, disabled }) {
    if (totalPages <= 1) return null;
    const buttonClass =
        "rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent";
    return (
        <nav aria-label="Review pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button type="button" className={buttonClass} onClick={() => onChange(page - 1)} disabled={disabled || page === 1}>
                Previous
            </button>
            {pageItems(page, totalPages).map((item) =>
                typeof item === "string" ? (
                    <span key={item} className="px-1 text-sm text-text-muted" aria-hidden="true">
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        aria-label={`Page ${item}`}
                        aria-current={item === page ? "page" : undefined}
                        onClick={() => onChange(item)}
                        disabled={disabled}
                        className={`rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed ${
                            item === page
                                ? "bg-[#1E293B] text-white"
                                : "border border-gray-200 text-text-main hover:bg-gray-50"
                        }`}
                    >
                        {item}
                    </button>
                ),
            )}
            <button
                type="button"
                className={buttonClass}
                onClick={() => onChange(page + 1)}
                disabled={disabled || page === totalPages}
            >
                Next
            </button>
        </nav>
    );
}

function LoadingGrid() {
    return (
        <ul className={GRID_CLASS} aria-hidden="true">
            {[0, 1, 2].map((key) => (
                <li key={key} className={`${CARD_CLASS} animate-pulse gap-3`}>
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-3 w-40 rounded bg-gray-100" />
                    <div className="h-3 w-full rounded bg-gray-100" />
                    <div className="h-3 w-3/4 rounded bg-gray-100" />
                </li>
            ))}
        </ul>
    );
}

export default function ProviderReviews({ providerId }) {
    const sectionRef = useRef(null);
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    // status: loading | error | ready. On a page change the previous page stays
    // on screen (dimmed) until the next one arrives, so the layout doesn't jump.
    const [result, setResult] = useState({ status: "loading", data: null });

    useEffect(() => {
        let ignore = false;
        getProviderReviews(providerId, { page, limit: REVIEWS_PER_PAGE })
            .then((data) => {
                if (ignore) return;
                setResult({ status: "ready", data });
                // The server clamps an out-of-range page; follow it
                if (data.meta?.currentPage && data.meta.currentPage !== page) setPage(data.meta.currentPage);
            })
            .catch(() => {
                if (!ignore) setResult((prev) => ({ status: "error", data: prev.data }));
            });
        return () => {
            ignore = true;
        };
    }, [providerId, page, reloadKey]);

    function goToPage(next) {
        setResult((prev) => ({ ...prev, status: "loading" }));
        setPage(next);
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function retry() {
        setResult((prev) => ({ ...prev, status: "loading" }));
        setReloadKey((key) => key + 1);
    }

    const { status, data } = result;
    const reviewCount = data?.summary?.reviewCount ?? 0;
    const isChangingPage = status === "loading" && data;

    return (
        <section ref={sectionRef} className="mt-12 scroll-mt-24" aria-busy={status === "loading"}>
            <h2 className="text-xl font-bold text-text-main mb-4">
                {reviewCount > 0 ? `Reviews (${reviewCount})` : "Reviews"}
            </h2>

            {status === "loading" && !data && <LoadingGrid />}

            {status === "error" && (
                <div role="alert" className={`${CARD_CLASS} items-center gap-3 py-10 text-center`}>
                    <AlertCircleIcon size={24} className="text-red-600" />
                    <p className="font-semibold text-text-main">We couldn't load the reviews.</p>
                    <Button onClick={retry} className="mt-1">
                        Try again
                    </Button>
                </div>
            )}

            {status !== "error" && data && reviewCount === 0 && (
                <p className="text-sm text-text-muted">No reviews yet</p>
            )}

            {status !== "error" && data && reviewCount > 0 && (
                <>
                    {data.summary.avgRating != null && <Summary summary={data.summary} />}
                    <ul className={`${GRID_CLASS} transition-opacity ${isChangingPage ? "opacity-50" : ""}`}>
                        {data.reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </ul>
                    <Pagination
                        page={data.meta.currentPage}
                        totalPages={data.meta.totalPages}
                        onChange={goToPage}
                        disabled={status === "loading"}
                    />
                </>
            )}
        </section>
    );
}
