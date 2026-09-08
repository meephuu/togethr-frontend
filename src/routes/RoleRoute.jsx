import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { dashboardFor, hasRole } from "../lib/roles";

export default function RoleRoute({ allowedRole }) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(user, allowedRole)) {
        // Send them somewhere they can actually use rather than a dead end
        return <Navigate to={dashboardFor(user)} replace />;
    }

    return <Outlet />;
}
