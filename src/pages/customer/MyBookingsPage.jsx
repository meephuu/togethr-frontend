import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import CustomerTabs from "../../components/customer/CustomerTabs";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import ServiceThumbnail from "../../components/services/ServiceThumbnail";
import CancelBookingDialog from "../../components/booking/CancelBookingDialog";
import { AlertCircleIcon, CalendarIcon, ClockIcon, MapPinIcon } from "../../components/ui/Icons";
import { formatBaht } from "../../lib/format";
import { CARD_CLASS } from "../../lib/styles";
import { getMyBookings } from "../../services/sprint2Api";

// Customer's "My bookings" page (US6-4): upcoming and past bookings, and the
// entry point for cancelling a confirmed booking. Marking a trip complete
// (US6-5) belongs on the same cards once its endpoint exists.

const STATUS_PILL = {
    WAITING_FOR_CONFIRMATION: { label: "Waiting for confirmation", className: "bg-amber-50 text-amber-800" },
    CONFIRMED: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700" },
    REJECTED: { label: "Rejected", className: "bg-gray-100 text-text-muted" },
    EXPIRED: { label: "Expired", className: "bg-gray-100 text-text-muted" },
    CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-text-muted" },
    COMPLETED: { label: "Completed", className: "bg-blue-50 text-blue-700" },
};

// A confirmed booking whose time has come but isn't completed yet
const STARTED_PILL = { label: "Started", className: "bg-blue-50 text-blue-700" };

const TABS = [
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
];

const EMPTY_TEXT = {
    upcoming: "You have no upcoming bookings.",
    past: "Finished, cancelled, rejected and expired bookings will show up here.",
};

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

// Moves a booking out of upcoming once cancelled, keeping past newest first
function markCancelled(lists, id) {
    const item = lists.upcoming.find((b) => b.id === id);
    if (!item) return lists;
    const cancelled = { ...item, bookingStatus: "CANCELLED", canCancel: false };
    return {
        upcoming: lists.upcoming.filter((b) => b.id !== id),
        past: [cancelled, ...lists.past].sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
    };
}

// ---------- one booking ----------

function BookingItem({ item, onCancel }) {
    const { service, provider } = item;
    // The server only allows cancelling a confirmed booking before it starts
    const started = item.bookingStatus === "CONFIRMED" && !item.canCancel;
    const pill = started
        ? STARTED_PILL
        : STATUS_PILL[item.bookingStatus] ?? { label: item.bookingStatus, className: "bg-gray-100 text-text-muted" };

    return (
        <li className={`${CARD_CLASS} flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between`}>
            <div className="flex min-w-0 flex-1 gap-4">
                <ServiceThumbnail url={service.coverPhotoUrl} />
                <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/services/${service.id}`} className="font-semibold text-text-main hover:underline">
                            {service.title}
                        </Link>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill.className}`}>{pill.label}</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 text-sm text-text-muted sm:flex-row sm:flex-wrap sm:gap-x-5">
                        <li className="flex items-center gap-1.5">
                            <CalendarIcon size={15} />
                            {formatDate(item.appointmentDate)}
                        </li>
                        <li className="flex items-center gap-1.5">
                            <ClockIcon size={15} />
                            {item.startTime ? `${item.startTime}–${item.endTime}` : "Whole day"}
                        </li>
                        <li className="flex items-center gap-1.5">
                            <MapPinIcon size={15} />
                            {service.location}
                        </li>
                    </ul>
                    <Link to={`/profile/${provider.id}`} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main">
                        <Avatar photoUrl={provider.profilePhotoUrl} firstname={provider.firstname} lastname={provider.lastname} size="sm" />
                        with {provider.firstname} {provider.lastname}
                    </Link>
                </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 md:w-56 md:items-end">
                {item.totalPrice != null && (
                    <span className="text-xl font-bold text-text-main">{formatBaht(item.totalPrice)}</span>
                )}
                {item.bookingStatus === "WAITING_FOR_CONFIRMATION" && (
                    <p className="text-sm text-text-muted md:text-right">The provider has 24 hours to answer.</p>
                )}
                {item.canCancel && (
                    <Button variant="secondary" className="w-full md:w-auto" onClick={() => onCancel(item)}>
                        Cancel booking
                    </Button>
                )}
            </div>
        </li>
    );
}

// ---------- page states ----------

function LoadingList() {
    return (
        <ul className="flex flex-col gap-4" aria-hidden="true">
            {[0, 1, 2].map((row) => (
                <li key={row} className={`${CARD_CLASS} flex animate-pulse gap-4 p-6`}>
                    <div className="h-[60px] w-24 rounded-lg bg-gray-200" />
                    <div className="flex flex-1 flex-col gap-2">
                        <div className="h-4 w-48 rounded bg-gray-200" />
                        <div className="h-4 w-72 rounded bg-gray-100" />
                        <div className="h-3 w-56 rounded bg-gray-100" />
                    </div>
                </li>
            ))}
        </ul>
    );
}

function LoadError({ onRetry }) {
    return (
        <section role="alert" className={`${CARD_CLASS} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
            <AlertCircleIcon size={28} className="text-red-600" />
            <p className="font-semibold text-text-main">We couldn't load your bookings.</p>
            <p className="text-sm text-text-muted">Check your connection and try again.</p>
            <Button onClick={onRetry} className="mt-2">
                Try again
            </Button>
        </section>
    );
}

// ---------- page ----------

export default function MyBookingsPage() {
    const [result, setResult] = useState({ status: "loading", upcoming: [], past: [] }); // loading | error | ready
    const [reloadKey, setReloadKey] = useState(0);
    const [tab, setTab] = useState("upcoming");
    const [cancelling, setCancelling] = useState(null); // the booking whose dialog is open
    const [toast, setToast] = useState(null);
    const [notice, setNotice] = useState(null); // page-level message, e.g. a cancel the server refused

    useEffect(() => {
        let ignore = false;
        getMyBookings()
            .then(({ upcoming, past }) => {
                if (!ignore) setResult({ status: "ready", upcoming, past });
            })
            .catch(() => {
                if (!ignore) setResult({ status: "error", upcoming: [], past: [] });
            });
        return () => {
            ignore = true;
        };
    }, [reloadKey]);

    function reload() {
        setResult({ status: "loading", upcoming: [], past: [] });
        setReloadKey((key) => key + 1);
    }

    function handleCancelled(booking) {
        const item = cancelling;
        setCancelling(null);
        setNotice(null);
        setResult((prev) => ({ ...prev, ...markCancelled(prev, booking?.id ?? item.id) }));
        setToast({
            title: "Booking cancelled",
            text: `${item.provider.firstname} has been told. You'll find it under Past.`,
        });
    }

    // The booking changed on the server (e.g. it just started): show why and reload
    function handleConflict(message) {
        setCancelling(null);
        setNotice(message);
        reload();
    }

    const visible = tab === "upcoming" ? result.upcoming : result.past;
    const nextConfirmed = result.upcoming.find((b) => b.bookingStatus === "CONFIRMED");

    return (
        <PageShell subnav={<CustomerTabs />}>
            <div className="flex flex-col gap-2">
                <h1 className="text-[28px] text-text-main">My bookings</h1>
                {result.status === "ready" && (
                    <p className="text-text-muted">
                        {result.upcoming.length === 0
                            ? "Nothing coming up yet."
                            : nextConfirmed
                              ? `Your next trip is ${nextConfirmed.service.title} on ${formatDate(nextConfirmed.appointmentDate)}.`
                              : "Your requests are waiting for the providers to answer."}{" "}
                        You can cancel a confirmed booking until it starts.
                    </p>
                )}
            </div>

            {notice && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <AlertCircleIcon size={16} className="mt-0.5" />
                    {notice}
                </p>
            )}

            <div role="tablist" aria-label="Booking time" className="flex gap-2">
                {TABS.map((t) => {
                    const active = t.id === tab;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(t.id)}
                            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                                active
                                    ? "border-primary bg-primary text-white"
                                    : "border-gray-200 bg-white text-text-main hover:border-gray-400"
                            }`}
                        >
                            {t.label}
                            {result.status === "ready" && <span className="ml-1.5 opacity-80">{result[t.id].length}</span>}
                        </button>
                    );
                })}
            </div>

            {result.status === "loading" && <LoadingList />}
            {result.status === "error" && <LoadError onRetry={reload} />}
            {result.status === "ready" && visible.length === 0 && (
                <section className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-text-muted">
                    {EMPTY_TEXT[tab]}
                    {tab === "upcoming" && (
                        <Link to="/search" className="font-semibold text-primary underline hover:text-primary-hover">
                            Find a service
                        </Link>
                    )}
                </section>
            )}
            {result.status === "ready" && visible.length > 0 && (
                <ul className="flex flex-col gap-4">
                    {visible.map((item) => (
                        <BookingItem key={item.id} item={item} onCancel={setCancelling} />
                    ))}
                </ul>
            )}

            {cancelling && (
                <CancelBookingDialog
                    booking={cancelling}
                    onClose={() => setCancelling(null)}
                    onCancelled={handleCancelled}
                    onConflict={handleConflict}
                />
            )}

            {toast && (
                <Toast title={toast.title} onDismiss={() => setToast(null)}>
                    <p className="text-text-muted">{toast.text}</p>
                </Toast>
            )}
        </PageShell>
    );
}
