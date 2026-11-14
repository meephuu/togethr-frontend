import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { AlertCircleIcon, CalendarIcon, CheckIcon, ClockIcon, MapPinIcon, XIcon } from "../ui/Icons";
import { ApiError, completeBooking } from "../../services/sprint2Api";

// "YYYY-MM-DD" read as UTC so the day doesn't shift with the viewer's timezone
function formatDate(date) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}

function completeError(err) {
    if (err instanceof ApiError) {
        if (err.status === 409) return err.body?.error || "This booking can't be marked complete right now.";
        if (err.status === 403) return "Only the customer who made this booking can confirm it's complete.";
        if (err.status === 404) return "This booking no longer exists.";
        return err.body?.error || "Something went wrong and the booking wasn't marked complete. Please try again.";
    }
    return "Can't reach the server. Check your connection and try again.";
}

// US6-5: the customer confirms a trip has finished, which unlocks the review.
// onCompleted(booking) runs after a successful confirm; onConflict(message)
// when the server refuses it (e.g. it hasn't ended yet, or was already
// completed), so the page can reload.
export default function CompleteBookingDialog({ booking, onClose, onCompleted, onConflict }) {
    const confirmButtonRef = useRef(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState("");

    const close = () => {
        if (!isCompleting) onClose();
    };

    // Nothing here can't be undone by mistake, so focus the main action
    useEffect(() => {
        confirmButtonRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isCompleting) onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isCompleting, onClose]);

    const handleComplete = async () => {
        setIsCompleting(true);
        setError("");
        try {
            const res = await completeBooking(booking.id);
            onCompleted(res.booking);
        } catch (err) {
            setIsCompleting(false);
            if (err instanceof ApiError && err.status === 409) {
                onConflict(completeError(err));
            } else {
                setError(completeError(err));
            }
        }
    };

    const { service, provider } = booking;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4" onClick={close}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="complete-booking-title"
                aria-describedby="complete-booking-description"
                className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700">
                            <CheckIcon size={20} />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <h2 id="complete-booking-title" className="font-heading text-base font-semibold text-text-main">
                                Confirm your trip is complete?
                            </h2>
                            <p className="text-[13px] text-text-muted">After this you can rate and review it.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={close}
                        disabled={isCompleting}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                <div className="flex flex-col gap-5 overflow-y-auto thin-scrollbar px-6 py-5">
                    <div className="flex flex-col gap-3 rounded-xl bg-secondary p-4">
                        <p className="font-semibold text-text-main">{service.title}</p>
                        <ul className="flex flex-col gap-2 text-sm text-text-main">
                            <li className="flex gap-3">
                                <CalendarIcon size={16} className="mt-0.5 text-text-muted" />
                                {formatDate(booking.appointmentDate)}
                            </li>
                            <li className="flex gap-3">
                                <ClockIcon size={16} className="mt-0.5 text-text-muted" />
                                {booking.startTime ? `${booking.startTime}–${booking.endTime}` : "Whole day"}
                            </li>
                            <li className="flex gap-3">
                                <MapPinIcon size={16} className="mt-0.5 text-text-muted" />
                                {service.location}
                            </li>
                        </ul>
                    </div>
                    <p id="complete-booking-description" className="text-sm leading-normal text-text-main">
                        Confirm that your trip with {provider.firstname} has finished. The booking will move to
                        Completed and you'll be asked to leave a review.
                    </p>
                    {error && (
                        <p role="alert" className="flex items-start gap-2 text-sm text-red-600">
                            <AlertCircleIcon size={16} className="mt-0.5" />
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                    <Button type="button" variant="secondary" className="h-10" onClick={close} disabled={isCompleting}>
                        Not yet
                    </Button>
                    <Button
                        ref={confirmButtonRef}
                        type="button"
                        className="h-10 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handleComplete}
                        disabled={isCompleting}
                    >
                        {isCompleting ? "Confirming…" : "Confirm completion"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
