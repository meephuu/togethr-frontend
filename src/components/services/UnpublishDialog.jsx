import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { AlertCircleIcon, XIcon } from "../ui/Icons";

const DANGER_BUTTON_CLASS =
    "inline-flex h-10 items-center justify-center gap-2 px-6 text-base font-medium rounded-lg bg-red-600 text-white transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const PENDING_REQUESTS_MESSAGE = "Please respond to pending requests first";

function formatDate(date) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

// US4-3. mode "confirm": asks before unpublishing.
// mode "blocked": the service still has pending requests, so it can't be
// unpublished yet; pendingRequests (optional) comes from the 409 body.
export default function UnpublishDialog({
    mode,
    serviceTitle,
    confirmedCount,
    pendingCount,
    pendingRequests = [],
    isWorking,
    error,
    onConfirm,
    onClose,
}) {
    const safeButtonRef = useRef(null);
    const blocked = mode === "blocked";

    useEffect(() => {
        safeButtonRef.current?.focus();
    }, [mode]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isWorking) onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isWorking, onClose]);

    const close = () => {
        if (!isWorking) onClose();
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4" onClick={close}>
            <div
                role={blocked ? "alertdialog" : "dialog"}
                aria-modal="true"
                aria-labelledby="unpublish-title"
                aria-describedby="unpublish-description"
                className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${
                                blocked ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"
                            }`}
                        >
                            <AlertCircleIcon size={20} />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <h2 id="unpublish-title" className="font-heading text-base font-semibold text-text-main">
                                {blocked ? PENDING_REQUESTS_MESSAGE : "Unpublish this service?"}
                            </h2>
                            <p className="text-[13px] text-text-muted">{serviceTitle}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={close}
                        disabled={isWorking}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                <div className="flex flex-col gap-4 px-6 py-5 text-sm leading-normal text-text-main">
                    {blocked ? (
                        <>
                            <p id="unpublish-description">
                                This service has {pendingCount === 1 ? "1 pending request" : `${pendingCount} pending requests`}.
                                Accept or reject {pendingCount === 1 ? "it" : "them"}, then you can unpublish. The service stays
                                published for now.
                            </p>
                            {pendingRequests.length > 0 && (
                                <ul className="flex flex-col divide-y divide-amber-100 rounded-xl border border-amber-200 bg-amber-50">
                                    {pendingRequests.map((request) => (
                                        <li key={request.id} className="flex items-center justify-between gap-3 px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">
                                                    {request.id}
                                                    {request.customerName ? ` · ${request.customerName}` : ""}
                                                </span>
                                                {request.appointmentDate && (
                                                    <span className="text-[13px] text-gray-600">
                                                        {formatDate(request.appointmentDate)}
                                                        {request.startTime ? ` · ${request.startTime}–${request.endTime}` : ""}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                                Pending
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    ) : (
                        <ul id="unpublish-description" className="flex list-disc flex-col gap-2 pl-5">
                            <li>It disappears from search, and customers can't send new requests.</li>
                            {confirmedCount > 0 && (
                                <li>
                                    Your {confirmedCount === 1 ? "confirmed booking still goes" : `${confirmedCount} confirmed bookings still go`} ahead
                                    as planned.
                                </li>
                            )}
                            <li>You can publish it again any time.</li>
                        </ul>
                    )}

                    {error && (
                        <p role="alert" className="flex items-start gap-2 text-red-600">
                            <AlertCircleIcon size={16} className="mt-0.5" />
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                    <Button ref={safeButtonRef} type="button" variant="secondary" className="h-10" onClick={close} disabled={isWorking}>
                        {blocked ? "Close" : "Cancel"}
                    </Button>
                    {blocked ? (
                        <Link
                            to="/provider/booking-requests"
                            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            Go to booking requests
                        </Link>
                    ) : (
                        <button type="button" className={DANGER_BUTTON_CLASS} onClick={onConfirm} disabled={isWorking}>
                            {isWorking ? "Unpublishing…" : "Unpublish"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
