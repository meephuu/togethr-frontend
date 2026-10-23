import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { AlertCircleIcon, CalendarIcon, ClockIcon, MapPinIcon, XIcon } from "../ui/Icons";
import { formatBaht } from "../../lib/format";
import { ApiError, cancelBooking } from "../../services/sprint2Api";

const DANGER_BUTTON_CLASS =
    "inline-flex items-center justify-center gap-2 px-6 py-2.5 text-base font-medium rounded-lg bg-red-600 text-white transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600";

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

function cancelError(err) {
    if (err instanceof ApiError) {
        if (err.status === 409) return err.body?.error || "This booking can no longer be cancelled.";
        if (err.status === 403) return "Only the customer who made this booking can cancel it.";
        if (err.status === 404) return "This booking no longer exists.";
        return err.body?.error || "Something went wrong and your booking wasn't cancelled. Please try again.";
    }
    return "Can't reach the server. Check your connection and try again.";
}

// US6-4: asks the customer to confirm before cancelling a confirmed booking.
// onCancelled(booking) runs after a successful cancel; onConflict(message) when
// the server refuses it (e.g. the booking just started), so the page can reload.
export default function CancelBookingDialog({ booking, onClose, onCancelled, onConflict }) {
    const keepButtonRef = useRef(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState("");

    const close = () => {
        if (!isCancelling) onClose();
    };

    // Focus the safe choice, so Enter doesn't cancel by accident
    useEffect(() => {
        keepButtonRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isCancelling) onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isCancelling, onClose]);

    const handleCancel = async () => {
        setIsCancelling(true);
        setError("");
        try {
            const res = await cancelBooking(booking.id);
            onCancelled(res.booking);
        } catch (err) {
            setIsCancelling(false);
            if (err instanceof ApiError && err.status === 409) {
                onConflict(cancelError(err));
            } else {
                setError(cancelError(err));
            }
        }
    };

    const { service, provider } = booking;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4" onClick={close}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-booking-title"
                aria-describedby="cancel-booking-description"
                className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-red-50 text-red-600">
                            <AlertCircleIcon size={20} />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <h2 id="cancel-booking-title" className="font-heading text-base font-semibold text-text-main">
                                Cancel this booking?
                            </h2>
                            <p className="text-[13px] text-text-muted">This can't be undone.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={close}
                        disabled={isCancelling}
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
                        {booking.totalPrice != null && (
                            <p className="text-sm text-text-muted">
                                Total <span className="font-semibold text-text-main">{formatBaht(booking.totalPrice)}</span>
                            </p>
                        )}
                    </div>
                    <p id="cancel-booking-description" className="text-sm leading-normal text-text-main">
                        {provider.firstname} will be told the booking is cancelled, and the time slot opens up for other
                        travellers. To go on this trip later, you'll need to book again.
                    </p>
                    {error && (
                        <p role="alert" className="flex items-start gap-2 text-sm text-red-600">
                            <AlertCircleIcon size={16} className="mt-0.5" />
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                    <Button
                        ref={keepButtonRef}
                        type="button"
                        variant="secondary"
                        className="h-10"
                        onClick={close}
                        disabled={isCancelling}
                    >
                        Keep booking
                    </Button>
                    <button type="button" className={`h-10 ${DANGER_BUTTON_CLASS}`} onClick={handleCancel} disabled={isCancelling}>
                        {isCancelling ? "Cancelling…" : "Cancel booking"}
                    </button>
                </div>
            </div>
        </div>
    );
}
