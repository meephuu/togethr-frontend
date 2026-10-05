import { Link } from "react-router-dom";
import Navbar from "./ui/Navbar";
import { useAuth } from "../hooks/useAuth";
import { DASHBOARD_BY_ROLE, hasRole } from "../lib/roles";

const LABEL = { CUSTOMER: "Customer", PROVIDER: "Provider" };

export default function RoleDashboard({ role }) {
    const { user } = useAuth();
    const otherRole = role === "CUSTOMER" ? "PROVIDER" : "CUSTOMER";

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">
                        You are logged in as a {LABEL[role]}
                    </h1>

                    <p className="mt-4 text-lg text-text-muted">
                        Welcome back, {user?.firstname} {user?.lastname}
                        {user?.username && (
                            <span className="text-text-muted"> (@{user.username})</span>
                        )}
                    </p>

                    {hasRole(user, otherRole) ? (
                        <Link
                            to={DASHBOARD_BY_ROLE[otherRole]}
                            className="mt-6 inline-block text-primary underline hover:text-primary-hover"
                        >
                            Switch to your {LABEL[otherRole]} dashboard
                        </Link>
                    ) : (
                        role === "CUSTOMER" && (
                            <Link
                                to="/provider-registration"
                                className="mt-6 inline-block text-primary underline hover:text-primary-hover"
                            >
                                Also become a Provider
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
