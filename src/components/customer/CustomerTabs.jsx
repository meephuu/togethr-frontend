import { Link, useLocation } from "react-router-dom";

// Customer tabs from the search design, rendered as the Navbar's second row
// (same look as ProviderTabs). Find Service points at the temporary filter
// page until Mee's search page (US5-1) exists; My Booking has no page yet.
const TABS = [
    { label: "Home", to: "/", paths: ["/"] },
    { label: "Find Service", to: "/dev/filters", paths: ["/dev/filters"] },
    { label: "My Booking" },
];

const TAB_CLASS = "whitespace-nowrap border-b-2 py-3.5 text-sm";

export default function CustomerTabs() {
    const { pathname } = useLocation();
    const current = pathname.replace(/(.)\/+$/, "$1");

    return (
        <nav aria-label="Main sections" className="mx-auto max-w-7xl px-8">
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
