import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleRoute from "./RoleRoute";
import LoginPage from "../pages/public/LoginPage";
import ProviderRegistrationPage from "../pages/public/ProviderRegistrationPage/ProviderRegistrationPage";
import HomePage from "../pages/public/HomePage";
import SignUpPage from "../pages/public/SignUpPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import ResetPasswordPage from "../pages/public/ResetPasswordPage";
import PrivacyPolicyPage from "../pages/public/PrivacyPolicyPage";
import PublicProfilePage from "../pages/public/PublicProfilePage";
import AccountDeletedPage from "../pages/public/AccountDeletedPage";
import ProfileEditPage from "../pages/private/ProfileEditPage";
import CookieConsentBanner from "../components/CookieConsentBanner";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import MyBookingsPage from "../pages/customer/MyBookingsPage";
import ProviderDashboardPage from "../pages/provider/ProviderDashboardPage";
import CreateServicePage from "../pages/provider/CreateServicePage";
import MyServicesPage from "../pages/provider/MyServicesPage";
import BookingRequestsPage from "../pages/provider/BookingRequestsPage";
import ServiceDetailPage from "../pages/public/ServiceDetailPage";
import MockScenarioSwitcher from "../components/dev/MockScenarioSwitcher";
import { USE_MOCKS } from "../services/sprint2Api";
import FindServicePage from "../pages/public/FindServicePage";

// ==========================================
// Temp Pages Import
// ==========================================

// Public Pages
const Home = () => <HomePage />;

// ==========================================
// Main Router
// ==========================================

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* public */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<FindServicePage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />
                <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                />
                <Route
                    path="/provider-registration"
                    element={<ProviderRegistrationPage />}
                />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/account-deleted" element={<AccountDeletedPage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />
                <Route path="/profile/:id" element={<PublicProfilePage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />

                {/* customer */}
                <Route element={<RoleRoute allowedRole="CUSTOMER" />}>
                    <Route
                        path="/customer/dashboard"
                        element={<CustomerDashboardPage />}
                    />
                    <Route
                        path="/customer/bookings"
                        element={<MyBookingsPage />}
                    />
                </Route>

                {/* provider */}
                <Route element={<RoleRoute allowedRole="PROVIDER" />}>
                    <Route
                        path="/provider/dashboard"
                        element={<ProviderDashboardPage />}
                    />
                    <Route
                        path="/provider/services"
                        element={<MyServicesPage />}
                    />
                    <Route
                        path="/provider/services/new"
                        element={<CreateServicePage />}
                    />
                    <Route
                        path="/provider/booking-requests"
                        element={<BookingRequestsPage />}
                    />
                </Route>

                <Route path="*" element={<Home />} />
            </Routes>
            <CookieConsentBanner />
            {USE_MOCKS && <MockScenarioSwitcher />}
        </BrowserRouter>
    );
}
