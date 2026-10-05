import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import Button from "../../components/ui/Button";
import ComingSoon from "../../components/ui/ComingSoon";
import { AlertCircleIcon, BriefcaseIcon, PlusIcon } from "../../components/ui/Icons";
import ServiceStatusPill from "../../components/services/ServiceStatusPill";
import ServiceThumbnail from "../../components/services/ServiceThumbnail";
import { getMyServices } from "../../services/sprint2Api";
import { RATE_UNIT_LABEL, formatBaht } from "../../lib/format";
import { CARD_CLASS } from "../../lib/styles";

const COLUMNS = [
    { label: "Service" },
    { label: "Rate", className: "w-40" },
    { label: "Status", className: "w-40" },
    { label: "Bookings this month", className: "w-48" },
    { label: "Actions", className: "w-48 text-right" },
];

const CELL_CLASS = "px-6 py-4 align-middle";

function count(n, singular, plural = `${singular}s`) {
    return `${n} ${n === 1 ? singular : plural}`;
}

function TableHead() {
    return (
        <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-text-muted">
            <tr>
                {COLUMNS.map((column) => (
                    <th key={column.label} scope="col" className={`px-6 py-3.5 font-semibold ${column.className ?? ""}`}>
                        {column.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function ServicesTable({ services }) {
    return (
        <section className={`${CARD_CLASS} overflow-hidden`}>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left">
                    <caption className="sr-only">Your services</caption>
                    <TableHead />
                    <tbody className="divide-y divide-gray-100">
                        {services.map((service) => (
                            <tr key={service.id}>
                                <td className={CELL_CLASS}>
                                    <div className="flex items-center gap-4">
                                        <ServiceThumbnail url={service.coverPhotoUrl} />
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <span className="font-semibold text-text-main">{service.title}</span>
                                            <span className="text-[13px] text-text-muted">{service.location}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={`${CELL_CLASS} whitespace-nowrap text-[15px] text-text-main`}>
                                    {formatBaht(service.rate)}{" "}
                                    <span className="text-text-muted">/ {RATE_UNIT_LABEL[service.rateUnit] ?? service.rateUnit}</span>
                                </td>
                                <td className={CELL_CLASS}>
                                    <ServiceStatusPill status={service.status} />
                                </td>
                                <td className={`${CELL_CLASS} text-[15px] text-text-main`}>
                                    {service.bookingsThisMonth ?? 0}
                                </td>
                                <td className={`${CELL_CLASS} text-right text-sm font-semibold`}>
                                    <div className="flex justify-end gap-5">
                                        <ComingSoon>View</ComingSoon>
                                        <ComingSoon>Availability</ComingSoon>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function LoadingTable() {
    return (
        <section className={`${CARD_CLASS} overflow-hidden`}>
            <p role="status" className="sr-only">
                Loading your services…
            </p>
            <div className="overflow-x-auto" aria-hidden="true">
                <table className="w-full min-w-[880px] text-left">
                    <TableHead />
                    <tbody className="divide-y divide-gray-100">
                        {[0, 1, 2].map((row) => (
                            <tr key={row} className="animate-pulse">
                                <td className={CELL_CLASS}>
                                    <div className="flex items-center gap-4">
                                        <div className="h-[60px] w-24 rounded-lg bg-gray-200" />
                                        <div className="flex flex-col gap-2">
                                            <div className="h-4 w-56 rounded bg-gray-200" />
                                            <div className="h-3 w-36 rounded bg-gray-100" />
                                        </div>
                                    </div>
                                </td>
                                <td className={CELL_CLASS}>
                                    <div className="h-4 w-20 rounded bg-gray-200" />
                                </td>
                                <td className={CELL_CLASS}>
                                    <div className="h-6 w-20 rounded-full bg-gray-200" />
                                </td>
                                <td className={CELL_CLASS}>
                                    <div className="h-4 w-6 rounded bg-gray-200" />
                                </td>
                                <td className={CELL_CLASS}>
                                    <div className="ml-auto h-4 w-28 rounded bg-gray-100" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function LoadError({ onRetry }) {
    return (
        <section role="alert" className={`${CARD_CLASS} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
            <AlertCircleIcon size={28} className="text-red-600" />
            <p className="font-semibold text-text-main">We couldn't load your services.</p>
            <p className="text-sm text-text-muted">Check your connection and try again.</p>
            <Button onClick={onRetry} className="mt-2">
                Try again
            </Button>
        </section>
    );
}

function EmptyState({ onCreate }) {
    return (
        <section className="flex min-h-[460px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
                <BriefcaseIcon size={30} />
            </div>
            <h2 className="text-xl text-text-main">You haven't created a service yet</h2>
            <p className="max-w-[420px] text-[15px] leading-relaxed text-text-muted">
                Create your first service so customers can find you in search and send you booking requests.
            </p>
            <Button onClick={onCreate} leftIcon={<PlusIcon size={18} />} className="mt-2">
                Create your first service
            </Button>
        </section>
    );
}

export default function MyServicesPage() {
    const navigate = useNavigate();
    const [result, setResult] = useState({ status: "loading", services: [] }); // loading | error | ready
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        getMyServices()
            .then((services) => {
                if (!cancelled) setResult({ status: "ready", services });
            })
            .catch(() => {
                if (!cancelled) setResult({ status: "error", services: [] });
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const retry = () => {
        setResult({ status: "loading", services: [] });
        setReloadKey((key) => key + 1);
    };

    const goToCreate = () => navigate("/provider/services/new");

    const { status, services } = result;
    const isEmpty = status === "ready" && services.length === 0;
    const bookingsThisMonth = services.reduce((sum, service) => sum + (service.bookingsThisMonth ?? 0), 0);

    let summary = null;
    if (status === "loading") {
        summary = <span className="block h-5 w-56 animate-pulse rounded bg-gray-200" aria-hidden="true" />;
    } else if (status === "ready") {
        summary = isEmpty
            ? "0 services"
            : `${count(services.length, "service")} · ${count(bookingsThisMonth, "booking")} this month`;
    }

    return (
        <PageShell>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[28px] text-text-main">My services</h1>
                    {summary && <div className="text-text-muted">{summary}</div>}
                </div>
                {/* The empty state has its own button; one call to action is enough. */}
                {(status === "error" || (status === "ready" && !isEmpty)) && (
                    <Button onClick={goToCreate} leftIcon={<PlusIcon size={18} />}>
                        Create service
                    </Button>
                )}
            </div>

            {status === "loading" && <LoadingTable />}
            {status === "error" && <LoadError onRetry={retry} />}
            {isEmpty && <EmptyState onCreate={goToCreate} />}
            {status === "ready" && !isEmpty && (
                <>
                    <ServicesTable services={services} />
                    <p className="text-[13px] text-text-muted">
                        Unpublished services are hidden from search. Customers who open one see “This service is no
                        longer available”.
                    </p>
                </>
            )}
        </PageShell>
    );
}
