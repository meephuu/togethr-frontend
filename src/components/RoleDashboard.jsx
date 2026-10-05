import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./ui/Navbar";
import Toast from "./ui/Toast";
import { useAuth } from "../hooks/useAuth";
import { DASHBOARD_BY_ROLE, hasRole } from "../lib/roles";

const LABEL = { CUSTOMER: "Customer", PROVIDER: "Provider" };

export default function RoleDashboard({ role }) {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const otherRole = role === "CUSTOMER" ? "PROVIDER" : "CUSTOMER";

    // Set by CreateServicePage after publishing. Copied into state so the
    // history entry can be cleared below and a reload doesn't show it again.
    const [publishedService, setPublishedService] = useState(
        () => location.state?.publishedService ?? null,
    );

    useEffect(() => {
        if (location.state?.publishedService) {
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location.pathname, location.state, navigate]);

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar />
            {publishedService && (
                <Toast title="Service published" onDismiss={() => setPublishedService(null)}>
                    <p className="text-text-muted">“{publishedService.title}” is now live in search.</p>
                    {/* Availability is US4-2; link it once that page exists. */}
                    <p className="mt-1.5 font-semibold text-text-muted" title="Coming soon">
                        Set your availability <span className="font-normal">(coming soon)</span>
                    </p>
                </Toast>
            )}
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

                    {role === "PROVIDER" && (
                        <div className="mt-6 flex justify-center gap-6">
                            <Link
                                to="/provider/services/new"
                                className="text-primary underline hover:text-primary-hover"
                            >
                                Create a service
                            </Link>
                        </div>
                    )}

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
