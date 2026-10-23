import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import PasswordInput from "../ui/PasswordInput";
import { AlertCircleIcon, CheckIcon, TrashIcon, XIcon } from "../ui/Icons";
import { ApiError, UsersService } from "../../services/generated";

// The customer's My bookings page (US6-4), where bookings can be cancelled
const MY_BOOKINGS_PATH = "/customer/bookings";

// The API's 401 body for a wrong password. Any other 401 means the session ended.
const WRONG_PASSWORD = "incorrect password";
const GENERIC_ERROR = "Something went wrong and your account wasn't deleted. Please try again.";

const STATUS_PILL = {
    WAITING_FOR_CONFIRMATION: { label: "Waiting for confirmation", className: "bg-amber-50 text-amber-800" },
    CONFIRMED: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700" },
};

const DANGER_BUTTON_CLASS =
    "inline-flex items-center justify-center gap-2 px-6 py-2.5 text-base font-medium rounded-lg bg-red-600 text-white transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600";

// "YYYY-MM-DD" read as UTC so the day doesn't shift with the viewer's timezone
function formatDate(date) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

function ListItem({ kept, children }) {
    return (
        <li className="flex gap-2 text-sm leading-snug text-text-main">
            {kept ? (
                <CheckIcon size={16} className="mt-0.5 text-emerald-700" />
            ) : (
                <XIcon size={16} className="mt-0.5 text-red-600" />
            )}
            <span>{children}</span>
        </li>
    );
}

// US2-3 (F50): confirms account deletion with the password and an "I understand"
// checkbox. On a 409 it switches to listing the bookings that block deletion.
export default function DeleteAccountDialog({ email, isProvider, onClose, onDeleted, onSessionEnded }) {
    const navigate = useNavigate();
    const passwordRef = useRef(null);
    const closeButtonRef = useRef(null);

    const [password, setPassword] = useState("");
    const [understood, setUnderstood] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState("");
    const [blockingBookings, setBlockingBookings] = useState(null);

    const isBlocked = blockingBookings !== null;
    const canDelete = password !== "" && understood && !isDeleting;

    const close = () => {
        if (!isDeleting) onClose();
    };

    useEffect(() => {
        passwordRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isDeleting) onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isDeleting, onClose]);

    // After a wrong password, put the user back in the field with the text
    // selected (it's enabled again by now)
    useEffect(() => {
        if (passwordError) {
            passwordRef.current?.focus();
            passwordRef.current?.select();
        }
    }, [passwordError]);

    useEffect(() => {
        if (isBlocked) closeButtonRef.current?.focus();
    }, [isBlocked]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canDelete) return;

        setIsDeleting(true);
        setPasswordError("");
        setError("");
        try {
            await UsersService.deleteMyAccount({ requestBody: { password } });
            onDeleted();
        } catch (err) {
            setIsDeleting(false);
            if (err instanceof ApiError && err.status === 409 && Array.isArray(err.body?.bookings)) {
                setBlockingBookings(err.body.bookings);
            } else if (err instanceof ApiError && err.status === 401) {
                if (err.body?.error === WRONG_PASSWORD) {
                    setPasswordError("Incorrect password");
                } else {
                    onSessionEnded();
                }
            } else {
                setError(GENERIC_ERROR);
            }
        }
    };

    const count = blockingBookings?.length ?? 0;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4" onClick={close}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-account-title"
                className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${
                                isBlocked ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"
                            }`}
                        >
                            {isBlocked ? <AlertCircleIcon size={20} /> : <TrashIcon size={20} />}
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <h2 id="delete-account-title" className="font-heading text-base font-semibold text-text-main">
                                {isBlocked ? "You can't delete your account yet" : "Delete your account?"}
                            </h2>
                            <p className="text-[13px] text-text-muted">
                                {isBlocked ? "Your account hasn't been changed." : "This can't be undone."}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={close}
                        disabled={isDeleting}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                {isBlocked ? (
                    <>
                        <div className="flex flex-col gap-5 overflow-y-auto thin-scrollbar px-6 py-5">
                            <p className="text-sm leading-normal text-text-main">
                                You have {count} {count === 1 ? "booking" : "bookings"} in progress. Finish or cancel{" "}
                                {count === 1 ? "it" : "them"} first, then try again.
                            </p>
                            <ul className="rounded-xl border border-gray-100">
                                {blockingBookings.map((booking) => {
                                    const pill = STATUS_PILL[booking.bookingStatus] ?? {
                                        label: booking.bookingStatus,
                                        className: "bg-gray-100 text-text-muted",
                                    };
                                    return (
                                        <li
                                            key={booking.id}
                                            className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold text-text-main">{booking.service.title}</span>
                                                <span className="text-[13px] text-text-muted">{formatDate(booking.appointmentDate)}</span>
                                            </div>
                                            <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${pill.className}`}>
                                                {pill.label}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                            {isProvider && (
                                <p className="text-[13px] text-text-muted">
                                    Bookings for your own services are under{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/provider/booking-requests")}
                                        className="font-semibold text-primary underline hover:text-primary-hover"
                                    >
                                        Booking requests
                                    </button>
                                    .
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                            <Button ref={closeButtonRef} type="button" variant="secondary" className="h-10" onClick={onClose}>
                                Close
                            </Button>
                            <Button type="button" variant="primary" className="h-10" onClick={() => navigate(MY_BOOKINGS_PATH)}>
                                Go to My bookings
                            </Button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-col">
                        <div className="flex flex-col gap-5 overflow-y-auto thin-scrollbar px-6 py-5">
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">What gets removed</p>
                                <ul className="flex flex-col gap-1.5">
                                    <ListItem>Your name, email, phone, bank account, birth date, social links and photo</ListItem>
                                    <ListItem>Your provider details, and your services come off search</ListItem>
                                    <ListItem>Your notifications, and access: you're signed out for good</ListItem>
                                </ul>
                            </div>
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">What stays</p>
                                <ul className="flex flex-col gap-1.5">
                                    <ListItem kept>Past bookings and reviews, shown as “Deleted User”</ListItem>
                                    <ListItem kept>Messages and reports, kept for everyone's safety</ListItem>
                                </ul>
                            </div>
                            {email && (
                                <p className="text-[13px] text-text-muted">
                                    We'll email a confirmation to <strong className="font-semibold text-text-main">{email}</strong>.
                                </p>
                            )}
                            <PasswordInput
                                ref={passwordRef}
                                label="Enter your password to confirm"
                                name="delete-account-password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError("");
                                }}
                                error={passwordError}
                                disabled={isDeleting}
                            />
                            <label className="flex items-center gap-2.5 text-sm text-text-main">
                                <input
                                    type="checkbox"
                                    checked={understood}
                                    onChange={(e) => setUnderstood(e.target.checked)}
                                    disabled={isDeleting}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed"
                                />
                                I understand this can't be undone
                            </label>
                            {error && (
                                <p className="text-sm text-red-600" role="alert">{error}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                            <Button type="button" variant="secondary" className="h-10" onClick={close} disabled={isDeleting}>
                                Cancel
                            </Button>
                            <button type="submit" className={`h-10 ${DANGER_BUTTON_CLASS}`} disabled={!canDelete}>
                                {isDeleting ? "Deleting…" : "Delete account"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
