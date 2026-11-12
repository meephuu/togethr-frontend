import { useEffect, useState } from "react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { AlertCircleIcon, CalendarIcon, XIcon } from "../ui/Icons";
import StarRatingInput from "./StarRatingInput";
import { ApiError, createReview } from "../../services/sprint2Api";

// Same limit POST /api/reviews enforces
export const MAX_COMMENT_LENGTH = 1000;

// "YYYY-MM-DD" read as UTC so the day doesn't shift with the viewer's timezone
function formatDate(date) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}

function reviewError(err) {
    if (err instanceof ApiError) {
        if (err.status === 403) return "Only the customer who made this booking can review it.";
        if (err.status === 404) return "This booking no longer exists.";
        return err.body?.error || "Something went wrong and your review wasn't saved. Please try again.";
    }
    return "Can't reach the server. Check your connection and try again.";
}

// US8-1: the customer rates and reviews the provider of a completed booking.
// onReviewed(review) runs after a successful submit; onAlreadyReviewed(message)
// when the server says this booking already has a review (409), so the page
// can mark it as reviewed.
export default function ReviewBookingDialog({ booking, onClose, onReviewed, onAlreadyReviewed }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const { service, provider } = booking;
    const trimmedLength = comment.trim().length;
    const tooLong = trimmedLength > MAX_COMMENT_LENGTH;
    const canSubmit = rating > 0 && !tooLong && !isSubmitting;
    // Don't throw away a half-written review on a stray click outside
    const isDirty = rating > 0 || comment.trim() !== "";

    const close = () => {
        if (!isSubmitting) onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isSubmitting) onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSubmitting, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setIsSubmitting(true);
        setError("");
        try {
            const res = await createReview({ bookingId: booking.id, rating, comment: comment.trim() || undefined });
            onReviewed(res.review);
        } catch (err) {
            setIsSubmitting(false);
            if (err instanceof ApiError && err.status === 409) {
                onAlreadyReviewed(err.body?.error || "You have already reviewed this booking.");
            } else {
                setError(reviewError(err));
            }
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4" onClick={isDirty ? undefined : close}>
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="review-booking-title"
                className="flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
                noValidate
            >
                {/* ===== header ===== */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                        <h2 id="review-booking-title" className="font-heading text-base font-semibold text-text-main">
                            How was your trip?
                        </h2>
                        <p className="text-[13px] text-text-muted">Your review is public and helps other travellers choose.</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={close}
                        disabled={isSubmitting}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                {/* ===== body ===== */}
                <div className="flex flex-col gap-6 overflow-y-auto thin-scrollbar px-6 py-5">
                    <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
                        <Avatar
                            photoUrl={provider.profilePhotoUrl}
                            firstname={provider.firstname}
                            lastname={provider.lastname}
                            size="md"
                        />
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <p className="truncate font-semibold text-text-main">{service.title}</p>
                            <p className="flex items-center gap-1.5 text-sm text-text-muted">
                                with {provider.firstname} {provider.lastname}
                                <span aria-hidden="true">·</span>
                                <CalendarIcon size={14} />
                                {formatDate(booking.appointmentDate)}
                            </p>
                        </div>
                    </div>

                    <fieldset className="flex flex-col items-center gap-2">
                        <legend className="mb-3 w-full text-center text-sm font-semibold text-text-main">
                            Rate {provider.firstname} <span className="text-red-600">*</span>
                        </legend>
                        <StarRatingInput value={rating} onChange={setRating} disabled={isSubmitting} />
                    </fieldset>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="review-comment" className="text-sm font-semibold text-text-main">
                            Tell others about it <span className="font-normal text-text-muted">(optional)</span>
                        </label>
                        <textarea
                            id="review-comment"
                            rows={5}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isSubmitting}
                            placeholder={`What did you like about the trip with ${provider.firstname}? Was it on time, friendly, as described?`}
                            aria-invalid={tooLong}
                            aria-describedby="review-comment-count"
                            className={`w-full resize-none rounded-lg border px-4 py-3 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-secondary ${
                                tooLong ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        <p
                            id="review-comment-count"
                            className={`self-end text-xs ${tooLong ? "font-medium text-red-600" : "text-text-muted"}`}
                        >
                            {trimmedLength} / {MAX_COMMENT_LENGTH}
                            {tooLong && " – please shorten your review"}
                        </p>
                    </div>

                    {error && (
                        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                            <AlertCircleIcon size={16} className="mt-0.5" />
                            {error}
                        </p>
                    )}
                </div>

                {/* ===== footer ===== */}
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
                    <p className="text-xs text-text-muted">You can review each booking once.</p>
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" className="h-10" onClick={close} disabled={isSubmitting}>
                            Not now
                        </Button>
                        <Button
                            type="submit"
                            className="h-10 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!canSubmit}
                        >
                            {isSubmitting ? "Submitting…" : "Submit review"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
