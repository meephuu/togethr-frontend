import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const DASHBOARD_BY_ROLE = {
    CUSTOMER: "/customer/dashboard",
    PROVIDER: "/provider/dashboard",
};

export default function RoleRoute({ allowedRole }) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== allowedRole) {
        // Send them to their own dashboard instead of a dead end. Sessions
        // stored before roles existed have no role — fall back to home so
        // this can't bounce between two dashboards.
        return <Navigate to={DASHBOARD_BY_ROLE[user.role] ?? "/"} replace />;
    }

    return <Outlet />;
}
