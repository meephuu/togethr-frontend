import { Link, useLocation } from "react-router-dom";

// Provider section tabs, rendered as the Navbar's second row. Tabs without a
// `to` have no page yet (booking requests US6-2, availability US4-2).
// Create service counts as Dashboard, as in the design's breadcrumb.
const TABS = [
    { label: "Dashboard", to: "/provider/dashboard", paths: ["/provider/dashboard", "/provider/services/new"] },
    { label: "My services", to: "/provider/services", paths: ["/provider/services"] },
    { label: "Booking requests" },
    { label: "Availability" },
];

const TAB_CLASS = "whitespace-nowrap border-b-2 py-3.5 text-sm";

export default function ProviderTabs() {
    const { pathname } = useLocation();
    const current = pathname.replace(/\/+$/, "");

    return (
        <nav aria-label="Provider sections" className="mx-auto max-w-7xl px-8">
            <div className="thin-scrollbar flex gap-8 overflow-x-auto border-t border-gray-100">
                {TABS.map((tab) => {
                    if (!tab.to) {
                        return (
                            <span
                                key={tab.label}
                                aria-disabled="true"
                                title="Coming soon"
                                className={`${TAB_CLASS} cursor-not-allowed border-transparent font-medium text-gray-400`}
                            >
                                {tab.label}
                            </span>
                        );
                    }

                    const active = tab.paths.includes(current);
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
