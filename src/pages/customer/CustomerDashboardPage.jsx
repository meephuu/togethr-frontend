import { Link } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import CustomerTabs from "../../components/customer/CustomerTabs";
import { useAuth } from "../../hooks/useAuth";
import { DASHBOARD_BY_ROLE, hasRole } from "../../lib/roles";

export default function CustomerDashboardPage() {
    const { user } = useAuth();

    return (
        <PageShell subnav={<CustomerTabs />}>
            <div className="flex flex-col gap-2.5">
                <h1 className="text-[28px] text-text-main">
                    Welcome back{user?.firstname ? `, ${user.firstname}` : ""}
                </h1>
                <p className="text-text-muted">
                    Here is your customer dashboard.
                </p>
            </div>
            
            {/* Future customer specific content (e.g. recent bookings) can go here */}
        </PageShell>
    );
}
