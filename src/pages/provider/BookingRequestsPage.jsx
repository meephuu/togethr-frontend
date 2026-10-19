import { useEffect, useState } from "react";
import PageShell from "../../components/ui/PageShell";
import ProviderTabs from "../../components/provider/ProviderTabs";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { AlertCircleIcon, CalendarIcon, ClockIcon, MapPinIcon } from "../../components/ui/Icons";
import { formatBaht } from "../../lib/format";
import { CARD_CLASS } from "../../lib/styles";
import { ApiError, getBookingRequests, updateBookingStatus } from "../../services/sprint2Api";

// Provider's "Booking requests" page (US6-2): every request for their services,
// split into tabs, with Accept / Reject on the ones still waiting.

const WAITING = "WAITING_FOR_CONFIRMATION";

const STATUS_PILL = {
    WAITING_FOR_CONFIRMATION: { label: "Waiting for you", className: "bg-amber-50 text-amber-800" },
    CONFIRMED: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700" },
    REJECTED: { label: "Rejected", className: "bg-gray-100 text-text-muted" },
    EXPIRED: { label: "Expired", className: "bg-gray-100 text-text-muted" },
    CANCELLED: { label: "Cancelled by customer", className: "bg-gray-100 text-text-muted" },
    COMPLETED: { label: "Completed", className: "bg-blue-50 text-blue-700" },
};

const TABS = [
    { id: "waiting", label: "Waiting", statuses: [WAITING] },
    { id: "confirmed", label: "Confirmed", statuses: ["CONFIRMED"] },
    { id: "past", label: "Past", statuses: ["REJECTED", "EXPIRED", "CANCELLED", "COMPLETED"] },
];

const EMPTY_TEXT = {
    waiting: "No requests are waiting for your answer.",
    confirmed: "You haven't confirmed any bookings yet.",
    past: "Rejected, expired, cancelled and completed bookings will show up here.",
};

// A request past its 24-hour deadline can't be accepted any more, even if the
// server hasn't marked it EXPIRED yet (it checks once a minute).
function effectiveStatus(item, now) {
    if (item.bookingStatus === WAITING && item.respondBy && new Date(item.respondBy).getTime() <= now) {
        return "EXPIRED";
    }
    return item.bookingStatus;
}

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

// 5h 20m / 45m
function formatDuration(ms) {
    const minutes = Math.max(1, Math.round(ms / 60000));
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

function timeAgo(iso, now) {
    const ms = now - new Date(iso).getTime();
    if (ms < 60000) return "just now";
    return `${formatDuration(ms)} ago`;
}

function decisionError(err) {
    if (err instanceof ApiError) {
        if (err.status === 409) return err.body?.error || "This request was already answered.";
        if (err.status === 403) return "Only the service's provider can answer this request.";
        if (err.status === 404) return "This request no longer exists.";
        return err.body?.error || "Something went wrong. Please try again.";
    }
    return "Can't reach the server. Check your connection and try again.";
}

// ---------- one request ----------

function RequestCard({ item, now, busy, error, onDecide }) {
    const [confirmingReject, setConfirmingReject] = useState(false);
    const status = effectiveStatus(item, now);
    const pill = STATUS_PILL[status] ?? { label: status, className: "bg-gray-100 text-text-muted" };
    const canDecide = status === WAITING;
    const msLeft = item.respondBy ? new Date(item.respondBy).getTime() - now : null;
    const urgent = canDecide && msLeft !== null && msLeft < 3 * 60 * 60 * 1000;
    const { customer, service } = item;

    return (
        <li className={`${CARD_CLASS} flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between`}>
            <div className="flex min-w-0 flex-1 gap-4">
                <Avatar photoUrl={customer.profilePhotoUrl} firstname={customer.firstname} lastname={customer.lastname} />
                <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-text-main">
                            {customer.firstname} {customer.lastname}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill.className}`}>{pill.label}</span>
                    </div>
                    <p className="text-[15px] text-text-main">{service.title}</p>
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
                    <p className="text-xs text-text-muted">Requested {timeAgo(item.createdAt, now)}</p>
                </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 md:w-64 md:items-end">
                {item.totalPrice != null && (
                    <span className="text-xl font-bold text-text-main">{formatBaht(item.totalPrice)}</span>
                )}

                {canDecide && msLeft !== null && (
                    <p className={`text-sm ${urgent ? "font-semibold text-red-600" : "text-text-muted"}`}>
                        Answer within {formatDuration(msLeft)}
                    </p>
                )}

                {canDecide && !confirmingReject && (
                    <div className="flex w-full gap-2 md:justify-end">
                        <Button
                            variant="secondary"
                            className="flex-1 md:flex-none disabled:opacity-60"
                            disabled={busy}
                            onClick={() => setConfirmingReject(true)}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 md:flex-none disabled:opacity-60"
                            disabled={busy}
                            onClick={() => onDecide(item, "CONFIRMED")}
                        >
                            {busy ? "Saving..." : "Accept"}
                        </Button>
                    </div>
                )}

                {canDecide && confirmingReject && (
                    <div className="flex w-full flex-col gap-2 rounded-lg bg-secondary p-3 md:items-end">
                        <p className="text-sm text-text-main">Reject this request? The customer will be told.</p>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                className="px-4 py-2 text-sm"
                                disabled={busy}
                                onClick={() => setConfirmingReject(false)}
                            >
                                Keep it
                            </Button>
                            <Button
                                variant="primary"
                                className="px-4 py-2 text-sm disabled:opacity-60"
                                disabled={busy}
                                onClick={() => onDecide(item, "REJECTED")}
                            >
                                {busy ? "Saving..." : "Yes, reject"}
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <p role="alert" className="flex items-start gap-2 text-sm text-red-700">
                        <AlertCircleIcon size={16} className="mt-0.5" />
                        {error}
                    </p>
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
                    <div className="h-12 w-12 rounded-full bg-gray-200" />
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
            <p className="font-semibold text-text-main">We couldn't load your booking requests.</p>
            <p className="text-sm text-text-muted">Check your connection and try again.</p>
            <Button onClick={onRetry} className="mt-2">
                Try again
            </Button>
        </section>
    );
}

// ---------- page ----------

export default function BookingRequestsPage() {
    const [result, setResult] = useState({ status: "loading", items: [] }); // loading | error | ready
    const [reloadKey, setReloadKey] = useState(0);
    const [tab, setTab] = useState("waiting");
    const [busyId, setBusyId] = useState(null);
    const [errors, setErrors] = useState({}); // booking id -> message
    const [toast, setToast] = useState(null);
    const [notice, setNotice] = useState(null); // page-level message, e.g. a request that just expired
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        let cancelled = false;
        getBookingRequests()
            .then((items) => {
                if (!cancelled) setResult({ status: "ready", items });
            })
            .catch(() => {
                if (!cancelled) setResult({ status: "error", items: [] });
            });
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    // Keep the "Answer within" countdowns current
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    function reload() {
        setResult({ status: "loading", items: [] });
        setErrors({});
        setReloadKey((key) => key + 1);
    }

    function setItemStatus(id, bookingStatus) {
        setResult((prev) => ({
            ...prev,
            items: prev.items.map((item) => (item.id === id ? { ...item, bookingStatus, respondBy: null } : item)),
        }));
    }

    async function decide(item, status) {
        setBusyId(item.id);
        setNotice(null);
        setErrors((prev) => ({ ...prev, [item.id]: null }));
        try {
            const { booking } = await updateBookingStatus(item.id, status);
            setItemStatus(item.id, booking?.bookingStatus ?? status);
            setToast({
                title: status === "CONFIRMED" ? "Booking confirmed" : "Request rejected",
                text: `${item.customer.firstname} has been notified.`,
            });
        } catch (err) {
            if (err instanceof ApiError && err.status === 409 && /expired/i.test(err.body?.error ?? "")) {
                // The card moves to Past, so say it at the top of the page instead
                setItemStatus(item.id, "EXPIRED");
                setNotice(`${item.customer.firstname}'s request expired before it was answered. It's now under Past.`);
            } else {
                setErrors((prev) => ({ ...prev, [item.id]: decisionError(err) }));
            }
        } finally {
            setBusyId(null);
        }
    }

    const items = result.items.map((item) => ({ ...item, shownStatus: effectiveStatus(item, now) }));
    const countFor = (tabId) => {
        const statuses = TABS.find((t) => t.id === tabId).statuses;
        return items.filter((item) => statuses.includes(item.shownStatus)).length;
    };
    const activeTab = TABS.find((t) => t.id === tab);
    const visible = items.filter((item) => activeTab.statuses.includes(item.shownStatus));
    const waitingCount = countFor("waiting");

    return (
        <PageShell subnav={<ProviderTabs />}>
            <div className="flex flex-col gap-2">
                <h1 className="text-[28px] text-text-main">Booking requests</h1>
                {result.status === "ready" && (
                    <p className="text-text-muted">
                        {waitingCount === 0
                            ? "You're all caught up."
                            : `${waitingCount} ${waitingCount === 1 ? "request is" : "requests are"} waiting for your answer. Requests expire after 24 hours.`}
                    </p>
                )}
            </div>

            {notice && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <AlertCircleIcon size={16} className="mt-0.5" />
                    {notice}
                </p>
            )}

            <div role="tablist" aria-label="Request status" className="flex gap-2">
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
                            {result.status === "ready" && <span className="ml-1.5 opacity-80">{countFor(t.id)}</span>}
                        </button>
                    );
                })}
            </div>

            {result.status === "loading" && <LoadingList />}
            {result.status === "error" && <LoadError onRetry={reload} />}
            {result.status === "ready" && visible.length === 0 && (
                <section className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-text-muted">
                    {EMPTY_TEXT[tab]}
                </section>
            )}
            {result.status === "ready" && visible.length > 0 && (
                <ul className="flex flex-col gap-4">
                    {visible.map((item) => (
                        <RequestCard
                            key={item.id}
                            item={item}
                            now={now}
                            busy={busyId === item.id}
                            error={errors[item.id]}
                            onDecide={decide}
                        />
                    ))}
                </ul>
            )}

            {toast && (
                <Toast title={toast.title} onDismiss={() => setToast(null)}>
                    <p className="text-text-muted">{toast.text}</p>
                </Toast>
            )}
        </PageShell>
    );
}
