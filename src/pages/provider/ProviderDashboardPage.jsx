import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import ComingSoon from "../../components/ui/ComingSoon";
import { CalendarIcon, PlusIcon } from "../../components/ui/Icons";
import ServiceStatusPill from "../../components/services/ServiceStatusPill";
import ServiceThumbnail from "../../components/services/ServiceThumbnail";
import { useAuth } from "../../hooks/useAuth";
import { APPROVED_PROVIDER_STATUS, getMyProviderStatus, getMyServices } from "../../services/sprint2Api";
import { DASHBOARD_BY_ROLE, hasRole } from "../../lib/roles";
import { RATE_UNIT_LABEL, formatBaht } from "../../lib/format";
import { CARD_CLASS } from "../../lib/styles";

// Rows shown in "Your services"; the rest are one click away in My services.
const SERVICES_PREVIEW_LIMIT = 3;

const LINK_CLASS = "text-sm font-semibold text-primary hover:text-primary-hover hover:underline";

function count(n, singular, plural = `${singular}s`) {
    return `${n} ${n === 1 ? singular : plural}`;
}

function ApprovalBadge({ status }) {
    // No badge while loading, on error, or when the backend sends no status.
    if (!status) return null;

    const approved = status === APPROVED_PROVIDER_STATUS;
    return (
        <span
            className={`self-start rounded-full border px-3 py-1 text-xs font-semibold ${
                approved
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
        >
            {approved ? "Approved provider" : "Pending approval"}
        </span>
    );
}

function StatCard({ label, value, note }) {
    return (
        <div className={`${CARD_CLASS} flex flex-col gap-2 p-6`}>
            <span className="text-sm text-text-muted">{label}</span>
            {value === null ? (
                <span className="my-1.5 block h-8 w-12 animate-pulse rounded bg-gray-200" aria-hidden="true" />
            ) : (
                <span className="font-heading text-[32px] font-semibold leading-tight text-primary">{value}</span>
            )}
            {note && <span className="text-xs text-text-muted">{note}</span>}
        </div>
    );
}

function CardHeader({ title, action }) {
    return (
        <div className="mb-2 flex items-center justify-between gap-4">
            <h2 className="text-lg text-text-main">{title}</h2>
            {action}
        </div>
    );
}

function YourServices({ result, justPublishedId, onRetry }) {
    const { status, services } = result;

    let body;
    if (status === "loading") {
        body = (
            <>
                <p role="status" className="sr-only">
                    Loading your services…
                </p>
                {[0, 1, 2].map((row) => (
                    <div
                        key={row}
                        aria-hidden="true"
                        className="flex animate-pulse items-center gap-4 border-t border-gray-100 py-3"
                    >
                        <div className="h-[60px] w-24 rounded-lg bg-gray-200" />
                        <div className="flex flex-1 flex-col gap-2">
                            <div className="h-4 w-48 rounded bg-gray-200" />
                            <div className="h-3 w-40 rounded bg-gray-100" />
                        </div>
                    </div>
                ))}
            </>
        );
    } else if (status === "error") {
        body = (
            <div role="alert" className="flex flex-col items-start gap-2 border-t border-gray-100 py-4">
                <p className="text-sm text-text-main">We couldn't load your services.</p>
                <button type="button" onClick={onRetry} className={LINK_CLASS}>
                    Try again
                </button>
            </div>
        );
    } else if (services.length === 0) {
        body = (
            <div className="flex flex-col items-start gap-2 border-t border-gray-100 py-4">
                <p className="text-sm text-text-muted">You haven't created a service yet.</p>
                <Link to="/provider/services/new" className={LINK_CLASS}>
                    Create your first service
                </Link>
            </div>
        );
    } else {
        body = (
            <ul>
                {services.slice(0, SERVICES_PREVIEW_LIMIT).map((service) => (
                    <li key={service.id} className="flex items-center gap-4 border-t border-gray-100 py-3">
                        <ServiceThumbnail url={service.coverPhotoUrl} />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="font-semibold text-text-main">{service.title}</span>
                            <span className="text-sm text-text-muted">
                                {formatBaht(service.rate)} / {RATE_UNIT_LABEL[service.rateUnit] ?? service.rateUnit} ·{" "}
                                {service.id === justPublishedId
                                    ? "Just published"
                                    : `${count(service.bookingsThisMonth ?? 0, "booking")} this month`}
                            </span>
                        </div>
                        <ServiceStatusPill status={service.status} />
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <section className={`${CARD_CLASS} flex min-w-0 flex-1 flex-col p-6`}>
            <CardHeader
                title="Your services"
                action={
                    <Link to="/provider/services" className={LINK_CLASS}>
                        View all
                    </Link>
                }
            />
            {body}
        </section>
    );
}

export default function ProviderDashboardPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Set by CreateServicePage after publishing. Copied into state so the
    // history entry can be cleared below and a reload doesn't show the toast again.
    const [publishedService, setPublishedService] = useState(() => location.state?.publishedService ?? null);
    const [justPublishedId] = useState(() => location.state?.publishedService?.id ?? null);

    const [providerStatus, setProviderStatus] = useState(null);
    const [servicesResult, setServicesResult] = useState({ status: "loading", services: [] }); // loading | error | ready
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (location.state?.publishedService) {
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        let cancelled = false;
        getMyProviderStatus()
            .then((status) => {
                if (!cancelled) setProviderStatus(status);
            })
            .catch(() => {
                // The badge is optional; leave it out rather than show an error.
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        getMyServices()
            .then((services) => {
                if (!cancelled) setServicesResult({ status: "ready", services });
            })
            .catch(() => {
                if (!cancelled) setServicesResult({ status: "error", services: [] });
            });
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const retryServices = () => {
        setServicesResult({ status: "loading", services: [] });
        setReloadKey((key) => key + 1);
    };

    const { status: servicesStatus, services } = servicesResult;
    const statValue = (compute) => {
        if (servicesStatus === "loading") return null;
        if (servicesStatus === "error") return "—";
        return compute();
    };

    return (
        <PageShell>
            {publishedService && (
                <Toast title="Service published" onDismiss={() => setPublishedService(null)}>
                    <p className="text-text-muted">“{publishedService.title}” is now live in search.</p>
                    {/* Availability is US4-2; link it once that page exists. */}
                    <p className="mt-1.5 font-semibold text-text-muted" title="Coming soon">
                        Set your availability <span className="font-normal">(coming soon)</span>
                    </p>
                </Toast>
            )}

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2.5">
                    <ApprovalBadge status={providerStatus} />
                    <h1 className="text-[28px] text-text-main">
                        Welcome back{user?.firstname ? `, ${user.firstname}` : ""}
                    </h1>
                    <p className="text-text-muted">
                        Here's what's happening with your services.
                        {hasRole(user, "CUSTOMER") && (
                            <>
                                {" "}
                                <Link
                                    to={DASHBOARD_BY_ROLE.CUSTOMER}
                                    className="text-primary underline hover:text-primary-hover"
                                >
                                    Switch to your Customer dashboard
                                </Link>
                            </>
                        )}
                    </p>
                </div>
                <Button onClick={() => navigate("/provider/services/new")} leftIcon={<PlusIcon size={18} />}>
                    Create service
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <StatCard
                    label="Published services"
                    value={statValue(() => services.filter((service) => service.status === "PUBLISHED").length)}
                />
                <StatCard
                    label="Bookings this month"
                    value={statValue(() =>
                        services.reduce((sum, service) => sum + (service.bookingsThisMonth ?? 0), 0),
                    )}
                />
                <StatCard label="Requests waiting for you" value="—" note="Coming soon" />
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <YourServices result={servicesResult} justPublishedId={justPublishedId} onRetry={retryServices} />

                <aside className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
                    {/* Booking requests are US6-2; no endpoint is agreed yet. */}
                    <section className={`${CARD_CLASS} flex flex-col p-6`}>
                        <CardHeader title="Booking requests" action={<ComingSoon className="text-sm font-semibold">See all</ComingSoon>} />
                        <p className="border-t border-gray-100 pt-3 text-sm text-text-muted">
                            Booking requests from customers will appear here. Coming soon.
                        </p>
                    </section>
                    <section className={`${CARD_CLASS} flex items-start gap-4 p-6`}>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-secondary text-primary">
                            <CalendarIcon size={20} />
                        </span>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[15px] font-semibold text-text-main">Open dates for your services</span>
                            <span className="text-sm leading-relaxed text-text-muted">
                                Customers can only book the slots you make available.
                            </span>
                            <ComingSoon className="text-sm font-semibold">Go to Availability (coming soon)</ComingSoon>
                        </div>
                    </section>
                </aside>
            </div>
        </PageShell>
    );
}
