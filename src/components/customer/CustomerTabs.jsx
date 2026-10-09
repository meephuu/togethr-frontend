import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { DASHBOARD_BY_ROLE, hasRole } from "../../lib/roles";

const TAB_CLASS = "whitespace-nowrap border-b-2 py-3.5 text-sm";

export default function CustomerTabs() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const current = pathname.replace(/(.)\/+$/, "$1");

    const tabs = [
        { label: "Home", to: "/customer/dashboard", paths: ["/customer/dashboard"] },
        { label: "Find Service" },
        { label: "My Booking" },
        {
            label: hasRole(user, "PROVIDER") ? "Switch to Provider Dashboard" : "Become a Provider",
            to: hasRole(user, "PROVIDER") ? DASHBOARD_BY_ROLE.PROVIDER : "/provider-registration",
            paths: [],
        }
    ];

    return (
        <nav aria-label="Main sections" className="mx-auto max-w-7xl px-8">
            <div className="thin-scrollbar flex gap-8 overflow-x-auto border-t border-gray-100">
                {tabs.map((tab) => {
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
