import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleRoute from "./RoleRoute";
import LoginPage from "../pages/public/LoginPage";
import ProviderRegistrationPage from "../pages/public/ProviderRegistrationPage/ProviderRegistrationPage";
import HomePage from "../pages/public/HomePage";
import SignUpPage from "../pages/public/SignUpPage";

// ==========================================
// Temp Pages Import
// ==========================================

// Public Pages
const Home = () => (
    <HomePage />
);

// Customer Pages
const CustomerBookings = () => (
    <div className="p-10 text-2xl font-bold text-green-500">
        📅 My Bookings (Customer)
    </div>
);

// Provider Pages
const ProviderDashboard = () => (
    <div className="p-10 text-2xl font-bold text-purple-500">
        📊 Dashboard (Provider)
    </div>
);

// ==========================================
// Main Router
// ==========================================

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* public */}
                <Route path="/" element={<Home />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/provider-registration" element={<ProviderRegistrationPage />} />

                {/* customer */}
                <Route element={<RoleRoute allowedRole="customer" />}>
                    <Route
                        path="/customer/bookings"
                        element={<CustomerBookings />}
                    />
                </Route>

                {/* provider */}
                <Route element={<RoleRoute allowedRole="provider" />}>
                    <Route
                        path="/provider/dashboard"
                        element={<ProviderDashboard />}
                    />
                </Route>

                <Route path="*" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}