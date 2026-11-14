import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { DASHBOARD_BY_ROLE, hasRole } from "../../lib/roles";

const TAB_CLASS = "whitespace-nowrap border-b-2 py-3.5 text-sm";

export default function ProviderTabs() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const current = pathname.replace(/\/+$/, "");

    const tabs = [
        { label: "Dashboard", to: "/provider/dashboard", paths: ["/provider/dashboard", "/provider/services/new"] },
        { label: "My services", to: "/provider/services", paths: ["/provider/services"] },
        { label: "Booking requests", to: "/provider/booking-requests", paths: ["/provider/booking-requests"] },
    ];

    if (hasRole(user, "CUSTOMER")) {
        tabs.push({
            label: "Switch to Customer Dashboard",
            to: DASHBOARD_BY_ROLE.CUSTOMER,
            paths: []
        });
    }

    return (
        <nav aria-label="Provider sections" className="mx-auto max-w-7xl px-8">
            <div className="thin-scrollbar flex gap-8 overflow-x-auto border-t border-gray-100">
                {tabs.map((tab) => {
                    // /provider/services/:id/edit belongs to My services
                    const active =
                        tab.paths.includes(current) ||
                        (tab.to === "/provider/services" && /^\/provider\/services\/[^/]+\/edit$/.test(current));
                    return (
                        <Link
                            key={tab.label}
                            to={tab.to}
                            aria-current={active ? "page" : undefined}
                            className={`${TAB_CLASS} ${
                                active
                                    ? "border-primary font-semibold text-primary"
                                    : "border-transparent font-medium text-text-muted hover:text-text-main"
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
